// Server-side Authentication and RBAC System

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and } from 'drizzle-orm';
import * as schema from '../shared/schema';
import type { UserRole } from '../src/types/auth';

// Database connection
const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);
const db = drizzle(sql, { schema });

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = '24h';
const SALT_ROUNDS = 12;

export interface AuthenticatedUser {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  roles: {
    id: number;
    role: UserRole;
    schoolId?: number;
    permissions: string[];
    isActive: boolean;
  }[];
  primaryRole: UserRole;
  currentSchool?: {
    id: number;
    name: string;
    isActive: boolean;
  };
}

export interface AuthTokenPayload {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}

export class ServerAuthService {
  // Password utilities
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // JWT utilities
  private generateToken(user: { id: number; email: string }): string {
    return jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  private verifyToken(token: string): AuthTokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    } catch (error) {
      return null;
    }
  }

  // System admin setup (only for initial bootstrap)
  async createSystemAdmin(email: string, password: string, fullName: string): Promise<{
    success: boolean;
    error?: string;
    user?: AuthenticatedUser;
  }> {
    try {
      // Check if system admin already exists
      const existingSystemAdmin = await db.select()
        .from(schema.userRoles)
        .where(eq(schema.userRoles.role, 'system_admin'))
        .limit(1);

      if (existingSystemAdmin.length > 0) {
        return { success: false, error: 'System admin already exists' };
      }

      // Check if email is already taken
      const existingUser = await db.select()
        .from(schema.users)
        .where(eq(schema.users.email, email.toLowerCase()))
        .limit(1);

      if (existingUser.length > 0) {
        return { success: false, error: 'Email already in use' };
      }

      // Create user (set legacy role field for backward compatibility)
      const hashedPassword = await this.hashPassword(password);
      const [user] = await db.insert(schema.users)
        .values({
          email: email.toLowerCase(),
          passwordHash: hashedPassword,
          fullName,
          role: 'system_admin', // Legacy role field for backward compatibility
          isActive: true,
        })
        .returning();

      // Create system admin role
      await db.insert(schema.userRoles)
        .values({
          userId: user.id,
          role: 'system_admin',
          schoolId: undefined, // System admins don't belong to specific schools
          permissions: ['manage_system', 'manage_all_schools'],
          isActive: true,
        });

      const authenticatedUser = await this.getUserById(user.id);
      return { success: true, user: authenticatedUser || undefined };
    } catch (error) {
      console.error('Failed to create system admin:', error);
      return { success: false, error: 'Failed to create system admin' };
    }
  }

  // User authentication
  async signIn(email: string, password: string): Promise<{
    success: boolean;
    error?: string;
    user?: AuthenticatedUser;
    token?: string;
  }> {
    try {
      // Find user by email
      const [userRecord] = await db.select()
        .from(schema.users)
        .where(eq(schema.users.email, email.toLowerCase()))
        .limit(1);

      if (!userRecord) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, userRecord.passwordHash);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Check if user is active
      if (!userRecord.isActive) {
        return { success: false, error: 'Account has been deactivated' };
      }

      // Get full user with roles
      const user = await this.getUserById(userRecord.id);
      if (!user) {
        return { success: false, error: 'User data not found' };
      }

      // Check if user has any active roles
      if (user.roles.length === 0) {
        return { success: false, error: 'No active roles assigned to this account' };
      }

      // Generate JWT token
      const token = this.generateToken(userRecord);

      return { success: true, user, token };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Get user by ID with roles and school information
  async getUserById(userId: number): Promise<AuthenticatedUser | null> {
    try {
      const [user] = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      if (!user || !user.isActive) {
        return null;
      }

      // Get user roles
      const userRoles = await db.select()
        .from(schema.userRoles)
        .where(and(
          eq(schema.userRoles.userId, userId),
          eq(schema.userRoles.isActive, true)
        ));

      if (userRoles.length === 0) {
        return null;
      }

      // Get school information for roles that have schoolId
      const schoolIds = userRoles
        .filter(role => role.schoolId)
        .map(role => role.schoolId!);

      let schools: any[] = [];
      if (schoolIds.length > 0) {
        schools = await db.select()
          .from(schema.schools)
          .where(eq(schema.schools.isActive, true));
      }

      // Determine primary role (highest in hierarchy)
      const roleHierarchy: UserRole[] = ['system_admin', 'school_admin', 'teacher', 'parent', 'student'];
      let primaryRole: UserRole = userRoles[0].role as UserRole;
      for (const hierarchyRole of roleHierarchy) {
        if (userRoles.some(r => r.role === hierarchyRole)) {
          primaryRole = hierarchyRole;
          break;
        }
      }

      // Get current school (first school the user belongs to)
      let currentSchool;
      if (schools.length > 0) {
        const userSchool = schools.find(school => 
          userRoles.some(role => role.schoolId === school.id)
        );
        if (userSchool) {
          currentSchool = {
            id: userSchool.id,
            name: userSchool.name,
            isActive: userSchool.isActive,
          };
        }
      }

      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone || undefined,
        isActive: user.isActive,
        roles: userRoles.map(role => ({
          id: role.id,
          role: role.role as UserRole,
          schoolId: role.schoolId || undefined,
          permissions: role.permissions || [],
          isActive: role.isActive || false,
        })),
        primaryRole,
        currentSchool,
      };
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Get user from JWT token
  async getUserFromToken(token: string): Promise<AuthenticatedUser | null> {
    const payload = this.verifyToken(token);
    if (!payload) {
      return null;
    }

    return await this.getUserById(payload.userId);
  }

  // Role and permission checking
  hasRole(user: AuthenticatedUser, role: UserRole, schoolId?: number): boolean {
    return user.roles.some(r => 
      r.role === role && 
      r.isActive && 
      (!schoolId || r.schoolId === schoolId)
    );
  }

  hasPermission(user: AuthenticatedUser, permission: string, schoolId?: number): boolean {
    return user.roles.some(r => 
      r.isActive &&
      r.permissions.includes(permission) &&
      (!schoolId || r.schoolId === schoolId)
    );
  }

  hasAnyRole(user: AuthenticatedUser, roles: UserRole[], schoolId?: number): boolean {
    return roles.some(role => this.hasRole(user, role, schoolId));
  }

  canAccessSchool(user: AuthenticatedUser, schoolId: number): boolean {
    // System admins can access any school
    if (this.hasRole(user, 'system_admin')) return true;
    
    // Users with roles in this specific school
    return user.roles.some(r => r.schoolId === schoolId && r.isActive);
  }

  // Invitation-based user creation (secure, admin-only)
  async inviteUser(
    inviterUserId: number,
    inviteData: {
      email: string;
      role: UserRole;
      schoolId?: number;
    }
  ): Promise<{ success: boolean; error?: string; invitation?: any }> {
    try {
      // Get inviter and verify permissions
      const inviter = await this.getUserById(inviterUserId);
      if (!inviter) {
        return { success: false, error: 'Invalid inviter' };
      }

      // Verify inviter has permission to invite users
      const canInvite = inviteData.role === 'system_admin' 
        ? this.hasRole(inviter, 'system_admin')
        : inviteData.schoolId 
          ? this.hasPermission(inviter, 'manage_teachers', inviteData.schoolId) ||
            this.hasPermission(inviter, 'manage_parents', inviteData.schoolId) ||
            this.hasPermission(inviter, 'manage_students', inviteData.schoolId)
          : false;

      if (!canInvite) {
        return { success: false, error: 'Insufficient permissions to invite users' };
      }

      // Check if user already exists
      const existingUser = await db.select()
        .from(schema.users)
        .where(eq(schema.users.email, inviteData.email.toLowerCase()))
        .limit(1);

      if (existingUser.length > 0) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Generate secure invitation token
      const inviteToken = jwt.sign(
        { 
          email: inviteData.email.toLowerCase(),
          role: inviteData.role,
          schoolId: inviteData.schoolId,
          invitedBy: inviterUserId
        },
        JWT_SECRET,
        { expiresIn: '7d' } // 7 day expiration
      );

      // Create invitation record
      const [invitation] = await db.insert(schema.invitations)
        .values({
          email: inviteData.email.toLowerCase(),
          role: inviteData.role,
          schoolId: inviteData.schoolId,
          invitedBy: inviterUserId,
          token: inviteToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          isUsed: false,
        })
        .returning();

      return { success: true, invitation };
    } catch (error) {
      console.error('Invite user error:', error);
      return { success: false, error: 'Failed to create invitation' };
    }
  }

  // Complete invitation (user sets password)
  async completeInvitation(
    token: string, 
    userData: { fullName: string; password: string; phone?: string }
  ): Promise<{ success: boolean; error?: string; user?: AuthenticatedUser; authToken?: string }> {
    try {
      // Verify invitation token
      const invitePayload = this.verifyToken(token);
      if (!invitePayload) {
        return { success: false, error: 'Invalid or expired invitation' };
      }

      // Get invitation from database
      const [invitation] = await db.select()
        .from(schema.invitations)
        .where(and(
          eq(schema.invitations.token, token),
          eq(schema.invitations.isUsed, false)
        ))
        .limit(1);

      if (!invitation || invitation.expiresAt < new Date()) {
        return { success: false, error: 'Invitation expired or already used' };
      }

      // Create user (set legacy role field for backward compatibility)
      const hashedPassword = await this.hashPassword(userData.password);
      const [user] = await db.insert(schema.users)
        .values({
          email: invitation.email,
          passwordHash: hashedPassword,
          fullName: userData.fullName,
          phone: userData.phone,
          role: invitation.role, // Legacy role field for backward compatibility
          isActive: true,
        })
        .returning();

      // Create user role
      const defaultPermissions = this.getDefaultPermissions(invitation.role);
      await db.insert(schema.userRoles)
        .values({
          userId: user.id,
          role: invitation.role as UserRole,
          schoolId: invitation.schoolId,
          permissions: defaultPermissions,
          isActive: true,
        });

      // Mark invitation as used
      await db.update(schema.invitations)
        .set({ 
          isUsed: true, 
          acceptedAt: new Date() 
        })
        .where(eq(schema.invitations.id, invitation.id));

      // Get full user data and generate auth token
      const authenticatedUser = await this.getUserById(user.id);
      const authToken = this.generateToken(user);

      return { 
        success: true, 
        user: authenticatedUser || undefined, 
        authToken 
      };
    } catch (error) {
      console.error('Complete invitation error:', error);
      return { success: false, error: 'Failed to complete invitation' };
    }
  }

  private getDefaultPermissions(role: UserRole): string[] {
    const defaultPermissions: Record<UserRole, string[]> = {
      system_admin: ['manage_system', 'manage_all_schools'],
      school_admin: ['manage_school', 'manage_teachers', 'manage_parents', 'manage_students', 'manage_classes', 'view_student_progress'],
      teacher: ['manage_my_classes', 'add_students_to_class', 'view_student_progress'],
      parent: ['manage_my_children', 'view_child_progress'],
      student: ['access_learning', 'view_my_progress'],
    };

    return defaultPermissions[role] || [];
  }
}

export const authService = new ServerAuthService();