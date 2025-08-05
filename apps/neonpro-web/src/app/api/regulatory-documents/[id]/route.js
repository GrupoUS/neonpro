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
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
var zod_1 = require("zod");
// Request validation schemas
var UpdateDocumentSchema = zod_1.z.object({
    document_type: zod_1.z.string().min(1).optional(),
    document_category: zod_1.z.string().min(1).optional(),
    authority: zod_1.z.string().min(1).optional(),
    document_number: zod_1.z.string().optional(),
    issue_date: zod_1.z.string().optional(),
    expiration_date: zod_1.z.string().optional(),
    status: zod_1.z.enum(['valid', 'expiring', 'expired', 'pending']).optional(),
    file_url: zod_1.z.string().optional(),
    file_name: zod_1.z.string().optional(),
    file_size: zod_1.z.number().optional(),
    version: zod_1.z.string().optional(),
    associated_professional_id: zod_1.z.string().uuid().optional(),
    associated_equipment_id: zod_1.z.string().uuid().optional(),
});
// GET /api/regulatory-documents/[id] - Get single document by ID
function GET(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, _c, user, authError, id, _d, document_1, error, error_1;
        var params = _b.params;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, server_2.createClient)()
                        // Check authentication
                    ];
                case 1:
                    supabase = _e.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _c = _e.sent(), user = _c.data.user, authError = _c.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, params];
                case 3:
                    id = (_e.sent()).id;
                    return [4 /*yield*/, supabase
                            .from('regulatory_documents')
                            .select("\n        *,\n        regulation_categories!inner(name, authority_name, description),\n        document_versions(\n          id,\n          version,\n          file_url,\n          change_reason,\n          created_by,\n          created_at,\n          profiles!document_versions_created_by_fkey(full_name)\n        ),\n        compliance_alerts(\n          id,\n          alert_type,\n          alert_date,\n          sent_at,\n          acknowledged_at\n        ),\n        profiles!regulatory_documents_created_by_fkey(full_name),\n        profiles!regulatory_documents_updated_by_fkey(full_name)\n      ")
                            .eq('id', id)
                            .single()];
                case 4:
                    _d = _e.sent(), document_1 = _d.data, error = _d.error;
                    if (error) {
                        console.error('Error fetching regulatory document:', error);
                        if (error.code === 'PGRST116') {
                            return [2 /*return*/, server_1.NextResponse.json({ error: 'Document not found' }, { status: 404 })];
                        }
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ document: document_1 })];
                case 5:
                    error_1 = _e.sent();
                    console.error('API Error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// PUT /api/regulatory-documents/[id] - Update document
function PUT(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, _c, user, authError, id, requestBody, validatedData, _d, existingDoc, fetchError, _e, document_2, error, error_2;
        var params = _b.params;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, (0, server_2.createClient)()
                        // Check authentication
                    ];
                case 1:
                    supabase = _f.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _c = _f.sent(), user = _c.data.user, authError = _c.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, params];
                case 3:
                    id = (_f.sent()).id;
                    return [4 /*yield*/, request.json()];
                case 4:
                    requestBody = _f.sent();
                    validatedData = UpdateDocumentSchema.parse(requestBody);
                    return [4 /*yield*/, supabase
                            .from('regulatory_documents')
                            .select('id, version, file_url')
                            .eq('id', id)
                            .single()];
                case 5:
                    _d = _f.sent(), existingDoc = _d.data, fetchError = _d.error;
                    if (fetchError) {
                        if (fetchError.code === 'PGRST116') {
                            return [2 /*return*/, server_1.NextResponse.json({ error: 'Document not found' }, { status: 404 })];
                        }
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('regulatory_documents')
                            .update(__assign(__assign({}, validatedData), { updated_by: user.id, updated_at: new Date().toISOString() }))
                            .eq('id', id)
                            .select("\n        *,\n        regulation_categories!inner(name, authority_name)\n      ")
                            .single()];
                case 6:
                    _e = _f.sent(), document_2 = _e.data, error = _e.error;
                    if (error) {
                        console.error('Error updating regulatory document:', error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to update document' }, { status: 500 })];
                    }
                    if (!(validatedData.file_url && validatedData.file_url !== existingDoc.file_url)) return [3 /*break*/, 8];
                    return [4 /*yield*/, supabase
                            .from('document_versions')
                            .insert({
                            document_id: id,
                            version: validatedData.version || "v".concat(Date.now()),
                            file_url: validatedData.file_url,
                            change_reason: requestBody.change_reason || 'Document updated',
                            created_by: user.id
                        })];
                case 7:
                    _f.sent();
                    _f.label = 8;
                case 8: return [2 /*return*/, server_1.NextResponse.json({ document: document_2 })];
                case 9:
                    error_2 = _f.sent();
                    console.error('API Error:', error_2);
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid document data', details: error_2.errors }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 10: return [2 /*return*/];
            }
        });
    });
}
// DELETE /api/regulatory-documents/[id] - Delete document
function DELETE(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, _c, user, authError, id, _d, existingDoc, fetchError, error, error_3;
        var params = _b.params;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, (0, server_2.createClient)()
                        // Check authentication
                    ];
                case 1:
                    supabase = _e.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _c = _e.sent(), user = _c.data.user, authError = _c.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, params];
                case 3:
                    id = (_e.sent()).id;
                    return [4 /*yield*/, supabase
                            .from('regulatory_documents')
                            .select('id')
                            .eq('id', id)
                            .single()];
                case 4:
                    _d = _e.sent(), existingDoc = _d.data, fetchError = _d.error;
                    if (fetchError) {
                        if (fetchError.code === 'PGRST116') {
                            return [2 /*return*/, server_1.NextResponse.json({ error: 'Document not found' }, { status: 404 })];
                        }
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('regulatory_documents')
                            .delete()
                            .eq('id', id)];
                case 5:
                    error = (_e.sent()).error;
                    if (error) {
                        console.error('Error deleting regulatory document:', error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ message: 'Document deleted successfully' })];
                case 6:
                    error_3 = _e.sent();
                    console.error('API Error:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
