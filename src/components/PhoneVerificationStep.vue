<template>
  <div class="min-h-screen w-full relative overflow-hidden" style="background: linear-gradient(135deg, #EAEFFC 0%, #EDE6FF 50%, #F5F5FA 100%); background-size: 100% 100%; background-position: center; background-repeat: no-repeat;">
    <div class="relative z-[2] w-full h-full">
      <div class="max-w-6xl mx-auto px-4 pt-0 pb-6 h-full">
        <div class="lg:hidden space-y-6">
          <div class="space-y-6">
            <!-- Main Form - Separate Shadow Box -->
            <div class="bg-white rounded-lg p-8 shadow-lg max-w-md mx-auto">
              <h2 class="text-xl font-semibold text-gray-900 mb-6 text-center">Start your seller account!</h2>
              
              <div class="space-y-3 max-w-sm mx-auto">
                <div>
                  <div class="relative">
                    <input 
                      v-model="formData.phone"
                      @input="handlePhoneInput"
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
                
                <div v-if="isMobileAlreadyRegistered" class="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg">
                  <div class="text-center">
                    <p class="text-blue-800 mb-2 text-sm">
                      The mobile number <strong class="text-blue-900">{{ formData.phone }}</strong> is already registered with Vamaship.
                    </p>
                    <button
                      @click="$emit('go-to-signin')"
                      class="inline-flex items-center px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                    >
                      <i class="fas fa-sign-in-alt mr-1.5 text-xs"></i>
                      Login Here
                    </button>
                  </div>
                </div>
                
                <button 
                  v-if="!otpSent && !isMobileAlreadyRegistered"
                  @click="sendOtp"
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
                
                <div v-if="generalError" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div class="flex items-center">
                    <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    <span class="text-red-700 text-sm font-medium">{{ generalError }}</span>
                  </div>
                </div>
                
                <div v-if="errors.phone" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div class="flex items-center">
                    <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    <span class="text-red-700 text-sm font-medium">{{ errors.phone }}</span>
                  </div>
                </div>
              </div>

              <div v-if="otpSent && !isMobileAlreadyRegistered" class="mt-4 pt-4 max-w-sm mx-auto">
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                  <div class="flex space-x-2 justify-center">
                    <input 
                      v-for="(input, index) in otpInputs" 
                      :key="index"
                      v-model="input.value"
                      @input="handleOtpInput(index, ($event.target as HTMLInputElement).value)"
                      @keydown="handleOtpKeydown(index, $event)"
                      type="text" 
                      class="w-10 h-10 sm:w-12 sm:h-12 lg:w-12 lg:h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm lg:text-base" 
                      maxlength="1"
                      :data-otp-index="index"
                    />
                  </div>                      
                  <div v-if="errors.otp" class="mt-2 text-center">
                    <p class="text-xs text-red-600 font-medium">
                      <i class="fas fa-exclamation-circle mr-1"></i>
                      {{ errors.otp }}
                    </p>
                  </div>
                  
                  <div v-if="otpCooldown > 0" class="mt-2 text-center">
                    <p class="text-xs text-gray-600">
                      Resend OTP in <span class="font-mono text-blue-600 font-semibold">{{ formatOtpTime(otpCooldown) }}</span>
                    </p>
                  </div>
                  
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

              <div class="flex items-center my-4 max-w-sm mx-auto">
                <div class="flex-1 h-px bg-gray-300"></div>
                <span class="px-3 text-sm text-gray-500">or</span>
                <div class="flex-1 h-px bg-gray-300"></div>
              </div>

              <div id="google-signin-button-mobile" class="w-full max-w-sm mx-auto"></div>
              <button 
                v-if="!isGoogleLoaded" 
                @click="$emit('load-google-signin')"
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

            <!-- Tracking Section - Separate Shadow Box -->
            <div class="mt-8 max-w-md mx-auto">
              <TrackingSection />
            </div>
          </div>

          <div class="space-y-8">
            <div class="space-y-2 text-center">
              <h1 class="text-4xl font-bold leading-tight pb-2" style="background: linear-gradient(135deg, #293773 0%, #6A5ACD 50%, #6A5ACD 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Start Shipping Smarter
              </h1>
              <p class="text-xl text-gray-900 font-medium">
                — in Just a Few Steps
              </p>
            </div>

            <div class="bg-white rounded-lg p-6 shadow-lg">
              <h3 class="text-lg font-semibold text-gray-900 text-center mb-4">Trusted by 5000+ Brands</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 justify-items-center opacity-60">
                <div v-for="i in 8" :key="i" class="h-12 w-32 bg-transparent rounded flex items-center justify-center p-2">
                  <img :src="`/images/brands/${i}.png`" :alt="`Brand ${i}`" class="h-8 w-auto object-contain" />
                </div>
              </div>
            </div>

            <div class="bg-transparent rounded-lg p-6 border border-purple-100">
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
        </div>

        <div class="hidden lg:grid lg:grid-cols-2 gap-12 items-start">
          
          <div class="space-y-8">
            <div class="space-y-2">
              <h1 class="text-5xl font-bold leading-tight pb-2" style="background: linear-gradient(135deg, #293773 0%, #6A5ACD 50%, #6A5ACD 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Start Shipping Smarter
              </h1>
              <p class="text-2xl text-gray-900 font-medium">
                — in Just a Few Steps
              </p>
            </div>

            <div class="bg-white rounded-lg p-6 shadow-lg">
              <h3 class="text-lg font-semibold text-gray-900 text-center mb-4">Trusted by 5000+ Brands</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 justify-items-center opacity-60">
                <div v-for="i in 8" :key="i" class="h-12 w-32 bg-transparent rounded flex items-center justify-center p-2">
                  <img :src="`/images/brands/${i}.png`" :alt="`Brand ${i}`" class="h-8 w-auto object-contain" />
                </div>
              </div>
            </div>

            <div class="bg-transparent rounded-lg p-6 border border-purple-100">
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

          <div class="lg:pl-8">
            <!-- Main Form - Separate Shadow Box -->
            <div class="bg-white rounded-lg p-8 shadow-lg mt-8 max-w-md mx-auto lg:ml-auto">
              <h2 class="text-xl font-semibold text-gray-900 mb-6 text-center">Start your seller account</h2>
              
              <div class="space-y-3 max-w-sm mx-auto">
                <div>
                  <div class="relative">
                    <input 
                      v-model="formData.phone"
                      @input="handlePhoneInput"
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
                
                <div v-if="isMobileAlreadyRegistered" class="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg">
                  <div class="text-center">
                    <p class="text-blue-800 mb-2 text-sm">
                      The mobile number <strong class="text-blue-900">{{ formData.phone }}</strong> is already registered with Vamaship.
                    </p>
                    <button
                      @click="$emit('go-to-signin')"
                      class="inline-flex items-center px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                    >
                      <i class="fas fa-sign-in-alt mr-1.5 text-xs"></i>
                      Login Here
                    </button>
                  </div>
                </div>
                
                <button 
                  v-if="!otpSent && !isMobileAlreadyRegistered"
                  @click="sendOtp"
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
                
                <div v-if="generalError" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div class="flex items-center">
                    <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    <span class="text-red-700 text-sm font-medium">{{ generalError }}</span>
                  </div>
                </div>
                
                <div v-if="errors.phone" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div class="flex items-center">
                    <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    <span class="text-red-700 text-sm font-medium">{{ errors.phone }}</span>
                  </div>
                </div>
              </div>

              <div v-if="otpSent && !isMobileAlreadyRegistered" class="mt-4 pt-4 max-w-sm mx-auto">
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                  <div class="flex space-x-2 justify-center">
                    <input 
                      v-for="(input, index) in otpInputs" 
                      :key="index"
                      v-model="input.value"
                      @input="handleOtpInput(index, ($event.target as HTMLInputElement).value)"
                      @keydown="handleOtpKeydown(index, $event)"
                      type="text" 
                      class="w-10 h-10 sm:w-12 sm:h-12 lg:w-12 lg:h-12 text-center border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm lg:text-base" 
                      maxlength="1"
                      :data-otp-index="index"
                    />
                  </div>                      
                  <div v-if="errors.otp" class="mt-2 text-center">
                    <p class="text-xs text-red-600 font-medium">
                      <i class="fas fa-exclamation-circle mr-1"></i>
                      {{ errors.otp }}
                    </p>
                  </div>
                  
                  <div v-if="otpCooldown > 0" class="mt-2 text-center">
                    <p class="text-xs text-gray-600">
                      Resend OTP in <span class="font-mono text-blue-600 font-semibold">{{ formatOtpTime(otpCooldown) }}</span>
                    </p>
                  </div>
                  
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

              <div class="flex items-center my-4 max-w-sm mx-auto">
                <div class="flex-1 h-px bg-gray-300"></div>
                <span class="px-3 text-sm text-gray-500">or</span>
                <div class="flex-1 h-px bg-gray-300"></div>
              </div>

              <div id="google-signin-button-desktop" class="w-full max-w-sm mx-auto"></div>
              <button 
                v-if="!isGoogleLoaded" 
                @click="$emit('load-google-signin')"
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

            <!-- Tracking Section - Separate Shadow Box -->
            <div class="mt-8 max-w-md mx-auto lg:ml-auto">
              <TrackingSection />
            </div>
          </div>
        </div>
      </div>
      
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TrackingSection from './TrackingSection.vue'


interface Props {
  formData: {
    phone: string
  }
  loading: boolean
  otpSent: boolean
  otpCooldown: number
  isMobileAlreadyRegistered: boolean
  generalError: string
  errors: Record<string, string>
  otpInputs: Array<{ value: string }>
  isGoogleLoaded: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'send-otp': []
  'resend-otp': []
  'verify-otp': []
  'go-to-signin': []
  'load-google-signin': []
  'phone-input': [value: string]
  'otp-input': [index: number, value: string]
  'otp-keydown': [index: number, event: KeyboardEvent]
}>()

const handlePhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  const validatedValue = validatePhone(value)
  
  if (value !== validatedValue) {
    target.value = validatedValue
  }
  
  emit('phone-input', validatedValue)
}

const validatePhone = (phone: string) => {
  return phone.replace(/\D/g, '').slice(0, 10)
}

const handleOtpInput = (index: number, value: string) => {
  emit('otp-input', index, value)
}

const handleOtpKeydown = (index: number, event: KeyboardEvent) => {
  emit('otp-keydown', index, event)
}

const sendOtp = () => {
  emit('send-otp')
}

const resendOtp = () => {
  emit('resend-otp')
}

const verifyOtp = () => {
  emit('verify-otp')
}

const isOtpComplete = computed(() => {
  return props.otpInputs.every(input => input.value !== '')
})

const formatOtpTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
:deep(body), :deep(html) {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
}

:deep(*) {
  box-sizing: border-box;
}

.min-h-screen {
  overflow-x: hidden;
  width: 100%;
  max-width: 100vw;
}

</style> 