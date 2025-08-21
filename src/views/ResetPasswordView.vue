<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <div class="flex justify-center mb-4 sm:mb-6">
          <img src="/images/vamaship-logo.png" alt="Vamaship" style="width: 170px; height: 86px;" />
        </div>
        <!-- <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2> -->
        
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="card">
        <form @submit.prevent="handleResetPassword" class="space-y-6">
          <!-- New Password Field -->
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div class="mt-1">
              <input
                id="newPassword"
                v-model="form.newPassword"
                name="newPassword"
                type="password"
                autocomplete="new-password"
                required
                :class="[
                  'input-field',
                  errors.newPassword ? 'border-red-500 focus:ring-red-500' : ''
                ]"
                placeholder="Enter your new password"
              />
            </div>
            <p v-if="errors.newPassword" class="mt-2 text-sm text-red-600">
              {{ errors.newPassword }}
            </p>
            <p class="mt-2 text-sm text-gray-500">
              Must be at least 8 characters with uppercase, lowercase, number, and special character.
            </p>
          </div>

          <!-- Confirm Password Field -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div class="mt-1">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                name="confirmPassword"
                type="password"
                autocomplete="new-password"
                required
                :class="[
                  'input-field',
                  errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''
                ]"
                placeholder="Confirm your new password"
              />
            </div>
            <p v-if="errors.confirmPassword" class="mt-2 text-sm text-red-600">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="authStore.error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-800">
                  {{ authStore.error }}
                </p>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="isSuccess" class="rounded-md bg-green-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-green-800">
                  Password has been reset successfully! You can now sign in with your new password.
                </p>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="isSuccess"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSuccess">Password reset successful</span>
              <span v-else>Reset password</span>
            </button>
          </div>

          <!-- Back to Login -->
          <div class="text-center">
            <router-link 
              to="/login" 
              class="font-medium text-blue-600 hover:text-blue-500"
            >
              ← Back to sign in
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/authService'
import type { ResetPasswordData } from '@/types/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isSuccess = ref(false)

const form = reactive<ResetPasswordData>({
  token: '',
  newPassword: '',
  confirmPassword: ''
})

const errors = reactive({
  newPassword: '',
  confirmPassword: ''
})

onMounted(() => {
  // Get token from URL query parameter
  const token = route.query.token as string
  if (token) {
    form.token = token
  }
  
  // Clear any previous errors
  authStore.clearError()
})

const validateForm = (): boolean => {
  let isValid = true
  
  // Reset errors
  errors.newPassword = ''
  errors.confirmPassword = ''
  
  // New Password validation
  if (!form.newPassword) {
    errors.newPassword = 'New password is required'
    isValid = false
  } else if (form.newPassword.length < 8) {
    errors.newPassword = 'Password must be at least 8 characters'
    isValid = false
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(form.newPassword)) {
    errors.newPassword = 'Password must contain uppercase, lowercase, number, and special character'
    isValid = false
  }
  
  // Confirm Password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password'
    isValid = false
  } else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }
  
  return isValid
}

const handleResetPassword = async () => {
  if (!validateForm()) return
  
  try {
    authStore.clearError()
    await authService.resetPassword({
      token: form.token,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword
    })
    isSuccess.value = true
    form.newPassword = ''
    form.confirmPassword = ''
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (err: any) {
    authStore.error = err?.message || 'Failed to reset password'
  }
}
</script> 