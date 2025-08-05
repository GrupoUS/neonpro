"use strict";
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
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var inventory_reports_service_1 = require("@/app/lib/services/inventory-reports-service");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, session, searchParams, filters, definitions, error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _a.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          filters = {};
          if (searchParams.get("created_by")) {
            filters.created_by = searchParams.get("created_by");
          }
          if (searchParams.get("is_active")) {
            filters.is_active = searchParams.get("is_active") === "true";
          }
          return [
            4 /*yield*/,
            (0, inventory_reports_service_1.createinventoryReportsService)().getReportDefinitions(
              filters,
            ),
          ];
        case 3:
          definitions = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              definitions: definitions,
            }),
          ];
        case 4:
          error_1 = _a.sent();
          console.error("Error fetching report definitions:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to fetch report definitions",
                message: error_1 instanceof Error ? error_1.message : "Unknown error",
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
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, session, user, body, validationResult, definitionData, savedDefinition, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _a.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          user = _a.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "User not found" }, { status: 404 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _a.sent();
          validationResult = validateReportDefinition(body);
          if (!validationResult.isValid) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid report definition",
                  details: validationResult.errors,
                },
                { status: 400 },
              ),
            ];
          }
          definitionData = {
            name: body.name,
            description: body.description || "",
            report_type: body.report_type,
            parameters: body.parameters,
            schedule_expression: body.schedule_expression || null,
            is_active: body.is_active !== false,
            created_by: user.id,
          };
          return [
            4 /*yield*/,
            (0, inventory_reports_service_1.createinventoryReportsService)().saveReportDefinition(
              definitionData,
            ),
          ];
        case 5:
          savedDefinition = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              definition: savedDefinition,
            }),
          ];
        case 6:
          error_2 = _a.sent();
          console.error("Error creating report definition:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to create report definition",
                message: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
function validateReportDefinition(body) {
  var errors = [];
  // Check required fields
  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    errors.push("Name is required and must be a non-empty string");
  }
  if (!body.report_type || typeof body.report_type !== "string") {
    errors.push("Report type is required");
  }
  if (!body.parameters || typeof body.parameters !== "object") {
    errors.push("Parameters are required and must be an object");
  }
  // Validate report type
  var validTypes = [
    "stock_movement",
    "stock_valuation",
    "low_stock",
    "expiring_items",
    "transfers",
    "location_performance",
  ];
  if (body.report_type && !validTypes.includes(body.report_type)) {
    errors.push("Invalid report type. Must be one of: ".concat(validTypes.join(", ")));
  }
  // Validate parameters structure
  if (body.parameters) {
    if (!body.parameters.type) {
      errors.push("Parameters must include a type field");
    }
    if (body.parameters.type !== body.report_type) {
      errors.push("Parameters type must match report_type");
    }
    if (!body.parameters.filters || typeof body.parameters.filters !== "object") {
      errors.push("Parameters must include a filters object");
    }
  }
  // Validate schedule expression if provided (cron format)
  if (body.schedule_expression && !isValidCronExpression(body.schedule_expression)) {
    errors.push("Invalid schedule expression. Must be a valid cron expression");
  }
  // Validate description length if provided
  if (body.description && typeof body.description === "string" && body.description.length > 500) {
    errors.push("Description must be 500 characters or less");
  }
  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}
function isValidCronExpression(expression) {
  // Basic cron validation - 5 or 6 fields separated by spaces
  var parts = expression.trim().split(/\s+/);
  return parts.length === 5 || parts.length === 6;
}
