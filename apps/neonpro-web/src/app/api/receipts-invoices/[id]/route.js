"use strict";
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
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var zod_1 = require("zod");
var supabase_js_1 = require("@supabase/supabase-js");
var receipt_invoice_manager_1 = require("@/lib/payments/receipts/receipt-invoice-manager");
// Validation schemas
var SendEmailSchema = zod_1.z.object({
  recipientEmail: zod_1.z.string().email().optional(),
  customMessage: zod_1.z.string().optional(),
});
var RegenerateSchema = zod_1.z.object({
  templateOptions: zod_1.z
    .object({
      template: zod_1.z.enum(["modern", "classic", "minimal", "corporate"]).default("modern"),
      colors: zod_1.z
        .object({
          primary: zod_1.z.string(),
          secondary: zod_1.z.string(),
          accent: zod_1.z.string(),
        })
        .optional(),
      fonts: zod_1.z
        .object({
          header: zod_1.z.string(),
          body: zod_1.z.string(),
        })
        .optional(),
    })
    .optional(),
});
// Initialize services
function getReceiptInvoiceManager() {
  var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  var companyInfo = {
    name: process.env.COMPANY_NAME || "NeonPro",
    cnpj: process.env.COMPANY_CNPJ || "00.000.000/0001-00",
    address: process.env.COMPANY_ADDRESS || "Rua Example, 123",
    city: process.env.COMPANY_CITY || "São Paulo",
    state: process.env.COMPANY_STATE || "SP",
    zipCode: process.env.COMPANY_ZIP_CODE || "01000-000",
    phone: process.env.COMPANY_PHONE,
    email: process.env.COMPANY_EMAIL,
    website: process.env.COMPANY_WEBSITE,
    logo: process.env.COMPANY_LOGO,
  };
  var nfseConfig = {
    enabled: process.env.NFSE_ENABLED === "true",
    provider: process.env.NFSE_PROVIDER || "ginfes",
    certificatePath: process.env.NFSE_CERTIFICATE_PATH,
    certificatePassword: process.env.NFSE_CERTIFICATE_PASSWORD,
    serviceCode: process.env.NFSE_SERVICE_CODE,
    cityCode: process.env.NFSE_CITY_CODE,
    environment: process.env.NFSE_ENVIRONMENT || "sandbox",
  };
  var emailConfig = {
    enabled: process.env.EMAIL_ENABLED !== "false",
    smtp: {
      host: process.env.SMTP_HOST || "localhost",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
      },
    },
    from: process.env.SMTP_FROM || "noreply@neonpro.com",
    templates: {
      receipt: {
        subject: "Recibo {{documentNumber}} - {{companyName}}",
        html: "\n          <h2>Recibo de Pagamento</h2>\n          <p>Ol\u00E1 {{customerName}},</p>\n          <p>Segue em anexo o recibo {{documentNumber}} no valor de {{total}}.</p>\n          <p>{{customMessage}}</p>\n          <p>Atenciosamente,<br>{{companyName}}</p>\n        ",
      },
      invoice: {
        subject: "Fatura {{documentNumber}} - {{companyName}}",
        html: "\n          <h2>Nova Fatura</h2>\n          <p>Ol\u00E1 {{customerName}},</p>\n          <p>Segue em anexo a fatura {{documentNumber}} no valor de {{total}}.</p>\n          <p>Data de vencimento: {{dueDate}}</p>\n          <p>{{customMessage}}</p>\n          <p>Atenciosamente,<br>{{companyName}}</p>\n        ",
      },
    },
  };
  return new receipt_invoice_manager_1.ReceiptInvoiceManager(
    supabaseUrl,
    supabaseKey,
    companyInfo,
    nfseConfig,
    emailConfig,
  );
}
// GET - Get document details
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, authHeader, _c, user, authError, documentId, manager, document_1, error_1;
    var params = _b.params;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 3, , 4]);
          supabase = (0, supabase_js_1.createClient)(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
          );
          authHeader = request.headers.get("authorization");
          if (!authHeader) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Authorization header required" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, supabase.auth.getUser(authHeader.replace("Bearer ", ""))];
        case 1:
          (_c = _d.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid authentication" }, { status: 401 }),
            ];
          }
          documentId = params.id;
          manager = getReceiptInvoiceManager();
          return [4 /*yield*/, manager.getDocument(documentId)];
        case 2:
          document_1 = _d.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: document_1,
            }),
          ];
        case 3:
          error_1 = _d.sent();
          console.error("Get document error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: error_1 instanceof Error ? error_1.message : "Internal server error",
              },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
// POST - Perform actions on document
function POST(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      authHeader,
      _c,
      user,
      authError,
      documentId,
      url,
      action,
      manager,
      _d,
      body,
      validatedData,
      result,
      body,
      validatedData,
      document_2,
      templateOptions,
      result,
      document_3,
      result,
      _e,
      document_4,
      error,
      _f,
      pdfData,
      downloadError,
      pdfBuffer,
      _g,
      _h,
      result,
      result,
      result,
      error_2;
    var _j, _k, _l;
    var params = _b.params;
    return __generator(this, function (_m) {
      switch (_m.label) {
        case 0:
          _m.trys.push([0, 24, , 25]);
          supabase = (0, supabase_js_1.createClient)(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
          );
          authHeader = request.headers.get("authorization");
          if (!authHeader) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Authorization header required" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, supabase.auth.getUser(authHeader.replace("Bearer ", ""))];
        case 1:
          (_c = _m.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid authentication" }, { status: 401 }),
            ];
          }
          documentId = params.id;
          url = new URL(request.url);
          action = url.searchParams.get("action");
          if (!action) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Action parameter is required" },
                { status: 400 },
              ),
            ];
          }
          manager = getReceiptInvoiceManager();
          _d = action;
          switch (_d) {
            case "send-email":
              return [3 /*break*/, 2];
            case "regenerate-pdf":
              return [3 /*break*/, 5];
            case "generate-nfse":
              return [3 /*break*/, 9];
            case "download-pdf":
              return [3 /*break*/, 12];
            case "mark-paid":
              return [3 /*break*/, 16];
            case "mark-overdue":
              return [3 /*break*/, 18];
            case "cancel":
              return [3 /*break*/, 20];
          }
          return [3 /*break*/, 22];
        case 2:
          return [4 /*yield*/, request.json()];
        case 3:
          body = _m.sent();
          validatedData = SendEmailSchema.parse(body);
          return [
            4 /*yield*/,
            manager.sendEmail(
              documentId,
              validatedData.recipientEmail,
              validatedData.customMessage,
            ),
          ];
        case 4:
          result = _m.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: result.success,
              data: {
                messageId: result.messageId,
                error: result.error,
              },
            }),
          ];
        case 5:
          return [4 /*yield*/, request.json()];
        case 6:
          body = _m.sent();
          validatedData = RegenerateSchema.parse(body);
          return [4 /*yield*/, manager.getDocument(documentId)];
        case 7:
          document_2 = _m.sent();
          templateOptions = {
            template:
              ((_j = validatedData.templateOptions) === null || _j === void 0
                ? void 0
                : _j.template) || "modern",
            colors: ((_k = validatedData.templateOptions) === null || _k === void 0
              ? void 0
              : _k.colors) || {
              primary: "#2563eb",
              secondary: "#64748b",
              accent: "#10b981",
            },
            fonts: ((_l = validatedData.templateOptions) === null || _l === void 0
              ? void 0
              : _l.fonts) || {
              header: "Helvetica-Bold",
              body: "Helvetica",
            },
          };
          return [4 /*yield*/, manager.generatePDF(document_2.data, templateOptions)];
        case 8:
          result = _m.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: result.success,
              data: {
                documentId: result.documentId,
                error: result.error,
              },
            }),
          ];
        case 9:
          return [4 /*yield*/, manager.getDocument(documentId)];
        case 10:
          document_3 = _m.sent();
          if (document_3.type !== "invoice") {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "NFSe can only be generated for invoices" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, manager.generateNFSe(document_3.data)];
        case 11:
          result = _m.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: result.success,
              data: {
                documentId: result.documentId,
                nfseNumber: result.nfseNumber,
                error: result.error,
              },
            }),
          ];
        case 12:
          return [
            4 /*yield*/,
            supabase
              .from("receipts_invoices")
              .select("pdf_path, number, type")
              .eq("id", documentId)
              .single(),
          ];
        case 13:
          (_e = _m.sent()), (document_4 = _e.data), (error = _e.error);
          if (error || !document_4) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Document not found" }, { status: 404 }),
            ];
          }
          if (!document_4.pdf_path) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "PDF not available" }, { status: 404 }),
            ];
          }
          return [4 /*yield*/, supabase.storage.from("documents").download(document_4.pdf_path)];
        case 14:
          (_f = _m.sent()), (pdfData = _f.data), (downloadError = _f.error);
          if (downloadError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to download PDF" }, { status: 500 }),
            ];
          }
          _h = (_g = Buffer).from;
          return [4 /*yield*/, pdfData.arrayBuffer()];
        case 15:
          pdfBuffer = _h.apply(_g, [_m.sent()]);
          return [
            2 /*return*/,
            new server_1.NextResponse(pdfBuffer, {
              headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": 'attachment; filename="'
                  .concat(document_4.type, "-")
                  .concat(document_4.number, '.pdf"'),
              },
            }),
          ];
        case 16:
          return [4 /*yield*/, manager.updateStatus(documentId, "paid")];
        case 17:
          result = _m.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: result,
            }),
          ];
        case 18:
          return [4 /*yield*/, manager.updateStatus(documentId, "overdue")];
        case 19:
          result = _m.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: result,
            }),
          ];
        case 20:
          return [4 /*yield*/, manager.updateStatus(documentId, "cancelled")];
        case 21:
          result = _m.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: result,
            }),
          ];
        case 22:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 23:
          return [3 /*break*/, 25];
        case 24:
          error_2 = _m.sent();
          console.error("Document action error:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: "Validation error",
                  details: error_2.errors,
                },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: error_2 instanceof Error ? error_2.message : "Internal server error",
              },
              { status: 500 },
            ),
          ];
        case 25:
          return [2 /*return*/];
      }
    });
  });
}
// PUT - Update document details
function PUT(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase, authHeader, _c, user, authError, documentId, body, _d, data, error, error_3;
    var params = _b.params;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 4, , 5]);
          supabase = (0, supabase_js_1.createClient)(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
          );
          authHeader = request.headers.get("authorization");
          if (!authHeader) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Authorization header required" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, supabase.auth.getUser(authHeader.replace("Bearer ", ""))];
        case 1:
          (_c = _e.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid authentication" }, { status: 401 }),
            ];
          }
          documentId = params.id;
          return [4 /*yield*/, request.json()];
        case 2:
          body = _e.sent();
          return [
            4 /*yield*/,
            supabase
              .from("receipts_invoices")
              .update({
                data: supabase.raw("data || '".concat(JSON.stringify(body), "'::jsonb")),
                updated_at: new Date().toISOString(),
              })
              .eq("id", documentId)
              .select()
              .single(),
          ];
        case 3:
          (_d = _e.sent()), (data = _d.data), (error = _d.error);
          if (error) throw error;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: data,
            }),
          ];
        case 4:
          error_3 = _e.sent();
          console.error("Update document error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: error_3 instanceof Error ? error_3.message : "Internal server error",
              },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
// DELETE - Delete document
function DELETE(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var supabase,
      authHeader,
      _c,
      user,
      authError,
      documentId,
      _d,
      document_5,
      fetchError,
      deleteError,
      error_4;
    var params = _b.params;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 6, , 7]);
          supabase = (0, supabase_js_1.createClient)(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
          );
          authHeader = request.headers.get("authorization");
          if (!authHeader) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Authorization header required" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, supabase.auth.getUser(authHeader.replace("Bearer ", ""))];
        case 1:
          (_c = _e.sent()), (user = _c.data.user), (authError = _c.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid authentication" }, { status: 401 }),
            ];
          }
          documentId = params.id;
          return [
            4 /*yield*/,
            supabase
              .from("receipts_invoices")
              .select("status, pdf_path")
              .eq("id", documentId)
              .single(),
          ];
        case 2:
          (_d = _e.sent()), (document_5 = _d.data), (fetchError = _d.error);
          if (fetchError || !document_5) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Document not found" }, { status: 404 }),
            ];
          }
          // Only allow deletion of draft documents
          if (document_5.status !== "draft") {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Only draft documents can be deleted" },
                { status: 400 },
              ),
            ];
          }
          if (!document_5.pdf_path) return [3 /*break*/, 4];
          return [4 /*yield*/, supabase.storage.from("documents").remove([document_5.pdf_path])];
        case 3:
          _e.sent();
          _e.label = 4;
        case 4:
          return [4 /*yield*/, supabase.from("receipts_invoices").delete().eq("id", documentId)];
        case 5:
          deleteError = _e.sent().error;
          if (deleteError) throw deleteError;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Document deleted successfully",
            }),
          ];
        case 6:
          error_4 = _e.sent();
          console.error("Delete document error:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: error_4 instanceof Error ? error_4.message : "Internal server error",
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
