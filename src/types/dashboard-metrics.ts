// Comprehensive metrics tracking for parent dashboard
export interface LearningSession {
  id: string;
  childId: string;
  subject: string;
  topic: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  problemsAttempted: number;
  problemsCompleted: number;
  correctAnswers: number;
  hintsUsed: number;
  avgAttemptsPerProblem: number;
  difficulty: 'easy' | 'medium' | 'hard';
  sessionType: 'practice' | 'test' | 'review';
}

export interface ProblemAttempt {
  id: string;
  sessionId: string;
  childId: string;
  subject: string;
  topic: string;
  problemId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  attempts: number;
  hintsUsed: number;
  timeSpent: number; // in seconds
  isCorrect: boolean;
  isCompleted: boolean;
  timestamp: Date;
  needsAIIntervention: boolean;
  skippedToFinalHint: boolean;
}

export interface TopicMastery {
  childId: string;
  subject: string;
  topic: string;
  totalProblems: number;
  completedProblems: number;
  accuracyRate: number; // percentage
  averageAttempts: number;
  averageHints: number;
  masteryLevel: 'novice' | 'developing' | 'proficient' | 'mastered';
  firstAttemptDate: Date;
  lastActivityDate: Date;
  timeSpent: number; // total minutes spent on topic
}

export interface DailyActivity {
  childId: string;
  date: string; // YYYY-MM-DD format
  totalTime: number; // minutes
  sessionsCount: number;
  topicsWorked: string[];
  problemsAttempted: number;
  problemsCompleted: number;
  accuracyRate: number;
}

export interface WeeklyEngagement {
  childId: string;
  weekStart: string; // YYYY-MM-DD format
  daysActive: number;
  totalTime: number;
  averageSessionDuration: number;
  engagementStreak: number;
  topicsProgressed: number;
}

export interface ParentGoal {
  id: string;
  childId: string;
  subject: string;
  title: string;
  description: string;
  targetDate: Date;
  targetMetric: 'accuracy' | 'completion' | 'time' | 'mastery';
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  createdAt: Date;
}

export interface ExamReadiness {
  childId: string;
  subject: string;
  examType: string; // 'common-entrance', 'sea', etc.
  overallScore: number; // 0-100
  topicScores: Record<string, number>;
  weakAreas: string[];
  strongAreas: string[];
  recommendedStudyTime: number; // hours per week
  estimatedReadinessDate: Date;
  lastUpdated: Date;
}

export interface Alert {
  id: string;
  childId: string;
  type: 'struggle' | 'engagement' | 'readiness' | 'goal' | 'milestone';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  actionRequired: boolean;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface Milestone {
  id: string;
  childId: string;
  type: 'topic_mastery' | 'accuracy_streak' | 'time_goal' | 'consistency';
  title: string;
  description: string;
  achievedAt: Date;
  badgeIcon: string;
  points: number;
}

// Dashboard summary interfaces
export interface EngagementMetrics {
  totalLearningTime: number; // this week
  averageSessionDuration: number;
  sessionsCompleted: number;
  daysActive: number;
  currentStreak: number;
  timePerTopic: Record<string, number>;
}

export interface ProgressMetrics {
  topicsCovered: string[];
  curriculumProgress: number; // percentage
  problemsAttempted: number;
  completionRate: number; // percentage
  recentAchievements: Milestone[];
}

export interface PerformanceMetrics {
  accuracyRate: number; // without hints
  improvementTrend: number; // percentage change
  weakestAreas: string[];
  strongestAreas: string[];
  difficultyProgression: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface AIInteractionMetrics {
  hintsPerSession: number;
  avgAttemptsBeforeCorrect: number;
  aiInterventionRate: number; // percentage of problems needing heavy AI help
  stepByStepEngagement: number; // percentage engaging with guided questions
}

export interface DashboardSummary {
  childId: string;
  subject: string;
  engagement: EngagementMetrics;
  progress: ProgressMetrics;
  performance: PerformanceMetrics;
  aiInteraction: AIInteractionMetrics;
  examReadiness: ExamReadiness;
  activeAlerts: Alert[];
  recentGoals: ParentGoal[];
  generatedAt: Date;
}