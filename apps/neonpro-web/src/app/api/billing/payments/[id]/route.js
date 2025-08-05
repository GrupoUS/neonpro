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
exports.PUT = PUT;
exports.DELETE = DELETE;
exports.POST = POST;
var server_1 = require("@/app/utils/supabase/server");
var server_2 = require("next/server");
var zod_1 = require("zod");
var UpdatePaymentSchema = zod_1.z.object({
    status: zod_1.z
        .enum(["pending", "processing", "completed", "failed", "cancelled"])
        .optional(),
    notes: zod_1.z.string().optional(),
    processed_at: zod_1.z.string().optional(),
    external_id: zod_1.z.string().optional(),
    gateway: zod_1.z.string().optional(),
});
function GET(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var resolvedParams, supabase, user, _c, payment, error, error_1;
        var params = _b.params;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, params];
                case 1:
                    resolvedParams = _d.sent();
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 2:
                    supabase = _d.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 3:
                    user = (_d.sent()).data.user;
                    if (!user) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from("payments")
                            .select("\n        *,\n        invoice:invoices(\n          id,\n          invoice_number,\n          total_amount,\n          status,\n          issue_date,\n          due_date,\n          patient:profiles!invoices_patient_id_fkey(\n            id,\n            full_name,\n            email,\n            phone\n          ),\n          appointment:appointments(\n            id,\n            scheduled_for,\n            status\n          )\n        ),\n        installment_payments(\n          id,\n          installment_number,\n          amount,\n          due_date,\n          status,\n          payment_date,\n          notes\n        )\n      ")
                            .eq("id", resolvedParams.id)
                            .single()];
                case 4:
                    _c = _d.sent(), payment = _c.data, error = _c.error;
                    if (error || !payment) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Payment not found" }, { status: 404 })];
                    }
                    return [2 /*return*/, server_2.NextResponse.json({ payment: payment })];
                case 5:
                    error_1 = _d.sent();
                    console.error("API Error:", error_1);
                    return [2 /*return*/, server_2.NextResponse.json({ error: "Internal Server Error" }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function PUT(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var resolvedParams, supabase, user, body, validatedData, _c, currentPayment, currentError, updateData, _d, payment, error, _e, completedPayments, paymentsError, totalPaid, error_2;
        var params = _b.params;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, params];
                case 1:
                    resolvedParams = _f.sent();
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 2:
                    supabase = _f.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 3:
                    user = (_f.sent()).data.user;
                    if (!user) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 4:
                    body = _f.sent();
                    validatedData = UpdatePaymentSchema.parse(body);
                    return [4 /*yield*/, supabase
                            .from("payments")
                            .select("*, invoice:invoices(id, total_amount, status)")
                            .eq("id", resolvedParams.id)
                            .single()];
                case 5:
                    _c = _f.sent(), currentPayment = _c.data, currentError = _c.error;
                    if (currentError || !currentPayment) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Payment not found" }, { status: 404 })];
                    }
                    updateData = __assign({}, validatedData);
                    // If status is being changed to completed, set processed_at
                    if (validatedData.status === "completed" &&
                        currentPayment.status !== "completed") {
                        updateData.processed_at = new Date().toISOString();
                    }
                    return [4 /*yield*/, supabase
                            .from("payments")
                            .update(updateData)
                            .eq("id", resolvedParams.id)
                            .select("\n        *,\n        invoice:invoices(\n          id,\n          invoice_number,\n          total_amount,\n          status,\n          patient:profiles!invoices_patient_id_fkey(\n            full_name,\n            email\n          )\n        )\n      ")
                            .single()];
                case 6:
                    _d = _f.sent(), payment = _d.data, error = _d.error;
                    if (error) {
                        console.error("Error updating payment:", error);
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Failed to update payment" }, { status: 500 })];
                    }
                    if (!(validatedData.status === "completed" &&
                        currentPayment.status !== "completed")) return [3 /*break*/, 9];
                    return [4 /*yield*/, supabase
                            .from("payments")
                            .select("amount")
                            .eq("invoice_id", currentPayment.invoice_id)
                            .eq("status", "completed")];
                case 7:
                    _e = _f.sent(), completedPayments = _e.data, paymentsError = _e.error;
                    if (!(!paymentsError && completedPayments)) return [3 /*break*/, 9];
                    totalPaid = completedPayments.reduce(function (sum, p) { return sum + p.amount; }, 0);
                    if (!(totalPaid >= currentPayment.invoice.total_amount)) return [3 /*break*/, 9];
                    return [4 /*yield*/, supabase
                            .from("invoices")
                            .update({ status: "paid" })
                            .eq("id", currentPayment.invoice_id)];
                case 8:
                    _f.sent();
                    _f.label = 9;
                case 9: return [2 /*return*/, server_2.NextResponse.json({ payment: payment })];
                case 10:
                    error_2 = _f.sent();
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Validation failed", details: error_2.errors }, { status: 400 })];
                    }
                    console.error("API Error:", error_2);
                    return [2 /*return*/, server_2.NextResponse.json({ error: "Internal Server Error" }, { status: 500 })];
                case 11: return [2 /*return*/];
            }
        });
    });
}
function DELETE(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var resolvedParams, supabase, user, _c, payment, paymentError, installmentsError, error, _d, remainingPayments, remainingError, totalPaid, error_3;
        var params = _b.params;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, params];
                case 1:
                    resolvedParams = _e.sent();
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 2:
                    supabase = _e.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 3:
                    user = (_e.sent()).data.user;
                    if (!user) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from("payments")
                            .select("*, invoice:invoices(id, total_amount)")
                            .eq("id", resolvedParams.id)
                            .single()];
                case 4:
                    _c = _e.sent(), payment = _c.data, paymentError = _c.error;
                    if (paymentError || !payment) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Payment not found" }, { status: 404 })];
                    }
                    // Don't allow deletion of completed payments
                    if (payment.status === "completed") {
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Cannot delete completed payments" }, { status: 400 })];
                    }
                    return [4 /*yield*/, supabase
                            .from("installment_payments")
                            .delete()
                            .eq("payment_id", resolvedParams.id)];
                case 5:
                    installmentsError = (_e.sent()).error;
                    if (installmentsError) {
                        console.error("Error deleting installments:", installmentsError);
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Failed to delete payment installments" }, { status: 500 })];
                    }
                    return [4 /*yield*/, supabase
                            .from("payments")
                            .delete()
                            .eq("id", resolvedParams.id)];
                case 6:
                    error = (_e.sent()).error;
                    if (error) {
                        console.error("Error deleting payment:", error);
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Failed to delete payment" }, { status: 500 })];
                    }
                    return [4 /*yield*/, supabase
                            .from("payments")
                            .select("amount")
                            .eq("invoice_id", payment.invoice_id)
                            .eq("status", "completed")];
                case 7:
                    _d = _e.sent(), remainingPayments = _d.data, remainingError = _d.error;
                    if (!!remainingError) return [3 /*break*/, 9];
                    totalPaid = (remainingPayments === null || remainingPayments === void 0 ? void 0 : remainingPayments.reduce(function (sum, p) { return sum + p.amount; }, 0)) || 0;
                    if (!(totalPaid < payment.invoice.total_amount)) return [3 /*break*/, 9];
                    return [4 /*yield*/, supabase
                            .from("invoices")
                            .update({ status: "pending" })
                            .eq("id", payment.invoice_id)];
                case 8:
                    _e.sent();
                    _e.label = 9;
                case 9: return [2 /*return*/, server_2.NextResponse.json({ message: "Payment deleted successfully" })];
                case 10:
                    error_3 = _e.sent();
                    console.error("API Error:", error_3);
                    return [2 /*return*/, server_2.NextResponse.json({ error: "Internal Server Error" }, { status: 500 })];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// Refund payment
function POST(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var resolvedParams, supabase, user, body, action, refundAmount, reason, _c, payment, paymentError, _d, refund, refundError, _e, allPayments, paymentsError, totalPaid, _f, invoice, invoiceError, newStatus, error_4;
        var params = _b.params;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 12, , 13]);
                    return [4 /*yield*/, params];
                case 1:
                    resolvedParams = _g.sent();
                    return [4 /*yield*/, (0, server_1.createClient)()];
                case 2:
                    supabase = _g.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 3:
                    user = (_g.sent()).data.user;
                    if (!user) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Unauthorized" }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 4:
                    body = _g.sent();
                    action = body.action;
                    if (!(action === "refund")) return [3 /*break*/, 11];
                    refundAmount = parseFloat(body.amount) || 0;
                    reason = body.reason || "Refund requested";
                    return [4 /*yield*/, supabase
                            .from("payments")
                            .select("*")
                            .eq("id", resolvedParams.id)
                            .single()];
                case 5:
                    _c = _g.sent(), payment = _c.data, paymentError = _c.error;
                    if (paymentError || !payment) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Payment not found" }, { status: 404 })];
                    }
                    if (payment.status !== "completed") {
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Can only refund completed payments" }, { status: 400 })];
                    }
                    if (refundAmount > payment.amount) {
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Refund amount cannot exceed payment amount" }, { status: 400 })];
                    }
                    return [4 /*yield*/, supabase
                            .from("payments")
                            .insert({
                            invoice_id: payment.invoice_id,
                            amount: -refundAmount,
                            method: payment.method,
                            payment_date: new Date().toISOString(),
                            status: "completed",
                            installments: 1,
                            installment_number: 1,
                            fees: 0,
                            net_amount: -refundAmount,
                            notes: "Refund of payment ".concat(payment.payment_number, ": ").concat(reason),
                            external_id: payment.external_id,
                            gateway: payment.gateway,
                            processed_at: new Date().toISOString(),
                            created_by: user.id,
                            clinic_id: user.id,
                        })
                            .select()
                            .single()];
                case 6:
                    _d = _g.sent(), refund = _d.data, refundError = _d.error;
                    if (refundError) {
                        console.error("Error creating refund:", refundError);
                        return [2 /*return*/, server_2.NextResponse.json({ error: "Failed to create refund" }, { status: 500 })];
                    }
                    return [4 /*yield*/, supabase
                            .from("payments")
                            .select("amount")
                            .eq("invoice_id", payment.invoice_id)
                            .eq("status", "completed")];
                case 7:
                    _e = _g.sent(), allPayments = _e.data, paymentsError = _e.error;
                    if (!(!paymentsError && allPayments)) return [3 /*break*/, 10];
                    totalPaid = allPayments.reduce(function (sum, p) { return sum + p.amount; }, 0);
                    return [4 /*yield*/, supabase
                            .from("invoices")
                            .select("total_amount")
                            .eq("id", payment.invoice_id)
                            .single()];
                case 8:
                    _f = _g.sent(), invoice = _f.data, invoiceError = _f.error;
                    if (!(!invoiceError && invoice)) return [3 /*break*/, 10];
                    newStatus = totalPaid >= invoice.total_amount ? "paid" : "pending";
                    return [4 /*yield*/, supabase
                            .from("invoices")
                            .update({ status: newStatus })
                            .eq("id", payment.invoice_id)];
                case 9:
                    _g.sent();
                    _g.label = 10;
                case 10: return [2 /*return*/, server_2.NextResponse.json({
                        refund: refund,
                        message: "Refund processed successfully",
                    })];
                case 11: return [2 /*return*/, server_2.NextResponse.json({ error: "Invalid action" }, { status: 400 })];
                case 12:
                    error_4 = _g.sent();
                    console.error("API Error:", error_4);
                    return [2 /*return*/, server_2.NextResponse.json({ error: "Internal Server Error" }, { status: 500 })];
                case 13: return [2 /*return*/];
            }
        });
    });
}
