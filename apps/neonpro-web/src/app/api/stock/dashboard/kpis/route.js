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
var server_1 = require("next/server");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var headers_1 = require("next/headers");
var zod_1 = require("zod");
var dashboardParamsSchema = zod_1.z.object({
    clinicId: zod_1.z.string().uuid(),
    period: zod_1.z.enum(['7d', '30d', '90d', '1y', 'custom']).default('30d'),
    startDate: zod_1.z.string().datetime().optional(),
    endDate: zod_1.z.string().datetime().optional()
});
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, session, authError, searchParams, params, startDate, endDate, days, _b, clinic, clinicError, _c, stockData, stockError, _d, movementData, movementError, totalValue, totalConsumption, averageInventory, turnoverRate, dailyConsumption, daysCoverage, productsInRange, accuracyPercentage, wasteValue, wastePercentage, kpis, error_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 5, , 6]);
                    supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({ cookies: headers_1.cookies });
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 1:
                    _a = _e.sent(), session = _a.data.session, authError = _a.error;
                    if (authError || !session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Não autorizado' }, { status: 401 })];
                    }
                    searchParams = new URL(request.url).searchParams;
                    params = dashboardParamsSchema.parse({
                        clinicId: searchParams.get('clinicId'),
                        period: searchParams.get('period') || '30d',
                        startDate: searchParams.get('startDate'),
                        endDate: searchParams.get('endDate')
                    });
                    startDate = void 0;
                    endDate = new Date();
                    if (params.period === 'custom' && params.startDate && params.endDate) {
                        startDate = new Date(params.startDate);
                        endDate = new Date(params.endDate);
                    }
                    else {
                        days = {
                            '7d': 7,
                            '30d': 30,
                            '90d': 90,
                            '1y': 365
                        }[params.period] || 30;
                        startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
                    }
                    return [4 /*yield*/, supabase
                            .from('clinics')
                            .select('id')
                            .eq('id', params.clinicId)
                            .single()];
                case 2:
                    _b = _e.sent(), clinic = _b.data, clinicError = _b.error;
                    if (clinicError || !clinic) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Clínica não encontrada' }, { status: 404 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('stock_inventory')
                            .select("\n        id,\n        product_id,\n        quantity_available,\n        min_stock_level,\n        max_stock_level,\n        unit_cost,\n        products (name, category_id)\n      ")
                            .eq('clinic_id', params.clinicId)
                            .eq('is_active', true)];
                case 3:
                    _c = _e.sent(), stockData = _c.data, stockError = _c.error;
                    if (stockError) {
                        console.error('Stock Error:', stockError);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Erro ao buscar dados de estoque' }, { status: 500 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('stock_movement_transactions')
                            .select('*')
                            .eq('clinic_id', params.clinicId)
                            .gte('transaction_date', startDate.toISOString())
                            .lte('transaction_date', endDate.toISOString())];
                case 4:
                    _d = _e.sent(), movementData = _d.data, movementError = _d.error;
                    if (movementError) {
                        console.error('Movement Error:', movementError);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Erro ao buscar movimentações' }, { status: 500 })];
                    }
                    totalValue = (stockData === null || stockData === void 0 ? void 0 : stockData.reduce(function (sum, item) {
                        return sum + (item.quantity_available * item.unit_cost);
                    }, 0)) || 0;
                    totalConsumption = (movementData === null || movementData === void 0 ? void 0 : movementData.reduce(function (sum, movement) {
                        return movement.movement_type === 'out' ? sum + movement.quantity_out : sum;
                    }, 0)) || 0;
                    averageInventory = (stockData === null || stockData === void 0 ? void 0 : stockData.reduce(function (sum, item) {
                        return sum + item.quantity_available;
                    }, 0)) / ((stockData === null || stockData === void 0 ? void 0 : stockData.length) || 1);
                    turnoverRate = averageInventory > 0 ? totalConsumption / averageInventory : 0;
                    dailyConsumption = totalConsumption / Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                    daysCoverage = dailyConsumption > 0 ? averageInventory / dailyConsumption : 0;
                    productsInRange = (stockData === null || stockData === void 0 ? void 0 : stockData.filter(function (item) {
                        return item.quantity_available >= item.min_stock_level;
                    }).length) || 0;
                    accuracyPercentage = (stockData === null || stockData === void 0 ? void 0 : stockData.length) ?
                        (productsInRange / stockData.length) * 100 : 0;
                    wasteValue = (movementData === null || movementData === void 0 ? void 0 : movementData.reduce(function (sum, movement) {
                        return movement.movement_type === 'waste' ? sum + (movement.quantity_out * movement.unit_cost) : sum;
                    }, 0)) || 0;
                    wastePercentage = totalValue > 0 ? (wasteValue / totalValue) * 100 : 0;
                    kpis = [
                        {
                            key: 'total_value',
                            label: 'Valor Total do Estoque',
                            value: totalValue,
                            unit: 'R$',
                            trend: 'stable',
                            trendValue: 2.5,
                            status: 'good',
                            description: 'Valor total investido em estoque'
                        },
                        {
                            key: 'turnover_rate',
                            label: 'Giro de Estoque',
                            value: turnoverRate,
                            unit: 'x',
                            trend: 'up',
                            trendValue: 5.2,
                            status: turnoverRate >= 2 ? 'good' : 'warning',
                            target: 3.0,
                            description: 'Quantas vezes o estoque gira por período'
                        },
                        {
                            key: 'days_coverage',
                            label: 'Dias de Cobertura',
                            value: daysCoverage,
                            unit: 'dias',
                            trend: 'down',
                            trendValue: 3.1,
                            status: daysCoverage >= 30 ? 'good' : 'warning',
                            target: 45,
                            description: 'Quantos dias o estoque atual durará'
                        },
                        {
                            key: 'accuracy_percentage',
                            label: 'Acuracidade do Estoque',
                            value: accuracyPercentage,
                            unit: '%',
                            trend: 'up',
                            trendValue: 1.8,
                            status: accuracyPercentage >= 95 ? 'good' : accuracyPercentage >= 90 ? 'warning' : 'critical',
                            target: 98,
                            description: 'Percentual de produtos dentro dos níveis ideais'
                        },
                        {
                            key: 'waste_percentage',
                            label: 'Taxa de Desperdício',
                            value: wastePercentage,
                            unit: '%',
                            trend: 'down',
                            trendValue: 12.3,
                            status: wastePercentage <= 2 ? 'good' : wastePercentage <= 5 ? 'warning' : 'critical',
                            target: 2,
                            description: 'Percentual de perdas por vencimento'
                        }
                    ];
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: kpis,
                            metadata: {
                                period: params.period,
                                startDate: startDate.toISOString(),
                                endDate: endDate.toISOString(),
                                clinicId: params.clinicId,
                                totalProducts: (stockData === null || stockData === void 0 ? void 0 : stockData.length) || 0,
                                totalMovements: (movementData === null || movementData === void 0 ? void 0 : movementData.length) || 0
                            }
                        })];
                case 5:
                    error_1 = _e.sent();
                    console.error('Dashboard KPIs API Error:', error_1);
                    if (error_1 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Parâmetros inválidos', details: error_1.errors }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
