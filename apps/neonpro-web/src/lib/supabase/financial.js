"use strict";
/**
 * Financial Management Supabase Functions
 * Created: January 27, 2025
 * Purpose: Database operations for invoices, payments, and Brazilian compliance
 * Standards: Shadow validation + NFSe integration + Error handling
 */
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
exports.reaisToCentavos = exports.formatCurrency = exports.centavosToReais = void 0;
exports.createInvoice = createInvoice;
exports.getInvoiceById = getInvoiceById;
exports.listInvoices = listInvoices;
exports.updateInvoice = updateInvoice;
exports.issueInvoice = issueInvoice;
exports.cancelInvoice = cancelInvoice;
exports.createPayment = createPayment;
exports.getPaymentById = getPaymentById;
exports.updatePayment = updatePayment;
exports.listPaymentsByInvoice = listPaymentsByInvoice;
exports.performShadowValidation = performShadowValidation;
exports.getFinancialSummary = getFinancialSummary;
exports.generateInvoicePDF = generateInvoicePDF;
var financial_1 = require("@/lib/validations/financial");
Object.defineProperty(exports, "centavosToReais", {
  enumerable: true,
  get: function () {
    return financial_1.centavosToReais;
  },
});
Object.defineProperty(exports, "formatCurrency", {
  enumerable: true,
  get: function () {
    return financial_1.formatCurrency;
  },
});
Object.defineProperty(exports, "reaisToCentavos", {
  enumerable: true,
  get: function () {
    return financial_1.reaisToCentavos;
  },
});
var supabase_js_1 = require("@supabase/supabase-js");
// Get Supabase client
var supabase = (0, supabase_js_1.createClient)(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);
/**
 * Invoice Management Functions
 */
// Create a new invoice with items and shadow validation
function createInvoice(input) {
  return __awaiter(this, void 0, void 0, function () {
    var validatedInput,
      items,
      subtotal,
      discount,
      tax,
      total,
      clinic,
      invoiceNumber,
      _a,
      invoice_1,
      invoiceError,
      itemsWithInvoiceId,
      itemsError,
      error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 7, , 8]);
          validatedInput = financial_1.createInvoiceSchema.parse(input);
          items = validatedInput.items.map(function (item) {
            return __assign(__assign({}, item), {
              unit_price: (0, financial_1.reaisToCentavos)(item.unit_price),
              discount_amount: (0, financial_1.reaisToCentavos)(item.discount_amount || 0),
            });
          });
          subtotal = items.reduce(function (sum, item) {
            return sum + item.unit_price * item.quantity;
          }, 0);
          discount = items.reduce(function (sum, item) {
            return sum + item.discount_amount;
          }, 0);
          tax = items.reduce(function (sum, item) {
            return sum + Math.round(item.unit_price * item.quantity * item.tax_rate);
          }, 0);
          total = subtotal - discount + tax;
          return [
            4 /*yield*/,
            supabase.from("clinics").select("cnpj").eq("id", validatedInput.clinic_id).single(),
          ];
        case 1:
          clinic = _b.sent().data;
          if (!clinic) {
            throw new Error("Clinic not found");
          }
          return [
            4 /*yield*/,
            supabase.rpc("generate_invoice_number", { clinic_uuid: validatedInput.clinic_id }),
          ];
        case 2:
          invoiceNumber = _b.sent().data;
          return [
            4 /*yield*/,
            supabase
              .from("invoices")
              .insert({
                invoice_number: invoiceNumber,
                patient_id: validatedInput.patient_id,
                clinic_id: validatedInput.clinic_id,
                professional_id: validatedInput.professional_id,
                description: validatedInput.description,
                service_list_code: validatedInput.service_list_code,
                due_date: validatedInput.due_date,
                subtotal_amount: subtotal,
                discount_amount: discount,
                tax_amount: tax,
                total_amount: total,
                cnpj_issuer: clinic.cnpj,
                status: "draft",
                payment_status: "pending",
                metadata: validatedInput.metadata,
              })
              .select()
              .single(),
          ];
        case 3:
          (_a = _b.sent()), (invoice_1 = _a.data), (invoiceError = _a.error);
          if (invoiceError) throw invoiceError;
          itemsWithInvoiceId = items.map(function (item) {
            return __assign(__assign({}, item), {
              invoice_id: invoice_1.id,
              total_amount:
                item.unit_price * item.quantity -
                item.discount_amount +
                Math.round(item.unit_price * item.quantity * item.tax_rate),
              tax_amount: Math.round(item.unit_price * item.quantity * item.tax_rate),
            });
          });
          return [4 /*yield*/, supabase.from("invoice_items").insert(itemsWithInvoiceId)];
        case 4:
          itemsError = _b.sent().error;
          if (itemsError) throw itemsError;
          // Perform shadow validation
          return [
            4 /*yield*/,
            performShadowValidation("invoice_calculation", invoice_1.id, {
              subtotal: subtotal,
              discount: discount,
              tax: tax,
              total: total,
              items: itemsWithInvoiceId,
            }),
          ];
        case 5:
          // Perform shadow validation
          _b.sent();
          return [4 /*yield*/, getInvoiceById(invoice_1.id)];
        case 6:
          // Return complete invoice with items
          return [2 /*return*/, _b.sent()];
        case 7:
          error_1 = _b.sent();
          console.error("Error creating invoice:", error_1);
          throw new Error(
            "Failed to create invoice: ".concat(
              error_1 instanceof Error ? error_1.message : "Unknown error",
            ),
          );
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
// Get invoice by ID with all related data
function getInvoiceById(id) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error, error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            supabase
              .from("invoices")
              .select(
                "\n        *,\n        invoice_items(*),\n        payments(*),\n        patient:patients(id, name, email, phone, cpf),\n        clinic:clinics(id, name, cnpj, address)\n      ",
              )
              .eq("id", id)
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) throw error;
          if (!data) throw new Error("Invoice not found");
          return [2 /*return*/, data];
        case 2:
          error_2 = _b.sent();
          console.error("Error fetching invoice:", error_2);
          throw new Error(
            "Failed to fetch invoice: ".concat(
              error_2 instanceof Error ? error_2.message : "Unknown error",
            ),
          );
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// List invoices with pagination and filters
function listInvoices() {
  return __awaiter(this, arguments, void 0, function (filters, page, limit) {
    var query, offset, _a, invoices, error, count, summary, error_3;
    if (filters === void 0) {
      filters = {};
    }
    if (page === void 0) {
      page = 1;
    }
    if (limit === void 0) {
      limit = 20;
    }
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          query = supabase
            .from("invoices")
            .select(
              "\n        *,\n        patient:patients(id, name, email, phone),\n        clinic:clinics(id, name),\n        invoice_items(count)\n      ",
              { count: "exact" },
            );
          // Apply filters
          if (filters.clinic_id) {
            query = query.eq("clinic_id", filters.clinic_id);
          }
          if (filters.patient_id) {
            query = query.eq("patient_id", filters.patient_id);
          }
          if (filters.professional_id) {
            query = query.eq("professional_id", filters.professional_id);
          }
          if (filters.status && filters.status.length > 0) {
            query = query.in("status", filters.status);
          }
          if (filters.payment_status && filters.payment_status.length > 0) {
            query = query.in("payment_status", filters.payment_status);
          }
          if (filters.date_from) {
            query = query.gte("issue_date", filters.date_from);
          }
          if (filters.date_to) {
            query = query.lte("issue_date", filters.date_to);
          }
          if (filters.amount_min !== undefined) {
            query = query.gte("total_amount", (0, financial_1.reaisToCentavos)(filters.amount_min));
          }
          if (filters.amount_max !== undefined) {
            query = query.lte("total_amount", (0, financial_1.reaisToCentavos)(filters.amount_max));
          }
          if (filters.nfse_status && filters.nfse_status.length > 0) {
            query = query.in("nfse_status", filters.nfse_status);
          }
          offset = (page - 1) * limit;
          query = query.range(offset, offset + limit - 1);
          // Order by creation date (newest first)
          query = query.order("created_at", { ascending: false });
          return [4 /*yield*/, query];
        case 1:
          (_a = _b.sent()), (invoices = _a.data), (error = _a.error), (count = _a.count);
          if (error) throw error;
          return [4 /*yield*/, getFinancialSummary(filters)];
        case 2:
          summary = _b.sent();
          return [
            2 /*return*/,
            {
              invoices: invoices,
              pagination: {
                page: page,
                limit: limit,
                total: count || 0,
                pages: Math.ceil((count || 0) / limit),
              },
              summary: summary,
            },
          ];
        case 3:
          error_3 = _b.sent();
          console.error("Error listing invoices:", error_3);
          throw new Error(
            "Failed to list invoices: ".concat(
              error_3 instanceof Error ? error_3.message : "Unknown error",
            ),
          );
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
// Update invoice
function updateInvoice(id, input) {
  return __awaiter(this, void 0, void 0, function () {
    var validatedInput, _a, data, error, error_4;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          validatedInput = financial_1.updateInvoiceSchema.parse(input);
          return [
            4 /*yield*/,
            supabase
              .from("invoices")
              .update(
                __assign(__assign({}, validatedInput), { updated_at: new Date().toISOString() }),
              )
              .eq("id", id)
              .select()
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) throw error;
          if (!data) throw new Error("Invoice not found");
          return [4 /*yield*/, getInvoiceById(id)];
        case 2:
          return [2 /*return*/, _b.sent()];
        case 3:
          error_4 = _b.sent();
          console.error("Error updating invoice:", error_4);
          throw new Error(
            "Failed to update invoice: ".concat(
              error_4 instanceof Error ? error_4.message : "Unknown error",
            ),
          );
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
// Issue invoice (change status to issued and generate NFSe)
function issueInvoice(id) {
  return __awaiter(this, void 0, void 0, function () {
    var error, invoice, error_5;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 5, , 6]);
          return [
            4 /*yield*/,
            supabase
              .from("invoices")
              .update({
                status: "issued",
                updated_at: new Date().toISOString(),
              })
              .eq("id", id),
          ];
        case 1:
          error = _a.sent().error;
          if (error) throw error;
          return [4 /*yield*/, getInvoiceById(id)];
        case 2:
          invoice = _a.sent();
          return [4 /*yield*/, generateNFSe(invoice)];
        case 3:
          _a.sent();
          return [4 /*yield*/, getInvoiceById(id)];
        case 4:
          return [2 /*return*/, _a.sent()];
        case 5:
          error_5 = _a.sent();
          console.error("Error issuing invoice:", error_5);
          throw new Error(
            "Failed to issue invoice: ".concat(
              error_5 instanceof Error ? error_5.message : "Unknown error",
            ),
          );
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
// Cancel invoice
function cancelInvoice(id) {
  return __awaiter(this, void 0, void 0, function () {
    var error, invoice, error_6;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 6, , 7]);
          return [
            4 /*yield*/,
            supabase
              .from("invoices")
              .update({
                status: "cancelled",
                updated_at: new Date().toISOString(),
              })
              .eq("id", id),
          ];
        case 1:
          error = _a.sent().error;
          if (error) throw error;
          return [4 /*yield*/, getInvoiceById(id)];
        case 2:
          invoice = _a.sent();
          if (!invoice.nfse_number) return [3 /*break*/, 4];
          return [4 /*yield*/, cancelNFSe(invoice)];
        case 3:
          _a.sent();
          _a.label = 4;
        case 4:
          return [4 /*yield*/, getInvoiceById(id)];
        case 5:
          return [2 /*return*/, _a.sent()];
        case 6:
          error_6 = _a.sent();
          console.error("Error cancelling invoice:", error_6);
          throw new Error(
            "Failed to cancel invoice: ".concat(
              error_6 instanceof Error ? error_6.message : "Unknown error",
            ),
          );
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Payment Management Functions
 */
// Create payment with installments support
function createPayment(input) {
  return __awaiter(this, void 0, void 0, function () {
    var validatedInput_1,
      amount,
      _a,
      payment_1,
      paymentError,
      installments,
      installmentsError,
      error_7;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 6, , 7]);
          validatedInput_1 = financial_1.createPaymentSchema.parse(input);
          amount = (0, financial_1.reaisToCentavos)(validatedInput_1.amount);
          return [
            4 /*yield*/,
            supabase
              .from("payments")
              .insert({
                invoice_id: validatedInput_1.invoice_id,
                payment_method: validatedInput_1.payment_method,
                amount: amount,
                external_transaction_id: validatedInput_1.external_transaction_id,
                payment_processor: validatedInput_1.payment_processor,
                authorization_code: validatedInput_1.authorization_code,
                pix_key: validatedInput_1.pix_key,
                status: "pending",
                metadata: validatedInput_1.metadata,
              })
              .select()
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (payment_1 = _a.data), (paymentError = _a.error);
          if (paymentError) throw paymentError;
          if (!(validatedInput_1.installments && validatedInput_1.installments.length > 0))
            return [3 /*break*/, 3];
          installments = validatedInput_1.installments.map(function (inst) {
            return {
              payment_id: payment_1.id,
              invoice_id: validatedInput_1.invoice_id,
              installment_number: inst.installment_number,
              total_installments: inst.total_installments,
              amount: (0, financial_1.reaisToCentavos)(inst.amount),
              due_date: inst.due_date,
              status: "pending",
            };
          });
          return [4 /*yield*/, supabase.from("payment_installments").insert(installments)];
        case 2:
          installmentsError = _b.sent().error;
          if (installmentsError) throw installmentsError;
          _b.label = 3;
        case 3:
          // Process payment (mock implementation)
          return [4 /*yield*/, processPayment(payment_1)];
        case 4:
          // Process payment (mock implementation)
          _b.sent();
          return [4 /*yield*/, getPaymentById(payment_1.id)];
        case 5:
          return [2 /*return*/, _b.sent()];
        case 6:
          error_7 = _b.sent();
          console.error("Error creating payment:", error_7);
          throw new Error(
            "Failed to create payment: ".concat(
              error_7 instanceof Error ? error_7.message : "Unknown error",
            ),
          );
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
// Get payment by ID with installments
function getPaymentById(id) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error, error_8;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            supabase
              .from("payments")
              .select("\n        *,\n        installments:payment_installments(*)\n      ")
              .eq("id", id)
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) throw error;
          if (!data) throw new Error("Payment not found");
          return [2 /*return*/, data];
        case 2:
          error_8 = _b.sent();
          console.error("Error fetching payment:", error_8);
          throw new Error(
            "Failed to fetch payment: ".concat(
              error_8 instanceof Error ? error_8.message : "Unknown error",
            ),
          );
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// Update payment status
function updatePayment(id, input) {
  return __awaiter(this, void 0, void 0, function () {
    var validatedInput, updateData, _a, data, error, error_9;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          validatedInput = financial_1.updatePaymentSchema.parse(input);
          updateData = __assign(__assign({}, validatedInput), {
            updated_at: new Date().toISOString(),
          });
          // Convert processing fee to centavos if provided
          if (validatedInput.processing_fee !== undefined) {
            updateData.processing_fee = (0, financial_1.reaisToCentavos)(
              validatedInput.processing_fee,
            );
          }
          // Set processed_at timestamp if status is completed
          if (validatedInput.status === "completed") {
            updateData.processed_at = new Date().toISOString();
            updateData.confirmed_at = new Date().toISOString();
          }
          return [
            4 /*yield*/,
            supabase.from("payments").update(updateData).eq("id", id).select().single(),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) throw error;
          if (!data) throw new Error("Payment not found");
          return [4 /*yield*/, getPaymentById(id)];
        case 2:
          return [2 /*return*/, _b.sent()];
        case 3:
          error_9 = _b.sent();
          console.error("Error updating payment:", error_9);
          throw new Error(
            "Failed to update payment: ".concat(
              error_9 instanceof Error ? error_9.message : "Unknown error",
            ),
          );
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
// List payments for an invoice
function listPaymentsByInvoice(invoiceId) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error, error_10;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            supabase
              .from("payments")
              .select("\n        *,\n        installments:payment_installments(*)\n      ")
              .eq("invoice_id", invoiceId)
              .order("created_at", { ascending: false }),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) throw error;
          return [2 /*return*/, data];
        case 2:
          error_10 = _b.sent();
          console.error("Error listing payments:", error_10);
          throw new Error(
            "Failed to list payments: ".concat(
              error_10 instanceof Error ? error_10.message : "Unknown error",
            ),
          );
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Shadow Validation Functions
 */
// Perform shadow validation for financial calculations
function performShadowValidation(operationType, referenceId, calculationData) {
  return __awaiter(this, void 0, void 0, function () {
    var shadowResult, _a, data, error, error_11;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          return [4 /*yield*/, performShadowCalculation(operationType, calculationData)];
        case 1:
          shadowResult = _b.sent();
          return [
            4 /*yield*/,
            supabase
              .from("shadow_validations")
              .insert({
                operation_type: operationType,
                reference_id: referenceId,
                reference_table: getTableName(operationType),
                original_calculation: calculationData,
                shadow_calculation: shadowResult.shadow,
                variance: shadowResult.variance,
                variance_percentage: shadowResult.variance_percentage,
                validation_status: shadowResult.is_valid ? "validated" : "failed",
                validation_message: shadowResult.tolerance_exceeded
                  ? "Variance exceeds tolerance"
                  : undefined,
              })
              .select()
              .single(),
          ];
        case 2:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) throw error;
          if (!(operationType === "invoice_calculation")) return [3 /*break*/, 4];
          return [
            4 /*yield*/,
            supabase
              .from("invoices")
              .update({
                shadow_validation_status: shadowResult.is_valid ? "validated" : "failed",
                shadow_validation_at: new Date().toISOString(),
                shadow_variance: shadowResult.variance_percentage,
              })
              .eq("id", referenceId),
          ];
        case 3:
          _b.sent();
          _b.label = 4;
        case 4:
          return [2 /*return*/, data];
        case 5:
          error_11 = _b.sent();
          console.error("Error performing shadow validation:", error_11);
          throw new Error(
            "Shadow validation failed: ".concat(
              error_11 instanceof Error ? error_11.message : "Unknown error",
            ),
          );
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
// Perform shadow calculation (alternative calculation method)
function performShadowCalculation(operationType, data) {
  return __awaiter(this, void 0, void 0, function () {
    var original, shadow, variance, variancePercentage, tolerance, tolerancePercentage;
    return __generator(this, function (_a) {
      switch (operationType) {
        case "invoice_calculation":
          original = {
            subtotal: data.subtotal,
            discount: data.discount,
            tax: data.tax,
            total: data.total,
          };
          // Alternative calculation method for shadow validation
          shadow = {
            subtotal: data.items.reduce(function (sum, item) {
              return sum + item.unit_price * item.quantity;
            }, 0),
            discount: data.items.reduce(function (sum, item) {
              return sum + item.discount_amount;
            }, 0),
            tax: data.items.reduce(function (sum, item) {
              return sum + item.tax_amount;
            }, 0),
            total: 0,
          };
          shadow.total = shadow.subtotal - shadow.discount + shadow.tax;
          break;
        default:
          throw new Error("Unsupported operation type: ".concat(operationType));
      }
      variance = Math.abs(original.total - shadow.total);
      variancePercentage = original.total > 0 ? (variance / original.total) * 100 : 0;
      tolerance = 0.01;
      tolerancePercentage = 0.001;
      return [
        2 /*return*/,
        {
          original: original,
          shadow: shadow,
          variance: variance,
          variance_percentage: variancePercentage,
          is_valid: variance <= tolerance && variancePercentage <= tolerancePercentage,
          tolerance_exceeded: variance > tolerance || variancePercentage > tolerancePercentage,
        },
      ];
    });
  });
}
function getTableName(operationType) {
  switch (operationType) {
    case "invoice_calculation":
      return "invoices";
    case "payment_processing":
      return "payments";
    case "installment_calculation":
      return "payment_installments";
    default:
      return "unknown";
  }
}
/**
 * Financial Summary and Reports
 */
// Get financial summary for dashboard
function getFinancialSummary() {
  return __awaiter(this, arguments, void 0, function (filters) {
    var query, _a, invoices, error, summary_1, payments, error_12;
    if (filters === void 0) {
      filters = {};
    }
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          query = supabase.from("invoices").select("*");
          // Apply filters
          if (filters.clinic_id) query = query.eq("clinic_id", filters.clinic_id);
          if (filters.date_from) query = query.gte("issue_date", filters.date_from);
          if (filters.date_to) query = query.lte("issue_date", filters.date_to);
          return [4 /*yield*/, query];
        case 1:
          (_a = _b.sent()), (invoices = _a.data), (error = _a.error);
          if (error) throw error;
          summary_1 = {
            total_invoices:
              (invoices === null || invoices === void 0 ? void 0 : invoices.length) || 0,
            total_amount: 0,
            total_paid: 0,
            total_pending: 0,
            total_overdue: 0,
            payment_methods: {},
            by_status: {},
          };
          if (invoices) {
            summary_1.total_amount = invoices.reduce(function (sum, inv) {
              return sum + inv.total_amount;
            }, 0);
            summary_1.total_paid = invoices
              .filter(function (inv) {
                return inv.payment_status === "paid";
              })
              .reduce(function (sum, inv) {
                return sum + inv.total_amount;
              }, 0);
            summary_1.total_pending = invoices
              .filter(function (inv) {
                return inv.payment_status === "pending";
              })
              .reduce(function (sum, inv) {
                return sum + inv.total_amount;
              }, 0);
            summary_1.total_overdue = invoices
              .filter(function (inv) {
                return inv.payment_status === "overdue";
              })
              .reduce(function (sum, inv) {
                return sum + inv.total_amount;
              }, 0);
            // Group by status
            invoices.forEach(function (invoice) {
              var status = invoice.status;
              if (!summary_1.by_status[status]) {
                summary_1.by_status[status] = { count: 0, amount: 0 };
              }
              summary_1.by_status[status].count++;
              summary_1.by_status[status].amount += invoice.total_amount;
            });
          }
          return [
            4 /*yield*/,
            supabase.from("payments").select("payment_method, amount").eq("status", "completed"),
          ];
        case 2:
          payments = _b.sent().data;
          if (payments) {
            payments.forEach(function (payment) {
              var method = payment.payment_method;
              if (!summary_1.payment_methods[method]) {
                summary_1.payment_methods[method] = { count: 0, amount: 0 };
              }
              summary_1.payment_methods[method].count++;
              summary_1.payment_methods[method].amount += payment.amount;
            });
          }
          return [2 /*return*/, summary_1];
        case 3:
          error_12 = _b.sent();
          console.error("Error getting financial summary:", error_12);
          throw new Error(
            "Failed to get financial summary: ".concat(
              error_12 instanceof Error ? error_12.message : "Unknown error",
            ),
          );
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Mock NFSe Integration Functions
 * In production, these would integrate with actual Brazilian NFSe providers
 */
function generateNFSe(invoice) {
  return __awaiter(this, void 0, void 0, function () {
    var mockResponse, error_13;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          mockResponse = {
            success: true,
            nfse_number: "NFSe-".concat(Date.now()),
            verification_code: "VER-".concat(Math.random().toString(36).substr(2, 9)),
            xml_url: "https://mock-nfse.com/xml/".concat(invoice.id),
            issue_date: new Date().toISOString(),
          };
          // Update invoice with NFSe information
          return [
            4 /*yield*/,
            supabase
              .from("invoices")
              .update({
                nfse_number: mockResponse.nfse_number,
                nfse_verification_code: mockResponse.verification_code,
                nfse_status: "issued",
                nfse_issued_at: mockResponse.issue_date,
                nfse_xml_url: mockResponse.xml_url,
              })
              .eq("id", invoice.id),
          ];
        case 1:
          // Update invoice with NFSe information
          _a.sent();
          return [2 /*return*/, mockResponse];
        case 2:
          error_13 = _a.sent();
          console.error("Error generating NFSe:", error_13);
          throw new Error(
            "NFSe generation failed: ".concat(
              error_13 instanceof Error ? error_13.message : "Unknown error",
            ),
          );
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
function cancelNFSe(invoice) {
  return __awaiter(this, void 0, void 0, function () {
    var error_14;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          // Mock NFSe cancellation
          return [
            4 /*yield*/,
            supabase
              .from("invoices")
              .update({
                nfse_status: "cancelled",
              })
              .eq("id", invoice.id),
          ];
        case 1:
          // Mock NFSe cancellation
          _a.sent();
          return [3 /*break*/, 3];
        case 2:
          error_14 = _a.sent();
          console.error("Error cancelling NFSe:", error_14);
          throw new Error(
            "NFSe cancellation failed: ".concat(
              error_14 instanceof Error ? error_14.message : "Unknown error",
            ),
          );
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Mock Payment Processing Functions
 * In production, these would integrate with actual payment processors
 */
function processPayment(payment) {
  return __awaiter(this, void 0, void 0, function () {
    var mockResponse, error_15;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          mockResponse = {
            success: true,
            transaction_id: "TXN-".concat(Date.now()),
            authorization_code: "AUTH-".concat(Math.random().toString(36).substr(2, 9)),
            processing_fee: Math.round(payment.amount * 0.029), // 2.9% fee
            status: "completed",
          };
          // Generate PIX QR code for PIX payments
          if (payment.payment_method === "pix") {
            mockResponse.pix_qr_code =
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
            mockResponse.pix_copy_paste = "00020126330014BR.GOV.BCB.PIX0111"
              .concat(payment.pix_key, "520400005303986540")
              .concat(
                (0, financial_1.centavosToReais)(payment.amount).toFixed(2),
                "5802BR5925NEONPRO CLINIC6009SAO PAULO622905251234567890123456789063042EF7",
              );
          }
          // Update payment with processing results
          return [
            4 /*yield*/,
            updatePayment(payment.id, {
              status: mockResponse.status,
              external_transaction_id: mockResponse.transaction_id,
              authorization_code: mockResponse.authorization_code,
              processing_fee: (0, financial_1.centavosToReais)(mockResponse.processing_fee || 0),
            }),
          ];
        case 1:
          // Update payment with processing results
          _a.sent();
          return [2 /*return*/, mockResponse];
        case 2:
          error_15 = _a.sent();
          console.error("Error processing payment:", error_15);
          throw new Error(
            "Payment processing failed: ".concat(
              error_15 instanceof Error ? error_15.message : "Unknown error",
            ),
          );
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Generate PDF invoice
 */
function generateInvoicePDF(invoiceId) {
  return __awaiter(this, void 0, void 0, function () {
    var invoice, mockPDFContent, blob, error_16;
    var _a;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          return [4 /*yield*/, getInvoiceById(invoiceId)];
        case 1:
          invoice = _b.sent();
          mockPDFContent = "\nInvoice #"
            .concat(invoice.invoice_number, "\nDate: ")
            .concat(new Date(invoice.issue_date).toLocaleDateString("pt-BR"), "\nPatient: ")
            .concat(
              ((_a = invoice.patient) === null || _a === void 0 ? void 0 : _a.name) || "N/A",
              "\nTotal: ",
            )
            .concat((0, financial_1.formatCurrency)(invoice.total_amount), "\n");
          blob = new Blob([mockPDFContent], { type: "application/pdf" });
          return [2 /*return*/, blob];
        case 2:
          error_16 = _b.sent();
          console.error("Error generating PDF:", error_16);
          throw new Error(
            "PDF generation failed: ".concat(
              error_16 instanceof Error ? error_16.message : "Unknown error",
            ),
          );
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
