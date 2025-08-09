<template>
  <div class="min-h-screen flex items-center justify-center p-4 lg:p-8">
    <div class="w-full max-w-md lg:max-w-lg">
      <div class="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 lg:p-8">
        <ProgressIndicator :current-step="2" />

        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Complete your profile</h2>
          <p class="text-gray-600">Fill in your details to create your Vamaship account</p>
        </div>

        <div v-if="generalError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div class="flex items-start">
            <i class="fas fa-exclamation-circle text-red-500 mr-3 mt-0.5"></i>
            <div class="flex-1">
              <span class="text-red-700 text-sm font-medium">{{ generalError }}</span>
              <div v-if="generalError.includes('Network error')" class="mt-3">
                <div class="flex space-x-2">
                  <button
                    @click="$emit('log-network-error')"
                    class="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <i class="fas fa-bug mr-1"></i>
                    Log
                  </button>
                  <button
                    @click="$emit('dismiss-error')"
                    class="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <i class="fas fa-times mr-1"></i>
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showLoginOption" class="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg">
          <div class="text-center">
            <p class="text-blue-800 mb-2 text-sm">
              The email <strong class="text-blue-900">{{ formData.email }}</strong> is already registered with Vamaship.
            </p>
            <button
              @click="$emit('go-to-signin')"
              class="inline-flex items-center px-4 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              <i class="fas fa-sign-in-alt mr-1.5 text-xs"></i>
              Login Here
            </button>
          </div>
        </div>

        <div class="space-y-3 lg:space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              v-model="formData.fullName"
              @input="$emit('validate-full-name', ($event.target as HTMLInputElement).value)"
              @blur="$emit('validate-full-name', formData.fullName)"
              @keyup.enter="$emit('next-step')"
              type="text"
              placeholder="Enter your full name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.fullName }"
            />
            <p v-if="errors.fullName" class="mt-1 text-sm text-red-600">{{ errors.fullName }}</p>
            <p v-else class="mt-1 text-xs text-gray-500">Please enter your complete name including first and last name</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              v-model="formData.email"
              @input="$emit('email-input', ($event.target as HTMLInputElement).value)"
              @keyup.enter="$emit('next-step')"
              type="email"
              placeholder="Enter your email address"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.email }"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <div v-if="isGoogleSignInUser">
            <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number <span class="text-red-500">*</span></label>
            <div class="flex">
              <select v-model="formData.countryCode" class="px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50">
                <option value="+91">+91</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
              </select>
              <input
                v-model="formData.phone"
                @input="$emit('phone-input', ($event.target as HTMLInputElement).value)"
                @keyup.enter="$emit('next-step')"
                type="tel"
                placeholder="Enter your phone number"
                maxlength="10"
                class="w-48 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': errors.phone }"
              />
            </div>
            <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
            <p class="mt-1 text-xs text-gray-500">Required for account verification and notifications</p>
            
            <div v-if="formData.phone.length === 10" class="mt-4">
              <div v-if="googlePhoneVerified" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div class="flex items-center">
                  <i class="fas fa-check-circle text-green-500 mr-2"></i>
                  <span class="text-green-700 text-sm font-medium">Phone number verified successfully!</span>
                </div>
              </div>
              
              <div v-if="!googlePhoneOtpSent && !googlePhoneVerified" class="text-center">
                <button
                  @click="$emit('send-google-phone-otp')"
                  :disabled="loading"
                  class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  <span v-if="loading">Sending...</span>
                  <span v-else>Send OTP</span>
                </button>
              </div>
              
              <div v-if="googlePhoneOtpSent && !googlePhoneVerified" class="space-y-4">
                <div class="text-center">
                  <p class="text-sm text-gray-600 mb-3">Enter the 6-digit OTP sent to {{ formData.countryCode }} {{ formData.phone }}</p>
                  
                  <div class="flex justify-center space-x-2 mb-4">
                    <input
                      v-for="(input, index) in googlePhoneOtpInputs"
                      :key="index"
                      v-model="input.value"
                      @input="$emit('google-phone-otp-input', index, ($event.target as HTMLInputElement).value)"
                      @keydown="$emit('google-phone-otp-keydown', index, $event)"
                      @keyup.enter="$emit('verify-google-phone-otp')"
                      type="text"
                      maxlength="1"
                      :data-google-phone-otp-index="index"
                      class="w-12 h-12 lg:w-14 lg:h-14 xs:w-8 xs:h-8 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base xs:text-xs font-semibold"
                      :class="{ 'border-red-500': errors.otp }"
                    />
                  </div>
                  
                  <button
                    @click="$emit('verify-google-phone-otp')"
                    :disabled="googlePhoneOtpInputs.some(input => input.value === '') || loading"
                    class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold mb-3"
                  >
                    <span v-if="loading">Verifying...</span>
                    <span v-else>Verify OTP</span>
                  </button>
                  
                  <div class="text-center">
                    <button
                      @click="$emit('resend-google-phone-otp')"
                      :disabled="googlePhoneOtpCooldown > 0"
                      class="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      <span v-if="googlePhoneOtpCooldown > 0">
                        Resend OTP in {{ formatGooglePhoneOtpTime(googlePhoneOtpCooldown) }}
                      </span>
                      <span v-else>
                        Resend OTP
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Brand Name (Optional)</label>
            <input
              v-model="formData.brandName"
              @keyup.enter="$emit('next-step')"
              type="text"
              placeholder="Enter your brand name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div v-if="!isGoogleSignInUser || googlePhoneVerified">
            <div v-if="isGoogleSignInUser && googlePhoneVerified" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div class="flex items-center">
                <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                <span class="text-blue-700 text-sm">Please create a password for your account</span>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Password <span class="text-red-500">*</span></label>
              <div class="relative">
                <input
                  v-model="formData.password"
                  @input="$emit('validate-password')"
                  @keyup.enter="$emit('next-step')"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Create a strong password"
                  class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.password }"
                />
                <button
                  type="button"
                  @click="$emit('toggle-password-visibility', 'password')"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-gray-400"></i>
                </button>
              </div>
              <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
              <p class="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password <span class="text-red-500">*</span></label>
              <div class="relative">
                <input
                  v-model="formData.confirmPassword"
                  @input="$emit('validate-password')"
                  @keyup.enter="$emit('next-step')"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm your password"
                  class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.confirmPassword, 'border-green-500': formData.password && formData.confirmPassword && formData.password === formData.confirmPassword }"
                />
                <button
                  type="button"
                  @click="$emit('toggle-password-visibility', 'confirmPassword')"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-gray-400"></i>
                </button>
              </div>
              <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
              <p v-else-if="formData.password && formData.confirmPassword && formData.password === formData.confirmPassword" class="mt-1 text-sm text-green-600">
                <i class="fas fa-check-circle mr-1"></i>Passwords match
              </p>
            </div>
          </div>
        </div>

        <div class="flex space-x-3 mt-6 lg:mt-8">
          <button
            @click="$emit('prev-step')"
            class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 font-semibold"
          >
            Back
          </button>
          <button
            @click="$emit('next-step')"
            :disabled="!isStep2Valid"
            class="flex-1 text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            :style="{ 'background-color': !isStep2Valid ? '#9CA3AF' : '#6A5ACD' }"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  </div>    
</template>

<script setup lang="ts">
import ProgressIndicator from './ProgressIndicator.vue'

interface Props {
  formData: {
    fullName: string
    email: string
    phone: string
    countryCode?: string
    brandName?: string
    password: string
    confirmPassword: string
  }
  errors: Record<string, string>
  generalError: string
  showLoginOption: boolean
  isGoogleSignInUser: boolean
  googlePhoneVerified: boolean
  googlePhoneOtpSent: boolean
  googlePhoneOtpCooldown: number
  googlePhoneOtpInputs: Array<{ value: string }>
  showPassword: boolean
  showConfirmPassword: boolean
  loading: boolean
  isStep2Valid: boolean
}

defineProps<Props>()

defineEmits<{
  'validate-full-name': [value: string]
  'email-input': [value: string]
  'phone-input': [value: string]
  'validate-password': []
  'toggle-password-visibility': [field: string]
  'send-google-phone-otp': []
  'verify-google-phone-otp': []
  'resend-google-phone-otp': []
  'google-phone-otp-input': [index: number, value: string]
  'google-phone-otp-keydown': [index: number, event: KeyboardEvent]
  'next-step': []
  'prev-step': []
  'go-to-signin': []
  'log-network-error': []
  'dismiss-error': []
}>()

const formatGooglePhoneOtpTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script> 