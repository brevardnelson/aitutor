import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, or, gte, desc, isNull } from 'drizzle-orm';
import * as schema from '../shared/schema';

// Database connection and ORM setup
const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);
export const db = drizzle(sql, { schema });

// Updated schema mappings for raw SQL queries when needed
const tableNames = {
  learningSessions: {
    id: 'id',
    studentId: 'student_id',
    subject: 'subject',
    topic: 'topic',
    startTime: 'start_time',
    endTime: 'end_time',
    duration: 'duration',
    problemsAttempted: 'problems_attempted',
    problemsCompleted: 'problems_completed',
    correctAnswers: 'correct_answers',
    hintsUsed: 'hints_used',
    avgAttemptsPerProblem: 'avg_attempts_per_problem',
    difficulty: 'difficulty',
    sessionType: 'session_type',
    createdAt: 'created_at',
  },
  problemAttempts: {
    id: 'id',
    sessionId: 'session_id',
    studentId: 'student_id',
    subject: 'subject',
    topic: 'topic',
    problemId: 'problem_id',
    difficulty: 'difficulty',
    attempts: 'attempts',
    hintsUsed: 'hints_used',
    timeSpent: 'time_spent',
    isCorrect: 'is_correct',
    isCompleted: 'is_completed',
    needsAIIntervention: 'needs_ai_intervention',
    skippedToFinalHint: 'skipped_to_final_hint',
    timestamp: 'timestamp',
  },
  topicMastery: {
    id: 'id',
    studentId: 'student_id',
    subject: 'subject',
    topic: 'topic',
    totalProblems: 'total_problems',
    completedProblems: 'completed_problems',
    accuracyRate: 'accuracy_rate',
    averageAttempts: 'average_attempts',
    averageHints: 'average_hints',
    masteryLevel: 'mastery_level',
    firstAttemptDate: 'first_attempt_date',
    lastActivityDate: 'last_activity_date',
    timeSpent: 'time_spent',
    updatedAt: 'updated_at',
  },
  dailyActivity: {
    id: 'id',
    studentId: 'student_id',
    date: 'date',
    totalTime: 'total_time',
    sessionsCount: 'sessions_count',
    topicsWorked: 'topics_worked',
    problemsAttempted: 'problems_attempted',
    problemsCompleted: 'problems_completed',
    accuracyRate: 'accuracy_rate',
    createdAt: 'created_at',
  },
  studentAlerts: {
    id: 'id',
    studentId: 'student_id',
    type: 'type',
    severity: 'severity',
    title: 'title',
    message: 'message',
    actionRequired: 'action_required',
    isRead: 'is_read',
    expiresAt: 'expires_at',
    createdAt: 'created_at',
  },
  milestones: {
    id: 'id',
    studentId: 'student_id',
    type: 'type',
    title: 'title',
    description: 'description',
    badgeIcon: 'badge_icon',
    points: 'points',
    achievedAt: 'achieved_at',
  },
  parentGoals: {
    id: 'id',
    studentId: 'student_id',
    subject: 'subject',
    title: 'title',
    description: 'description',
    targetDate: 'target_date',
    targetMetric: 'target_metric',
    targetValue: 'target_value',
    currentValue: 'current_value',
    isCompleted: 'is_completed',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  examReadiness: {
    id: 'id',
    studentId: 'student_id',
    subject: 'subject',
    examType: 'exam_type',
    overallScore: 'overall_score',
    topicScores: 'topic_scores',
    weakAreas: 'weak_areas',
    strongAreas: 'strong_areas',
    recommendedStudyTime: 'recommended_study_time',
    estimatedReadinessDate: 'estimated_readiness_date',
    lastUpdated: 'last_updated',
  }
};

// Simple database interface using raw SQL for better control
export class DashboardStorage {
  private sql: postgres.Sql;

  constructor() {
    this.sql = sql; // Use the sql connection already defined above
  }

  // Learning Sessions
  async createLearningSession(session: {
    studentId: number;
    subject: string;
    topic: string;
    startTime: Date;
    duration: number;
    problemsAttempted: number;
    problemsCompleted: number;
    correctAnswers: number;
    hintsUsed: number;
    avgAttemptsPerProblem: number;
    difficulty: 'easy' | 'medium' | 'hard';
    sessionType: 'practice' | 'test' | 'review';
  }): Promise<number> {
    const [result] = await this.sql`
      INSERT INTO learning_sessions (
        student_id, subject, topic, start_time, duration,
        problems_attempted, problems_completed, correct_answers,
        hints_used, avg_attempts_per_problem, difficulty, session_type
      ) VALUES (
        ${session.studentId}, ${session.subject}, ${session.topic}, 
        ${session.startTime}, ${session.duration}, ${session.problemsAttempted},
        ${session.problemsCompleted}, ${session.correctAnswers}, ${session.hintsUsed},
        ${session.avgAttemptsPerProblem}, ${session.difficulty}, ${session.sessionType}
      ) RETURNING id
    `;
    
    return result.id;
  }

  async updateLearningSession(sessionId: number, updates: {
    endTime?: Date;
    duration?: number;
    problemsAttempted?: number;
    problemsCompleted?: number;
    correctAnswers?: number;
    hintsUsed?: number;
    avgAttemptsPerProblem?: number;
  }): Promise<void> {
    // Get session info for challenge tracking
    const [sessionInfo] = await this.sql`
      SELECT student_id, problems_completed FROM learning_sessions WHERE id = ${sessionId}
    `;
    
    const setClause = [];
    const values = [];
    
    if (updates.endTime !== undefined) {
      setClause.push('end_time = $' + (values.length + 1));
      values.push(updates.endTime);
    }
    if (updates.duration !== undefined) {
      setClause.push('duration = $' + (values.length + 1));
      values.push(updates.duration);
    }
    if (updates.problemsAttempted !== undefined) {
      setClause.push('problems_attempted = $' + (values.length + 1));
      values.push(updates.problemsAttempted);
    }
    if (updates.problemsCompleted !== undefined) {
      setClause.push('problems_completed = $' + (values.length + 1));
      values.push(updates.problemsCompleted);
    }
    if (updates.correctAnswers !== undefined) {
      setClause.push('correct_answers = $' + (values.length + 1));
      values.push(updates.correctAnswers);
    }
    if (updates.hintsUsed !== undefined) {
      setClause.push('hints_used = $' + (values.length + 1));
      values.push(updates.hintsUsed);
    }
    if (updates.avgAttemptsPerProblem !== undefined) {
      setClause.push('avg_attempts_per_problem = $' + (values.length + 1));
      values.push(updates.avgAttemptsPerProblem);
    }

    if (setClause.length > 0) {
      values.push(sessionId);
      await this.sql.unsafe(
        `UPDATE learning_sessions SET ${setClause.join(', ')} WHERE id = $${values.length}`,
        values as any[]
      );
    }
    
    // CRITICAL FIX: Wire up challenge auto-tracking for session completion
    if (sessionInfo && updates.problemsCompleted !== undefined) {
      try {
        const problemsDelta = updates.problemsCompleted - (sessionInfo.problems_completed || 0);
        if (problemsDelta > 0) {
          // Track additional problems completed in this session
          await this.autoUpdateChallengeProgress(sessionInfo.student_id, {
            type: 'problem_completed',
            value: problemsDelta,
            metadata: {
              sessionId,
              sessionDuration: updates.duration,
              accuracy: updates.correctAnswers && updates.problemsCompleted 
                ? (updates.correctAnswers / updates.problemsCompleted) * 100 
                : 0
            }
          });
        }
      } catch (error) {
        console.error('Failed to update challenge progress in learning session:', error);
        // Don't throw - we don't want to break the session update
      }
    }
  }

  // Problem Attempts
  async recordProblemAttempt(attempt: {
    sessionId: number;
    studentId: number;
    subject: string;
    topic: string;
    problemId: string;
    difficulty: 'easy' | 'medium' | 'hard';
    attempts: number;
    hintsUsed: number;
    timeSpent: number;
    isCorrect: boolean;
    isCompleted: boolean;
    needsAIIntervention: boolean;
    skippedToFinalHint: boolean;
  }): Promise<number> {
    const [result] = await this.sql`
      INSERT INTO problem_attempts (
        session_id, student_id, subject, topic, problem_id,
        difficulty, attempts, hints_used, time_spent,
        is_correct, is_completed, needs_ai_intervention, skipped_to_final_hint
      ) VALUES (
        ${attempt.sessionId}, ${attempt.studentId}, ${attempt.subject},
        ${attempt.topic}, ${attempt.problemId}, ${attempt.difficulty},
        ${attempt.attempts}, ${attempt.hintsUsed}, ${attempt.timeSpent},
        ${attempt.isCorrect}, ${attempt.isCompleted}, ${attempt.needsAIIntervention},
        ${attempt.skippedToFinalHint}
      ) RETURNING id
    `;
    
    // CRITICAL FIX: Wire up challenge auto-tracking for completed problems
    if (attempt.isCompleted && attempt.isCorrect) {
      try {
        await this.autoUpdateChallengeProgress(attempt.studentId, {
          type: 'problem_completed',
          value: 1,
          metadata: {
            problemId: attempt.problemId,
            difficulty: attempt.difficulty,
            hintsUsed: attempt.hintsUsed,
            timeSpent: attempt.timeSpent,
            accuracy: 100, // Since isCorrect=true
            sessionId: attempt.sessionId
          }
        });
      } catch (error) {
        console.error('Failed to update challenge progress:', error);
        // Don't throw - we don't want to break the learning flow
      }
    }

    // SECURITY FIX: Automatic XP earning for verified problem completions
    if (attempt.isCompleted && attempt.isCorrect) {
      try {
        // Calculate XP based on verified problem data using the same logic as the routes
        const baseXP = 10; // XP_CONSTANTS.PROBLEM_COMPLETION_BASE
        const difficultyMultipliers = { easy: 1.0, medium: 1.5, hard: 2.0 };
        const noHintsBonus = 5; // XP_CONSTANTS.NO_HINTS_BONUS
        
        let earnedXP = baseXP;
        earnedXP *= difficultyMultipliers[attempt.difficulty] || 1.0;
        
        if (attempt.hintsUsed === 0) {
          earnedXP += noHintsBonus;
        }
        
        // TODO: Add streak multiplier if student has active daily streak
        
        earnedXP = Math.round(earnedXP);
        
        // Create idempotency key to prevent duplicate XP awards
        const idempotencyKey = `problem_${attempt.problemId}_attempt_${result.id}`;
        
        await this.earnXP(attempt.studentId, {
          type: 'earned',
          amount: earnedXP,
          source: 'problem_completion',
          description: `Completed ${attempt.difficulty} problem${attempt.hintsUsed === 0 ? ' without hints!' : ''}`,
          metadata: {
            problemId: attempt.problemId,
            difficulty: attempt.difficulty,
            hintsUsed: attempt.hintsUsed,
            timeSpent: attempt.timeSpent,
            problemAttemptId: result.id
          },
          sessionId: attempt.sessionId,
          idempotencyKey
        });
        
      } catch (error) {
        console.error('Failed to award XP for problem completion:', error);
        // Don't throw - we don't want to break the learning flow
      }
    }
    
    return result.id;
  }

  // Topic Mastery
  async updateTopicMastery(studentId: number, subject: string, topic: string, mastery: {
    totalProblems?: number;
    completedProblems?: number;
    accuracyRate?: number;
    averageAttempts?: number;
    averageHints?: number;
    masteryLevel?: 'novice' | 'developing' | 'proficient' | 'mastered';
    lastActivityDate?: Date;
    timeSpent?: number;
  }): Promise<void> {
    // Check if exists
    const existing = await this.sql`
      SELECT id FROM topic_mastery 
      WHERE student_id = ${studentId} AND subject = ${subject} AND topic = ${topic}
      LIMIT 1
    `;

    if (existing.length > 0) {
      // Update existing
      const setClause = [];
      const values = [];
      
      Object.entries(mastery).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbColumn = {
            totalProblems: 'total_problems',
            completedProblems: 'completed_problems',
            accuracyRate: 'accuracy_rate',
            averageAttempts: 'average_attempts',
            averageHints: 'average_hints',
            masteryLevel: 'mastery_level',
            lastActivityDate: 'last_activity_date',
            timeSpent: 'time_spent',
          }[key];
          
          if (dbColumn) {
            setClause.push(`${dbColumn} = $${values.length + 1}`);
            values.push(value);
          }
        }
      });

      if (setClause.length > 0) {
        setClause.push('updated_at = CURRENT_TIMESTAMP');
        values.push(existing[0].id);
        await this.sql.unsafe(
          `UPDATE topic_mastery SET ${setClause.join(', ')} WHERE id = $${values.length}`,
          values as any[]
        );
      }
    } else {
      // Insert new
      await this.sql`
        INSERT INTO topic_mastery (
          student_id, subject, topic, total_problems, completed_problems,
          accuracy_rate, average_attempts, average_hints, mastery_level,
          first_attempt_date, last_activity_date, time_spent
        ) VALUES (
          ${studentId}, ${subject}, ${topic}, ${mastery.totalProblems || 0},
          ${mastery.completedProblems || 0}, ${mastery.accuracyRate || 0},
          ${mastery.averageAttempts || 0}, ${mastery.averageHints || 0},
          ${mastery.masteryLevel || 'novice'}, CURRENT_TIMESTAMP,
          ${mastery.lastActivityDate || new Date()}, ${mastery.timeSpent || 0}
        )
      `;
    }
  }

  // Daily Activity
  async updateDailyActivity(studentId: number, date: string, activity: {
    totalTime?: number;
    sessionsCount?: number;
    topicsWorked?: string[];
    problemsAttempted?: number;
    problemsCompleted?: number;
    accuracyRate?: number;
  }): Promise<void> {
    // Get existing data to calculate deltas for challenge tracking
    const existing = await this.sql`
      SELECT * FROM daily_activity 
      WHERE student_id = ${studentId} AND date = ${date}
    `;
    
    const oldData = existing[0] || { total_time: 0, problems_completed: 0 };
    
    // Upsert daily activity
    await this.sql`
      INSERT INTO daily_activity (
        student_id, date, total_time, sessions_count, topics_worked,
        problems_attempted, problems_completed, accuracy_rate
      ) VALUES (
        ${studentId}, ${date}, ${activity.totalTime || 0},
        ${activity.sessionsCount || 0}, ${JSON.stringify(activity.topicsWorked || [])},
        ${activity.problemsAttempted || 0}, ${activity.problemsCompleted || 0},
        ${activity.accuracyRate || 0}
      )
      ON CONFLICT (student_id, date) 
      DO UPDATE SET
        total_time = EXCLUDED.total_time,
        sessions_count = EXCLUDED.sessions_count,
        topics_worked = EXCLUDED.topics_worked,
        problems_attempted = EXCLUDED.problems_attempted,
        problems_completed = EXCLUDED.problems_completed,
        accuracy_rate = EXCLUDED.accuracy_rate
    `;
    
    // CRITICAL FIX: Wire up challenge auto-tracking for time and streak challenges
    try {
      // Track time spent if there's an increase
      const timeDelta = (activity.totalTime || 0) - oldData.total_time;
      if (timeDelta > 0) {
        await this.autoUpdateChallengeProgress(studentId, {
          type: 'time_spent',
          value: timeDelta, // In minutes
          metadata: {
            date,
            totalTimeToday: activity.totalTime || 0,
            sessionsCount: activity.sessionsCount || 0
          }
        });
      }
      
      // Update streak tracking if student was active today
      if ((activity.problemsCompleted || 0) > 0) {
        // Calculate current streak
        const streakDays = await this.calculateCurrentStreak(studentId);
        await this.autoUpdateChallengeProgress(studentId, {
          type: 'streak_updated',
          value: streakDays,
          metadata: {
            date,
            problemsCompletedToday: activity.problemsCompleted || 0
          }
        });
      }
    } catch (error) {
      console.error('Failed to update challenge progress in daily activity:', error);
      // Don't throw - we don't want to break the activity tracking
    }
  }

  // Goals
  async createParentGoal(goal: {
    studentId: number;
    subject: string;
    title: string;
    description?: string;
    targetDate: Date;
    targetMetric: 'accuracy' | 'completion' | 'time' | 'mastery';
    targetValue: number;
    currentValue: number;
    isCompleted: boolean;
  }): Promise<number> {
    const [result] = await this.sql`
      INSERT INTO parent_goals (
        student_id, subject, title, description, target_date,
        target_metric, target_value, current_value, is_completed
      ) VALUES (
        ${goal.studentId}, ${goal.subject}, ${goal.title}, ${goal.description || ''},
        ${goal.targetDate}, ${goal.targetMetric}, ${goal.targetValue},
        ${goal.currentValue}, ${goal.isCompleted}
      ) RETURNING id
    `;
    
    return result.id;
  }

  async updateGoalProgress(goalId: number, currentValue: number, isCompleted?: boolean): Promise<void> {
    await this.sql`
      UPDATE parent_goals 
      SET current_value = ${currentValue}, 
          is_completed = ${isCompleted !== undefined ? isCompleted : false},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${goalId}
    `;
  }

  // Alerts
  async createAlert(alert: {
    studentId: number;
    type: 'struggle' | 'engagement' | 'readiness' | 'goal' | 'milestone';
    severity: 'low' | 'medium' | 'high';
    title: string;
    message: string;
    actionRequired: boolean;
    isRead: boolean;
    expiresAt?: Date;
  }): Promise<number> {
    const [result] = await this.sql`
      INSERT INTO student_alerts (
        student_id, type, severity, title, message,
        action_required, is_read, expires_at
      ) VALUES (
        ${alert.studentId}, ${alert.type}, ${alert.severity}, ${alert.title},
        ${alert.message}, ${alert.actionRequired}, ${alert.isRead}, ${alert.expiresAt || null}
      ) RETURNING id
    `;
    
    return result.id;
  }

  async markAlertAsRead(alertId: number): Promise<void> {
    await this.sql`
      UPDATE student_alerts SET is_read = true WHERE id = ${alertId}
    `;
  }

  // Milestones
  async createMilestone(milestone: {
    studentId: number;
    type: 'topic_mastery' | 'accuracy_streak' | 'time_goal' | 'consistency';
    title: string;
    description?: string;
    badgeIcon: string;
    points: number;
  }): Promise<number> {
    const [result] = await this.sql`
      INSERT INTO milestones (
        student_id, type, title, description, badge_icon, points
      ) VALUES (
        ${milestone.studentId}, ${milestone.type}, ${milestone.title},
        ${milestone.description || ''}, ${milestone.badgeIcon}, ${milestone.points}
      ) RETURNING id
    `;
    
    return result.id;
  }

  // Query methods for dashboard
  async getChildLearningHistory(studentId: number, subject: string, days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const sessions = await this.sql`
      SELECT * FROM learning_sessions 
      WHERE student_id = ${studentId} 
        AND subject = ${subject}
        AND start_time >= ${cutoffDate}
      ORDER BY start_time DESC
    `;

    return sessions.map(session => ({
      id: session.id.toString(),
      childId: session.student_id.toString(),
      subject: session.subject,
      topic: session.topic,
      startTime: session.start_time,
      endTime: session.end_time || undefined,
      duration: session.duration,
      problemsAttempted: session.problems_attempted,
      problemsCompleted: session.problems_completed,
      correctAnswers: session.correct_answers,
      hintsUsed: session.hints_used,
      avgAttemptsPerProblem: parseFloat(session.avg_attempts_per_problem),
      difficulty: session.difficulty as 'easy' | 'medium' | 'hard',
      sessionType: session.session_type as 'practice' | 'test' | 'review',
    }));
  }

  async getTopicMasteryData(studentId: number, subject: string) {
    const mastery = await this.sql`
      SELECT * FROM topic_mastery 
      WHERE student_id = ${studentId} AND subject = ${subject}
    `;

    return mastery.map(m => ({
      childId: m.student_id.toString(),
      subject: m.subject,
      topic: m.topic,
      totalProblems: m.total_problems,
      completedProblems: m.completed_problems,
      accuracyRate: parseFloat(m.accuracy_rate),
      averageAttempts: parseFloat(m.average_attempts),
      averageHints: parseFloat(m.average_hints),
      masteryLevel: m.mastery_level as 'novice' | 'developing' | 'proficient' | 'mastered',
      firstAttemptDate: m.first_attempt_date!,
      lastActivityDate: m.last_activity_date!,
      timeSpent: m.time_spent,
    }));
  }

  async getDailyActivityData(studentId: number, days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const activity = await this.sql`
      SELECT * FROM daily_activity 
      WHERE student_id = ${studentId} AND date >= ${cutoffDateStr}
      ORDER BY date DESC
    `;

    return activity.map(a => ({
      childId: a.student_id.toString(),
      date: a.date,
      totalTime: a.total_time,
      sessionsCount: a.sessions_count,
      topicsWorked: a.topics_worked as string[],
      problemsAttempted: a.problems_attempted,
      problemsCompleted: a.problems_completed,
      accuracyRate: parseFloat(a.accuracy_rate),
    }));
  }

  async getActiveAlerts(studentId: number) {
    const now = new Date();
    const alerts = await this.sql`
      SELECT * FROM student_alerts 
      WHERE student_id = ${studentId} 
        AND is_read = false
        AND (expires_at IS NULL OR expires_at >= ${now})
      ORDER BY created_at DESC
    `;

    return alerts.map(a => ({
      id: a.id.toString(),
      childId: a.student_id.toString(),
      type: a.type as 'struggle' | 'engagement' | 'readiness' | 'goal' | 'milestone',
      severity: a.severity as 'low' | 'medium' | 'high',
      title: a.title,
      message: a.message,
      actionRequired: a.action_required,
      isRead: a.is_read,
      createdAt: a.created_at!,
      expiresAt: a.expires_at || undefined,
    }));
  }

  async getRecentMilestones(studentId: number, limit: number = 5) {
    const milestones = await this.sql`
      SELECT * FROM milestones 
      WHERE student_id = ${studentId}
      ORDER BY achieved_at DESC
      LIMIT ${limit}
    `;

    return milestones.map(m => ({
      id: m.id.toString(),
      childId: m.student_id.toString(),
      type: m.type as 'topic_mastery' | 'accuracy_streak' | 'time_goal' | 'consistency',
      title: m.title,
      description: m.description || '',
      achievedAt: m.achieved_at!,
      badgeIcon: m.badge_icon,
      points: m.points,
    }));
  }

  async getParentGoals(studentId: number, subject: string) {
    const goals = await this.sql`
      SELECT * FROM parent_goals 
      WHERE student_id = ${studentId} AND subject = ${subject}
      ORDER BY created_at DESC
    `;

    return goals.map(g => ({
      id: g.id.toString(),
      childId: g.student_id.toString(),
      subject: g.subject,
      title: g.title,
      description: g.description || '',
      targetDate: g.target_date,
      targetMetric: g.target_metric as 'accuracy' | 'completion' | 'time' | 'mastery',
      targetValue: parseFloat(g.target_value),
      currentValue: parseFloat(g.current_value),
      isCompleted: g.is_completed,
      createdAt: g.created_at,
    }));
  }

  async getExamReadiness(studentId: number, subject: string) {
    const readiness = await this.sql`
      SELECT * FROM exam_readiness 
      WHERE student_id = ${studentId} AND subject = ${subject}
      ORDER BY last_updated DESC
      LIMIT 1
    `;

    if (readiness.length === 0) return null;

    const r = readiness[0];
    return {
      childId: r.student_id.toString(),
      subject: r.subject,
      examType: r.exam_type,
      overallScore: parseFloat(r.overall_score),
      topicScores: r.topic_scores as Record<string, number>,
      weakAreas: r.weak_areas as string[],
      strongAreas: r.strong_areas as string[],
      recommendedStudyTime: r.recommended_study_time,
      estimatedReadinessDate: r.estimated_readiness_date!,
      lastUpdated: r.last_updated!,
    };
  }

  // GAMIFICATION SYSTEM METHODS

  // Check if user can access a specific student
  async canUserAccessStudent(userId: number, studentId: number): Promise<boolean> {
    const result = await this.sql`
      SELECT 1 FROM students s
      JOIN user_roles ur ON ur.user_id = ${userId}
      WHERE s.id = ${studentId}
        AND (ur.role = 'system_admin' 
          OR (ur.role = 'parent' AND s.parent_id = ${userId})
          OR (ur.role = 'teacher' AND EXISTS (
            SELECT 1 FROM class_enrollments ce 
            JOIN classes c ON c.id = ce.class_id 
            WHERE ce.student_id = ${studentId} AND c.teacher_id = ${userId}
          )))
      LIMIT 1
    `;
    return result.length > 0;
  }

  // Check if user can access a specific class
  async canUserAccessClass(userId: number, classId: number): Promise<boolean> {
    const result = await this.sql`
      SELECT 1 FROM classes c
      JOIN user_roles ur ON ur.user_id = ${userId}
      WHERE c.id = ${classId}
        AND (ur.role = 'system_admin' 
          OR (ur.role = 'teacher' AND c.teacher_id = ${userId})
          OR (ur.role = 'school_admin' AND c.school_id = ur.school_id))
      LIMIT 1
    `;
    return result.length > 0;
  }

  // Get student XP data
  async getStudentXP(studentId: number) {
    const result = await this.sql`
      SELECT * FROM student_xp WHERE student_id = ${studentId}
    `;
    return result[0] || null;
  }

  // Initialize XP tracking for new student
  async initializeStudentXP(studentId: number) {
    await this.sql`
      INSERT INTO student_xp (student_id, total_xp, spent_xp, available_xp, level, weekly_xp, monthly_xp)
      VALUES (${studentId}, 0, 0, 0, 1, 0, 0)
      ON CONFLICT (student_id) DO NOTHING
    `;
    return this.getStudentXP(studentId);
  }

  // Earn XP and create transaction
  async earnXP(studentId: number, transaction: {
    type: string;
    amount: number;
    source: string;
    description: string;
    metadata?: any;
    sessionId?: number;
    idempotencyKey?: string; // For preventing duplicate awards
  }, connection?: any) {
    const sql = connection || this.sql;
    const executeTransaction = async (txnSql: any) => {
      // Get current XP data
      const currentXP = await sql`
        SELECT * FROM student_xp WHERE student_id = ${studentId}
      `;

      let xpData = currentXP[0];
      if (!xpData) {
        // Initialize if not exists
        await sql`
          INSERT INTO student_xp (student_id, total_xp, spent_xp, available_xp, level, weekly_xp, monthly_xp)
          VALUES (${studentId}, 0, 0, 0, 1, 0, 0)
        `;
        xpData = { total_xp: 0, spent_xp: 0, available_xp: 0, level: 1, weekly_xp: 0, monthly_xp: 0 };
      }

      const balanceBefore = xpData.available_xp;
      const newTotalXP = xpData.total_xp + transaction.amount;
      const newAvailableXP = xpData.available_xp + transaction.amount;
      const newWeeklyXP = xpData.weekly_xp + transaction.amount;
      const newMonthlyXP = xpData.monthly_xp + transaction.amount;

      // Calculate new level
      const newLevel = this.calculateLevel(newTotalXP);

      // Update XP data
      await sql`
        UPDATE student_xp 
        SET total_xp = ${newTotalXP},
            available_xp = ${newAvailableXP},
            level = ${newLevel},
            weekly_xp = ${newWeeklyXP},
            monthly_xp = ${newMonthlyXP},
            last_xp_earned = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ${studentId}
      `;

      // CRITICAL FIX: Create transaction record with idempotency protection
      try {
        await txnSql`
          INSERT INTO xp_transactions (
            student_id, type, amount, source, description, metadata, 
            balance_before, balance_after, session_id, idempotency_key
          ) VALUES (
            ${studentId}, ${transaction.type}, ${transaction.amount}, 
            ${transaction.source}, ${transaction.description}, ${JSON.stringify(transaction.metadata || {})},
            ${balanceBefore}, ${newAvailableXP}, ${transaction.sessionId || null}, ${transaction.idempotencyKey || null}
          )
        `;
      } catch (dbError: any) {
        // Handle duplicate idempotency key gracefully
        if (dbError.code === '23505' && transaction.idempotencyKey) {
          console.log(`XP transaction ${transaction.idempotencyKey} already processed for student ${studentId}`);
          return; // Skip duplicate transaction
        }
        throw dbError;
      }
    };

    if (connection) {
      // Use existing transaction
      await executeTransaction(connection);
    } else {
      // Create new transaction
      await this.sql.begin(executeTransaction);
    }

    return this.getStudentXP(studentId);
  }

  // Spend XP and create transaction
  async spendXP(studentId: number, transaction: {
    type: string;
    amount: number;
    source: string;
    description: string;
    metadata?: any;
  }) {
    await this.sql.begin(async (sql) => {
      const currentXP = await sql`
        SELECT * FROM student_xp WHERE student_id = ${studentId}
      `;

      if (!currentXP[0]) {
        throw new Error('Student XP data not found');
      }

      const xpData = currentXP[0];
      const balanceBefore = xpData.available_xp;
      const spentAmount = Math.abs(transaction.amount);
      
      if (balanceBefore < spentAmount) {
        throw new Error('Insufficient XP balance');
      }

      const newAvailableXP = balanceBefore - spentAmount;
      const newSpentXP = xpData.spent_xp + spentAmount;

      // Update XP data
      await sql`
        UPDATE student_xp 
        SET available_xp = ${newAvailableXP},
            spent_xp = ${newSpentXP},
            updated_at = CURRENT_TIMESTAMP
        WHERE student_id = ${studentId}
      `;

      // Create transaction record
      await sql`
        INSERT INTO xp_transactions (
          student_id, type, amount, source, description, metadata, 
          balance_before, balance_after
        ) VALUES (
          ${studentId}, ${transaction.type}, ${-spentAmount}, 
          ${transaction.source}, ${transaction.description}, ${JSON.stringify(transaction.metadata || {})},
          ${balanceBefore}, ${newAvailableXP}
        )
      `;
    });

    return this.getStudentXP(studentId);
  }

  // Get XP transactions for a student
  async getXPTransactions(studentId: number, limit: number = 50, offset: number = 0) {
    return await this.sql`
      SELECT * FROM xp_transactions 
      WHERE student_id = ${studentId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
  }

  // ================================================================================
  // COMPREHENSIVE LEADERBOARD SYSTEM - Supports all leaderboard types and scopes
  // ================================================================================

  // Calculate rankings for different leaderboard types
  async calculateLeaderboardRankings(params: {
    type: 'weekly_xp' | 'monthly_accuracy' | 'challenge_completion' | 'streak_leaders' | 'badge_count';
    scope: 'class' | 'grade' | 'school';
    classId?: number;
    schoolId?: number;
    gradeLevel?: string;
    periodStart: Date;
    periodEnd: Date;
  }) {
    const { type, scope, classId, schoolId, gradeLevel, periodStart, periodEnd } = params;

    // Base WHERE conditions for scope filtering
    let scopeConditions = '';
    let scopeJoins = '';
    
    if (scope === 'class' && classId) {
      scopeJoins = 'JOIN class_enrollments ce ON ce.student_id = s.id';
      scopeConditions = `AND ce.class_id = ${classId} AND ce.is_active = true`;
    } else if (scope === 'grade' && gradeLevel) {
      scopeJoins = 'JOIN student_profiles sp2 ON sp2.student_id = s.id';
      scopeConditions = `AND sp2.grade = '${gradeLevel}'`;
    } else if (scope === 'school' && schoolId) {
      scopeJoins = `
        JOIN class_enrollments ce ON ce.student_id = s.id 
        JOIN classes cl ON cl.id = ce.class_id
      `;
      scopeConditions = `AND cl.school_id = ${schoolId} AND ce.is_active = true`;
    }

    // Calculate rankings based on leaderboard type
    switch (type) {
      case 'weekly_xp':
        return await this.sql.unsafe(`
          SELECT 
            ROW_NUMBER() OVER (ORDER BY sx.weekly_xp DESC) as rank,
            s.id as student_id,
            sx.weekly_xp as score,
            sp.name as student_name,
            sp.grade,
            sp.avatar_url
          FROM students s
          JOIN student_profiles sp ON sp.student_id = s.id
          JOIN student_xp sx ON sx.student_id = s.id
          ${scopeJoins}
          WHERE sx.weekly_xp > 0 ${scopeConditions}
          ORDER BY sx.weekly_xp DESC
        `);

      case 'monthly_accuracy':
        return await this.sql.unsafe(`
          WITH monthly_stats AS (
            SELECT 
              pa.student_id,
              ROUND(AVG(CASE WHEN pa.is_correct THEN 100.0 ELSE 0.0 END), 2) as accuracy_rate,
              COUNT(*) as total_attempts
            FROM problem_attempts pa
            JOIN students s ON s.id = pa.student_id
            ${scopeJoins}
            WHERE pa.timestamp >= '${periodStart.toISOString()}' 
              AND pa.timestamp <= '${periodEnd.toISOString()}'
              AND pa.is_completed = true
              ${scopeConditions}
            GROUP BY pa.student_id
            HAVING COUNT(*) >= 10
          )
          SELECT 
            ROW_NUMBER() OVER (ORDER BY ms.accuracy_rate DESC, ms.total_attempts DESC) as rank,
            s.id as student_id,
            ms.accuracy_rate as score,
            sp.name as student_name,
            sp.grade,
            sp.avatar_url,
            ms.total_attempts as metadata
          FROM monthly_stats ms
          JOIN students s ON s.id = ms.student_id
          JOIN student_profiles sp ON sp.student_id = s.id
          ORDER BY ms.accuracy_rate DESC, ms.total_attempts DESC
        `);

      case 'challenge_completion':
        return await this.sql.unsafe(`
          WITH challenge_stats AS (
            SELECT 
              cp.student_id,
              COUNT(CASE WHEN cp.is_completed THEN 1 END) as completed_challenges,
              COUNT(*) as total_joined
            FROM challenge_participation cp
            JOIN challenges ch ON ch.id = cp.challenge_id
            JOIN students s ON s.id = cp.student_id
            ${scopeJoins}
            WHERE ch.start_date >= '${periodStart.toISOString()}' 
              AND ch.end_date <= '${periodEnd.toISOString()}'
              ${scopeConditions}
            GROUP BY cp.student_id
          )
          SELECT 
            ROW_NUMBER() OVER (ORDER BY cs.completed_challenges DESC, cs.total_joined DESC) as rank,
            s.id as student_id,
            cs.completed_challenges as score,
            sp.name as student_name,
            sp.grade,
            sp.avatar_url,
            cs.total_joined as metadata
          FROM challenge_stats cs
          JOIN students s ON s.id = cs.student_id
          JOIN student_profiles sp ON sp.student_id = s.id
          WHERE cs.completed_challenges > 0
          ORDER BY cs.completed_challenges DESC, cs.total_joined DESC
        `);

      case 'streak_leaders':
        return await this.sql.unsafe(`
          WITH current_streaks AS (
            SELECT 
              da.student_id,
              COUNT(*) as current_streak
            FROM daily_activity da
            JOIN students s ON s.id = da.student_id
            ${scopeJoins}
            WHERE da.date >= '${periodStart.toISOString().split('T')[0]}' 
              AND da.date <= '${periodEnd.toISOString().split('T')[0]}'
              AND da.problems_completed > 0
              ${scopeConditions}
            GROUP BY da.student_id
          )
          SELECT 
            ROW_NUMBER() OVER (ORDER BY cs.current_streak DESC) as rank,
            s.id as student_id,
            cs.current_streak as score,
            sp.name as student_name,
            sp.grade,
            sp.avatar_url
          FROM current_streaks cs
          JOIN students s ON s.id = cs.student_id
          JOIN student_profiles sp ON sp.student_id = s.id
          WHERE cs.current_streak >= 3
          ORDER BY cs.current_streak DESC
        `);

      case 'badge_count':
        return await this.sql.unsafe(`
          WITH badge_stats AS (
            SELECT 
              sb.student_id,
              COUNT(CASE WHEN sb.is_earned THEN 1 END) as badges_earned,
              SUM(CASE WHEN sb.is_earned AND bd.tier = 'gold' THEN 3
                       WHEN sb.is_earned AND bd.tier = 'silver' THEN 2  
                       WHEN sb.is_earned AND bd.tier = 'bronze' THEN 1
                       ELSE 0 END) as badge_score
            FROM student_badges sb
            JOIN badge_definitions bd ON bd.id = sb.badge_id
            JOIN students s ON s.id = sb.student_id
            ${scopeJoins}
            WHERE sb.earned_at >= '${periodStart.toISOString()}' 
              AND sb.earned_at <= '${periodEnd.toISOString()}'
              ${scopeConditions}
            GROUP BY sb.student_id
          )
          SELECT 
            ROW_NUMBER() OVER (ORDER BY bs.badge_score DESC, bs.badges_earned DESC) as rank,
            s.id as student_id,
            bs.badge_score as score,
            sp.name as student_name,
            sp.grade,
            sp.avatar_url,
            bs.badges_earned as metadata
          FROM badge_stats bs
          JOIN students s ON s.id = bs.student_id
          JOIN student_profiles sp ON sp.student_id = s.id
          WHERE bs.badges_earned > 0
          ORDER BY bs.badge_score DESC, bs.badges_earned DESC
        `);

      default:
        return [];
    }
  }

  // Get comprehensive leaderboard data with pagination and filtering
  async getLeaderboard(params: {
    type: 'weekly_xp' | 'monthly_accuracy' | 'challenge_completion' | 'streak_leaders' | 'badge_count';
    scope: 'class' | 'grade' | 'school';
    classId?: number;
    schoolId?: number;
    gradeLevel?: string;
    limit: number;
    offset?: number;
    leaderboardId?: number;
  }) {
    // If specific leaderboard ID provided, get from leaderboard_entries
    if (params.leaderboardId) {
      const entries = await this.sql`
        SELECT 
          le.rank,
          le.student_id,
          le.score,
          le.previous_rank,
          le.trend_direction,
          le.metadata,
          sp.name as student_name,
          sp.grade,
          sp.avatar_url,
          l.type,
          l.scope,
          l.period_start,
          l.period_end
        FROM leaderboard_entries le
        JOIN leaderboards l ON l.id = le.leaderboard_id
        JOIN students s ON s.id = le.student_id
        JOIN student_profiles sp ON sp.student_id = s.id
        WHERE le.leaderboard_id = ${params.leaderboardId}
        ORDER BY le.rank
        LIMIT ${params.limit} OFFSET ${params.offset || 0}
      `;
      return entries;
    }

    // Get current/active leaderboard for the type and scope
    const currentLeaderboard = await this.sql`
      SELECT * FROM leaderboards 
      WHERE type = ${params.type} 
        AND scope = ${params.scope}
        AND (
          (${params.classId}::integer IS NULL OR class_id = ${params.classId}) AND
          (${params.schoolId}::integer IS NULL OR school_id = ${params.schoolId}) AND
          (${params.gradeLevel}::text IS NULL OR grade_level = ${params.gradeLevel})
        )
        AND is_current = true
        AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (currentLeaderboard.length === 0) {
      // No current leaderboard exists, return empty
      return [];
    }

    // Get entries for this leaderboard
    return await this.getLeaderboard({
      ...params,
      leaderboardId: currentLeaderboard[0].id
    });
  }

  // ================================================================================
  // AUTOMATED LEADERBOARD MANAGEMENT - Create, Update, Archive
  // ================================================================================

  // Create a new leaderboard for a given period and scope
  async createLeaderboard(params: {
    type: 'weekly_xp' | 'monthly_accuracy' | 'challenge_completion' | 'streak_leaders' | 'badge_count';
    scope: 'class' | 'grade' | 'school';
    classId?: number;
    schoolId?: number;
    gradeLevel?: string;
    periodType: 'weekly' | 'monthly';
    periodStart: Date;
    periodEnd: Date;
  }): Promise<number> {
    const { type, scope, classId, schoolId, gradeLevel, periodType, periodStart, periodEnd } = params;

    // First, mark any existing current leaderboards as non-current
    await this.sql`
      UPDATE leaderboards 
      SET is_current = false, updated_at = CURRENT_TIMESTAMP
      WHERE type = ${type} 
        AND scope = ${scope}
        AND (${classId || null}::integer IS NULL OR class_id = ${classId || null})
        AND (${schoolId || null}::integer IS NULL OR school_id = ${schoolId || null})
        AND (${gradeLevel || null}::text IS NULL OR grade_level = ${gradeLevel || null})
        AND is_current = true
    `;

    // Create new leaderboard
    const [leaderboard] = await this.sql`
      INSERT INTO leaderboards (
        type, scope, class_id, school_id, grade_level,
        period_type, period_start, period_end, is_active, is_current
      ) VALUES (
        ${type}, ${scope}, ${classId || null}, ${schoolId || null}, ${gradeLevel || null},
        ${periodType}, ${periodStart.toISOString()}, ${periodEnd.toISOString()}, true, true
      ) RETURNING id
    `;

    console.log(`Created new ${type} leaderboard (${scope}) for period ${periodStart.toISOString()} - ${periodEnd.toISOString()}`);
    return leaderboard.id;
  }

  // Update leaderboard entries with current rankings and trend analysis
  async updateLeaderboardEntries(leaderboardId: number): Promise<void> {
    // Get leaderboard details
    const [leaderboard] = await this.sql`
      SELECT * FROM leaderboards WHERE id = ${leaderboardId}
    `;

    if (!leaderboard) {
      throw new Error(`Leaderboard ${leaderboardId} not found`);
    }

    // Calculate current rankings
    const currentRankings = await this.calculateLeaderboardRankings({
      type: leaderboard.type as any,
      scope: leaderboard.scope as any,
      classId: leaderboard.class_id,
      schoolId: leaderboard.school_id,
      gradeLevel: leaderboard.grade_level,
      periodStart: new Date(leaderboard.period_start),
      periodEnd: new Date(leaderboard.period_end)
    });

    // Get previous leaderboard for trend analysis
    const [previousLeaderboard] = await this.sql`
      SELECT id FROM leaderboards 
      WHERE type = ${leaderboard.type}
        AND scope = ${leaderboard.scope}
        AND (${leaderboard.class_id}::integer IS NULL OR class_id = ${leaderboard.class_id})
        AND (${leaderboard.school_id}::integer IS NULL OR school_id = ${leaderboard.school_id})
        AND (${leaderboard.grade_level}::text IS NULL OR grade_level = ${leaderboard.grade_level})
        AND id != ${leaderboardId}
        AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;

    let previousRankings = [];
    if (previousLeaderboard) {
      previousRankings = await this.sql`
        SELECT student_id, rank FROM leaderboard_entries 
        WHERE leaderboard_id = ${previousLeaderboard.id}
      `;
    }

    // Create lookup map for previous ranks
    const previousRanksMap = new Map();
    previousRankings.forEach((entry: any) => {
      previousRanksMap.set(entry.student_id, entry.rank);
    });

    // Clear existing entries and insert new ones
    await this.sql`DELETE FROM leaderboard_entries WHERE leaderboard_id = ${leaderboardId}`;

    // Insert new entries with trend analysis
    for (const ranking of currentRankings) {
      const previousRank = previousRanksMap.get(ranking.student_id);
      let trendDirection = 'new';

      if (previousRank) {
        if (ranking.rank < previousRank) {
          trendDirection = 'up';
        } else if (ranking.rank > previousRank) {
          trendDirection = 'down';
        } else {
          trendDirection = 'same';
        }
      }

      await this.sql`
        INSERT INTO leaderboard_entries (
          leaderboard_id, student_id, rank, score, previous_rank, trend_direction, metadata
        ) VALUES (
          ${leaderboardId}, ${ranking.student_id}, ${ranking.rank}, ${ranking.score},
          ${previousRank || null}, ${trendDirection}, ${JSON.stringify(ranking.metadata || {})}
        )
      `;
    }

    console.log(`Updated ${currentRankings.length} entries for leaderboard ${leaderboardId}`);
  }

  // Archive old leaderboards (mark as inactive but keep data)
  async archiveOldLeaderboards(cutoffDate: Date): Promise<void> {
    const result = await this.sql`
      UPDATE leaderboards 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE period_end < ${cutoffDate.toISOString()} AND is_active = true
    `;

    console.log(`Archived ${result.count} old leaderboards before ${cutoffDate.toISOString()}`);
  }

  // Get leaderboard history for a specific student
  async getStudentLeaderboardPositions(studentId: number, limit: number = 10) {
    return await this.sql`
      SELECT 
        le.rank,
        le.score,
        le.previous_rank,
        le.trend_direction,
        l.type,
        l.scope,
        l.period_start,
        l.period_end,
        l.class_id,
        l.school_id,
        l.grade_level
      FROM leaderboard_entries le
      JOIN leaderboards l ON l.id = le.leaderboard_id
      WHERE le.student_id = ${studentId}
        AND l.is_active = true
      ORDER BY l.period_end DESC
      LIMIT ${limit}
    `;
  }

  // Get specific leaderboard by ID
  async getLeaderboardById(leaderboardId: number) {
    const results = await this.sql`
      SELECT 
        l.id,
        l.type,
        l.scope,
        l.class_id,
        l.school_id,
        l.grade_level,
        l.period_start,
        l.period_end,
        l.is_current,
        l.is_active,
        l.created_at,
        COUNT(le.id) as entries_count
      FROM leaderboards l
      LEFT JOIN leaderboard_entries le ON le.leaderboard_id = l.id
      WHERE l.id = ${leaderboardId}
      GROUP BY l.id, l.type, l.scope, l.class_id, l.school_id, l.grade_level, 
               l.period_start, l.period_end, l.is_current, l.is_active, l.created_at
      LIMIT 1
    `;
    
    return results.length > 0 ? results[0] : null;
  }

  // Get leaderboard history for analysis
  async getLeaderboardHistory(params: {
    type?: string;
    scope?: string;
    classId?: number;
    schoolId?: number;
    gradeLevel?: string;
    limit?: number;
  }) {
    const conditions = [];
    const values = [];

    if (params.type) {
      conditions.push(`l.type = $${values.length + 1}`);
      values.push(params.type);
    }
    if (params.scope) {
      conditions.push(`l.scope = $${values.length + 1}`);
      values.push(params.scope);
    }
    if (params.classId) {
      conditions.push(`l.class_id = $${values.length + 1}`);
      values.push(params.classId);
    }
    if (params.schoolId) {
      conditions.push(`l.school_id = $${values.length + 1}`);
      values.push(params.schoolId);
    }
    if (params.gradeLevel) {
      conditions.push(`l.grade_level = $${values.length + 1}`);
      values.push(params.gradeLevel);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limitClause = params.limit ? `LIMIT ${params.limit}` : '';

    return await this.sql.unsafe(`
      SELECT 
        l.id,
        l.type,
        l.scope,
        l.class_id,
        l.school_id,
        l.grade_level,
        l.period_start,
        l.period_end,
        l.is_current,
        l.is_active,
        COUNT(le.id) as entries_count
      FROM leaderboards l
      LEFT JOIN leaderboard_entries le ON le.leaderboard_id = l.id
      ${whereClause}
      GROUP BY l.id, l.type, l.scope, l.class_id, l.school_id, l.grade_level, 
               l.period_start, l.period_end, l.is_current, l.is_active
      ORDER BY l.period_end DESC
      ${limitClause}
    `, values);
  }

  // ================================================================================
  // WEEKLY LEADERBOARD RESET AUTOMATION - Complete system reset and regeneration
  // ================================================================================

  // Comprehensive weekly leaderboard reset and regeneration
  async resetWeeklyLeaderboards(): Promise<void> {
    console.log('🔄 Starting weekly leaderboard reset automation...');
    
    try {
      await this.sql.begin(async (sql) => {
        // 1. Archive leaderboards older than 60 days
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 60);
        await this.archiveOldLeaderboards(cutoffDate);
        
        // 2. Reset weekly XP for all students (keep for next week's calculation)
        await this.resetWeeklyXP();
        
        // 3. Get current week dates
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        endOfWeek.setHours(23, 59, 59, 999);
        
        // 4. Create new weekly leaderboards for all active classes
        const activeClasses = await sql`
          SELECT DISTINCT c.id, c.name, c.school_id, c.grade_level 
          FROM classes c
          JOIN class_enrollments ce ON ce.class_id = c.id
          WHERE c.is_active = true AND ce.is_active = true
        `;
        
        console.log(`Creating weekly leaderboards for ${activeClasses.length} active classes...`);
        
        for (const classInfo of activeClasses) {
          // Create weekly XP leaderboard for each class
          const leaderboardId = await this.createLeaderboard({
            type: 'weekly_xp',
            scope: 'class',
            classId: classInfo.id,
            schoolId: classInfo.school_id, // FIX: Pass required school_id
            gradeLevel: classInfo.grade_level, // FIX: Pass required grade_level
            periodType: 'weekly',
            periodStart: startOfWeek,
            periodEnd: endOfWeek
          });
          
          // Update the leaderboard with initial entries (will be empty since XP was reset)
          // This creates the structure ready for the week
          await this.updateLeaderboardEntries(leaderboardId);
        }
        
        // 5. Create school-level weekly XP leaderboards
        const activeSchools = await sql`
          SELECT DISTINCT s.id, s.name 
          FROM schools s
          JOIN classes c ON c.school_id = s.id
          JOIN class_enrollments ce ON ce.class_id = c.id
          WHERE s.is_active = true AND c.is_active = true AND ce.is_active = true
        `;
        
        console.log(`Creating school leaderboards for ${activeSchools.length} schools...`);
        
        for (const school of activeSchools) {
          const leaderboardId = await this.createLeaderboard({
            type: 'weekly_xp',
            scope: 'school',
            schoolId: school.id,
            periodType: 'weekly',
            periodStart: startOfWeek,
            periodEnd: endOfWeek
          });
          
          await this.updateLeaderboardEntries(leaderboardId);
        }
        
        // 6. Create grade-level weekly XP leaderboards
        const activeGrades = await sql`
          SELECT DISTINCT sp.grade 
          FROM student_profiles sp
          JOIN students s ON s.id = sp.student_id
          JOIN class_enrollments ce ON ce.student_id = s.id
          WHERE ce.is_active = true AND sp.grade IS NOT NULL
        `;
        
        console.log(`Creating grade leaderboards for ${activeGrades.length} grade levels...`);
        
        for (const grade of activeGrades) {
          const leaderboardId = await this.createLeaderboard({
            type: 'weekly_xp',
            scope: 'grade',
            gradeLevel: grade.grade,
            periodType: 'weekly',
            periodStart: startOfWeek,
            periodEnd: endOfWeek
          });
          
          await this.updateLeaderboardEntries(leaderboardId);
        }
        
        console.log('✅ Weekly leaderboard reset completed successfully!');
      });
      
    } catch (error) {
      console.error('❌ Error during weekly leaderboard reset:', error);
      throw error;
    }
  }

  // Daily leaderboard updates - refresh current week's leaderboards
  async updateCurrentWeekLeaderboards(): Promise<void> {
    console.log('📊 Updating current week leaderboards...');
    
    try {
      // Get all current weekly leaderboards
      const currentLeaderboards = await this.sql`
        SELECT id FROM leaderboards 
        WHERE is_current = true 
          AND is_active = true 
          AND period_type = 'weekly'
          AND period_end >= CURRENT_DATE
      `;
      
      console.log(`Updating ${currentLeaderboards.length} current weekly leaderboards...`);
      
      // Update each leaderboard with current data
      for (const leaderboard of currentLeaderboards) {
        await this.updateLeaderboardEntries(leaderboard.id);
      }
      
      console.log('✅ Current week leaderboards updated successfully!');
      
    } catch (error) {
      console.error('❌ Error updating current week leaderboards:', error);
      throw error;
    }
  }

  // Create monthly leaderboards (accuracy, challenge completion, etc.)
  async createMonthlyLeaderboards(): Promise<void> {
    console.log('📅 Creating monthly leaderboards...');
    
    try {
      // Get current month dates
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      // Get all active classes for monthly leaderboards
      const activeClasses = await this.sql`
        SELECT DISTINCT c.id, c.name, c.school_id, c.grade_level 
        FROM classes c
        JOIN class_enrollments ce ON ce.class_id = c.id
        WHERE c.is_active = true AND ce.is_active = true
      `;
      
      // Create monthly accuracy leaderboards for each class
      for (const classInfo of activeClasses) {
        const monthlyAccuracyId = await this.createLeaderboard({
          type: 'monthly_accuracy',
          scope: 'class',
          classId: classInfo.id,
          periodType: 'monthly',
          periodStart: startOfMonth,
          periodEnd: endOfMonth
        });
        
        await this.updateLeaderboardEntries(monthlyAccuracyId);
        
        // Create challenge completion leaderboard
        const challengeCompletionId = await this.createLeaderboard({
          type: 'challenge_completion',
          scope: 'class',
          classId: classInfo.id,
          periodType: 'monthly',
          periodStart: startOfMonth,
          periodEnd: endOfMonth
        });
        
        await this.updateLeaderboardEntries(challengeCompletionId);
      }
      
      console.log('✅ Monthly leaderboards created successfully!');
      
    } catch (error) {
      console.error('❌ Error creating monthly leaderboards:', error);
      throw error;
    }
  }

  // Reset weekly XP for all students
  async resetWeeklyXP() {
    await this.sql`
      UPDATE student_xp SET weekly_xp = 0, updated_at = CURRENT_TIMESTAMP
    `;
    console.log('✅ Weekly XP reset for all students');
  }

  // Get XP statistics for dashboard
  async getXPStats(studentId: number, days: number = 7) {
    const stats = await this.sql`
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_earned,
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_spent,
        AVG(CASE WHEN amount > 0 THEN amount ELSE NULL END) as avg_earning
      FROM xp_transactions 
      WHERE student_id = ${studentId} 
        AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
    `;

    const dailyStats = await this.sql`
      SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as earned,
        COUNT(*) as transactions
      FROM xp_transactions 
      WHERE student_id = ${studentId} 
        AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    return {
      summary: stats[0] || { total_transactions: 0, total_earned: 0, total_spent: 0, avg_earning: 0 },
      daily: dailyStats
    };
  }

  // Helper method to calculate level from total XP
  private calculateLevel(totalXP: number): number {
    const thresholds = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 15000, 30000];
    for (let level = thresholds.length - 1; level >= 0; level--) {
      if (totalXP >= thresholds[level]) {
        return level + 1;
      }
    }
    return 1;
  }

  // BADGE SYSTEM METHODS

  // Create a badge definition
  async createBadgeDefinition(badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'achievement' | 'mastery' | 'streak' | 'social' | 'special';
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    xpReward: number;
    criteria: any;
    targetRole: 'student' | 'teacher' | 'parent';
    gradeLevel?: string;
    subject?: string;
    isSecret?: boolean;
    displayOrder?: number;
  }): Promise<void> {
    await this.sql`
      INSERT INTO badge_definitions (
        id, name, description, icon, category, tier, xp_reward,
        criteria, target_role, grade_level, subject, is_secret, display_order
      ) VALUES (
        ${badge.id}, ${badge.name}, ${badge.description}, ${badge.icon},
        ${badge.category}, ${badge.tier}, ${badge.xpReward},
        ${JSON.stringify(badge.criteria)}, ${badge.targetRole},
        ${badge.gradeLevel || null}, ${badge.subject || null},
        ${badge.isSecret || false}, ${badge.displayOrder || 0}
      )
    `;
  }

  // Get all badge definitions (optionally filtered)
  async getBadgeDefinitions(filters?: {
    category?: string;
    targetRole?: string;
    gradeLevel?: string;
    subject?: string;
    includeSecret?: boolean;
  }) {
    // Build WHERE conditions and parameters programmatically for safe SQL construction
    const conditions: string[] = ['is_active = true'];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters) {
      if (filters.category) {
        conditions.push(`category = $${paramIndex++}`);
        params.push(filters.category);
      }
      if (filters.targetRole) {
        conditions.push(`target_role = $${paramIndex++}`);
        params.push(filters.targetRole);
      }
      if (filters.gradeLevel) {
        conditions.push(`(grade_level IS NULL OR grade_level = $${paramIndex++})`);
        params.push(filters.gradeLevel);
      }
      if (filters.subject) {
        conditions.push(`(subject IS NULL OR subject = $${paramIndex++})`);
        params.push(filters.subject);
      }
      if (!filters.includeSecret) {
        conditions.push('is_secret = false');
      }
    }

    // Build and execute single safe SQL query
    const whereClause = conditions.join(' AND ');
    const query = `
      SELECT * FROM badge_definitions 
      WHERE ${whereClause}
      ORDER BY display_order, created_at
    `;
    
    return await this.sql.unsafe(query, params);
  }

  // Get a specific badge definition
  async getBadgeDefinition(badgeId: string) {
    const [badge] = await this.sql`
      SELECT * FROM badge_definitions WHERE id = ${badgeId} AND is_active = true
    `;
    return badge || null;
  }

  // Award a badge to a student
  async awardBadge(studentId: number, badgeId: string, metadata?: any, connection?: any): Promise<boolean> {
    try {
      const sql = connection || this.sql;
      
      // First check if badge definition exists
      const badge = await this.getBadgeDefinition(badgeId);
      if (!badge) {
        throw new Error(`Badge definition not found: ${badgeId}`);
      }

      // Atomic insert with conflict handling to prevent race conditions
      // ON CONFLICT DO NOTHING ensures safe concurrent execution
      const result = await sql`
        INSERT INTO student_badges (
          student_id, badge_id, progress, is_earned, earned_at, metadata
        ) VALUES (
          ${studentId}, ${badgeId}, 100, true, CURRENT_TIMESTAMP, ${JSON.stringify(metadata || {})}
        )
        ON CONFLICT (student_id, badge_id) DO NOTHING
        RETURNING id
      `;

      // Check if badge was actually inserted (new award) or already existed
      const wasNewlyAwarded = result.length > 0;
      
      if (!wasNewlyAwarded) {
        return false; // Badge already awarded
      }

      // Award XP if badge has reward (only for newly awarded badges)
      if (badge.xp_reward > 0) {
        const idempotencyKey = `badge_${badgeId}_student_${studentId}_xp`;
        await this.earnXP(studentId, {
          type: 'earned',
          amount: badge.xp_reward,
          source: 'badge_reward',
          description: `Badge earned: ${badge.name}`,
          metadata: { badgeId },
          idempotencyKey
        }, connection);
      }

      return true;
    } catch (error) {
      console.error('Error awarding badge:', error);
      return false;
    }
  }

  // Update badge progress (for progressive badges)
  async updateBadgeProgress(studentId: number, badgeId: string, progress: number, metadata?: any): Promise<void> {
    // First ensure student has a badge progress record
    await this.sql`
      INSERT INTO student_badges (student_id, badge_id, progress, metadata)
      VALUES (${studentId}, ${badgeId}, ${progress}, ${JSON.stringify(metadata || {})})
      ON CONFLICT (student_id, badge_id) 
      DO UPDATE SET 
        progress = ${progress},
        metadata = ${JSON.stringify(metadata || {})},
        created_at = CURRENT_TIMESTAMP
    `;

    // If progress reaches 100 and not already earned, award the badge
    if (progress >= 100) {
      const [existing] = await this.sql`
        SELECT is_earned FROM student_badges 
        WHERE student_id = ${studentId} AND badge_id = ${badgeId}
      `;

      if (existing && !existing.is_earned) {
        await this.sql`
          UPDATE student_badges 
          SET is_earned = true, earned_at = CURRENT_TIMESTAMP
          WHERE student_id = ${studentId} AND badge_id = ${badgeId}
        `;

        // Award XP reward with idempotency protection
        const badge = await this.getBadgeDefinition(badgeId);
        if (badge?.xp_reward > 0) {
          const idempotencyKey = `badge_progress_${badgeId}_student_${studentId}_xp`;
          await this.earnXP(studentId, {
            type: 'earned',
            amount: badge.xp_reward,
            source: 'badge_reward',
            description: `Badge earned: ${badge.name}`,
            metadata: { badgeId },
            idempotencyKey
          });
        }
      }
    }
  }

  // Get student's badges
  async getStudentBadges(studentId: number, includeProgress: boolean = true) {
    if (includeProgress) {
      return await this.sql`
        SELECT 
          sb.*,
          bd.name, bd.description, bd.icon, bd.category, bd.tier,
          bd.xp_reward, bd.is_secret, bd.display_order
        FROM student_badges sb
        JOIN badge_definitions bd ON bd.id = sb.badge_id
        WHERE sb.student_id = ${studentId}
        ORDER BY sb.earned_at DESC NULLS LAST, bd.display_order
      `;
    } else {
      return await this.sql`
        SELECT 
          sb.*,
          bd.name, bd.description, bd.icon, bd.category, bd.tier,
          bd.xp_reward, bd.is_secret, bd.display_order
        FROM student_badges sb
        JOIN badge_definitions bd ON bd.id = sb.badge_id
        WHERE sb.student_id = ${studentId} AND sb.is_earned = true
        ORDER BY sb.earned_at DESC, bd.display_order
      `;
    }
  }

  // Get badge progress for a specific badge
  async getBadgeProgress(studentId: number, badgeId: string) {
    const [progress] = await this.sql`
      SELECT * FROM student_badges 
      WHERE student_id = ${studentId} AND badge_id = ${badgeId}
    `;
    return progress || null;
  }

  // Check and award badges based on student activity
  async checkAndAwardBadges(studentId: number, context: {
    action: 'problem_completed' | 'streak_achieved' | 'level_up' | 'topic_mastered';
    metadata?: any;
  }): Promise<string[]> {
    const awardedBadges: string[] = [];

    // Get all relevant badge definitions for this student
    const badges = await this.getBadgeDefinitions({
      targetRole: 'student',
      includeSecret: true
    });

    for (const badge of badges) {
      try {
        const shouldAward = await this.evaluateBadgeCriteria(studentId, badge, context);
        if (shouldAward) {
          const awarded = await this.awardBadge(studentId, badge.id, context.metadata);
          if (awarded) {
            awardedBadges.push(badge.id);
          }
        }
      } catch (error) {
        console.error(`Error evaluating badge ${badge.id}:`, error);
      }
    }

    return awardedBadges;
  }

  // Evaluate badge criteria (this is where badge logic lives)
  private async evaluateBadgeCriteria(studentId: number, badge: any, context: any): Promise<boolean> {
    const criteria = badge.criteria;

    // Check if student already has this badge
    const existing = await this.getBadgeProgress(studentId, badge.id);
    if (existing?.is_earned) {
      return false;
    }

    switch (criteria.type) {
      case 'first_problem':
        return context.action === 'problem_completed';

      case 'streak':
        if (context.action === 'streak_achieved') {
          return context.metadata?.days >= criteria.days;
        }
        // Also check current streak from database
        const streakData = await this.sql`
          SELECT COUNT(*) as streak_days
          FROM daily_activity 
          WHERE student_id = ${studentId} 
          AND activity_date >= CURRENT_DATE - INTERVAL '${criteria.days} days'
          AND problems_completed > 0
        `;
        return streakData[0]?.streak_days >= criteria.days;

      case 'problems_completed':
        const problemCount = await this.sql`
          SELECT COUNT(*) as total_problems
          FROM problem_attempts 
          WHERE student_id = ${studentId} AND is_correct = true
        `;
        return problemCount[0]?.total_problems >= criteria.count;

      case 'topic_mastery':
        if (context.action === 'topic_mastered') {
          return context.metadata?.topic === criteria.topic && 
                 context.metadata?.subject === criteria.subject;
        }
        // Check mastery level from database
        const mastery = await this.sql`
          SELECT mastery_level FROM topic_mastery 
          WHERE student_id = ${studentId} 
          AND subject = ${criteria.subject} 
          AND topic = ${criteria.topic}
        `;
        return mastery[0]?.mastery_level >= (criteria.level || 80);

      case 'level_reached':
        if (context.action === 'level_up') {
          return context.metadata?.newLevel >= criteria.level;
        }
        // Check current level
        const xpData = await this.getStudentXP(studentId);
        return xpData?.level >= criteria.level;

      case 'perfect_score':
        // Check for recent perfect scores
        const perfectScores = await this.sql`
          SELECT COUNT(*) as perfect_count
          FROM problem_attempts 
          WHERE student_id = ${studentId} 
          AND is_correct = true 
          AND hints_used = 0
          AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        `;
        return perfectScores[0]?.perfect_count >= (criteria.count || 1);

      default:
        return false;
    }
  }

  // CHALLENGE SYSTEM METHODS

  // Create a new challenge
  async createChallenge(challenge: {
    title: string;
    description: string;
    type: 'system' | 'teacher_created' | 'school_wide' | 'class_specific';
    startDate: Date;
    endDate: Date;
    targetValue: number;
    metric: 'problems_completed' | 'accuracy_improvement' | 'streak_days' | 'time_spent';
    xpReward?: number;
    badgeReward?: string;
    gradeLevel?: string;
    subject?: string;
    schoolId?: number;
    classId?: number;
    createdBy?: number;
    maxParticipants?: number;
  }): Promise<number> {
    const [result] = await this.sql`
      INSERT INTO challenges (
        title, description, type, start_date, end_date, target_value, metric,
        xp_reward, badge_reward, grade_level, subject, school_id, class_id,
        created_by, max_participants
      ) VALUES (
        ${challenge.title}, ${challenge.description}, ${challenge.type},
        ${challenge.startDate.toISOString()}, ${challenge.endDate.toISOString()},
        ${challenge.targetValue}, ${challenge.metric}, ${challenge.xpReward || 0},
        ${challenge.badgeReward || null}, ${challenge.gradeLevel || null},
        ${challenge.subject || null}, ${challenge.schoolId || null},
        ${challenge.classId || null}, ${challenge.createdBy || null},
        ${challenge.maxParticipants || null}
      ) RETURNING id
    `;
    return result.id;
  }

  // Get challenges with filtering
  async getChallenges(filters?: {
    type?: string;
    isActive?: boolean;
    gradeLevel?: string;
    subject?: string;
    schoolId?: number;
    classId?: number;
    includeExpired?: boolean;
  }) {
    let whereConditions = ['1=1'];
    let params: any[] = [];

    if (filters?.type) {
      whereConditions.push(`type = $${params.length + 1}`);
      params.push(filters.type);
    }

    if (filters?.isActive !== undefined) {
      whereConditions.push(`is_active = $${params.length + 1}`);
      params.push(filters.isActive);
    }

    if (filters?.gradeLevel) {
      whereConditions.push(`(grade_level IS NULL OR grade_level = $${params.length + 1})`);
      params.push(filters.gradeLevel);
    }

    if (filters?.subject) {
      whereConditions.push(`(subject IS NULL OR subject = $${params.length + 1})`);
      params.push(filters.subject);
    }

    if (filters?.schoolId) {
      whereConditions.push(`(school_id IS NULL OR school_id = $${params.length + 1})`);
      params.push(filters.schoolId);
    }

    if (filters?.classId) {
      whereConditions.push(`(class_id IS NULL OR class_id = $${params.length + 1})`);
      params.push(filters.classId);
    }

    if (!filters?.includeExpired) {
      whereConditions.push('end_date >= CURRENT_TIMESTAMP');
    }

    const whereClause = whereConditions.join(' AND ');
    
    return await this.sql.unsafe(`
      SELECT * FROM challenges 
      WHERE ${whereClause}
      ORDER BY start_date DESC
    `, params);
  }

  // Get a specific challenge with participant count
  async getChallenge(challengeId: number) {
    const [challenge] = await this.sql`
      SELECT 
        c.*,
        COUNT(cp.id) as participant_count
      FROM challenges c
      LEFT JOIN challenge_participation cp ON cp.challenge_id = c.id
      WHERE c.id = ${challengeId}
      GROUP BY c.id
    `;
    return challenge || null;
  }

  // Join a challenge with atomic concurrency safety
  async joinChallenge(challengeId: number, studentId: number): Promise<boolean> {
    try {
      return await this.sql.begin(async (sql) => {
        // CRITICAL FIX: Lock challenge row to prevent race conditions
        const [challenge] = await sql`
          SELECT * FROM challenges 
          WHERE id = ${challengeId}
          FOR UPDATE
        `;

        if (!challenge || !challenge.is_active) {
          return false;
        }

        // Check if challenge has started and not ended
        const now = new Date();
        const startDate = new Date(challenge.start_date);
        const endDate = new Date(challenge.end_date);
        
        if (now < startDate || now > endDate) {
          return false;
        }

        // CRITICAL FIX: Atomic participant count check with row lock
        if (challenge.max_participants && challenge.current_participants >= challenge.max_participants) {
          return false;
        }

        // Check if student already joined (with transaction isolation)
        const [existing] = await sql`
          SELECT id FROM challenge_participation 
          WHERE challenge_id = ${challengeId} AND student_id = ${studentId}
        `;

        if (existing) {
          return false; // Already joined
        }

        // Calculate starting baseline if needed
        let startingBaseline = 0;
        if (challenge.metric === 'accuracy_improvement') {
          const [stats] = await sql`
            SELECT AVG(CASE WHEN is_correct THEN 100 ELSE 0 END) as avg_accuracy
            FROM problem_attempts 
            WHERE student_id = ${studentId} 
            AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
          `;
          startingBaseline = Math.round(stats?.avg_accuracy || 0);
        }

        // CRITICAL FIX: Atomic enrollment with proper error handling
        try {
          // Insert participation record
          await sql`
            INSERT INTO challenge_participation (
              challenge_id, student_id, starting_baseline
            ) VALUES (
              ${challengeId}, ${studentId}, ${startingBaseline}
            )
          `;

          // Update participant count atomically
          await sql`
            UPDATE challenges 
            SET current_participants = current_participants + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${challengeId}
          `;

          console.log(`Student ${studentId} successfully joined challenge ${challengeId}`);
          return true;

        } catch (dbError: any) {
          // Handle unique constraint violations gracefully
          if (dbError.code === '23505') { // PostgreSQL unique violation
            console.log(`Student ${studentId} already joined challenge ${challengeId} (concurrent enrollment detected)`);
            return false;
          }
          throw dbError; // Re-throw other errors to trigger transaction rollback
        }
      });

    } catch (error) {
      console.error(`Error joining challenge ${challengeId} for student ${studentId}:`, error);
      return false;
    }
  }

  // Update challenge progress with atomic completion flow
  async updateChallengeProgress(challengeId: number, studentId: number, newValue: number, context?: any): Promise<void> {
    await this.sql.begin(async (sql) => {
      // Get current participation with row lock to prevent race conditions
      const [participation] = await sql`
        SELECT * FROM challenge_participation 
        WHERE challenge_id = ${challengeId} AND student_id = ${studentId}
        FOR UPDATE
      `;

      if (!participation || participation.is_completed) {
        return; // Not participating or already completed
      }

      // Get challenge details
      const challenge = await this.getChallenge(challengeId);
      if (!challenge) return;

      // Only update if newValue is actually higher (prevents regression)
      if (newValue <= participation.current_value) {
        return;
      }

      // Update progress history
      const progressHistory = participation.progress_history || [];
      progressHistory.push({
        date: new Date().toISOString().split('T')[0],
        value: newValue,
        context
      });

      // Check if challenge is completed
      const isCompleted = newValue >= challenge.target_value;

      // Update participation record atomically
      await sql`
        UPDATE challenge_participation 
        SET 
          current_value = ${newValue},
          progress_history = ${JSON.stringify(progressHistory)},
          is_completed = ${isCompleted},
          completed_at = ${isCompleted ? new Date().toISOString() : null},
          updated_at = CURRENT_TIMESTAMP
        WHERE challenge_id = ${challengeId} AND student_id = ${studentId}
      `;

      // CRITICAL FIX: Award rewards atomically if challenge just completed
      // Use OR logic to allow separate XP and badge awards
      if (isCompleted && (!participation.xp_awarded || !participation.badge_awarded)) {
        await this.completeChallenge(challengeId, studentId, sql);
      }
    });
  }

  // Complete a challenge and award rewards atomically
  private async completeChallenge(challengeId: number, studentId: number, sql?: any): Promise<void> {
    const connection = sql || this.sql;
    
    const challenge = await this.getChallenge(challengeId);
    if (!challenge) return;

    try {
      // CRITICAL FIX: Atomic reward distribution with proper single-award semantics
      
      // Award XP if eligible - use idempotent UPDATE...WHERE pattern
      if (challenge.xp_reward > 0) {
        const [xpUpdate] = await connection`
          UPDATE challenge_participation 
          SET xp_awarded = true, updated_at = CURRENT_TIMESTAMP
          WHERE challenge_id = ${challengeId} AND student_id = ${studentId} AND xp_awarded = false
          RETURNING id
        `;

        // Only award XP if we successfully claimed the award
        if (xpUpdate) {
          const idempotencyKey = `challenge_${challengeId}_student_${studentId}_xp`;
          await this.earnXP(studentId, {
            type: 'earned',
            amount: challenge.xp_reward,
            source: 'challenge_completion',
            description: `Challenge completed: ${challenge.title}`,
            metadata: { challengeId },
            idempotencyKey
          }, connection);
        }
      }

      // Award badge if eligible - use idempotent UPDATE...WHERE pattern
      if (challenge.badge_reward) {
        const [badgeUpdate] = await connection`
          UPDATE challenge_participation 
          SET badge_awarded = true, updated_at = CURRENT_TIMESTAMP
          WHERE challenge_id = ${challengeId} AND student_id = ${studentId} AND badge_awarded = false
          RETURNING id
        `;

        // Only award badge if we successfully claimed the award
        if (badgeUpdate) {
          await this.awardBadge(studentId, challenge.badge_reward, {
            challengeId,
            challengeTitle: challenge.title
          }, connection);
        }
      }

      console.log(`Challenge ${challengeId} completed for student ${studentId}: XP=${challenge.xp_reward}, Badge=${challenge.badge_reward || 'none'}`);
      
    } catch (error) {
      console.error(`Error completing challenge ${challengeId} for student ${studentId}:`, error);
      throw error; // Re-throw to trigger transaction rollback
    }
  }

  // Get student's challenge participation
  async getStudentChallenges(studentId: number, includeCompleted: boolean = true) {
    let whereClause = 'cp.student_id = $1';
    let params = [studentId];

    if (!includeCompleted) {
      whereClause += ' AND cp.is_completed = false';
    }

    return await this.sql.unsafe(`
      SELECT 
        cp.*,
        c.title, c.description, c.type, c.start_date, c.end_date,
        c.target_value, c.metric, c.xp_reward, c.badge_reward,
        (cp.current_value::float / c.target_value * 100) as progress_percentage
      FROM challenge_participation cp
      JOIN challenges c ON c.id = cp.challenge_id
      WHERE ${whereClause}
      ORDER BY cp.joined_at DESC
    `, params);
  }

  // Get challenge leaderboard
  async getChallengeLeaderboard(challengeId: number, limit: number = 10) {
    return await this.sql`
      SELECT 
        cp.student_id,
        cp.current_value,
        cp.is_completed,
        cp.completed_at,
        sp.name as student_name,
        sp.grade,
        ROW_NUMBER() OVER (ORDER BY cp.current_value DESC, cp.completed_at ASC NULLS LAST) as rank
      FROM challenge_participation cp
      JOIN students s ON s.id = cp.student_id
      JOIN student_profiles sp ON sp.student_id = s.id
      WHERE cp.challenge_id = ${challengeId}
      ORDER BY cp.current_value DESC, cp.completed_at ASC NULLS LAST
      LIMIT ${limit}
    `;
  }

  // Helper method to calculate current streak for challenge tracking
  private async calculateCurrentStreak(studentId: number): Promise<number> {
    try {
      // Get daily activity for the past 30 days, ordered by date descending
      const activities = await this.sql`
        SELECT date, problems_completed 
        FROM daily_activity 
        WHERE student_id = ${studentId} 
        AND date >= CURRENT_DATE - INTERVAL '30 days'
        ORDER BY date DESC
      `;

      if (activities.length === 0) return 0;

      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      let currentDate = today;

      for (const activity of activities) {
        if (activity.date === currentDate && activity.problems_completed > 0) {
          streak++;
          // Move to previous day
          const prevDate = new Date(currentDate);
          prevDate.setDate(prevDate.getDate() - 1);
          currentDate = prevDate.toISOString().split('T')[0];
        } else if (activity.date === currentDate && activity.problems_completed === 0) {
          // Skip inactive days, but check if we should continue the streak from yesterday
          const prevDate = new Date(currentDate);
          prevDate.setDate(prevDate.getDate() - 1);
          currentDate = prevDate.toISOString().split('T')[0];
        } else {
          break; // Streak broken
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating current streak:', error);
      return 0;
    }
  }

  // Auto-update challenge progress based on student activity
  async autoUpdateChallengeProgress(studentId: number, activity: {
    type: 'problem_completed' | 'streak_updated' | 'time_spent';
    value: number;
    metadata?: any;
  }): Promise<void> {
    // Get active challenges for this student
    const challenges = await this.sql`
      SELECT cp.*, c.metric, c.target_value
      FROM challenge_participation cp
      JOIN challenges c ON c.id = cp.challenge_id
      WHERE cp.student_id = ${studentId} 
      AND cp.is_completed = false
      AND c.is_active = true
      AND c.end_date >= CURRENT_TIMESTAMP
    `;

    for (const participation of challenges) {
      let shouldUpdate = false;
      let newValue = participation.current_value;

      switch (participation.metric) {
        case 'problems_completed':
          if (activity.type === 'problem_completed') {
            newValue = participation.current_value + 1;
            shouldUpdate = true;
          }
          break;

        case 'streak_days':
          if (activity.type === 'streak_updated') {
            newValue = activity.value;
            shouldUpdate = true;
          }
          break;

        case 'time_spent':
          if (activity.type === 'time_spent') {
            newValue = participation.current_value + activity.value;
            shouldUpdate = true;
          }
          break;

        case 'accuracy_improvement':
          if (activity.type === 'problem_completed' && activity.metadata?.accuracy) {
            // Calculate improvement from baseline
            const improvement = activity.metadata.accuracy - participation.starting_baseline;
            if (improvement > participation.current_value) {
              newValue = improvement;
              shouldUpdate = true;
            }
          }
          break;
      }

      if (shouldUpdate) {
        await this.updateChallengeProgress(participation.challenge_id, studentId, newValue, activity.metadata);
      }
    }
  }

  // Create weekly system challenges (to be called by scheduled task)
  async createWeeklyChallenges(): Promise<void> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // CRITICAL FIX: Use advisory lock to prevent race conditions in challenge creation
    const weekKey = startOfWeek.getTime(); // Unique identifier for this week
    const lockId = weekKey % 2147483647; // Convert to PostgreSQL bigint range
    
    return await this.sql.begin(async (sql) => {
      // Acquire advisory lock for this week
      const [lockResult] = await sql`SELECT pg_try_advisory_xact_lock(${lockId}) as acquired`;
      
      if (!lockResult.acquired) {
        console.log('Another process is creating weekly challenges, skipping...');
        return; // Another process is already handling challenge creation
      }

      // Double-check if challenges already exist for this week (within lock)
      const [existing] = await sql`
        SELECT id FROM challenges 
        WHERE type = 'system' 
        AND start_date >= ${startOfWeek.toISOString()}
        AND start_date < ${endOfWeek.toISOString()}
      `;

      if (existing) {
        return; // Challenges already created for this week
      }

    // Create standard weekly challenges
    const weeklyCharges = [
      {
        title: 'Problem Solver Challenge',
        description: 'Complete 15 problems this week to earn bonus XP!',
        targetValue: 15,
        metric: 'problems_completed' as const,
        xpReward: 100
      },
      {
        title: 'Streak Master',
        description: 'Maintain a 5-day solving streak this week!',
        targetValue: 5,
        metric: 'streak_days' as const,
        xpReward: 150
      },
      {
        title: 'Speed Demon',
        description: 'Spend 2 hours practicing math this week!',
        targetValue: 120, // 120 minutes
        metric: 'time_spent' as const,
        xpReward: 75
      }
    ];

      for (const challenge of weeklyCharges) {
        await this.createChallenge({
          title: challenge.title,
          description: challenge.description,
          type: 'system',
          startDate: startOfWeek,
          endDate: endOfWeek,
          targetValue: challenge.targetValue,
          metric: challenge.metric,
          xpReward: challenge.xpReward
        });
      }
    }); // Close the transaction block properly
  }

  // Get curriculum documents for a specific grade level, subject, and optional topic
  async getCurriculumDocuments(gradeLevel: string, subject: string, topic?: string) {
    try {
      let query = db
        .select({
          id: schema.curriculumDocuments.id,
          title: schema.curriculumDocuments.title,
          description: schema.curriculumDocuments.description,
          gradeLevel: schema.curriculumDocuments.gradeLevel,
          subject: schema.curriculumDocuments.subject,
          topic: schema.curriculumDocuments.topic,
          extractedText: schema.curriculumDocuments.extractedText,
          aiSummary: schema.curriculumDocuments.aiSummary,
          keyWords: schema.curriculumDocuments.keyWords,
          difficulty: schema.curriculumDocuments.difficulty,
          contentType: schema.curriculumDocuments.contentType,
        })
        .from(schema.curriculumDocuments)
        .where(
          and(
            eq(schema.curriculumDocuments.gradeLevel, gradeLevel),
            eq(schema.curriculumDocuments.subject, subject),
            eq(schema.curriculumDocuments.isProcessed, true), // Only return processed documents
            eq(schema.curriculumDocuments.isActive, true) // Only return active documents
          )
        );

      // If topic is specified, add it to the filter
      if (topic) {
        query = query.where(
          and(
            eq(schema.curriculumDocuments.gradeLevel, gradeLevel),
            eq(schema.curriculumDocuments.subject, subject),
            eq(schema.curriculumDocuments.topic, topic),
            eq(schema.curriculumDocuments.isProcessed, true),
            eq(schema.curriculumDocuments.isActive, true)
          )
        );
      }

      const documents = await query.limit(10); // Limit to 10 most relevant documents
      
      return documents;
    } catch (error) {
      console.error('Error fetching curriculum documents:', error);
      return [];
    }
  }

  // Close database connection
  async close() {
    await this.sql.end();
  }
}

// Export storage instance for use in routes
export const storage = new DashboardStorage();