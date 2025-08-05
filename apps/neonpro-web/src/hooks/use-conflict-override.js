// Hook for managing conflict override permissions and workflows
"use client";
"use strict";
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.useConflictOverride = useConflictOverride;
var react_1 = require("react");
var client_1 = require("@/lib/supabase/client");
var use_toast_1 = require("@/hooks/use-toast");
function useConflictOverride() {
  var _this = this;
  var _a = (0, react_1.useState)(false),
    loading = _a[0],
    setLoading = _a[1];
  var _b = (0, react_1.useState)([]),
    overrideRequests = _b[0],
    setOverrideRequests = _b[1];
  var _c = (0, react_1.useState)(null),
    userPermissions = _c[0],
    setUserPermissions = _c[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var supabase = yield (0, client_1.createClient)();
  // Check user permissions for override system
  var checkOverridePermissions = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var _a, user, userError, _b, profile, profileError, permissions, userPermission, error_1;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              _c.trys.push([0, 3, , 4]);
              return [4 /*yield*/, supabase.auth.getUser()];
            case 1:
              (_a = _c.sent()), (user = _a.data.user), (userError = _a.error);
              if (userError || !user) throw userError;
              return [
                4 /*yield*/,
                supabase.from("profiles").select("role").eq("id", user.id).single(),
              ];
            case 2:
              (_b = _c.sent()), (profile = _b.data), (profileError = _b.error);
              if (profileError) throw profileError;
              permissions = {
                clinic_manager: {
                  can_override_conflicts: true,
                  can_approve_overrides: true,
                  max_override_impact_minutes: 480, // 8 hours
                  requires_approval: false,
                  role: "clinic_manager",
                },
                supervisor: {
                  can_override_conflicts: true,
                  can_approve_overrides: true,
                  max_override_impact_minutes: 240, // 4 hours
                  requires_approval: false,
                  role: "supervisor",
                },
                receptionist: {
                  can_override_conflicts: true,
                  can_approve_overrides: false,
                  max_override_impact_minutes: 60, // 1 hour
                  requires_approval: true,
                  role: "receptionist",
                },
                staff: {
                  can_override_conflicts: false,
                  can_approve_overrides: false,
                  max_override_impact_minutes: 0,
                  requires_approval: true,
                  role: "staff",
                },
              };
              userPermission = permissions[profile.role] || permissions["staff"];
              setUserPermissions(userPermission);
              return [2 /*return*/, userPermission];
            case 3:
              error_1 = _c.sent();
              console.error("Error checking override permissions:", error_1);
              toast({
                variant: "destructive",
                title: "Erro de Permissões",
                description: "Não foi possível verificar suas permissões de override.",
              });
              return [2 /*return*/, null];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [supabase, toast],
  );
  // Request conflict override (following healthcare audit trail requirements)
  var requestConflictOverride = (0, react_1.useCallback)(
    function (overrideData) {
      return __awaiter(_this, void 0, void 0, function () {
        var _a,
          user,
          userError,
          permissions,
          overrideRequest,
          _b,
          savedRequest_1,
          insertError,
          error_2;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              setLoading(true);
              _c.label = 1;
            case 1:
              _c.trys.push([1, 8, 9, 10]);
              return [4 /*yield*/, supabase.auth.getUser()];
            case 2:
              (_a = _c.sent()), (user = _a.data.user), (userError = _a.error);
              if (userError || !user) throw userError;
              return [4 /*yield*/, checkOverridePermissions()];
            case 3:
              permissions = _c.sent();
              if (
                !(permissions === null || permissions === void 0
                  ? void 0
                  : permissions.can_override_conflicts)
              ) {
                throw new Error("Você não tem permissão para solicitar override de conflitos");
              }
              // Check if override impact exceeds user limits
              if (
                overrideData.impact_assessment.estimated_delay_minutes >
                permissions.max_override_impact_minutes
              ) {
                throw new Error(
                  "Impacto excede limite permitido: ".concat(
                    permissions.max_override_impact_minutes,
                    " minutos",
                  ),
                );
              }
              overrideRequest = __assign(__assign({}, overrideData), {
                requested_by: user.id,
                status: permissions.requires_approval ? "pending" : "approved",
                approved_by: permissions.requires_approval ? undefined : user.id,
                created_at: new Date().toISOString(),
                approved_at: permissions.requires_approval ? undefined : new Date().toISOString(),
              });
              return [
                4 /*yield*/,
                supabase
                  .from("appointment_override_requests")
                  .insert([overrideRequest])
                  .select("*")
                  .single(),
              ];
            case 4:
              (_b = _c.sent()), (savedRequest_1 = _b.data), (insertError = _b.error);
              if (insertError) throw insertError;
              // Log the override action for HIPAA compliance
              return [
                4 /*yield*/,
                supabase.from("audit_logs").insert([
                  {
                    user_id: user.id,
                    action: "REQUEST_CONFLICT_OVERRIDE",
                    resource_type: "appointment_override",
                    resource_id: savedRequest_1.id,
                    details: {
                      appointment_id: overrideData.appointment_id,
                      conflict_type: overrideData.conflict_type,
                      reason: overrideData.override_reason,
                      impact_minutes: overrideData.impact_assessment.estimated_delay_minutes,
                      requires_approval: permissions.requires_approval,
                    },
                    ip_address: "", // Should be captured from request in production
                    user_agent: navigator.userAgent,
                  },
                ]),
              ];
            case 5:
              // Log the override action for HIPAA compliance
              _c.sent();
              toast({
                title: permissions.requires_approval ? "Override Solicitado" : "Override Aprovado",
                description: permissions.requires_approval
                  ? "Sua solicitação foi enviada para aprovação."
                  : "Override foi aplicado automaticamente.",
              });
              if (!!permissions.requires_approval) return [3 /*break*/, 7];
              return [4 /*yield*/, processApprovedOverride(savedRequest_1)];
            case 6:
              _c.sent();
              _c.label = 7;
            case 7:
              setOverrideRequests(function (prev) {
                return __spreadArray(__spreadArray([], prev, true), [savedRequest_1], false);
              });
              return [2 /*return*/, savedRequest_1];
            case 8:
              error_2 = _c.sent();
              console.error("Error requesting conflict override:", error_2);
              toast({
                variant: "destructive",
                title: "Erro no Override",
                description: error_2.message || "Não foi possível solicitar o override.",
              });
              throw error_2;
            case 9:
              setLoading(false);
              return [7 /*endfinally*/];
            case 10:
              return [2 /*return*/];
          }
        });
      });
    },
    [supabase, toast, checkOverridePermissions],
  );
  // Approve or reject override request (manager approval workflow)
  var processOverrideRequest = (0, react_1.useCallback)(
    function (requestId, action, approvalNotes) {
      return __awaiter(_this, void 0, void 0, function () {
        var _a, user, userError, permissions, _b, updatedRequest_1, updateError, error_3;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              setLoading(true);
              _c.label = 1;
            case 1:
              _c.trys.push([1, 8, 9, 10]);
              return [4 /*yield*/, supabase.auth.getUser()];
            case 2:
              (_a = _c.sent()), (user = _a.data.user), (userError = _a.error);
              if (userError || !user) throw userError;
              return [4 /*yield*/, checkOverridePermissions()];
            case 3:
              permissions = _c.sent();
              if (
                !(permissions === null || permissions === void 0
                  ? void 0
                  : permissions.can_approve_overrides)
              ) {
                throw new Error("Você não tem permissão para aprovar overrides");
              }
              return [
                4 /*yield*/,
                supabase
                  .from("appointment_override_requests")
                  .update({
                    status: action === "approve" ? "approved" : "rejected",
                    approved_by: user.id,
                    approved_at: new Date().toISOString(),
                    approval_notes: approvalNotes,
                  })
                  .eq("id", requestId)
                  .select("*")
                  .single(),
              ];
            case 4:
              (_b = _c.sent()), (updatedRequest_1 = _b.data), (updateError = _b.error);
              if (updateError) throw updateError;
              // Log the approval/rejection action
              return [
                4 /*yield*/,
                supabase.from("audit_logs").insert([
                  {
                    user_id: user.id,
                    action:
                      action === "approve"
                        ? "APPROVE_CONFLICT_OVERRIDE"
                        : "REJECT_CONFLICT_OVERRIDE",
                    resource_type: "appointment_override",
                    resource_id: requestId,
                    details: {
                      original_requester: updatedRequest_1.requested_by,
                      approval_notes: approvalNotes,
                      impact_assessment: updatedRequest_1.impact_assessment,
                    },
                    ip_address: "",
                    user_agent: navigator.userAgent,
                  },
                ]),
              ];
            case 5:
              // Log the approval/rejection action
              _c.sent();
              if (!(action === "approve")) return [3 /*break*/, 7];
              return [4 /*yield*/, processApprovedOverride(updatedRequest_1)];
            case 6:
              _c.sent();
              _c.label = 7;
            case 7:
              // Update local state
              setOverrideRequests(function (prev) {
                return prev.map(function (req) {
                  return req.id === requestId ? updatedRequest_1 : req;
                });
              });
              toast({
                title: action === "approve" ? "Override Aprovado" : "Override Rejeitado",
                description:
                  action === "approve"
                    ? "Override foi processado e notificações enviadas."
                    : "Override foi rejeitado conforme solicitado.",
              });
              return [2 /*return*/, updatedRequest_1];
            case 8:
              error_3 = _c.sent();
              console.error("Error processing override request:", error_3);
              toast({
                variant: "destructive",
                title: "Erro no Processamento",
                description: error_3.message || "Não foi possível processar a solicitação.",
              });
              throw error_3;
            case 9:
              setLoading(false);
              return [7 /*endfinally*/];
            case 10:
              return [2 /*return*/];
          }
        });
      });
    },
    [supabase, toast, checkOverridePermissions],
  );
  // Process approved override (send notifications to affected parties)
  var processApprovedOverride = (0, react_1.useCallback)(
    function (overrideRequest) {
      return __awaiter(_this, void 0, void 0, function () {
        var notificationPromises, user, error_4;
        var _this = this;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              notificationPromises = overrideRequest.impact_assessment.affected_appointments.map(
                function (appointment) {
                  return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          // This would integrate with your notification system
                          // For now, we'll just log the notification requirement
                          return [
                            4 /*yield*/,
                            supabase.from("notification_queue").insert([
                              {
                                recipient_type: "patient",
                                appointment_id: appointment.id,
                                notification_type: "schedule_change_override",
                                message:
                                  "Seu agendamento foi reagendado devido a uma situa\u00E7\u00E3o priorit\u00E1ria. Detalhes ser\u00E3o enviados em breve.",
                                scheduled_for: new Date().toISOString(),
                                metadata: {
                                  override_request_id: overrideRequest.id,
                                  original_time: appointment.original_time,
                                  reason: overrideRequest.override_reason_text,
                                },
                              },
                            ]),
                          ];
                        case 1:
                          // This would integrate with your notification system
                          // For now, we'll just log the notification requirement
                          _a.sent();
                          return [2 /*return*/, appointment.id];
                      }
                    });
                  });
                },
              );
              return [4 /*yield*/, Promise.all(notificationPromises)];
            case 1:
              _a.sent();
              return [4 /*yield*/, supabase.auth.getUser()];
            case 2:
              user = _a.sent().data.user;
              return [
                4 /*yield*/,
                supabase.from("audit_logs").insert([
                  {
                    user_id: (user === null || user === void 0 ? void 0 : user.id) || "system",
                    action: "DISPATCH_OVERRIDE_NOTIFICATIONS",
                    resource_type: "appointment_override",
                    resource_id: overrideRequest.id,
                    details: {
                      affected_appointments_count:
                        overrideRequest.impact_assessment.affected_appointments.length,
                      notification_method: "automated_queue",
                    },
                    ip_address: "",
                    user_agent: navigator.userAgent,
                  },
                ]),
              ];
            case 3:
              _a.sent();
              return [3 /*break*/, 5];
            case 4:
              error_4 = _a.sent();
              console.error("Error processing approved override:", error_4);
              return [3 /*break*/, 5];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    },
    [supabase],
  );
  // Load pending override requests for managers
  var loadPendingOverrides = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var permissions, _a, requests, error, error_5;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 3, , 4]);
              return [4 /*yield*/, checkOverridePermissions()];
            case 1:
              permissions = _b.sent();
              if (
                !(permissions === null || permissions === void 0
                  ? void 0
                  : permissions.can_approve_overrides)
              )
                return [2 /*return*/, []];
              return [
                4 /*yield*/,
                supabase
                  .from("appointment_override_requests")
                  .select(
                    "\n          *,\n          requested_by_profile:profiles!appointment_override_requests_requested_by_fkey(id, full_name),\n          approved_by_profile:profiles!appointment_override_requests_approved_by_fkey(id, full_name)\n        ",
                  )
                  .eq("status", "pending")
                  .order("created_at", { ascending: false }),
              ];
            case 2:
              (_a = _b.sent()), (requests = _a.data), (error = _a.error);
              if (error) throw error;
              setOverrideRequests(requests);
              return [2 /*return*/, requests];
            case 3:
              error_5 = _b.sent();
              console.error("Error loading pending overrides:", error_5);
              return [2 /*return*/, []];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [supabase, checkOverridePermissions],
  );
  return {
    // State
    loading: loading,
    overrideRequests: overrideRequests,
    userPermissions: userPermissions,
    // Actions
    requestConflictOverride: requestConflictOverride,
    processOverrideRequest: processOverrideRequest,
    loadPendingOverrides: loadPendingOverrides,
    checkOverridePermissions: checkOverridePermissions,
  };
}
