import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema.js';
import type { 
  LearningSession, 
  ProblemAttempt, 
  TopicMastery, 
  DailyActivity,
  WeeklyEngagement,
  ParentGoal,
  ExamReadiness,
  Alert,
  Milestone,
  DashboardSummary
} from '../src/types/dashboard-metrics.js';

// Database connection
const connectionString = process.env.DATABASE_URL || '';
const sql = postgres(connectionString);
export const db = drizzle(sql, { schema });

// Storage class for dashboard metrics
export class DashboardStorage {
  
  // Learning Sessions
  async createLearningSession(session: Omit<LearningSession, 'id'>): Promise<string> {
    const [result] = await db.insert(schema.learningSessions).values({
      childId: session.childId,
      subject: session.subject,
      topic: session.topic,
      startTime: session.startTime,
      endTime: session.endTime,
      duration: session.duration,
      problemsAttempted: session.problemsAttempted,
      problemsCompleted: session.problemsCompleted,
      correctAnswers: session.correctAnswers,
      hintsUsed: session.hintsUsed,
      avgAttemptsPerProblem: session.avgAttemptsPerProblem.toString(),
      difficulty: session.difficulty,
      sessionType: session.sessionType,
    }).returning({ id: schema.learningSessions.id });
    
    return result.id;
  }

  async updateLearningSession(sessionId: string, updates: Partial<LearningSession>): Promise<void> {
    await db.update(schema.learningSessions)
      .set({
        endTime: updates.endTime,
        duration: updates.duration,
        problemsAttempted: updates.problemsAttempted,
        problemsCompleted: updates.problemsCompleted,
        correctAnswers: updates.correctAnswers,
        hintsUsed: updates.hintsUsed,
        avgAttemptsPerProblem: updates.avgAttemptsPerProblem?.toString(),
      })
      .where(eq(schema.learningSessions.id, sessionId));
  }

  // Problem Attempts
  async recordProblemAttempt(attempt: Omit<ProblemAttempt, 'id'>): Promise<string> {
    const [result] = await db.insert(schema.problemAttempts).values({
      sessionId: attempt.sessionId,
      childId: attempt.childId,
      subject: attempt.subject,
      topic: attempt.topic,
      problemId: attempt.problemId,
      difficulty: attempt.difficulty,
      attempts: attempt.attempts,
      hintsUsed: attempt.hintsUsed,
      timeSpent: attempt.timeSpent,
      isCorrect: attempt.isCorrect,
      isCompleted: attempt.isCompleted,
      needsAIIntervention: attempt.needsAIIntervention,
      skippedToFinalHint: attempt.skippedToFinalHint,
      timestamp: attempt.timestamp,
    }).returning({ id: schema.problemAttempts.id });
    
    return result.id;
  }

  // Topic Mastery
  async updateTopicMastery(childId: string, subject: string, topic: string, mastery: Partial<TopicMastery>): Promise<void> {
    // Check if exists, update or insert
    const existing = await db.select()
      .from(schema.topicMastery)
      .where(and(
        eq(schema.topicMastery.childId, childId),
        eq(schema.topicMastery.subject, subject),
        eq(schema.topicMastery.topic, topic)
      ))
      .limit(1);

    if (existing.length > 0) {
      await db.update(schema.topicMastery)
        .set({
          totalProblems: mastery.totalProblems,
          completedProblems: mastery.completedProblems,
          accuracyRate: mastery.accuracyRate?.toString(),
          averageAttempts: mastery.averageAttempts?.toString(),
          averageHints: mastery.averageHints?.toString(),
          masteryLevel: mastery.masteryLevel,
          lastActivityDate: mastery.lastActivityDate,
          timeSpent: mastery.timeSpent,
          updatedAt: new Date(),
        })
        .where(eq(schema.topicMastery.id, existing[0].id));
    } else {
      await db.insert(schema.topicMastery).values({
        childId,
        subject,
        topic,
        totalProblems: mastery.totalProblems || 0,
        completedProblems: mastery.completedProblems || 0,
        accuracyRate: mastery.accuracyRate?.toString() || '0',
        averageAttempts: mastery.averageAttempts?.toString() || '0',
        averageHints: mastery.averageHints?.toString() || '0',
        masteryLevel: mastery.masteryLevel || 'novice',
        firstAttemptDate: mastery.firstAttemptDate || new Date(),
        lastActivityDate: mastery.lastActivityDate || new Date(),
        timeSpent: mastery.timeSpent || 0,
      });
    }
  }

  // Daily Activity
  async updateDailyActivity(childId: string, date: string, activity: Partial<DailyActivity>): Promise<void> {
    const existing = await db.select()
      .from(schema.dailyActivity)
      .where(and(
        eq(schema.dailyActivity.childId, childId),
        eq(schema.dailyActivity.date, date)
      ))
      .limit(1);

    if (existing.length > 0) {
      await db.update(schema.dailyActivity)
        .set({
          totalTime: activity.totalTime,
          sessionsCount: activity.sessionsCount,
          topicsWorked: activity.topicsWorked,
          problemsAttempted: activity.problemsAttempted,
          problemsCompleted: activity.problemsCompleted,
          accuracyRate: activity.accuracyRate?.toString(),
        })
        .where(eq(schema.dailyActivity.id, existing[0].id));
    } else {
      await db.insert(schema.dailyActivity).values({
        childId,
        date,
        totalTime: activity.totalTime || 0,
        sessionsCount: activity.sessionsCount || 0,
        topicsWorked: activity.topicsWorked || [],
        problemsAttempted: activity.problemsAttempted || 0,
        problemsCompleted: activity.problemsCompleted || 0,
        accuracyRate: activity.accuracyRate?.toString() || '0',
      });
    }
  }

  // Goals
  async createParentGoal(goal: Omit<ParentGoal, 'id'>): Promise<string> {
    const [result] = await db.insert(schema.parentGoals).values({
      childId: goal.childId,
      subject: goal.subject,
      title: goal.title,
      description: goal.description,
      targetDate: goal.targetDate,
      targetMetric: goal.targetMetric,
      targetValue: goal.targetValue.toString(),
      currentValue: goal.currentValue.toString(),
      isCompleted: goal.isCompleted,
    }).returning({ id: schema.parentGoals.id });
    
    return result.id;
  }

  async updateGoalProgress(goalId: string, currentValue: number, isCompleted?: boolean): Promise<void> {
    await db.update(schema.parentGoals)
      .set({
        currentValue: currentValue.toString(),
        isCompleted: isCompleted,
        updatedAt: new Date(),
      })
      .where(eq(schema.parentGoals.id, goalId));
  }

  // Alerts
  async createAlert(alert: Omit<Alert, 'id'>): Promise<string> {
    const [result] = await db.insert(schema.alerts).values({
      childId: alert.childId,
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      actionRequired: alert.actionRequired,
      isRead: alert.isRead,
      expiresAt: alert.expiresAt,
    }).returning({ id: schema.alerts.id });
    
    return result.id;
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    await db.update(schema.alerts)
      .set({ isRead: true })
      .where(eq(schema.alerts.id, alertId));
  }

  // Milestones
  async createMilestone(milestone: Omit<Milestone, 'id'>): Promise<string> {
    const [result] = await db.insert(schema.milestones).values({
      childId: milestone.childId,
      type: milestone.type,
      title: milestone.title,
      description: milestone.description,
      badgeIcon: milestone.badgeIcon,
      points: milestone.points,
      achievedAt: milestone.achievedAt,
    }).returning({ id: schema.milestones.id });
    
    return result.id;
  }

  // Query methods for dashboard
  async getChildLearningHistory(childId: string, subject: string, days: number = 30): Promise<LearningSession[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const sessions = await db.select()
      .from(schema.learningSessions)
      .where(and(
        eq(schema.learningSessions.childId, childId),
        eq(schema.learningSessions.subject, subject),
        gte(schema.learningSessions.startTime, cutoffDate)
      ))
      .orderBy(desc(schema.learningSessions.startTime));

    return sessions.map(session => ({
      id: session.id,
      childId: session.childId,
      subject: session.subject,
      topic: session.topic,
      startTime: session.startTime,
      endTime: session.endTime || undefined,
      duration: session.duration,
      problemsAttempted: session.problemsAttempted,
      problemsCompleted: session.problemsCompleted,
      correctAnswers: session.correctAnswers,
      hintsUsed: session.hintsUsed,
      avgAttemptsPerProblem: parseFloat(session.avgAttemptsPerProblem),
      difficulty: session.difficulty as 'easy' | 'medium' | 'hard',
      sessionType: session.sessionType as 'practice' | 'test' | 'review',
    }));
  }

  async getTopicMasteryData(childId: string, subject: string): Promise<TopicMastery[]> {
    const mastery = await db.select()
      .from(schema.topicMastery)
      .where(and(
        eq(schema.topicMastery.childId, childId),
        eq(schema.topicMastery.subject, subject)
      ));

    return mastery.map(m => ({
      childId: m.childId,
      subject: m.subject,
      topic: m.topic,
      totalProblems: m.totalProblems,
      completedProblems: m.completedProblems,
      accuracyRate: parseFloat(m.accuracyRate),
      averageAttempts: parseFloat(m.averageAttempts),
      averageHints: parseFloat(m.averageHints),
      masteryLevel: m.masteryLevel as 'novice' | 'developing' | 'proficient' | 'mastered',
      firstAttemptDate: m.firstAttemptDate!,
      lastActivityDate: m.lastActivityDate!,
      timeSpent: m.timeSpent,
    }));
  }

  async getDailyActivityData(childId: string, days: number = 30): Promise<DailyActivity[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const activity = await db.select()
      .from(schema.dailyActivity)
      .where(and(
        eq(schema.dailyActivity.childId, childId),
        gte(schema.dailyActivity.date, cutoffDateStr)
      ))
      .orderBy(desc(schema.dailyActivity.date));

    return activity.map(a => ({
      childId: a.childId,
      date: a.date,
      totalTime: a.totalTime,
      sessionsCount: a.sessionsCount,
      topicsWorked: a.topicsWorked as string[],
      problemsAttempted: a.problemsAttempted,
      problemsCompleted: a.problemsCompleted,
      accuracyRate: parseFloat(a.accuracyRate),
    }));
  }

  async getActiveAlerts(childId: string): Promise<Alert[]> {
    const now = new Date();
    const alerts = await db.select()
      .from(schema.alerts)
      .where(and(
        eq(schema.alerts.childId, childId),
        eq(schema.alerts.isRead, false),
        or(
          isNull(schema.alerts.expiresAt),
          gte(schema.alerts.expiresAt, now)
        )
      ))
      .orderBy(desc(schema.alerts.createdAt));

    return alerts.map(a => ({
      id: a.id,
      childId: a.childId,
      type: a.type as 'struggle' | 'engagement' | 'readiness' | 'goal' | 'milestone',
      severity: a.severity as 'low' | 'medium' | 'high',
      title: a.title,
      message: a.message,
      actionRequired: a.actionRequired,
      isRead: a.isRead,
      createdAt: a.createdAt!,
      expiresAt: a.expiresAt || undefined,
    }));
  }

  async getRecentMilestones(childId: string, limit: number = 5): Promise<Milestone[]> {
    const milestones = await db.select()
      .from(schema.milestones)
      .where(eq(schema.milestones.childId, childId))
      .orderBy(desc(schema.milestones.achievedAt))
      .limit(limit);

    return milestones.map(m => ({
      id: m.id,
      childId: m.childId,
      type: m.type as 'topic_mastery' | 'accuracy_streak' | 'time_goal' | 'consistency',
      title: m.title,
      description: m.description || '',
      achievedAt: m.achievedAt!,
      badgeIcon: m.badgeIcon,
      points: m.points,
    }));
  }
}

// Import missing functions from drizzle-orm
import { eq, and, or, gte, desc, isNull } from 'drizzle-orm';