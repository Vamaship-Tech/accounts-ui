import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import { UserRedirection } from '@/utils/redirection'
import type { User, LoginCredentials, RegisterData, KYCData, ResetPasswordData } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const kycCompleted = computed(() => user.value?.kycStatus === 'completed')
  const kycSkipped = computed(() => user.value?.kycStatus === 'skipped')

  // Check authentication status on app start
  const checkAuth = async () => {
    try {
      isLoading.value = true
      error.value = null
      
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
        error.value = 'Your session has expired. Please log in again.'
      } else if (err.message?.includes('Network error')) {
        error.value = 'Unable to connect to the server. Please check your internet connection.'
      } else {
        error.value = err.message || 'Authentication failed. Please try again.'
      }
    } finally {
      isLoading.value = false
    }
  }

  // Login user
  const login = async (credentials: LoginCredentials) => {
    try {
      isLoading.value = true
      error.value = null
      
      const { user: userData, token } = await authService.login(credentials)
      
      // Set JWT token in HTTP-only cookie (handled by backend)
      setCookie('auth_token', token, 7) // 7 days expiry
      
      user.value = userData
      
      // Check if user needs redirection based on onboarding status
      UserRedirection.checkAndRedirectOnLogin(userData)
      
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
      isLoading.value = true
      error.value = null
      
      await authService.forgotPassword(data)
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Failed to send reset link'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Reset password
  const resetPassword = async (data: ResetPasswordData) => {
    try {
      isLoading.value = true
      error.value = null

      await authService.resetPassword(data)
      return { success: true }
    } catch (err: any) {
      error.value = err.message || 'Failed to reset password'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
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

  // Update user onboarding status
  const updateOnboardingStatus = (status: 'mobile_verified' | 'details_completed' | 'kyc_completed') => {
    if (user.value) {
      user.value.onboardingStatus = status
    }
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    kycCompleted,
    kycSkipped,
    checkAuth,
    login,
    register,
    logout,
    submitKYC,
    skipKYC,
    forgotPassword,
    resetPassword,
    redirectToMainApp,
    clearError,
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