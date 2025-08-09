<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import apiService, { type SignUpData, type KYCData } from '../services/api'
import { trackingAPI } from '../services/api'

import PhoneVerificationStep from '../components/PhoneVerificationStep.vue'
import UserDetailsStep from '../components/UserDetailsStep.vue'
import KYCVerificationStep from '../components/KYCVerificationStep.vue'

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

const formData = reactive<SignUpData & KYCData>({
  accountType: 'seller',
  countryCode: '+91',
  phone: '',
  otp: ['', '', '', '', '', ''],
  
  fullName: '',
  email: '',
  brandName: '',
  password: '',
  confirmPassword: '',
  
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

const GOOGLE_CLIENT_ID = '592769281718-u140kqa8ikgtks4usm5m47ds2kvdk6nm.apps.googleusercontent.com'
const isGoogleLoaded = ref(false)
const isGoogleSignInUser = ref(false)
const isGoogleMobileLoaded = ref(false)
const isGoogleDesktopLoaded = ref(false)

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

const showLoginOption = ref(false)

const banksList = ref<Array<{ id?: string; name: string; code?: string } | string>>([])
const banksLoading = ref(false)
const banksError = ref('')

const isOtherBank = ref(false)

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
const isSkippingKyc = ref(false)

const showAadhaarSection = ref(false)
const showGstSection = ref(false)
const showPanSection = ref(false)
const showBankDetails = ref(false)

const errors = reactive<Record<string, string>>({})
const loading = ref(false)
const generalError = ref('')

const aadhaarVerified = ref(false)

const aadhaarOtpCooldown = ref(0)

const gstVerifying = ref(false)
const panVerifying = ref(false)
const bankVerifying = ref(false)
const gstVerified = ref(false)
const panVerified = ref(false)
const bankVerified = ref(false)

const bankValidationAttempts = ref(0)
const maxBankValidationAttempts = 5
const bankCounterReset = ref(false)
const bankAttemptsExhausted = ref(false)

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
         !errors.email &&
         !errors.fullName
  
  if (isGoogleSignInUser.value) {
    const phoneValid = formData.phone.length === 10
    const phoneVerified = googlePhoneVerified.value
    return basicValidation && phoneValid && phoneVerified
  }
  
  return basicValidation
})

const isStep3Valid = computed(() => {
  return true
})

const otpInputs = computed(() => {
  return Array.from({ length: 6 }, (_, i) => ({
    value: formData.otp?.[i] || '',
    index: i
  }))
})

const aadhaarOtpInputs = computed(() => {
  return Array.from({ length: 6 }, (_, i) => ({
    value: formData.aadhaarOtp?.[i] || '',
    index: i
  }))
})

const isOtpComplete = computed(() => {
  return formData.otp && formData.otp.every(digit => digit !== '')
})

const validatePhone = (phone: string) => {
  return phone.replace(/\D/g, '').slice(0, 10)
}

const resetMobileRegistrationFlag = () => {
  isMobileAlreadyRegistered.value = false
  otpSent.value = false
  clearErrors()
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

const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
  generalError.value = ''
  showLoginOption.value = false
}

const handleApiError = (error: any) => {
  clearErrors()
  if (error.message) {
    generalError.value = error.message
  } else {
    generalError.value = 'An unexpected error occurred. Please try again.'
  }
}

const nextStep = async () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
    
    if (currentStep.value === 3 && banksList.value.length === 0) {
      fetchBanksList()
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleSendOtp = async () => {
  if (formData.phone.length !== 10) {
    errors.phone = 'Please enter a valid 10-digit phone number'
    return
  }

  loading.value = true
  clearErrors()
  
  try {
    const mobileCheckResponse = await apiService.checkMobileExists(formData.phone)
    
    if (mobileCheckResponse.success && mobileCheckResponse.data?.exists) {
      isMobileAlreadyRegistered.value = true
      return
    }
    
    const response = await apiService.sendOTP(formData.phone)
    
    if (response && response.success) {
      otpSent.value = true
      otpCooldown.value = 60
      startOtpCooldown()
      alert('OTP sent successfully! Please check your phone for the 6-digit code.')
    } else {
      if (response && !response.success && response.data?.is_registered) {
        isMobileAlreadyRegistered.value = true
      } else {
        handleApiError(response)
      }
    }
  } catch (error: any) {
    if (error.response?.status === 422 && error.response.data?.is_registered) {
      isMobileAlreadyRegistered.value = true
    } else {
      generalError.value = 'Network error occurred while sending OTP. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const handleVerifyOtp = async () => {
  if (formData.otp!.some(digit => digit === '')) {
    errors.otp = 'Please enter the complete 6-digit OTP'
    return
  }

  loading.value = true
  clearErrors()
  
  try {
    const otpString = formData.otp!.join('')
    const response = await apiService.verifyOTP(formData.phone, otpString)
    
    if (response.result === 1 || response.success || response.message?.toLowerCase().includes('success')) {
      nextStep()
    } else {
      errors.otp = 'Invalid OTP. Please check and try again.'
      formData.otp = ['', '', '', '', '', '']
    }
  } catch (error: any) {
    errors.otp = 'Invalid OTP. Please check and try again.'
    formData.otp = ['', '', '', '', '', '']
  } finally {
    loading.value = false
  }
}

const handleCompleteSignup = async () => {
  if (loading.value) return
  
  loading.value = true
  clearErrors()
  
  try {
    const signupData = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      accountType: formData.accountType,
      brandName: formData.brandName,
      
      isGoogleSignIn: isGoogleSignInUser.value,
      
      isSkippingKyc: isSkippingKyc.value,
      
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
      } : {})
    }

    const response = await apiService.completeSignup(signupData)
    
    if (response.success) {
      sessionStorage.setItem('userData', JSON.stringify({
        name: response.data.user.name,
        email: response.data.user.email,
        phone: response.data.user.phone,
        userId: response.data.user_id,
        entityId: response.data.entity_id
      }))
      
      sessionStorage.setItem('access_token', response.data.access_token)
      sessionStorage.setItem('api_key', response.data.api_key)
      if (response.data.access_token) {
        sessionStorage.setItem('auth_token', response.data.access_token);
      }
      
      let finalRedirectUrl;
      if (response.data?.redirect_url) {
        try {
          const redirectUrl = new URL(response.data.redirect_url);
          const apiKey = redirectUrl.searchParams.get('api_key');
          
          if (apiKey) {
            const ecom3BaseUrl = redirectUrl.origin;
            finalRedirectUrl = `${ecom3BaseUrl}/login?token=${apiKey}&nu=1`;
          } else {
            finalRedirectUrl = response.data.redirect_url;
          }
        } catch (error) {
          finalRedirectUrl = response.data.redirect_url;
        }
      } else {
        finalRedirectUrl = 'http://localhost:8080/login';
      }
      
      alert('Signup completed successfully! Redirecting to dashboard...');
      
      window.location.href = finalRedirectUrl;
    } else {
      handleApiError(response)
    }
  } catch (error) {
    generalError.value = 'Network error occurred during signup. Please check your connection and try again.'
  } finally {
    loading.value = false
  }
}

const handleSkipKyc = async () => {
  if (loading.value) return
  
  isSkippingKyc.value = true
  await handleCompleteSignup()
}

const goToSignIn = () => {
  if (formData.email) {
    localStorage.setItem('prefillEmail', formData.email)
  }
  if (formData.phone) {
    localStorage.setItem('prefillPhone', formData.phone)
  }
  router.push('/sign-in')
}

const handleOtpInput = (index: number, value: string) => {
  if (value.length > 1) {
    value = value.slice(-1)
  }
  
  if (!formData.otp) {
    formData.otp = ['', '', '', '', '', '']
  }
  
  formData.otp[index] = value.replace(/\D/g, '')
  
  if (value && index < 5) {
    nextTick(() => {
      const allNextInputs = document.querySelectorAll(`[data-otp-index="${index + 1}"]`)
      let nextInput: HTMLInputElement | null = null
      
      for (let input of allNextInputs) {
        const element = input as HTMLInputElement
        if (element.offsetParent !== null) {
          nextInput = element
          break
        }
      }
      
      if (nextInput) {
        nextInput.focus()
      }
    })
  }
}

const handleOtpKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !formData.otp![index] && index > 0) {
    const allPrevInputs = document.querySelectorAll(`[data-otp-index="${index - 1}"]`)
    let prevInput: HTMLInputElement | null = null
    
    for (let input of allPrevInputs) {
      const element = input as HTMLInputElement
      if (element.offsetParent !== null) {
        prevInput = element
        break
      }
    }
    
    if (prevInput) {
      prevInput.focus()
    }
  }
}

const handleGooglePhoneOtpInput = (index: number, value: string) => {
  const cleanValue = value.replace(/\D/g, '').slice(0, 1)
  googlePhoneOtpInputs.value[index].value = cleanValue
  
  if (cleanValue && index < googlePhoneOtpInputs.value.length - 1) {
    setTimeout(() => {
      const nextInput = document.querySelector(`input[data-google-phone-otp-index="${index + 1}"]`) as HTMLInputElement
      if (nextInput) {
        nextInput.focus()
      }
    }, 0)
  }
}

const handleGooglePhoneOtpKeydown = (index: number, event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement
  
  if (event.key === 'Backspace' && !target.value && index > 0) {
    event.preventDefault()
    const prevInput = document.querySelector(`input[data-google-phone-otp-index="${index - 1}"]`) as HTMLInputElement
    if (prevInput) {
      prevInput.focus()
      prevInput.value = ''
      googlePhoneOtpInputs.value[index - 1].value = ''
    }
  }
  
  if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    const prevInput = document.querySelector(`input[data-google-phone-otp-index="${index - 1}"]`) as HTMLInputElement
    if (prevInput) {
      prevInput.focus()
    }
  }
  
  if (event.key === 'ArrowRight' && index < googlePhoneOtpInputs.value.length - 1) {
    event.preventDefault()
    const nextInput = document.querySelector(`input[data-google-phone-otp-index="${index + 1}"]`) as HTMLInputElement
    if (nextInput) {
      nextInput.focus()
    }
  }
}

const handleAadhaarOtpInput = (index: number, value: string) => {
  const cleanValue = value.replace(/\D/g, '').slice(0, 1)
  if (formData.aadhaarOtp) {
    formData.aadhaarOtp[index] = cleanValue
  }
  
  if (cleanValue && index < (formData.aadhaarOtp?.length || 0) - 1) {
    setTimeout(() => {
      const nextInput = document.querySelector(`input[data-aadhaar-otp-index="${index + 1}"]`) as HTMLInputElement
      if (nextInput) {
        nextInput.focus()
      }
    }, 0)
  }
}

const handleAadhaarOtpKeydown = (index: number, event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement
  
  if (event.key === 'Backspace' && !target.value && index > 0) {
    event.preventDefault()
    const prevInput = document.querySelector(`input[data-aadhaar-otp-index="${index - 1}"]`) as HTMLInputElement
    if (prevInput) {
      prevInput.focus()
      prevInput.value = ''
      if (formData.aadhaarOtp) {
        formData.aadhaarOtp[index - 1] = ''
      }
    }
  }
  
  if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    const prevInput = document.querySelector(`input[data-aadhaar-otp-index="${index - 1}"]`) as HTMLInputElement
    if (prevInput) {
      prevInput.focus()
    }
  }
  
  if (event.key === 'ArrowRight' && index < (formData.aadhaarOtp?.length || 0) - 1) {
    event.preventDefault()
    const nextInput = document.querySelector(`input[data-aadhaar-otp-index="${index + 1}"]`) as HTMLInputElement
    if (nextInput) {
      nextInput.focus()
    }
  }
}

const validateEmail = async (email: string) => {
  if (!email) return

  try {
    const response = await apiService.checkEmailExists(email)
    if (response.success && response.data?.exists) {
      errors.email = 'This email is already registered'
    } else {
      delete errors.email
    }
  } catch (error) {
  }
}

const validateFullName = (name: string) => {
  if (!name.trim()) {
    errors.fullName = 'Full name is required'
  } else if (name.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters'
  } else {
    delete errors.fullName
  }
}

const validatePasswordStrength = (password: string) => {
  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long'
  } else if (!/(?=.*[a-z])/.test(password)) {
    errors.password = 'Password must contain at least one lowercase letter'
  } else if (!/(?=.*[A-Z])/.test(password)) {
    errors.password = 'Password must contain at least one uppercase letter'
  } else if (!/(?=.*\d)/.test(password)) {
    errors.password = 'Password must contain at least one number'
  } else {
    delete errors.password
  }
}

const loadGoogleSignInScript = () => {
  if (window.google) {
    initializeGoogleSignIn()
    return
  }

  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = () => {
    initializeGoogleSignIn()
  }
  script.onerror = () => {
  }
  document.head.appendChild(script)
}

const initializeGoogleSignIn = () => {
  if (!window.google) {
    return
  }

  try {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
      auto_select: false,
      cancel_on_tap_outside: true
    })

    const mobileButton = document.getElementById('google-signin-button-mobile')
    if (mobileButton && !isGoogleMobileLoaded.value) {
      window.google.accounts.id.renderButton(mobileButton, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'continue_with'
      })
      isGoogleMobileLoaded.value = true
    }

    const desktopButton = document.getElementById('google-signin-button-desktop')
    if (desktopButton && !isGoogleDesktopLoaded.value) {
      window.google.accounts.id.renderButton(desktopButton, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'continue_with'
      })
      isGoogleDesktopLoaded.value = true
    }

    isGoogleLoaded.value = true
  } catch (error) {
  }
}

const handleGoogleSignIn = async (response: any) => {
  try {
    loading.value = true
    
    const token = response.credential
    const payload = JSON.parse(atob(token.split('.')[1]))
    
    formData.email = payload.email
    formData.fullName = payload.name
    isGoogleSignInUser.value = true
    
    delete errors.email
    delete errors.fullName
    
    const apiResponse = await apiService.googleLogin(
      payload.email,
      token,
      payload.given_name,
      payload.family_name
    )
    
    if (apiResponse.success) {
      if (apiResponse.data?.userExists) {
        generalError.value = 'Account already exists. Please sign in instead.'
        goToSignIn()
        return
      }
      
      nextStep()
    } else {
      generalError.value = apiResponse.message || 'Google sign-in failed. Please try again.'
    }
  } catch (error) {
    generalError.value = 'Google sign-in failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const sendGooglePhoneOtp = async () => {
  if (!formData.phone || formData.phone.length !== 10) {
    errors.phone = 'Please enter a valid 10-digit phone number'
    return
  }

  loading.value = true
  try {
    const response = await apiService.sendOTP(formData.phone)
    if (response.success) {
      googlePhoneOtpSent.value = true
      startGooglePhoneOtpCooldown()
    } else {
      errors.phone = response.message || 'Failed to send OTP'
    }
  } catch (error) {
    errors.phone = 'Failed to send OTP. Please try again.'
  } finally {
    loading.value = false
  }
}

const verifyGooglePhoneOtp = async () => {
  if (!googlePhoneOtpInputs.value.every(input => input.value)) {
    errors.googlePhoneOtp = 'Please enter the complete OTP'
    return
  }

  loading.value = true
  try {
    const otpString = googlePhoneOtpInputs.value.map(input => input.value).join('')
    const response = await apiService.verifyOTP(formData.phone, otpString)
    
    if (response.success) {
      googlePhoneVerified.value = true
      delete errors.googlePhoneOtp
    } else {
      errors.googlePhoneOtp = 'Invalid OTP. Please try again.'
      googlePhoneOtpInputs.value.forEach(input => input.value = '')
    }
  } catch (error) {
    errors.googlePhoneOtp = 'Invalid OTP. Please try again.'
  } finally {
    loading.value = false
  }
}

const resendGooglePhoneOtp = () => {
  sendGooglePhoneOtp()
}

const startGooglePhoneOtpCooldown = () => {
  googlePhoneOtpCooldown.value = 60
  const timer = setInterval(() => {
    googlePhoneOtpCooldown.value--
    if (googlePhoneOtpCooldown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const validateAadhaar = (aadhaarNumber: string) => {
  if (!aadhaarNumber) {
    errors.aadhaarNumber = 'Aadhaar number is required'
  } else if (!/^\d{12}$/.test(aadhaarNumber)) {
    errors.aadhaarNumber = 'Aadhaar number must be 12 digits'
  } else {
    delete errors.aadhaarNumber
  }
}

const sendAadhaarOtp = async () => {
  if (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12) {
    errors.aadhaarNumber = 'Please enter a valid 12-digit Aadhaar number'
    return
  }

  loading.value = true
  try {
    const response = await apiService.sendAadhaarOTP(formData.aadhaarNumber)
    if (response.success) {
      aadhaarOtpSent.value = true
    } else {
      errors.aadhaarNumber = response.message || 'Failed to send Aadhaar OTP'
    }
  } catch (error) {
    errors.aadhaarNumber = 'Failed to send Aadhaar OTP. Please try again.'
  } finally {
    loading.value = false
  }
}

const verifyAadhaar = async () => {
  if (!formData.aadhaarOtp?.every(digit => digit)) {
    errors.aadhaarOtp = 'Please enter the complete OTP'
    return
  }

  loading.value = true
  try {
    const otpString = formData.aadhaarOtp.join('')
    const response = await apiService.verifyAadhaarOTP(formData.aadhaarNumber!, otpString)
    
    if (response.success) {
      aadhaarVerified.value = true
      delete errors.aadhaarOtp
    } else {
      errors.aadhaarOtp = 'Invalid OTP. Please try again.'
      formData.aadhaarOtp = ['', '', '', '', '', '']
    }
  } catch (error) {
    errors.aadhaarOtp = 'Invalid OTP. Please try again.'
  } finally {
    loading.value = false
  }
}

const resendAadhaarOtp = () => {
  sendAadhaarOtp()
}

const validateGstNumber = async (gstNumber: string) => {
  if (!gstNumber) {
    errors.gstNumber = 'GST number is required'
    return
  }

  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber)) {
    errors.gstNumber = 'Invalid GST number format'
    return
  }

  try {
    const response = await apiService.validateGstPublic(gstNumber)
    if (response.success) {
      gstVerified.value = true
      delete errors.gstNumber
    } else {
      errors.gstNumber = 'Invalid GST number'
    }
  } catch (error) {
    errors.gstNumber = 'Failed to validate GST number'
  }
}

const verifyGst = () => {
  validateGstNumber(formData.gstNumber!)
}

const validatePanNumber = async (panNumber: string) => {
  if (!panNumber) {
    errors.panNumber = 'PAN number is required'
    return
  }

  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
    errors.panNumber = 'Invalid PAN number format'
    return
  }

  try {
    const response = await apiService.validatePanPublic(panNumber)
    if (response.success) {
      panVerified.value = true
      delete errors.panNumber
    } else {
      errors.panNumber = 'Invalid PAN number'
    }
  } catch (error) {
    errors.panNumber = 'Failed to validate PAN number'
  }
}

const verifyPan = () => {
  validatePanNumber(formData.panNumber!)
}

const validatePincodeField = (pincode: string, fieldType: string = 'gst') => {
  const errorField = fieldType === 'gst' ? 'gstPincode' : 'panPincode'
  
  const sanitizedPincode = pincode.replace(/\D/g, '').slice(0, 6)
  
  if (fieldType === 'gst') {
    formData.gstPincode = sanitizedPincode
  } else {
    formData.panPincode = sanitizedPincode
  }
  
  if (!sanitizedPincode) {
    delete errors[errorField]
    return
  }

  if (sanitizedPincode.length < 6) {
    errors[errorField] = 'Pincode must be at least 6 characters'
    return
  }

  if (sanitizedPincode.length > 6) {
    errors[errorField] = 'Pincode must not exceed 6 characters'
    return
  }

  if (!/^\d{6}$/.test(sanitizedPincode)) {
    errors[errorField] = 'Pincode must be exactly 6 digits'
    return
  }

  delete errors[errorField]
}

const fetchBanksList = async () => {
  banksLoading.value = true
  banksError.value = ''
  
  try {
    const response = await apiService.getBanksList()
    
    if (response.success && response.data?.banks) {
      banksList.value = response.data.banks
    } else {
      banksError.value = 'Failed to load banks list'
    }
  } catch (error) {
    banksError.value = 'Failed to load banks list'
  } finally {
    banksLoading.value = false
  }
}

const handleBankSelection = (bankName: string) => {
  if (bankName === 'other') {
    isOtherBank.value = true
    formData.bankName = ''
  } else {
    formData.bankName = bankName
    isOtherBank.value = false
  }
}

const resetBankSelection = () => {
  formData.bankName = ''
  isOtherBank.value = false
}

const resetBankValidationAttempts = () => {
  bankCounterReset.value = true
  bankAttemptsExhausted.value = false
}

const verifyBank = async () => {
  if (!formData.accountNumber || !formData.ifscCode) {
    errors.accountNumber = 'Account number and IFSC code are required'
    return
  }

  bankVerifying.value = true
  try {
    const response = await apiService.validateBankPublic(formData.accountNumber, formData.ifscCode)
    if (response.success) {
      bankVerified.value = true
      delete errors.accountNumber
      delete errors.ifscCode
    } else {
      errors.accountNumber = 'Invalid bank details'
    }
  } catch (error) {
    errors.accountNumber = 'Failed to verify bank details'
  } finally {
    bankVerifying.value = false
  }
}

const toggleBankDetails = () => {
  showBankDetails.value = !showBankDetails.value
  if (showBankDetails.value && banksList.value.length === 0) {
    fetchBanksList()
  }
}

onMounted(() => {
  setTimeout(() => {
    loadGoogleSignInScript()
  }, 100)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
   
    <nav v-if="currentStep === 1" class="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <img src="/images/logo-blue.png" alt="Vamaship" style="width: 140px; height: 70px; object-fit: contain;" />
          </div>
          
          <div class="flex items-center space-x-4">
            <button
              @click="router.push('/sign-in')"
              class="px-4 py-2 text-white rounded-md hover:opacity-90 font-medium transition-colors"
              style="background-color: #6A5ACD;"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div v-if="currentStep > 1" class="fixed inset-0 bg-cover bg-no-repeat pointer-events-none" style="background-image: url('/img/background-image.png?v=5'); background-position: center 30%;">
      <div class="absolute inset-0 bg-blue-900 bg-opacity-30"></div>
    </div>

    <div class="relative z-10 pt-20">
      <PhoneVerificationStep
        v-if="currentStep === 1"
        :form-data="formData"
        :loading="loading"
        :otp-sent="otpSent"
        :otp-cooldown="otpCooldown"
        :is-mobile-already-registered="isMobileAlreadyRegistered"
        :general-error="generalError"
        :errors="errors"
        :otp-inputs="otpInputs"
        :is-google-loaded="isGoogleLoaded"
        @send-otp="handleSendOtp"
        @resend-otp="handleSendOtp"
        @verify-otp="handleVerifyOtp"
        @go-to-signin="goToSignIn"
        @load-google-signin="loadGoogleSignInScript"
        @phone-input="(value) => { formData.phone = validatePhone(value); resetMobileRegistrationFlag(); }"
        @otp-input="handleOtpInput"
        @otp-keydown="handleOtpKeydown"
      />

      <UserDetailsStep
        v-if="currentStep === 2"
        :form-data="formData"
        :errors="errors"
        :general-error="generalError"
        :show-login-option="showLoginOption"
        :is-google-sign-in-user="isGoogleSignInUser"
        :google-phone-verified="googlePhoneVerified"
        :google-phone-otp-sent="googlePhoneOtpSent"
        :google-phone-otp-cooldown="googlePhoneOtpCooldown"
        :google-phone-otp-inputs="googlePhoneOtpInputs"
        :show-password="showPassword"
        :show-confirm-password="showConfirmPassword"
        :loading="loading"
        :is-step2-valid="isStep2Valid"
        @validate-full-name="validateFullName"
        @email-input="validateEmail"
        @phone-input="(value) => { formData.phone = validatePhone(value); resetMobileRegistrationFlag(); }"
        @validate-password="() => validatePasswordStrength(formData.password)"
        @toggle-password-visibility="(field) => { if (field === 'password') showPassword = !showPassword; else showConfirmPassword = !showConfirmPassword; }"
        @send-google-phone-otp="sendGooglePhoneOtp"
        @verify-google-phone-otp="verifyGooglePhoneOtp"
        @resend-google-phone-otp="resendGooglePhoneOtp"
        @google-phone-otp-input="handleGooglePhoneOtpInput"
        @google-phone-otp-keydown="handleGooglePhoneOtpKeydown"
        @next-step="nextStep"
        @prev-step="prevStep"
        @go-to-signin="goToSignIn"
        @log-network-error="console.error"
        @dismiss-error="() => generalError = ''"
      />

      <KYCVerificationStep
        v-if="currentStep === 3"
        :form-data="formData"
        :errors="errors"
        :general-error="generalError"
        :show-login-option="showLoginOption"
        :aadhaar-verified="aadhaarVerified"
        :show-aadhaar-section="showAadhaarSection"
        :aadhaar-otp-sent="aadhaarOtpSent"
        :aadhaar-otp-cooldown="aadhaarOtpCooldown"
        :aadhaar-otp-inputs="aadhaarOtpInputs"
        :show-gst-section="showGstSection"
        :gst-verifying="gstVerifying"
        :gst-verified="gstVerified"
        :show-pan-section="showPanSection"
        :pan-verifying="panVerifying"
        :pan-verified="panVerified"
        :show-bank-details="showBankDetails"
        :banks-list="banksList"
        :banks-loading="banksLoading"
        :banks-error="banksError"
        :is-other-bank="isOtherBank"
        :bank-verifying="bankVerifying"
        :bank-verified="bankVerified"
        :bank-counter-reset="bankCounterReset"
        :bank-attempts-exhausted="bankAttemptsExhausted"
        :loading="loading"
        :is-step3-valid="isStep3Valid"
        @go-to-signin="goToSignIn"
        @toggle-aadhaar-section="showAadhaarSection = !showAadhaarSection"
        @validate-aadhaar="(value) => validateAadhaar(value)"
        @send-aadhaar-otp="sendAadhaarOtp"
        @aadhaar-otp-input="handleAadhaarOtpInput"
        @aadhaar-otp-keydown="handleAadhaarOtpKeydown"
        @verify-aadhaar="verifyAadhaar"
        @resend-aadhaar-otp="resendAadhaarOtp"
        @set-business-type="(type: string) => formData.businessType = type as 'gst' | 'pan'"
        @toggle-gst-section="showGstSection = !showGstSection"
        @validate-gst-number="(value) => validateGstNumber(value)"
        @verify-gst="verifyGst"
        @toggle-pan-section="showPanSection = !showPanSection"
        @verify-pan="verifyPan"
        @validate-pincode="validatePincodeField"
        @toggle-bank-details="showBankDetails = !showBankDetails"
        @handle-bank-selection="handleBankSelection"
        @reset-bank-selection="resetBankSelection"
        @fetch-banks-list="fetchBanksList"
        @reset-bank-validation-attempts="resetBankValidationAttempts"
        @verify-bank="verifyBank"
        @prev-step="prevStep"
        @skip-kyc="handleSkipKyc"
        @complete-signup="handleCompleteSignup"
      />
    </div>
  </div>
</template>

<style scoped>
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

.gradient-bg {
  background: linear-gradient(to bottom right, #EAEFFC, #EDE6FF, #F5F5FA);
  position: relative;
  overflow: hidden;
}

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