<template>
  <div class="bg-white rounded-lg p-6 shadow-lg max-w-md mx-auto" style="background-color: #F0F0FF;">
    <h4 class="text-lg font-medium text-gray-700 mb-4 text-center">Track Your Order</h4>
    
    <div class="max-w-sm mx-auto space-y-3">
      <div class="flex justify-center">
        <div class="flex bg-white rounded-lg p-1 shadow-sm w-full">
          <button 
            @click="switchTrackType('awb')"
            :class="[
              'track-type-btn flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              trackType === 'awb' ? 'active' : ''
            ]"
          >
            AWB
          </button>
          <button 
            @click="switchTrackType('shipment')"
            :class="[
              'track-type-btn flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              trackType === 'shipment' ? 'active' : ''
            ]"
          >
            Shipment
          </button>
          <button 
            @click="switchTrackType('order')"
            :class="[
              'track-type-btn flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              trackType === 'order' ? 'active' : ''
            ]"
          >
            Order ID
          </button>
        </div>
      </div>
      
      <input 
        v-model="trackingNumber"
        type="text" 
        :placeholder="trackingPlaceholder"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
      >
      
      <button 
        @click="trackOrder"
        :disabled="!trackingNumber || trackingLoading"
        class="w-full px-4 py-2 text-white rounded-lg font-medium transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center" 
        :style="{ 'background-color': trackingNumber && !trackingLoading ? '#5060A3' : '#9CA3AF' }"
      >
        <span v-if="trackingLoading" class="mr-2">
          <i class="fas fa-spinner fa-spin"></i>
        </span>
        {{ trackingLoading ? 'Tracking...' : 'Track Order' }}
      </button>
      
      <div v-if="trackingError" class="mt-2 text-center">
        <p class="text-xs text-red-600 font-medium">
          <i class="fas fa-exclamation-circle mr-1"></i>
          {{ trackingError }}
        </p>
      </div>
      
      <div v-if="trackingResult && Object.keys(trackingResult).length > 0" class="mt-4">
        <div class="bg-white rounded-lg p-3 border border-gray-200">
          <h5 class="text-sm font-semibold text-gray-800 mb-2">Tracking Results</h5>
          <div class="space-y-2 max-h-40 overflow-y-auto">
            <div v-for="(result, trackingId) in trackingResult" :key="trackingId" class="text-xs">
              <div class="font-medium text-gray-700">{{ trackingId }}</div>
              <div v-if="result.success" class="text-green-600">
                <div class="font-medium">{{ result.tracking_status || 'In Transit' }}</div>
                <div v-if="result.trackingEvents && result.trackingEvents.length > 0" class="mt-1">
                  <div class="text-gray-600">
                    Latest: {{ result.trackingEvents[0].status }}
                  </div>
                  <div class="text-gray-500">
                    {{ result.trackingEvents[0].datetime }}
                  </div>
                </div>
              </div>
              <div v-else class="text-red-600">
                {{ result.message || 'Not found' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { trackingAPI } from '../services/api'

const trackType = ref('awb')
const trackingNumber = ref('')
const trackingLoading = ref(false)
const trackingResult = ref<any>(null)
const trackingError = ref<string | null>(null)

const trackingPlaceholder = computed(() => {
  switch (trackType.value) {
    case 'awb':
      return 'Enter AWB numbers here to track your shipment'
    case 'shipment':
      return 'Enter shipment numbers here to track your shipment'
    case 'order':
      return 'Enter order numbers here to track your shipment'
    default:
      return 'Enter tracking numbers here'
  }
})

const switchTrackType = (type: string) => {
  trackType.value = type
  trackingNumber.value = ''
  trackingResult.value = null
  trackingError.value = null
}

const trackOrder = async () => {
  if (!trackingNumber.value.trim()) {
    trackingError.value = 'Please enter a tracking number'
    return
  }
  
  trackingLoading.value = true
  trackingError.value = null
  trackingResult.value = null
  
  try {
    const trackingIds = trackingNumber.value.split(',').map(id => id.trim()).filter(id => id)
    
    let response
    switch (trackType.value) {
      case 'awb':
        response = await trackingAPI.trackByAwb(trackingIds)
        break
      case 'shipment':
        response = await trackingAPI.trackByShipment(trackingIds)
        break
      case 'order':
        response = await trackingAPI.trackByReference(trackingIds)
        break
      default:
        response = await trackingAPI.trackByAwb(trackingIds)
    }
    
    if (response.success) {
      trackingResult.value = response.data.tracking_details
    } else {
      trackingError.value = response.message || 'Failed to track shipment'
    }
  } catch (error: any) {
    trackingError.value = error.message || 'Network error occurred while tracking'
  } finally {
    trackingLoading.value = false
  }
}
</script>

<style scoped>
.track-type-btn.active {
  background-color: #5060A3;
  color: white;
}

.track-type-btn:not(.active) {
  background-color: transparent;
  color: #6B7280;
}

.track-type-btn:not(.active):hover {
  background-color: #F3F4F6;
}
</style> 