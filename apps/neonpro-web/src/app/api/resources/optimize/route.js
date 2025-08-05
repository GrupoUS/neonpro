// =====================================================
// Resource Optimization API
// Story 2.4: Smart Resource Management - Optimization
// =====================================================
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
exports.POST = POST;
exports.GET = GET;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var allocation_engine_1 = require("@/lib/resources/allocation-engine");
// =====================================================
// POST /api/resources/optimize - Get allocation suggestions
// =====================================================
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body,
      clinic_id,
      resource_type,
      start_time,
      end_time,
      supabase,
      _a,
      user,
      authError,
      allocationEngine,
      optimization,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _b.sent();
          (clinic_id = body.clinic_id),
            (resource_type = body.resource_type),
            (start_time = body.start_time),
            (end_time = body.end_time);
          if (!clinic_id || !resource_type || !start_time || !end_time) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "clinic_id, resource_type, start_time, and end_time are required" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          allocationEngine = new allocation_engine_1.AllocationEngine();
          return [4 /*yield*/, allocationEngine.suggestOptimalAllocation(clinic_id, body)];
        case 4:
          optimization = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: optimization,
              message: "Allocation suggestions generated successfully",
            }),
          ];
        case 5:
          error_1 = _b.sent();
          console.error("Error generating allocation suggestions:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to generate allocation suggestions",
                details: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// GET /api/resources/optimize/workload - Staff workload optimization
// =====================================================
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams,
      clinicId,
      date,
      supabase,
      _a,
      user,
      authError,
      allocationEngine,
      optimization,
      error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          searchParams = new URL(request.url).searchParams;
          clinicId = searchParams.get("clinic_id");
          date = searchParams.get("date");
          // Validate required parameters
          if (!clinicId || !date) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "clinic_id and date are required" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          allocationEngine = new allocation_engine_1.AllocationEngine();
          return [4 /*yield*/, allocationEngine.optimizeStaffWorkload(clinicId, date)];
        case 3:
          optimization = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: optimization,
              message: "Staff workload optimization completed",
            }),
          ];
        case 4:
          error_2 = _b.sent();
          console.error("Error optimizing staff workload:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to optimize staff workload",
                details: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
