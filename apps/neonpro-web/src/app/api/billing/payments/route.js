"use strict";
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
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
var zod_1 = require("zod");
// Validation schemas
var CreatePaymentSchema = zod_1.z.object({
    invoice_id: zod_1.z.string().uuid("ID da fatura inválido"),
    amount: zod_1.z.number().min(0.01, "Valor deve ser maior que zero"),
    method: zod_1.z.enum(["cash", "card", "bank_transfer", "pix", "check"]),
    payment_date: zod_1.z.string().optional(),
    installments: zod_1.z.number().int().min(1).default(1),
    notes: zod_1.z.string().optional(),
    external_id: zod_1.z.string().optional(),
    gateway: zod_1.z.string().optional(),
});
var UpdatePaymentSchema = zod_1.z.object({
    status: zod_1.z
        .enum(["pending", "processing", "completed", "failed", "cancelled"])
        .optional(),
    notes: zod_1.z.string().optional(),
    processed_at: zod_1.z.string().optional(),
});
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, user, searchParams, invoiceId, status_1, method, startDate, endDate, page, limit, offset, query, _a, payments, error, count, totalAmount, pendingAmount, error_1;
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
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 })];
                    }
                    searchParams = new URL(request.url).searchParams;
                    invoiceId = searchParams.get("invoice_id");
                    status_1 = searchParams.get("status");
                    method = searchParams.get("method");
                    startDate = searchParams.get("start_date");
                    endDate = searchParams.get("end_date");
                    page = parseInt(searchParams.get("page") || "1");
                    limit = parseInt(searchParams.get("limit") || "20");
                    offset = (page - 1) * limit;
                    query = supabase
                        .from("payments")
                        .select("\n        *,\n        invoice:invoices(\n          id,\n          invoice_number,\n          total_amount,\n          status,\n          patient:profiles!invoices_patient_id_fkey(\n            id,\n            full_name,\n            email\n          )\n        ),\n        installment_payments(\n          id,\n          installment_number,\n          amount,\n          due_date,\n          status,\n          payment_date\n        )\n      ")
                        .order("created_at", { ascending: false })
                        .range(offset, offset + limit - 1);
                    // Apply filters
                    if (invoiceId) {
                        query = query.eq("invoice_id", invoiceId);
                    }
                    if (status_1) {
                        query = query.eq("status", status_1);
                    }
                    if (method) {
                        query = query.eq("method", method);
                    }
                    if (startDate && endDate) {
                        query = query.gte("payment_date", startDate).lte("payment_date", endDate);
                    }
                    else if (startDate) {
                        query = query.gte("payment_date", startDate);
                    }
                    else if (endDate) {
                        query = query.lte("payment_date", endDate);
                    }
                    return [4 /*yield*/, query];
                case 3:
                    _a = _b.sent(), payments = _a.data, error = _a.error, count = _a.count;
                    if (error) {
                        console.error("Error fetching payments:", error);
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })];
                    }
                    totalAmount = (payments === null || payments === void 0 ? void 0 : payments.reduce(function (sum, payment) {
                        return payment.status === "completed" ? sum + payment.amount : sum;
                    }, 0)) || 0;
                    pendingAmount = (payments === null || payments === void 0 ? void 0 : payments.reduce(function (sum, payment) {
                        return ["pending", "processing"].includes(payment.status)
                            ? sum + payment.amount
                            : sum;
                    }, 0)) || 0;
                    return [2 /*return*/, server_2.NextResponse.json({
                            payments: payments,
                            summary: {
                                total_amount: totalAmount,
                                pending_amount: pendingAmount,
                                completed_count: (payments === null || payments === void 0 ? void 0 : payments.filter(function (p) { return p.status === "completed"; }).length) || 0,
                                total_count: count || 0,
                            },
                            pagination: {
                                page: page,
                                limit: limit,
                                total: count || 0,
                                pages: Math.ceil((count || 0) / limit),
                            },
                        })];
                case 4:
                    error_1 = _b.sent();
                    console.error("API Error:", error_1);
                    return [2 /*return*/, server_2.NextResponse.json({ error: "Internal Server Error" }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, user, body, validatedData, _a, invoice, invoiceError, _b, existingPayments, paymentsError, paidAmount, remainingBalance, netAmount, _c, payment, paymentError, newPaidAmount, installmentAmount, installments, i, dueDate, installmentsError, error_2;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 11, , 12]);
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 1:
                    supabase = _d.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    user = (_d.sent()).data.user;
                    if (!user) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _d.sent();
                    validatedData = CreatePaymentSchema.parse(body);
                    return [4 /*yield*/, supabase
                            .from("invoices")
                            .select("id, total_amount, status")
                            .eq("id", validatedData.invoice_id)
                            .single()];
                case 4:
                    _a = _d.sent(), invoice = _a.data, invoiceError = _a.error;
                    if (invoiceError || !invoice) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Invoice not found" }, { status: 404 })];
                    }
                    return [4 /*yield*/, supabase
                            .from("payments")
                            .select("amount")
                            .eq("invoice_id", validatedData.invoice_id)
                            .eq("status", "completed")];
                case 5:
                    _b = _d.sent(), existingPayments = _b.data, paymentsError = _b.error;
                    if (paymentsError) {
                        console.error("Error checking existing payments:", paymentsError);
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Failed to check existing payments" }, { status: 500 })];
                    }
                    paidAmount = (existingPayments === null || existingPayments === void 0 ? void 0 : existingPayments.reduce(function (sum, p) { return sum + p.amount; }, 0)) || 0;
                    remainingBalance = invoice.total_amount - paidAmount;
                    if (validatedData.amount > remainingBalance) {
                        return [2 /*return*/, server_2.NextResponse.json({
                                error: "Payment amount exceeds remaining balance",
                                remaining_balance: remainingBalance,
                            }, { status: 400 })];
                    }
                    netAmount = validatedData.amount -
                        (validatedData.gateway === "stripe" ? validatedData.amount * 0.029 : 0);
                    return [4 /*yield*/, supabase
                            .from("payments")
                            .insert({
                            invoice_id: validatedData.invoice_id,
                            amount: validatedData.amount,
                            method: validatedData.method,
                            payment_date: validatedData.payment_date || new Date().toISOString(),
                            status: validatedData.method === "cash" ? "completed" : "pending",
                            installments: validatedData.installments,
                            installment_number: 1,
                            fees: validatedData.gateway === "stripe" ? validatedData.amount * 0.029 : 0,
                            net_amount: netAmount,
                            notes: validatedData.notes,
                            external_id: validatedData.external_id,
                            gateway: validatedData.gateway,
                            processed_at: validatedData.method === "cash" ? new Date().toISOString() : null,
                            created_by: user.id,
                            clinic_id: user.id,
                        })
                            .select("\n        *,\n        invoice:invoices(\n          id,\n          invoice_number,\n          total_amount,\n          status,\n          patient:profiles!invoices_patient_id_fkey(\n            full_name,\n            email\n          )\n        )\n      ")
                            .single()];
                case 6:
                    _c = _d.sent(), payment = _c.data, paymentError = _c.error;
                    if (paymentError) {
                        console.error("Error creating payment:", paymentError);
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Failed to create payment" }, { status: 500 })];
                    }
                    if (!(payment.status === "completed")) return [3 /*break*/, 8];
                    newPaidAmount = paidAmount + validatedData.amount;
                    if (!(newPaidAmount >= invoice.total_amount)) return [3 /*break*/, 8];
                    return [4 /*yield*/, supabase
                            .from("invoices")
                            .update({ status: "paid" })
                            .eq("id", validatedData.invoice_id)];
                case 7:
                    _d.sent();
                    _d.label = 8;
                case 8:
                    if (!(validatedData.installments > 1)) return [3 /*break*/, 10];
                    installmentAmount = validatedData.amount / validatedData.installments;
                    installments = [];
                    for (i = 2; i <= validatedData.installments; i++) {
                        dueDate = new Date();
                        dueDate.setMonth(dueDate.getMonth() + (i - 1));
                        installments.push({
                            payment_id: payment.id,
                            invoice_id: validatedData.invoice_id,
                            installment_number: i,
                            amount: installmentAmount,
                            due_date: dueDate.toISOString(),
                            status: "pending",
                        });
                    }
                    if (!(installments.length > 0)) return [3 /*break*/, 10];
                    return [4 /*yield*/, supabase
                            .from("installment_payments")
                            .insert(installments)];
                case 9:
                    installmentsError = (_d.sent()).error;
                    if (installmentsError) {
                        console.error("Error creating installments:", installmentsError);
                        // Don't fail the payment creation, just log the error
                    }
                    _d.label = 10;
                case 10: return [2 /*return*/, server_2.NextResponse.json({ payment: payment }, { status: 201 })];
                case 11:
                    error_2 = _d.sent();
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Validation failed", details: error_2.errors }, { status: 400 })];
                    }
                    console.error("API Error:", error_2);
                    return [2 /*return*/, server_2.NextResponse.json({ error: "Internal Server Error" }, { status: 500 })];
                case 12: return [2 /*return*/];
            }
        });
    });
}
