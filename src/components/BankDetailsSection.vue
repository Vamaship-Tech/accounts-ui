<template>
  <div class="border border-gray-200 rounded-lg p-6">
    <button
      type="button"
      @click="$emit('toggle-bank-details')"
      class="w-full flex items-center justify-between text-left"
    >
      <div class="flex items-center">
        <i class="fas fa-university text-yellow-600 mr-3"></i>
        <span class="font-semibold text-gray-900">Bank Details</span>
      </div>
      <i :class="showBankDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-gray-400"></i>
    </button>
    
    <div v-if="showBankDetails" class="mt-4 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Beneficiary Name <span class="text-red-500">*</span></label>
          <input
            v-model="formData.beneficiaryName"
            @keyup.enter="$emit('complete-signup')"
            type="text"
            placeholder="Enter beneficiary name"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500': errors.beneficiaryName }"
          />
          <p v-if="errors.beneficiaryName" class="mt-1 text-sm text-red-600">{{ errors.beneficiaryName }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Bank Name <span class="text-red-500">*</span></label>
          
          <select
            v-if="!isOtherBank && !banksLoading"
            v-model="formData.bankName"
            @change="$emit('handle-bank-selection')"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500': errors.bankName }"
          >
            <option value="">Select Bank</option>
            <option v-for="bank in banksList" :key="bank" :value="bank">{{ bank }}</option>
            <option value="other">Other</option>
          </select>
          
          <div v-if="banksLoading" class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
            <i class="fas fa-spinner fa-spin text-gray-400 mr-2"></i>
            <span class="text-gray-500 text-sm">Loading banks...</span>
          </div>
          
          <div v-if="banksError && !banksLoading" class="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50">
            <div class="flex items-center">
              <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
              <span class="text-red-700 text-sm">{{ banksError }}</span>
            </div>
            <button
              @click="$emit('fetch-banks-list')"
              class="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Try again
            </button>
          </div>
          
          <div v-if="isOtherBank" class="space-y-2">
            <input
              v-model="formData.bankName"
              @keyup.enter="$emit('complete-signup')"
              type="text"
              placeholder="Enter custom bank name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500': errors.bankName }"
            />
            <button
              type="button"
              @click="$emit('reset-bank-selection')"
              class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to bank list
            </button>
          </div>
          
          <p v-if="errors.bankName" class="mt-1 text-sm text-red-600">{{ errors.bankName }}</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Account Number <span class="text-red-500">*</span></label>
          <input
            v-model="formData.accountNumber"
            @input="$emit('reset-bank-validation-attempts')"
            @keyup.enter="$emit('complete-signup')"
            type="text"
            placeholder="Enter account number"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500': errors.accountNumber, 'border-green-500': bankVerified }"
          />
          <p v-if="errors.accountNumber" class="mt-1 text-sm text-red-600">{{ errors.accountNumber }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">IFSC Code <span class="text-red-500">*</span></label>
          <input
            v-model="formData.ifscCode"
            @input="$emit('reset-bank-validation-attempts')"
            @keyup.enter="$emit('complete-signup')"
            type="text"
            placeholder="Enter IFSC code"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="{ 'border-red-500': errors.ifscCode, 'border-green-500': bankVerified }"
          />
          <p v-if="errors.ifscCode" class="mt-1 text-sm text-red-600">{{ errors.ifscCode }}</p>
        </div>
      </div>
      
      <div class="flex flex-col items-center space-y-2">
        <div v-if="bankCounterReset" class="text-sm text-green-600 font-medium">
          ✓ Counter reset - Fresh attempts available
        </div>
        
        <div v-if="bankAttemptsExhausted" class="text-sm text-red-600 font-medium bg-red-50 px-4 py-2 rounded-md border border-red-200">
          <i class="fas fa-exclamation-triangle mr-2"></i>
          Contact Sales Team at sales@vamaship.com
        </div>
        
        <button
          type="button"
          @click="$emit('verify-bank')"
          :disabled="bankVerifying || !formData.accountNumber || !formData.ifscCode || formData.accountNumber.trim() === '' || formData.ifscCode.trim() === ''"
          class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          <i v-if="bankVerifying" class="fas fa-spinner fa-spin mr-2"></i>
          <span v-if="bankVerifying">Verifying Bank Details...</span>
          <span v-else-if="bankVerified">✓ Bank Details Verified</span>
          <span v-else>Verify Bank Details</span>
        </button>
      </div>
      
      <div v-if="bankVerified" class="p-3 bg-green-50 border border-green-200 rounded-md">
        <div class="flex items-center">
          <i class="fas fa-check-circle text-green-500 mr-2"></i>
          <span class="text-green-700 text-sm font-medium">Bank account details verified successfully!</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  formData: {
    beneficiaryName: string
    bankName: string
    accountNumber: string
    ifscCode: string
  }
  errors: Record<string, string>
  banksList: string[]
  banksLoading: boolean
  banksError: string
  isOtherBank: boolean
  bankVerifying: boolean
  bankVerified: boolean
  bankCounterReset: boolean
  bankAttemptsExhausted: boolean
  showBankDetails: boolean
}

defineProps<Props>()

defineEmits<{
  'toggle-bank-details': []
  'handle-bank-selection': []
  'reset-bank-selection': []
  'fetch-banks-list': []
  'reset-bank-validation-attempts': []
  'verify-bank': []
  'complete-signup': []
}>()
</script> 