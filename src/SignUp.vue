<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiService, { type SignUpData, type KYCData } from './services/api'

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

// UI State
const currentStep = ref(1)
const totalSteps = 3
const otpSent = ref(false)
const aadhaarOtpSent = ref(false)
const gstOtpSent = ref(false)
const panOtpSent = ref(false)
const kycCompleted = ref(false)
const showDashboard = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const otpCooldown = ref(0)
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
         formData.password === formData.confirmPassword
  
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

const sendOtp = async () => {
  if (formData.phone.length !== 10) {
    errors.phone = 'Please enter a valid 10-digit phone number'
    return
  }

  loading.value = true
  clearErrors() // Clear previous errors
  
  try {
    const response = await apiService.sendOTP(formData.phone)
    if (response.success) {
      otpSent.value = true
      // Initialize countdown timer
      otpCooldown.value = 180 // 3 minutes = 180 seconds
      startOtpCooldown()
      // Show success message
      console.log('OTP sent successfully! ')
      // Show success message to user
      alert('OTP sent successfully! Please check your phone for the 6-digit code.')
    } else {
      handleApiError(response)
    }
  } catch (error: any) {
    console.error('OTP send error:', error)
    if (error.response?.status === 429) {
      // Handle cooldown error
      const cooldownRemaining = error.response.data?.cooldown_remaining || 180
      otpCooldown.value = cooldownRemaining
      startOtpCooldown()
      generalError.value = error.response.data?.message || 'Please wait before requesting another OTP'
    } else if (error.response?.status === 404 && error.response.data?.user_not_found) {
      // User doesn't exist - this is expected for new signups
      // Proceed to create user during the actual signup process
      otpSent.value = true
      // Initialize countdown timer
      otpCooldown.value = 180 // 3 minutes = 180 seconds
      startOtpCooldown()
      console.log('New user signup - OTP will be sent during signup process')
      // Show user-friendly message
      alert('New user detected! OTP will be sent during the signup process. Please continue to the next step.')
    } else {
      generalError.value = 'Network error occurred while sending OTP. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const resendOtp = async () => {
  if (otpCooldown.value > 0) return
  
  await sendOtp()
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
    
    if (response.success) {
      nextStep()
    } else {
      handleApiError(response)
    }
  } catch (error) {
    console.error('OTP verification error:', error)
    generalError.value = 'Network error occurred while verifying OTP. Please try again.'
  } finally {
    loading.value = false
  }
}

// Navigation functions
const nextStep = () => {
  if (currentStep.value < totalSteps) {
    clearErrors() // Clear errors when moving to next step
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    clearErrors() // Clear errors when moving to previous step
    currentStep.value--
  }
}

// Complete signup process
const completeSignup = async () => {
  console.log('=== VUE COMPONENT COMPLETE SIGNUP START ===');
  console.log('Current form data:', formData);
  console.log('Aadhaar verified:', aadhaarVerified.value);
  console.log('Is Google Sign-In user:', isGoogleSignInUser.value);
  console.log('Is skipping KYC:', isSkippingKyc.value);
  console.log('Password:', formData.password);
  console.log('Confirm Password:', formData.confirmPassword);
  console.log('Password match:', formData.password === formData.confirmPassword);
  
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
      
      if (!formData.billingAddress || formData.billingAddress.trim() === '') {
        handleApiError({ 
          message: 'Billing address is required for PAN based businesses.', 
          errors: { billingAddress: 'Billing address is required' } 
        });
        return;
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
      handleApiError({ 
        message: 'Account number is required.', 
        errors: { accountNumber: 'Account number is required' } 
      });
      return;
    }
    
    if (!formData.ifscCode || formData.ifscCode.trim() === '') {
      handleApiError({ 
        message: 'IFSC code is required.', 
        errors: { ifscCode: 'IFSC code is required' } 
      });
      return;
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
    
    if (response.success) {
      console.log('Signup completed successfully:', response.data)
      
      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify({
        name: response.data.data.user.name,
        email: response.data.data.user.email,
        phone: response.data.data.user.phone,
        userId: response.data.data.user_id,
        entityId: response.data.data.entity_id
      }))
      
      // Store access token and API key
      localStorage.setItem('access_token', response.data.data.access_token)
      localStorage.setItem('api_key', response.data.data.api_key)
      
      // Show success and redirect to ecom3-ui dashboard
      kycCompleted.value = true
      showDashboard.value = true
      alert('Signup completed successfully! Welcome to Vamaship! 🎉')
      
      // Redirect to ecom3-ui dashboard if redirect_url is provided
      if (response.data?.data?.redirect_url) {
        console.log('Redirecting to ecom3-ui dashboard:', response.data.data.redirect_url)
        console.log('Full response data:', response.data)
        console.log('Response success:', response.success)
        console.log('Response message:', response.message)
        
        // Try immediate redirect first
        try {
          console.log('Attempting immediate redirect to:', response.data.data.redirect_url)
          window.location.href = response.data.data.redirect_url
        } catch (redirectError) {
          console.error('Immediate redirect failed:', redirectError)
          // Fallback to setTimeout
          setTimeout(() => {
            console.log('Attempting delayed redirect to:', response.data.data.redirect_url)
            try {
              window.location.href = response.data.data.redirect_url
            } catch (fallbackError) {
              console.error('Delayed redirect also failed:', fallbackError)
              // Final fallback - open in new tab
              window.open(response.data.data.redirect_url, '_blank')
            }
          }, 1000)
        }
      } else {
        // Fallback to local dashboard
        console.log('No redirect_url provided, using fallback')
        console.log('Response structure:', response)
        router.push('/orders')
      }
    } else {
      console.error('Signup failed:', response.message);
      handleApiError(response)
    }
  } catch (error) {
    console.error('Signup error:', error)
    handleApiError({
      message: 'Network error occurred during signup. Please check your connection and try again.',
      errors: {}
    })
  } finally {
    loading.value = false
    console.log('=== VUE COMPONENT COMPLETE SIGNUP END ===');
  }
}

const submitKyc = async () => {
  loading.value = true
  try {
    const kycData: KYCData = {
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
  
  // Mark aadhaar as not verified to skip KYC data
  aadhaarVerified.value = false
  
  // Call completeSignup directly
  await completeSignup()
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

// Add validation function for Aadhaar
const validateAadhaar = (value: string) => {
  formData.aadhaarNumber = value.replace(/\D/g, '').slice(0, 12)
  if (formData.aadhaarNumber.length === 12) {
    delete errors.aadhaarNumber
  } else {
    errors.aadhaarNumber = 'Please enter a valid 12-digit Aadhaar number'
  }
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
      aadhaarOtpCooldown.value = 180 // 3 minutes = 180 seconds
      startAadhaarOtpCooldown()
      console.log('Aadhaar OTP sent successfully! Check your phone for the 6-digit code.')
      alert('Aadhaar OTP sent successfully! Check your phone for the 6-digit code.')
    } else {
      errors.aadhaarOtp = response.message || 'Failed to send Aadhaar OTP'
    }
  } catch (error: any) {
    console.error('Aadhaar OTP send error:', error)
    if (error.response?.status === 429) {
      // Handle cooldown error
      const cooldownRemaining = error.response.data?.cooldown_remaining || 180
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
    
    if (response.success) {
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
      errors.aadhaarOtp = response.message || 'Aadhaar verification failed'
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
    
    // Parse the JWT token to get user info
    const profile = parseJwt(response.credential)
    
    console.log('Google Sign-In successful:', profile)
    
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
  if (typeof window !== 'undefined' && !window.google) {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      initializeGoogleSignIn()
    }
    document.head.appendChild(script)
  } else if (window.google) {
    initializeGoogleSignIn()
  }
}

// Initialize Google Sign-In when component mounts
onMounted(() => {
  loadGoogleSignInScript()
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
          'gstNumber': 'gstNumber',
          'panNumber': 'panNumber',
          'beneficiaryName': 'beneficiaryName',
          'bankName': 'bankName',
          'accountNumber': 'accountNumber',
          'ifscCode': 'ifscCode'
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
    generalError.value = error.message
  } else {
    generalError.value = 'An unexpected error occurred. Please try again.'
  }
  
  // Log all errors for debugging
  console.log('All field errors:', errors)
  console.log('General error:', generalError.value)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Dashboard Background for Steps 2 & 3 -->
    <div v-if="currentStep > 1" class="fixed inset-0 bg-cover bg-no-repeat pointer-events-none" style="background-image: url('/img/background-image.png?v=5'); background-position: center 30%;">
      <!-- Dark Blue Blur Overlay -->
      <div class="absolute inset-0 bg-blue-900 bg-opacity-30"></div>
    </div>

    <!-- Signup Form Container -->
    <div class="relative z-10 flex justify-center items-center min-h-screen p-4">
      <!-- Step 1: Account Type Selection & Phone Verification -->
      <div v-if="currentStep === 1" class="min-h-screen flex flex-col lg:flex-row">
          <!-- Left Side - Branding and Information -->
          <div class="w-full lg:w-1/2 bg-white flex flex-col justify-center p-6 lg:p-12">
            <!-- Vamaship Logo -->
            <div class="mb-8 lg:mb-12">
              <div class="flex flex-col items-start">
                <img src="/images/logo-blue.png" alt="Vamaship" class="h-10 lg:h-12 w-auto" />
              </div>
            </div>
            
            <!-- Main Headline -->
            <div class="mb-6 lg:mb-8">
              <h1 class="text-2xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4">Start Shipping Smarter — in Just a Few Steps</h1>
              <p class="text-lg lg:text-xl text-gray-600">Shipping made simple for growing brands — with fast COD, multi-courier access, and no platform fees.</p>
            </div>
            
            <!-- Partner/Client Logos Grid -->
            <div class="mb-8 lg:mb-12">
              <h3 class="text-base lg:text-lg font-semibold mb-4 lg:mb-6 text-center text-gray-900">Trusted by leading brands</h3>
              <div class="grid grid-cols-3 gap-2 lg:gap-4 max-w-md">
                <!-- Row 1 -->
                <div class="bg-gray-50 rounded-lg p-2 lg:p-4 flex items-center justify-center border border-gray-200">
                  <img src="/images/brands/batras.png" alt="Batras" class="h-6 lg:h-8 w-auto" />
                </div>
                <div class="bg-gray-50 rounded-lg p-2 lg:p-4 flex items-center justify-center border border-gray-200">
                  <img src="/images/brands/cai_store.png" alt="CAI Store" class="h-6 lg:h-8 w-auto" />
                </div>
                <div class="bg-gray-50 rounded-lg p-2 lg:p-4 flex items-center justify-center border border-gray-200">
                  <img src="/images/brands/eridani.png" alt="Eridani" class="h-6 lg:h-8 w-auto" />
                </div>
                
                <!-- Row 2 -->
                <div class="bg-gray-50 rounded-lg p-2 lg:p-4 flex items-center justify-center border border-gray-200">
                  <img src="/images/brands/maccaron.png" alt="Maccaron" class="h-6 lg:h-8 w-auto" />
                </div>
                <div class="bg-gray-50 rounded-lg p-2 lg:p-4 flex items-center justify-center border border-gray-200">
                  <img src="/images/brands/miduty.png" alt="Miduty" class="h-6 lg:h-8 w-auto" />
                </div>
                <div class="bg-gray-50 rounded-lg p-2 lg:p-4 flex items-center justify-center border border-gray-200">
                  <img src="/images/brands/pilgrim.png" alt="Pilgrim" class="h-6 lg:h-8 w-auto" />
                </div>
                
                <!-- Row 3 -->
                <div class="bg-gray-50 rounded-lg p-2 lg:p-4 flex items-center justify-center border border-gray-200">
                  <img src="/images/brands/swantra.png" alt="Swantra" class="h-6 lg:h-8 w-auto" />
                </div>
                <div class="bg-gray-50 rounded-lg p-2 lg:p-4 flex items-center justify-center border border-gray-200">
                  <img src="/images/brands/tata.png" alt="Tata" class="h-6 lg:h-8 w-auto" />
                </div>
                <div class="bg-gray-50 rounded-lg p-2 lg:p-4 flex items-center justify-center border border-gray-200">
                  <div class="text-center">
                    <div class="text-red-600 font-bold text-sm lg:text-lg">*ORION</div>
                    <i class="fas fa-star text-xs lg:text-sm mt-1 text-red-600"></i>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Additional Features -->
            <div class="mt-8 lg:mt-12 grid grid-cols-2 gap-4 lg:gap-6 text-center">
              <div class="bg-gray-50 rounded-lg p-3 lg:p-4 border border-gray-200">
                <img src="/images/features/features_icon1.png" alt="Fast Delivery" class="h-6 lg:h-8 w-auto mx-auto mb-2" />
                <div class="text-xs lg:text-sm text-gray-700">Fast Delivery</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3 lg:p-4 border border-gray-200">
                <img src="/images/features/features_icon2.png" alt="Secure Shipping" class="h-6 lg:h-8 w-auto mx-auto mb-2" />
                <div class="text-xs lg:text-sm text-gray-700">Secure Shipping</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3 lg:p-4 border border-gray-200">
                <img src="/images/features/features_icon3.png" alt="Real-time Tracking" class="h-6 lg:h-8 w-auto mx-auto mb-2" />
                <div class="text-xs lg:text-sm text-gray-700">Real-time Tracking</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3 lg:p-4 border border-gray-200">
                <img src="/images/features/features_icon4.png" alt="24/7 Support" class="h-6 lg:h-8 w-auto mx-auto mb-2" />
                <div class="text-xs lg:text-sm text-gray-700">24/7 Support</div>
              </div>
            </div>
          </div>
          
          <!-- Right Side - Signup Form -->
          <div class="w-full lg:w-1/2 flex flex-col items-center justify-start p-6 lg:p-12 pt-8">
            <div class="w-full max-w-md lg:max-w-lg">

              
              <!-- Account Type Selection -->
              <div class="mb-6 lg:mb-8">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-6">
                  <button
                    @click="formData.accountType = 'seller'"
                    :class="[
                      'p-4 border-2 rounded-lg text-center transition-colors relative',
                      formData.accountType === 'seller'
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-gray-300 hover:border-gray-400 shadow-sm'
                    ]"
                  >
                    <div class="text-left">
                      <div class="text-base lg:text-lg font-semibold text-gray-900 mb-1">I'm a Seller</div>
                      <div class="text-xs text-gray-600">I want to ship my products</div>
                    </div>
                    <div class="absolute top-3 right-3">
                      <div :class="[
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                        formData.accountType === 'seller'
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-400'
                      ]">
                        <div v-if="formData.accountType === 'seller'" class="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </button>
                  <button
                    @click="redirectToVamaship"
                    :class="[
                      'p-4 border-2 rounded-lg text-center transition-colors relative',
                      formData.accountType === 'buyer'
                        ? 'border-blue-600 bg-blue-50 shadow-md'
                        : 'border-gray-300 hover:border-gray-400 shadow-sm'
                    ]"
                  >
                    <div class="text-left">
                      <div class="text-base lg:text-lg font-semibold text-gray-900 mb-1">I'm a Buyer</div>
                      <div class="text-xs text-gray-600">I want to track my orders</div>
                    </div>
                    <div class="absolute top-3 right-3">
                      <div :class="[
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                        formData.accountType === 'buyer'
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-400'
                      ]">
                        <div v-if="formData.accountType === 'buyer'" class="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Call to Action -->
              <div class="text-center mb-6">
                <h2 class="text-xl lg:text-2xl font-bold text-gray-900">Start with a free account</h2>
              </div>

              <!-- General Error Banner -->
              <div v-if="generalError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div class="flex items-center">
                  <i class="fas fa-exclamation-circle text-red-500 mr-3"></i>
                  <span class="text-red-700 text-sm font-medium">{{ generalError }}</span>
                </div>
              </div>

              <!-- Google Sign-in Button -->
              <div class="mb-6">
                <div id="google-signin-button"></div>
                <!-- Fallback button if Google Sign-In fails to load -->
                <button 
                  v-if="!isGoogleLoaded" 
                  class="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  @click="loadGoogleSignInScript"
                >
                  <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span class="text-gray-700 font-medium">Sign in with Google</span>
                </button>
              </div>

              <!-- Divider -->
              <div class="flex items-center mb-6">
                <div class="flex-1 border-t border-gray-300"></div>
                <span class="px-4 text-sm text-gray-500">or continue with phone</span>
                <div class="flex-1 border-t border-gray-300"></div>
              </div>

              <!-- Phone Number Input -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div class="flex">
                  <select v-model="formData.countryCode" class="px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50">
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                  </select>
                  <input
                    v-model="formData.phone"
                    @input="formData.phone = validatePhone(($event.target as HTMLInputElement).value)"
                    @keyup.enter="sendOtp"
                    type="tel"
                    placeholder="Enter your phone number"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.phone }"
                  />
                </div>
                <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
              </div>

              <!-- OTP Input -->
              <div v-if="otpSent" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                <div class="flex space-x-2 justify-center">
                  <input
                    v-for="(input, index) in otpInputs"
                    :key="index"
                    v-model="input.value"
                    @input="handleOtpInput(index, ($event.target as HTMLInputElement).value)"
                    @keydown="handleOtpKeydown(index, $event)"
                    @keyup.enter="verifyOtp"
                    type="text"
                    maxlength="1"
                    :data-otp-index="index"
                    class="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p v-if="errors.otp" class="mt-1 text-sm text-red-600 text-center">{{ errors.otp }}</p>
                <p class="mt-2 text-sm text-gray-600 text-center">Enter the 6-digit code sent to your phone</p>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-3">
                <button
                  v-if="!otpSent"
                  @click="sendOtp"
                  :disabled="formData.phone.length !== 10"
                  class="w-full text-white py-3 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                  :style="{ 'background-color': formData.phone.length !== 10 ? '#9CA3AF' : '#6A5ACD' }"
                >
                  Send OTP
                </button>
                
                <!-- Login Option - Default position -->
                <div v-if="!otpSent" class="text-center">
                  <p class="text-gray-600 text-sm">
                    Already have an account? 
                    <button 
                      @click="goToSignIn" 
                      class="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors"
                    >
                      Login here
                    </button>
                  </p>
                </div>
                
                <div v-if="otpSent" class="space-y-3">
                  <button
                    @click="verifyOtp"
                    :disabled="formData.otp.some(digit => digit === '')"
                    class="w-full text-white py-3 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                    :style="{ 'background-color': formData.otp.some(digit => digit === '') ? '#9CA3AF' : '#6A5ACD' }"
                  >
                    Verify & Continue
                  </button>
                  <div class="text-center">
                    <button
                      @click="resendOtp"
                      :disabled="otpCooldown > 0"
                      class="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      <span v-if="otpCooldown > 0">
                        Resend OTP in {{ formatTime(otpCooldown) }}
                      </span>
                      <span v-else>
                        Resend OTP
                      </span>
                    </button>
                  </div>
                  
                  <!-- Login Option - Only shown when OTP is sent -->
                  <div class="text-center">
                    <p class="text-gray-600 text-sm">
                      Already have an account? 
                      <button 
                        @click="goToSignIn" 
                        class="text-blue-600 hover:text-blue-700 font-semibold underline transition-colors"
                      >
                        Login here
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Benefits Section - Moved below form -->
            <div class="w-full max-w-md lg:max-w-lg mt-6 lg:mt-8">
              <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-4 lg:p-6">
                <h3 class="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 text-gray-900">Why choose Vamaship?</h3>
                <div class="space-y-2 lg:space-y-3">
                  <div class="flex items-center">
                    <div class="w-5 h-5 lg:w-6 lg:h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <i class="fas fa-check text-xs text-white"></i>
                    </div>
                    <span class="text-sm lg:text-base text-gray-700">Multi-courier aggregation</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-5 h-5 lg:w-6 lg:h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <i class="fas fa-check text-xs text-white"></i>
                    </div>
                    <span class="text-sm lg:text-base text-gray-700">Dedicated Customer Support</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-5 h-5 lg:w-6 lg:h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <i class="fas fa-check text-xs text-white"></i>
                    </div>
                    <span class="text-sm lg:text-base text-gray-700">No technical setup required</span>
                  </div>
                  <div class="flex items-center">
                    <div class="w-5 h-5 lg:w-6 lg:h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <i class="fas fa-check text-xs text-white"></i>
                    </div>
                    <span class="text-sm lg:text-base text-gray-700">Branded tracking pages</span>
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
                  <div class="ml-2 text-xs lg:text-sm font-medium text-gray-900">Phone Verification</div>
                </div>
                <div class="w-8 lg:w-12 h-0.5 bg-green-600"></div>
                <div class="flex items-center">
                  <div class="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm lg:text-base">2</div>
                  <div class="ml-2 text-xs lg:text-sm font-medium text-gray-900">User Details</div>
                </div>
                <div class="w-8 lg:w-12 h-0.5 bg-gray-300"></div>
                <div class="flex items-center">
                  <div class="w-6 h-6 lg:w-8 lg:h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold text-sm lg:text-base">3</div>
                  <div class="ml-2 text-xs lg:text-sm font-medium text-gray-500">KYC Verification</div>
                </div>
              </div>
            </div>



            <!-- General Error Banner -->
            <div v-if="generalError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div class="flex items-center">
                <i class="fas fa-exclamation-circle text-red-500 mr-3"></i>
                <span class="text-red-700 text-sm font-medium">{{ generalError }}</span>
              </div>
            </div>

            <!-- Form Fields -->
            <div class="space-y-4 lg:space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  v-model="formData.fullName"
                  @input="clearErrors"
                  @keyup.enter="nextStep"
                  type="text"
                  placeholder="Enter your full name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.fullName }"
                />
                <p v-if="errors.fullName" class="mt-1 text-sm text-red-600">{{ errors.fullName }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  v-model="formData.email"
                  @input="clearErrors"
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
                  <div class="ml-2 text-xs lg:text-sm font-medium text-gray-900">Phone Verification</div>
                </div>
                <div class="w-8 lg:w-12 h-0.5 bg-green-600"></div>
                <div class="flex items-center">
                  <div class="w-6 h-6 lg:w-8 lg:h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-sm lg:text-base">
                    <i class="fas fa-check text-xs lg:text-sm"></i>
                  </div>
                  <div class="ml-2 text-xs lg:text-sm font-medium text-gray-900">User Details</div>
                </div>
                <div class="w-8 lg:w-12 h-0.5 bg-blue-600"></div>
                <div class="flex items-center">
                  <div class="w-6 h-6 lg:w-8 lg:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm lg:text-base">3</div>
                  <div class="ml-2 text-xs lg:text-sm font-medium text-gray-900">KYC Verification</div>
                </div>
              </div>
            </div>



            <!-- Skip KYC Notice -->
            <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div class="flex items-center">
                <i class="fas fa-info-circle text-blue-500 mr-3"></i>
                <div>
                  <span class="text-blue-700 text-sm font-medium">Want immediate access?</span>
                  <p class="text-blue-600 text-xs mt-1">You can skip KYC verification for now and complete it later. Click "Skip KYC" below to proceed directly to your dashboard.</p>
                </div>
              </div>
            </div>

            <!-- General Error Banner -->
            <div v-if="generalError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div class="flex items-center">
                <i class="fas fa-exclamation-circle text-red-500 mr-3"></i>
                <span class="text-red-700 text-sm font-medium">{{ generalError }}</span>
              </div>
            </div>

            <form @submit.prevent="completeSignup" class="space-y-6">
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
                      <input
                        v-model="formData.gstNumber"
                        @input="validateGstNumber(($event.target as HTMLInputElement).value)"
                        @keyup.enter="completeSignup"
                        type="text"
                        placeholder="22AAAAA0000A1Z5"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': errors.gstNumber }"
                      />
                      <p v-if="errors.gstNumber" class="mt-1 text-sm text-red-600">{{ errors.gstNumber }}</p>
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
                      <input
                        v-model="formData.panNumber"
                        @keyup.enter="completeSignup"
                        type="text"
                        placeholder="ABCDE1234F"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': errors.panNumber }"
                      />
                      <p v-if="errors.panNumber" class="mt-1 text-sm text-red-600">{{ errors.panNumber }}</p>
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
                      <input
                        v-model="formData.bankName"
                        @keyup.enter="completeSignup"
                        type="text"
                        placeholder="Enter bank name"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': errors.bankName }"
                      />
                      <p v-if="errors.bankName" class="mt-1 text-sm text-red-600">{{ errors.bankName }}</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Account Number <span class="text-red-500">*</span></label>
                      <input
                        v-model="formData.accountNumber"
                        @keyup.enter="completeSignup"
                        type="text"
                        placeholder="Enter account number"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': errors.accountNumber }"
                      />
                      <p v-if="errors.accountNumber" class="mt-1 text-sm text-red-600">{{ errors.accountNumber }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">IFSC Code <span class="text-red-500">*</span></label>
                      <input
                        v-model="formData.ifscCode"
                        @keyup.enter="completeSignup"
                        type="text"
                        placeholder="Enter IFSC code"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': errors.ifscCode }"
                      />
                      <p v-if="errors.ifscCode" class="mt-1 text-sm text-red-600">{{ errors.ifscCode }}</p>
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
                  class="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 font-semibold"
                >
                  Skip KYC
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