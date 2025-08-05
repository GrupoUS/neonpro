"use strict";
/**
 * Story 6.1 Task 2: Barcode Scanning API
 * Scan barcodes and QR codes for inventory items
 * Quality: ≥9.5/10 with comprehensive validation and real-time processing
 */
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
exports.POST = POST;
exports.GET = GET;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var barcode_service_1 = require("@/app/lib/services/barcode-service");
var zod_1 = require("zod");
var scanBarcodeSchema = zod_1.z.object({
    value: zod_1.z.string().min(1, 'Valor do scan é obrigatório'),
    format: zod_1.z.string().optional(),
    location_id: zod_1.z.string().uuid().optional(),
    device_info: zod_1.z.string().optional()
});
var bulkScanSchema = zod_1.z.object({
    operation_type: zod_1.z.enum(['stock_count', 'item_verification', 'location_transfer', 'expiration_check']),
    location_id: zod_1.z.string().uuid().optional(),
    items: zod_1.z.array(zod_1.z.string()).optional()
});
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, session, authError, body, searchParams, operation, validatedData, result, validatedData, scanResult, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    _a = _b.sent(), session = _a.data.session, authError = _a.error;
                    if (authError || !session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Não autorizado' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _b.sent();
                    searchParams = new URL(request.url).searchParams;
                    operation = searchParams.get('operation') || 'single';
                    if (!(operation === 'bulk')) return [3 /*break*/, 5];
                    validatedData = bulkScanSchema.parse(body);
                    return [4 /*yield*/, barcode_service_1.barcodeService.startBulkScanOperation(__assign(__assign({}, validatedData), { user_id: session.user.id }))];
                case 4:
                    result = _b.sent();
                    if (!result.success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: result.error }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            operation_id: result.operation_id,
                            message: 'Operação em lote iniciada com sucesso'
                        })];
                case 5:
                    validatedData = scanBarcodeSchema.parse(body);
                    return [4 /*yield*/, barcode_service_1.barcodeService.scanBarcode(__assign(__assign({}, validatedData), { user_id: session.user.id }))];
                case 6:
                    scanResult = _b.sent();
                    if (!scanResult.success) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                success: false,
                                error: scanResult.error,
                                metadata: scanResult.metadata
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: scanResult.data,
                            metadata: scanResult.metadata
                        })];
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_1 = _b.sent();
                    console.error('Erro na API de scan:', error_1);
                    if (error_1 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Dados inválidos',
                                details: error_1.errors.map(function (e) { return ({
                                    field: e.path.join('.'),
                                    message: e.message
                                }); })
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, session, authError, searchParams, itemId, limit, operation, _b, scanHistory, error_3, barcodeData, _c, allBarcodes, error, error_2;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _d.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    _a = _d.sent(), session = _a.data.session, authError = _a.error;
                    if (authError || !session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Não autorizado' }, { status: 401 })];
                    }
                    searchParams = new URL(request.url).searchParams;
                    itemId = searchParams.get('item_id');
                    limit = parseInt(searchParams.get('limit') || '50');
                    operation = searchParams.get('operation');
                    if (!(operation === 'history')) return [3 /*break*/, 4];
                    return [4 /*yield*/, supabase
                            .from('scan_activity_log')
                            .select("\n          *,\n          inventory_items (\n            name,\n            sku\n          )\n        ")
                            .eq('user_id', session.user.id)
                            .order('scanned_at', { ascending: false })
                            .limit(limit)];
                case 3:
                    _b = _d.sent(), scanHistory = _b.data, error_3 = _b.error;
                    if (error_3) {
                        console.error('Erro ao buscar histórico:', error_3);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Erro ao buscar histórico de scans' }, { status: 500 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: scanHistory
                        })];
                case 4:
                    if (!itemId) return [3 /*break*/, 6];
                    return [4 /*yield*/, barcode_service_1.barcodeService.getBarcodeData(itemId)];
                case 5:
                    barcodeData = _d.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: barcodeData
                        })];
                case 6: return [4 /*yield*/, supabase
                        .from('inventory_barcodes')
                        .select("\n        *,\n        inventory_items (\n          name,\n          sku,\n          category\n        ),\n        inventory_locations (\n          location_name\n        )\n      ")
                        .order('created_at', { ascending: false })
                        .limit(limit)];
                case 7:
                    _c = _d.sent(), allBarcodes = _c.data, error = _c.error;
                    if (error) {
                        console.error('Erro ao buscar códigos:', error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Erro ao buscar códigos de barras' }, { status: 500 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: allBarcodes
                        })];
                case 8:
                    error_2 = _d.sent();
                    console.error('Erro na busca de barcodes:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })];
                case 9: return [2 /*return*/];
            }
        });
    });
}
