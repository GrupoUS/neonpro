"use strict";
// =====================================================================================
// FOLLOW-UP TEMPLATES API ROUTES
// Epic 7.3: REST API endpoints for follow-up templates
// GET /api/followups/templates - List templates with filters
// POST /api/followups/templates - Create new template
// =====================================================================================
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
var treatment_followup_service_1 = require("@/app/lib/services/treatment-followup-service");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, session, authError, searchParams, filters, templates, error_1;
    var _b, _c, _d;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _e.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          filters = {};
          // Extract filters from query params
          if (searchParams.get("treatment_type")) {
            filters.treatment_type =
              (_b = searchParams.get("treatment_type")) === null || _b === void 0
                ? void 0
                : _b.split(",");
          }
          if (searchParams.get("followup_type")) {
            filters.followup_type =
              (_c = searchParams.get("followup_type")) === null || _c === void 0
                ? void 0
                : _c.split(",");
          }
          if (searchParams.get("communication_method")) {
            filters.communication_method =
              (_d = searchParams.get("communication_method")) === null || _d === void 0
                ? void 0
                : _d.split(",");
          }
          if (searchParams.get("active")) {
            filters.active = searchParams.get("active") === "true";
          }
          if (searchParams.get("clinic_id")) {
            filters.clinic_id = searchParams.get("clinic_id");
          }
          if (searchParams.get("created_by")) {
            filters.created_by = searchParams.get("created_by");
          }
          if (searchParams.get("limit")) {
            filters.limit = parseInt(searchParams.get("limit"));
          }
          if (searchParams.get("offset")) {
            filters.offset = parseInt(searchParams.get("offset"));
          }
          return [
            4 /*yield*/,
            (0, treatment_followup_service_1.createtreatmentFollowupService)().getTemplates(
              filters,
            ),
          ];
        case 3:
          templates = _e.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              data: templates,
              count: templates.length,
              filters: filters,
            }),
          ];
        case 4:
          error_1 = _e.sent();
          console.error("API error in GET /api/followups/templates:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Internal server error",
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
    var supabase,
      _a,
      session,
      authError,
      body,
      requiredFields,
      _i,
      requiredFields_1,
      field,
      templateData,
      newTemplate,
      error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _b.sent()), (session = _a.data.session), (authError = _a.error);
          if (authError || !session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _b.sent();
          requiredFields = [
            "clinic_id",
            "name",
            "treatment_type",
            "followup_type",
            "communication_method",
            "message_template",
          ];
          for (_i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
            field = requiredFields_1[_i];
            if (!body[field]) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Validation error", message: "Field '".concat(field, "' is required") },
                  { status: 400 },
                ),
              ];
            }
          }
          templateData = __assign(__assign({}, body), { created_by: session.user.id });
          return [
            4 /*yield*/,
            (0, treatment_followup_service_1.createtreatmentFollowupService)().createTemplate(
              templateData,
            ),
          ];
        case 4:
          newTemplate = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                data: newTemplate,
                message: "Follow-up template created successfully",
              },
              { status: 201 },
            ),
          ];
        case 5:
          error_2 = _b.sent();
          console.error("API error in POST /api/followups/templates:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Internal server error",
                message: error_2 instanceof Error ? error_2.message : "Unknown error",
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
