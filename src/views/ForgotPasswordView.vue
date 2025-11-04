<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 relative overflow-hidden">
    <BackgroundElements />

    <div class="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12">
      <div class="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
        <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <!-- <div class="flex justify-center mb-4 sm:mb-6">
            <img src="/images/vamaship-logo.png" alt="Vamaship Logo" style="width: 140px; height: 70px;" />
          </div> -->

          <div v-if="isSuccess" class="text-center py-4 sm:py-6">
            <div class="flex justify-center mb-4 sm:mb-6">
              <svg viewBox="0 0 120 120" class="h-16 w-16 sm:h-20 sm:w-20" aria-hidden="true">
                <defs>
                  <linearGradient id="success-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#22c55e" />
                    <stop offset="100%" stop-color="#16a34a" />
                  </linearGradient>
                  <linearGradient id="success-bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#a855f7" />
                    <stop offset="100%" stop-color="#3b82f6" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="50" fill="url(#success-bg)" opacity="0.12" class="svg-float" />
                <circle cx="60" cy="60" r="28" fill="url(#success-grad)" opacity="0.95" class="pop-in" />
                <path d="M48 60 l9 9 l15 -17" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" class="check-path" />
              </svg>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Check your email</h2>
            <p class="mt-2 text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
              We sent a password reset link to your email. Follow the instructions to set a new password.
            </p>
            <div class="mt-4 sm:mt-6">
              <button @click="goToSignIn" class="w-full py-2 sm:py-3 px-4 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm sm:text-base">
                Back to Sign In
              </button>
            </div>
          </div>

          <span v-else>
          <div class="flex justify-center mb-4 sm:mb-6">
            <svg viewBox="0 0 120 120" class="h-16 w-16 sm:h-20 sm:w-20" aria-hidden="true">
              <defs>
                <linearGradient id="fp-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#a855f7" />
                  <stop offset="100%" stop-color="#3b82f6" />
                </linearGradient>
                <linearGradient id="fp-grad-2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#a78bfa" />
                  <stop offset="100%" stop-color="#60a5fa" />
                </linearGradient>
              </defs>
              <circle cx="60" cy="60" r="50" fill="url(#fp-grad)" opacity="0.12" />
              <rect x="35" y="58" width="50" height="33" rx="8" fill="url(#fp-grad-2)" opacity="0.95" />
              <path d="M45 58 v-8 a15 15 0 0 1 30 0 v8" fill="none" stroke="url(#fp-grad)" stroke-width="6" stroke-linecap="round" opacity="0.9" />
              <circle cx="60" cy="74" r="5" fill="#ffffff" opacity="0.95" />
              <rect x="58.4" y="74" width="3.2" height="8.5" rx="1.6" fill="#ffffff" opacity="0.95" />
              <g fill="url(#fp-grad)">
                <circle cx="22" cy="32" r="2" opacity="0.45" />
                <circle cx="96" cy="26" r="1.6" opacity="0.45" />
                <circle cx="100" cy="88" r="2" opacity="0.45" />
              </g>
            </svg>
          </div>
          <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center">Forgot Password</h1>
          <p class="mt-2 text-xs sm:text-sm text-gray-600 text-center mb-4 sm:mb-6">
            It happens—please enter the email address associated with your Vamaship account.
          </p>
          </span>

          <form v-if="!isSuccess" @submit.prevent="handleForgotPassword" class="space-y-4 sm:space-y-6">
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                v-model="form.email"
                @input="clearFieldError('email')"
                @blur="validateEmail(form.email)"
                type="email"
                placeholder="Enter your email address"
                :class="[
                  'w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base',
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                ]"
                :disabled="isLoading"
              />
              <p v-if="errors.email" class="mt-1 text-xs sm:text-sm text-red-600">{{ errors.email }}</p>
            </div>

            <div v-if="authStore.error" class="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-2 sm:ml-3">
                  <p class="text-xs sm:text-sm text-red-800">{{ authStore.error }}</p>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              :disabled="isLoading || !form.email"
              :class="[
                'w-full py-2 sm:py-3 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base',
                (isLoading || !form.email) 
                  ? 'bg-purple-400 cursor-not-allowed text-white' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              ]"
            >
              <span v-if="isLoading" class="flex items-center justify-center">
                <SpinnerLoader size="sm" class="mr-3" />
                Sending...
              </span>
              <span v-else>Send Reset Link</span>
            </button>
          </form>

          <div v-if="!isSuccess" class="mt-6 text-center">
              <button 
                @click="goToSignIn" 
                class="text-purple-500 hover:text-purple-800 underline sm:text-sm text-xs"
              >
                Back to Sign In
              </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SpinnerLoader from '@/components/common/SpinnerLoader.vue'
import BackgroundElements from '@/components/common/BackgroundElements.vue'

const router = useRouter()
const authStore = useAuthStore()

const isSuccess = ref(false)
const isLoading = ref(false)
const form = reactive({
  email: ''
})

const errors = reactive({
  email: ''
})

onMounted(() => {
  authStore.clearError()
})

const validateEmail = (email: string): boolean => {
  if (!email) {
    errors.email = 'Email is required'
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address'
    return false
  }
  
  errors.email = ''
  return true
}

const clearFieldError = (field: keyof typeof errors) => {
  if (errors[field]) {
    errors[field] = ''
  }
}

const handleForgotPassword = async () => {
  if (!validateEmail(form.email)) {
    return
  }

  isLoading.value = true
  isSuccess.value = false
  authStore.clearError()

  const result = await authStore.forgotPassword({ email: form.email })
  if (result?.success) {
    isSuccess.value = true
  }
  isLoading.value = false
}

const goToSignIn = () => {
  router.push('/login')
}

const goToSignUp = () => {
  router.push('/signup')
}
</script> 

<style scoped>
@keyframes floatY {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.6; }
}

@keyframes drawCheck {
  0% { stroke-dasharray: 0 100; }
  100% { stroke-dasharray: 100 0; }
}

.svg-float { animation: floatY 3s ease-in-out infinite; }
.pop-in { animation: popIn 400ms ease-out 100ms both; }
.pop-in-slow { animation: popIn 500ms ease-out 150ms both; }
.twinkle { animation: twinkle 2.2s ease-in-out infinite; }
.twinkle-1 { animation-delay: 0.2s; }
.twinkle-2 { animation-delay: 0.8s; }
.twinkle-3 { animation-delay: 1.4s; }
.check-path {
  stroke-dasharray: 100 0;
  animation: drawCheck 600ms ease-out 200ms both;
}
.shackle-bounce { animation: floatY 2.6s ease-in-out infinite; }
</style>