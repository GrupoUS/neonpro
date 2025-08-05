// API endpoint for patient retention analytics
// Story 7.4: Advanced patient retention analytics with predictive modeling
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
var server_1 = require("next/server");
var retention_1 = require("../../../lib/services/retention");
var retention_2 = require("../../../lib/validations/retention");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams, queryParams, patient_id, start_date, end_date, filters, result, error_1;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          searchParams = new URL(request.url).searchParams;
          queryParams = retention_2.RetentionAnalyticsQuerySchema.parse({
            page: searchParams.get("page"),
            limit: searchParams.get("limit"),
            sort_by: searchParams.get("sort_by"),
            sort_order: searchParams.get("sort_order"),
            risk_level: searchParams.get("risk_level"),
            segment: searchParams.get("segment"),
            search: searchParams.get("search"),
          });
          patient_id = searchParams.get("patient_id");
          start_date = searchParams.get("start_date");
          end_date = searchParams.get("end_date");
          filters = __assign({}, queryParams);
          if (patient_id) {
            filters.patient_id = patient_id;
          }
          if (start_date && end_date) {
            filters.date_range = { start_date: start_date, end_date: end_date };
          }
          return [4 /*yield*/, retention_1.RetentionService.getPatientRetentionAnalytics(filters)];
        case 1:
          result = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: result.data,
              pagination: result.pagination,
            }),
          ];
        case 2:
          error_1 = _a.sent();
          console.error("Error in retention analytics GET:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: "Failed to fetch retention analytics",
                details: error_1 instanceof Error ? error_1.message : "Unknown error",
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
    var body, validatedData, retentionAnalytics, error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _a.sent();
          validatedData = retention_2.CreatePatientRetentionAnalyticsSchema.parse(body);
          return [
            4 /*yield*/,
            retention_1.RetentionService.createPatientRetentionAnalytics(validatedData),
          ];
        case 2:
          retentionAnalytics = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: retentionAnalytics,
                message: "Retention analytics created successfully",
              },
              { status: 201 },
            ),
          ];
        case 3:
          error_2 = _a.sent();
          console.error("Error in retention analytics POST:", error_2);
          if (error_2 instanceof Error && error_2.name === "ZodError") {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Validation failed",
                  details: error_2.message,
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
                error: "Failed to create retention analytics",
                details: error_2 instanceof Error ? error_2.message : "Unknown error",
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
