/**
 * Clear Demo Data Script - Safely removes all demo accounts
 */

import { db } from '../server/storage';
import { eq, like } from 'drizzle-orm';
import * as schema from '../shared/schema';

export async function clearDemoData() {
  console.log('🧹 Clearing existing demo data...');

  try {
    // Delete demo users and their related data
    const demoEmails = [
      'emily.student@demo.com',
      'marcus.student@demo.com', 
      'sophia.student@demo.com',
      'david.student@demo.com',
      'ava.student@demo.com',
      'parent.johnson@demo.com',
      'parent.williams@demo.com',
      'parent.garcia@demo.com',
      'teacher.math@demo.com',
      'teacher.science@demo.com',
      'teacher.english@demo.com',
      'admin.school@demo.com',
      'admin.district@demo.com',
      'admin.system@demo.com'
    ];

    // Get demo user IDs
    const demoUsers = await db.select({ id: schema.users.id })
      .from(schema.users)
      .where(like(schema.users.email, '%demo.com'));

    const demoUserIds = demoUsers.map(u => u.id);

    if (demoUserIds.length === 0) {
      console.log('ℹ️ No demo data found to clear');
      return;
    }

    console.log(`Found ${demoUserIds.length} demo users to remove`);

    // Clear related data first (to avoid foreign key constraints)
    for (const userId of demoUserIds) {
      // Clear student-related data
      const students = await db.select({ id: schema.students.id })
        .from(schema.students)
        .where(eq(schema.students.userId, userId));

      for (const student of students) {
        await db.delete(schema.gamificationNotifications)
          .where(eq(schema.gamificationNotifications.studentId, student.id));
        await db.delete(schema.parentAchievements)
          .where(eq(schema.parentAchievements.studentId, student.id));
        await db.delete(schema.parentEngagement)
          .where(eq(schema.parentEngagement.studentId, student.id));
        await db.delete(schema.milestones)
          .where(eq(schema.milestones.studentId, student.id));
        await db.delete(schema.studentWallets)
          .where(eq(schema.studentWallets.studentId, student.id));
        await db.delete(schema.studentXP)
          .where(eq(schema.studentXP.studentId, student.id));
        await db.delete(schema.classEnrollments)
          .where(eq(schema.classEnrollments.studentId, student.id));
        await db.delete(schema.studentProfiles)
          .where(eq(schema.studentProfiles.studentId, student.id));
      }

      // Delete students
      await db.delete(schema.students)
        .where(eq(schema.students.userId, userId));

      // Clear teacher assignments
      await db.delete(schema.teacherAssignments)
        .where(eq(schema.teacherAssignments.teacherId, userId));
    }

    // Clear demo schools and classes
    const demoSchools = await db.select({ id: schema.schools.id })
      .from(schema.schools)
      .where(like(schema.schools.name, '%Demo%'));

    for (const school of demoSchools) {
      await db.delete(schema.classes)
        .where(eq(schema.classes.schoolId, school.id));
    }

    await db.delete(schema.schools)
      .where(like(schema.schools.name, '%Demo%'));

    // Also clear Caribbean and Sunshine schools  
    await db.delete(schema.classes)
      .where(like(schema.classes.name, '%Advanced Mathematics%'));
    await db.delete(schema.classes)
      .where(like(schema.classes.name, '%General Science%'));

    await db.delete(schema.schools)
      .where(like(schema.schools.name, '%Caribbean%'));
    await db.delete(schema.schools)
      .where(like(schema.schools.name, '%Sunshine%'));

    // Clear demo challenges
    await db.delete(schema.challenges)
      .where(like(schema.challenges.title, '%Math Mastery%'));

    // Clear demo rewards
    await db.delete(schema.rewardCatalog)
      .where(like(schema.rewardCatalog.name, '%Screen Time%'));
    await db.delete(schema.rewardCatalog)
      .where(like(schema.rewardCatalog.name, '%Art Supplies%'));
    await db.delete(schema.rewardCatalog)
      .where(like(schema.rewardCatalog.name, '%Science Experiment%'));

    // Finally, delete demo users
    await db.delete(schema.users)
      .where(like(schema.users.email, '%demo.com'));

    console.log('✅ Demo data cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing demo data:', error);
    throw error;
  }
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  clearDemoData()
    .then(() => {
      console.log('🎉 Demo data cleared!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Demo data clearing failed:', error);
      process.exit(1);
    });
}