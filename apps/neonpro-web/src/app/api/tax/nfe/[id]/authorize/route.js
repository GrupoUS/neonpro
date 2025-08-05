"use strict";
// NFe Authorization API Endpoint
// Story 5.5: Authorize NFe documents with SEFAZ
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
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
var nfe_service_1 = require("@/lib/services/tax/nfe-service");
function POST(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, _c, session, authError, id, _d, nfeDocument, fetchError, _e, clinic, clinicError, authResult, _f, updatedNfe, updateError, error_1;
        var params = _b.params;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 7, , 8]);
                    supabase = (0, server_2.createClient)();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 1:
                    _c = _g.sent(), session = _c.data.session, authError = _c.error;
                    if (authError || !session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    id = params.id;
                    return [4 /*yield*/, supabase
                            .from('nfe_documents')
                            .select('*')
                            .eq('id', id)
                            .single()];
                case 2:
                    _d = _g.sent(), nfeDocument = _d.data, fetchError = _d.error;
                    if (fetchError || !nfeDocument) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'NFe document not found' }, { status: 404 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('clinics')
                            .select('id, name')
                            .eq('id', nfeDocument.clinic_id)
                            .single()];
                case 3:
                    _e = _g.sent(), clinic = _e.data, clinicError = _e.error;
                    if (clinicError || !clinic) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Access denied' }, { status: 403 })];
                    }
                    // Check if NFe can be authorized
                    if (nfeDocument.status !== 'draft') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Only draft NFe documents can be authorized' }, { status: 400 })];
                    }
                    return [4 /*yield*/, nfe_service_1.nfeService.authorizeNFe(nfeDocument)];
                case 4:
                    authResult = _g.sent();
                    return [4 /*yield*/, supabase
                            .from('nfe_documents')
                            .update({
                            status: authResult.success ? 'authorized' : 'rejected',
                            authorization_code: authResult.authorizationCode,
                            authorization_date: authResult.success ? new Date().toISOString() : null,
                            rejection_reason: authResult.success ? null : authResult.error,
                            sefaz_response: authResult.sefazResponse,
                            updated_at: new Date().toISOString()
                        })
                            .eq('id', id)
                            .select()
                            .single()];
                case 5:
                    _f = _g.sent(), updatedNfe = _f.data, updateError = _f.error;
                    if (updateError) {
                        console.error('Error updating NFe document:', updateError);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to update NFe document' }, { status: 500 })];
                    }
                    // Log authorization attempt
                    return [4 /*yield*/, supabase
                            .from('nfe_audit_log')
                            .insert({
                            nfe_document_id: id,
                            action: 'authorize',
                            user_id: session.user.id,
                            result: authResult.success ? 'success' : 'failure',
                            details: authResult,
                            created_at: new Date().toISOString()
                        })];
                case 6:
                    // Log authorization attempt
                    _g.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: {
                                nfe: updatedNfe,
                                authorization: authResult
                            }
                        })];
                case 7:
                    error_1 = _g.sent();
                    console.error('NFe authorization error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 8: return [2 /*return*/];
            }
        });
    });
}
