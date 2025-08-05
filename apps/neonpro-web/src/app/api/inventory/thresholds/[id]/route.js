// API Routes for Individual Threshold Management
// Story 6.2: Automated Reorder Alerts + Threshold Management
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
exports.PATCH = PATCH;
exports.DELETE = DELETE;
var intelligent_threshold_service_1 = require("@/app/lib/services/intelligent-threshold-service");
var reorder_alerts_1 = require("@/app/lib/validations/reorder-alerts");
var server_1 = require("next/server");
var zod_1 = require("zod");
var thresholdService = new intelligent_threshold_service_1.IntelligentThresholdService();
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var threshold, error_1;
    var params = _b.params;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 2, , 3]);
          return [4 /*yield*/, thresholdService.getThreshold(params.id)];
        case 1:
          threshold = _c.sent();
          if (!threshold) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Threshold not found" },
                { status: 404 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: threshold,
            }),
          ];
        case 2:
          error_1 = _c.sent();
          console.error("Error fetching threshold:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Failed to fetch threshold",
                details: error_1.message,
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
function PATCH(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var body, validatedUpdates, threshold, error_2;
    var params = _b.params;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 3, , 4]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _c.sent();
          validatedUpdates = reorder_alerts_1.updateReorderThresholdSchema.parse(body);
          return [4 /*yield*/, thresholdService.updateThreshold(params.id, validatedUpdates)];
        case 2:
          threshold = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: threshold,
              message: "Threshold updated successfully with intelligent recalculations",
            }),
          ];
        case 3:
          error_2 = _c.sent();
          console.error("Error updating threshold:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Validation failed",
                  details: error_2.errors,
                },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Failed to update threshold",
                details: error_2.message,
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
function DELETE(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var threshold, error_3;
    var params = _b.params;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            thresholdService.updateThreshold(params.id, {
              is_active: false,
              updated_at: new Date().toISOString(),
            }),
          ];
        case 1:
          threshold = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: threshold,
              message: "Threshold deactivated successfully",
            }),
          ];
        case 2:
          error_3 = _c.sent();
          console.error("Error deactivating threshold:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Failed to deactivate threshold",
                details: error_3.message,
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
