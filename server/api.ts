// Server-side API endpoints for dashboard data
// This is where all database operations should happen securely

import { DashboardStorage } from './storage';
import type { DashboardSummary } from '../src/types/dashboard-metrics';

// Create a single instance of storage service
const storage = new DashboardStorage();

export class DashboardAPI {
  
  // Calculate dashboard metrics server-side
  async generateDashboardSummary(childId: string, subject: string): Promise<DashboardSummary> {
    // Convert childId to number for database queries
    const studentId = parseInt(childId);
    
    try {
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
        storage.getChildLearningHistory(studentId, subject, 30),
        storage.getTopicMasteryData(studentId, subject),
        storage.getDailyActivityData(studentId, 30),
        storage.getActiveAlerts(studentId),
        storage.getRecentMilestones(studentId, 5),
        storage.getParentGoals(studentId, subject),
        storage.getExamReadiness(studentId, subject)
      ]);

      // Calculate metrics (server-side calculations)
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
    } catch (error) {
      console.error('Server-side dashboard generation error:', error);
      throw new Error('Failed to generate dashboard data');
    }
  }

  // Server-side metric calculations (moved from frontend)
  private calculateEngagementMetrics(sessions: any[], dailyActivity: any[]) {
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

  private calculateProgressMetrics(topicMastery: any[], milestones: any[]) {
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

  private calculatePerformanceMetrics(sessions: any[], topicMastery: any[]) {
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

  private calculateAIInteractionMetrics(sessions: any[]) {
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

  private generateDefaultExamReadiness(childId: string, subject: string) {
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
    const dates: string[] = [];
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

  private calculateEngagementStreak(dailyActivity: any[]): number {
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

  private calculateImprovementTrend(sessions: any[]): number {
    if (sessions.length < 2) return 0;

    // Split sessions into two periods
    const midpoint = Math.floor(sessions.length / 2);
    const recentSessions = sessions.slice(0, midpoint);
    const olderSessions = sessions.slice(midpoint);

    const recentAccuracy = this.calculateAverageAccuracy(recentSessions);
    const olderAccuracy = this.calculateAverageAccuracy(olderSessions);

    return olderAccuracy > 0 ? ((recentAccuracy - olderAccuracy) / olderAccuracy) * 100 : 0;
  }

  private calculateAverageAccuracy(sessions: any[]): number {
    if (sessions.length === 0) return 0;
    
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalAttempted = sessions.reduce((sum, s) => sum + s.problemsAttempted, 0);
    
    return totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;
  }

  private calculateDifficultyProgression(sessions: any[]): { easy: number; medium: number; hard: number } {
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

  // Learning session tracking methods (for instrumentation)
  async startLearningSession(studentId: number, subject: string, topic: string, sessionType: 'practice' | 'test' | 'review'): Promise<number> {
    return await storage.createLearningSession({
      studentId,
      subject,
      topic,
      startTime: new Date(),
      duration: 0,
      problemsAttempted: 0,
      problemsCompleted: 0,
      correctAnswers: 0,
      hintsUsed: 0,
      avgAttemptsPerProblem: 0,
      difficulty: 'easy',
      sessionType
    });
  }

  async endLearningSession(sessionId: number, duration: number, problemsAttempted: number, problemsCompleted: number, correctAnswers: number, hintsUsed: number) {
    const avgAttempts = problemsAttempted > 0 ? problemsAttempted / problemsCompleted : 0;
    await storage.updateLearningSession(sessionId, {
      endTime: new Date(),
      duration,
      problemsAttempted,
      problemsCompleted,
      correctAnswers,
      hintsUsed,
      avgAttemptsPerProblem: avgAttempts
    });
  }

  async recordProblemAttempt(sessionId: number, studentId: number, subject: string, topic: string, problemData: {
    problemId: string;
    difficulty: 'easy' | 'medium' | 'hard';
    attempts: number;
    hintsUsed: number;
    timeSpent: number;
    isCorrect: boolean;
    isCompleted: boolean;
    needsAIIntervention: boolean;
    skippedToFinalHint: boolean;
  }) {
    await storage.recordProblemAttempt({
      sessionId,
      studentId,
      subject,
      topic,
      ...problemData
    });
  }
}

// Export singleton instance
export const dashboardAPI = new DashboardAPI();