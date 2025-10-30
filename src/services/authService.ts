import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  LoginResponse,
  AuthResponse, 
  KYCData,
  ForgotPasswordData,
  ResetPasswordData,
  ApiError,
  SocialAuthResponse,
  SocialAuthRequest,
  MultiEntityLoginResponse 
} from '@/types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

class AuthService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    // Get token from cookie
    const token = this.getCookie('auth_token')
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      // credentials: 'include', // Include cookies in requests
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        // Try to parse error body for backend-provided message and attach it
        let message = `HTTP error! status: ${response.status}`
        let parsed: any = null
        try {
          parsed = await response.json()
          if (parsed?.message) {
            message = parsed.message
          } else if (parsed?.errors && typeof parsed.errors === 'object') {
            const firstKey = Object.keys(parsed.errors)[0]
            const firstMsg = Array.isArray(parsed.errors[firstKey]) ? parsed.errors[firstKey][0] : parsed.errors[firstKey]
            message = firstMsg || message
          }
        } catch {
          try {
            const text = await response.text()
            if (text) message = text
          } catch {}
        }
        const error = new Error(message) as Error & { status?: number; data?: any }
        error.status = response.status
        error.data = parsed
        throw error
      }

      // Handle no-content responses
      if (response.status === 204) {
        return undefined as unknown as T
      }

      // If no body or not JSON, try safe parse
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        return await response.json()
      }
      // Non-JSON successful response
      const text = await response.text()
      return (text as unknown) as T
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error occurred')
    }
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse | MultiEntityLoginResponse> {
    try {
      return await this.request<LoginResponse>('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
    } catch (err: any) {
      // If backend signals multi-entity with 301/302 (or 4xx) and returns JSON body
      const data = err?.data
      if (data && data.token && data.entities) {
        return data as MultiEntityLoginResponse
      }
      throw err
    }
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
    const response = await this.request<any>('/me')
    
    // Transform backend response to match frontend User interface
    return this.transformUserResponse(response.user)
  }

  private transformUserResponse(backendUser: any): User {
    // Determine onboarding status based on available data
    let onboardingStatus: 'mobile_verified' | 'details_completed' | 'kyc_completed' = 'mobile_verified'
    
    // If user has entity data, they've completed details
    if (backendUser.entity && backendUser.entity.id) {
      onboardingStatus = 'details_completed'
      
      // If KYC is verified, they've completed KYC
      if (backendUser.entity.kyc_verified === 1) {
        onboardingStatus = 'kyc_completed'
      }
    }
    
    // Determine KYC status
    let kycStatus: 'pending' | 'completed' | 'skipped' = 'pending'
    if (backendUser.entity) {
      if (backendUser.entity.kyc_verified === 1) {
        kycStatus = 'completed'
      } else if (backendUser.entity.kyc_status === 0) {
        kycStatus = 'pending'
      }
    }
    
    return {
      id: backendUser.id.toString(),
      email: backendUser.email,
      firstName: backendUser.first_name || '',
      lastName: backendUser.last_name || '',
      mobile: backendUser.mobile_no || '',
      brandName: backendUser.signup_brand || '',
      role: backendUser.is_admin ? 'admin' : 'user',
      isActive: backendUser.is_active === 1,
      kycStatus,
      onboardingStatus,
      createdAt: backendUser.created_at || new Date().toISOString(),
      updatedAt: backendUser.updated_at || new Date().toISOString(),
      kycProgress: {
        businessType: backendUser.entity?.gst_registered === 1 ? 'gst' : 'pan',
        businessData: backendUser.entity ? {
          entityType: backendUser.entity.entity_type || '',
          entityName: backendUser.entity.entity_name || '',
          panNumber: backendUser.entity.pan_card || '',
          panPincode: '',
          billingAddress: '',
          verified: backendUser.entity.kyc_verified === 1
        } : undefined,
        bankData: backendUser.banks && backendUser.banks.length > 0 ? {
          beneficiaryName: backendUser.banks[0].beneficiary_name || '',
          bankName: backendUser.banks[0].bank_name || '',
          accountNumber: backendUser.banks[0].account_number || '',
          ifscCode: backendUser.banks[0].ifsc_code || '',
          verified: true
        } : undefined,
        lastUpdated: new Date().toISOString()
      }
    }
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
    return this.request<void>('/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    return this.request<void>('/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: data.token,
        password: data.newPassword,
        password_confirmation: data.confirmPassword,
      }),
    })
  }

  // Send Google profile payload to backend social auth
  async socialAuth(payload: SocialAuthRequest): Promise<SocialAuthResponse> {
    return this.request<SocialAuthResponse>('/social-auth', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async refreshToken(): Promise<{ token: string }> {
    return this.request<{ token: string }>('/refresh', {
      method: 'POST',
    })
  }

  async loginToEntity(payload: { token: string; entity_id: string | number }): Promise<{ token: string }> {
    return this.request<{ token: string }>('/login-to-entity', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }
}

export const authService = new AuthService() 