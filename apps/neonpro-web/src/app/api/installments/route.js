"use strict";
// NeonPro - Installments API Routes
// Story 6.1 - Task 3: Installment Management System
// API endpoints for installment processing and management
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
var installment_processor_1 = require("@/lib/payments/installments/installment-processor");
var installment_manager_1 = require("@/lib/payments/installments/installment-manager");
// Validation schemas
var processInstallmentSchema = zod_1.z.object({
  installmentId: zod_1.z.string().uuid(),
  paymentMethodId: zod_1.z.string().optional(),
  customerId: zod_1.z.string().uuid().optional(),
});
var bulkProcessSchema = zod_1.z.object({
  installmentIds: zod_1.z.array(zod_1.z.string().uuid()).min(1).max(50),
  paymentMethodId: zod_1.z.string().optional(),
  customerId: zod_1.z.string().uuid().optional(),
  maxConcurrent: zod_1.z.number().int().min(1).max(10).optional().default(5),
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
  status: zod_1.z.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
  paymentPlanId: zod_1.z.string().uuid().optional(),
  customerId: zod_1.z.string().uuid().optional(),
  dueDateFrom: zod_1.z
    .string()
    .refine(
      function (date) {
        return !isNaN(Date.parse(date));
      },
      {
        message: "Invalid date format",
      },
    )
    .optional(),
  dueDateTo: zod_1.z
    .string()
    .refine(
      function (date) {
        return !isNaN(Date.parse(date));
      },
      {
        message: "Invalid date format",
      },
    )
    .optional(),
  sortBy: zod_1.z
    .enum(["due_date", "amount", "status", "created_at"])
    .optional()
    .default("due_date"),
  sortOrder: zod_1.z.enum(["asc", "desc"]).optional().default("asc"),
});
/**
 * GET /api/installments
 * List installments with filtering and pagination
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
      paymentPlanId,
      customerId,
      dueDateFrom,
      dueDateTo,
      sortBy,
      sortOrder,
      installmentManager,
      filters,
      result,
      error_1;
    return __generator(this, function (_b) {
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
            (paymentPlanId = validatedQuery.paymentPlanId),
            (customerId = validatedQuery.customerId),
            (dueDateFrom = validatedQuery.dueDateFrom),
            (dueDateTo = validatedQuery.dueDateTo),
            (sortBy = validatedQuery.sortBy),
            (sortOrder = validatedQuery.sortOrder);
          installmentManager = (0, installment_manager_1.getInstallmentManager)();
          filters = {};
          if (status_1) filters.status = status_1;
          if (paymentPlanId) filters.paymentPlanId = paymentPlanId;
          if (customerId) filters.customerId = customerId;
          if (dueDateFrom) filters.dueDateFrom = new Date(dueDateFrom);
          if (dueDateTo) filters.dueDateTo = new Date(dueDateTo);
          return [
            4 /*yield*/,
            installmentManager.getInstallmentsList({
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
                paymentPlanId: paymentPlanId,
                customerId: customerId,
                dueDateFrom: dueDateFrom,
                dueDateTo: dueDateTo,
              },
            }),
          ];
        case 4:
          error_1 = _b.sent();
          console.error("Error fetching installments:", error_1);
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
 * POST /api/installments
 * Process installment payments
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      body,
      action,
      installmentProcessor,
      result,
      _b,
      singleData,
      bulkData,
      overdueOptions,
      retryData,
      error_2;
    var _c, _d, _e;
    return __generator(this, function (_f) {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 14, , 15]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _f.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _f.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _f.sent();
          action = body.action;
          if (!action) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Action is required" }, { status: 400 }),
            ];
          }
          installmentProcessor = (0, installment_processor_1.getInstallmentProcessor)();
          result = void 0;
          _b = action;
          switch (_b) {
            case "process_single":
              return [3 /*break*/, 4];
            case "process_bulk":
              return [3 /*break*/, 6];
            case "process_overdue":
              return [3 /*break*/, 8];
            case "retry_failed":
              return [3 /*break*/, 10];
          }
          return [3 /*break*/, 12];
        case 4:
          singleData = processInstallmentSchema.parse(body.data);
          return [
            4 /*yield*/,
            installmentProcessor.processInstallmentPayment(
              singleData.installmentId,
              singleData.paymentMethodId,
              singleData.customerId,
            ),
          ];
        case 5:
          result = _f.sent();
          return [3 /*break*/, 13];
        case 6:
          bulkData = bulkProcessSchema.parse(body.data);
          return [
            4 /*yield*/,
            installmentProcessor.processBulkInstallments(bulkData.installmentIds, {
              paymentMethodId: bulkData.paymentMethodId,
              customerId: bulkData.customerId,
              maxConcurrent: bulkData.maxConcurrent,
            }),
          ];
        case 7:
          result = _f.sent();
          return [3 /*break*/, 13];
        case 8:
          overdueOptions = {
            maxDaysOverdue:
              ((_c = body.data) === null || _c === void 0 ? void 0 : _c.maxDaysOverdue) || 30,
            maxInstallments:
              ((_d = body.data) === null || _d === void 0 ? void 0 : _d.maxInstallments) || 100,
            dryRun: ((_e = body.data) === null || _e === void 0 ? void 0 : _e.dryRun) || false,
          };
          return [4 /*yield*/, installmentProcessor.processOverdueInstallments(overdueOptions)];
        case 9:
          result = _f.sent();
          return [3 /*break*/, 13];
        case 10:
          retryData = zod_1.z
            .object({
              installmentId: zod_1.z.string().uuid(),
              paymentMethodId: zod_1.z.string().optional(),
            })
            .parse(body.data);
          return [
            4 /*yield*/,
            installmentProcessor.retryFailedPayment(
              retryData.installmentId,
              retryData.paymentMethodId,
            ),
          ];
        case 11:
          result = _f.sent();
          return [3 /*break*/, 13];
        case 12:
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Invalid action",
                supportedActions: [
                  "process_single",
                  "process_bulk",
                  "process_overdue",
                  "retry_failed",
                ],
              },
              { status: 400 },
            ),
          ];
        case 13:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: result,
              message: "Action '".concat(action, "' completed successfully"),
            }),
          ];
        case 14:
          error_2 = _f.sent();
          console.error("Error processing installments:", error_2);
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
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 15:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * PUT /api/installments
 * Update installment status or information
 */
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      session,
      authError,
      body,
      action,
      installmentIds,
      updateData,
      installmentManager_1,
      results,
      _b,
      paymentData_1,
      cancelReason_1,
      successful,
      failed,
      error_3;
    var _this = this;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 12, , 13]);
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
          (action = body.action), (installmentIds = body.installmentIds), (updateData = body.data);
          if (!action || !installmentIds || !Array.isArray(installmentIds)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request: action and installmentIds are required" },
                { status: 400 },
              ),
            ];
          }
          installmentManager_1 = (0, installment_manager_1.getInstallmentManager)();
          results = void 0;
          _b = action;
          switch (_b) {
            case "mark_paid":
              return [3 /*break*/, 4];
            case "mark_overdue":
              return [3 /*break*/, 6];
            case "cancel":
              return [3 /*break*/, 8];
          }
          return [3 /*break*/, 10];
        case 4:
          paymentData_1 = zod_1.z
            .object({
              paymentIntentId: zod_1.z.string(),
              paymentMethod: zod_1.z.string().optional().default("manual"),
            })
            .parse(updateData);
          return [
            4 /*yield*/,
            Promise.all(
              installmentIds.map(function (id) {
                return __awaiter(_this, void 0, void 0, function () {
                  var error_4;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [
                          4 /*yield*/,
                          installmentManager_1.markInstallmentAsPaid(
                            id,
                            paymentData_1.paymentIntentId,
                            paymentData_1.paymentMethod,
                          ),
                        ];
                      case 1:
                        _a.sent();
                        return [2 /*return*/, { id: id, success: true }];
                      case 2:
                        error_4 = _a.sent();
                        return [
                          2 /*return*/,
                          {
                            id: id,
                            success: false,
                            error: error_4 instanceof Error ? error_4.message : "Unknown error",
                          },
                        ];
                      case 3:
                        return [2 /*return*/];
                    }
                  });
                });
              }),
            ),
          ];
        case 5:
          results = _c.sent();
          return [3 /*break*/, 11];
        case 6:
          return [
            4 /*yield*/,
            Promise.all(
              installmentIds.map(function (id) {
                return __awaiter(_this, void 0, void 0, function () {
                  var error_5;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, installmentManager_1.markInstallmentAsOverdue(id)];
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
                });
              }),
            ),
          ];
        case 7:
          results = _c.sent();
          return [3 /*break*/, 11];
        case 8:
          cancelReason_1 =
            (updateData === null || updateData === void 0 ? void 0 : updateData.reason) ||
            "Cancelled by user";
          return [
            4 /*yield*/,
            Promise.all(
              installmentIds.map(function (id) {
                return __awaiter(_this, void 0, void 0, function () {
                  var error_6;
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [
                          4 /*yield*/,
                          installmentManager_1.cancelInstallment(id, cancelReason_1),
                        ];
                      case 1:
                        _a.sent();
                        return [2 /*return*/, { id: id, success: true }];
                      case 2:
                        error_6 = _a.sent();
                        return [
                          2 /*return*/,
                          {
                            id: id,
                            success: false,
                            error: error_6 instanceof Error ? error_6.message : "Unknown error",
                          },
                        ];
                      case 3:
                        return [2 /*return*/];
                    }
                  });
                });
              }),
            ),
          ];
        case 9:
          results = _c.sent();
          return [3 /*break*/, 11];
        case 10:
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Invalid action",
                supportedActions: ["mark_paid", "mark_overdue", "cancel"],
              },
              { status: 400 },
            ),
          ];
        case 11:
          successful = results.filter(function (r) {
            return r.success;
          }).length;
          failed = results.filter(function (r) {
            return !r.success;
          }).length;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: {
                total: installmentIds.length,
                successful: successful,
                failed: failed,
                results: results,
              },
              message: "Bulk "
                .concat(action, " completed: ")
                .concat(successful, " successful, ")
                .concat(failed, " failed"),
            }),
          ];
        case 12:
          error_3 = _c.sent();
          console.error("Error in bulk installment operation:", error_3);
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
        case 13:
          return [2 /*return*/];
      }
    });
  });
}
