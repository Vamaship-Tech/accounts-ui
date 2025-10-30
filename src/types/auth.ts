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
  password?: string
  firstName: string
  lastName: string
  mobile: string
  brandName: string
  shipment_volume_per_weight?: string
}

export interface LoginResponse {
  token: string
  result: string
}

export interface EntitySummary {
  id: string | number
  entity_name: string
  logo?: string | null
}

export interface MultiEntityLoginResponse {
  token: string
  entities: EntitySummary[]
  result: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Response returned by social auth endpoint which only returns token
export interface SocialAuthResponse {
  token: string
}

export interface SocialAuthRequest {
  first_name: string | null
  last_name: string | null
  email: string
  password: string | null
  mobile_no: string | null
  reference?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_source?: string | null
  logged_in_using: 'google'
  calling_code: string | null
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