import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import { UserRedirection } from '@/utils/redirection'
import type { User, LoginCredentials, RegisterData, KYCData } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const isCheckingAuth = ref(false)
  const error = ref<string | null>(null)
  const authCheckError = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const kycCompleted = computed(() => user.value?.kycStatus === 'completed')
  const kycSkipped = computed(() => user.value?.kycStatus === 'skipped')

  // Check authentication status on app start
  const checkAuth = async () => {
    try {
      isCheckingAuth.value = true
      isLoading.value = true
      error.value = null
      authCheckError.value = null
      
      const token = getCookie('auth_token')
      
      if (!token) {
        user.value = null
        return
      }

      const userData = await authService.getCurrentUser()
      user.value = userData
    } catch (err: any) {
      console.error('Auth check failed:', err)
      user.value = null
      removeCookie('auth_token')
      
      // Set a user-friendly error message
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        authCheckError.value = 'Your session has expired. Please log in again.'
      } else if (err.message?.includes('Network error')) {
        authCheckError.value = 'Unable to connect to the server. Please check your internet connection.'
      } else {
        authCheckError.value = err.message || 'Authentication failed. Please try again.'
      }
    } finally {
      isCheckingAuth.value = false
      isLoading.value = false
    }
  }

  // Login user
  const login = async (credentials: LoginCredentials) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { token, result } = await authService.login(credentials)
      
      // Set JWT token in HTTP-only cookie (handled by backend)
      setCookie('auth_token', token, 7) // 7 days expiry
      
      await useAuthStore().checkAuth()
      
      // Check if user needs redirection based on onboarding status
      UserRedirection.checkAndRedirectOnLogin(String(result))
      
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Register user
  const register = async (userData: RegisterData) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { user: newUser, token } = await authService.register(userData)
      
      // Set JWT token in HTTP-only cookie (handled by backend)
      setCookie('auth_token', token, 7) // 7 days expiry
      
      user.value = newUser
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Registration failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Logout user
  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      removeCookie('auth_token')
    }
  }

  // Social login via Google using ID token credential and route params
  const socialLoginWithGoogle = async (payload: {
    credential: string
    reference?: string | null
    utm_medium?: string | null
    utm_campaign?: string | null
    utm_source?: string | null
  }) => {
    try {
      isLoading.value = true
      error.value = null

      // Parse JWT to extract profile
      const profile = parseJwt(payload.credential)
      const request = {
        first_name: profile?.name || null,
        last_name: profile?.name || null,
        email: profile?.email,
        password: null,
        mobile_no: null,
        reference: payload.reference ?? null,
        utm_medium: payload.utm_medium ?? null,
        utm_campaign: payload.utm_campaign ?? null,
        utm_source: payload.utm_source ?? null,
        logged_in_using: 'google' as const,
        calling_code: '91',
      }

      const { token } = await authService.socialAuth(request)
      setCookie('auth_token', token, 7)

      await checkAuth()

      // After fetching user, redirect based on onboarding
      if (user.value) {
        UserRedirection.redirectBasedOnStatus(user.value)
      }

      return { success: true }
    } catch (err: any) {
      error.value = err?.message || 'Google sign-in failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Submit KYC
  const submitKYC = async (kycData: KYCData) => {
    try {
      isLoading.value = true
      error.value = null
      
      const updatedUser = await authService.submitKYC(kycData)
      user.value = updatedUser
      
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'KYC submission failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Skip KYC
  const skipKYC = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const updatedUser = await authService.skipKYC()
      user.value = updatedUser
      
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Failed to skip KYC'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Forgot password
  const forgotPassword = async (data: { email: string }) => {
    try {
      error.value = null
      
      await authService.forgotPassword(data)
      return { success: true }
    } catch (err: any) {
      // Normalize error to a readable string from Error or backend response
      const message = err?.message || (typeof err === 'string' ? err : null) || 'Failed to send reset link'
      error.value = message
      return { success: false, error: error.value }
    } 
  }

  // Redirect to main app
  const redirectToMainApp = () => {
    UserRedirection.redirectToMainApp()
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Clear auth check error (global overlay)
  const clearAuthCheckError = () => {
    authCheckError.value = null
  }

  // Update user onboarding status
  const updateOnboardingStatus = (status: 'mobile_verified' | 'details_completed' | 'kyc_completed') => {
    if (user.value) {
      user.value.onboardingStatus = status
    }
  }

  return {
    user,
    isLoading,
    isCheckingAuth,
    error,
    authCheckError,
    isAuthenticated,
    isAdmin,
    kycCompleted,
    kycSkipped,
    checkAuth,
    login,
    register,
    logout,
    socialLoginWithGoogle,
    submitKYC,
    skipKYC,
    forgotPassword,
    redirectToMainApp,
    clearError,
    clearAuthCheckError,
    updateOnboardingStatus
  }
})

// Cookie utility functions
function setCookie(name: string, value: string, days: number) {
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

function getCookie(name: string): string | null {
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

function removeCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
} 

// JWT parse helper for social login
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  } catch {
    return {}
  }
}