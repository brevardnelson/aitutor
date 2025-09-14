// Parent notification service with achievement alerts
// References replitmail blueprint integration for email delivery

import { db } from './storage';
import * as schema from '../shared/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

// Email types and templates for parent notifications
interface ParentNotificationData {
  parentEmail: string;
  parentName: string;
  childName: string;
  notificationType: 'badge_earned' | 'level_up' | 'challenge_completed' | 'leaderboard_rank' | 'weekly_summary';
  achievementDetails: {
    title: string;
    description: string;
    icon?: string;
    xpEarned?: number;
    newLevel?: number;
    challengeName?: string;
    leaderboardPosition?: number;
  };
}

// Email templates for different achievement types
function generateEmailContent(data: ParentNotificationData): { subject: string; html: string; text: string } {
  const { childName, notificationType, achievementDetails } = data;
  
  const templates = {
    badge_earned: {
      subject: `🏆 ${childName} earned a new badge!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; font-size: 28px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🎉 Achievement Unlocked!</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 15px;">${achievementDetails.icon || '🏆'}</div>
              <h2 style="color: #2d3748; font-size: 24px; margin: 0;">${achievementDetails.title}</h2>
              <p style="color: #4a5568; font-size: 16px; margin: 10px 0;">${achievementDetails.description}</p>
            </div>
            <div style="background: #edf2f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #2d3748; font-size: 16px; text-align: center;">
                <strong>${childName}</strong> continues to excel in their learning journey! 
                ${achievementDetails.xpEarned ? `They earned ${achievementDetails.xpEarned} XP points for this achievement.` : ''}
              </p>
            </div>
            <div style="text-align: center; margin-top: 25px;">
              <p style="color: #718096; font-size: 14px;">Keep encouraging ${childName}'s amazing progress!</p>
            </div>
          </div>
        </div>
      `,
      text: `🎉 Achievement Unlocked!\n\n${childName} earned a new badge: ${achievementDetails.title}\n\n${achievementDetails.description}\n\n${achievementDetails.xpEarned ? `XP Earned: ${achievementDetails.xpEarned}` : ''}\n\nKeep encouraging ${childName}'s amazing progress!`
    },
    
    level_up: {
      subject: `🚀 ${childName} leveled up!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; font-size: 28px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🚀 Level Up!</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 15px;">⭐</div>
              <h2 style="color: #2d3748; font-size: 24px; margin: 0;">Level ${achievementDetails.newLevel} Achieved!</h2>
              <p style="color: #4a5568; font-size: 16px; margin: 10px 0;">Your child is making excellent progress!</p>
            </div>
            <div style="background: #fed7d7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f56565;">
              <p style="margin: 0; color: #2d3748; font-size: 16px; text-align: center;">
                <strong>${childName}</strong> has reached Level ${achievementDetails.newLevel}! 
                This shows consistent learning and dedication.
              </p>
            </div>
            <div style="text-align: center; margin-top: 25px;">
              <p style="color: #718096; font-size: 14px;">Celebrate this milestone with ${childName}!</p>
            </div>
          </div>
        </div>
      `,
      text: `🚀 Level Up!\n\n${childName} has reached Level ${achievementDetails.newLevel}!\n\nThis shows consistent learning and dedication.\n\nCelebrate this milestone with ${childName}!`
    },

    challenge_completed: {
      subject: `✅ ${childName} completed a challenge!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; font-size: 28px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">✅ Challenge Complete!</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 15px;">🎯</div>
              <h2 style="color: #2d3748; font-size: 24px; margin: 0;">${achievementDetails.challengeName}</h2>
              <p style="color: #4a5568; font-size: 16px; margin: 10px 0;">Challenge successfully completed!</p>
            </div>
            <div style="background: #c6f6d5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #38a169;">
              <p style="margin: 0; color: #2d3748; font-size: 16px; text-align: center;">
                <strong>${childName}</strong> completed the weekly challenge and demonstrated great persistence and skill!
                ${achievementDetails.xpEarned ? `They earned ${achievementDetails.xpEarned} bonus XP!` : ''}
              </p>
            </div>
            <div style="text-align: center; margin-top: 25px;">
              <p style="color: #718096; font-size: 14px;">Encourage ${childName} to take on more challenges!</p>
            </div>
          </div>
        </div>
      `,
      text: `✅ Challenge Complete!\n\n${childName} completed the challenge: ${achievementDetails.challengeName}\n\n${achievementDetails.xpEarned ? `Bonus XP Earned: ${achievementDetails.xpEarned}` : ''}\n\nEncourage ${childName} to take on more challenges!`
    },

    leaderboard_rank: {
      subject: `🏆 ${childName} is climbing the leaderboard!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #744210; font-size: 28px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🏆 Leaderboard Update!</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 15px;">${achievementDetails.leaderboardPosition && achievementDetails.leaderboardPosition <= 3 ? '🥇' : '📈'}</div>
              <h2 style="color: #2d3748; font-size: 24px; margin: 0;">Rank #${achievementDetails.leaderboardPosition}</h2>
              <p style="color: #4a5568; font-size: 16px; margin: 10px 0;">Great competitive spirit!</p>
            </div>
            <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #2d3748; font-size: 16px; text-align: center;">
                <strong>${childName}</strong> is currently ranked #${achievementDetails.leaderboardPosition} in their class! 
                Their dedication is really showing!
              </p>
            </div>
            <div style="text-align: center; margin-top: 25px;">
              <p style="color: #718096; font-size: 14px;">Keep motivating ${childName} to maintain their excellent performance!</p>
            </div>
          </div>
        </div>
      `,
      text: `🏆 Leaderboard Update!\n\n${childName} is currently ranked #${achievementDetails.leaderboardPosition} in their class!\n\nTheir dedication is really showing!\n\nKeep motivating ${childName} to maintain their excellent performance!`
    },

    weekly_summary: {
      subject: `📊 ${childName}'s Weekly Progress Summary`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #2d3748; font-size: 28px; margin: 0;">📊 Weekly Summary</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="font-size: 48px; margin-bottom: 15px;">📈</div>
              <h2 style="color: #2d3748; font-size: 24px; margin: 0;">${childName}'s Progress</h2>
              <p style="color: #4a5568; font-size: 16px; margin: 10px 0;">Here's how your child performed this week</p>
            </div>
            <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #2d3748; font-size: 16px; text-align: center;">
                ${achievementDetails.description}
                ${achievementDetails.xpEarned ? `\nTotal XP this week: ${achievementDetails.xpEarned}` : ''}
              </p>
            </div>
            <div style="text-align: center; margin-top: 25px;">
              <p style="color: #718096; font-size: 14px;">Review ${childName}'s detailed progress in your parent dashboard!</p>
            </div>
          </div>
        </div>
      `,
      text: `📊 Weekly Summary\n\n${childName}'s Progress:\n\n${achievementDetails.description}\n\n${achievementDetails.xpEarned ? `Total XP this week: ${achievementDetails.xpEarned}` : ''}\n\nReview ${childName}'s detailed progress in your parent dashboard!`
    }
  };

  return templates[notificationType] || templates.badge_earned;
}

export class ParentNotificationService {
  // Send achievement notification to parent
  async sendAchievementNotification(
    studentId: number,
    notificationType: 'badge_earned' | 'level_up' | 'challenge_completed' | 'leaderboard_rank' | 'weekly_summary',
    achievementData: any
  ): Promise<void> {
    try {
      // Get parent info
      const student = await db.select({
        parentId: schema.students.parentId,
        studentName: schema.studentProfiles.name,
      })
      .from(schema.students)
      .leftJoin(schema.studentProfiles, eq(schema.students.id, schema.studentProfiles.studentId))
      .where(eq(schema.students.id, studentId))
      .limit(1);

      if (!student[0] || !student[0].parentId) {
        console.log(`No parent found for student ${studentId}`);
        return;
      }

      const parent = await db.select({
        email: schema.users.email,
        name: schema.users.fullName,
      })
      .from(schema.users)
      .where(eq(schema.users.id, student[0].parentId))
      .limit(1);

      if (!parent[0]) {
        console.log(`Parent user not found for ID ${student[0].parentId}`);
        return;
      }

      // Prepare notification data
      const notificationData: ParentNotificationData = {
        parentEmail: parent[0].email,
        parentName: parent[0].name,
        childName: student[0].studentName || `Student ${studentId}`,
        notificationType,
        achievementDetails: {
          title: achievementData.title || 'Achievement Earned',
          description: achievementData.description || 'Your child has made great progress!',
          icon: achievementData.icon,
          xpEarned: achievementData.xpEarned,
          newLevel: achievementData.newLevel,
          challengeName: achievementData.challengeName,
          leaderboardPosition: achievementData.leaderboardPosition,
        }
      };

      // Generate email content
      const { subject, html, text } = generateEmailContent(notificationData);

      // Send email using Replit Mail (will be imported when used)
      // Note: Dynamic import to avoid module loading issues during service initialization
      const { sendEmail } = await import('../src/utils/replitmail');
      
      const emailResult = await sendEmail({
        to: notificationData.parentEmail,
        subject,
        html,
        text,
      });

      console.log(`Achievement notification sent to ${notificationData.parentEmail}:`, emailResult.accepted);

      // Log notification in database
      await db.insert(schema.gamificationNotifications).values({
        recipientId: student[0].parentId,
        recipientType: 'parent',
        type: notificationType,
        title: subject,
        message: text,
        icon: achievementData.icon || '🏆',
        studentId: studentId,
        badgeId: achievementData.badgeId,
        challengeId: achievementData.challengeId,
        leaderboardId: achievementData.leaderboardId,
        emailSent: true,
        priority: notificationType === 'level_up' ? 'high' : 'normal',
      });

      // Track parent engagement
      await this.updateParentEngagement(student[0].parentId, studentId, 'notification_sent');

    } catch (error) {
      console.error('Error sending parent achievement notification:', error);
      // Still log notification attempt in database
      try {
        // Get student info for error logging
        const studentForError = await db.select({ parentId: schema.students.parentId })
          .from(schema.students)
          .where(eq(schema.students.id, studentId))
          .limit(1);
          
        if (studentForError?.[0]?.parentId) {
          await db.insert(schema.gamificationNotifications).values({
            recipientId: studentForError[0].parentId,
            recipientType: 'parent',
            type: notificationType,
            title: `Error sending ${notificationType} notification`,
            message: `Failed to send notification: ${error.message}`,
            studentId: studentId,
            emailSent: false,
            priority: 'normal',
          });
        }
      } catch (logError) {
        console.error('Error logging notification failure:', logError);
      }
    }
  }

  // Send weekly summary to parents
  async sendWeeklySummary(parentId: number): Promise<void> {
    try {
      // Get parent and children info
      const parentData = await db.select({
        email: schema.users.email,
        name: schema.users.fullName,
      })
      .from(schema.users)
      .where(eq(schema.users.id, parentId))
      .limit(1);

      if (!parentData[0]) return;

      const children = await db.select({
        studentId: schema.students.id,
        studentName: schema.studentProfiles.name,
        weeklyXP: schema.studentXP.weeklyXP,
        totalXP: schema.studentXP.totalXP,
        level: schema.studentXP.level,
      })
      .from(schema.students)
      .leftJoin(schema.studentProfiles, eq(schema.students.id, schema.studentProfiles.studentId))
      .leftJoin(schema.studentXP, eq(schema.students.id, schema.studentXP.studentId))
      .where(eq(schema.students.parentId, parentId));

      if (children.length === 0) return;

      // Send summary for each child
      for (const child of children) {
        const weeklyXP = child.weeklyXP || 0;
        const totalXP = child.totalXP || 0;
        const level = child.level || 1;

        const summaryDescription = `
          Level: ${level} (${totalXP} total XP)
          This week: ${weeklyXP} XP earned
          
          ${weeklyXP > 100 ? '🔥 Excellent week!' : weeklyXP > 50 ? '👍 Good progress!' : '💪 Keep it up!'}
        `;

        await this.sendAchievementNotification(child.studentId, 'weekly_summary', {
          title: 'Weekly Progress Summary',
          description: summaryDescription,
          xpEarned: weeklyXP,
          icon: '📊'
        });
      }

    } catch (error) {
      console.error('Error sending weekly summary:', error);
    }
  }

  // Update parent engagement metrics
  private async updateParentEngagement(parentId: number, studentId: number, action: string): Promise<void> {
    try {
      // Get existing engagement record
      const existing = await db.select()
        .from(schema.parentEngagement)
        .where(
          and(
            eq(schema.parentEngagement.parentId, parentId),
            eq(schema.parentEngagement.studentId, studentId)
          )
        )
        .limit(1);

      const updates: any = {
        updatedAt: new Date(),
        lastLogin: new Date(),
      };

      if (action === 'notification_sent') {
        updates.notificationsViewed = sql`${schema.parentEngagement.notificationsViewed} + 1`;
      }

      if (existing[0]) {
        // Update existing record
        await db.update(schema.parentEngagement)
          .set(updates)
          .where(eq(schema.parentEngagement.id, existing[0].id));
      } else {
        // Create new engagement record
        await db.insert(schema.parentEngagement).values({
          parentId,
          studentId,
          totalLogins: 1,
          lastLogin: new Date(),
          notificationsViewed: action === 'notification_sent' ? 1 : 0,
          engagementScore: '10', // Starting score
          engagementLevel: 'new',
        });
      }

    } catch (error) {
      console.error('Error updating parent engagement:', error);
    }
  }
}