<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 relative overflow-hidden">
    <BackgroundElements />

    <div class="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-6 lg:px-8 sm:-mt-12">
      <div class="w-full max-w-4xl mx-auto">
        <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div class="flex flex-col h-full">
              <div class="text-center mb-4 sm:mb-6">
                <h1 class="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Select Entity
                </h1>
                <p class="mt-1 text-xs sm:text-sm text-gray-500">Choose the entity you want to continue with.</p>
              </div>

              <div v-if="authStore.error" class="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-xs sm:text-sm text-red-800">{{ authStore.error }}</p>
              </div>

              <div class="space-y-3">
                <button
                  v-for="entity in entities"
                  :key="String(entity.id)"
                  @click="() => handleSelect(entity.id)"
                  class="w-full flex items-center p-3 sm:p-4 border border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition"
                >
                  <img v-if="entity.logo" :src="entity.logo" alt="logo" class="h-10 w-10 rounded mr-3 object-cover" />
                  <div class="text-left">
                    <div class="text-sm sm:text-base font-medium text-gray-800">{{ entity.entity_name }}</div>
                    <div class="text-xs text-gray-500">ID: {{ entity.id }}</div>
                  </div>
                </button>
              </div>

              <div class="mt-6 mt-auto">
                <button 
                  class="w-full py-2 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base bg-purple-600 hover:bg-purple-700 text-white"
                  @click="goBack"
                >
                  Back to Login
                  <span class="ml-2">
                    <ArrowLeftIcon class="h-4 w-4" />
                  </span>
                </button>
              </div>
            </div>

            <div class="hidden md:flex items-center justify-center">
              <img src="/images/choose-entity1.png" alt="Choose Entity" class="w-full h-auto rounded-xl max-w-sm md:max-w-md lg:max-w-lg mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BackgroundElements from '@/components/common/BackgroundElements.vue'
import type { EntitySummary } from '@/types/auth'
import router from '@/router'

const authStore = useAuthStore()

const entities = computed<EntitySummary[]>(() => authStore.availableEntities ?? [])

// Redirect to login if no entities or missing temp token (e.g., after refresh)
const redirectIfNoSelectionContext = () => {
  const hasEntities = Array.isArray(authStore.availableEntities) && authStore.availableEntities.length > 0
  const hasToken = !!authStore.tempEntityToken
  if (!hasEntities || !hasToken) {
    router.replace({ name: 'login' })
  }
}

onMounted(() => {
  redirectIfNoSelectionContext()
})

watchEffect(() => {
  redirectIfNoSelectionContext()
})

const handleSelect = async (id: string | number) => {
  const res = await authStore.selectEntity(id)
  if (!res.success) {
    // No-op; error banner is already set in store
    // Optionally we could toast here
  }
}

const goBack = () => {
  router.push({ name: 'login' })
}
</script>


