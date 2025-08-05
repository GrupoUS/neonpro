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
exports.PATCH = PATCH;
exports.DELETE = DELETE;
// Individual Purchase Order API Endpoints
// GET /api/inventory/purchase-orders/[id] - Get specific purchase order
// PATCH /api/inventory/purchase-orders/[id] - Update purchase order status
// DELETE /api/inventory/purchase-orders/[id] - Cancel purchase order
var purchase_order_service_1 = require("@/app/lib/services/purchase-order-service");
var server_1 = require("@/app/utils/supabase/server");
var server_2 = require("next/server");
var zod_1 = require("zod");
var updatePurchaseOrderSchema = zod_1.z.object({
  status: zod_1.z
    .enum(["draft", "pending_approval", "approved", "sent", "received", "cancelled"])
    .optional(),
  notes: zod_1.z.string().optional(),
  supplier_id: zod_1.z.string().optional(),
  expected_delivery_date: zod_1.z.string().optional(),
  template_type: zod_1.z.enum(["standard", "medical", "urgent"]).optional(),
});
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, user, _c, purchaseOrder, error, transformedOrder, error_1;
    var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var params = _b.params;
    return __generator(this, (_p) => {
      switch (_p.label) {
        case 0:
          _p.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _p.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _p.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("purchase_orders")
              .select(
                "\n        *,\n        suppliers (\n          id,\n          name,\n          contact_email,\n          contact_phone,\n          payment_terms\n        ),\n        purchase_order_items (\n          *,\n          inventory_items (\n            name,\n            sku,\n            unit,\n            category\n          )\n        ),\n        clinics (\n          name,\n          address,\n          phone,\n          email\n        )\n      ",
              )
              .eq("id", params.id)
              .single(),
          ];
        case 3:
          (_c = _p.sent()), (purchaseOrder = _c.data), (error = _c.error);
          if (error) {
            if (error.code === "PGRST116") {
              return [
                2 /*return*/,
                server_2.NextResponse.json({ error: "Purchase order not found" }, { status: 404 }),
              ];
            }
            console.error("Error fetching purchase order:", error);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Failed to fetch purchase order" },
                { status: 500 },
              ),
            ];
          }
          transformedOrder = {
            id: purchaseOrder.id,
            order_number: purchaseOrder.order_number,
            supplier: {
              id: (_d = purchaseOrder.suppliers) === null || _d === void 0 ? void 0 : _d.id,
              name: (_e = purchaseOrder.suppliers) === null || _e === void 0 ? void 0 : _e.name,
              email:
                (_f = purchaseOrder.suppliers) === null || _f === void 0
                  ? void 0
                  : _f.contact_email,
              phone:
                (_g = purchaseOrder.suppliers) === null || _g === void 0
                  ? void 0
                  : _g.contact_phone,
              payment_terms:
                (_h = purchaseOrder.suppliers) === null || _h === void 0
                  ? void 0
                  : _h.payment_terms,
            },
            clinic: {
              name: (_j = purchaseOrder.clinics) === null || _j === void 0 ? void 0 : _j.name,
              address: (_k = purchaseOrder.clinics) === null || _k === void 0 ? void 0 : _k.address,
              phone: (_l = purchaseOrder.clinics) === null || _l === void 0 ? void 0 : _l.phone,
              email: (_m = purchaseOrder.clinics) === null || _m === void 0 ? void 0 : _m.email,
            },
            clinic_id: purchaseOrder.clinic_id,
            status: purchaseOrder.status,
            total_amount: purchaseOrder.total_amount,
            expected_delivery_date: purchaseOrder.expected_delivery_date,
            created_at: purchaseOrder.created_at,
            created_by: purchaseOrder.created_by,
            notes: purchaseOrder.notes,
            items:
              ((_o = purchaseOrder.purchase_order_items) === null || _o === void 0
                ? void 0
                : _o.map((item) => {
                    var _a, _b, _c, _d;
                    return {
                      id: item.id,
                      item_id: item.item_id,
                      item_name:
                        (_a = item.inventory_items) === null || _a === void 0 ? void 0 : _a.name,
                      sku: (_b = item.inventory_items) === null || _b === void 0 ? void 0 : _b.sku,
                      unit:
                        (_c = item.inventory_items) === null || _c === void 0 ? void 0 : _c.unit,
                      category:
                        (_d = item.inventory_items) === null || _d === void 0
                          ? void 0
                          : _d.category,
                      quantity: item.quantity,
                      unit_price: item.unit_price,
                      total_price: item.total_price,
                      supplier_sku: item.supplier_sku,
                    };
                  })) || [],
          };
          return [2 /*return*/, server_2.NextResponse.json({ purchase_order: transformedOrder })];
        case 4:
          error_1 = _p.sent();
          console.error("Error in purchase order GET:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function PATCH(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      user,
      body,
      validatedData,
      _c,
      existingPO,
      fetchError,
      validTransitions,
      allowedStatuses,
      updateData,
      _d,
      updatedPO,
      updateError,
      template,
      _e,
      fullPO,
      fullPOError,
      purchaseOrderData,
      error_2;
    var params = _b.params;
    return __generator(this, (_f) => {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 9, , 10]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _f.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _f.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _f.sent();
          validatedData = updatePurchaseOrderSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("purchase_orders")
              .select("id, status, clinic_id")
              .eq("id", params.id)
              .single(),
          ];
        case 4:
          (_c = _f.sent()), (existingPO = _c.data), (fetchError = _c.error);
          if (fetchError) {
            if (fetchError.code === "PGRST116") {
              return [
                2 /*return*/,
                server_2.NextResponse.json({ error: "Purchase order not found" }, { status: 404 }),
              ];
            }
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Failed to fetch purchase order" },
                { status: 500 },
              ),
            ];
          }
          validTransitions = {
            draft: ["pending_approval", "approved", "cancelled"],
            pending_approval: ["approved", "draft", "cancelled"],
            approved: ["sent", "cancelled"],
            sent: ["received", "cancelled"],
            received: [],
            cancelled: [],
          };
          if (validatedData.status && existingPO.status !== validatedData.status) {
            allowedStatuses = validTransitions[existingPO.status] || [];
            if (!allowedStatuses.includes(validatedData.status)) {
              return [
                2 /*return*/,
                server_2.NextResponse.json(
                  {
                    error: "Cannot change status from "
                      .concat(existingPO.status, " to ")
                      .concat(validatedData.status),
                  },
                  { status: 400 },
                ),
              ];
            }
          }
          updateData = {};
          if (validatedData.status) updateData.status = validatedData.status;
          if (validatedData.notes) updateData.notes = validatedData.notes;
          if (validatedData.supplier_id) updateData.supplier_id = validatedData.supplier_id;
          if (validatedData.expected_delivery_date) {
            updateData.expected_delivery_date = validatedData.expected_delivery_date;
          }
          updateData.updated_at = new Date().toISOString();
          return [
            4 /*yield*/,
            supabase
              .from("purchase_orders")
              .update(updateData)
              .eq("id", params.id)
              .select()
              .single(),
          ];
        case 5:
          (_d = _f.sent()), (updatedPO = _d.data), (updateError = _d.error);
          if (updateError) {
            console.error("Error updating purchase order:", updateError);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Failed to update purchase order" },
                { status: 500 },
              ),
            ];
          }
          template = null;
          if (
            !(
              validatedData.template_type &&
              (updatedPO.status === "approved" || updatedPO.status === "sent")
            )
          )
            return [3 /*break*/, 8];
          return [
            4 /*yield*/,
            supabase
              .from("purchase_orders")
              .select(
                "\n          *,\n          purchase_order_items (\n            *,\n            inventory_items (name)\n          )\n        ",
              )
              .eq("id", params.id)
              .single(),
          ];
        case 6:
          (_e = _f.sent()), (fullPO = _e.data), (fullPOError = _e.error);
          if (!(!fullPOError && fullPO)) return [3 /*break*/, 8];
          purchaseOrderData = {
            id: fullPO.id,
            order_number: fullPO.order_number,
            supplier_id: fullPO.supplier_id,
            clinic_id: fullPO.clinic_id,
            status: fullPO.status,
            total_amount: fullPO.total_amount,
            expected_delivery_date: new Date(fullPO.expected_delivery_date),
            created_at: new Date(fullPO.created_at),
            created_by: fullPO.created_by,
            items: fullPO.purchase_order_items.map((item) => ({
              item_id: item.item_id,
              item_name: item.inventory_items.name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              supplier_sku: item.supplier_sku,
            })),
          };
          return [
            4 /*yield*/,
            purchase_order_service_1.purchaseOrderService.generatePOTemplate(
              purchaseOrderData,
              validatedData.template_type,
            ),
          ];
        case 7:
          template = _f.sent();
          _f.label = 8;
        case 8:
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              purchase_order: updatedPO,
              template: template,
              message: "Purchase order updated successfully",
            }),
          ];
        case 9:
          error_2 = _f.sent();
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  error: "Validation error",
                  details: error_2.errors,
                },
                { status: 400 },
              ),
            ];
          }
          console.error("Error in purchase order PATCH:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 10:
          return [2 /*return*/];
      }
    });
  });
}
function DELETE(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      user,
      _c,
      existingPO,
      fetchError,
      cancelableStatuses,
      _d,
      cancelledPO,
      cancelError,
      error_3;
    var params = _b.params;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          user = _e.sent().data.user;
          if (!user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("purchase_orders").select("id, status").eq("id", params.id).single(),
          ];
        case 3:
          (_c = _e.sent()), (existingPO = _c.data), (fetchError = _c.error);
          if (fetchError) {
            if (fetchError.code === "PGRST116") {
              return [
                2 /*return*/,
                server_2.NextResponse.json({ error: "Purchase order not found" }, { status: 404 }),
              ];
            }
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Failed to fetch purchase order" },
                { status: 500 },
              ),
            ];
          }
          cancelableStatuses = ["draft", "pending_approval", "approved", "sent"];
          if (!cancelableStatuses.includes(existingPO.status)) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                {
                  error: "Cannot cancel purchase order with status: ".concat(existingPO.status),
                },
                { status: 400 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("purchase_orders")
              .update({
                status: "cancelled",
                updated_at: new Date().toISOString(),
                notes: existingPO.notes + "\n[CANCELLED] Purchase order cancelled by user.",
              })
              .eq("id", params.id)
              .select()
              .single(),
          ];
        case 4:
          (_d = _e.sent()), (cancelledPO = _d.data), (cancelError = _d.error);
          if (cancelError) {
            console.error("Error cancelling purchase order:", cancelError);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Failed to cancel purchase order" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              purchase_order: cancelledPO,
              message: "Purchase order cancelled successfully",
            }),
          ];
        case 5:
          error_3 = _e.sent();
          console.error("Error in purchase order DELETE:", error_3);
          return [
            2 /*return*/,
            server_2.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
