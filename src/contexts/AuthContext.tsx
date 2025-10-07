import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { APIUser, apiAuthService } from '@/lib/api-auth';

interface AuthContextType {
  user: APIUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<APIUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
    
    // Listen for token changes (for cross-tab authentication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'caribbeanAI_token') {
        checkAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const checkAuthState = async () => {
    setIsLoading(true);
    try {
      const currentUser = await apiAuthService.getCurrentUser();
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
      const result = await apiAuthService.signIn(email, password);
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
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await apiAuthService.signUp(email, password, fullName, phone);
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
      await apiAuthService.signOut();
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