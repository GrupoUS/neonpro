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
exports.ReceiptInvoiceManager = void 0;
var zod_1 = require("zod");
var supabase_js_1 = require("@supabase/supabase-js");
var pdfkit_1 = require("pdfkit");
var nodemailer_1 = require("nodemailer");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
// Validation Schemas
var CompanyInfoSchema = zod_1.z.object({
  name: zod_1.z.string(),
  cnpj: zod_1.z.string(),
  address: zod_1.z.string(),
  city: zod_1.z.string(),
  state: zod_1.z.string(),
  zipCode: zod_1.z.string(),
  phone: zod_1.z.string().optional(),
  email: zod_1.z.string().email().optional(),
  website: zod_1.z.string().url().optional(),
  logo: zod_1.z.string().optional(), // Base64 or URL
});
var CustomerInfoSchema = zod_1.z.object({
  id: zod_1.z.string(),
  name: zod_1.z.string(),
  email: zod_1.z.string().email(),
  document: zod_1.z.string(), // CPF or CNPJ
  address: zod_1.z.string().optional(),
  city: zod_1.z.string().optional(),
  state: zod_1.z.string().optional(),
  zipCode: zod_1.z.string().optional(),
  phone: zod_1.z.string().optional(),
});
var InvoiceItemSchema = zod_1.z.object({
  description: zod_1.z.string(),
  quantity: zod_1.z.number().positive(),
  unitPrice: zod_1.z.number().positive(),
  total: zod_1.z.number().positive(),
  taxRate: zod_1.z.number().min(0).max(100).default(0),
  taxAmount: zod_1.z.number().min(0).default(0),
});
var ReceiptDataSchema = zod_1.z.object({
  id: zod_1.z.string(),
  number: zod_1.z.string(),
  type: zod_1.z.enum(["receipt", "invoice"]),
  date: zod_1.z.date(),
  dueDate: zod_1.z.date().optional(),
  customer: CustomerInfoSchema,
  items: zod_1.z.array(InvoiceItemSchema),
  subtotal: zod_1.z.number().positive(),
  taxTotal: zod_1.z.number().min(0).default(0),
  total: zod_1.z.number().positive(),
  paymentMethod: zod_1.z.string().optional(),
  paymentDate: zod_1.z.date().optional(),
  status: zod_1.z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  notes: zod_1.z.string().optional(),
  terms: zod_1.z.string().optional(),
});
var NFSeConfigSchema = zod_1.z.object({
  enabled: zod_1.z.boolean().default(false),
  provider: zod_1.z.enum(["ginfes", "issnet", "webiss", "simpliss"]),
  certificatePath: zod_1.z.string().optional(),
  certificatePassword: zod_1.z.string().optional(),
  serviceCode: zod_1.z.string().optional(),
  cityCode: zod_1.z.string().optional(),
  environment: zod_1.z.enum(["production", "sandbox"]).default("sandbox"),
});
var EmailConfigSchema = zod_1.z.object({
  enabled: zod_1.z.boolean().default(true),
  smtp: zod_1.z.object({
    host: zod_1.z.string(),
    port: zod_1.z.number(),
    secure: zod_1.z.boolean(),
    auth: zod_1.z.object({
      user: zod_1.z.string(),
      pass: zod_1.z.string(),
    }),
  }),
  from: zod_1.z.string().email(),
  templates: zod_1.z.object({
    receipt: zod_1.z.object({
      subject: zod_1.z.string(),
      html: zod_1.z.string(),
    }),
    invoice: zod_1.z.object({
      subject: zod_1.z.string(),
      html: zod_1.z.string(),
    }),
  }),
});
/**
 * Receipt and Invoice Management System
 * Handles PDF generation, NFSe integration, and email delivery
 */
var ReceiptInvoiceManager = /** @class */ (() => {
  function ReceiptInvoiceManager(supabaseUrl, supabaseKey, companyInfo, nfseConfig, emailConfig) {
    this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    this.companyInfo = CompanyInfoSchema.parse(companyInfo);
    this.nfseConfig = NFSeConfigSchema.parse(nfseConfig);
    this.emailConfig = EmailConfigSchema.parse(emailConfig);
    if (this.emailConfig.enabled) {
      this.setupEmailTransporter();
    }
  }
  /**
   * Generate PDF receipt or invoice
   */
  ReceiptInvoiceManager.prototype.generatePDF = function (data_1) {
    return __awaiter(this, arguments, void 0, function (data, options) {
      var validatedData_1, doc_1, chunks_1, pdfBuffer, _a, savedDoc, error, uploadError, error_1;
      var _this = this;
      if (options === void 0) {
        options = {
          template: "modern",
          colors: { primary: "#2563eb", secondary: "#64748b", accent: "#10b981" },
          fonts: { header: "Helvetica-Bold", body: "Helvetica" },
        };
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            validatedData_1 = ReceiptDataSchema.parse(data);
            doc_1 = new pdfkit_1.default({ margin: 50 });
            chunks_1 = [];
            doc_1.on("data", (chunk) => chunks_1.push(chunk));
            return [
              4 /*yield*/,
              new Promise((resolve) => {
                doc_1.on("end", resolve);
                // Generate PDF content based on template
                _this.generatePDFContent(doc_1, validatedData_1, options);
                doc_1.end();
              }),
            ];
          case 1:
            _b.sent();
            pdfBuffer = Buffer.concat(chunks_1);
            return [
              4 /*yield*/,
              this.supabase
                .from("receipts_invoices")
                .insert({
                  id: validatedData_1.id,
                  number: validatedData_1.number,
                  type: validatedData_1.type,
                  customer_id: validatedData_1.customer.id,
                  data: validatedData_1,
                  pdf_path: "receipts/".concat(validatedData_1.id, ".pdf"),
                  status: validatedData_1.status,
                  created_at: new Date().toISOString(),
                })
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (savedDoc = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              4 /*yield*/,
              this.supabase.storage
                .from("documents")
                .upload("receipts/".concat(validatedData_1.id, ".pdf"), pdfBuffer, {
                  contentType: "application/pdf",
                  upsert: true,
                }),
            ];
          case 3:
            uploadError = _b.sent().error;
            if (uploadError) throw uploadError;
            return [
              2 /*return*/,
              {
                success: true,
                documentId: validatedData_1.id,
                pdfBuffer: pdfBuffer,
              },
            ];
          case 4:
            error_1 = _b.sent();
            console.error("PDF generation error:", error_1);
            return [
              2 /*return*/,
              {
                success: false,
                documentId: data.id,
                error: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate NFSe (Brazilian electronic service invoice)
   */
  ReceiptInvoiceManager.prototype.generateNFSe = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var validatedData, nfseResult, error, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            if (!this.nfseConfig.enabled) {
              throw new Error("NFSe integration is not enabled");
            }
            validatedData = ReceiptDataSchema.parse(data);
            return [4 /*yield*/, this.processNFSe(validatedData)];
          case 1:
            nfseResult = _a.sent();
            return [
              4 /*yield*/,
              this.supabase
                .from("receipts_invoices")
                .update({
                  nfse_number: nfseResult.nfseNumber,
                  nfse_status: "issued",
                  nfse_issued_at: new Date().toISOString(),
                })
                .eq("id", validatedData.id),
            ];
          case 2:
            error = _a.sent().error;
            if (error) throw error;
            return [
              2 /*return*/,
              {
                success: true,
                documentId: validatedData.id,
                nfseNumber: nfseResult.nfseNumber,
              },
            ];
          case 3:
            error_2 = _a.sent();
            console.error("NFSe generation error:", error_2);
            return [
              2 /*return*/,
              {
                success: false,
                documentId: data.id,
                error: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Send receipt/invoice via email
   */
  ReceiptInvoiceManager.prototype.sendEmail = function (documentId, recipientEmail, customMessage) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        document_1,
        error,
        _b,
        pdfData,
        downloadError,
        pdfBuffer,
        _c,
        _d,
        template,
        recipient,
        mailOptions,
        result,
        error_3;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            _e.trys.push([0, 6, , 7]);
            if (!this.emailConfig.enabled || !this.emailTransporter) {
              throw new Error("Email delivery is not configured");
            }
            return [
              4 /*yield*/,
              this.supabase.from("receipts_invoices").select("*").eq("id", documentId).single(),
            ];
          case 1:
            (_a = _e.sent()), (document_1 = _a.data), (error = _a.error);
            if (error || !document_1) {
              throw new Error("Document not found");
            }
            return [
              4 /*yield*/,
              this.supabase.storage.from("documents").download(document_1.pdf_path),
            ];
          case 2:
            (_b = _e.sent()), (pdfData = _b.data), (downloadError = _b.error);
            if (downloadError) throw downloadError;
            _d = (_c = Buffer).from;
            return [4 /*yield*/, pdfData.arrayBuffer()];
          case 3:
            pdfBuffer = _d.apply(_c, [_e.sent()]);
            template = this.emailConfig.templates[document_1.type];
            recipient = recipientEmail || document_1.data.customer.email;
            mailOptions = {
              from: this.emailConfig.from,
              to: recipient,
              subject: template.subject.replace("{{number}}", document_1.number),
              html: this.processEmailTemplate(template.html, document_1.data, customMessage),
              attachments: [
                {
                  filename: "".concat(document_1.type, "-").concat(document_1.number, ".pdf"),
                  content: pdfBuffer,
                  contentType: "application/pdf",
                },
              ],
            };
            return [4 /*yield*/, this.emailTransporter.sendMail(mailOptions)];
          case 4:
            result = _e.sent();
            // Update delivery status
            return [
              4 /*yield*/,
              this.supabase
                .from("receipts_invoices")
                .update({
                  email_sent_at: new Date().toISOString(),
                  email_recipient: recipient,
                  status: "sent",
                })
                .eq("id", documentId),
            ];
          case 5:
            // Update delivery status
            _e.sent();
            return [
              2 /*return*/,
              {
                success: true,
                messageId: result.messageId,
              },
            ];
          case 6:
            error_3 = _e.sent();
            console.error("Email sending error:", error_3);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_3 instanceof Error ? error_3.message : "Unknown error",
              },
            ];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get receipt/invoice by ID
   */
  ReceiptInvoiceManager.prototype.getDocument = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("receipts_invoices").select("*").eq("id", id).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data];
        }
      });
    });
  };
  /**
   * List receipts/invoices with filters
   */
  ReceiptInvoiceManager.prototype.listDocuments = function () {
    return __awaiter(this, arguments, void 0, function (filters) {
      var query, _a, data, error, count;
      if (filters === void 0) {
        filters = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            query = this.supabase.from("receipts_invoices").select("*", { count: "exact" });
            if (filters.type) {
              query = query.eq("type", filters.type);
            }
            if (filters.status) {
              query = query.eq("status", filters.status);
            }
            if (filters.customerId) {
              query = query.eq("customer_id", filters.customerId);
            }
            if (filters.dateFrom) {
              query = query.gte("created_at", filters.dateFrom.toISOString());
            }
            if (filters.dateTo) {
              query = query.lte("created_at", filters.dateTo.toISOString());
            }
            if (filters.limit) {
              query = query.limit(filters.limit);
            }
            if (filters.offset) {
              query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
            if (error) throw error;
            return [
              2 /*return*/,
              {
                documents: data,
                total: count || 0,
              },
            ];
        }
      });
    });
  };
  /**
   * Update document status
   */
  ReceiptInvoiceManager.prototype.updateStatus = function (id, status) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("receipts_invoices")
                .update({ status: status, updated_at: new Date().toISOString() })
                .eq("id", id)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data];
        }
      });
    });
  };
  // Private methods
  ReceiptInvoiceManager.prototype.setupEmailTransporter = function () {
    this.emailTransporter = nodemailer_1.default.createTransporter(this.emailConfig.smtp);
  };
  ReceiptInvoiceManager.prototype.generatePDFContent = function (doc, data, options) {
    var colors = options.colors,
      fonts = options.fonts;
    // Header
    if (this.companyInfo.logo) {
      // Add logo if available
      // doc.image(this.companyInfo.logo, 50, 50, { width: 100 });
    }
    doc
      .fontSize(20)
      .font(fonts.header)
      .fillColor(colors.primary)
      .text(this.companyInfo.name, 50, 50);
    doc
      .fontSize(10)
      .font(fonts.body)
      .fillColor(colors.secondary)
      .text(
        ""
          .concat(this.companyInfo.address, ", ")
          .concat(this.companyInfo.city, " - ")
          .concat(this.companyInfo.state),
        50,
        80,
      )
      .text(
        "CEP: ".concat(this.companyInfo.zipCode, " | CNPJ: ").concat(this.companyInfo.cnpj),
        50,
        95,
      );
    // Document title and number
    var title = data.type === "receipt" ? "RECIBO" : "FATURA";
    doc
      .fontSize(16)
      .font(fonts.header)
      .fillColor(colors.primary)
      .text(title, 400, 50)
      .text("N\u00BA ".concat(data.number), 400, 70);
    // Date
    doc
      .fontSize(10)
      .font(fonts.body)
      .fillColor(colors.secondary)
      .text(
        "Data: ".concat((0, date_fns_1.format)(data.date, "dd/MM/yyyy", { locale: locale_1.ptBR })),
        400,
        90,
      );
    if (data.dueDate) {
      doc.text(
        "Vencimento: ".concat(
          (0, date_fns_1.format)(data.dueDate, "dd/MM/yyyy", { locale: locale_1.ptBR }),
        ),
        400,
        105,
      );
    }
    // Customer info
    doc.fontSize(12).font(fonts.header).fillColor(colors.primary).text("CLIENTE:", 50, 140);
    doc
      .fontSize(10)
      .font(fonts.body)
      .fillColor("#000")
      .text(data.customer.name, 50, 160)
      .text("Documento: ".concat(data.customer.document), 50, 175)
      .text("Email: ".concat(data.customer.email), 50, 190);
    if (data.customer.address) {
      doc.text("Endere\u00E7o: ".concat(data.customer.address), 50, 205);
    }
    // Items table
    var tableTop = 250;
    doc.fontSize(10).font(fonts.header).fillColor(colors.primary);
    // Table headers
    doc
      .text("DESCRIÇÃO", 50, tableTop)
      .text("QTD", 300, tableTop)
      .text("VALOR UNIT.", 350, tableTop)
      .text("TOTAL", 450, tableTop);
    // Table line
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .strokeColor(colors.secondary)
      .stroke();
    // Items
    var currentY = tableTop + 25;
    doc.fontSize(9).font(fonts.body).fillColor("#000");
    data.items.forEach((item) => {
      doc
        .text(item.description, 50, currentY, { width: 240 })
        .text(item.quantity.toString(), 300, currentY)
        .text("R$ ".concat(item.unitPrice.toFixed(2)), 350, currentY)
        .text("R$ ".concat(item.total.toFixed(2)), 450, currentY);
      currentY += 20;
    });
    // Totals
    var totalsY = currentY + 20;
    doc.fontSize(10).font(fonts.body).fillColor("#000");
    if (data.taxTotal > 0) {
      doc
        .text("Subtotal: R$ ".concat(data.subtotal.toFixed(2)), 350, totalsY)
        .text("Impostos: R$ ".concat(data.taxTotal.toFixed(2)), 350, totalsY + 15);
    }
    doc
      .fontSize(12)
      .font(fonts.header)
      .fillColor(colors.primary)
      .text(
        "TOTAL: R$ ".concat(data.total.toFixed(2)),
        350,
        totalsY + (data.taxTotal > 0 ? 35 : 15),
      );
    // Payment info
    if (data.paymentMethod) {
      doc
        .fontSize(10)
        .font(fonts.body)
        .fillColor("#000")
        .text("Forma de pagamento: ".concat(data.paymentMethod), 50, totalsY + 50);
    }
    if (data.paymentDate) {
      doc.text(
        "Data do pagamento: ".concat(
          (0, date_fns_1.format)(data.paymentDate, "dd/MM/yyyy", { locale: locale_1.ptBR }),
        ),
        50,
        totalsY + 65,
      );
    }
    // Notes and terms
    if (data.notes) {
      doc
        .fontSize(9)
        .font(fonts.body)
        .fillColor(colors.secondary)
        .text("Observações:", 50, totalsY + 90)
        .text(data.notes, 50, totalsY + 105, { width: 500 });
    }
    if (data.terms) {
      doc
        .fontSize(8)
        .font(fonts.body)
        .fillColor(colors.secondary)
        .text("Termos e condições:", 50, doc.page.height - 100)
        .text(data.terms, 50, doc.page.height - 85, { width: 500 });
    }
  };
  ReceiptInvoiceManager.prototype.processNFSe = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var nfseNumber;
      return __generator(this, (_a) => {
        nfseNumber = "NFSe-".concat(Date.now());
        // TODO: Implement actual NFSe provider integration
        // - Generate XML according to provider specifications
        // - Sign with digital certificate
        // - Send to provider API
        // - Handle response and store NFSe number
        return [2 /*return*/, { nfseNumber: nfseNumber }];
      });
    });
  };
  ReceiptInvoiceManager.prototype.processEmailTemplate = function (template, data, customMessage) {
    var processed = template
      .replace(/{{customerName}}/g, data.customer.name)
      .replace(/{{documentNumber}}/g, data.number)
      .replace(/{{documentType}}/g, data.type === "receipt" ? "recibo" : "fatura")
      .replace(/{{total}}/g, "R$ ".concat(data.total.toFixed(2)))
      .replace(
        /{{date}}/g,
        (0, date_fns_1.format)(data.date, "dd/MM/yyyy", { locale: locale_1.ptBR }),
      )
      .replace(/{{companyName}}/g, this.companyInfo.name);
    if (customMessage) {
      processed = processed.replace(/{{customMessage}}/g, customMessage);
    }
    return processed;
  };
  return ReceiptInvoiceManager;
})();
exports.ReceiptInvoiceManager = ReceiptInvoiceManager;
