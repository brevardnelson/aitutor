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
          
          if (activityDate === expectedDate && sortedActivity[i].totalTime > 0) {
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

export default router;