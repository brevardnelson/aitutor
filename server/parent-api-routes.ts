// Parent API routes for children management, notifications, badges, and redemption recommendations
// Extends existing parent functionality with gamification features

import express from 'express';
import { authenticateToken, requireParentOrAbove } from './auth-middleware';
import { ParentNotificationService } from './parent-notification-service';
import { ParentBadgeService } from './parent-badge-service';
import { RedemptionRecommendationService } from './redemption-recommendation-service';
import { db } from './storage';
import * as schema from '../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import Joi from 'joi';

const router = express.Router();
const notificationService = new ParentNotificationService();
const badgeService = new ParentBadgeService();
const recommendationService = new RedemptionRecommendationService();

// Validation schemas for children
const createChildSchema = Joi.object({
  name: Joi.string().min(2).required(),
  age: Joi.number().min(5).max(20).required(),
  gradeLevel: Joi.string().required(),
  targetExam: Joi.string().optional(),
  subjects: Joi.array().items(Joi.string()).min(1).required(),
});

const updateChildSchema = Joi.object({
  name: Joi.string().min(2).optional(),
  age: Joi.number().min(5).max(20).optional(),
  gradeLevel: Joi.string().optional(),
  targetExam: Joi.string().optional(),
  subjects: Joi.array().items(Joi.string()).min(1).optional(),
});

// GET /api/parent/children - Get all children for authenticated parent
router.get('/children', authenticateToken, requireParentOrAbove, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const children = await db.select({
      id: schema.students.id,
      name: schema.students.name,
      age: schema.students.age,
      gradeLevel: schema.students.gradeLevel,
      targetExam: schema.students.targetExam,
    })
    .from(schema.students)
    .where(eq(schema.students.parentId, userId));

    // Get subjects for each child
    const childrenWithSubjects = await Promise.all(children.map(async (child) => {
      const enrollments = await db.select({
        subject: schema.studentSubjectEnrollments.subject
      })
      .from(schema.studentSubjectEnrollments)
      .where(eq(schema.studentSubjectEnrollments.studentId, child.id));

      return {
        ...child,
        subjects: enrollments.map(e => e.subject)
      };
    }));

    res.json({ children: childrenWithSubjects });
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({ error: 'Failed to fetch children' });
  }
});

// POST /api/parent/children - Add a new child
router.post('/children', authenticateToken, requireParentOrAbove, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const { error, value } = createChildSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }

    const { name, age, gradeLevel, targetExam, subjects } = value;

    // Use transaction to ensure all-or-nothing child creation
    const child = await db.transaction(async (tx) => {
      // Create child in students table
      const [newChild] = await tx.insert(schema.students)
        .values({
          parentId: userId,
          name,
          age,
          gradeLevel,
          targetExam,
        })
        .returning();

      // Create student profile (for gamification and other features)
      await tx.insert(schema.studentProfiles)
        .values({
          studentId: newChild.id,
          name,
          age,
          grade: gradeLevel, // Map gradeLevel to grade column
          targetExam,
        });

      // Create subject enrollments
      if (subjects && subjects.length > 0) {
        await tx.insert(schema.studentSubjectEnrollments)
          .values(subjects.map((subject: string) => ({
            studentId: newChild.id,
            subject,
          })));
      }

      return newChild;
    });

    res.json({ 
      success: true, 
      child: {
        ...child,
        subjects
      }
    });
  } catch (error) {
    console.error('Create child error:', error);
    res.status(500).json({ error: 'Failed to create child' });
  }
});

// GET /api/parent/children/:id - Get specific child
router.get('/children/:id', authenticateToken, requireParentOrAbove, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }
    const childId = parseInt(req.params.id);

    const [child] = await db.select()
      .from(schema.students)
      .where(
        and(
          eq(schema.students.id, childId),
          eq(schema.students.parentId, userId)
        )
      )
      .limit(1);

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Get subjects
    const enrollments = await db.select({
      subject: schema.studentSubjectEnrollments.subject
    })
    .from(schema.studentSubjectEnrollments)
    .where(eq(schema.studentSubjectEnrollments.studentId, child.id));

    res.json({ 
      child: {
        ...child,
        subjects: enrollments.map(e => e.subject)
      }
    });
  } catch (error) {
    console.error('Get child error:', error);
    res.status(500).json({ error: 'Failed to fetch child' });
  }
});

// PUT /api/parent/children/:id - Update child
router.put('/children/:id', authenticateToken, requireParentOrAbove, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }
    const childId = parseInt(req.params.id);

    const { error, value } = updateChildSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }

    // Verify ownership
    const [existingChild] = await db.select()
      .from(schema.students)
      .where(
        and(
          eq(schema.students.id, childId),
          eq(schema.students.parentId, userId)
        )
      )
      .limit(1);

    if (!existingChild) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const { name, age, gradeLevel, targetExam, subjects } = value;

    // Use transaction to ensure atomic updates across all tables
    const result = await db.transaction(async (tx) => {
      // Update child basic info in both students and student_profiles tables
      const updateData: any = {};
      if (name) updateData.name = name;
      if (age) updateData.age = age;
      if (gradeLevel) updateData.gradeLevel = gradeLevel;
      if (targetExam !== undefined) updateData.targetExam = targetExam;

      if (Object.keys(updateData).length > 0) {
        // Update students table
        await tx.update(schema.students)
          .set(updateData)
          .where(eq(schema.students.id, childId));

        // Update student_profiles table (sync both tables, map gradeLevel to grade)
        const profileUpdateData: any = { ...updateData };
        if (profileUpdateData.gradeLevel) {
          profileUpdateData.grade = profileUpdateData.gradeLevel;
          delete profileUpdateData.gradeLevel;
        }
        await tx.update(schema.studentProfiles)
          .set(profileUpdateData)
          .where(eq(schema.studentProfiles.studentId, childId));
      }

      // Update subjects if provided
      if (subjects && subjects.length > 0) {
        // Delete existing enrollments
        await tx.delete(schema.studentSubjectEnrollments)
          .where(eq(schema.studentSubjectEnrollments.studentId, childId));

        // Insert new enrollments
        await tx.insert(schema.studentSubjectEnrollments)
          .values(subjects.map((subject: string) => ({
            studentId: childId,
            subject,
          })));
      }

      // Get updated child
      const [updatedChild] = await tx.select()
        .from(schema.students)
        .where(eq(schema.students.id, childId))
        .limit(1);

      const enrollments = await tx.select({
        subject: schema.studentSubjectEnrollments.subject
      })
      .from(schema.studentSubjectEnrollments)
      .where(eq(schema.studentSubjectEnrollments.studentId, childId));

      return {
        child: updatedChild,
        subjects: enrollments.map(e => e.subject)
      };
    });

    res.json({ 
      success: true,
      child: {
        ...result.child,
        subjects: result.subjects
      }
    });
  } catch (error) {
    console.error('Update child error:', error);
    res.status(500).json({ error: 'Failed to update child' });
  }
});

// DELETE /api/parent/children/:id - Delete child
router.delete('/children/:id', authenticateToken, requireParentOrAbove, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }
    const childId = parseInt(req.params.id);

    // Verify ownership
    const [child] = await db.select()
      .from(schema.students)
      .where(
        and(
          eq(schema.students.id, childId),
          eq(schema.students.parentId, userId)
        )
      )
      .limit(1);

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Use transaction for atomic deletion across all related tables
    await db.transaction(async (tx) => {
      // Delete related records first (foreign key constraints)
      await tx.delete(schema.studentSubjectEnrollments)
        .where(eq(schema.studentSubjectEnrollments.studentId, childId));

      await tx.delete(schema.progress)
        .where(eq(schema.progress.studentId, childId));

      // Delete student profile
      await tx.delete(schema.studentProfiles)
        .where(eq(schema.studentProfiles.studentId, childId));

      // Delete child from students table
      await tx.delete(schema.students)
        .where(eq(schema.students.id, childId));
    });

    res.json({ success: true, message: 'Child deleted successfully' });
  } catch (error) {
    console.error('Delete child error:', error);
    res.status(500).json({ error: 'Failed to delete child' });
  }
});

// GET /api/parent/children/:id/progress - Get child's progress across all subjects
router.get('/children/:id/progress', authenticateToken, requireParentOrAbove, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }
    const childId = parseInt(req.params.id);

    // Verify ownership
    const [child] = await db.select()
      .from(schema.students)
      .where(
        and(
          eq(schema.students.id, childId),
          eq(schema.students.parentId, userId)
        )
      )
      .limit(1);

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Get progress data
    const progressData = await db.select()
      .from(schema.progress)
      .where(eq(schema.progress.studentId, childId));

    res.json({ progress: progressData });
  } catch (error) {
    console.error('Get child progress error:', error);
    res.status(500).json({ error: 'Failed to fetch child progress' });
  }
});

// Get parent notifications
router.get('/notifications', authenticateToken, requireParentOrAbove, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }
    
    const notifications = await db.select({
      id: schema.gamificationNotifications.id,
      type: schema.gamificationNotifications.type,
      title: schema.gamificationNotifications.title,
      message: schema.gamificationNotifications.message,
      icon: schema.gamificationNotifications.icon,
      studentName: schema.studentProfiles.name,
      isRead: schema.gamificationNotifications.isRead,
      readAt: schema.gamificationNotifications.readAt,
      priority: schema.gamificationNotifications.priority,
      createdAt: schema.gamificationNotifications.createdAt
    })
    .from(schema.gamificationNotifications)
    .leftJoin(schema.students, eq(schema.gamificationNotifications.studentId, schema.students.id))
    .leftJoin(schema.studentProfiles, eq(schema.students.id, schema.studentProfiles.studentId))
    .where(
      and(
        eq(schema.gamificationNotifications.recipientId, userId),
        eq(schema.gamificationNotifications.recipientType, 'parent')
      )
    )
    .orderBy(desc(schema.gamificationNotifications.createdAt))
    .limit(50);

    res.json({
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length
    });

  } catch (error) {
    console.error('Get parent notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.post('/notifications/:id/read', authenticateToken, requireParentOrAbove, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }
    const notificationId = parseInt(req.params.id);

    await db.update(schema.gamificationNotifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(
        and(
          eq(schema.gamificationNotifications.id, notificationId),
          eq(schema.gamificationNotifications.recipientId, userId)
        )
      );

    res.json({ success: true });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Get all parent badges  
router.get('/badges', authenticateToken, requireParentOrAbove, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const badges = await badgeService.getParentBadges(userId);
    
    // Get engagement summary
    const engagement = await db.select({
      studentName: schema.studentProfiles.name,
      engagementScore: schema.parentEngagement.engagementScore,
      engagementLevel: schema.parentEngagement.engagementLevel,
      totalLogins: schema.parentEngagement.totalLogins,
      weeklyLogins: schema.parentEngagement.weeklyLogins
    })
    .from(schema.parentEngagement)
    .leftJoin(schema.students, eq(schema.parentEngagement.studentId, schema.students.id))
    .leftJoin(schema.studentProfiles, eq(schema.students.id, schema.studentProfiles.studentId))
    .where(eq(schema.parentEngagement.parentId, userId));

    res.json({
      badges,
      engagement,
      totalBadges: badges.length,
      badgesByType: badges.reduce((acc, badge) => {
        acc[badge.type] = (acc[badge.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });

  } catch (error) {
    console.error('Get parent badges error:', error);
    res.status(500).json({ error: 'Failed to fetch parent badges' });
  }
});

// Get parent badges for specific student
router.get('/badges/:studentId', authenticateToken, requireParentOrAbove, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }
    const studentId = parseInt(req.params.studentId);

    // Verify parent owns the student
    const student = await db.select()
      .from(schema.students)
      .where(
        and(
          eq(schema.students.id, studentId),
          eq(schema.students.parentId, userId)
        )
      )
      .limit(1);

    if (!student[0]) {
      return res.status(403).json({ error: 'Access denied to student data' });
    }

    const badges = await badgeService.getParentBadges(userId, studentId);
    
    // Get engagement summary
    const engagement = await db.select({
      studentName: schema.studentProfiles.name,
      engagementScore: schema.parentEngagement.engagementScore,
      engagementLevel: schema.parentEngagement.engagementLevel,
      totalLogins: schema.parentEngagement.totalLogins,
      weeklyLogins: schema.parentEngagement.weeklyLogins
    })
    .from(schema.parentEngagement)
    .leftJoin(schema.students, eq(schema.parentEngagement.studentId, schema.students.id))
    .leftJoin(schema.studentProfiles, eq(schema.students.id, schema.studentProfiles.studentId))
    .where(eq(schema.parentEngagement.parentId, userId));

    res.json({
      badges,
      engagement,
      totalBadges: badges.length,
      badgesByType: badges.reduce((acc, badge) => {
        acc[badge.type] = (acc[badge.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });

  } catch (error) {
    console.error('Get parent badges error:', error);
    res.status(500).json({ error: 'Failed to fetch parent badges' });
  }
});

// Get redemption recommendations for student
router.get('/recommendations/:studentId', authenticateToken, requireParentOrAbove, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }
    const studentId = parseInt(req.params.studentId);

    // Verify parent owns the student
    const student = await db.select({
      id: schema.students.id,
      studentName: schema.studentProfiles.name,
      currentXP: schema.studentXP.totalXP,
      currentLevel: schema.studentXP.level
    })
    .from(schema.students)
    .leftJoin(schema.studentProfiles, eq(schema.students.id, schema.studentProfiles.studentId))
    .leftJoin(schema.studentXP, eq(schema.students.id, schema.studentXP.studentId))
    .where(
      and(
        eq(schema.students.id, studentId),
        eq(schema.students.parentId, userId)
      )
    )
    .limit(1);

    if (!student[0]) {
      return res.status(403).json({ error: 'Access denied to student data' });
    }

    const recommendations = await recommendationService.getRecommendations(studentId);
    const redemptionHistory = await recommendationService.getRedemptionHistory(studentId);

    res.json({
      student: student[0],
      recommendations,
      redemptionHistory,
      summary: {
        totalRecommendations: recommendations.length,
        highPriority: recommendations.filter(r => r.priority === 'high').length,
        affordableCount: recommendations.filter(r => r.xpCost <= (student[0].currentXP || 0)).length,
        avgConfidence: Math.round(
          recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length
        )
      }
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Track recommendation choice
router.post('/recommendations/:studentId/track', authenticateToken, requireParentOrAbove, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }
    const studentId = parseInt(req.params.studentId);
    const { recommendationId, chosen } = req.body;

    // Verify parent owns the student
    const student = await db.select()
      .from(schema.students)
      .where(
        and(
          eq(schema.students.id, studentId),
          eq(schema.students.parentId, userId)
        )
      )
      .limit(1);

    if (!student[0]) {
      return res.status(403).json({ error: 'Access denied to student data' });
    }

    await recommendationService.trackRecommendationChoice(studentId, recommendationId, chosen);

    res.json({ success: true });

  } catch (error) {
    console.error('Track recommendation error:', error);
    res.status(500).json({ error: 'Failed to track recommendation' });
  }
});

// Send test notification (for testing purposes)
router.post('/test-notification/:studentId', authenticateToken, requireParentOrAbove, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }
    const studentId = parseInt(req.params.studentId);
    const { type = 'badge_earned' } = req.body;

    // Verify parent owns the student
    const student = await db.select()
      .from(schema.students)
      .where(
        and(
          eq(schema.students.id, studentId),
          eq(schema.students.parentId, userId)
        )
      )
      .limit(1);

    if (!student[0]) {
      return res.status(403).json({ error: 'Access denied to student data' });
    }

    // Send test notification
    await notificationService.sendAchievementNotification(studentId, type, {
      title: 'Test Achievement',
      description: 'This is a test notification to verify the parent notification system is working correctly.',
      icon: '🧪',
      xpEarned: 50
    });

    res.json({ success: true, message: 'Test notification sent' });

  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Get parent engagement summary
router.get('/engagement', authenticateToken, requireParentOrAbove, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const engagement = await db.select({
      studentId: schema.parentEngagement.studentId,
      studentName: schema.studentProfiles.name,
      engagementScore: schema.parentEngagement.engagementScore,
      engagementLevel: schema.parentEngagement.engagementLevel,
      totalLogins: schema.parentEngagement.totalLogins,
      weeklyLogins: schema.parentEngagement.weeklyLogins,
      monthlyLogins: schema.parentEngagement.monthlyLogins,
      goalsSet: schema.parentEngagement.goalsSet,
      goalsCompleted: schema.parentEngagement.goalsCompleted,
      rewardsApproved: schema.parentEngagement.rewardsApproved,
      notificationsViewed: schema.parentEngagement.notificationsViewed,
      lastLogin: schema.parentEngagement.lastLogin
    })
    .from(schema.parentEngagement)
    .leftJoin(schema.students, eq(schema.parentEngagement.studentId, schema.students.id))
    .leftJoin(schema.studentProfiles, eq(schema.students.id, schema.studentProfiles.studentId))
    .where(eq(schema.parentEngagement.parentId, userId))
    .orderBy(desc(schema.parentEngagement.updatedAt));

    const summary = {
      totalChildren: engagement.length,
      averageEngagementScore: Math.round(
        engagement.reduce((sum, e) => sum + Number(e.engagementScore || 0), 0) / engagement.length || 0
      ),
      totalGoalsSet: engagement.reduce((sum, e) => sum + (e.goalsSet || 0), 0),
      totalGoalsCompleted: engagement.reduce((sum, e) => sum + (e.goalsCompleted || 0), 0),
      totalNotificationsViewed: engagement.reduce((sum, e) => sum + (e.notificationsViewed || 0), 0),
      engagementLevels: engagement.reduce((acc, e) => {
        const level = e.engagementLevel || 'new';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    res.json({ engagement, summary });

  } catch (error) {
    console.error('Get parent engagement error:', error);
    res.status(500).json({ error: 'Failed to fetch engagement data' });
  }
});

export default router;