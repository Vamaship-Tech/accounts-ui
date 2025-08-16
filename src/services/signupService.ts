import type { 
  MobileVerificationRequest, 
  OTPVerificationRequest,
  MobileCheckResponse,
  EmailCheckResponse
} from '@/types/signup'
import type { RegisterData, AuthResponse } from '@/types/auth'

const API_BASE = import.meta.env.VITE_API_BASE_URL

class SignupService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getCookie('auth_token')
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    const raw = await response.text().catch(() => '')

    if (!response.ok) {
      let message = `Request failed: ${response.status}`
      if (raw) {
        try {
          message = JSON.parse(raw).message || message } catch { message = raw }
      }
      console.log(message)
      throw new Error('Request failed')
    }

    if (!raw || response.status === 204 || response.status === 205) {
      return undefined as unknown as T
    }

    try {
      return JSON.parse(raw) as T
    } catch {
      return raw as unknown as T
    }
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
  }

  // Step 1: Mobile verification
  async checkMobileExists(data: MobileVerificationRequest): Promise<MobileCheckResponse> {
    return this.request<MobileCheckResponse>('/signup/check-mobile', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async sendMobileOtp(data: MobileVerificationRequest): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/signup/send-mobile-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async verifyMobileOtp(data: OTPVerificationRequest): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/signup/verify-mobile-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Step 2: User creation
  async checkEmailExists(email: string): Promise<EmailCheckResponse> {
    return this.request<EmailCheckResponse>('/signup/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async createUser(userData: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/signup/create-user', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  // Step 3: KYC
  async sendAadhaarOtp(aadhaarNumber: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/kyc/send-aadhaar-otp', {
      method: 'POST',
      body: JSON.stringify({ aadhaarNumber }),
    })
  }

  async verifyAadhaar(aadhaarNumber: string, otp: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/kyc/verify-aadhaar', {
      method: 'POST',
      body: JSON.stringify({ aadhaarNumber, otp }),
    })
  }

  async verifyPan(panNumber: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/kyc/verify-pan', {
      method: 'POST',
      body: JSON.stringify({ 'pan': panNumber }),
    })
  }

  async verifyGst(gstNumber: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/kyc/verify-gst', {
      method: 'POST',
      body: JSON.stringify({ gstNumber }),
    })
  }

  async verifyBank(bankData: {
    accountNumber: string
    ifscCode: string
    beneficiaryName: string
  }): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/kyc/verify-bank', {
      method: 'POST',
      body: JSON.stringify({
        'account_number': bankData.accountNumber,
        'ifsc_code': bankData.ifscCode,
      }),
    })
  }

  async saveKycProgress(section: string, data: any): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/kyc/save-progress', {
      method: 'POST',
      body: JSON.stringify({ section, data }),
    })
  }

  async skipKyc(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/kyc/skip', {
      method: 'POST',
    })
  }

  async completeKyc(kycData: any): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/kyc/complete', {
      method: 'POST',
      body: JSON.stringify(kycData),
    })
  }
}

export const signupService = new SignupService() 