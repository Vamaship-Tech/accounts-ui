<template>
  <div class="min-h-screen flex items-center justify-center p-4 lg:p-8 relative">
    <!-- Background image for desktop only -->
    <div class="hidden lg:block absolute inset-0 z-0">
      <img 
        src="/img/customer-panel.png" 
        alt="Background" 
        class="w-full h-full object-cover"
        style="filter: blur(3px);"
      />
    </div>
    
    <div class="w-4/5 lg:w-2/5 relative z-10">
      <div class="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 lg:p-8">
        <ProgressIndicator :current-step="2" />

        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Complete your profile</h2>
          <p class="text-gray-600">Fill in your details to create your Vamaship account</p>
        </div>

        <div v-if="signupStore.errors.general" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div class="flex items-start">
            <i class="fas fa-exclamation-circle text-red-500 mr-3 mt-0.5"></i>
            <div class="flex-1">
              <span class="text-red-700 text-sm font-medium">{{ signupStore.errors.general }}</span>
            </div>
          </div>
        </div>

        <div v-if="showLoginOption" class="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg">
          <div class="text-center">
            <p class="text-blue-800 mb-2 text-sm">
              The email <strong class="text-blue-900">{{ signupStore.formData.email }}</strong> is already registered with Vamaship.
            </p>
            <button
              @click="goToLogin"
              class="inline-flex items-center px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <i class="fas fa-sign-in-alt mr-1.5 text-xs"></i>
              Login Here
            </button>
          </div>
        </div>

        <div class="space-y-3 lg:space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Full Name <span class="text-red-500">*</span></label>
            <input
              v-model="signupStore.formData.fullName"
              @input="validateFullName"
              @blur="validateFullName"
              @keyup.enter="nextStep"
              type="text"
              placeholder="Enter your full name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
              :class="{ 'border-red-500': signupStore.errors.fullName }"
            />
            <p v-if="signupStore.errors.fullName" class="mt-1 text-sm text-red-600">{{ signupStore.errors.fullName }}</p>
            <p v-else class="mt-1 text-xs text-gray-500">Please enter your complete name including first and last name</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email Address <span class="text-red-500">*</span></label>
            <input
              v-model="signupStore.formData.email"
              @input="handleEmailInput"
              @keyup.enter="nextStep"
              type="email"
              placeholder="Enter your email address"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': signupStore.errors.email }"
            />
            <p v-if="signupStore.errors.email" class="mt-1 text-sm text-red-600">{{ signupStore.errors.email }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Brand Name <span class="text-red-500">*</span></label>
            <input
              v-model="signupStore.formData.brandName"
              @keyup.enter="nextStep"
              type="text"
              placeholder="Enter your brand name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': signupStore.errors.brandName }"
            />
            <p v-if="signupStore.errors.brandName" class="mt-1 text-sm text-red-600">{{ signupStore.errors.brandName }}</p>
            <p class="mt-1 text-xs text-gray-500">Your company/brand name</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Password <span class="text-red-500">*</span></label>
            <div class="relative">
              <input
                v-model="signupStore.formData.password"
                @input="validatePassword"
                @keyup.enter="nextStep"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Create a strong password"
                class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': signupStore.errors.password }"
              />
              <button
                type="button"
                @click="togglePasswordVisibility('password')"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-gray-400"></i>
              </button>
            </div>
            <p v-if="signupStore.errors.password" class="mt-1 text-sm text-red-600">{{ signupStore.errors.password }}</p>
            <p class="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password <span class="text-red-500">*</span></label>
            <div class="relative">
              <input
                v-model="signupStore.formData.confirmPassword"
                @input="validatePassword"
                @keyup.enter="nextStep"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirm your password"
                class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': signupStore.errors.confirmPassword, 'border-green-500': signupStore.formData.password && signupStore.formData.confirmPassword && signupStore.formData.password === signupStore.formData.confirmPassword }"
              />
              <button
                type="button"
                @click="togglePasswordVisibility('confirmPassword')"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-gray-400"></i>
              </button>
            </div>
            <p v-if="signupStore.errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ signupStore.errors.confirmPassword }}</p>
            <p v-else-if="signupStore.formData.password && signupStore.formData.confirmPassword && signupStore.formData.password === signupStore.formData.confirmPassword" class="mt-1 text-sm text-green-600">
              <i class="fas fa-check-circle mr-1"></i>Passwords match
            </p>
          </div>
        </div>

        <div class="flex space-x-3 mt-6 lg:mt-8">
          <button
            @click="nextStep"
            :disabled="!signupStore.isStep2Valid"
            class="flex-1 text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            :style="{ 'background-color': !signupStore.isStep2Valid ? '#9CA3AF' : '#6A5ACD' }"
          >
            Continue
          </button>
        </div>
      </div>
    </div>    
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSignupStore } from '@/stores/signup'
import ProgressIndicator from '@/components/signup/ProgressIndicator.vue'

const router = useRouter()
const signupStore = useSignupStore()

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showLoginOption = ref(false)

onMounted(() => {
  // Check if we have a valid mobile session
  if (!signupStore.mobileSession) {
    router.push('/signup/mobile')
  }
})

const validateFullName = () => {
  if (!signupStore.formData.fullName.trim()) {
    signupStore.setError('fullName', 'Full name is required')
  } else if (signupStore.formData.fullName.trim().length < 2) {
    signupStore.setError('fullName', 'Full name must be at least 2 characters')
  } else {
    signupStore.clearError('fullName')
  }
}

const handleEmailInput = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const email = target.value
  
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    try {
      const exists = await signupStore.checkEmailExists(email)
      if (exists) {
        showLoginOption.value = true
        signupStore.setError('email', 'Email already registered')
      } else {
        showLoginOption.value = false
        signupStore.clearError('email')
      }
    } catch (error) {
      // Error handling is done in the store
    }
  } else {
    showLoginOption.value = false
    signupStore.clearError('email')
  }
}

const validatePassword = () => {
  if (!signupStore.formData.password) {
    signupStore.setError('password', 'Password is required')
  } else if (signupStore.formData.password.length < 8) {
    signupStore.setError('password', 'Password must be at least 8 characters')
  } else {
    signupStore.clearError('password')
  }

  if (!signupStore.formData.confirmPassword) {
    signupStore.setError('confirmPassword', 'Please confirm your password')
  } else if (signupStore.formData.password !== signupStore.formData.confirmPassword) {
    signupStore.setError('confirmPassword', 'Passwords do not match')
  } else {
    signupStore.clearError('confirmPassword')
  }
}

const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
  if (field === 'password') {
    showPassword.value = !showPassword.value
  } else {
    showConfirmPassword.value = !showConfirmPassword.value
  }
}

const prevStep = () => {
  router.push('/signup/mobile')
}

const nextStep = async () => {
  if (!signupStore.isStep2Valid) return
  
  const result = await signupStore.createUser()
  if (result.success) {
    router.push('/signup/kyc')
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script> 