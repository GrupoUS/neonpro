"use strict";
// =============================================
// NeonPro Alternative Time Slot Suggestion API
// Story 1.2: Task 5 - Alternative time slot suggestion system
// Route: /api/appointments/suggest-alternatives
// =============================================
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
exports.POST = POST;
exports.GET = GET;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
var zod_1 = require("zod");
// Validation schema for alternative slot suggestion request
var suggestAlternativesSchema = zod_1.z.object({
  professional_id: zod_1.z.string().uuid("Invalid professional ID"),
  service_type_id: zod_1.z.string().uuid("Invalid service type ID"),
  preferred_start_time: zod_1.z.string().datetime("Invalid preferred start time format"),
  duration_minutes: zod_1.z.number().int().positive("Duration must be positive"),
  search_window_days: zod_1.z.number().int().min(1).max(30).default(7),
  max_suggestions: zod_1.z.number().int().min(1).max(10).default(5),
  preferred_times: zod_1.z
    .array(zod_1.z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/))
    .optional(),
  exclude_appointment_id: zod_1.z.string().uuid().optional(),
});
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var startTime,
      supabase,
      _a,
      user,
      authError,
      _b,
      profile,
      profileError,
      body,
      validatedData_1,
      _c,
      suggestionsResult,
      suggestionsError,
      result,
      enhancedSuggestions,
      response,
      error_1;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          startTime = Date.now();
          _d.label = 1;
        case 1:
          _d.trys.push([1, 7, , 8]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 2:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _d.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !(user === null || user === void 0 ? void 0 : user.id)) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Unauthorized", details: "Authentication required" },
                { status: 401 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", user.id).single(),
          ];
        case 4:
          (_b = _d.sent()), (profile = _b.data), (profileError = _b.error);
          if (
            profileError ||
            !(profile === null || profile === void 0 ? void 0 : profile.clinic_id)
          ) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  error: "Profile not found",
                  details: "User profile or clinic not found",
                },
                { status: 404 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 5:
          body = _d.sent();
          validatedData_1 = suggestAlternativesSchema.parse(body);
          return [
            4 /*yield*/,
            supabase.rpc("sp_suggest_alternative_slots", {
              p_clinic_id: profile.clinic_id,
              p_professional_id: validatedData_1.professional_id,
              p_service_type_id: validatedData_1.service_type_id,
              p_preferred_start_time: validatedData_1.preferred_start_time,
              p_duration_minutes: validatedData_1.duration_minutes,
              p_search_window_days: validatedData_1.search_window_days,
              p_max_suggestions: validatedData_1.max_suggestions,
              p_preferred_times: validatedData_1.preferred_times || null,
              p_exclude_appointment_id: validatedData_1.exclude_appointment_id || null,
            }),
          ];
        case 6:
          (_c = _d.sent()), (suggestionsResult = _c.data), (suggestionsError = _c.error);
          if (suggestionsError) {
            console.error("Alternative suggestions procedure error:", suggestionsError);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  error: "Suggestion generation failed",
                  details: suggestionsError.message,
                  code: "SUGGESTION_PROCEDURE_ERROR",
                },
                { status: 500 },
              ),
            ];
          }
          result =
            typeof suggestionsResult === "string"
              ? JSON.parse(suggestionsResult)
              : suggestionsResult;
          enhancedSuggestions = (result.suggestions || []).map(function (slot) {
            return __assign(__assign({}, slot), {
              formatted_start_time: new Date(slot.start_time).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              }),
              formatted_date: new Date(slot.start_time).toLocaleDateString("pt-BR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              formatted_time: new Date(slot.start_time).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              is_same_day:
                new Date(slot.start_time).toDateString() ===
                new Date(validatedData_1.preferred_start_time).toDateString(),
              days_from_preferred: Math.ceil(
                (new Date(slot.start_time).getTime() -
                  new Date(validatedData_1.preferred_start_time).getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            });
          });
          // Sort suggestions by score (highest first)
          enhancedSuggestions.sort(function (a, b) {
            return b.score - a.score;
          });
          response = {
            success: result.success || true,
            suggestions: enhancedSuggestions,
            search_criteria: {
              professional_id: validatedData_1.professional_id,
              service_type_id: validatedData_1.service_type_id,
              preferred_start_time: validatedData_1.preferred_start_time,
              duration_minutes: validatedData_1.duration_minutes,
              search_window_days: validatedData_1.search_window_days,
            },
            metadata: {
              total_suggestions: enhancedSuggestions.length,
              search_window_end: new Date(
                new Date(validatedData_1.preferred_start_time).getTime() +
                  validatedData_1.search_window_days * 24 * 60 * 60 * 1000,
              ).toISOString(),
              generated_at: new Date().toISOString(),
            },
            performance: {
              generation_time_ms: Date.now() - startTime,
            },
          };
          return [2 /*return*/, server_2.NextResponse.json(response, { status: 200 })];
        case 7:
          error_1 = _d.sent();
          console.error("Alternative slots API error:", error_1);
          // Handle Zod validation errors
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  error: "Validation error",
                  details: "Invalid request parameters",
                  validation_errors: error_1.errors,
                  code: "INVALID_REQUEST_PARAMETERS",
                },
                { status: 400 },
              ),
            ];
          }
          // Handle JSON parsing errors
          if (error_1 instanceof SyntaxError) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  error: "Invalid JSON",
                  details: "Request body contains invalid JSON",
                  code: "INVALID_JSON",
                },
                { status: 400 },
              ),
            ];
          }
          // Generic server error
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                error: "Internal server error",
                details: "An unexpected error occurred during alternative slot generation",
                code: "INTERNAL_SERVER_ERROR",
                performance: {
                  generation_time_ms: Date.now() - startTime,
                },
              },
              { status: 500 },
            ),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
// GET endpoint for quick alternative suggestions
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var startTime,
      supabase,
      _a,
      user,
      authError,
      _b,
      profile,
      profileError,
      searchParams,
      professionalId,
      serviceTypeId,
      preferredStartTime,
      durationMinutes,
      maxSuggestions,
      queryData,
      validatedData,
      _c,
      suggestionsResult,
      suggestionsError,
      result,
      error_2;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          startTime = Date.now();
          _d.label = 1;
        case 1:
          _d.trys.push([1, 6, , 7]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 2:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 3:
          (_a = _d.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !(user === null || user === void 0 ? void 0 : user.id)) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", user.id).single(),
          ];
        case 4:
          (_b = _d.sent()), (profile = _b.data), (profileError = _b.error);
          if (
            profileError ||
            !(profile === null || profile === void 0 ? void 0 : profile.clinic_id)
          ) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Profile not found" }, { status: 404 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          professionalId = searchParams.get("professional_id");
          serviceTypeId = searchParams.get("service_type_id");
          preferredStartTime = searchParams.get("preferred_start_time");
          durationMinutes = searchParams.get("duration_minutes");
          maxSuggestions = searchParams.get("max_suggestions") || "5";
          // Validate required parameters
          if (!professionalId || !serviceTypeId || !preferredStartTime || !durationMinutes) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  error: "Missing parameters",
                  details:
                    "professional_id, service_type_id, preferred_start_time, and duration_minutes are required",
                },
                { status: 400 },
              ),
            ];
          }
          queryData = {
            professional_id: professionalId,
            service_type_id: serviceTypeId,
            preferred_start_time: preferredStartTime,
            duration_minutes: parseInt(durationMinutes),
            max_suggestions: parseInt(maxSuggestions),
          };
          validatedData = suggestAlternativesSchema.parse(queryData);
          return [
            4 /*yield*/,
            supabase.rpc("sp_suggest_alternative_slots", {
              p_clinic_id: profile.clinic_id,
              p_professional_id: validatedData.professional_id,
              p_service_type_id: validatedData.service_type_id,
              p_preferred_start_time: validatedData.preferred_start_time,
              p_duration_minutes: validatedData.duration_minutes,
              p_search_window_days: 7, // Default search window
              p_max_suggestions: validatedData.max_suggestions,
              p_preferred_times: null,
              p_exclude_appointment_id: null,
            }),
          ];
        case 5:
          (_c = _d.sent()), (suggestionsResult = _c.data), (suggestionsError = _c.error);
          if (suggestionsError) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  error: "Suggestion generation failed",
                  details: suggestionsError.message,
                },
                { status: 500 },
              ),
            ];
          }
          result =
            typeof suggestionsResult === "string"
              ? JSON.parse(suggestionsResult)
              : suggestionsResult;
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              suggestions: result.suggestions || [],
              metadata: {
                total_suggestions: (result.suggestions || []).length,
                generated_at: new Date().toISOString(),
              },
              performance: {
                generation_time_ms: Date.now() - startTime,
              },
            }),
          ];
        case 6:
          error_2 = _d.sent();
          console.error("Alternative suggestions GET error:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  error: "Invalid parameters",
                  validation_errors: error_2.errors,
                },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              {
                error: "Internal server error",
                details: "An unexpected error occurred",
                performance: {
                  generation_time_ms: Date.now() - startTime,
                },
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
