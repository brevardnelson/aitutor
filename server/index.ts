import express from 'express';
import cors from 'cors';
import { dashboardAPI } from './api';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Dashboard API routes
app.get('/api/dashboard/:childId/:subject', async (req, res) => {
  try {
    const { childId, subject } = req.params;
    
    // TODO: Add authentication and authorization here
    // - Verify user is authenticated  
    // - Check parent owns this child
    // - Validate input parameters
    
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

// Learning session tracking routes
app.post('/api/sessions/start', async (req, res) => {
  try {
    const { studentId, subject, topic, sessionType } = req.body;
    
    // TODO: Add authentication and authorization
    // - Verify user is authenticated
    // - Check parent owns this student
    // - Validate input data
    
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

app.post('/api/sessions/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { duration, problemsAttempted, problemsCompleted, correctAnswers, hintsUsed } = req.body;
    
    // TODO: Add authentication and authorization
    // - Verify user is authenticated
    // - Check session belongs to user's child
    
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

app.post('/api/sessions/:sessionId/problem-attempt', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { studentId, subject, topic, problemData } = req.body;
    
    // TODO: Add authentication and authorization
    // - Verify user is authenticated
    // - Check session belongs to user's child
    
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

app.post('/api/sessions/:sessionId/abandon', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;
    
    // TODO: Add authentication and authorization
    // - Verify user is authenticated
    // - Check session belongs to user's child
    
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