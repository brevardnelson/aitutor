/**
 * Demo Data Creation Script for Caribbean AI Tutor Platform
 * Creates comprehensive demo accounts for all user roles with realistic relationships
 */

import { db } from '../server/storage';
import { eq, and } from 'drizzle-orm';
import * as schema from '../shared/schema';
import bcrypt from 'bcryptjs';

interface DemoAccount {
  email: string;
  password: string;
  role: string;
  name: string;
}

export const demoAccounts: DemoAccount[] = [
  // Student Accounts
  {
    email: 'emily.student@demo.com',
    password: 'demo123',
    role: 'student',
    name: 'Emily Johnson'
  },
  {
    email: 'marcus.student@demo.com',
    password: 'demo123',
    role: 'student',
    name: 'Marcus Williams'
  },
  {
    email: 'sophia.student@demo.com',
    password: 'demo123',
    role: 'student',
    name: 'Sophia Garcia'
  },
  {
    email: 'david.student@demo.com',
    password: 'demo123',
    role: 'student',
    name: 'David Thompson'
  },
  {
    email: 'ava.student@demo.com',
    password: 'demo123',
    role: 'student',
    name: 'Ava Mitchell'
  },

  // Parent Accounts
  {
    email: 'parent.johnson@demo.com',
    password: 'demo123',
    role: 'parent',
    name: 'Robert Johnson'
  },
  {
    email: 'parent.williams@demo.com',
    password: 'demo123',
    role: 'parent',
    name: 'Lisa Williams'
  },
  {
    email: 'parent.garcia@demo.com',
    password: 'demo123',
    role: 'parent',
    name: 'Carlos Garcia'
  },

  // Teacher Accounts
  {
    email: 'teacher.math@demo.com',
    password: 'demo123',
    role: 'teacher',
    name: 'Dr. Sarah Martinez'
  },
  {
    email: 'teacher.science@demo.com',
    password: 'demo123',
    role: 'teacher',
    name: 'Prof. Michael Chen'
  },
  {
    email: 'teacher.english@demo.com',
    password: 'demo123',
    role: 'teacher',
    name: 'Ms. Jennifer Brown'
  },

  // Administrator Accounts
  {
    email: 'admin.school@demo.com',
    password: 'demo123',
    role: 'school_admin',
    name: 'Principal James Wilson'
  },
  {
    email: 'admin.district@demo.com',
    password: 'demo123',
    role: 'district_admin',
    name: 'Dr. Maria Rodriguez'
  },
  {
    email: 'admin.system@demo.com',
    password: 'demo123',
    role: 'system_admin',
    name: 'System Administrator'
  }
];

export async function createDemoData() {
  console.log('🚀 Starting demo data creation...');

  try {
    // Hash password for all accounts
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Create schools
    console.log('🏫 Creating schools...');
    const caribbeanSchool = await db.insert(schema.schools).values({
      name: 'Caribbean International Academy',
      code: 'CIA-001',
      address: '123 Education Avenue, Port of Spain, Trinidad',
      phone: '+1-868-555-0001',
      principalName: 'Principal James Wilson',
      gradeSystem: 'caribbean'
    }).returning();

    const usSchool = await db.insert(schema.schools).values({
      name: 'Sunshine Elementary School',
      code: 'SES-001',
      address: '456 Learning Street, Miami, FL 33101',
      phone: '+1-305-555-0002',
      principalName: 'Dr. Maria Rodriguez',
      gradeSystem: 'us'
    }).returning();

    // Create classes
    console.log('📚 Creating classes...');
    const mathClass = await db.insert(schema.classes).values({
      name: 'Advanced Mathematics',
      code: 'MATH-401',
      schoolId: caribbeanSchool[0].id,
      gradeLevel: 'Form 4',
      subject: 'mathematics',
      academicYear: '2024-2025'
    }).returning();

    const scienceClass = await db.insert(schema.classes).values({
      name: 'General Science',
      code: 'SCI-301',
      schoolId: usSchool[0].id,
      gradeLevel: 'Grade 8',
      subject: 'science',
      academicYear: '2024-2025'
    }).returning();

    // Create user accounts
    console.log('👥 Creating user accounts...');
    const createdUsers = [];

    for (const account of demoAccounts) {
      const user = await db.insert(schema.users).values({
        email: account.email,
        passwordHash: hashedPassword,
        role: account.role as any,
        fullName: account.name,
        isEmailVerified: true,
        createdAt: new Date(),
        lastLoginAt: new Date()
      }).returning();

      createdUsers.push({ ...user[0], originalPassword: account.password });
    }

    // Find specific users for relationships
    const students = createdUsers.filter(u => u.role === 'student');
    const parents = createdUsers.filter(u => u.role === 'parent');
    const teachers = createdUsers.filter(u => u.role === 'teacher');

    // Create student records
    console.log('🎓 Creating student records...');
    const studentRecords = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const parentUser = parents[i % parents.length]; // Cycle through parents
      
      // Create student record
      const studentRecord = await db.insert(schema.students).values({
        userId: student.id,
        parentId: parentUser.id
      }).returning();

      studentRecords.push(studentRecord[0]);

      // Create student profile
      await db.insert(schema.studentProfiles).values({
        studentId: studentRecord[0].id,
        name: student.fullName!,
        dateOfBirth: new Date(2010 - i, 5, 15), // Ages 14-18
        gradeLevel: i < 2 ? 'Form 4' : 'Grade 8',
        gradeSystem: i < 2 ? 'caribbean' : 'us',
        schoolId: i < 2 ? caribbeanSchool[0].id : usSchool[0].id,
        parentId: parentUser.id,
        enrollmentStatus: 'active'
      });

      // Create class enrollments
      const classToEnroll = i < 2 ? mathClass[0] : scienceClass[0];
      await db.insert(schema.classEnrollments).values({
        studentId: studentRecord[0].id,
        classId: classToEnroll.id,
        enrollmentDate: new Date(),
        status: 'active'
      });

      // Create XP profile
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

      // Create wallet
      await db.insert(schema.studentWallets).values({
        studentId: studentRecord[0].id,
        totalPointsEarned: 2500 + (i * 500),
        availablePoints: 150 + (i * 50),
        totalPointsSpent: 2350 + (i * 450),
        lifetimeEarnings: 2500 + (i * 500)
      });

      // Create some milestones
      await db.insert(schema.milestones).values({
        studentId: studentRecord[0].id,
        type: 'streak',
        title: 'Week Warrior',
        description: 'Maintained a 7-day learning streak',
        badgeIcon: '🔥',
        points: 150,
        achievedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000)
      });

      await db.insert(schema.milestones).values({
        studentId: studentRecord[0].id,
        type: 'milestone',
        title: 'Problem Solver',
        description: 'Completed 50 math problems',
        badgeIcon: '🧮',
        points: 300,
        achievedAt: new Date(Date.now() - (i + 2) * 24 * 60 * 60 * 1000)
      });
    }

    // Create parent engagement data
    console.log('👨‍👩‍👧‍👦 Creating parent engagement data...');
    for (let i = 0; i < parents.length; i++) {
      const parent = parents[i];
      const relatedStudents = studentRecords.filter((_, idx) => idx % parents.length === i);

      for (const studentRecord of relatedStudents) {
        // Create parent engagement record
        await db.insert(schema.parentEngagement).values({
          parentId: parent.id,
          studentId: studentRecord.id,
          engagementScore: 75 + (i * 10), // Varying engagement levels
          engagementLevel: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
          totalLogins: 45 + (i * 15),
          weeklyLogins: 5 + i,
          lastLogin: new Date(),
          createdAt: new Date()
        });

        // Create parent achievements/badges
        await db.insert(schema.parentAchievements).values({
          parentId: parent.id,
          studentId: studentRecord.id,
          type: 'engagement',
          name: 'Supportive Parent',
          description: 'Consistently engaged with child\'s learning progress',
          badgeIcon: '🏆',
          earnedAt: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000),
          criteria: 'Weekly engagement for 4 consecutive weeks'
        });

        // Create some notifications
        await db.insert(schema.gamificationNotifications).values({
          parentId: parent.id,
          studentId: studentRecord.id,
          type: 'achievement',
          title: 'New Achievement Unlocked!',
          message: `${student.fullName} earned the "Week Warrior" badge for maintaining a 7-day streak!`,
          isRead: i % 2 === 0, // Some read, some unread
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        });
      }
    }

    // Create teacher assignments
    console.log('👩‍🏫 Creating teacher assignments...');
    for (let i = 0; i < teachers.length; i++) {
      const teacher = teachers[i];
      const classToAssign = i === 0 ? mathClass[0] : scienceClass[0];

      await db.insert(schema.teacherAssignments).values({
        teacherId: teacher.id,
        classId: classToAssign.id,
        subject: classToAssign.subject,
        assignedDate: new Date(),
        academicYear: '2024-2025'
      });
    }

    // Create some sample challenges
    console.log('🎮 Creating challenges...');
    await db.insert(schema.challenges).values({
      title: 'Math Mastery Week',
      description: 'Complete 25 math problems and earn bonus XP!',
      type: 'weekly',
      subject: 'mathematics',
      targetValue: 25,
      xpReward: 500,
      pointsReward: 750,
      badgeReward: '🏆',
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date()
    });

    // Create some reward catalog items
    console.log('🎁 Creating reward catalog...');
    const rewards = [
      {
        name: 'Extra Screen Time',
        description: '30 minutes of additional recreational screen time',
        category: 'digital',
        pointsCost: 50,
        ageGroup: 'all',
        isActive: true
      },
      {
        name: 'Art Supplies Set',
        description: 'Premium colored pencils and sketchbook',
        category: 'creative',
        pointsCost: 200,
        ageGroup: 'all',
        isActive: true
      },
      {
        name: 'Science Experiment Kit',
        description: 'Safe, fun chemistry experiments for home',
        category: 'educational',
        pointsCost: 300,
        ageGroup: 'middle_high',
        isActive: true
      }
    ];

    for (const reward of rewards) {
      await db.insert(schema.rewardCatalog).values(reward);
    }

    console.log('✅ Demo data creation completed successfully!');
    console.log(`Created ${createdUsers.length} user accounts across all roles`);
    console.log(`Created ${studentRecords.length} student profiles with realistic data`);
    console.log('🎯 All relationships, gamification data, and institutional hierarchy established');

    return {
      users: createdUsers,
      students: studentRecords,
      schools: [caribbeanSchool[0], usSchool[0]],
      classes: [mathClass[0], scienceClass[0]]
    };

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
    throw error;
  }
}

// Run the script if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  createDemoData()
    .then(() => {
      console.log('🎉 Demo data setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Demo data setup failed:', error);
      process.exit(1);
    });
}