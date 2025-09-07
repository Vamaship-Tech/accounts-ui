<template>
  <div class="relative min-h-screen overflow-hidden">
    <BackgroundElements />

    <!-- Decorative Aurora/Orbs -->
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="aurora aurora-1"></div>
      <div class="aurora aurora-2"></div>
      <div class="aurora aurora-3"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 flex items-center justify-center min-h-screen px-6 py-16">
      <div class="w-full max-w-4xl">
        <div class="group relative mx-auto overflow-hidden rounded-3xl border border-white/30 bg-white/40 p-8 md:p-12 backdrop-blur-xl shadow-[0_10px_80px_-15px_rgba(59,130,246,0.35)]">
          <!-- Glow ring -->
          <div class="pointer-events-none absolute -inset-1 rounded-[28px] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-400/20 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"></div>

          <div class="flex flex-col items-center text-center">
            <!-- Brand -->
            <img src="/images/vamaship-logo.png" alt="Vamaship" class="h-10 mb-6" />

            <!-- Status pill -->
            <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-300/40 bg-white/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
              <span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Scheduled Maintenance
            </div>

            <!-- Animated ring / gear motif -->
            <div class="relative mb-6">
              <div class="loader-ring"></div>
              <div class="loader-core">🛠️</div>
            </div>

            <!-- Headline -->
            <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-br from-blue-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent">We’ll be right back</h1>
            <p class="mt-3 max-w-2xl text-gray-600">We’re performing upgrades to make your experience faster, safer, and more delightful.</p>

            <!-- Maintenance window / message -->
            <div v-if="windowTitle" class="mt-5 w-full max-w-xl mx-auto rounded-xl border border-gray-200/70 bg-white/70 p-4 text-left">
              <div class="flex items-start gap-3">
                <div class="mt-0.5 h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">i</div>
                <div>
                  <p class="text-sm text-gray-700">{{ windowTitle }}</p>
                </div>
              </div>
            </div>

            <!-- Progress shimmer -->
            <div class="mt-6 w-full max-w-xl">
              <div class="progress-track">
                <div class="progress-bar"></div>
              </div>
              <div class="mt-2 text-xs text-gray-500">Working through final steps…</div>
            </div>

            <!-- Actions -->
            <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <router-link
                to="/"
                class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-transform hover:scale-[1.015] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                Back to Home
              </router-link>
              <router-link
                to="/login"
                class="inline-flex items-center justify-center rounded-xl border border-gray-300/70 bg-white/60 px-5 py-3 text-sm font-semibold text-gray-800 backdrop-blur-md transition-colors hover:border-gray-400 hover:bg-white"
              >
                Try Login
              </router-link>
            </div>

            <!-- Meta -->
            <div class="mt-6 text-xs text-gray-500">
              Last updated: <span class="font-mono">{{ lastUpdated }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subtle scanlines overlay -->
    <div class="pointer-events-none fixed inset-0 z-[5] mix-blend-soft-light">
      <div class="h-full w-full scanlines opacity-[0.03]"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BackgroundElements from '@/components/common/BackgroundElements.vue'

const windowTitle = computed(() => import.meta.env.VITE_MAINTENANCE_MESSAGE || '')
const lastUpdated = computed(() => new Date().toLocaleString())
</script>

<style scoped>
@keyframes rotate360 {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.loader-ring {
  width: 120px;
  height: 120px;
  border-radius: 9999px;
  background: conic-gradient(from 0deg, rgba(59,130,246,0.6), rgba(168,85,247,0.6), rgba(16,185,129,0.6), rgba(59,130,246,0.6));
  -webkit-mask: radial-gradient(farthest-side, transparent 65%, black 66%);
  mask: radial-gradient(farthest-side, transparent 65%, black 66%);
  animation: rotate360 12s linear infinite;
  filter: drop-shadow(0 0 18px rgba(59,130,246,0.35));
}

.loader-core {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  transform: translateY(0.5px);
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

.scanlines {
  background-image: linear-gradient(rgba(0,0,0,0.25) 1px, transparent 1px);
  background-size: 100% 3px;
}

.progress-track {
  height: 10px;
  width: 100%;
  border-radius: 9999px;
  background: linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6));
  border: 1px solid rgba(203,213,225,0.8);
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.04);
}

.progress-bar {
  position: absolute;
  inset: 0 0 0 0;
  background: linear-gradient(90deg, rgba(59,130,246,0) 0%, rgba(59,130,246,0.4) 20%, rgba(168,85,247,0.5) 50%, rgba(16,185,129,0.4) 80%, rgba(59,130,246,0) 100%);
  transform: translateX(-100%);
  animation: shimmer 2.6s ease-in-out infinite;
}
</style>


