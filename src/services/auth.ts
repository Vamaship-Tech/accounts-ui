class SecureTokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly API_KEY_KEY = 'api_key';
  private static readonly SESSION_ID_KEY = 'session_id';
  
  static storeToken(token: string): void {
    try {
      const sessionId = this.generateSessionId();
      
      sessionStorage.setItem(this.TOKEN_KEY, token);
      sessionStorage.setItem(this.SESSION_ID_KEY, sessionId);
      
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
      sessionStorage.setItem('token_expires_at', expiresAt.toString());
    } catch (error) {
    }
  }
  
  static getToken(): string | null {
    try {
      const expiresAt = sessionStorage.getItem('token_expires_at');
      if (expiresAt && Date.now() > parseInt(expiresAt)) {
        this.clearTokens();
        return null;
      }
      
      return sessionStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      return null;
    }
  }
  
  static storeApiKey(apiKey: string): void {
    try {
      sessionStorage.setItem(this.API_KEY_KEY, apiKey);
    } catch (error) {
    }
  }
  
  static getApiKey(): string | null {
    try {
      return sessionStorage.getItem(this.API_KEY_KEY);
    } catch (error) {
      return null;
    }
  }
  
  static clearTokens(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.API_KEY_KEY);
      sessionStorage.removeItem(this.SESSION_ID_KEY);
      sessionStorage.removeItem('token_expires_at');
      sessionStorage.removeItem('ecom3_auth_token');
      sessionStorage.removeItem('ecom3_api_key');
      
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.API_KEY_KEY);
    } catch (error) {
    }
  }
  
  static isAuthenticated(): boolean {
    const token = this.getToken();
    const apiKey = this.getApiKey();
    return !!(token || apiKey);
  }
  
  private static generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  static validateToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    if (token.split('.').length !== 3) {
      return false;
    }
    
    return true;
  }
}

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
      SecureTokenManager.storeToken(tokens.accessToken);
      
      sessionStorage.setItem('refresh_token', tokens.refreshToken);
      sessionStorage.setItem('token_expires_at', tokens.expiresAt.toString());
    } catch (error) {
    }
  },
  
  setUser(userData: UserData): void {
    try {
      sessionStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
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
      return null;
    }
  },
  
  getUser(): UserData | null {
    try {
      const userDataStr = sessionStorage.getItem('user_data');
      if (!userDataStr) return null;
      
      return JSON.parse(userDataStr);
    } catch (error) {
      return null;
    }
  },
  
  clearAuth(): void {
    try {
      SecureTokenManager.clearTokens();
      sessionStorage.removeItem('user_data');
      sessionStorage.removeItem('refresh_token');
    } catch (error) {
    }
  },

  getAccessToken(): string | null {
    try {
      return SecureTokenManager.getToken();
    } catch (error) {
      return null;
    }
  },

  getAuthHeader(): Record<string, string> {
    try {
      const token = this.getAccessToken();
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    } catch (error) {
      return {};
    }
  },

  logout(): void {
    this.clearAuth();
  }
};

export { SecureTokenManager, authService }; 