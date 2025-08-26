<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="max-w-lg w-full text-center">
      <img src="/images/vamaship-logo.png" alt="Vamaship" class="mx-auto h-10 mb-6" />
      <div class="bg-white shadow-sm border border-gray-200 rounded-xl p-8">
        <div class="text-5xl mb-4">🛠️</div>
        <h1 class="text-2xl font-semibold text-gray-900 mb-2">We'll be back soon</h1>
        <p class="text-gray-600 mb-6">
          Our systems are undergoing scheduled maintenance to improve your experience. Please check back later.
        </p>
        <div class="text-sm text-gray-500" v-if="windowTitle">
          {{ windowTitle }}
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { computed } from 'vue'

const windowTitle = computed(() => import.meta.env.VITE_MAINTENANCE_MESSAGE || '')
</script>


