/**
 * Simple Demo Account Creation - Uses existing infrastructure
 */

import { db } from '../server/storage';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema';
import bcrypt from 'bcryptjs';

export async function createSimpleDemoData() {
  console.log('🚀 Creating demo accounts...');

  try {
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Demo accounts
    const accounts = [
      // Students
      { email: 'emily.student@demo.com', name: 'Emily Johnson', role: 'student' },
      { email: 'marcus.student@demo.com', name: 'Marcus Williams', role: 'student' },
      { email: 'sophia.student@demo.com', name: 'Sophia Garcia', role: 'student' },
      
      // Parents
      { email: 'parent.johnson@demo.com', name: 'Robert Johnson', role: 'parent' },
      { email: 'parent.williams@demo.com', name: 'Lisa Williams', role: 'parent' },
      { email: 'parent.garcia@demo.com', name: 'Carlos Garcia', role: 'parent' },
      
      // Teachers
      { email: 'teacher.math@demo.com', name: 'Dr. Sarah Martinez', role: 'teacher' },
      { email: 'teacher.science@demo.com', name: 'Prof. Michael Chen', role: 'teacher' },
      
      // Admins
      { email: 'admin.school@demo.com', name: 'Principal James Wilson', role: 'school_admin' },
      { email: 'admin.system@demo.com', name: 'System Administrator', role: 'system_admin' }
    ];

    const createdUsers = [];

    for (const account of accounts) {
      console.log(`Creating user: ${account.email}`);
      
      // Check if user already exists
      const existing = await db.select()
        .from(schema.users)
        .where(eq(schema.users.email, account.email))
        .limit(1);

      if (existing.length > 0) {
        console.log(`User ${account.email} already exists, skipping...`);
        createdUsers.push(existing[0]);
        continue;
      }

      const user = await db.insert(schema.users).values({
        email: account.email,
        passwordHash: hashedPassword,
        role: account.role as any,
        fullName: account.name,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      createdUsers.push(user[0]);
    }

    // Create student records and profiles
    const studentUsers = createdUsers.filter(u => u.role === 'student');
    const parentUsers = createdUsers.filter(u => u.role === 'parent');

    for (let i = 0; i < studentUsers.length; i++) {
      const studentUser = studentUsers[i];
      const parentUser = parentUsers[i % parentUsers.length];

      console.log(`Creating student profile for: ${studentUser.fullName}`);

      // Create student record
      const studentRecord = await db.insert(schema.students).values({
        userId: studentUser.id,
        parentId: parentUser.id
      }).returning();

      // Create student profile
      await db.insert(schema.studentProfiles).values({
        studentId: studentRecord[0].id,
        name: studentUser.fullName!,
        dateOfBirth: new Date(2010 + i, 5, 15),
        gradeLevel: i === 0 ? 'Grade 5' : i === 1 ? 'Grade 6' : 'Grade 5',
        gradeSystem: 'caribbean',
        schoolId: 1, // Use existing school
        parentId: parentUser.id,
        enrollmentStatus: 'active'
      });

      // Enroll in existing class
      await db.insert(schema.classEnrollments).values({
        studentId: studentRecord[0].id,
        classId: i === 0 ? 1 : 2, // Use existing classes
        enrollmentDate: new Date(),
        status: 'active'
      });

      // Create gamification data
      await db.insert(schema.studentXP).values({
        studentId: studentRecord[0].id,
        totalXp: 1500 + (i * 300),
        currentLevel: 5 + i,
        weeklyXp: 300 + (i * 100),
        monthlyXp: 1200 + (i * 400),
        streakDays: 7 + (i * 3),
        longestStreak: 15 + (i * 5),
        lastActivityDate: new Date()
      });

      await db.insert(schema.studentWallets).values({
        studentId: studentRecord[0].id,
        totalPointsEarned: 2500 + (i * 500),
        availablePoints: 150 + (i * 50),
        totalPointsSpent: 2350 + (i * 450),
        lifetimeEarnings: 2500 + (i * 500)
      });

      // Create achievements
      await db.insert(schema.milestones).values({
        studentId: studentRecord[0].id,
        type: 'streak',
        title: 'Week Warrior',
        description: 'Maintained a 7-day learning streak',
        badgeIcon: '🔥',
        points: 150,
        achievedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000)
      });

      // Create parent engagement
      await db.insert(schema.parentEngagement).values({
        parentId: parentUser.id,
        studentId: studentRecord[0].id,
        engagementScore: 85 + (i * 5),
        engagementLevel: i === 0 ? 'high' : 'medium',
        totalLogins: 45 + (i * 15),
        weeklyLogins: 5 + i,
        lastLogin: new Date(),
        createdAt: new Date()
      });

      // Create parent achievements
      await db.insert(schema.parentAchievements).values({
        parentId: parentUser.id,
        studentId: studentRecord[0].id,
        type: 'engagement',
        name: 'Supportive Parent',
        description: 'Consistently engaged with child\'s learning progress',
        badgeIcon: '🏆',
        earnedAt: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000),
        criteria: 'Weekly engagement for 4 consecutive weeks'
      });

      // Create notifications
      await db.insert(schema.gamificationNotifications).values({
        parentId: parentUser.id,
        studentId: studentRecord[0].id,
        type: 'achievement',
        title: 'New Achievement Unlocked!',
        message: `${studentUser.fullName} earned the "Week Warrior" badge!`,
        isRead: i % 2 === 0,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      });
    }

    // Assign teachers to existing classes
    const teacherUsers = createdUsers.filter(u => u.role === 'teacher');
    for (let i = 0; i < teacherUsers.length && i < 2; i++) {
      const teacher = teacherUsers[i];
      console.log(`Assigning teacher: ${teacher.fullName}`);
      
      await db.insert(schema.teacherAssignments).values({
        teacherId: teacher.id,
        classId: i + 1, // Assign to existing classes
        subject: i === 0 ? 'mathematics' : 'science',
        assignedDate: new Date(),
        academicYear: '2024-2025'
      });
    }

    console.log('✅ Demo accounts created successfully!');
    console.log(`Created ${createdUsers.length} user accounts`);
    
    return createdUsers;

  } catch (error) {
    console.error('❌ Error creating demo accounts:', error);
    throw error;
  }
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  createSimpleDemoData()
    .then(() => {
      console.log('🎉 Demo setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Demo setup failed:', error);
      process.exit(1);
    });
}