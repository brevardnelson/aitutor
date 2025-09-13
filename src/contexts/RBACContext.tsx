// RBAC Context for Multi-Institutional Platform

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { rbacAuthAPI } from '@/lib/rbac-auth-api';
import type { AuthUser, UserRole, School } from '@/types/auth';

interface RBACContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  currentSchool: School | null;
  availableSchools: School[];
  
  // Authentication methods
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string, 
    password: string, 
    fullName: string, 
    role: UserRole, 
    schoolId?: number,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  
  // School management
  switchSchool: (school: School) => void;
  refreshSchools: () => Promise<void>;
  
  // Permission checking
  hasRole: (role: UserRole, schoolId?: number) => boolean;
  hasPermission: (permission: string, schoolId?: number) => boolean;
  hasAnyRole: (roles: UserRole[], schoolId?: number) => boolean;
  canAccessSchool: (schoolId: number) => boolean;
  
  // Admin operations
  inviteUser: (userData: {
    email: string;
    role: UserRole;
    schoolId?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  
  createSchool: (schoolData: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  }) => Promise<{ success: boolean; error?: string; school?: School }>;
}

const RBACContext = createContext<RBACContextType | null>(null);

export const RBACProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);

  useEffect(() => {
    checkAuthState();
    
    // Listen for storage changes (for cross-tab authentication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'caribbeanAI_rbac_session') {
        checkAuthState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (user) {
      loadUserSchools();
    }
  }, [user]);

  const checkAuthState = async () => {
    setIsLoading(true);
    try {
      const currentUser = await rbacAuthAPI.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        // Set current school from user's primary school role
        const schoolRole = currentUser.roles?.find(r => r.schoolId);
        if (schoolRole && currentUser.currentSchool) {
          setCurrentSchool(currentUser.currentSchool);
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setUser(null);
      setCurrentSchool(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserSchools = async () => {
    if (!user) return;
    
    try {
      const result = await rbacAuthAPI.getSchools();
      const schools = result.success ? result.schools || [] : [];
      setAvailableSchools(schools);
      
      // Set current school if not set and user has schools
      if (!currentSchool && schools.length > 0) {
        setCurrentSchool(schools[0]);
      }
    } catch (error) {
      console.error('Error loading user schools:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await rbacAuthAPI.signIn(email, password);
      if (result.error) {
        return { success: false, error: result.error };
      }
      if (result.user && result.roles) {
        const authUser: AuthUser = {
          ...result.user,
          roles: result.roles,
          primaryRole: rbacAuthAPI.getPrimaryRole(result.roles),
        };
        setUser(authUser);
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
    role: UserRole, 
    schoolId?: number,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Note: In the new system, users are invited rather than signing up directly
    // This method is maintained for compatibility but should not be used
    return { success: false, error: 'Direct signup not supported. Users must be invited by administrators.' };
  };

  const signOut = async (): Promise<void> => {
    await rbacAuthAPI.signOut();
    setUser(null);
    setCurrentSchool(null);
    setAvailableSchools([]);
  };

  const switchSchool = (school: School) => {
    setCurrentSchool(school);
  };

  const refreshSchools = async () => {
    if (user) {
      await loadUserSchools();
    }
  };

  // Permission checking helpers
  const hasRole = (role: UserRole, schoolId?: number): boolean => {
    return rbacAuthAPI.hasRole(user, role, schoolId);
  };

  const hasPermission = (permission: string, schoolId?: number): boolean => {
    return rbacAuthAPI.hasPermission(user, permission, schoolId);
  };

  const hasAnyRole = (roles: UserRole[], schoolId?: number): boolean => {
    return rbacAuthAPI.hasAnyRole(user, roles, schoolId);
  };

  const canAccessSchool = (schoolId: number): boolean => {
    return rbacAuthAPI.canAccessSchool(user, schoolId);
  };

  // Admin operations
  const inviteUser = async (userData: {
    email: string;
    role: UserRole;
    schoolId?: number;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    return await rbacAuthAPI.inviteUser(userData);
  };

  const createSchool = async (schoolData: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  }): Promise<{ success: boolean; error?: string; school?: School }> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const result = await rbacAuthAPI.createSchool(schoolData);
      
      if (result.success) {
        // Refresh available schools
        await refreshSchools();
        return { success: true, school: result.school };
      } else {
        return { success: false, error: result.error || 'Failed to create school' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to create school' };
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    currentSchool,
    availableSchools,
    signIn,
    signUp,
    signOut,
    switchSchool,
    refreshSchools,
    hasRole,
    hasPermission,
    hasAnyRole,
    canAccessSchool,
    inviteUser,
    createSchool,
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
};

export const useRBAC = (): RBACContextType => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};

export default RBACContext;