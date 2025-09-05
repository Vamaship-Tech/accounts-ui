<template>
  <div class="fixed inset-0 w-full min-h-screen overflow-hidden">
    <!-- Base background -->
    <div class="absolute inset-0 w-full h-full bg-white -z-30" />
    
    <!-- Subtle noise texture -->
    <div 
      class="absolute inset-0 w-full h-full -z-35 opacity-5"
      :style="{
        backgroundImage: 'radial-gradient(circle at 20% 80%, transparent 0%, rgba(0,0,0,0.01) 50%, transparent 100%), radial-gradient(circle at 80% 20%, transparent 0%, rgba(0,0,0,0.01) 50%, transparent 100%)',
        backgroundSize: '200px 200px'
      }"
    />
    
    <!-- Subtle gradient overlay -->
    <div class="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-50/30 via-transparent to-green-50/30 -z-25" />
    
    <!-- Grid Pattern -->
    <div 
      class="absolute inset-0 w-full h-full -z-20" 
      :style="{
        backgroundImage: 'linear-gradient(to right, #4B6921 0.8px, transparent 0.8px), linear-gradient(to bottom, #4B6921 0.8px, transparent 0.8px)',
        backgroundSize: '40px 40px',
        opacity: 0.1,
        maskImage: 'radial-gradient(ellipse at center, white, transparent 85%)',
        WebkitMaskImage: 'radial-gradient(ellipse at center, white, transparent 85%)'
      }"
    />
    
    <!-- Floating particles -->
    <div class="absolute inset-0 w-full h-full -z-15">
      <div class="absolute w-3 h-3 bg-blue-400/40 rounded-full particle" style="left: 15%; top: 25%;"></div>
      <div class="absolute w-2 h-2 bg-green-400/50 rounded-full particle" style="left: 85%; top: 75%;"></div>
      <div class="absolute w-3 h-3 bg-blue-400/40 rounded-full particle" style="left: 45%; top: 85%;"></div>
      <div class="absolute w-2 h-2 bg-green-400/50 rounded-full particle" style="left: 75%; top: 15%;"></div>
      <div class="absolute w-2 h-2 bg-blue-400/40 rounded-full particle" style="left: 25%; top: 65%;"></div>
      <div class="absolute w-3 h-3 bg-green-400/50 rounded-full particle" style="left: 65%; top: 35%;"></div>
    </div>
    
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
    
    <!-- Second smaller spot -->
    <div 
      class="absolute -z-10 rounded-full spot-animation-2" 
      :style="{
        left: '33.47610290301976%', 
        top: '70.69586720480747%',
        width: '600px',
        height: '600px',
        backgroundColor: '#2d81da',
        opacity: 0.4,
        filter: 'blur(100px)'
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

@keyframes float-particle {
  0%, 100% {
    transform: translateY(0px) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translateY(-25px) scale(1.2);
    opacity: 0.8;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
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

@keyframes move2 {
  0% {
    left: 33.47610290301976%;
    top: 70.69586720480747%;
  }
  25% {
    left: 20%;
    top: 85%;
  }
  50% {
    left: 80%;
    top: 30%;
  }
  75% {
    left: 90%;
    top: 60%;
  }
  100% {
    left: 33.47610290301976%;
    top: 70.69586720480747%;
  }
}

.particle {
  animation: float-particle 6s ease-in-out infinite, pulse 3s ease-in-out infinite;
  will-change: transform, opacity;
}

.particle:nth-child(1) { animation-delay: 0s; }
.particle:nth-child(2) { animation-delay: -1s; }
.particle:nth-child(3) { animation-delay: -2s; }
.particle:nth-child(4) { animation-delay: -3s; }
.particle:nth-child(5) { animation-delay: -4s; }
.particle:nth-child(6) { animation-delay: -5s; }

.spot-animation {
  transform: translate(-50%, -50%);
  animation: float 6s ease-in-out infinite, move 40s ease-in-out infinite;
  will-change: transform;
}

.spot-animation-2 {
  transform: translate(-50%, -50%);
  animation: float 8s ease-in-out infinite reverse, move2 35s ease-in-out infinite;
  will-change: transform;
}
</style> 