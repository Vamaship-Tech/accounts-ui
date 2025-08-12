import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  KYCData,
  ForgotPasswordData,
  ResetPasswordData,
  ApiError 
} from '@/types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

class AuthService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies in requests
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`
        }))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error occurred')
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    })
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me')
  }

  async submitKYC(kycData: KYCData): Promise<User> {
    const formData = new FormData()
    
    // Add basic KYC data
    formData.append('documentType', kycData.documentType)
    formData.append('documentNumber', kycData.documentNumber)
    formData.append('dateOfBirth', kycData.dateOfBirth)
    formData.append('address', JSON.stringify(kycData.address))
    
    // Add files if they exist
    if (kycData.documentImage) {
      formData.append('documentImage', kycData.documentImage)
    }
    if (kycData.selfieImage) {
      formData.append('selfieImage', kycData.selfieImage)
    }

    return this.request<User>('/auth/kyc', {
      method: 'POST',
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
      },
      body: formData,
    })
  }

  async skipKYC(): Promise<User> {
    return this.request<User>('/auth/kyc/skip', {
      method: 'POST',
    })
  }

  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    return this.request<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    return this.request<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async refreshToken(): Promise<{ token: string }> {
    return this.request<{ token: string }>('/auth/refresh', {
      method: 'POST',
    })
  }
}

export const authService = new AuthService() 