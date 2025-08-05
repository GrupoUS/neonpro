"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
// Purchase Orders API Endpoints
// GET /api/inventory/purchase-orders - List purchase orders
// POST /api/inventory/purchase-orders - Create new purchase order
var purchase_order_service_1 = require("@/app/lib/services/purchase-order-service");
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
var zod_1 = require("zod");
// Validation schemas
var createPurchaseOrderSchema = zod_1.z.object({
    clinic_id: zod_1.z.string().min(1, 'Clinic ID is required'),
    items: zod_1.z.array(zod_1.z.object({
        itemId: zod_1.z.string().min(1, 'Item ID is required'),
        requiredQuantity: zod_1.z.number().min(1, 'Quantity must be at least 1')
    })).min(1, 'At least one item is required'),
    user_id: zod_1.z.string().min(1, 'User ID is required'),
    auto_optimize: zod_1.z.boolean().optional().default(true),
    template_type: zod_1.z.enum(['standard', 'medical', 'urgent']).optional().default('standard')
});
var purchaseOrderFiltersSchema = zod_1.z.object({
    clinic_id: zod_1.z.string().optional(),
    supplier_id: zod_1.z.string().optional(),
    status: zod_1.z.enum(['draft', 'pending_approval', 'approved', 'sent', 'received', 'cancelled']).optional(),
    date_from: zod_1.z.string().optional(),
    date_to: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional().transform(function (val) { return val ? parseInt(val) : 50; }),
    offset: zod_1.z.string().optional().transform(function (val) { return val ? parseInt(val) : 0; })
});
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, user, searchParams, filters, query, _a, purchaseOrders, error, transformedOrders, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    user = (_b.sent()).data.user;
                    if (!user) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    searchParams = request.nextUrl.searchParams;
                    filters = purchaseOrderFiltersSchema.parse(Object.fromEntries(searchParams));
                    query = supabase
                        .from('purchase_orders')
                        .select("\n        *,\n        suppliers (\n          id,\n          name,\n          contact_email,\n          contact_phone\n        ),\n        purchase_order_items (\n          *,\n          inventory_items (\n            name,\n            sku,\n            unit\n          )\n        )\n      ");
                    // Apply filters
                    if (filters.clinic_id) {
                        query = query.eq('clinic_id', filters.clinic_id);
                    }
                    if (filters.supplier_id) {
                        query = query.eq('supplier_id', filters.supplier_id);
                    }
                    if (filters.status) {
                        query = query.eq('status', filters.status);
                    }
                    if (filters.date_from) {
                        query = query.gte('created_at', filters.date_from);
                    }
                    if (filters.date_to) {
                        query = query.lte('created_at', filters.date_to);
                    }
                    // Apply pagination and ordering
                    query = query
                        .order('created_at', { ascending: false })
                        .range(filters.offset, filters.offset + filters.limit - 1);
                    return [4 /*yield*/, query];
                case 3:
                    _a = _b.sent(), purchaseOrders = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching purchase orders:', error);
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Failed to fetch purchase orders' }, { status: 500 })];
                    }
                    transformedOrders = (purchaseOrders === null || purchaseOrders === void 0 ? void 0 : purchaseOrders.map(function (order) {
                        var _a, _b, _c, _d, _e;
                        return ({
                            id: order.id,
                            order_number: order.order_number,
                            supplier: {
                                id: (_a = order.suppliers) === null || _a === void 0 ? void 0 : _a.id,
                                name: (_b = order.suppliers) === null || _b === void 0 ? void 0 : _b.name,
                                email: (_c = order.suppliers) === null || _c === void 0 ? void 0 : _c.contact_email,
                                phone: (_d = order.suppliers) === null || _d === void 0 ? void 0 : _d.contact_phone
                            },
                            clinic_id: order.clinic_id,
                            status: order.status,
                            total_amount: order.total_amount,
                            expected_delivery_date: order.expected_delivery_date,
                            created_at: order.created_at,
                            created_by: order.created_by,
                            items: ((_e = order.purchase_order_items) === null || _e === void 0 ? void 0 : _e.map(function (item) {
                                var _a, _b, _c;
                                return ({
                                    id: item.id,
                                    item_id: item.item_id,
                                    item_name: (_a = item.inventory_items) === null || _a === void 0 ? void 0 : _a.name,
                                    sku: (_b = item.inventory_items) === null || _b === void 0 ? void 0 : _b.sku,
                                    unit: (_c = item.inventory_items) === null || _c === void 0 ? void 0 : _c.unit,
                                    quantity: item.quantity,
                                    unit_price: item.unit_price,
                                    total_price: item.total_price,
                                    supplier_sku: item.supplier_sku
                                });
                            })) || []
                        });
                    })) || [];
                    return [2 /*return*/, server_2.NextResponse.json({
                            purchase_orders: transformedOrders,
                            total: transformedOrders.length,
                            limit: filters.limit,
                            offset: filters.offset
                        })];
                case 4:
                    error_1 = _b.sent();
                    console.error('Error in purchase orders GET:', error_1);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, user, body, validatedData, purchaseOrder_1, _a, savedPO, poError, itemsToInsert, itemsError, template, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    user = (_b.sent()).data.user;
                    if (!user) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _b.sent();
                    validatedData = createPurchaseOrderSchema.parse(body);
                    return [4 /*yield*/, purchase_order_service_1.purchaseOrderService.generatePurchaseOrder(validatedData.clinic_id, validatedData.items, validatedData.user_id)];
                case 4:
                    purchaseOrder_1 = _b.sent();
                    return [4 /*yield*/, supabase
                            .from('purchase_orders')
                            .insert({
                            id: purchaseOrder_1.id,
                            order_number: purchaseOrder_1.order_number,
                            supplier_id: purchaseOrder_1.supplier_id,
                            clinic_id: purchaseOrder_1.clinic_id,
                            status: purchaseOrder_1.status,
                            total_amount: purchaseOrder_1.total_amount,
                            expected_delivery_date: purchaseOrder_1.expected_delivery_date.toISOString(),
                            created_by: purchaseOrder_1.created_by,
                            notes: "Auto-generated purchase order with ".concat(validatedData.auto_optimize ? 'EOQ optimization' : 'standard quantities')
                        })
                            .select()
                            .single()];
                case 5:
                    _a = _b.sent(), savedPO = _a.data, poError = _a.error;
                    if (poError) {
                        console.error('Error saving purchase order:', poError);
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Failed to save purchase order' }, { status: 500 })];
                    }
                    itemsToInsert = purchaseOrder_1.items.map(function (item) { return ({
                        purchase_order_id: purchaseOrder_1.id,
                        item_id: item.item_id,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        total_price: item.total_price,
                        supplier_sku: item.supplier_sku
                    }); });
                    return [4 /*yield*/, supabase
                            .from('purchase_order_items')
                            .insert(itemsToInsert)];
                case 6:
                    itemsError = (_b.sent()).error;
                    if (itemsError) {
                        console.error('Error saving purchase order items:', itemsError);
                        return [2 /*return*/, server_2.NextResponse.json({ error: 'Failed to save purchase order items' }, { status: 500 })];
                    }
                    template = null;
                    if (!validatedData.template_type) return [3 /*break*/, 8];
                    return [4 /*yield*/, purchase_order_service_1.purchaseOrderService.generatePOTemplate(purchaseOrder_1, validatedData.template_type)];
                case 7:
                    template = _b.sent();
                    _b.label = 8;
                case 8: return [2 /*return*/, server_2.NextResponse.json({
                        purchase_order: __assign(__assign({}, purchaseOrder_1), { created_at: purchaseOrder_1.created_at.toISOString(), expected_delivery_date: purchaseOrder_1.expected_delivery_date.toISOString() }),
                        template: template,
                        message: 'Purchase order created successfully'
                    }, { status: 201 })];
                case 9:
                    error_2 = _b.sent();
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_2.NextResponse.json({
                                error: 'Validation error',
                                details: error_2.errors
                            }, { status: 400 })];
                    }
                    console.error('Error in purchase orders POST:', error_2);
                    return [2 /*return*/, server_2.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 10: return [2 /*return*/];
            }
        });
    });
}
