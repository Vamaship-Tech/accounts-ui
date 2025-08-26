<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="max-w-2xl w-full text-center">
      <img src="/images/vamaship-logo.png" alt="Vamaship" class="mx-auto h-10 mb-6" />
      <div class="bg-white shadow-sm border border-gray-200 rounded-xl p-8">
        <div class="mx-auto mb-6 w-full flex justify-center">
          <!-- Inline SVG Illustration -->
          <svg class="h-40 w-40 text-blue-600" viewBox="0 0 256 256" fill="none" role="img" aria-label="404 illustration">
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="currentColor" stop-opacity="0.15" />
                <stop offset="100%" stop-color="currentColor" stop-opacity="0.05" />
              </linearGradient>
            </defs>
            <!-- Background blob -->
            <circle cx="128" cy="128" r="96" fill="url(#grad)" />
            <!-- Magnifying glass -->
            <circle cx="108" cy="112" r="44" stroke="currentColor" stroke-width="8" fill="white" />
            <line x1="141" y1="145" x2="184" y2="188" stroke="currentColor" stroke-width="10" stroke-linecap="round" />
            <!-- 404 text as shapes -->
            <path d="M40 156 l24 -36 v36" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M64 156 h-24" stroke="currentColor" stroke-width="10" stroke-linecap="round" />
            <rect x="192" y="120" width="24" height="36" rx="4" stroke="currentColor" stroke-width="10" fill="none" />
            <line x1="192" y1="138" x2="216" y2="138" stroke="currentColor" stroke-width="10" stroke-linecap="round" />
          </svg>
        </div>
        <p class="text-sm font-medium text-blue-600 mb-2">Error 404</p>
        <h1 class="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">Page not found</h1>
        <p class="text-gray-600 mb-8">The page you’re looking for doesn’t exist, was moved, or is temporarily unavailable.</p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button @click="goBack" class="btn-secondary w-full sm:w-auto">Go back</button>
          <router-link to="/login" class="btn-primary w-full sm:w-auto text-center">Go to Login</router-link>
        </div>

        <div class="mt-6 text-sm text-gray-500">
          Or try one of these:
          <div class="mt-3 flex flex-wrap justify-center gap-3">
            <router-link to="/signup/mobile" class="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">Create an account</router-link>
            <router-link to="/forgot-password" class="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">Reset password</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => router.back()
</script>


