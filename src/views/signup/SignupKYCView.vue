<template>
  <div class="min-h-screen flex items-center justify-center p-4 lg:p-8 relative">
    <!-- Background image for desktop only -->
    <div class="hidden lg:block absolute inset-0 z-0">
      <img 
        src="/img/customer-panel.png" 
        alt="Background" 
        class="w-full h-full object-cover"
      />
    </div>
    
    <div class="w-4/5 lg:w-3/5 relative z-10">
      <div class="flex shadow-2xl border border-gray-200 rounded-2xl overflow-hidden">
        
        <!-- Left Panel - Welcome & Context -->
        <div class="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8 lg:p-12 flex-[0.4] relative overflow-hidden">
          <!-- Decorative background elements -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200 rounded-full opacity-20 translate-y-12 -translate-x-12"></div>
          
          <!-- Content container -->
          <div class="relative z-10 h-full flex flex-col justify-center">
            <!-- Icon -->
            <div class="text-center mb-8">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
                <i class="fas fa-shield-check text-2xl text-white"></i>
              </div>
            </div>
            
            <!-- Main heading -->
            <div class="text-center mb-6">
              <h2 class="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent mb-4">
                Business Verification
              </h2>
              <p class="text-gray-700 text-lg leading-relaxed">
                Complete KYC to unlock advanced features and enable COD payments. You can skip this for now and complete it later.
              </p>
            </div>
            
            <!-- Feature highlights -->
            <div class="space-y-4 mt-8">
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i class="fas fa-check text-green-600 text-sm"></i>
                </div>
                <span class="text-gray-700 font-medium">Enable COD payments</span>
              </div>
              
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i class="fas fa-unlock text-blue-600 text-sm"></i>
                </div>
                <span class="text-gray-700 font-medium">Access advanced features</span>
              </div>
              
              <div class="flex items-center space-x-3">
                <div class="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <i class="fas fa-rocket text-purple-600 text-sm"></i>
                </div>
                <span class="text-gray-700 font-medium">Faster onboarding</span>
              </div>
            </div>
            
            <!-- Progress indicator -->
            <div class="mt-auto pt-6">
              <div class="text-center">
                <div class="flex items-center justify-center space-x-2 mb-2">
                  <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <p class="text-sm text-gray-600 font-medium">Step 2 of 2</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel - Form Content -->
        <div class="bg-white p-6 lg:p-8 flex-1">
          <!-- Loading State for Skip KYC -->
          <div v-if="isSkippingKyc" class="text-center py-16 px-8">
            <!-- Enhanced Loading Animation -->
            <div class="mb-12">
              <div class="relative inline-block">
                <!-- Main spinning circle -->
                <div class="w-24 h-24 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                
                <!-- Inner pulsing circle -->
                <div class="absolute inset-2 w-20 h-20 bg-blue-100 rounded-full animate-pulse"></div>
                
                <!-- Center icon -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <i class="fas fa-rocket text-2xl text-blue-600 animate-bounce"></i>
                </div>
                
                <!-- Orbiting dots -->
                <div class="absolute inset-0 w-full h-full">
                  <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div class="w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                  </div>
                  <div class="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <div class="w-2 h-2 bg-blue-500 rounded-full animate-ping" style="animation-delay: 0.5s;"></div>
                  </div>
                  <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <div class="w-2.5 h-2.5 bg-blue-400 rounded-full animate-ping" style="animation-delay: 1s;"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Enhanced Content -->
            <div class="space-y-8">
              <div class="space-y-4">
                <h2 class="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Setting up your account...
                </h2>
                <p class="text-gray-600 text-lg">We're preparing everything you need to get started</p>
              </div>
              
              <!-- Enhanced Progress Steps -->
              <div class="max-w-md mx-auto space-y-6">
                <!-- Step 1: Skipping KYC -->
                <div class="relative">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <div :class="[
                        'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500',
                        currentStep >= 1 
                          ? 'bg-green-500 text-white scale-110 shadow-lg' 
                          : 'bg-gray-200 text-gray-400'
                      ]">
                        <i v-if="currentStep >= 1" class="fas fa-check text-lg"></i>
                        <i v-else class="fas fa-user-clock text-lg"></i>
                      </div>
                    </div>
                    <div class="flex-1 text-left">
                      <div class="font-semibold text-gray-900" :class="{ 'text-green-600': currentStep >= 1 }">
                        Skipping KYC verification
                      </div>
                      <div class="text-sm text-gray-500">
                        Setting up basic account access
                      </div>
                    </div>
                    <div v-if="currentStep >= 1" class="text-green-500">
                      <i class="fas fa-check-circle text-xl"></i>
                    </div>
                  </div>
                  
                  <!-- Progress line -->
                  <div v-if="currentStep >= 1" class="absolute left-6 top-12 w-0.5 h-8 bg-green-500 transform -translate-x-1/2"></div>
                </div>
                
                <!-- Step 2: Setting up account -->
                <div class="relative">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <div :class="[
                        'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500',
                        currentStep >= 2 
                          ? 'bg-green-500 text-white scale-110 shadow-lg' 
                          : 'bg-gray-200 text-gray-400'
                      ]">
                        <i v-if="currentStep >= 2" class="fas fa-check text-lg"></i>
                        <i v-else class="fas fa-cog text-lg"></i>
                      </div>
                    </div>
                    <div class="flex-1 text-left">
                      <div class="font-semibold text-gray-900" :class="{ 'text-green-600': currentStep >= 2 }">
                        Setting up your account
                      </div>
                      <div class="text-sm text-gray-500">
                        Configuring preferences and settings
                      </div>
                    </div>
                    <div v-if="currentStep >= 2" class="text-green-500">
                      <i class="fas fa-check-circle text-xl"></i>
                    </div>
                  </div>
                  
                  <!-- Progress line -->
                  <div v-if="currentStep >= 2" class="absolute left-6 top-12 w-0.5 h-8 bg-green-500 transform -translate-x-1/2"></div>
                </div>
                
                <!-- Step 3: Redirecting to main app -->
                <div class="relative">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <div :class="[
                        'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500',
                        currentStep >= 3 
                          ? 'bg-green-500 text-white scale-110 shadow-lg' 
                          : 'bg-gray-200 text-gray-400'
                      ]">
                        <i v-if="currentStep >= 3" class="fas fa-check text-lg"></i>
                        <i v-else class="fas fa-arrow-right text-lg"></i>
                      </div>
                    </div>
                    <div class="flex-1 text-left">
                      <div class="font-semibold text-gray-900" :class="{ 'text-green-600': currentStep >= 3 }">
                        Redirecting to main app
                      </div>
                      <div class="text-sm text-gray-500">
                        Almost there! Redirecting you now
                      </div>
                    </div>
                    <div v-if="currentStep >= 3" class="text-green-500">
                      <i class="fas fa-check-circle text-xl"></i>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Enhanced Status Message -->
              <div class="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div class="flex items-center justify-center space-x-3">
                  <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span class="text-blue-700 font-medium">
                    {{ currentStep === 1 ? 'Preparing your account...' : 
                       currentStep === 2 ? 'Almost ready...' : 
                       'Redirecting you now...' }}
                  </span>
                  <div class="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style="animation-delay: 0.5s;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Form Content -->
          <div v-else>
            <!-- <div class="text-center mb-8"> -->
              <!-- <h2 class="text-3xl font-bold text-gray-900 mb-3">KYC Setup</h2> -->
              <!-- <p class="text-gray-600">Complete your business verification</p> -->
            <!-- </div> -->

            <div v-if="signupStore.errors.general" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div class="flex items-center">
                <i class="fas fa-exclamation-circle text-red-500 mr-3"></i>
                <span class="text-red-700 text-sm font-medium">{{ signupStore.errors.general }}</span>
              </div>
            </div>

            <form @submit.prevent="handleCompleteSignup" class="space-y-6">
              <!-- Business Type Selection -->
              <div class="border border-gray-200 rounded-lg p-6">
                <label class="block text-sm font-medium text-gray-700 mb-4">Select Business Type</label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    @click="() => {
                      signupStore.formData.businessType = 'gst';
                      signupStore.showGstSection = true;
                      signupStore.showPanSection = false;
                      signupStore.showBankDetails = false;
                    }"
                    :class="[
                      'relative p-4 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md group',
                      signupStore.formData.businessType === 'gst'
                        ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm ring-2 ring-blue-200'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    ]"
                  >
                    <div class="flex items-center space-x-3">
                      <div :class="[
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0',
                        signupStore.formData.businessType === 'gst'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                      ]">
                        <i class="fas fa-receipt text-lg"></i>
                      </div>
                      
                      <div class="flex-1">
                        <div class="font-semibold text-gray-900 text-base">
                          GST Registered
                        </div>
                        <!-- <div class="text-xs text-gray-500 mt-0.5">
                          For businesses with GST registration
                        </div> -->
                      </div>
                      
                      <div v-if="signupStore.formData.businessType === 'gst'" class="flex-shrink-0">
                        <div class="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <i class="fas fa-check text-white text-xs"></i>
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    @click="() => {
                      signupStore.formData.businessType = 'pan';
                      signupStore.showPanSection = true;
                      signupStore.showGstSection = false;
                      signupStore.showBankDetails = false;
                    }"
                    :class="[
                      'relative p-4 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md group',
                      signupStore.formData.businessType === 'pan'
                        ? 'border-purple-600 bg-gradient-to-r from-purple-50 to-purple-100 shadow-sm ring-2 ring-purple-200'
                        : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                    ]"
                  >
                    <div class="flex items-center space-x-3">
                      <div :class="[
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0',
                        signupStore.formData.businessType === 'pan'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600'
                      ]">
                        <i class="fas fa-id-badge text-lg"></i>
                      </div>
                      
                      <div class="flex-1">
                        <div class="font-semibold text-gray-900 text-base">
                          PAN Based Business
                        </div>
                        <!-- <div class="text-xs text-gray-500 mt-0.5">
                          For businesses with PAN registration
                        </div> -->
                      </div>
                      
                      <div v-if="signupStore.formData.businessType === 'pan'" class="flex-shrink-0">
                        <div class="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                          <i class="fas fa-check text-white text-xs"></i>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Business Details based on type -->
              <div v-if="signupStore.formData.businessType === 'gst'" class="border border-gray-200 rounded-lg p-6">
                <button
                  type="button"
                  @click="signupStore.showGstSection = !signupStore.showGstSection"
                  class="w-full flex items-center justify-between text-left"
                >
                  <div class="flex items-center">
                    <i class="fas fa-receipt text-green-600 mr-3"></i>
                    <span class="font-semibold text-gray-900">GST Details</span>
                  </div>
                  <i :class="signupStore.showGstSection ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-gray-400"></i>
                </button>
                
                <div v-if="signupStore.showGstSection" class="mt-4 space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">GST Number <span class="text-red-500">*</span></label>
                      <input
                        v-model="signupStore.formData.gstNumber"
                        @input="signupStore.clearError('gstNumber')"
                        @blur="handleVerifyGst"
                        @keyup.enter="handleCompleteSignup"
                        type="text"
                        placeholder="22AAAAA0000A1Z5"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        :class="{ 'border-red-500': signupStore.errors.gstNumber, 'border-green-500': signupStore.gstVerified }"
                      />
                      
                      <!-- Simple spinner below input when verifying -->
                      <div v-if="signupStore.isLoading && signupStore.formData.gstNumber.length > 0" class="mt-1 flex items-center space-x-2">
                        <SpinnerLoader size="sm" />
                        <span class="text-xs text-blue-600">Verifying GST...</span>
                      </div>
                      
                      <!-- Success message -->
                      <div v-else-if="signupStore.gstVerified" class="mt-1 p-2">
                        <div class="text-xs text-green-700">
                          <i class="fas fa-check-circle mr-1"></i>
                          GST number verified successfully!
                        </div>
                      </div>
                      
                      <p v-if="signupStore.errors.gstNumber" class="mt-1 text-sm text-red-600">{{ signupStore.errors.gstNumber }}</p>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">PAN Number <span class="text-red-500">*</span></label>
                      <input
                        v-model="signupStore.formData.gstPanNumber"
                        @input="signupStore.clearError('gstPanNumber')"
                        @keyup.enter="handleCompleteSignup"
                        type="text"
                        placeholder="ABCDE1234F"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': signupStore.errors.gstPanNumber }"
                        readonly
                      />
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
                      <input
                        v-model="signupStore.formData.entityType"
                        @input="signupStore.clearError('entityType')"
                        @keyup.enter="handleCompleteSignup"
                        type="text"
                        placeholder="Private Limited Company"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': signupStore.errors.entityType }"
                        readonly
                      />
                      <p v-if="signupStore.errors.entityType" class="mt-1 text-sm text-red-600">{{ signupStore.errors.entityType }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Entity Name</label>
                      <input
                        v-model="signupStore.formData.entityName"
                        @input="signupStore.clearError('entityName')"
                        @keyup.enter="handleCompleteSignup"
                        type="text"
                        placeholder="Company Name"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': signupStore.errors.entityName }"
                        readonly
                      />
                      <p v-if="signupStore.errors.entityName" class="mt-1 text-sm text-red-600">{{ signupStore.errors.entityName }}</p>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                      <input
                        v-model="signupStore.formData.branchName"
                        @input="signupStore.clearError('branchName')"
                        @keyup.enter="handleCompleteSignup"
                        type="text"
                        placeholder="Main Branch"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': signupStore.errors.branchName }"
                      />
                      <p v-if="signupStore.errors.branchName" class="mt-1 text-sm text-red-600">{{ signupStore.errors.branchName }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Pincode <span class="text-red-500">*</span></label>
                      <input
                        v-model="signupStore.formData.gstPincode"
                        @input="signupStore.clearError('gstPincode')"
                        @blur="signupStore.verifyPincode(signupStore.formData.gstPincode)"
                        @keyup.enter="handleCompleteSignup"
                        type="text"
                        placeholder="123456"
                        maxlength="6"
                        class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 
                          'border-red-500': signupStore.errors.gstPincode, 
                          'border-green-500': signupStore.isPincodeValid && signupStore.formData.gstPincode.length === 6,
                          'border-gray-300': !signupStore.errors.gstPincode && !signupStore.isPincodeValid
                        }"
                        :disabled="signupStore.isPincodeLoading"
                        readonly
                      />
                      
                      <!-- Simple spinner below input when verifying -->
                      <div v-if="signupStore.isPincodeLoading && signupStore.formData.gstPincode.length === 6" class="mt-1 flex items-center space-x-2">
                        <SpinnerLoader size="sm" />
                        <span class="text-xs text-blue-600">Verifying pincode...</span>
                      </div>
                      
                      <!-- Success message with city details -->
                      <div v-else-if="signupStore.isPincodeValid && signupStore.pincodeData" class="mt-1 p-2">
                        <div class="text-xs text-green-700">
                          <i class="fas fa-check-circle mr-1"></i>
                          {{ signupStore.pincodeData.city }}, {{ signupStore.pincodeData.state }}
                        </div>
                      </div>
                      
                      <p v-if="signupStore.errors.gstPincode" class="mt-1 text-sm text-red-600">{{ signupStore.errors.gstPincode }}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Registered Address <span class="text-red-500">*</span></label>
                    <textarea
                      v-model="signupStore.formData.gstAddress"
                      @input="signupStore.clearError('gstAddress')"
                      @keyup.enter="handleCompleteSignup"
                      rows="2"
                      placeholder="Enter your registered business address"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': signupStore.errors.gstAddress }"
                      readonly
                    ></textarea>
                    <p v-if="signupStore.errors.gstAddress" class="mt-1 text-sm text-red-600">{{ signupStore.errors.gstAddress }}</p>
                  </div>
                </div>
              </div>

              <div v-if="signupStore.formData.businessType === 'pan'" class="border border-gray-200 rounded-lg p-6">
                <button
                  type="button"
                  @click="handlePanSectionToggle"
                  class="w-full flex items-center justify-between text-left"
                >
                  <div class="flex items-center">
                    <i class="fas fa-id-badge text-purple-600 mr-3"></i>
                    <span class="font-semibold text-gray-900">PAN Details</span>
                  </div>
                  <i :class="signupStore.showPanSection ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-gray-400"></i>
                </button>
                
                <div v-if="signupStore.showPanSection" class="mt-4 space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Entity Type <span class="text-red-500">*</span></label>
                      <div class="space-y-2">
                        <div v-if="signupStore.isLoading && signupStore.entityTypes.length === 0" class="flex items-center justify-center py-4">
                          <SpinnerLoader size="sm" class="mr-2" />
                          <span class="text-sm text-gray-500">Loading entity types...</span>
                        </div>
                        <select
                          v-model="signupStore.formData.entityType"
                          @change="signupStore.clearError('entityType')"
                          @keyup.enter="handleCompleteSignup"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          :class="{ 'border-red-500': signupStore.errors.entityType }"
                          :disabled="signupStore.isLoading"
                        >
                          <option value="">
                            {{ signupStore.isLoading ? 'Loading entity types...' : 'Select Entity Type' }}
                          </option>
                          <option 
                            v-for="entityType in filteredEntityTypes" 
                            :key="entityType.id" 
                            :value="entityType.entity_type"
                          >
                            {{ entityType.entity_type }}
                          </option>
                          <option v-if="filteredEntityTypes.length === 0 && !signupStore.isLoading && entityTypeSearchQuery" value="" disabled>
                            No entity types found
                          </option>
                        </select>
                        <p v-if="signupStore.errors.entityType" class="mt-1 text-sm text-red-600">{{ signupStore.errors.entityType }}</p>
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Entity Name <span class="text-red-500">*</span></label>
                      <input
                        v-model="signupStore.formData.entityName"
                        @input="signupStore.clearError('entityName')"
                        @keyup.enter="handleCompleteSignup"
                        type="text"
                        placeholder="Enter entity name"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': signupStore.errors.entityName }"
                      />
                      <p v-if="signupStore.errors.entityName" class="mt-1 text-sm text-red-600">{{ signupStore.errors.entityName }}</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">PAN Number <span class="text-red-500">*</span></label>
                      <input
                        v-model="signupStore.formData.panNumber"
                        @input="signupStore.clearError('panNumber')"
                        @blur="handleVerifyPan"
                        @keyup.enter="handleCompleteSignup"
                        type="text"
                        placeholder="ABCDE1234F"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        :class="{ 'border-red-500': signupStore.errors.panNumber, 'border-green-500': signupStore.panVerified }"
                      />
                      
                      <!-- Simple spinner below input when verifying -->
                      <div v-if="signupStore.isLoading && signupStore.formData.panNumber.length > 0" class="mt-0 flex items-center space-x-2">
                        <SpinnerLoader size="sm" />
                        <span class="text-xs text-blue-600">Verifying PAN...</span>
                      </div>
                      
                      <!-- Success message -->
                      <div v-else-if="signupStore.panVerified" class="mt-0 p-2">
                        <div class="text-xs text-green-700">
                          <i class="fas fa-check-circle mr-1"></i>
                          PAN number verified successfully!
                        </div>
                      </div>
                      
                      <!-- Error message -->
                      <p v-if="signupStore.errors.panNumber" class="mt-0 text-xs text-red-600">{{ signupStore.errors.panNumber }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                      <input
                        v-model="signupStore.formData.panPincode"
                        @input="signupStore.clearError('panPincode')"
                        @blur="signupStore.verifyPincode(signupStore.formData.panPincode)"
                        @keyup.enter="handleCompleteSignup"
                        type="text"
                        placeholder="123456"
                        maxlength="6"
                        class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 
                          'border-red-500': signupStore.errors.panPincode, 
                          'border-green-500': signupStore.isPincodeValid && signupStore.formData.panPincode.length === 6,
                          'border-gray-300': !signupStore.errors.panPincode && !signupStore.isPincodeValid
                        }"
                        :disabled="signupStore.isPincodeLoading"
                      />
                      
                      <!-- Simple spinner below input when verifying -->
                      <div v-if="signupStore.isPincodeLoading && signupStore.formData.panPincode.length === 6" class="mt-1 flex items-center space-x-2">
                        <SpinnerLoader size="sm" />
                        <span class="text-xs text-blue-600">Verifying pincode...</span>
                      </div>
                      
                      <!-- Success message with city details -->
                      <div v-else-if="signupStore.isPincodeValid && signupStore.pincodeData" class="mt-1 p-2">
                        <div class="text-xs text-green-700">
                          <i class="fas fa-check-circle mr-1"></i>
                          {{ signupStore.pincodeData.city }}, {{ signupStore.pincodeData.state }}
                        </div>
                      </div>
                      
                      <!-- Error message -->
                      <p v-if="signupStore.errors.panPincode" class="mt-1 text-xs text-red-600">{{ signupStore.errors.panPincode }}</p>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Billing Address <span class="text-red-500">*</span></label>
                    <textarea
                      v-model="signupStore.formData.billingAddress"
                      @input="signupStore.clearError('billingAddress')"
                      @keyup.enter="handleCompleteSignup"
                      rows="3"
                      placeholder="Enter your billing address"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': signupStore.errors.billingAddress }"
                    ></textarea>
                    <p v-if="signupStore.errors.billingAddress" class="mt-1 text-sm text-red-600">{{ signupStore.errors.billingAddress }}</p>
                  </div>
                </div>
              </div>

              <!-- Bank Details -->
              <div class="border border-gray-200 rounded-lg p-6">
                <button
                  type="button"
                  @click="handleBankSectionToggle"
                  class="w-full flex items-center justify-between text-left"
                >
                  <div class="flex items-center">
                    <i class="fas fa-university text-yellow-600 mr-3"></i>
                    <span class="font-semibold text-gray-900">Bank Details</span>
                  </div>
                  <i :class="signupStore.showBankDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-gray-400"></i>
                </button>
                
                <div v-if="signupStore.showBankDetails" class="mt-4 space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Beneficiary Name <span class="text-red-500">*</span></label>
                      <input
                        v-model="signupStore.formData.beneficiaryName"
                        @input="signupStore.clearError('beneficiaryName')"
                        @blur="handleVerifyBank"
                        @keyup.enter="handleCompleteSignup"
                        type="text"
                        placeholder="Enter beneficiary name"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': signupStore.errors.beneficiaryName }"
                      />
                      <p v-if="signupStore.errors.beneficiaryName" class="mt-1 text-sm text-red-600">{{ signupStore.errors.beneficiaryName }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Bank Name <span class="text-red-500">*</span></label>
                      <div class="space-y-2">
                        <div v-if="signupStore.isLoading && signupStore.banksList.length === 0" class="flex items-center justify-center py-4">
                          <SpinnerLoader size="sm" class="mr-2" />
                          <span class="text-sm text-gray-500">Loading banks...</span>
                        </div>
                        <select
                          v-model="signupStore.formData.bankName"
                          @change="signupStore.clearError('bankName')"
                          @blur="handleVerifyBank"
                          @keyup.enter="handleCompleteSignup"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          :class="{ 'border-red-500': signupStore.errors.bankName }"
                          :disabled="signupStore.isLoading"
                        >
                          <option value="">
                            {{ signupStore.isLoading ? 'Loading banks...' : 'Select Bank' }}
                          </option>
                          <option 
                            v-for="bank in filteredBanks" 
                            :key="bank.id" 
                            :value="bank.name"
                          >
                            {{ bank.name }}
                          </option>
                          <option v-if="filteredBanks.length === 0 && !signupStore.isLoading && bankSearchQuery" value="" disabled>
                            No banks found
                          </option>
                        </select>
                        <p v-if="signupStore.errors.bankName" class="mt-1 text-sm text-red-600">{{ signupStore.errors.bankName }}</p>
                      </div>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Account Number <span class="text-red-500">*</span></label>
                      <input
                        v-model="signupStore.formData.accountNumber"
                        @input="signupStore.clearError('accountNumber')"
                        @blur="handleVerifyBank"
                        @keyup.enter="handleCompleteSignup"
                        type="text"
                        placeholder="Enter account number"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': signupStore.errors.accountNumber, 'border-green-500': signupStore.bankVerified }"
                      />
                      <p v-if="signupStore.errors.accountNumber" class="mt-1 text-sm text-red-600">{{ signupStore.errors.accountNumber }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">IFSC Code <span class="text-red-500">*</span></label>
                      <input
                        v-model="signupStore.formData.ifscCode"
                        @input="signupStore.clearError('ifscCode')"
                        @blur="handleVerifyBank"
                        @keyup.enter="handleCompleteSignup"
                        type="text"
                        placeholder="Enter IFSC code"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        :class="{ 'border-red-500': signupStore.errors.ifscCode, 'border-green-500': signupStore.bankVerified }"
                      />
                      
                      <div v-if="signupStore.isLoading && signupStore.formData.accountNumber && signupStore.formData.ifscCode" class="mt-1 flex items-center space-x-2">
                        <SpinnerLoader size="sm" />
                        <span class="text-xs text-blue-600">Verifying bank details...</span>
                      </div>
                      
                      <div v-else-if="signupStore.bankVerified" class="mt-1 p-2">
                        <div class="text-xs text-green-700">
                          <i class="fas fa-check-circle mr-1"></i>
                          Bank account details verified successfully!
                        </div>
                      </div>
                      
                      <!-- Error message -->
                      <p v-if="signupStore.errors.ifscCode" class="mt-1 text-xs text-red-600">{{ signupStore.errors.ifscCode }}</p>
                    </div>
                  </div>
                  
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex space-x-4">
                <button
                  type="button"
                  @click="handleSkipKyc"
                  class="flex-1 text-white py-3 px-4 rounded-md font-semibold flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800"
                >
                  Skip KYC
                </button>
                <button
                  type="button"
                  @click="handleCompleteSignup"
                  :disabled="!signupStore.isStep3Valid || signupStore.isLoading"
                  class="flex-1 text-white py-3 px-4 rounded-md disabled:opacity-90 disabled:cursor-not-allowed font-semibold flex items-center justify-center bg-blue-500"
                >
                  <SpinnerLoader v-if="signupStore.isLoading" size="sm" class="mr-2" />
                  {{ signupStore.isLoading ? 'Processing...' : 'Complete Signup' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSignupStore } from '@/stores/signup'
import { UserRedirection } from '@/utils/redirection'
import { useAuthStore } from '@/stores/auth'
import ProgressIndicator from '@/components/signup/ProgressIndicator.vue'
import SpinnerLoader from '@/components/common/SpinnerLoader.vue'

const router = useRouter()
const signupStore = useSignupStore()
const authStore = useAuthStore()

// Loading state for skip KYC
const isSkippingKyc = ref(false)
const currentStep = ref(1)

// Bank search functionality
const bankSearchQuery = ref('')
const filteredBanks = ref<any[]>([])

const filterBanks = () => {
  const query = bankSearchQuery.value.toLowerCase()
  filteredBanks.value = signupStore.banksList.filter(bank => 
    bank.name.toLowerCase().includes(query)
  )
}

// Watch for changes in banks list to update filtered banks
watch(() => signupStore.banksList, (newBanksList) => {
  filteredBanks.value = newBanksList
}, { immediate: true })

// Entity type search functionality
const entityTypeSearchQuery = ref('')
const filteredEntityTypes = ref<any[]>([])

const filterEntityTypes = () => {
  const query = entityTypeSearchQuery.value.toLowerCase()
  filteredEntityTypes.value = signupStore.entityTypes.filter(entity => 
    entity.entity_type.toLowerCase().includes(query)
  )
}

// Watch for changes in entity types to update filtered entity types
watch(() => signupStore.entityTypes, (newEntityTypes) => {
  filteredEntityTypes.value = newEntityTypes
}, { immediate: true })

// Fetch data when component mounts
onMounted(async () => {
  try {
    // Fetch entity types and banks list in parallel
    await Promise.all([
      signupStore.fetchEntityTypes(),
      signupStore.fetchBanksList()
    ])
    
    // Auto-open the appropriate section based on selected business type
    if (signupStore.formData.businessType === 'gst') {
      signupStore.showGstSection = true
      signupStore.showPanSection = false
      signupStore.showBankDetails = false
    } else if (signupStore.formData.businessType === 'pan') {
      signupStore.showPanSection = true
      signupStore.showGstSection = false
      signupStore.showBankDetails = false
    }
  } catch (error) {
    console.error('Failed to fetch initial data:', error)
  }
})

// Remove the onMounted hook that was causing infinite redirection
// The router navigation guard already handles proper routing based on onboarding status

const handleSendAadhaarOtp = async () => {
  await signupStore.sendAadhaarOtp()
}

const handleAadhaarOtpInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '')
  
  signupStore.formData.aadhaarOtp[index] = value
  
  if (value && index < 5) {
    const nextInput = document.querySelector(`[data-aadhaar-otp-index="${index + 1}"]`) as HTMLInputElement
    if (nextInput) nextInput.focus()
  }
  
  signupStore.clearError('aadhaarOtp')
}

const handleAadhaarOtpKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace' && !signupStore.formData.aadhaarOtp[index] && index > 0) {
    const prevInput = document.querySelector(`[data-aadhaar-otp-index="${index - 1}"]`) as HTMLInputElement
    if (prevInput) prevInput.focus()
  }
}

const handleVerifyAadhaar = async () => {
  const result = await signupStore.verifyAadhaar()
  if (result.canSkip) {
    // Show skip option or handle accordingly
  }
}

const handleResendAadhaarOtp = () => {
  signupStore.formData.aadhaarOtp = ['', '', '', '', '', '']
  signupStore.sendAadhaarOtp()
}

const handleVerifyPan = async () => {
  // Check if entity type is selected before verifying PAN
  if (!signupStore.formData.entityType) {
    signupStore.setError('entityType', 'Please select an entity type first')
    return
  }
  
  // Clear entity type error if it was previously set
  signupStore.clearError('entityType')
  
  await signupStore.verifyPan()
}

const handleVerifyGst = async () => {
  await signupStore.verifyGst()
  
  // The store now automatically fills the GST section inputs when verification is successful
  // No need to manually access the data here
}

const handleVerifyBank = async () => {
  // Check if bank is selected before verifying bank details
  if (!signupStore.formData.bankName) {
    signupStore.setError('bankName', 'Please select a bank first')
    return
  }
  
  // Check if beneficiary name is provided
  if (!signupStore.formData.beneficiaryName.trim()) {
    signupStore.setError('beneficiaryName', 'Please enter beneficiary name first')
    return
  }
  
  // Check if account number is provided
  if (!signupStore.formData.accountNumber.trim()) {
    signupStore.setError('accountNumber', 'Please enter account number first')
    return
  }
  
  // Check if IFSC code is provided
  if (!signupStore.formData.ifscCode.trim()) {
    signupStore.setError('ifscCode', 'Please enter IFSC code first')
    return
  }
  
  // Clear all bank-related errors if they were previously set
  signupStore.clearError('bankName')
  signupStore.clearError('beneficiaryName')
  signupStore.clearError('accountNumber')
  signupStore.clearError('ifscCode')
  
  await signupStore.verifyBank()
}

const handlePanSectionToggle = () => {
  // Close other sections when opening PAN section
  signupStore.showGstSection = false
  signupStore.showBankDetails = false
  // Toggle PAN section
  signupStore.showPanSection = !signupStore.showPanSection
}

const handleBankSectionToggle = () => {
  // Close other sections when opening Bank section
  signupStore.showGstSection = false
  signupStore.showPanSection = false
  // Toggle Bank section
  signupStore.showBankDetails = !signupStore.showBankDetails
}

const handleSkipKyc = async () => {
  isSkippingKyc.value = true
  
  // Animate through the steps with proper timing
  setTimeout(() => {
    currentStep.value = 2
  }, 500)
  
  setTimeout(() => {
    currentStep.value = 3
  }, 1000)
  
  // Wait for the full animation to complete before redirecting
  setTimeout(() => {
    // Redirect to main app after step 3 is shown
    UserRedirection.redirectToMainApp()
  }, 2000) // Increased from 4000 to 2000 to give more time to see step 3
}

const handleCompleteSignup = async () => {
  // Validate required fields before proceeding
  let hasErrors = false
  
  if (signupStore.formData.businessType === 'pan') {
    // Check entity type selection for PAN business type
    if (!signupStore.formData.entityType) {
      signupStore.setError('entityType', 'Please select an entity type')
      hasErrors = true
    }
    
    // Check entity name for PAN business type
    if (!signupStore.formData.entityName.trim()) {
      signupStore.setError('entityName', 'Please enter entity name')
      hasErrors = true
    }
    
    // Check PAN number for PAN business type
    if (!signupStore.formData.panNumber.trim()) {
      signupStore.setError('panNumber', 'Please enter PAN number')
      hasErrors = true
    }
    
    // Check billing address for PAN business type
    if (!signupStore.formData.billingAddress.trim()) {
      signupStore.setError('billingAddress', 'Please enter billing address')
      hasErrors = true
    }
  } else if (signupStore.formData.businessType === 'gst') {
    // Check GST number for GST business type
    if (!signupStore.formData.gstNumber.trim()) {
      signupStore.setError('gstNumber', 'Please enter GST number')
      hasErrors = true
    }
    
    // Check if GST is verified
    if (!signupStore.gstVerified) {
      signupStore.setError('gstNumber', 'Please verify your GST number first')
      hasErrors = true
    }
    
    // Check GST address for GST business type (should be auto-filled)
    if (!signupStore.formData.gstAddress.trim()) {
      signupStore.setError('gstAddress', 'Please verify your GST number to auto-fill address')
      hasErrors = true
    }
    
    // Check GST pincode for GST business type (should be auto-filled)
    if (!signupStore.formData.gstPincode.trim()) {
      signupStore.setError('gstPincode', 'Please verify your GST number to auto-fill pincode')
      hasErrors = true
    }
    
    // Check GST PAN number for GST business type (should be auto-filled)
    if (!signupStore.formData.gstPanNumber.trim()) {
      signupStore.setError('gstPanNumber', 'Please verify your GST number to auto-fill PAN')
      hasErrors = true
    }
    
    // Check entity name for GST business type (should be auto-filled)
    if (!signupStore.formData.entityName.trim()) {
      signupStore.setError('entityName', 'Please verify your GST number to auto-fill entity name')
      hasErrors = true
    }
    
    // Check entity type for GST business type (should be auto-filled)
    if (!signupStore.formData.entityType.trim()) {
      signupStore.setError('entityType', 'Please verify your GST number to auto-fill entity type')
      hasErrors = true
    }
  }
  
  // Check bank selection
  if (!signupStore.formData.bankName) {
    signupStore.setError('bankName', 'Please select a bank')
    hasErrors = true
  }
  
  // Check beneficiary name
  if (!signupStore.formData.beneficiaryName.trim()) {
    signupStore.setError('beneficiaryName', 'Please enter beneficiary name')
    hasErrors = true
  }
  
  // Check account number
  if (!signupStore.formData.accountNumber.trim()) {
    signupStore.setError('accountNumber', 'Please enter account number')
    hasErrors = true
  }
  
  // Check IFSC code
  if (!signupStore.formData.ifscCode.trim()) {
    signupStore.setError('ifscCode', 'Please enter IFSC code')
    hasErrors = true
  }
  
  // If there are validation errors, don't proceed
  if (hasErrors) {
    return
  }
  
  const result = await signupStore.completeKyc()
  if (result.success) {
    // Redirect to main app
    UserRedirection.redirectToMainApp()
  }
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script> 