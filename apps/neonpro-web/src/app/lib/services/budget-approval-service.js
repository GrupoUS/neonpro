var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetApprovalService = void 0;
var server_1 = require("@/lib/supabase/server");
var BudgetApprovalService = /** @class */ (() => {
  function BudgetApprovalService() {}
  BudgetApprovalService.prototype.getSupabaseClient = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 2:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  // =====================================================================================
  // BUDGET MANAGEMENT
  // =====================================================================================
  BudgetApprovalService.prototype.createBudget = function (request, clinicId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var budgetData, _a, budget, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            budgetData = __assign(__assign({}, request), {
              clinic_id: clinicId,
              created_by: userId,
              allocated_amount: 0,
              spent_amount: 0,
              remaining_amount: request.total_amount,
              status: "draft",
            });
            return [
              4 /*yield*/,
              supabase.from("inventory_budgets").insert(budgetData).select().single(),
            ];
          case 1:
            (_a = _b.sent()), (budget = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to create budget: ".concat(error.message));
            if (!(request.allocations && request.allocations.length > 0)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.createBudgetAllocations(budget.id, request.allocations)];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            return [2 /*return*/, budget];
        }
      });
    });
  };
  BudgetApprovalService.prototype.getBudget = function (budgetId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase.from("inventory_budgets").select("*").eq("id", budgetId).single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error && error.code !== "PGRST116") {
              throw new Error("Failed to get budget: ".concat(error.message));
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  BudgetApprovalService.prototype.updateBudget = function (budgetId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("inventory_budgets")
                .update(updates)
                .eq("id", budgetId)
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to update budget: ".concat(error.message));
            return [2 /*return*/, data];
        }
      });
    });
  };
  BudgetApprovalService.prototype.listBudgets = function (clinicId, filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            query = supabase
              .from("inventory_budgets")
              .select("*")
              .eq("clinic_id", clinicId)
              .order("created_at", { ascending: false });
            if (filters === null || filters === void 0 ? void 0 : filters.status) {
              query = query.eq("status", filters.status);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.fiscalYear) {
              query = query.eq("fiscal_year", filters.fiscalYear);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.budgetType) {
              query = query.eq("budget_type", filters.budgetType);
            }
            if (filters === null || filters === void 0 ? void 0 : filters.costCenterId) {
              query = query.eq("cost_center_id", filters.costCenterId);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to list budgets: ".concat(error.message));
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  BudgetApprovalService.prototype.approveBudget = function (budgetId, approverId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("inventory_budgets")
                .update({
                  status: "active",
                  approved_by: approverId,
                  approved_at: new Date().toISOString(),
                })
                .eq("id", budgetId)
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to approve budget: ".concat(error.message));
            return [2 /*return*/, data];
        }
      });
    });
  };
  BudgetApprovalService.prototype.validateBudget = function (budgetId) {
    return __awaiter(this, void 0, void 0, function () {
      var budget, errors, warnings, recommendations, startDate, endDate, utilizationRate;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getBudget(budgetId)];
          case 1:
            budget = _a.sent();
            if (!budget) {
              return [
                2 /*return*/,
                {
                  is_valid: false,
                  errors: ["Budget not found"],
                  warnings: [],
                  recommendations: [],
                },
              ];
            }
            errors = [];
            warnings = [];
            recommendations = [];
            // Validate budget amounts
            if (budget.total_amount <= 0) {
              errors.push("Total amount must be positive");
            }
            if ((budget.allocated_amount || 0) > budget.total_amount) {
              errors.push("Allocated amount exceeds total budget");
            }
            if ((budget.spent_amount || 0) > (budget.allocated_amount || 0)) {
              warnings.push("Spent amount exceeds allocated amount");
            }
            startDate = new Date(budget.budget_period_start || "");
            endDate = new Date(budget.budget_period_end || "");
            if (startDate >= endDate) {
              errors.push("Budget period start date must be before end date");
            }
            utilizationRate =
              (budget.allocated_amount || 0) > 0
                ? ((budget.spent_amount || 0) / (budget.allocated_amount || 0)) * 100
                : 0;
            if (utilizationRate > 90) {
              warnings.push("Budget utilization is above 90%");
              recommendations.push("Consider reallocating funds or requesting budget increase");
            } else if (utilizationRate < 50) {
              recommendations.push(
                "Budget utilization is low - consider reallocating unused funds",
              );
            }
            return [
              2 /*return*/,
              {
                is_valid: errors.length === 0,
                errors: errors,
                warnings: warnings,
                recommendations: recommendations,
              },
            ];
        }
      });
    });
  };
  // =====================================================================================
  // BUDGET ALLOCATION MANAGEMENT
  // =====================================================================================
  BudgetApprovalService.prototype.createBudgetAllocations = function (budgetId, allocations) {
    return __awaiter(this, void 0, void 0, function () {
      var allocationsData, _a, data, error, totalAllocated;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            allocationsData = allocations.map((allocation) =>
              __assign(__assign({}, allocation), {
                budget_id: budgetId,
                available_amount: allocation.allocated_amount,
                percentage_of_total: 0, // Will be calculated after insert
              }),
            );
            return [
              4 /*yield*/,
              supabase.from("budget_allocations").insert(allocationsData).select(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error)
              throw new Error("Failed to create budget allocations: ".concat(error.message));
            totalAllocated = allocations.reduce(
              (sum, allocation) => sum + allocation.allocated_amount,
              0,
            );
            return [4 /*yield*/, this.updateBudgetAllocatedAmount(budgetId, totalAllocated)];
          case 2:
            _b.sent();
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  BudgetApprovalService.prototype.getBudgetAllocations = function (budgetId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("budget_allocations")
                .select("*")
                .eq("budget_id", budgetId)
                .order("allocated_amount", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to get budget allocations: ".concat(error.message));
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  BudgetApprovalService.prototype.updateBudgetAllocation = function (allocationId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("budget_allocations")
                .update(updates)
                .eq("id", allocationId)
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error)
              throw new Error("Failed to update budget allocation: ".concat(error.message));
            return [2 /*return*/, data];
        }
      });
    });
  };
  BudgetApprovalService.prototype.updateBudgetAllocatedAmount = function (
    budgetId,
    additionalAmount,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              supabase.rpc("update_budget_allocated_amount", {
                budget_id: budgetId,
                additional_amount: additionalAmount,
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error)
              throw new Error("Failed to update budget allocated amount: ".concat(error.message));
            return [2 /*return*/];
        }
      });
    });
  };
  // =====================================================================================
  // COST CENTER MANAGEMENT
  // =====================================================================================
  BudgetApprovalService.prototype.createCostCenter = function (costCenter, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("cost_centers")
                .insert(__assign(__assign({}, costCenter), { clinic_id: clinicId }))
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to create cost center: ".concat(error.message));
            return [2 /*return*/, data];
        }
      });
    });
  };
  BudgetApprovalService.prototype.listCostCenters = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("cost_centers")
                .select("*")
                .eq("clinic_id", clinicId)
                .eq("is_active", true)
                .order("name"),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to list cost centers: ".concat(error.message));
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  // =====================================================================================
  // APPROVAL WORKFLOW MANAGEMENT
  // =====================================================================================
  BudgetApprovalService.prototype.createApprovalRequest = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var approvals, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            approvals = [
              {
                purchase_order_id: request.purchase_order_id,
                approver_id: "", // Would be assigned based on business rules
                approval_level: 1,
                status: "pending",
              },
            ];
            return [
              4 /*yield*/,
              supabase.from("purchase_order_approvals").insert(approvals).select(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to create approval request: ".concat(error.message));
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  BudgetApprovalService.prototype.processApproval = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var updates, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            updates = {
              status: "approved", // Simplified - would use request.decision in real implementation
              decision_date: new Date().toISOString(),
              comments: "Processed via API",
            };
            return [
              4 /*yield*/,
              supabase
                .from("purchase_order_approvals")
                .update(updates)
                .eq("id", "approval-id") // Would use request.approval_id in real implementation
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to process approval: ".concat(error.message));
            return [2 /*return*/, data];
        }
      });
    });
  };
  BudgetApprovalService.prototype.checkApprovalEligibility = function (purchaseOrderId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase,
        _a,
        approvals,
        error,
        totalApprovals,
        approvedCount,
        rejectedCount,
        pendingCount,
        isEligible,
        escalationRequired;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("purchase_order_approvals")
                .select("*")
                .eq("purchase_order_id", purchaseOrderId),
            ];
          case 2:
            (_a = _b.sent()), (approvals = _a.data), (error = _a.error);
            if (error)
              throw new Error("Failed to check approval eligibility: ".concat(error.message));
            totalApprovals =
              (approvals === null || approvals === void 0 ? void 0 : approvals.length) || 0;
            approvedCount =
              (approvals === null || approvals === void 0
                ? void 0
                : approvals.filter((a) => a.status === "approved").length) || 0;
            rejectedCount =
              (approvals === null || approvals === void 0
                ? void 0
                : approvals.filter((a) => a.status === "rejected").length) || 0;
            pendingCount =
              (approvals === null || approvals === void 0
                ? void 0
                : approvals.filter((a) => a.status === "pending").length) || 0;
            isEligible =
              rejectedCount === 0 && pendingCount === 0 && approvedCount >= totalApprovals;
            escalationRequired =
              (approvals === null || approvals === void 0
                ? void 0
                : approvals.some((a) => a.status === "escalated")) || false;
            return [
              2 /*return*/,
              {
                is_eligible: isEligible,
                required_approvals: totalApprovals,
                current_approvals: approvedCount,
                missing_approvals: [], // Would need to fetch workflow levels
                auto_approval_possible: false,
                escalation_required: escalationRequired,
                blocking_factors:
                  rejectedCount > 0
                    ? ["Approval rejected"]
                    : pendingCount > 0
                      ? ["Pending approvals"]
                      : [],
              },
            ];
        }
      });
    });
  };
  BudgetApprovalService.prototype.getApplicableWorkflowRules = function (amount, category) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("approval_workflow_rules")
                .select("*")
                .eq("is_active", true)
                .lte("effective_from", new Date().toISOString())
                .order("priority", { ascending: true }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to get workflow rules: ".concat(error.message));
            // Filter rules based on trigger conditions
            return [
              2 /*return*/,
              (data || []).filter((rule) => {
                var conditions = rule.trigger_conditions;
                // Check amount range
                if (conditions.min_amount && amount < conditions.min_amount) return false;
                if (conditions.max_amount && amount > conditions.max_amount) return false;
                // Check category
                if (conditions.categories && category && !conditions.categories.includes(category))
                  return false;
                return true;
              }),
            ];
        }
      });
    });
  };
  BudgetApprovalService.prototype.createWorkflowRule = function (request, clinicId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("approval_workflow_rules")
                .insert(
                  __assign(__assign({}, request), { clinic_id: clinicId, created_by: userId }),
                )
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw new Error("Failed to create workflow rule: ".concat(error.message));
            return [2 /*return*/, data];
        }
      });
    });
  };
  // =====================================================================================
  // ANALYTICS & REPORTING
  // =====================================================================================
  BudgetApprovalService.prototype.getBudgetUtilization = function (budgetId) {
    return __awaiter(this, void 0, void 0, function () {
      var budget, allocations, utilizationPercentage, categories;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getBudget(budgetId)];
          case 1:
            budget = _a.sent();
            if (!budget) throw new Error("Budget not found");
            return [4 /*yield*/, this.getBudgetAllocations(budgetId)];
          case 2:
            allocations = _a.sent();
            utilizationPercentage =
              (budget.allocated_amount || 0) > 0
                ? ((budget.spent_amount || 0) / (budget.allocated_amount || 0)) * 100
                : 0;
            categories = allocations.map((allocation) => ({
              category: allocation.category,
              allocated: allocation.allocated_amount,
              spent: allocation.spent_amount || 0,
              available: allocation.allocated_amount - (allocation.spent_amount || 0),
              utilization:
                allocation.allocated_amount > 0
                  ? ((allocation.spent_amount || 0) / allocation.allocated_amount) * 100
                  : 0,
            }));
            return [
              2 /*return*/,
              {
                budget_name: budget.name,
                total_allocated: budget.allocated_amount || 0,
                total_spent: budget.spent_amount || 0,
                total_reserved: 0, // Simplified
                total_available: budget.remaining_amount || 0,
                utilization_percentage: utilizationPercentage,
                categories: categories,
                period_start: budget.created_at, // Using created_at as fallback
                period_end: budget.updated_at, // Using updated_at as fallback
                last_updated: new Date().toISOString(),
              },
            ];
        }
      });
    });
  };
  BudgetApprovalService.prototype.getApprovalWorkflowPerformance = function (
    workflowId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // This would require more complex queries in a real implementation
        // For now, returning a mock structure
        return [
          2 /*return*/,
          {
            workflow_name: "Default Approval Workflow",
            total_requests: 0,
            approved_requests: 0,
            rejected_requests: 0,
            pending_requests: 0,
            escalated_requests: 0,
            average_approval_time_hours: 0,
            auto_approval_rate: 0,
            escalation_rate: 0,
            bottlenecks: [],
            period_start: periodStart,
            period_end: periodEnd,
          },
        ];
      });
    });
  };
  BudgetApprovalService.prototype.generateBudgetOptimizationRecommendations = function (budgetId) {
    return __awaiter(this, void 0, void 0, function () {
      var budget, allocations, recommendations, _i, allocations_1, allocation, utilizationRate;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getBudget(budgetId)];
          case 1:
            budget = _a.sent();
            if (!budget) return [2 /*return*/, []];
            return [4 /*yield*/, this.getBudgetAllocations(budgetId)];
          case 2:
            allocations = _a.sent();
            recommendations = [];
            // Analyze each allocation for optimization opportunities
            for (_i = 0, allocations_1 = allocations; _i < allocations_1.length; _i++) {
              allocation = allocations_1[_i];
              utilizationRate =
                allocation.allocated_amount > 0
                  ? ((allocation.spent_amount || 0) / allocation.allocated_amount) * 100
                  : 0;
              if (utilizationRate < 50 && allocation.allocated_amount > 1000) {
                recommendations.push({
                  type: "decrease",
                  priority: "medium",
                  budget_id: budgetId,
                  budget_name: budget.name,
                  current_allocation: allocation.allocated_amount,
                  recommended_allocation: allocation.allocated_amount * 0.8,
                  potential_savings: allocation.allocated_amount * 0.2,
                  reasoning: "Low utilization rate suggests over-allocation",
                  impact_analysis:
                    "Reallocating excess funds can improve overall budget efficiency",
                  implementation_effort: "low",
                  risk_level: "low",
                  confidence_score: 0.75,
                });
              } else if (utilizationRate > 95) {
                recommendations.push({
                  type: "increase",
                  priority: "high",
                  budget_id: budgetId,
                  budget_name: budget.name,
                  current_allocation: allocation.allocated_amount,
                  recommended_allocation: allocation.allocated_amount * 1.2,
                  potential_savings: 0,
                  reasoning: "High utilization rate suggests potential shortage",
                  impact_analysis: "Increasing allocation prevents potential stockouts",
                  implementation_effort: "medium",
                  risk_level: "medium",
                  confidence_score: 0.8,
                });
              }
            }
            return [2 /*return*/, recommendations];
        }
      });
    });
  };
  BudgetApprovalService.prototype.generateBudgetForecast = function (budgetId_1) {
    return __awaiter(this, arguments, void 0, function (budgetId, forecastMonths) {
      var budget, forecasts, currentDate, monthlySpendRate, i, forecastDate, predictedSpend;
      if (forecastMonths === void 0) {
        forecastMonths = 3;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getBudget(budgetId)];
          case 1:
            budget = _a.sent();
            if (!budget) return [2 /*return*/, []];
            forecasts = [];
            currentDate = new Date();
            monthlySpendRate = (budget.spent_amount || 0) / 12;
            for (i = 1; i <= forecastMonths; i++) {
              forecastDate = new Date(currentDate);
              forecastDate.setMonth(forecastDate.getMonth() + i);
              predictedSpend = (budget.spent_amount || 0) + monthlySpendRate * i;
              forecasts.push({
                budget_id: budgetId,
                forecast_period: i * 30, // days
                predicted_spend: predictedSpend,
                confidence_interval: {
                  lower: predictedSpend * 0.9,
                  upper: predictedSpend * 1.1,
                  level: 0.95,
                },
                projected_variance: predictedSpend * 0.1,
                risk_factors: predictedSpend > budget.total_amount ? ["Budget overrun risk"] : [],
                recommendations:
                  predictedSpend > budget.total_amount * 0.9 ? ["Monitor spending closely"] : [],
                forecast_accuracy: 70,
              });
            }
            return [2 /*return*/, forecasts];
        }
      });
    });
  };
  // =====================================================================================
  // NOTIFICATION MANAGEMENT
  // =====================================================================================
  BudgetApprovalService.prototype.createBudgetNotification = function (notification) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase.from("budget_notifications").insert(notification).select().single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error)
              throw new Error("Failed to create budget notification: ".concat(error.message));
            return [2 /*return*/, data];
        }
      });
    });
  };
  BudgetApprovalService.prototype.getBudgetNotifications = function (budgetId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("budget_notifications")
                .select("*")
                .eq("budget_id", budgetId)
                .order("created_at", { ascending: false }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error)
              throw new Error("Failed to get budget notifications: ".concat(error.message));
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  BudgetApprovalService.prototype.acknowledgeNotification = function (notificationId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("budget_notifications")
                .update({
                  acknowledged_at: new Date().toISOString(),
                  acknowledged_by: userId,
                })
                .eq("id", notificationId)
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error)
              throw new Error("Failed to acknowledge notification: ".concat(error.message));
            return [2 /*return*/, data];
        }
      });
    });
  };
  return BudgetApprovalService;
})();
exports.BudgetApprovalService = BudgetApprovalService;
