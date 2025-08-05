"use strict";
// =====================================================================================
// SUPPLIER CONTRACTS API ENDPOINTS
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================
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
var supplier_management_service_1 = require("@/app/lib/services/supplier-management-service");
var suppliers_1 = require("@/app/lib/validations/suppliers");
var server_1 = require("next/server");
var supplierService = new supplier_management_service_1.SupplierManagementService();
// =====================================================================================
// GET /api/suppliers/contracts - List contracts or get renewal alerts
// =====================================================================================
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, clinicId, supplierId, action, daysAhead, alerts, contracts, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    searchParams = new URL(request.url).searchParams;
                    clinicId = searchParams.get('clinic_id');
                    supplierId = searchParams.get('supplier_id');
                    action = searchParams.get('action');
                    if (!clinicId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'clinic_id é obrigatório' }, { status: 400 })];
                    }
                    if (!(action === 'renewal-alerts')) return [3 /*break*/, 2];
                    daysAhead = parseInt(searchParams.get('days_ahead') || '90');
                    return [4 /*yield*/, supplierService.getContractRenewalAlerts(clinicId, daysAhead)];
                case 1:
                    alerts = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ alerts: alerts })];
                case 2:
                    if (!supplierId) return [3 /*break*/, 4];
                    return [4 /*yield*/, supplierService.getSupplierContracts(supplierId)];
                case 3:
                    contracts = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ contracts: contracts })];
                case 4: return [2 /*return*/, server_1.NextResponse.json({ error: 'supplier_id é obrigatório quando action não é renewal-alerts' }, { status: 400 })];
                case 5:
                    error_1 = _a.sent();
                    console.error('Erro ao buscar contratos:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// =====================================================================================
// POST /api/suppliers/contracts - Create new contract
// =====================================================================================
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, validationResult, contract, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _a.sent();
                    validationResult = suppliers_1.createContractSchema.safeParse(body);
                    if (!validationResult.success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Dados inválidos', details: validationResult.error.issues }, { status: 400 })];
                    }
                    return [4 /*yield*/, supplierService.createContract(validationResult.data)];
                case 2:
                    contract = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json(contract, { status: 201 })];
                case 3:
                    error_2 = _a.sent();
                    console.error('Erro ao criar contrato:', error_2);
                    if (error_2 instanceof Error && error_2.message.includes('já existe')) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: error_2.message }, { status: 409 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
