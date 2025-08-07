// Mock API Service for development and testing
import { API_CONFIG } from '../config/api'
import { MOCK_DATA, mockDelay } from '../config/mockData'
import type {
  SignUpData,
  OTPVerificationData,
  UserDetailsData,
  KYCData,
  VerifyKYCData,
  APIResponse
} from './api'

const API_BASE_URL = API_CONFIG.BASE_URL

class MockApiService {
  private baseURL: string;
  private authHeaders: Record<string, string> = {};

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getAuthHeader(): Record<string, string> {
    return this.authHeaders;
  }

  setAuthHeader(headers: Record<string, string>): void {
    this.authHeaders = headers;
  }

  // Send mobile OTP
  async sendOTP(phone: string): Promise<APIResponse> {
    console.log('=== MOCK SEND MOBILE OTP START ===');
    console.log('Mock: Sending mobile OTP request for:', phone);
    
    await mockDelay();
    
    console.log('Mock: Send mobile OTP response:', MOCK_DATA.sendOTP);
    console.log('=== MOCK SEND MOBILE OTP SUCCESS ===');
    return MOCK_DATA.sendOTP;
  }

  // Verify mobile OTP
  async verifyOTP(phone: string, otp: string): Promise<APIResponse> {
    console.log('=== MOCK VERIFY MOBILE OTP START ===');
    console.log('Mock: Verifying mobile OTP:', otp, 'for phone:', phone);
    
    await mockDelay();
    
    // Simulate OTP validation - accept 123456 as valid OTP
    if (otp === '123456') {
      console.log('Mock: Verify mobile OTP response:', MOCK_DATA.verifyOTP);
      console.log('=== MOCK VERIFY MOBILE OTP SUCCESS ===');
      return MOCK_DATA.verifyOTP;
    } else {
      const errorResponse = {
        success: false,
        message: 'Invalid OTP',
        errors: { otp: ['Please enter a valid OTP'] }
      };
      console.log('Mock: Invalid OTP response:', errorResponse);
      console.log('=== MOCK VERIFY MOBILE OTP FAILED ===');
      return errorResponse;
    }
  }

  // Send Aadhaar OTP
  async sendAadhaarOTP(aadhaarNumber: string): Promise<APIResponse> {
    console.log('=== MOCK SEND AADHAAR OTP START ===');
    console.log('Mock: Sending Aadhaar OTP request for:', aadhaarNumber);
    
    await mockDelay();
    
    console.log('Mock: Send Aadhaar OTP response:', MOCK_DATA.sendAadhaarOTP);
    console.log('=== MOCK SEND AADHAAR OTP SUCCESS ===');
    return MOCK_DATA.sendAadhaarOTP;
  }

  // Verify Aadhaar OTP
  async verifyAadhaarOTP(aadhaarNumber: string, otp: string): Promise<APIResponse> {
    console.log('=== MOCK VERIFY AADHAAR OTP START ===');
    console.log('Mock: Verifying Aadhaar OTP:', otp, 'for Aadhaar:', aadhaarNumber);
    
    await mockDelay();
    
    if (otp === '123456') {
      console.log('Mock: Verify Aadhaar OTP response:', MOCK_DATA.verifyAadhaarOTP);
      console.log('=== MOCK VERIFY AADHAAR OTP SUCCESS ===');
      return MOCK_DATA.verifyAadhaarOTP;
    } else {
      const errorResponse = {
        success: false,
        message: 'Invalid Aadhaar OTP',
        errors: { otp: ['Please enter a valid OTP'] }
      };
      console.log('Mock: Invalid Aadhaar OTP response:', errorResponse);
      console.log('=== MOCK VERIFY AADHAAR OTP FAILED ===');
      return errorResponse;
    }
  }

  // Register new user
  async registerUser(userData: SignUpData): Promise<APIResponse> {
    console.log('Mock: Registering user:', userData);
    await mockDelay();
    return MOCK_DATA.register;
  }

  // Complete signup with KYC data
  async completeSignup(data: any): Promise<APIResponse> {
    console.log('=== MOCK COMPLETE SIGNUP START ===');
    console.log('Mock: Sending data to backend:', data);
    
    await mockDelay();
    
    console.log('Mock: Backend response:', MOCK_DATA.completeSignup);
    console.log('=== MOCK COMPLETE SIGNUP SUCCESS ===');
    return MOCK_DATA.completeSignup;
  }

  // Update user profile
  async updateUserProfile(userData: UserDetailsData): Promise<APIResponse> {
    console.log('Mock: Updating user profile:', userData);
    await mockDelay();
    return MOCK_DATA.userProfile;
  }

  // Submit KYC data
  async submitKYC(kycData: KYCData): Promise<APIResponse> {
    console.log('Mock: Submitting KYC data:', kycData);
    await mockDelay();
    return MOCK_DATA.submitKYC;
  }

  // Submit KYC for verify-kyc flow
  async submitKyc(kycData: VerifyKYCData): Promise<APIResponse> {
    console.log('Mock: Submitting KYC data:', kycData);
    
    await mockDelay();
    
    console.log('Mock: KYC submission response:', MOCK_DATA.submitKYC);
    return MOCK_DATA.submitKYC;
  }

  // Skip KYC
  async skipKYC(): Promise<APIResponse> {
    console.log('Mock: Skipping KYC');
    await mockDelay();
    return MOCK_DATA.skipKYC;
  }

  // Get country calling codes
  async getCountryCodes(): Promise<APIResponse> {
    console.log('Mock: Getting country codes');
    await mockDelay();
    return MOCK_DATA.countryCodes;
  }

  // Validate GST number
  async validateGST(gstNumber: string): Promise<APIResponse> {
    console.log('Mock: Validating GST:', gstNumber);
    await mockDelay();
    return MOCK_DATA.validateGST;
  }

  // Validate PAN number
  async validatePAN(panNumber: string): Promise<APIResponse> {
    console.log('Mock: Validating PAN:', panNumber);
    await mockDelay();
    return MOCK_DATA.validatePAN;
  }

  // Validate bank details
  async validateBank(accountNumber: string, ifscCode: string): Promise<APIResponse> {
    console.log('Mock: Validating bank:', { accountNumber, ifscCode });
    await mockDelay();
    return MOCK_DATA.validateBank;
  }

  // Public verification methods for signup flow
  async validateGstPublic(gstNumber: string): Promise<APIResponse> {
    console.log('=== MOCK VALIDATE GST PUBLIC START ===');
    console.log('Mock: Validating GST:', gstNumber);
    
    await mockDelay();
    
    console.log('Mock: GST validation response:', MOCK_DATA.validateGST);
    console.log('=== MOCK VALIDATE GST PUBLIC SUCCESS ===');
    return MOCK_DATA.validateGST;
  }

  async validatePanPublic(panNumber: string): Promise<APIResponse> {
    console.log('=== MOCK VALIDATE PAN PUBLIC START ===');
    console.log('Mock: Validating PAN:', panNumber);
    
    await mockDelay();
    
    console.log('Mock: PAN validation response:', MOCK_DATA.validatePAN);
    console.log('=== MOCK VALIDATE PAN PUBLIC SUCCESS ===');
    return MOCK_DATA.validatePAN;
  }

  async validateBankPublic(accountNumber: string, ifscCode: string): Promise<APIResponse> {
    console.log('Mock: Validating Bank:', { accountNumber, ifscCode });
    
    await mockDelay();
    
    console.log('Mock: Bank validation response:', MOCK_DATA.validateBank);
    return MOCK_DATA.validateBank;
  }

  // Check if email exists
  async checkEmailExists(email: string): Promise<APIResponse> {
    console.log('Mock: Checking if email exists:', email);
    
    await mockDelay();
    
    // Simulate that test@example.com already exists
    const exists = email === 'test@example.com';
    const response = {
      success: true,
      data: {
        exists,
        message: exists ? 'Email already exists' : 'Email is available'
      }
    };
    
    console.log('Mock: Email exists check response:', response);
    return response;
  }

  // Get banks list
  async getBanksList(): Promise<APIResponse> {
    console.log('=== MOCK GET BANKS LIST START ===');
    
    await mockDelay();
    
    console.log('Mock: Banks list response data:', MOCK_DATA.banksList);
    console.log('=== MOCK GET BANKS LIST SUCCESS ===');
    
    return MOCK_DATA.banksList;
  }

  // Get entity types
  async getEntityTypes(): Promise<APIResponse> {
    console.log('Mock: Getting entity types');
    await mockDelay();
    return MOCK_DATA.entityTypes;
  }

  // Get pincode details
  async getPincodeDetails(pincode: string): Promise<APIResponse> {
    console.log('Mock: Getting pincode details for:', pincode);
    await mockDelay();
    return {
      ...MOCK_DATA.pincodeDetails,
      data: {
        ...MOCK_DATA.pincodeDetails.data,
        pincode
      }
    };
  }

  // Check KYC completion status
  async checkKYCStatus(): Promise<APIResponse> {
    console.log('Mock: Checking KYC status');
    await mockDelay();
    return MOCK_DATA.kycStatus;
  }

  // Login user
  async login(email: string, password: string): Promise<APIResponse> {
    console.log('Mock: Logging in user:', email);
    await mockDelay();
    
    // Simulate login validation
    if (email === 'test@example.com' && password === 'password123') {
      return MOCK_DATA.login;
    } else {
      return {
        success: false,
        message: 'Invalid credentials',
        errors: { email: ['Invalid email or password'] }
      };
    }
  }

  // Google login user
  async googleLogin(email: string, credential: string, firstName?: string, lastName?: string): Promise<APIResponse> {
    console.log('=== MOCK GOOGLE LOGIN START ===');
    console.log('Mock: Google login for email:', email);
    console.log('Mock: Credential received:', credential);
    console.log('Mock: Name:', firstName, lastName);
    
    await mockDelay();
    
    console.log('Mock: Google login response:', MOCK_DATA.googleLogin);
    console.log('=== MOCK GOOGLE LOGIN SUCCESS ===');
    return MOCK_DATA.googleLogin;
  }

  // Forgot password
  async forgotPassword(email: string): Promise<APIResponse> {
    console.log('Mock: Processing forgot password for:', email);
    await mockDelay();
    return MOCK_DATA.forgotPassword;
  }

  // Reset password with token
  async resetPassword(token: string, password: string, confirmPassword: string): Promise<APIResponse> {
    console.log('Mock: Resetting password with token:', token);
    await mockDelay();
    
    if (password === confirmPassword) {
      return MOCK_DATA.resetPassword;
    } else {
      return {
        success: false,
        message: 'Passwords do not match',
        errors: { password: ['Passwords must match'] }
      };
    }
  }

  // Update password
  async updatePassword(currentPassword: string, newPassword: string): Promise<APIResponse> {
    console.log('Mock: Updating password');
    await mockDelay();
    return MOCK_DATA.updatePassword;
  }
}

export const mockApiService = new MockApiService();

// Mock tracking API methods
export const mockTrackingAPI = {
  // Track by AWB numbers
  trackByAwb: async (awbNumbers: string | string[]) => {
    console.log('Mock: Tracking AWB:', awbNumbers);
    await mockDelay();
    return MOCK_DATA.trackingAwb;
  },

  // Track by shipment numbers
  trackByShipment: async (shipmentNumbers: string | string[]) => {
    console.log('Mock: Tracking Shipment:', shipmentNumbers);
    await mockDelay();
    return MOCK_DATA.trackingShipment;
  },

  // Track by reference numbers
  trackByReference: async (referenceNumbers: string | string[]) => {
    console.log('Mock: Tracking Reference:', referenceNumbers);
    await mockDelay();
    return MOCK_DATA.trackingReference;
  },

  // Generic tracking method
  track: async (trackingIds: string | string[], type: 'awb' | 'shipment' | 'reference' = 'awb') => {
    console.log('Mock: Generic tracking:', { trackingIds, type });
    await mockDelay();
    
    switch (type) {
      case 'awb':
        return MOCK_DATA.trackingAwb;
      case 'shipment':
        return MOCK_DATA.trackingShipment;
      case 'reference':
        return MOCK_DATA.trackingReference;
      default:
        return MOCK_DATA.trackingAwb;
    }
  }
};

export default mockApiService;