'use client';
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
exports.AnalyticsDashboard = AnalyticsDashboard;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var charts_1 = require("@/components/charts");
var date_fns_1 = require("date-fns");
function AnalyticsDashboard() {
    var _this = this;
    var _a = (0, react_1.useState)([]), kpis = _a[0], setKpis = _a[1];
    var _b = (0, react_1.useState)([]), revenueTrends = _b[0], setRevenueTrends = _b[1];
    var _c = (0, react_1.useState)([]), appointmentTrends = _c[0], setAppointmentTrends = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)({
        start: (0, date_fns_1.format)((0, date_fns_1.startOfMonth)((0, date_fns_1.subDays)(new Date(), 30)), 'yyyy-MM-dd'),
        end: (0, date_fns_1.format)((0, date_fns_1.endOfMonth)(new Date()), 'yyyy-MM-dd')
    }), dateRange = _e[0], setDateRange = _e[1];
    var fetchDashboardData = function () { return __awaiter(_this, void 0, void 0, function () {
        var kpiResponse, kpiData, revenueResponse, revenueData, appointmentResponse, appointmentData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 11, 12, 13]);
                    return [4 /*yield*/, fetch("/api/analytics/dashboard?start_date=".concat(dateRange.start, "&end_date=").concat(dateRange.end))];
                case 2:
                    kpiResponse = _a.sent();
                    if (!kpiResponse.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, kpiResponse.json()];
                case 3:
                    kpiData = _a.sent();
                    setKpis(kpiData.kpis || []);
                    _a.label = 4;
                case 4: return [4 /*yield*/, fetch("/api/analytics/trends?type=revenue&period=monthly&start_date=".concat(dateRange.start, "&end_date=").concat(dateRange.end))];
                case 5:
                    revenueResponse = _a.sent();
                    if (!revenueResponse.ok) return [3 /*break*/, 7];
                    return [4 /*yield*/, revenueResponse.json()];
                case 6:
                    revenueData = _a.sent();
                    setRevenueTrends(revenueData.trends || []);
                    _a.label = 7;
                case 7: return [4 /*yield*/, fetch("/api/analytics/trends?type=appointments&period=monthly&start_date=".concat(dateRange.start, "&end_date=").concat(dateRange.end))];
                case 8:
                    appointmentResponse = _a.sent();
                    if (!appointmentResponse.ok) return [3 /*break*/, 10];
                    return [4 /*yield*/, appointmentResponse.json()];
                case 9:
                    appointmentData = _a.sent();
                    setAppointmentTrends(appointmentData.trends || []);
                    _a.label = 10;
                case 10: return [3 /*break*/, 13];
                case 11:
                    error_1 = _a.sent();
                    console.error('Error fetching dashboard data:', error_1);
                    return [3 /*break*/, 13];
                case 12:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        fetchDashboardData();
    }, [dateRange]);
    var revenueChartData = revenueTrends.map(function (trend) { return ({
        name: trend.period_label,
        Receita: trend.revenue || 0,
        Transações: trend.transactions_count || 0
    }); });
    var appointmentChartData = appointmentTrends.map(function (trend) { return ({
        name: trend.period_label,
        'Total de Agendamentos': trend.total_appointments || 0,
        'Agendamentos Concluídos': trend.completed_appointments || 0,
        'Taxa de Conclusão': trend.completion_rate || 0
    }); });
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Analytics</h1>
          <p className="text-muted-foreground">
            Visão geral das métricas e performance da clínica
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button_1.Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={loading}>
            <lucide_react_1.RefreshCw className={"h-4 w-4 ".concat(loading ? 'animate-spin' : '')}/>
            Atualizar
          </button_1.Button>
          
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Download className="h-4 w-4"/>
            Exportar
          </button_1.Button>
        </div>
      </div>

      {/* KPI Cards */}
      {kpis.length > 0 && (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map(function (kpi) { return (<charts_1.KPICard key={kpi.metric_name} title={kpi.metric_name} value={kpi.metric_value} formattedValue={kpi.metric_formatted} previousValue={kpi.previous_value} percentageChange={kpi.percentage_change} trend={kpi.trend} description="em relação ao período anterior"/>); })}
        </div>)}

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {revenueChartData.length > 0 && (<charts_1.InteractiveLineChart title="Tendência de Receita" data={revenueChartData} lines={[
                {
                    dataKey: 'Receita',
                    name: 'Receita',
                    color: '#8884d8'
                }
            ]} height={300}/>)}

        {appointmentChartData.length > 0 && (<charts_1.InteractiveLineChart title="Tendência de Agendamentos" data={appointmentChartData} lines={[
                {
                    dataKey: 'Total de Agendamentos',
                    name: 'Total',
                    color: '#82ca9d'
                },
                {
                    dataKey: 'Agendamentos Concluídos',
                    name: 'Concluídos',
                    color: '#ffc658'
                }
            ]} height={300}/>)}
      </div>

      {/* Loading State */}
      {loading && (<div className="flex items-center justify-center py-8">
          <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin text-muted-foreground"/>
        </div>)}
    </div>);
}
