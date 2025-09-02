<template>
  <div class="min-h-screen w-full relative overflow-hidden">
    <BackgroundElements />
    <div class="relative z-10 w-full h-full">
      <div class="max-w-6xl mx-auto px-4 py-6 h-full flex items-center">
        <!-- Mobile Layout -->
        <div class="lg:hidden space-y-6">
          <!-- Marketing Content - Moved to top -->
          <div class="space-y-8">
            <div class="space-y-2 text-center">
              <!-- Vamaship Logo -->
              <div class="flex justify-start mb-2">
                <img src="/images/vamaship-logo.png" alt="Vamaship" class="h-20 w-auto" />
              </div>
              
              <h1 class="text-4xl font-bold leading-tight pb-2 text-left" style="background: linear-gradient(135deg, #293773 0%, #6A5ACD 50%, #6A5ACD 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Start Shipping Smarter
              </h1>
              <p class="text-xl text-gray-900 font-medium">
                — in Just a Few Steps
              </p>
            </div>
          </div>

          <div class="space-y-6">
            <!-- Main Form -->
            <div class="bg-white rounded-lg p-8 shadow-lg max-w-md mx-auto min-w-md min-h-[400px]">
              <h2 class="text-xl font-semibold text-gray-900 mb-6 text-center">Start your seller account!</h2>
              
              <div class="space-y-3 max-w-sm mx-auto" v-if="!signupStore.otpSent">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div class="relative">
                    <input 
                      v-model="signupStore.formData.phone"
                      @input="handlePhoneInput"
                      type="tel" 
                      placeholder="Enter Phone Number" 
                      class="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all bg-white text-gray-900"
                      maxlength="10"
                      style="min-height: 48px;"
                    />
                    <div class="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                      <span class="text-gray-600 font-medium">+91</span>
                      <span class="text-gray-400 mx-3">|</span>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">We'll send a verification code to this number</p>
                </div>
                
                <!-- <div v-if="isMobileAlreadyRegistered" class="mt-2 text-center">
                  <p class="text-sm text-blue-600">
                    <i class="fas fa-info-circle mr-1"></i>
                    Mobile number <strong>{{ signupStore.formData.phone }}</strong> is already registered. 
                    <button
                      @click="goToLogin"
                      class="text-blue-700 hover:text-blue-800 underline font-medium ml-1"
                    >
                      Login here
                    </button>
                  </p>
                </div> -->
                
                <button 
                  v-if="!signupStore.otpSent"
                  @click="sendOtp"
                  :disabled="signupStore.formData.phone.length !== 10 || signupStore.isLoading"
                  class="w-full text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center"
                  :class="{
                    'opacity-50 cursor-not-allowed': signupStore.formData.phone.length !== 10 || signupStore.isLoading,
                    'hover:bg-opacity-90': signupStore.formData.phone.length === 10 && !signupStore.isLoading
                  }"
                  style="background-color: #6A5ACD;"
                >
                  <SpinnerLoader v-if="signupStore.isLoading" size="sm" class="mr-3" />
                  {{ signupStore.isLoading ? 'Sending...' : 'Send OTP' }}
                </button>
                
                <!-- Already have account section -->
                <div class="text-center mt-4">
                  <span class="text-sm text-gray-600">Already have an account? </span>
                  <button
                    @click="goToLogin"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                  >
                    Sign In
                  </button>
                </div>
                
                <div v-if="signupStore.errors.general" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div class="flex items-center">
                    <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    <span class="text-red-700 text-sm font-medium">{{ signupStore.errors.general }}</span>
                  </div>
                </div>
                
                <div v-if="signupStore.errors.phone" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div class="flex items-center">
                    <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    <span class="text-red-700 text-sm font-medium">{{ signupStore.errors.phone }}</span>
                  </div>
                </div>
              </div>

              <!-- OTP Section -->
              <div v-if="signupStore.otpSent" class="mt-4 pt-4">
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                  <div class="flex space-x-2 justify-center items-center">
                    <input 
                      v-for="(digit, index) in signupStore.formData.otp.slice(0, 3)" 
                      :key="index"
                      :ref="(el) => setOtpInputRef(el, index)"
                      v-model="signupStore.formData.otp[index]"
                      @input="handleOtpInput(index, $event)"
                      @keydown="handleOtpKeydown(index, $event)"
                      @click="handleOtpClick"
                      @paste="handleOtpPaste"
                      type="text" 
                      class="w-10 h-10 sm:w-12 sm:h-12 lg:w-12 lg:h-12 text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm lg:text-base bg-white text-gray-900" 
                      maxlength="1"
                      :data-otp-index="index"
                    />
                    <span class="text-2xl text-gray-400 font-bold mx-2">-</span>
                    <input 
                      v-for="(digit, index) in signupStore.formData.otp.slice(3, 6)" 
                      :key="index + 3"
                      :ref="(el) => setOtpInputRef(el, index + 3)"
                      v-model="signupStore.formData.otp[index + 3]"
                      @input="handleOtpInput(index + 3, $event)"
                      @keydown="handleOtpKeydown(index + 3, $event)"
                      @click="handleOtpClick"
                      @paste="handleOtpPaste"
                      type="text" 
                      class="w-10 h-10 sm:w-12 sm:h-12 lg:w-12 lg:h-12 text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm lg:text-base bg-white text-gray-900" 
                      maxlength="1"
                      :data-otp-index="index + 3"
                    />
                  </div>                      
                  <div v-if="signupStore.errors.otp" class="mt-2 text-center">
                    <p class="text-xs text-red-600 font-medium">
                      <i class="fas fa-exclamation-circle mr-1"></i>
                      {{ signupStore.errors.otp }}
                    </p>
                  </div>
                  
                  <div v-if="signupStore.otpCooldown > 0" class="mt-2 text-center">
                    <p class="text-xs text-gray-600">
                      Resend OTP in <span class="font-mono text-blue-600 font-semibold">{{ formatOtpTime(signupStore.otpCooldown) }}</span>
                    </p>
                  </div>
                  
                  <div v-if="signupStore.otpCooldown === 0" class="mt-2 text-center">
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
                  :disabled="!signupStore.isOtpComplete"
                  class="w-full text-white py-3 rounded-lg font-medium transition-all"
                  :class="{
                    'opacity-50 cursor-not-allowed': !signupStore.isOtpComplete,
                    'hover:bg-opacity-90': signupStore.isOtpComplete
                  }"
                  style="background-color: #6A5ACD;"
                >
                  Verify & Continue
                </button>
                
                <p class="text-xs text-gray-500 mt-3 text-center">By clicking on Continue, I agree to Vamaship's <a href="https://www.vamaship.com/terms-conditions" class="text-blue-600 hover:underline" target="_blank">Terms & Conditions</a> and <a href="https://www.vamaship.com/privacy-policy" class="text-blue-600 hover:underline" target="_blank">Privacy Policy</a>.</p>
                
                <!-- Change Number Option -->
                <div class="mt-4 text-center">
                  <button
                    @click="changeNumber"
                    class="text-gray-600 hover:text-gray-800 text-sm font-medium underline"
                  >
                    <i class="fas fa-arrow-left mr-1"></i>
                    Change Phone Number
                  </button>
                </div>
              </div>

              <!-- Google Sign-in -->
              <div v-if="!signupStore.otpSent" class="flex items-center my-4 max-w-sm mx-auto">
                <div class="flex-1 h-px bg-gray-300"></div>
                <span class="px-3 text-sm text-gray-500">or</span>
                <div class="flex-1 h-px bg-gray-300"></div>
              </div>

              <GoogleSignIn 
                v-if="!signupStore.otpSent" 
                :is-loading="authStore.isLoading"
                @googleSignIn="handleGoogleSignIn"
                @googleError="handleGoogleError"
              />

              <!-- Tracking Section -->
              <div v-if="!signupStore.otpSent" class="flex items-center my-4 max-w-sm mx-auto">
                <div class="flex-1 h-px bg-gray-300"></div>
                <!-- <span class="px-3 text-sm text-gray-500">Track your shipment</span> -->
                <div class="flex-1 h-px bg-gray-300"></div>
              </div>
              <div v-if="!signupStore.otpSent" class="max-w-sm mx-auto">
                <TrackingSection />
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Layout -->
        <div class="hidden lg:grid lg:grid-cols-2 gap-12 items-start">
          <!-- Left side - Marketing content -->
          <div class="space-y-8 sticky top-6">
            <div class="space-y-2">
              <!-- Vamaship Logo -->
              <div class="flex justify-start mb-2">
                <img src="/images/vamaship-logo.png" alt="Vamaship" class="h-24 w-auto" />
              </div>
              
              <h1 class="text-5xl font-bold leading-tight pb-2 text-left" style="background: linear-gradient(135deg, #293773 0%, #6A5ACD 50%, #6A5ACD 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Start Shipping Smarter
              </h1>
              <p class="text-2xl text-gray-900 font-medium">
                — in Just a Few Steps
              </p>
            </div>
            <div class="bg-transparent opacity-60">
              <video src="/images/worldwide.mp4" alt="Vamaship" class="h-100 w-auto mix-blend-multiply edge-blur" autoplay loop muted playsinline />
              <!-- <img src="/images/worldwide-unscreen.gif" alt="Vamaship" class="h-100 w-auto" /> -->
            </div>
          </div>

          <!-- Right side - Form -->
          <div class="lg:pl-8 my-16">
            <!-- Same form as mobile but with desktop styling -->
            <div class="bg-white rounded-lg p-8 shadow-lg max-w-lg mx-auto lg:ml-auto min-w-lg min-h-[400px]">
              <h2 class="text-xl font-semibold text-gray-900 mb-6 text-center">Start your seller account!</h2>
              
              <div class="space-y-3 max-w-m mx-auto" v-if="!signupStore.otpSent">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div class="relative">
                    <input 
                      v-model="signupStore.formData.phone"
                      @input="handlePhoneInput"
                      type="tel" 
                      placeholder="Enter Phone Number" 
                      class="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all bg-white text-gray-900"
                      maxlength="10"
                      style="min-height: 48px;"
                    />
                    <div class="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                      <span class="text-gray-600 font-medium">+91</span>
                      <span class="text-gray-400 mx-3">|</span>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">We'll send a verification code to this number</p>
                </div>
                
                <!-- <div v-if="isMobileAlreadyRegistered" class="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg">
                  <div class="text-center">
                    <p class="text-blue-800 mb-2 text-sm">
                      The mobile number <strong class="text-blue-900">{{ signupStore.formData.phone }}</strong> is already registered with Vamaship.
                    </p>
                    <button
                      @click="goToLogin"
                      class="inline-flex items-center px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <i class="fas fa-sign-in-alt mr-1.5 text-xs"></i>
                      Login Here
                    </button>
                  </div>
                </div> -->
                
                <button 
                  v-if="!signupStore.otpSent && !isMobileAlreadyRegistered"
                  @click="sendOtp"
                  :disabled="signupStore.formData.phone.length !== 10 || signupStore.isLoading"
                  class="w-full text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center"
                  :class="{
                    'opacity-80 cursor-not-allowed': signupStore.formData.phone.length !== 10 || signupStore.isLoading,
                    'hover:bg-opacity-90': signupStore.formData.phone.length === 10 && !signupStore.isLoading
                  }"
                  style="background-color: #6A5ACD;"
                >
                  <SpinnerLoader v-if="signupStore.isLoading" size="sm" class="mr-3" />
                  {{ signupStore.isLoading ? 'Sending...' : 'Send OTP' }}
                </button>
                
                <!-- Already have account section -->
                <div class="text-center mt-4">
                  <span class="text-sm text-gray-600">Already have an account? </span>
                  <button
                    @click="goToLogin"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                  >
                    Sign In
                  </button>
                </div>
                
                <div v-if="signupStore.errors.general" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div class="flex items-center">
                    <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    <span class="text-red-700 text-sm font-medium">{{ signupStore.errors.general }}</span>
                  </div>
                </div>
                
                <div v-if="signupStore.errors.phone" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div class="flex items-center">
                    <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    <span class="text-red-700 text-sm font-medium">{{ signupStore.errors.phone }}</span>
                  </div>
                </div>
              </div>

              <!-- OTP Section -->
              <div v-if="signupStore.otpSent" class="mt-4 flex-1">
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                  <div class="flex space-x-2 justify-center items-center">
                    <input 
                      v-for="(digit, index) in signupStore.formData.otp.slice(0, 3)" 
                      :key="index"
                      :ref="(el) => setOtpInputRef(el, index)"
                      v-model="signupStore.formData.otp[index]"
                      @input="handleOtpInput(index, $event)"
                      @keydown="handleOtpKeydown(index, $event)"
                      @click="handleOtpClick"
                      @paste="handleOtpPaste"
                      type="text" 
                      class="w-15 h-15 sm:w-12 sm:h-12 lg:w-15 lg:h-15 text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm lg:text-base bg-white text-gray-900" 
                      maxlength="1"
                      :data-otp-index="index"
                    />
                    <span class="text-2xl text-gray-400 font-bold mx-2">-</span>
                    <input 
                      v-for="(digit, index) in signupStore.formData.otp.slice(3, 6)" 
                      :key="index + 3"
                      :ref="(el) => setOtpInputRef(el, index + 3)"
                      v-model="signupStore.formData.otp[index + 3]"
                      @input="handleOtpInput(index + 3, $event)"
                      @keydown="handleOtpKeydown(index + 3, $event)"
                      @click="handleOtpClick"
                      @paste="handleOtpPaste"
                      type="text" 
                      class="w-15 h-15 sm:w-12 sm:h-12 lg:w-15 lg:h-15 text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm lg:text-base bg-white text-gray-900" 
                      maxlength="1"
                      :data-otp-index="index + 3"
                    />
                  </div>                      
                  <div v-if="signupStore.errors.otp" class="mt-2 text-center">
                    <p class="text-xs text-red-600 font-medium">
                      <i class="fas fa-exclamation-circle mr-1"></i>
                      {{ signupStore.errors.otp }}
                    </p>
                  </div>
                  
                  <div v-if="signupStore.otpCooldown > 0" class="mt-2 text-center">
                    <p class="text-xs text-gray-600">
                      Resend OTP in <span class="font-mono text-blue-600 font-semibold">{{ formatOtpTime(signupStore.otpCooldown) }}</span>
                    </p>
                  </div>
                  
                  <div v-if="signupStore.otpCooldown === 0" class="mt-2 text-center">
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
                  :disabled="!signupStore.isOtpComplete"
                  class="w-full text-white py-3 rounded-lg font-medium transition-all"
                  :class="{
                    'opacity-50 cursor-not-allowed': !signupStore.isOtpComplete,
                    'hover:bg-opacity-90': signupStore.isOtpComplete
                  }"
                  style="background-color: #6A5ACD;"
                >
                  Verify & Continue
                </button>
                
                <p class="text-xs text-gray-500 mt-3 text-center">By clicking on Continue, I agree to Vamaship's <a href="https://www.vamaship.com/terms-conditions" class="text-blue-600 hover:underline" target="_blank">Terms & Conditions</a> and <a href="https://www.vamaship.com/privacy-policy" class="text-blue-600 hover:underline" target="_blank">Privacy Policy</a>.</p>
                
                <!-- Change Number Option -->
                <div class="mt-4 text-center">
                  <button
                    @click="changeNumber"
                    class="text-gray-600 hover:text-gray-800 text-sm font-medium underline"
                  >
                    <!-- <i class="fas fa-arrow-left mr-1"></i> -->
                    Change Phone Number
                  </button>
                </div>
              </div>

              <!-- Google Sign-in -->
              <div v-if="!signupStore.otpSent" class="flex items-center my-4 max-w-sm mx-auto">
                <div class="flex-1 h-px bg-gray-300"></div>
                <span class="px-3 text-sm text-gray-500">or</span>
                <div class="flex-1 h-px bg-gray-300"></div>
              </div>

              <GoogleSignIn 
                v-if="!signupStore.otpSent" 
                :is-loading="authStore.isLoading"
                @googleSignIn="handleGoogleSignIn"
                @googleError="handleGoogleError"
              />

              <!-- Tracking Section -->
              <div v-if="!signupStore.otpSent" class="my-4 mx-auto">
                    <TrackingSection />
              </div>
            </div>
          </div>
          <div>
          </div>
        </div>
        <!-- End of Desktop Layout -->
      </div>
      <LogoCloud />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSignupStore } from '../../stores/signup'
import { useAuthStore } from '../../stores/auth'
import TrackingSection from '../../components/signup/TrackingSection.vue'
import GoogleSignIn from '../../components/common/GoogleSignIn.vue'
import SpinnerLoader from '../../components/common/SpinnerLoader.vue'
import LogoCloud from '../../components/common/LogoCloud.vue'
import BackgroundElements from '../../components/common/BackgroundElements.vue'

const router = useRouter()
const route = useRoute()
const signupStore = useSignupStore()
const authStore = useAuthStore()

const isMobileAlreadyRegistered = ref(false)
const otpInputRefs = ref<HTMLInputElement[]>([])

onMounted(() => {
  // Initialize from session if available
  signupStore.initializeFromSession()
})

const setOtpInputRef = (el: any, index: number) => {
  if (el && el.$el) {
    otpInputRefs.value[index] = el.$el
  } else if (el) {
    otpInputRefs.value[index] = el
  }
}

const handlePhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '')
  signupStore.formData.phone = value
  isMobileAlreadyRegistered.value = false
  signupStore.clearError('phone')
}

const sendOtp = async () => {
  const result = await signupStore.sendMobileOtp()
  // Check if the mobile number already exists (adjust based on actual API response structure)
  if (result && typeof result === 'object' && 'exists' in result && result.exists) {
    isMobileAlreadyRegistered.value = true
  }
}

const handleOtpInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '')
  
  // Update the OTP array
  signupStore.formData.otp[index] = value
  
  // Auto-focus to next input if value is entered and not at last input
  if (value && index < 5) {
    // Use setTimeout to ensure DOM is updated and focus works
    setTimeout(() => {
      const nextInput = otpInputRefs.value[index + 1]
      if (nextInput) {
        nextInput.focus()
        nextInput.select() // Select the text for easy replacement
      }
    }, 10) // Small delay to ensure DOM update
  }
  
  // Clear error when user starts typing
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
    // Fill the OTP inputs with pasted data
    for (let i = 0; i < Math.min(numbers.length, 6); i++) {
      signupStore.formData.otp[i] = numbers[i]
    }
    
    // Focus on the next empty input or the last filled input
    const nextEmptyIndex = Math.min(numbers.length, 6)
    if (nextEmptyIndex < 6) {
      setTimeout(() => {
        const nextInput = otpInputRefs.value[nextEmptyIndex]
        if (nextInput) {
          nextInput.focus()
          nextInput.select()
        }
      }, 10)
    }
  }
  
  signupStore.clearError('otp')
}

const handleOtpKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace') {
    // If current input is empty and backspace is pressed, go to previous input
    if (!signupStore.formData.otp[index] && index > 0) {
      event.preventDefault()
      const prevInput = otpInputRefs.value[index - 1]
      if (prevInput) {
        prevInput.focus()
        prevInput.select() // Select the text for easy replacement
      }
    }
  }
  
  // Handle arrow keys for navigation
  if (event.key === 'ArrowRight' && index < 5) {
    event.preventDefault()
    const nextInput = otpInputRefs.value[index + 1]
    if (nextInput) {
      nextInput.focus()
      nextInput.select()
    }
  }
  
  if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    const prevInput = otpInputRefs.value[index - 1]
    if (prevInput) {
      prevInput.focus()
      prevInput.select()
    }
  }
}

const verifyOtp = async () => {
  const result = await signupStore.verifyMobileOtp()
  if (result.success) {
    router.push('/signup/details')
  }
}

const resendOtp = () => {
  signupStore.resendMobileOtp()
}

const goToLogin = () => {
  router.push('/login')
}

const formatOtpTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleGoogleSignIn = async (credential: string) => {
  const res = await authStore.socialLoginWithGoogle({
    credential,
    reference: route.query.reference?.toString() ?? null,
    utm_medium: route.query.utm_medium?.toString() ?? null,
    utm_campaign: route.query.utm_campaign?.toString() ?? null,
    utm_source: route.query.utm_source?.toString() ?? null,
  })
  if (!res.success) {
    console.error(res.error)
  }
}

const handleGoogleError = (message: string) => {
  console.error('Google Sign-In error:', message)
}

const changeNumber = () => {
  // Reset the OTP state
  signupStore.formData.otp = ['', '', '', '', '', '']
  signupStore.otpSent = false
  signupStore.otpCooldown = 0
  signupStore.clearError('phone')
  signupStore.clearError('otp')
  isMobileAlreadyRegistered.value = false
  signupStore.formData.phone = ''
}


</script> 

<style scoped>
.edge-blur {
  display: block;
  -webkit-mask-image: radial-gradient(ellipse at center, #000 60%, rgba(0,0,0,0.85) 72%, rgba(0,0,0,0.5) 82%, transparent 100%);
  mask-image: radial-gradient(ellipse at center, #000 60%, rgba(0,0,0,0.85) 72%, rgba(0,0,0,0.5) 82%, transparent 100%);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
</style>