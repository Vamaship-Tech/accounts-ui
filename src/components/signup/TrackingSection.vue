<template>
  <div style="background-image: linear-gradient(135deg, #e3eeff 0%, #f3e7e9 100%);" class="p-4 rounded-lg">
    <div class="text-center mb-6">
      <div class="flex items-center justify-center mb-3">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mr-3">
          <i class="fas fa-truck text-blue-600 text-lg"></i>
        </div>
        <h4 class="text-xl font-semibold text-gray-800">Track Your Order</h4>
      </div>
    </div>
    
    <div class="max-w-sm mx-auto space-y-3">
      <!-- Tracking Type Toggle -->
      <div class="flex justify-center">
        <div class="flex bg-white rounded-lg p-1 shadow-md w-full border border-gray-200">
          <button 
            @click="switchTrackType('awb')"
            :class="[
              'track-type-btn flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200',
              trackType === 'awb' ? 'active' : ''
            ]"
          >
            AWB
          </button>
          <button 
            @click="switchTrackType('shipment')"
            :class="[
              'track-type-btn flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200',
              trackType === 'shipment' ? 'active' : ''
            ]"
          >
            Shipment
          </button>
        </div>
      </div>
      
      <!-- Tracking Input -->
      <input 
        v-model="trackingNumber"
        type="text" 
        :placeholder="trackingPlaceholder"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm transition-all duration-200 shadow-sm"
      >
      
      <!-- Track Button -->
      <button 
        @click="trackOrder"
        :disabled="!trackingNumber || trackingLoading"
        class="w-full px-4 py-3 text-white rounded-lg font-semibold transition-all duration-300 text-sm flex items-center justify-center" 
        :class="{
          'opacity-80 cursor-not-allowed': !trackingNumber || trackingLoading,
          'hover:shadow-xl': trackingNumber && !trackingLoading
        }"
        style="background-color: #6A5ACD;"
      >
        <SpinnerLoader v-if="trackingLoading" size="sm" class="mr-2" />
        {{ trackingLoading ? 'Tracking...' : 'Track Order' }}
      </button>
      
      <!-- Tracking Error -->
      <div v-if="trackingError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center justify-center">
          <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
          <span class="text-red-700 text-sm font-medium">{{ trackingError }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SpinnerLoader from '../common/SpinnerLoader.vue'

// Reactive state
const trackType = ref('awb')
const trackingNumber = ref('')
const trackingLoading = ref(false)
const trackingError = ref('')

// Computed properties
const trackingPlaceholder = computed(() => {
  switch (trackType.value) {
    case 'awb':
      return 'Enter your AWB number'
    case 'shipment':
      return 'Enter your shipment number'
    default:
      return 'Enter tracking number'
  }
})

// Methods
const switchTrackType = (type: string) => {
  trackType.value = type
  trackingNumber.value = ''
  trackingError.value = ''
}

const trackOrder = async () => {
  if (!trackingNumber.value.trim()) {
    trackingError.value = 'Please enter a tracking number'
    return
  }

  trackingLoading.value = true
  trackingError.value = ''

  try {
    // Determine the tracking ID type parameter based on selection
    let trackingIdType = ''
    switch (trackType.value) {
      case 'awb':
        trackingIdType = 'awb_numbers'
        break
      case 'shipment':
        trackingIdType = 'shipment_numbers'
        break
    }

    // Construct the Vamaship URL
    const baseUrl = 'https://www.vamaship.co/'
    const params = new URLSearchParams({
      tracking_ids: trackingNumber.value,
      tracking_id_type: trackingIdType
    })
    
    const trackingUrl = `${baseUrl}?${params.toString()}`
    
    // Redirect to the appropriate Vamaship tracking page
    window.open(trackingUrl, '_blank')
    
    trackingLoading.value = false
    
  } catch (error) {
    trackingError.value = 'Failed to track order. Please try again.'
    trackingLoading.value = false
  }
}
</script>

<style scoped>
.track-type-btn.active {
  background-color: #6A5ACD;
  color: white;
  box-shadow: 0 2px 4px rgba(80, 96, 163, 0.3);
}

.track-type-btn:not(.active) {
  background-color: transparent;
  color: #6B7280;
}

.track-type-btn:hover:not(.active) {
  background-color: #F3F4F6;
  color: #374151;
}

/* Update icon colors to match app theme */
.track-type-btn.active i {
  color: white;
}

.track-type-btn:not(.active) i {
  color: #6B7280;
}

.track-type-btn:hover:not(.active) i {
  color: #374151;
}
</style> 