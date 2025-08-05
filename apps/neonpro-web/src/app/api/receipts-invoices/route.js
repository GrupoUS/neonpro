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
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var zod_1 = require("zod");
var supabase_js_1 = require("@supabase/supabase-js");
var receipt_invoice_manager_1 = require("@/lib/payments/receipts/receipt-invoice-manager");
// Validation schemas
var CreateDocumentSchema = zod_1.z.object({
    type: zod_1.z.enum(['receipt', 'invoice']),
    customerId: zod_1.z.string().uuid(),
    items: zod_1.z.array(zod_1.z.object({
        description: zod_1.z.string(),
        quantity: zod_1.z.number().positive(),
        unitPrice: zod_1.z.number().positive(),
        total: zod_1.z.number().positive(),
        taxRate: zod_1.z.number().min(0).max(100).default(0),
        taxAmount: zod_1.z.number().min(0).default(0),
    })),
    dueDate: zod_1.z.string().datetime().optional(),
    paymentMethod: zod_1.z.string().optional(),
    paymentDate: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().optional(),
    terms: zod_1.z.string().optional(),
    template: zod_1.z.object({
        template: zod_1.z.enum(['modern', 'classic', 'minimal', 'corporate']).default('modern'),
        colors: zod_1.z.object({
            primary: zod_1.z.string(),
            secondary: zod_1.z.string(),
            accent: zod_1.z.string(),
        }).optional(),
        fonts: zod_1.z.object({
            header: zod_1.z.string(),
            body: zod_1.z.string(),
        }).optional(),
    }).optional(),
});
var UpdateDocumentSchema = zod_1.z.object({
    status: zod_1.z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
    paymentMethod: zod_1.z.string().optional(),
    paymentDate: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().optional(),
    terms: zod_1.z.string().optional(),
});
var SendEmailSchema = zod_1.z.object({
    recipientEmail: zod_1.z.string().email().optional(),
    customMessage: zod_1.z.string().optional(),
});
var ListFiltersSchema = zod_1.z.object({
    type: zod_1.z.enum(['receipt', 'invoice']).optional(),
    status: zod_1.z.string().optional(),
    customerId: zod_1.z.string().uuid().optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    limit: zod_1.z.number().min(1).max(100).default(20),
    offset: zod_1.z.number().min(0).default(0),
});
// Initialize services
function getReceiptInvoiceManager() {
    var supabaseUrl = process.env.SUPABASE_URL;
    var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    var companyInfo = {
        name: process.env.COMPANY_NAME || 'NeonPro',
        cnpj: process.env.COMPANY_CNPJ || '00.000.000/0001-00',
        address: process.env.COMPANY_ADDRESS || 'Rua Example, 123',
        city: process.env.COMPANY_CITY || 'São Paulo',
        state: process.env.COMPANY_STATE || 'SP',
        zipCode: process.env.COMPANY_ZIP_CODE || '01000-000',
        phone: process.env.COMPANY_PHONE,
        email: process.env.COMPANY_EMAIL,
        website: process.env.COMPANY_WEBSITE,
        logo: process.env.COMPANY_LOGO,
    };
    var nfseConfig = {
        enabled: process.env.NFSE_ENABLED === 'true',
        provider: process.env.NFSE_PROVIDER || 'ginfes',
        certificatePath: process.env.NFSE_CERTIFICATE_PATH,
        certificatePassword: process.env.NFSE_CERTIFICATE_PASSWORD,
        serviceCode: process.env.NFSE_SERVICE_CODE,
        cityCode: process.env.NFSE_CITY_CODE,
        environment: process.env.NFSE_ENVIRONMENT || 'sandbox',
    };
    var emailConfig = {
        enabled: process.env.EMAIL_ENABLED !== 'false',
        smtp: {
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || '',
            },
        },
        from: process.env.SMTP_FROM || 'noreply@neonpro.com',
        templates: {
            receipt: {
                subject: 'Recibo {{documentNumber}} - {{companyName}}',
                html: "\n          <h2>Recibo de Pagamento</h2>\n          <p>Ol\u00E1 {{customerName}},</p>\n          <p>Segue em anexo o recibo {{documentNumber}} no valor de {{total}}.</p>\n          <p>{{customMessage}}</p>\n          <p>Atenciosamente,<br>{{companyName}}</p>\n        ",
            },
            invoice: {
                subject: 'Fatura {{documentNumber}} - {{companyName}}',
                html: "\n          <h2>Nova Fatura</h2>\n          <p>Ol\u00E1 {{customerName}},</p>\n          <p>Segue em anexo a fatura {{documentNumber}} no valor de {{total}}.</p>\n          <p>Data de vencimento: {{dueDate}}</p>\n          <p>{{customMessage}}</p>\n          <p>Atenciosamente,<br>{{companyName}}</p>\n        ",
            },
        },
    };
    return new receipt_invoice_manager_1.ReceiptInvoiceManager(supabaseUrl, supabaseKey, companyInfo, nfseConfig, emailConfig);
}
// GET - List receipts/invoices with filters
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, authHeader, _a, user, authError, url, queryParams, filters, validatedFilters, manager, result, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                    authHeader = request.headers.get('authorization');
                    if (!authHeader) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authorization header required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase.auth.getUser(authHeader.replace('Bearer ', ''))];
                case 1:
                    _a = _b.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })];
                    }
                    url = new URL(request.url);
                    queryParams = Object.fromEntries(url.searchParams.entries());
                    filters = __assign(__assign({}, queryParams), { limit: queryParams.limit ? parseInt(queryParams.limit) : 20, offset: queryParams.offset ? parseInt(queryParams.offset) : 0, dateFrom: queryParams.dateFrom ? new Date(queryParams.dateFrom) : undefined, dateTo: queryParams.dateTo ? new Date(queryParams.dateTo) : undefined });
                    validatedFilters = ListFiltersSchema.parse(filters);
                    manager = getReceiptInvoiceManager();
                    return [4 /*yield*/, manager.listDocuments(validatedFilters)];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: result.documents,
                            pagination: {
                                total: result.total,
                                limit: validatedFilters.limit,
                                offset: validatedFilters.offset,
                                hasMore: result.total > (validatedFilters.offset + validatedFilters.limit),
                            },
                        })];
                case 3:
                    error_1 = _b.sent();
                    console.error('List documents error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: error_1 instanceof Error ? error_1.message : 'Internal server error',
                        }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// POST - Create new receipt/invoice
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, authHeader, _a, user, authError, body, validatedData, _b, customer, customerError, subtotal, taxTotal, total, numberResult, documentId, receiptData, templateOptions, manager, pdfResult, nfseResult, error_2;
        var _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 8, , 9]);
                    supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                    authHeader = request.headers.get('authorization');
                    if (!authHeader) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authorization header required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase.auth.getUser(authHeader.replace('Bearer ', ''))];
                case 1:
                    _a = _f.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 2:
                    body = _f.sent();
                    validatedData = CreateDocumentSchema.parse(body);
                    return [4 /*yield*/, supabase
                            .from('customers')
                            .select('*')
                            .eq('id', validatedData.customerId)
                            .single()];
                case 3:
                    _b = _f.sent(), customer = _b.data, customerError = _b.error;
                    if (customerError || !customer) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Customer not found' }, { status: 404 })];
                    }
                    subtotal = validatedData.items.reduce(function (sum, item) { return sum + item.total; }, 0);
                    taxTotal = validatedData.items.reduce(function (sum, item) { return sum + item.taxAmount; }, 0);
                    total = subtotal + taxTotal;
                    return [4 /*yield*/, supabase.rpc('generate_document_number', {
                            doc_type: validatedData.type,
                            prefix: validatedData.type === 'receipt' ? 'REC' : 'FAT',
                        })];
                case 4:
                    numberResult = (_f.sent()).data;
                    documentId = crypto.randomUUID();
                    receiptData = {
                        id: documentId,
                        number: numberResult || "".concat(validatedData.type.toUpperCase(), "-").concat(Date.now()),
                        type: validatedData.type,
                        date: new Date(),
                        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
                        customer: {
                            id: customer.id,
                            name: customer.name,
                            email: customer.email,
                            document: customer.document,
                            address: customer.address,
                            city: customer.city,
                            state: customer.state,
                            zipCode: customer.zip_code,
                            phone: customer.phone,
                        },
                        items: validatedData.items,
                        subtotal: subtotal,
                        taxTotal: taxTotal,
                        total: total,
                        paymentMethod: validatedData.paymentMethod,
                        paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : undefined,
                        status: 'draft',
                        notes: validatedData.notes,
                        terms: validatedData.terms,
                    };
                    templateOptions = {
                        template: ((_c = validatedData.template) === null || _c === void 0 ? void 0 : _c.template) || 'modern',
                        colors: ((_d = validatedData.template) === null || _d === void 0 ? void 0 : _d.colors) || {
                            primary: '#2563eb',
                            secondary: '#64748b',
                            accent: '#10b981',
                        },
                        fonts: ((_e = validatedData.template) === null || _e === void 0 ? void 0 : _e.fonts) || {
                            header: 'Helvetica-Bold',
                            body: 'Helvetica',
                        },
                    };
                    manager = getReceiptInvoiceManager();
                    return [4 /*yield*/, manager.generatePDF(receiptData, templateOptions)];
                case 5:
                    pdfResult = _f.sent();
                    if (!pdfResult.success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: pdfResult.error }, { status: 500 })];
                    }
                    nfseResult = void 0;
                    if (!(validatedData.type === 'invoice')) return [3 /*break*/, 7];
                    return [4 /*yield*/, manager.generateNFSe(receiptData)];
                case 6:
                    nfseResult = _f.sent();
                    _f.label = 7;
                case 7: return [2 /*return*/, server_1.NextResponse.json({
                        success: true,
                        data: {
                            id: documentId,
                            number: receiptData.number,
                            type: receiptData.type,
                            status: receiptData.status,
                            total: total,
                            pdfGenerated: pdfResult.success,
                            nfseGenerated: (nfseResult === null || nfseResult === void 0 ? void 0 : nfseResult.success) || false,
                            nfseNumber: nfseResult === null || nfseResult === void 0 ? void 0 : nfseResult.nfseNumber,
                        },
                    })];
                case 8:
                    error_2 = _f.sent();
                    console.error('Create document error:', error_2);
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: 'Validation error',
                                details: error_2.errors,
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: error_2 instanceof Error ? error_2.message : 'Internal server error',
                        }, { status: 500 })];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// PUT - Update document
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, authHeader, _a, user, authError, url, documentId, body, validatedData, manager, result, _b, data, error, error_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                    authHeader = request.headers.get('authorization');
                    if (!authHeader) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authorization header required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase.auth.getUser(authHeader.replace('Bearer ', ''))];
                case 1:
                    _a = _c.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })];
                    }
                    url = new URL(request.url);
                    documentId = url.searchParams.get('id');
                    if (!documentId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Document ID is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 2:
                    body = _c.sent();
                    validatedData = UpdateDocumentSchema.parse(body);
                    manager = getReceiptInvoiceManager();
                    if (!validatedData.status) return [3 /*break*/, 4];
                    return [4 /*yield*/, manager.updateStatus(documentId, validatedData.status)];
                case 3:
                    result = _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: result,
                        })];
                case 4: return [4 /*yield*/, supabase
                        .from('receipts_invoices')
                        .update({
                        data: supabase.raw("data || '".concat(JSON.stringify(validatedData), "'::jsonb")),
                        updated_at: new Date().toISOString(),
                    })
                        .eq('id', documentId)
                        .select()
                        .single()];
                case 5:
                    _b = _c.sent(), data = _b.data, error = _b.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: data,
                        })];
                case 6:
                    error_3 = _c.sent();
                    console.error('Update document error:', error_3);
                    if (error_3 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: 'Validation error',
                                details: error_3.errors,
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: error_3 instanceof Error ? error_3.message : 'Internal server error',
                        }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// DELETE - Delete document
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, authHeader, _a, user, authError, url, documentId, _b, document_1, fetchError, deleteError, error_4;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                    authHeader = request.headers.get('authorization');
                    if (!authHeader) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authorization header required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase.auth.getUser(authHeader.replace('Bearer ', ''))];
                case 1:
                    _a = _c.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })];
                    }
                    url = new URL(request.url);
                    documentId = url.searchParams.get('id');
                    if (!documentId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Document ID is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('receipts_invoices')
                            .select('status, pdf_path')
                            .eq('id', documentId)
                            .single()];
                case 2:
                    _b = _c.sent(), document_1 = _b.data, fetchError = _b.error;
                    if (fetchError || !document_1) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Document not found' }, { status: 404 })];
                    }
                    // Only allow deletion of draft documents
                    if (document_1.status !== 'draft') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Only draft documents can be deleted' }, { status: 400 })];
                    }
                    if (!document_1.pdf_path) return [3 /*break*/, 4];
                    return [4 /*yield*/, supabase.storage
                            .from('documents')
                            .remove([document_1.pdf_path])];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4: return [4 /*yield*/, supabase
                        .from('receipts_invoices')
                        .delete()
                        .eq('id', documentId)];
                case 5:
                    deleteError = (_c.sent()).error;
                    if (deleteError)
                        throw deleteError;
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: 'Document deleted successfully',
                        })];
                case 6:
                    error_4 = _c.sent();
                    console.error('Delete document error:', error_4);
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: false,
                            error: error_4 instanceof Error ? error_4.message : 'Internal server error',
                        }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
