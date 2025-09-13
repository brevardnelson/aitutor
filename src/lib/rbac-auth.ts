// Enhanced RBAC Authentication Service for Multi-Institutional Platform

import type { 
  User, 
  UserRole, 
  UserRoleAssignment, 
  AuthResponse, 
  AuthUser, 
  School
} from '@/types/auth';
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS } from '@/types/auth';

class RBACAuthService {
  private apiUrl = 'http://localhost:3001/api';

  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  private hashPassword(password: string): string {
    // Simple hash for demonstration - in production, use proper bcrypt
    return btoa(password + 'salt');
  }

  // Session management
  private getCurrentSession(): { userId: number; token: string } | null {
    const session = localStorage.getItem('caribbeanAI_rbac_session');
    return session ? JSON.parse(session) : null;
  }

  private saveSession(userId: number, roles: UserRoleAssignment[]): string {
    const token = btoa(JSON.stringify({ userId, timestamp: Date.now() }));
    const session = { userId, token, roles };
    localStorage.setItem('caribbeanAI_rbac_session', JSON.stringify(session));
    return token;
  }

  private clearSession(): void {
    localStorage.removeItem('caribbeanAI_rbac_session');
  }

  // User management with database integration
  private async createUser(userData: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Promise<User> {
    // For now, we'll simulate database calls with localStorage
    // In production, this would be API calls to the server
    const users = this.getStoredUsers();
    const newUser: User = {
      id: this.generateId(),
      email: userData.email,
      full_name: userData.fullName,
      phone: userData.phone,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const userWithPassword = { 
      ...newUser, 
      password_hash: this.hashPassword(userData.password) 
    };
    
    users.push(userWithPassword);
    this.saveUsers(users);
    return newUser;
  }

  private async createUserRole(userId: number, role: UserRole, schoolId?: number): Promise<UserRoleAssignment> {
    const roles = this.getStoredUserRoles();
    const newRole: UserRoleAssignment = {
      id: this.generateId(),
      userId,
      role,
      schoolId: schoolId || undefined,
      permissions: DEFAULT_ROLE_PERMISSIONS[role] || [],
      isActive: true,
      assignedAt: new Date(),
    };

    roles.push(newRole);
    this.saveUserRoles(roles);
    return newRole;
  }

  // Storage helpers (temporary - will be replaced with API calls)
  private getStoredUsers(): any[] {
    const users = localStorage.getItem('caribbeanAI_rbac_users');
    return users ? JSON.parse(users) : [];
  }

  private saveUsers(users: any[]): void {
    localStorage.setItem('caribbeanAI_rbac_users', JSON.stringify(users));
  }

  private getStoredUserRoles(): UserRoleAssignment[] {
    const roles = localStorage.getItem('caribbeanAI_rbac_user_roles');
    return roles ? JSON.parse(roles) : [];
  }

  private saveUserRoles(roles: UserRoleAssignment[]): void {
    localStorage.setItem('caribbeanAI_rbac_user_roles', JSON.stringify(roles));
  }

  private getStoredSchools(): School[] {
    const schools = localStorage.getItem('caribbeanAI_rbac_schools');
    return schools ? JSON.parse(schools) : [];
  }

  private saveSchools(schools: School[]): void {
    localStorage.setItem('caribbeanAI_rbac_schools', JSON.stringify(schools));
  }

  // Public authentication methods
  async signUp(
    email: string, 
    password: string, 
    fullName: string, 
    role: UserRole, 
    schoolId?: number,
    phone?: string
  ): Promise<AuthResponse> {
    try {
      const users = this.getStoredUsers();
      
      // Check if user already exists
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { 
          user: null, 
          roles: null, 
          error: 'An account with this email already exists. Try signing in instead.' 
        };
      }

      // Create user
      const user = await this.createUser({ email, password, fullName, phone });
      
      // Create user role assignment
      const userRole = await this.createUserRole(user.id, role, schoolId);
      
      // Create session
      const token = this.saveSession(user.id, [userRole]);

      return { 
        user, 
        roles: [userRole], 
        error: null,
        token 
      };
    } catch (error) {
      return { 
        user: null, 
        roles: null, 
        error: 'An unexpected error occurred during signup' 
      };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const users = this.getStoredUsers();
      const userRoles = this.getStoredUserRoles();
      
      // Find user with case-insensitive email
      const userWithPassword = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!userWithPassword || userWithPassword.password_hash !== this.hashPassword(password)) {
        return { 
          user: null, 
          roles: null, 
          error: 'Invalid email or password' 
        };
      }

      const { password_hash, ...user } = userWithPassword;

      if (!user.is_active) {
        return { 
          user: null, 
          roles: null, 
          error: 'Your account has been deactivated' 
        };
      }

      // Get user's active roles
      const roles = userRoles.filter(r => r.userId === user.id && r.isActive);

      if (roles.length === 0) {
        return { 
          user: null, 
          roles: null, 
          error: 'No active roles found for this account' 
        };
      }

      // Create session
      const token = this.saveSession(user.id, roles);

      return { 
        user, 
        roles, 
        error: null,
        token 
      };
    } catch (error) {
      return { 
        user: null, 
        roles: null, 
        error: 'An unexpected error occurred during sign in' 
      };
    }
  }

  async signOut(): Promise<void> {
    this.clearSession();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const session = this.getCurrentSession();
    if (!session) return null;

    const users = this.getStoredUsers();
    const userWithPassword = users.find(u => u.id === session.userId);
    
    if (!userWithPassword) return null;

    const { password_hash, ...user } = userWithPassword;
    const userRoles = this.getStoredUserRoles();
    const roles = userRoles.filter(r => r.userId === user.id && r.isActive);

    if (roles.length === 0) return null;

    // Determine primary role (highest in hierarchy)
    const primaryRole = this.getPrimaryRole(roles);
    
    // Get current school if applicable
    const schools = this.getStoredSchools();
    const currentSchool = roles.find(r => r.schoolId)?.schoolId ? 
      schools.find(s => s.id === roles.find(r => r.schoolId)?.schoolId) : 
      undefined;

    return {
      ...user,
      roles,
      primaryRole,
      currentSchool,
    };
  }

  getPrimaryRole(roles: UserRoleAssignment[]): UserRole {
    const roleHierarchy: UserRole[] = ['system_admin', 'school_admin', 'teacher', 'parent', 'student'];
    
    for (const hierarchyRole of roleHierarchy) {
      if (roles.some(r => r.role === hierarchyRole)) {
        return hierarchyRole;
      }
    }
    
    return roles[0]?.role || 'student';
  }

  async getToken(): Promise<string | null> {
    const session = this.getCurrentSession();
    return session?.token || null;
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }

  // Role and permission checking
  hasRole(user: AuthUser | null, role: UserRole, schoolId?: number): boolean {
    if (!user) return false;
    
    return user.roles.some(r => 
      r.role === role && 
      r.isActive && 
      (!schoolId || r.schoolId === schoolId)
    );
  }

  hasPermission(user: AuthUser | null, permission: string, schoolId?: number): boolean {
    if (!user) return false;
    
    return user.roles.some(r => 
      r.isActive &&
      r.permissions.includes(permission) &&
      (!schoolId || r.schoolId === schoolId)
    );
  }

  hasAnyRole(user: AuthUser | null, roles: UserRole[], schoolId?: number): boolean {
    return roles.some(role => this.hasRole(user, role, schoolId));
  }

  canAccessSchool(user: AuthUser | null, schoolId: number): boolean {
    if (!user) return false;
    
    // System admins can access any school
    if (this.hasRole(user, 'system_admin')) return true;
    
    // Users with roles in this specific school
    return user.roles.some(r => r.schoolId === schoolId && r.isActive);
  }

  // School management methods (for admin functionality)
  async createSchool(schoolData: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    adminId: number;
  }): Promise<School> {
    const schools = this.getStoredSchools();
    const newSchool: School = {
      id: this.generateId(),
      ...schoolData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    schools.push(newSchool);
    this.saveSchools(schools);
    return newSchool;
  }

  async getSchools(): Promise<School[]> {
    return this.getStoredSchools().filter(s => s.isActive);
  }

  async getSchoolsForUser(userId: number): Promise<School[]> {
    const userRoles = this.getStoredUserRoles();
    const schools = this.getStoredSchools();
    const userSchoolIds = userRoles
      .filter(r => r.userId === userId && r.isActive && r.schoolId)
      .map(r => r.schoolId);

    return schools.filter(s => s.isActive && userSchoolIds.includes(s.id));
  }

  // Invitation system
  async inviteUser(inviterUser: AuthUser, userData: {
    email: string;
    role: UserRole;
    schoolId?: number;
    classId?: number;
  }): Promise<{ success: boolean; error?: string; inviteToken?: string }> {
    // Check if inviter has permission to invite for this role/school
    if (userData.role === 'teacher' || userData.role === 'parent' || userData.role === 'student') {
      if (!userData.schoolId || !this.hasPermission(inviterUser, PERMISSIONS.MANAGE_TEACHERS, userData.schoolId)) {
        return { success: false, error: 'Insufficient permissions to invite users to this school' };
      }
    }

    // For now, just create the account directly (in production, this would send an invitation email)
    const password = 'tempPassword123'; // In production, this would be sent via secure email
    const result = await this.signUp(
      userData.email, 
      password, 
      userData.email.split('@')[0], // Use email prefix as temporary name
      userData.role, 
      userData.schoolId
    );

    if (result.error) {
      return { success: false, error: result.error };
    }

    return { success: true, inviteToken: 'temp-invite-token' };
  }
}

// Export singleton instance
export const rbacAuthService = new RBACAuthService();
export default rbacAuthService;