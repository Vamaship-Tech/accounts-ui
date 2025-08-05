// API Configuration
export const API_CONFIG = {
  // Base URL for the accounts2.0 API - use proxy in development to avoid CORS
  BASE_URL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api/v1' : 'http://localhost:8001/api/v1'),
  
  // Base URL for tracking API (ecom3-api customer endpoints)
  TRACKING_BASE_URL: import.meta.env.VITE_TRACKING_API_BASE_URL || 'http://localhost:8001/ecom/api/v1',
  
  // Timeout for API requests (in milliseconds)
  TIMEOUT: 30000,
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/login',
    GOOGLE_LOGIN: '/google-login',
    REGISTER: '/register',
    COMPLETE_SIGNUP: '/complete-signup',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    
    // OTP Verification
    SEND_MOBILE_OTP: '/send-verification/mobile/public',
    VERIFY_MOBILE_OTP: '/verify/mobile/public',
    SEND_AADHAAR_OTP: '/send-verification/aadhaar/public',
    VERIFY_AADHAAR_OTP: '/verify/aadhaar/public',
    SEND_EMAIL_OTP: '/send-verification/email',
    VERIFY_EMAIL_OTP: '/verify/email',
    
    // User Management
    USER_PROFILE: '/user/profile',
    UPDATE_PASSWORD: '/user/update-password',
    
    // KYC
    KYC_STATUS: '/kyc/check-completion-status',
    KYC_GST_REGISTERED: '/kyc/gst-registered',
    KYC_GST_UNREGISTERED: '/kyc/gst-unregistered',
    KYC_SKIP: '/kyc/skip',
    
    // Public KYC endpoints for verify-kyc flow
    KYC_GST_REGISTERED_PUBLIC: '/public/kyc/gst-registered',
    KYC_GST_UNREGISTERED_PUBLIC: '/public/kyc/gst-unregistered',
    
    // Validation
    VALIDATE_GST: '/validate-gst',
    VALIDATE_PAN: '/validate-pan',
    VALIDATE_BANK: '/validate-bank',
    
    // Master Data
    COUNTRY_CODES: '/country-master',
    BANKS_LIST: '/public/banks-list',
    ENTITY_TYPES: '/public/entity-types',
    PINCODE_DETAILS: '/pincodes',
    
    // Public Verification endpoints for signup flow
    VALIDATE_GST_PUBLIC: '/public/validate-gst',
    VALIDATE_PAN_PUBLIC: '/public/validate-pan',
    VALIDATE_BANK_PUBLIC: '/public/validate-bank',
    
    // Email validation
    CHECK_EMAIL_EXISTS: '/public/check-email-exists',
    
    // Tracking endpoints
    TRACK_AWB: '/trackawb',
    TRACK_SHIPMENT: '/track',
    TRACK_REFERENCE: '/track/withReferenceNumbers',
  },
  
  // Error Messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error occurred. Please check your connection.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    UNAUTHORIZED: 'Unauthorized access. Please login again.',
    VALIDATION_ERROR: 'Please check your input and try again.',
  },
}

// Environment-specific configurations
export const ENV_CONFIG = {
  development: {
    API_BASE_URL: '/api/v1', // Use proxy URL to avoid CORS
    DEBUG: true,
  },
  production: {
    API_BASE_URL: 'https://api.vamaship.com/api/v1',
    DEBUG: false,
  },
}

// Get current environment configuration
export const getCurrentEnvConfig = () => {
  const env = import.meta.env.MODE || 'development'
  return ENV_CONFIG[env as keyof typeof ENV_CONFIG] || ENV_CONFIG.development
} 