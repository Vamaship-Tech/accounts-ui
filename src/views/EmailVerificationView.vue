<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <!-- Logo -->
        <div class="mb-6">
          <img src="/images/vamaship-logo.png" alt="Vamaship" class="h-16 mx-auto" />
        </div>

        <!-- Loading State -->
        <div v-if="isVerifying" class="space-y-4">
          <div class="flex justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Verifying your email...</h2>
          <p class="text-gray-600">Please wait while we verify your email address.</p>
        </div>

        <!-- Success State -->
        <div v-else-if="isVerified" class="space-y-4">
          <div class="flex justify-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <i class="fas fa-check text-green-600 text-3xl"></i>
            </div>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Email Verified!</h2>
          <p class="text-gray-600">Your email has been successfully verified.</p>
          <button
            class="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Continue to Signup
          </button>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="space-y-4">
          <div class="flex justify-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <i class="fas fa-times text-red-600 text-3xl"></i>
            </div>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Verification Failed</h2>
          <p class="text-gray-600">{{ error }}</p>
          <button
            class="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Continue to Signup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { signupService } from '@/services/signupService'

const router = useRouter()
const route = useRoute()

const isVerifying = ref(true)
const isVerified = ref(false)
const error = ref<string | null>(null)

const verifyEmail = async () => {
  const token = route.query.token as string

  if (!token) {
    error.value = 'Invalid verification link. Token is missing.'
    isVerifying.value = false
    return
  }

  try {
    const result = await signupService.verifyEmailMagicLink(token)
    if (result.success) {
      isVerified.value = true
    } else {
      error.value = result.message || 'Email verification failed. The link may have expired or is invalid.'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to verify email. Please try again or request a new verification link.'
  } finally {
    isVerifying.value = false
  }
}

onMounted(() => {
  verifyEmail()
})
</script>

