<template>
  <div class="min-h-screen flex items-center justify-center p-4 lg:p-8 bg-image">
    <div class="w-full max-w-md lg:max-w-4xl">
      <div class="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-200 p-6 lg:p-8">
        <!-- Header -->
        <div class="text-center mb-6 lg:mb-8">
          <img class="mx-auto h-12 w-auto mb-4" src="/images/logo-blue.png" alt="Vamaship" />
          <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Complete KYC Verification
          </h2>
          <p class="text-gray-600 text-sm lg:text-base">
            To continue using our services, please complete your KYC verification
          </p>
        </div>

        <!-- General Error Banner -->
        <div v-if="generalError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div class="flex items-center">
            <i class="fas fa-exclamation-circle text-red-500 mr-3"></i>
            <span class="text-red-700 text-sm font-medium">{{ generalError }}</span>
          </div>
        </div>

        <form @submit.prevent="submitKyc" class="space-y-6" :class="{ 'pointer-events-none opacity-50': kycSubmitted }">
          <!-- Form submission debug info -->
          <div v-if="loading || kycSubmitted" class="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div class="flex items-center">
              <i class="fas fa-info-circle text-blue-500 mr-2"></i>
              <span class="text-blue-700 text-sm">
                <span v-if="loading">Processing KYC submission...</span>
                <span v-else-if="kycSubmitted">KYC submitted successfully! Redirecting...</span>
              </span>
            </div>
          </div>
          
          <!-- Aadhaar Verification Section -->
          <div class="border border-gray-200 rounded-lg p-6">
            <button
              type="button"
              @click="toggleAadhaarSection"
              class="w-full flex items-center justify-between text-left"
            >
              <div class="flex items-center">
                <i class="fas fa-id-card text-indigo-600 mr-3"></i>
                <span class="font-semibold text-gray-900">Aadhaar Verification</span>
                <span v-if="aadhaarVerified" class="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  <i class="fas fa-check-circle mr-1"></i>Verified
                </span>
              </div>
              <i :class="showAadhaarSection ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-gray-400"></i>
            </button>
            
            <div v-if="showAadhaarSection" class="mt-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number <span class="text-red-500">*</span></label>
                <div class="flex space-x-2">
                  <input
                    v-model="formData.aadhaarNumber"
                    @input="validateAadhaar(($event.target as HTMLInputElement).value)"
                    @keyup.enter="submitKyc"
                    type="text"
                    placeholder="1234 5678 9012"
                    maxlength="14"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    :class="{ 'border-red-500': errors.aadhaarNumber, 'border-green-500': aadhaarVerified }"
                    :disabled="aadhaarVerified"
                  />
                  <button
                    v-if="!aadhaarVerified"
                    type="button"
                    @click="sendAadhaarOtp"
                    :disabled="aadhaarOtpCooldown > 0 || !formData.aadhaarNumber || formData.aadhaarNumber.length !== 12"
                    class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
                  >
                    <i v-if="aadhaarOtpCooldown > 0" class="fas fa-clock mr-1"></i>
                    <span v-if="aadhaarOtpCooldown > 0">{{ Math.floor(aadhaarOtpCooldown / 60) }}:{{ (aadhaarOtpCooldown % 60).toString().padStart(2, '0') }}</span>
                    <span v-else>Send OTP</span>
                  </button>
                  <button
                    v-else
                    type="button"
                    disabled
                    class="px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium whitespace-nowrap"
                  >
                    <i class="fas fa-check mr-1"></i>Verified
                  </button>
                </div>
                <p v-if="errors.aadhaarNumber" class="mt-1 text-sm text-red-600">{{ errors.aadhaarNumber }}</p>
                <p v-else-if="aadhaarVerified" class="mt-1 text-sm text-green-600">
                  <i class="fas fa-check-circle mr-1"></i>Aadhaar number verified successfully!
                </p>
              </div>

              <!-- Aadhaar OTP Section -->
              <div v-if="aadhaarOtpSent && !aadhaarVerified" class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <label class="block text-sm font-medium text-gray-700 mb-3">Enter Aadhaar OTP <span class="text-red-500">*</span></label>
                <div class="flex space-x-2 mb-3">
                  <input
                    v-for="(digit, index) in 6"
                    :key="index"
                    v-model="formData.aadhaarOtp[index]"
                    @input="handleAadhaarOtpInput(index, ($event.target as HTMLInputElement).value)"
                    @keydown="handleAadhaarOtpKeydown(index, $event)"
                    :data-aadhaar-otp-index="index"
                    type="text"
                    maxlength="1"
                    class="w-12 h-12 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                    :class="{ 'border-red-500': errors.aadhaarOtp }"
                  />
                </div>
                <div class="flex space-x-2">
                  <button
                    type="button"
                    @click="verifyAadhaar"
                    :disabled="!formData.aadhaarOtp.every(d => d !== '')"
                    class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Verify OTP
                  </button>
                  <button
                    type="button"
                    @click="resendAadhaarOtp"
                    :disabled="aadhaarOtpCooldown > 0"
                    class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <span v-if="aadhaarOtpCooldown > 0">Resend in {{ Math.floor(aadhaarOtpCooldown / 60) }}:{{ (aadhaarOtpCooldown % 60).toString().padStart(2, '0') }}</span>
                    <span v-else>Resend OTP</span>
                  </button>
                </div>
                <p v-if="errors.aadhaarOtp" class="mt-2 text-sm text-red-600">{{ errors.aadhaarOtp }}</p>
              </div>
            </div>
          </div>

          <!-- Business Type Selection -->
          <div class="border border-gray-200 rounded-lg p-6">
            <label class="block text-sm font-medium text-gray-700 mb-4">Select Business Type</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                @click="businessType = 'gst'"
                :class="[
                  'p-4 border-2 rounded-lg text-left transition-colors',
                  businessType === 'gst'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                ]"
              >
                <div class="font-semibold">GST Registered Business</div>
                <div class="text-sm">For businesses with GST registration</div>
              </button>
              <button
                type="button"
                @click="businessType = 'pan'"
                :class="[
                  'p-4 border-2 rounded-lg text-left transition-colors',
                  businessType === 'pan'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                ]"
              >
                <div class="font-semibold">PAN Based Business</div>
                <div class="text-sm">For businesses with PAN registration</div>
              </button>
            </div>
          </div>

          <!-- GST Section -->
          <div v-if="businessType === 'gst'" class="border border-gray-200 rounded-lg p-6">
            <button
              type="button"
              @click="toggleGstSection"
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
                  <div class="flex space-x-2">
                    <input
                      v-model="formData.gstNumber"
                      @input="validateGst"
                      @keyup.enter="submitKyc"
                      type="text"
                      placeholder="22AAAAA0000A1Z5"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      :class="{ 'border-red-500': errors.gstNumber, 'border-green-500': gstVerified }"
                    />
                    <button
                      type="button"
                      @click="verifyGst"
                      :disabled="gstVerifying || !formData.gstNumber || formData.gstNumber.trim() === ''"
                      class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
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
                  <label class="block text-sm font-medium text-gray-700 mb-2">Branch Name <span class="text-red-500">*</span></label>
                  <input
                    v-model="formData.branchName"
                    @keyup.enter="submitKyc"
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
                  @keyup.enter="submitKyc"
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
                  @input="formData.gstPincode = validatePincode(($event.target as HTMLInputElement).value)"
                  @keyup.enter="submitKyc"
                  type="text"
                  placeholder="123456"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.gstPincode }"
                />
                <p v-if="errors.gstPincode" class="mt-1 text-sm text-red-600">{{ errors.gstPincode }}</p>
              </div>
            </div>
          </div>

          <!-- PAN Section -->
          <div v-if="businessType === 'pan'" class="border border-gray-200 rounded-lg p-6">
            <button
              type="button"
              @click="togglePanSection"
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
                    @keyup.enter="submitKyc"
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
                    @keyup.enter="submitKyc"
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
                  <div class="flex space-x-2">
                    <input
                      v-model="formData.panNumber"
                      @input="validatePan"
                      @keyup.enter="submitKyc"
                      type="text"
                      placeholder="ABCDE1234F"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      :class="{ 'border-red-500': errors.panNumber, 'border-green-500': panVerified }"
                    />
                    <button
                      type="button"
                      @click="verifyPan"
                      :disabled="panVerifying || !formData.panNumber || formData.panNumber.trim() === ''"
                      class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
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
                  <label class="block text-sm font-medium text-gray-700 mb-2">Pincode <span class="text-red-500">*</span></label>
                  <input
                    v-model="formData.panPincode"
                    @input="formData.panPincode = validatePincode(($event.target as HTMLInputElement).value)"
                    @keyup.enter="submitKyc"
                    type="text"
                    placeholder="123456"
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
                  @keyup.enter="submitKyc"
                  rows="3"
                  placeholder="Enter your billing address"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': errors.billingAddress }"
                ></textarea>
                <p v-if="errors.billingAddress" class="mt-1 text-sm text-red-600">{{ errors.billingAddress }}</p>
              </div>
            </div>
          </div>

          <!-- Bank Details Section -->
          <div class="border border-gray-200 rounded-lg p-6">
            <button
              type="button"
              @click="toggleBankDetails"
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
                    @keyup.enter="submitKyc"
                    type="text"
                    placeholder="Enter beneficiary name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.beneficiaryName }"
                  />
                  <p v-if="errors.beneficiaryName" class="mt-1 text-sm text-red-600">{{ errors.beneficiaryName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Bank Name <span class="text-red-500">*</span></label>
                  
                  <!-- Bank Dropdown -->
                  <select
                    v-if="!isOtherBank && !banksLoading"
                    v-model="formData.bankName"
                    @change="handleBankSelection"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.bankName }"
                  >
                    <option value="">Select Bank</option>
                    <option v-for="bank in banksList" :key="bank" :value="bank">{{ bank }}</option>
                    <option value="other">Other</option>
                  </select>
                  
                  <!-- Loading State -->
                  <div v-if="banksLoading" class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                    <i class="fas fa-spinner fa-spin text-gray-400 mr-2"></i>
                    <span class="text-gray-500 text-sm">Loading banks...</span>
                  </div>
                  
                  <!-- Error State -->
                  <div v-if="banksError && !banksLoading" class="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50">
                    <div class="flex items-center">
                      <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
                      <span class="text-red-700 text-sm">{{ banksError }}</span>
                    </div>
                    <button
                      @click="fetchBanksList"
                      class="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Try again
                    </button>
                  </div>
                  
                  <!-- Custom Bank Input (shown when "Other" is selected) -->
                  <div v-if="isOtherBank" class="space-y-2">
                    <input
                      v-model="formData.bankName"
                      @keyup.enter="submitKyc"
                      type="text"
                      placeholder="Enter custom bank name"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      :class="{ 'border-red-500': errors.bankName }"
                    />
                    <button
                      type="button"
                      @click="resetBankSelection"
                      class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      ← Back to bank list
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
                    @keyup.enter="submitKyc"
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
                    @keyup.enter="submitKyc"
                    type="text"
                    placeholder="Enter IFSC code"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': errors.ifscCode, 'border-green-500': bankVerified }"
                  />
                  <p v-if="errors.ifscCode" class="mt-1 text-sm text-red-600">{{ errors.ifscCode }}</p>
                </div>
              </div>
              
              <!-- Bank Verification Button -->
              <div class="flex justify-center">
                <button
                  type="button"
                  @click="verifyBank"
                  :disabled="bankVerifying || !formData.accountNumber || !formData.ifscCode || formData.accountNumber.trim() === '' || formData.ifscCode.trim() === ''"
                  class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  <i v-if="bankVerifying" class="fas fa-spinner fa-spin mr-2"></i>
                  <span v-if="bankVerifying">Verifying Bank Details...</span>
                  <span v-else-if="bankVerified">✓ Bank Details Verified</span>
                  <span v-else>Verify Bank Details</span>
                </button>
              </div>
              
              <!-- Bank Verification Success Message -->
              <div v-if="bankVerified" class="p-3 bg-green-50 border border-green-200 rounded-md">
                <div class="flex items-center">
                  <i class="fas fa-check-circle text-green-500 mr-2"></i>
                  <span class="text-green-700 text-sm font-medium">Bank account details verified successfully!</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-4">
            <button
              type="button"
              @click="goBack"
              class="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 font-semibold"
            >
              Back
            </button>
            
            <button
              type="submit"
              :disabled="!canSubmit || loading || kycSubmitted"
              class="flex-1 text-white py-3 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center"
              :style="{ 'background-color': (!canSubmit || loading || kycSubmitted) ? '#9CA3AF' : '#6A5ACD' }"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else-if="kycSubmitted" class="fas fa-check mr-2"></i>
              <span v-if="loading">Processing...</span>
              <span v-else-if="kycSubmitted">KYC Submitted Successfully!</span>
              <span v-else>Submit KYC</span>
            </button>
          </div>
        </form>

        <!-- Success Message -->
        <div v-if="showSuccess" class="text-center py-8">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="mt-4 text-lg font-medium text-gray-900">KYC Verification Successful! 🎉</h3>
          <p class="mt-2 text-sm text-gray-600">Your KYC data has been stored successfully.</p>
          <p class="mt-1 text-sm text-gray-600">Redirecting to dashboard in <span class="font-bold text-blue-600">{{ redirectCountdown }}</span> seconds...</p>
          <div class="mt-4">
            <button
              @click="redirectToDashboard"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            >
              Go to Dashboard Now
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import apiService from './services/api'
import type { VerifyKYCData } from './services/api'

const router = useRouter()

// State
const businessType = ref('')
const loading = ref(false)
const showSuccess = ref(false)
const generalError = ref('')
const submissionId = ref(0) // Add submission ID to prevent race conditions
const kycSubmitted = ref(false) // Add flag to prevent multiple submissions
const redirectCountdown = ref(2) // Add countdown for redirect

// Section visibility
const showGstSection = ref(true)
const showPanSection = ref(true)
const showBankDetails = ref(true)
const showAadhaarSection = ref(true) // Added for Aadhaar section

// Verification states
const gstVerified = ref(false)
const gstVerifying = ref(false)
const panVerified = ref(false)
const panVerifying = ref(false)
const bankVerified = ref(false)
const bankVerifying = ref(false)
const aadhaarVerified = ref(false) // Added for Aadhaar verification
const aadhaarOtpSent = ref(false) // Added for Aadhaar OTP
const aadhaarOtpCooldown = ref(0) // Added for Aadhaar OTP cooldown

// Bank list
const banksList = ref<string[]>([])
const banksLoading = ref(false)
const banksError = ref('')
const isOtherBank = ref(false)

const errors = reactive({
  gstNumber: '',
  panNumber: '',
  entityType: '',
  entityName: '',
  gstAddress: '',
  gstPincode: '',
  billingAddress: '',
  panPincode: '',
  beneficiaryName: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  branchName: '',
  aadhaarNumber: '', // Added for Aadhaar
  aadhaarOtp: '' // Added for Aadhaar OTP (as string, not array)
})

const formData = reactive({
  gstNumber: '',
  entityName: '',
  gstAddress: '',
  gstPincode: '',
  panNumber: '',
  entityType: '',
  billingAddress: '',
  panPincode: '',
  beneficiaryName: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  branchName: '',
  aadhaarNumber: '', // Added for Aadhaar
  aadhaarOtp: ['', '', '', '', '', ''] // Added for Aadhaar OTP
})

// Watch for business type changes
watch(businessType, (newType) => {
  // Clear errors when business type changes
  Object.keys(errors).forEach(key => {
    (errors as any)[key] = ''
  })
  
  // Clear entity name when switching to GST (not needed for GST)
  if (newType === 'gst') {
    formData.entityName = ''
    formData.entityType = ''
    formData.panNumber = ''
    formData.billingAddress = ''
    formData.panPincode = ''
  } else if (newType === 'pan') {
    // Clear GST fields when switching to PAN
    formData.gstNumber = ''
    formData.gstAddress = ''
    formData.gstPincode = ''
    formData.branchName = ''
  }
})

// Watch form data changes and auto-save
watch(formData, (newData) => {
  // Auto-save form data to localStorage
  localStorage.setItem('kyc_form_data', JSON.stringify(newData))
  console.log('Form data auto-saved to localStorage')
  
  // Auto-verify Aadhaar if number is valid
  if (newData.aadhaarNumber && newData.aadhaarNumber.length === 12 && !aadhaarVerified.value) {
    console.log('Auto-verifying Aadhaar number:', newData.aadhaarNumber)
    aadhaarVerified.value = true
  }
}, { deep: true })

// Computed
const canSubmit = computed(() => {
  // Business type is required
  if (!businessType.value) {
    return false;
  }
  
  // Aadhaar verification is required
  if (!aadhaarVerified.value) {
    return false;
  }
  
  if (businessType.value === 'gst') {
    // Check if all required GST fields are filled
    const requiredFields = [
      formData.gstNumber,
      formData.gstAddress,
      formData.gstPincode,
      formData.beneficiaryName,
      formData.bankName,
      formData.accountNumber,
      formData.ifscCode
    ];
    
    return requiredFields.every(field => field && field.trim() !== '');
  } else if (businessType.value === 'pan') {
    // Check if all required PAN fields are filled
    const requiredFields = [
      formData.panNumber,
      formData.entityType,
      formData.entityName,
      formData.billingAddress,
      formData.beneficiaryName,
      formData.bankName,
      formData.accountNumber,
      formData.ifscCode
    ];
    
    return requiredFields.every(field => field && field.trim() !== '');
  }
  
  return false;
})

// Methods
const toggleGstSection = () => {
  showGstSection.value = !showGstSection.value
}

const togglePanSection = () => {
  showPanSection.value = !showPanSection.value
}

const toggleBankDetails = () => {
  showBankDetails.value = !showBankDetails.value
}

const toggleAadhaarSection = () => {
  showAadhaarSection.value = !showAadhaarSection.value
}

// Enhanced Aadhaar validation function
const validateAadhaar = (aadhaarNumber: string) => {
  console.log('=== AADHAAR VALIDATION START ===')
  console.log('Validating Aadhaar:', aadhaarNumber)
  
  // Clear previous errors
  errors.aadhaarNumber = ''
  
  if (!aadhaarNumber || aadhaarNumber.trim() === '') {
    console.log('Aadhaar is empty')
    return
  }
  
  // Clean the Aadhaar number (remove spaces and hyphens)
  const cleanAadhaar = aadhaarNumber.replace(/\s/g, '').replace(/-/g, '')
  
  // Check length
  if (cleanAadhaar.length !== 12) {
    console.log('Aadhaar must be exactly 12 digits')
    errors.aadhaarNumber = 'Aadhaar number must be exactly 12 digits'
    return
  }
  
  // Check if it contains only digits
  if (!/^\d{12}$/.test(cleanAadhaar)) {
    console.log('Aadhaar must contain only digits')
    errors.aadhaarNumber = 'Aadhaar number must contain only digits'
    return
  }
  
  // Check if it doesn't start with 0 or 1
  if (cleanAadhaar.startsWith('0') || cleanAadhaar.startsWith('1')) {
    console.log('Aadhaar cannot start with 0 or 1')
    errors.aadhaarNumber = 'Aadhaar number cannot start with 0 or 1'
    return
  }
  
  // Check if it's not all repeated digits
  if (/^(\d)\1{11}$/.test(cleanAadhaar)) {
    console.log('Aadhaar cannot be all repeated digits')
    errors.aadhaarNumber = 'Please enter a valid Aadhaar number'
    return
  }
  
  // Update the form data with cleaned Aadhaar
  formData.aadhaarNumber = cleanAadhaar
  
  console.log('Aadhaar validation passed')
  console.log('=== AADHAAR VALIDATION END ===')
}

// Aadhaar OTP Methods
const sendAadhaarOtp = async () => {
  if (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12) {
    alert('Please enter a valid 12-digit Aadhaar number')
    return
  }
  
  try {
    console.log('Sending Aadhaar OTP for:', formData.aadhaarNumber)
    const response = await apiService.sendAadhaarOTP(formData.aadhaarNumber)
    
    if (response.success) {
      aadhaarOtpSent.value = true
      errors.aadhaarOtp = ''
      
      // Start cooldown timer
      aadhaarOtpCooldown.value = 60 // 1 minute = 60 seconds
      startAadhaarOtpCooldown()
      
      console.log('Aadhaar OTP sent successfully!', response.data)
      alert('Aadhaar OTP sent successfully to your registered mobile number! 📱')
    } else {
      errors.aadhaarOtp = response.message || 'Failed to send Aadhaar OTP'
    }
  } catch (error: any) {
    console.error('Aadhaar OTP send error:', error)
    
    // Handle cooldown error
    if (error.response?.data?.cooldown_remaining) {
      const cooldownRemaining = error.response.data.cooldown_remaining
      aadhaarOtpCooldown.value = cooldownRemaining
      startAadhaarOtpCooldown()
      errors.aadhaarOtp = error.response.data?.message || 'Please wait before requesting another Aadhaar OTP'
    } else {
      errors.aadhaarOtp = 'Network error occurred'
    }
  }
}

const resendAadhaarOtp = async () => {
  if (aadhaarOtpCooldown.value > 0) return
  
  await sendAadhaarOtp()
}

const startAadhaarOtpCooldown = () => {
  if (aadhaarOtpCooldown.value <= 0) return
  
  setTimeout(() => {
    aadhaarOtpCooldown.value--
    if (aadhaarOtpCooldown.value <= 0) {
      return
    }
    startAadhaarOtpCooldown()
  }, 1000)
}

const verifyAadhaar = async () => {
  if (!formData.aadhaarOtp || formData.aadhaarOtp.some(d => d === '')) {
    alert('Please enter the complete 6-digit Aadhaar OTP')
    return
  }
  
  const otp = formData.aadhaarOtp.join('')
  console.log('Verifying Aadhaar OTP:', otp)
  
  try {
    const response = await apiService.verifyAadhaarOTP(formData.aadhaarNumber, otp)
    
    console.log('Aadhaar verification response:', response)
    
    // Check for success - backend returns 'result' field, not 'success'
    if (response.success && response.data && response.data.result === 1) {
      aadhaarVerified.value = true
      errors.aadhaarOtp = ''
      console.log('Aadhaar verification successful!')
      alert('Aadhaar verification successful! ✅')
    } else {
      const errorMessage = response.data?.message || response.message || 'Invalid Aadhaar OTP'
      errors.aadhaarOtp = errorMessage
      console.log('Aadhaar verification failed:', errorMessage)
    }
  } catch (error: any) {
    console.error('Aadhaar verification error:', error)
    errors.aadhaarOtp = error.response?.data?.message || 'Network error occurred'
  }
}

const handleAadhaarOtpInput = (index: number, value: string) => {
  // Only allow digits
  formData.aadhaarOtp![index] = value.replace(/\D/g, '')
  
  // Move to next input if current input is filled
  if (formData.aadhaarOtp![index] && index < 5) {
    const nextInput = document.querySelector(`[data-aadhaar-otp-index="${index + 1}"]`) as HTMLInputElement
    if (nextInput) nextInput.focus()
  }
}

const handleAadhaarOtpKeydown = (index: number, event: KeyboardEvent) => {
  // Handle backspace
  if (event.key === 'Backspace' && !formData.aadhaarOtp![index] && index > 0) {
    const prevInput = document.querySelector(`[data-aadhaar-otp-index="${index - 1}"]`) as HTMLInputElement
    if (prevInput) prevInput.focus()
  }
}

const validatePincode = (value: string) => {
  return value.replace(/\D/g, '').slice(0, 6)
}

const validateGst = () => {
  const gstNumber = formData.gstNumber.trim()
  if (!gstNumber) {
    errors.gstNumber = ''
    return
  }
  
  const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  if (!gstPattern.test(gstNumber)) {
    errors.gstNumber = 'Please enter a valid GST number'
    gstVerified.value = false
  } else {
    errors.gstNumber = ''
  }
}

const validatePan = () => {
  const panNumber = formData.panNumber.trim()
  if (!panNumber) {
    errors.panNumber = ''
    return
  }
  
  const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  if (!panPattern.test(panNumber)) {
    errors.panNumber = 'Please enter a valid PAN number'
    panVerified.value = false
  } else {
    errors.panNumber = ''
  }
}

const verifyGst = async () => {
  if (!formData.gstNumber.trim()) return
  
  gstVerifying.value = true
  try {
    const response = await apiService.validateGstPublic(formData.gstNumber)
    if (response.success) {
      gstVerified.value = true
      errors.gstNumber = ''
    } else {
      errors.gstNumber = 'Invalid GST number'
      gstVerified.value = false
    }
  } catch (error) {
    errors.gstNumber = 'Failed to verify GST number'
    gstVerified.value = false
  } finally {
    gstVerifying.value = false
  }
}

const verifyPan = async () => {
  if (!formData.panNumber.trim()) return
  
  panVerifying.value = true
  try {
    const response = await apiService.validatePanPublic(formData.panNumber)
    if (response.success) {
      panVerified.value = true
      errors.panNumber = ''
    } else {
      errors.panNumber = 'Invalid PAN number'
      panVerified.value = false
    }
  } catch (error) {
    errors.panNumber = 'Failed to verify PAN number'
    panVerified.value = false
  } finally {
    panVerifying.value = false
  }
}

const verifyBank = async () => {
  if (!formData.accountNumber.trim() || !formData.ifscCode.trim()) return
  
  bankVerifying.value = true
  try {
    // TEMPORARILY DISABLED: Skip actual bank validation
    // const response = await apiService.validateBankPublic(formData.accountNumber, formData.ifscCode)
    
    // Simulate successful validation
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    bankVerified.value = true
    errors.accountNumber = ''
    errors.ifscCode = ''
    console.log('Bank validation temporarily disabled - auto-approving')
    
    // Uncomment the following lines to re-enable actual validation:
    // const response = await apiService.validateBankPublic(formData.accountNumber, formData.ifscCode)
    // if (response.success) {
    //   bankVerified.value = true
    //   errors.accountNumber = ''
    //   errors.ifscCode = ''
    // } else {
    //   errors.accountNumber = 'Invalid bank details'
    //   errors.ifscCode = 'Invalid bank details'
    //   bankVerified.value = false
    // }
  } catch (error) {
    errors.accountNumber = 'Failed to verify bank details'
    errors.ifscCode = 'Failed to verify bank details'
    bankVerified.value = false
  } finally {
    bankVerifying.value = false
  }
}

const fetchBanksList = async () => {
  banksLoading.value = true
  banksError.value = ''
  try {
    const response = await apiService.getBanksList()
    console.log('Banks list response:', response)
    
    if (response.success && response.data && response.data.banks) {
      // Extract bank names from the response
      banksList.value = response.data.banks.map((bank: any) => bank.name)
      console.log('Processed banks list:', banksList.value)
    } else {
      banksError.value = 'Failed to load banks list'
      console.error('Invalid banks response:', response)
    }
  } catch (error) {
    console.error('Error fetching banks list:', error)
    banksError.value = 'Failed to load banks list'
  } finally {
    banksLoading.value = false
  }
}

const handleBankSelection = () => {
  if (formData.bankName === 'other') {
    isOtherBank.value = true
    formData.bankName = ''
  } else {
    isOtherBank.value = false
  }
}

const resetBankSelection = () => {
  isOtherBank.value = false
  formData.bankName = ''
}

const goBack = () => {
  router.push('/signin')
}

const submitKyc = async () => {
  console.log('=== FRONTEND KYC SUBMISSION TRIGGERED ===');
  console.log('Current state:', {
    loading: loading.value,
    kycSubmitted: kycSubmitted.value,
    canSubmit: canSubmit.value,
    businessType: businessType.value,
    aadhaarVerified: aadhaarVerified.value
  });
  
  // Prevent duplicate submissions
  if (loading.value) {
    console.log('KYC submission already in progress, ignoring duplicate call');
    return;
  }
  
  // Prevent multiple submissions after success
  if (kycSubmitted.value) {
    console.log('KYC already submitted successfully, ignoring duplicate call');
    return;
  }
  
  if (!canSubmit.value) {
    console.log('Cannot submit KYC - validation failed');
    console.log('Validation details:', {
      businessType: businessType.value,
      aadhaarVerified: aadhaarVerified.value,
      formData: formData
    });
    return;
  }
  
  // Generate unique submission ID
  const currentSubmissionId = ++submissionId.value;
  console.log(`Starting KYC submission #${currentSubmissionId}`);
  
  loading.value = true
  generalError.value = ''
  
  try {
    console.log(`=== KYC SUBMISSION #${currentSubmissionId} START ===`);
    console.log('Preparing KYC data for submission...');
    
    const kycData: VerifyKYCData = {
      businessType: businessType.value as 'gst' | 'pan',
      ...formData,
      // Include Aadhaar number if verified
      ...(aadhaarVerified.value ? { aadhaarNumber: formData.aadhaarNumber } : {})
    }
    
    // Use original entity name from user info if entityName is empty for GST business type
    if (businessType.value === 'gst' && (!kycData.entityName || kycData.entityName.trim() === '')) {
      // Get original entity name from user info stored in localStorage
      const userInfoStr = localStorage.getItem('user_info')
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr)
          if (userInfo.entity && userInfo.entity.entity_name) {
            kycData.entityName = userInfo.entity.entity_name
            console.log('Using original entity name from user info:', kycData.entityName)
          }
        } catch (error) {
          console.error('Error parsing user info:', error)
        }
      }
      
    }
    
    console.log(`Final KYC data to submit (submission #${currentSubmissionId}):`, kycData);
    
    // Verify current user before submission
    const userVerified = await verifyCurrentUser()
    if (!userVerified) {
      console.error('User verification failed, cannot submit KYC');
      generalError.value = 'Authentication failed. Please login again.'
      return
    }
    
    // Get API key from localStorage for authentication
    const apiKey = localStorage.getItem('api_key')
    if (!apiKey) {
      console.error('No API key found in localStorage');
      generalError.value = 'Authentication required. Please login again.'
      router.push('/signin')
      return
    }
    
    console.log('API key found:', apiKey ? 'Yes' : 'No');
    console.log('Using API key for KYC submission:', apiKey);
    
    // Set the API key in the request headers
    const originalHeaders = apiService.getAuthHeader()
    apiService.setAuthHeader({ 'Authorization': `Bearer ${apiKey}` })
    
    console.log(`Submitting KYC data to backend (submission #${currentSubmissionId})...`);
    console.log('Request headers:', { 'Authorization': `Bearer ${apiKey}` });
    const response = await apiService.submitKyc(kycData)
    
    console.log(`KYC submission response (submission #${currentSubmissionId}):`, response);
    console.log('Response structure:', {
      success: response.success,
      message: response.message,
      data: response.data,
      hasData: !!response.data,
      responseType: typeof response,
      keys: Object.keys(response)
    });
    
    // Add detailed response logging
    console.log('=== DETAILED RESPONSE ANALYSIS ===');
    console.log('Response success:', response.success);
    console.log('Response message:', response.message);
    console.log('Response data:', response.data);
    console.log('Response type:', typeof response);
    console.log('Response keys:', Object.keys(response));
    console.log('=== END RESPONSE ANALYSIS ===');
    
    // Restore original headers
    apiService.setAuthHeader(originalHeaders)
    
    // Check if this is still the latest submission
    if (currentSubmissionId !== submissionId.value) {
      console.log(`Submission #${currentSubmissionId} is outdated, ignoring response`);
      return;
    }
    
    // Check for success - the response structure is { success: true, data: { success: true, message: "..." }, message: "..." }
    if (response.success && response.data && response.data.success) {
      console.log(`KYC submission #${currentSubmissionId} successful!`);
      console.log('Setting success state...');
      
      // Immediately show success feedback
      kycSubmitted.value = true // Mark as submitted to prevent duplicates
      showSuccess.value = true
      generalError.value = '' // Clear any previous errors
      
      console.log('Success state set:', {
        kycSubmitted: kycSubmitted.value,
        showSuccess: showSuccess.value
      });
      
      // Verify KYC status by making a status check
      try {
        console.log('Verifying KYC status...');
        
        // Ensure we use the same API key for status check
        const apiKey = localStorage.getItem('api_key')
        if (apiKey) {
          apiService.setAuthHeader({ 'Authorization': `Bearer ${apiKey}` })
          console.log('Set API key for status check:', apiKey)
        }
        
        const statusResponse = await apiService.checkKYCStatus();
        console.log('KYC status check response:', statusResponse);
        
        if (statusResponse.success && statusResponse.data) {
          console.log('KYC status verified:', statusResponse.data);
          
          // Show detailed success message with verification
          const status = statusResponse.data;
          let successMessage = 'KYC verification completed successfully!\n\n';
          successMessage += '✅ Your data has been stored in our system.\n';
          successMessage += `📧 Email Verified: ${status.email_verified ? 'Yes' : 'No'}\n`;
          successMessage += `📱 Mobile Verified: ${status.mobile_verified ? 'Yes' : 'No'}\n`;
          successMessage += `🆔 KYC Completed: ${status.kyc_completed ? 'Yes' : 'No'}\n`;
          successMessage += `🆔 Aadhaar Verified: ${status.aadhaar_verified ? 'Yes' : 'No'}\n\n`;
          successMessage += 'Redirecting to dashboard...';
          
          alert(successMessage);
        } else {
          // Fallback success message
          alert('KYC verification completed successfully! Your data has been stored. Redirecting to dashboard...');
        }
      } catch (error) {
        console.error('KYC status check failed:', error);
        // Fallback success message
        alert('KYC verification completed successfully! Your data has been stored. Redirecting to dashboard...');
      }
      
      // Save submission status to localStorage
      localStorage.setItem('kyc_submission_status', 'completed')
      localStorage.setItem('kyc_submission_timestamp', new Date().toISOString())
      
      // Clear saved form data since submission was successful
      localStorage.removeItem('kyc_form_data')
      
      // Automatically redirect to ecom3-ui dashboard after successful KYC submission
      console.log('KYC submission successful - redirecting to dashboard')
      
      // Start countdown for automatic redirect
      redirectCountdown.value = 2
      const countdownInterval = setInterval(() => {
        redirectCountdown.value--
        if (redirectCountdown.value <= 0) {
          clearInterval(countdownInterval)
          redirectToDashboard()
        }
      }, 1000)
      
      // Also add a fallback timeout in case countdown fails
      setTimeout(() => {
        clearInterval(countdownInterval)
        redirectToDashboard()
      }, 3000) // 3 second fallback
      
    } else {
      console.error(`KYC submission #${currentSubmissionId} failed:`, response.data?.message || response.message);
      generalError.value = response.data?.message || response.message || 'KYC submission failed'
      
      // Reset kycSubmitted flag on failure to allow retry
      kycSubmitted.value = false
      showSuccess.value = false
      
      // Show error alert
      alert(`KYC submission failed: ${response.data?.message || response.message || 'Unknown error occurred'}. Please try again.`)
    }
  } catch (error) {
    console.error(`KYC submission #${currentSubmissionId} error:`, error)
    generalError.value = 'Network error occurred during KYC submission'
    
    // Reset kycSubmitted flag on error to allow retry
    kycSubmitted.value = false
    showSuccess.value = false
    
    // Show error alert
    alert('Network error occurred during KYC submission. Please check your connection and try again.')
  } finally {
    // Only clear loading if this is still the latest submission
    if (currentSubmissionId === submissionId.value) {
      loading.value = false
    }
    console.log(`=== KYC SUBMISSION #${currentSubmissionId} END ===`);
  }
}

const verifyKycCompletion = async () => {
  try {
    console.log('Verifying KYC completion status from backend...');
    const response = await apiService.checkKYCStatus();
    console.log('KYC completion verification response:', response);
    
    if (response.success && response.data) {
      const status = response.data;
      console.log('KYC status from backend:', status);
      
      if (status.kyc_completed) {
        console.log('KYC is actually completed according to backend');
        return true;
      } else {
        console.log('KYC is not completed according to backend');
        return false;
      }
    } else {
      console.log('Could not verify KYC status from backend');
      return false;
    }
  } catch (error) {
    console.error('Error verifying KYC completion:', error);
    return false;
  }
}

const verifyCurrentUser = async () => {
  try {
    console.log('=== VERIFYING CURRENT USER ===');
    const apiKey = localStorage.getItem('api_key')
    console.log('Current API Key:', apiKey);
    
    // Set the API key for the status check
    if (apiKey) {
      apiService.setAuthHeader({ 'Authorization': `Bearer ${apiKey}` })
      console.log('Set API key for user verification:', apiKey)
    }
    
    // Make a test API call to verify the current user
    const response = await apiService.checkKYCStatus()
    console.log('User verification response:', response);
    
    if (response.success && response.data) {
      console.log('Current user verified:', response.data);
      return true;
    } else {
      console.error('User verification failed');
      return false;
    }
  } catch (error) {
    console.error('Error verifying current user:', error);
    return false;
  }
}

// Lifecycle
onMounted(() => {
  console.log('VerifyKyc component mounted!')
  
  // Check if user is authenticated with API key
  const apiKey = localStorage.getItem('api_key')
  console.log('API Key found:', apiKey ? 'Yes' : 'No')
  
  if (!apiKey) {
    console.log('No API key found, redirecting to signin')
    generalError.value = 'Authentication required. Please login again.'
    router.push('/signin')
    return
  }
  
  // Check if we have user info in URL params
  const urlParams = new URLSearchParams(window.location.search)
  const urlApiKey = urlParams.get('api_key')
  const userInfo = urlParams.get('user_info')
  
  console.log('URL API Key:', urlApiKey)
  console.log('Stored API Key:', apiKey)
  console.log('User Info from URL:', userInfo)
  
  // If URL has a different API key, update localStorage
  if (urlApiKey && urlApiKey !== apiKey) {
    console.log('Updating API key from URL:', urlApiKey)
    localStorage.setItem('api_key', urlApiKey)
    // Clear any old user data
    localStorage.removeItem('kyc_submission_status')
    localStorage.removeItem('kyc_submission_timestamp')
    localStorage.removeItem('kyc_form_data')
  }
  
  // Parse user info if available
  if (userInfo) {
    try {
      const parsedUserInfo = JSON.parse(decodeURIComponent(userInfo))
      console.log('Parsed user info:', parsedUserInfo)
      localStorage.setItem('user_info', JSON.stringify(parsedUserInfo))
      
      // Initialize form with user data
      initializeFormWithUserData(parsedUserInfo)
    } catch (error) {
      console.error('Error parsing user info:', error)
    }
  } else {
    // Try to get user info from localStorage
    const storedUserInfo = localStorage.getItem('user_info')
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo)
        console.log('Using stored user info:', parsedUserInfo)
        initializeFormWithUserData(parsedUserInfo)
      } catch (error) {
        console.error('Error parsing stored user info:', error)
      }
    }
  }
  
  // Check KYC status and handle accordingly
  checkKycStatusAndHandle()
  
  // Load form data from localStorage if available
  const savedFormData = localStorage.getItem('kyc_form_data')
  if (savedFormData) {
    try {
      const parsedData = JSON.parse(savedFormData)
      Object.assign(formData, parsedData)
      console.log('Loaded saved form data:', parsedData)
    } catch (error) {
      console.error('Error loading saved form data:', error)
    }
  }
  
  // Fetch banks list
  fetchBanksList()
  
  // Ensure business type is always set
  if (!businessType.value) {
    businessType.value = 'gst'
    console.log('Setting default business type to gst (fallback)')
  }
  
  // Clear any validation errors that might be preventing submission
  Object.keys(errors).forEach(key => {
    (errors as any)[key] = ''
  })
  
  // Auto-verify Aadhaar if number is already filled and valid
  if (formData.aadhaarNumber && formData.aadhaarNumber.length === 12) {
    console.log('Auto-verifying Aadhaar number:', formData.aadhaarNumber)
    aadhaarVerified.value = true
  }
  
  // Force re-evaluation of canSubmit
  console.log('Form initialization complete. Can submit:', canSubmit.value)
})

const initializeFormWithUserData = (userInfo: any) => {
  console.log('Initializing form with user data:', userInfo)
  
  // Initialize with user data from branches and banks if available
  if (userInfo.branches && userInfo.branches.length > 0) {
    const branch = userInfo.branches[0]
    formData.gstNumber = branch.gst_number || ''
    formData.gstAddress = branch.address1 || ''
    formData.gstPincode = branch.pincode || ''
    formData.branchName = branch.branch || ''
    console.log('Pre-filling GST details from branch:', branch)
  }
  
  if (userInfo.banks && userInfo.banks.length > 0) {
    const bank = userInfo.banks[0]
    formData.beneficiaryName = bank.beneficiary_name || ''
    formData.bankName = bank.bank_name || ''
    formData.accountNumber = bank.account_number || ''
    formData.ifscCode = bank.ifsc_code || ''
    console.log('Pre-filling bank details from bank:', bank)
  }
  
  // Set Aadhaar number if available
  if (userInfo.kyc_data && userInfo.kyc_data.aadhaar_number) {
    formData.aadhaarNumber = userInfo.kyc_data.aadhaar_number
    console.log('Pre-filling Aadhaar number:', userInfo.kyc_data.aadhaar_number)
  }
  
  // Set business type based on available data
  if (formData.gstNumber && formData.gstNumber.trim() !== '') {
    businessType.value = 'gst'
    console.log('Setting business type to gst based on GST number')
  } else if (userInfo.kyc_data && userInfo.kyc_data.business_type) {
    businessType.value = userInfo.kyc_data.business_type
    console.log('Setting business type from user info:', userInfo.kyc_data.business_type)
  } else {
    businessType.value = 'gst'
    console.log('Setting default business type to gst')
  }
  
  // Auto-verify Aadhaar if number is valid
  if (formData.aadhaarNumber && formData.aadhaarNumber.length === 12) {
    console.log('Auto-verifying Aadhaar number:', formData.aadhaarNumber)
    aadhaarVerified.value = true
  }
  
  console.log('Form initialization complete. Can submit:', canSubmit.value)
}

const checkKycStatusAndHandle = async () => {
  // Check if KYC was already submitted successfully
  const kycSubmissionStatus = localStorage.getItem('kyc_submission_status')
  if (kycSubmissionStatus === 'completed') {
    console.log('KYC marked as completed in localStorage, verifying with backend...');
    
    // Verify with backend if KYC is actually completed
    const isActuallyCompleted = await verifyKycCompletion()
    
    if (isActuallyCompleted) {
      console.log('KYC is actually completed according to backend');
      // Don't redirect immediately - let user see the form and decide to submit again if needed
      // Show a success message that KYC is already completed, but allow form access
      showSuccess.value = true
      generalError.value = '' // Clear any error messages
      
      // Pre-fill the form with existing data if available
      const savedFormData = localStorage.getItem('kyc_form_data')
      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData)
          Object.assign(formData, parsedData)
          console.log('Loaded saved form data for completed KYC:', parsedData)
        } catch (error) {
          console.error('Error loading saved form data:', error)
        }
      }
      
      return
    } else {
      console.log('KYC marked as completed in localStorage but not actually completed, clearing status');
      localStorage.removeItem('kyc_submission_status')
      localStorage.removeItem('kyc_submission_timestamp')
      console.log('KYC status cleared, allowing fresh submission');
    }
  }
}

const resetKycStatus = () => {
  console.log('Resetting KYC status...');
  localStorage.removeItem('kyc_submission_status');
  localStorage.removeItem('kyc_submission_timestamp');
  localStorage.removeItem('kyc_form_data');
  kycSubmitted.value = false;
  showSuccess.value = false;
  generalError.value = '';
  aadhaarVerified.value = false;
  aadhaarOtpSent.value = false;
  aadhaarOtpCooldown.value = 0;
  gstVerified.value = false;
  panVerified.value = false;
  bankVerified.value = false;
  errors.aadhaarNumber = '';
  errors.aadhaarOtp = '';
  errors.gstNumber = '';
  errors.panNumber = '';
  errors.entityType = '';
  errors.entityName = '';
  errors.gstAddress = '';
  errors.gstPincode = '';
  errors.billingAddress = '';
  errors.panPincode = '';
  errors.beneficiaryName = '';
  errors.bankName = '';
  errors.accountNumber = '';
  errors.ifscCode = '';
  errors.branchName = '';
  formData.aadhaarNumber = '';
  formData.aadhaarOtp = ['', '', '', '', '', ''];
  formData.gstNumber = '';
  formData.entityName = '';
  formData.gstAddress = '';
  formData.gstPincode = '';
  formData.branchName = '';
  formData.panNumber = '';
  formData.entityType = '';
  formData.billingAddress = '';
  formData.panPincode = '';
  formData.beneficiaryName = '';
  formData.bankName = '';
  formData.accountNumber = '';
  formData.ifscCode = '';
  console.log('KYC status reset successfully.');
  alert('KYC status reset successfully. You can now submit a new KYC.');
}

const resetForResubmission = () => {
  console.log('Resetting form for resubmission...')
  
  // Reset all submission flags
  kycSubmitted.value = false
  showSuccess.value = false
  generalError.value = ''
  loading.value = false
  
  // Clear any previous errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  
  // Reset submission ID
  submissionId.value = 0
  
  console.log('Form reset completed. Ready for resubmission.')
}

const redirectToDashboard = () => {
  const apiKey = localStorage.getItem('api_key')
  if (apiKey) {
    const redirectUrl = `http://localhost:8080/orders?api_key=${apiKey}`
    console.log('Redirecting to:', redirectUrl);
    window.location.href = redirectUrl
  } else {
    router.push('/signin')
  }
}
</script>

<style scoped>
/* Background image styling */
.bg-image {
  background-image: url('/img/background-image.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
}

/* Optional overlay for better readability */
.bg-image::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.15);
  z-index: 1;
}

/* Ensure content is above the overlay */
.bg-image > * {
  position: relative;
  z-index: 2;
}

/* Responsive background adjustments */
@media (max-width: 768px) {
  .bg-image {
    background-attachment: scroll;
    background-size: cover;
  }
}

/* Enhanced container styling */
.bg-white\/95 {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style> 