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
    
    <div class="w-full max-w-md lg:max-w-4xl relative z-10">
      <div class="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 lg:p-8">
        <ProgressIndicator :current-step="3" />

        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Business Verification</h2>
          <p class="text-gray-600">Complete KYC to enable COD and unlock advanced features. You can skip this for now.</p>
        </div>

        <div v-if="signupStore.errors.general" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div class="flex items-center">
            <i class="fas fa-exclamation-circle text-red-500 mr-3"></i>
            <span class="text-red-700 text-sm font-medium">{{ signupStore.errors.general }}</span>
          </div>
        </div>

        <form @submit.prevent="handleCompleteSignup" class="space-y-6">
          <!-- Aadhaar Section -->
          <div class="border border-gray-200 rounded-lg p-6">
            <button
              type="button"
              @click="signupStore.showAadhaarSection = !signupStore.showAadhaarSection"
              class="w-full flex items-center justify-between text-left"
            >
              <div class="flex items-center">
                <i class="fas fa-id-card text-blue-600 mr-3"></i>
                <span class="font-semibold text-gray-900">Aadhaar Verification</span>
                <span v-if="signupStore.aadhaarVerified" class="ml-2 text-green-600">
                  <i class="fas fa-check-circle"></i>
                </span>
              </div>
              <i :class="signupStore.showAadhaarSection ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-gray-400"></i>
            </button>
            
            <div v-if="signupStore.aadhaarVerified && !signupStore.showAadhaarSection" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div class="flex items-center text-green-700">
                <i class="fas fa-check-circle mr-2"></i>
                <span>Aadhaar verification completed successfully!</span>
              </div>
            </div>
            
            <div v-if="signupStore.showAadhaarSection && !signupStore.aadhaarVerified" class="mt-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
                <input
                  v-model="signupStore.formData.aadhaarNumber"
                  @input="signupStore.clearError('aadhaarNumber')"
                  @keyup.enter="handleSendAadhaarOtp"
                  type="text"
                  placeholder="Enter 12-digit Aadhaar number"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': signupStore.errors.aadhaarNumber }"
                />
                <p v-if="signupStore.errors.aadhaarNumber" class="mt-1 text-sm text-red-600">{{ signupStore.errors.aadhaarNumber }}</p>
              </div>

              <div v-if="signupStore.aadhaarOtpSent">
                <label class="block text-sm font-medium text-gray-700 mb-2">Enter Aadhaar OTP</label>
                <div class="flex space-x-2 justify-center">
                  <input
                    v-for="(digit, index) in signupStore.formData.aadhaarOtp"
                    :key="index"
                    v-model="signupStore.formData.aadhaarOtp[index]"
                    @input="handleAadhaarOtpInput(index, $event)"
                    @keydown="handleAadhaarOtpKeydown(index, $event)"
                    @keyup.enter="handleVerifyAadhaar"
                    type="text"
                    class="w-10 h-10 sm:w-12 sm:h-12 lg:w-12 lg:h-12 text-center border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base font-semibold"
                    maxlength="1"
                    :data-aadhaar-otp-index="index"
                    :class="{ 'border-red-500': signupStore.errors.aadhaarOtp }"
                  />
                </div>
                <p v-if="signupStore.errors.aadhaarOtp" class="mt-1 text-sm text-red-600 text-center">{{ signupStore.errors.aadhaarOtp }}</p>
              </div>

              <div class="flex space-x-3">
                <button
                  v-if="!signupStore.aadhaarOtpSent"
                  type="button"
                  @click="handleSendAadhaarOtp"
                  :disabled="!signupStore.formData.aadhaarNumber || signupStore.formData.aadhaarNumber.length !== 12"
                  class="text-white py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                  :style="{ 'background-color': (!signupStore.formData.aadhaarNumber || signupStore.formData.aadhaarNumber.length !== 12) ? '#9CA3AF' : '#6A5ACD' }"
                >
                  Send Aadhaar OTP
                </button>
                <div v-if="signupStore.aadhaarOtpSent" class="space-y-3">
                  <div class="flex justify-center sm:justify-start">
                    <button
                      type="button"
                      @click="handleVerifyAadhaar"
                      :disabled="!signupStore.isAadhaarOtpComplete"
                      class="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      Verify Aadhaar
                    </button>
                  </div>
                  <div class="text-center">
                    <button
                      @click="handleResendAadhaarOtp"
                      :disabled="signupStore.aadhaarOtpCooldown > 0"
                      class="text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      <span v-if="signupStore.aadhaarOtpCooldown > 0">
                        Resend Aadhaar OTP in {{ formatTime(signupStore.aadhaarOtpCooldown) }}
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

          <!-- Business Type Selection -->
          <div class="border border-gray-200 rounded-lg p-6">
            <label class="block text-sm font-medium text-gray-700 mb-4">Select Business Type</label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                @click="signupStore.formData.businessType = 'gst'"
                :class="[
                  'p-4 border-2 rounded-lg text-left transition-colors',
                  signupStore.formData.businessType === 'gst'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                ]"
              >
                <div class="font-semibold">GST Registered Business</div>
                <div class="text-sm">For businesses with GST registration</div>
              </button>
              <button
                type="button"
                @click="signupStore.formData.businessType = 'pan'"
                :class="[
                  'p-4 border-2 rounded-lg text-left transition-colors',
                  signupStore.formData.businessType === 'pan'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                ]"
              >
                <div class="font-semibold">PAN Based Business</div>
                <div class="text-sm">For businesses with PAN registration</div>
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
                  <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      v-model="signupStore.formData.gstNumber"
                      @input="signupStore.clearError('gstNumber')"
                      @keyup.enter="handleVerifyGst"
                      type="text"
                      placeholder="22AAAAA0000A1Z5"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      :class="{ 'border-red-500': signupStore.errors.gstNumber, 'border-green-500': signupStore.gstVerified }"
                    />
                    <button
                      type="button"
                      @click="handleVerifyGst"
                      :disabled="signupStore.isLoading || !signupStore.formData.gstNumber || signupStore.formData.gstNumber.trim() === ''"
                      class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap sm:w-auto w-full"
                    >
                      <SpinnerLoader v-if="signupStore.isLoading" size="sm" class="mr-1" />
                      <span v-if="signupStore.isLoading">Verifying...</span>
                      <span v-else-if="signupStore.gstVerified">✓ Verified</span>
                      <span v-else>Verify</span>
                    </button>
                  </div>
                  <p v-if="signupStore.errors.gstNumber" class="mt-1 text-sm text-red-600">{{ signupStore.errors.gstNumber }}</p>
                  <p v-else-if="signupStore.gstVerified" class="mt-1 text-sm text-green-600">
                    <i class="fas fa-check-circle mr-1"></i>GST number verified successfully!
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                  <input
                    v-model="signupStore.formData.branchName"
                    @keyup.enter="handleCompleteSignup"
                    type="text"
                    placeholder="Main Branch"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': signupStore.errors.branchName }"
                  />
                  <p v-if="signupStore.errors.branchName" class="mt-1 text-sm text-red-600">{{ signupStore.errors.branchName }}</p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Registered Address <span class="text-red-500">*</span></label>
                <textarea
                  v-model="signupStore.formData.gstAddress"
                  @keyup.enter="handleCompleteSignup"
                  rows="3"
                  placeholder="Enter your registered business address"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': signupStore.errors.gstAddress }"
                ></textarea>
                <p v-if="signupStore.errors.gstAddress" class="mt-1 text-sm text-red-600">{{ signupStore.errors.gstAddress }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Pincode <span class="text-red-500">*</span></label>
                <input
                  v-model="signupStore.formData.gstPincode"
                  @keyup.enter="handleCompleteSignup"
                  type="text"
                  placeholder="123456"
                  maxlength="6"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-500': signupStore.errors.gstPincode }"
                />
                <p v-if="signupStore.errors.gstPincode" class="mt-1 text-sm text-red-600">{{ signupStore.errors.gstPincode }}</p>
              </div>
            </div>
          </div>

          <div v-if="signupStore.formData.businessType === 'pan'" class="border border-gray-200 rounded-lg p-6">
            <button
              type="button"
              @click="signupStore.showPanSection = !signupStore.showPanSection"
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
                  <select
                    v-model="signupStore.formData.entityType"
                    @keyup.enter="handleCompleteSignup"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': signupStore.errors.entityType }"
                  >
                    <option value="">Select Entity Type</option>
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                    <option value="partnership">Partnership</option>
                    <option value="proprietorship">Proprietorship</option>
                  </select>
                  <p v-if="signupStore.errors.entityType" class="mt-1 text-sm text-red-600">{{ signupStore.errors.entityType }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Entity Name <span class="text-red-500">*</span></label>
                  <input
                    v-model="signupStore.formData.entityName"
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
                  <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      v-model="signupStore.formData.panNumber"
                      @keyup.enter="handleVerifyPan"
                      type="text"
                      placeholder="ABCDE1234F"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      :class="{ 'border-red-500': signupStore.errors.panNumber, 'border-green-500': signupStore.panVerified }"
                    />
                    <button
                      type="button"
                      @click="handleVerifyPan"
                      :disabled="signupStore.isLoading || !signupStore.formData.panNumber || signupStore.formData.panNumber.trim() === ''"
                      class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium whitespace-nowrap sm:w-auto w-full"
                    >
                      <SpinnerLoader v-if="signupStore.isLoading" size="sm" class="mr-1" />
                      <span v-if="signupStore.isLoading">Verifying...</span>
                      <span v-else-if="signupStore.panVerified">✓ Verified</span>
                      <span v-else>Verify</span>
                    </button>
                  </div>
                  <p v-if="signupStore.errors.panNumber" class="mt-1 text-sm text-red-600">{{ signupStore.errors.panNumber }}</p>
                  <p v-else-if="signupStore.panVerified" class="mt-1 text-sm text-green-600">
                    <i class="fas fa-check-circle mr-1"></i>PAN number verified successfully!
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <input
                    v-model="signupStore.formData.panPincode"
                    @keyup.enter="handleCompleteSignup"
                    type="text"
                    placeholder="123456"
                    maxlength="6"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': signupStore.errors.panPincode }"
                  />
                  <p v-if="signupStore.errors.panPincode" class="mt-1 text-sm text-red-600">{{ signupStore.errors.panPincode }}</p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Billing Address <span class="text-red-500">*</span></label>
                <textarea
                  v-model="signupStore.formData.billingAddress"
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
              @click="signupStore.showBankDetails = !signupStore.showBankDetails"
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
                  <input
                    v-model="signupStore.formData.bankName"
                    @keyup.enter="handleCompleteSignup"
                    type="text"
                    placeholder="Enter bank name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': signupStore.errors.bankName }"
                  />
                  <p v-if="signupStore.errors.bankName" class="mt-1 text-sm text-red-600">{{ signupStore.errors.bankName }}</p>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Account Number <span class="text-red-500">*</span></label>
                  <input
                    v-model="signupStore.formData.accountNumber"
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
                    @keyup.enter="handleCompleteSignup"
                    type="text"
                    placeholder="Enter IFSC code"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{ 'border-red-500': signupStore.errors.ifscCode, 'border-green-500': signupStore.bankVerified }"
                  />
                  <p v-if="signupStore.errors.ifscCode" class="mt-1 text-sm text-red-600">{{ signupStore.errors.ifscCode }}</p>
                </div>
              </div>
              
              <div class="flex flex-col items-center space-y-2">
                <button
                  type="button"
                  @click="handleVerifyBank"
                  :disabled="signupStore.isLoading || !signupStore.formData.accountNumber || !signupStore.formData.ifscCode"
                  class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  <SpinnerLoader v-if="signupStore.isLoading" size="sm" class="mr-2" />
                  <span v-if="signupStore.isLoading">Verifying Bank Details...</span>
                  <span v-else-if="signupStore.bankVerified">✓ Bank Details Verified</span>
                  <span v-else>Verify Bank Details</span>
                </button>
              </div>
              
              <div v-if="signupStore.bankVerified" class="p-3 bg-green-50 border border-green-200 rounded-md">
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
              @click="prevStep"
              class="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 font-semibold"
            >
              Back
            </button>
            <button
              type="button"
              @click="handleSkipKyc"
              :disabled="signupStore.isLoading"
              class="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center"
            >
              <SpinnerLoader v-if="signupStore.isLoading" size="sm" class="mr-2" />
              {{ signupStore.isLoading ? 'Processing...' : 'Skip KYC' }}
            </button>
            <button
              type="button"
              @click="handleCompleteSignup"
              :disabled="!signupStore.isStep3Valid || signupStore.isLoading"
              class="flex-1 text-white py-3 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center"
              :style="{ 'background-color': (!signupStore.isStep3Valid || signupStore.isLoading) ? '#9CA3AF' : '#6A5ACD' }"
            >
              <SpinnerLoader v-if="signupStore.isLoading" size="sm" class="mr-2" />
              {{ signupStore.isLoading ? 'Processing...' : 'Complete Signup' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSignupStore } from '@/stores/signup'
import ProgressIndicator from '@/components/signup/ProgressIndicator.vue'
import SpinnerLoader from '@/components/common/SpinnerLoader.vue'

const router = useRouter()
const signupStore = useSignupStore()

onMounted(() => {
  // Check if user is authenticated
  if (!signupStore.mobileSession && !signupStore.formData.phone) {
    router.push('/signup/mobile')
  }
})

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
  await signupStore.verifyPan()
}

const handleVerifyGst = async () => {
  await signupStore.verifyGst()
}

const handleVerifyBank = async () => {
  await signupStore.verifyBank()
}

const handleSkipKyc = async () => {
  const result = await signupStore.skipKyc()
  if (result.success) {
    // Redirect to main app
    window.location.href = import.meta.env.VITE_MAIN_APP_URL || 'https://app.vamaship.com'
  }
}

const handleCompleteSignup = async () => {
  const result = await signupStore.completeKyc()
  if (result.success) {
    // Redirect to main app
    window.location.href = import.meta.env.VITE_MAIN_APP_URL || 'https://app.vamaship.com'
  }
}

const prevStep = () => {
  router.push('/signup/details')
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script> 