<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiService, { type SignUpData, type KYCData } from './services/api'
import { trackingAPI } from './services/api'
import { authService } from './services/auth'

// TypeScript declarations for Google API
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement, options: any) => void
          prompt: () => void
        }
      }
    }
  }
}

const router = useRouter()

// Form data
const formData = reactive<SignUpData & KYCData>({
  // Step 1: Account Type & Phone Verification
  accountType: 'seller',
  countryCode: '+91',
  phone: '',
  otp: ['', '', '', '', '', ''],
  
  // Step 2: User Details
  fullName: '',
  email: '',
  brandName: '',
  password: '',
  confirmPassword: '',
  
  // Step 3: KYC Verification
  businessType: 'gst',
  aadhaarNumber: '',
  aadhaarOtp: ['', '', '', '', '', ''],
  gstNumber: '',
  gstOtp: ['', '', '', '', '', ''],
  panNumber: '',
  panOtp: ['', '', '', '', '', ''],
  beneficiaryName: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  branchName: '',
  gstAddress: '',
  gstPincode: ''
})

// Google Sign-In Configuration
const GOOGLE_CLIENT_ID = '592769281718-u140kqa8ikgtks4usm5m47ds2kvdk6nm.apps.googleusercontent.com'
const isGoogleLoaded = ref(false)
const isGoogleSignInUser = ref(false)

// Google Sign-In Phone OTP States
const googlePhoneOtpSent = ref(false)
const googlePhoneOtpCooldown = ref(0)
const googlePhoneVerified = ref(false)
const googlePhoneOtpInputs = ref([
  { value: '' },
  { value: '' },
  { value: '' },
  { value: '' },
  { value: '' },
  { value: '' }
])

// Login option for existing users
const showLoginOption = ref(false)

// Banks List - Will be populated from API
const banksList = ref<string[]>([])
const banksLoading = ref(false)
const banksError = ref('')

// Track if "Other" bank is selected
const isOtherBank = ref(false)

// UI State
const currentStep = ref(1)
const totalSteps = 3
const otpSent = ref(false)
const otpCooldown = ref(0)
const isMobileAlreadyRegistered = ref(false)
const aadhaarOtpSent = ref(false)
const gstOtpSent = ref(false)
const panOtpSent = ref(false)
const kycCompleted = ref(false)
const showDashboard = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSkippingKyc = ref(false) // Track if user is skipping KYC

// KYC Section Toggles
const showAadhaarSection = ref(false)
const showGstSection = ref(false)
const showPanSection = ref(false)
const showBankDetails = ref(false)

// Error handling
const errors = reactive<Record<string, string>>({})
const loading = ref(false)
const generalError = ref('')

// Add a ref to track Aadhaar verification status
const aadhaarVerified = ref(false)

// OTP Cooldown
const aadhaarOtpCooldown = ref(0)

// Verification states
const gstVerifying = ref(false)
const panVerifying = ref(false)
const bankVerifying = ref(false)
const gstVerified = ref(false)
const panVerified = ref(false)
const bankVerified = ref(false)

// Simple bank validation attempt tracking
const bankValidationAttempts = ref(0)
const maxBankValidationAttempts = 5
const bankCounterReset = ref(false)
const bankAttemptsExhausted = ref(false)

// Computed properties
const isStep1Valid = computed(() => {
  return formData.accountType && 
         formData.phone.length === 10 && 
         (!otpSent.value || formData.otp!.every(digit => digit !== ''))
})

const isStep2Valid = computed(() => {
  const basicValidation = formData.fullName.trim() !== '' &&
         formData.email.trim() !== '' &&
         formData.password.length >= 8 &&
         formData.password === formData.confirmPassword &&
         !errors.email && // Check for email validation errors
         !errors.fullName // Check for full name validation errors
  
  // For Google Sign-In users, also validate phone number and OTP verification
  if (isGoogleSignInUser.value) {
    const phoneValid = formData.phone.length === 10
    const phoneVerified = googlePhoneVerified.value
    return basicValidation && phoneValid && phoneVerified
  }
  
  return basicValidation
})

const isStep3Valid = computed(() => {
  // At least one KYC method should be completed or skipped
  return true
})

// Computed properties for OTP inputs
const otpInputs = computed(() => {
  return Array.from({ length: 6 }, (_, i) => ({
    value: (formData.otp && formData.otp[i]) || '',
    index: i
  }))
})

const aadhaarOtpInputs = computed(() => {
  return Array.from({ length: 6 }, (_, i) => ({
    value: (formData.aadhaarOtp && formData.aadhaarOtp[i]) || '',
    index: i
  }))
})

// Computed property to check if OTP is complete
const isOtpComplete = computed(() => {
  return formData.otp && formData.otp.every(digit => digit !== '')
})

// Methods
// Validation functions
const validatePhone = (phone: string) => {
  return phone.replace(/\D/g, '').slice(0, 10)
}

const validatePincode = (pincode: string) => {
  return pincode.replace(/\D/g, '').slice(0, 6)
}

const validateOtp = (otp: string) => {
  return otp.replace(/\D/g, '').slice(0, 1)
}

const validatePassword = () => {
  const password = formData.password
  const confirmPassword = formData.confirmPassword
  
  // Clear previous password errors
  delete errors.password
  delete errors.confirmPassword
  
  // Check password length
  if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long'
    return false
  }
  
  // Check if passwords match
  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    return false
  }
  
  return true
}

const validateFullName = (fullName: string) => {
  // Clear previous full name error
  delete errors.fullName
  
  // Check if full name is provided
  if (!fullName || fullName.trim() === '') {
    errors.fullName = 'Full name is required'
    return false
  }
  
  // Check if full name contains at least two words (first and last name)
  const nameParts = fullName.trim().split(/\s+/)
  if (nameParts.length < 2) {
    errors.fullName = 'Please enter your complete name (first and last name)'
    return false
  }
  
  // Check if the last part (last name) is not empty
  if (nameParts[nameParts.length - 1].length === 0) {
    errors.fullName = 'Last name is required'
    return false
  }
  
  return true
}

const validateGstNumber = (value: string) => {
  // Clear previous GST error
  delete errors.gstNumber
  
  // Check if GST number is provided
  if (!value || value.trim() === '') {
    return true // GST is optional
  }
  
  // Check GST number length (should be 15 characters)
  if (value.length > 15) {
    errors.gstNumber = 'GST number cannot be more than 15 characters'
    return false
  }
  
  // Basic GST format validation (2 digits + 10 alphanumeric + 1 digit + 1 alphanumeric)
  const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  if (!gstPattern.test(value)) {
    errors.gstNumber = 'Please enter a valid GST number format (e.g., 22AAAAA0000A1Z5)'
    return false
  }
  
  return true
}

// Function to reset mobile registration flag when phone changes
const resetMobileRegistrationFlag = () => {
  isMobileAlreadyRegistered.value = false
  otpSent.value = false
  clearErrors()
}

const sendOtp = async () => {
  console.log('=== SEND OTP FUNCTION CALLED ===')
  console.log('Phone number:', formData.phone)
  console.log('Phone length:', formData.phone.length)
  
  if (formData.phone.length !== 10) {
    console.log('Phone validation failed - length is not 10')
    errors.phone = 'Please enter a valid 10-digit phone number'
    return
  }

  console.log('Phone validation passed, starting API call...')
  loading.value = true
  clearErrors() // Clear previous errors
  
  try {
    console.log('Calling apiService.sendOTP with phone:', formData.phone)
    const response = await apiService.sendOTP(formData.phone)
    console.log('API response received:', response)
    
    // Check for success - backend doesn't return 'success' field, just check if response exists
    if (response && response.success) {
      console.log('OTP sent successfully!')
      otpSent.value = true
      // Initialize countdown timer (60 seconds = 1 minute)
      otpCooldown.value = 60
      startOtpCooldown()
      // Show success message
      console.log('OTP sent successfully! ')
      // Show success message to user
      alert('OTP sent successfully! Please check your phone for the 6-digit code.')
    } else {
      console.log('API returned error:', response)
      
      // Check for mobile already registered error
      if (response && !response.success && response.data?.is_registered) {
        isMobileAlreadyRegistered.value = true
        generalError.value = response.data?.message || 'This mobile number is already registered. Please try logging in instead.'
        // Clear phone number to allow user to enter a different one
        formData.phone = ''
        errors.phone = 'This mobile number is already registered'
      } else {
        handleApiError(response)
      }
    }
  } catch (error: any) {
    console.error('OTP send error:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data
    })
    
    if (error.response?.status === 429) {
      // Handle cooldown error
      const cooldownRemaining = error.response.data?.cooldown_remaining || 60
      otpCooldown.value = cooldownRemaining
      startOtpCooldown()
      generalError.value = error.response.data?.message || 'Please wait before requesting another OTP'
    } else if (error.response?.status === 422 && error.response.data?.is_registered) {
      // Handle mobile already registered error
      isMobileAlreadyRegistered.value = true
      generalError.value = error.response.data?.message || 'This mobile number is already registered. Please try logging in instead.'
      // Clear phone number to allow user to enter a different one
      formData.phone = ''
      errors.phone = 'This mobile number is already registered'
    } else if (error.response?.status === 404 && error.response.data?.user_not_found) {
      // User doesn't exist - this is expected for new signups
      // Proceed to create user during the actual signup process
      otpSent.value = true
      // Initialize countdown timer (60 seconds = 1 minute)
      otpCooldown.value = 60
      startOtpCooldown()
      console.log('New user signup - OTP will be sent during signup process')
      // Show user-friendly message
      alert('New user detected! OTP will be sent during the signup process. Please continue to the next step.')
    } else {
      generalError.value = 'Network error occurred while sending OTP. Please try again.'
    }
  } finally {
    console.log('Setting loading to false')
    loading.value = false
  }
}

const resendOtp = async () => {
  if (otpCooldown.value > 0) return
  
  try {
    loading.value = true
    clearErrors()
    
    const response = await apiService.sendOTP(formData.phone)
    // Check for success - backend doesn't return 'success' field, just check if response exists
    if (response && (response.success || response.message)) {
      // Reset OTP fields
      formData.otp = ['', '', '', '', '', '']
      // Start countdown timer (60 seconds = 1 minute)
      otpCooldown.value = 60
      startOtpCooldown()
      console.log('OTP resent successfully!')
    } else {
      handleApiError(response)
    }
  } catch (error: any) {
    console.error('OTP resend error:', error)
    
    if (error.response?.status === 422 && error.response.data?.is_registered) {
      // Handle mobile already registered error
      isMobileAlreadyRegistered.value = true
      generalError.value = error.response.data?.message || 'This mobile number is already registered. Please try logging in instead.'
      // Clear phone number to allow user to enter a different one
      formData.phone = ''
      errors.phone = 'This mobile number is already registered'
    } else {
      generalError.value = 'Network error occurred while resending OTP. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const startOtpCooldown = () => {
  if (otpCooldown.value <= 0) return
  
  const timer = setInterval(() => {
    otpCooldown.value--
    if (otpCooldown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatOtpTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const verifyOtp = async () => {
  if (formData.otp!.some(digit => digit === '')) {
    errors.otp = 'Please enter the complete 6-digit OTP'
    return
  }

  loading.value = true
  clearErrors() // Clear previous errors
  
  try {
    const otpString = formData.otp!.join('')
    console.log('Verifying OTP:', otpString, 'for phone:', formData.phone)
    const response = await apiService.verifyOTP(formData.phone, otpString)
    console.log('OTP verification response:', response)
    
    // Check for success based on backend response format
    if (response.result === 1 || response.success || response.message?.toLowerCase().includes('success')) {
      console.log('OTP verification successful, proceeding to next step')
      nextStep()
    } else {
      console.log('OTP verification failed:', response.message)
      // Handle specific OTP error cases
      if (response.message && (response.message.toLowerCase().includes('invalid') || 
          response.message.toLowerCase().includes('wrong') ||
          response.message.toLowerCase().includes('incorrect'))) {
        errors.otp = 'Invalid OTP. Please check and try again.'
        // Clear OTP fields for retry
        formData.otp = ['', '', '', '', '', '']
      } else {
        handleApiError(response)
      }
    }
  } catch (error: any) {
    console.error('OTP verification error:', error)
    // Handle network errors or specific error responses
    if (error.response?.status === 400 || error.response?.status === 422) {
      errors.otp = 'Invalid OTP. Please check and try again.'
      // Clear OTP fields for retry
      formData.otp = ['', '', '', '', '', '']
    } else {
      generalError.value = 'Network error occurred while verifying OTP. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

// Navigation functions
const nextStep = async () => {
  console.log('nextStep called, current step:', currentStep.value, 'total steps:', totalSteps)
  if (currentStep.value < totalSteps) {
    // For step 1, simply proceed to step 2 (OTP verification is already done)
    if (currentStep.value === 1) {
      console.log('Moving from Step 1 to Step 2 after OTP verification')
      currentStep.value++
      console.log('Step incremented to:', currentStep.value)
      return
    }
    
    // For step 2, validate before proceeding
    if (currentStep.value === 2) {
      // Validate full name first
      if (!validateFullName(formData.fullName)) {
        console.log('Cannot proceed to step 3: Full name validation error exists')
        return
      }
      
      // Check for email errors (including backend validation errors)
      if (errors.email) {
        console.log('Cannot proceed to step 3: Email validation error exists')
        console.log('Email error:', errors.email)
        
        // If it's a duplicate email error (from frontend or backend), show a more prominent message
        if (errors.email.includes('already registered') || errors.email.includes('already been taken')) {
          generalError.value = '⚠️ This email is already registered with Vamaship. Please use a different email address or try logging in instead.'
          // Set login option flag to show login option
          showLoginOption.value = true
        } else if (errors.email.includes('Network error')) {
          generalError.value = 'Network error occurred. Please check your connection and try again.'
        }
        return
      }
      
      // Additional check: if generalError contains email-related errors, prevent proceeding
      if (generalError.value && (generalError.value.includes('email') || generalError.value.includes('already registered'))) {
        console.log('Cannot proceed to step 3: General error contains email-related message')
        console.log('General error:', generalError.value)
        return
      }
      
      // Validate email format and existence
      if (formData.email.trim() !== '') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(formData.email)) {
          errors.email = 'Please enter a valid email address'
          console.log('Cannot proceed: Invalid email format')
          return
        }
        
        // Force email validation check before proceeding
        try {
          console.log('Validating email existence before proceeding to Step 3...')
          await validateEmailExists(formData.email)
          
          // Check if validation resulted in an error
          if (errors.email) {
            console.log('Cannot proceed: Email validation failed')
            console.log('Email error after validation:', errors.email)
            
            // Show a more prominent error message for duplicate email
            if (errors.email.includes('already registered') || errors.email.includes('already been taken')) {
              generalError.value = '⚠️ This email is already registered with Vamaship. Please use a different email address or try logging in instead.'
              // Set login option flag to show login option
              showLoginOption.value = true
            } else if (errors.email.includes('Network error')) {
              generalError.value = 'Network error occurred. Please check your connection and try again.'
            }
            return
          }
          
          console.log('Email validation passed, proceeding to step 3')
          // Clear any previous general errors before proceeding
          if (generalError.value && (generalError.value.includes('email') || generalError.value.includes('already registered'))) {
            generalError.value = ''
          }
          currentStep.value++
          
        } catch (error) {
          console.error('Email validation error:', error)
          generalError.value = 'Network error occurred. Please check your connection and try again.'
          return
        }
      } else {
        // Email is empty, allow proceeding but warn user
        console.log('Email is empty, allowing to proceed but user should fill it')
        currentStep.value++
      }
    }
    
    // Only clear errors if there are no validation errors
    if (!generalError.value && Object.keys(errors).every(key => !errors[key])) {
      clearErrors()
    }
    // currentStep.value++ is already handled in Step 2 validation logic
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    // Only clear errors if there are no validation errors
    if (!generalError.value && Object.keys(errors).every(key => !errors[key])) {
      clearErrors()
    }
    currentStep.value--
  }
}

// Complete signup process
const completeSignup = async () => {
  // Prevent duplicate submissions
  if (loading.value) {
    console.log('Signup already in progress, ignoring duplicate call');
    return;
  }
  
  console.log('=== VUE COMPONENT COMPLETE SIGNUP START ===');
  console.log('Current form data:', formData);
  console.log('Aadhaar verified:', aadhaarVerified.value);
  console.log('Is Google Sign-In user:', isGoogleSignInUser.value);
  console.log('Is skipping KYC:', isSkippingKyc.value);
  console.log('Password:', formData.password);
  console.log('Confirm Password:', formData.confirmPassword);
  console.log('Password match:', formData.password === formData.confirmPassword);
  
  // Validate full name first
  if (!validateFullName(formData.fullName)) {
    console.error('Full name validation failed!');
    return;
  }
  
  // Additional validation before sending
  if (formData.password !== formData.confirmPassword) {
    console.error('Password mismatch detected!');
    handleApiError({ 
      message: 'Password and Confirm Password do not match. Please check and try again.', 
      errors: { confirmPassword: 'Passwords do not match' } 
    });
    return;
  }
  
  if (formData.password.length < 8) {
    console.error('Password too short!');
    handleApiError({ 
      message: 'Password must be at least 8 characters long.', 
      errors: { password: 'Password must be at least 8 characters' } 
    });
    return;
  }
  
  // Conditional KYC validation - only if user is NOT skipping KYC
  if (!isSkippingKyc.value) {
    console.log('Performing KYC validation...');
    
    // Check if user has selected a business type
    if (!formData.businessType) {
      handleApiError({ 
        message: 'Please select a business type (GST or PAN).', 
        errors: { businessType: 'Business type is required' } 
      });
      return;
    }
    
    // Validate based on business type
    if (formData.businessType === 'gst') {
      // GST validation
      if (!formData.gstNumber || formData.gstNumber.trim() === '') {
        handleApiError({ 
          message: 'GST number is required for GST registered businesses.', 
          errors: { gstNumber: 'GST number is required' } 
        });
        return;
      }
      
      if (!validateGstNumber(formData.gstNumber)) {
        return; // Error already set by validateGstNumber
      }
      
      if (!formData.gstAddress || formData.gstAddress.trim() === '') {
        handleApiError({ 
          message: 'Registered address is required for GST businesses.', 
          errors: { gstAddress: 'Registered address is required' } 
        });
        return;
      }
      
      if (!formData.gstPincode || formData.gstPincode.length !== 6) {
        handleApiError({ 
          message: 'Valid pincode is required for GST businesses.', 
          errors: { gstPincode: 'Valid 6-digit pincode is required' } 
        });
        return;
      }
    } else if (formData.businessType === 'pan') {
      // PAN validation
      if (!formData.panNumber || formData.panNumber.trim() === '') {
        handleApiError({ 
          message: 'PAN number is required for PAN based businesses.', 
          errors: { panNumber: 'PAN number is required' } 
        });
        return;
      }
      
      if (!formData.entityType) {
        handleApiError({ 
          message: 'Entity type is required for PAN based businesses.', 
          errors: { entityType: 'Entity type is required' } 
        });
        return;
      }
      
      if (!formData.entityName || formData.entityName.trim() === '') {
        handleApiError({ 
          message: 'Entity name is required for PAN based businesses.', 
          errors: { entityName: 'Entity name is required' } 
        });
        return;
      }
      
      if (!validatePanNumber(formData.panNumber)) {
        return; // Error already set by validatePanNumber
      }
    }
    
    // Bank details validation (required for both GST and PAN)
    if (!formData.beneficiaryName || formData.beneficiaryName.trim() === '') {
      handleApiError({ 
        message: 'Beneficiary name is required.', 
        errors: { beneficiaryName: 'Beneficiary name is required' } 
      });
      return;
    }
    
    if (!formData.bankName || formData.bankName.trim() === '') {
      handleApiError({ 
        message: 'Bank name is required.', 
        errors: { bankName: 'Bank name is required' } 
      });
      return;
    }
    
    if (!formData.accountNumber || formData.accountNumber.trim() === '') {
      const remainingAttempts = maxBankValidationAttempts - bankValidationAttempts.value
      errors.accountNumber = `Please enter an account number to verify. (${remainingAttempts} attempts remaining)`
      return
    }

    if (!formData.ifscCode || formData.ifscCode.trim() === '') {
      const remainingAttempts = maxBankValidationAttempts - bankValidationAttempts.value
      errors.ifscCode = `Please enter an IFSC code to verify. (${remainingAttempts} attempts remaining)`
      return
    }
  } else {
    console.log('Skipping KYC validation - user chose to skip KYC');
  }
  
  loading.value = true
  clearErrors() // Clear any previous errors
  
  try {
    // Prepare complete signup data with correct field names
    const signupData = {
      // User registration data
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      accountType: formData.accountType,
      brandName: formData.brandName, // Add brand name
      
      // Add Google Sign-In flag
      isGoogleSignIn: isGoogleSignInUser.value,
      
      // Add KYC skipping flag
      isSkippingKyc: isSkippingKyc.value,
      
      // Only send KYC data if user is NOT skipping KYC and aadhaar is verified
      ...(aadhaarVerified.value && !isSkippingKyc.value ? {
        aadhaarNumber: formData.aadhaarNumber,
        gstNumber: formData.gstNumber || undefined,
        panNumber: formData.panNumber || undefined,
        businessType: formData.businessType || undefined,
        branchName: formData.branchName || undefined,
        gstAddress: formData.gstAddress || undefined,
        gstPincode: formData.gstPincode || undefined,
        entityType: formData.entityType || undefined,
        entityName: formData.entityName || undefined,
        billingAddress: formData.billingAddress || undefined,
        panPincode: formData.panPincode || undefined,
        beneficiaryName: formData.beneficiaryName || undefined,
        bankName: formData.bankName || undefined,
        accountNumber: formData.accountNumber || undefined,
        ifscCode: formData.ifscCode || undefined
      } : {
        // Skip all KYC data if user is skipping KYC or aadhaar not verified
        // This ensures clean registration without KYC complications
      })
    }

    console.log('Prepared signup data for backend:', signupData);
    console.log('Password field in signupData:', signupData.password);
    console.log('ConfirmPassword field in signupData:', signupData.confirmPassword);
    const response = await apiService.completeSignup(signupData)
    
    console.log('Backend response:', response);
    console.log('Response success:', response.success);
    console.log('Response message:', response.message);
    console.log('Response errors:', response.errors);
    
    if (response.success) {
      console.log('Signup completed successfully:', response.data)
      
      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify({
        name: response.data.user.name,
        email: response.data.user.email,
        phone: response.data.user.phone,
        userId: response.data.user_id,
        entityId: response.data.entity_id
      }))
      
      // Store access token and API key
      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('api_key', response.data.api_key)
      
      // Show success and redirect to ecom3-ui dashboard
      kycCompleted.value = true
      showDashboard.value = true
      alert('Signup completed successfully! Welcome to Vamaship! 🎉')
      
      // Prepare redirect URL with authentication parameters
      const baseUrl = response.data?.redirect_url || 'http://localhost:8080'
      
      // Debug the API key and redirect URL
      console.log('=== REDIRECT URL DEBUGGING ===');
      console.log('API key from response:', response.data.api_key);
      console.log('API key type:', typeof response.data.api_key);
      console.log('API key length:', response.data.api_key ? response.data.api_key.length : 'N/A');
      console.log('Original redirect_url from backend:', response.data?.redirect_url);
      console.log('Base URL:', baseUrl);
      
      // Always redirect to login-migration first for proper authentication flow
      // Extract the base URL from the backend redirect_url if it exists
      let ecom3BaseUrl;
      if (response.data?.redirect_url) {
        try {
          const url = new URL(response.data.redirect_url);
          ecom3BaseUrl = `${url.protocol}//${url.host}`;
        } catch (error) {
          console.warn('Could not parse redirect_url, using fallback:', error);
          ecom3BaseUrl = 'http://localhost:8080';
        }
      } else {
        ecom3BaseUrl = 'http://localhost:8080';
      }
      
      const loginUrl = `${ecom3BaseUrl}/login-migration`;
      console.log('Ecom3 Base URL:', ecom3BaseUrl);
      console.log('Login URL:', loginUrl);
      
      // Build query parameters for seamless authentication
      const queryParams = new URLSearchParams({
        api_key: response.data.api_key,
        new_user: 'true',
        user_id: response.data.user_id || '0',
        user_name: response.data.user.name || '',
        user_email: response.data.user.email || '',
        user_phone: response.data.user.phone || '',
        from: 'signup'
      });
      
      const finalRedirectUrl = `${loginUrl}?${queryParams.toString()}`;
      console.log('Query parameters:', queryParams.toString());
      
      console.log('Final redirect URL:', finalRedirectUrl);
      console.log('=== REDIRECT URL DEBUGGING END ===');
      
      console.log('Redirecting to ecom3-ui:', finalRedirectUrl)
      console.log('Full response data:', response.data)
      console.log('Response success:', response.success)
      console.log('Response message:', response.message)
      
      // Try immediate redirect first
      try {
        console.log('Attempting immediate redirect to:', finalRedirectUrl)
        window.location.href = finalRedirectUrl
      } catch (redirectError) {
        console.error('Immediate redirect failed:', redirectError)
        // Fallback to setTimeout
        setTimeout(() => {
          console.log('Attempting delayed redirect to:', finalRedirectUrl)
          try {
            window.location.href = finalRedirectUrl
          } catch (fallbackError) {
            console.error('Delayed redirect also failed:', fallbackError)
            // Final fallback - open in new tab
            window.open(finalRedirectUrl, '_blank')
          }
        }, 1000)
      }
    } else {
      console.error('Signup failed:', response.message);
      console.error('Signup errors:', response.errors);
      
      // Check if this is an email already registered error
      const isEmailAlreadyRegistered = response.message?.includes('already registered') || 
                                      response.message?.includes('already exists') ||
                                      response.errors?.email?.some((error: string) => 
                                        error.includes('already registered') || error.includes('already exists')
                                      );
      
      if (isEmailAlreadyRegistered) {
        // Set flag to show login option
        showLoginOption.value = true
        
        // Store email for pre-filling in login page
        if (formData.email) {
          localStorage.setItem('prefillEmail', formData.email)
        }
        
        return
      }
      
      // Handle validation errors from API service
      if (response.errors) {
        // Map backend field names to frontend field names
        const fieldMapping: Record<string, string> = {
          'fullName': 'fullName',
          'email': 'email',
          'phone': 'phone',
          'password': 'password',
          'confirmPassword': 'confirmPassword',
          'aadhaar_number': 'aadhaarNumber',
          'gst_number': 'gstNumber',
          'pan_number': 'panNumber',
          'beneficiary_name': 'beneficiaryName',
          'bank_name': 'bankName',
          'account_number': 'accountNumber',
          'ifsc_code': 'ifscCode',
          'gst_address': 'gstAddress',
          'gst_pincode': 'gstPincode',
          'entity_type': 'entityType',
          'entity_name': 'entityName',
          'billing_address': 'billingAddress',
          'pan_pincode': 'panPincode',
          'branch_name': 'branchName'
        }
        
        // Set field-specific errors
        Object.keys(response.errors).forEach(backendField => {
          const frontendField = fieldMapping[backendField] || backendField
          if (response.errors[backendField] && Array.isArray(response.errors[backendField])) {
            const errorMessage = response.errors[backendField][0]
            errors[frontendField] = errorMessage
          }
        })
        
        // Set general error message
        generalError.value = response.message || 'Please check your information and try again.'
      } else {
        // No specific field errors, just show general message
        console.log('Response message:', response.message);
        console.log('Message includes Network error:', response.message?.includes('Network error'));
        console.log('Message includes connection:', response.message?.includes('connection'));
        
        // Check if this is a network error message from the backend
        if (response.message && (response.message.includes('Network error') || response.message.includes('connection'))) {
          console.log('Detected as network error, setting standard message');
          generalError.value = 'Network error occurred. Please check your connection and try again.'
        } else {
          console.log('Not a network error, using original message');
          generalError.value = response.message || 'Signup failed. Please try again.'
        }
      }
    }
  } catch (error: any) {
    console.error('Network error during signup:', error)
    
    // Handle network errors or unexpected errors
    generalError.value = 'Network error occurred during signup. Please check your connection and try again.'
  } finally {
    loading.value = false
    console.log('=== VUE COMPONENT COMPLETE SIGNUP END ===');
  }
}

const submitKyc = async () => {
  loading.value = true
  try {
    const kycData: KYCData = {
      brandName: formData.brandName, // Add brand name
      aadhaarNumber: aadhaarVerified.value ? formData.aadhaarNumber : undefined,
      gstNumber: formData.gstNumber || undefined,
      gstOtp: formData.gstOtp?.some(d => d !== '') ? formData.gstOtp : undefined,
      panNumber: formData.panNumber || undefined,
      panOtp: formData.panOtp?.some(d => d !== '') ? formData.panOtp : undefined,
      beneficiaryName: formData.beneficiaryName || undefined,
      bankName: formData.bankName || undefined,
      accountNumber: formData.accountNumber || undefined,
      ifscCode: formData.ifscCode || undefined
    }

    console.log('Submitting KYC data:', kycData)
    const response = await apiService.submitKYC(kycData)
    if (response.success) {
      kycCompleted.value = true
      showDashboard.value = true
      localStorage.setItem('userData', JSON.stringify(formData))
      router.push('/orders')
    } else {
      alert(response.message || 'KYC submission failed')
    }
  } catch (error) {
    console.error('KYC submission error:', error)
    alert('Network error occurred during KYC submission')
  } finally {
    loading.value = false
  }
}

const skipKyc = async () => {
  console.log('Skipping KYC verification - proceeding with clean registration');
  
  // Prevent duplicate submissions
  if (loading.value) {
    console.log('Skip KYC already in progress, ignoring duplicate call');
    return;
  }
  
  // Set the flag to indicate user is skipping KYC
  isSkippingKyc.value = true
  
  // Clear any KYC data to ensure clean registration
  formData.aadhaarNumber = ''
  formData.gstNumber = ''
  formData.panNumber = ''
  formData.beneficiaryName = ''
  formData.bankName = ''
  formData.accountNumber = ''
  formData.ifscCode = ''
  formData.branchName = ''
  formData.gstAddress = ''
  formData.gstPincode = ''
  formData.entityType = ''
  formData.entityName = ''
  formData.billingAddress = ''
  formData.panPincode = ''
  
  // Mark aadhaar as not verified to skip KYC data
  aadhaarVerified.value = false
  
  // Show loading state
  loading.value = true
  
  try {
    console.log('=== SKIP KYC SIGNUP START ===');
    console.log('Preparing streamlined signup data for KYC skip');
    
    // Prepare streamlined signup data (minimal validation for skip)
    const signupData = {
      // Essential user registration data only
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      accountType: formData.accountType,
      brandName: formData.brandName,
      
      // Add Google Sign-In flag
      isGoogleSignIn: isGoogleSignInUser.value,
      
      // Add KYC skipping flag
      isSkippingKyc: true,
      
      // No KYC data - clean registration
    }

    console.log('Streamlined signup data for KYC skip:', signupData);
    
    const response = await apiService.completeSignup(signupData)
    
    console.log('Skip KYC backend response:', response);
    
    if (response.success) {
      console.log('Skip KYC signup completed successfully:', response.data)
      
      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify({
        name: response.data.user.name,
        email: response.data.user.email,
        phone: response.data.user.phone,
        userId: response.data.user_id,
        entityId: response.data.entity_id
      }))
      
      // Store access token and API key
      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('api_key', response.data.api_key)
      
      // Show success and redirect to ecom3-ui dashboard
      kycCompleted.value = true
      showDashboard.value = true
      alert('Signup completed successfully! Welcome to Vamaship! 🎉')
      
      // Prepare redirect URL with authentication parameters
      const baseUrl = response.data?.redirect_url || 'http://localhost:8080'
      
      // Debug the API key and redirect URL
      console.log('=== SKIP KYC REDIRECT DEBUGGING ===');
      console.log('API key from response:', response.data.api_key);
      console.log('Original redirect_url from backend:', response.data?.redirect_url);
      console.log('Base URL for redirect:', baseUrl);
      
      // Always redirect to login-migration first for proper authentication flow
      let ecom3BaseUrl;
      if (response.data?.redirect_url) {
        try {
          const url = new URL(response.data.redirect_url);
          ecom3BaseUrl = `${url.protocol}//${url.host}`;
        } catch (error) {
          console.warn('Could not parse redirect_url, using fallback:', error);
          ecom3BaseUrl = 'http://localhost:8080';
        }
      } else {
        ecom3BaseUrl = 'http://localhost:8080';
      }
      
      const loginUrl = `${ecom3BaseUrl}/login-migration`;
      const queryParams = new URLSearchParams({
        api_key: response.data.api_key,
        new_user: 'true',
        user_id: response.data.user_id || '0',
        user_name: response.data.user.name || '',
        user_email: response.data.user.email || '',
        user_phone: response.data.user.phone || '',
        from: 'signup'
      });
      
      const finalRedirectUrl = `${loginUrl}?${queryParams.toString()}`;
      console.log('Final redirect URL for skip KYC:', finalRedirectUrl);
      
      // Redirect to ecom3-ui login-migration page
      window.location.href = finalRedirectUrl;
      
    } else {
      console.error('Skip KYC signup failed:', response);
      handleApiError(response);
    }
  } catch (error) {
    console.error('Error during KYC skip signup:', error);
    handleApiError({ 
      message: 'Network error occurred during signup. Please try again.',
      errors: {}
    });
  } finally {
    loading.value = false
  }
}

// OTP Input Handling
const handleOtpInput = (index: number, value: string) => {
  if (value.length > 1) {
    value = value.slice(-1)
  }
  
  formData.otp![index] = value.replace(/\D/g, '')
  
  // Auto-focus to next field
  if (value && index < 5) {
    const nextInput = document.querySelector(`[data-otp-index="${index + 1}"]`) as HTMLInputElement
    if (nextInput) {
      nextInput.focus()
    }
  }
}

const handleOtpKeydown = (index: number, event: KeyboardEvent) => {
  // Handle backspace - only move left if current field is empty
  if (event.key === 'Backspace' && !formData.otp![index] && index > 0) {
    const prevInput = document.querySelector(`[data-otp-index="${index - 1}"]`) as HTMLInputElement
    if (prevInput) {
      prevInput.focus()
    }
  }
}

const handleAadhaarOtpInput = (index: number, value: string) => {
  if (value.length > 1) {
    value = value.slice(-1)
  }
  
  formData.aadhaarOtp![index] = value.replace(/\D/g, '')
  
  // Auto-focus to next field
  if (value && index < 5) {
    const nextInput = document.querySelector(`[data-aadhaar-otp-index="${index + 1}"]`) as HTMLInputElement
    if (nextInput) {
      nextInput.focus()
    }
  }
}

const handleAadhaarOtpKeydown = (index: number, event: KeyboardEvent) => {
  // Handle backspace - only move left if current field is empty
  if (event.key === 'Backspace' && !formData.aadhaarOtp![index] && index > 0) {
    const prevInput = document.querySelector(`[data-aadhaar-otp-index="${index - 1}"]`) as HTMLInputElement
    if (prevInput) {
      prevInput.focus()
    }
  }
}

// Google Sign-In Phone OTP Functions
const sendGooglePhoneOtp = async () => {
  try {
    loading.value = true
    clearErrors()
    
    if (formData.phone.length !== 10) {
      handleApiError({ message: 'Please enter a valid 10-digit phone number', errors: {} })
      return
    }
    
    const response = await apiService.sendOTP(formData.phone)
    
    if (response.success) {
      googlePhoneOtpSent.value = true
      googlePhoneOtpCooldown.value = 30
      
      // Start cooldown timer
      const timer = setInterval(() => {
        googlePhoneOtpCooldown.value--
        if (googlePhoneOtpCooldown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
      
      console.log('Google Phone OTP sent successfully')
    }
  } catch (error: any) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}

const verifyGooglePhoneOtp = async () => {
  try {
    loading.value = true
    clearErrors()
    
    const otp = googlePhoneOtpInputs.value.map(input => input.value).join('')
    
    if (otp.length !== 6) {
      handleApiError({ message: 'Please enter the complete 6-digit OTP', errors: {} })
      return
    }
    
    const response = await apiService.verifyOTP(formData.phone, otp)
    
    if (response.success) {
      console.log('Google Phone OTP verified successfully')
      googlePhoneVerified.value = true // Set phone as verified
      // Don't move to step 3 yet - let user fill password fields
    }
  } catch (error: any) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}

const resendGooglePhoneOtp = async () => {
  if (googlePhoneOtpCooldown.value > 0) return
  await sendGooglePhoneOtp()
}

const handleGooglePhoneOtpInput = (index: number, value: string) => {
  if (value.length > 1) {
    value = value.slice(-1)
  }
  googlePhoneOtpInputs.value[index].value = value.replace(/\D/g, '')
  
  // Auto-focus to next field
  if (value && index < 5) {
    const nextInput = document.querySelector(`[data-google-phone-otp-index="${index + 1}"]`) as HTMLInputElement
    if (nextInput) {
      nextInput.focus()
    }
  }
}

const handleGooglePhoneOtpKeydown = (index: number, event: KeyboardEvent) => {
  // Handle backspace - only move left if current field is empty
  if (event.key === 'Backspace' && !googlePhoneOtpInputs.value[index].value && index > 0) {
    const prevInput = document.querySelector(`[data-google-phone-otp-index="${index - 1}"]`) as HTMLInputElement
    if (prevInput) {
      prevInput.focus()
    }
  }
}

const formatGooglePhoneOtpTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// KYC Section Toggles
const toggleAadhaarSection = () => {
  showAadhaarSection.value = !showAadhaarSection.value
}

const toggleGstSection = () => {
  showGstSection.value = !showGstSection.value
}

const togglePanSection = () => {
  showPanSection.value = !showPanSection.value
}

const toggleBankDetails = () => {
  showBankDetails.value = !showBankDetails.value
}

// Enhanced Aadhaar validation function
const validateAadhaar = (aadhaarNumber: string) => {
  console.log('=== AADHAAR VALIDATION START ===')
  console.log('Validating Aadhaar:', aadhaarNumber)
  
  // Clear previous error
  errors.aadhaarNumber = ''
  
  if (!aadhaarNumber || aadhaarNumber.trim() === '') {
    console.log('Aadhaar is empty')
    return false
  }
  
  // Remove any spaces or special characters
  const cleanAadhaar = aadhaarNumber.replace(/\s/g, '').replace(/-/g, '')
  
  // Check if it's exactly 12 digits
  if (cleanAadhaar.length !== 12) {
    console.log('Aadhaar must be exactly 12 digits')
    errors.aadhaarNumber = 'Aadhaar number must be exactly 12 digits'
    return false
  }
  
  // Check if it contains only digits
  if (!/^\d{12}$/.test(cleanAadhaar)) {
    console.log('Aadhaar must contain only digits')
    errors.aadhaarNumber = 'Aadhaar number must contain only digits'
    return false
  }
  
  // Check if it doesn't start with 0 or 1 (common validation)
  if (cleanAadhaar.startsWith('0') || cleanAadhaar.startsWith('1')) {
    console.log('Aadhaar cannot start with 0 or 1')
    errors.aadhaarNumber = 'Aadhaar number cannot start with 0 or 1'
    return false
  }
  
  // Check for repeated digits (like 111111111111)
  if (/^(\d)\1{11}$/.test(cleanAadhaar)) {
    console.log('Aadhaar cannot be all repeated digits')
    errors.aadhaarNumber = 'Please enter a valid Aadhaar number'
    return false
  }
  
  // Update the form data with cleaned Aadhaar
  formData.aadhaarNumber = cleanAadhaar
  
  console.log('Aadhaar validation passed')
  console.log('=== AADHAAR VALIDATION END ===')
  return true
}

// Aadhaar OTP Methods
const sendAadhaarOtp = async () => {
  if (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12) {
    alert('Please enter a valid 12-digit Aadhaar number')
    return
  }

  loading.value = true
  try {
    const response = await apiService.sendAadhaarOTP(formData.aadhaarNumber)
    if (response.success) {
      aadhaarOtpSent.value = true
      errors.aadhaarOtp = ''
      // Initialize countdown timer
      aadhaarOtpCooldown.value = 60 // 1 minute = 60 seconds
      startAadhaarOtpCooldown()
      
      console.log('Aadhaar OTP sent successfully!', response.data)
      alert('Aadhaar OTP sent successfully to your registered mobile number! 📱')
    } else {
      errors.aadhaarOtp = response.message || 'Failed to send Aadhaar OTP'
    }
  } catch (error: any) {
    console.error('Aadhaar OTP send error:', error)
    if (error.response?.status === 429) {
      // Handle cooldown error
      const cooldownRemaining = error.response.data?.cooldown_remaining || 60
      aadhaarOtpCooldown.value = cooldownRemaining
      startAadhaarOtpCooldown()
      errors.aadhaarOtp = error.response.data?.message || 'Please wait before requesting another Aadhaar OTP'
    } else {
      errors.aadhaarOtp = 'Network error occurred'
    }
  } finally {
    loading.value = false
  }
}

const resendAadhaarOtp = async () => {
  if (aadhaarOtpCooldown.value > 0) return
  
  await sendAadhaarOtp()
}

const startAadhaarOtpCooldown = () => {
  if (aadhaarOtpCooldown.value <= 0) return
  
  const timer = setInterval(() => {
    aadhaarOtpCooldown.value--
    if (aadhaarOtpCooldown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const verifyAadhaar = async () => {
  if (!formData.aadhaarOtp || formData.aadhaarOtp.some(d => d === '')) {
    alert('Please enter the complete 6-digit Aadhaar OTP')
    return
  }

  loading.value = true
  try {
    const otpString = formData.aadhaarOtp.join('')
    console.log('Verifying Aadhaar OTP:', otpString, 'for Aadhaar:', formData.aadhaarNumber)
    const response = await apiService.verifyAadhaarOTP(formData.aadhaarNumber || '', otpString)
    
    console.log('Aadhaar verification response:', response)
    
    // Check for success - backend returns 'result' field, not 'success'
    if (response.success && response.data && response.data.result === 1) {
      // Mark Aadhaar as verified locally
      aadhaarVerified.value = true
      
      alert('Aadhaar verification successful! ✅')
      
      // Clear the form but keep the verification status
      if (formData.aadhaarOtp) {
        formData.aadhaarOtp = ['', '', '', '', '', '']
      }
      aadhaarOtpSent.value = false
      showAadhaarSection.value = false
      
      // Don't clear the Aadhaar number as it's now verified
    } else {
      const errorMessage = response.data?.message || response.message || 'Aadhaar verification failed'
      errors.aadhaarOtp = errorMessage
      console.error('Aadhaar verification failed:', errorMessage)
    }
  } catch (error) {
    console.error('Aadhaar verification error:', error)
    errors.aadhaarOtp = 'Network error occurred'
  } finally {
    loading.value = false
  }
}

// Redirect to Vamaship for buyers
const redirectToVamaship = () => {
  formData.accountType = 'buyer'
  window.open('https://vamaship.co/', '_blank')
}

// Function to navigate to sign-in page
const goToSignIn = () => {
  // Store the email in localStorage so it can be pre-filled in sign-in
  if (formData.email) {
    localStorage.setItem('prefillEmail', formData.email)
  }
  // Store the phone number in localStorage so it can be pre-filled in sign-in
  if (formData.phone) {
    localStorage.setItem('prefillPhone', formData.phone)
  }
  // Navigate to sign-in page
  router.push('/sign-in')
}

// Google Sign-In Methods
const initializeGoogleSignIn = () => {
  if (typeof window !== 'undefined' && window.google) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleSignInSuccess,
      auto_select: false,
      cancel_on_tap_outside: true
    })
    
    // Render the Google Sign-In button with null checking
    const buttonElement = document.getElementById('google-signin-button')
    if (buttonElement) {
      window.google.accounts.id.renderButton(
        buttonElement,
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: '100%',
          logo_alignment: 'left'
        }
      )
    }
    
    isGoogleLoaded.value = true
  }
}

const handleGoogleSignInSuccess = async (response: any) => {
  try {
    loading.value = true
    clearErrors()
    
    console.log('Google Sign-In response received:', response)
    
    // Parse the JWT token to get user info
    const profile = parseJwt(response.credential)
    
    console.log('Google Sign-In successful:', profile)
    
    // Check if email already exists before proceeding
    if (profile.email) {
      try {
        console.log('Checking if email already exists:', profile.email)
        const emailCheckResponse = await apiService.checkEmailExists(profile.email)
        
        if (emailCheckResponse.success && emailCheckResponse.data && emailCheckResponse.data.exists) {
          // Email already exists - show login option instead
          console.log('Email already exists, showing login option')
          isGoogleSignInUser.value = true
          formData.fullName = profile.name || ''
          formData.email = profile.email || ''
          
          // Set a flag to show login option in step 2
          showLoginOption.value = true
          
          // Move to step 2 to show login option
          if (currentStep.value === 1) {
            nextStep()
          }
          
          return
        }
      } catch (emailCheckError) {
        console.error('Error checking email existence:', emailCheckError)
        // Continue with signup if email check fails
      }
    }
    
    // Email doesn't exist or check failed - proceed with normal signup
    console.log('Email is new, proceeding with signup')
    
    // Set Google Sign-In user flag
    isGoogleSignInUser.value = true
    
    // Auto-fill the form with Google data
    formData.fullName = profile.name || ''
    formData.email = profile.email || ''
    
    // For Google Sign-In users, we'll prompt for phone number in step 2
    // Don't generate temporary phone number - let user enter real one
    
    // If we're on step 1, move to step 2
    if (currentStep.value === 1) {
      nextStep()
    }
    
    // Show success message
    console.log('Google Sign-In completed successfully!')
    
  } catch (error: any) {
    console.error('Google Sign-In error:', error)
    
    // Handle specific Google OAuth errors
    if (error.error === 'origin_mismatch') {
      handleApiError({
        message: 'Google Sign-In configuration error. Please contact support.',
        errors: {}
      })
    } else if (error.error === 'popup_closed_by_user') {
      // User closed the popup, don't show error
      console.log('User closed Google Sign-In popup')
    } else if (error.error === 'access_denied') {
      handleApiError({
        message: 'Google Sign-In was denied. Please try again.',
        errors: {}
      })
    } else if (error.error === 'invalid_client') {
      handleApiError({
        message: 'Google Sign-In configuration error. Please contact support.',
        errors: {}
      })
    } else {
      handleApiError({
        message: 'Google Sign-In failed. Please try again.',
        errors: {}
      })
    }
  } finally {
    loading.value = false
  }
}

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error parsing JWT:', error)
    return {}
  }
}

// Load Google Sign-In script
const loadGoogleSignInScript = () => {
  console.log('Loading Google Sign-In script...')
  
  if (typeof window !== 'undefined' && !window.google) {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log('Google Sign-In script loaded successfully')
      initializeGoogleSignIn()
    }
    script.onerror = (error) => {
      console.error('Failed to load Google Sign-In script:', error)
      handleApiError({
        message: 'Failed to load Google Sign-In. Please refresh the page and try again.',
        errors: {}
      })
    }
    document.head.appendChild(script)
  } else if (window.google) {
    console.log('Google Sign-In already available')
    initializeGoogleSignIn()
  } else {
    console.error('Window object not available')
  }
}

// Fetch banks list from API
const fetchBanksList = async () => {
  try {
    banksLoading.value = true
    banksError.value = ''
    
    console.log('=== FRONTEND FETCH BANKS LIST START ===')
    const response = await apiService.getBanksList()
    console.log('Raw banks list response:', response)
    
    if (response.success && response.data?.banks) {
      banksList.value = response.data.banks.map((bank: any) => bank.name)
      console.log('Banks list loaded successfully:', banksList.value.length, 'banks')
      console.log('Banks list:', banksList.value)
    } else {
      banksError.value = response.message || 'Failed to load banks list'
      console.error('Failed to load banks list:', response)
      console.error('Response structure:', {
        success: response.success,
        data: response.data,
        message: response.message
      })
    }
    console.log('=== FRONTEND FETCH BANKS LIST END ===')
  } catch (error) {
    banksError.value = 'Network error while loading banks list'
    console.error('Error fetching banks list:', error)
  } finally {
    banksLoading.value = false
  }
}

// Initialize Google Sign-In when component mounts
onMounted(() => {
  loadGoogleSignInScript()
  fetchBanksList() // Fetch banks list when component mounts
})

// Demo data auto-fill - REMOVED to prevent overwriting user data
// const autoFillDemoData = () => {
//   if (currentStep.value === 2) {
//     formData.fullName = 'John Doe'
//     formData.email = 'john.doe@example.com'
//     formData.brandName = 'Demo Brand'
//     formData.password = 'password123'
//     formData.confirmPassword = 'password123'
//   }
// }

// Watch for step changes - REMOVED to prevent auto-filling demo data
// watch(currentStep, autoFillDemoData)

// Function to clear errors
const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  generalError.value = ''
  showLoginOption.value = false
}

// Function to clear specific field error
const clearFieldError = (fieldName: string) => {
  if (errors[fieldName]) {
    errors[fieldName] = ''
  }
  // Clear login option when email field error is cleared
  if (fieldName === 'email') {
    showLoginOption.value = false
  }
}

// Function to handle API errors
const handleApiError = (error: any) => {
  console.error('API Error:', error)
  
  // Clear previous errors
  clearErrors()
  
  if (error.errors) {
    // Handle field-specific errors
    Object.keys(error.errors).forEach(field => {
      const fieldErrors = error.errors[field]
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        // Map backend field names to frontend field names
        const fieldMapping: Record<string, string> = {
          'fullName': 'fullName',
          'email': 'email',
          'phone': 'phone',
          'password': 'password',
          'confirmPassword': 'confirmPassword',
          'aadhaar_number': 'aadhaarNumber',
          'gst_number': 'gstNumber',
          'pan_number': 'panNumber',
          'beneficiary_name': 'beneficiaryName',
          'bank_name': 'bankName',
          'account_number': 'accountNumber',
          'ifsc_code': 'ifscCode',
          'gst_address': 'gstAddress',
          'gst_pincode': 'gstPincode',
          'entity_type': 'entityType',
          'entity_name': 'entityName',
          'billing_address': 'billingAddress',
          'pan_pincode': 'panPincode',
          'branch_name': 'branchName'
        }
        
        const frontendField = fieldMapping[field] || field
        errors[frontendField] = fieldErrors[0] // Show first error message
        
        // Log the error mapping for debugging
        console.log(`Backend field "${field}" mapped to frontend field "${frontendField}" with error: "${fieldErrors[0]}"`)
      }
    })
  }
  
  // Set general error message
  if (error.message) {
    // Check if it's a generic validation failed message and we have email-related errors
    if (error.message === 'Validation failed' && error.errors) {
      // Check if there are email-related errors
      const hasEmailError = Object.keys(error.errors).some(field => 
        field.toLowerCase().includes('email') || 
        (Array.isArray(error.errors[field]) && 
         error.errors[field].some((msg: string) => 
           msg.toLowerCase().includes('email') || 
           msg.toLowerCase().includes('already') || 
           msg.toLowerCase().includes('taken')
         ))
      )
      
      if (hasEmailError) {
        generalError.value = '⚠️ This email is already registered with Vamaship. Please use a different email address or try logging in instead.'
      } else {
        generalError.value = error.message
      }
    } else {
      generalError.value = error.message
    }
  } else {
    generalError.value = 'An unexpected error occurred. Please try again.'
  }
  
  // Log all errors for debugging
  console.log('All field errors:', errors)
  console.log('General error:', generalError.value)
}

const handleBankSelection = () => {
  // Check if "Other" is selected
  if (formData.bankName === 'other') {
    isOtherBank.value = true
    formData.bankName = '' // Clear the value so user can enter custom bank name
  } else {
    isOtherBank.value = false
  }
  console.log('Bank selection changed:', formData.bankName)
}

const resetBankSelection = () => {
  isOtherBank.value = false
  formData.bankName = '' // Clear the bank name
  console.log('Bank selection reset')
}

// Verification methods
const verifyGst = async () => {
  if (!formData.gstNumber || formData.gstNumber.trim() === '') {
    errors.gstNumber = 'Please enter a GST number to verify'
    return
  }

  if (!validateGstNumber(formData.gstNumber)) {
    return; // Error already set by validateGstNumber
  }

  gstVerifying.value = true
  clearErrors()

  try {
    const response = await apiService.validateGstPublic(formData.gstNumber)
    
    // Check if response is successful
    if (response && response.success) {
      gstVerified.value = true
      errors.gstNumber = ''
      console.log('GST verification successful')
    } else {
      gstVerified.value = false
      errors.gstNumber = response?.message || 'GST verification failed. Please check the number and try again.'
      console.error('GST verification failed')
    }
  } catch (error: any) {
    gstVerified.value = false
    errors.gstNumber = 'Network error during GST verification. Please try again.'
    console.error('GST verification error:', error)
  } finally {
    gstVerifying.value = false
  }
}

const verifyPan = async () => {
  if (!formData.panNumber || formData.panNumber.trim() === '') {
    errors.panNumber = 'Please enter a PAN number to verify'
    return
  }

  if (!validatePanNumber(formData.panNumber)) {
    return
  }

  panVerifying.value = true
  clearErrors()

  try {
    const response = await apiService.validatePanPublic(formData.panNumber)
    
    // Check if response is successful
    if (response && response.success) {
      panVerified.value = true
      errors.panNumber = ''
      console.log('PAN verification successful')
    } else {
      panVerified.value = false
      errors.panNumber = response?.message || 'PAN verification failed. Please check the number and try again.'
      console.error('PAN verification failed')
    }
  } catch (error: any) {
    panVerified.value = false
    errors.panNumber = 'Network error during PAN verification. Please try again.'
    console.error('PAN verification error:', error)
  } finally {
    panVerifying.value = false
  }
}

const verifyBank = async () => {
  console.log('=== VERIFY BANK FUNCTION CALLED ===')
  console.log('Current counter:', bankValidationAttempts.value)
  
  // Check if attempts are exhausted
  if (bankValidationAttempts.value >= maxBankValidationAttempts) {
    bankAttemptsExhausted.value = true
    errors.accountNumber = 'Contact Sales Team at sales@vamaship.com'
    errors.ifscCode = 'Contact Sales Team at sales@vamaship.com'
    return
  }
  
  // Increment attempt counter for all validation attempts (including format failures)
  bankValidationAttempts.value++
  console.log(`Counter incremented to: ${bankValidationAttempts.value}/${maxBankValidationAttempts}`)

  const remainingAttempts = maxBankValidationAttempts - bankValidationAttempts.value; // Defined here for all error messages

  if (!formData.accountNumber || formData.accountNumber.trim() === '') {
    errors.accountNumber = `Please enter an account number to verify. (${remainingAttempts} attempts remaining)`
    return
  }

  if (!formData.ifscCode || formData.ifscCode.trim() === '') {
    errors.ifscCode = `Please enter an IFSC code to verify. (${remainingAttempts} attempts remaining)`
    return
  }

  // Basic IFSC format validation - IFSC codes are 11 characters: 4 letters + 7 alphanumeric
  const ifscPattern = /^[A-Z]{4}[0-9A-Z]{7}$/
  if (!ifscPattern.test(formData.ifscCode)) {
    errors.ifscCode = `Please enter a valid IFSC code format (e.g., HDFC0001234). (${remainingAttempts} attempts remaining)`
    return
  }

  bankVerifying.value = true
  clearErrors()

  try {
    console.log(`Starting bank verification (attempt ${bankValidationAttempts.value}/${maxBankValidationAttempts}) for:`, { accountNumber: formData.accountNumber, ifscCode: formData.ifscCode })
    const response = await apiService.validateBankPublic(formData.accountNumber, formData.ifscCode)
    console.log('Bank verification response:', response)
    
    // Check if response is successful
    if (response && response.success) {
      bankVerified.value = true
      errors.accountNumber = ''
      errors.ifscCode = ''
      console.log('Bank verification successful')
    } else {
      bankVerified.value = false
      const errorMessage = response?.message || `Bank verification failed. Please check the account number and IFSC code. (${remainingAttempts} attempts remaining)`
      errors.accountNumber = errorMessage
      errors.ifscCode = errorMessage
      console.log('Bank verification failed:', response)
    }
  } catch (error: any) {
    bankVerified.value = false
    const errorMessage = `Network error during bank verification. Please try again. (${remainingAttempts} attempts remaining)`
    errors.accountNumber = errorMessage
    errors.ifscCode = errorMessage
    console.error('Bank verification error:', error)
  } finally {
    bankVerifying.value = false
  }
}

// Add email validation function
const validateEmailExists = async (email: string) => {
  console.log('=== EMAIL VALIDATION START ===')
  console.log('Validating email:', email)
  
  if (!email || email.trim() === '') {
    console.log('Email is empty, clearing error')
    errors.email = ''
    // Clear network errors when email is empty
    if (generalError.value && generalError.value.includes('Network error')) {
      generalError.value = ''
    }
    return
  }

  // Basic email format validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    console.log('Invalid email format')
    errors.email = 'Please enter a valid email address'
    // Clear network errors when email format is invalid
    if (generalError.value && generalError.value.includes('Network error')) {
      generalError.value = ''
    }
    return
  }

  // Clear previous error
  console.log('Clearing previous email error')
  errors.email = ''

  try {
    console.log('Calling API to check if email exists...')
    // Call backend to check if email exists
    const response = await apiService.checkEmailExists(email)
    console.log('API response:', response)
    
    if (response.success && response.data?.exists) {
      console.log('Email exists, setting error and login option')
      errors.email = '⚠️ This email is already registered. Please use a different email address or try logging in instead.'
      // Set login option flag to show login option in both Step 2 and Step 3
      showLoginOption.value = true
    } else {
      console.log('Email is available')
      // Clear any previous general error if email is now valid
      if (generalError.value && (generalError.value.includes('email') || generalError.value.includes('already registered') || generalError.value.includes('Network error'))) {
        generalError.value = ''
      }
      // Clear login option flag when email is available
      showLoginOption.value = false
    }
  } catch (error: any) {
    // Show network error to user
    console.error('Email validation check failed:', error)
    
    // Check if it's a backend validation error (422 status)
    if (error.response?.status === 422 && error.response?.data?.errors?.email) {
      const backendError = error.response.data.errors.email[0]
      console.log('Backend validation error:', backendError)
      
      if (backendError.includes('already been taken')) {
        errors.email = '⚠️ This email is already registered. Please use a different email address or try logging in instead.'
        generalError.value = 'This email address is already registered with Vamaship. Please use a different email or try logging in instead.'
        // Set login option flag for backend validation errors too
        showLoginOption.value = true
      } else {
        errors.email = backendError
      }
    } else {
      // Network error
      errors.email = 'Network error occurred. Please check your connection and try again.'
      generalError.value = 'Network error occurred. Please check your connection and try again.'
    }
  }
  
  console.log('=== EMAIL VALIDATION END ===')
}



// Debounced email validation
let emailValidationTimeout: number | null = null
const debouncedEmailValidation = (email: string) => {
  console.log('=== DEBOUNCED EMAIL VALIDATION ===')
  console.log('Email input changed:', email)
  
  if (emailValidationTimeout) {
    console.log('Clearing previous timeout')
    clearTimeout(emailValidationTimeout)
  }
  
  console.log('Setting new timeout for 500ms')
  emailValidationTimeout = setTimeout(() => {
    console.log('Timeout triggered, calling validateEmailExists')
    validateEmailExists(email)
  }, 500) // Wait 500ms after user stops typing
}

// PAN validation function
const validatePanNumber = (panNumber: string) => {
  // Clear previous error
  errors.panNumber = ''
  
  if (!panNumber || panNumber.trim() === '') {
    return false
  }
  
  // Remove any spaces
  const cleanPan = panNumber.replace(/\s/g, '').toUpperCase()
  
  // Check if it's exactly 10 characters
  if (cleanPan.length !== 10) {
    errors.panNumber = 'PAN number must be exactly 10 characters'
    return false
  }
  
  // Check PAN format: 5 letters + 4 digits + 1 letter
  const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  if (!panPattern.test(cleanPan)) {
    errors.panNumber = 'Please enter a valid PAN number format (e.g., ABCDE1234F)'
    return false
  }
  
  // Update the form data with cleaned PAN
  formData.panNumber = cleanPan
  return true
}

// Track Order Section
const trackType = ref('awb')
const trackingNumber = ref('')
const trackingLoading = ref(false)
const trackingResult = ref<any>(null)
const trackingError = ref<string | null>(null)

const trackingPlaceholder = computed(() => {
  switch (trackType.value) {
    case 'awb':
      return 'Enter AWB numbers here to track your shipment'
    case 'shipment':
      return 'Enter shipment numbers here to track your shipment'
    case 'order':
      return 'Enter order numbers here to track your shipment'
    default:
      return 'Enter tracking numbers here'
  }
})

const switchTrackType = (type: string) => {
  trackType.value = type
  trackingNumber.value = ''
  trackingResult.value = null
  trackingError.value = null
}

const trackOrder = async () => {
  if (!trackingNumber.value.trim()) {
    trackingError.value = 'Please enter a tracking number'
    return
  }
  
  trackingLoading.value = true
  trackingError.value = null
  trackingResult.value = null
  
  try {
    const trackingIds = trackingNumber.value.split(',').map(id => id.trim()).filter(id => id)
    
    let response
    switch (trackType.value) {
      case 'awb':
        response = await trackingAPI.trackByAwb(trackingIds)
        break
      case 'shipment':
        response = await trackingAPI.trackByShipment(trackingIds)
        break
      case 'order':
        response = await trackingAPI.trackByReference(trackingIds)
        break
      default:
        response = await trackingAPI.trackByAwb(trackingIds)
    }
    
    if (response.success) {
      trackingResult.value = response.data.tracking_details
    } else {
      trackingError.value = response.message || 'Failed to track shipment'
    }
  } catch (error: any) {
    console.error('Tracking error:', error)
    trackingError.value = error.message || 'Network error occurred while tracking'
  } finally {
    trackingLoading.value = false
  }
}

const logNetworkError = () => {
  console.error('Network error:', generalError.value)
  alert('Network error occurred. Please check the console for more details.')
}

// Validation functions

// Function to reset bank validation attempts when bank details change
const resetBankValidationAttempts = () => {
  // Reset counter when user changes bank details
  if (bankValidationAttempts.value > 0) {
    bankValidationAttempts.value = 0
    bankCounterReset.value = true
    bankAttemptsExhausted.value = false // Reset exhausted state
    console.log('Bank details changed - Counter reset to 0')
    
    // Clear the reset flag after a short delay
    setTimeout(() => {
      bankCounterReset.value = false
    }, 2000)
  }
  
  // Hide bank verification success message when bank details change
  if (bankVerified.value) {
    bankVerified.value = false
    console.log('Bank details changed - Hiding verification success message')
  }
  
  errors.accountNumber = ''
  errors.ifscCode = ''
}

// Add email validation function
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Bar - Show only on first step -->
    <nav v-if="currentStep === 1" class="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center">
            <img src="/images/logo-blue.png" alt="Vamaship" style="width: 140px; height: 70px; object-fit: contain;" />
          </div>
          
          <!-- Navigation Buttons -->
          <div class="flex items-center space-x-4">
            <button
              @click="router.push('/sign-in')"
              class="px-4 py-2 text-white rounded-md hover:opacity-90 font-medium transition-colors"
              style="background-color: #6A5ACD;"
            >
              Login
            </button>
            <button
              @click="router.push('/sign-up')"
              class="px-4 py-2 text-white rounded-md hover:opacity-90 font-medium transition-colors"
              style="background-color: #6A5ACD;"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Dashboard Background for Steps 2 & 3 -->
    <div v-if="currentStep > 1" class="fixed inset-0 bg-cover bg-no-repeat pointer-events-none" style="background-image: url('/img/background-image.png?v=5'); background-position: center 30%;">
      <!-- Dark Blue Blur Overlay -->
      <div class="absolute inset-0 bg-blue-900 bg-opacity-30"></div>
    </div>

    <!-- Signup Form Container -->
    <div class="relative z-10 pt-20">
      <!-- Step 1: Phone & OTP -->
      <div v-if="currentStep === 1" class="min-h-screen relative gradient-bg">
        <!-- Purple hue (top-left) -->
        <div class="purple-hue"></div>
        
        <!-- Blue hue (bottom-right) -->
        <div class="blue-hue"></div>
        
        <!-- Pink hue (bottom-left) -->
        <div class="pink-hue"></div>
        
        <!-- Main Content -->
        <div class="container mx-auto py-6 px-4 relative z-[2]">
          <div class="max-w-6xl mx-auto">
            <!-- Two Column Layout -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              
              <!-- Left Column: Content -->
              <div class="space-y-8">
                <!-- Logo (hidden since it's in navbar) -->
                <div class="hidden">
                  <img src="/images/logo-blue.png" alt="Vamaship" style="width: 140px; height: 70px; object-fit: contain;" />
                </div>
                
                <!-- Main Heading -->
                <div class="space-y-2">
                  <h1 class="text-5xl font-bold leading-tight pb-2" style="background: linear-gradient(135deg, #293773 0%, #6A5ACD 50%, #6A5ACD 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    Start Shipping Smarter
                  </h1>
                  <p class="text-2xl text-gray-900 font-medium">
                    — in Just a Few Steps
                  </p>
                </div>

                <!-- Trusted Brands -->
                <div class="space-y-6">
                  <h3 class="text-lg font-semibold text-gray-900">Trusted by 5000+ Brands</h3>
                  <div class="grid grid-cols-4 gap-4 opacity-60">
                    <!-- Numbered brand logos -->
                    <div class="h-12 w-32 bg-gray-50 rounded flex items-center justify-center p-2">
                      <img src="/images/brands/1.png" alt="Brand 1" class="h-8 w-auto object-contain" />
                    </div>
                    <div class="h-12 w-32 bg-gray-50 rounded flex items-center justify-center p-2">
                      <img src="/images/brands/2.png" alt="Brand 2" class="h-8 w-auto object-contain" />
                    </div>
                    <div class="h-12 w-32 bg-gray-50 rounded flex items-center justify-center p-2">
                      <img src="/images/brands/3.png" alt="Brand 3" class="h-8 w-auto object-contain" />
                    </div>
                    <div class="h-12 w-32 bg-gray-50 rounded flex items-center justify-center p-2">
                      <img src="/images/brands/4.png" alt="Brand 4" class="h-8 w-auto object-contain" />
                    </div>
                    <div class="h-12 w-32 bg-gray-50 rounded flex items-center justify-center p-2">
                      <img src="/images/brands/5.png" alt="Brand 5" class="h-8 w-auto object-contain" />
                    </div>
                    <div class="h-12 w-32 bg-gray-50 rounded flex items-center justify-center p-2">
                      <img src="/images/brands/6.png" alt="Brand 6" class="h-8 w-auto object-contain" />
                    </div>
                    <div class="h-12 w-32 bg-gray-50 rounded flex items-center justify-center p-2">
                      <img src="/images/brands/7.png" alt="Brand 7" class="h-8 w-auto object-contain" />
                    </div>
                    <div class="h-12 w-32 bg-gray-50 rounded flex items-center justify-center p-2">
                      <img src="/images/brands/8.png" alt="Brand 8" class="h-8 w-auto object-contain" />
                    </div>
                  </div>
                </div>

                <!-- Benefits Card -->
                <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
                  <h3 class="font-semibold text-gray-900 mb-4">Why choose Vamaship?</h3>
                  <div class="space-y-3 text-sm text-gray-700">
                    <div class="flex items-center">
                      <i class="fas fa-check text-green-500 mr-3"></i>
                      <span>Multi-courier aggregation</span>
                    </div>
                    <div class="flex items-center">
                      <i class="fas fa-check text-green-500 mr-3"></i>
                      <span>Dedicated Customer Support</span>
                    </div>
                    <div class="flex items-center">
                      <i class="fas fa-check text-green-500 mr-3"></i>
                      <span>No technical setup required</span>
                    </div>
                    <div class="flex items-center">
                      <i class="fas fa-check text-green-500 mr-3"></i>
                      <span>Branded tracking pages</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Signup Form -->
              <div class="lg:pl-8">
                <!-- Step 1: Phone & OTP -->
                <div class="bg-white rounded-lg p-8 shadow-lg mt-8 max-w-md mx-auto lg:ml-auto">
                  <h2 class="text-xl font-semibold text-gray-900 mb-6 text-center">Start your seller account</h2>
                  
                  <div class="space-y-3 max-w-sm mx-auto">
                    <div>
                      <div class="relative">
                        <input 
                          v-model="formData.phone"
                          @input="(event) => { 
                            formData.phone = validatePhone((event.target as HTMLInputElement).value);
                            resetMobileRegistrationFlag();
                          }"
                          type="tel" 
                          placeholder="Enter Phone Number" 
                          class="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                          maxlength="10"
                        />
                        <div class="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                          <span class="text-gray-600 font-medium">+91</span>
                          <span class="text-gray-400 mx-3">|</span>
                        </div>
                      </div>
                      <p class="text-xs text-gray-500 mt-1">We'll send a verification code to this number</p>
                    </div>
                    
                    <!-- Mobile Already Registered Message -->
                    <div v-if="isMobileAlreadyRegistered" class="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg">
                      <div class="text-center">
                        <p class="text-blue-800 mb-2 text-sm">
                          The mobile number <strong class="text-blue-900">{{ formData.phone }}</strong> is already registered with Vamaship.
                        </p>
                        <button
                          @click="goToSignIn"
                          class="inline-flex items-center px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <i class="fas fa-sign-in-alt mr-1.5 text-xs"></i>
                          Login Here
                        </button>
                        <p class="text-xs text-blue-600 mt-1">
                          Your mobile will be pre-filled automatically
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      v-if="!otpSent && !isMobileAlreadyRegistered"
                      @click="() => { console.log('Send OTP button clicked'); sendOtp(); }"
                      :disabled="formData.phone.length !== 10 || loading"
                      class="w-full text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center"
                      :style="{ 'background-color': (formData.phone.length !== 10 || loading) ? '#9CA3AF' : '#6A5ACD' }"
                    >
                      <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ loading ? 'Sending...' : 'Send OTP' }}
                    </button>
                    
                    <!-- General Error Display -->
                    <div v-if="generalError" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div class="flex items-center">
                        <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                        <span class="text-red-700 text-sm font-medium">{{ generalError }}</span>
                      </div>
                    </div>
                    
                    <!-- Phone Error Display -->
                    <div v-if="errors.phone" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div class="flex items-center">
                        <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                        <span class="text-red-700 text-sm font-medium">{{ errors.phone }}</span>
                      </div>
                    </div>
                  </div>

                  <div v-if="otpSent && !isMobileAlreadyRegistered" class="mt-4 pt-4 border-t max-w-sm mx-auto">
                    <div class="mb-3">
                      <label class="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                      <div class="flex space-x-2">
                        <input 
                          v-for="(input, index) in otpInputs" 
                          :key="index"
                          v-model="input.value"
                          @input="handleOtpInput(index, ($event.target as HTMLInputElement).value)"
                          @keydown="handleOtpKeydown(index, $event)"
                          type="text" 
                          class="w-12 h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                          maxlength="1"
                          :data-otp-index="index"
                        />
                      </div>                      
                      <!-- OTP Error Message -->
                      <div v-if="errors.otp" class="mt-2 text-center">
                        <p class="text-xs text-red-600 font-medium">
                          <i class="fas fa-exclamation-circle mr-1"></i>
                          {{ errors.otp }}
                        </p>
                      </div>
                      
                      <!-- OTP Countdown Timer -->
                      <div v-if="otpCooldown > 0" class="mt-2 text-center">
                        <p class="text-xs text-gray-600">
                          Resend OTP in <span class="font-mono text-blue-600 font-semibold">{{ formatOtpTime(otpCooldown) }}</span>
                        </p>
                      </div>
                      
                      <!-- Resend OTP Button -->
                      <div v-if="otpCooldown === 0" class="mt-2 text-center">
                        <button
                          @click="resendOtp"
                          class="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                        >
                          Resend OTP
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      @click="verifyOtp"
                      :disabled="!isOtpComplete"
                      class="w-full text-white py-3 rounded-lg font-medium transition-all"
                      :style="{ 'background-color': !isOtpComplete ? '#9CA3AF' : '#6A5ACD' }"
                    >
                      Verify & Continue
                    </button>
                    
                    <p class="text-xs text-gray-500 mt-3 text-center">By clicking on Continue, I agree to Vamaship's <a href="https://www.vamaship.com/terms-conditions" class="text-blue-600 hover:underline" target="_blank">Terms & Conditions</a> and <a href="https://www.vamaship.com/privacy-policy" class="text-blue-600 hover:underline" target="_blank">Privacy Policy</a>.</p>
                  </div>

                  <!-- Divider -->
                  <div class="flex items-center my-4 max-w-sm mx-auto">
                    <div class="flex-1 h-px bg-gray-300"></div>
                    <span class="px-3 text-sm text-gray-500">or</span>
                    <div class="flex-1 h-px bg-gray-300"></div>
                  </div>

                  <!-- Google Sign In -->
                  <div id="google-signin-button" class="w-full max-w-sm mx-auto"></div>
                  <!-- Fallback button if Google Sign-In fails to load -->
                  <button 
                    v-if="!isGoogleLoaded" 
                    @click="loadGoogleSignInScript"
                    class="w-full max-w-sm mx-auto flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg class="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span class="text-gray-700 font-medium">Continue with Google</span>
                  </button>
                </div>

                <!-- Track Order Section -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                  <div class="rounded-lg p-4 max-w-md mx-auto" style="background-color: #F0F0FF;">
                    <h4 class="text-lg font-medium text-gray-700 mb-4 text-center">Track Your Order</h4>
                    
                    <div class="max-w-sm mx-auto space-y-3">
                      <!-- Tracking Type Toggle -->
                      <div class="flex justify-center">
                        <div class="flex bg-white rounded-lg p-1 shadow-sm w-full">
                          <button 
                            @click="switchTrackType('awb')"
                            :class="[
                              'track-type-btn flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                              trackType === 'awb' ? 'active' : ''
                            ]"
                          >
                            AWB
                          </button>
                          <button 
                            @click="switchTrackType('shipment')"
                            :class="[
                              'track-type-btn flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                              trackType === 'shipment' ? 'active' : ''
                            ]"
                          >
                            Shipment
                          </button>
                          <button 
                            @click="switchTrackType('order')"
                            :class="[
                              'track-type-btn flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                              trackType === 'order' ? 'active' : ''
                            ]"
                          >
                            Order ID
                          </button>
                        </div>
                      </div>
                      
                      <!-- Tracking Input -->
                      <input 
                        v-model="trackingNumber"
                        type="text" 
                        :placeholder="trackingPlaceholder"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                      >
                      <p class="text-xs text-gray-500 mt-1">Note: You can enter multiple Tracking IDs (upto 20) separated by ',' for tracking multiple shipments.</p>
                      
                      <!-- Track Button -->
                      <button 
                        @click="trackOrder"
                        :disabled="!trackingNumber || trackingLoading"
                        class="w-full px-4 py-2 text-white rounded-lg font-medium transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center" 
                        :style="{ 'background-color': trackingNumber && !trackingLoading ? '#5060A3' : '#9CA3AF' }"
                      >
                        <span v-if="trackingLoading" class="mr-2">
                          <i class="fas fa-spinner fa-spin"></i>
                        </span>
                        {{ trackingLoading ? 'Tracking...' : 'Track Order' }}
                      </button>
                      
                      <!-- Tracking Error -->
                      <div v-if="trackingError" class="mt-2 text-center">
                        <p class="text-xs text-red-600 font-medium">
                          <i class="fas fa-exclamation-circle mr-1"></i>
                          {{ trackingError }}
                        </p>
                      </div>
                      
                      <!-- Tracking Results -->
                      <div v-if="trackingResult && Object.keys(trackingResult).length > 0" class="mt-4">
                        <div class="bg-white rounded-lg p-3 border border-gray-200">
                          <h5 class="text-sm font-semibold text-gray-800 mb-2">Tracking Results</h5>
                          <div class="space-y-2 max-h-40 overflow-y-auto">
                            <div v-for="(result, trackingId) in trackingResult" :key="trackingId" class="text-xs">
                              <div class="font-medium text-gray-700">{{ trackingId }}</div>
                              <div v-if="result.success" class="text-green-600">
                                <div class="font-medium">{{ result.tracking_status || 'In Transit' }}</div>
                                <div v-if="result.trackingEvents && result.trackingEvents.length > 0" class="mt-1">
                                  <div class="text-gray-600">
                                    Latest: {{ result.trackingEvents[0].status }}
                                  </div>
                                  <div class="text-gray-500">
                                    {{ result.trackingEvents[0].datetime }}
                                  </div>
                                </div>
                              </div>
                              <div v-else class="text-red-600">
                                {{ result.message || 'Not found' }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: User Details -->
      <div v-if="currentStep === 2" class="min-h-screen flex items-center justify-center p-4 lg:p-8">
        <div class="w-full max-w-md lg:max-w-lg">
          <div class="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 lg:p-8">
            <!-- Progress Steps -->
            <div class="flex items-center justify-center mb-6 lg:mb-8">
              <div class="flex items-center space-x-2 lg:space-x-4">
                <div class="flex items-center">
                  <div class="w-6 h-6 lg:w-8 lg:h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-sm lg:text-base">
                    <i class="fas fa-check text-xs lg:text-sm"></i>
                  </div>
                  <div class="ml-2 text-xs lg:text-sm font-medium text-gray-900">Phone</div>
                </div>
                <div class="w-8 lg:w-12 h-0.5 bg-green-600"></div>
                <div class="flex items-center">
                  <div class="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm lg:text-base">2</div>
                  <div class="ml-2 text-xs lg:text-sm font-medium text-gray-900">Details</div>
                </div>
                <div class="w-8 lg:w-12 h-0.5 bg-gray-300"></div>
                <div class="flex items-center">
                  <div class="w-6 h-6 lg:w-8 lg:h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold text-sm lg:text-base">3</div>
                  <div class="ml-2 text-xs lg:text-sm font-medium text-gray-500">KYC</div>
                </div>
              </div>
            </div>

            <!-- Step 2 Header -->
            <div class="text-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Complete your profile</h2>
              <p class="text-gray-600">Fill in your details to create your Vamaship account</p>
            </div>



            <!-- General Error Banner -->
            <div v-if="generalError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div class="flex items-start">
                <i class="fas fa-exclamation-circle text-red-500 mr-3 mt-0.5"></i>
                <div class="flex-1">
                  <span class="text-red-700 text-sm font-medium">{{ generalError }}</span>
                  <!-- Show dismiss button for network errors -->
                  <div v-if="generalError.includes('Network error')" class="mt-3">
                    <div class="flex space-x-2">
                      <button
                        @click="logNetworkError"
                        class="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <i class="fas fa-bug mr-1"></i>
                        Log
                      </button>
                      <button
                        @click="generalError = ''"
                        class="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-md hover:bg-gray-700 transition-colors"
                      >
                        <i class="fas fa-times mr-1"></i>
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Login Option for Existing Users -->
            <div v-if="showLoginOption" class="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg">
              <div class="text-center">
                <p class="text-blue-800 mb-2 text-sm">
                  The email <strong class="text-blue-900">{{ formData.email }}</strong> is already registered with Vamaship.
                </p>
                <button
                  @click="goToSignIn"
                  class="inline-flex items-center px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                >
                  <i class="fas fa-sign-in-alt mr-1.5 text-xs"></i>
                  Login Here
                </button>
                <p class="text-xs text-blue-600 mt-1">
                  Your email will be pre-filled automatically
                </p>
              </div>
            </div>

            <!-- Form Fields -->
            <div class="space-y-3 lg:space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  v-model="formData.fullName"
                  @input="(e) => { clearFieldError('fullName'); validateFullName((e.target as HTMLInputElement).value); }"
                  @blur="validateFullName(formData.fullName)"
                  @keyup.enter="nextStep"
                  type="text"
                  placeholder="Enter your full name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.fullName }"
                />
                <p v-if="errors.fullName" class="mt-1 text-sm text-red-600">{{ errors.fullName }}</p>
                <p v-else class="mt-1 text-xs text-gray-500">Please enter your complete name including first and last name</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  v-model="formData.email"
                  @input="(e) => { 
                    clearFieldError('email'); 
                    // Clear network errors when user starts typing
                    if (generalError && generalError.includes('Network error')) {
                      generalError = '';
                    }
                    debouncedEmailValidation((e.target as HTMLInputElement).value); 
                  }"
                  @keyup.enter="nextStep"
                  type="email"
                  placeholder="Enter your email address"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.email }"
                />
                <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
              </div>

              <!-- Phone Number Field for Google Sign-In Users -->
              <div v-if="isGoogleSignInUser">
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number <span class="text-red-500">*</span></label>
                <div class="flex">
                  <select v-model="formData.countryCode" class="px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50">
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                  </select>
                  <input
                    v-model="formData.phone"
                    @input="formData.phone = validatePhone(($event.target as HTMLInputElement).value)"
                    @keyup.enter="nextStep"
                    type="tel"
                    placeholder="Enter your phone number"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.phone }"
                  />
                </div>
                <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
                <p class="mt-1 text-xs text-gray-500">Required for account verification and notifications</p>
                
                <!-- Phone OTP Verification for Google Sign-In Users -->
                <div v-if="formData.phone.length === 10" class="mt-4">
                  <!-- Phone Verification Success Message -->
                  <div v-if="googlePhoneVerified" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div class="flex items-center">
                      <i class="fas fa-check-circle text-green-500 mr-2"></i>
                      <span class="text-green-700 text-sm font-medium">Phone number verified successfully!</span>
                    </div>
                  </div>
                  
                  <div v-if="!googlePhoneOtpSent && !googlePhoneVerified" class="text-center">
                    <button
                      @click="sendGooglePhoneOtp"
                      :disabled="loading"
                      class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                    >
                      <span v-if="loading">Sending...</span>
                      <span v-else>Send OTP</span>
                    </button>
                  </div>
                  
                  <div v-if="googlePhoneOtpSent && !googlePhoneVerified" class="space-y-4">
                    <div class="text-center">
                      <p class="text-sm text-gray-600 mb-3">Enter the 6-digit OTP sent to {{ formData.countryCode }} {{ formData.phone }}</p>
                      
                      <!-- OTP Input Fields -->
                      <div class="flex justify-center space-x-2 mb-4">
                        <input
                          v-for="(input, index) in googlePhoneOtpInputs"
                          :key="index"
                          v-model="input.value"
                          @input="handleGooglePhoneOtpInput(index, ($event.target as HTMLInputElement).value)"
                          @keydown="handleGooglePhoneOtpKeydown(index, $event)"
                          @keyup.enter="verifyGooglePhoneOtp"
                          type="text"
                          maxlength="1"
                          :data-google-phone-otp-index="index"
                          class="w-12 h-12 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                          :class="{ 'border-red-500': errors.otp }"
                        />
                      </div>
                      
                      <!-- Verify OTP Button -->
                      <button
                        @click="verifyGooglePhoneOtp"
                        :disabled="googlePhoneOtpInputs.some(input => input.value === '') || loading"
                        class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold mb-3"
                      >
                        <span v-if="loading">Verifying...</span>
                        <span v-else>Verify OTP</span>
                      </button>
                      
                      <!-- Resend OTP -->
                      <div class="text-center">
                        <button
                          @click="resendGooglePhoneOtp"
                          :disabled="googlePhoneOtpCooldown > 0"
                          class="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          <span v-if="googlePhoneOtpCooldown > 0">
                            Resend OTP in {{ formatGooglePhoneOtpTime(googlePhoneOtpCooldown) }}
                          </span>
                          <span v-else>
                            Resend OTP
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Brand Name (Optional)</label>
                <input
                  v-model="formData.brandName"
                  @keyup.enter="nextStep"
                  type="text"
                  placeholder="Enter your brand name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <!-- Password Fields - More prominent for Google Sign-In users after phone verification -->
              <div v-if="!isGoogleSignInUser || googlePhoneVerified">
                <div v-if="isGoogleSignInUser && googlePhoneVerified" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div class="flex items-center">
                    <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                    <span class="text-blue-700 text-sm">Please create a password for your account</span>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Password <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <input
                      v-model="formData.password"
                      @input="validatePassword"
                      @keyup.enter="nextStep"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="Create a strong password"
                      class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': errors.password }"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-gray-400"></i>
                    </button>
                  </div>
                  <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
                  <p class="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <input
                      v-model="formData.confirmPassword"
                      @input="validatePassword"
                      @keyup.enter="nextStep"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      placeholder="Confirm your password"
                      class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': errors.confirmPassword, 'border-green-500': formData.password && formData.confirmPassword && formData.password === formData.confirmPassword }"
                    />
                    <button
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-gray-400"></i>
                    </button>
                  </div>
                  <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
                  <p v-else-if="formData.password && formData.confirmPassword && formData.password === formData.confirmPassword" class="mt-1 text-sm text-green-600">
                    <i class="fas fa-check-circle mr-1"></i>Passwords match
                  </p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-3 mt-6 lg:mt-8">
              <button
                @click="prevStep"
                class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-semibold"
              >
                Back
              </button>
              <button
                @click="nextStep"
                :disabled="!isStep2Valid"
                class="flex-1 text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                :style="{ 'background-color': !isStep2Valid ? '#9CA3AF' : '#6A5ACD' }"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: KYC Verification -->
      <div v-if="currentStep === 3" class="min-h-screen flex items-center justify-center p-4 lg:p-8">
        <div class="w-full max-w-md lg:max-w-4xl">
          <div class="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 lg:p-8">
            <!-- Progress Steps -->
            <div class="flex items-center justify-center mb-6 lg:mb-8">
              <div class="flex items-center space-x-2 lg:space-x-4">
                <div class="flex items-center">
                  <div class="w-6 h-6 lg:w-8 lg:h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-sm lg:text-base">
                    <i class="fas fa-check text-xs lg:text-sm"></i>
                  </div>
                  <div class="ml-2 text-xs lg:text-sm font-medium text-gray-900">Phone</div>
                </div>
                <div class="w-8 lg:w-12 h-0.5 bg-green-600"></div>
                <div class="flex items-center">
                  <div class="w-6 h-6 lg:w-8 lg:h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-sm lg:text-base">
                    <i class="fas fa-check text-xs lg:text-sm"></i>
                  </div>
                  <div class="ml-2 text-xs lg:text-sm font-medium text-gray-900">Details</div>
                </div>
                <div class="w-8 lg:w-12 h-0.5 bg-blue-600"></div>
                <div class="flex items-center">
                  <div class="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm lg:text-base">3</div>
                  <div class="ml-2 text-xs lg:text-sm font-medium text-gray-900">KYC</div>
                </div>
              </div>
            </div>



            <!-- Business Verification Header -->
            <div class="text-center mb-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Business Verification</h2>
              <p class="text-gray-600">Complete KYC to enable COD and unlock advanced features. You can skip this for now.</p>
            </div>

            <!-- General Error Banner -->
            <div v-if="generalError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div class="flex items-center">
                <i class="fas fa-exclamation-circle text-red-500 mr-3"></i>
                <span class="text-red-700 text-sm font-medium">{{ generalError }}</span>
              </div>
            </div>

            <!-- Login Option for Existing Users in Step 3 -->
            <div v-if="showLoginOption" class="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg shadow-lg">
              <div class="text-center">
                <div class="flex items-center justify-center mb-4">
                  <i class="fas fa-exclamation-triangle text-orange-500 text-3xl mr-3"></i>
                  <h3 class="text-xl font-bold text-blue-900">Email Already Registered!</h3>
                </div>
                <p class="text-blue-800 mb-4 text-lg">
                  The email <strong class="text-blue-900">{{ formData.email }}</strong> is already registered with Vamaship.
                </p>
                <button
                  @click="goToSignIn"
                  class="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <i class="fas fa-sign-in-alt mr-3 text-lg"></i>
                  Login Here
                </button>
                <p class="text-xs text-blue-600 mt-3">
                  Your email will be pre-filled automatically
                </p>
              </div>
            </div>

            <form v-if="!showLoginOption" @submit.prevent="completeSignup" class="space-y-6">
              <!-- Aadhaar Section -->
              <div class="border border-gray-200 rounded-lg p-6">
                <button
                  type="button"
                  @click="toggleAadhaarSection"
                  class="w-full flex items-center justify-between text-left"
                >
                  <div class="flex items-center">
                    <i class="fas fa-id-card text-blue-600 mr-3"></i>
                    <span class="font-semibold text-gray-900">Aadhaar Verification</span>
                    <span v-if="aadhaarVerified" class="ml-2 text-green-600">
                      <i class="fas fa-check-circle"></i>
                    </span>
                  </div>
                  <i :class="showAadhaarSection ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-gray-400"></i>
                </button>
                
                <!-- Show verification success message -->
                <div v-if="aadhaarVerified && !showAadhaarSection" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div class="flex items-center text-green-700">
                    <i class="fas fa-check-circle mr-2"></i>
                    <span>Aadhaar verification completed successfully!</span>
                  </div>
                </div>
                
                <div v-if="showAadhaarSection && !aadhaarVerified" class="mt-4 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
                    <input
                      v-model="formData.aadhaarNumber"
                      @input="validateAadhaar(($event.target as HTMLInputElement).value)"
                      @keyup.enter="sendAadhaarOtp"
                      type="text"
                      placeholder="Enter 12-digit Aadhaar number"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': errors.aadhaarNumber }"
                    />
                    <p v-if="errors.aadhaarNumber" class="mt-1 text-sm text-red-600">{{ errors.aadhaarNumber }}</p>
                  </div>

                  <div v-if="aadhaarOtpSent">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Enter Aadhaar OTP</label>
                    <div class="flex space-x-2 justify-center">
                      <input
                        v-for="(input, index) in aadhaarOtpInputs"
                        :key="index"
                        v-model="input.value"
                        @input="handleAadhaarOtpInput(index, ($event.target as HTMLInputElement).value)"
                        @keydown="handleAadhaarOtpKeydown(index, $event)"
                        @keyup.enter="verifyAadhaar"
                        type="text"
                        maxlength="1"
                        :data-aadhaar-otp-index="index"
                        class="w-12 h-12 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                        :class="{ 'border-red-500': errors.aadhaarOtp }"
                      />
                    </div>
                    <p v-if="errors.aadhaarOtp" class="mt-1 text-sm text-red-600 text-center">{{ errors.aadhaarOtp }}</p>
                  </div>

                  <div class="flex space-x-3">
                    <button
                      v-if="!aadhaarOtpSent"
                      type="button"
                      @click="sendAadhaarOtp"
                      :disabled="!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12"
                      class="text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                      :style="{ 'background-color': (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12) ? '#9CA3AF' : '#6A5ACD' }"
                    >
                      Send Aadhaar OTP
                    </button>
                    <div v-if="aadhaarOtpSent" class="space-y-3">
                      <button
                        type="button"
                        @click="verifyAadhaar"
                        :disabled="!formData.aadhaarOtp || formData.aadhaarOtp.some(digit => digit === '')"
                        class="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Verify Aadhaar
                      </button>
                      <div class="text-center">
                        <button
                          @click="resendAadhaarOtp"
                          :disabled="aadhaarOtpCooldown > 0"
                          class="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          <span v-if="aadhaarOtpCooldown > 0">
                            Resend Aadhaar OTP in {{ formatTime(aadhaarOtpCooldown) }}
                          </span>
                          <span v-else>
                            Resend Aadhaar OTP
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Business Type Selection -->
              <div class="border border-gray-200 rounded-lg p-6">
                <label class="block text-sm font-medium text-gray-700 mb-4">Select Business Type</label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    @click="formData.businessType = 'gst'"
                    :class="[
                      'p-4 border-2 rounded-lg text-left transition-colors',
                      formData.businessType === 'gst'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    ]"
                  >
                    <div class="font-semibold">GST Registered Business</div>
                    <div class="text-sm">For businesses with GST registration</div>
                  </button>
                  <button
                    type="button"
                    @click="formData.businessType = 'pan'"
                    :class="[
                      'p-4 border-2 rounded-lg text-left transition-colors',
                      formData.businessType === 'pan'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    ]"
                  >
                    <div class="font-semibold">PAN Based Business</div>
                    <div class="text-sm">For businesses with PAN registration</div>
                  </button>
                </div>
              </div>

              <!-- GST Section -->
              <div v-if="formData.businessType === 'gst'" class="border border-gray-200 rounded-lg p-6">
                <button
                  type="button"
                  @click="toggleGstSection"
                  class="w-full flex items-center justify-between text-left"
                >
                  <div class="flex items-center">
                    <i class="fas fa-receipt text-green-600 mr-3"></i>
                    <span class="font-semibold text-gray-900">GST Details</span>
                  </div>
                  <i :class="showGstSection ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-gray-400"></i>
                </button>
                
                <div v-if="showGstSection" class="mt-4 space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">GST Number <span class="text-red-500">*</span></label>
                      <div class="flex space-x-2">
                        <input
                          v-model="formData.gstNumber"
                          @input="validateGstNumber(($event.target as HTMLInputElement).value)"
                          @keyup.enter="completeSignup"
                          type="text"
                          placeholder="22AAAAA0000A1Z5"
                          class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          :class="{ 'border-red-500': errors.gstNumber, 'border-green-500': gstVerified }"
                        />
                        <button
                          type="button"
                          @click="verifyGst"
                          :disabled="gstVerifying || !formData.gstNumber || formData.gstNumber.trim() === ''"
                          class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
                        >
                          <i v-if="gstVerifying" class="fas fa-spinner fa-spin mr-1"></i>
                          <span v-if="gstVerifying">Verifying...</span>
                          <span v-else-if="gstVerified">✓ Verified</span>
                          <span v-else>Verify</span>
                        </button>
                      </div>
                      <p v-if="errors.gstNumber" class="mt-1 text-sm text-red-600">{{ errors.gstNumber }}</p>
                      <p v-else-if="gstVerified" class="mt-1 text-sm text-green-600">
                        <i class="fas fa-check-circle mr-1"></i>GST number verified successfully!
                      </p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                      <input
                        v-model="formData.branchName"
                        @keyup.enter="completeSignup"
                        type="text"
                        placeholder="Main Branch"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': errors.branchName }"
                      />
                      <p v-if="errors.branchName" class="mt-1 text-sm text-red-600">{{ errors.branchName }}</p>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Registered Address <span class="text-red-500">*</span></label>
                    <textarea
                      v-model="formData.gstAddress"
                      @keyup.enter="completeSignup"
                      rows="3"
                      placeholder="Enter your registered business address"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': errors.gstAddress }"
                    ></textarea>
                    <p v-if="errors.gstAddress" class="mt-1 text-sm text-red-600">{{ errors.gstAddress }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Pincode <span class="text-red-500">*</span></label>
                    <input
                      v-model="formData.gstPincode"
                      @input="formData.gstPincode = validatePincode(($event.target as HTMLInputElement).value)"
                      @keyup.enter="completeSignup"
                      type="text"
                      placeholder="123456"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': errors.gstPincode }"
                    />
                    <p v-if="errors.gstPincode" class="mt-1 text-sm text-red-600">{{ errors.gstPincode }}</p>
                  </div>
                </div>
              </div>

              <!-- PAN Section -->
              <div v-if="formData.businessType === 'pan'" class="border border-gray-200 rounded-lg p-6">
                <button
                  type="button"
                  @click="togglePanSection"
                  class="w-full flex items-center justify-between text-left"
                >
                  <div class="flex items-center">
                    <i class="fas fa-id-badge text-purple-600 mr-3"></i>
                    <span class="font-semibold text-gray-900">PAN Details</span>
                  </div>
                  <i :class="showPanSection ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-gray-400"></i>
                </button>
                
                <div v-if="showPanSection" class="mt-4 space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Entity Type <span class="text-red-500">*</span></label>
                      <select
                        v-model="formData.entityType"
                        @keyup.enter="completeSignup"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': errors.entityType }"
                      >
                        <option value="">Select Entity Type</option>
                        <option value="individual">Individual</option>
                        <option value="company">Company</option>
                        <option value="partnership">Partnership</option>
                        <option value="proprietorship">Proprietorship</option>
                      </select>
                      <p v-if="errors.entityType" class="mt-1 text-sm text-red-600">{{ errors.entityType }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Entity Name <span class="text-red-500">*</span></label>
                      <input
                        v-model="formData.entityName"
                        @keyup.enter="completeSignup"
                        type="text"
                        placeholder="Enter entity name"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': errors.entityName }"
                      />
                      <p v-if="errors.entityName" class="mt-1 text-sm text-red-600">{{ errors.entityName }}</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">PAN Number <span class="text-red-500">*</span></label>
                      <div class="flex space-x-2">
                        <input
                          v-model="formData.panNumber"
                          @keyup.enter="completeSignup"
                          type="text"
                          placeholder="ABCDE1234F"
                          class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                          :class="{ 'border-red-500': errors.panNumber, 'border-green-500': panVerified }"
                        />
                        <button
                          type="button"
                          @click="verifyPan"
                          :disabled="panVerifying || !formData.panNumber || formData.panNumber.trim() === ''"
                          class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
                        >
                          <i v-if="panVerifying" class="fas fa-spinner fa-spin mr-1"></i>
                          <span v-if="panVerifying">Verifying...</span>
                          <span v-else-if="panVerified">✓ Verified</span>
                          <span v-else>Verify</span>
                        </button>
                      </div>
                      <p v-if="errors.panNumber" class="mt-1 text-sm text-red-600">{{ errors.panNumber }}</p>
                      <p v-else-if="panVerified" class="mt-1 text-sm text-green-600">
                        <i class="fas fa-check-circle mr-1"></i>PAN number verified successfully!
                      </p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                      <input
                        v-model="formData.panPincode"
                        @input="formData.panPincode = validatePincode(($event.target as HTMLInputElement).value)"
                        @keyup.enter="completeSignup"
                        type="text"
                        placeholder="123456"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': errors.panPincode }"
                      />
                      <p v-if="errors.panPincode" class="mt-1 text-sm text-red-600">{{ errors.panPincode }}</p>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Billing Address <span class="text-red-500">*</span></label>
                    <textarea
                      v-model="formData.billingAddress"
                      @keyup.enter="completeSignup"
                      rows="3"
                      placeholder="Enter your billing address"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': errors.billingAddress }"
                    ></textarea>
                    <p v-if="errors.billingAddress" class="mt-1 text-sm text-red-600">{{ errors.billingAddress }}</p>
                  </div>
                </div>
              </div>

              <!-- Bank Details Section -->
              <div class="border border-gray-200 rounded-lg p-6">
                <button
                  type="button"
                  @click="toggleBankDetails"
                  class="w-full flex items-center justify-between text-left"
                >
                  <div class="flex items-center">
                    <i class="fas fa-university text-yellow-600 mr-3"></i>
                    <span class="font-semibold text-gray-900">Bank Details</span>
                  </div>
                  <i :class="showBankDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-gray-400"></i>
                </button>
                
                <div v-if="showBankDetails" class="mt-4 space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Beneficiary Name <span class="text-red-500">*</span></label>
                      <input
                        v-model="formData.beneficiaryName"
                        @keyup.enter="completeSignup"
                        type="text"
                        placeholder="Enter beneficiary name"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': errors.beneficiaryName }"
                      />
                      <p v-if="errors.beneficiaryName" class="mt-1 text-sm text-red-600">{{ errors.beneficiaryName }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Bank Name <span class="text-red-500">*</span></label>
                      
                      <!-- Bank Dropdown -->
                      <select
                        v-if="!isOtherBank && !banksLoading"
                        v-model="formData.bankName"
                        @change="handleBankSelection"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': errors.bankName }"
                      >
                        <option value="">Select Bank</option>
                        <option v-for="bank in banksList" :key="bank" :value="bank">{{ bank }}</option>
                        <option value="other">Other</option>
                      </select>
                      
                      <!-- Loading State -->
                      <div v-if="banksLoading" class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                        <i class="fas fa-spinner fa-spin text-gray-400 mr-2"></i>
                        <span class="text-gray-500 text-sm">Loading banks...</span>
                      </div>
                      
                      <!-- Error State -->
                      <div v-if="banksError && !banksLoading" class="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50">
                        <div class="flex items-center">
                          <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                          <span class="text-red-700 text-sm">{{ banksError }}</span>
                        </div>
                        <button
                          @click="fetchBanksList"
                          class="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Try again
                        </button>
                      </div>
                      
                      <!-- Custom Bank Input (shown when "Other" is selected) -->
                      <div v-if="isOtherBank" class="space-y-2">
                        <input
                          v-model="formData.bankName"
                          @keyup.enter="completeSignup"
                          type="text"
                          placeholder="Enter custom bank name"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          :class="{ 'border-red-500': errors.bankName }"
                        />
                        <button
                          type="button"
                          @click="resetBankSelection"
                          class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          ← Back to bank list
                        </button>
                      </div>
                      
                      <p v-if="errors.bankName" class="mt-1 text-sm text-red-600">{{ errors.bankName }}</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Account Number <span class="text-red-500">*</span></label>
                      <input
                        v-model="formData.accountNumber"
                        @input="resetBankValidationAttempts"
                        @keyup.enter="completeSignup"
                        type="text"
                        placeholder="Enter account number"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': errors.accountNumber, 'border-green-500': bankVerified }"
                      />
                      <p v-if="errors.accountNumber" class="mt-1 text-sm text-red-600">{{ errors.accountNumber }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">IFSC Code <span class="text-red-500">*</span></label>
                      <input
                        v-model="formData.ifscCode"
                        @input="resetBankValidationAttempts"
                        @keyup.enter="completeSignup"
                        type="text"
                        placeholder="Enter IFSC code"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': errors.ifscCode, 'border-green-500': bankVerified }"
                      />
                      <p v-if="errors.ifscCode" class="mt-1 text-sm text-red-600">{{ errors.ifscCode }}</p>
                    </div>
                  </div>
                  
                  <!-- Bank Verification Button -->
                  <div class="flex flex-col items-center space-y-2">
                    <!-- Counter Reset Message -->
                    <div v-if="bankCounterReset" class="text-sm text-green-600 font-medium">
                      ✓ Counter reset - Fresh attempts available
                    </div>
                    
                    <!-- Attempts Exhausted Message -->
                    <div v-if="bankAttemptsExhausted" class="text-sm text-red-600 font-medium bg-red-50 px-4 py-2 rounded-md border border-red-200">
                      <i class="fas fa-exclamation-triangle mr-2"></i>
                      Contact Sales Team at sales@vamaship.com
                    </div>
                    
                    <button
                      type="button"
                      @click="verifyBank"
                      :disabled="bankVerifying || !formData.accountNumber || !formData.ifscCode || formData.accountNumber.trim() === '' || formData.ifscCode.trim() === ''"
                      class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                    >
                      <i v-if="bankVerifying" class="fas fa-spinner fa-spin mr-2"></i>
                      <span v-if="bankVerifying">Verifying Bank Details...</span>
                      <span v-else-if="bankVerified">✓ Bank Details Verified</span>
                      <span v-else>Verify Bank Details</span>
                    </button>
                  </div>
                  
                  <!-- Bank Verification Success Message -->
                  <div v-if="bankVerified" class="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div class="flex items-center">
                      <i class="fas fa-check-circle text-green-500 mr-2"></i>
                      <span class="text-green-700 text-sm font-medium">Bank account details verified successfully!</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex space-x-4">
                <button
                  type="button"
                  @click="prevStep"
                  class="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 font-semibold"
                >
                  Back
                </button>
                <button
                  type="button"
                  @click="skipKyc"
                  :disabled="loading"
                  class="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center"
                >
                  <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
                  {{ loading ? 'Processing...' : 'Skip KYC' }}
                </button>
                <button
                  type="button"
                  @click="completeSignup"
                  :disabled="!isStep3Valid || loading"
                  class="flex-1 text-white py-3 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center"
                  :style="{ 'background-color': (!isStep3Valid || loading) ? '#9CA3AF' : '#6A5ACD' }"
                >
                  <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
                  {{ loading ? 'Processing...' : 'Complete Signup' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 

<style scoped>
/* Track type toggle styling */
.track-type-btn.active {
  background-color: #5060A3;
  color: white;
}

.track-type-btn:not(.active) {
  background-color: transparent;
  color: #6B7280;
}

.track-type-btn:not(.active):hover {
  background-color: #F3F4F6;
}

/* Gradient background styling */
.gradient-bg {
  background: linear-gradient(to bottom right, #EAEFFC, #EDE6FF, #F5F5FA);
  position: relative;
  overflow: hidden;
}

/* Purple hue (top-left) */
.purple-hue {
  content: "";
  position: absolute;
  width: 500px;
  height: 500px;
  top: -150px;
  left: -100px;
  background: radial-gradient(circle, rgba(147,117,255,0.25) 0%, rgba(255,255,255,0) 70%);
  z-index: 1;
}

/* Blue hue (bottom-right) */
.blue-hue {
  content: "";
  position: absolute;
  width: 600px;
  height: 600px;
  bottom: -150px;
  right: -100px;
  background: radial-gradient(circle, rgba(112,171,255,0.2) 0%, rgba(255,255,255,0) 70%);
  z-index: 1;
}

/* Pink hue (bottom-left) */
.pink-hue {
  content: "";
  position: absolute;
  width: 400px;
  height: 400px;
  bottom: -100px;
  left: -100px;
  background: radial-gradient(circle, rgba(255,192,203,0.2) 0%, rgba(255,255,255,0) 70%);
  z-index: 1;
}
</style>