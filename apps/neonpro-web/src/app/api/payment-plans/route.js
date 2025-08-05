// NeonPro - Payment Plans API Routes
// Story 6.1 - Task 3: Installment Management System
// API endpoints for payment plan management
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
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var installment_manager_1 = require("@/lib/payments/installments/installment-manager");
// Validation schemas
var createPaymentPlanSchema = zod_1.z.object({
  customerId: zod_1.z.string().uuid(),
  totalAmount: zod_1.z.number().positive(),
  currency: zod_1.z.string().length(3).default("BRL"),
  installmentCount: zod_1.z.number().int().min(1).max(60),
  frequency: zod_1.z.enum(["weekly", "biweekly", "monthly", "quarterly"]),
  startDate: zod_1.z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  description: zod_1.z.string().optional(),
  metadata: zod_1.z.record(zod_1.z.any()).optional().default({}),
});
var updatePaymentPlanSchema = zod_1.z.object({
  totalAmount: zod_1.z.number().positive().optional(),
  installmentCount: zod_1.z.number().int().min(1).max(60).optional(),
  frequency: zod_1.z.enum(["weekly", "biweekly", "monthly", "quarterly"]).optional(),
  startDate: zod_1.z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .optional(),
  description: zod_1.z.string().optional(),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
var querySchema = zod_1.z.object({
  page: zod_1.z
    .string()
    .transform(Number)
    .pipe(zod_1.z.number().int().min(1))
    .optional()
    .default("1"),
  limit: zod_1.z
    .string()
    .transform(Number)
    .pipe(zod_1.z.number().int().min(1).max(100))
    .optional()
    .default("20"),
  status: zod_1.z.enum(["active", "completed", "cancelled", "defaulted"]).optional(),
  customerId: zod_1.z.string().uuid().optional(),
  frequency: zod_1.z.enum(["weekly", "biweekly", "monthly", "quarterly"]).optional(),
  sortBy: zod_1.z
    .enum(["created_at", "start_date", "total_amount", "status"])
    .optional()
    .default("created_at"),
  sortOrder: zod_1.z.enum(["asc", "desc"]).optional().default("desc"),
});
/**
 * GET /api/payment-plans
 * List payment plans with filtering and pagination
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      url,
      queryParams,
      validatedQuery,
      page,
      limit,
      status_1,
      customerId,
      frequency,
      sortBy,
      sortOrder,
      installmentManager,
      filters,
      result,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _b.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          url = new URL(request.url);
          queryParams = Object.fromEntries(url.searchParams.entries());
          validatedQuery = querySchema.parse(queryParams);
          (page = validatedQuery.page),
            (limit = validatedQuery.limit),
            (status_1 = validatedQuery.status),
            (customerId = validatedQuery.customerId),
            (frequency = validatedQuery.frequency),
            (sortBy = validatedQuery.sortBy),
            (sortOrder = validatedQuery.sortOrder);
          installmentManager = (0, installment_manager_1.getInstallmentManager)();
          filters = {};
          if (status_1) filters.status = status_1;
          if (customerId) filters.customerId = customerId;
          if (frequency) filters.frequency = frequency;
          return [
            4 /*yield*/,
            installmentManager.getPaymentPlans({
              page: page,
              limit: limit,
              filters: filters,
              sortBy: sortBy,
              sortOrder: sortOrder,
            }),
          ];
        case 3:
          result = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: result.data,
              pagination: result.pagination,
              filters: {
                status: status_1,
                customerId: customerId,
                frequency: frequency,
              },
            }),
          ];
        case 4:
          error_1 = _b.sent();
          console.error("Error fetching payment plans:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid query parameters",
                  details: error_1.errors,
                },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * POST /api/payment-plans
 * Create a new payment plan
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      body,
      validatedData,
      installmentManager,
      paymentPlan,
      error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _b.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _b.sent();
          validatedData = createPaymentPlanSchema.parse(body);
          installmentManager = (0, installment_manager_1.getInstallmentManager)();
          return [
            4 /*yield*/,
            installmentManager.createPaymentPlan({
              customerId: validatedData.customerId,
              totalAmount: validatedData.totalAmount,
              currency: validatedData.currency,
              installmentCount: validatedData.installmentCount,
              frequency: validatedData.frequency,
              startDate: new Date(validatedData.startDate),
              description: validatedData.description,
              metadata: validatedData.metadata,
            }),
          ];
        case 4:
          paymentPlan = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: paymentPlan,
                message: "Payment plan created successfully",
              },
              { status: 201 },
            ),
          ];
        case 5:
          error_2 = _b.sent();
          console.error("Error creating payment plan:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid request data",
                  details: error_2.errors,
                },
                { status: 400 },
              ),
            ];
          }
          if (error_2 instanceof Error) {
            // Check for specific business logic errors
            if (error_2.message.includes("Customer not found")) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Customer not found" }, { status: 404 }),
              ];
            }
            if (error_2.message.includes("Invalid installment configuration")) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: error_2.message }, { status: 400 }),
              ];
            }
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * PUT /api/payment-plans
 * Bulk update payment plans
 */
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      body,
      action,
      paymentPlanIds,
      updateData_1,
      installmentManager_1,
      results,
      _b,
      validatedUpdateData_1,
      error_3;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 10, , 11]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _c.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          (action = body.action),
            (paymentPlanIds = body.paymentPlanIds),
            (updateData_1 = body.data);
          if (!action || !paymentPlanIds || !Array.isArray(paymentPlanIds)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request: action and paymentPlanIds are required" },
                { status: 400 },
              ),
            ];
          }
          installmentManager_1 = (0, installment_manager_1.getInstallmentManager)();
          results = void 0;
          _b = action;
          switch (_b) {
            case "cancel":
              return [3 /*break*/, 4];
            case "update":
              return [3 /*break*/, 6];
          }
          return [3 /*break*/, 8];
        case 4:
          return [
            4 /*yield*/,
            Promise.all(
              paymentPlanIds.map((id) =>
                installmentManager_1.cancelPaymentPlan(
                  id,
                  updateData_1 === null || updateData_1 === void 0 ? void 0 : updateData_1.reason,
                ),
              ),
            ),
          ];
        case 5:
          results = _c.sent();
          return [3 /*break*/, 9];
        case 6:
          if (!updateData_1) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Update data is required for update action" },
                { status: 400 },
              ),
            ];
          }
          validatedUpdateData_1 = updatePaymentPlanSchema.parse(updateData_1);
          return [
            4 /*yield*/,
            Promise.all(
              paymentPlanIds.map((id) =>
                installmentManager_1.modifyPaymentPlan(id, validatedUpdateData_1),
              ),
            ),
          ];
        case 7:
          results = _c.sent();
          return [3 /*break*/, 9];
        case 8:
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Invalid action. Supported actions: cancel, update" },
              { status: 400 },
            ),
          ];
        case 9:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: results,
              message: "Bulk ".concat(action, " completed successfully"),
            }),
          ];
        case 10:
          error_3 = _c.sent();
          console.error("Error in bulk payment plan operation:", error_3);
          if (error_3 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid request data",
                  details: error_3.errors,
                },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * DELETE /api/payment-plans
 * Bulk delete payment plans (soft delete by cancelling)
 */
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      body,
      paymentPlanIds,
      reason_1,
      installmentManager_2,
      results,
      successful,
      failed,
      error_4;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _b.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _b.sent();
          (paymentPlanIds = body.paymentPlanIds), (reason_1 = body.reason);
          if (!paymentPlanIds || !Array.isArray(paymentPlanIds)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "paymentPlanIds array is required" },
                { status: 400 },
              ),
            ];
          }
          installmentManager_2 = (0, installment_manager_1.getInstallmentManager)();
          return [
            4 /*yield*/,
            Promise.all(
              paymentPlanIds.map((id) =>
                __awaiter(this, void 0, void 0, function () {
                  var error_5;
                  return __generator(this, (_a) => {
                    switch (_a.label) {
                      case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [
                          4 /*yield*/,
                          installmentManager_2.cancelPaymentPlan(id, reason_1 || "Bulk deletion"),
                        ];
                      case 1:
                        _a.sent();
                        return [2 /*return*/, { id: id, success: true }];
                      case 2:
                        error_5 = _a.sent();
                        return [
                          2 /*return*/,
                          {
                            id: id,
                            success: false,
                            error: error_5 instanceof Error ? error_5.message : "Unknown error",
                          },
                        ];
                      case 3:
                        return [2 /*return*/];
                    }
                  });
                }),
              ),
            ),
          ];
        case 4:
          results = _b.sent();
          successful = results.filter((r) => r.success).length;
          failed = results.filter((r) => !r.success).length;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                total: paymentPlanIds.length,
                successful: successful,
                failed: failed,
                results: results,
              },
              message: "Bulk deletion completed: "
                .concat(successful, " successful, ")
                .concat(failed, " failed"),
            }),
          ];
        case 5:
          error_4 = _b.sent();
          console.error("Error in bulk payment plan deletion:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
