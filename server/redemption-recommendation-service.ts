// Point redemption recommendation engine
// Suggests appropriate rewards based on child progress, XP balance, and learning patterns

import { db } from './storage';
import * as schema from '../shared/schema';
import { eq, and, sql, desc, gte, lte } from 'drizzle-orm';

// Recommendation categories and scoring
interface RecommendationContext {
  studentId: number;
  currentXP: number;
  currentLevel: number;
  gradeLevel: string;
  recentSubjects: string[];
  strongSubjects: string[];
  challengingSubjects: string[];
  recentBadges: string[];
  weeklyXP: number;
  monthlyXP: number;
  parentGoals: any[];
  previousRedemptions: any[];
}

interface RewardRecommendation {
  id: string;
  name: string;
  description: string;
  category: 'educational' | 'creative' | 'physical' | 'social' | 'digital';
  xpCost: number;
  confidence: number; // 0-100 confidence in recommendation
  reasoning: string[];
  priority: 'high' | 'medium' | 'low';
  ageAppropriate: boolean;
  benefits: string[];
  parentGuidance: string;
}

// Base reward catalog with educational focus
const REWARD_CATALOG = {
  // Educational Rewards (Lower XP cost, high confidence)
  educational_book: {
    name: 'Educational Book Choice',
    description: 'Choose a book related to their favorite subject or reading level',
    category: 'educational' as const,
    baseXPCost: 150,
    benefits: ['Reinforces learning', 'Builds reading habit', 'Subject-specific knowledge'],
    ageRanges: {
      'infant': 100,
      'standard': 150,
      'form': 200
    }
  },
  
  science_experiment_kit: {
    name: 'Science Experiment Kit',
    description: 'Hands-on science kit for exploring concepts learned in class',
    category: 'educational' as const,
    baseXPCost: 300,
    benefits: ['Practical application', 'STEM engagement', 'Curiosity development'],
    ageRanges: {
      'infant': 200,
      'standard': 300,
      'form': 400
    }
  },
  
  math_puzzle_games: {
    name: 'Math Puzzle Games',
    description: 'Engaging math puzzles and brain teasers appropriate for grade level',
    category: 'educational' as const,
    baseXPCost: 200,
    benefits: ['Problem-solving skills', 'Mathematical thinking', 'Fun learning'],
    ageRanges: {
      'infant': 150,
      'standard': 200,
      'form': 250
    }
  },
  
  language_learning_app: {
    name: 'Premium Language Learning Access',
    description: 'Premium subscription to age-appropriate language learning platform',
    category: 'digital' as const,
    baseXPCost: 400,
    benefits: ['Global awareness', 'Communication skills', 'Cultural understanding'],
    ageRanges: {
      'infant': 300,
      'standard': 400,
      'form': 500
    }
  },
  
  // Creative Rewards
  art_supplies: {
    name: 'Art & Craft Supplies',
    description: 'Quality art materials for creative expression and projects',
    category: 'creative' as const,
    baseXPCost: 250,
    benefits: ['Creative expression', 'Fine motor skills', 'Artistic development'],
    ageRanges: {
      'infant': 200,
      'standard': 250,
      'form': 300
    }
  },
  
  music_lessons: {
    name: 'Music Lesson Session',
    description: 'Private or group music lesson for instrument of choice',
    category: 'creative' as const,
    baseXPCost: 500,
    benefits: ['Musical development', 'Discipline', 'Cultural appreciation'],
    ageRanges: {
      'infant': 400,
      'standard': 500,
      'form': 600
    }
  },
  
  // Physical Rewards
  sports_equipment: {
    name: 'Sports Equipment',
    description: 'Equipment for their favorite sport or physical activity',
    category: 'physical' as const,
    baseXPCost: 350,
    benefits: ['Physical fitness', 'Team building', 'Health habits'],
    ageRanges: {
      'infant': 250,
      'standard': 350,
      'form': 450
    }
  },
  
  outdoor_adventure: {
    name: 'Outdoor Adventure Day',
    description: 'Family day trip to nature park, zoo, or outdoor activity center',
    category: 'physical' as const,
    baseXPCost: 600,
    benefits: ['Family bonding', 'Nature appreciation', 'Physical activity'],
    ageRanges: {
      'infant': 500,
      'standard': 600,
      'form': 700
    }
  },
  
  // Social Rewards
  friend_activity: {
    name: 'Friend Activity Session',
    description: 'Special activity with friends (movie, bowling, mini golf)',
    category: 'social' as const,
    baseXPCost: 400,
    benefits: ['Social skills', 'Friendship building', 'Communication'],
    ageRanges: {
      'infant': 300,
      'standard': 400,
      'form': 500
    }
  },
  
  family_game_night: {
    name: 'Premium Family Game',
    description: 'New board game or family activity for quality time together',
    category: 'social' as const,
    baseXPCost: 300,
    benefits: ['Family bonding', 'Strategic thinking', 'Communication'],
    ageRanges: {
      'infant': 200,
      'standard': 300,
      'form': 400
    }
  },
  
  // Digital Rewards (Limited and educational)
  educational_app: {
    name: 'Premium Educational App',
    description: 'Subscription to high-quality educational app or platform',
    category: 'digital' as const,
    baseXPCost: 300,
    benefits: ['Technology skills', 'Interactive learning', 'Self-paced progress'],
    ageRanges: {
      'infant': 200,
      'standard': 300,
      'form': 400
    }
  },
  
  coding_course: {
    name: 'Junior Coding Course',
    description: 'Age-appropriate programming course or coding workshop',
    category: 'digital' as const,
    baseXPCost: 800,
    benefits: ['Problem-solving', 'Logical thinking', 'Future skills'],
    ageRanges: {
      'infant': 600,
      'standard': 800,
      'form': 1000
    }
  }
};

export class RedemptionRecommendationService {
  
  // Get personalized redemption recommendations
  async getRecommendations(studentId: number): Promise<RewardRecommendation[]> {
    try {
      const context = await this.buildRecommendationContext(studentId);
      const recommendations = await this.generateRecommendations(context);
      
      // Sort by confidence score and priority
      return recommendations
        .sort((a, b) => {
          if (a.priority === 'high' && b.priority !== 'high') return -1;
          if (b.priority === 'high' && a.priority !== 'high') return 1;
          return b.confidence - a.confidence;
        })
        .slice(0, 8); // Return top 8 recommendations
        
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getFallbackRecommendations();
    }
  }

  // Build recommendation context from student data
  private async buildRecommendationContext(studentId: number): Promise<RecommendationContext> {
    // Get student basic info
    const student = await db.select({
      gradeLevel: schema.students.gradeLevel,
      currentXP: schema.studentXP.totalXP,
      currentLevel: schema.studentXP.level,
      weeklyXP: schema.studentXP.weeklyXP,
    })
    .from(schema.students)
    .leftJoin(schema.studentXP, eq(schema.students.id, schema.studentXP.studentId))
    .where(eq(schema.students.id, studentId))
    .limit(1);

    if (!student[0]) throw new Error('Student not found');

    // Get recent learning sessions to identify subjects
    const recentSessions = await db.select({
      subject: schema.learningSessions.subject,
      problemsCompleted: schema.learningSessions.problemsCompleted,
      performanceScore: schema.progress.performanceScore,
    })
    .from(schema.learningSessions)
    .leftJoin(schema.progress, and(
      eq(schema.learningSessions.studentId, schema.progress.studentId),
      eq(schema.learningSessions.subject, schema.progress.subject)
    ))
    .where(eq(schema.learningSessions.studentId, studentId))
    .orderBy(desc(schema.learningSessions.startTime))
    .limit(20);

    // Get recent badges
    const recentBadges = await db.select({
      badgeId: schema.studentBadges.badgeId,
      earnedAt: schema.studentBadges.earnedAt
    })
    .from(schema.studentBadges)
    .where(eq(schema.studentBadges.studentId, studentId))
    .orderBy(desc(schema.studentBadges.earnedAt))
    .limit(10);

    // Get parent goals
    const parentGoals = await db.select()
      .from(schema.parentGoals)
      .where(eq(schema.parentGoals.studentId, studentId));

    // Get previous redemptions
    const previousRedemptions = await db.select({
      rewardId: schema.rewardRedemptions.rewardId,
      redeemedAt: schema.rewardRedemptions.redeemedAt
    })
    .from(schema.rewardRedemptions)
    .where(eq(schema.rewardRedemptions.studentId, studentId))
    .orderBy(desc(schema.rewardRedemptions.redeemedAt))
    .limit(20);

    // Analyze subject performance
    const subjectPerformance = this.analyzeSubjectPerformance(recentSessions);
    
    return {
      studentId,
      currentXP: student[0].currentXP || 0,
      currentLevel: student[0].currentLevel || 1,
      gradeLevel: student[0].gradeLevel || 'standard',
      weeklyXP: student[0].weeklyXP || 0,
      monthlyXP: student[0].weeklyXP * 4 || 0, // Approximate
      recentSubjects: subjectPerformance.recentSubjects,
      strongSubjects: subjectPerformance.strongSubjects,
      challengingSubjects: subjectPerformance.challengingSubjects,
      recentBadges: recentBadges.map(b => b.badgeId),
      parentGoals,
      previousRedemptions
    };
  }

  // Analyze subject performance patterns
  private analyzeSubjectPerformance(sessions: any[]): {
    recentSubjects: string[];
    strongSubjects: string[];
    challengingSubjects: string[];
  } {
    const subjectStats = new Map();
    
    sessions.forEach(session => {
      const subject = session.subject;
      if (!subjectStats.has(subject)) {
        subjectStats.set(subject, {
          sessions: 0,
          totalCompleted: 0,
          totalPerformance: 0
        });
      }
      
      const stats = subjectStats.get(subject);
      stats.sessions++;
      stats.totalCompleted += session.problemsCompleted || 0;
      stats.totalPerformance += Number(session.performanceScore || 0);
    });

    const recentSubjects = Array.from(subjectStats.keys()).slice(0, 3);
    const strongSubjects = [];
    const challengingSubjects = [];

    subjectStats.forEach((stats, subject) => {
      const avgPerformance = stats.totalPerformance / stats.sessions;
      if (avgPerformance > 80) {
        strongSubjects.push(subject);
      } else if (avgPerformance < 60) {
        challengingSubjects.push(subject);
      }
    });

    return { recentSubjects, strongSubjects, challengingSubjects };
  }

  // Generate personalized recommendations
  private async generateRecommendations(context: RecommendationContext): Promise<RewardRecommendation[]> {
    const recommendations: RewardRecommendation[] = [];
    
    for (const [rewardKey, rewardData] of Object.entries(REWARD_CATALOG)) {
      const recommendation = await this.evaluateReward(rewardKey, rewardData, context);
      if (recommendation.confidence > 30) { // Only include confident recommendations
        recommendations.push(recommendation);
      }
    }
    
    return recommendations;
  }

  // Evaluate individual reward for student
  private async evaluateReward(
    rewardKey: string, 
    rewardData: any, 
    context: RecommendationContext
  ): Promise<RewardRecommendation> {
    let confidence = 50; // Base confidence
    const reasoning: string[] = [];
    let priority: 'high' | 'medium' | 'low' = 'medium';
    
    // Age appropriateness
    const gradeCategory = this.getGradeCategory(context.gradeLevel);
    const xpCost = rewardData.ageRanges[gradeCategory] || rewardData.baseXPCost;
    const ageAppropriate = xpCost <= context.currentXP * 1.5; // Not more than 150% of current XP
    
    if (!ageAppropriate) {
      confidence -= 20;
    }

    // XP affordability scoring
    if (context.currentXP >= xpCost) {
      confidence += 20;
      reasoning.push('Student has sufficient XP for this reward');
    } else if (context.currentXP >= xpCost * 0.8) {
      confidence += 10;
      reasoning.push('Student is close to affording this reward');
    } else {
      confidence -= 15;
    }

    // Category-specific scoring
    switch (rewardData.category) {
      case 'educational':
        confidence += 15; // Always favor educational
        if (context.challengingSubjects.length > 0) {
          confidence += 10;
          reasoning.push('Educational rewards can help with challenging subjects');
        }
        if (context.weeklyXP > 200) {
          confidence += 10;
          priority = 'high';
          reasoning.push('High weekly XP indicates strong learning motivation');
        }
        break;
        
      case 'creative':
        if (context.recentBadges.some(badge => badge.includes('creative') || badge.includes('art'))) {
          confidence += 15;
          reasoning.push('Recent creative achievements suggest interest in this area');
        }
        if (context.currentLevel >= 5) {
          confidence += 10; // Creative rewards for more advanced learners
        }
        break;
        
      case 'physical':
        if (context.weeklyXP > 150) {
          confidence += 10;
          reasoning.push('Active learners benefit from physical rewards');
        }
        break;
        
      case 'social':
        if (context.currentLevel >= 3) {
          confidence += 12;
          reasoning.push('Social rewards are great motivators for engaged learners');
        }
        break;
        
      case 'digital':
        if (context.currentLevel >= 6) {
          confidence += 8; // Digital rewards for higher levels
        } else {
          confidence -= 10; // Reduce digital for younger/newer learners
        }
        break;
    }

    // Avoid recently redeemed rewards
    const recentlyRedeemed = context.previousRedemptions
      .some(redemption => redemption.rewardId === rewardKey);
    
    if (recentlyRedeemed) {
      confidence -= 25;
      reasoning.push('Alternative to recently redeemed rewards');
    }

    // Parent goals alignment
    const alignsWithGoals = context.parentGoals.some(goal => {
      return rewardData.benefits.some(benefit => 
        goal.description?.toLowerCase().includes(benefit.toLowerCase().split(' ')[0])
      );
    });
    
    if (alignsWithGoals) {
      confidence += 15;
      priority = 'high';
      reasoning.push('Aligns with parent-set learning goals');
    }

    // Generate parent guidance
    const parentGuidance = this.generateParentGuidance(rewardData, context, reasoning);
    
    return {
      id: rewardKey,
      name: rewardData.name,
      description: rewardData.description,
      category: rewardData.category,
      xpCost,
      confidence: Math.min(100, Math.max(0, confidence)),
      reasoning,
      priority,
      ageAppropriate,
      benefits: rewardData.benefits,
      parentGuidance
    };
  }

  // Generate parent guidance for reward choice
  private generateParentGuidance(rewardData: any, context: RecommendationContext, reasoning: string[]): string {
    const guidelines = [];
    
    if (rewardData.category === 'educational') {
      guidelines.push('Educational rewards reinforce learning and build positive associations with academic achievement.');
    }
    
    if (context.challengingSubjects.length > 0 && rewardData.category === 'educational') {
      guidelines.push(`Consider focusing on ${context.challengingSubjects.join(', ')} to support areas where ${context.studentId} needs extra encouragement.`);
    }
    
    if (rewardData.category === 'digital') {
      guidelines.push('Balance screen time with other activities. Consider setting time limits and ensuring content is educational.');
    }
    
    if (context.currentLevel < 3) {
      guidelines.push('For newer learners, smaller, more frequent rewards often work better than expensive items.');
    }
    
    if (context.weeklyXP < 50) {
      guidelines.push('Consider pairing this reward with goal-setting to increase weekly learning engagement.');
    }
    
    return guidelines.join(' ') || 'This reward supports your child\'s overall development and learning motivation.';
  }

  // Get grade category for pricing
  private getGradeCategory(gradeLevel: string): 'infant' | 'standard' | 'form' {
    if (gradeLevel?.toLowerCase().includes('infant')) return 'infant';
    if (gradeLevel?.toLowerCase().includes('form') || gradeLevel?.toLowerCase().includes('grade 9')) return 'form';
    return 'standard';
  }

  // Fallback recommendations if error occurs
  private getFallbackRecommendations(): RewardRecommendation[] {
    return [
      {
        id: 'educational_book',
        name: 'Educational Book Choice',
        description: 'Choose a book related to their favorite subject or reading level',
        category: 'educational',
        xpCost: 150,
        confidence: 70,
        reasoning: ['Always a good choice for any learner'],
        priority: 'medium',
        ageAppropriate: true,
        benefits: ['Reinforces learning', 'Builds reading habit'],
        parentGuidance: 'Books are excellent rewards that provide lasting value and encourage reading habits.'
      }
    ];
  }

  // Get redemption history for analytics
  async getRedemptionHistory(studentId: number): Promise<any[]> {
    return await db.select({
      rewardName: schema.rewardCatalog.name,
      xpCost: schema.rewardRedemptions.xpCost,
      redeemedAt: schema.rewardRedemptions.redeemedAt,
      status: schema.rewardRedemptions.status
    })
    .from(schema.rewardRedemptions)
    .leftJoin(schema.rewardCatalog, eq(schema.rewardRedemptions.rewardId, schema.rewardCatalog.id))
    .where(eq(schema.rewardRedemptions.studentId, studentId))
    .orderBy(desc(schema.rewardRedemptions.redeemedAt));
  }

  // Track recommendation performance
  async trackRecommendationChoice(studentId: number, recommendationId: string, chosen: boolean): Promise<void> {
    // This could be enhanced to track which recommendations are most effective
    // For now, we'll log the choice for future analytics
    console.log(`Recommendation tracking: Student ${studentId}, ${recommendationId}, chosen: ${chosen}`);
  }
}