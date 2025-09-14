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
  amount: z.number().min(1).max(1000),
  metadata: z.object({
    problemId: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    hintsUsed: z.number().optional(),
    challengeId: z.number().optional(),
    sessionId: z.number().optional()
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

  // Earn XP - called when student completes activities
  app.post('/api/gamification/xp/earn', authenticateToken, async (req, res) => {
    try {
      const validatedData = EarnXPSchema.parse(req.body);
      const { studentId, source, amount, metadata } = validatedData;

      // Check if user has access to this student
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (!req.user.hasRole('system_admin') && !await storage.canUserAccessStudent(req.user.id, studentId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Calculate actual XP based on source and metadata
      let actualXP = amount;
      let description = '';

      if (source === 'problem_completion' && metadata) {
        actualXP = calculateXPForProblem(
          metadata.difficulty || 'medium',
          metadata.hintsUsed || 0
        );
        description = `Completed ${metadata.difficulty} problem${metadata.hintsUsed === 0 ? ' without hints!' : ''}`;
      } else if (source === 'no_hints_bonus') {
        actualXP = XP_CONSTANTS.NO_HINTS_BONUS;
        description = 'Bonus for solving without hints!';
      } else if (source === 'streak_bonus') {
        description = 'Daily streak bonus!';
      } else if (source === 'challenge_completion') {
        description = 'Challenge completed!';
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