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
exports.GET = GET;
exports.POST = POST;
exports.PATCH = PATCH;
var budget_approval_service_1 = require("@/app/lib/services/budget-approval-service");
var budget_approval_1 = require("@/app/lib/validations/budget-approval");
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      user,
      searchParams,
      period,
      costCenter,
      status_1,
      query,
      _a,
      budgets,
      error,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _b.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = request.nextUrl.searchParams;
          period = searchParams.get("period");
          costCenter = searchParams.get("costCenter");
          status_1 = searchParams.get("status");
          query = supabase
            .from("budgets")
            .select(
              "\n        *,\n        cost_center:cost_centers(name),\n        approvals:budget_approvals(*),\n        allocations:budget_allocations(*)\n      ",
            )
            .eq("user_id", user.id);
          if (period) {
            query = query.eq("period", period);
          }
          if (costCenter) {
            query = query.eq("cost_center_id", costCenter);
          }
          if (status_1) {
            query = query.eq("status", status_1);
          }
          return [4 /*yield*/, query.order("created_at", { ascending: false })];
        case 3:
          (_a = _b.sent()), (budgets = _a.data), (error = _a.error);
          if (error) {
            console.error("Error fetching budgets:", error);
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 }),
            ];
          }
          return [2 /*return*/, server_2.NextResponse.json({ budgets: budgets })];
        case 4:
          error_1 = _b.sent();
          console.error("Error in budget GET:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      user_1,
      body,
      validated_1,
      service_1,
      results,
      validated,
      service,
      budget,
      error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 7, , 8]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user_1 = _a.sent().data.user;
          if (!user_1) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _a.sent();
          if (!(body.budgets && Array.isArray(body.budgets))) return [3 /*break*/, 5];
          validated_1 = budget_approval_1.bulkBudgetCreateSchema.parse(body);
          service_1 = new budget_approval_service_1.BudgetApprovalService();
          return [
            4 /*yield*/,
            Promise.all(
              validated_1.budgets.map((budgetData) =>
                service_1.createBudget(
                  user_1.id,
                  __assign(__assign({}, budgetData), { user_id: user_1.id }),
                ),
              ),
            ),
          ];
        case 4:
          results = _a.sent();
          return [2 /*return*/, server_2.NextResponse.json({ budgets: results })];
        case 5:
          validated = budget_approval_1.budgetSchema.parse(body);
          service = new budget_approval_service_1.BudgetApprovalService();
          return [
            4 /*yield*/,
            service.createBudget(
              user_1.id,
              __assign(__assign({}, validated), { user_id: user_1.id }),
            ),
          ];
        case 6:
          budget = _a.sent();
          return [2 /*return*/, server_2.NextResponse.json({ budget: budget })];
        case 7:
          error_2 = _a.sent();
          console.error("Error creating budget:", error_2);
          if (error_2 instanceof Error && error_2.name === "ZodError") {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Invalid budget data" }, { status: 400 }),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Failed to create budget" }, { status: 500 }),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
function PATCH(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, body, validated, service, updated, error_3;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _a.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _a.sent();
          validated = budget_approval_1.budgetPeriodUpdateSchema.parse(body);
          service = new budget_approval_service_1.BudgetApprovalService();
          return [
            4 /*yield*/,
            service.updateBudgetPeriod(validated.budget_id, validated.period_data),
          ];
        case 4:
          updated = _a.sent();
          return [2 /*return*/, server_2.NextResponse.json({ budget: updated })];
        case 5:
          error_3 = _a.sent();
          console.error("Error updating budget:", error_3);
          if (error_3 instanceof Error && error_3.name === "ZodError") {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Invalid update data" }, { status: 400 }),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Failed to update budget" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
