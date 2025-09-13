// Authentication API Routes

import express, { Request, Response } from 'express';
import Joi from 'joi';
import { authService } from './auth';
import { authenticateToken, requireSystemAdmin, requireSchoolAdmin } from './auth-middleware';

const router = express.Router();

// Validation schemas
const signInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const completeInvitationSchema = Joi.object({
  token: Joi.string().required(),
  fullName: Joi.string().min(2).required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional(),
});

const inviteUserSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid('teacher', 'parent', 'student', 'school_admin').required(),
  schoolId: Joi.number().optional(),
});

const createSystemAdminSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().min(2).required(),
});

// POST /api/auth/signin
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { error, value } = signInSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }

    const { email, password } = value;
    const result = await authService.signIn(email, password);

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    res.json({
      success: true,
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/complete-invitation
router.post('/complete-invitation', async (req: Request, res: Response) => {
  try {
    const { error, value } = completeInvitationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }

    const { token, fullName, password, phone } = value;
    const result = await authService.completeInvitation(token, {
      fullName,
      password,
      phone,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      user: result.user,
      token: result.authToken,
    });
  } catch (error) {
    console.error('Complete invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/invite - Invite a new user (admin only)
router.post('/invite', authenticateToken, requireSchoolAdmin, async (req: Request, res: Response) => {
  try {
    const { error, value } = inviteUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }

    const { email, role, schoolId } = value;
    
    // For school-specific roles, require schoolId
    if (['teacher', 'parent', 'student', 'school_admin'].includes(role) && !schoolId) {
      return res.status(400).json({ 
        error: 'School ID required for this role' 
      });
    }

    const result = await authService.inviteUser(req.user!.id, {
      email,
      role,
      schoolId,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // In production, this would send an email with the invitation link
    // For now, return the token for testing
    res.json({
      success: true,
      message: 'Invitation created successfully',
      // Remove token from response in production
      invitationToken: result.invitation?.token,
    });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/create-system-admin - Bootstrap system admin (dev only)
router.post('/create-system-admin', async (req: Request, res: Response) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ error: 'Not found' });
    }

    const { error, value } = createSystemAdminSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }

    const { email, password, fullName } = value;
    const result = await authService.createSystemAdmin(email, password, fullName);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'System admin created successfully',
      user: result.user,
    });
  } catch (error) {
    console.error('Create system admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    // With JWT, logout is handled client-side by discarding the token
    // In production, you might maintain a token blacklist
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;