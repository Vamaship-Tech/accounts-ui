<template>
  <div class="min-h-screen flex items-center justify-center p-4 lg:p-8 relative">
    <!-- Background image for desktop only -->
    <div class="hidden lg:block absolute inset-0 z-0">
      <img 
        src="/img/customer-panel.png" 
        alt="Background" 
        class="w-full h-full object-cover"
        style="filter: blur(1px);"
      />
    </div>
    
    <div class="w-full lg:w-3/5 relative z-10">
      <div class="mb-4 lg:hidden">
          <img src="/images/vamaship-logo.png" alt="Vamaship" class="h-16 mx-auto" />
        </div>
      <div class="flex shadow-2xl border border-gray-200 rounded-2xl overflow-hidden">
        
        <!-- Left panel - hidden on mobile, visible on lg and above -->
        <div class="hidden lg:flex bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 lg:p-12 flex-[0.5] relative overflow-hidden">
          <!-- Decorative background elements -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200 rounded-full opacity-20 translate-y-12 -translate-x-12"></div>
          
          <!-- Content container -->
          <div class="relative z-10 h-full flex flex-col justify-center">
            <!-- Icon -->
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
                <i class="fas fa-user-plus text-2xl text-white"></i>
              </div>
            </div>
            
            <!-- Main heading -->
            <div class="text-center mb-6">
              <h2 class="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-4">
                Welcome to Vamaship
              </h2>
              <p class="text-gray-700 text-lg leading-relaxed">
                Let's create your personalized shipping experience. Tell us about yourself and we'll tailor everything just for you.
              </p>
            </div>
            
            <!-- Feature highlights -->
            <div class="space-y-4 mt-8">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i class="fas fa-check text-green-600 text-sm"></i>
                </div>
                <span class="text-gray-700 font-medium">Quick & easy setup</span>
              </div>
              
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i class="fas fa-shield-alt text-blue-600 text-sm"></i>
                </div>
                <span class="text-gray-700 font-medium">Secure & reliable</span>
              </div>
              
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <i class="fas fa-rocket text-purple-600 text-sm"></i>
                </div>
                <span class="text-gray-700 font-medium">Get started in minutes</span>
              </div>
            </div>
            
            <!-- Progress indicator -->
            <div class="mt-auto pt-6">
              <div class="text-center">
                <div class="flex items-center justify-center space-x-2 mb-2">
                  <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
                <p class="text-sm text-gray-600 font-medium">Step 1 of 2</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Form panel - full width on mobile, flex-1 on desktop -->
        <div class="bg-white p-6 lg:p-8 w-full lg:flex-1">
          <!-- Mobile-only header with icon and title -->
          <div class="lg:hidden mb-6">
            <div class="relative rounded-xl p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
              <div class="flex items-center">
                <div class="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md mr-3">
                  <i class="fas fa-user-plus text-white"></i>
                </div>
                <div class="flex-1">
                  <h2 class="text-lg font-semibold text-gray-900">{{ isSocialFlow ? 'Verify Mobile Number' : 'Profile Setup' }}</h2>
                  <p class="text-xs text-gray-600">{{ isSocialFlow ? 'Add your mobile to continue' : 'Tell us a few details to continue' }}</p>
                </div>
                <div class="ml-3" v-if="!isSocialFlow">
                  <span class="text-xs font-medium text-indigo-700 bg-white/70 px-2 py-1 rounded-md border border-indigo-200">Step 1 of 2</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop header -->
          <div class="hidden lg:block text-center mb-8">
            <h2 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-1">{{ isSocialFlow ? 'Verify Mobile Number' : 'Profile Setup' }}</h2>
            <p class="text-gray-600">{{ isSocialFlow ? 'Add your mobile to continue' : 'Complete your account details' }}</p>
          </div>

          <div v-if="signupStore.errors.general" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div class="flex items-start">
              <i class="fas fa-exclamation-circle text-red-500 mr-3 mt-0.5"></i>
              <div class="flex-1">
                <span class="text-red-700 text-sm font-medium">{{ signupStore.errors.general }}</span>
              </div>
            </div>
          </div>

          <div v-if="showLoginOption" class="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg">
            <div class="text-center">
              <p class="text-blue-800 mb-0 text-sm">
                Looks like this invite link is already registered with Vamaship.
                <button @click="goToLogin" class="ml-1 text-blue-700 hover:text-blue-900 underline text-xs">
                  Login here
                </button> to get started.
              </p>
            </div>
          </div>

          <div v-if="isSocialFlow" class="space-y-3 lg:space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Mobile Number <span class="text-red-500">*</span></label>
              <div class="relative">
                <input 
                  v-model="signupStore.formData.phone"
                  type="tel" 
                  placeholder="Enter Phone Number" 
                  class="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all bg-white text-gray-900"
                  maxlength="10"
                />
                <div class="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  <span class="text-gray-600 font-medium">+91</span>
                  <span class="text-gray-400 mx-3">|</span>
                </div>
              </div>
              <p v-if="signupStore.errors.phone" class="mt-1 text-sm text-red-600">{{ signupStore.errors.phone }}</p>
            </div>

            <div v-if="!signupStore.otpSent">
              <button 
                @click="sendOtp"
                :disabled="signupStore.formData.phone.length !== 10 || signupStore.isLoading"
                class="w-full text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center"
                :class="{
                  'opacity-50 cursor-not-allowed': signupStore.formData.phone.length !== 10 || signupStore.isLoading,
                  'hover:bg-opacity-90': signupStore.formData.phone.length === 10 && !signupStore.isLoading
                }"
                style="background-color: #6A5ACD;"
              >
                {{ signupStore.isLoading ? 'Sending...' : 'Send OTP' }}
              </button>
            </div>

            <div v-else>
              <label class="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
              <div class="flex space-x-2 justify-start items-center" ref="otpContainerRef">
                <input 
                  v-for="(digit, index) in signupStore.formData.otp" 
                  :key="index"
                  :ref="(el) => setOtpInputRef(el, index)"
                  v-model="signupStore.formData.otp[index]"
                  @input="handleOtpInput(index, $event)"
                  @keyup="handleOtpKeyup(index, $event)"
                  @keydown="handleOtpKeydown(index, $event)"
                  @click="handleOtpClick"
                  @paste="handleOtpPaste"
                  @focus="handleOtpFocus"
                  :data-otp-index="index"
                  type="tel" 
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  pattern="[0-9]*"
                  class="w-10 h-10 text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm bg-white text-gray-900" 
                  maxlength="1"
                />
              </div>
              <div class="mt-3">
                <button 
                  @click="verifyOtp"
                  :disabled="!signupStore.isOtpComplete"
                  class="w-full text-white py-3 rounded-lg font-medium transition-all"
                  :class="{
                    'opacity-50 cursor-not-allowed': !signupStore.isOtpComplete,
                    'hover:bg-opacity-90': signupStore.isOtpComplete
                  }"
                  style="background-color: #6A5ACD;"
                >
                  Verify OTP
                </button>
              </div>
            </div>

            
          </div>

          <div v-else class="space-y-3 lg:space-y-4">
            <!-- original non-social form -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Full Name <span class="text-red-500">*</span></label>
              <input
                v-model="signupStore.formData.fullName"
                @input="validateFullName"
                @blur="validateFullName"
                @keyup.enter="nextStep"
                type="text"
                placeholder="Enter your full name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
                :class="{ 'border-red-500': signupStore.errors.fullName }"
              />
              <p v-if="signupStore.errors.fullName" class="mt-1 text-sm text-red-600">{{ signupStore.errors.fullName }}</p>
              <p v-else class="mt-1 text-xs text-gray-500">Please enter your complete name including first and last name</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email Address <span class="text-red-500">*</span></label>
              <input
                v-model="signupStore.formData.email"
                @input="handleEmailInput"
                @keyup.enter="nextStep"
                type="email"
                placeholder="Enter your email address"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': signupStore.errors.email }"
              />
              <p v-if="signupStore.errors.email" class="mt-1 text-sm text-red-600">{{ signupStore.errors.email }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Brand Name <span class="text-gray-400 font-normal">(optional)</span></label>
              <input
                v-model="signupStore.formData.brandName"
                @keyup.enter="nextStep"
                type="text"
                placeholder="Enter your brand name"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': signupStore.errors.brandName }"
              />
              <p v-if="signupStore.errors.brandName" class="mt-1 text-sm text-red-600">{{ signupStore.errors.brandName }}</p>
              <p class="mt-1 text-xs text-gray-500">Your company/brand name</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password <span class="text-red-500">*</span></label>
              <div class="relative">
                <input
                  v-model="signupStore.formData.password"
                  @input="validatePassword"
                  @keyup.enter="nextStep"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Create a strong password"
                  class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': signupStore.errors.password }"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility('password')"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-gray-400"></i>
                </button>
              </div>
              <p v-if="signupStore.errors.password" class="mt-1 text-sm text-red-600">{{ signupStore.errors.password }}</p>
              <p class="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password <span class="text-red-500">*</span></label>
              <div class="relative">
                <input
                  v-model="signupStore.formData.confirmPassword"
                  @input="validatePassword"
                  @keyup.enter="nextStep"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm your password"
                  class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': signupStore.errors.confirmPassword, 'border-green-500': signupStore.formData.password && signupStore.formData.confirmPassword && signupStore.formData.password === signupStore.formData.confirmPassword }"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility('confirmPassword')"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-gray-400"></i>
                </button>
              </div>
              <p v-if="signupStore.errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ signupStore.errors.confirmPassword }}</p>
              <p v-else-if="signupStore.formData.password && signupStore.formData.confirmPassword && signupStore.formData.password === signupStore.formData.confirmPassword" class="mt-1 text-sm text-green-600">
                <i class="fas fa-check-circle mr-1"></i>Passwords match
              </p>
            </div>

            <div class="flex space-x-3 mt-6 lg:mt-8">
              <button
                @click="nextStep"
                :disabled="!signupStore.isStep2Valid"
                class="flex-1 text-white py-2 px-4 rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed font-semibold bg-blue-600"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSignupStore } from '@/stores/signup'
import { useAuthStore } from '@/stores/auth'
import { UserRedirection } from '@/utils/redirection'
import ProgressIndicator from '@/components/signup/ProgressIndicator.vue'

const router = useRouter()
const route = useRoute()
const signupStore = useSignupStore()
const authStore = useAuthStore()

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showLoginOption = ref(false)

onMounted(() => {
  // Check if we have a valid mobile session
  if (!signupStore.mobileSession) {
    router.push('/signup/mobile')
  }
  // Capture invite reference from query for normal flow
  if (!isSocialFlow.value) {
    const reference = route.query.reference?.toString() || null
    signupStore.inviteReference = reference
  }
})

const isSocialFlow = computed(() => route.query.social === '1')

const sendOtp = async () => {
  await signupStore.sendMobileOtp()
}

const verifyOtp = async () => {
  const result = await signupStore.verifyMobileOtp()
  if (!result.success) return
  // After OTP success in social flow, complete social details to get auth, then go to KYC
  const res = await signupStore.completeSocialDetails()
  if (res.success) {
    router.push('/signup/kyc')
  }
}

// Removed submitSocialDetails: OTP verification directly navigates to KYC in social flow

const validateFullName = () => {
  if (!signupStore.formData.fullName.trim()) {
    signupStore.setError('fullName', 'Full name is required')
  } else if (signupStore.formData.fullName.trim().length < 2) {
    signupStore.setError('fullName', 'Full name must be at least 2 characters')
  } else {
    signupStore.clearError('fullName')
  }
}

const handleEmailInput = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const email = target.value
  
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    try {
      const exists = await signupStore.checkEmailExists(email)
      if (exists) {
        showLoginOption.value = true
        signupStore.setError('email', 'Email already registered')
      } else {
        showLoginOption.value = false
        signupStore.clearError('email')
      }
    } catch (error) {
      // Error handling is done in the store
    }
  } else {
    showLoginOption.value = false
    signupStore.clearError('email')
  }
}

// Also surface login CTA if backend returns an already-registered email error
watch(() => signupStore.errors.email, (val) => {
  if (val && /already\s*(registered|exists)/i.test(val)) {
    showLoginOption.value = true
  }
})

const validatePassword = () => {
  if (!signupStore.formData.password) {
    signupStore.setError('password', 'Password is required')
  } else if (signupStore.formData.password.length < 8) {
    signupStore.setError('password', 'Password must be at least 8 characters')
  } else {
    signupStore.clearError('password')
  }

  if (!signupStore.formData.confirmPassword) {
    signupStore.setError('confirmPassword', 'Please confirm your password')
  } else if (signupStore.formData.password !== signupStore.formData.confirmPassword) {
    signupStore.setError('confirmPassword', 'Passwords do not match')
  } else {
    signupStore.clearError('confirmPassword')
  }
}

const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
  if (field === 'password') {
    showPassword.value = !showPassword.value
  } else {
    showConfirmPassword.value = !showConfirmPassword.value
  }
}

const prevStep = () => {
  router.push('/signup/mobile')
}

const nextStep = async () => {
  if (!signupStore.isStep2Valid) return
  
  const result = await signupStore.createUser()
  if (result.success) {
    await authStore.checkAuth()
    if (authStore.user) {
      UserRedirection.redirectBasedOnStatus(authStore.user as any)
    } else {
      router.push('/signup/kyc')
    }
  }
}

const goToLogin = () => {
  router.push('/login')
}

// OTP input focus management (mirrors MobileVerificationView)
const otpInputRefs = ref<HTMLInputElement[]>([])
const otpContainerRef = ref<HTMLElement | null>(null)

const setOtpInputRef = (el: any, index: number) => {
  if (el && el.$el) {
    otpInputRefs.value[index] = el.$el as HTMLInputElement
  } else if (el) {
    otpInputRefs.value[index] = el as HTMLInputElement
  }
}

const findVisibleOtpInput = (index: number): HTMLInputElement | null => {
  const candidates = document.querySelectorAll<HTMLInputElement>(`input[data-otp-index='${index}']`)
  for (const el of Array.from(candidates)) {
    if (el && el.offsetParent !== null) {
      return el
    }
  }
  return otpInputRefs.value[index] ?? null
}

const focusOtpInput = (index: number) => {
  if (index < 0 || index > 5) return
  const attemptFocus = () => {
    const input: HTMLInputElement | null = findVisibleOtpInput(index)
    if (input) {
      try {
        input.focus()
        input.select()
      } catch (_) {}
    }
  }
  attemptFocus()
  nextTick(() => {
    requestAnimationFrame(() => attemptFocus())
  })
}

const handleOtpInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '')
  signupStore.formData.otp[index] = value
  if (value && index < 5) {
    setTimeout(() => {
      focusOtpInput(index + 1)
    }, 0)
  }
  if (value) {
    signupStore.clearError('otp')
  }
}

const handleOtpClick = (event: Event) => {
  const target = event.target as HTMLInputElement
  target.select()
}

const handleOtpPaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text/plain') || ''
  const numbers = pastedData.replace(/[^0-9]/g, '').slice(0, 6)
  if (numbers.length > 0) {
    for (let i = 0; i < Math.min(numbers.length, 6); i++) {
      signupStore.formData.otp[i] = numbers[i]
    }
    const nextEmptyIndex = Math.min(numbers.length, 6)
    if (nextEmptyIndex < 6) {
      setTimeout(() => {
        focusOtpInput(nextEmptyIndex)
      }, 10)
    }
  }
  signupStore.clearError('otp')
}

const handleOtpKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace') {
    if (!signupStore.formData.otp[index] && index > 0) {
      event.preventDefault()
      focusOtpInput(index - 1)
    }
  }
  if (event.key === 'ArrowRight' && index < 5) {
    event.preventDefault()
    focusOtpInput(index + 1)
  }
  if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    focusOtpInput(index - 1)
  }
}

const handleOtpKeyup = (index: number, event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '')
  if (value && index < 5) {
    setTimeout(() => {
      focusOtpInput(index + 1)
    }, 0)
  }
}

const handleOtpFocus = (event: Event) => {
  const target = event.target as HTMLInputElement
  target.select()
}

watch(() => signupStore.otpSent, (isSent) => {
  if (isSent) {
    nextTick(() => {
      focusOtpInput(0)
    })
  }
})
</script> 