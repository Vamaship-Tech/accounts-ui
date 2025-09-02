<template>
  <div v-if="isVisible" class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
    <div class="max-w-xl w-[min(92vw,36rem)] rounded-xl shadow-lg border border-gray-200 bg-white dark:bg-gray-900/95 dark:border-gray-800">
      <div class="p-4 sm:p-5">
        <div class="flex items-start gap-3">
          <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5 mt-0.5 text-amber-500">
            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.95" />
            <circle cx="9" cy="10" r="1.2" fill="white" opacity="0.95" />
            <circle cx="14.5" cy="8.5" r="1" fill="white" opacity="0.9" />
            <circle cx="13.5" cy="14.5" r="1.2" fill="white" opacity="0.95" />
          </svg>
          <p class="text-sm text-gray-700 dark:text-gray-200">
            We use cookies to enhance your experience, analyze usage, and improve our services.
          </p>
        </div>
        <div class="mt-3 flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            @click="accept"
          >
            Allow cookies
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 focus:outline-none"
            @click="dismiss"
          >
            Not now
          </button>
          <a
            href="#"
            class="ml-auto text-xs text-gray-500 underline hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Learn more
          </a>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const CONSENT_KEY = 'cookieConsent'
const isVisible = ref(false)

onMounted(() => {
  try {
    const value = localStorage.getItem(CONSENT_KEY)
    isVisible.value = value !== 'accepted'
  } catch {
    isVisible.value = true
  }
})

function accept() {
  try {
    localStorage.setItem(CONSENT_KEY, 'accepted')
  } catch {}
  isVisible.value = false
}

function dismiss() {
  isVisible.value = false
}
</script>

<style scoped>
</style>


