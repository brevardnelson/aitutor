// ID Validation Middleware for Express
// Safely converts and validates string IDs to numbers with proper error handling

import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include validated IDs
declare global {
  namespace Express {
    interface Request {
      validatedIds?: Record<string, number>;
    }
  }
}

/**
 * Validate and convert a string ID to a positive integer
 * @param id - The string ID to validate
 * @param paramName - The parameter name for error messages
 * @returns The validated integer ID or null if invalid
 */
function validateId(id: string | undefined, paramName: string): number | null {
  if (!id) {
    return null;
  }

  // Remove any whitespace
  const trimmedId = id.toString().trim();
  
  // Check if it's a valid number string
  if (!/^\d+$/.test(trimmedId)) {
    return null;
  }

  const numericId = parseInt(trimmedId, 10);
  
  // Ensure it's a positive integer and not NaN
  if (isNaN(numericId) || numericId <= 0 || !Number.isInteger(numericId)) {
    return null;
  }

  // Additional safety check for extremely large numbers
  if (numericId > Number.MAX_SAFE_INTEGER) {
    return null;
  }

  return numericId;
}

/**
 * Middleware to validate route parameters that are IDs
 * @param paramNames - Array of parameter names to validate (e.g., ['childId', 'sessionId'])
 */
export const validateParamIds = (paramNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const invalidParams: string[] = [];
    const validatedIds: Record<string, number> = {};

    for (const paramName of paramNames) {
      const paramValue = req.params[paramName];
      const validatedId = validateId(paramValue, paramName);
      
      if (validatedId === null) {
        invalidParams.push(paramName);
      } else {
        validatedIds[paramName] = validatedId;
      }
    }

    if (invalidParams.length > 0) {
      res.status(400).json({
        error: 'Invalid ID parameters',
        details: `The following parameters must be positive integers: ${invalidParams.join(', ')}`,
        invalidParams,
      });
      return;
    }

    // Store validated IDs in request object for use in route handlers
    req.validatedIds = validatedIds;
    next();
  };
};

/**
 * Middleware to validate body properties that are IDs
 * @param idFields - Array of body field names to validate (e.g., ['studentId', 'classId'])
 */
export const validateBodyIds = (idFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const invalidFields: string[] = [];
    const validatedIds: Record<string, number> = req.validatedIds || {};

    for (const fieldName of idFields) {
      const fieldValue = req.body[fieldName];
      
      // Skip validation if field is optional and not provided
      if (fieldValue === undefined || fieldValue === null) {
        continue;
      }
      
      const validatedId = validateId(fieldValue?.toString(), fieldName);
      
      if (validatedId === null) {
        invalidFields.push(fieldName);
      } else {
        validatedIds[fieldName] = validatedId;
      }
    }

    if (invalidFields.length > 0) {
      res.status(400).json({
        error: 'Invalid ID fields in request body',
        details: `The following fields must be positive integers: ${invalidFields.join(', ')}`,
        invalidFields,
      });
      return;
    }

    req.validatedIds = validatedIds;
    next();
  };
};

/**
 * Convenience function to get a validated ID from the request
 * @param req - Express request object
 * @param idName - Name of the ID to retrieve
 * @returns The validated ID number or throws an error if not found
 */
export const getValidatedId = (req: Request, idName: string): number => {
  const validatedId = req.validatedIds?.[idName];
  if (validatedId === undefined) {
    throw new Error(`Validated ID '${idName}' not found. Ensure ID validation middleware is applied.`);
  }
  return validatedId;
};

/**
 * Combined middleware that validates both params and body IDs
 * @param paramNames - Array of parameter names to validate
 * @param bodyFields - Array of body field names to validate
 */
export const validateAllIds = (paramNames: string[] = [], bodyFields: string[] = []) => {
  return [
    validateParamIds(paramNames),
    validateBodyIds(bodyFields)
  ];
};