export interface MobileSession {
  phone: string
  countryCode: string
  verified: boolean
  sessionExpiry: Date
  otpSent: boolean
}

export interface UserDetails {
  fullName: string
  email: string
  brandName: string
  password: string
  confirmPassword: string
  mobile?: string // For Google sign-in users
  countryCode?: string
}

export interface SignupState {
  mobileSession: MobileSession | null
  userDetails: UserDetails | null
  currentStep: 1 | 2 | 3
  sessionExpiry: Date | null
}

export interface MobileVerificationRequest {
  phone: string
  countryCode: string
  utm_medium?: string | null
  utm_source?: string | null
  utm_campaign?: string | null
}

export interface OTPVerificationRequest {
  phone: string
  countryCode: string
  otp: string
}

export interface MobileCheckResponse {
  exists: boolean
  user?: {
    id: string
    email: string
  }
}

export interface EmailCheckResponse {
  exists: boolean
  user?: {
    id: string
    mobile: string
  }
}

export interface SignupFormData {
  // Step 1
  phone: string
  countryCode: string
  otp: string[]
  
  // Step 2
  fullName: string
  email: string
  brandName: string
  password: string
  shipmentVolumePerMonth?: string
  confirmPassword: string
  
  // Step 3 - KYC
  aadhaarNumber: string
  aadhaarOtp: string[]
  businessType: 'pan' | 'gst'
  
  // PAN fields
  entityType: string
  entityName: string
  panNumber: string
  panPincode: string
  billingAddress: string
  
  // GST fields
  gstNumber: string
  gstPanNumber: string
  branchName: string
  gstAddress: string
  gstPincode: string
  unitType: string
  
  // Bank fields
  beneficiaryName: string
  bankName: string
  accountNumber: string
  ifscCode: string
}

export interface SignupErrors {
  phone?: string
  otp?: string
  fullName?: string
  email?: string
  brandName?: string
  password?: string
  shipmentVolumePerMonth?: string
  confirmPassword?: string
  aadhaarNumber?: string
  aadhaarOtp?: string
  entityType?: string
  entityName?: string
  panNumber?: string
  panPincode?: string
  billingAddress?: string
  gstNumber?: string
  gstPanNumber?: string
  branchName?: string
  gstAddress?: string
  gstPincode?: string
  unitType?: string
  beneficiaryName?: string
  bankName?: string
  accountNumber?: string
  ifscCode?: string
  general?: string
} 