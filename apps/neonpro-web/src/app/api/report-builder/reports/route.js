"use strict";
// Custom Reports API Route
// Story 8.2: Custom Report Builder (Drag-Drop Interface)
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
var report_builder_1 = require("@/app/lib/services/report-builder");
var report_builder_2 = require("@/app/lib/validations/report-builder");
var server_1 = require("next/server");
var reportService = new report_builder_1.ReportBuilderService();
// GET /api/report-builder/reports - Get all reports
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams,
      page,
      perPage,
      search,
      visualizationType,
      isTemplate,
      filters,
      result,
      error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          searchParams = new URL(request.url).searchParams;
          page = parseInt(searchParams.get("page") || "1");
          perPage = parseInt(searchParams.get("per_page") || "10");
          search = searchParams.get("search") || undefined;
          visualizationType = searchParams.get("visualization_type") || undefined;
          isTemplate =
            searchParams.get("is_template") === "true"
              ? true
              : searchParams.get("is_template") === "false"
                ? false
                : undefined;
          filters = {
            search: search,
            visualization_type: visualizationType,
            is_template: isTemplate,
          };
          return [4 /*yield*/, reportService.getReports(page, perPage, filters)];
        case 1:
          result = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: result,
            }),
          ];
        case 2:
          error_1 = _a.sent();
          console.error("Error fetching reports:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: error_1 instanceof Error ? error_1.message : "Failed to fetch reports",
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
// POST /api/report-builder/reports - Create new report
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body, validationResult, report, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _a.sent();
          validationResult = report_builder_2.CreateReportRequest.safeParse(body);
          if (!validationResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Invalid request data",
                  details: validationResult.error.errors,
                },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, reportService.createReport(validationResult.data)];
        case 2:
          report = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: report,
              },
              { status: 201 },
            ),
          ];
        case 3:
          error_2 = _a.sent();
          console.error("Error creating report:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: error_2 instanceof Error ? error_2.message : "Failed to create report",
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
