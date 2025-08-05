// =====================================================================================
// MARKETING CAMPAIGNS API - AUTOMATIONS ROUTE
// Epic 7 - Story 7.2: Automated marketing campaigns with personalization
// =====================================================================================
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
var marketing_campaigns_service_1 = require("@/app/lib/services/marketing-campaigns-service");
var server_1 = require("next/server");
// GET /api/marketing/automations - List campaign automations
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams, clinicId, automations, error_1;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          searchParams = new URL(request.url).searchParams;
          clinicId = searchParams.get("clinic_id") || undefined;
          return [
            4 /*yield*/,
            marketing_campaigns_service_1.marketingCampaignsService.getAutomations(clinicId),
          ];
        case 1:
          automations = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: automations,
              total: automations.length,
            }),
          ];
        case 2:
          error_1 = _a.sent();
          console.error("GET /api/marketing/automations error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Failed to fetch automations",
                message: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// POST /api/marketing/automations - Create new automation
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body,
      requiredFields,
      _i,
      requiredFields_1,
      field,
      _a,
      _b,
      step,
      automationData,
      automation,
      error_2;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 3, , 4]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _c.sent();
          requiredFields = ["name", "entryConditions", "steps", "clinicId"];
          for (_i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
            field = requiredFields_1[_i];
            if (!body[field]) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  {
                    success: false,
                    error: "Missing required field: ".concat(field),
                  },
                  { status: 400 },
                ),
              ];
            }
          }
          // Validate entry conditions
          if (!Array.isArray(body.entryConditions) || body.entryConditions.length === 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Entry conditions must be a non-empty array",
                },
                { status: 400 },
              ),
            ];
          }
          // Validate steps
          if (!Array.isArray(body.steps) || body.steps.length === 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Steps must be a non-empty array",
                },
                { status: 400 },
              ),
            ];
          }
          // Validate each step has required fields
          for (_a = 0, _b = body.steps; _a < _b.length; _a++) {
            step = _b[_a];
            if (!step.step || !step.type) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  {
                    success: false,
                    error: "Each step must have step number and type",
                  },
                  { status: 400 },
                ),
              ];
            }
          }
          automationData = {
            name: body.name,
            description: body.description,
            entryConditions: body.entryConditions,
            steps: body.steps,
            exitConditions: body.exitConditions || [],
            isActive: body.isActive !== false, // Default to true
            maxParticipants: body.maxParticipants,
            clinicId: body.clinicId,
          };
          return [
            4 /*yield*/,
            marketing_campaigns_service_1.marketingCampaignsService.createAutomation(
              automationData,
            ),
          ];
        case 2:
          automation = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: automation,
                message: "Automation created successfully",
              },
              { status: 201 },
            ),
          ];
        case 3:
          error_2 = _c.sent();
          console.error("POST /api/marketing/automations error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Failed to create automation",
                message: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
