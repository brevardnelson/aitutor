// Resource Authorization for Tenant Isolation

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, inArray } from 'drizzle-orm';
import * as schema from '../shared/schema';
import type { AuthenticatedUser } from './auth';
import { authService } from './auth';

// Database connection
const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);
const db = drizzle(sql, { schema });

/**
 * Verify if a user can access a specific child's data
 * Rules:
 * - Parents can access their own children
 * - Teachers can access students in their classes
 * - School admins can access students in their school
 * - System admins can access any student
 */
export async function verifyChildAccess(user: AuthenticatedUser, childId: number): Promise<boolean> {
  try {
    // System admins can access everything
    if (authService.hasRole(user, 'system_admin')) {
      return true;
    }

    // Get child/student information
    const [student] = await db.select()
      .from(schema.students)
      .where(eq(schema.students.id, childId))
      .limit(1);

    if (!student) {
      return false; // Child doesn't exist
    }

    // Parents can access their own children
    if (authService.hasRole(user, 'parent')) {
      // Check if this user is the parent of this child
      const isParent = student.parentId === user.id || student.userId === user.id;
      if (isParent) return true;
    }

    // Teachers can only access students in their classes
    if (authService.hasRole(user, 'teacher')) {
      // Get all classes taught by this teacher
      const teacherClasses = await db.select()
        .from(schema.classes)
        .where(and(
          eq(schema.classes.teacherId, user.id),
          eq(schema.classes.isActive, true)
        ));

      if (teacherClasses.length === 0) {
        return false; // Teacher has no active classes
      }

      // Check if student is enrolled in any of the teacher's classes
      const classIds = teacherClasses.map(c => c.id);
      const studentEnrollment = await db.select()
        .from(schema.classEnrollments)
        .where(and(
          eq(schema.classEnrollments.studentId, childId),
          eq(schema.classEnrollments.isActive, true),
          inArray(schema.classEnrollments.classId, classIds)
        ))
        .limit(1);

      return studentEnrollment.length > 0;
    }

    // School admins can access students in their school only
    if (authService.hasRole(user, 'school_admin')) {
      // Get schools where user is school admin
      const adminSchools = user.roles
        .filter(role => role.role === 'school_admin' && role.isActive && role.schoolId)
        .map(role => role.schoolId!);

      if (adminSchools.length === 0) {
        return false; // No active school admin roles
      }

      // Check if student is enrolled in any of the admin's schools
      const studentSchoolEnrollment = await db.select()
        .from(schema.studentSchools)
        .where(and(
          eq(schema.studentSchools.studentId, childId),
          eq(schema.studentSchools.isActive, true),
          inArray(schema.studentSchools.schoolId, adminSchools)
        ))
        .limit(1);

      return studentSchoolEnrollment.length > 0;
    }

    return false;
  } catch (error) {
    console.error('Error verifying child access:', error);
    return false; // Deny access on error for security
  }
}

/**
 * Verify if a user can access a specific student's data (alias for child access)
 */
export async function verifyStudentAccess(user: AuthenticatedUser, studentId: number): Promise<boolean> {
  return verifyChildAccess(user, studentId);
}

/**
 * Verify if a user can access a specific learning session
 * Rules:
 * - Users can only access sessions for students they have access to
 */
export async function verifySessionAccess(user: AuthenticatedUser, sessionId: number): Promise<boolean> {
  try {
    // Get session information
    const [session] = await db.select()
      .from(schema.learningSessions)
      .where(eq(schema.learningSessions.id, sessionId))
      .limit(1);

    if (!session) {
      return false; // Session doesn't exist
    }

    // Check if user can access the student associated with this session
    if (!session.studentId) {
      return false; // Session has no student ID
    }
    return verifyStudentAccess(user, session.studentId);
  } catch (error) {
    console.error('Error verifying session access:', error);
    return false; // Deny access on error for security
  }
}

/**
 * Verify if a user can access a specific school's data
 * Rules:
 * - System admins can access any school
 * - School admins can access their own school
 * - Teachers can access their own school (limited permissions)
 * - Parents and students cannot access school-level data directly
 */
export async function verifySchoolAccess(user: AuthenticatedUser, schoolId: number): Promise<boolean> {
  try {
    // System admins can access everything
    if (authService.hasRole(user, 'system_admin')) {
      return true;
    }

    // Check if user has any role in this specific school
    return authService.canAccessSchool(user, schoolId);
  } catch (error) {
    console.error('Error verifying school access:', error);
    return false; // Deny access on error for security
  }
}

/**
 * Get the list of child/student IDs that a user can access
 * Used for filtering data queries to prevent unauthorized access
 */
export async function getAccessibleStudentIds(user: AuthenticatedUser): Promise<number[]> {
  try {
    // System admins can access all students
    if (authService.hasRole(user, 'system_admin')) {
      const allStudents = await db.select({ id: schema.students.id })
        .from(schema.students);
      return allStudents.map(s => s.id);
    }

    const accessibleIds: number[] = [];

    // Parents can access their own children
    if (authService.hasRole(user, 'parent')) {
      const ownChildren = await db.select({ id: schema.students.id })
        .from(schema.students)
        .where(eq(schema.students.parentId, user.id));
      accessibleIds.push(...ownChildren.map(s => s.id));
    }

    // Teachers can access students in their classes
    if (authService.hasRole(user, 'teacher')) {
      // Get all active classes taught by this teacher
      const teacherClasses = await db.select({ id: schema.classes.id })
        .from(schema.classes)
        .where(and(
          eq(schema.classes.teacherId, user.id),
          eq(schema.classes.isActive, true)
        ));

      if (teacherClasses.length > 0) {
        const classIds = teacherClasses.map(c => c.id);
        // Get students enrolled in teacher's classes
        const studentsInClasses = await db.select({ studentId: schema.classEnrollments.studentId })
          .from(schema.classEnrollments)
          .where(and(
            eq(schema.classEnrollments.isActive, true),
            inArray(schema.classEnrollments.classId, classIds)
          ));
        
        accessibleIds.push(...studentsInClasses.map(s => s.studentId));
      }
    }

    // School admins can access students in their schools
    if (authService.hasRole(user, 'school_admin')) {
      // Get schools where user is school admin
      const adminSchools = user.roles
        .filter(role => role.role === 'school_admin' && role.isActive && role.schoolId)
        .map(role => role.schoolId!);

      if (adminSchools.length > 0) {
        // Get students enrolled in admin's schools
        const studentsInSchools = await db.select({ studentId: schema.studentSchools.studentId })
          .from(schema.studentSchools)
          .where(and(
            eq(schema.studentSchools.isActive, true),
            inArray(schema.studentSchools.schoolId, adminSchools)
          ));
        
        accessibleIds.push(...studentsInSchools.map(s => s.studentId));
      }
    }

    // Remove duplicates and return
    return [...new Set(accessibleIds)];
  } catch (error) {
    console.error('Error getting accessible student IDs:', error);
    return []; // Return empty array on error for security
  }
}