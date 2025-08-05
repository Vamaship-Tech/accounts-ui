// Mock data for API responses
import { APIResponse } from '../services/api'

// Mock delay function to simulate network latency
export const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

export const MOCK_DATA = {
  // Authentication responses
  login: {
    success: true,
    data: {
      user: {
        id: 1,
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+919876543210',
        accountType: 'seller',
        brandName: 'John\'s Store',
        isVerified: true,
        kycStatus: 'completed'
      },
      token: 'mock-jwt-token-123456789',
      refreshToken: 'mock-refresh-token-987654321'
    },
    message: 'Login successful'
  } as APIResponse,

  register: {
    success: true,
    data: {
      user: {
        id: 2,
        fullName: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+919876543211',
        accountType: 'buyer'
      },
      message: 'Registration successful. Please verify your email.'
    },
    message: 'User registered successfully'
  } as APIResponse,

  completeSignup: {
    success: true,
    data: {
      user: {
        id: 3,
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+919876543212',
        accountType: 'seller',
        brandName: 'Test Store',
        kycStatus: 'pending'
      },
      token: 'mock-jwt-token-signup',
      message: 'Signup completed successfully'
    },
    message: 'Signup completed'
  } as APIResponse,

  // OTP responses
  sendOTP: {
    success: true,
    data: {
      otp: '123456', // In real scenario, this wouldn't be sent
      message: 'OTP sent successfully'
    },
    message: 'OTP sent to your mobile number'
  } as APIResponse,

  verifyOTP: {
    success: true,
    result: 1,
    data: {
      verified: true,
      message: 'OTP verified successfully'
    },
    message: 'Mobile number verified'
  } as APIResponse,

  sendAadhaarOTP: {
    success: true,
    data: {
      transactionId: 'mock-txn-123',
      message: 'Aadhaar OTP sent successfully'
    },
    message: 'OTP sent to your Aadhaar registered mobile'
  } as APIResponse,

  verifyAadhaarOTP: {
    success: true,
    data: {
      verified: true,
      aadhaarData: {
        name: 'JOHN DOE',
        dob: '01/01/1990',
        gender: 'M',
        address: '123, Sample Street, Sample City, Sample State - 123456'
      }
    },
    message: 'Aadhaar OTP verified successfully'
  } as APIResponse,

  // User profile
  userProfile: {
    success: true,
    data: {
      id: 1,
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+919876543210',
      brandName: 'John\'s Store',
      accountType: 'seller',
      isVerified: true,
      kycStatus: 'completed',
      createdAt: '2024-01-01T00:00:00Z'
    }
  } as APIResponse,

  // KYC responses
  kycStatus: {
    success: true,
    data: {
      isCompleted: false,
      pendingSteps: ['gst_verification', 'bank_verification'],
      completedSteps: ['mobile_verification', 'email_verification']
    }
  } as APIResponse,

  submitKYC: {
    success: true,
    data: {
      kycId: 'kyc-123456',
      status: 'submitted',
      message: 'KYC submitted successfully'
    },
    message: 'KYC details submitted for verification'
  } as APIResponse,

  skipKYC: {
    success: true,
    data: {
      message: 'KYC skipped successfully'
    },
    message: 'You can complete KYC later from your profile'
  } as APIResponse,

  // Validation responses
  validateGST: {
    success: true,
    data: {
      gstNumber: '29ABCDE1234F1Z5',
      businessName: 'SAMPLE BUSINESS PVT LTD',
      address: '123, Business Street, Business City, Karnataka - 560001',
      status: 'Active',
      registrationDate: '2020-01-15'
    }
  } as APIResponse,

  validatePAN: {
    success: true,
    data: {
      panNumber: 'ABCDE1234F',
      name: 'JOHN DOE',
      status: 'Valid',
      category: 'Individual'
    }
  } as APIResponse,

  validateBank: {
    success: true,
    data: {
      accountNumber: '1234567890',
      ifscCode: 'HDFC0001234',
      bankName: 'HDFC Bank',
      branchName: 'Sample Branch',
      accountHolderName: 'JOHN DOE',
      accountType: 'Savings'
    }
  } as APIResponse,

  // Master data
  countryCodes: {
    success: true,
    data: [
      { code: '+91', country: 'India', flag: '🇮🇳' },
      { code: '+1', country: 'United States', flag: '🇺🇸' },
      { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
      { code: '+971', country: 'UAE', flag: '🇦🇪' }
    ]
  } as APIResponse,

  banksList: {
    success: true,
    data: {
      banks: [
        { name: 'State Bank of India' },
        { name: 'HDFC Bank' },
        { name: 'ICICI Bank' },
        { name: 'Axis Bank' },
        { name: 'Punjab National Bank' }
      ]
    }
  } as APIResponse,

  entityTypes: {
    success: true,
    data: [
      { id: 1, name: 'Proprietorship', code: 'PROP' },
      { id: 2, name: 'Partnership', code: 'PART' },
      { id: 3, name: 'Private Limited Company', code: 'PVT' },
      { id: 4, name: 'Public Limited Company', code: 'PUB' },
      { id: 5, name: 'LLP', code: 'LLP' }
    ]
  } as APIResponse,

  pincodeDetails: {
    success: true,
    data: {
      pincode: '560001',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      region: 'South'
    }
  } as APIResponse,

  checkEmailExists: {
    success: true,
    data: {
      exists: false,
      message: 'Email is available'
    }
  } as APIResponse,

  // Password management
  forgotPassword: {
    success: true,
    data: {
      message: 'Password reset link sent to your email'
    },
    message: 'Password reset instructions sent'
  } as APIResponse,

  resetPassword: {
    success: true,
    data: {
      message: 'Password reset successfully'
    },
    message: 'Your password has been updated'
  } as APIResponse,

  updatePassword: {
    success: true,
    data: {
      message: 'Password updated successfully'
    },
    message: 'Password changed successfully'
  } as APIResponse,

  // Tracking responses
  trackingAwb: {
    success: true,
    data: [
      {
        awbNumber: 'AWB123456789',
        status: 'In Transit',
        currentLocation: 'Mumbai Hub',
        estimatedDelivery: '2024-01-15',
        trackingHistory: [
          {
            date: '2024-01-10',
            time: '10:30 AM',
            status: 'Picked Up',
            location: 'Bangalore'
          },
          {
            date: '2024-01-11',
            time: '08:15 AM',
            status: 'In Transit',
            location: 'Mumbai Hub'
          },
          {
            date: '2024-01-12',
            time: '11:45 AM',
            status: 'Out for Delivery',
            location: 'Delhi Hub'
          }
        ]
      }
    ]
  },

  trackingShipment: {
    success: true,
    data: [
      {
        shipmentNumber: 'SHP987654321',
        status: 'Delivered',
        deliveredDate: '2024-01-13',
        recipientName: 'Jane Smith',
        trackingHistory: [
          {
            date: '2024-01-10',
            time: '02:00 PM',
            status: 'Shipped',
            location: 'Chennai'
          },
          {
            date: '2024-01-13',
            time: '04:30 PM',
            status: 'Delivered',
            location: 'Hyderabad'
          }
        ]
      }
    ]
  },

  trackingReference: {
    success: true,
    data: [
      {
        referenceNumber: 'REF456789123',
        status: 'Processing',
        orderDate: '2024-01-14',
        items: [
          { name: 'Product A', quantity: 2 },
          { name: 'Product B', quantity: 1 }
        ]
      }
    ]
  },

  // Error responses for testing
  errorResponse: {
    success: false,
    message: 'Something went wrong',
    errors: {
      field1: ['This field is required'],
      field2: ['Invalid format']
    }
  } as APIResponse,

  validationError: {
    success: false,
    message: 'Validation failed',
    errors: {
      email: ['Please enter a valid email address'],
      password: ['Password must be at least 8 characters']
    }
  } as APIResponse
}

// Mock error scenarios for testing
export const MOCK_ERRORS = {
  networkError: () => Promise.reject(new Error('Network error')),
  timeoutError: () => Promise.reject(new Error('Request timeout')),
  serverError: () => Promise.resolve({
    success: false,
    message: 'Internal server error'
  } as APIResponse),
  unauthorizedError: () => Promise.resolve({
    success: false,
    message: 'Unauthorized access'
  } as APIResponse)
}