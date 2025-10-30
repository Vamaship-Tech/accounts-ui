<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="mx-auto max-w-4xl space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Banner Component Demo</h1>
        <p class="text-gray-600">Examples of the Banner component in different configurations</p>
      </div>

      <!-- Basic Banner -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800">Basic Banner</h2>
        <Banner 
          title="GeneriCon 2023"
          description="Join us in Denver from June 7 – 9 to see what's coming next."
        />
      </div>

      <!-- Banner with Action Button -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800">Banner with Action Button</h2>
        <Banner 
          title="GeneriCon 2023"
          description="Join us in Denver from June 7 – 9 to see what's coming next."
          actionText="Register now"
          actionUrl="#"
        />
      </div>

      <!-- Dismissible Banner -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800">Dismissible Banner</h2>
        <Banner 
          v-if="showDismissibleBanner"
          title="Limited Time Offer"
          description="Get 20% off all products until the end of this month."
          actionText="Shop now"
          actionUrl="#"
          :dismissible="true"
          @dismiss="showDismissibleBanner = false"
        />
        <div v-else class="text-center py-4">
          <button 
            @click="showDismissibleBanner = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Show Banner Again
          </button>
        </div>
      </div>

      <!-- Custom Content Banner -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800">Custom Content Banner</h2>
        <Banner 
          title="New Feature Released"
          description="We've just launched our new dashboard with advanced analytics and real-time monitoring capabilities."
          actionText="Learn more"
          actionUrl="#"
        />
      </div>

      <!-- Banner without Action -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800">Informational Banner</h2>
        <Banner 
          title="System Maintenance"
          description="Scheduled maintenance will occur on Sunday, December 15th from 2:00 AM to 6:00 AM EST."
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Banner } from '@/components/common'

const showDismissibleBanner = ref(true)
</script> 