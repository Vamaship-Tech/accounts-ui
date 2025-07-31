<script setup lang="ts">
</script>
<template>
  <div class="text-base-content w-full">
    <div class="bg-base-300 md:px-10 py-10 rounded-lg mx-auto md:mt-50 sm:h-auto h-screen max-w-100 text-center grid">
      <h1 class="text-2xl font-medium">Forgot Password</h1>
      <h2 class="text-sm mt-2">
        You will receive a link on your registered email address to reset your password.
      </h2>
      <div class="grid gap-3 mt-5">
        <div>
          <label class="input">
            <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </g>
            </svg>
            <input type="email" placeholder="Email" required />
          </label>
        </div>
      </div>
      <div class="mt-5">
        <button class="btn btn-primary w-80">Send Reset Link</button>
      </div>
      <div class="text-sm mt-5">
        --- OR ---
      </div>
      <div class="mt-5">
        <a href="https://accounts.vamaship.com/sign-in" class="btn w-80">Sign In</a>
      </div>
    </div>
  </div>
</template>
