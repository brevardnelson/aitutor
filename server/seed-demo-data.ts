import bcrypt from 'bcryptjs';
import { db } from './storage';
import * as schema from '../shared/schema';
import { sql, eq, inArray } from 'drizzle-orm';

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

// Format a Date as YYYY-MM-DD string
function dateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

// Returns a Date that is `daysAgo` days before now
function daysBack(daysAgo: number): Date {
  return new Date(Date.now() - daysAgo * 86400000);
}

async function ensureTeacherSampleData() {
  try {
    // Dynamically look up demo student IDs by email
    const demoEmails = [
      'alex.johnson@demo.com',
      'maya.johnson@demo.com',
      'tyler.williams@demo.com',
      'zoe.williams@demo.com',
      'diego.garcia@demo.com',
    ];

    const studentRows = await db
      .select({ id: schema.students.id, email: schema.users.email })
      .from(schema.students)
      .innerJoin(schema.users, eq(schema.students.userId, schema.users.id))
      .where(inArray(schema.users.email, demoEmails));

    if (studentRows.length === 0) {
      console.log('No demo teacher students found, skipping sample data.');
      return;
    }

    const sm: Record<string, number> = {};
    for (const s of studentRows) sm[s.email] = s.id;

    const alexId = sm['alex.johnson@demo.com'];
    const mayaId = sm['maya.johnson@demo.com'];
    const tylerId = sm['tyler.williams@demo.com'];
    const zoeId = sm['zoe.williams@demo.com'];
    const diegoId = sm['diego.garcia@demo.com'];

    if (!alexId || !mayaId || !tylerId || !zoeId || !diegoId) {
      console.log('Some demo students missing, skipping sample data.');
      return;
    }

    // ── 1. Student XP ────────────────────────────────────────────────────────
    // Use raw SQL because the actual student_xp table has student_id as its PK
    // (no separate serial id column) which mismatches the Drizzle schema definition.
    // Use SQL NOW()-INTERVAL expressions to avoid Date serialization issues.
    await db.execute(sql`
      INSERT INTO student_xp (student_id, total_xp, spent_xp, available_xp, level, weekly_xp, monthly_xp, last_xp_earned)
      VALUES
        (${alexId},  450,  0, 450,  3, 120, 380, NOW() - INTERVAL '1 day'),
        (${mayaId},  820,  0, 820,  5, 210, 650, NOW()),
        (${diegoId}, 95,   0, 95,   1, 15,  80,  NOW() - INTERVAL '10 days'),
        (${tylerId}, 600,  0, 600,  4, 180, 520, NOW() - INTERVAL '1 day'),
        (${zoeId},   1200, 0, 1200, 7, 280, 900, NOW())
      ON CONFLICT (student_id) DO NOTHING
    `);

    // ── 2. Learning sessions (insert only if none exist for these students) ──
    const sessionCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.learningSessions)
      .where(inArray(schema.learningSessions.studentId, [alexId, mayaId, tylerId, zoeId, diegoId]));

    const existingSessionCount = Number(sessionCountResult[0]?.count ?? 0);

    if (existingSessionCount === 0) {
      const mathTopics = ['Fractions', 'Percentages', 'Algebra', 'Word Problems', 'Whole Numbers'];
      const sciTopics  = ['Matter', 'Forces', 'Energy', 'Ecosystems', 'Human Body'];

      // activeDays: which days ago the student studied (0 = today, 1 = yesterday, etc.)
      const studentProfiles = [
        { id: alexId,  subject: 'mathematics', topics: mathTopics, accuracy: 0.65,
          activeDays: [1,2,4,5,7,8,10,12,14,16,18,21] },
        { id: mayaId,  subject: 'mathematics', topics: mathTopics, accuracy: 0.78,
          activeDays: [0,1,2,3,5,6,7,8,10,11,12,14,15,16,18] },
        { id: diegoId, subject: 'mathematics', topics: mathTopics, accuracy: 0.42,
          activeDays: [3,8,14,21] },
        { id: tylerId, subject: 'science',     topics: sciTopics,  accuracy: 0.72,
          activeDays: [0,1,2,4,5,7,8,10,11,13,15,17,20] },
        { id: zoeId,   subject: 'science',     topics: sciTopics,  accuracy: 0.85,
          activeDays: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,20] },
      ];

      const sessions: (typeof schema.learningSessions.$inferInsert)[] = [];

      for (const p of studentProfiles) {
        for (let i = 0; i < p.activeDays.length; i++) {
          const start = daysBack(p.activeDays[i]);
          start.setHours(14 + (i % 4), (i * 7) % 60, 0, 0);
          const duration = 20 + (i % 4) * 5;
          const end = new Date(start.getTime() + duration * 60000);
          const attempted = 8 + (i % 5);
          const correct   = Math.round(attempted * p.accuracy);
          const completed = correct + Math.round((attempted - correct) * 0.5);
          const topic = p.topics[i % p.topics.length];

          sessions.push({
            studentId: p.id,
            subject: p.subject,
            topic,
            startTime: start,
            endTime: end,
            duration,
            problemsAttempted: attempted,
            problemsCompleted: completed,
            correctAnswers: correct,
            hintsUsed: Math.max(0, Math.round((1 - p.accuracy) * 3)),
            avgAttemptsPerProblem: p.accuracy > 0.7 ? '1.3' : '2.1',
            difficulty: p.accuracy > 0.75 ? 'medium' : 'easy',
            sessionType: i % 3 === 0 ? 'review' : 'practice',
          });
        }
      }

      await db.insert(schema.learningSessions).values(sessions);

      // ── 3. Daily activity (has unique constraint per student+date) ────────
      const dailyRows: (typeof schema.dailyActivity.$inferInsert)[] = [];

      for (const p of studentProfiles) {
        for (let i = 0; i < p.activeDays.length; i++) {
          const daysAgo = p.activeDays[i];
          if (daysAgo > 21) continue; // Only last 21 days
          const attempted = 8 + (i % 5);
          const completed = Math.round(attempted * 0.85);
          const topic = p.topics[i % p.topics.length];

          dailyRows.push({
            studentId: p.id,
            date: dateStr(daysBack(daysAgo)),
            totalTime: 20 + (i % 4) * 5,
            sessionsCount: 1,
            topicsWorked: [topic],
            problemsAttempted: attempted,
            problemsCompleted: completed,
            accuracyRate: String(Math.round(p.accuracy * 100)),
          });
        }
      }

      if (dailyRows.length > 0) {
        await db.insert(schema.dailyActivity).values(dailyRows).onConflictDoNothing();
      }
    }

    // ── 4. Topic mastery (insert only if none exist for these students) ──────
    const masteryCountResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.topicMastery)
      .where(inArray(schema.topicMastery.studentId, [alexId, mayaId, tylerId, zoeId, diegoId]));

    const existingMasteryCount = Number(masteryCountResult[0]?.count ?? 0);

    if (existingMasteryCount === 0) {
      const now = new Date();
      const monthAgo = daysBack(30);

      const masteryData: (typeof schema.topicMastery.$inferInsert)[] = [
        // Alex — moderate Math student
        { studentId: alexId, subject: 'mathematics', topic: 'Fractions',     totalProblems: 45, completedProblems: 38, accuracyRate: '65', masteryLevel: 'developing', timeSpent: 120, firstAttemptDate: monthAgo, lastActivityDate: daysBack(2) },
        { studentId: alexId, subject: 'mathematics', topic: 'Percentages',   totalProblems: 30, completedProblems: 25, accuracyRate: '60', masteryLevel: 'developing', timeSpent: 85,  firstAttemptDate: monthAgo, lastActivityDate: daysBack(4) },
        { studentId: alexId, subject: 'mathematics', topic: 'Algebra',       totalProblems: 20, completedProblems: 15, accuracyRate: '70', masteryLevel: 'proficient', timeSpent: 60,  firstAttemptDate: monthAgo, lastActivityDate: daysBack(7) },
        { studentId: alexId, subject: 'mathematics', topic: 'Word Problems', totalProblems: 25, completedProblems: 18, accuracyRate: '62', masteryLevel: 'developing', timeSpent: 70,  firstAttemptDate: monthAgo, lastActivityDate: daysBack(5) },

        // Maya — strong Math student
        { studentId: mayaId, subject: 'mathematics', topic: 'Fractions',     totalProblems: 60, completedProblems: 55, accuracyRate: '80', masteryLevel: 'mastered',   timeSpent: 160, firstAttemptDate: monthAgo, lastActivityDate: daysBack(1) },
        { studentId: mayaId, subject: 'mathematics', topic: 'Percentages',   totalProblems: 45, completedProblems: 40, accuracyRate: '78', masteryLevel: 'proficient', timeSpent: 130, firstAttemptDate: monthAgo, lastActivityDate: daysBack(2) },
        { studentId: mayaId, subject: 'mathematics', topic: 'Algebra',       totalProblems: 35, completedProblems: 30, accuracyRate: '75', masteryLevel: 'proficient', timeSpent: 90,  firstAttemptDate: monthAgo, lastActivityDate: daysBack(3) },
        { studentId: mayaId, subject: 'mathematics', topic: 'Whole Numbers', totalProblems: 30, completedProblems: 28, accuracyRate: '82', masteryLevel: 'mastered',   timeSpent: 75,  firstAttemptDate: monthAgo, lastActivityDate: daysBack(0) },

        // Diego — struggling Math student (needs attention)
        { studentId: diegoId, subject: 'mathematics', topic: 'Fractions',    totalProblems: 15, completedProblems: 10, accuracyRate: '42', masteryLevel: 'novice',     timeSpent: 40,  firstAttemptDate: daysBack(21), lastActivityDate: daysBack(14) },
        { studentId: diegoId, subject: 'mathematics', topic: 'Algebra',      totalProblems: 10, completedProblems: 6,  accuracyRate: '45', masteryLevel: 'novice',     timeSpent: 30,  firstAttemptDate: daysBack(21), lastActivityDate: daysBack(8) },

        // Tyler — solid Science student
        { studentId: tylerId, subject: 'science', topic: 'Matter',           totalProblems: 50, completedProblems: 42, accuracyRate: '72', masteryLevel: 'proficient', timeSpent: 140, firstAttemptDate: monthAgo, lastActivityDate: daysBack(1) },
        { studentId: tylerId, subject: 'science', topic: 'Forces',           totalProblems: 40, completedProblems: 33, accuracyRate: '70', masteryLevel: 'developing', timeSpent: 115, firstAttemptDate: monthAgo, lastActivityDate: daysBack(2) },
        { studentId: tylerId, subject: 'science', topic: 'Energy',           totalProblems: 35, completedProblems: 28, accuracyRate: '74', masteryLevel: 'proficient', timeSpent: 100, firstAttemptDate: monthAgo, lastActivityDate: daysBack(4) },
        { studentId: tylerId, subject: 'science', topic: 'Ecosystems',       totalProblems: 25, completedProblems: 20, accuracyRate: '68', masteryLevel: 'developing', timeSpent: 70,  firstAttemptDate: monthAgo, lastActivityDate: daysBack(5) },

        // Zoe — top Science student
        { studentId: zoeId, subject: 'science', topic: 'Matter',             totalProblems: 70, completedProblems: 65, accuracyRate: '86', masteryLevel: 'mastered',   timeSpent: 180, firstAttemptDate: monthAgo, lastActivityDate: daysBack(0) },
        { studentId: zoeId, subject: 'science', topic: 'Forces',             totalProblems: 65, completedProblems: 60, accuracyRate: '84', masteryLevel: 'mastered',   timeSpent: 165, firstAttemptDate: monthAgo, lastActivityDate: daysBack(1) },
        { studentId: zoeId, subject: 'science', topic: 'Energy',             totalProblems: 55, completedProblems: 50, accuracyRate: '88', masteryLevel: 'mastered',   timeSpent: 140, firstAttemptDate: monthAgo, lastActivityDate: daysBack(2) },
        { studentId: zoeId, subject: 'science', topic: 'Ecosystems',         totalProblems: 45, completedProblems: 40, accuracyRate: '82', masteryLevel: 'proficient', timeSpent: 120, firstAttemptDate: monthAgo, lastActivityDate: daysBack(3) },
        { studentId: zoeId, subject: 'science', topic: 'Human Body',         totalProblems: 40, completedProblems: 35, accuracyRate: '85', masteryLevel: 'proficient', timeSpent: 100, firstAttemptDate: monthAgo, lastActivityDate: daysBack(4) },
      ];

      await db.insert(schema.topicMastery).values(masteryData);
    }

    // ── 5. Student badges (requires badge_definitions to exist) ──────────────
    // Use raw SQL to avoid schema/DB mismatch (student_badges table in the DB
    // is missing the is_active and display_order columns that exist in schema.ts).
    const badgeDefs = await db
      .select({ id: schema.badgeDefinitions.id })
      .from(schema.badgeDefinitions)
      .where(eq(schema.badgeDefinitions.isActive, true));

    if (badgeDefs.length > 0) {
      const badgeIds = badgeDefs.map(b => b.id);

      // Assignment: [studentId, badgeId, earnedAtInterval, notificationSent]
      const assignments: Array<[number, string, string, boolean]> = [];

      // Zoe: top performer — most badges (up to 5)
      for (const bid of badgeIds.slice(0, Math.min(5, badgeIds.length))) {
        assignments.push([zoeId, bid, '14 days', true]);
      }
      // Maya: good performer — 3 badges
      for (const bid of badgeIds.slice(0, Math.min(3, badgeIds.length))) {
        assignments.push([mayaId, bid, '7 days', true]);
      }
      // Tyler: moderate — 2 badges
      for (const bid of badgeIds.slice(0, Math.min(2, badgeIds.length))) {
        assignments.push([tylerId, bid, '7 days', false]);
      }
      // Alex: 1 badge (just started)
      if (badgeIds.length > 0) {
        assignments.push([alexId, badgeIds[0], '21 days', false]);
      }
      // Diego: no earned badges (needs attention)

      for (const [sid, bid, interval, notified] of assignments) {
        await db.execute(sql`
          INSERT INTO student_badges (student_id, badge_id, progress, is_earned, earned_at, notification_sent)
          VALUES (${sid}, ${bid}, '100', true, NOW() - INTERVAL ${sql.raw(`'${interval}'`)}, ${notified})
          ON CONFLICT (student_id, badge_id) DO NOTHING
        `);
      }
    }

    console.log('✅ Teacher sample data seeded successfully!');
  } catch (error) {
    console.error('⚠️ Error seeding teacher sample data:', error);
  }
}

export async function seedDemoDataIfEmpty() {
  try {
    await ensureSchemaColumns();
    // Always run sample data seeder (idempotent — uses ON CONFLICT DO NOTHING)
    await ensureTeacherSampleData();

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
