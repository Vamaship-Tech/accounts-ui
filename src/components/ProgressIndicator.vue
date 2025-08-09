<template>
  <div class="flex items-center justify-center mb-6 lg:mb-8">
    <div class="flex items-center space-x-2 lg:space-x-4">
      <div class="flex items-center">
        <div class="w-6 h-6 lg:w-8 lg:h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-sm lg:text-base">
          <i class="fas fa-check text-xs lg:text-sm"></i>
        </div>
        <div class="ml-2 text-xs lg:text-sm font-medium text-gray-900">Phone</div>
      </div>
      <div class="w-8 lg:w-12 h-0.5" :class="currentStep >= 2 ? 'bg-green-600' : 'bg-gray-300'"></div>
      <div class="flex items-center">
        <div 
          class="w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center font-semibold text-sm lg:text-base"
          :class="currentStep >= 2 ? (currentStep > 2 ? 'bg-green-600 text-white' : 'bg-blue-600 text-white') : 'bg-gray-300 text-gray-600'"
        >
          <i v-if="currentStep > 2" class="fas fa-check text-xs lg:text-sm"></i>
          <span v-else>2</span>
        </div>
        <div class="ml-2 text-xs lg:text-sm font-medium" :class="currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'">Details</div>
      </div>
      <div class="w-8 lg:w-12 h-0.5" :class="currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'"></div>
      <div class="flex items-center">
        <div 
          class="w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center font-semibold text-sm lg:text-base"
          :class="currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'"
        >
          3
        </div>
        <div class="ml-2 text-xs lg:text-sm font-medium" :class="currentStep >= 3 ? 'text-gray-900' : 'text-gray-500'">KYC</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentStep: number
}

defineProps<Props>()
</script> 