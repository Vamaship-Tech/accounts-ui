/**
 * Google Tag Manager utility service
 * Provides a clean interface for pushing events to GTM dataLayer
 * No PII (Personally Identifiable Information) is sent
 */

declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>
  }
}

/**
 * Push an event to GTM dataLayer
 * @param eventName - The name of the event
 */
export function pushGTMEvent(eventName: string): void {
  if (typeof window === 'undefined') return

  // Initialize dataLayer if it doesn't exist
  if (!window.dataLayer) {
    window.dataLayer = []
  }

  // Push event to dataLayer (no PII, just event name)
  window.dataLayer.push({
    event: eventName
  })
}

/**
 * GTM Event Names
 * Centralized event names for consistency
 */
export const GTMEvents = {
  // Signup Flow Events
  GOOGLE_PLUGIN_SIGNUP: 'google-plugin-signup',
  MOBILE_SEND_OTP: 'mobile-send-otp',
  MOBILE_VERIFY_OTP: 'mobile-verify-otp',
  LEAD_FORM_BASIC: 'lead-form-basic',
  SKIP_KYC: 'skip-kyc',
  COMPANY_DETAILS: 'company-details',
  ENTITY_REGISTRATION: 'entity-registration',
  
  // Login Flow Events
  USER_SIGNIN_DETAILS: 'user-signin-details',
  USER_SIGNIN_GOOGLE_PLUGIN: 'user-signin-google-plugin'
} as const

