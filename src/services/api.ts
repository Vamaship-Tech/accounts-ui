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

export interface VerifyKYCData {
  businessType: 'gst' | 'pan';
  gstNumber?: string;
  entityName?: string;
  gstAddress?: string;
  gstPincode?: string;
  panNumber?: string;
  entityType?: string;
  billingAddress?: string;
  panPincode?: string;
  beneficiaryName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  aadhaarNumber?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

class ApiService {
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

  private async requestWithRetry<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Check if this is a public endpoint (no auth required)
    const isPublicEndpoint = endpoint.includes('/public/') || 
                           endpoint.includes('/register') || 
                           endpoint.includes('/login') || 
                           endpoint.includes('/forgot-password') ||
                           endpoint.includes('/country-master');
    
    console.log('API Request:', { url, endpoint, isPublic: isPublicEndpoint });
    console.log('Custom auth headers:', this.authHeaders);
    
    const defaultOptions: RequestInit = {
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        // Use custom auth headers if set, otherwise use default auth service headers
        ...(Object.keys(this.authHeaders).length > 0 ? this.authHeaders : (isPublicEndpoint ? {} : authService.getAuthHeader())),
      },
      ...options,
    };

    console.log('Final request headers:', defaultOptions.headers);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('API Response Status:', response.status);
      
      const data = await response.json();
      console.log('API Response Data:', data);

      if (!response.ok) {
        console.log('API Error Response:', { status: response.status, data });
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

      const result = {
        success: true,
        data,
      };
      
      console.log('API Success Result:', result);
      
      return result;
    } catch (error) {
      console.error('API Request Error:', error);

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
    } catch (error: any) {
      console.error('Frontend completeSignup error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
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

  // Submit KYC for verify-kyc flow
  async submitKyc(kycData: VerifyKYCData): Promise<APIResponse> {
    console.log('API: Submitting KYC data:', kycData)
    
    const endpoint = kycData.businessType === 'gst' 
      ? API_CONFIG.ENDPOINTS.KYC_GST_REGISTERED_PUBLIC 
      : API_CONFIG.ENDPOINTS.KYC_GST_UNREGISTERED_PUBLIC;
    
    console.log('API: Using endpoint:', endpoint)
    
    try {
      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(kycData),
      });
      
      console.log('API: KYC submission response:', response)
      return response
    } catch (error) {
      console.error('API: KYC submission error:', error)
      throw error
    }
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

  // Public verification methods for signup flow
  async validateGstPublic(gstNumber: string): Promise<APIResponse> {
    console.log('=== FRONTEND VALIDATE GST PUBLIC START ===');
    console.log('Validating GST:', gstNumber);
    console.log('Endpoint:', API_CONFIG.ENDPOINTS.VALIDATE_GST_PUBLIC);
    
    try {
      const response = await this.request(`${API_CONFIG.ENDPOINTS.VALIDATE_GST_PUBLIC}?gst=${gstNumber}`);
      console.log('GST validation response:', response);
      console.log('=== FRONTEND VALIDATE GST PUBLIC SUCCESS ===');
      return response;
    } catch (error) {
      console.error('GST validation error:', error);
      console.log('=== FRONTEND VALIDATE GST PUBLIC FAILED ===');
      throw error;
    }
  }

  async validatePanPublic(panNumber: string): Promise<APIResponse> {
    console.log('=== FRONTEND VALIDATE PAN PUBLIC START ===');
    console.log('Validating PAN:', panNumber);
    console.log('Endpoint:', API_CONFIG.ENDPOINTS.VALIDATE_PAN_PUBLIC);
    
    try {
      const response = await this.request(`${API_CONFIG.ENDPOINTS.VALIDATE_PAN_PUBLIC}?pan=${panNumber}`);
      console.log('PAN validation response:', response);
      console.log('=== FRONTEND VALIDATE PAN PUBLIC SUCCESS ===');
      return response;
    } catch (error) {
      console.error('PAN validation error:', error);
      console.log('=== FRONTEND VALIDATE PAN PUBLIC FAILED ===');
      throw error;
    }
  }

  async validateBankPublic(accountNumber: string, ifscCode: string): Promise<APIResponse> {
    console.log('API: Validating Bank:', { accountNumber, ifscCode });
    
    try {
      const response = await this.request(`${API_CONFIG.ENDPOINTS.VALIDATE_BANK_PUBLIC}?account_number=${accountNumber}&ifsc_code=${ifscCode}`);
      console.log('API: Bank validation response:', response);
      return response;
    } catch (error) {
      console.error('API: Bank validation error:', error);
      throw error;
    }
  }

  // Check if email exists
  async checkEmailExists(email: string): Promise<APIResponse> {
    console.log('API: Checking if email exists:', email);
    
    try {
      const response = await this.request(`${API_CONFIG.ENDPOINTS.CHECK_EMAIL_EXISTS}?email=${encodeURIComponent(email)}`);
      console.log('API: Email exists check response:', response);
      return response;
    } catch (error) {
      console.error('API: Email exists check error:', error);
      throw error;
    }
  }

  // Get banks list
  async getBanksList(): Promise<APIResponse> {
    console.log('=== API GET BANKS LIST START ===');
    console.log('Calling endpoint:', API_CONFIG.ENDPOINTS.BANKS_LIST);
    
    try {
      const response = await this.request(API_CONFIG.ENDPOINTS.BANKS_LIST);
      console.log('API getBanksList response:', response);
      console.log('=== API GET BANKS LIST SUCCESS ===');
      return response;
    } catch (error) {
      console.error('API getBanksList error:', error);
      console.log('=== API GET BANKS LIST FAILED ===');
      throw error;
    }
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
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email }),
    });
  }

  // Reset password with token
  async resetPassword(token: string, password: string, confirmPassword: string): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.RESET_PASSWORD, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        token,
        password,
        password_confirmation: confirmPassword
      }),
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

// Tracking API methods
export const trackingAPI = {
  // Track by AWB numbers
  trackByAwb: async (awbNumbers: string | string[]) => {
    try {
      const awbString = Array.isArray(awbNumbers) ? awbNumbers.join(',') : awbNumbers;
      const url = `${API_CONFIG.TRACKING_BASE_URL}${API_CONFIG.ENDPOINTS.TRACK_AWB}/${awbString}`;
      console.log('Tracking AWB URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getAccessToken()}`,
        },
      });
      
      console.log('Tracking AWB Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Tracking AWB Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Tracking AWB Success Response:', data);
      return data;
    } catch (error) {
      console.error('Error tracking by AWB:', error);
      throw error;
    }
  },

  // Track by shipment numbers
  trackByShipment: async (shipmentNumbers: string | string[]) => {
    try {
      const shipmentString = Array.isArray(shipmentNumbers) ? shipmentNumbers.join(',') : shipmentNumbers;
      const url = `${API_CONFIG.TRACKING_BASE_URL}${API_CONFIG.ENDPOINTS.TRACK_SHIPMENT}/${shipmentString}`;
      console.log('Tracking Shipment URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getAccessToken()}`,
        },
      });
      
      console.log('Tracking Shipment Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Tracking Shipment Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Tracking Shipment Success Response:', data);
      return data;
    } catch (error) {
      console.error('Error tracking by shipment:', error);
      throw error;
    }
  },

  // Track by reference numbers
  trackByReference: async (referenceNumbers: string | string[]) => {
    try {
      const referenceString = Array.isArray(referenceNumbers) ? referenceNumbers.join(',') : referenceNumbers;
      const url = `${API_CONFIG.TRACKING_BASE_URL}${API_CONFIG.ENDPOINTS.TRACK_REFERENCE}/${referenceString}`;
      console.log('Tracking Reference URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getAccessToken()}`,
        },
      });
      
      console.log('Tracking Reference Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Tracking Reference Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Tracking Reference Success Response:', data);
      return data;
    } catch (error) {
      console.error('Error tracking by reference:', error);
      throw error;
    }
  },

  // Generic tracking method
  track: async (trackingIds: string | string[], type: 'awb' | 'shipment' | 'reference' = 'awb') => {
    try {
      const trackingString = Array.isArray(trackingIds) ? trackingIds.join(',') : trackingIds;
      
      let endpoint = '';
      switch (type) {
        case 'awb':
          endpoint = `${API_CONFIG.ENDPOINTS.TRACK_AWB}/${trackingString}`;
          break;
        case 'shipment':
          endpoint = `${API_CONFIG.ENDPOINTS.TRACK_SHIPMENT}/${trackingString}`;
          break;
        case 'reference':
          endpoint = `${API_CONFIG.ENDPOINTS.TRACK_REFERENCE}/${trackingString}`;
          break;
        default:
          endpoint = `${API_CONFIG.ENDPOINTS.TRACK_AWB}/${trackingString}`;
      }
      
      const url = `${API_CONFIG.TRACKING_BASE_URL}${endpoint}`;
      console.log('Generic Tracking URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getAccessToken()}`,
        },
      });
      
      console.log('Generic Tracking Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Generic Tracking Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Generic Tracking Success Response:', data);
      return data;
    } catch (error) {
      console.error('Error tracking shipment:', error);
      throw error;
    }
  }
}; 