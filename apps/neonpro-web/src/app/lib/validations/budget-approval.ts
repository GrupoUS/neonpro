import { z } from 'zod';

export const budgetPeriodUpdateSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  totalBudget: z.number().positive(),
  allocatedBudget: z.number().nonnegative(),
  spentBudget: z.number().nonnegative(),
  categories: z.array(z.object({
    name: z.string(),
    allocation: z.number().positive(),
    spent: z.number().nonnegative()
  })),
  approvalStatus: z.enum(['pending', 'approved', 'rejected', 'under_review']),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.date().optional(),
  notes: z.string().optional()
});

export const createBudgetPeriodSchema = budgetPeriodUpdateSchema.extend({
  clinicId: z.string().uuid(),
  createdBy: z.string().uuid()
});

export type BudgetPeriod = z.infer<typeof createBudgetPeriodSchema>;
export type BudgetPeriodUpdate = z.infer<typeof budgetPeriodUpdateSchema>;


// Missing exports for budget approval API routes
export const approvalSchema = z.object({
  placeholder: z.string().optional()
});

export const budgetSchema = z.object({
  placeholder: z.string().optional()
});

export const bulkBudgetCreateSchema = z.object({
  placeholder: z.string().optional()
});


