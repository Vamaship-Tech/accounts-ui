import { API_CONFIG } from '../config/api'
import { authService } from './auth'


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
  brandName?: string;
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
  result?: number;
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
    
    const isPublicEndpoint = endpoint.includes('/public/') || 
                           endpoint.includes('/register') || 
                           endpoint.includes('/login') || 
                           endpoint.includes('/forgot-password') ||
                           endpoint.includes('/country-master') ||
                           endpoint.includes('/send-verification/') ||
                           endpoint.includes('/verify/') ||
                           endpoint.includes('/complete-signup');
    
    const defaultOptions: RequestInit = {
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...(Object.keys(this.authHeaders).length > 0 ? this.authHeaders : (isPublicEndpoint ? {} : authService.getAuthHeader())),
      },
      redirect: 'manual',
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
        data: data.data || data,
        message: data.message,
      };
      
      return result;
    } catch (error) {
      if (retryCount < API_CONFIG.RETRY_ATTEMPTS && error instanceof TypeError) {
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

  async sendOTP(phone: string): Promise<APIResponse> {
    try {
      const response = await this.requestWithRetry(API_CONFIG.ENDPOINTS.SEND_MOBILE_OTP, {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async verifyOTP(phone: string, otp: string): Promise<APIResponse> {
    try {
      const response = await this.requestWithRetry(API_CONFIG.ENDPOINTS.VERIFY_MOBILE_OTP, {
        method: 'POST',
        body: JSON.stringify({ phone, otp }),
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async sendAadhaarOTP(aadhaarNumber: string): Promise<APIResponse> {
    try {
      const response = await this.requestWithRetry(API_CONFIG.ENDPOINTS.SEND_AADHAAR_OTP, {
        method: 'POST',
        body: JSON.stringify({ aadhaar_number: aadhaarNumber }),
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async verifyAadhaarOTP(aadhaarNumber: string, otp: string): Promise<APIResponse> {
    try {
      const response = await this.requestWithRetry(API_CONFIG.ENDPOINTS.VERIFY_AADHAAR_OTP, {
        method: 'POST',
        body: JSON.stringify({ aadhaar_number: aadhaarNumber, otp }),
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async registerUser(userData: SignUpData): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async completeSignup(data: any): Promise<any> {
    try {
      const response = await this.requestWithRetry(
        API_CONFIG.ENDPOINTS.COMPLETE_SIGNUP,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  async updateUserProfile(userData: UserDetailsData): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.USER_PROFILE, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async submitKYC(kycData: KYCData): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.KYC_GST_REGISTERED, {
      method: 'POST',
      body: JSON.stringify(kycData),
    });
  }

  async submitKyc(kycData: VerifyKYCData): Promise<APIResponse> {
    const endpoint = kycData.businessType === 'gst' 
      ? API_CONFIG.ENDPOINTS.KYC_GST_REGISTERED_PUBLIC 
      : API_CONFIG.ENDPOINTS.KYC_GST_UNREGISTERED_PUBLIC;
    
    try {
      const response = await this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(kycData),
      });
      
      return response
    } catch (error) {
      throw error
    }
  }

  async generateKycToken(apiKey: string): Promise<APIResponse> {
    try {
      const response = await this.request(API_CONFIG.ENDPOINTS.GENERATE_KYC_TOKEN, {
        method: 'POST',
        body: JSON.stringify({ api_key: apiKey }),
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async skipKYC(): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.KYC_SKIP, {
      method: 'POST',
    });
  }

  async getCountryCodes(): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.COUNTRY_CODES);
  }

  async validateGST(gstNumber: string): Promise<APIResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.VALIDATE_GST}?gst=${gstNumber}`);
  }

  async validatePAN(panNumber: string): Promise<APIResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.VALIDATE_PAN}?pan=${panNumber}`);
  }

  async validateBank(accountNumber: string, ifscCode: string): Promise<APIResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.VALIDATE_BANK}?account_number=${accountNumber}&ifsc_code=${ifscCode}`);
  }

  async validateGstPublic(gstNumber: string): Promise<APIResponse> {
    try {
      const response = await this.request(`${API_CONFIG.ENDPOINTS.VALIDATE_GST_PUBLIC}?gst=${gstNumber}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async validatePanPublic(panNumber: string): Promise<APIResponse> {
    try {
      const response = await this.request(`${API_CONFIG.ENDPOINTS.VALIDATE_PAN_PUBLIC}?pan=${panNumber}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async validateBankPublic(accountNumber: string, ifscCode: string): Promise<APIResponse> {
    try {
      const response = await this.request(`${API_CONFIG.ENDPOINTS.VALIDATE_BANK_PUBLIC}?account_number=${accountNumber}&ifsc_code=${ifscCode}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async checkEmailExists(email: string): Promise<APIResponse> {
    try {
      const response = await this.request(`${API_CONFIG.ENDPOINTS.CHECK_EMAIL_EXISTS}?email=${encodeURIComponent(email)}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async checkMobileExists(phone: string): Promise<APIResponse> {
    try {
      const response = await this.request(API_CONFIG.ENDPOINTS.CHECK_MOBILE_EXISTS, {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getBanksList(): Promise<APIResponse> {
    try {
      const response = await this.request(API_CONFIG.ENDPOINTS.BANKS_LIST, {
        method: 'GET',
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getEntityTypes(): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.ENTITY_TYPES);
  }

  async getPincodeDetails(pincode: string): Promise<APIResponse> {
    return this.request(`${API_CONFIG.ENDPOINTS.PINCODE_DETAILS}/${pincode}`);
  }

  async checkKYCStatus(): Promise<APIResponse> {
    try {
      const response = await this.request(API_CONFIG.ENDPOINTS.KYC_STATUS);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getUserDetails(): Promise<APIResponse> {
    try {
      const response = await this.request(API_CONFIG.ENDPOINTS.ME);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async googleLogin(email: string, credential: string, firstName?: string, lastName?: string): Promise<APIResponse> {
    return this.request(API_CONFIG.ENDPOINTS.GOOGLE_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        credential,
        first_name: firstName,
        last_name: lastName
      }),
    });
  }

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

export const trackingAPI = {
  trackByAwb: async (awbNumbers: string | string[]) => {
    try {
      const awbString = Array.isArray(awbNumbers) ? awbNumbers.join(',') : awbNumbers;
      const url = `${API_CONFIG.TRACKING_BASE_URL}${API_CONFIG.ENDPOINTS.TRACK_AWB}/${awbString}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getAccessToken()}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  trackByShipment: async (shipmentNumbers: string | string[]) => {
    try {
      const shipmentString = Array.isArray(shipmentNumbers) ? shipmentNumbers.join(',') : shipmentNumbers;
      const url = `${API_CONFIG.TRACKING_BASE_URL}${API_CONFIG.ENDPOINTS.TRACK_SHIPMENT}/${shipmentString}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getAccessToken()}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

  trackByReference: async (referenceNumbers: string | string[]) => {
    try {
      const referenceString = Array.isArray(referenceNumbers) ? referenceNumbers.join(',') : referenceNumbers;
      const url = `${API_CONFIG.TRACKING_BASE_URL}${API_CONFIG.ENDPOINTS.TRACK_REFERENCE}/${referenceString}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getAccessToken()}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },

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
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getAccessToken()}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}; 