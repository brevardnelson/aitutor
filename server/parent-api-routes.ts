// Parent API routes for notifications, badges, and redemption recommendations
// Extends existing parent functionality with gamification features

import express from 'express';
import { authenticateToken, requireParentOrAbove } from './auth-middleware';
import { ParentNotificationService } from './parent-notification-service';
import { ParentBadgeService } from './parent-badge-service';
import { RedemptionRecommendationService } from './redemption-recommendation-service';
import { db } from './storage';
import * as schema from '../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = express.Router();
const notificationService = new ParentNotificationService();
const badgeService = new ParentBadgeService();
const recommendationService = new RedemptionRecommendationService();

// Get parent notifications
router.get('/notifications', authenticateToken, requireParentOrAbove, async (req, res) => {
  try {
    const userId = req.user?.id;
    
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

// Get parent badges
router.get('/badges/:studentId?', authenticateToken, requireParentOrAbove, async (req, res) => {
  try {
    const userId = req.user?.id;
    const studentId = req.params.studentId ? parseInt(req.params.studentId) : undefined;

    // Verify parent owns the student
    if (studentId) {
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