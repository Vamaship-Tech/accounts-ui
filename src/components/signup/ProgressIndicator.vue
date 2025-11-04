<template>
  <div class="mb-6 w-full">
    <div class="flex items-center w-full">
      <div class="flex items-center space-x-2">
        <div :class="[
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
          currentStep > 1 ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
        ]">
          <svg v-if="currentStep > 1" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          <span v-else>1</span>
        </div>
        <span class="ml-2 text-sm font-medium text-gray-900">Mobile</span>
      </div>
      
      <div class="flex-1 mx-4">
        <div class="w-full h-1 bg-gray-300 rounded-full"></div>
      </div>
      
      <div class="flex items-center space-x-2">
        <div :class="[
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
          currentStep > 2 ? 'bg-green-600 text-white' : currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
        ]">
          <svg v-if="currentStep > 2" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          <span v-else>2</span>
        </div>
        <span class="ml-2 text-sm font-medium text-gray-900">Details</span>
      </div>
      
      <div class="flex-1 mx-4">
        <div class="w-full h-1 bg-gray-300 rounded-full"></div>
      </div>
      
      <div class="flex items-center space-x-2">
        <div :class="[
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
          currentStep > 3 ? 'bg-green-600 text-white' : currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'
        ]">
          <svg v-if="currentStep > 3" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
          <span v-else>3</span>
        </div>
        <span class="ml-2 text-sm font-medium text-gray-900">KYC</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentStep: 1 | 2 | 3
}

defineProps<Props>()
</script> 