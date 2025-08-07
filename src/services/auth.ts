// Secure Token Management Utility
class SecureTokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly API_KEY_KEY = 'api_key';
  private static readonly SESSION_ID_KEY = 'session_id';
  
  /**
   * Store token securely in sessionStorage
   */
  static storeToken(token: string): void {
    try {
      // Generate a session ID for additional security
      const sessionId = this.generateSessionId();
      
      // Store token with session ID
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem(this.SESSION_ID_KEY, sessionId);
      
      // Set expiration (24 hours)
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
      sessionStorage.setItem('token_expires_at', expiresAt.toString());
      
      console.log('Token stored securely with session ID:', sessionId);
    } catch (error) {
      console.error('Failed to store token securely:', error);
    }
  }
  
  /**
   * Retrieve token securely
   */
  static getToken(): string | null {
    try {
      // Check if token has expired
      const expiresAt = sessionStorage.getItem('token_expires_at');
      if (expiresAt && Date.now() > parseInt(expiresAt)) {
        this.clearTokens();
        return null;
      }
      
      return sessionStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }
  
  /**
   * Store API key securely
   */
  static storeApiKey(apiKey: string): void {
    try {
      sessionStorage.setItem(this.API_KEY_KEY, apiKey);
      console.log('API key stored securely');
    } catch (error) {
      console.error('Failed to store API key:', error);
    }
  }
  
  /**
   * Retrieve API key securely
   */
  static getApiKey(): string | null {
    try {
      return sessionStorage.getItem(this.API_KEY_KEY);
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      return null;
    }
  }
  
  /**
   * Clear all tokens and sensitive data
   */
  static clearTokens(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.API_KEY_KEY);
      sessionStorage.removeItem(this.SESSION_ID_KEY);
      sessionStorage.removeItem('token_expires_at');
      sessionStorage.removeItem('ecom3_auth_token');
      sessionStorage.removeItem('ecom3_api_key');
      
      // Also clear from localStorage for backward compatibility
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.API_KEY_KEY);
      
      console.log('All tokens cleared securely');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }
  
  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    const apiKey = this.getApiKey();
    return !!(token || apiKey);
  }
  
  /**
   * Generate a secure session ID
   */
  private static generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Validate token format (basic validation)
   */
  static validateToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Basic JWT token validation (3 parts separated by dots)
    if (token.split('.').length !== 3) {
      return false;
    }
    
    return true;
  }
}

// Auth Service for SignIn.vue compatibility
interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  accountType: string;
  brandName?: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  kycCompleted: boolean;
}

const authService = {
  setTokens(tokens: Tokens): void {
    try {
      // Store tokens using SecureTokenManager
      SecureTokenManager.storeToken(tokens.accessToken);
      
      // Store additional token data
      sessionStorage.setItem('refresh_token', tokens.refreshToken);
      sessionStorage.setItem('token_expires_at', tokens.expiresAt.toString());
      
      console.log('Tokens stored via authService');
    } catch (error) {
      console.error('Failed to store tokens via authService:', error);
    }
  },
  
  setUser(userData: UserData): void {
    try {
      // Store user data in sessionStorage
      sessionStorage.setItem('user_data', JSON.stringify(userData));
      console.log('User data stored via authService');
    } catch (error) {
      console.error('Failed to store user data via authService:', error);
    }
  },
  
  getTokens(): Tokens | null {
    try {
      const accessToken = SecureTokenManager.getToken();
      const refreshToken = sessionStorage.getItem('refresh_token');
      const expiresAt = sessionStorage.getItem('token_expires_at');
      
      if (!accessToken) return null;
      
      return {
        accessToken,
        refreshToken: refreshToken || '',
        expiresAt: expiresAt ? parseInt(expiresAt) : 0
      };
    } catch (error) {
      console.error('Failed to get tokens via authService:', error);
      return null;
    }
  },
  
  getUser(): UserData | null {
    try {
      const userDataStr = sessionStorage.getItem('user_data');
      if (!userDataStr) return null;
      
      return JSON.parse(userDataStr);
    } catch (error) {
      console.error('Failed to get user data via authService:', error);
      return null;
    }
  },
  
  clearAuth(): void {
    try {
      SecureTokenManager.clearTokens();
      sessionStorage.removeItem('user_data');
      sessionStorage.removeItem('refresh_token');
      console.log('Auth data cleared via authService');
    } catch (error) {
      console.error('Failed to clear auth data via authService:', error);
    }
  }
};

export { SecureTokenManager, authService }; 