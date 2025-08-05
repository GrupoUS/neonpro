"use client";
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
exports.APDashboardStats = APDashboardStats;
var card_1 = require("@/components/ui/card");
var accounts_payable_1 = require("@/lib/services/accounts-payable");
var vendors_1 = require("@/lib/services/vendors");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function APDashboardStats() {
    var _this = this;
    var _a = (0, react_1.useState)({
        pending: 0,
        totalOpenAmount: 0,
        dueToday: 0,
        activeVendors: 0,
    }), stats = _a[0], setStats = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    (0, react_1.useEffect)(function () {
        loadStats();
    }, []);
    var loadStats = function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, apStats, vendorStats, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, Promise.all([
                            accounts_payable_1.AccountsPayableService.getDashboardStats(),
                            vendors_1.VendorService.getVendorStats(),
                        ])];
                case 1:
                    _a = _b.sent(), apStats = _a[0], vendorStats = _a[1];
                    setStats({
                        pending: apStats.pending,
                        totalOpenAmount: apStats.totalOpenAmount,
                        dueToday: apStats.dueToday,
                        activeVendors: vendorStats.active,
                    });
                    return [3 /*break*/, 4];
                case 2:
                    error_1 = _b.sent();
                    console.error("Error loading stats:", error_1);
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var formatCurrency = function (value) {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">
            Contas Pendentes
          </card_1.CardTitle>
          <lucide_react_1.Receipt className="h-4 w-4 text-muted-foreground"/>
        </card_1.CardHeader>
        <card_1.CardContent>
          {loading ? (<div className="flex items-center">
              <lucide_react_1.Loader2 className="h-4 w-4 animate-spin mr-2"/>
              <div className="text-2xl font-bold">--</div>
            </div>) : (<div className="text-2xl font-bold">{stats.pending}</div>)}
          <p className="text-xs text-muted-foreground">
            Aguardando aprovação ou pagamento
          </p>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Total em Aberto</card_1.CardTitle>
          <lucide_react_1.CreditCard className="h-4 w-4 text-muted-foreground"/>
        </card_1.CardHeader>
        <card_1.CardContent>
          {loading ? (<div className="flex items-center">
              <lucide_react_1.Loader2 className="h-4 w-4 animate-spin mr-2"/>
              <div className="text-2xl font-bold">R$ --</div>
            </div>) : (<div className="text-2xl font-bold">
              {formatCurrency(stats.totalOpenAmount)}
            </div>)}
          <p className="text-xs text-muted-foreground">
            Valor total a ser pago
          </p>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">Vencendo Hoje</card_1.CardTitle>
          <lucide_react_1.AlertCircle className="h-4 w-4 text-muted-foreground"/>
        </card_1.CardHeader>
        <card_1.CardContent>
          {loading ? (<div className="flex items-center">
              <lucide_react_1.Loader2 className="h-4 w-4 animate-spin mr-2"/>
              <div className="text-2xl font-bold">--</div>
            </div>) : (<div className="text-2xl font-bold">{stats.dueToday}</div>)}
          <p className="text-xs text-muted-foreground">
            Contas com vencimento hoje
          </p>
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card>
        <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <card_1.CardTitle className="text-sm font-medium">
            Fornecedores Ativos
          </card_1.CardTitle>
          <lucide_react_1.Building className="h-4 w-4 text-muted-foreground"/>
        </card_1.CardHeader>
        <card_1.CardContent>
          {loading ? (<div className="flex items-center">
              <lucide_react_1.Loader2 className="h-4 w-4 animate-spin mr-2"/>
              <div className="text-2xl font-bold">--</div>
            </div>) : (<div className="text-2xl font-bold">{stats.activeVendors}</div>)}
          <p className="text-xs text-muted-foreground">
            Fornecedores cadastrados
          </p>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
