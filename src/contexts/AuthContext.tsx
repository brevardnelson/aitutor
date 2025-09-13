import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authService } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, role: any, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    setIsLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking auth state:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authService.signIn(email, password);
      if (result.error) {
        return { success: false, error: result.error };
      }
      if (result.user) {
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: any, 
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await authService.signUp(email, password, fullName, role, phone);
      if (result.error) {
        return { success: false, error: result.error };
      }
      if (result.user) {
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};