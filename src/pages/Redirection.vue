<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="text-gray-600">Redirecting to KYC...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  const token = route.query.token;
  const apiKey = route.query.api_key;
  const userInfo = route.query.user_info;
  
  if (token || apiKey || userInfo) {
    router.replace({
      path: '/kyc',
      query: {
        ...route.query,
        source: 'ecom3-ui'
      }
    });
  } else {
    router.replace('/sign-in');
  }
})
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style> 