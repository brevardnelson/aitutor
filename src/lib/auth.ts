import { supabase } from './supabase';

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

class AuthService {
  async signUp(email: string, password: string, fullName: string, role: UserRole, phone?: string): Promise<AuthResponse> {
    try {
      // First, create the auth user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            phone
          }
        }
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to create user account' };
      }

      // For now, we'll use a simpler approach without database integration
      // TODO: Integrate with our database once we resolve the ID type mapping

      const user: User = {
        id: parseInt(authData.user.id.replace(/-/g, '').substring(0, 10), 16), // Convert UUID to number for compatibility
        email,
        full_name: fullName,
        role,
        phone,
        is_active: true
      };

      return { user, error: null };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred during signup' };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Invalid credentials' };
      }

      // For simplicity, use auth metadata directly
      const user: User = {
        id: parseInt(data.user.id.replace(/-/g, '').substring(0, 10), 16), // Convert UUID to number for compatibility
        email: data.user.email || '',
        full_name: data.user.user_metadata?.full_name || 'User',
        role: data.user.user_metadata?.role || 'parent',
        phone: data.user.user_metadata?.phone,
        is_active: true
      };

      return { user, error: null };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred during sign in' };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return null;
      }

      // For simplicity, use auth metadata directly
      const user: User = {
        id: parseInt(session.user.id.replace(/-/g, '').substring(0, 10), 16), // Convert UUID to number for compatibility
        email: session.user.email || '',
        full_name: session.user.user_metadata?.full_name || 'User',
        role: session.user.user_metadata?.role || 'parent',
        phone: session.user.user_metadata?.phone,
        is_active: true
      };
      return user;
    } catch (error) {
      return null;
    }
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.user;
  }
}

export const authService = new AuthService();