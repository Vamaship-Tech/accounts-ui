<template>
  <div class="min-h-screen flex items-center justify-center p-4 lg:p-8">
    <div class="w-full max-w-md lg:max-w-4xl">
      <div class="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 lg:p-8">
        <ProgressIndicator :current-step="3" />

        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Business Verification</h2>
          <p class="text-gray-600">Complete KYC to enable COD and unlock advanced features. You can skip this for now.</p>
        </div>

        <div v-if="generalError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div class="flex items-center">
            <i class="fas fa-exclamation-circle text-red-500 mr-3"></i>
            <span class="text-red-700 text-sm font-medium">{{ generalError }}</span>
          </div>
        </div>

        <div v-if="showLoginOption" class="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg shadow-lg">
          <div class="text-center">
            <div class="flex items-center justify-center mb-4">
              <i class="fas fa-exclamation-triangle text-orange-500 text-3xl mr-3"></i>
              <h3 class="text-xl font-bold text-blue-900">Email Already Registered!</h3>
            </div>
            <p class="text-blue-800 mb-4 text-lg">
              The email <strong class="text-blue-900">{{ formData.email }}</strong> is already registered with Vamaship.
            </p>
            <button
              @click="$emit('go-to-signin')"
              class="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <i class="fas fa-sign-in-alt mr-3 text-lg"></i>
              Login Here
            </button>
            <p class="text-xs text-blue-600 mt-3">
              Your email will be pre-filled automatically
            </p>
          </div>
        </div>

        <form v-if="!showLoginOption" @submit.prevent="$emit('complete-signup')" class="space-y-6">
          <div class="border border-gray-200 rounded-lg p-6">
            <button
              type="button"
              @click="$emit('toggle-aadhaar-section')"
              class="w-full flex items-center justify-between text-left"
            >
              <div class="flex items-center">
                <i class="fas fa-id-card text-blue-600 mr-3"></i>
                <span class="font-semibold text-gray-900">Aadhaar Verification</span>
                <span v-if="aadhaarVerified" class="ml-2 text-green-600">
                  <i class="fas fa-check-circle"></i>
                </span>
              </div>
              <i :class="showAadhaarSection ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-gray-400"></i>
            </button>
            
            <div v-if="aadhaarVerified && !showAadhaarSection" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div class="flex items-center text-green-700">
                <i class="fas fa-check-circle mr-2"></i>
                <span>Aadhaar verification completed successfully!</span>
              </div>
            </div>
            
            <div v-if="showAadhaarSection && !aadhaarVerified" class="mt-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
                <input
                  v-model="formData.aadhaarNumber"
                  @input="$emit('validate-aadhaar', ($event.target as HTMLInputElement).value)"
                  @keyup.enter="$emit('send-aadhaar-otp')"
                  type="text"
                  placeholder="Enter 12-digit Aadhaar number"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.aadhaarNumber }"
                />
                <p v-if="errors.aadhaarNumber" class="mt-1 text-sm text-red-600">{{ errors.aadhaarNumber }}</p>
              </div>

              <div v-if="aadhaarOtpSent">
                <label class="block text-sm font-medium text-gray-700 mb-2">Enter Aadhaar OTP</label>
                <div class="flex space-x-2 justify-center">
                  <input
                    v-for="(input, index) in aadhaarOtpInputs"
                    :key="index"
                    v-model="input.value"
                    @input="$emit('aadhaar-otp-input', index, ($event.target as HTMLInputElement).value)"
                    @keydown="$emit('aadhaar-otp-keydown', index, $event)"
                    @keyup.enter="$emit('verify-aadhaar')"
                    type="text"
                    maxlength="1"
                    :data-aadhaar-otp-index="index"
                    class="w-12 h-12 lg:w-14 lg:h-14 xs:w-8 xs:h-8 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base xs:text-xs font-semibold"
                    :class="{ 'border-red-500': errors.aadhaarOtp }"
                  />
                </div>
                <p v-if="errors.aadhaarOtp" class="mt-1 text-sm text-red-600 text-center">{{ errors.aadhaarOtp }}</p>
              </div>

              <div class="flex space-x-3">
                <button
                  v-if="!aadhaarOtpSent"
                  type="button"
                  @click="$emit('send-aadhaar-otp')"
                  :disabled="!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12"
                  class="text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                  :style="{ 'background-color': (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12) ? '#9CA3AF' : '#6A5ACD' }"
                >
                  Send Aadhaar OTP
                </button>
                <div v-if="aadhaarOtpSent" class="space-y-3">
                  <div class="flex justify-center sm:justify-start">
                    <button
                      type="button"
                      @click="$emit('verify-aadhaar')"
                      :disabled="!formData.aadhaarOtp || formData.aadhaarOtp.some(digit => digit === '')"
                      class="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      Verify Aadhaar
                    </button>
                  </div>
                  <div class="text-center">
                    <button
                      @click="$emit('resend-aadhaar-otp')"
                      :disabled="aadhaarOtpCooldown > 0"
                      class="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      <span v-if="aadhaarOtpCooldown > 0">
                        Resend Aadhaar OTP in {{ formatTime(aadhaarOtpCooldown) }}
                      </span>
                      <span v-else>
                        Resend Aadhaar OTP
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="border border-gray-200 rounded-lg p-6">
            <label class="block text-sm font-medium text-gray-700 mb-4">Select Business Type</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                @click="$emit('set-business-type', 'gst')"
                :class="[
                  'p-4 border-2 rounded-lg text-left transition-colors',
                  formData.businessType === 'gst'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                ]"
              >
                <div class="font-semibold">GST Registered Business</div>
                <div class="text-sm">For businesses with GST registration</div>
              </button>
              <button
                type="button"
                @click="$emit('set-business-type', 'pan')"
                :class="[
                  'p-4 border-2 rounded-lg text-left transition-colors',
                  formData.businessType === 'pan'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                ]"
              >
                <div class="font-semibold">PAN Based Business</div>
                <div class="text-sm">For businesses with PAN registration</div>
              </button>
            </div>
          </div>

          <div v-if="formData.businessType === 'gst'" class="border border-gray-200 rounded-lg p-6">
            <button
              type="button"
              @click="$emit('toggle-gst-section')"
              class="w-full flex items-center justify-between text-left"
            >
              <div class="flex items-center">
                <i class="fas fa-receipt text-green-600 mr-3"></i>
                <span class="font-semibold text-gray-900">GST Details</span>
              </div>
              <i :class="showGstSection ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-gray-400"></i>
            </button>
            
            <div v-if="showGstSection" class="mt-4 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">GST Number <span class="text-red-500">*</span></label>
                  <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      v-model="formData.gstNumber"
                      @input="$emit('validate-gst-number', ($event.target as HTMLInputElement).value)"
                      @keyup.enter="$emit('complete-signup')"
                      type="text"
                      placeholder="22AAAAA0000A1Z5"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      :class="{ 'border-red-500': errors.gstNumber, 'border-green-500': gstVerified }"
                    />
                    <button
                      type="button"
                      @click="$emit('verify-gst')"
                      :disabled="gstVerifying || !formData.gstNumber || formData.gstNumber.trim() === ''"
                      class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap sm:w-auto w-full"
                    >
                      <i v-if="gstVerifying" class="fas fa-spinner fa-spin mr-1"></i>
                      <span v-if="gstVerifying">Verifying...</span>
                      <span v-else-if="gstVerified">✓ Verified</span>
                      <span v-else>Verify</span>
                    </button>
                  </div>
                  <p v-if="errors.gstNumber" class="mt-1 text-sm text-red-600">{{ errors.gstNumber }}</p>
                  <p v-else-if="gstVerified" class="mt-1 text-sm text-green-600">
                    <i class="fas fa-check-circle mr-1"></i>GST number verified successfully!
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                  <input
                    v-model="formData.branchName"
                    @keyup.enter="$emit('complete-signup')"
                    type="text"
                    placeholder="Main Branch"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.branchName }"
                  />
                  <p v-if="errors.branchName" class="mt-1 text-sm text-red-600">{{ errors.branchName }}</p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Registered Address <span class="text-red-500">*</span></label>
                <textarea
                  v-model="formData.gstAddress"
                  @keyup.enter="$emit('complete-signup')"
                  rows="3"
                  placeholder="Enter your registered business address"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.gstAddress }"
                ></textarea>
                <p v-if="errors.gstAddress" class="mt-1 text-sm text-red-600">{{ errors.gstAddress }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Pincode <span class="text-red-500">*</span></label>
                <input
                  v-model="formData.gstPincode"
                  @input="(event) => handlePincodeInput(event, 'gst')"
                  @keyup.enter="$emit('complete-signup')"
                  type="text"
                  placeholder="123456"
                  maxlength="6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors    .gstPincode }"
                />
                <p v-if="errors.gstPincode" class="mt-1 text-sm text-red-600">{{ errors.gstPincode }}</p>
              </div>
            </div>
          </div>

          <div v-if="formData.businessType === 'pan'" class="border border-gray-200 rounded-lg p-6">
            <button
              type="button"
              @click="$emit('toggle-pan-section')"
              class="w-full flex items-center justify-between text-left"
            >
              <div class="flex items-center">
                <i class="fas fa-id-badge text-purple-600 mr-3"></i>
                <span class="font-semibold text-gray-900">PAN Details</span>
              </div>
              <i :class="showPanSection ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-gray-400"></i>
            </button>
            
            <div v-if="showPanSection" class="mt-4 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Entity Type <span class="text-red-500">*</span></label>
                  <select
                    v-model="formData.entityType"
                    @keyup.enter="$emit('complete-signup')"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.entityType }"
                  >
                    <option value="">Select Entity Type</option>
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                    <option value="partnership">Partnership</option>
                    <option value="proprietorship">Proprietorship</option>
                  </select>
                  <p v-if="errors.entityType" class="mt-1 text-sm text-red-600">{{ errors.entityType }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Entity Name <span class="text-red-500">*</span></label>
                  <input
                    v-model="formData.entityName"
                    @keyup.enter="$emit('complete-signup')"
                    type="text"
                    placeholder="Enter entity name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.entityName }"
                  />
                  <p v-if="errors.entityName" class="mt-1 text-sm text-red-600">{{ errors.entityName }}</p>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">PAN Number <span class="text-red-500">*</span></label>
                  <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      v-model="formData.panNumber"
                      @keyup.enter="$emit('complete-signup')"
                      type="text"
                      placeholder="ABCDE1234F"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      :class="{ 'border-red-500': errors.panNumber, 'border-green-500': panVerified }"
                    />
                    <button
                      type="button"
                      @click="$emit('verify-pan')"
                      :disabled="panVerifying || !formData.panNumber || formData.panNumber.trim() === ''"
                      class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap sm:w-auto w-full"
                    >
                      <i v-if="panVerifying" class="fas fa-spinner fa-spin mr-1"></i>
                      <span v-if="panVerifying">Verifying...</span>
                      <span v-else-if="panVerified">✓ Verified</span>
                      <span v-else>Verify</span>
                    </button>
                  </div>
                  <p v-if="errors.panNumber" class="mt-1 text-sm text-red-600">{{ errors.panNumber }}</p>
                  <p v-else-if="panVerified" class="mt-1 text-sm text-green-600">
                    <i class="fas fa-check-circle mr-1"></i>PAN number verified successfully!
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <input
                    v-model="formData.panPincode"
                    @input="(event) => handlePincodeInput(event, 'pan')"
                    @keyup.enter="$emit('complete-signup')"
                    type="text"
                    placeholder="123456"
                    maxlength="6"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.panPincode }"
                  />
                  <p v-if="errors.panPincode" class="mt-1 text-sm text-red-600">{{ errors.panPincode }}</p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Billing Address <span class="text-red-500">*</span></label>
                <textarea
                  v-model="formData.billingAddress"
                  @keyup.enter="$emit('complete-signup')"
                  rows="3"
                  placeholder="Enter your billing address"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.billingAddress }"
                ></textarea>
                <p v-if="errors.billingAddress" class="mt-1 text-sm text-red-600">{{ errors.billingAddress }}</p>
              </div>
            </div>
          </div>

          <div class="border border-gray-200 rounded-lg p-6">
            <button
              type="button"
              @click="$emit('toggle-bank-details')"
              class="w-full flex items-center justify-between text-left"
            >
              <div class="flex items-center">
                <i class="fas fa-university text-yellow-600 mr-3"></i>
                <span class="font-semibold text-gray-900">Bank Details</span>
              </div>
              <i :class="showBankDetails ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-gray-400"></i>
            </button>
            
            <div v-if="showBankDetails" class="mt-4 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Beneficiary Name <span class="text-red-500">*</span></label>
                  <input
                    v-model="formData.beneficiaryName"
                    @keyup.enter="$emit('complete-signup')"
                    type="text"
                    placeholder="Enter beneficiary name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.beneficiaryName }"
                  />
                  <p v-if="errors.beneficiaryName" class="mt-1 text-sm text-red-600">{{ errors.beneficiaryName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Bank Name <span class="text-red-500">*</span></label>
                  
                  <div v-if="!isOtherBank" class="relative">
                    <select
                      v-model="formData.bankName"
                      @change="handleBankChange"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      :class="{ 'border-red-500': errors.bankName }"
                    >
                      <option value="">Select a bank</option>
                      <option v-for="(bank, index) in banksList" :key="getBankKey(bank, index)" :value="getBankName(bank)">
                        {{ getBankName(bank) }}
                      </option>
                      <option value="other">Other Bank</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                  
                  <div v-else>
                    <input
                      v-model="formData.bankName"
                      @keyup.enter="$emit('complete-signup')"
                      type="text"
                      placeholder="Enter bank name"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': errors.bankName }"
                    />
                    <button
                      type="button"
                      @click="$emit('reset-bank-selection')"
                      class="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Select from bank list
                    </button>
                  </div>
                  
                  <div v-if="banksLoading" class="mt-2 text-sm text-gray-500">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    Loading banks...
                  </div>
                  
                  <div v-if="banksError" class="mt-2 text-sm text-red-600">
                    {{ banksError }}
                    <button
                      type="button"
                      @click="$emit('fetch-banks-list')"
                      class="ml-2 text-blue-600 hover:text-blue-800 underline"
                    >
                      Retry
                    </button>
                  </div>
                  
                  <p v-if="errors.bankName" class="mt-1 text-sm text-red-600">{{ errors.bankName }}</p>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Account Number <span class="text-red-500">*</span></label>
                  <input
                    v-model="formData.accountNumber"
                    @input="$emit('reset-bank-validation-attempts')"
                    @keyup.enter="$emit('complete-signup')"
                    type="text"
                    placeholder="Enter account number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.accountNumber, 'border-green-500': bankVerified }"
                  />
                  <p v-if="errors.accountNumber" class="mt-1 text-sm text-red-600">{{ errors.accountNumber }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">IFSC Code <span class="text-red-500">*</span></label>
                  <input
                    v-model="formData.ifscCode"
                    @input="$emit('reset-bank-validation-attempts')"
                    @keyup.enter="$emit('complete-signup')"
                    type="text"
                    placeholder="Enter IFSC code"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.ifscCode, 'border-green-500': bankVerified }"
                  />
                  <p v-if="errors.ifscCode" class="mt-1 text-sm text-red-600">{{ errors.ifscCode }}</p>
                </div>
              </div>
              
              <div class="flex flex-col items-center space-y-2">
                <button
                  type="button"
                  @click="$emit('verify-bank')"
                  :disabled="bankVerifying || !formData.accountNumber || !formData.ifscCode"
                  class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  <i v-if="bankVerifying" class="fas fa-spinner fa-spin mr-2"></i>
                  <span v-if="bankVerifying">Verifying Bank Details...</span>
                  <span v-else-if="bankVerified">✓ Bank Details Verified</span>
                  <span v-else>Verify Bank Details</span>
                </button>
              </div>
              
              <div v-if="bankVerified" class="p-3 bg-green-50 border border-green-200 rounded-md">
                <div class="flex items-center">
                  <i class="fas fa-check-circle text-green-500 mr-2"></i>
                  <span class="text-green-700 text-sm font-medium">Bank account details verified successfully!</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex space-x-4">
            <button
              type="button"
              @click="$emit('prev-step')"
              class="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 font-semibold"
            >
              Back
            </button>
            <button
              type="button"
              @click="$emit('skip-kyc')"
              :disabled="loading"
              class="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ loading ? 'Processing...' : 'Skip KYC' }}
            </button>
            <button
              type="button"
              @click="$emit('complete-signup')"
              :disabled="!isStep3Valid || loading"
              class="flex-1 text-white py-3 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center"
              :style="{ 'background-color': (!isStep3Valid || loading) ? '#9CA3AF' : '#6A5ACD' }"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ loading ? 'Processing...' : 'Complete Signup' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProgressIndicator from './ProgressIndicator.vue'

interface Props {
  formData: {
    email: string
    aadhaarNumber?: string
    aadhaarOtp?: string[]
    businessType?: string
    gstNumber?: string
    branchName?: string
    gstAddress?: string
    gstPincode?: string
    entityType?: string
    entityName?: string
    panNumber?: string
    panPincode?: string
    billingAddress?: string
    beneficiaryName?: string
    bankName?: string
    accountNumber?: string
    ifscCode?: string
  }
  errors: Record<string, string>
  generalError: string
  showLoginOption: boolean
  aadhaarVerified: boolean
  showAadhaarSection: boolean
  aadhaarOtpSent: boolean
  aadhaarOtpCooldown: number
  aadhaarOtpInputs: Array<{ value: string }>
  showGstSection: boolean
  gstVerifying: boolean
  gstVerified: boolean
  showPanSection: boolean
  panVerifying: boolean
  panVerified: boolean
  showBankDetails: boolean
  banksList: Array<{ id?: string; name: string; code?: string } | string>
  banksLoading: boolean
  banksError: string
  isOtherBank: boolean
  bankVerifying: boolean
  bankVerified: boolean
  bankCounterReset: boolean
  bankAttemptsExhausted: boolean
  loading: boolean
  isStep3Valid: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'go-to-signin': []
  'toggle-aadhaar-section': []
  'validate-aadhaar': [aadhaarNumber: string]
  'send-aadhaar-otp': []
  'aadhaar-otp-input': [index: number, value: string]
  'aadhaar-otp-keydown': [index: number, event: KeyboardEvent]
  'verify-aadhaar': []
  'resend-aadhaar-otp': []
  'set-business-type': [type: string]
  'toggle-gst-section': []
  'validate-gst-number': [gstNumber: string]
  'verify-gst': []
  'toggle-pan-section': []
  'verify-pan': []
  'validate-pincode': [pincode: string, fieldType?: string]
  'toggle-bank-details': []
  'handle-bank-selection': [bank: string]
  'reset-bank-selection': []
  'fetch-banks-list': []
  'reset-bank-validation-attempts': []
  'verify-bank': []
  'complete-signup': []
  'prev-step': []
  'skip-kyc': []
}>()

const getBankKey = (bank: { id?: string; name: string; code?: string } | string, index: number): string => {
  if (typeof bank === 'string') {
    return `bank-${index}`
  }
  return bank.id || bank.name || `bank-${index}`
}

const getBankName = (bank: { id?: string; name: string; code?: string } | string): string => {
  if (typeof bank === 'string') {
    return bank
  }
  return bank.name
}

const handleBankChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  
  if (value) {
    emit('handle-bank-selection', value)
  }
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const handlePincodeInput = (event: Event, fieldType: string) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '').slice(0, 6)
  
  emit('validate-pincode', value, fieldType)
}
</script> 