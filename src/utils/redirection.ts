import type { User } from '@/types/auth'
import type { MobileSession } from '@/types/signup'
import router from '@/router'

export class UserRedirection {
  private static isRedirecting = false

  static redirectBasedOnStatus(user: User): void {
    if (this.isRedirecting) return
    
    const { onboardingStatus, kycStatus } = user

    switch (onboardingStatus) {
      case 'mobile_verified':
        // Mobile verified but user not created - shouldn't happen in normal flow
        // Redirect to details step
        if (router.currentRoute.value.path !== '/signup/details') {
          router.push({ path: '/signup/details', query: { social: '1' } })
        }
        break

      case 'details_completed':
        // User created but KYC not completed
        if (kycStatus === 'completed') {
          // KYC completed, redirect to main app
          this.redirectToMainApp()
        } else {
          // KYC pending, redirect to KYC step
          if (router.currentRoute.value.path !== '/signup/kyc') {
            router.push('/signup/kyc')
          }
        }
        break

      case 'kyc_completed':
        // Full onboarding completed
        this.redirectToMainApp()
        break

      default:
        // Unknown status, redirect to login
        router.push('/login')
    }
  }

  static redirectToMainApp(): void {
    if (this.isRedirecting) return
    
    try {
      this.isRedirecting = true
      const baseUrl = import.meta.env.VITE_MAIN_APP_URL
      const token = this.getCookie('auth_token')

      // Trim trailing slashes from base URL
      const sanitizedBaseUrl = baseUrl.replace(/\/+$/, '')
console.log(sanitizedBaseUrl)
      // Append token as query param if available
      const url = token
        ? `${sanitizedBaseUrl}?token=${encodeURIComponent(token)}`
        : sanitizedBaseUrl

      // Replace current history entry when navigating to main app
      window.location.replace(url)
    } catch (error) {
      console.error('Failed to redirect to main app:', error)
      this.isRedirecting = false
      // Fallback: redirect to login
      router.push('/login')
    }
  }

  private static getCookie(name: string): string | null {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
  }

  static checkAndRedirectOnLogin(result: string): boolean {
    if (this.isRedirecting) return false
    
    if (result === 'completed') {
      this.redirectToMainApp()
      return true
    }
    
    if (result === 'kyc_pending') {
      router.push('/signup/kyc')
      return true
    }
    
    return false
  }

  static shouldRedirectFromAuthPages(user: User): boolean {
    return user.onboardingStatus !== 'mobile_verified'
  }
}

// Session management utilities
export class SessionManager {
  private static readonly MOBILE_SESSION_KEY = 'mobile_session'
  private static readonly SESSION_DURATION_MS = 60 * 60 * 1000 // 1 hour

  static saveMobileSession(phone: string, countryCode: string): void {
    const session = {
      phone,
      countryCode,
      verified: true,
      sessionExpiry: new Date(Date.now() + this.SESSION_DURATION_MS).toISOString(),
      otpSent: false
    }
    
    localStorage.setItem(this.MOBILE_SESSION_KEY, JSON.stringify(session))
  }

  static getMobileSession(): MobileSession | null {
    try {
      const stored = localStorage.getItem(this.MOBILE_SESSION_KEY)
      if (!stored) return null

      const session = JSON.parse(stored)
      const expiry = new Date(session.sessionExpiry)
      
      if (expiry < new Date()) {
        this.clearMobileSession()
        return null
      }

      return {
        ...session,
        sessionExpiry: expiry
      }
    } catch {
      this.clearMobileSession()
      return null
    }
  }

  static clearMobileSession(): void {
    localStorage.removeItem(this.MOBILE_SESSION_KEY)
  }

  static isSessionValid(): boolean {
    const session = this.getMobileSession()
    return session !== null && session.verified
  }
} 