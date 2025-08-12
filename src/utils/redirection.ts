import type { User } from '@/types/auth'
import type { MobileSession } from '@/types/signup'
import router from '@/router'

export class UserRedirection {
  static redirectBasedOnStatus(user: User): void {
    const { onboardingStatus, kycStatus } = user

    switch (onboardingStatus) {
      case 'mobile_verified':
        // Mobile verified but user not created - shouldn't happen in normal flow
        // Redirect to details step
        router.push('/signup/details')
        break

      case 'details_completed':
        // User created but KYC not completed
        if (kycStatus === 'completed') {
          // KYC completed, redirect to main app
          this.redirectToMainApp()
        } else {
          // KYC pending, redirect to KYC step
          router.push('/signup/kyc')
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
    const mainAppUrl = import.meta.env.VITE_MAIN_APP_URL || 'https://app.vamaship.com'
    window.location.href = mainAppUrl
  }

  static checkAndRedirectOnLogin(user: User): boolean {
    if (user.onboardingStatus === 'kyc_completed' && user.kycStatus === 'completed') {
      this.redirectToMainApp()
      return true
    }
    
    if (user.onboardingStatus === 'details_completed') {
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