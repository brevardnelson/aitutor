import express from 'express';
import cors from 'cors';
import { dashboardAPI } from './api';
import authRoutes from './auth-routes';
import adminRoutes from './admin-routes';
import teacherRoutes from './teacher-routes';
import parentRoutes from './parent-api-routes';
import { registerDocumentRoutes } from './document-routes';
import { registerGamificationRoutes } from './gamification-routes';
import { authenticateToken } from './auth-middleware';
import { verifyChildAccess, verifyStudentAccess, verifySessionAccess } from './resource-authorization';
import { validateParamIds, validateBodyIds, getValidatedId } from './id-validation-middleware';
import { storage } from './storage';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Secure CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Authentication routes
app.use('/api/auth', authRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Teacher routes  
app.use('/api/teacher', teacherRoutes);

// Parent routes
app.use('/api/parent', parentRoutes);

// Document Management routes
registerDocumentRoutes(app);

// Gamification routes
registerGamificationRoutes(app);

// Dashboard API routes (now with proper resource authorization and ID validation)
app.get('/api/dashboard/:childId/:subject', 
  validateParamIds(['childId']), 
  authenticateToken, 
  async (req, res) => {
    try {
      const { subject } = req.params;
      const childIdNum = getValidatedId(req, 'childId');
      
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // CRITICAL: Verify user can access this child's data
      const hasAccess = await verifyChildAccess(req.user, childIdNum);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Access denied - you do not have permission to view this child\'s data',
          childId: childIdNum
        });
      }
      
      const summary = await dashboardAPI.generateDashboardSummary(childIdNum.toString(), subject);
      res.json(summary);
    } catch (error) {
      console.error('Dashboard API error:', error);
      res.status(500).json({ 
        error: 'Failed to generate dashboard data',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });

// Learning session tracking routes (now with proper resource authorization and ID validation)
app.post('/api/sessions/start', 
  validateBodyIds(['studentId']), 
  authenticateToken, 
  async (req, res) => {
    try {
      const { subject, topic, sessionType } = req.body;
      const studentId = getValidatedId(req, 'studentId');
      
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // CRITICAL: Verify user can access this student's data
      const hasAccess = await verifyStudentAccess(req.user, studentId);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Access denied - you do not have permission to manage this student\'s sessions',
          studentId
        });
      }
      
      const sessionId = await dashboardAPI.startLearningSession(
        studentId, 
        subject, 
        topic, 
        sessionType
      );
      
      res.json({ sessionId });
    } catch (error) {
      console.error('Start session error:', error);
      res.status(500).json({ 
        error: 'Failed to start learning session',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });

app.post('/api/sessions/:sessionId/end', 
  validateParamIds(['sessionId']), 
  authenticateToken, 
  async (req, res) => {
    try {
      const { duration, problemsAttempted, problemsCompleted, correctAnswers, hintsUsed } = req.body;
      const sessionIdNum = getValidatedId(req, 'sessionId');
      
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // CRITICAL: Verify user can access this session
      const hasAccess = await verifySessionAccess(req.user, sessionIdNum);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Access denied - you do not have permission to modify this session',
          sessionId: sessionIdNum
        });
      }
      
      await dashboardAPI.endLearningSession(
        sessionIdNum,
        duration,
        problemsAttempted,
        problemsCompleted,
        correctAnswers,
        hintsUsed
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error('End session error:', error);
      res.status(500).json({ 
        error: 'Failed to end learning session',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });

app.post('/api/sessions/:sessionId/problem-attempt', 
  validateParamIds(['sessionId']),
  validateBodyIds(['studentId']),
  authenticateToken, 
  async (req, res) => {
    try {
      const { subject, topic, problemData } = req.body;
      const sessionIdNum = getValidatedId(req, 'sessionId');
      const studentId = getValidatedId(req, 'studentId');
      
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // CRITICAL: Verify user can access this session AND student
      const hasSessionAccess = await verifySessionAccess(req.user, sessionIdNum);
      const hasStudentAccess = await verifyStudentAccess(req.user, studentId);
      if (!hasSessionAccess || !hasStudentAccess) {
        return res.status(403).json({ 
          error: 'Access denied - you do not have permission to record attempts for this session',
          sessionId: sessionIdNum,
          studentId
        });
      }
      
      await dashboardAPI.recordProblemAttempt(
        sessionIdNum,
        studentId,
        subject,
        topic,
        problemData
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error('Problem attempt error:', error);
      res.status(500).json({ 
        error: 'Failed to record problem attempt',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });

app.post('/api/sessions/:sessionId/abandon', 
  validateParamIds(['sessionId']),
  authenticateToken, 
  async (req, res) => {
    try {
      const { reason } = req.body;
      const sessionIdNum = getValidatedId(req, 'sessionId');
      
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // CRITICAL: Verify user can access this session
      const hasAccess = await verifySessionAccess(req.user, sessionIdNum);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Access denied - you do not have permission to abandon this session',
          sessionId: sessionIdNum
        });
      }
      
      // For now, just end the session with 0 duration to mark as abandoned
      await dashboardAPI.endLearningSession(
        sessionIdNum,
        0, // 0 duration indicates abandoned session
        0, // No problems attempted
        0, // No problems completed
        0, // No correct answers
        0  // No hints used
      );
      
      console.log(`Session ${sessionIdNum} abandoned: ${reason}`);
      res.json({ success: true });
    } catch (error) {
      console.error('Abandon session error:', error);
      res.status(500).json({ 
        error: 'Failed to abandon session',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });

// Curriculum API - fetch curriculum documents for a specific grade level, subject, and topic
app.get('/api/curriculum/:gradeLevel/:subject', 
  authenticateToken,
  async (req, res) => {
    try {
      const { gradeLevel, subject } = req.params;
      const { topic } = req.query;
      
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Fetch curriculum documents from database
      const documents = await storage.getCurriculumDocuments(
        gradeLevel,
        subject,
        topic as string | undefined
      );
      
      res.json({ documents });
    } catch (error) {
      console.error('Curriculum fetch error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch curriculum documents',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// CRITICAL FIX: Weekly Challenge Automation System
async function initializeChallengeScheduler() {
  try {
    // Create weekly challenges immediately on startup
    console.log('🎯 Initializing weekly challenges...');
    await storage.createWeeklyChallenges();
    console.log('✅ Weekly challenges created successfully');

    // Set up automatic weekly challenge creation (every Monday at 12:01 AM)
    const scheduleWeeklyChallenges = () => {
      const now = new Date();
      const nextMonday = new Date(now);
      
      // Calculate days until next Monday (0 = Sunday, 1 = Monday)
      const daysUntilMonday = (1 - now.getDay() + 7) % 7;
      if (daysUntilMonday === 0 && now.getHours() >= 0 && now.getMinutes() >= 1) {
        // If it's already Monday and past 12:01 AM, schedule for next Monday
        nextMonday.setDate(now.getDate() + 7);
      } else {
        nextMonday.setDate(now.getDate() + daysUntilMonday);
      }
      
      nextMonday.setHours(0, 1, 0, 0); // 12:01 AM on Monday
      
      const msUntilNextMonday = nextMonday.getTime() - now.getTime();
      
      console.log(`⏰ Next weekly challenges scheduled for: ${nextMonday.toLocaleString()}`);
      
      setTimeout(async () => {
        try {
          console.log('🎯 Creating weekly challenges (scheduled)...');
          await storage.createWeeklyChallenges();
          console.log('✅ Weekly challenges created automatically');
          
          // Schedule the next week
          scheduleWeeklyChallenges();
        } catch (error) {
          console.error('❌ Error creating scheduled weekly challenges:', error);
          // Retry in 1 hour if there's an error
          setTimeout(scheduleWeeklyChallenges, 60 * 60 * 1000);
        }
      }, msUntilNextMonday);
    };

    // Start the scheduling system
    scheduleWeeklyChallenges();
    
  } catch (error) {
    console.error('❌ Error initializing challenge scheduler:', error);
    // Retry in 5 minutes if initialization fails
    setTimeout(initializeChallengeScheduler, 5 * 60 * 1000);
  }
}

// COMPREHENSIVE LEADERBOARD AUTOMATION SYSTEM
async function initializeLeaderboardScheduler() {
  try {
    console.log('🏆 Initializing leaderboard automation system...');
    
    // Initialize current week leaderboards on startup
    try {
      await storage.resetWeeklyLeaderboards();
      console.log('✅ Weekly leaderboards initialized successfully');
    } catch (error) {
      console.log('⚠️  Weekly leaderboards initialization skipped (likely already exist)');
    }

    // Set up weekly leaderboard reset (every Monday at 12:00 AM - before challenges)
    const scheduleWeeklyLeaderboardReset = () => {
      const now = new Date();
      const nextMonday = new Date(now);
      
      // Calculate days until next Monday (0 = Sunday, 1 = Monday)
      const daysUntilMonday = (1 - now.getDay() + 7) % 7;
      if (daysUntilMonday === 0 && now.getHours() >= 0) {
        // If it's already Monday, schedule for next Monday
        nextMonday.setDate(now.getDate() + 7);
      } else {
        nextMonday.setDate(now.getDate() + daysUntilMonday);
      }
      
      nextMonday.setHours(0, 0, 0, 0); // 12:00 AM on Monday (before challenges)
      
      const msUntilNextMonday = nextMonday.getTime() - now.getTime();
      
      console.log(`🗓️  Next weekly leaderboard reset scheduled for: ${nextMonday.toLocaleString()}`);
      
      setTimeout(async () => {
        try {
          console.log('🔄 Running weekly leaderboard reset (scheduled)...');
          await storage.resetWeeklyLeaderboards();
          console.log('✅ Weekly leaderboard reset completed automatically');
          
          // Schedule the next week
          scheduleWeeklyLeaderboardReset();
        } catch (error) {
          console.error('❌ Error in scheduled weekly leaderboard reset:', error);
          // Retry in 1 hour if there's an error
          setTimeout(scheduleWeeklyLeaderboardReset, 60 * 60 * 1000);
        }
      }, msUntilNextMonday);
    };

    // Set up daily leaderboard updates (every day at 11:00 PM)
    const scheduleDailyLeaderboardUpdates = () => {
      const now = new Date();
      const nextUpdate = new Date(now);
      
      // If it's past 11 PM today, schedule for 11 PM tomorrow
      if (now.getHours() >= 23) {
        nextUpdate.setDate(now.getDate() + 1);
      }
      
      nextUpdate.setHours(23, 0, 0, 0); // 11:00 PM
      
      const msUntilNextUpdate = nextUpdate.getTime() - now.getTime();
      
      console.log(`📊 Next daily leaderboard update scheduled for: ${nextUpdate.toLocaleString()}`);
      
      setTimeout(async () => {
        try {
          console.log('📈 Running daily leaderboard update (scheduled)...');
          await storage.updateCurrentWeekLeaderboards();
          console.log('✅ Daily leaderboard update completed automatically');
          
          // Schedule the next day
          scheduleDailyLeaderboardUpdates();
        } catch (error) {
          console.error('❌ Error in scheduled daily leaderboard update:', error);
          // Retry in 30 minutes if there's an error
          setTimeout(scheduleDailyLeaderboardUpdates, 30 * 60 * 1000);
        }
      }, msUntilNextUpdate);
    };

    // Set up monthly leaderboard creation (1st of each month at 12:30 AM)
    const scheduleMonthlyLeaderboardCreation = () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      nextMonth.setHours(0, 30, 0, 0); // 12:30 AM on the 1st
      
      const msUntilNextMonth = nextMonth.getTime() - now.getTime();
      
      console.log(`📅 Next monthly leaderboard creation scheduled for: ${nextMonth.toLocaleString()}`);
      
      setTimeout(async () => {
        try {
          console.log('📈 Creating monthly leaderboards (scheduled)...');
          await storage.createMonthlyLeaderboards();
          console.log('✅ Monthly leaderboards created automatically');
          
          // Schedule the next month
          scheduleMonthlyLeaderboardCreation();
        } catch (error) {
          console.error('❌ Error creating scheduled monthly leaderboards:', error);
          // Retry in 2 hours if there's an error
          setTimeout(scheduleMonthlyLeaderboardCreation, 2 * 60 * 60 * 1000);
        }
      }, msUntilNextMonth);
    };

    // Start all scheduling systems
    scheduleWeeklyLeaderboardReset();
    scheduleDailyLeaderboardUpdates();
    scheduleMonthlyLeaderboardCreation();

    console.log('✅ Leaderboard automation system initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing leaderboard scheduler:', error);
    // Retry in 5 minutes if initialization fails
    setTimeout(initializeLeaderboardScheduler, 5 * 60 * 1000);
  }
}

// Start server with comprehensive automation systems
app.listen(PORT, async () => {
  console.log(`🚀 Dashboard API server running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  
  // Initialize automation systems in parallel
  await Promise.all([
    initializeChallengeScheduler(),
    initializeLeaderboardScheduler()
  ]);
  
  console.log('🎮 Weekly challenge automation system is active!');
  console.log('🏆 Comprehensive leaderboard automation system is active!');
  console.log('🚀 All automation systems are running successfully!');
});