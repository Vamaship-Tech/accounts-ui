<template>
  <div class="flex items-center justify-center">
    <div 
      class="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
      :class="[
        size === 'sm' ? 'w-4 h-4' : '',
        size === 'md' ? 'w-6 h-6' : '',
        size === 'lg' ? 'w-8 h-8' : '',
        size === 'xl' ? 'w-12 h-12' : ''
      ]"
      :style="customSize ? `width: ${customSize}px; height: ${customSize}px;` : ''"
    ></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  customSize?: number
}

withDefaults(defineProps<Props>(), {
  size: 'md'
})
</script> 