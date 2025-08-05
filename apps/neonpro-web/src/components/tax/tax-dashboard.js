// Brazilian Tax Dashboard Component
// Story 5.5: Main dashboard for Brazilian tax management
"use client";
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
exports.default = TaxDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function TaxDashboard(_a) {
    var _this = this;
    var clinicId = _a.clinicId;
    var _b = (0, react_1.useState)(null), statistics = _b[0], setStatistics = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    }), dateRange = _e[0], setDateRange = _e[1];
    var loadStatistics = function () { return __awaiter(_this, void 0, void 0, function () {
        var params, response, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    setError(null);
                    params = new URLSearchParams({
                        clinic_id: clinicId,
                        start_date: dateRange.start,
                        end_date: dateRange.end,
                        type: 'overview'
                    });
                    return [4 /*yield*/, fetch("/api/tax/statistics?".concat(params))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to load tax statistics');
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setStatistics(data.data);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error('Error loading tax statistics:', err_1);
                    setError(err_1 instanceof Error ? err_1.message : 'Unknown error');
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        loadStatistics();
    }, [clinicId, dateRange]);
    var getStatusColor = function (status) {
        switch (status) {
            case 'authorized':
                return 'bg-green-100 text-green-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case 'authorized':
                return lucide_react_1.CheckCircle;
            case 'draft':
                return lucide_react_1.Clock;
            case 'cancelled':
            case 'rejected':
                return lucide_react_1.XCircle;
            default:
                return lucide_react_1.AlertTriangle;
        }
    };
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin"/>
        <span className="ml-2">Carregando estatísticas fiscais...</span>
      </div>);
    }
    if (error) {
        return (<card_1.Card className="border-red-200">
        <card_1.CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-600">
            <lucide_react_1.AlertTriangle className="h-5 w-5"/>
            <span>Erro ao carregar dados: {error}</span>
          </div>
          <button_1.Button onClick={loadStatistics} variant="outline" className="mt-4">
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2"/>
            Tentar Novamente
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>);
    }
    if (!statistics) {
        return (<card_1.Card>
        <card_1.CardContent className="pt-6">
          <p className="text-center text-gray-500">Nenhum dado disponível</p>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Fiscal</h1>
          <p className="text-gray-600">
            Período: {new Date(statistics.period.start).toLocaleDateString()} - {new Date(statistics.period.end).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <input type="date" value={dateRange.start} onChange={function (e) { return setDateRange(function (prev) { return (__assign(__assign({}, prev), { start: e.target.value })); }); }} className="px-3 py-2 border rounded-md"/>
          <input type="date" value={dateRange.end} onChange={function (e) { return setDateRange(function (prev) { return (__assign(__assign({}, prev), { end: e.target.value })); }); }} className="px-3 py-2 border rounded-md"/>
          <button_1.Button onClick={loadStatistics} variant="outline">
            <lucide_react_1.RefreshCw className="h-4 w-4"/>
          </button_1.Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">NFes Emitidas</card_1.CardTitle>
            <lucide_react_1.FileText className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{statistics.nfe_statistics.total_documents}</div>
            <p className="text-xs text-muted-foreground">
              Valor total: {(0, utils_1.formatCurrency)(statistics.nfe_statistics.total_value)}
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Receita Total</card_1.CardTitle>
            <lucide_react_1.DollarSign className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {(0, utils_1.formatCurrency)(statistics.tax_summary.total_revenue || statistics.nfe_statistics.total_value)}
            </div>
            <p className="text-xs text-muted-foreground">
              Impostos: {(0, utils_1.formatCurrency)(statistics.tax_summary.total_taxes)}
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Carga Tributária</card_1.CardTitle>
            <lucide_react_1.Percent className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {(0, utils_1.formatPercentage)(statistics.tax_summary.effective_rate)}
            </div>
            <p className="text-xs text-muted-foreground">
              Taxa efetiva de impostos
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">NFes Autorizadas</card_1.CardTitle>
            <lucide_react_1.CheckCircle className="h-4 w-4 text-muted-foreground"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {statistics.nfe_statistics.by_status.authorized || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {((statistics.nfe_statistics.by_status.authorized || 0) / Math.max(statistics.nfe_statistics.total_documents, 1) * 100).toFixed(1)}% do total
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Detailed Views */}
      <tabs_1.Tabs defaultValue="nfe" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="nfe">NFe Status</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="taxes">Impostos</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="monthly">Mensal</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* NFe Status Tab */}
        <tabs_1.TabsContent value="nfe" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Status das NFes</card_1.CardTitle>
              <card_1.CardDescription>
                Distribuição das notas fiscais por status
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(statistics.nfe_statistics.by_status).map(function (_a) {
            var status = _a[0], count = _a[1];
            var Icon = getStatusIcon(status);
            return (<div key={status} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Icon className="h-5 w-5"/>
                      <div>
                        <badge_1.Badge className={getStatusColor(status)}>
                          {status}
                        </badge_1.Badge>
                        <p className="text-lg font-semibold mt-1">{count}</p>
                      </div>
                    </div>);
        })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Tax Breakdown Tab */}
        <tabs_1.TabsContent value="taxes" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Detalhamento de Impostos</card_1.CardTitle>
              <card_1.CardDescription>
                Breakdown dos impostos calculados
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(statistics.tax_summary.breakdown)
            .filter(function (_a) {
            var _ = _a[0], value = _a[1];
            return value > 0;
        })
            .map(function (_a) {
            var tax = _a[0], value = _a[1];
            return (<div key={tax} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium uppercase">{tax}</span>
                        <lucide_react_1.TrendingUp className="h-4 w-4 text-muted-foreground"/>
                      </div>
                      <div className="text-2xl font-bold mt-2">
                        {(0, utils_1.formatCurrency)(value)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((value / Math.max(statistics.tax_summary.total_taxes, 1)) * 100).toFixed(1)}% do total
                      </div>
                    </div>);
        })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Monthly Trends Tab */}
        <tabs_1.TabsContent value="monthly" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Evolução Mensal</card_1.CardTitle>
              <card_1.CardDescription>
                NFes emitidas e valores por mês
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {statistics.nfe_statistics.by_month.map(function (month) { return (<div key={month.month} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {new Date(month.month + '-01').toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long'
            })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {month.count} NFes emitidas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {(0, utils_1.formatCurrency)(month.value)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Média: {(0, utils_1.formatCurrency)(month.value / Math.max(month.count, 1))}
                      </p>
                    </div>
                  </div>); })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
