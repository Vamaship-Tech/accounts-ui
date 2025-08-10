<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import apiService from '../services/api'

const router = useRouter()
const route = useRoute()

const formData = reactive({
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const success = ref(false)
const error = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const token = ref('')

onMounted(() => {
  const urlToken = route.query.token as string
  if (urlToken) {
    token.value = urlToken
  } else {
    router.push('/forgot-password')
  }
})

const validatePassword = (password: string): boolean => {
  if (!password) {
    passwordError.value = 'Password is required'
    return false
  }
  if (password.length < 8) {
    passwordError.value = 'Password must be at least 8 characters long'
    return false
  }
  if (!/(?=.*[a-z])/.test(password)) {
    passwordError.value = 'Password must contain at least one lowercase letter'
    return false
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    passwordError.value = 'Password must contain at least one uppercase letter'
    return false
  }
  if (!/(?=.*\d)/.test(password)) {
    passwordError.value = 'Password must contain at least one number'
    return false
  }
  passwordError.value = ''
  return true
}

const validateConfirmPassword = (confirmPassword: string): boolean => {
  if (!confirmPassword) {
    confirmPasswordError.value = 'Please confirm your password'
    return false
  }
  if (confirmPassword !== formData.password) {
    confirmPasswordError.value = 'Passwords do not match'
    return false
  }
  confirmPasswordError.value = ''
  return true
}

const clearFieldError = (field: string) => {
  if (field === 'password') {
    passwordError.value = ''
  }
  if (field === 'confirmPassword') {
    confirmPasswordError.value = ''
  }
  error.value = ''
}

const handleResetPassword = async () => {
  error.value = ''
  
  const isPasswordValid = validatePassword(formData.password)
  const isConfirmPasswordValid = validateConfirmPassword(formData.confirmPassword)
  
  if (!isPasswordValid || !isConfirmPasswordValid) {
    return
  }

  if (!token.value) {
    error.value = 'Invalid reset link. Please request a new password reset.'
    return
  }

  loading.value = true

  try {
    const response = await apiService.resetPassword(token.value, formData.password, formData.confirmPassword)
    
    if (response.success) {
      success.value = true
      formData.password = ''
      formData.confirmPassword = ''
    } else {
      error.value = response.message || 'Failed to reset password. Please try again.'
    }
  } catch (err: any) {
    error.value = err.message || 'Network error occurred. Please check your connection.'
  } finally {
    loading.value = false
  }
}

const goToSignIn = () => {
  router.push('/sign-in')
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 relative overflow-hidden">
    <div class="absolute inset-0 opacity-5">
      <div class="absolute inset-0 bg-pattern"></div>
    </div>

    <nav class="relative z-10 p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div class="flex items-center">
          <img src="/images/logo-blue.png" alt="Vamaship" class="h-8 sm:h-10" />
        </div>
        <div class="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm justify-center sm:justify-end">
          <router-link to="/sign-in" class="text-purple-700 hover:text-purple-900 font-semibold">Sign In</router-link>
          <span class="text-purple-700 hidden sm:inline">|</span>
          <router-link to="/sign-up" class="text-purple-700 hover:text-purple-900">Sign Up</router-link>
          <span class="text-purple-700 hidden sm:inline">|</span>
          <router-link to="/forgot-password" class="text-purple-700 hover:text-purple-900">Forgot Password</router-link>
        </div>
      </div>
    </nav>

    <div class="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12">
              <div class="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
        <div class="flex justify-center mb-4 sm:mb-6">
          <svg class="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-gray-800 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
          </svg>
        </div>

        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4 sm:mb-6">Reset Password</h1>
        <div v-if="success" class="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-4 w-4 sm:h-5 sm:w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-2 sm:ml-3">
              <p class="text-xs sm:text-sm text-green-800 font-medium">Password reset successful!</p>
              <p class="text-xs sm:text-sm text-green-700 mt-1">
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
            </div>
          </div>
        </div>

        <div v-if="error" class="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-2 sm:ml-3">
              <p class="text-xs sm:text-sm text-red-800">{{ error }}</p>
            </div>
          </div>
        </div>

        <form v-if="!success" @submit.prevent="handleResetPassword" class="space-y-4 sm:space-y-6">
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div class="relative">
              <input
                v-model="formData.password"
                @input="clearFieldError('password')"
                @blur="validatePassword(formData.password)"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your new password"
                :class="[
                  'w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base',
                  passwordError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                ]"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg v-if="showPassword" class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                </svg>
                <svg v-else class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
            </div>
            <p v-if="passwordError" class="mt-1 text-xs sm:text-sm text-red-600">{{ passwordError }}</p>
            <p v-else class="mt-1 text-xs sm:text-sm text-gray-500">
              Password must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <div class="relative">
              <input
                v-model="formData.confirmPassword"
                @input="clearFieldError('confirmPassword')"
                @blur="validateConfirmPassword(formData.confirmPassword)"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirm your new password"
                :class="[
                  'w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base',
                  confirmPasswordError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                ]"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg v-if="showConfirmPassword" class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                </svg>
                <svg v-else class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              </button>
            </div>
            <p v-if="confirmPasswordError" class="mt-1 text-xs sm:text-sm text-red-600">{{ confirmPasswordError }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading || !formData.password || !formData.confirmPassword"
            class="w-full py-2 sm:py-3 px-4 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            :class="[
              (loading || !formData.password || !formData.confirmPassword) 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700'
            ]"
          >
            <span v-if="loading">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Resetting...
            </span>
            <span v-else>Reset Password</span>
          </button>
        </form>

        <div class="mt-6 space-y-3">
          <button
            v-if="success"
            @click="goToSignIn"
            class="w-full py-2 sm:py-3 px-4 text-white rounded-lg font-medium transition-colors text-sm sm:text-base bg-purple-600 hover:bg-purple-700"
          >
            Sign In
          </button>

          <button
            v-if="!success"
            @click="goToSignIn"
            class="w-full py-2 sm:py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm sm:text-base"
          >
            Back to Sign In
          </button>

          <button
            v-if="!success"
            @click="goToForgotPassword"
            class="w-full py-2 sm:py-3 px-4 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-colors text-sm sm:text-base"
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 