// Gamification event hooks for parent notifications and automated badge earning
// Integrates with existing gamification systems to trigger parent alerts

import { ParentNotificationService } from './parent-notification-service';
import { ParentBadgeService } from './parent-badge-service';
import { db } from './storage';
import * as schema from '../shared/schema';
import { eq, and, sql } from 'drizzle-orm';

const parentNotificationService = new ParentNotificationService();
const parentBadgeService = new ParentBadgeService();

// Hook for when student earns a badge
export async function onStudentBadgeEarned(studentId: number, badgeId: string): Promise<void> {
  try {
    // Get badge details
    const badge = await db.select()
      .from(schema.badgeDefinitions)
      .where(eq(schema.badgeDefinitions.id, badgeId))
      .limit(1);

    if (!badge[0]) return;

    // Get XP earned for this badge
    const xpEarned = badge[0].xpReward || 0;

    // Notify parent
    await parentNotificationService.sendAchievementNotification(studentId, 'badge_earned', {
      title: badge[0].name,
      description: badge[0].description,
      icon: badge[0].icon,
      badgeId: badgeId,
      xpEarned: xpEarned
    });

    // Check for parent badge eligibility
    await parentBadgeService.checkAndAwardParentBadges(studentId, 'child_badge_earned');

    console.log(`Badge notification sent for student ${studentId}, badge ${badgeId}`);

  } catch (error) {
    console.error('Error in onStudentBadgeEarned hook:', error);
  }
}

// Hook for when student levels up
export async function onStudentLevelUp(studentId: number, newLevel: number, xpEarned: number): Promise<void> {
  try {
    // Notify parent
    await parentNotificationService.sendAchievementNotification(studentId, 'level_up', {
      title: `Level ${newLevel} Achieved!`,
      description: `Your child has reached Level ${newLevel} through consistent learning and dedication.`,
      newLevel: newLevel,
      xpEarned: xpEarned,
      icon: '⭐'
    });

    // Check for parent badge eligibility  
    await parentBadgeService.checkAndAwardParentBadges(studentId, 'child_level_up', { level: newLevel });

    console.log(`Level up notification sent for student ${studentId}, new level ${newLevel}`);

  } catch (error) {
    console.error('Error in onStudentLevelUp hook:', error);
  }
}

// Hook for when student completes a challenge
export async function onChallengeCompleted(studentId: number, challengeId: number): Promise<void> {
  try {
    // Get challenge details
    const challenge = await db.select()
      .from(schema.challenges)
      .where(eq(schema.challenges.id, challengeId))
      .limit(1);

    if (!challenge[0]) return;

    // Get XP earned for this challenge
    const xpEarned = challenge[0].xpReward || 0;

    // Notify parent
    await parentNotificationService.sendAchievementNotification(studentId, 'challenge_completed', {
      title: 'Challenge Completed!',
      description: `Successfully completed the challenge and demonstrated great persistence!`,
      challengeName: challenge[0].title,
      challengeId: challengeId,
      xpEarned: xpEarned,
      icon: '🎯'
    });

    // Check for parent badge eligibility
    await parentBadgeService.checkAndAwardParentBadges(studentId, 'child_challenge_completed');

    console.log(`Challenge completion notification sent for student ${studentId}, challenge ${challengeId}`);

  } catch (error) {
    console.error('Error in onChallengeCompleted hook:', error);
  }
}

// Hook for when student achieves leaderboard position
export async function onLeaderboardPositionAchieved(studentId: number, leaderboardId: number, rank: number): Promise<void> {
  try {
    // Only notify for top 5 positions
    if (rank > 5) return;

    // Get leaderboard details
    const leaderboard = await db.select()
      .from(schema.leaderboards)
      .where(eq(schema.leaderboards.id, leaderboardId))
      .limit(1);

    if (!leaderboard[0]) return;

    // Notify parent
    await parentNotificationService.sendAchievementNotification(studentId, 'leaderboard_rank', {
      title: 'Leaderboard Achievement!',
      description: `Your child is excelling and showing great competitive spirit!`,
      leaderboardPosition: rank,
      leaderboardId: leaderboardId,
      icon: rank <= 3 ? '🥇' : '📈'
    });

    // Check for parent badge eligibility
    await parentBadgeService.checkAndAwardParentBadges(studentId, 'child_leaderboard_achievement', { rank });

    console.log(`Leaderboard notification sent for student ${studentId}, rank ${rank}`);

  } catch (error) {
    console.error('Error in onLeaderboardPositionAchieved hook:', error);
  }
}

// Hook for XP earning (for milestone celebrations)
export async function onXPEarned(studentId: number, xpAmount: number, source: string): Promise<void> {
  try {
    // Check for milestone XP amounts (every 500 XP)
    const studentXP = await db.select()
      .from(schema.studentXP)
      .where(eq(schema.studentXP.studentId, studentId))
      .limit(1);

    if (!studentXP[0]) return;

    const totalXP = studentXP[0].totalXP || 0;
    const previousTotal = totalXP - xpAmount;

    // Check if we crossed a 500 XP milestone
    const newMilestone = Math.floor(totalXP / 500);
    const previousMilestone = Math.floor(previousTotal / 500);

    if (newMilestone > previousMilestone) {
      // Milestone achieved! Send special notification
      await parentNotificationService.sendAchievementNotification(studentId, 'badge_earned', {
        title: `${newMilestone * 500} XP Milestone!`,
        description: `Your child has earned ${newMilestone * 500} total XP points! This represents consistent dedication to learning.`,
        xpEarned: xpAmount,
        icon: '🎊'
      });

      // Check for parent badge eligibility
      await parentBadgeService.checkAndAwardParentBadges(studentId, 'child_xp_milestone', { milestone: newMilestone * 500 });
    }

  } catch (error) {
    console.error('Error in onXPEarned hook:', error);
  }
}

// Weekly summary automation (to be called by cron job)
export async function sendWeeklySummaries(): Promise<void> {
  try {
    console.log('Starting weekly parent summary notifications...');

    // Get all parents with children
    const parents = await db.select({
      parentId: schema.students.parentId,
    })
    .from(schema.students)
    .where(sql`${schema.students.parentId} IS NOT NULL`)
    .groupBy(schema.students.parentId);

    let sent = 0;
    for (const parent of parents) {
      if (parent.parentId) {
        await parentNotificationService.sendWeeklySummary(parent.parentId);
        sent++;
      }
    }

    console.log(`Weekly summaries sent to ${sent} parents`);

  } catch (error) {
    console.error('Error sending weekly summaries:', error);
  }
}

// Export all hooks for easy integration
export const gamificationHooks = {
  onStudentBadgeEarned,
  onStudentLevelUp,
  onChallengeCompleted,
  onLeaderboardPositionAchieved,
  onXPEarned,
  sendWeeklySummaries
};