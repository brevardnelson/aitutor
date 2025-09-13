import express from 'express';
import cors from 'cors';
import { dashboardAPI } from './api';
import authRoutes from './auth-routes';
import { authenticateToken } from './auth-middleware';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.use('/api/auth', authRoutes);

// Dashboard API routes (now with authentication)
app.get('/api/dashboard/:childId/:subject', authenticateToken, async (req, res) => {
  try {
    const { childId, subject } = req.params;
    
    // Authentication and authorization now handled by middleware
    // req.user contains the authenticated user information
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // TODO: Add parent-child relationship check
    // For now, allow access if authenticated
    
    const summary = await dashboardAPI.generateDashboardSummary(childId, subject);
    res.json(summary);
  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ 
      error: 'Failed to generate dashboard data',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Learning session tracking routes (now with authentication)
app.post('/api/sessions/start', authenticateToken, async (req, res) => {
  try {
    const { studentId, subject, topic, sessionType } = req.body;
    
    // Authentication now handled by middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // TODO: Add student ownership validation
    
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

app.post('/api/sessions/:sessionId/end', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { duration, problemsAttempted, problemsCompleted, correctAnswers, hintsUsed } = req.body;
    
    // Authentication now handled by middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // TODO: Add session ownership validation
    
    await dashboardAPI.endLearningSession(
      parseInt(sessionId),
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

app.post('/api/sessions/:sessionId/problem-attempt', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { studentId, subject, topic, problemData } = req.body;
    
    // Authentication now handled by middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // TODO: Add session ownership validation
    
    await dashboardAPI.recordProblemAttempt(
      parseInt(sessionId),
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

app.post('/api/sessions/:sessionId/abandon', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;
    
    // Authentication now handled by middleware
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // TODO: Add session ownership validation
    
    // For now, just end the session with 0 duration to mark as abandoned
    await dashboardAPI.endLearningSession(
      parseInt(sessionId),
      0, // 0 duration indicates abandoned session
      0, // No problems attempted
      0, // No problems completed
      0, // No correct answers
      0  // No hints used
    );
    
    console.log(`Session ${sessionId} abandoned: ${reason}`);
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

// Start server
app.listen(PORT, () => {
  console.log(`Dashboard API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});