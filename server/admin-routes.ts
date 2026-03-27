// Admin API Routes for Dashboard Operations

import express, { Request, Response } from 'express';
import Joi from 'joi';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, count, sql, inArray } from 'drizzle-orm';
import * as schema from '../shared/schema';
import { authenticateToken, requireSystemAdmin, requireSchoolAdmin } from './auth-middleware';
import { verifySchoolAccess } from './resource-authorization';

const router = express.Router();

// Database connection
const connectionString = process.env.DATABASE_URL!;
const sqlClient = postgres(connectionString);
const db = drizzle(sqlClient, { schema });

// Validation schemas
const createSchoolSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  district: Joi.string().optional(),
  address: Joi.string().optional(),
  phone: Joi.string().max(50).optional(),
  email: Joi.string().email().optional(),
});

// GET /api/admin/system-stats - Get system overview statistics
router.get('/system-stats', authenticateToken, requireSystemAdmin, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get system-wide statistics
    const [schoolsCount] = await db.select({ count: count() }).from(schema.schools);
    const [usersCount] = await db.select({ count: count() }).from(schema.users);
    const [studentsCount] = await db.select({ count: count() }).from(schema.students);
    
    // Get active roles count
    const [activeRolesCount] = await db.select({ count: count() })
      .from(schema.userRoles)
      .where(eq(schema.userRoles.isActive, true));

    // Get stats by role
    const roleStats = await db.select({
      role: schema.userRoles.role,
      count: count()
    })
    .from(schema.userRoles)
    .where(eq(schema.userRoles.isActive, true))
    .groupBy(schema.userRoles.role);

    res.json({
      success: true,
      stats: {
        totalSchools: schoolsCount.count,
        totalUsers: usersCount.count,
        totalStudents: studentsCount.count,
        totalActiveRoles: activeRolesCount.count,
        roleBreakdown: roleStats.reduce((acc, stat) => {
          acc[stat.role] = stat.count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
});

// GET /api/admin/schools - Get schools accessible to user
router.get('/schools', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    let schools;

    // System admins can see all schools
    if (req.user.roles.some(r => r.role === 'system_admin')) {
      schools = await db.select({
        id: schema.schools.id,
        name: schema.schools.name,

        address: schema.schools.address,
        phone: schema.schools.phone,
        email: schema.schools.email,
        isActive: schema.schools.isActive,
        createdAt: schema.schools.createdAt,
      })
      .from(schema.schools)
      .where(eq(schema.schools.isActive, true))
      .orderBy(schema.schools.name);
    } else {
      // Other users can only see schools they belong to
      const userSchoolIds = req.user.roles
        .filter(r => r.schoolId && r.isActive)
        .map(r => r.schoolId!);

      if (userSchoolIds.length === 0) {
        return res.json({ success: true, schools: [] });
      }

      schools = await db.select({
        id: schema.schools.id,
        name: schema.schools.name,

        address: schema.schools.address,
        phone: schema.schools.phone,
        email: schema.schools.email,
        isActive: schema.schools.isActive,
        createdAt: schema.schools.createdAt,
      })
      .from(schema.schools)
      .where(and(
        eq(schema.schools.isActive, true),
        inArray(schema.schools.id, userSchoolIds)
      ))
      .orderBy(schema.schools.name);
    }

    res.json({
      success: true,
      schools,
    });
  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// POST /api/admin/schools - Create a new school (system admin only)
router.post('/schools', authenticateToken, requireSystemAdmin, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { error, value } = createSchoolSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }

    const { name, district, address, phone, email } = value;

    // Check if school name already exists
    const existingSchool = await db.select()
      .from(schema.schools)
      .where(eq(schema.schools.name, name))
      .limit(1);

    if (existingSchool.length > 0) {
      return res.status(400).json({ 
        error: 'A school with this name already exists' 
      });
    }

    // Create the school
    const [school] = await db.insert(schema.schools)
      .values({
        name,
        district,
        address,
        phone,
        email,
        isActive: true,
      })
      .returning();

    res.json({
      success: true,
      message: 'School created successfully',
      school: {
        id: school.id,
        name: school.name,
        district: school.district,
        address: school.address,
        phone: school.phone,
        email: school.email,
        isActive: school.isActive,
        createdAt: school.createdAt,
      },
    });
  } catch (error) {
    console.error('Create school error:', error);
    res.status(500).json({ error: 'Failed to create school' });
  }
});

// GET /api/admin/school-users/:schoolId - Get users in a specific school
router.get('/school-users/:schoolId', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const schoolId = parseInt(req.params.schoolId);
    if (isNaN(schoolId)) {
      return res.status(400).json({ error: 'Invalid school ID' });
    }

    // Verify user can access this school
    const hasAccess = await verifySchoolAccess(req.user, schoolId);
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Access denied to this school',
        schoolId 
      });
    }

    // Get users with roles in this school
    const schoolUsers = await db.select({
      userId: schema.users.id,
      email: schema.users.email,
      fullName: schema.users.fullName,
      phone: schema.users.phone,
      isActive: schema.users.isActive,
      createdAt: schema.users.createdAt,
      role: schema.userRoles.role,
      permissions: schema.userRoles.permissions,
      roleIsActive: schema.userRoles.isActive,
      assignedAt: schema.userRoles.assignedAt,
    })
    .from(schema.userRoles)
    .innerJoin(schema.users, eq(schema.userRoles.userId, schema.users.id))
    .where(and(
      eq(schema.userRoles.schoolId, schoolId),
      eq(schema.users.isActive, true)
    ))
    .orderBy(schema.users.fullName);

    // Group by user and aggregate roles
    const usersMap = new Map();
    schoolUsers.forEach(row => {
      if (!usersMap.has(row.userId)) {
        usersMap.set(row.userId, {
          id: row.userId,
          email: row.email,
          fullName: row.fullName,
          phone: row.phone,
          isActive: row.isActive,
          createdAt: row.createdAt,
          roles: [],
        });
      }
      
      usersMap.get(row.userId).roles.push({
        role: row.role,
        permissions: row.permissions,
        isActive: row.roleIsActive,
        assignedAt: row.assignedAt,
      });
    });

    const users = Array.from(usersMap.values());

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Get school users error:', error);
    res.status(500).json({ error: 'Failed to fetch school users' });
  }
});

// GET /api/admin/users - List all users (system admin only)
router.get('/users', authenticateToken, requireSystemAdmin, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const rows = await db.select({
      userId: schema.users.id,
      email: schema.users.email,
      fullName: schema.users.fullName,
      phone: schema.users.phone,
      isActive: schema.users.isActive,
      createdAt: schema.users.createdAt,
      role: schema.userRoles.role,
      roleIsActive: schema.userRoles.isActive,
      assignedAt: schema.userRoles.assignedAt,
    })
    .from(schema.users)
    .leftJoin(schema.userRoles, eq(schema.userRoles.userId, schema.users.id))
    .where(eq(schema.users.isActive, true))
    .orderBy(schema.users.createdAt);

    const usersMap = new Map<number, {
      id: number; email: string; fullName: string; phone: string | null;
      isActive: boolean; createdAt: Date | null; roles: { role: string; isActive: boolean; assignedAt: Date | null }[];
    }>();

    rows.forEach(row => {
      if (!usersMap.has(row.userId)) {
        usersMap.set(row.userId, {
          id: row.userId,
          email: row.email,
          fullName: row.fullName,
          phone: row.phone,
          isActive: row.isActive ?? true,
          createdAt: row.createdAt,
          roles: [],
        });
      }
      if (row.role) {
        usersMap.get(row.userId)!.roles.push({
          role: row.role,
          isActive: row.roleIsActive ?? true,
          assignedAt: row.assignedAt,
        });
      }
    });

    res.json({ success: true, users: Array.from(usersMap.values()) });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/admin/children - Get all child profiles with parent info (system_admin only)
router.get('/children', authenticateToken, requireSystemAdmin, async (req: Request, res: Response) => {
  try {
    const parentUsers = schema.users;
    const rows = await db.select({
      id: schema.students.id,
      name: schema.students.name,
      gradeLevel: schema.students.gradeLevel,
      targetExam: schema.students.targetExam,
      age: schema.students.age,
      createdAt: schema.students.createdAt,
      parentId: schema.students.parentId,
      parentName: parentUsers.fullName,
      parentEmail: parentUsers.email,
    })
    .from(schema.students)
    .leftJoin(parentUsers, eq(parentUsers.id, schema.students.parentId))
    .orderBy(parentUsers.fullName, schema.students.name);

    res.json({ success: true, children: rows });
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({ error: 'Failed to fetch child profiles' });
  }
});

// GET /api/admin/school-children/:schoolId - Get child profiles for a school
router.get('/school-children/:schoolId', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const schoolId = parseInt(req.params.schoolId, 10);
    if (isNaN(schoolId)) {
      return res.status(400).json({ error: 'Invalid school ID' });
    }

    // Verify the requesting user is authorized to access this school
    const hasAccess = await verifySchoolAccess(req.user, schoolId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this school', schoolId });
    }

    // Collect studentIds via student_schools (primary) and class_enrollments (fallback)
    const viaStudentSchools = await db.select({ studentId: schema.studentSchools.studentId })
      .from(schema.studentSchools)
      .where(and(
        eq(schema.studentSchools.schoolId, schoolId),
        eq(schema.studentSchools.isActive, true),
      ));

    const viaClassEnrollments = await db.select({ studentId: schema.classEnrollments.studentId })
      .from(schema.classEnrollments)
      .where(and(
        eq(schema.classEnrollments.schoolId, schoolId),
        eq(schema.classEnrollments.isActive, true),
      ));

    const studentIdSet = new Set<number>([
      ...viaStudentSchools.map(r => r.studentId),
      ...viaClassEnrollments.map(r => r.studentId),
    ]);

    if (studentIdSet.size === 0) {
      return res.json({ success: true, children: [] });
    }

    const parentUsers = schema.users;
    const rows = await db.select({
      id: schema.students.id,
      name: schema.students.name,
      gradeLevel: schema.students.gradeLevel,
      targetExam: schema.students.targetExam,
      age: schema.students.age,
      createdAt: schema.students.createdAt,
      parentId: schema.students.parentId,
      parentName: parentUsers.fullName,
      parentEmail: parentUsers.email,
    })
    .from(schema.students)
    .leftJoin(parentUsers, eq(parentUsers.id, schema.students.parentId))
    .where(inArray(schema.students.id, Array.from(studentIdSet)))
    .orderBy(parentUsers.fullName, schema.students.name);

    res.json({ success: true, children: rows });
  } catch (error) {
    console.error('Get school children error:', error);
    res.status(500).json({ error: 'Failed to fetch school child profiles' });
  }
});

// GET /api/admin/current-user - Get current authenticated user info
router.get('/current-user', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

export default router;