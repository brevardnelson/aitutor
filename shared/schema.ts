import { pgTable, varchar, integer, timestamp, decimal, boolean, text, json } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table (extends the localStorage auth system)
export const users = pgTable('users', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email').notNull().unique(),
  fullName: varchar('full_name').notNull(),
  phone: varchar('phone'),
  role: varchar('role').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Children profiles
export const children = pgTable('children', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  parentId: varchar('parent_id').references(() => users.id),
  name: varchar('name').notNull(),
  age: integer('age').notNull(),
  grade: varchar('grade').notNull(),
  targetExam: varchar('target_exam').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Subject enrollments
export const subjectEnrollments = pgTable('subject_enrollments', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar('child_id').references(() => children.id),
  subject: varchar('subject').notNull(),
  enrolledAt: timestamp('enrolled_at').defaultNow(),
});

// Learning sessions
export const learningSessions = pgTable('learning_sessions', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar('child_id').references(() => children.id),
  subject: varchar('subject').notNull(),
  topic: varchar('topic').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  duration: integer('duration').notNull(), // in minutes
  problemsAttempted: integer('problems_attempted').default(0),
  problemsCompleted: integer('problems_completed').default(0),
  correctAnswers: integer('correct_answers').default(0),
  hintsUsed: integer('hints_used').default(0),
  avgAttemptsPerProblem: decimal('avg_attempts_per_problem').default('0'),
  difficulty: varchar('difficulty').notNull(), // 'easy', 'medium', 'hard'
  sessionType: varchar('session_type').notNull(), // 'practice', 'test', 'review'
  createdAt: timestamp('created_at').defaultNow(),
});

// Individual problem attempts
export const problemAttempts = pgTable('problem_attempts', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar('session_id').references(() => learningSessions.id),
  childId: varchar('child_id').references(() => children.id),
  subject: varchar('subject').notNull(),
  topic: varchar('topic').notNull(),
  problemId: varchar('problem_id').notNull(),
  difficulty: varchar('difficulty').notNull(),
  attempts: integer('attempts').notNull(),
  hintsUsed: integer('hints_used').default(0),
  timeSpent: integer('time_spent').notNull(), // in seconds
  isCorrect: boolean('is_correct').default(false),
  isCompleted: boolean('is_completed').default(false),
  needsAIIntervention: boolean('needs_ai_intervention').default(false),
  skippedToFinalHint: boolean('skipped_to_final_hint').default(false),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Topic mastery tracking
export const topicMastery = pgTable('topic_mastery', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar('child_id').references(() => children.id),
  subject: varchar('subject').notNull(),
  topic: varchar('topic').notNull(),
  totalProblems: integer('total_problems').default(0),
  completedProblems: integer('completed_problems').default(0),
  accuracyRate: decimal('accuracy_rate').default('0'), // percentage
  averageAttempts: decimal('average_attempts').default('0'),
  averageHints: decimal('average_hints').default('0'),
  masteryLevel: varchar('mastery_level').default('novice'), // 'novice', 'developing', 'proficient', 'mastered'
  firstAttemptDate: timestamp('first_attempt_date'),
  lastActivityDate: timestamp('last_activity_date'),
  timeSpent: integer('time_spent').default(0), // total minutes
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Daily activity summary
export const dailyActivity = pgTable('daily_activity', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar('child_id').references(() => children.id),
  date: varchar('date').notNull(), // YYYY-MM-DD format
  totalTime: integer('total_time').default(0), // minutes
  sessionsCount: integer('sessions_count').default(0),
  topicsWorked: json('topics_worked').$type<string[]>().default([]),
  problemsAttempted: integer('problems_attempted').default(0),
  problemsCompleted: integer('problems_completed').default(0),
  accuracyRate: decimal('accuracy_rate').default('0'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Weekly engagement summary
export const weeklyEngagement = pgTable('weekly_engagement', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar('child_id').references(() => children.id),
  weekStart: varchar('week_start').notNull(), // YYYY-MM-DD format
  daysActive: integer('days_active').default(0),
  totalTime: integer('total_time').default(0),
  averageSessionDuration: decimal('average_session_duration').default('0'),
  engagementStreak: integer('engagement_streak').default(0),
  topicsProgressed: integer('topics_progressed').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Parent-defined goals
export const parentGoals = pgTable('parent_goals', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar('child_id').references(() => children.id),
  subject: varchar('subject').notNull(),
  title: varchar('title').notNull(),
  description: text('description'),
  targetDate: timestamp('target_date').notNull(),
  targetMetric: varchar('target_metric').notNull(), // 'accuracy', 'completion', 'time', 'mastery'
  targetValue: decimal('target_value').notNull(),
  currentValue: decimal('current_value').default('0'),
  isCompleted: boolean('is_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Exam readiness tracking
export const examReadiness = pgTable('exam_readiness', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar('child_id').references(() => children.id),
  subject: varchar('subject').notNull(),
  examType: varchar('exam_type').notNull(),
  overallScore: decimal('overall_score').default('0'), // 0-100
  topicScores: json('topic_scores').$type<Record<string, number>>().default({}),
  weakAreas: json('weak_areas').$type<string[]>().default([]),
  strongAreas: json('strong_areas').$type<string[]>().default([]),
  recommendedStudyTime: integer('recommended_study_time').default(0), // hours per week
  estimatedReadinessDate: timestamp('estimated_readiness_date'),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

// Alerts for parents
export const alerts = pgTable('alerts', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar('child_id').references(() => children.id),
  type: varchar('type').notNull(), // 'struggle', 'engagement', 'readiness', 'goal', 'milestone'
  severity: varchar('severity').notNull(), // 'low', 'medium', 'high'
  title: varchar('title').notNull(),
  message: text('message').notNull(),
  actionRequired: boolean('action_required').default(false),
  isRead: boolean('is_read').default(false),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Milestones and achievements
export const milestones = pgTable('milestones', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar('child_id').references(() => children.id),
  type: varchar('type').notNull(), // 'topic_mastery', 'accuracy_streak', 'time_goal', 'consistency'
  title: varchar('title').notNull(),
  description: text('description'),
  badgeIcon: varchar('badge_icon').notNull(),
  points: integer('points').default(0),
  achievedAt: timestamp('achieved_at').defaultNow(),
});