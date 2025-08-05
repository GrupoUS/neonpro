Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkBudgetCreateSchema =
  exports.budgetSchema =
  exports.approvalSchema =
  exports.createBudgetPeriodSchema =
  exports.budgetPeriodUpdateSchema =
    void 0;
var zod_1 = require("zod");
exports.budgetPeriodUpdateSchema = zod_1.z.object({
  startDate: zod_1.z.date(),
  endDate: zod_1.z.date(),
  totalBudget: zod_1.z.number().positive(),
  allocatedBudget: zod_1.z.number().nonnegative(),
  spentBudget: zod_1.z.number().nonnegative(),
  categories: zod_1.z.array(
    zod_1.z.object({
      name: zod_1.z.string(),
      allocation: zod_1.z.number().positive(),
      spent: zod_1.z.number().nonnegative(),
    }),
  ),
  approvalStatus: zod_1.z.enum(["pending", "approved", "rejected", "under_review"]),
  approvedBy: zod_1.z.string().uuid().optional(),
  approvedAt: zod_1.z.date().optional(),
  notes: zod_1.z.string().optional(),
});
exports.createBudgetPeriodSchema = exports.budgetPeriodUpdateSchema.extend({
  clinicId: zod_1.z.string().uuid(),
  createdBy: zod_1.z.string().uuid(),
});
// Missing exports for budget approval API routes
exports.approvalSchema = zod_1.z.object({
  placeholder: zod_1.z.string().optional(),
});
exports.budgetSchema = zod_1.z.object({
  placeholder: zod_1.z.string().optional(),
});
exports.bulkBudgetCreateSchema = zod_1.z.object({
  placeholder: zod_1.z.string().optional(),
});
