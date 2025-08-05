// =============================================
// NeonPro Appointment Slot Validation API
// Story 1.2: Real-time conflict prevention
// Route: /api/appointments/validate-slot
// =============================================
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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
exports.GET = GET;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
var zod_1 = require("zod");
// Validation schema for slot validation request
var validateSlotSchema = zod_1.z.object({
  professional_id: zod_1.z.string().uuid("Invalid professional ID"),
  service_type_id: zod_1.z.string().uuid("Invalid service type ID"),
  start_time: zod_1.z.string().datetime("Invalid start time format"),
  end_time: zod_1.z.string().datetime("Invalid end time format"),
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
      validatedData,
      _c,
      validationResult,
      validationError,
      result,
      response,
      status_1,
      error_1;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          startTime = Date.now();
          _d.label = 1;
        case 1:
          _d.trys.push([1, 7, undefined, 8]);
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
          validatedData = validateSlotSchema.parse(body);
          return [
            4 /*yield*/,
            supabase.rpc("sp_validate_appointment_slot", {
              p_clinic_id: profile.clinic_id,
              p_professional_id: validatedData.professional_id,
              p_service_type_id: validatedData.service_type_id,
              p_start_time: validatedData.start_time,
              p_end_time: validatedData.end_time,
              p_exclude_appointment_id: validatedData.exclude_appointment_id || null,
            }),
          ];
        case 6:
          (_c = _d.sent()), (validationResult = _c.data), (validationError = _c.error);
          if (validationError) {
            console.error("Validation procedure error:", validationError);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  error: "Validation failed",
                  details: validationError.message,
                  code: "VALIDATION_PROCEDURE_ERROR",
                },
                { status: 500 },
              ),
            ];
          }
          result =
            typeof validationResult === "string" ? JSON.parse(validationResult) : validationResult;
          response = {
            success: result.success || false,
            available: result.available || false,
            conflicts: result.conflicts || [],
            warnings: result.warnings || [],
            alternative_slots: result.alternative_slots || [],
            validation_details: result.validation_details || {},
            performance: {
              validation_time_ms: Date.now() - startTime, // Actual performance calculation
            },
          };
          status_1 = result.available ? 200 : 409;
          return [2 /*return*/, server_2.NextResponse.json(response, { status: status_1 })];
        case 7:
          error_1 = _d.sent();
          console.error("Slot validation API error:", error_1);
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
                details: "An unexpected error occurred during slot validation",
                code: "INTERNAL_SERVER_ERROR",
                performance: {
                  validation_time_ms: Date.now() - startTime,
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
// GET endpoint for availability checking by parameters
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
      startTime_1,
      endTime,
      excludeAppointmentId,
      queryData,
      validatedData,
      _c,
      validationResult,
      validationError,
      result,
      error_2;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          startTime = Date.now();
          _d.label = 1;
        case 1:
          _d.trys.push([1, 6, undefined, 7]);
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
          startTime_1 = searchParams.get("start_time");
          endTime = searchParams.get("end_time");
          excludeAppointmentId = searchParams.get("exclude_appointment_id");
          // Validate required parameters
          if (!professionalId || !serviceTypeId || !startTime_1 || !endTime) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  error: "Missing parameters",
                  details:
                    "professional_id, service_type_id, start_time, and end_time are required",
                },
                { status: 400 },
              ),
            ];
          }
          queryData = {
            professional_id: professionalId,
            service_type_id: serviceTypeId,
            start_time: startTime_1,
            end_time: endTime,
            exclude_appointment_id: excludeAppointmentId,
          };
          validatedData = validateSlotSchema.parse(queryData);
          return [
            4 /*yield*/,
            supabase.rpc("sp_validate_appointment_slot", {
              p_clinic_id: profile.clinic_id,
              p_professional_id: validatedData.professional_id,
              p_service_type_id: validatedData.service_type_id,
              p_start_time: validatedData.start_time,
              p_end_time: validatedData.end_time,
              p_exclude_appointment_id: validatedData.exclude_appointment_id || null,
            }),
          ];
        case 5:
          (_c = _d.sent()), (validationResult = _c.data), (validationError = _c.error);
          if (validationError) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  error: "Validation failed",
                  details: validationError.message,
                },
                { status: 500 },
              ),
            ];
          }
          result =
            typeof validationResult === "string" ? JSON.parse(validationResult) : validationResult;
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              available: result.available || false,
              conflicts: result.conflicts || [],
              warnings: result.warnings || [],
              alternative_slots: result.alternative_slots || [],
              performance: {
                validation_time_ms: Date.now() - startTime_1,
              },
            }),
          ];
        case 6:
          error_2 = _d.sent();
          console.error("Availability check error:", error_2);
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
                  validation_time_ms: Date.now() - startTime,
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
