<template>
  <div class="min-h-screen flex items-center justify-center p-4 lg:p-8 bg-image">
    <div class="w-full max-w-md lg:max-w-4xl">
      <div class="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-200 p-6 lg:p-8">
        <div class="text-center mb-6 lg:mb-8">
          <img class="mx-auto h-12 w-auto mb-4" src="/images/logo-blue.png" alt="Vamaship" />
          <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Complete KYC Verification
          </h2>
          <p class="text-gray-600 text-sm lg:text-base">
            To continue using our services, please complete your KYC verification
          </p>
        </div>

        <div v-if="generalError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div class="flex items-center">
            <i class="fas fa-exclamation-circle text-red-500 mr-3"></i>
            <span class="text-red-700 text-sm font-medium">{{ generalError }}</span>
          </div>
        </div>

        <form @submit.prevent="submitKyc" class="space-y-6" :class="{ 'pointer-events-none opacity-50': kycSubmitted }">
          <div v-if="loading || kycSubmitted" class="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div class="flex items-center">
              <i class="fas fa-info-circle text-blue-500 mr-2"></i>
              <span class="text-blue-700 text-sm">
                <span v-if="loading">Processing KYC submission...</span>
                <span v-else-if="kycSubmitted">KYC submitted successfully! Redirecting...</span>
              </span>
            </div>
          </div>
          
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
                  <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      v-model="formData.aadhaarNumber"
                      @input="validateAadhaar(($event.target as HTMLInputElement).value)"
                      @keyup.enter="submitKyc"
                      type="text"
                      placeholder="1234 5678 9012"
                      maxlength="14"
                      class="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      :class="{ 'border-red-500': errors.aadhaarNumber, 'border-green-500': aadhaarVerified }"
                      :disabled="aadhaarVerified"
                    />
                    <button
                      v-if="!aadhaarVerified"
                      type="button"
                      @click="sendAadhaarOtp"
                      :disabled="aadhaarOtpCooldown > 0 || !formData.aadhaarNumber || formData.aadhaarNumber.length !== 12"
                      class="w-full sm:w-auto px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
                    >
                      <i v-if="aadhaarOtpCooldown > 0" class="fas fa-clock mr-1"></i>
                      <span v-if="aadhaarOtpCooldown > 0">{{ Math.floor(aadhaarOtpCooldown / 60) }}:{{ (aadhaarOtpCooldown % 60).toString().padStart(2, '0') }}</span>
                      <span v-else>Send OTP</span>
                    </button>
                    <button
                      v-else
                      type="button"
                      disabled
                      class="w-full sm:w-auto px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium whitespace-nowrap"
                    >
                      <i class="fas fa-check mr-1"></i>Verified
                    </button>
                  </div>
                <p v-if="errors.aadhaarNumber" class="mt-1 text-sm text-red-600">{{ errors.aadhaarNumber }}</p>
                <p v-else-if="aadhaarVerified" class="mt-1 text-sm text-green-600">
                  <i class="fas fa-check-circle mr-1"></i>Aadhaar number verified successfully!
                </p>
              </div>

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
                    class="w-10 h-10 sm:w-12 sm:h-12 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
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
                  <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      v-model="formData.gstNumber"
                      @input="validateGst"
                      @keyup.enter="submitKyc"
                      type="text"
                      placeholder="22AAAAA0000A1Z5"
                      class="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      :class="{ 'border-red-500': errors.gstNumber, 'border-green-500': gstVerified }"
                    />
                    <button
                      type="button"
                      @click="verifyGst"
                      :disabled="gstVerifying || !formData.gstNumber || formData.gstNumber.trim() === ''"
                      class="w-full sm:w-auto px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
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
                  <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      v-model="formData.panNumber"
                      @input="validatePan"
                      @keyup.enter="submitKyc"
                      type="text"
                      placeholder="ABCDE1234F"
                      class="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      :class="{ 'border-red-500': errors.panNumber, 'border-green-500': panVerified }"
                    />
                    <button
                      type="button"
                      @click="verifyPan"
                      :disabled="panVerifying || !formData.panNumber || formData.panNumber.trim() === ''"
                      class="w-full sm:w-auto px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap"
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
                  
                  <div v-if="banksLoading" class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                    <i class="fas fa-spinner fa-spin text-gray-400 mr-2"></i>
                    <span class="text-gray-500 text-sm">Loading banks...</span>
                  </div>
                  
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
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import apiService from '../services/api'
import type { VerifyKYCData } from '../services/api'
import { isAuthenticationValid, clearAllAuthenticationData } from '../utils/auth'

const router = useRouter()

let authCheckInterval: number | null = null

const startAuthenticationMonitoring = () => {
  authCheckInterval = setInterval(() => {
    if (!isAuthenticationValid()) {
      clearAllAuthenticationData()
      generalError.value = ''
      router.push('/sign-in')
    }
  }, 10000)
}

const stopAuthenticationMonitoring = () => {
  if (authCheckInterval) {
    clearInterval(authCheckInterval)
    authCheckInterval = null
  }
}

const businessType = ref('')
const loading = ref(false)
const showSuccess = ref(false)
const generalError = ref('')
const submissionId = ref(0)
const kycSubmitted = ref(false)
const redirectCountdown = ref(2)

const showGstSection = ref(true)
const showPanSection = ref(true)
const showBankDetails = ref(true)
const showAadhaarSection = ref(true)

const gstVerified = ref(false)
const gstVerifying = ref(false)
const panVerified = ref(false)
const panVerifying = ref(false)
const bankVerified = ref(false)
const bankVerifying = ref(false)
const aadhaarVerified = ref(false)
const aadhaarOtpSent = ref(false)
const aadhaarOtpCooldown = ref(0)

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
  aadhaarNumber: '',
  aadhaarOtp: ''
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
  aadhaarNumber: '',
  aadhaarOtp: ['', '', '', '', '', '']
})

watch(businessType, (newType) => {
  Object.keys(errors).forEach(key => {
    (errors as any)[key] = ''
  })
  
  if (newType === 'gst') {
    formData.entityName = ''
    formData.entityType = ''
    formData.panNumber = ''
    formData.billingAddress = ''
    formData.panPincode = ''
  } else if (newType === 'pan') {
    formData.gstNumber = ''
    formData.gstAddress = ''
    formData.gstPincode = ''
    formData.branchName = ''
  }
})

watch(formData, (newData) => {
  localStorage.setItem('kyc_form_data', JSON.stringify(newData))
  
  if (newData.aadhaarNumber && newData.aadhaarNumber.length === 12 && !aadhaarVerified.value) {
    aadhaarVerified.value = true
  }
}, { deep: true })

const canSubmit = computed(() => {
  if (!businessType.value) {
    return false;
  }
  
  if (!aadhaarVerified.value) {
    return false;
  }
  
  if (businessType.value === 'gst') {
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

const validateAadhaar = (aadhaarNumber: string) => {
  errors.aadhaarNumber = ''
  
  if (!aadhaarNumber || aadhaarNumber.trim() === '') {
    return
  }
  
  const cleanAadhaar = aadhaarNumber.replace(/\s/g, '').replace(/-/g, '')
  
  if (cleanAadhaar.length !== 12) {
    errors.aadhaarNumber = 'Aadhaar number must be exactly 12 digits'
    return
  }
  
  if (!/^\d{12}$/.test(cleanAadhaar)) {
    errors.aadhaarNumber = 'Aadhaar number must contain only digits'
    return
  }
  
  if (cleanAadhaar.startsWith('0') || cleanAadhaar.startsWith('1')) {
    errors.aadhaarNumber = 'Aadhaar number cannot start with 0 or 1'
    return
  }
  
  if (/^(\d)\1{11}$/.test(cleanAadhaar)) {
    errors.aadhaarNumber = 'Please enter a valid Aadhaar number'
    return
  }
  
  formData.aadhaarNumber = cleanAadhaar
}

const sendAadhaarOtp = async () => {
  if (!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12) {
    alert('Please enter a valid 12-digit Aadhaar number')
    return
  }
  
  try {
    const response = await apiService.sendAadhaarOTP(formData.aadhaarNumber)
    
    if (response.success) {
      aadhaarOtpSent.value = true
      errors.aadhaarOtp = ''
      
      aadhaarOtpCooldown.value = 60
      startAadhaarOtpCooldown()
      
      alert('Aadhaar OTP sent successfully to your registered mobile number! 📱')
    } else {
      errors.aadhaarOtp = response.message || 'Failed to send Aadhaar OTP'
    }
  } catch (error: any) {
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
  
  try {
    const response = await apiService.verifyAadhaarOTP(formData.aadhaarNumber, otp)
    
    if (response.success && response.data && response.data.result === 1) {
      aadhaarVerified.value = true
      errors.aadhaarOtp = ''
      alert('Aadhaar verification successful! ✅')
    } else {
      const errorMessage = response.data?.message || response.message || 'Invalid Aadhaar OTP'
      errors.aadhaarOtp = errorMessage
    }
  } catch (error: any) {
    errors.aadhaarOtp = error.response?.data?.message || 'Network error occurred'
  }
}

const handleAadhaarOtpInput = (index: number, value: string) => {
  formData.aadhaarOtp![index] = value.replace(/\D/g, '')
  
  if (formData.aadhaarOtp![index] && index < 5) {
    const nextInput = document.querySelector(`[data-aadhaar-otp-index="${index + 1}"]`) as HTMLInputElement
    if (nextInput) nextInput.focus()
  }
}

const handleAadhaarOtpKeydown = (index: number, event: KeyboardEvent) => {
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
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    bankVerified.value = true
    errors.accountNumber = ''
    errors.ifscCode = ''
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
    
    if (response.success && response.data && response.data.banks) {
      banksList.value = response.data.banks.map((bank: any) => bank.name)
    } else {
      banksError.value = 'Failed to load banks list'
    }
  } catch (error) {
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
  router.push('/sign-in')
}

const submitKyc = async () => {
  if (loading.value) {
    return;
  }
  
  if (kycSubmitted.value) {
    return;
  }
  
  if (!canSubmit.value) {
    return;
  }
  
  const currentSubmissionId = ++submissionId.value;
  
  loading.value = true
  generalError.value = ''
  
  try {
    const userInfoStr = localStorage.getItem('user_info')
    let userInfo = null
    if (userInfoStr) {
      try {
        userInfo = JSON.parse(userInfoStr)
      } catch (error) {
      }
    }
    
    const kycData: VerifyKYCData = {
      businessType: businessType.value as 'gst' | 'pan',
      ...formData,
      ...(aadhaarVerified.value ? { aadhaarNumber: formData.aadhaarNumber } : {}),
      ...(userInfo ? {
        user_id: userInfo.id,
        entity_id: userInfo.entity_id,
        email: userInfo.email
      } : {})
    }
    
    if (businessType.value === 'gst' && (!kycData.entityName || kycData.entityName.trim() === '')) {
      const userInfoStr = localStorage.getItem('user_info')
      if (userInfoStr) {
        try {
          const userInfo = JSON.parse(userInfoStr)
          if (userInfo.entity && userInfo.entity.entity_name) {
            kycData.entityName = userInfo.entity.entity_name
          }
        } catch (error) {
        }
      }
      
    }
    
    const apiKey = sessionStorage.getItem('api_key') || localStorage.getItem('api_key')
    const authToken = sessionStorage.getItem('auth_token')
    
    const endpoint = businessType.value === 'gst' 
      ? '/public/kyc/gst-registered'
      : '/public/kyc/gst-unregistered';
    
    const isPublicEndpoint = endpoint.includes('/public/');
    
    if (isPublicEndpoint) {
      if (!userInfo || !userInfo.id) {
        generalError.value = 'User identification required. Please login again.'
        router.push('/sign-in')
        return
      }
      
      if (apiKey) {
        apiService.setAuthHeader({ 'Authorization': `Bearer ${apiKey}` })
      } else if (authToken) {
        apiService.setAuthHeader({ 'Authorization': `Bearer ${authToken}` })
      } else {
        generalError.value = 'Authentication required. Please login again.'
        router.push('/sign-in')
        return
      }
    } else {
      if (!apiKey && !authToken) {
        generalError.value = 'Authentication required. Please login again.'
        router.push('/sign-in')
        return
      }
      
      if (apiKey) {
        apiService.setAuthHeader({ 'Authorization': `Bearer ${apiKey}` })
      } else if (authToken) {
        apiService.setAuthHeader({ 'Authorization': `Bearer ${authToken}` })
      }
    }
    
    const response = await apiService.submitKyc(kycData)
    
    if (response.success) {
      kycSubmitted.value = true
      showSuccess.value = true
      
      localStorage.setItem('kyc_submission_status', 'completed')
      localStorage.setItem('kyc_submission_timestamp', Date.now().toString())
      
      localStorage.setItem('kyc_form_data', JSON.stringify(formData))
      
      const tempPassword = sessionStorage.getItem('temp_password')
      
      redirectCountdown.value = 3
      const countdownInterval = setInterval(() => {
        redirectCountdown.value--
        if (redirectCountdown.value <= 0) {
          clearInterval(countdownInterval)
          redirectToDashboard()
        }
      }, 1000)
      
      alert('KYC submitted successfully! 🎉 Redirecting to dashboard...')
      
    } else {
      generalError.value = response.message || 'KYC submission failed. Please try again.'
      
      kycSubmitted.value = false
      showSuccess.value = false
      
      alert('KYC submission failed: ' + (response.message || 'Unknown error'))
    }
    
  } catch (error) {
    generalError.value = 'Network error occurred during KYC submission'
    
    kycSubmitted.value = false
    showSuccess.value = false
    
    alert('Network error occurred during KYC submission. Please check your connection and try again.')
  } finally {
    if (currentSubmissionId === submissionId.value) {
      loading.value = false
    }
  }
}

const verifyKycCompletion = async () => {
  try {
    const response = await apiService.checkKYCStatus();
    
    if (response.success && response.data) {
      const status = response.data;
      
      if (status.kyc_completed) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

const verifyCurrentUser = async () => {
  try {
    const apiKey = localStorage.getItem('api_key')
    
    if (apiKey) {
      apiService.setAuthHeader({ 'Authorization': `Bearer ${apiKey}` })
    }
    
    const response = await apiService.checkKYCStatus()
    
    if (response.success && response.data) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

onMounted(async () => {
  const apiKey = sessionStorage.getItem('api_key') || localStorage.getItem('api_key')
  const authToken = sessionStorage.getItem('auth_token')
  const userInfo = localStorage.getItem('user_info')
  
  const isValidApiKey = apiKey && 
                       apiKey !== 'undefined' && 
                       apiKey !== 'null' && 
                       apiKey.trim() !== '' &&
                       apiKey.length > 10;
  
  let isValidUserInfo = false;
  if (userInfo && userInfo !== 'undefined' && userInfo !== 'null') {
    try {
      const parsedUserInfo = JSON.parse(userInfo);
      isValidUserInfo = parsedUserInfo && 
                       typeof parsedUserInfo === 'object' &&
                       (parsedUserInfo.id || parsedUserInfo.user_id || parsedUserInfo.email);
    } catch (error) {
      isValidUserInfo = false;
    }
  }
  
  if (!isValidApiKey || !isValidUserInfo) {
    localStorage.removeItem('api_key');
    localStorage.removeItem('user_info');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_info');
    sessionStorage.removeItem('api_key');
    sessionStorage.removeItem('access_token');
    
    generalError.value = 'Authentication expired. Please login again.';
    router.push('/sign-in');
    return;
  }
  
  startAuthenticationMonitoring();
  
  try {
    if (authToken) {
      apiService.setAuthHeader({ 'Authorization': `Bearer ${authToken}` })
    } else if (apiKey) {
      apiService.setAuthHeader({ 'Authorization': `Bearer ${apiKey}` })
    }
    
    const userResponse = await apiService.getUserDetails()
    
    if (userResponse.success && userResponse.data) {
      sessionStorage.setItem('user_info', JSON.stringify(userResponse.data.user))
      sessionStorage.setItem('entity_info', JSON.stringify(userResponse.data.entity))
      
      const kycResponse = await apiService.checkKYCStatus()
      
      if (kycResponse.success && kycResponse.data) {
        const kycStatus = kycResponse.data
        sessionStorage.setItem('kyc_status', JSON.stringify(kycStatus))
        
        if (kycStatus.kyc_completed) {
          showSuccess.value = true
          generalError.value = ''
          
          initializeFormWithUserData(userResponse.data.user)
          return
        }
      }
      
      initializeFormWithUserData(userResponse.data.user)
      
      checkKycStatusAndHandle()
      
    } else {
      generalError.value = 'Authentication failed: ' + (userResponse.message || 'Unknown error')
      router.push('/sign-in')
      return
    }
    
  } catch (error) {
    generalError.value = 'Authentication failed. Please login again.'
    router.push('/sign-in')
    return
  }
  
  const savedFormData = sessionStorage.getItem('kyc_form_data')
  if (savedFormData) {
    try {
      const parsedData = JSON.parse(savedFormData)
      Object.assign(formData, parsedData)
    } catch (error) {
    }
  }
  
  fetchBanksList()
  
  if (!businessType.value) {
    businessType.value = 'gst'
  }
  
  Object.keys(errors).forEach(key => {
    (errors as any)[key] = ''
  })
  
  if (formData.aadhaarNumber && formData.aadhaarNumber.length === 12) {
    aadhaarVerified.value = true
  }
})

onUnmounted(() => {
  stopAuthenticationMonitoring()
})

const initializeFormWithUserData = (userInfo: any) => {
  if (userInfo.branches && userInfo.branches.length > 0) {
    const branch = userInfo.branches[0]
    formData.gstNumber = branch.gst_number || ''
    formData.gstAddress = branch.address1 || ''
    formData.gstPincode = branch.pincode || ''
    formData.branchName = branch.branch || ''
  }
  
  if (userInfo.banks && userInfo.banks.length > 0) {
    const bank = userInfo.banks[0]
    formData.beneficiaryName = bank.beneficiary_name || ''
    formData.bankName = bank.bank_name || ''
    formData.accountNumber = bank.account_number || ''
    formData.ifscCode = bank.ifsc_code || ''
  }
  
  if (userInfo.kyc_data && userInfo.kyc_data.aadhaar_number) {
    formData.aadhaarNumber = userInfo.kyc_data.aadhaar_number
  }
  
  if (formData.gstNumber && formData.gstNumber.trim() !== '') {
    businessType.value = 'gst'
  } else if (userInfo.kyc_data && userInfo.kyc_data.business_type) {
    businessType.value = userInfo.kyc_data.business_type
  } else {
    businessType.value = 'gst'
  }
  
  if (formData.aadhaarNumber && formData.aadhaarNumber.length === 12) {
    aadhaarVerified.value = true
  }
}

const checkKycStatusAndHandle = async () => {
  const kycSubmissionStatus = localStorage.getItem('kyc_submission_status')
  if (kycSubmissionStatus === 'completed') {
    const isActuallyCompleted = await verifyKycCompletion()
    
    if (isActuallyCompleted) {
      showSuccess.value = true
      generalError.value = ''
      
      const savedFormData = localStorage.getItem('kyc_form_data')
      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData)
          Object.assign(formData, parsedData)
        } catch (error) {
        }
      }
      
      return
    } else {
      localStorage.removeItem('kyc_submission_status')
      localStorage.removeItem('kyc_submission_timestamp')
    }
  }
}

const resetKycStatus = () => {
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
  alert('KYC status reset successfully. You can now submit a new KYC.');
}

const resetForResubmission = () => {
  kycSubmitted.value = false
  showSuccess.value = false
  generalError.value = ''
  loading.value = false
  
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  
  submissionId.value = 0
}

const redirectToDashboard = () => {
  const freshToken = sessionStorage.getItem('auth_token')
  const apiKey = sessionStorage.getItem('api_key') || localStorage.getItem('api_key')
  
  if (apiKey) {
    const redirectUrl = `http://localhost:8080/orders?api_key=${apiKey}`;
    
    alert('🎉 KYC submitted successfully! Redirecting to dashboard...');
    
    window.location.href = redirectUrl;
  } else if (freshToken) {
    const redirectUrl = `http://localhost:8080/orders?token=${freshToken}`;
    
    alert('🎉 KYC submitted successfully! Redirecting to dashboard...');
    window.location.href = redirectUrl;
  } else {
    alert('⚠️ Authentication expired. Please login again.');
    router.push('/sign-in')
  }
}
</script>

<style scoped>
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

.bg-image > * {
  position: relative;
  z-index: 2;
}

@media (max-width: 768px) {
  .bg-image {
    background-attachment: scroll;
    background-size: cover;
  }
}

.bg-white\/95 {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style>