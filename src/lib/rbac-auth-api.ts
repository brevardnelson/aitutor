// Real Backend API Service for RBAC Authentication
// Replaces localStorage simulation with actual HTTP API calls

import type { AuthUser, UserRole, School, UserRoleAssignment } from '@/types/auth';

const API_BASE_URL = 'http://localhost:3001/api';

interface APIAuthResult {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}

interface APISchoolResult {
  success: boolean;
  school?: School;
  error?: string;
}

interface APISchoolsResult {
  success: boolean;
  schools?: School[];
  error?: string;
}

interface APIStatsResult {
  success: boolean;
  stats?: {
    totalSchools: number;
    totalUsers: number;
    totalStudents: number;
    totalActiveRoles: number;
    roleBreakdown: Record<string, number>;
  };
  error?: string;
}

export class RBACAuthAPI {
  private token: string | null = null;

  constructor() {
    // Try to restore token from localStorage on initialization
    this.token = localStorage.getItem('caribbeanAI_auth_token');
  }

  // Helper method to get auth headers
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Convert backend user response to frontend AuthUser type
  private transformUser(backendUser: any): AuthUser {
    return {
      id: backendUser.id,
      email: backendUser.email,
      full_name: backendUser.fullName, // Map fullName to full_name for frontend compatibility
      phone: backendUser.phone,
      is_active: backendUser.isActive, // Map isActive to is_active for frontend compatibility
      roles: backendUser.roles || [],
      primaryRole: backendUser.primaryRole || 'student',
    };
  }

  // Authentication methods
  async signIn(email: string, password: string): Promise<{
    user: AuthUser | null;
    roles: UserRoleAssignment[] | null;
    error: string | null;
    token?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: APIAuthResult = await response.json();

      if (!response.ok || !data.success) {
        return {
          user: null,
          roles: null,
          error: data.error || 'Sign in failed',
        };
      }

      if (data.user && data.token) {
        // Store the token
        this.token = data.token;
        localStorage.setItem('caribbeanAI_auth_token', data.token);
        
        // Transform user for frontend compatibility
        const user = this.transformUser(data.user);
        
        return {
          user,
          roles: data.user.roles || [],
          error: null,
          token: data.token,
        };
      }

      return {
        user: null,
        roles: null,
        error: 'Invalid response from server',
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        user: null,
        roles: null,
        error: 'Network error during sign in',
      };
    }
  }

  async signOut(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Always clear local state
      this.token = null;
      localStorage.removeItem('caribbeanAI_auth_token');
      localStorage.removeItem('caribbeanAI_rbac_session'); // Clear old localStorage session
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        // Token might be expired
        this.token = null;
        localStorage.removeItem('caribbeanAI_auth_token');
        return null;
      }

      const data = await response.json();
      if (data.success && data.user) {
        return this.transformUser(data.user);
      }

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Admin operations
  async getSystemStats(): Promise<APIStatsResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/system-stats`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to fetch system statistics',
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get system stats error:', error);
      return {
        success: false,
        error: 'Network error',
      };
    }
  }

  async getSchools(): Promise<APISchoolsResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/schools`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to fetch schools',
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get schools error:', error);
      return {
        success: false,
        error: 'Network error',
      };
    }
  }

  async createSchool(schoolData: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  }): Promise<APISchoolResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/schools`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(schoolData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Failed to create school',
        };
      }

      return {
        success: true,
        school: data.school,
      };
    } catch (error) {
      console.error('Create school error:', error);
      return {
        success: false,
        error: 'Network error',
      };
    }
  }

  async inviteUser(userData: {
    email: string;
    role: UserRole;
    schoolId?: number;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/invite`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Failed to send invitation',
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Invite user error:', error);
      return {
        success: false,
        error: 'Network error',
      };
    }
  }

  // Permission checking (client-side helpers)
  hasRole(user: AuthUser | null, role: UserRole, schoolId?: number): boolean {
    if (!user || !user.roles) return false;
    
    return user.roles.some(r => 
      r.role === role && 
      r.isActive && 
      (!schoolId || r.schoolId === schoolId)
    );
  }

  hasPermission(user: AuthUser | null, permission: string, schoolId?: number): boolean {
    if (!user || !user.roles) return false;
    
    return user.roles.some(r => 
      r.isActive &&
      r.permissions?.includes(permission) &&
      (!schoolId || r.schoolId === schoolId)
    );
  }

  hasAnyRole(user: AuthUser | null, roles: UserRole[], schoolId?: number): boolean {
    if (!user) return false;
    return roles.some(role => this.hasRole(user, role, schoolId));
  }

  canAccessSchool(user: AuthUser | null, schoolId: number): boolean {
    if (!user) return false;
    
    // System admins can access any school
    if (this.hasRole(user, 'system_admin')) return true;
    
    // Users with roles in this specific school
    return user.roles?.some(r => r.schoolId === schoolId && r.isActive) || false;
  }

  getPrimaryRole(roles: UserRoleAssignment[]): UserRole {
    if (!roles || roles.length === 0) return 'student';
    
    const roleHierarchy: UserRole[] = ['system_admin', 'school_admin', 'teacher', 'parent', 'student'];
    
    for (const hierarchyRole of roleHierarchy) {
      if (roles.some(r => r.role === hierarchyRole && r.isActive)) {
        return hierarchyRole;
      }
    }
    
    return roles[0].role;
  }
}

// Export singleton instance
export const rbacAuthAPI = new RBACAuthAPI();