<template>
  <div class="fixed inset-0 w-full min-h-screen overflow-hidden">
    <!-- Base background -->
    <div class="absolute inset-0 w-full h-full bg-white -z-30" />
    
    <!-- Grid Pattern -->
    <div 
      class="absolute inset-0 w-full h-full -z-20" 
      :style="{
        backgroundImage: 'linear-gradient(to right, #4B6921 1px, transparent 1px), linear-gradient(to bottom, #4B6921 1px, transparent 1px)',
        backgroundSize: '29px 29px',
        opacity: 0.2,
        maskImage: 'radial-gradient(ellipse at center, white, transparent 90%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, white, transparent 90%)'
      }"
    />
    
    <!-- Spots -->
    <div 
      class="absolute -z-10 rounded-full spot-animation" 
      :style="{
        left: '66.52389709698024%', 
        top: '29.30413279519253%',
        width: '500px',
        height: '500px',
        backgroundColor: '#2d81da',
        opacity: 0.6589360846892873,
        filter: 'blur(114px)'
      }"
    />
  </div>
</template>

<script setup lang="ts">
// No props or logic needed for this component
</script>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translate(-50%, -50%) translateY(0px);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-20px);
  }
}

@keyframes move {
  0% {
    left: 66.52389709698024%;
    top: 29.30413279519253%;
  }
  25% {
    left: 80%;
    top: 15%;
  }
  50% {
    left: 20%;
    top: 70%;
  }
  75% {
    left: 10%;
    top: 40%;
  }
  100% {
    left: 66.52389709698024%;
    top: 29.30413279519253%;
  }
}

.spot-animation {
  transform: translate(-50%, -50%);
  animation: float 6s ease-in-out infinite, move 40s ease-in-out infinite;
}
</style> 