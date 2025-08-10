<template>
  <div class="bg-white rounded-xl p-6 shadow-2xl border border-gray-200 max-w-md mx-auto transform transition-all duration-300 hover:shadow-3xl hover:-translate-y-1" style="background: linear-gradient(135deg, #F8F9FF 0%, #F0F0FF 100%);">
    <div class="text-center mb-6">
      <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
        <i class="fas fa-truck text-blue-600 text-lg"></i>
      </div>
      <h4 class="text-xl font-semibold text-gray-800">Track Your Order</h4>
      <p class="text-sm text-gray-600 mt-1">Enter your tracking details below</p>
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
          <button 
            @click="switchTrackType('order')"
            :class="[
              'track-type-btn flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200',
              trackType === 'order' ? 'active' : ''
            ]"
          >
            Order ID
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
        class="w-full px-4 py-3 text-white rounded-lg font-semibold transition-all duration-300 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]" 
        :style="{ 'background-color': trackingNumber && !trackingLoading ? '#5060A3' : '#9CA3AF' }"
      >
        <span v-if="trackingLoading" class="mr-2">
          <i class="fas fa-spinner fa-spin"></i>
        </span>
        {{ trackingLoading ? 'Tracking...' : 'Track Order' }}
      </button>
      
      <!-- Tracking Error -->
      <div v-if="trackingError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center justify-center">
          <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
          <span class="text-red-700 text-sm font-medium">{{ trackingError }}</span>
        </div>
      </div>
      
      <!-- Tracking Results -->
      <div v-if="trackingResult && Object.keys(trackingResult).length > 0" class="mt-6">
        <div class="bg-white rounded-lg p-4 border border-gray-200 shadow-md">
          <h5 class="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <i class="fas fa-check-circle text-green-500 mr-2"></i>
            Tracking Results
          </h5>
          <div class="space-y-3 max-h-40 overflow-y-auto">
            <div v-for="(result, trackingId) in trackingResult" :key="trackingId" class="text-xs p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400">
              <div class="font-semibold text-gray-700 mb-2">{{ trackingId }}</div>
              <div v-if="result.success" class="text-green-600">
                <div class="font-medium mb-1">{{ result.tracking_status || 'In Transit' }}</div>
                <div v-if="result.trackingEvents && result.trackingEvents.length > 0" class="mt-2 p-2 bg-white rounded border">
                  <div class="text-gray-600 font-medium mb-1">Latest Update:</div>
                  <div class="text-gray-700">{{ result.trackingEvents[0].status }}</div>
                  <div class="text-gray-500 text-xs mt-1">{{ result.trackingEvents[0].datetime }}</div>
                </div>
              </div>
              <div v-else class="text-red-600">
                <i class="fas fa-exclamation-triangle mr-1"></i>
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
    // For now, simulate tracking API call
    // In production, this would call the actual tracking API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate tracking result
    const trackingIds = trackingNumber.value.split(',').map(id => id.trim()).filter(id => id)
    const mockResult: any = {}
    
    trackingIds.forEach(id => {
      mockResult[id] = {
        success: true,
        tracking_status: 'In Transit',
        trackingEvents: [
          {
            status: 'Package picked up from sender',
            datetime: new Date().toLocaleString()
          }
        ]
      }
    })
    
    trackingResult.value = mockResult
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
  box-shadow: 0 2px 4px rgba(80, 96, 163, 0.3);
}

.track-type-btn:not(.active) {
  background-color: transparent;
  color: #6B7280;
}

.track-type-btn:not(.active):hover {
  background-color: #F3F4F6;
  color: #374151;
}

/* Custom shadow classes */
.shadow-3xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Hover effects for the main container */
.hover\:shadow-3xl:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style> 