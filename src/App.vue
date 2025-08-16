<template>
  <div id="app">
    <!-- Loading state while checking authentication -->
    <div v-if="authStore.isLoading" class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Checking authentication...</p>
      </div>
    </div>
    
    <!-- Error state if authentication fails -->
    <div v-else-if="authStore.error" class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div class="text-red-500 text-4xl mb-4">⚠️</div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
        <p class="text-gray-600 mb-4">{{ authStore.error }}</p>
        <div class="space-y-2">
          <button 
            @click="retryAuth" 
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
          <button 
            @click="goToLogin" 
            class="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
    
    <!-- Main app content -->
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const retryAuth = async () => {
  try {
    await authStore.checkAuth()
  } catch (error) {
    console.error('Retry auth failed:', error)
  }
}

const goToLogin = () => {
  authStore.clearError()
  router.push('/login')
}

onMounted(async () => {
  // Check authentication when app starts
  try {
    await authStore.checkAuth()
  } catch (error) {
    console.error('Initial auth check failed:', error)
  }
})
</script>

<style>
#app {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
