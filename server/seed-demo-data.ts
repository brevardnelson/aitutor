import bcrypt from 'bcryptjs';
import { db } from './storage';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';

async function ensureSchemaColumns() {
  try {
    await db.execute(sql`
      ALTER TABLE class_enrollments ADD COLUMN IF NOT EXISTS school_id INTEGER REFERENCES schools(id);
    `);
    // Back-fill class_enrollments.school_id from the class's school
    await db.execute(sql`
      UPDATE class_enrollments ce
      SET school_id = c.school_id
      FROM classes c
      WHERE ce.class_id = c.id AND ce.school_id IS NULL AND c.school_id IS NOT NULL;
    `);
    // Back-fill student_schools from class_enrollments where missing
    await db.execute(sql`
      INSERT INTO student_schools (student_id, school_id, is_active)
      SELECT DISTINCT ce.student_id, c.school_id, true
      FROM class_enrollments ce
      JOIN classes c ON c.id = ce.class_id
      WHERE c.school_id IS NOT NULL
      ON CONFLICT (student_id, school_id) DO NOTHING;
    `);
    // Back-fill user_roles.school_id for school_admin and teacher roles that are missing it
    await db.execute(sql`
      UPDATE user_roles ur
      SET school_id = s.id
      FROM schools s
      WHERE ur.role IN ('school_admin', 'teacher')
        AND ur.school_id IS NULL
        AND (SELECT COUNT(*) FROM schools) = 1;
    `);
    console.log('✅ Schema columns verified');
  } catch (e) {
    console.log('Schema column check skipped (may already exist)');
  }
}

export async function seedDemoDataIfEmpty() {
  try {
    await ensureSchemaColumns();
    const existingUsers = await db.select({ id: schema.users.id }).from(schema.users).limit(1);
    if (existingUsers.length > 0) {
      console.log('Database already has users, skipping seed.');
      return;
    }

    console.log('🌱 Empty database detected — seeding demo data...');

    await db.transaction(async (tx) => {
      const passwordHash = await bcrypt.hash('demo123', 10);

      const [school] = await tx.insert(schema.schools).values({
        name: 'Caribbean International Academy',
        district: 'Kingston District',
        address: '123 Education Avenue, Port of Spain, Trinidad',
        phone: '+1-868-555-0001',
        email: 'info@caribbeanacademy.edu',
        isActive: true,
      }).returning();

      const usersData = [
        { email: 'admin@caribbeanaitutor.com', fullName: 'System Administrator', role: 'system_admin' as const },
        { email: 'admin.system@demo.com', fullName: 'System Administrator', role: 'system_admin' as const },
        { email: 'admin.school@demo.com', fullName: 'Principal James Wilson', role: 'school_admin' as const },
        { email: 'teacher.math@demo.com', fullName: 'Dr. Sarah Martinez', role: 'teacher' as const },
        { email: 'teacher.science@demo.com', fullName: 'Prof. Michael Chen', role: 'teacher' as const },
        { email: 'parent.johnson@demo.com', fullName: 'Robert Johnson', role: 'parent' as const },
        { email: 'parent.williams@demo.com', fullName: 'Lisa Williams', role: 'parent' as const },
        { email: 'parent.garcia@demo.com', fullName: 'Carlos Garcia', role: 'parent' as const },
        { email: 'emily.student@demo.com', fullName: 'Emily Johnson', role: 'student' as const },
        { email: 'marcus.student@demo.com', fullName: 'Marcus Williams', role: 'student' as const },
        { email: 'sophia.student@demo.com', fullName: 'Sophia Garcia', role: 'student' as const },
        { email: 'alex.johnson@demo.com', fullName: 'Alex Johnson', role: 'student' as const },
        { email: 'maya.johnson@demo.com', fullName: 'Maya Johnson', role: 'student' as const },
        { email: 'tyler.williams@demo.com', fullName: 'Tyler Williams', role: 'student' as const },
        { email: 'zoe.williams@demo.com', fullName: 'Zoe Williams', role: 'student' as const },
        { email: 'diego.garcia@demo.com', fullName: 'Diego Garcia', role: 'student' as const },
        { email: 'sofia.garcia@demo.com', fullName: 'Sofia Garcia', role: 'student' as const },
      ];

      const insertedUsers = await tx.insert(schema.users).values(
        usersData.map(u => ({
          email: u.email,
          passwordHash,
          fullName: u.fullName,
          role: u.role,
          isActive: true,
        }))
      ).returning();

      const userMap: Record<string, number> = {};
      for (const u of insertedUsers) {
        userMap[u.email] = u.id;
      }

      for (const u of insertedUsers) {
        const userData = usersData.find(ud => ud.email === u.email)!;
        await tx.insert(schema.userRoles).values({
          userId: u.id,
          role: userData.role,
          schoolId: (userData.role === 'school_admin' || userData.role === 'teacher') ? school.id : undefined,
          isActive: true,
          permissions: userData.role === 'system_admin' ? ['manage_system', 'manage_all_schools'] : [],
        });
      }

      const teacherMathId = userMap['teacher.math@demo.com'];
      const teacherScienceId = userMap['teacher.science@demo.com'];
      const parentJohnsonId = userMap['parent.johnson@demo.com'];
      const parentWilliamsId = userMap['parent.williams@demo.com'];
      const parentGarciaId = userMap['parent.garcia@demo.com'];

      const [class1] = await tx.insert(schema.classes).values({
        name: 'Math Class 5A',
        subject: 'mathematics',
        gradeLevel: 'standard-5',
        schoolId: school.id,
        teacherId: teacherMathId,
        maxStudents: 25,
        isActive: true,
      }).returning();

      const [class2] = await tx.insert(schema.classes).values({
        name: 'Science Class 6B',
        subject: 'science',
        gradeLevel: 'form-2',
        schoolId: school.id,
        teacherId: teacherScienceId,
        maxStudents: 30,
        isActive: true,
      }).returning();

      const studentData = [
        { email: 'alex.johnson@demo.com', name: 'Alex Johnson', grade: 'form-3', parentId: parentJohnsonId, age: 14, exam: 'csec' },
        { email: 'maya.johnson@demo.com', name: 'Maya Johnson', grade: 'standard-5', parentId: parentJohnsonId, age: 11, exam: 'sea' },
        { email: 'tyler.williams@demo.com', name: 'Tyler Williams', grade: 'form-4', parentId: parentWilliamsId, age: 15, exam: 'csec' },
        { email: 'zoe.williams@demo.com', name: 'Zoe Williams', grade: 'form-2', parentId: parentWilliamsId, age: 13, exam: 'high-school-entrance' },
        { email: 'diego.garcia@demo.com', name: 'Diego Garcia', grade: 'form-5', parentId: parentGarciaId, age: 16, exam: 'cape' },
        { email: 'sofia.garcia@demo.com', name: 'Sofia Garcia', grade: 'standard-4', parentId: parentGarciaId, age: 10, exam: 'sea' },
      ];

      const insertedStudents: { id: number }[] = [];
      for (const s of studentData) {
        const [student] = await tx.insert(schema.students).values({
          userId: userMap[s.email],
          name: s.name,
          gradeLevel: s.grade,
          parentId: s.parentId,
          age: s.age,
          targetExam: s.exam,
        }).returning();
        insertedStudents.push(student);
      }

      for (const enrollment of [
        { studentId: insertedStudents[0].id, classId: class1.id, schoolId: school.id, isActive: true },
        { studentId: insertedStudents[1].id, classId: class1.id, schoolId: school.id, isActive: true },
        { studentId: insertedStudents[4].id, classId: class1.id, schoolId: school.id, isActive: true },
        { studentId: insertedStudents[2].id, classId: class2.id, schoolId: school.id, isActive: true },
        { studentId: insertedStudents[3].id, classId: class2.id, schoolId: school.id, isActive: true },
      ]) {
        await tx.insert(schema.classEnrollments).values(enrollment);
      }

      for (const s of insertedStudents) {
        await tx.insert(schema.studentSchools).values({
          studentId: s.id,
          schoolId: school.id,
          isActive: true,
        });
      }

      console.log('✅ Demo data seeded successfully! (' + insertedUsers.length + ' users, ' + insertedStudents.length + ' students)');
    });
  } catch (error) {
    console.error('⚠️ Error seeding demo data (will retry on next restart):', error);
  }
}
