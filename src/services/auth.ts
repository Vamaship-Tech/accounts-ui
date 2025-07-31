// Authentication Service for managing user sessions and tokens

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  accountType: 'seller' | 'buyer';
  brandName?: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  kycCompleted: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

class AuthService {
  private readonly TOKEN_KEY = 'vamaship_auth_tokens';
  private readonly USER_KEY = 'vamaship_user_data';

  // Get stored tokens
  getTokens(): AuthTokens | null {
    try {
      const tokens = localStorage.getItem(this.TOKEN_KEY);
      if (!tokens) return null;

      const parsedTokens: AuthTokens = JSON.parse(tokens);
      
      // Check if token is expired
      if (Date.now() > parsedTokens.expiresAt) {
        this.clearTokens();
        return null;
      }

      return parsedTokens;
    } catch (error) {
      console.error('Error parsing stored tokens:', error);
      this.clearTokens();
      return null;
    }
  }

  // Store tokens
  setTokens(tokens: AuthTokens): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  // Clear stored tokens
  clearTokens(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // Get stored user data
  getUser(): User | null {
    try {
      const user = localStorage.getItem(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      this.clearUser();
      return null;
    }
  }

  // Store user data
  setUser(user: User): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  // Clear stored user data
  clearUser(): void {
    try {
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    const user = this.getUser();
    return !!(tokens && user);
  }

  // Get access token for API requests
  getAccessToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.accessToken || null;
  }

  // Logout user
  logout(): void {
    this.clearTokens();
    this.clearUser();
  }

  // Update user data
  updateUser(updates: Partial<User>): void {
    const currentUser = this.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      this.setUser(updatedUser);
    }
  }

  // Check if token needs refresh
  needsTokenRefresh(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return false;

    // Refresh token if it expires in the next 5 minutes
    const refreshThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() + refreshThreshold > tokens.expiresAt;
  }

  // Get authorization header for API requests
  getAuthHeader(): Record<string, string> {
    const token = this.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();
export default authService; 