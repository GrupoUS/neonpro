// API Routes for Demand Forecasting
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
exports.POST = POST;
var intelligent_threshold_service_1 = require("@/app/lib/services/intelligent-threshold-service");
var server_1 = require("next/server");
var zod_1 = require("zod");
var thresholdService = new intelligent_threshold_service_1.IntelligentThresholdService();
var forecastRequestSchema = zod_1.z.object({
  item_id: zod_1.z.string(),
  clinic_id: zod_1.z.string(),
  forecast_period: zod_1.z.enum(["daily", "weekly", "monthly", "quarterly"]),
  forecast_date: zod_1.z.string().transform((str) => new Date(str)),
});
var bulkForecastRequestSchema = zod_1.z.object({
  items: zod_1.z.array(
    zod_1.z.object({
      item_id: zod_1.z.string(),
      forecast_period: zod_1.z
        .enum(["daily", "weekly", "monthly", "quarterly"])
        .optional()
        .default("weekly"),
    }),
  ),
  clinic_id: zod_1.z.string(),
  forecast_date: zod_1.z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : new Date())),
});
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body, validatedData, forecast, error_1;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 5, , 6]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _a.sent();
          if (!(body.items && Array.isArray(body.items))) return [3 /*break*/, 3];
          return [4 /*yield*/, handleBulkForecast(body)];
        case 2:
          return [2 /*return*/, _a.sent()];
        case 3:
          validatedData = forecastRequestSchema.parse(body);
          return [
            4 /*yield*/,
            thresholdService.generateDemandForecast(
              validatedData.item_id,
              validatedData.clinic_id,
              validatedData.forecast_period,
              validatedData.forecast_date,
            ),
          ];
        case 4:
          forecast = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: forecast,
              message: "Demand forecast generated successfully",
            }),
          ];
        case 5:
          error_1 = _a.sent();
          console.error("Error generating demand forecast:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Validation failed",
                  details: error_1.errors,
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
                error: "Failed to generate demand forecast",
                details: error_1.message,
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
function handleBulkForecast(body) {
  return __awaiter(this, void 0, void 0, function () {
    var validatedData_1, forecasts, successful, failed, error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          validatedData_1 = bulkForecastRequestSchema.parse(body);
          return [
            4 /*yield*/,
            Promise.all(
              validatedData_1.items.map((item) =>
                __awaiter(this, void 0, void 0, function () {
                  var forecast, error_3;
                  return __generator(this, (_a) => {
                    switch (_a.label) {
                      case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [
                          4 /*yield*/,
                          thresholdService.generateDemandForecast(
                            item.item_id,
                            validatedData_1.clinic_id,
                            item.forecast_period,
                            validatedData_1.forecast_date,
                          ),
                        ];
                      case 1:
                        forecast = _a.sent();
                        return [
                          2 /*return*/,
                          { success: true, item_id: item.item_id, data: forecast },
                        ];
                      case 2:
                        error_3 = _a.sent();
                        return [
                          2 /*return*/,
                          {
                            success: false,
                            item_id: item.item_id,
                            error: error_3.message,
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
        case 1:
          forecasts = _a.sent();
          successful = forecasts.filter((f) => f.success);
          failed = forecasts.filter((f) => !f.success);
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: successful.map((f) => f.data),
              summary: {
                total_requested: validatedData_1.items.length,
                successful: successful.length,
                failed: failed.length,
                failures: failed.map((f) => ({ item_id: f.item_id, error: f.error })),
              },
              message: "Bulk forecast completed: "
                .concat(successful.length, "/")
                .concat(validatedData_1.items.length, " successful"),
            }),
          ];
        case 2:
          error_2 = _a.sent();
          console.error("Error in bulk forecast:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Bulk forecast validation failed",
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
                error: "Failed to process bulk forecast",
                details: error_2.message,
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
