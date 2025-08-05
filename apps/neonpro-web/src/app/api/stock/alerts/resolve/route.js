"use strict";
// Stock Alerts Resolve API
// Story 11.4: Alertas e Relatórios de Estoque
// POST /api/stock/alerts/resolve - Resolve an alert
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
exports.OPTIONS = OPTIONS;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var stock_alerts_1 = require("@/app/lib/types/stock-alerts");
var zod_1 = require("zod");
// =====================================================
// UTILITY FUNCTIONS
// =====================================================
function getUserClinicId(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, session, sessionError, profile;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          (_a = _b.sent()), (session = _a.data.session), (sessionError = _a.error);
          if (sessionError || !session) {
            return [2 /*return*/, { error: "Authentication required", status: 401 }];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", session.user.id).single(),
          ];
        case 3:
          profile = _b.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [2 /*return*/, { error: "User not associated with any clinic", status: 403 }];
          }
          return [
            2 /*return*/,
            {
              userId: session.user.id,
              clinicId: profile.clinic_id,
              supabase: supabase,
            },
          ];
      }
    });
  });
}
function handleError(error, defaultMessage) {
  if (defaultMessage === void 0) {
    defaultMessage = "Internal server error";
  }
  console.error("Stock Alerts Resolve API Error:", error);
  if (error instanceof zod_1.z.ZodError) {
    return server_1.NextResponse.json(
      {
        success: false,
        error: "Validation error",
        details: error.errors,
      },
      { status: 400 },
    );
  }
  if (error instanceof Error) {
    return server_1.NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
  return server_1.NextResponse.json(
    {
      success: false,
      error: defaultMessage,
    },
    { status: 500 },
  );
}
// =====================================================
// POST /api/stock/alerts/resolve
// =====================================================
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var authResult,
      userId,
      clinicId,
      supabase,
      body,
      resolveData,
      _a,
      alert_1,
      alertError,
      resolutionMetadata,
      _b,
      updatedAlert,
      updateError,
      transformedAlert,
      shouldTriggerReorder,
      error_1;
    var _c;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 10, , 11]);
          return [4 /*yield*/, getUserClinicId(request)];
        case 1:
          authResult = _d.sent();
          if ("error" in authResult) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: authResult.error },
                { status: authResult.status },
              ),
            ];
          }
          (userId = authResult.userId),
            (clinicId = authResult.clinicId),
            (supabase = authResult.supabase);
          return [4 /*yield*/, request.json()];
        case 2:
          body = _d.sent();
          resolveData = stock_alerts_1.resolveAlertSchema.parse(
            __assign(__assign({}, body), {
              resolvedBy: userId, // Override with authenticated user ID
            }),
          );
          return [
            4 /*yield*/,
            supabase
              .from("stock_alerts_history")
              .select(
                "id, clinic_id, status, message, product_id, alert_type, current_value, threshold_value, metadata",
              )
              .eq("id", resolveData.alertId)
              .eq("clinic_id", clinicId)
              .single(),
          ];
        case 3:
          (_a = _d.sent()), (alert_1 = _a.data), (alertError = _a.error);
          if (alertError || !alert_1) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Alert not found or not accessible" },
                { status: 404 },
              ),
            ];
          }
          // Check if alert is in valid state for resolution
          if (alert_1.status === stock_alerts_1.AlertStatus.RESOLVED) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Alert is already resolved",
                  currentStatus: alert_1.status,
                },
                { status: 400 },
              ),
            ];
          }
          if (alert_1.status === stock_alerts_1.AlertStatus.DISMISSED) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Alert has been dismissed and cannot be resolved",
                  currentStatus: alert_1.status,
                },
                { status: 400 },
              ),
            ];
          }
          resolutionMetadata = __assign(__assign({}, alert_1.metadata), {
            resolution: {
              description: resolveData.resolution,
              actionsTaken: resolveData.actionsTaken || [],
              resolvedAt: new Date().toISOString(),
              resolvedBy: userId,
              previousStatus: alert_1.status,
            },
          });
          return [
            4 /*yield*/,
            supabase
              .from("stock_alerts_history")
              .update({
                status: stock_alerts_1.AlertStatus.RESOLVED,
                resolved_at: new Date().toISOString(),
                metadata: resolutionMetadata,
              })
              .eq("id", resolveData.alertId)
              .eq("clinic_id", clinicId)
              .select(
                "\n        *,\n        product:products!stock_alerts_history_product_id_fkey (\n          id,\n          name,\n          sku,\n          current_stock\n        ),\n        acknowledged_user:users!stock_alerts_history_acknowledged_by_fkey (\n          id,\n          name,\n          email\n        )\n      ",
              )
              .single(),
          ];
        case 4:
          (_b = _d.sent()), (updatedAlert = _b.data), (updateError = _b.error);
          if (updateError) {
            console.error("Database update error:", updateError);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { success: false, error: "Failed to resolve alert" },
                { status: 500 },
              ),
            ];
          }
          transformedAlert = {
            id: updatedAlert.id,
            clinicId: updatedAlert.clinic_id,
            alertConfigId: updatedAlert.alert_config_id,
            productId: updatedAlert.product_id,
            alertType: updatedAlert.alert_type,
            severityLevel: updatedAlert.severity_level,
            currentValue: updatedAlert.current_value,
            thresholdValue: updatedAlert.threshold_value,
            message: updatedAlert.message,
            status: updatedAlert.status,
            metadata: updatedAlert.metadata || {},
            acknowledgedBy: updatedAlert.acknowledged_by,
            acknowledgedAt: updatedAlert.acknowledged_at
              ? new Date(updatedAlert.acknowledged_at)
              : undefined,
            resolvedAt: updatedAlert.resolved_at ? new Date(updatedAlert.resolved_at) : undefined,
            createdAt: new Date(updatedAlert.created_at),
            product: updatedAlert.product
              ? {
                  id: updatedAlert.product.id,
                  name: updatedAlert.product.name,
                  sku: updatedAlert.product.sku,
                  currentStock: updatedAlert.product.current_stock,
                }
              : undefined,
            acknowledgedUser: updatedAlert.acknowledged_user
              ? {
                  id: updatedAlert.acknowledged_user.id,
                  name: updatedAlert.acknowledged_user.name,
                  email: updatedAlert.acknowledged_user.email,
                }
              : undefined,
          };
          // Log the resolution action for audit trail
          console.log(
            "Alert "
              .concat(resolveData.alertId, " resolved by user ")
              .concat(userId, " for clinic ")
              .concat(clinicId),
          );
          // Update alert configurations for recurring issues
          return [
            4 /*yield*/,
            updateAlertConfigurationsIfRecurring(supabase, alert_1, resolveData, clinicId),
          ];
        case 5:
          // Update alert configurations for recurring issues
          _d.sent();
          // Trigger analytics update for resolution metrics
          return [
            4 /*yield*/,
            updateResolutionAnalytics(supabase, alert_1, resolveData, userId, clinicId),
          ];
        case 6:
          // Trigger analytics update for resolution metrics
          _d.sent();
          // Send notifications to stakeholders
          return [4 /*yield*/, sendResolutionNotifications(alert_1, resolveData, userId, clinicId)];
        case 7:
          // Send notifications to stakeholders
          _d.sent();
          shouldTriggerReorder =
            alert_1.alert_type === "low_stock" &&
            ((_c = resolveData.actionsTaken) === null || _c === void 0
              ? void 0
              : _c.includes("reorder_initiated"));
          if (!shouldTriggerReorder) return [3 /*break*/, 9];
          // Integrate with purchasing system to track reorder status
          return [4 /*yield*/, integratePurchasingSystem(supabase, alert_1, resolveData, clinicId)];
        case 8:
          // Integrate with purchasing system to track reorder status
          _d.sent();
          console.log(
            "Reorder initiated for product ".concat(
              alert_1.product_id,
              " as part of alert resolution",
            ),
          );
          _d.label = 9;
        case 9:
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: transformedAlert,
              message: "Alert resolved successfully",
              action: {
                type: "resolved",
                performedBy: userId,
                performedAt: new Date().toISOString(),
                resolution: resolveData.resolution,
                actionsTaken: resolveData.actionsTaken,
              },
              recommendations: shouldTriggerReorder
                ? [
                    {
                      type: "track_reorder",
                      message: "Monitor reorder status to prevent future stockouts",
                      productId: alert_1.product_id,
                    },
                  ]
                : [],
            }),
          ];
        case 10:
          error_1 = _d.sent();
          return [2 /*return*/, handleError(error_1, "Failed to resolve alert")];
        case 11:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// HELPER FUNCTIONS FOR TODO IMPLEMENTATIONS
// =====================================================
/**
 * Update alert configurations if this is a recurring issue
 */
function updateAlertConfigurationsIfRecurring(supabase, alert, resolveData, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, recentAlerts, error, configError, error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          return [
            4 /*yield*/,
            supabase
              .from("stock_alerts")
              .select("id, created_at")
              .eq("product_id", alert.product_id)
              .eq("alert_type", alert.alert_type)
              .eq("clinic_id", clinicId)
              .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          ];
        case 1:
          (_a = _b.sent()), (recentAlerts = _a.data), (error = _a.error);
          if (error) {
            console.error("Error checking recurring alerts:", error);
            return [2 /*return*/];
          }
          if (!(recentAlerts && recentAlerts.length > 2)) return [3 /*break*/, 3];
          return [
            4 /*yield*/,
            supabase.from("alert_configs").upsert(
              {
                clinic_id: clinicId,
                product_id: alert.product_id,
                alert_type: alert.alert_type,
                threshold:
                  alert.alert_type === "low_stock"
                    ? Math.max((alert.threshold || 10) * 1.5, 15)
                    : // Increase threshold by 50%
                      alert.threshold,
                is_active: true,
                recurring_issue_detected: true,
                last_updated_reason: "Automatic adjustment due to recurring issues",
                updated_at: new Date().toISOString(),
              },
              {
                onConflict: "clinic_id,product_id,alert_type",
              },
            ),
          ];
        case 2:
          configError = _b.sent().error;
          if (configError) {
            console.error("Error updating alert configuration:", configError);
          } else {
            console.log(
              "Updated alert configuration for recurring issue: Product ".concat(alert.product_id),
            );
          }
          _b.label = 3;
        case 3:
          return [3 /*break*/, 5];
        case 4:
          error_2 = _b.sent();
          console.error("Error in updateAlertConfigurationsIfRecurring:", error_2);
          return [3 /*break*/, 5];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Update analytics for resolution metrics
 */
function updateResolutionAnalytics(supabase, alert, resolveData, userId, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var resolutionTimeMs, resolutionTimeHours, error, metricsError, error_3;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          resolutionTimeMs = new Date().getTime() - new Date(alert.created_at).getTime();
          resolutionTimeHours = Math.round((resolutionTimeMs / (1000 * 60 * 60)) * 100) / 100;
          return [
            4 /*yield*/,
            supabase.from("stock_alert_analytics").insert({
              clinic_id: clinicId,
              alert_id: alert.id,
              product_id: alert.product_id,
              alert_type: alert.alert_type,
              resolution_time_hours: resolutionTimeHours,
              resolved_by: userId,
              resolution_type: resolveData.resolution,
              actions_taken: resolveData.actionsTaken || [],
              created_at: new Date().toISOString(),
            }),
          ];
        case 1:
          error = _a.sent().error;
          if (error) {
            console.error("Error updating resolution analytics:", error);
          } else {
            console.log(
              "Analytics updated for alert "
                .concat(alert.id, ": ")
                .concat(resolutionTimeHours, "h resolution time"),
            );
          }
          return [
            4 /*yield*/,
            supabase.rpc("update_alert_metrics", {
              p_clinic_id: clinicId,
              p_alert_type: alert.alert_type,
              p_resolution_time: resolutionTimeHours,
            }),
          ];
        case 2:
          metricsError = _a.sent().error;
          if (metricsError) {
            console.error("Error updating aggregated metrics:", metricsError);
          }
          return [3 /*break*/, 4];
        case 3:
          error_3 = _a.sent();
          console.error("Error in updateResolutionAnalytics:", error_3);
          return [3 /*break*/, 4];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Send notifications to stakeholders about resolution
 */
function sendResolutionNotifications(alert, resolveData, userId, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var notificationData, error_4;
    var _a, _b;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 3, , 4]);
          notificationData = {
            type: "stock_alert_resolved",
            clinicId: clinicId,
            alertId: alert.id,
            productName:
              ((_a = alert.product) === null || _a === void 0 ? void 0 : _a.name) ||
              "Product ID: ".concat(alert.product_id),
            alertType: alert.alert_type,
            resolution: resolveData.resolution,
            actionsTaken: resolveData.actionsTaken || [],
            resolvedBy: userId,
            resolvedAt: new Date().toISOString(),
          };
          // Send email notification to clinic administrators
          return [
            4 /*yield*/,
            fetch("/api/notifications/email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                template: "stock_alert_resolved",
                to: "clinic_admins", // Will be resolved to actual emails
                data: notificationData,
              }),
            }),
          ];
        case 1:
          // Send email notification to clinic administrators
          _c.sent();
          // Send push notification if configured
          return [
            4 /*yield*/,
            fetch("/api/notifications/push", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: "Alerta de Estoque Resolvido",
                body: ""
                  .concat((_b = alert.product) === null || _b === void 0 ? void 0 : _b.name, ": ")
                  .concat(resolveData.resolution),
                data: notificationData,
                audience: "clinic_managers",
                clinicId: clinicId,
              }),
            }),
          ];
        case 2:
          // Send push notification if configured
          _c.sent();
          console.log("Notifications sent for resolved alert ".concat(alert.id));
          return [3 /*break*/, 4];
        case 3:
          error_4 = _c.sent();
          console.error("Error sending resolution notifications:", error_4);
          return [3 /*break*/, 4];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Integrate with purchasing system to track reorder status
 */
function integratePurchasingSystem(supabase, alert, resolveData, clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var purchaseOrder, _a, order, orderError, followUpDate, error_5;
    var _b;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4, , 5]);
          purchaseOrder = {
            clinic_id: clinicId,
            product_id: alert.product_id,
            alert_id: alert.id,
            status: "initiated",
            quantity_ordered: resolveData.quantityOrdered || alert.suggested_reorder_quantity,
            supplier_id:
              ((_b = alert.product) === null || _b === void 0 ? void 0 : _b.supplier_id) || null,
            expected_delivery_date:
              resolveData.expectedDeliveryDate ||
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days default
            order_notes: resolveData.orderNotes || "Automatic reorder from stock alert resolution",
            created_at: new Date().toISOString(),
            created_by: resolveData.resolvedBy || "system",
          };
          return [
            4 /*yield*/,
            supabase.from("purchase_orders").insert(purchaseOrder).select().single(),
          ];
        case 1:
          (_a = _c.sent()), (order = _a.data), (orderError = _a.error);
          if (orderError) {
            console.error("Error creating purchase order:", orderError);
            return [2 /*return*/];
          }
          // Create tracking entry
          return [
            4 /*yield*/,
            supabase.from("purchase_order_tracking").insert({
              order_id: order.id,
              status: "order_placed",
              notes: "Order placed automatically from stock alert resolution",
              timestamp: new Date().toISOString(),
              updated_by: "system",
            }),
          ];
        case 2:
          // Create tracking entry
          _c.sent();
          followUpDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
          return [
            4 /*yield*/,
            supabase.from("scheduled_tasks").insert({
              clinic_id: clinicId,
              task_type: "check_purchase_order_status",
              reference_id: order.id,
              scheduled_for: followUpDate.toISOString(),
              task_data: {
                orderId: order.id,
                productId: alert.product_id,
                alertId: alert.id,
              },
              created_at: new Date().toISOString(),
            }),
          ];
        case 3:
          _c.sent();
          console.log(
            "Purchase order "
              .concat(order.id, " created and tracking initiated for product ")
              .concat(alert.product_id),
          );
          return [3 /*break*/, 5];
        case 4:
          error_5 = _c.sent();
          console.error("Error in integratePurchasingSystem:", error_5);
          return [3 /*break*/, 5];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// OPTIONS - CORS support
// =====================================================
function OPTIONS() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [
        2 /*return*/,
        new server_1.NextResponse(null, {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }),
      ];
    });
  });
}
