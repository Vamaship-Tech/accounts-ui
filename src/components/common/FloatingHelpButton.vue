<template>
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Help Button -->
    <div 
      class="relative group"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
    >
      <!-- Main Help Button -->
      <button
        @click="toggleHelp"
        class="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        :class="{ 'scale-110': showTooltip }"
      >
        <i class="fas fa-question text-xl"></i>
      </button>
      
      <!-- Ripple Effect -->
      <div class="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 group-hover:animate-ping"></div>
      
      <!-- Tooltip on Hover -->
      <div 
        v-if="showTooltip"
        class="absolute bottom-full right-0 mb-3 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 transform transition-all duration-300"
        :class="showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
      >
        <!-- Tooltip Arrow -->
        <div class="absolute top-full right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
        
        <!-- Tooltip Content -->
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <i class="fas fa-headset text-white text-sm"></i>
            </div>
            <h3 class="font-semibold text-gray-900">Need Help?</h3>
          </div>
          
          <p class="text-sm text-gray-600">
            Our support team is here to help you get started with Vamaship. Choose how you'd like to connect:
          </p>
          
          <!-- CTA Buttons -->
          <div class="space-y-2">
            <button 
              @click="openWhatsApp"
              class="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 group"
            >
              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <i class="fab fa-whatsapp text-white text-sm"></i>
              </div>
              <div class="text-left">
                <div class="font-medium text-gray-900 text-sm">WhatsApp Support</div>
                <div class="text-xs text-gray-500">Get instant help</div>
              </div>
              <i class="fas fa-arrow-right text-gray-400 group-hover:text-green-500 ml-auto"></i>
            </button>
            
            <button 
              @click="openEmail"
              class="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 group"
            >
              <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <i class="fas fa-envelope text-white text-sm"></i>
              </div>
              <div class="text-left">
                <div class="font-medium text-gray-900 text-sm">Email Support</div>
                <div class="text-xs text-gray-500">support@vamaship.com</div>
              </div>
              <i class="fas fa-arrow-right text-gray-400 group-hover:text-blue-500 ml-auto"></i>
            </button>
            
            <button 
              @click="openPhone"
              class="w-full flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 group"
            >
              <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <i class="fas fa-phone text-white text-sm"></i>
              </div>
              <div class="text-left">
                <div class="font-medium text-gray-900 text-sm">Call Us</div>
                <div class="text-xs text-gray-500">+91 98765 43210</div>
              </div>
              <i class="fas fa-arrow-right text-gray-400 group-hover:text-purple-500 ml-auto"></i>
            </button>
          </div>
          
          <!-- Quick Links -->
          <div class="pt-2 border-t border-gray-100">
            <div class="flex space-x-4 text-xs">
              <button @click="openFAQ" class="text-blue-600 hover:text-blue-700 font-medium">FAQ</button>
              <button @click="openDocs" class="text-blue-600 hover:text-blue-700 font-medium">Documentation</button>
              <button @click="openStatus" class="text-blue-600 hover:text-blue-700 font-medium">Status</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showTooltip = ref(false)

const toggleHelp = () => {
  // For now, just toggle the tooltip
  showTooltip.value = !showTooltip.value
}

const openWhatsApp = () => {
  // Open WhatsApp with pre-filled message
  const message = encodeURIComponent("Hi! I need help with my Vamaship account setup.")
  window.open(`https://wa.me/919876543210?text=${message}`, '_blank')
  showTooltip.value = false
}

const openEmail = () => {
  // Open email client
  const subject = encodeURIComponent("Help with Vamaship Account Setup")
  const body = encodeURIComponent("Hi Vamaship Team,\n\nI need assistance with:\n\n")
  window.open(`mailto:support@vamaship.com?subject=${subject}&body=${body}`, '_blank')
  showTooltip.value = false
}

const openPhone = () => {
  // Open phone dialer
  window.open('tel:+919876543210', '_self')
  showTooltip.value = false
}

const openFAQ = () => {
  // Open FAQ page
  window.open('/faq', '_blank')
  showTooltip.value = false
}

const openDocs = () => {
  // Open documentation
  window.open('/docs', '_blank')
  showTooltip.value = false
}

const openStatus = () => {
  // Open status page
  window.open('/status', '_blank')
  showTooltip.value = false
}
</script>

<style scoped>
/* Custom animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.group:hover .animate-float {
  animation: float 2s ease-in-out infinite;
}

/* Ensure tooltip appears above other elements */
.fixed {
  z-index: 9999;
}
</style>
