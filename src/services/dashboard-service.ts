import type { 
  DashboardSummary,
  EngagementMetrics,
  ProgressMetrics,
  PerformanceMetrics,
  AIInteractionMetrics,
  LearningSession,
  TopicMastery,
  DailyActivity,
  Alert,
  Milestone,
  ParentGoal,
  ExamReadiness
} from '../types/dashboard-metrics';

// Mock storage class for now (will be replaced with actual database calls)
class MockDashboardStorage {
  // Mock methods that will be replaced with actual database calls
  async getChildLearningHistory(childId: string, subject: string, days: number = 30): Promise<LearningSession[]> {
    // This will be replaced with actual database calls
    return [];
  }

  async getTopicMasteryData(childId: string, subject: string): Promise<TopicMastery[]> {
    return [];
  }

  async getDailyActivityData(childId: string, days: number = 30): Promise<DailyActivity[]> {
    return [];
  }

  async getActiveAlerts(childId: string): Promise<Alert[]> {
    return [];
  }

  async getRecentMilestones(childId: string, limit: number = 5): Promise<Milestone[]> {
    return [];
  }

  async getParentGoals(childId: string, subject: string): Promise<ParentGoal[]> {
    return [];
  }

  async getExamReadiness(childId: string, subject: string): Promise<ExamReadiness | null> {
    return null;
  }
}

export class DashboardService {
  private storage = new MockDashboardStorage();

  async generateDashboardSummary(childId: string, subject: string): Promise<DashboardSummary> {
    // Fetch all required data in parallel
    const [
      learningHistory,
      topicMastery,
      dailyActivity,
      activeAlerts,
      recentMilestones,
      parentGoals,
      examReadiness
    ] = await Promise.all([
      this.storage.getChildLearningHistory(childId, subject, 30),
      this.storage.getTopicMasteryData(childId, subject),
      this.storage.getDailyActivityData(childId, 30),
      this.storage.getActiveAlerts(childId),
      this.storage.getRecentMilestones(childId, 5),
      this.storage.getParentGoals(childId, subject),
      this.storage.getExamReadiness(childId, subject)
    ]);

    // Calculate metrics
    const engagement = this.calculateEngagementMetrics(learningHistory, dailyActivity);
    const progress = this.calculateProgressMetrics(topicMastery, recentMilestones);
    const performance = this.calculatePerformanceMetrics(learningHistory, topicMastery);
    const aiInteraction = this.calculateAIInteractionMetrics(learningHistory);

    return {
      childId,
      subject,
      engagement,
      progress,
      performance,
      aiInteraction,
      examReadiness: examReadiness || this.generateDefaultExamReadiness(childId, subject),
      activeAlerts,
      recentGoals: parentGoals.slice(0, 3),
      generatedAt: new Date()
    };
  }

  private calculateEngagementMetrics(sessions: LearningSession[], dailyActivity: DailyActivity[]): EngagementMetrics {
    // Calculate total learning time this week
    const thisWeek = this.getThisWeekDates();
    const thisWeekActivity = dailyActivity.filter(d => thisWeek.includes(d.date));
    const totalLearningTime = thisWeekActivity.reduce((sum, day) => sum + day.totalTime, 0);

    // Calculate average session duration
    const averageSessionDuration = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length 
      : 0;

    // Calculate sessions completed
    const sessionsCompleted = sessions.length;

    // Calculate days active
    const daysActive = thisWeekActivity.length;

    // Calculate current streak
    const currentStreak = this.calculateEngagementStreak(dailyActivity);

    // Calculate time per topic
    const timePerTopic: Record<string, number> = {};
    sessions.forEach(session => {
      if (!timePerTopic[session.topic]) {
        timePerTopic[session.topic] = 0;
      }
      timePerTopic[session.topic] += session.duration;
    });

    return {
      totalLearningTime,
      averageSessionDuration,
      sessionsCompleted,
      daysActive,
      currentStreak,
      timePerTopic
    };
  }

  private calculateProgressMetrics(topicMastery: TopicMastery[], milestones: Milestone[]): ProgressMetrics {
    // Topics covered
    const topicsCovered = topicMastery.map(tm => tm.topic);

    // Curriculum progress (simplified calculation)
    const totalTopics = this.getTotalTopicsForSubject(); // This would be subject-specific
    const curriculumProgress = (topicsCovered.length / totalTopics) * 100;

    // Problems attempted (sum across all topics)
    const problemsAttempted = topicMastery.reduce((sum, tm) => sum + tm.totalProblems, 0);

    // Completion rate
    const problemsCompleted = topicMastery.reduce((sum, tm) => sum + tm.completedProblems, 0);
    const completionRate = problemsAttempted > 0 ? (problemsCompleted / problemsAttempted) * 100 : 0;

    // Recent achievements
    const recentAchievements = milestones.slice(0, 3);

    return {
      topicsCovered,
      curriculumProgress,
      problemsAttempted,
      completionRate,
      recentAchievements
    };
  }

  private calculatePerformanceMetrics(sessions: LearningSession[], topicMastery: TopicMastery[]): PerformanceMetrics {
    // Overall accuracy rate (without hints)
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalAttempted = sessions.reduce((sum, s) => sum + s.problemsAttempted, 0);
    const accuracyRate = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

    // Improvement trend (compare last 7 days to previous 7 days)
    const improvementTrend = this.calculateImprovementTrend(sessions);

    // Weakest and strongest areas
    const sortedByAccuracy = topicMastery
      .filter(tm => tm.totalProblems > 5) // Only consider topics with significant practice
      .sort((a, b) => a.accuracyRate - b.accuracyRate);
    
    const weakestAreas = sortedByAccuracy.slice(0, 3).map(tm => tm.topic);
    const strongestAreas = sortedByAccuracy.slice(-3).reverse().map(tm => tm.topic);

    // Difficulty progression
    const difficultyProgression = this.calculateDifficultyProgression(sessions);

    return {
      accuracyRate,
      improvementTrend,
      weakestAreas,
      strongestAreas,
      difficultyProgression
    };
  }

  private calculateAIInteractionMetrics(sessions: LearningSession[]): AIInteractionMetrics {
    if (sessions.length === 0) {
      return {
        hintsPerSession: 0,
        avgAttemptsBeforeCorrect: 0,
        aiInterventionRate: 0,
        stepByStepEngagement: 0
      };
    }

    // Hints per session
    const totalHints = sessions.reduce((sum, s) => sum + s.hintsUsed, 0);
    const hintsPerSession = totalHints / sessions.length;

    // Average attempts before correct answer
    const avgAttemptsBeforeCorrect = sessions.reduce((sum, s) => sum + s.avgAttemptsPerProblem, 0) / sessions.length;

    // AI intervention rate (placeholder - would need more detailed data)
    const aiInterventionRate = hintsPerSession > 2 ? 60 : hintsPerSession > 1 ? 30 : 10;

    // Step-by-step engagement (placeholder - would need detailed interaction tracking)
    const stepByStepEngagement = Math.max(0, 100 - (hintsPerSession * 20));

    return {
      hintsPerSession,
      avgAttemptsBeforeCorrect,
      aiInterventionRate,
      stepByStepEngagement
    };
  }

  private generateDefaultExamReadiness(childId: string, subject: string): ExamReadiness {
    return {
      childId,
      subject,
      examType: 'common-entrance', // Default
      overallScore: 0,
      topicScores: {},
      weakAreas: [],
      strongAreas: [],
      recommendedStudyTime: 5, // Default 5 hours per week
      estimatedReadinessDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      lastUpdated: new Date()
    };
  }

  // Helper methods
  private getThisWeekDates(): string[] {
    const dates = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  }

  private calculateEngagementStreak(dailyActivity: DailyActivity[]): number {
    // Sort by date descending
    const sortedActivity = dailyActivity
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter(a => a.totalTime > 0); // Only count days with actual activity

    if (sortedActivity.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = today;

    for (const activity of sortedActivity) {
      if (activity.date === currentDate) {
        streak++;
        // Move to previous day
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        currentDate = prevDate.toISOString().split('T')[0];
      } else {
        break; // Streak broken
      }
    }

    return streak;
  }

  private calculateImprovementTrend(sessions: LearningSession[]): number {
    if (sessions.length < 2) return 0;

    // Split sessions into two periods
    const midpoint = Math.floor(sessions.length / 2);
    const recentSessions = sessions.slice(0, midpoint);
    const olderSessions = sessions.slice(midpoint);

    const recentAccuracy = this.calculateAverageAccuracy(recentSessions);
    const olderAccuracy = this.calculateAverageAccuracy(olderSessions);

    return olderAccuracy > 0 ? ((recentAccuracy - olderAccuracy) / olderAccuracy) * 100 : 0;
  }

  private calculateAverageAccuracy(sessions: LearningSession[]): number {
    if (sessions.length === 0) return 0;
    
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalAttempted = sessions.reduce((sum, s) => sum + s.problemsAttempted, 0);
    
    return totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;
  }

  private calculateDifficultyProgression(sessions: LearningSession[]): { easy: number; medium: number; hard: number } {
    const progression = { easy: 0, medium: 0, hard: 0 };
    
    sessions.forEach(session => {
      progression[session.difficulty] += session.problemsCompleted;
    });

    return progression;
  }

  private getTotalTopicsForSubject(): number {
    // This would be subject-specific and come from curriculum data
    return 20; // Placeholder
  }

  // Generate sample data for development
  generateSampleData(childId: string, subject: string): DashboardSummary {
    return {
      childId,
      subject,
      engagement: {
        totalLearningTime: 180, // 3 hours this week
        averageSessionDuration: 25,
        sessionsCompleted: 8,
        daysActive: 4,
        currentStreak: 3,
        timePerTopic: {
          'Fractions': 60,
          'Algebra Basics': 45,
          'Word Problems': 75
        }
      },
      progress: {
        topicsCovered: ['Fractions', 'Decimals', 'Percentages', 'Algebra Basics'],
        curriculumProgress: 35,
        problemsAttempted: 120,
        completionRate: 85,
        recentAchievements: [
          {
            id: '1',
            childId,
            type: 'topic_mastery',
            title: 'Fractions Master',
            description: 'Achieved 90% accuracy in fractions',
            achievedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            badgeIcon: '🏆',
            points: 100
          }
        ]
      },
      performance: {
        accuracyRate: 78,
        improvementTrend: 15, // 15% improvement
        weakestAreas: ['Word Problems', 'Mixed Numbers'],
        strongestAreas: ['Basic Addition', 'Fractions'],
        difficultyProgression: {
          easy: 45,
          medium: 20,
          hard: 5
        }
      },
      aiInteraction: {
        hintsPerSession: 3.2,
        avgAttemptsBeforeCorrect: 2.1,
        aiInterventionRate: 25,
        stepByStepEngagement: 75
      },
      examReadiness: {
        childId,
        subject,
        examType: 'common-entrance',
        overallScore: 65,
        topicScores: {
          'Fractions': 85,
          'Decimals': 70,
          'Percentages': 60,
          'Algebra': 45
        },
        weakAreas: ['Word Problems', 'Complex Algebra'],
        strongAreas: ['Basic Arithmetic', 'Fractions'],
        recommendedStudyTime: 4,
        estimatedReadinessDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        lastUpdated: new Date()
      },
      activeAlerts: [
        {
          id: '1',
          childId,
          type: 'struggle',
          severity: 'medium',
          title: 'Struggling with Word Problems',
          message: 'Your child has attempted 15 word problems but only completed 6. Consider reviewing problem-solving strategies.',
          actionRequired: true,
          isRead: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ],
      recentGoals: [
        {
          id: '1',
          childId,
          subject,
          title: 'Master Fractions by Month End',
          description: 'Achieve 85% accuracy in fraction problems',
          targetDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          targetMetric: 'accuracy',
          targetValue: 85,
          currentValue: 78,
          isCompleted: false,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
      ],
      generatedAt: new Date()
    };
  }
}

export const dashboardService = new DashboardService();