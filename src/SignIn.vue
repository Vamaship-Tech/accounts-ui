<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import VamashipLogo from './components/VamashipLogo.vue'
import apiService from './services/api'
import { authService } from './services/auth'

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

// Google Sign-In Configuration
const GOOGLE_CLIENT_ID = '592769281718-u140kqa8ikgtks4usm5m47ds2kvdk6nm.apps.googleusercontent.com'
const isGoogleLoaded = ref(false)

// Form data
const formData = reactive({
  email: '',
  password: ''
})

// UI state
const isLoading = ref(false)
const errors = reactive({
  email: '',
  password: '',
  general: ''
})

// Clear all errors
const clearErrors = () => {
  errors.email = ''
  errors.password = ''
  errors.general = ''
}

// Handle API errors
const handleApiError = (error: any) => {
  console.error('Sign in error:', error)
  
  if (error.response?.data?.errors) {
    const apiErrors = error.response.data.errors
    if (apiErrors.email) errors.email = apiErrors.email[0]
    if (apiErrors.password) errors.password = apiErrors.password[0]
  } else if (error.response?.data?.message) {
    errors.general = error.response.data.message
  } else if (error.message) {
    errors.general = error.message
  } else {
    errors.general = 'An unexpected error occurred. Please try again.'
  }
}

// Validate form
const validateForm = () => {
  clearErrors()
  let isValid = true

  if (!formData.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  if (!formData.password.trim()) {
    errors.password = 'Password is required'
    isValid = false
  }

  return isValid
}

// Handle sign in
const handleSignIn = async () => {
  if (!validateForm()) return

  try {
    isLoading.value = true
    clearErrors()

    console.log('Sign in attempt:', { email: formData.email })

    // Call the login API
    const response = await apiService.login(formData.email, formData.password)
    
    console.log('Login response:', response)

    if (response.success && response.data) {
      // Store authentication tokens
      const tokens = {
        accessToken: response.data.token,
        refreshToken: response.data.refresh_token || '',
        expiresAt: Date.now() + (5 * 24 * 60 * 60 * 1000) // 5 days
      }
      
      authService.setTokens(tokens)

      // Store user data if available
      if (response.data.user) {
        const userData = {
          id: response.data.user.id,
          name: response.data.user.name || response.data.user.first_name + ' ' + response.data.user.last_name,
          email: response.data.user.email,
          phone: response.data.user.mobile_no,
          accountType: response.data.user.account_type || 'seller',
          brandName: response.data.user.brand_name,
          isEmailVerified: response.data.user.email_verification === 1,
          isMobileVerified: response.data.user.mobile_verification === 1,
          kycCompleted: response.data.user.kyc_status === 1
        }
        authService.setUser(userData)
      }

      // Check if user has multiple entities (301/302 response)
      if (response.data.entities && response.data.entities.length > 1) {
        // Redirect to entity selection
        router.push({
          name: 'entity.choose',
          params: {
            token: response.data.token,
            entities: response.data.entities,
          }
        })
        return
      }

      // Check completion status and redirect accordingly
      const completionStatus = response.data.result
      let redirectUrl = ''

      if (completionStatus === 'otp_verification_pending') {
        redirectUrl = '/verification'
      } else if (completionStatus === 'kyc_pending') {
        redirectUrl = '/kyc'
      } else if (completionStatus === 'completed' || completionStatus === 'aadhaar_verification_pending') {
        // User is registered (even if KYC pending), redirect to ecom3-ui dashboard
        const apiKey = response.data.api_key || response.data.token
        redirectUrl = `http://localhost:8080/orders?api_key=${apiKey}`
      } else {
        // Default redirect to dashboard
        redirectUrl = '/dashboard'
      }

      console.log('Redirecting to:', redirectUrl)
      
      if (redirectUrl.startsWith('http')) {
        // External redirect to ecom3-ui
        window.location.href = redirectUrl
      } else {
        // Internal redirect
        router.push(redirectUrl)
      }

    } else {
      errors.general = response.message || 'Login failed. Please try again.'
    }

  } catch (error: any) {
    handleApiError(error)
  } finally {
    isLoading.value = false
  }
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
    isLoading.value = true
    clearErrors()
    
    console.log('Google Sign-In response received:', response)
    
    // Parse the JWT token to get user info
    const profile = parseJwt(response.credential)
    
    console.log('Google Sign-In successful:', profile)
    
    // Call the Google login API
    const loginResponse = await apiService.googleLogin(
      profile.email,
      response.credential,
      profile.given_name,
      profile.family_name
    )
    
    console.log('Google login API response:', loginResponse)
    
    if (loginResponse.success && loginResponse.data?.token) {
      // Store the token
      localStorage.setItem('accessToken', loginResponse.data.token)
      
      // Redirect to ecom3-ui dashboard
      const apiKey = loginResponse.data.token
      const dashboardUrl = `http://localhost:8080/orders?api_key=${apiKey}`
      window.location.href = dashboardUrl
    } else {
      // Handle login failure
      errors.general = loginResponse.message || 'Google login failed. Please try again.'
    }
    
  } catch (error: any) {
    console.error('Google Sign-In error:', error)
    
    // Handle specific Google OAuth errors
    if (error.error === 'origin_mismatch') {
      errors.general = 'Google Sign-In configuration error. Please contact support.'
    } else if (error.error === 'popup_closed_by_user') {
      // User closed the popup, don't show error
      console.log('User closed Google Sign-In popup')
    } else if (error.error === 'access_denied') {
      errors.general = 'Google Sign-In was denied. Please try again.'
    } else if (error.error === 'invalid_client') {
      errors.general = 'Google Sign-In configuration error. Please contact support.'
    } else {
      errors.general = 'Google Sign-In failed. Please try again.'
    }
  } finally {
    isLoading.value = false
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
  console.log('Loading Google Sign-In script...')
  
  if (typeof window !== 'undefined' && !window.google) {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log('Google Sign-In script loaded successfully')
      initializeGoogleSignIn()
    }
    script.onerror = (error) => {
      console.error('Failed to load Google Sign-In script:', error)
      errors.general = 'Failed to load Google Sign-In. Please refresh the page and try again.'
    }
    document.head.appendChild(script)
  } else if (typeof window !== 'undefined' && window.google) {
    console.log('Google Sign-In already available')
    initializeGoogleSignIn()
  }
}

// Handle Google sign in
const handleGoogleSignIn = () => {
  console.log('Google sign in clicked')
  loadGoogleSignInScript()
}

// Handle Enter key press
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleSignIn()
  }
}

// Pre-fill email from localStorage if available
onMounted(() => {
  const prefillEmail = localStorage.getItem('prefillEmail')
  if (prefillEmail) {
    formData.email = prefillEmail
    // Clear the stored email after pre-filling
    localStorage.removeItem('prefillEmail')
  }
  
  // Initialize Google Sign-In
  loadGoogleSignInScript()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute inset-0 bg-pattern"></div>
    </div>

    <!-- Navigation Header -->
    <nav class="relative z-10 p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div class="flex items-center">
          <VamashipLogo />
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

    <!-- Main Content -->
    <div class="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12">
      <div class="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
        <!-- Large Envelope Icon -->
        <div class="flex justify-center mb-4 sm:mb-6">
          <svg class="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-gray-800 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
        </div>

        <!-- Sign In Title -->
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-4 sm:mb-6">Sign In</h1>

        <!-- Error Banner -->
        <div v-if="errors.general" class="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-2 sm:ml-3">
              <p class="text-xs sm:text-sm text-red-800">{{ errors.general }}</p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSignIn" class="space-y-4 sm:space-y-6">
          <!-- Email Field -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              v-model="formData.email"
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

          <!-- Password Field -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              v-model="formData.password"
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

          <!-- Forgot Password Link -->
          <div class="text-left">
            <router-link to="/forgot-password" class="text-xs sm:text-sm text-purple-600 hover:text-purple-800">
              Forgot your password?
            </router-link>
          </div>

          <!-- Sign In Button -->
          <button 
            type="submit"
            :disabled="isLoading"
            :class="[
              'w-full py-2 sm:py-3 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base',
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            ]"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing In...
            </span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <!-- Separator -->
        <div class="relative my-4 sm:my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-xs sm:text-sm">
            <span class="px-2 bg-gradient-to-br from-purple-50 to-blue-50 text-gray-500">Or Sign in with</span>
          </div>
        </div>

        <!-- Google Sign In -->
        <div id="google-signin-button" class="w-full"></div>
        
        <!-- Fallback button if Google Sign-In fails to load -->
        <button 
          v-if="!isGoogleLoaded"
          @click="loadGoogleSignInScript"
          :disabled="isLoading"
          class="w-full flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <!-- Register Link -->
        <div class="text-center mt-4 sm:mt-6">
          <p class="text-xs sm:text-sm text-gray-600">
            Don't have an account? 
            <router-link to="/sign-up" class="text-purple-600 hover:text-purple-800 font-semibold">
              Register Now
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
