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
var patient_segmentation_service_1 = require("@/app/lib/services/patient-segmentation-service");
var segmentation_1 = require("@/app/lib/validations/segmentation");
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, rules, error, error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _b.sent();
          return [
            4 /*yield*/,
            supabase
              .from("segmentation_rules")
              .select("*")
              .order("created_at", { ascending: false }),
          ];
        case 2:
          (_a = _b.sent()), (rules = _a.data), (error = _a.error);
          if (error) {
            console.error("Database error:", error);
            // Return empty array if table doesn't exist or no data
            return [
              2 /*return*/,
              server_2.NextResponse.json({
                success: true,
                data: [],
                total: 0,
              }),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              data: rules || [],
              total: (rules === null || rules === void 0 ? void 0 : rules.length) || 0,
            }),
          ];
        case 3:
          error_1 = _b.sent();
          console.error("Error fetching segmentation rules:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              { error: "Failed to fetch segmentation rules" },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, user, body, validationResult, ruleData, rule, error_2;
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
          validationResult = segmentation_1.CreateRuleSchema.safeParse(body);
          if (!validationResult.success) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Invalid input", details: validationResult.error.issues },
                { status: 400 },
              ),
            ];
          }
          ruleData = {
            rule_name: validationResult.data.rule_name,
            description: validationResult.data.rule_description,
            conditions: validationResult.data.rule_logic,
            auto_execute: validationResult.data.requires_ai,
            execution_schedule: undefined,
          };
          return [
            4 /*yield*/,
            (0,
            patient_segmentation_service_1.createpatientSegmentationService)().createAutomatedSegment(
              ruleData,
            ),
          ];
        case 4:
          rule = _a.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                success: true,
                data: rule,
                message: "Automated segmentation rule created successfully",
              },
              { status: 201 },
            ),
          ];
        case 5:
          error_2 = _a.sent();
          console.error("Error creating segmentation rule:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              { error: "Failed to create segmentation rule" },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
