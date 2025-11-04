<template>
  <div class="relative overflow-hidden py-4">
    <!-- Blur overlay on left side -->
    <div class="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white/40 to-transparent backdrop-blur-[2px] z-10"></div>
    
    <!-- Blur overlay on right side -->
    <div class="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/40 to-transparent backdrop-blur-[2px] z-10"></div>
    
    <!-- Scrolling logos container -->
    <div class="logo-scroll-container flex items-center space-x-12 animate-scroll">
      <!-- First set of logos -->
      <div 
        v-for="i in 8" 
        :key="`logo-${i}`" 
        class="logo-item flex-shrink-0"
      >
        <img 
          :src="`/images/brands/${i}.png`" 
          :alt="`Brand ${i}`" 
          class="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
        />
      </div>
      
      <!-- Duplicate set for seamless loop -->
      <div 
        v-for="i in 8" 
        :key="`logo-duplicate-${i}`" 
        class="logo-item flex-shrink-0"
      >
        <img 
          :src="`/images/brands/${i}.png`" 
          :alt="`Brand ${i}`" 
          class="h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or additional logic needed for this component
</script>

<style scoped>
.logo-scroll-container {
  animation: scroll-left 30s linear infinite;
}

.logo-item {
  min-width: 128px; /* w-32 = 128px */
}

@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* Pause animation on hover */
.logo-cloud-container:hover .logo-scroll-container {
  animation-play-state: paused;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .logo-item {
    min-width: 96px; /* w-24 = 96px */
  }
  
  .logo-scroll-container {
    animation-duration: 25s; /* Faster on mobile */
  }
}
</style> 