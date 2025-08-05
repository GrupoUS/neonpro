"use client";
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
exports.default = VendorPerformanceDashboard;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var progress_1 = require("@/components/ui/progress");
var select_1 = require("@/components/ui/select");
var vendors_1 = require("@/lib/services/vendors");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
function VendorPerformanceDashboard() {
  var _this = this;
  var _a = (0, react_1.useState)([]),
    vendors = _a[0],
    setVendors = _a[1];
  var _b = (0, react_1.useState)([]),
    performance = _b[0],
    setPerformance = _b[1];
  var _c = (0, react_1.useState)("all"),
    selectedVendor = _c[0],
    setSelectedVendor = _c[1];
  var _d = (0, react_1.useState)(true),
    loading = _d[0],
    setLoading = _d[1];
  var _e = (0, react_1.useState)("30"),
    period = _e[0],
    setPeriod = _e[1]; // days
  var loadVendors = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var vendorList, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, vendors_1.VendorService.getVendors()];
          case 1:
            vendorList = _a.sent();
            setVendors(vendorList.vendors || []);
            return [3 /*break*/, 3];
          case 2:
            error_1 = _a.sent();
            console.error("Erro ao carregar fornecedores:", error_1);
            sonner_1.toast.error("Erro ao carregar fornecedores");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var loadPerformanceData = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var mockPerformance;
      return __generator(this, function (_a) {
        setLoading(true);
        try {
          mockPerformance = vendors.map(function (vendor) {
            return {
              vendor_id: vendor.id,
              vendor_name: vendor.company_name,
              total_transactions: Math.floor(Math.random() * 50) + 5,
              total_amount: Math.random() * 100000 + 10000,
              average_payment_time: Math.floor(Math.random() * 45) + 15,
              on_time_payment_rate: Math.random() * 40 + 60,
              overdue_count: Math.floor(Math.random() * 5),
              completed_count: Math.floor(Math.random() * 30) + 10,
              pending_count: Math.floor(Math.random() * 8) + 2,
              quality_score: Math.random() * 30 + 70,
              last_transaction_date: new Date(
                Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              documents_count: Math.floor(Math.random() * 15) + 5,
            };
          });
          setPerformance(mockPerformance);
        } catch (error) {
          console.error("Erro ao carregar dados de performance:", error);
          sonner_1.toast.error("Erro ao carregar dados de performance");
        } finally {
          setLoading(false);
        }
        return [2 /*return*/];
      });
    });
  };
  (0, react_1.useEffect)(function () {
    loadVendors();
  }, []);
  (0, react_1.useEffect)(
    function () {
      if (vendors.length > 0) {
        loadPerformanceData();
      }
    },
    [vendors, period],
  );
  var getScoreColor = function (score) {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };
  var getScoreBadgeVariant = function (score) {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };
  var formatCurrency = function (amount) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };
  var filteredPerformance =
    selectedVendor === "all"
      ? performance
      : performance.filter(function (p) {
          return p.vendor_id === selectedVendor;
        });
  var totalStats = performance.reduce(
    function (acc, p) {
      return {
        transactions: acc.transactions + p.total_transactions,
        amount: acc.amount + p.total_amount,
        overdue: acc.overdue + p.overdue_count,
        completed: acc.completed + p.completed_count,
      };
    },
    { transactions: 0, amount: 0, overdue: 0, completed: 0 },
  );
  var averagePaymentTime =
    performance.length > 0
      ? performance.reduce(function (sum, p) {
          return sum + p.average_payment_time;
        }, 0) / performance.length
      : 0;
  var averageOnTimeRate =
    performance.length > 0
      ? performance.reduce(function (sum, p) {
          return sum + p.on_time_payment_rate;
        }, 0) / performance.length
      : 0;
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(function (i) {
            return (
              <card_1.Card key={i}>
                <card_1.CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex gap-4 items-center">
        <select_1.Select value={period} onValueChange={setPeriod}>
          <select_1.SelectTrigger className="w-[200px]">
            <select_1.SelectValue placeholder="Período" />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="7">Últimos 7 dias</select_1.SelectItem>
            <select_1.SelectItem value="30">Últimos 30 dias</select_1.SelectItem>
            <select_1.SelectItem value="90">Últimos 90 dias</select_1.SelectItem>
            <select_1.SelectItem value="365">Último ano</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>

        <select_1.Select value={selectedVendor} onValueChange={setSelectedVendor}>
          <select_1.SelectTrigger className="w-[250px]">
            <select_1.SelectValue placeholder="Todos os fornecedores" />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="all">Todos os fornecedores</select_1.SelectItem>
            {vendors.map(function (vendor) {
              return (
                <select_1.SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.company_name}
                </select_1.SelectItem>
              );
            })}
          </select_1.SelectContent>
        </select_1.Select>

        <button_1.Button onClick={loadPerformanceData} variant="outline">
          Atualizar
        </button_1.Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Transações</p>
                <p className="text-2xl font-bold">{totalStats.transactions}</p>
              </div>
              <lucide_react_1.FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalStats.amount)}</p>
              </div>
              <lucide_react_1.DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tempo Médio de Pagamento
                </p>
                <p className="text-2xl font-bold">{Math.round(averagePaymentTime)} dias</p>
              </div>
              <lucide_react_1.Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Pontualidade</p>
                <p className="text-2xl font-bold">{Math.round(averageOnTimeRate)}%</p>
              </div>
              <lucide_react_1.CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Vendor Performance Table */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Star className="h-5 w-5" />
            Performance por Fornecedor
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Fornecedor</th>
                  <th className="text-left p-2">Score</th>
                  <th className="text-left p-2">Transações</th>
                  <th className="text-left p-2">Valor Total</th>
                  <th className="text-left p-2">Pontualidade</th>
                  <th className="text-left p-2">Tempo Médio</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Documentos</th>
                </tr>
              </thead>
              <tbody>
                {filteredPerformance.map(function (vendor) {
                  return (
                    <tr key={vendor.vendor_id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{vendor.vendor_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Última transação:{" "}
                            {new Date(vendor.last_transaction_date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <badge_1.Badge variant={getScoreBadgeVariant(vendor.quality_score)}>
                            {Math.round(vendor.quality_score)}
                          </badge_1.Badge>
                          <div className="flex items-center">
                            {vendor.quality_score >= 90
                              ? <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600" />
                              : vendor.quality_score < 70
                                ? <lucide_react_1.TrendingDown className="h-4 w-4 text-red-600" />
                                : <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-600" />}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">{vendor.total_transactions}</td>
                      <td className="p-2">{formatCurrency(vendor.total_amount)}</td>
                      <td className="p-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{Math.round(vendor.on_time_payment_rate)}%</span>
                          </div>
                          <progress_1.Progress
                            value={vendor.on_time_payment_rate}
                            className="h-2"
                          />
                        </div>
                      </td>
                      <td className="p-2">{vendor.average_payment_time} dias</td>
                      <td className="p-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{vendor.completed_count} concluídas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <lucide_react_1.Clock className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm">{vendor.pending_count} pendentes</span>
                          </div>
                          {vendor.overdue_count > 0 && (
                            <div className="flex items-center gap-2">
                              <lucide_react_1.XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm">{vendor.overdue_count} atrasadas</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <badge_1.Badge variant="outline">
                          {vendor.documents_count} docs
                        </badge_1.Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
