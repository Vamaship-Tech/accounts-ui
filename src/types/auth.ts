export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  mobile: string
  brandName: string
  role: 'user' | 'admin'
  isActive: boolean
  kycStatus: 'pending' | 'completed' | 'skipped'
  onboardingStatus: 'mobile_verified' | 'details_completed' | 'kyc_completed'
  kycProgress?: KYCProgress
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  mobile: string
  brandName: string
}

export interface LoginResponse {
  token: string
  result: User
}

export interface AuthResponse {
  user: User
  token: string
}

// Updated KYC interfaces for new flow
export interface AadhaarData {
  aadhaarNumber: string
  verified: boolean
  verificationDate?: string
}

export interface PanData {
  entityType: string
  entityName: string
  panNumber: string
  panPincode: string
  billingAddress: string
  verified: boolean
}

export interface GstData {
  gstNumber: string
  branchName: string
  gstAddress: string
  gstPincode: string
  verified: boolean
}

export interface BankData {
  beneficiaryName: string
  bankName: string
  accountNumber: string
  ifscCode: string
  verified: boolean
}

export interface KYCProgress {
  aadhaarData?: AadhaarData
  businessData?: PanData | GstData
  bankData?: BankData
  businessType?: 'pan' | 'gst'
  lastUpdated: string
}

export interface KYCData {
  documentType: 'passport' | 'national_id' | 'drivers_license'
  documentNumber: string
  documentImage: File | null
  selfieImage: File | null
  dateOfBirth: string
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface ApiError {
  message: string
  code?: string
  details?: any
} 