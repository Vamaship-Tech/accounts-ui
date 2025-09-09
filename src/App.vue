<template>
  <div id="app">
    <!-- Loading state while checking authentication -->
    <div v-if="authStore.isCheckingAuth" class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Ripple :size="154" color="#3950cf" speed="1.2s" />
    </div>

    <!-- Main app content & cookie consent -->
    <template v-else>
      <router-view />
      <CookieConsent />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Ripple, CookieConsent } from '@/components/common'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  // Check authentication when app starts
  try {
    await authStore.checkAuth()
  } catch (error) {
    console.error('Initial auth check failed:', error)
  }
})

// Redirect to login if a global auth error occurs
watch(
  () => authStore.authCheckError,
  (val) => {
    if (val) {
      authStore.clearAuthCheckError()
      router.push('/login')
    }
  }
)
</script>

<style>
#app {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
