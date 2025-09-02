<template>
  <div id="app">
    <!-- Loading state while checking authentication -->
    <div v-if="authStore.isLoading" class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div class="max-w-md w-full text-center">
        <div class="bg-white shadow-sm border border-gray-200 rounded-xl p-8">
          <div class="mx-auto mb-4 w-full flex justify-center">
            <SpinnerLoader size="xl" />
          </div>
          <h2 class="text-lg font-semibold text-gray-900 mb-1">Checking authentication</h2>
          <p class="text-gray-600">Please wait a moment while we get things ready.</p>
        </div>
      </div>
    </div>
    
    <!-- Error state if authentication fails during global auth check -->
    <div v-else-if="authStore.authCheckError" class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div class="max-w-md w-full text-center">
        <div class="bg-white shadow-sm border border-gray-200 rounded-xl p-8">
          <div class="mx-auto mb-4 w-full flex justify-center text-red-600">
            <!-- Warning triangle SVG -->
            <svg viewBox="0 0 24 24" width="48" height="48" aria-hidden="true">
              <path fill="currentColor" d="M11.19 3.2 1.53 19.2A2 2 0 0 0 3.24 22h17.52a2 2 0 0 0 1.71-2.8L12.81 3.2a2 2 0 0 0-3.62 0Z" opacity="0.15" />
              <path fill="currentColor" d="M12 8c.55 0 1 .45 1 1v5a1 1 0 1 1-2 0V9c0-.55.45-1 1-1Zm0 10a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z" />
              <path fill="currentColor" d="M11.19 3.2 1.53 19.2A2 2 0 0 0 3.24 22h17.52a2 2 0 0 0 1.71-2.8L12.81 3.2a2 2 0 0 0-3.62 0Zm1.62 1.03a.5.5 0 0 1 .87 0l9.66 16a.5.5 0 0 1-.43.77H3.24a.5.5 0 0 1-.43-.77l9.66-16Z" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Authentication error</h2>
          <p class="text-gray-600 mb-6">{{ authStore.authCheckError }}</p>
          <div class="flex flex-col gap-2">
            <button @click="retryAuth" class="btn-primary">Retry</button>
            <button @click="goToLogin" class="btn-secondary">Go to Login</button>
          </div>
          <p class="mt-4 text-xs text-gray-400">If this keeps happening, please try clearing cookies and reloading.</p>
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
import { SpinnerLoader } from '@/components/common'

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
  authStore.clearAuthCheckError()
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
