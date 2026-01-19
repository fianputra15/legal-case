import { z } from 'zod';

/**
 * Request validation schemas using Zod
 */

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['admin', 'lawyer', 'client']).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

// Case validation schemas
export const createCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  category: z.enum(['CRIMINAL_LAW', 'CIVIL_LAW', 'CORPORATE_LAW', 'FAMILY_LAW', 'IMMIGRATION_LAW', 'INTELLECTUAL_PROPERTY', 'LABOR_LAW', 'REAL_ESTATE', 'TAX_LAW', 'OTHER'], {
    message: 'Invalid category. Must be one of: CRIMINAL_LAW, CIVIL_LAW, CORPORATE_LAW, FAMILY_LAW, IMMIGRATION_LAW, INTELLECTUAL_PROPERTY, LABOR_LAW, REAL_ESTATE, TAX_LAW, OTHER'
  }),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'AWAITING_CLIENT', 'CLOSED', 'ARCHIVED']).optional(),
  description: z.string().optional(),
});

export const updateCaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
  category: z.enum(['CRIMINAL_LAW', 'CIVIL_LAW', 'CORPORATE_LAW', 'FAMILY_LAW', 'IMMIGRATION_LAW', 'INTELLECTUAL_PROPERTY', 'LABOR_LAW', 'REAL_ESTATE', 'TAX_LAW', 'OTHER'], {
    message: 'Invalid category. Must be one of: CRIMINAL_LAW, CIVIL_LAW, CORPORATE_LAW, FAMILY_LAW, IMMIGRATION_LAW, INTELLECTUAL_PROPERTY, LABOR_LAW, REAL_ESTATE, TAX_LAW, OTHER'
  }).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'AWAITING_CLIENT', 'CLOSED', 'ARCHIVED'], {
    message: 'Invalid status. Must be one of: OPEN, IN_PROGRESS, UNDER_REVIEW, AWAITING_CLIENT, CLOSED, ARCHIVED'
  }).optional(),
  description: z.string().optional(),
});

// Message validation schemas
export const createMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  caseId: z.string().uuid('Invalid case ID'),
});

export const updateMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
});

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = createUserSchema;

// Query parameter validation schemas
export const getCasesQuerySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1)).default(1),
  limit: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(100)).default(10),
  search: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'UNDER_REVIEW', 'AWAITING_CLIENT', 'CLOSED', 'ARCHIVED']).optional(),
  category: z.enum(['CRIMINAL_LAW', 'CIVIL_LAW', 'CORPORATE_LAW', 'FAMILY_LAW', 'IMMIGRATION_LAW', 'INTELLECTUAL_PROPERTY', 'LABOR_LAW', 'REAL_ESTATE', 'TAX_LAW', 'OTHER']).optional(),
});

/**
 * Validation helper function
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.issues.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}