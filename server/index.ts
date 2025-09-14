import express from 'express';
import cors from 'cors';
import { dashboardAPI } from './api';
import authRoutes from './auth-routes';
import adminRoutes from './admin-routes';
import teacherRoutes from './teacher-routes';
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

// Start server with challenge automation
app.listen(PORT, async () => {
  console.log(`🚀 Dashboard API server running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  
  // Initialize challenge automation system
  await initializeChallengeScheduler();
  
  console.log('🎮 Weekly challenge automation system is active!');
});