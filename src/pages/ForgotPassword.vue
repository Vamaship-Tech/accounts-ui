<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import apiService from '../services/api'

const router = useRouter()

const formData = reactive({
  email: ''
})

const loading = ref(false)
const success = ref(false)
const error = ref('')
const emailError = ref('')

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    emailError.value = 'Email is required'
    return false
  }
  if (!emailRegex.test(email)) {
    emailError.value = 'Please enter a valid email address'
    return false
  }
  emailError.value = ''
  return true
}

const clearFieldError = (field: string) => {
  if (field === 'email') {
    emailError.value = ''
  }
  error.value = ''
}

const handleForgotPassword = async () => {
  error.value = ''
  
  if (!validateEmail(formData.email)) {
    return
  }

  loading.value = true

  try {
    const response = await apiService.forgotPassword(formData.email)
    
    if (response.success) {
      success.value = true
      formData.email = ''
    } else {
      error.value = response.message || 'Failed to send reset link. Please try again.'
    }
  } catch (err: any) {
    console.error('Forgot password error:', err)
    error.value = err.message || 'Network error occurred. Please check your connection.'
  } finally {
    loading.value = false
  }
}

const goToSignIn = () => {
  router.push('/sign-in')
}

const goToSignUp = () => {
  router.push('/sign-up')
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>

        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4 sm:mb-6">Forgot Password</h1>

        <div v-if="success" class="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-4 w-4 sm:h-5 sm:w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-2 sm:ml-3">
              <p class="text-xs sm:text-sm text-green-800 font-medium">Reset link sent!</p>
              <p class="text-xs sm:text-sm text-green-700 mt-1">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
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

        <form v-if="!success" @submit.prevent="handleForgotPassword" class="space-y-4 sm:space-y-6">
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              v-model="formData.email"
              @input="clearFieldError('email')"
              @blur="validateEmail(formData.email)"
              type="email"
              placeholder="Enter your email address"
              :class="[
                'w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm sm:text-base',
                emailError ? 'border-red-300 bg-red-50' : 'border-gray-300'
              ]"
              :disabled="loading"
            />
            <p v-if="emailError" class="mt-1 text-xs sm:text-sm text-red-600">{{ emailError }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading || !formData.email"
            class="w-full py-2 sm:py-3 px-4 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            :class="[
              (loading || !formData.email) 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700'
            ]"
          >
            <span v-if="loading">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
            <span v-else>Send Reset Link</span>
          </button>
        </form>

        <div class="mt-6 space-y-3">
          <button
            @click="goToSignIn"
            class="w-full py-2 sm:py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm sm:text-base"
          >
            Back to Sign In
          </button>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-gradient-to-br from-purple-50 to-blue-50 text-gray-500">OR</span>
            </div>
          </div>

          <button
            @click="goToSignUp"
            class="w-full py-2 sm:py-3 px-4 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-colors text-sm sm:text-base"
          >
            Create New Account
          </button>
        </div>

        <div class="mt-6 text-center">
          <p class="text-xs sm:text-sm text-gray-500">
            Don't see the email? Check your spam folder or 
            <button 
              @click="handleForgotPassword" 
              :disabled="loading"
              class="text-purple-600 hover:text-purple-800 font-medium"
            >
              try again
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
