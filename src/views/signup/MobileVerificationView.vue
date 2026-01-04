<template>
  <div class="min-h-screen w-full relative overflow-hidden">
    <BackgroundElements />
    <div class="relative z-10 w-full h-full">
      <div class="max-w-6xl mx-auto px-4 py-6 h-full flex items-center">
        <!-- Mobile Layout -->
        <div class="lg:hidden space-y-6">
          <!-- Marketing Content - Moved to top -->
          <div class="space-y-8">
            <div class="space-y-4 text-center">
              <!-- Vamaship Logo -->
              <div class="flex justify-start mb-4">
                <img src="/images/vamaship-logo.png" alt="Vamaship" class="h-16 w-auto" />
              </div>
              
            </div>
          </div>

          <div class="space-y-6">
            <!-- Main Form -->
            <div class="bg-white rounded-lg p-8 shadow-lg max-w-md mx-auto min-w-md min-h-[400px]">
              <!-- Tab Navigation -->
              <div v-if="!signupStore.otpSent" class="flex mb-6 border-b border-gray-200">
                <button
                  @click="activeTab = 'seller'"
                  :class="[
                    'flex-1 py-3 px-4 text-lg font-semibold transition-all duration-200 border-b-2 flex items-center justify-center gap-2',
                    activeTab === 'seller'
                      ? 'text-purple-600 border-purple-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  ]"
                >
                  <i class="fas fa-store"></i>
                  <span>Are you a seller?</span>
                </button>
                <button
                  @click="activeTab = 'track'"
                  :class="[
                    'flex-1 py-3 px-4 text-lg font-semibold transition-all duration-200 border-b-2 flex items-center justify-center gap-2',
                    activeTab === 'track'
                      ? 'text-purple-600 border-purple-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  ]"
                >
                  <i class="fas fa-shopping-cart"></i>
                  <span>Are you a Buyer?</span>
                </button>
              </div>
              
              <h2 v-if="activeTab === 'seller' && !signupStore.otpSent" class="text-xl font-semibold text-gray-900 mb-6 text-center">Start your seller account!</h2>
              <h2 v-else-if="signupStore.otpSent" class="text-xl font-semibold text-gray-900 mb-6 text-center">Start your seller account!</h2>
              
              <!-- Seller Account Tab Content -->
              <div v-if="activeTab === 'seller'">
              <div class="space-y-3 max-w-sm mx-auto" v-if="!signupStore.otpSent">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div class="relative">
                    <input 
                      v-model="signupStore.formData.phone"
                      @input="handlePhoneInput"
                      type="tel" 
                      placeholder="Enter Phone Number" 
                      class="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all bg-white text-gray-900"
                      maxlength="10"
                      style="min-height: 48px;"
                    />
                    <div class="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                      <span class="text-gray-600 font-medium">+91</span>
                      <span class="text-gray-400 mx-3">|</span>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">We'll send a verification code to this number</p>
                </div>
                
                <!-- <div v-if="isMobileAlreadyRegistered" class="mt-2 text-center">
                  <p class="text-sm text-blue-600">
                    <i class="fas fa-info-circle mr-1"></i>
                    Mobile number <strong>{{ signupStore.formData.phone }}</strong> is already registered. 
                    <button
                      @click="goToLogin"
                      class="text-blue-700 hover:text-blue-800 underline font-medium ml-1"
                    >
                      Login here
                    </button>
                  </p>
                </div> -->
                
                <button 
                  v-if="!signupStore.otpSent"
                  @click="sendOtp"
                  :disabled="signupStore.formData.phone.length !== 10 || signupStore.isLoading"
                  class="w-full text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center"
                  :class="{
                    'opacity-50 cursor-not-allowed': signupStore.formData.phone.length !== 10 || signupStore.isLoading,
                    'hover:bg-opacity-90': signupStore.formData.phone.length === 10 && !signupStore.isLoading
                  }"
                  style="background-color: #6A5ACD;"
                >
                  <SpinnerLoader v-if="signupStore.isLoading" size="sm" class="mr-3" />
                  {{ signupStore.isLoading ? 'Sending...' : 'Send OTP' }}
                </button>
                
                <!-- Already have account section -->
                <div class="text-center mt-4">
                  <span class="text-sm text-gray-600">Already have an account? </span>
                  <button
                    @click="goToLogin"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                  >
                    Sign In
                  </button>
                </div>
                
                <div v-if="signupStore.errors.general" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div class="flex items-center">
                    <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    <span class="text-red-700 text-sm font-medium">{{ signupStore.errors.general }}</span>
                  </div>
                </div>
                
                <div v-if="signupStore.errors.phone" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div class="flex items-center">
                    <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    <span class="text-red-700 text-sm font-medium">{{ signupStore.errors.phone }}</span>
                  </div>
                </div>
              </div>

                <!-- OTP Section -->
                <div v-if="signupStore.otpSent" class="mt-4 pt-4">
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                  <div class="flex space-x-2 justify-center items-center" ref="otpContainerRef">
                    <input 
                      v-for="(digit, index) in signupStore.formData.otp.slice(0, 3)" 
                      :key="index"
                      :ref="(el) => setOtpInputRef(el, index)"
                      v-model="signupStore.formData.otp[index]"
                      @input="handleOtpInput(index, $event)"
                      @keyup="handleOtpKeyup(index, $event)"
                      @keydown="handleOtpKeydown(index, $event)"
                      @click="handleOtpClick"
                      @paste="handleOtpPaste"
                      type="tel" 
                      class="w-10 h-10 sm:w-12 sm:h-12 lg:w-12 lg:h-12 text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm lg:text-base bg-white text-gray-900" 
                      maxlength="1"
                      inputmode="numeric"
                      autocomplete="one-time-code"
                      pattern="[0-9]*"
                      autocapitalize="off"
                      autocorrect="off"
                      @focus="handleOtpFocus"
                      :data-otp-index="index"
                    />
                    <span class="text-2xl text-gray-400 font-bold mx-2">-</span>
                    <input 
                      v-for="(digit, index) in signupStore.formData.otp.slice(3, 6)" 
                      :key="index + 3"
                      :ref="(el) => setOtpInputRef(el, index + 3)"
                      v-model="signupStore.formData.otp[index + 3]"
                      @input="handleOtpInput(index + 3, $event)"
                      @keyup="handleOtpKeyup(index + 3, $event)"
                      @keydown="handleOtpKeydown(index + 3, $event)"
                      @click="handleOtpClick"
                      @paste="handleOtpPaste"
                      type="tel" 
                      class="w-10 h-10 sm:w-12 sm:h-12 lg:w-12 lg:h-12 text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm lg:text-base bg-white text-gray-900" 
                      maxlength="1"
                      inputmode="numeric"
                      autocomplete="one-time-code"
                      pattern="[0-9]*"
                      autocapitalize="off"
                      autocorrect="off"
                      @focus="handleOtpFocus"
                      :data-otp-index="index + 3"
                    />
                  </div>                      
                  <div v-if="signupStore.errors.otp" class="mt-2 text-center">
                    <p class="text-xs text-red-600 font-medium">
                      <i class="fas fa-exclamation-circle mr-1"></i>
                      {{ signupStore.errors.otp }}
                    </p>
                  </div>
                  
                  <div v-if="signupStore.otpCooldown > 0" class="mt-2 text-center">
                    <p class="text-xs text-gray-600">
                      Resend OTP in <span class="font-mono text-blue-600 font-semibold">{{ formatOtpTime(signupStore.otpCooldown) }}</span>
                    </p>
                  </div>
                  
                  <div v-if="signupStore.otpCooldown === 0" class="mt-2 text-center">
                    <button
                      @click="resendOtp"
                      class="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
                
                <button 
                  @click="verifyOtp"
                  :disabled="!signupStore.isOtpComplete"
                  class="w-full text-white py-3 rounded-lg font-medium transition-all"
                  :class="{
                    'opacity-50 cursor-not-allowed': !signupStore.isOtpComplete,
                    'hover:bg-opacity-90': signupStore.isOtpComplete
                  }"
                  style="background-color: #6A5ACD;"
                >
                  Verify & Continue
                </button>
                
                <p class="text-xs text-gray-500 mt-3 text-center">By clicking on Continue, I agree to Vamaship's <a href="https://www.vamaship.com/terms-conditions" class="text-blue-600 hover:underline" target="_blank">Terms & Conditions</a> and <a href="https://www.vamaship.com/privacy-policy" class="text-blue-600 hover:underline" target="_blank">Privacy Policy</a>.</p>
                
                <!-- Change Number Option -->
                <div class="mt-4 text-center">
                  <button
                    @click="changeNumber"
                    class="text-gray-600 hover:text-gray-800 text-sm font-medium underline"
                  >
                    <i class="fas fa-arrow-left mr-1"></i>
                    Change Phone Number
                  </button>
                </div>
              </div>

                <!-- Google Sign-in -->
                <div v-if="!signupStore.otpSent" class="flex items-center my-4 max-w-sm mx-auto">
                  <div class="flex-1 h-px bg-gray-300"></div>
                  <span class="px-3 text-sm text-gray-500">or</span>
                  <div class="flex-1 h-px bg-gray-300"></div>
                </div>

                <GoogleSignIn 
                  v-if="!signupStore.otpSent" 
                  :is-loading="authStore.isLoading"
                  @googleSignIn="handleGoogleSignIn"
                  @googleError="handleGoogleError"
                />
              </div>
              
              <!-- Track Order Tab Content -->
              <div v-if="activeTab === 'track' && !signupStore.otpSent" class="max-w-sm mx-auto">
                <TrackingSection />
              </div>
            </div>

            <h1 class="text-3xl font-bold leading-tight pb-2 text-left" style="background: linear-gradient(135deg, #293773 0%, #6A5ACD 50%, #6A5ACD 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              Tired of Overpaying for Shipping?
              <span class="block text-lg text-gray-600 mt-2" style="-webkit-text-fill-color: initial;">Cut costs by 40% with Vamaship</span>
            </h1>
          </div>
        </div>

        <!-- Desktop Layout -->
        <div class="hidden lg:grid lg:grid-cols-2 gap-12 items-start">
          <!-- Left side - Marketing content -->
          <div class="space-y-8 sticky top-6">
            <div class="space-y-4">
              <!-- Vamaship Logo -->
              <div class="flex justify-start mb-6">
                <img src="/images/vamaship-logo.png" alt="Vamaship" class="h-24 w-auto" />
              </div>
              
              <h1 class="text-5xl font-bold leading-tight pb-2 text-left" style="background: linear-gradient(135deg, #293773 0%, #6A5ACD 50%, #6A5ACD 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                Tired of Overpaying for Shipping?
                <span class="block text-2xl text-gray-600 mt-3" style="-webkit-text-fill-color: initial;">Cut costs by 40% with Vamaship</span>
              </h1>
            </div>
            <div class="bg-transparent">
              <!-- <video src="/images/worldwide.mp4" alt="Vamaship" class="h-100 w-auto mix-blend-multiply edge-blur" autoplay loop muted playsinline /> -->
              <img src="/images/smartshipping1.png" alt="Vamaship" class="h-200 w-auto" />
            </div>
          </div>

          <!-- Right side - Form -->
          <div class="lg:pl-8 my-16">
            <!-- Same form as mobile but with desktop styling -->
            <div class="bg-white rounded-lg p-8 shadow-lg max-w-lg mx-auto lg:ml-auto min-w-lg min-h-[400px]">
              <!-- Tab Navigation -->
              <div v-if="!signupStore.otpSent" class="flex mb-6 border-b border-gray-200">
                <button
                  @click="activeTab = 'seller'"
                  :class="[
                    'flex-1 py-3 px-4 text-lg font-semibold transition-all duration-200 border-b-2 flex items-center justify-center gap-2',
                    activeTab === 'seller'
                      ? 'text-purple-600 border-purple-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  ]"
                >
                  <i class="fas fa-store"></i>
                  <span>Are you a seller?</span>
                </button>
                <button
                  @click="activeTab = 'track'"
                  :class="[
                    'flex-1 py-3 px-4 text-lg font-semibold transition-all duration-200 border-b-2 flex items-center justify-center gap-2',
                    activeTab === 'track'
                      ? 'text-purple-600 border-purple-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  ]"
                >
                  <i class="fas fa-shopping-cart"></i>
                  <span>Are you a Buyer?</span>
                </button>
              </div>
              
              <h2 v-if="activeTab === 'seller' && !signupStore.otpSent" class="text-xl font-semibold text-gray-900 mb-6 text-center">Start your seller account!</h2>
              <h2 v-else-if="signupStore.otpSent" class="text-xl font-semibold text-gray-900 mb-6 text-center">Start your seller account!</h2>
              
              <!-- Seller Account Tab Content -->
              <div v-if="activeTab === 'seller'">
              <div class="space-y-3 max-w-m mx-auto" v-if="!signupStore.otpSent">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div class="relative">
                    <input 
                      v-model="signupStore.formData.phone"
                      @input="handlePhoneInput"
                      type="tel" 
                      placeholder="Enter Phone Number" 
                      class="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all bg-white text-gray-900"
                      maxlength="10"
                      style="min-height: 48px;"
                    />
                    <div class="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                      <span class="text-gray-600 font-medium">+91</span>
                      <span class="text-gray-400 mx-3">|</span>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">We'll send a verification code to this number</p>
                </div>
                
                <!-- <div v-if="isMobileAlreadyRegistered" class="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg">
                  <div class="text-center">
                    <p class="text-blue-800 mb-2 text-sm">
                      The mobile number <strong class="text-blue-900">{{ signupStore.formData.phone }}</strong> is already registered with Vamaship.
                    </p>
                    <button
                      @click="goToLogin"
                      class="inline-flex items-center px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <i class="fas fa-sign-in-alt mr-1.5 text-xs"></i>
                      Login Here
                    </button>
                  </div>
                </div> -->
                
                <button 
                  v-if="!signupStore.otpSent && !isMobileAlreadyRegistered"
                  @click="sendOtp"
                  :disabled="signupStore.formData.phone.length !== 10 || signupStore.isLoading"
                  class="w-full text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center"
                  :class="{
                    'opacity-80 cursor-not-allowed': signupStore.formData.phone.length !== 10 || signupStore.isLoading,
                    'hover:bg-opacity-90': signupStore.formData.phone.length === 10 && !signupStore.isLoading
                  }"
                  style="background-color: #6A5ACD;"
                >
                  <SpinnerLoader v-if="signupStore.isLoading" size="sm" class="mr-3" />
                  {{ signupStore.isLoading ? 'Sending...' : 'Send OTP' }}
                </button>
                
                <!-- Already have account section -->
                <div class="text-center mt-4">
                  <span class="text-sm text-gray-600">Already have an account? </span>
                  <button
                    @click="goToLogin"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                  >
                    Sign In
                  </button>
                </div>
                
                <div v-if="signupStore.errors.general" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div class="flex items-center">
                    <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    <span class="text-red-700 text-sm font-medium">{{ signupStore.errors.general }}</span>
                  </div>
                </div>
                
                <div v-if="signupStore.errors.phone" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div class="flex items-center">
                    <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                    <span class="text-red-700 text-sm font-medium">{{ signupStore.errors.phone }}</span>
                  </div>
                </div>
              </div>

                <!-- OTP Section -->
                <div v-if="signupStore.otpSent" class="mt-4 flex-1">
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                  <div class="flex space-x-2 justify-center items-center" ref="otpContainerRef">
                    <input 
                      v-for="(digit, index) in signupStore.formData.otp.slice(0, 3)" 
                      :key="index"
                      :ref="(el) => setOtpInputRef(el, index)"
                      v-model="signupStore.formData.otp[index]"
                      @input="handleOtpInput(index, $event)"
                      @keyup="handleOtpKeyup(index, $event)"
                      @keydown="handleOtpKeydown(index, $event)"
                      @click="handleOtpClick"
                      @paste="handleOtpPaste"
                      type="tel" 
                      class="w-15 h-15 sm:w-12 sm:h-12 lg:w-15 lg:h-15 text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm lg:text-base bg-white text-gray-900" 
                      maxlength="1"
                      inputmode="numeric"
                      autocomplete="one-time-code"
                      pattern="[0-9]*"
                      autocapitalize="off"
                      autocorrect="off"
                      @focus="handleOtpFocus"
                      :data-otp-index="index"
                    />
                    <span class="text-2xl text-gray-400 font-bold mx-2">-</span>
                    <input 
                      v-for="(digit, index) in signupStore.formData.otp.slice(3, 6)" 
                      :key="index + 3"
                      :ref="(el) => setOtpInputRef(el, index + 3)"
                      v-model="signupStore.formData.otp[index + 3]"
                      @input="handleOtpInput(index + 3, $event)"
                      @keyup="handleOtpKeyup(index + 3, $event)"
                      @keydown="handleOtpKeydown(index + 3, $event)"
                      @click="handleOtpClick"
                      @paste="handleOtpPaste"
                      type="tel" 
                      class="w-15 h-15 sm:w-12 sm:h-12 lg:w-15 lg:h-15 text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm lg:text-base bg-white text-gray-900" 
                      maxlength="1"
                      inputmode="numeric"
                      autocomplete="one-time-code"
                      pattern="[0-9]*"
                      autocapitalize="off"
                      autocorrect="off"
                      @focus="handleOtpFocus"
                      :data-otp-index="index + 3"
                    />
                  </div>                      
                  <div v-if="signupStore.errors.otp" class="mt-2 text-center">
                    <p class="text-xs text-red-600 font-medium">
                      <i class="fas fa-exclamation-circle mr-1"></i>
                      {{ signupStore.errors.otp }}
                    </p>
                  </div>
                  
                  <div v-if="signupStore.otpCooldown > 0" class="mt-2 text-center">
                    <p class="text-xs text-gray-600">
                      Resend OTP in <span class="font-mono text-blue-600 font-semibold">{{ formatOtpTime(signupStore.otpCooldown) }}</span>
                    </p>
                  </div>
                  
                  <div v-if="signupStore.otpCooldown === 0" class="mt-2 text-center">
                    <button
                      @click="resendOtp"
                      class="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
                
                <button 
                  @click="verifyOtp"
                  :disabled="!signupStore.isOtpComplete"
                  class="w-full text-white py-3 rounded-lg font-medium transition-all"
                  :class="{
                    'opacity-50 cursor-not-allowed': !signupStore.isOtpComplete,
                    'hover:bg-opacity-90': signupStore.isOtpComplete
                  }"
                  style="background-color: #6A5ACD;"
                >
                  Verify & Continue
                </button>
                
                <p class="text-xs text-gray-500 mt-3 text-center">By clicking on Continue, I agree to Vamaship's <a href="https://www.vamaship.com/terms-conditions" class="text-blue-600 hover:underline" target="_blank">Terms & Conditions</a> and <a href="https://www.vamaship.com/privacy-policy" class="text-blue-600 hover:underline" target="_blank">Privacy Policy</a>.</p>
                
                <!-- Change Number Option -->
                <div class="mt-4 text-center">
                  <button
                    @click="changeNumber"
                    class="text-gray-600 hover:text-gray-800 text-sm font-medium underline"
                  >
                    <!-- <i class="fas fa-arrow-left mr-1"></i> -->
                    Change Phone Number
                  </button>
                </div>
              </div>

                <!-- Google Sign-in -->
                <div v-if="!signupStore.otpSent" class="flex items-center my-4 max-w-sm mx-auto">
                  <div class="flex-1 h-px bg-gray-300"></div>
                  <span class="px-3 text-sm text-gray-500">or</span>
                  <div class="flex-1 h-px bg-gray-300"></div>
                </div>

                <GoogleSignIn 
                  v-if="!signupStore.otpSent" 
                  :is-loading="authStore.isLoading"
                  @googleSignIn="handleGoogleSignIn"
                  @googleError="handleGoogleError"
                />
              </div>
              
              <!-- Track Order Tab Content -->
              <div v-if="activeTab === 'track' && !signupStore.otpSent" class="my-4 mx-auto">
                <TrackingSection />
              </div>
            </div>
          </div>
          <div>
          </div>
        </div>
        <!-- End of Desktop Layout -->
      </div>
      
      <LogoCloud class="mb-20"/>
      <!-- Improve Cash Flow Section -->
      <div class="w-full improve-cash-flow-section py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative z-10 overflow-hidden" style="background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(248,250,252,0.3) 10%, rgba(248,250,252,0.8) 20%, rgba(255,255,255,1) 30%, rgba(248,250,252,1) 50%, rgba(239,246,255,1) 100%);">
        <!-- Background Elements -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
        </div>
        
        <!-- Connection Line -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <div class="connection-line-container">
            <div class="connection-line" ref="connectionLine"></div>
            <div class="connection-start-dot"></div>
            <div class="connection-middle-dot"></div>
            <div class="connection-end-dot"></div>
          </div>
        </div>
        
        <div class="max-w-7xl mx-auto relative">
          <!-- Section Header -->
          <div class="text-center mb-12 sm:mb-20 section-heading">
            <div class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-sm font-medium text-purple-800 mb-6">
              <i class="fas fa-star text-yellow-500 mr-2"></i>
              Premium Features
            </div>
            <h4 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Improve Cash Flow & Provide a 
              <div class="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mt-3">
                Premium Buyer Experience
              </div>
            </h4>
            <p class="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Transform your shipping operations with our cutting-edge solutions designed to boost your business growth
            </p>
            <div class="w-32 h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 mx-auto rounded-full mt-8"></div>
          </div>
          
          <!-- Instant COD Remittance Row -->
          <div class="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-16 mb-16 sm:mb-24 content-section">
            <div class="lg:w-1/2 text-center lg:text-left">
              <div class="group relative">
                <div class="absolute -inset-1 bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div class="relative bg-white/80 backdrop-blur-sm p-6 sm:p-10 rounded-3xl shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500">
                  <div class="flex items-center justify-center lg:justify-start mb-6">
                    <div class="w-20 h-20 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <i class="fas fa-money-bill-wave text-white text-3xl"></i>
                    </div>
                    <div class="ml-4">
                      <div class="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Instant COD Remittance</h3>
                  <p class="text-base sm:text-lg text-gray-600 leading-relaxed mb-6">Get COD payments on the same day of delivery. No more waiting for weeks to receive your money.</p>
                  <div class="flex items-center text-purple-600 font-semibold">
                    <i class="fas fa-clock mr-2"></i>
                    <span>Same Day Processing</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="lg:w-1/2 flex justify-center">
              <div class="relative group">
                <div class="absolute -inset-4 bg-gradient-to-r from-purple-300 to-indigo-300 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <div class="relative">
                  <img src="/images/shopify_page_creatives.png" alt="COD Remittance" class="h-48 object-contain transform group-hover:scale-105 transition duration-500" />
                  <div class="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                    <i class="fas fa-check text-white text-sm"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- WhatsApp NDR Services Row -->
          <div class="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-16 mb-16 sm:mb-24 content-section">
            <div class="lg:w-1/2 flex items-end justify-center order-2 lg:order-1">
              <div class="relative group">
                <div class="absolute -inset-4 bg-gradient-to-r from-green-200 to-emerald-300 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <div class="relative flex items-end space-x-3 sm:space-x-6">
                  <img src="/images/messaging-mobile.png" alt="WhatsApp Integration" class="h-48 sm:h-80 object-contain transform group-hover:scale-105 transition duration-500" />
                  <div class="space-y-2 sm:space-y-4">
                    <img src="/images/whatsapp_ndr.png" alt="WhatsApp NDR" class="h-16 sm:h-20 object-contain transform group-hover:scale-105 transition duration-500 delay-100" />
                    <img src="/images/whatsapp_box.png" alt="WhatsApp Box" class="h-24 sm:h-32 object-contain transform group-hover:scale-105 transition duration-500 delay-200" />
                  </div>
                </div>
              </div>
            </div>
            <div class="lg:w-1/2 text-center lg:text-left order-1 lg:order-2">
              <div class="group relative">
                <div class="absolute -inset-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div class="relative bg-white/80 backdrop-blur-sm p-6 sm:p-10 rounded-3xl shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500">
                  <div class="flex items-center justify-center lg:justify-start mb-6">
                    <div class="w-20 h-20 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <i class="fab fa-whatsapp text-white text-3xl"></i>
                    </div>
                    <div class="ml-4">
                      <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">WhatsApp NDR Services</h3>
                  <p class="text-base sm:text-lg text-gray-600 leading-relaxed mb-6">Increase your delivery rate to 90% with intelligent WhatsApp integration and automated customer communication.</p>
                  <div class="flex items-center text-green-600 font-semibold">
                    <i class="fas fa-chart-line mr-2"></i>
                    <span>90% Delivery Success Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Customized Tracking Page Row -->
          <div class="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-16 content-section">
            <div class="lg:w-1/2 text-center lg:text-left">
              <div class="group relative">
                <div class="absolute -inset-1 bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div class="relative bg-white/80 backdrop-blur-sm p-6 sm:p-10 rounded-3xl shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500">
                  <div class="flex items-center justify-center lg:justify-start mb-6">
                    <div class="w-20 h-20 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <i class="fas fa-search text-white text-3xl"></i>
                    </div>
                    <div class="ml-4">
                      <div class="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Customized Tracking Page</h3>
                  <p class="text-base sm:text-lg text-gray-600 leading-relaxed mb-6">Offer branded tracking experiences with cross-selling features to maximize customer engagement and revenue.</p>
                  <div class="flex items-center text-purple-600 font-semibold">
                    <i class="fas fa-palette mr-2"></i>
                    <span>Fully Branded Experience</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="lg:w-1/2 flex justify-center">
              <div class="relative group">
                <div class="absolute -inset-4 bg-gradient-to-r from-purple-200 to-indigo-300 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <div class="relative">
                  <img src="/images/group_26.png" alt="Customized Tracking" class="h-48 sm:h-80 object-contain transform group-hover:scale-105 transition duration-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Courier Partners Section -->
      <div class="w-full courier-partners-section py-16 sm:py-24 px-4 sm:px-6 relative z-10 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 overflow-hidden">
        <!-- Background Elements -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl animate-pulse"></div>
          <div class="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-tl from-indigo-200/40 to-purple-200/40 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-100/30 to-blue-100/30 rounded-full blur-3xl"></div>
        </div>
        
        <div class="max-w-7xl mx-auto relative">
          <!-- Wide Network Content - Two Column Layout -->
          <div class="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-16">
            <!-- Left Side - Text Content -->
            <div class="lg:w-1/2 text-center lg:text-left">
              <div class="text-center mb-12 sm:mb-20 section-heading">
            <div class="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full text-sm font-medium text-blue-800 mb-6 sm:mb-8 shadow-lg">
              <i class="fas fa-network-wired text-blue-600 mr-2 sm:mr-3"></i>
              Global Network
            </div>
            <h4 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Access our 
              <span class="bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent">
                Wide Network
              </span>
              <br>of Courier Partners
              </h4>
            <p class="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
              Connect with India's most reliable courier partners through our unified platform. 
              Choose from multiple carriers to optimize cost, speed, and reliability.
            </p>
            <div class="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-500">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span>99.9% Uptime</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse" style="animation-delay: 0.5s;"></div>
                <span>24/7 Support</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 bg-purple-500 rounded-full mr-2 animate-pulse" style="animation-delay: 1s;"></div>
                <span>Real-time Tracking</span>
              </div>
            </div>
            <div class="w-32 h-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 mx-auto rounded-full mt-8"></div>
            </div>
            
                </div>
                
            <!-- Right Side - Animated Network Visualization -->
            <div class="lg:w-1/2 flex justify-center">
              <div class="relative group">
                <div class="absolute -inset-4 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <div class="relative">
                  <div class="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] wide-network-container">
                    <!-- Outer circle track for supplier names -->
                    <div class="absolute inset-0 rounded-full border-2 border-dashed border-red-500/80" style="border-color: rgba(239, 68, 68, 0.9);"></div>
                    
                    <!-- Inner circle track for SVGs -->
                    <div class="absolute inset-12 sm:inset-16 lg:inset-24 rounded-full border-2 border-dashed border-red-500/80"></div>
                    
                    <!-- Center Vamaship Logo -->
                    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                      <div class="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-2xl">
                        <img 
                          src="/images/vamaship-logo.png" 
                          alt="Vamaship" 
                          class="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain filter brightness-0 invert" 
                        />
                      </div>
                </div>
                
                    <!-- Inner Circle - SVG Icons (Clockwise) -->
                    <div class="inner-orbit absolute inset-12 sm:inset-16 lg:inset-24 animate-spin" style="animation-duration: 20s;">
                      <!-- Shipping Icon -->
                      <div class="svg-item absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <i class="fas fa-shipping-fast text-white text-sm sm:text-base lg:text-lg"></i>
                        </div>
                </div>
                
                      <!-- Tracking Icon -->
                      <div class="svg-item absolute top-1/4 right-0 transform translate-x-1/2 -translate-y-1/2">
                        <div class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                          <i class="fas fa-map-marker-alt text-white text-sm sm:text-base lg:text-lg"></i>
                        </div>
                </div>
                
                      <!-- Delivery Icon -->
                      <div class="svg-item absolute bottom-1/4 right-0 transform translate-x-1/2 translate-y-1/2">
                        <div class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                          <i class="fas fa-truck text-white text-sm sm:text-base lg:text-lg"></i>
                        </div>
                </div>
                
                      <!-- Package Icon -->
                      <div class="svg-item absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                        <div class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <i class="fas fa-box text-white text-sm sm:text-base lg:text-lg"></i>
                        </div>
                </div>
                
                      <!-- Global Icon -->
                      <div class="svg-item absolute bottom-1/4 left-0 transform -translate-x-1/2 translate-y-1/2">
                        <div class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                          <i class="fas fa-globe text-white text-sm sm:text-base lg:text-lg"></i>
                        </div>
                </div>
                
                      <!-- Shield Icon -->
                      <div class="svg-item absolute top-1/4 left-0 transform -translate-x-1/2 -translate-y-1/2">
                        <div class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                          <i class="fas fa-shield-alt text-white text-sm sm:text-base lg:text-lg"></i>
                        </div>
                      </div>
                </div>
                
                    <!-- Outer Circle - Supplier Names (Anti-clockwise) -->
                    <div class="supplier-orbit absolute inset-0 animate-spin" style="animation-duration: 25s; animation-direction: reverse;">
                      <!-- Bluedart -->
                      <div class="supplier-item absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div class="supplier-badge">
                          <img src="/Logistics_Partners_Logos/Bluedart.png" alt="Bluedart" class="supplier-logo" />
                        </div>
                      </div>
                      
                      <!-- Delhivery -->
                      <div class="supplier-item absolute top-1/4 right-0 transform translate-x-1/2 -translate-y-1/2">
                        <div class="supplier-badge">
                          <img src="/Logistics_Partners_Logos/Delhivery.png" alt="Delhivery" class="supplier-logo" />
                        </div>
                      </div>
                      
                      <!-- Ekart -->
                      <div class="supplier-item absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                        <div class="supplier-badge">
                          <img src="/Logistics_Partners_Logos/ekart.png" alt="Ekart" class="supplier-logo" />
                        </div>
                      </div>
                      
                      
                      <!-- Amazon Shipping -->
                      <div class="supplier-item absolute bottom-1/4 left-0 transform -translate-x-1/2 translate-y-1/2">
                        <div class="supplier-badge">
                          <img src="/Logistics_Partners_Logos/AmazonShipping.png" alt="Amazon Shipping" class="supplier-logo" />
                        </div>
                      </div>
                      
                      <!-- Xpressbees -->
                      <div class="supplier-item absolute top-1/4 left-0 transform -translate-x-1/2 -translate-y-1/2">
                        <div class="supplier-badge">
                          <img src="/Logistics_Partners_Logos/xpressbees.png" alt="Xpressbees" class="supplier-logo" />
                        </div>
                      </div>
                      
                      <!-- Ecom Express -->
                      <div class="supplier-item absolute bottom-1/4 right-0 transform translate-x-1/2 translate-y-1/2">
                        <div class="supplier-badge">
                          <img src="/Logistics_Partners_Logos/EcomExpress.png" alt="Ecom Express" class="supplier-logo" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Store Integration Section -->
      <div class="w-full store-integration-section py-12 sm:py-20 px-4 sm:px-6 relative z-10 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <!-- Background Elements -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
          <div class="absolute bottom-10 left-10 w-72 h-72 bg-gradient-to-tl from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div class="max-w-6xl mx-auto relative">
          <!-- Section Header -->
          <div class="text-center mb-8 sm:mb-4 section-heading">
            <div class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm font-medium text-purple-800 mb-6">
              <i class="fas fa-plug text-purple-600 mr-2"></i>
              Seamless Integration
            </div>
            <h3 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Connect Your Store in 
              <span class="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                Under 2 Minutes
              </span>
            </h3>
            <p class="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              No technical expertise required. Our one-click integrations work with all major e-commerce platforms.
            </p>
          </div>

          <!-- Platform Logos Cloud -->
          <div class="p-5">
            
            <!-- Animated Logo Cloud with Three Rows -->
            <div class="logo-cloud-container relative">
              <!-- Row 1: 3 logos -->
              <div class="flex justify-center items-center mb-2 space-x-8 sm:space-x-16 lg:space-x-20">
                <div class="logo-cloud-item group relative animate-float-gentle" style="animation-delay: 0s;">
                  <div class="logo-fade-wrapper">
                    <img src="/images/Shopify.png" alt="Shopify" class="h-12 sm:h-16 lg:h-20 w-auto object-contain opacity-75 group-hover:opacity-95 transition-all duration-700 group-hover:scale-110" />
                  </div>
                </div>
                <div class="logo-cloud-item group relative animate-float-slow" style="animation-delay: 0.5s;">
                  <div class="logo-fade-wrapper">
                    <img src="/images/Woocommerce.png" alt="WooCommerce" class="h-12 sm:h-16 lg:h-18 w-auto object-contain opacity-70 group-hover:opacity-90 transition-all duration-700 group-hover:scale-110" />
                  </div>
                </div>
                <div class="logo-cloud-item group relative animate-float-reverse" style="animation-delay: 1s;">
                  <div class="logo-fade-wrapper">
                    <img src="/images/Amazon.png" alt="Amazon" class="h-14 sm:h-18 lg:h-22 w-auto object-contain opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
                  </div>
                </div>
              </div>
              
              <!-- Row 2: 2 logos -->
              <div class="flex justify-center items-center mb-2 space-x-16 sm:space-x-24 lg:space-x-32">
                <div class="logo-cloud-item group relative animate-float-gentle" style="animation-delay: 1.5s;">
                  <div class="logo-fade-wrapper">
                    <img src="/images/Instamojo.png" alt="Instamojo" class="h-12 sm:h-16 lg:h-19 w-auto object-contain opacity-65 group-hover:opacity-85 transition-all duration-700 group-hover:scale-110" />
                  </div>
                </div>
                <div class="logo-cloud-item group relative animate-float-slow" style="animation-delay: 2s;">
                  <div class="logo-fade-wrapper">
                    <img src="/images/Unicommerce.png" alt="Unicommerce" class="h-14 sm:h-18 lg:h-21 w-auto object-contain opacity-75 group-hover:opacity-95 transition-all duration-700 group-hover:scale-110" />
                  </div>
                </div>
              </div>
              
              <!-- Row 3: 3 logos -->
              <div class="flex justify-center items-center space-x-8 sm:space-x-16 lg:space-x-24">
                <div class="logo-cloud-item group relative animate-float-reverse" style="animation-delay: 2.5s;">
                  <div class="logo-fade-wrapper">
                    <img src="/images/ZohoCommerce.png" alt="ZohoCommerce" class="h-12 sm:h-14 lg:h-17 w-auto object-contain opacity-70 group-hover:opacity-90 transition-all duration-700 group-hover:scale-110" />
                  </div>
                </div>
                <div class="logo-cloud-item group relative animate-float-gentle" style="animation-delay: 3s;">
                  <div class="logo-fade-wrapper">
                    <img src="/images/Easyecom.png" alt="Easyecom" class="h-12 sm:h-16 lg:h-20 w-auto object-contain opacity-75 group-hover:opacity-95 transition-all duration-700 group-hover:scale-110" />
                  </div>
                </div>
                <div class="logo-cloud-item group relative animate-float-slow" style="animation-delay: 3.5s;">
                  <div class="logo-fade-wrapper">
                    <img src="/images/Viniculum.png" alt="Viniculum" class="h-12 sm:h-14 lg:h-18 w-auto object-contain opacity-65 group-hover:opacity-85 transition-all duration-700 group-hover:scale-110" />
                  </div>
                </div>
              </div>
              
              <!-- Floating background elements for cloud effect -->
              <div class="absolute inset-0 pointer-events-none">
                <div class="absolute top-4 left-1/4 w-32 h-32 bg-gradient-to-r from-purple-100/20 to-pink-100/20 rounded-full blur-2xl animate-float-slow"></div>
                <div class="absolute bottom-4 right-1/4 w-28 h-28 bg-gradient-to-r from-indigo-100/20 to-purple-100/20 rounded-full blur-2xl animate-float-reverse"></div>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-blue-100/15 to-cyan-100/15 rounded-full blur-xl animate-float-gentle"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Why Choose Vamaship Section -->
      <div class="w-full features-section py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-slate-100 via-gray-50 to-stone-100 relative z-10 overflow-hidden">
        <!-- Sketch Background Elements -->
        <div class="absolute inset-0 overflow-hidden">
          <!-- Sketch-style geometric shapes -->
          <div class="absolute top-20 left-20 w-32 h-32 border-2 border-slate-300/30 rounded-lg transform rotate-12 opacity-40"></div>
          <div class="absolute top-40 right-32 w-24 h-24 border-2 border-gray-300/30 rounded-full opacity-35"></div>
          <div class="absolute bottom-32 left-40 w-28 h-28 border-2 border-stone-300/30 transform rotate-45 opacity-40"></div>
          <div class="absolute bottom-20 right-20 w-20 h-20 border-2 border-slate-300/30 rounded-lg transform -rotate-12 opacity-35"></div>
          
          <!-- Dotted lines and sketch elements -->
          <div class="absolute top-1/4 left-1/4 w-64 h-px bg-gradient-to-r from-transparent via-slate-300/20 to-transparent"></div>
          <div class="absolute top-1/2 right-1/4 w-48 h-px bg-gradient-to-r from-transparent via-gray-300/20 to-transparent transform rotate-12"></div>
          <div class="absolute bottom-1/3 left-1/3 w-32 h-px bg-gradient-to-r from-transparent via-stone-300/20 to-transparent transform -rotate-6"></div>
          
          <!-- Floating sketch circles -->
          <div class="absolute top-32 right-16 w-16 h-16 border border-slate-300/25 rounded-full opacity-30 animate-pulse"></div>
          <div class="absolute bottom-40 left-16 w-12 h-12 border border-gray-300/25 rounded-full opacity-35 animate-pulse" style="animation-delay: 1s;"></div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-stone-300/20 rounded-full opacity-30 animate-pulse" style="animation-delay: 2s;"></div>
          
          <!-- Sketch-style arrows and lines -->
          <div class="absolute top-24 left-1/2 transform -translate-x-1/2">
            <div class="w-24 h-px bg-gradient-to-r from-slate-300/25 to-transparent"></div>
            <div class="absolute right-0 top-0 w-0 h-0 border-l-4 border-l-slate-300/25 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
          </div>
          
          <div class="absolute bottom-32 right-1/3">
            <div class="w-20 h-px bg-gradient-to-l from-gray-300/25 to-transparent"></div>
            <div class="absolute left-0 top-0 w-0 h-0 border-r-4 border-r-gray-300/25 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
          </div>
          
          <!-- Subtle background gradients -->
          <div class="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-slate-200/15 to-gray-200/20 rounded-full blur-3xl"></div>
          <div class="absolute bottom-10 left-10 w-72 h-72 bg-gradient-to-tl from-stone-200/15 to-slate-200/20 rounded-full blur-3xl"></div>
          <div class="absolute top-1/3 left-1/3 w-96 h-96 bg-gradient-to-r from-gray-200/10 to-slate-200/15 rounded-full blur-3xl"></div>
        </div>
        
        <div class="max-w-7xl mx-auto relative">
          <!-- Section Header -->
          <div class="text-center mb-8 sm:mb-10 section-heading">
            <div class="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full text-sm font-medium text-green-800 mb-6 sm:mb-8 shadow-lg border border-green-200/50">
              <i class="fas fa-star text-yellow-500 mr-2 sm:mr-3 animate-pulse"></i>
              Why Choose Us
            </div>
            <h4 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Why Choose 
              <span class="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent relative">
                Vamaship?
                <div class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-60"></div>
              </span>
            </h4>
            <p class="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Discover the comprehensive suite of features that make Vamaship the preferred choice for businesses across India
            </p>
            <div class="w-32 h-1 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 mx-auto rounded-full mt-8"></div>
          </div>
          
          <!-- Award-Winning Features Grid -->
          <div class="features-grid-container">
            <!-- 6-Card Grid Layout -->
            <div class="features-6-grid">
              <!-- Feature 1 -->
              <div class="feature-card feature-card-1">
                <div class="feature-card-content">
                  <div class="feature-icon-wrapper">
                    <div class="feature-icon">
                      <i class="fas fa-shipping-fast text-2xl"></i>
                    </div>
                    <div class="feature-icon-bg"></div>
                  </div>
                  <h4 class="feature-title">Fast & Reliable Delivery</h4>
                  <p class="feature-description">Get your products to customers quickly with our network of trusted courier partners across India.</p>
                  <div class="feature-tag">
                    <span>Most Popular</span>
                  </div>
                </div>
                <div class="feature-card-glow"></div>
              </div>

              <!-- Feature 2 - Hero Card -->
              <div class="feature-card feature-card-2 hero-card-special">
                <div class="feature-card-content">
                  <div class="hero-badge">
                    <i class="fas fa-crown text-yellow-500 mr-2"></i>
                    <span>Most Popular</span>
                  </div>
                  <div class="feature-icon-wrapper">
                    <div class="feature-icon">
                      <i class="fas fa-money-bill-wave text-2xl"></i>
                    </div>
                    <div class="feature-icon-bg"></div>
                  </div>
                  <h4 class="feature-title">Instant COD Remittance</h4>
                  <p class="feature-description">Get your COD payments instantly on the same day of delivery. No more waiting weeks for your money.</p>
                  <div class="feature-tag">
                    <span>Same Day Payment</span>
                  </div>
                </div>
                <div class="feature-card-glow"></div>
              </div>

              <!-- Feature 3 -->
              <div class="feature-card feature-card-3">
                <div class="feature-card-content">
                  <div class="feature-icon-wrapper">
                    <div class="feature-icon">
                      <i class="fas fa-shield-alt text-2xl"></i>
                    </div>
                    <div class="feature-icon-bg"></div>
                  </div>
                  <h4 class="feature-title">Valuable Shipping</h4>
                  <p class="feature-description">Protect your valuable shipments with insurance and secure handling protocols.</p>
                  <div class="feature-tag">
                    <span>Protected</span>
                  </div>
                </div>
                <div class="feature-card-glow"></div>
              </div>

              <!-- Feature 4 -->
              <div class="feature-card feature-card-4">
                <div class="feature-card-content">
                  <div class="feature-icon-wrapper">
                    <div class="feature-icon">
                      <i class="fab fa-whatsapp text-2xl"></i>
                    </div>
                    <div class="feature-icon-bg"></div>
                  </div>
                  <h4 class="feature-title">WhatsApp NDR</h4>
                  <p class="feature-description">Reduce failed deliveries by 90% with smart WhatsApp notifications to customers.</p>
                  <div class="feature-tag">
                    <span>90% Success</span>
                  </div>
                </div>
                <div class="feature-card-glow"></div>
              </div>

              <!-- Feature 5 -->
              <div class="feature-card feature-card-5">
                <div class="feature-card-content">
                  <div class="feature-icon-wrapper">
                    <div class="feature-icon">
                      <i class="fas fa-clock text-2xl"></i>
                    </div>
                    <div class="feature-icon-bg"></div>
                  </div>
                  <h4 class="feature-title">Same Day Delivery</h4>
                  <p class="feature-description">Express delivery options for urgent orders in major cities across India.</p>
                  <div class="feature-tag">
                    <span>Express</span>
                  </div>
                </div>
                <div class="feature-card-glow"></div>
              </div>

              <!-- Feature 6 -->
              <div class="feature-card feature-card-6">
                <div class="feature-card-content">
                  <div class="feature-icon-wrapper">
                    <div class="feature-icon">
                      <i class="fas fa-chart-line text-2xl"></i>
                    </div>
                    <div class="feature-icon-bg"></div>
                  </div>
                  <h4 class="feature-title">RTO (Return-to-Origin) Reduction</h4>
                  <p class="feature-description">Reduce RTO rates with WhatsApp Order Confirmation & NDR Messaging.</p>
                  <div class="feature-tag">
                    <span>RTO Reduction</span>
                  </div>
                </div>
                <div class="feature-card-glow"></div>
              </div>
            </div>
          </div>

          <!-- Testimonials Carousel Section -->
          <div class="testimonials-section mt-20">
            <div class="text-center mb-12">
              <div class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full text-sm font-medium text-orange-800 mb-6 shadow-lg">
                <i class="fas fa-quote-left text-orange-500 mr-2"></i>
                Customer Stories
              </div>
              <h3 class="text-3xl font-bold text-gray-900 mb-4">
                What Our Customers Say
              </h3>
              <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                Join thousands of satisfied businesses who trust Vamaship for their shipping needs
              </p>
            </div>

            <!-- Carousel Container -->
            <div class="relative max-w-6xl mx-auto">
              <!-- Navigation Arrows -->
              <button 
                @click="prevTestimonial"
                @mouseenter="stopCarouselAutoPlay"
                @mouseleave="startCarouselAutoPlay"
                class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-14 h-14 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
              >
                <i class="fas fa-chevron-left text-gray-600 group-hover:text-blue-600 transition-colors duration-300"></i>
              </button>
              
              <button 
                @click="nextTestimonial"
                @mouseenter="stopCarouselAutoPlay"
                @mouseleave="startCarouselAutoPlay"
                class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-14 h-14 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
              >
                <i class="fas fa-chevron-right text-gray-600 group-hover:text-blue-600 transition-colors duration-300"></i>
              </button>

              <!-- Carousel Content -->
              <div 
                ref="carouselContainer"
                class="overflow-hidden rounded-2xl"
              >
                <div 
                  class="flex transition-transform duration-500 ease-in-out"
                  :style="{ transform: `translateX(-${currentTestimonialIndex * 100}%)` }"
                >
                  <!-- Testimonial Cards -->
                  <div 
                    v-for="(testimonial, index) in testimonials" 
                    :key="testimonial.id"
                    class="w-full flex-shrink-0 px-4"
                  >
                    <div class="testimonial-card group max-w-4xl mx-auto">
                      <div class="testimonial-content">
                        <div class="testimonial-quote">
                          <i :class="`fas fa-quote-left ${testimonial.quoteColor} text-2xl mb-4`"></i>
                          <p class="text-gray-700 leading-relaxed mb-6 text-lg">
                            "{{ testimonial.quote }}"
                          </p>
                        </div>
                        <div class="testimonial-author">
                          <div class="author-avatar">
                            <div :class="`w-16 h-16 bg-gradient-to-r ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-xl`">
                              {{ testimonial.avatar }}
                            </div>
                          </div>
                          <div class="author-info">
                            <h4 class="font-semibold text-gray-900 text-lg">{{ testimonial.author }}</h4>
                            <p class="text-sm text-gray-600">{{ testimonial.position }}</p>
                            <div class="flex text-yellow-400 mt-2">
                              <i class="fas fa-star"></i>
                              <i class="fas fa-star"></i>
                              <i class="fas fa-star"></i>
                              <i class="fas fa-star"></i>
                              <i class="fas fa-star"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="testimonial-glow"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Dots Indicator -->
              <div class="flex justify-center mt-8 space-x-2">
                <button
                  v-for="(testimonial, index) in testimonials"
                  :key="`dot-${testimonial.id}`"
                  @click="goToTestimonial(index)"
                  @mouseenter="stopCarouselAutoPlay"
                  @mouseleave="startCarouselAutoPlay"
                  :class="[
                    'w-3 h-3 rounded-full transition-all duration-300',
                    currentTestimonialIndex === index 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  ]"
                ></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Floating Help Button -->
    <FloatingHelpButton />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSignupStore } from '../../stores/signup'
import { useAuthStore } from '../../stores/auth'
import TrackingSection from '../../components/signup/TrackingSection.vue'
import GoogleSignIn from '../../components/common/GoogleSignIn.vue'
import SpinnerLoader from '../../components/common/SpinnerLoader.vue'
import LogoCloud from '../../components/common/LogoCloud.vue'
import BackgroundElements from '../../components/common/BackgroundElements.vue'
import FloatingHelpButton from '../../components/common/FloatingHelpButton.vue'
import { pushGTMEvent, GTMEvents } from '@/utils/gtm'

const router = useRouter()
const route = useRoute()
const signupStore = useSignupStore()
const authStore = useAuthStore()

const isMobileAlreadyRegistered = ref(false)
const otpInputRefs = ref<HTMLInputElement[]>([])
const otpContainerRef = ref<HTMLElement | null>(null)

// Tab state
const activeTab = ref<'seller' | 'track'>('seller')

// Connection line ref
const connectionLine = ref<HTMLDivElement | null>(null)

// Carousel state
const currentTestimonialIndex = ref(0)
const carouselContainer = ref<HTMLElement | null>(null)
const autoPlayInterval = ref<number | null>(null)

// Testimonials data
const testimonials = ref([
  {
    id: 1,
    quote: "Vamaship has revolutionized our shipping process. The instant COD remittance feature has improved our cash flow significantly.",
    author: "Aman Singh",
    position: "CEO, N-Tech",
    avatar: "R",
    color: "from-blue-500 to-cyan-500",
    quoteColor: "text-blue-500"
  },
  {
    id: 2,
    quote: "The WhatsApp NDR services increased our delivery success rate to 95%. Our customers love the real-time updates.",
    author: "Priya Sharma",
    position: "Founder, StyleHub",
    avatar: "P",
    color: "from-green-500 to-emerald-500",
    quoteColor: "text-green-500"
  },
  {
    id: 3,
    quote: "Integration was seamless. We connected our Shopify store in minutes and started shipping immediately.",
    author: "Aman Patel",
    position: "Owner, GadgetZone",
    avatar: "A",
    color: "from-purple-500 to-indigo-500",
    quoteColor: "text-purple-500"
  },
  {
    id: 4,
    quote: "The analytics dashboard gives us insights we never had before. Our shipping costs have reduced by 30%.",
    author: "Rajesh Kumar",
    position: "Operations Head, TechMart",
    avatar: "R",
    color: "from-orange-500 to-red-500",
    quoteColor: "text-orange-500"
  },
  {
    id: 5,
    quote: "Customer support is outstanding. They helped us optimize our shipping strategy within the first week.",
    author: "Sneha Gupta",
    position: "Founder, FashionForward",
    avatar: "S",
    color: "from-pink-500 to-rose-500",
    quoteColor: "text-pink-500"
  },
  {
    id: 6,
    quote: "The multi-carrier approach ensures our packages always reach on time. Reliability is unmatched.",
    author: "Vikram Singh",
    position: "CEO, ElectronicsHub",
    avatar: "V",
    color: "from-teal-500 to-cyan-500",
    quoteColor: "text-teal-500"
  }
])

onMounted(() => {
  // Initialize from session if available
  signupStore.initializeFromSession()
  
  // Capture UTM parameters and tracking data from route query for attribution
  signupStore.utmSource = route.query.utm_source?.toString() || null
  signupStore.utmMedium = route.query.utm_medium?.toString() || null
  signupStore.utmCampaign = route.query.utm_campaign?.toString() || null
  signupStore.loggedInUsing = route.query.logged_in_using?.toString() || null
  signupStore.googleAds = route.query.google_ads?.toString() || route.query.gclid?.toString() || null
  
  // Setup SVG scroll animation
  setupScrollAnimation()
  
  // Setup logo cloud entrance animation
  setupLogoCloudAnimation()
  
  // Setup scroll animations for features and headings
  setupScrollAnimations()
  
  // Setup counter animations
  setupCounterAnimations()
  
  // Setup carousel auto-play
  startCarouselAutoPlay()
})

onUnmounted(() => {
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value)
  }
})

// Carousel functions
const nextTestimonial = () => {
  currentTestimonialIndex.value = (currentTestimonialIndex.value + 1) % testimonials.value.length
}

const prevTestimonial = () => {
  currentTestimonialIndex.value = currentTestimonialIndex.value === 0 
    ? testimonials.value.length - 1 
    : currentTestimonialIndex.value - 1
}

const goToTestimonial = (index: number) => {
  currentTestimonialIndex.value = index
}

const startCarouselAutoPlay = () => {
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value)
  }
  autoPlayInterval.value = setInterval(() => {
    nextTestimonial()
  }, 5000) // Change testimonial every 5 seconds
}

const stopCarouselAutoPlay = () => {
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value)
    autoPlayInterval.value = null
  }
}

// Connection line animation
const setupScrollAnimation = () => {
  const handleScroll = () => {
    const section = document.querySelector('.improve-cash-flow-section')
    if (!section || !connectionLine.value) return
    
    const rect = section.getBoundingClientRect()
    const windowHeight = window.innerHeight
    
    // Calculate scroll progress (0 to 1) - start when section is 30% visible
    const scrollProgress = Math.max(0, Math.min(1, 
      (windowHeight - rect.top + windowHeight * 0.3) / (windowHeight + rect.height)
    ))
    
    // Animate the line drawing with a delay - start later and slower
    const animationProgress = Math.max(0, Math.min(1, (scrollProgress - 0.2) * 1.5))
    connectionLine.value.style.transform = `scaleY(${animationProgress})`
    connectionLine.value.style.opacity = animationProgress.toString()
  }
  
  // Initial call
  handleScroll()
  
  // Add scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  // Store cleanup function
  ;(window as any)._connectionLineCleanup = () => {
    window.removeEventListener('scroll', handleScroll)
  }
}

// Logo cloud entrance animation
const setupLogoCloudAnimation = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const logoItems = entry.target.querySelectorAll('.logo-cloud-item')
        logoItems.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('animate-entrance')
          }, index * 150)
        })
      }
    })
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
  })

  const logoCloud = document.querySelector('.logo-cloud-container')
  if (logoCloud) {
    observer.observe(logoCloud)
  }
}

// Scroll animations for features and headings
const setupScrollAnimations = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement
        
        // Add entrance animation class
        element.classList.add('animate-scroll-in')
        
        // For feature cards, add staggered animation
        if (element.classList.contains('feature-card')) {
          const cards = element.parentElement?.querySelectorAll('.feature-card')
          if (cards) {
            cards.forEach((card, index) => {
              if (card === element) {
                setTimeout(() => {
                  card.classList.add('animate-scroll-in')
                }, index * 100)
              }
            })
          }
        }
        
        // For headings, add special animation
        if (element.classList.contains('section-heading')) {
          element.classList.add('animate-heading-in')
        }
        
        // For content sections, add slide up animation
        if (element.classList.contains('content-section')) {
          element.classList.add('animate-content-in')
        }
      }
    })
  }, observerOptions)

  // Observe all elements that should animate on scroll
  const elementsToAnimate = document.querySelectorAll(`
    .section-heading,
    .feature-card,
    .content-section,
    .stats-section,
    .testimonials-section,
    .improve-cash-flow-section,
    .courier-partners-section,
    .features-section,
    .store-integration-section
  `)
  
  elementsToAnimate.forEach((element) => {
    observer.observe(element)
  })
}

// Counter animation setup
const setupCounterAnimations = () => {
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('.counter')
        counters.forEach((counter) => {
          animateCounter(counter as HTMLElement)
        })
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  const statsSection = document.querySelector('.stats-section')
  if (statsSection) {
    observer.observe(statsSection)
  }
}

// Animate counter function
const animateCounter = (element: HTMLElement) => {
  const target = parseFloat(element.getAttribute('data-target') || '0')
  const duration = 2000 // 2 seconds
  const increment = target / (duration / 16) // 60fps
  let current = 0

  const timer = setInterval(() => {
    current += increment
    if (current >= target) {
      current = target
      clearInterval(timer)
    }
    
    // Format the number with commas for large numbers
    if (target >= 1000) {
      element.textContent = Math.floor(current).toLocaleString()
    } else if (target % 1 !== 0) {
      element.textContent = current.toFixed(1)
    } else {
      element.textContent = Math.floor(current).toString()
    }
  }, 16)
}

onUnmounted(() => {
  // Cleanup scroll listener
  if ((window as any)._connectionLineCleanup) {
    ;(window as any)._connectionLineCleanup()
  }
})

const setOtpInputRef = (el: any, index: number) => {
  if (el && el.$el) {
    otpInputRefs.value[index] = el.$el
  } else if (el) {
    otpInputRefs.value[index] = el
  }
}

const findVisibleOtpInput = (index: number): HTMLInputElement | null => {
  const candidates = document.querySelectorAll<HTMLInputElement>(`input[data-otp-index='${index}']`)
  for (const el of Array.from(candidates)) {
    if (el && el.offsetParent !== null) {
      return el
    }
  }
  return otpInputRefs.value[index] ?? null
}

const focusOtpInput = (index: number) => {
  if (index < 0 || index > 5) return
  const attemptFocus = () => {
    const input: HTMLInputElement | null = findVisibleOtpInput(index)
    if (input) {
      try {
        input.focus()
        input.select()
      } catch (_) {}
    }
  }
  // Attempt immediately, then again on next tick and rAF to handle mobile quirks
  attemptFocus()
  nextTick(() => {
    requestAnimationFrame(() => attemptFocus())
  })
}

const handlePhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '')
  signupStore.formData.phone = value
  isMobileAlreadyRegistered.value = false
  signupStore.clearError('phone')
}

const sendOtp = async () => {
  const result = await signupStore.sendMobileOtp()
  // Check if the mobile number already exists (adjust based on actual API response structure)
  if (result && typeof result === 'object' && 'exists' in result && result.exists) {
    isMobileAlreadyRegistered.value = true
  }
}

const handleOtpInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '')
  
  // Update the OTP array
  signupStore.formData.otp[index] = value
  
  // Auto-focus to next input if value is entered and not at last input
  if (value && index < 5) {
    setTimeout(() => {
      focusOtpInput(index + 1)
    }, 0)
  }
  
  // Clear error when user starts typing
  if (value) {
    signupStore.clearError('otp')
  }
}

const handleOtpClick = (event: Event) => {
  const target = event.target as HTMLInputElement
  target.select()
}

const handleOtpPaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text/plain') || ''
  const numbers = pastedData.replace(/[^0-9]/g, '').slice(0, 6)
  
  if (numbers.length > 0) {
    // Fill the OTP inputs with pasted data
    for (let i = 0; i < Math.min(numbers.length, 6); i++) {
      signupStore.formData.otp[i] = numbers[i]
    }
    
    // Focus on the next empty input or the last filled input
    const nextEmptyIndex = Math.min(numbers.length, 6)
    if (nextEmptyIndex < 6) {
      setTimeout(() => {
        focusOtpInput(nextEmptyIndex)
      }, 10)
    }
  }
  
  signupStore.clearError('otp')
}

const handleOtpKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace') {
    // If current input is empty and backspace is pressed, go to previous input
    if (!signupStore.formData.otp[index] && index > 0) {
      event.preventDefault()
      focusOtpInput(index - 1)
    }
  }
  
  // Handle arrow keys for navigation
  if (event.key === 'ArrowRight' && index < 5) {
    event.preventDefault()
    focusOtpInput(index + 1)
  }
  
  if (event.key === 'ArrowLeft' && index > 0) {
    event.preventDefault()
    focusOtpInput(index - 1)
  }
}

const handleOtpKeyup = (index: number, event: KeyboardEvent) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '')

  // Fallback for some mobile keyboards where input event timing differs
  if (value && index < 5) {
    setTimeout(() => {
      focusOtpInput(index + 1)
    }, 0)
  }
}

const handleOtpFocus = (event: Event) => {
  const target = event.target as HTMLInputElement
  target.select()
}

watch(() => signupStore.otpSent, (isSent) => {
  if (isSent) {
    nextTick(() => {
      focusOtpInput(0)
    })
  }
})

const verifyOtp = async () => {
  const result = await signupStore.verifyMobileOtp()
  if (result.success) {
    router.push({ path: '/signup/details', query: route.query })
  }
}

const resendOtp = () => {
  signupStore.resendMobileOtp()
}

const goToLogin = () => {
  router.push('/login')
}

const formatOtpTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleGoogleSignIn = async (credential: string) => {
  const res = await authStore.socialLoginWithGoogle({
    credential,
    reference: route.query.reference?.toString() ?? null,
    utm_medium: route.query.utm_medium?.toString() ?? null,
    utm_campaign: route.query.utm_campaign?.toString() ?? null,
    utm_source: route.query.utm_source?.toString() ?? null,
  })
  if (res.success) {
    // GTM Event: Google plugin signup (only in signup flow)
    pushGTMEvent(GTMEvents.GOOGLE_PLUGIN_SIGNUP)
  } else {
    console.error(res.error)
  }
}

const handleGoogleError = (message: string) => {
  console.error('Google Sign-In error:', message)
}

const changeNumber = () => {
  // Reset the OTP state
  signupStore.formData.otp = ['', '', '', '', '', '']
  signupStore.otpSent = false
  signupStore.otpCooldown = 0
  signupStore.clearError('phone')
  signupStore.clearError('otp')
  isMobileAlreadyRegistered.value = false
  signupStore.formData.phone = ''
}


</script> 

<style scoped>
.edge-blur {
  display: block;
  -webkit-mask-image: radial-gradient(ellipse at center, #000 60%, rgba(0,0,0,0.85) 72%, rgba(0,0,0,0.5) 82%, transparent 100%);
  mask-image: radial-gradient(ellipse at center, #000 60%, rgba(0,0,0,0.85) 72%, rgba(0,0,0,0.5) 82%, transparent 100%);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}
.bg-whitesmoke {
  background-color: #f5f5f5;
}

/* Connection Line Styles */
.connection-line-container {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 60%;
  z-index: 1;
}

.connection-line {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    #10b981 0%,
    #3b82f6 50%,
    #8b5cf6 100%
  );
  border-radius: 2px;
  transform-origin: top;
  transform: scaleY(0);
  opacity: 0;
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.connection-start-dot {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.6);
  animation: pulse-dot 2s infinite;
}

.connection-middle-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
  animation: pulse-dot-middle 2s infinite;
  animation-delay: 0.5s;
}

.connection-end-dot {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: #8b5cf6;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.6);
  animation: pulse-dot 2s infinite;
  animation-delay: 1s;
}

@keyframes pulse-dot {
  0%, 100% {
    transform: translateX(-50%) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translateX(-50%) scale(1.2);
    opacity: 1;
  }
}

@keyframes pulse-dot-middle {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .connection-line-container {
    display: none; /* Hide connection line on mobile layout */
  }
}

/* Connection line is hidden on mobile (max-width: 1024px) so no additional mobile styles needed */

/* Wide Network Animation Styles */
.supplier-orbit {
  animation-timing-function: linear;
}

.supplier-item {
  transition: all 0.3s ease;
  /* Counter-rotate to keep text readable */
  animation: counter-rotate 25s linear infinite;
}

.supplier-item:hover {
  transform: scale(1.1);
  z-index: 10;
}

/* New supplier badge styles */
.supplier-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0px;
  /* background: rgba(255, 255, 255, 0.95); */
  /* backdrop-filter: blur(10px); */
  /* border-radius: 12px; */
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); */
  /* border: 1px solid rgba(255, 255, 255, 0.2); */
  transition: all 0.3s ease;
}

.supplier-badge:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.supplier-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.supplier-name {
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
}

.supplier-logo {
  width: 100px;
  height: 68px;
  object-fit: contain;
  border-radius: 4px;
}


.inner-orbit {
  animation-timing-function: linear;
}

.svg-item {
  transition: all 0.3s ease;
  /* Counter-rotate to keep icons readable */
  animation: counter-rotate-inner 20s linear infinite;
}

.svg-item:hover {
  transform: scale(1.1);
  z-index: 10;
}

/* Counter-rotation animations to keep content readable */
@keyframes counter-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes counter-rotate-inner {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

/* Responsive adjustments for wide network */
@media (max-width: 1024px) {
  .wide-network-container {
    width: 400px !important;
    height: 400px !important;
  }
  
  .supplier-badge {
    padding: 14px 18px;
    gap: 3px;
  }
  
  .supplier-dot {
    width: 6px;
    height: 6px;
  }
  
  .supplier-name {
    font-size: 10px;
  }
  
  .supplier-logo {
    width: 88px;
    height: 58px;
  }
  
  
  .svg-item div {
    width: 10px;
    height: 10px;
  }
  
  .svg-item i {
    font-size: 0.875rem;
  }
}

@media (max-width: 768px) {
  .wide-network-container {
    width: 300px !important;
    height: 300px !important;
  }
  
  .supplier-badge {
    padding: 12px 16px;
    gap: 2px;
  }
  
  .supplier-dot {
    width: 5px;
    height: 5px;
  }
  
  .supplier-name {
    font-size: 9px;
  }
  
  .supplier-logo {
    width: 76px;
    height: 52px;
  }
  
  
  .svg-item div {
    width: 8px;
    height: 8px;
  }
  
  .svg-item i {
    font-size: 0.75rem;
  }
}

/* Integration Step SVG Animations */
.integration-step-1 {
  animation: checkmark-bounce 2s ease-in-out infinite;
}

.integration-step-2 {
  animation: star-twinkle 2s ease-in-out infinite;
}

.integration-step-3 {
  animation: minus-pulse 2s ease-in-out infinite;
}

.arrow-animation {
  animation: arrow-slide 2s ease-in-out infinite;
}

@keyframes checkmark-bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes star-twinkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

@keyframes minus-pulse {
  0%, 100% {
    transform: scaleX(1);
  }
  50% {
    transform: scaleX(1.2);
  }
}

@keyframes arrow-slide {
  0%, 100% {
    transform: translateX(0);
    opacity: 0.6;
  }
  50% {
    transform: translateX(4px);
    opacity: 1;
  }
}

/* Responsive adjustments for integration steps */
@media (max-width: 1024px) {
  .integration-step-1,
  .integration-step-2,
  .integration-step-3 {
    animation-duration: 3s;
  }
  
  .arrow-animation {
    animation-duration: 3s;
  }
}

/* Logo Cloud Styles */
.logo-cloud-container {
  position: relative;
  overflow: hidden;
}

.logo-cloud-item {
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(20px) scale(0.8);
  opacity: 0;
  animation-fill-mode: both;
}

.logo-cloud-item.animate-entrance {
  transform: translateY(0) scale(1);
  opacity: 1;
}

.logo-cloud-item:hover {
  transform: translateY(-8px) scale(1.1);
  z-index: 10;
}

.logo-cloud-item img {
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.logo-cloud-item:hover img {
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
}

/* Logo fade wrapper for gradient fade effects */
.logo-fade-wrapper {
  position: relative;
  display: inline-block;
}

.logo-fade-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: -20px;
  right: -20px;
  bottom: 0;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.8) 0%, 
    transparent 15%, 
    transparent 85%, 
    rgba(255, 255, 255, 0.8) 100%
  );
  pointer-events: none;
  z-index: 1;
  border-radius: 8px;
}

.logo-fade-wrapper::after {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.3) 0%, 
    transparent 20%, 
    transparent 80%, 
    rgba(255, 255, 255, 0.3) 100%
  );
  pointer-events: none;
  z-index: 0;
  border-radius: 12px;
  filter: blur(1px);
}

.logo-cloud-item:hover .logo-fade-wrapper::before {
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.4) 0%, 
    transparent 20%, 
    transparent 80%, 
    rgba(255, 255, 255, 0.4) 100%
  );
}

.logo-cloud-item:hover .logo-fade-wrapper::after {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    transparent 25%, 
    transparent 75%, 
    rgba(255, 255, 255, 0.1) 100%
  );
}

/* Enhanced floating animations for cloud effect */
@keyframes float-slow {
  0%, 100% {
    transform: translateY(0px) translateX(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-6px) translateX(3px) rotate(0.5deg);
  }
  50% {
    transform: translateY(-3px) translateX(-2px) rotate(-0.3deg);
  }
  75% {
    transform: translateY(4px) translateX(1px) rotate(0.2deg);
  }
}

@keyframes float-reverse {
  0%, 100% {
    transform: translateY(0px) translateX(0px) rotate(0deg);
  }
  25% {
    transform: translateY(5px) translateX(-2px) rotate(-0.4deg);
  }
  50% {
    transform: translateY(-2px) translateX(3px) rotate(0.6deg);
  }
  75% {
    transform: translateY(-5px) translateX(-1px) rotate(-0.2deg);
  }
}

@keyframes float-gentle {
  0%, 100% {
    transform: translateY(0px) translateX(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-4px) translateX(2px) rotate(0.3deg);
  }
  66% {
    transform: translateY(2px) translateX(-1px) rotate(-0.2deg);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  }
  50% {
    filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15));
  }
}

.animate-float-slow {
  animation: float-slow 6s ease-in-out infinite;
}

.animate-float-reverse {
  animation: float-reverse 8s ease-in-out infinite;
}

.animate-float-gentle {
  animation: float-gentle 10s ease-in-out infinite;
}

/* Add subtle pulse glow animation */
.logo-cloud-item:nth-child(odd) img {
  animation: pulse-glow 4s ease-in-out infinite;
}

.logo-cloud-item:nth-child(even) img {
  animation: pulse-glow 4s ease-in-out infinite;
  animation-delay: 2s;
}

/* Responsive adjustments for logo cloud */
@media (max-width: 1024px) {
  .logo-cloud-container .space-x-20 > * + * {
    margin-left: 2.5rem;
  }
  
  .logo-cloud-container .space-x-32 > * + * {
    margin-left: 3.5rem;
  }
  
  .logo-cloud-container .space-x-24 > * + * {
    margin-left: 3rem;
  }
  
  .logo-cloud-item img {
    height: 4rem !important;
  }
}

@media (max-width: 768px) {
  .logo-cloud-container .space-x-20 > * + * {
    margin-left: 2rem;
  }
  
  .logo-cloud-container .space-x-32 > * + * {
    margin-left: 2.5rem;
  }
  
  .logo-cloud-container .space-x-24 > * + * {
    margin-left: 2.25rem;
  }
  
  .logo-cloud-item img {
    height: 3rem !important;
  }
  
  .logo-fade-wrapper::before {
    left: -15px;
    right: -15px;
  }
  
  .logo-fade-wrapper::after {
    left: -8px;
    right: -8px;
    top: -8px;
    bottom: -8px;
  }
}

@media (max-width: 480px) {
  .logo-cloud-item img {
    height: 2.5rem !important;
  }
  
  .logo-cloud-container .space-x-20 > * + * {
    margin-left: 1.5rem;
  }
  
  .logo-cloud-container .space-x-32 > * + * {
    margin-left: 2rem;
  }
  
  .logo-cloud-container .space-x-24 > * + * {
    margin-left: 1.75rem;
  }
}

/* Scroll Animation Styles */
.section-heading,
.feature-card,
.content-section,
.improve-cash-flow-section,
.courier-partners-section,
.features-section,
.store-integration-section {
  opacity: 0;
  transform: translateY(60px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.section-heading.animate-scroll-in,
.section-heading.animate-heading-in {
  opacity: 1;
  transform: translateY(0);
  animation: slideInFromBottom 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.feature-card.animate-scroll-in {
  opacity: 1;
  transform: translateY(0);
  animation: slideInFromBottom 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.content-section.animate-scroll-in,
.content-section.animate-content-in {
  opacity: 1;
  transform: translateY(0);
  animation: slideInFromBottom 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.improve-cash-flow-section.animate-scroll-in,
.courier-partners-section.animate-scroll-in,
.features-section.animate-scroll-in,
.store-integration-section.animate-scroll-in {
  opacity: 1;
  transform: translateY(0);
  animation: slideInFromBottom 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* Keyframe animations */
@keyframes slideInFromBottom {
  0% {
    opacity: 0;
    transform: translateY(60px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInFromLeft {
  0% {
    opacity: 0;
    transform: translateX(-60px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInFromRight {
  0% {
    opacity: 0;
    transform: translateX(60px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Staggered animation for feature cards */
.feature-card:nth-child(1) { animation-delay: 0.1s; }
.feature-card:nth-child(2) { animation-delay: 0.2s; }
.feature-card:nth-child(3) { animation-delay: 0.3s; }
.feature-card:nth-child(4) { animation-delay: 0.4s; }
.feature-card:nth-child(5) { animation-delay: 0.5s; }
.feature-card:nth-child(6) { animation-delay: 0.6s; }
.feature-card:nth-child(7) { animation-delay: 0.7s; }
.feature-card:nth-child(8) { animation-delay: 0.8s; }
.feature-card:nth-child(9) { animation-delay: 0.9s; }

/* Enhanced animations for different elements */
.section-heading.animate-heading-in {
  animation: slideInFromBottom 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.content-section.animate-content-in {
  animation: slideInFromBottom 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* Award-Winning Features Grid Styles */
.features-grid-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
}

/* Hero Feature Card */
.hero-feature-card {
  position: relative;
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.95) 0%, 
    rgba(5, 150, 105, 0.9) 25%,
    rgba(4, 120, 87, 0.85) 50%,
    rgba(6, 78, 59, 0.9) 75%,
    rgba(2, 44, 34, 0.95) 100%
  );
  border-radius: 32px;
  padding: 4rem 3rem;
  margin-bottom: 3rem;
  overflow: hidden;
  box-shadow: 
    0 25px 50px rgba(16, 185, 129, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.hero-feature-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 35px 70px rgba(16, 185, 129, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.hero-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  opacity: 0.8;
  transition: all 0.6s ease;
}

.hero-feature-card:hover .hero-card-bg {
  opacity: 1;
  transform: scale(1.1);
}

.hero-card-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  padding: 0.75rem 1.5rem;
  margin-bottom: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
}

.hero-feature-card:hover .hero-badge {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.hero-icon-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.hero-icon {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  transition: all 0.4s ease;
}

.hero-icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0.6;
  transition: all 0.4s ease;
}

.hero-feature-card:hover .hero-icon {
  transform: scale(1.1) rotate(5deg);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.hero-feature-card:hover .hero-icon-glow {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.3);
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.hero-feature-card:hover .hero-title {
  transform: translateY(-4px);
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.hero-description {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  transition: all 0.3s ease;
}

.hero-feature-card:hover .hero-description {
  color: white;
  transform: translateY(-2px);
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  color: white;
  line-height: 1;
  margin-bottom: 0.25rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 2px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 1px;
}

.hero-cta {
  display: flex;
  justify-content: center;
}

.hero-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.hero-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.hero-button i {
  transition: transform 0.3s ease;
}

.hero-button:hover i {
  transform: translateX(4px);
}

/* 6-Card Grid Layout */
.features-6-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1.5rem;
}

/* Hero Card Special Styling */
.feature-card.hero-card-special {
  background: rgb(9, 70, 54) !important;
  transform: scale(1.05);
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
}

.hero-card-special .feature-title {
  color: white !important;
  font-size: 1.4rem !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-card-special .feature-description {
  color: rgba(255, 255, 255, 0.95) !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.hero-card-special .feature-icon {
  background: rgba(255, 255, 255, 0.25) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.hero-card-special .feature-tag span {
  background: rgba(255, 255, 255, 0.25) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 2.5rem;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}



.feature-card:hover {
  transform: translateY(-12px) scale(1.03);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}



.feature-card-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 26px;
  opacity: 0;
  transition: all 0.5s ease;
  z-index: -1;
}

.feature-card-1 .feature-card-glow {
  background: linear-gradient(45deg, 
    rgba(59, 130, 246, 0.3) 0%, 
    rgba(16, 185, 129, 0.3) 100%
  );
}

.feature-card-2 .feature-card-glow {
  background: linear-gradient(45deg, 
    rgba(147, 51, 234, 0.3) 0%, 
    rgba(236, 72, 153, 0.3) 100%
  );
}

.feature-card-3 .feature-card-glow {
  background: linear-gradient(45deg, 
    rgba(16, 185, 129, 0.3) 0%, 
    rgba(34, 197, 94, 0.3) 100%
  );
}

.feature-card-4 .feature-card-glow {
  background: linear-gradient(45deg, 
    rgba(245, 158, 11, 0.3) 0%, 
    rgba(251, 146, 60, 0.3) 100%
  );
}

.feature-card-5 .feature-card-glow {
  background: linear-gradient(45deg, 
    rgba(99, 102, 241, 0.3) 0%, 
    rgba(139, 92, 246, 0.3) 100%
  );
}

.feature-card-6 .feature-card-glow {
  background: linear-gradient(45deg, 
    rgba(236, 72, 153, 0.3) 0%, 
    rgba(244, 63, 94, 0.3) 100%
  );
}

.feature-card:hover .feature-card-glow {
  opacity: 1;
  transform: scale(1.05);
}

.feature-card-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.feature-icon-wrapper {
  position: relative;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
}

.feature-icon {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.9) 0%, 
    rgba(248, 250, 252, 0.8) 100%
  );
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.4s ease;
}

.feature-icon-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 20px;
  opacity: 0.6;
  transition: all 0.4s ease;
}

.feature-card-1 .feature-icon-bg {
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.15) 0%, 
    rgba(16, 185, 129, 0.15) 100%
  );
}

.feature-card-2 .feature-icon-bg {
  background: linear-gradient(135deg, 
    rgba(147, 51, 234, 0.15) 0%, 
    rgba(236, 72, 153, 0.15) 100%
  );
}

.feature-card-3 .feature-icon-bg {
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.15) 0%, 
    rgba(34, 197, 94, 0.15) 100%
  );
}

.feature-card-4 .feature-icon-bg {
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.15) 0%, 
    rgba(251, 146, 60, 0.15) 100%
  );
}

.feature-card-5 .feature-icon-bg {
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.15) 0%, 
    rgba(139, 92, 246, 0.15) 100%
  );
}

.feature-card-6 .feature-icon-bg {
  background: linear-gradient(135deg, 
    rgba(236, 72, 153, 0.15) 0%, 
    rgba(244, 63, 94, 0.15) 100%
  );
}

.feature-card:hover .feature-icon {
  transform: scale(1.15) rotate(8deg);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.feature-card:hover .feature-icon-bg {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.3);
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  line-height: 1.3;
  transition: all 0.3s ease;
}

.feature-card:hover .feature-title {
  color: #1e40af;
  transform: translateY(-2px);
}

.feature-description {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex-grow: 1;
  transition: all 0.3s ease;
}

.feature-card:hover .feature-description {
  color: #4b5563;
}

.feature-tag {
  margin-top: auto;
  display: flex;
  justify-content: flex-start;
}

.feature-tag span {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
}

.feature-card-1 .feature-tag span {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.feature-card-2 .feature-tag span {
  background: rgba(147, 51, 234, 0.1);
  color: #9333ea;
}

.feature-card-3 .feature-tag span {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.feature-card-4 .feature-tag span {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.feature-card-5 .feature-tag span {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.feature-card-6 .feature-tag span {
  background: rgba(236, 72, 153, 0.1);
  color: #ec4899;
}

.feature-card:hover .feature-tag span {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}






/* Statistics Section Styles */
.stats-section {
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-section.animate-scroll-in {
  opacity: 1;
  transform: translateY(0);
}

.stats-section .group {
  transition: all 0.3s ease;
}

.stats-section .group:hover {
  transform: translateY(-2px);
}

.stats-section .group:hover .counter {
  color: #1f2937;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Testimonials Section Styles */
.testimonials-section {
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.testimonials-section.animate-scroll-in {
  opacity: 1;
  transform: translateY(0);
}

.testimonial-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(229, 231, 235, 0.8);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.testimonial-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.9) 0%, 
    rgba(248, 250, 252, 0.6) 50%,
    rgba(255, 255, 255, 0.9) 100%
  );
  border-radius: 20px;
  pointer-events: none;
  transition: all 0.4s ease;
}

.testimonial-card:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1);
  transform: translateY(-4px) scale(1.02);
}

.testimonial-card:hover::before {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(248, 250, 252, 0.8) 50%,
    rgba(255, 255, 255, 0.95) 100%
  );
}

.testimonial-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, 
    rgba(59, 130, 246, 0.1), 
    rgba(147, 51, 234, 0.1), 
    rgba(16, 185, 129, 0.1)
  );
  border-radius: 22px;
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
}

.testimonial-card:hover .testimonial-glow {
  opacity: 1;
}

.testimonial-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.testimonial-quote {
  flex-grow: 1;
}

.testimonial-quote i {
  transition: all 0.3s ease;
}

.testimonial-card:hover .testimonial-quote i {
  transform: scale(1.1);
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: auto;
}

.author-avatar {
  flex-shrink: 0;
}

.author-avatar div {
  transition: all 0.3s ease;
}

.testimonial-card:hover .author-avatar div {
  transform: scale(1.1);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.author-info h4 {
  transition: all 0.3s ease;
}

.testimonial-card:hover .author-info h4 {
  color: #1f2937;
}

.author-info .flex {
  transition: all 0.3s ease;
}

.testimonial-card:hover .author-info .flex {
  transform: scale(1.05);
}

/* Carousel Styles */
.carousel-container {
  position: relative;
  overflow: hidden;
}

.carousel-track {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-slide {
  flex: 0 0 100%;
  width: 100%;
}

/* Navigation Arrows */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 3.5rem;
  height: 3.5rem;
  background: white;
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.carousel-arrow:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-50%) scale(1.1);
}

.carousel-arrow:active {
  transform: translateY(-50%) scale(0.95);
}

.carousel-arrow.prev {
  left: -1rem;
}

.carousel-arrow.next {
  right: -1rem;
}

.carousel-arrow i {
  font-size: 1.25rem;
  color: #6b7280;
  transition: color 0.3s ease;
}

.carousel-arrow:hover i {
  color: #2563eb;
}

/* Dots Indicator */
.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.carousel-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #d1d5db;
}

.carousel-dot:hover {
  background: #9ca3af;
  transform: scale(1.2);
}

.carousel-dot.active {
  background: #2563eb;
  transform: scale(1.25);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .carousel-arrow {
    width: 3rem;
    height: 3rem;
  }
  
  .carousel-arrow.prev {
    left: -0.5rem;
  }
  
  .carousel-arrow.next {
    right: -0.5rem;
  }
  
  .carousel-arrow i {
    font-size: 1rem;
  }
  
  .testimonial-card {
    padding: 1.5rem;
  }
  
  .testimonial-quote p {
    font-size: 1rem;
  }
  
  .author-avatar div {
    width: 3rem;
    height: 3rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .carousel-arrow {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .carousel-arrow.prev {
    left: -0.25rem;
  }
  
  .carousel-arrow.next {
    right: -0.25rem;
  }
  
  .testimonial-card {
    padding: 1.25rem;
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .features-6-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 1.5rem;
  }
  
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }
  
  .hero-feature-card {
    padding: 3rem 2rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-description {
    font-size: 1.125rem;
  }
}

@media (max-width: 768px) {
  .features-grid-container {
    padding: 0 0.5rem;
  }
  
  .features-6-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, 1fr);
    gap: 1rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .hero-feature-card {
    padding: 2rem 1.5rem;
    margin-bottom: 2rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-divider {
    width: 40px;
    height: 2px;
  }
  
  .feature-card {
    padding: 2rem;
  }
  
  .feature-icon-wrapper {
    width: 60px;
    height: 60px;
    margin-bottom: 1.5rem;
  }
  
  .feature-icon {
    width: 50px;
    height: 50px;
  }
  
  .feature-icon-bg {
    width: 60px;
    height: 60px;
  }
  
  .feature-title {
    font-size: 1.25rem;
  }
  
  .feature-description {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .hero-feature-card {
    padding: 1.5rem 1rem;
  }
  
  .hero-title {
    font-size: 1.75rem;
  }
  
  .hero-description {
    font-size: 0.9rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
}

/* Responsive adjustments for scroll animations */
@media (max-width: 768px) {
  .section-heading,
  .feature-card,
  .content-section {
    transform: translateY(40px);
  }
  
  .section-heading.animate-scroll-in,
  .section-heading.animate-heading-in,
  .feature-card.animate-scroll-in,
  .content-section.animate-scroll-in,
  .content-section.animate-content-in {
    animation: slideInFromBottom 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
}

@media (max-width: 480px) {
  .section-heading,
  .feature-card,
  .content-section {
    transform: translateY(30px);
  }
  
  .section-heading.animate-scroll-in,
  .section-heading.animate-heading-in,
  .feature-card.animate-scroll-in,
  .content-section.animate-scroll-in,
  .content-section.animate-content-in {
    animation: slideInFromBottom 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
}
</style>
