// Enhanced RBAC types for multi-institutional platform

export type UserRole = 'system_admin' | 'school_admin' | 'teacher' | 'parent' | 'student';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserRoleAssignment {
  id: number;
  userId: number;
  role: UserRole;
  schoolId?: number; // null for system admins
  permissions: string[];
  isActive: boolean;
  assignedAt: Date;
}

export interface School {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  adminId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  id: number;
  name: string;
  subject?: string;
  gradeLevel: string;
  schoolId: number;
  teacherId?: number;
  maxStudents: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: number;
  userId?: number; // For students with accounts
  parentId?: number;
  gradeLevel?: string;
  subjects?: string[];
  createdAt: Date;
}

export interface StudentProfile {
  id: number;
  studentId: number;
  name: string;
  email?: string;
  age: number;
  grade: string;
  targetExam: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User | null;
  roles: UserRoleAssignment[] | null;
  error: string | null;
  token?: string;
}

export interface AuthUser extends User {
  roles: UserRoleAssignment[];
  primaryRole: UserRole;
  currentSchool?: School;
}

// Permission constants
export const PERMISSIONS = {
  // System Admin
  MANAGE_SYSTEM: 'manage_system',
  MANAGE_ALL_SCHOOLS: 'manage_all_schools',
  
  // School Admin
  MANAGE_SCHOOL: 'manage_school',
  MANAGE_TEACHERS: 'manage_teachers',
  MANAGE_PARENTS: 'manage_parents',
  MANAGE_STUDENTS: 'manage_students',
  MANAGE_CLASSES: 'manage_classes',
  
  // Teacher
  MANAGE_MY_CLASSES: 'manage_my_classes',
  ADD_STUDENTS_TO_CLASS: 'add_students_to_class',
  VIEW_STUDENT_PROGRESS: 'view_student_progress',
  
  // Parent
  MANAGE_MY_CHILDREN: 'manage_my_children',
  VIEW_CHILD_PROGRESS: 'view_child_progress',
  
  // Student
  ACCESS_LEARNING: 'access_learning',
  VIEW_MY_PROGRESS: 'view_my_progress',
} as const;

// Default permissions by role
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  system_admin: [
    PERMISSIONS.MANAGE_SYSTEM,
    PERMISSIONS.MANAGE_ALL_SCHOOLS,
  ],
  school_admin: [
    PERMISSIONS.MANAGE_SCHOOL,
    PERMISSIONS.MANAGE_TEACHERS,
    PERMISSIONS.MANAGE_PARENTS,
    PERMISSIONS.MANAGE_STUDENTS,
    PERMISSIONS.MANAGE_CLASSES,
    PERMISSIONS.VIEW_STUDENT_PROGRESS,
  ],
  teacher: [
    PERMISSIONS.MANAGE_MY_CLASSES,
    PERMISSIONS.ADD_STUDENTS_TO_CLASS,
    PERMISSIONS.VIEW_STUDENT_PROGRESS,
  ],
  parent: [
    PERMISSIONS.MANAGE_MY_CHILDREN,
    PERMISSIONS.VIEW_CHILD_PROGRESS,
  ],
  student: [
    PERMISSIONS.ACCESS_LEARNING,
    PERMISSIONS.VIEW_MY_PROGRESS,
  ],
};

// Role hierarchy for permission inheritance
export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  system_admin: ['system_admin', 'school_admin', 'teacher', 'parent', 'student'],
  school_admin: ['school_admin', 'teacher', 'parent', 'student'],
  teacher: ['teacher'],
  parent: ['parent'],
  student: ['student'],
};