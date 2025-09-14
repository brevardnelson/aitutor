// Parent badge automation service
// Awards badges to parents based on their children's achievements and engagement

import { db } from './storage';
import * as schema from '../shared/schema';
import { eq, and, sql, gte, desc } from 'drizzle-orm';

// Parent badge definitions and criteria
const PARENT_BADGE_DEFINITIONS = {
  supportive_parent: {
    type: 'supportive_parent',
    title: '🤗 Supportive Parent',
    description: 'Actively encourages child\'s learning journey',
    icon: '🤗',
    criteria: {
      login_streak: 7, // 7 consecutive days of checking progress
      notifications_viewed: 10 // Viewed at least 10 achievement notifications
    }
  },
  
  goal_setter: {
    type: 'goal_setter',
    title: '🎯 Goal Setter',
    description: 'Sets meaningful learning goals for their child',
    icon: '🎯',
    criteria: {
      goals_set: 5, // Set at least 5 learning goals
      goals_completed: 3 // At least 3 goals completed by child
    }
  },
  
  reward_manager: {
    type: 'reward_manager',
    title: '🎁 Reward Manager',
    description: 'Thoughtfully manages child\'s point redemptions',
    icon: '🎁',
    criteria: {
      rewards_approved: 10, // Approved at least 10 reward redemptions
      engagement_score: 75 // High engagement with reward system
    }
  },
  
  engagement_champion: {
    type: 'engagement_champion',
    title: '🏆 Engagement Champion',
    description: 'Consistently involved in child\'s educational progress',
    icon: '🏆',
    criteria: {
      total_logins: 30, // Logged in at least 30 times
      weekly_logins: 5, // Active at least 5 days per week
      engagement_score: 90 // Very high overall engagement
    }
  },
  
  milestone_celebrator: {
    type: 'milestone_celebrator',
    title: '🎉 Milestone Celebrator',
    description: 'Celebrates every achievement with their child',
    icon: '🎉',
    criteria: {
      notifications_viewed: 25, // Viewed many achievement notifications
      child_badges_earned: 10 // Child has earned at least 10 badges
    }
  },
  
  learning_advocate: {
    type: 'learning_advocate',
    title: '📚 Learning Advocate',
    description: 'Promotes continuous learning and growth',
    icon: '📚',
    criteria: {
      child_xp_milestones: 5, // Child reached 5 XP milestones (500, 1000, 1500, etc.)
      child_levels: 10, // Child reached level 10+
      monthly_logins: 20 // Very consistent monthly engagement
    }
  }
};

export class ParentBadgeService {
  // Check and award eligible parent badges
  async checkAndAwardParentBadges(
    studentId: number, 
    trigger: 'child_badge_earned' | 'child_level_up' | 'child_challenge_completed' | 'child_leaderboard_achievement' | 'child_xp_milestone',
    context?: any
  ): Promise<void> {
    try {
      // Get parent ID
      const student = await db.select({ parentId: schema.students.parentId })
        .from(schema.students)
        .where(eq(schema.students.id, studentId))
        .limit(1);

      if (!student[0] || !student[0].parentId) return;

      const parentId = student[0].parentId;

      // Get current parent engagement metrics
      const engagement = await db.select()
        .from(schema.parentEngagement)
        .where(
          and(
            eq(schema.parentEngagement.parentId, parentId),
            eq(schema.parentEngagement.studentId, studentId)
          )
        )
        .limit(1);

      if (!engagement[0]) {
        // Create initial engagement record
        await db.insert(schema.parentEngagement).values({
          parentId,
          studentId,
          totalLogins: 1,
          engagementScore: '10',
          engagementLevel: 'new',
          lastLogin: new Date()
        });
        return; // Too early for badges
      }

      const parentEngagement = engagement[0];

      // Get additional metrics based on trigger
      let additionalMetrics = {};
      
      if (trigger === 'child_badge_earned') {
        // Count child's total badges
        const childBadges = await db.select({ count: sql`COUNT(*)` })
          .from(schema.studentBadges)
          .where(eq(schema.studentBadges.studentId, studentId));
        additionalMetrics = { child_badges_earned: Number(childBadges[0].count) };
      }

      if (trigger === 'child_level_up') {
        additionalMetrics = { child_levels: context?.level || 1 };
      }

      if (trigger === 'child_xp_milestone') {
        // Count XP milestones reached
        const xpData = await db.select({ totalXP: schema.studentXP.totalXP })
          .from(schema.studentXP)
          .where(eq(schema.studentXP.studentId, studentId))
          .limit(1);
        const milestones = Math.floor((xpData[0]?.totalXP || 0) / 500);
        additionalMetrics = { child_xp_milestones: milestones };
      }

      // Check each badge definition
      for (const [badgeKey, badgeInfo] of Object.entries(PARENT_BADGE_DEFINITIONS)) {
        // Skip if already earned
        const existingBadge = await db.select()
          .from(schema.parentAchievements)
          .where(
            and(
              eq(schema.parentAchievements.parentId, parentId),
              eq(schema.parentAchievements.studentId, studentId),
              eq(schema.parentAchievements.type, badgeInfo.type)
            )
          )
          .limit(1);

        if (existingBadge[0]) continue; // Already earned

        // Check if criteria are met
        const meetsAllCriteria = await this.checkBadgeCriteria(
          parentEngagement, 
          additionalMetrics, 
          badgeInfo.criteria
        );

        if (meetsAllCriteria) {
          await this.awardParentBadge(
            parentId, 
            studentId, 
            badgeInfo, 
            parentEngagement, 
            additionalMetrics
          );
        }
      }

      // Update engagement level based on score
      await this.updateEngagementLevel(parentId, studentId);

    } catch (error) {
      console.error('Error checking parent badges:', error);
    }
  }

  // Check if parent meets badge criteria
  private async checkBadgeCriteria(
    engagement: any, 
    additional: any, 
    criteria: any
  ): Promise<boolean> {
    for (const [criterion, threshold] of Object.entries(criteria)) {
      const value = Number(engagement[criterion] || additional[criterion] || 0);
      const thresholdValue = Number(threshold);
      if (value < thresholdValue) {
        return false;
      }
    }
    return true;
  }

  // Award parent badge
  private async awardParentBadge(
    parentId: number, 
    studentId: number, 
    badgeInfo: any,
    engagement: any,
    additional: any
  ): Promise<void> {
    try {
      // Determine primary metric for this badge
      const primaryMetric = Object.keys(badgeInfo.criteria)[0];
      const threshold = badgeInfo.criteria[primaryMetric];
      const actualValue = engagement[primaryMetric] || additional[primaryMetric] || 0;

      // Insert parent achievement
      await db.insert(schema.parentAchievements).values({
        parentId,
        studentId,
        type: badgeInfo.type,
        title: badgeInfo.title,
        description: badgeInfo.description,
        badgeIcon: badgeInfo.icon,
        metric: primaryMetric,
        threshold: threshold.toString(),
        actualValue: actualValue.toString()
      });

      // Send notification about parent badge
      const parentUser = await db.select()
        .from(schema.users)
        .where(eq(schema.users.id, parentId))
        .limit(1);

      if (parentUser[0]) {
        const { sendEmail } = await import('../src/utils/replitmail');
        
        await sendEmail({
          to: parentUser[0].email,
          subject: `🏆 You earned a parent badge!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; font-size: 28px; margin: 0;">🎉 Badge Earned!</h1>
              </div>
              <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 25px;">
                  <div style="font-size: 48px; margin-bottom: 15px;">${badgeInfo.icon}</div>
                  <h2 style="color: #2d3748; font-size: 24px; margin: 0;">${badgeInfo.title}</h2>
                  <p style="color: #4a5568; font-size: 16px; margin: 10px 0;">${badgeInfo.description}</p>
                </div>
                <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; color: #2d3748; font-size: 16px; text-align: center;">
                    Congratulations! Your dedication to your child's education has been recognized.
                    Keep up the amazing support!
                  </p>
                </div>
              </div>
            </div>
          `,
          text: `🏆 Badge Earned: ${badgeInfo.title}\n\n${badgeInfo.description}\n\nCongratulations! Your dedication to your child's education has been recognized. Keep up the amazing support!`
        });
      }

      console.log(`Parent badge awarded: ${badgeInfo.title} to parent ${parentId}`);

    } catch (error) {
      console.error('Error awarding parent badge:', error);
    }
  }

  // Update parent engagement level
  private async updateEngagementLevel(parentId: number, studentId: number): Promise<void> {
    try {
      const engagement = await db.select()
        .from(schema.parentEngagement)
        .where(
          and(
            eq(schema.parentEngagement.parentId, parentId),
            eq(schema.parentEngagement.studentId, studentId)
          )
        )
        .limit(1);

      if (!engagement[0]) return;

      const score = Number(engagement[0].engagementScore) || 0;
      let level = 'new';

      if (score >= 90) level = 'champion';
      else if (score >= 75) level = 'super_parent';
      else if (score >= 50) level = 'active';
      else level = 'new';

      if (level !== engagement[0].engagementLevel) {
        await db.update(schema.parentEngagement)
          .set({ engagementLevel: level })
          .where(eq(schema.parentEngagement.id, engagement[0].id));
      }

    } catch (error) {
      console.error('Error updating engagement level:', error);
    }
  }

  // Get parent badges for display
  async getParentBadges(parentId: number, studentId?: number): Promise<any[]> {
    // Build the where condition based on whether studentId is provided
    const whereCondition = studentId 
      ? and(
          eq(schema.parentAchievements.parentId, parentId),
          eq(schema.parentAchievements.studentId, studentId)
        )
      : eq(schema.parentAchievements.parentId, parentId);

    return await db.select({
      id: schema.parentAchievements.id,
      type: schema.parentAchievements.type,
      title: schema.parentAchievements.title,
      description: schema.parentAchievements.description,
      badgeIcon: schema.parentAchievements.badgeIcon,
      earnedAt: schema.parentAchievements.earnedAt,
      studentName: schema.studentProfiles.name
    })
    .from(schema.parentAchievements)
    .leftJoin(schema.students, eq(schema.parentAchievements.studentId, schema.students.id))
    .leftJoin(schema.studentProfiles, eq(schema.students.id, schema.studentProfiles.studentId))
    .where(whereCondition)
    .orderBy(desc(schema.parentAchievements.earnedAt));
  }
}