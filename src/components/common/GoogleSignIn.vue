<template>
  <div>
    <div v-if="isScriptReady" ref="googleButtonContainer" class="w-full flex justify-center"></div>
    <button
      v-else
      type="button"
      @click="handleGoogleSignIn"
      :disabled="isDisabled"
      class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    >
      <svg v-if="!isBusy" class="h-5 w-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      
      <SpinnerLoader v-else size="sm" />
      
      <span class="ml-2">
        {{ isBusy ? 'Signing in...' : 'Continue with Google' }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import SpinnerLoader from './SpinnerLoader.vue'
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'

interface Props {
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const emit = defineEmits<{
  /** Emits when Google returns an authorization code */
  googleSignIn: [code: string]
  /** Emits when the Google script failed to load or init */
  googleError: [message: string]
}>()

// Google Identity Services setup (ID token via One Tap / button)
const googleClientId = import.meta.env.VITE_GOOGLE_SIGN_IN as string | undefined
const isScriptReady = ref(false)
const isAuthInProgress = ref(false)
const googleButtonContainer = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null

const getDesiredWidth = (): number => {
  const container = googleButtonContainer.value
  if (!container) return 320
  const containerWidth = container.clientWidth || 320
  // Google recommends 200-400px. Clamp to that range.
  return Math.max(200, Math.min(containerWidth, 400))
}

const isBusy = computed(() => props.isLoading || isAuthInProgress.value || !isScriptReady.value)
const isDisabled = isBusy

const renderGoogleButton = () => {
  try {
    if (!googleButtonContainer.value) return
    // Clear previous render to adjust width
    while (googleButtonContainer.value.firstChild) {
      googleButtonContainer.value.removeChild(googleButtonContainer.value.firstChild)
    }
    // @ts-expect-error google comes from GIS script
    window.google.accounts.id.renderButton(googleButtonContainer.value, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: getDesiredWidth()
    })
  } catch (e) {
    emit('googleError', 'Failed to render Google button')
  }
}

const initGoogle = () => {
  if (!googleClientId) {
    emit('googleError', 'Google client ID is not configured')
    return
  }
  // @ts-expect-error google comes from GIS script
  if (window.google?.accounts?.id) {
    // @ts-expect-error google comes from GIS script
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response: any) => {
        isAuthInProgress.value = false
        const credential = response?.credential
        if (credential) {
          emit('googleSignIn', credential)
        } else {
          emit('googleError', 'Google did not return a credential')
        }
      }
    })
    isScriptReady.value = true
    // Wait for the container to be in DOM, then render the official button
    nextTick(() => {
      renderGoogleButton()
      // Re-render on container resize to keep width in sync
      if (googleButtonContainer.value && 'ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => {
          renderGoogleButton()
        })
        resizeObserver.observe(googleButtonContainer.value)
      }
    })
  } else {
    emit('googleError', 'Google Identity Services is not available on window')
  }
}

const loadGoogleScript = () => {
  const existingScript = document.getElementById('google-identity-services') as HTMLScriptElement | null
  if (existingScript) {
    // If the script tag exists but Google isn't ready yet, wait for load; otherwise init immediately
    // @ts-expect-error google comes from GIS script
    if (window.google?.accounts?.id) {
      initGoogle()
    } else {
      existingScript.addEventListener('load', () => initGoogle(), { once: true })
    }
    return
  }
  const script = document.createElement('script')
  script.id = 'google-identity-services'
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.addEventListener('load', () => initGoogle(), { once: true })
  script.addEventListener('error', () => emit('googleError', 'Failed to load Google script'), { once: true })
  document.head.appendChild(script)
}

onMounted(() => {
  loadGoogleScript()
})

const handleGoogleSignIn = () => {
  if (!isScriptReady.value) {
    emit('googleError', 'Google is not ready yet')
    return
  }
  isAuthInProgress.value = true
  try {
    // @ts-expect-error google comes from GIS script
    window.google.accounts.id.cancel()
    // @ts-expect-error google comes from GIS script
    window.google.accounts.id.disableAutoSelect()
    // @ts-expect-error google comes from GIS script
    window.google.accounts.id.prompt((notification: any) => {
      // If dismissed or failed, reset loading
      if (
        notification?.isNotDisplayed() ||
        notification?.isSkippedMoment() ||
        // Handle explicit dismiss (close button/X) so user can retry
        notification?.isDismissedMoment?.()
      ) {
        isAuthInProgress.value = false
      }
    })
  } catch (e) {
    isAuthInProgress.value = false
    emit('googleError', 'Failed to initiate Google sign-in')
  }
}

onBeforeUnmount(() => {
  if (resizeObserver && googleButtonContainer.value) {
    resizeObserver.unobserve(googleButtonContainer.value)
  }
  resizeObserver = null
})
</script> 