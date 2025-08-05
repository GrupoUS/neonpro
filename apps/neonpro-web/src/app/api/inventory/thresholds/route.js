"use strict";
// API Routes for Intelligent Threshold Management
// Story 6.2: Automated Reorder Alerts + Threshold Management
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
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s)
      if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PATCH = PATCH;
var intelligent_threshold_service_1 = require("@/app/lib/services/intelligent-threshold-service");
var reorder_alerts_1 = require("@/app/lib/validations/reorder-alerts");
var server_1 = require("next/server");
var zod_1 = require("zod");
var thresholdService = new intelligent_threshold_service_1.IntelligentThresholdService();
// Query params validation
var queryParamsSchema = zod_1.z.object({
  clinic_id: zod_1.z.string(),
  item_category: zod_1.z.string().optional(),
  auto_reorder_enabled: zod_1.z
    .string()
    .optional()
    .transform(function (val) {
      return val === "true";
    }),
  needs_optimization: zod_1.z
    .string()
    .optional()
    .transform(function (val) {
      return val === "true";
    }),
});
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var url,
      params,
      _a,
      clinic_id,
      item_category,
      auto_reorder_enabled,
      needs_optimization,
      filters,
      thresholds,
      error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          url = new URL(request.url);
          params = Object.fromEntries(url.searchParams.entries());
          (_a = queryParamsSchema.parse(params)),
            (clinic_id = _a.clinic_id),
            (item_category = _a.item_category),
            (auto_reorder_enabled = _a.auto_reorder_enabled),
            (needs_optimization = _a.needs_optimization);
          filters = {};
          if (item_category) filters.item_category = [item_category];
          if (auto_reorder_enabled !== undefined)
            filters.auto_reorder_enabled = auto_reorder_enabled;
          if (needs_optimization !== undefined) filters.needs_optimization = needs_optimization;
          return [4 /*yield*/, thresholdService.getThresholdsByClinic(clinic_id, filters)];
        case 1:
          thresholds = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: thresholds,
              count: thresholds.length,
            }),
          ];
        case 2:
          error_1 = _b.sent();
          console.error("Error fetching thresholds:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Failed to fetch thresholds",
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
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body, validatedData, threshold, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _a.sent();
          validatedData = reorder_alerts_1.createReorderThresholdSchema.parse(body);
          return [4 /*yield*/, thresholdService.createThreshold(validatedData)];
        case 2:
          threshold = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: threshold,
                message: "Threshold created successfully with intelligent calculations",
              },
              { status: 201 },
            ),
          ];
        case 3:
          error_2 = _a.sent();
          console.error("Error creating threshold:", error_2);
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
                error: "Failed to create threshold",
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
function PATCH(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body, id, updates, validatedUpdates, threshold, error_3;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _a.sent();
          (id = body.id), (updates = __rest(body, ["id"]));
          if (!id) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Threshold ID is required" },
                { status: 400 },
              ),
            ];
          }
          validatedUpdates = reorder_alerts_1.updateReorderThresholdSchema.parse(updates);
          return [4 /*yield*/, thresholdService.updateThreshold(id, validatedUpdates)];
        case 2:
          threshold = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: threshold,
              message: "Threshold updated successfully with recalculations",
            }),
          ];
        case 3:
          error_3 = _a.sent();
          console.error("Error updating threshold:", error_3);
          if (error_3 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Validation failed",
                  details: error_3.errors,
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
                details: error_3.message,
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
