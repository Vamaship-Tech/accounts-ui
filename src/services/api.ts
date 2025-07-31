// API Service for connecting with accounts2.0 backend
import { API_CONFIG } from '../config/api'
import authService from './auth'

const API_BASE_URL = API_CONFIG.BASE_URL

export interface SignUpData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  brandName?: string;
  accountType: 'seller' | 'buyer';
  countryCode?: string;
  otp?: string[];
  businessType?: 'gst' | 'pan';
  entityType?: string;
  entityName?: string;
  billingAddress?: string;
  panPincode?: string;
}

export interface OTPVerificationData {
  phone: string;
  otp: string;
}

export interface UserDetailsData {
  fullName: string;
  email: string;
  brandName?: string;
  password: string;
  confirmPassword: string;
}

export interface KYCData {
  aadhaarNumber?: string;
  aadhaarOtp?: string[];
  gstNumber?: string;
  gstOtp?: string[];
  panNumber?: string;
  panOtp?: string[];
  beneficiaryName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  gstAddress?: string;
  gstPincode?: string;
  entityType?: string;
  entityName?: string;
  billingAddress?: string;
  panPincode?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Check if this is a public endpoint (no auth required)
    const isPublicEndpoint = endpoint.includes('/public') || 
                           endpoint.includes('/register') || 
                           endpoint.includes('/login') || 
                           endpoint.includes('/forgot-password') ||
                           endpoint.includes('/country-master');
    
    const defaultOptions: RequestInit = {
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...(isPublicEndpoint ? {} : authService.getAuthHeader()),
      },
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          authService.logout();
          return {
            success: false,
            message: API_CONFIG.ERROR_MESSAGES.UNAUTHORIZED,
            errors: data.errors,
          };
        }

        if (response.status >= 500) {
          return {
            success: false,
            message: API_CONFIG.ERROR_MESSAGES.SERVER_ERROR,
            errors: data.errors,
          };
        }

        return {
          success: false,
          message: data.message || API_CONFIG.ERROR_MESSAGES.VALIDATION_ERROR,
          errors: data.errors,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API Request failed:', error);

      // Retry logic for network errors
      if (retryCount < API_CONFIG.RETRY_ATTEMPTS && error instanceof TypeError) {
        console.log(`Retrying request (${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS})`);
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
        return this.requestWithRetry(endpoint, options, retryCount + 1);
      }

      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          message: API_CONFIG.ERROR_MESSAGES.TIMEOUT_ERROR,
        };
      }

      return {
        success: false,
        message: API_CONFIG.ERROR_MESSAGES.NETWORK_ERROR,
      };
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    return this.requestWithRetry(endpoint, options);
  }

  // Send mobile OTP
  async sendOTP(phone: string): Promise<APIResponse> {
    console.log('=== FRONTEND SEND MOBILE OTP START ===');
    console.log('Sending mobile OTP request for:', phone);
    
    try {
      const response = await this.requestWithRetry(API_CONFIG.ENDPOINTS.SEND_MOBILE_OTP, {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      
      console.log('Send mobile OTP response:', response);
      console.log('=== FRONTEND SEND MOBILE OTP SUCCESS ===');
      return response;
    } catch (error) {
      console.error('Send mobile OTP error:', error);
      console.log('=== FRONTEND SEND MOBILE OTP FAILED ===');
      throw error;
    }
  }

  // Verify mobile OTP
  async verifyOTP(phone: string, otp: string): Promise<APIResponse> {
    console.log('=== FRONTEND VERIFY MOBILE OTP START ===');
    console.log('Verifying mobile OTP:', otp, 'for phone:', phone);
    
    try {
      const response = await this.requestWithRetry(API_CONFIG.ENDPOINTS.VERIFY_MOBILE_OTP, {
        method: 'POST',
        body: JSON.stringify({ phone, otp }),
      });
      
      console.log('Verify mobile OTP response:', response);
      console.log('=== FRONTEND VERIFY MOBILE OTP SUCCESS ===');
      return response;
    } catch (error) {
      console.error('Verify mobile OTP error:', error);
      console.log('=== FRONTEND VERIFY MOBILE OTP FAILED ===');
      throw error;
    }
  }

  // Send Aadhaar OTP
  async sendAadhaarOTP(aadhaarNumber: string): Promise<APIResponse> {
    console.log('=== FRONTEND SEND AADHAAR OTP START ===');
    console.log('Sending Aadhaar OTP request for:', aadhaarNumber);
    
    try {
      const response = await this.requestWithRetry(API_CONFIG.ENDPOINTS.SEND_AADHAAR_OTP, {
        method: 'POST',
        body: JSON.stringify({ aadhaar_number: aadhaarNumber }),
      });
      
      console.log('Send Aadhaar OTP response:', response);
      console.log('=== FRONTEND SEND AADHAAR OTP SUCCESS ===');
      return response;
    } catch (error) {
      console.error('Send Aadhaar OTP error:', error);
      console.log('=== FRONTEND SEND AADHAAR OTP FAILED ===');
      throw error;
    }
  }

  // Verify Aadhaar OTP
  async verifyAadhaarOTP(aadhaarNumber: string, otp: string): Promise<APIResponse> {
    console.log('=== FRONTEND VERIFY AADHAAR OTP START ===');
    console.log('Verifying Aadhaar OTP:', otp, 'for Aadhaar:', aadhaarNumber);
    
    try {
      const response = await this.requestWithRetry(API_CONFIG.ENDPOINTS.VERIFY_AADHAAR_OTP, {
        method: 'POST',
        body: JSON.stringify({ aadhaar_number: aadhaarNumber, otp }),
      });
      
      console.log('Verify Aadhaar OTP response:', response);
      console.log('=== FRONTEND VERIFY AADHAAR OTP SUCCESS ===');
      return response;
    } catch (error) {
      console.error('Verify Aadhaar OTP error:', error);
      console.log('=== FRONTEND VERIFY AADHAAR OTP FAILED ===');
      throw error;
    }
  }

  // Register new user
  async registerUser(userData: SignUpData): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Complete signup with KYC data
  async completeSignup(data: any): Promise<any> {
    console.log('=== FRONTEND COMPLETE SIGNUP START ===');
    console.log('Sending data to backend:', data);
    
    try {
      const response = await this.requestWithRetry(
        API_CONFIG.ENDPOINTS.COMPLETE_SIGNUP,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      
      console.log('Backend response:', response);
      console.log('=== FRONTEND COMPLETE SIGNUP SUCCESS ===');
      return response;
    } catch (error) {
      console.error('Frontend completeSignup error:', error);
      console.log('=== FRONTEND COMPLETE SIGNUP FAILED ===');
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userData: UserDetailsData): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.USER_PROFILE, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  // Submit KYC data
  async submitKYC(kycData: KYCData): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.KYC_GST_REGISTERED, {
      method: 'POST',
      body: JSON.stringify(kycData),
    });
  }

  // Skip KYC
  async skipKYC(): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.KYC_SKIP, {
      method: 'POST',
    });
  }

  // Get country calling codes
  async getCountryCodes(): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.COUNTRY_CODES);
  }

  // Validate GST number
  async validateGST(gstNumber: string): Promise<APIResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.VALIDATE_GST}?gst=${gstNumber}`);
  }

  // Validate PAN number
  async validatePAN(panNumber: string): Promise<APIResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.VALIDATE_PAN}?pan=${panNumber}`);
  }

  // Validate bank details
  async validateBank(accountNumber: string, ifscCode: string): Promise<APIResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.VALIDATE_BANK}?account_number=${accountNumber}&ifsc_code=${ifscCode}`);
  }

  // Get banks list
  async getBanksList(): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.BANKS_LIST);
  }

  // Get entity types
  async getEntityTypes(): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.ENTITY_TYPES);
  }

  // Get pincode details
  async getPincodeDetails(pincode: string): Promise<APIResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.PINCODE_DETAILS}/${pincode}`);
  }

  // Check KYC completion status
  async checkKYCStatus(): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.KYC_STATUS);
  }

  // Login user
  async login(email: string, password: string): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Forgot password
  async forgotPassword(email: string): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Update password
  async updatePassword(currentPassword: string, newPassword: string): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.UPDATE_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ 
        current_password: currentPassword, 
        new_password: newPassword 
      }),
    });
  }
}

export const apiService = new ApiService();
export default apiService; 