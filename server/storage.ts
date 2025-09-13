import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, or, gte, desc, isNull } from 'drizzle-orm';
import * as schema from '../shared/schema';

// Database connection and ORM setup
const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);
const db = drizzle(sql, { schema });

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
      await this.sql.unsafe(`
        UPDATE learning_sessions 
        SET ${setClause.join(', ')}
        WHERE id = $${values.length}
      `, values);
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
        await this.sql.unsafe(`
          UPDATE topic_mastery 
          SET ${setClause.join(', ')}
          WHERE id = $${values.length}
        `, values);
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

  // Close database connection
  async close() {
    await this.sql.end();
  }
}