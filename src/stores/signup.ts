import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { signupService } from '@/services/signupService'
import { utilityService } from '@/services/utilityService'
import { SessionManager } from '@/utils/redirection'
import { useAuthStore } from '@/stores/auth'
import type { 
  SignupFormData, 
  SignupErrors, 
  MobileSession,
  UserDetails,
  MobileVerificationRequest,
  OTPVerificationRequest 
} from '@/types/signup'
import type { EntityType, PincodeData, BankData } from '@/types/utility'

export const useSignupStore = defineStore('signup', () => {
  // State
  const formData = ref<SignupFormData>({
    phone: '',
    countryCode: '+91',
    otp: ['', '', '', '', '', ''],
    fullName: '',
    email: '',
    brandName: '',
    password: '',
    confirmPassword: '',
    aadhaarNumber: '',
    aadhaarOtp: ['', '', '', '', '', ''],
    businessType: 'pan',
    entityType: '',
    entityName: '',
    panNumber: '',
    panPincode: '',
    billingAddress: '',
    gstNumber: '',
    gstPanNumber: '',
    branchName: '',
    gstAddress: '',
    gstPincode: '',
    unitType: '',
    beneficiaryName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  })

  // Referral/invite reference captured from query and forwarded to backend on user creation
  const inviteReference = ref<string | null>(null)

  const errors = ref<SignupErrors>({})
  const isLoading = ref(false)
  const currentStep = ref<1 | 2 | 3>(1)
  const mobileSession = ref<MobileSession | null>(null)

  // OTP related states
  const otpSent = ref(false)
  const otpCooldown = ref(0)
  const aadhaarOtpSent = ref(false)
  const aadhaarOtpCooldown = ref(0)

  // Verification states
  const aadhaarVerified = ref(false)
  const panVerified = ref(false)
  const gstVerified = ref(false)
  const bankVerified = ref(false)

  // UI states
  const showAadhaarSection = ref(false)
  const showPanSection = ref(false)
  const showGstSection = ref(false)
  const showBankDetails = ref(false)

  // API data states
  const entityTypes = ref<EntityType[]>([])
  const banksList = ref<BankData[]>([])
  const pincodeData = ref<PincodeData | null>(null)
  const isPincodeValid = ref(false)
  const isPincodeLoading = ref(false)

  // Marketing attribution (captured from route query and forwarded on create-user)
  const utmSource = ref<string | null>(null)
  const utmMedium = ref<string | null>(null)
  const utmCampaign = ref<string | null>(null)
  
  // GST verification data
  const gstVerificationData = ref<{
    address: string
    pincode: string
    entity_type: string
    legal_name: string
    unit_type: string
    pan: string
  } | null>(null)

  // Computed
  const isOtpComplete = computed(() => 
    formData.value.otp.every(digit => digit !== '')
  )

  const isAadhaarOtpComplete = computed(() =>
    formData.value.aadhaarOtp.every(digit => digit !== '')
  )

  const isStep2Valid = computed(() => {
    return !!(
      formData.value.fullName.trim() &&
      formData.value.email.trim() &&
      (!formData.value.password || formData.value.password.length >= 8) &&
      (!formData.value.password || formData.value.password === formData.value.confirmPassword) &&
      !Object.keys(errors.value).some(key => errors.value[key as keyof SignupErrors])
    )
  })

  const isStep3Valid = computed(() => {
    if (formData.value.businessType === 'pan') {
      return !!(
        formData.value.entityType &&
        formData.value.entityName.trim() &&
        formData.value.panNumber.trim() &&
        formData.value.billingAddress.trim() &&
        formData.value.beneficiaryName.trim() &&
        formData.value.bankName.trim() &&
        formData.value.accountNumber.trim() &&
        formData.value.ifscCode.trim() &&
        bankVerified.value
      )
    } else {
      return !!(
        formData.value.gstNumber.trim() &&
        formData.value.gstPanNumber.trim() &&
        formData.value.gstAddress.trim() &&
        formData.value.gstPincode.trim() &&
        formData.value.entityType.trim() &&
        formData.value.entityName.trim() &&
        formData.value.beneficiaryName.trim() &&
        formData.value.bankName.trim() &&
        formData.value.accountNumber.trim() &&
        formData.value.ifscCode.trim() &&
        gstVerified.value &&
        bankVerified.value
      )
    }
  })

  // Actions
  const clearErrors = () => {
    errors.value = {}
  }

  const setError = (field: keyof SignupErrors, message: string) => {
    errors.value[field] = message
  }

  const clearError = (field: keyof SignupErrors) => {
    delete errors.value[field]
  }

  // Step 1: Mobile verification
  const checkMobileExists = async (mobile: string, countryCode: string) => {
    try {
      const response = await signupService.checkMobileExists({ phone: mobile, countryCode })
      return response.exists
    } catch (error: any) {
      setError('general', error.message || 'Failed to check mobile number')
      return false
    }
  }

  const sendMobileOtp = async () => {
    if (!formData.value.phone || formData.value.phone.length !== 10) {
      setError('phone', 'Please enter a valid 10-digit mobile number')
      return { success: false }
    }

    try {
      isLoading.value = true
      clearErrors()

      // Check if mobile already exists
      const exists = await checkMobileExists(formData.value.phone, formData.value.countryCode)
      if (exists) {
        setError('phone', 'Mobile number already registered')
        return { success: false, exists: true }
      }

      await signupService.sendMobileOtp({
        phone: formData.value.phone,
        countryCode: formData.value.countryCode
      })

      otpSent.value = true
      startOtpCooldown()
      return { success: true }
    } catch (error: any) {
      setError('general', error.message || 'Failed to send OTP')
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  const verifyMobileOtp = async () => {
    if (!isOtpComplete.value) {
      setError('otp', 'Please enter complete OTP')
      return { success: false }
    }

    try {
      isLoading.value = true
      clearErrors()

      const otpString = formData.value.otp.join('')
      const result = await signupService.verifyMobileOtp({
        phone: formData.value.phone,
        countryCode: formData.value.countryCode,
        otp: otpString
      })
      console.log(result, 'result')
      console.log(result.result, 'result.result != 0')
      if (result.result == 0){
        setError('otp', 'Invalid OTP. Try again.')
        return { success: false }
      } 

      // Save mobile session
      SessionManager.saveMobileSession(formData.value.phone, formData.value.countryCode)
      mobileSession.value = SessionManager.getMobileSession()
      
      currentStep.value = 2
      return { success: true }
    } catch (error: any) {
      setError('otp', error.message || 'Invalid OTP')
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  const resendMobileOtp = async () => {
    if (otpCooldown.value > 0) return

    formData.value.otp = ['', '', '', '', '', '']
    return await sendMobileOtp()
  }

  const startOtpCooldown = () => {
    otpCooldown.value = 30
    const interval = setInterval(() => {
      otpCooldown.value--
      if (otpCooldown.value <= 0) {
        clearInterval(interval as any)
      }
    }, 1000)
  }

  // Step 2: User details
  const checkEmailExists = async (email: string) => {
    try {
      const response = await signupService.checkEmailExists(email)
      return response.exists
      return false;
    } catch (error: any) {
      setError('general', error.message || 'Failed to check email')
      return false
    }
  }

  const validateStep2 = async () => {
    clearErrors()
    let isValid = true

    // Full name validation
    if (!formData.value.fullName.trim()) {
      setError('fullName', 'Full name is required')
      isValid = false
    } else if (formData.value.fullName.trim().length < 2) {
      setError('fullName', 'Full name must be at least 2 characters')
      isValid = false
    }

    // Email validation
    if (!formData.value.email.trim()) {
      setError('email', 'Email is required')
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
      setError('email', 'Please enter a valid email address')
      isValid = false
    } else {
      // Check if email exists
      // const exists = await checkEmailExists(formData.value.email)
      const exists = false;
      if (exists) {
        setError('email', 'Email already registered')
        isValid = false
      }
    }

    // Brand name is optional; ensure no error is set

    // Password validation (optional for social flow)
    if (formData.value.password) {
      if (formData.value.password.length < 8) {
        setError('password', 'Password must be at least 8 characters')
        isValid = false
      }
      if (!formData.value.confirmPassword) {
        setError('confirmPassword', 'Please confirm your password')
        isValid = false
      } else if (formData.value.password !== formData.value.confirmPassword) {
        setError('confirmPassword', 'Passwords do not match')
        isValid = false
      }
    }

    return isValid
  }

  const createUser = async () => {
    if (!await validateStep2()) {
      return { success: false }
    }

    try {
      isLoading.value = true
      clearErrors()

      const [firstName, ...lastNameParts] = formData.value.fullName.trim().split(' ')
      const lastName = lastNameParts.join(' ') || firstName

      const userData = {
        email: formData.value.email,
        password: formData.value.password || undefined,
        firstName,
        lastName,
        mobile: formData.value.phone,
        brandName: formData.value.brandName?.trim() || ''
      }

      const response = await signupService.createUser({
        ...userData,
        reference: inviteReference.value,
        utm_medium: utmMedium.value ?? undefined,
        utm_campaign: utmCampaign.value ?? undefined,
        utm_source: utmSource.value ?? undefined,
      })
      
      const expires = new Date()
      expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000))
      document.cookie = `auth_token=${response.token};expires=${expires.toUTCString()};path=/`

      const authStore = useAuthStore()
      if(response.user) {
        authStore.user = response.user as any
        // Update the user's onboarding status to indicate details are completed
        authStore.updateOnboardingStatus('details_completed')
      } else {
        await authStore.checkAuth()
        // Update the user's onboarding status after fetching from backend
        authStore.updateOnboardingStatus('details_completed')
      }

      // Clear mobile session as user is now authenticated
      SessionManager.clearMobileSession()
      mobileSession.value = null
      
      currentStep.value = 3
      return { success: true, user: response.user, token: response.token }
    } catch (error: any) {
      const message = (error && error.message) ? String(error.message) : 'Failed to create account'
      // Map already-registered error to email field for better UX
      if (/already\s*registered/i.test(message) || /already\s*exists/i.test(message)) {
        setError('email', message)
      } else {
        setError('general', message)
      }
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  const completeSocialDetails = async () => {
    // For social flow, ensure mobile and brandName are present and OTP verified (mobileSession)
    clearErrors()
    if (!formData.value.phone || formData.value.phone.length !== 10) {
      setError('phone', 'Please enter a valid 10-digit mobile number')
      return { success: false }
    }

    try {
      isLoading.value = true
      const response = await signupService.updateSocialDetails({
        mobile: formData.value.phone,
        brandName: formData.value.brandName?.trim() || '',
      })

      // const expires = new Date()
      // expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000))
      // document.cookie = `auth_token=${response.token};expires=${expires.toUTCString()};path=/`

      const authStore = useAuthStore()
      if (response.user) {
        authStore.user = response.user as any
        authStore.updateOnboardingStatus('details_completed')
      } else {
        await authStore.checkAuth()
        authStore.updateOnboardingStatus('details_completed')
      }

      SessionManager.clearMobileSession()
      mobileSession.value = null
      currentStep.value = 3
      return { success: true }
    } catch (error: any) {
      setError('general', error.message || 'Failed to save details')
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  // Step 3: KYC methods
  const sendAadhaarOtp = async () => {
    if (!formData.value.aadhaarNumber || formData.value.aadhaarNumber.length !== 12) {
      setError('aadhaarNumber', 'Please enter a valid 12-digit Aadhaar number')
      return { success: false }
    }

    try {
      isLoading.value = true
      clearError('aadhaarNumber')

      await signupService.sendAadhaarOtp(formData.value.aadhaarNumber)
      aadhaarOtpSent.value = true
      startAadhaarOtpCooldown()
      return { success: true }
    } catch (error: any) {
      setError('aadhaarNumber', error.message || 'Failed to send Aadhaar OTP')
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  const verifyAadhaar = async () => {
    if (!isAadhaarOtpComplete.value) {
      setError('aadhaarOtp', 'Please enter complete OTP')
      return { success: false }
    }

    try {
      isLoading.value = true
      clearError('aadhaarOtp')

      const otpString = formData.value.aadhaarOtp.join('')
      await signupService.verifyAadhaar(formData.value.aadhaarNumber, otpString)
      
      aadhaarVerified.value = true
      showAadhaarSection.value = false
      
      // Save progress
      // await saveKycProgress('aadhaarData', {
      //   aadhaarNumber: formData.value.aadhaarNumber,
      //   verified: true,
      //   verificationDate: new Date().toISOString()
      // })

      return { success: true }
    } catch (error: any) {
      // On first failure, offer skip option
      setError('aadhaarOtp', error.message || 'Invalid OTP')
      return { success: false, canSkip: true }
    } finally {
      isLoading.value = false
    }
  }

  const startAadhaarOtpCooldown = () => {
    aadhaarOtpCooldown.value = 30
    const interval = setInterval(() => {
      aadhaarOtpCooldown.value--
      if (aadhaarOtpCooldown.value <= 0) {
        clearInterval(interval as any)
      }
    }, 1000)
  }

  const verifyPan = async () => {
    if (!formData.value.panNumber.trim()) {
      setError('panNumber', 'PAN number is required')
      return { success: false }
    }

    try {
      isLoading.value = true
      clearError('panNumber')

      await signupService.verifyPan(formData.value.panNumber)
      panVerified.value = true
      return { success: true }
    } catch (error: any) {
      setError('panNumber', error.message || 'Invalid PAN number')
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  const verifyGst = async () => {
    if (!formData.value.gstNumber.trim()) {
      setError('gstNumber', 'GST number is required')
      return { success: false }
    }

    try {
      isLoading.value = true
      clearError('gstNumber')

      const response = await signupService.verifyGst(formData.value.gstNumber)
      
      // Check if response has result or data property
      const gstData = response.result || (response as any).data || response
      
      // Check if we have GST data (either from result/data or directly)
      if (gstData && (gstData.pan || gstData.address)) {
        
        // Store the GST verification data
        gstVerificationData.value = gstData
        
        // Auto-fill the form fields with the verification data
        formData.value.gstPanNumber = gstData.pan || ''
        formData.value.gstAddress = gstData.address || ''
        formData.value.gstPincode = gstData.pincode || ''
        formData.value.unitType = gstData.unit_type || ''
        
        // Set entity type if available
        if (gstData.entity_type) {
          formData.value.entityType = gstData.entity_type
        }
        
        // Set entity name if available
        if (gstData.legal_name) {
          formData.value.entityName = gstData.legal_name
        }
        
        // Clear any previous errors for the auto-filled fields
        clearError('gstPanNumber')
        clearError('gstAddress')
        clearError('gstPincode')
        clearError('entityType')
        clearError('entityName')
        
        gstVerified.value = true
        return { success: true }
      } else {
        setError('gstNumber', 'GST verification failed')
        return { success: false }
      }
    } catch (error: any) {
      setError('gstNumber', error.message || 'Invalid GST number')
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  const verifyBank = async () => {
    if (!formData.value.accountNumber.trim() || !formData.value.ifscCode.trim()) {
      setError('accountNumber', 'Account details are required')
      return { success: false }
    }

    try {
      isLoading.value = true
      clearError('accountNumber')
      clearError('ifscCode')

      await signupService.verifyBank({
        accountNumber: formData.value.accountNumber,
        ifscCode: formData.value.ifscCode,
        beneficiaryName: formData.value.beneficiaryName
      })
      
      bankVerified.value = true
      
      // Save bank progress
      // await saveKycProgress('bankData', {
      //   beneficiaryName: formData.value.beneficiaryName,
      //   bankName: formData.value.bankName,
      //   accountNumber: formData.value.accountNumber,
      //   ifscCode: formData.value.ifscCode,
      //   verified: true
      // })

      return { success: true }
    } catch (error: any) {
      setError('accountNumber', error.message || 'Invalid bank details')
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  const saveKycProgress = async (section: string, data: any) => {
    try {
      await signupService.saveKycProgress(section, data)
    } catch (error) {
      console.error('Failed to save KYC progress:', error)
    }
  }

  const skipKyc = async () => {
    try {
      isLoading.value = true
      await signupService.skipKyc()
      
      // Update user's onboarding status to indicate KYC is completed (skipped)
      const authStore = useAuthStore()
      authStore.updateOnboardingStatus('kyc_completed')
      
      return { success: true }
    } catch (error: any) {
      setError('general', error.message || 'Failed to skip KYC')
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  const completeKyc = async () => {
    try {
      isLoading.value = true
      clearErrors()

      // Map form data to expected backend format
      let kycData: any

      if (formData.value.businessType === 'pan') {
        // PAN business type format
        kycData = {
          gst_registered: false,
          entity_name: formData.value.entityName,
          entity_type: formData.value.entityType,
          pan_number: formData.value.panNumber,
          address: {
            line1: formData.value.billingAddress,
            line2: '', // Not collected in current form
            pincode: parseInt(formData.value.panPincode) || 0,
            city: pincodeData.value?.city || '',
            state: pincodeData.value?.state || '',
            country: 'India' // Default to India
          },
          bank_details: [
            {
              beneficiary_name: formData.value.beneficiaryName,
              bank_name: formData.value.bankName,
              account_number: formData.value.accountNumber,
              ifsc_code: formData.value.ifscCode
            }
          ]
        }
      } else {
        // GST business type format
        kycData = {
          gst_registered: true,
          entity_name: formData.value.brandName || formData.value.entityName, // Use brand name if available
          entity_type: 'Business', // Default entity type for GST
          pan_number: formData.value.gstPanNumber, // Use the new GST PAN number field
          gst_details: [
            {
              gst_number: formData.value.gstNumber,
              branch_name: formData.value.branchName,
              address: formData.value.gstAddress,
              pincode: parseInt(formData.value.gstPincode) || 0,
              unit_type: formData.value.unitType // Use the new unit type field
            }
          ],
          bank_details: [
            {
              beneficiary_name: formData.value.beneficiaryName,
              bank_name: formData.value.bankName,
              account_number: formData.value.accountNumber,
              ifsc_code: formData.value.ifscCode
            }
          ]
        }
      }

      await signupService.completeKyc(kycData)

      // Update user's onboarding status to indicate KYC is completed
      const authStore = useAuthStore()
      authStore.updateOnboardingStatus('kyc_completed')

      return { success: true }
    } catch (error: any) {
      setError('general', error.message || 'Failed to complete KYC')
      return { success: false }
    } finally {
      isLoading.value = false
    }
  }

  // Initialize from session
  const initializeFromSession = () => {
    const session = SessionManager.getMobileSession()
    if (session) {
      mobileSession.value = session
      formData.value.phone = session.phone
      formData.value.countryCode = session.countryCode
      currentStep.value = 2
    }
  }

  const resetForm = () => {
    formData.value = {
      phone: '',
      countryCode: '+91',
      otp: ['', '', '', '', '', ''],
      fullName: '',
      email: '',
      brandName: '',
      password: '',
      confirmPassword: '',
      aadhaarNumber: '',
      aadhaarOtp: ['', '', '', '', '', ''],
      businessType: 'pan',
      entityType: '',
      entityName: '',
      panNumber: '',
      panPincode: '',
      billingAddress: '',
      gstNumber: '',
      gstPanNumber: '',
      branchName: '',
      gstAddress: '',
      gstPincode: '',
      unitType: '',
      beneficiaryName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: ''
    }
    errors.value = {}
    currentStep.value = 1
    // Reset all verification states
    aadhaarVerified.value = false
    panVerified.value = false
    gstVerified.value = false
    bankVerified.value = false
  }

  // API methods for utility data
  const fetchEntityTypes = async () => {
    try {
      isLoading.value = true
      const data = await utilityService.getEntityTypes()
      entityTypes.value = data.masters
    } catch (error: any) {
      console.error('Failed to fetch entity types:', error)
      setError('general', 'Failed to load entity types')
    } finally {
      isLoading.value = false
    }
  }

  const fetchBanksList = async () => {
    try {
      isLoading.value = true
      const data = await utilityService.getBanksList()
      banksList.value = data.banks
    } catch (error: any) {
      console.error('Failed to fetch banks list:', error)
      setError('general', 'Failed to load banks list')
    } finally {
      isLoading.value = false
    }
  }

  const verifyPincode = async (pincode: string) => {
    try {
      isPincodeLoading.value = true
      clearError('panPincode')
      
      if (!pincode || pincode.length !== 6) {
        setError('panPincode', 'Please enter a valid 6-digit pincode')
        isPincodeValid.value = false
        pincodeData.value = null
        return
      }

      const data = await utilityService.verifyPincode(pincode)
      pincodeData.value = data
      isPincodeValid.value = true
      clearError('panPincode')
    } catch (error: any) {
      console.error('Failed to verify pincode:', error)
      setError('panPincode', 'Invalid pincode. Please check and try again.')
      isPincodeValid.value = false
      pincodeData.value = null
    } finally {
      isPincodeLoading.value = false
    }
  }

  return {
    // State
    formData,
    errors,
    isLoading,
    currentStep,
    mobileSession,
    otpSent,
    otpCooldown,
    aadhaarOtpSent,
    aadhaarOtpCooldown,
    aadhaarVerified,
    panVerified,
    gstVerified,
    bankVerified,
    showAadhaarSection,
    showPanSection,
    showGstSection,
    showBankDetails,
    entityTypes,
    banksList,
    pincodeData,
    isPincodeValid,
    isPincodeLoading,
    gstVerificationData,
    inviteReference,
    utmSource,
    utmMedium,
    utmCampaign,
    
    // Computed
    isOtpComplete,
    isAadhaarOtpComplete,
    isStep2Valid,
    isStep3Valid,
    
    // Actions
    clearErrors,
    setError,
    clearError,
    checkMobileExists,
    sendMobileOtp,
    verifyMobileOtp,
    resendMobileOtp,
    checkEmailExists,
    validateStep2,
    createUser,
    sendAadhaarOtp,
    verifyAadhaar,
    verifyPan,
    verifyGst,
    verifyBank,
    saveKycProgress,
    skipKyc,
    completeKyc,
    completeSocialDetails,
    initializeFromSession,
    resetForm,
    fetchEntityTypes,
    fetchBanksList,
    verifyPincode
  }
}) 