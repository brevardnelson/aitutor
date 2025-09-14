// Teacher Dashboard API Routes for Analytics and Class Management

import express, { Request, Response } from 'express';
import Joi from 'joi';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, count, sql, desc, asc, gte, lte, isNotNull } from 'drizzle-orm';
import * as schema from '../shared/schema';
import { authenticateToken, requireTeacherOrAbove } from './auth-middleware';

const router = express.Router();

// Database connection
const connectionString = process.env.DATABASE_URL!;
const sqlClient = postgres(connectionString);
const db = drizzle(sqlClient, { schema });

// Validation schemas
const dateRangeSchema = Joi.object({
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required(),
});

// GET /api/teacher/classes - Get teacher's classes
router.get('/classes', authenticateToken, requireTeacherOrAbove, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get classes where user is the teacher
    const teacherClasses = await db.select({
      id: schema.classes.id,
      name: schema.classes.name,
      subject: schema.classes.subject,
      gradeLevel: schema.classes.gradeLevel,
      maxStudents: schema.classes.maxStudents,
      isActive: schema.classes.isActive,
      schoolId: schema.classes.schoolId,
      schoolName: schema.schools.name,
      totalStudents: sql<number>`COALESCE(COUNT(${schema.classEnrollments.studentId}), 0)`,
    })
    .from(schema.classes)
    .leftJoin(schema.schools, eq(schema.classes.schoolId, schema.schools.id))
    .leftJoin(
      schema.classEnrollments, 
      and(
        eq(schema.classEnrollments.classId, schema.classes.id),
        eq(schema.classEnrollments.isActive, true)
      )
    )
    .where(
      and(
        eq(schema.classes.teacherId, req.user.id),
        eq(schema.classes.isActive, true)
      )
    )
    .groupBy(
      schema.classes.id,
      schema.classes.name,
      schema.classes.subject,
      schema.classes.gradeLevel,
      schema.classes.maxStudents,
      schema.classes.isActive,
      schema.classes.schoolId,
      schema.schools.name
    )
    .orderBy(asc(schema.classes.name));

    res.json({
      success: true,
      classes: teacherClasses,
    });
  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// GET /api/teacher/class/:classId/overview - Get class overview analytics
router.get('/class/:classId/overview', authenticateToken, requireTeacherOrAbove, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const classId = parseInt(req.params.classId);
    if (isNaN(classId)) {
      return res.status(400).json({ error: 'Invalid class ID' });
    }

    // Verify teacher owns this class
    const classInfo = await db.select()
      .from(schema.classes)
      .where(
        and(
          eq(schema.classes.id, classId),
          eq(schema.classes.teacherId, req.user.id),
          eq(schema.classes.isActive, true)
        )
      )
      .limit(1);

    if (classInfo.length === 0) {
      return res.status(403).json({ error: 'Access denied to this class' });
    }

    // Get date ranges for different periods
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get active students in class
    const activeStudents = await db.select({
      studentId: schema.classEnrollments.studentId,
      user: {
        id: schema.users.id,
        fullName: schema.users.fullName,
        email: schema.users.email,
      },
    })
    .from(schema.classEnrollments)
    .innerJoin(schema.students, eq(schema.classEnrollments.studentId, schema.students.id))
    .innerJoin(schema.users, eq(schema.students.userId, schema.users.id))
    .where(
      and(
        eq(schema.classEnrollments.classId, classId),
        eq(schema.classEnrollments.isActive, true)
      )
    );

    const studentIds = activeStudents.map(s => s.studentId);

    if (studentIds.length === 0) {
      return res.json({
        success: true,
        overview: {
          totalStudents: 0,
          activeStudentsToday: 0,
          activeStudentsThisWeek: 0,
          activeStudentsThisMonth: 0,
          avgTimePerStudent: 0,
          overallAccuracyRate: 0,
          topicsMostPracticed: [],
          curriculumCoverage: 0,
        },
      });
    }

    // Get daily activity stats
    const [todayActive] = await db.select({
      count: count()
    })
    .from(schema.dailyActivity)
    .where(
      and(
        sql`${schema.dailyActivity.studentId} = ANY(${studentIds})`,
        eq(schema.dailyActivity.date, today),
        sql`${schema.dailyActivity.totalTime} > 0`
      )
    );

    const [weekActive] = await db.select({
      count: count()
    })
    .from(schema.dailyActivity)
    .where(
      and(
        sql`${schema.dailyActivity.studentId} = ANY(${studentIds})`,
        gte(schema.dailyActivity.date, weekAgo),
        sql`${schema.dailyActivity.totalTime} > 0`
      )
    );

    const [monthActive] = await db.select({
      count: count()
    })
    .from(schema.dailyActivity)
    .where(
      and(
        sql`${schema.dailyActivity.studentId} = ANY(${studentIds})`,
        gte(schema.dailyActivity.date, monthAgo),
        sql`${schema.dailyActivity.totalTime} > 0`
      )
    );

    // Get average time and accuracy
    const [avgStats] = await db.select({
      avgTime: sql<number>`COALESCE(AVG(${schema.dailyActivity.totalTime}), 0)`,
      avgAccuracy: sql<number>`COALESCE(AVG(${schema.dailyActivity.accuracyRate}), 0)`,
    })
    .from(schema.dailyActivity)
    .where(
      and(
        sql`${schema.dailyActivity.studentId} = ANY(${studentIds})`,
        gte(schema.dailyActivity.date, weekAgo)
      )
    );

    // Get most practiced topics
    const topicStats = await db.select({
      topic: schema.learningSessions.topic,
      subject: schema.learningSessions.subject,
      sessionCount: count(),
      totalTime: sql<number>`SUM(${schema.learningSessions.duration})`,
    })
    .from(schema.learningSessions)
    .where(
      and(
        sql`${schema.learningSessions.studentId} = ANY(${studentIds})`,
        gte(schema.learningSessions.startTime, sql`NOW() - INTERVAL '7 days'`)
      )
    )
    .groupBy(schema.learningSessions.topic, schema.learningSessions.subject)
    .orderBy(desc(count()))
    .limit(5);

    // Get curriculum coverage (topics with any activity)
    const [curriculumStats] = await db.select({
      topicsWithActivity: sql<number>`COUNT(DISTINCT CONCAT(${schema.topicMastery.subject}, '::', ${schema.topicMastery.topic}))`,
    })
    .from(schema.topicMastery)
    .where(
      and(
        sql`${schema.topicMastery.studentId} = ANY(${studentIds})`,
        sql`${schema.topicMastery.totalProblems} > 0`
      )
    );

    // Estimate total curriculum topics (this would be configurable in a real system)
    const estimatedTotalTopics = 50; // This should come from curriculum definition
    const curriculumCoverage = Math.min(100, (curriculumStats.topicsWithActivity / estimatedTotalTopics) * 100);

    res.json({
      success: true,
      overview: {
        totalStudents: activeStudents.length,
        activeStudentsToday: todayActive.count,
        activeStudentsThisWeek: weekActive.count,
        activeStudentsThisMonth: monthActive.count,
        avgTimePerStudent: Math.round(avgStats.avgTime),
        overallAccuracyRate: Math.round(avgStats.avgAccuracy * 100) / 100,
        topicsMostPracticed: topicStats,
        curriculumCoverage: Math.round(curriculumCoverage * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Get class overview error:', error);
    res.status(500).json({ error: 'Failed to fetch class overview' });
  }
});

// GET /api/teacher/class/:classId/students - Get detailed student progress data
router.get('/class/:classId/students', authenticateToken, requireTeacherOrAbove, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const classId = parseInt(req.params.classId);
    if (isNaN(classId)) {
      return res.status(400).json({ error: 'Invalid class ID' });
    }

    // Verify teacher owns this class
    const classInfo = await db.select()
      .from(schema.classes)
      .where(
        and(
          eq(schema.classes.id, classId),
          eq(schema.classes.teacherId, req.user.id)
        )
      )
      .limit(1);

    if (classInfo.length === 0) {
      return res.status(403).json({ error: 'Access denied to this class' });
    }

    // Get students with comprehensive progress data
    const students = await db.select({
      studentId: schema.classEnrollments.studentId,
      user: {
        id: schema.users.id,
        fullName: schema.users.fullName,
        email: schema.users.email,
      },
      enrolledAt: schema.classEnrollments.enrolledAt,
    })
    .from(schema.classEnrollments)
    .innerJoin(schema.students, eq(schema.classEnrollments.studentId, schema.students.id))
    .innerJoin(schema.users, eq(schema.students.userId, schema.users.id))
    .where(
      and(
        eq(schema.classEnrollments.classId, classId),
        eq(schema.classEnrollments.isActive, true)
      )
    )
    .orderBy(asc(schema.users.fullName));

    // Get recent activity and progress for each student
    const studentProgress = await Promise.all(
      students.map(async (student) => {
        // Get recent daily activity (last 30 days)
        const recentActivity = await db.select({
          date: schema.dailyActivity.date,
          totalTime: schema.dailyActivity.totalTime,
          sessionsCount: schema.dailyActivity.sessionsCount,
          problemsAttempted: schema.dailyActivity.problemsAttempted,
          problemsCompleted: schema.dailyActivity.problemsCompleted,
          accuracyRate: schema.dailyActivity.accuracyRate,
          topicsWorked: schema.dailyActivity.topicsWorked,
        })
        .from(schema.dailyActivity)
        .where(
          and(
            eq(schema.dailyActivity.studentId, student.studentId),
            gte(schema.dailyActivity.date, sql`(CURRENT_DATE - INTERVAL '30 days')::text`)
          )
        )
        .orderBy(desc(schema.dailyActivity.date))
        .limit(30);

        // Get topic mastery summary
        const topicMastery = await db.select({
          subject: schema.topicMastery.subject,
          topic: schema.topicMastery.topic,
          accuracyRate: schema.topicMastery.accuracyRate,
          masteryLevel: schema.topicMastery.masteryLevel,
          timeSpent: schema.topicMastery.timeSpent,
          lastActivityDate: schema.topicMastery.lastActivityDate,
        })
        .from(schema.topicMastery)
        .where(eq(schema.topicMastery.studentId, student.studentId))
        .orderBy(desc(schema.topicMastery.lastActivityDate));

        // Calculate engagement streak
        const sortedActivity = recentActivity.sort((a, b) => b.date.localeCompare(a.date));
        let engagementStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        
        for (let i = 0; i < sortedActivity.length; i++) {
          const activityDate = sortedActivity[i].date;
          const expectedDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          
          if (activityDate === expectedDate && (sortedActivity[i].totalTime || 0) > 0) {
            engagementStreak++;
          } else {
            break;
          }
        }

        // Calculate summary statistics
        const totalTimeSpent = recentActivity.reduce((sum, day) => sum + (day.totalTime || 0), 0);
        const totalProblemsAttempted = recentActivity.reduce((sum, day) => sum + (day.problemsAttempted || 0), 0);
        const totalProblemsCompleted = recentActivity.reduce((sum, day) => sum + (day.problemsCompleted || 0), 0);
        const avgAccuracy = recentActivity.length > 0 
          ? recentActivity.reduce((sum, day) => sum + (parseFloat(day.accuracyRate || '0')), 0) / recentActivity.length 
          : 0;

        // Get unique topics covered
        const topicsCovered = new Set();
        recentActivity.forEach(day => {
          if (day.topicsWorked && Array.isArray(day.topicsWorked)) {
            day.topicsWorked.forEach(topic => topicsCovered.add(topic));
          }
        });

        return {
          ...student,
          progress: {
            timeSpent: totalTimeSpent,
            topicsCovered: topicsCovered.size,
            problemsAttempted: totalProblemsAttempted,
            problemsCompleted: totalProblemsCompleted,
            accuracyRate: Math.round(avgAccuracy * 100) / 100,
            engagementStreak,
            recentActivity: recentActivity.slice(0, 7), // Last 7 days
            topicMastery: topicMastery.slice(0, 10), // Top 10 topics
            lastActive: recentActivity.length > 0 ? recentActivity[0]?.date || null : null,
          }
        };
      })
    );

    res.json({
      success: true,
      students: studentProgress,
    });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({ error: 'Failed to fetch student progress' });
  }
});

// XP System Constants (matching gamification-routes.ts)
const XP_CONSTANTS = {
  LEVEL_THRESHOLDS: [0, 100, 250, 500, 1000, 2000, 4000, 8000, 15000, 30000]
};

// Helper function to calculate XP needed for next level
function calculateXPToNextLevel(totalXP: number, currentLevel: number): number {
  if (currentLevel >= XP_CONSTANTS.LEVEL_THRESHOLDS.length) {
    return 0; // Max level reached
  }
  const nextLevelThreshold = XP_CONSTANTS.LEVEL_THRESHOLDS[currentLevel];
  return Math.max(0, nextLevelThreshold - totalXP);
}

// GET /api/teacher/class/:classId/gamification - Get comprehensive gamification data for a class
router.get('/class/:classId/gamification', authenticateToken, requireTeacherOrAbove, async (req: Request, res: Response) => {
  try {
    const classId = parseInt(req.params.classId);
    
    if (!classId) {
      return res.status(400).json({ error: 'Invalid class ID' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // First check if user has access to this class
    const classAccess = await db.select({
      id: schema.classes.id,
      name: schema.classes.name,
      subject: schema.classes.subject,
      gradeLevel: schema.classes.gradeLevel
    })
    .from(schema.classes)
    .where(
      and(
        eq(schema.classes.id, classId),
        eq(schema.classes.teacherId, req.user.id),
        eq(schema.classes.isActive, true)
      )
    )
    .limit(1);

    if (classAccess.length === 0) {
      return res.status(403).json({ error: 'Access denied - not your class' });
    }

    const classInfo = classAccess[0];

    // Get all students in this class with their gamification data
    const studentsWithGamification = await db.select({
      studentId: schema.students.id,
      studentName: sql<string>`COALESCE(${schema.studentProfiles.name}, 'Student ' || ${schema.students.id})`,
      totalXP: sql<number>`COALESCE(${schema.studentXP.totalXP}, 0)`,
      currentLevel: sql<number>`COALESCE(${schema.studentXP.level}, 1)`,
      weeklyXP: sql<number>`COALESCE(${schema.studentXP.weeklyXP}, 0)`,
      badgeCount: sql<number>`COALESCE(badge_count.count, 0)`,
      // Use real activity timestamp instead of createdAt
      lastActive: sql<string>`COALESCE(activity_data.last_active, ${schema.students.createdAt})`,
      // Challenge data
      activeChallenges: sql<number>`COALESCE(challenge_stats.active_challenges, 0)`,
      completedChallenges: sql<number>`COALESCE(challenge_stats.completed_challenges, 0)`,
      challengeProgress: sql<number>`COALESCE(challenge_stats.avg_progress, 0)`,
      currentStreak: sql<number>`COALESCE(streak_data.current_streak, 0)`
    })
    .from(schema.classEnrollments)
    .innerJoin(schema.students, eq(schema.classEnrollments.studentId, schema.students.id))
    .leftJoin(schema.studentProfiles, eq(schema.students.id, schema.studentProfiles.studentId))
    .leftJoin(schema.studentXP, eq(schema.students.id, schema.studentXP.studentId))
    .leftJoin(
      sql`(
        SELECT student_id, COUNT(*) as count 
        FROM student_badges 
        WHERE earned_at IS NOT NULL 
        GROUP BY student_id
      ) badge_count`,
      sql`badge_count.student_id = ${schema.students.id}`
    )
    .leftJoin(
      sql`(
        SELECT 
          student_id,
          COUNT(*) FILTER (WHERE is_completed = false AND end_date > NOW()) as active_challenges,
          COUNT(*) FILTER (WHERE is_completed = true) as completed_challenges,
          COALESCE(AVG(CASE WHEN target_value > 0 THEN (current_value::float / target_value * 100) ELSE 0 END), 0) as avg_progress
        FROM challenge_participation cp
        JOIN challenges c ON cp.challenge_id = c.id
        WHERE c.is_active = true
        GROUP BY student_id
      ) challenge_stats`,
      sql`challenge_stats.student_id = ${schema.students.id}`
    )
    .leftJoin(
      sql`(
        SELECT 
          student_id,
          COUNT(*) as current_streak
        FROM daily_activity 
        WHERE date >= (CURRENT_DATE - INTERVAL '7 days')::text 
          AND total_time > 0
        GROUP BY student_id
      ) streak_data`,
      sql`streak_data.student_id = ${schema.students.id}`
    )
    .leftJoin(
      sql`(
        SELECT 
          student_id,
          MAX(date) as last_active
        FROM daily_activity
        WHERE total_time > 0
        GROUP BY student_id
      ) activity_data`,
      sql`activity_data.student_id = ${schema.students.id}`
    )
    .where(
      and(
        eq(schema.classEnrollments.classId, classId),
        eq(schema.classEnrollments.isActive, true)
      )
    )
    .orderBy(sql`COALESCE(${schema.studentXP.totalXP}, 0) DESC`);

    // Calculate class summary statistics
    const totalStudents = studentsWithGamification.length;
    const averageXP = totalStudents > 0 ? 
      studentsWithGamification.reduce((sum, s) => sum + (s.totalXP || 0), 0) / totalStudents : 0;
    const totalBadgesEarned = studentsWithGamification.reduce((sum, s) => sum + (s.badgeCount || 0), 0);
    const activeStudents = studentsWithGamification.filter(s => s.weeklyXP > 0).length;
    const studentsInChallenges = studentsWithGamification.filter(s => s.activeChallenges > 0).length;
    const challengeParticipation = totalStudents > 0 ? (studentsInChallenges / totalStudents) * 100 : 0;

    // Get top performers (top 5 by XP)
    const topPerformers = studentsWithGamification
      .slice(0, 5)
      .map(s => ({
        studentId: s.studentId,
        studentName: s.studentName,
        xp: s.totalXP || 0,
        badges: s.badgeCount || 0,
        level: s.currentLevel || 1
      }));

    // Identify students needing attention with comprehensive reasons
    const needsAttention: Array<{studentId: number, studentName: string, reasons: string[]}> = studentsWithGamification
      .map(s => {
        const reasons: string[] = [];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        
        // XP and engagement analysis
        if ((s.weeklyXP || 0) < 50) {
          reasons.push('Low weekly XP (less than 50 points)');
        }
        if ((s.totalXP || 0) < 100 && new Date(s.lastActive) < weekAgo) {
          reasons.push('New student with low engagement');
        }
        
        // Badge and achievement analysis
        if ((s.badgeCount || 0) === 0 && (s.totalXP || 0) > 200) {
          reasons.push('Has XP but no badges earned');
        }
        
        // Activity and participation analysis
        if (!s.lastActive || new Date(s.lastActive) < weekAgo) {
          if (!s.lastActive || new Date(s.lastActive) < twoWeeksAgo) {
            reasons.push('Inactive for over 2 weeks');
          } else {
            reasons.push('Inactive for over a week');
          }
        }
        
        // Challenge participation analysis
        if ((s.activeChallenges || 0) === 0 && (s.completedChallenges || 0) === 0) {
          reasons.push('No challenge participation');
        } else if ((s.challengeProgress || 0) < 25 && (s.activeChallenges || 0) > 0) {
          reasons.push('Started challenges but low progress');
        }
        
        // Streak and consistency analysis
        if ((s.currentStreak || 0) === 0) {
          reasons.push('No recent daily activity streak');
        }
        
        // Performance level analysis
        if ((s.currentLevel || 1) === 1 && (s.totalXP || 0) > 80) {
          reasons.push('Close to level up but hasn\'t progressed');
        }
        
        return {
          studentId: s.studentId,
          studentName: s.studentName,
          reasons: reasons
        };
      })
      .filter(s => s.reasons.length >= 2) // Only include students with multiple concerns
      .sort((a, b) => b.reasons.length - a.reasons.length) // Sort by number of concerns
      .slice(0, 8); // Limit to top 8 students needing most attention

    // Get current class leaderboard
    const leaderboardQuery = await db.select({
      id: schema.leaderboards.id,
      type: schema.leaderboards.type,
      periodStart: schema.leaderboards.periodStart,
      periodEnd: schema.leaderboards.periodEnd
    })
    .from(schema.leaderboards)
    .where(
      and(
        eq(schema.leaderboards.scope, 'class'),
        eq(schema.leaderboards.classId, classId),
        eq(schema.leaderboards.type, 'weekly_xp'),
        eq(schema.leaderboards.isCurrent, true)
      )
    )
    .limit(1);

    let leaderboardEntries: Array<{rank: number, studentId: number, studentName: string, currentValue: number, trendDirection: string | null}> = [];
    if (leaderboardQuery.length > 0) {
      const leaderboardId = leaderboardQuery[0].id;
      
      leaderboardEntries = await db.select({
        rank: schema.leaderboardEntries.rank,
        studentId: schema.leaderboardEntries.studentId,
        studentName: sql<string>`COALESCE(${schema.studentProfiles.name}, 'Unknown Student')`,
        currentValue: schema.leaderboardEntries.score,
        trendDirection: schema.leaderboardEntries.trendDirection
      })
      .from(schema.leaderboardEntries)
      .leftJoin(schema.students, eq(schema.leaderboardEntries.studentId, schema.students.id))
      .leftJoin(schema.studentProfiles, eq(schema.students.id, schema.studentProfiles.studentId))
      .where(eq(schema.leaderboardEntries.leaderboardId, leaderboardId))
      .orderBy(asc(schema.leaderboardEntries.rank))
      .limit(10);
    }

    res.json({
      success: true,
      classInfo: {
        id: classInfo.id,
        name: classInfo.name,
        subject: classInfo.subject,
        gradeLevel: classInfo.gradeLevel
      },
      summary: {
        totalStudents,
        averageXP: Math.round(averageXP),
        totalBadgesEarned,
        challengeParticipation: Math.round(challengeParticipation),
        activeStudents
      },
      topPerformers,
      needsAttention,
      leaderboard: {
        entries: leaderboardEntries,
        period: leaderboardQuery.length > 0 ? {
          start: leaderboardQuery[0].periodStart,
          end: leaderboardQuery[0].periodEnd
        } : null
      },
      students: await Promise.all(studentsWithGamification.map(async s => {
        // Calculate proper xpToNextLevel
        const totalXP = s.totalXP || 0;
        const currentLevel = s.currentLevel || 1;
        const xpToNextLevel = calculateXPToNextLevel(totalXP, currentLevel);

        // Fetch recent badges for this student
        const recentBadges = await db.select({
          id: schema.studentBadges.id,
          name: schema.badgeDefinitions.name,
          category: schema.badgeDefinitions.category,
          earnedAt: schema.studentBadges.earnedAt
        })
        .from(schema.studentBadges)
        .innerJoin(schema.badgeDefinitions, eq(schema.studentBadges.badgeId, schema.badgeDefinitions.id))
        .where(
          and(
            eq(schema.studentBadges.studentId, s.studentId),
            eq(schema.studentBadges.isEarned, true),
            isNotNull(schema.studentBadges.earnedAt)
          )
        )
        .orderBy(desc(schema.studentBadges.earnedAt))
        .limit(5);

        // Calculate leaderboard positions
        const leaderboardRank = leaderboardEntries.findIndex(entry => entry.studentId === s.studentId) + 1;

        return {
          studentId: s.studentId,
          studentName: s.studentName,
          xp: {
            totalXP: totalXP,
            currentLevel: currentLevel,
            weeklyXP: s.weeklyXP || 0,
            xpToNextLevel: xpToNextLevel
          },
          badges: {
            totalBadges: s.badgeCount || 0,
            recentBadges: recentBadges.map(badge => ({
              id: badge.id,
              name: badge.name,
              category: badge.category,
              earnedAt: badge.earnedAt?.toISOString() || ''
            }))
          },
          challenges: {
            weeklyProgress: Math.round(s.challengeProgress || 0),
            completedChallenges: s.completedChallenges || 0,
            currentStreak: s.currentStreak || 0
          },
          leaderboardPosition: {
            weeklyXPRank: leaderboardRank || 0,
            badgeCountRank: 0, // Could be enhanced with badge-based leaderboard
            challengeRank: 0   // Could be enhanced with challenge-based leaderboard
          },
          lastActive: s.lastActive
        };
      }))
    });

  } catch (error) {
    console.error('Get class gamification data error:', error);
    res.status(500).json({ error: 'Failed to fetch gamification data' });
  }
});

export default router;