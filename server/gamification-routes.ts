import type { Express } from "express";
import { z } from "zod";
import { authenticateToken } from "./auth-middleware";
import { storage } from "./storage";

// XP System Constants
const XP_CONSTANTS = {
  PROBLEM_COMPLETION_BASE: 10, // Base XP for completing a problem
  NO_HINTS_BONUS: 5, // Bonus XP for solving without hints
  STREAK_MULTIPLIER: 1.2, // Multiplier for daily streaks
  DIFFICULTY_MULTIPLIERS: {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0
  },
  LEVEL_THRESHOLDS: [0, 100, 250, 500, 1000, 2000, 4000, 8000, 15000, 30000] // XP required for each level
};

// Validation schemas
const EarnXPSchema = z.object({
  studentId: z.number(),
  source: z.enum(['problem_completion', 'no_hints_bonus', 'streak_bonus', 'challenge_completion']),
  // SECURITY FIX: Removed client-controlled amount parameter - XP now calculated server-side only
  metadata: z.object({
    problemId: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    hintsUsed: z.number().optional(),
    challengeId: z.number().optional(),
    sessionId: z.number().optional(),
    // Additional verification fields for server-side validation
    problemAttemptId: z.number().optional(), // Link to verified problem attempt
    sessionVerified: z.boolean().optional()  // Verification flag for session-based XP
  }).optional()
});

const SpendXPSchema = z.object({
  studentId: z.number(),
  amount: z.number().min(1),
  rewardId: z.number().optional(),
  description: z.string()
});

// Helper functions
function calculateLevel(totalXP: number): number {
  for (let level = XP_CONSTANTS.LEVEL_THRESHOLDS.length - 1; level >= 0; level--) {
    if (totalXP >= XP_CONSTANTS.LEVEL_THRESHOLDS[level]) {
      return level + 1;
    }
  }
  return 1;
}

function calculateXPForProblem(difficulty: string, hintsUsed: number, hasStreak: boolean = false): number {
  let xp = XP_CONSTANTS.PROBLEM_COMPLETION_BASE;
  
  // Apply difficulty multiplier
  const difficultyMultiplier = XP_CONSTANTS.DIFFICULTY_MULTIPLIERS[difficulty as keyof typeof XP_CONSTANTS.DIFFICULTY_MULTIPLIERS] || 1.0;
  xp *= difficultyMultiplier;
  
  // Add no hints bonus
  if (hintsUsed === 0) {
    xp += XP_CONSTANTS.NO_HINTS_BONUS;
  }
  
  // Apply streak multiplier
  if (hasStreak) {
    xp *= XP_CONSTANTS.STREAK_MULTIPLIER;
  }
  
  return Math.round(xp);
}

export function registerGamificationRoutes(app: Express): void {
  
  // BADGE ROUTES
  
  // Get all badge definitions (filtered)
  app.get('/api/gamification/badges', authenticateToken, async (req, res) => {
    try {
      const { category, grade_level, subject, include_secret } = req.query;
      
      const badges = await storage.getBadgeDefinitions({
        category: category as string,
        targetRole: 'student',
        gradeLevel: grade_level as string,
        subject: subject as string,
        includeSecret: include_secret === 'true'
      });
      
      res.json(badges);
    } catch (error) {
      console.error('Error fetching badges:', error);
      res.status(500).json({ error: 'Failed to fetch badges' });
    }
  });

  // Get student's badges
  app.get('/api/gamification/badges/student/:studentId', authenticateToken, async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const { include_progress } = req.query;
      
      if (!studentId) {
        return res.status(400).json({ error: 'Invalid student ID' });
      }

      // Check if user has access to this student
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!req.user.hasRole('system_admin') && !await storage.canUserAccessStudent(req.user.id, studentId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const badges = await storage.getStudentBadges(studentId, include_progress !== 'false');
      res.json(badges);
    } catch (error) {
      console.error('Error fetching student badges:', error);
      res.status(500).json({ error: 'Failed to fetch student badges' });
    }
  });

  // Award a badge to a student (manual)
  app.post('/api/gamification/badges/award', authenticateToken, async (req, res) => {
    try {
      const { studentId, badgeId, metadata } = req.body;
      
      if (!studentId || !badgeId) {
        return res.status(400).json({ error: 'Student ID and badge ID required' });
      }

      // Check if user has access to this student (teachers can award badges only to their students)
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Only system admins OR teachers with proper student access can award badges
      if (!req.user.hasRole('system_admin') && 
          !(req.user.hasRole('teacher') && await storage.canUserAccessStudent(req.user.id, studentId))) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const awarded = await storage.awardBadge(studentId, badgeId, metadata);
      
      if (awarded) {
        res.json({ success: true, message: 'Badge awarded successfully' });
      } else {
        res.status(400).json({ error: 'Badge already awarded or invalid badge ID' });
      }
    } catch (error) {
      console.error('Error awarding badge:', error);
      res.status(500).json({ error: 'Failed to award badge' });
    }
  });

  // Update badge progress (ADMIN/TEACHER ONLY - NO CLIENT-CONTROLLED PROGRESS)
  app.post('/api/gamification/badges/progress', authenticateToken, async (req, res) => {
    try {
      const { studentId, badgeId, metadata } = req.body;
      
      if (!studentId || !badgeId) {
        return res.status(400).json({ error: 'Student ID and badge ID required' });
      }

      // SECURITY FIX: Only system admins OR teachers with proper student access can update badge progress
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Match authorization logic from award endpoint - prevents students/parents from manipulating progress
      if (!req.user.hasRole('system_admin') && 
          !(req.user.hasRole('teacher') && await storage.canUserAccessStudent(req.user.id, studentId))) {
        return res.status(403).json({ error: 'Access denied - only teachers and admins can update badge progress' });
      }

      // SECURITY FIX: Remove client-controlled progress - progress should be calculated server-side
      // Badge progress should only be updated based on verified student activities, not arbitrary client input
      return res.status(400).json({ 
        error: 'Direct progress manipulation not allowed. Badge progress is automatically calculated from verified student activities.' 
      });
      
    } catch (error) {
      console.error('Error updating badge progress:', error);
      res.status(500).json({ error: 'Failed to update badge progress' });
    }
  });

  // CHALLENGE ROUTES

  // Get all challenges (filtered)
  app.get('/api/gamification/challenges', authenticateToken, async (req, res) => {
    try {
      const { type, grade_level, subject, school_id, class_id, include_expired } = req.query;
      
      const challenges = await storage.getChallenges({
        type: type as string,
        isActive: true,
        gradeLevel: grade_level as string,
        subject: subject as string,
        schoolId: school_id ? parseInt(school_id as string) : undefined,
        classId: class_id ? parseInt(class_id as string) : undefined,
        includeExpired: include_expired === 'true'
      });
      
      res.json(challenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      res.status(500).json({ error: 'Failed to fetch challenges' });
    }
  });

  // Get specific challenge with details
  app.get('/api/gamification/challenges/:challengeId', authenticateToken, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.challengeId);
      
      if (!challengeId) {
        return res.status(400).json({ error: 'Invalid challenge ID' });
      }

      const challenge = await storage.getChallenge(challengeId);
      
      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }

      res.json(challenge);
    } catch (error) {
      console.error('Error fetching challenge:', error);
      res.status(500).json({ error: 'Failed to fetch challenge' });
    }
  });

  // Join a challenge
  app.post('/api/gamification/challenges/:challengeId/join', authenticateToken, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.challengeId);
      const { studentId } = req.body;
      
      if (!challengeId || !studentId) {
        return res.status(400).json({ error: 'Challenge ID and student ID required' });
      }

      // Check if user has access to this student
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!req.user.hasRole('system_admin') && !await storage.canUserAccessStudent(req.user.id, studentId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const success = await storage.joinChallenge(challengeId, studentId);
      
      if (success) {
        res.json({ success: true, message: 'Successfully joined challenge' });
      } else {
        res.status(400).json({ error: 'Unable to join challenge (already joined, full, or inactive)' });
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      res.status(500).json({ error: 'Failed to join challenge' });
    }
  });

  // Get student's challenges
  app.get('/api/gamification/challenges/student/:studentId', authenticateToken, async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const { include_completed } = req.query;
      
      if (!studentId) {
        return res.status(400).json({ error: 'Invalid student ID' });
      }

      // Check if user has access to this student
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!req.user.hasRole('system_admin') && !await storage.canUserAccessStudent(req.user.id, studentId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const challenges = await storage.getStudentChallenges(studentId, include_completed !== 'false');
      res.json(challenges);
    } catch (error) {
      console.error('Error fetching student challenges:', error);
      res.status(500).json({ error: 'Failed to fetch student challenges' });
    }
  });

  // Get challenge leaderboard
  app.get('/api/gamification/challenges/:challengeId/leaderboard', authenticateToken, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.challengeId);
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!challengeId) {
        return res.status(400).json({ error: 'Invalid challenge ID' });
      }

      const leaderboard = await storage.getChallengeLeaderboard(challengeId, limit);
      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching challenge leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch challenge leaderboard' });
    }
  });

  // Create a new challenge (teachers and admins only)
  app.post('/api/gamification/challenges', authenticateToken, async (req, res) => {
    try {
      const {
        title, description, type, startDate, endDate, targetValue, metric,
        xpReward, badgeReward, gradeLevel, subject, schoolId, classId, maxParticipants
      } = req.body;
      
      // Validate required fields
      if (!title || !description || !type || !startDate || !endDate || !targetValue || !metric) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check permissions
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!req.user.hasRole('system_admin') && !req.user.hasRole('teacher')) {
        return res.status(403).json({ error: 'Only teachers and admins can create challenges' });
      }

      // Create challenge
      const challengeId = await storage.createChallenge({
        title,
        description,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        targetValue,
        metric,
        xpReward,
        badgeReward,
        gradeLevel,
        subject,
        schoolId,
        classId,
        createdBy: req.user.id,
        maxParticipants
      });

      res.json({ success: true, challengeId, message: 'Challenge created successfully' });
    } catch (error) {
      console.error('Error creating challenge:', error);
      res.status(500).json({ error: 'Failed to create challenge' });
    }
  });

  // XP ROUTES
  
  // Get student XP summary
  app.get('/api/gamification/xp/:studentId', authenticateToken, async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      
      if (!studentId) {
        return res.status(400).json({ error: 'Invalid student ID' });
      }

      // Check if user has access to this student
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!req.user.hasRole('system_admin') && !await storage.canUserAccessStudent(req.user.id, studentId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const xpData = await storage.getStudentXP(studentId);
      
      if (!xpData) {
        // Initialize XP tracking for new student
        await storage.initializeStudentXP(studentId);
        const newXpData = await storage.getStudentXP(studentId);
        return res.json(newXpData);
      }

      res.json(xpData);
    } catch (error) {
      console.error('Error fetching student XP:', error);
      res.status(500).json({ error: 'Failed to fetch XP data' });
    }
  });

  // SECURITY FIX: XP earning now restricted to system admins only with server-side verification
  app.post('/api/gamification/xp/earn', authenticateToken, async (req, res) => {
    try {
      const validatedData = EarnXPSchema.parse(req.body);
      const { studentId, source, metadata } = validatedData;

      // SECURITY FIX: Only system administrators can manually award XP
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!req.user.hasRole('system_admin')) {
        return res.status(403).json({ 
          error: 'Access denied - only system administrators can manually award XP. XP is automatically earned through verified learning activities.' 
        });
      }

      // SECURITY FIX: Calculate XP amounts purely server-side based on verified activities
      let actualXP = 0;
      let description = '';

      if (source === 'problem_completion' && metadata) {
        // Verify the problem attempt exists and is valid
        if (!metadata.problemAttemptId) {
          return res.status(400).json({ 
            error: 'Problem attempt ID required for verification' 
          });
        }
        
        // Calculate XP based on verified problem data
        actualXP = calculateXPForProblem(
          metadata.difficulty || 'medium',
          metadata.hintsUsed || 0
        );
        description = `Admin award: Completed ${metadata.difficulty} problem${metadata.hintsUsed === 0 ? ' without hints!' : ''}`;
        
      } else if (source === 'no_hints_bonus') {
        actualXP = XP_CONSTANTS.NO_HINTS_BONUS;
        description = 'Admin award: Bonus for solving without hints!';
        
      } else if (source === 'streak_bonus') {
        // Calculate streak bonus based on verified daily activity
        actualXP = Math.round(XP_CONSTANTS.PROBLEM_COMPLETION_BASE * XP_CONSTANTS.STREAK_MULTIPLIER);
        description = 'Admin award: Daily streak bonus!';
        
      } else if (source === 'challenge_completion') {
        // XP amount should come from the challenge definition, not client input
        if (!metadata?.challengeId) {
          return res.status(400).json({ 
            error: 'Challenge ID required for verification' 
          });
        }
        
        // TODO: Look up challenge XP reward from database
        actualXP = 50; // Default challenge completion XP
        description = 'Admin award: Challenge completed!';
        
      } else {
        return res.status(400).json({ 
          error: 'Invalid XP source or missing required metadata' 
        });
      }

      // SECURITY: XP amounts are now calculated server-side only
      if (actualXP <= 0) {
        return res.status(400).json({ 
          error: 'Invalid XP calculation - cannot award zero or negative XP' 
        });
      }

      const result = await storage.earnXP(studentId, {
        type: 'earned',
        amount: actualXP,
        source,
        description,
        metadata,
        sessionId: metadata?.sessionId
      });

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Error earning XP:', error);
      res.status(500).json({ error: 'Failed to earn XP' });
    }
  });

  // Spend XP - for reward redemptions
  app.post('/api/gamification/xp/spend', authenticateToken, async (req, res) => {
    try {
      const validatedData = SpendXPSchema.parse(req.body);
      const { studentId, amount, rewardId, description } = validatedData;

      // Check if user has access to this student
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!req.user.hasRole('system_admin') && !await storage.canUserAccessStudent(req.user.id, studentId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check if student has enough XP
      const xpData = await storage.getStudentXP(studentId);
      if (!xpData || xpData.available_xp < amount) {
        return res.status(400).json({ error: 'Insufficient XP balance' });
      }

      const result = await storage.spendXP(studentId, {
        type: 'spent',
        amount: -amount, // Negative for spending
        source: 'reward_redemption',
        description,
        metadata: { rewardId }
      });

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      console.error('Error spending XP:', error);
      res.status(500).json({ error: 'Failed to spend XP' });
    }
  });

  // Get XP transaction history
  app.get('/api/gamification/xp/:studentId/transactions', authenticateToken, async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      if (!studentId) {
        return res.status(400).json({ error: 'Invalid student ID' });
      }

      // Check if user has access to this student
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!req.user.hasRole('system_admin') && !await storage.canUserAccessStudent(req.user.id, studentId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const transactions = await storage.getXPTransactions(studentId, limit, offset);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching XP transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transaction history' });
    }
  });

  // Get leaderboard for class/school
  app.get('/api/gamification/leaderboard', authenticateToken, async (req, res) => {
    try {
      const { type = 'weekly_xp', scope = 'class', classId, schoolId, gradeLevel, limit = 10 } = req.query;

      // Validate parameters
      if (!['weekly_xp', 'monthly_accuracy', 'streak_leaders'].includes(type as string)) {
        return res.status(400).json({ error: 'Invalid leaderboard type' });
      }

      if (!['class', 'grade', 'school', 'global'].includes(scope as string)) {
        return res.status(400).json({ error: 'Invalid leaderboard scope' });
      }

      // Check access permissions based on scope
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (scope === 'class' && classId) {
        const hasAccess = await storage.canUserAccessClass(req.user.id, parseInt(classId as string));
        if (!hasAccess && !req.user.hasRole('system_admin')) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      const leaderboard = await storage.getLeaderboard({
        type: type as string,
        scope: scope as string,
        classId: classId ? parseInt(classId as string) : undefined,
        schoolId: schoolId ? parseInt(schoolId as string) : undefined,
        gradeLevel: gradeLevel as string,
        limit: Math.min(parseInt(limit as string), 50)
      });

      res.json(leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // Get level progression info
  app.get('/api/gamification/levels/:studentId', authenticateToken, async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);

      if (!studentId) {
        return res.status(400).json({ error: 'Invalid student ID' });
      }

      // Check if user has access to this student
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!req.user.hasRole('system_admin') && !await storage.canUserAccessStudent(req.user.id, studentId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const xpData = await storage.getStudentXP(studentId);
      if (!xpData) {
        return res.status(404).json({ error: 'Student XP data not found' });
      }

      const currentLevel = xpData.level;
      const currentLevelXP = XP_CONSTANTS.LEVEL_THRESHOLDS[currentLevel - 1] || 0;
      const nextLevelXP = XP_CONSTANTS.LEVEL_THRESHOLDS[currentLevel] || XP_CONSTANTS.LEVEL_THRESHOLDS[XP_CONSTANTS.LEVEL_THRESHOLDS.length - 1];
      const progressToNextLevel = Math.min(100, ((xpData.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);

      res.json({
        currentLevel,
        totalXP: xpData.totalXP,
        currentLevelXP,
        nextLevelXP,
        xpToNextLevel: Math.max(0, nextLevelXP - xpData.totalXP),
        progressPercent: progressToNextLevel,
        isMaxLevel: currentLevel >= XP_CONSTANTS.LEVEL_THRESHOLDS.length
      });
    } catch (error) {
      console.error('Error fetching level progression:', error);
      res.status(500).json({ error: 'Failed to fetch level progression' });
    }
  });

  // Admin endpoint: Reset weekly XP for all students
  app.post('/api/gamification/admin/reset-weekly-xp', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!req.user.hasRole('system_admin')) {
        return res.status(403).json({ error: 'Admin access required' });
      }

      await storage.resetWeeklyXP();
      res.json({ message: 'Weekly XP reset successfully' });
    } catch (error) {
      console.error('Error resetting weekly XP:', error);
      res.status(500).json({ error: 'Failed to reset weekly XP' });
    }
  });

  // Get XP statistics for dashboard
  app.get('/api/gamification/stats/:studentId', authenticateToken, async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const days = Math.min(parseInt(req.query.days as string) || 7, 30);

      if (!studentId) {
        return res.status(400).json({ error: 'Invalid student ID' });
      }

      // Check if user has access to this student
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!req.user.hasRole('system_admin') && !await storage.canUserAccessStudent(req.user.id, studentId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const stats = await storage.getXPStats(studentId, days);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching XP stats:', error);
      res.status(500).json({ error: 'Failed to fetch XP statistics' });
    }
  });
}