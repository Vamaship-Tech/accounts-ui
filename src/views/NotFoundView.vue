<template>
  <div class="relative min-h-screen overflow-hidden">
    <BackgroundElements />

    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="aurora aurora-1"></div>
      <div class="aurora aurora-2"></div>
      <div class="aurora aurora-3"></div>
    </div>

    <div class="relative z-10 flex items-center justify-center min-h-screen px-6 py-16">
      <div class="w-full max-w-4xl">
        <div class="group relative mx-auto overflow-hidden rounded-3xl border border-white/30 bg-white/40 p-8 backdrop-blur-xl shadow-[0_10px_80px_-15px_rgba(59,130,246,0.35)]">
          <div class="pointer-events-none absolute -inset-1 rounded-[28px] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-400/20 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"></div>

          <div class="flex flex-col items-center text-center">
            <div class="relative mb-4 flex items-center gap-3">
              <span class="inline-block h-2 w-2 animate-ping rounded-full bg-emerald-400/80"></span>
              <span class="text-xs font-medium tracking-widest text-gray-600 uppercase">Error</span>
              <span class="inline-block h-2 w-2 animate-ping rounded-full bg-blue-400/80"></span>
            </div>

            <div class="relative mb-2">
              <div class="absolute -inset-x-6 -inset-y-4 -z-10 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-400/10 blur-2xl"></div>
              <h1 class="select-none text-[14vw] leading-none font-extrabold tracking-tight bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(59,130,246,0.25)]">404</h1>
              <div class="shine"></div>
            </div>

            <h2 class="text-2xl md:text-3xl font-semibold text-gray-900/90">Lost in transit — page not found</h2>
            <p class="mt-3 max-w-2xl text-gray-600">The route you’re looking for has been misplaced, moved, or never existed. Let’s get you back on track.</p>

            <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <router-link
                to="/login"
                class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-transform hover:scale-[1.015] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                Go to Login
              </router-link>
              <router-link
                to="/"
                class="inline-flex items-center justify-center rounded-xl border border-gray-300/70 bg-white/60 px-5 py-3 text-sm font-semibold text-gray-800 backdrop-blur-md transition-colors hover:border-gray-400 hover:bg-white"
              >
                Back to Home
              </router-link>
            </div>

            <div class="mt-6 text-xs text-gray-500">
              <span class="opacity-80">Error code:</span> <span class="font-mono">HTTP 404</span>
            </div>
          </div>

          <div class="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-blue-400/30 orbit"></div>
          <div class="pointer-events-none absolute -left-10 bottom-10 h-40 w-40 rounded-full border border-emerald-400/30 orbit orbit-delayed"></div>
        </div>
      </div>
    </div>

    <div class="pointer-events-none fixed inset-0 z-[5] mix-blend-soft-light">
      <div class="h-full w-full scanlines opacity-[0.03]"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BackgroundElements from '@/components/common/BackgroundElements.vue'
</script>

<style scoped>
@keyframes orbitSpin {
  0% { transform: rotate(0deg) translateX(10px) rotate(0deg); }
  50% { transform: rotate(180deg) translateX(10px) rotate(-180deg); }
  100% { transform: rotate(360deg) translateX(10px) rotate(-360deg); }
}

@keyframes auroraMove {
  0% { transform: translate3d(-10%, -10%, 0) scale(1); }
  50% { transform: translate3d(10%, 10%, 0) scale(1.05); }
  100% { transform: translate3d(-10%, -10%, 0) scale(1); }
}

@keyframes shineMove {
  0% { transform: translateX(-150%) rotate(8deg); }
  100% { transform: translateX(150%) rotate(8deg); }
}

.orbit {
  animation: orbitSpin 22s linear infinite;
  box-shadow: 0 0 40px -10px rgba(59,130,246,0.25);
}

.orbit::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle at 30% 30%, rgba(59,130,246,0.9), rgba(59,130,246,0.2));
  border-radius: 9999px;
  box-shadow: 0 0 30px rgba(59,130,246,0.35);
}

.orbit.orbit-delayed {
  animation-duration: 28s;
  animation-delay: -8s;
}

.aurora {
  position: absolute;
  border-radius: 9999px;
  filter: blur(48px);
  opacity: 0.55;
  mix-blend-mode: screen;
  animation: auroraMove 18s ease-in-out infinite;
  will-change: transform;
}

.aurora-1 { inset: 10% auto auto -10%; width: 40vw; height: 40vw; background: radial-gradient(60% 60% at 30% 30%, rgba(59,130,246,0.45), transparent 70%), radial-gradient(50% 50% at 70% 70%, rgba(16,185,129,0.35), transparent 70%); }
.aurora-2 { inset: auto -15% 5% auto; width: 45vw; height: 45vw; background: radial-gradient(60% 60% at 70% 30%, rgba(168,85,247,0.45), transparent 70%), radial-gradient(50% 50% at 30% 70%, rgba(59,130,246,0.35), transparent 70%); animation-direction: reverse; animation-duration: 24s; }
.aurora-3 { inset: 40% 10% auto auto; width: 28vw; height: 28vw; background: radial-gradient(60% 60% at 50% 50%, rgba(16,185,129,0.45), transparent 70%); animation-duration: 30s; }

.shine {
  position: absolute;
  inset: auto 0 0 0;
  height: 100%;
  pointer-events: none;
}

.shine::before {
  content: '';
  position: absolute;
  top: -20%;
  left: 0;
  width: 30%;
  height: 160%;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%);
  transform: translateX(-150%) rotate(8deg);
  animation: shineMove 3s ease-in-out infinite;
}

.scanlines {
  background-image: linear-gradient(rgba(0,0,0,0.25) 1px, transparent 1px);
  background-size: 100% 3px;
}
</style>
