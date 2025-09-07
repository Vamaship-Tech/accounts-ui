<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 relative overflow-hidden">
    <BackgroundElements />

    <div class="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-6 lg:px-8 sm:-mt-12">
      <div class="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
        <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div class="flex justify-center mb-4 sm:mb-6">
            <img src="/images/vamaship-logo.png" alt="Vamaship Logo" style="width: 140px; height: 70px;" />
          </div>

          <div class="text-center mb-4 sm:mb-6">
            <h1 class="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {{ greeting }}
            </h1>
            <p class="mt-1 text-xs sm:text-sm text-gray-500">Welcome to Vamaship — sign in to continue.</p>
          </div>

          <div v-if="authStore.error" class="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-2 sm:ml-3">
                <p class="text-xs sm:text-sm text-red-800">{{ authStore.error }}</p>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleLogin" class="space-y-4 sm:space-y-6">
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                v-model="form.email"
                @keypress="handleKeyPress"
                :class="[
                  'w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base',
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                ]"
                placeholder="Enter your email" 
                required 
              />
              <p v-if="errors.email" class="mt-1 text-xs sm:text-sm text-red-600">{{ errors.email }}</p>
            </div>

            <div class="relative">
              <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                v-model="form.password"
                @keypress="handleKeyPress"
                :class="[
                  'w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base',
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                ]"
                placeholder="Enter your password" 
                required 
              />
              <p v-if="errors.password" class="mt-1 text-xs sm:text-sm text-red-600">{{ errors.password }}</p>
            </div>

            <div class="text-left">
              <router-link to="/forgot-password" class="text-xs sm:text-sm text-purple-600 hover:text-purple-800">
                Forgot your password?
              </router-link>
            </div>

            <button 
              type="submit"
              :disabled="authStore.isLoading"
              :class="[
                'w-full py-2 sm:py-3 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base',
                authStore.isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              ]"
            >
              <span v-if="authStore.isLoading" class="flex items-center justify-center">
                <SpinnerLoader size="sm" class="mr-3" />
                Signing In...
              </span>
              <span v-else>Sign In</span>
            </button>
          </form>

          <div class="relative my-4 sm:my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-xs sm:text-sm">
              <span class="px-2 bg-white text-gray-500">Or Sign in with</span>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3">
            <GoogleSignIn 
              :is-loading="authStore.isLoading"
              @googleSignIn="handleGoogleSignIn"
              @googleError="handleGoogleError"
            />
            
          </div>

          <div class="text-center mt-4 sm:mt-6">
            <p class="text-xs sm:text-sm text-gray-600">
              Don't have an account? 
              <router-link to="/signup" class="text-purple-600 hover:text-purple-800 font-semibold">
                Sign Up Now
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import GoogleSignIn from '@/components/common/GoogleSignIn.vue'
import type { LoginCredentials } from '@/types/auth'
import SpinnerLoader from '@/components/common/SpinnerLoader.vue'
import Banner from '@/components/common/Banner.vue'
import BackgroundElements from '@/components/common/BackgroundElements.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive<LoginCredentials>({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning \uD83D\uDC4B'
  if (hour < 18) return 'Good afternoon \u2600\uFE0F'
  return 'Good evening \uD83C\uDF19'
})

onMounted(() => {
  authStore.clearError()
})

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleLogin()
  }
}

const validateForm = (): boolean => {
  let isValid = true
  
  // Reset errors
  errors.email = ''
  errors.password = ''
  
  // Email validation
  if (!form.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }
  
  // Password validation
  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  }
  
  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return
  
  const result = await authStore.login(form)
  
  if (result.success) {
    // The auth store will handle redirection based on user's onboarding status
    // No need to manually redirect here
  }
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
    // Optionally show a toast/banner; authStore.error already set
    console.error(res.error)
  }
}

const handleGoogleError = (message: string) => {
  console.error('Google Sign-In error:', message)
}

</script> 