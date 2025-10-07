// API-based authentication service using backend JWT authentication

export interface APIUser {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  roles: {
    id: number;
    role: string;
    schoolId?: number;
    permissions: string[];
    isActive: boolean;
  }[];
  primaryRole: string;
}

export interface AuthResponse {
  success: boolean;
  user?: APIUser;
  token?: string;
  error?: string;
}

class APIAuthService {
  private readonly API_URL = '/api/auth';
  
  // Store token in localStorage
  private getToken(): string | null {
    return localStorage.getItem('caribbeanAI_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('caribbeanAI_token', token);
  }

  private clearToken(): void {
    localStorage.removeItem('caribbeanAI_token');
  }

  // Get current authenticated user
  async getCurrentUser(): Promise<APIUser | null> {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${this.API_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.clearToken();
        return null;
      }

      const data = await response.json();
      return data.user || null;
    } catch (error) {
      console.error('Get current user error:', error);
      this.clearToken();
      return null;
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_URL}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: data.error || 'Sign in failed' 
        };
      }

      if (data.token) {
        this.setToken(data.token);
      }

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        success: false, 
        error: 'Network error. Please check your connection.' 
      };
    }
  }

  // Sign up (parent self-registration)
  async signUp(email: string, password: string, fullName: string, phone?: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          error: data.error || 'Sign up failed' 
        };
      }

      if (data.token) {
        this.setToken(data.token);
      }

      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        success: false, 
        error: 'Network error. Please check your connection.' 
      };
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    const token = this.getToken();
    
    if (token) {
      try {
        await fetch(`${this.API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Sign out error:', error);
      }
    }

    this.clearToken();
  }
}

export const apiAuthService = new APIAuthService();
