// Authentication and RBAC Middleware for Express

import { Request, Response, NextFunction } from 'express';
import { authService, AuthenticatedUser } from './auth';
import type { UserRole } from '../src/types/auth';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Authentication middleware - verifies JWT token
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const user = await authService.getUserFromToken(token);
    if (!user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Role-based authorization middleware
export const requireRole = (roles: UserRole[], schoolId?: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const hasRequiredRole = authService.hasAnyRole(req.user, roles, schoolId);
    if (!hasRequiredRole) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.primaryRole
      });
      return;
    }

    next();
  };
};

// Permission-based authorization middleware
export const requirePermission = (permissions: string[], schoolId?: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const hasPermission = permissions.some(permission => 
      authService.hasPermission(req.user!, permission, schoolId)
    );

    if (!hasPermission) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permissions,
        user_permissions: req.user.roles.flatMap(r => r.permissions)
      });
      return;
    }

    next();
  };
};

// School access authorization middleware
export const requireSchoolAccess = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const schoolId = parseInt(req.params.schoolId);
    if (isNaN(schoolId)) {
      res.status(400).json({ error: 'Invalid school ID' });
      return;
    }

    const canAccess = authService.canAccessSchool(req.user, schoolId);
    if (!canAccess) {
      res.status(403).json({ 
        error: 'Access denied to this school',
        schoolId
      });
      return;
    }

    next();
  };
};

// System admin only middleware
export const requireSystemAdmin = requireRole(['system_admin']);

// School admin or system admin middleware  
export const requireSchoolAdmin = requireRole(['system_admin', 'school_admin']);

// Teacher or above middleware
export const requireTeacherOrAbove = requireRole(['system_admin', 'school_admin', 'teacher']);