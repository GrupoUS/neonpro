"use strict";
// app/api/appointments/[id]/route.ts
// API route for appointment details and updates
// Story 1.1 Task 5 - Appointment Details Modal/Sidebar
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
exports.PATCH = PATCH;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
/**
 * GET /api/appointments/[id]
 * Fetch detailed appointment information with related data
 */
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      session,
      resolvedParams,
      appointmentId,
      _c,
      appointment,
      error,
      appointmentWithDetails,
      response,
      error_1;
    var params = _b.params;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _d.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error_message: "Authentication required" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, params];
        case 3:
          resolvedParams = _d.sent();
          appointmentId = resolvedParams.id;
          return [
            4 /*yield*/,
            supabase
              .from("appointments")
              .select(
                "\n        *,\n        patients!inner(id, full_name, email, phone),\n        professionals!inner(id, full_name, email, phone),\n        service_types!inner(id, name, duration_minutes, price, color),\n        clinics!inner(id, name)\n      ",
              )
              .eq("id", appointmentId)
              .eq("deleted_at", null)
              .single(),
          ];
        case 4:
          (_c = _d.sent()), (appointment = _c.data), (error = _c.error);
          if (error || !appointment) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error_message: "Appointment not found" },
                { status: 404 },
              ),
            ];
          }
          appointmentWithDetails = __assign(__assign({}, appointment), {
            patient_name: appointment.patients.full_name,
            patient_email: appointment.patients.email,
            patient_phone: appointment.patients.phone,
            professional_name: appointment.professionals.full_name,
            service_name: appointment.service_types.name,
            service_duration: appointment.service_types.duration_minutes,
            service_price: appointment.service_types.price,
            service_color: appointment.service_types.color,
            clinic_name: appointment.clinics.name,
          });
          response = {
            success: true,
            data: appointmentWithDetails,
          };
          return [2 /*return*/, server_1.NextResponse.json(response)];
        case 5:
          error_1 = _d.sent();
          console.error("Error fetching appointment details:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { success: false, error_message: "Internal server error" },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
} /**
 * PATCH /api/appointments/[id]
 * Update appointment with conflict validation and audit logging
 */
function PATCH(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      session,
      resolvedParams,
      appointmentId,
      updateData,
      processedData,
      _c,
      data,
      error,
      _d,
      updatedAppointment,
      fetchError,
      appointmentWithDetails,
      response,
      error_2;
    var _e, _f;
    var params = _b.params;
    return __generator(this, function (_g) {
      switch (_g.label) {
        case 0:
          _g.trys.push([0, 7, , 8]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _g.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _g.sent().data.session;
          if (!(session === null || session === void 0 ? void 0 : session.user)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error_message: "Authentication required" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, params];
        case 3:
          resolvedParams = _g.sent();
          appointmentId = resolvedParams.id;
          return [4 /*yield*/, request.json()];
        case 4:
          updateData = _g.sent();
          processedData = __assign(__assign({}, updateData), {
            start_time: updateData.start_time
              ? new Date(updateData.start_time).toISOString()
              : undefined,
            end_time: updateData.end_time ? new Date(updateData.end_time).toISOString() : undefined,
            updated_by: session.user.id,
            updated_at: new Date().toISOString(),
          });
          return [
            4 /*yield*/,
            supabase.rpc("sp_update_appointment", {
              p_appointment_id: appointmentId,
              p_patient_id: processedData.patient_id,
              p_professional_id: processedData.professional_id,
              p_service_type_id: processedData.service_type_id,
              p_start_time: processedData.start_time,
              p_end_time: processedData.end_time,
              p_status: processedData.status || "scheduled",
              p_notes: processedData.notes || null,
              p_internal_notes: processedData.internal_notes || null,
              p_change_reason: processedData.change_reason || null,
              p_updated_by: session.user.id,
            }),
          ];
        case 5:
          (_c = _g.sent()), (data = _c.data), (error = _c.error);
          if (error) {
            // Handle specific validation errors
            if ((_e = error.message) === null || _e === void 0 ? void 0 : _e.includes("conflict")) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  {
                    success: false,
                    error_message: "Scheduling conflict detected",
                    error_details: error.message,
                  },
                  { status: 409 },
                ),
              ];
            }
            if (
              (_f = error.message) === null || _f === void 0
                ? void 0
                : _f.includes("business_hours")
            ) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  {
                    success: false,
                    error_message: "Appointment outside business hours",
                    error_details: error.message,
                  },
                  { status: 400 },
                ),
              ];
            }
            throw error;
          }
          return [
            4 /*yield*/,
            supabase
              .from("appointments")
              .select(
                "\n        *,\n        patients!inner(full_name, email, phone),\n        professionals!inner(full_name),\n        service_types!inner(name, duration_minutes, price, color),\n        clinics!inner(name)\n      ",
              )
              .eq("id", appointmentId)
              .single(),
          ];
        case 6:
          (_d = _g.sent()), (updatedAppointment = _d.data), (fetchError = _d.error);
          if (fetchError || !updatedAppointment) {
            throw new Error("Failed to fetch updated appointment");
          } // Transform to AppointmentWithDetails format
          appointmentWithDetails = __assign(__assign({}, updatedAppointment), {
            patient_name: updatedAppointment.patients.full_name,
            patient_email: updatedAppointment.patients.email,
            patient_phone: updatedAppointment.patients.phone,
            professional_name: updatedAppointment.professionals.full_name,
            service_name: updatedAppointment.service_types.name,
            service_duration: updatedAppointment.service_types.duration_minutes,
            service_price: updatedAppointment.service_types.price,
            service_color: updatedAppointment.service_types.color,
            clinic_name: updatedAppointment.clinics.name,
          });
          response = {
            success: true,
            data: appointmentWithDetails,
          };
          return [2 /*return*/, server_1.NextResponse.json(response)];
        case 7:
          error_2 = _g.sent();
          console.error("Error updating appointment:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { success: false, error_message: "Internal server error" },
              { status: 500 },
            ),
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * DELETE /api/appointments/[id]
 * Soft delete appointment with reason tracking
 */
function DELETE(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, session, resolvedParams, appointmentId, reason, _c, data, error, error_3;
    var params = _b.params;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _d.sent().data.session;
          if (!(session === null || session === void 0 ? void 0 : session.user)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error_message: "Authentication required" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, params];
        case 3:
          resolvedParams = _d.sent();
          appointmentId = resolvedParams.id;
          return [4 /*yield*/, request.json()];
        case 4:
          reason = _d.sent().reason;
          return [
            4 /*yield*/,
            supabase.rpc("sp_delete_appointment", {
              p_appointment_id: appointmentId,
              p_delete_reason: reason || "Cancelled by user",
              p_deleted_by: session.user.id,
            }),
          ];
        case 5:
          (_c = _d.sent()), (data = _c.data), (error = _c.error);
          if (error) {
            throw error;
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Appointment cancelled successfully",
            }),
          ];
        case 6:
          error_3 = _d.sent();
          console.error("Error deleting appointment:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { success: false, error_message: "Internal server error" },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
