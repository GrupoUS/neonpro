/**
 * =====================================================================================
 * PREDICTIVE CASH FLOW API - SCENARIOS ENDPOINT
 * =====================================================================================
 *
 * API for managing forecasting scenarios and scenario-based predictions.
 *
 * Epic: 5 - Advanced Financial Intelligence
 * Story: 5.2 - Predictive Cash Flow Analysis
 * Author: VoidBeast V4.0 BMad Method Integration
 * Created: 2025-01-27
 * =====================================================================================
 */
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
var server_1 = require("next/server");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var headers_1 = require("next/headers");
var zod_1 = require("zod");
var predictive_cash_flow_1 = require("@/lib/validations/predictive-cash-flow");
var getScenariosSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid(),
});
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, searchParams, validation, clinicId, _a, scenarios, error, error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          searchParams = new URL(request.url).searchParams;
          validation = getScenariosSchema.safeParse({
            clinicId: searchParams.get("clinicId"),
          });
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid query parameters" }, { status: 400 }),
            ];
          }
          clinicId = validation.data.clinicId;
          return [
            4 /*yield*/,
            supabase
              .from("forecasting_scenarios")
              .select("*")
              .eq("clinic_id", clinicId)
              .order("created_at", { ascending: false }),
          ];
        case 1:
          (_a = _b.sent()), (scenarios = _a.data), (error = _a.error);
          if (error) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to fetch scenarios" }, { status: 500 }),
            ];
          }
          return [2 /*return*/, server_1.NextResponse.json({ scenarios: scenarios || [] })];
        case 2:
          error_1 = _b.sent();
          console.error("Error in GET /api/financial/predictive-cash-flow/scenarios:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, body, validation, user, _a, scenario, error, error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({
            cookies: headers_1.cookies,
          });
          return [4 /*yield*/, request.json()];
        case 1:
          body = _b.sent();
          validation = predictive_cash_flow_1.createForecastingScenarioSchema.safeParse(body);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request body", details: validation.error.errors },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _b.sent().data;
          if (!user.user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("forecasting_scenarios").insert(validation.data).select().single(),
          ];
        case 3:
          (_a = _b.sent()), (scenario = _a.data), (error = _a.error);
          if (error) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to create scenario" }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ scenario: scenario }, { status: 201 }),
          ];
        case 4:
          error_2 = _b.sent();
          console.error("Error in POST /api/financial/predictive-cash-flow/scenarios:", error_2);
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
