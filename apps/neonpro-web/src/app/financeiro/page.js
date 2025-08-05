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
exports.default = FinancialPage;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var progress_1 = require("@/components/ui/progress");
var loading_spinner_1 = require("@/components/ui/loading-spinner");
var lucide_react_1 = require("lucide-react");
function FinancialPage() {
    var _this = this;
    var _a = (0, react_1.useState)(true), isLoading = _a[0], setIsLoading = _a[1];
    var _b = (0, react_1.useState)({
        totalRevenue: 0,
        monthlyRevenue: 0,
        pendingPayments: 0,
        overduePayments: 0,
        consultationRevenue: 0,
        procedureRevenue: 0,
        insurancePayments: 0,
        privatePayments: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0
    }), stats = _b[0], setStats = _b[1];
    var _c = (0, react_1.useState)([]), transactions = _c[0], setTransactions = _c[1];
    var _d = (0, react_1.useState)([]), monthlyData = _d[0], setMonthlyData = _d[1];
    var _e = (0, react_1.useState)("this-month"), selectedPeriod = _e[0], setSelectedPeriod = _e[1];
    var _f = (0, react_1.useState)(""), searchTerm = _f[0], setSearchTerm = _f[1];
    var _g = (0, react_1.useState)("all"), statusFilter = _g[0], setStatusFilter = _g[1];
    var _h = (0, react_1.useState)("all"), typeFilter = _h[0], setTypeFilter = _h[1];
    (0, react_1.useEffect)(function () {
        var loadFinancialData = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setIsLoading(true);
                        // Simulate API call
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1500); })];
                    case 1:
                        // Simulate API call
                        _a.sent();
                        setStats({
                            totalRevenue: 284350,
                            monthlyRevenue: 85420,
                            pendingPayments: 12450,
                            overduePayments: 3200,
                            consultationRevenue: 68900,
                            procedureRevenue: 16520,
                            insurancePayments: 52800,
                            privatePayments: 32620,
                            totalExpenses: 45200,
                            netProfit: 40220,
                            profitMargin: 47.1
                        });
                        setTransactions([
                            {
                                id: "1",
                                date: "2024-08-05",
                                patientName: "Ana Silva Santos",
                                description: "Consulta Cardiologia",
                                type: "receita",
                                category: "consulta",
                                amount: 280,
                                paymentMethod: "convenio",
                                status: "pago",
                                paymentDate: "2024-08-05"
                            },
                            {
                                id: "2",
                                date: "2024-08-05",
                                patientName: "Carlos Rodrigues",
                                description: "Exame Laboratorial",
                                type: "receita",
                                category: "procedimento",
                                amount: 150,
                                paymentMethod: "cartao",
                                status: "pago",
                                paymentDate: "2024-08-05"
                            },
                            {
                                id: "3",
                                date: "2024-08-04",
                                patientName: "Maria Oliveira",
                                description: "Consulta Geral",
                                type: "receita",
                                category: "consulta",
                                amount: 200,
                                paymentMethod: "pix",
                                status: "pendente",
                                dueDate: "2024-08-10"
                            },
                            {
                                id: "4",
                                date: "2024-08-03",
                                patientName: "João Ferreira",
                                description: "Procedimento Cirúrgico",
                                type: "receita",
                                category: "procedimento",
                                amount: 1200,
                                paymentMethod: "convenio",
                                status: "pago",
                                paymentDate: "2024-08-03"
                            },
                            {
                                id: "5",
                                date: "2024-08-01",
                                patientName: "Fornecedor XYZ",
                                description: "Equipamentos Médicos",
                                type: "despesa",
                                category: "equipamento",
                                amount: 2500,
                                paymentMethod: "transferencia",
                                status: "pago",
                                paymentDate: "2024-08-01"
                            }
                        ]);
                        setMonthlyData([
                            { month: "Jan", revenue: 72500, expenses: 38200, profit: 34300, consultations: 156 },
                            { month: "Fev", revenue: 68900, expenses: 39800, profit: 29100, consultations: 142 },
                            { month: "Mar", revenue: 79200, expenses: 41500, profit: 37700, consultations: 168 },
                            { month: "Abr", revenue: 83100, expenses: 43200, profit: 39900, consultations: 174 },
                            { month: "Mai", revenue: 85420, expenses: 45200, profit: 40220, consultations: 181 }
                        ]);
                        setIsLoading(false);
                        return [2 /*return*/];
                }
            });
        }); };
        loadFinancialData();
    }, []);
    var filteredTransactions = transactions.filter(function (transaction) {
        var matchesSearch = transaction.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
        var matchesType = typeFilter === "all" || transaction.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });
    var getStatusColor = function (status) {
        switch (status) {
            case "pago": return "bg-green-100 text-green-800 border-green-200";
            case "pendente": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "vencido": return "bg-red-100 text-red-800 border-red-200";
            case "cancelado": return "bg-gray-100 text-gray-800 border-gray-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };
    var getPaymentMethodIcon = function (method) {
        switch (method) {
            case "cartao": return <lucide_react_1.CreditCard className="w-4 h-4"/>;
            case "pix": return <lucide_react_1.DollarSign className="w-4 h-4"/>;
            case "dinheiro": return <lucide_react_1.Receipt className="w-4 h-4"/>;
            case "convenio": return <lucide_react_1.FileText className="w-4 h-4"/>;
            case "transferencia": return <lucide_react_1.ArrowUpRight className="w-4 h-4"/>;
            default: return <lucide_react_1.DollarSign className="w-4 h-4"/>;
        }
    };
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(amount);
    };
    if (isLoading) {
        return (<div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <loading_spinner_1.LoadingSpinner className="w-8 h-8 mx-auto"/>
          <p className="text-muted-foreground">Carregando dados financeiros...</p>
        </div>
      </div>);
    }
    return (<main className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Relatórios Financeiros
          </h1>
          <p className="text-muted-foreground">
            Gestão financeira e análise de receitas da clínica
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select_1.Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <select_1.SelectTrigger className="w-[180px]">
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="this-month">Este Mês</select_1.SelectItem>
              <select_1.SelectItem value="last-month">Mês Anterior</select_1.SelectItem>
              <select_1.SelectItem value="this-year">Este Ano</select_1.SelectItem>
              <select_1.SelectItem value="custom">Período Personalizado</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Download className="w-4 h-4 mr-2"/>
            Exportar
          </button_1.Button>
          <button_1.Button className="bg-neon-500 hover:bg-neon-600">
            <lucide_react_1.FileText className="w-4 h-4 mr-2"/>
            Novo Relatório
          </button_1.Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card className="border-l-4 border-l-green-500">
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Receita Total</card_1.CardTitle>
            <lucide_react_1.DollarSign className="h-4 w-4 text-green-500"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              <lucide_react_1.TrendingUp className="w-3 h-3 mr-1 text-green-500"/>
              +12.5% em relação ao mês anterior
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="border-l-4 border-l-blue-500">
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Lucro Líquido</card_1.CardTitle>
            <lucide_react_1.TrendingUp className="h-4 w-4 text-blue-500"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margem: {stats.profitMargin}%
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="border-l-4 border-l-yellow-500">
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Pagamentos Pendentes</card_1.CardTitle>
            <lucide_react_1.Clock className="h-4 w-4 text-yellow-500"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(stats.pendingPayments)}
            </div>
            <p className="text-xs text-muted-foreground">
              12 faturas pendentes
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="border-l-4 border-l-red-500">
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Pagamentos Vencidos</card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-500"/>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.overduePayments)}
            </div>
            <p className="text-xs text-muted-foreground">
              3 faturas vencidas
            </p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Distribution */}
        <card_1.Card className="lg:col-span-1">
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center">
              <lucide_react_1.PieChart className="w-5 h-5 mr-2 text-neon-500"/>
              Distribuição de Receita
            </card_1.CardTitle>
            <card_1.CardDescription>
              Breakdown por tipo de serviço
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Consultas</span>
                <span className="font-medium">{formatCurrency(stats.consultationRevenue)}</span>
              </div>
              <progress_1.Progress value={80} className="h-2"/>
              <p className="text-xs text-muted-foreground mt-1">80% da receita total</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Procedimentos</span>
                <span className="font-medium">{formatCurrency(stats.procedureRevenue)}</span>
              </div>
              <progress_1.Progress value={20} className="h-2"/>
              <p className="text-xs text-muted-foreground mt-1">20% da receita total</p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm mb-2">
                <span>Convênios</span>
                <span className="font-medium">{formatCurrency(stats.insurancePayments)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Particular</span>
                <span className="font-medium">{formatCurrency(stats.privatePayments)}</span>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Monthly Trend */}
        <card_1.Card className="lg:col-span-2">
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center">
              <lucide_react_1.BarChart3 className="w-5 h-5 mr-2 text-neon-500"/>
              Evolução Mensal
            </card_1.CardTitle>
            <card_1.CardDescription>
              Receita vs Despesas dos últimos 5 meses
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="h-[300px]">
              {/* Placeholder for chart */}
              <div className="w-full h-full bg-gradient-to-br from-neon-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-neon-200">
                <div className="text-center">
                  <lucide_react_1.BarChart3 className="w-16 h-16 mx-auto mb-4 text-neon-500"/>
                  <p className="text-lg font-medium text-neon-700">Gráfico de Receita vs Despesas</p>
                  <div className="mt-4 space-y-2">
                    {monthlyData.map(function (data, index) { return (<div key={index} className="flex justify-between text-sm">
                        <span>{data.month}</span>
                        <span className="text-green-600">{formatCurrency(data.revenue)}</span>
                        <span className="text-red-600">{formatCurrency(data.expenses)}</span>
                        <span className="text-blue-600 font-medium">{formatCurrency(data.profit)}</span>
                      </div>); })}
                  </div>
                </div>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Transactions */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <card_1.CardTitle className="flex items-center">
                <lucide_react_1.Receipt className="w-5 h-5 mr-2 text-neon-500"/>
                Transações Recentes
              </card_1.CardTitle>
              <card_1.CardDescription>
                Histórico de receitas e despesas
              </card_1.CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                <input_1.Input placeholder="Buscar transação..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10 w-[200px]"/>
              </div>
              
              <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
                <select_1.SelectTrigger className="w-[130px]">
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="pago">Pago</select_1.SelectItem>
                  <select_1.SelectItem value="pendente">Pendente</select_1.SelectItem>
                  <select_1.SelectItem value="vencido">Vencido</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
              
              <select_1.Select value={typeFilter} onValueChange={setTypeFilter}>
                <select_1.SelectTrigger className="w-[130px]">
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="receita">Receita</select_1.SelectItem>
                  <select_1.SelectItem value="despesa">Despesa</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="overflow-x-auto">
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow>
                  <table_1.TableHead>Data</table_1.TableHead>
                  <table_1.TableHead>Paciente/Fornecedor</table_1.TableHead>
                  <table_1.TableHead>Descrição</table_1.TableHead>
                  <table_1.TableHead>Tipo</table_1.TableHead>
                  <table_1.TableHead>Método</table_1.TableHead>
                  <table_1.TableHead>Valor</table_1.TableHead>
                  <table_1.TableHead>Status</table_1.TableHead>
                  <table_1.TableHead>Ações</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {filteredTransactions.map(function (transaction) { return (<table_1.TableRow key={transaction.id} className="hover:bg-muted/50">
                    <table_1.TableCell>
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </table_1.TableCell>
                    <table_1.TableCell className="font-medium">
                      {transaction.patientName}
                    </table_1.TableCell>
                    <table_1.TableCell>{transaction.description}</table_1.TableCell>
                    <table_1.TableCell>
                      <badge_1.Badge variant="outline" className={transaction.type === "receita"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"}>
                        {transaction.type === "receita" ? (<lucide_react_1.ArrowUpRight className="w-3 h-3 mr-1"/>) : (<lucide_react_1.ArrowDownRight className="w-3 h-3 mr-1"/>)}
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </badge_1.Badge>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="flex items-center">
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                        <span className="ml-2 capitalize">
                          {transaction.paymentMethod.replace('-', ' ')}
                        </span>
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <span className={transaction.type === "receita"
                ? "font-medium text-green-600"
                : "font-medium text-red-600"}>
                        {transaction.type === "receita" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <badge_1.Badge variant="outline" className={getStatusColor(transaction.status)}>
                        {transaction.status === "pago" && <lucide_react_1.CheckCircle className="w-3 h-3 mr-1"/>}
                        {transaction.status === "pendente" && <lucide_react_1.Clock className="w-3 h-3 mr-1"/>}
                        {transaction.status === "vencido" && <lucide_react_1.AlertTriangle className="w-3 h-3 mr-1"/>}
                        {transaction.status === "cancelado" && <lucide_react_1.XCircle className="w-3 h-3 mr-1"/>}
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </badge_1.Badge>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="flex items-center space-x-2">
                        <button_1.Button variant="ghost" size="sm" className="text-neon-600 hover:bg-neon-50">
                          <lucide_react_1.FileText className="w-4 h-4"/>
                        </button_1.Button>
                        <button_1.Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                          <lucide_react_1.Download className="w-4 h-4"/>
                        </button_1.Button>
                      </div>
                    </table_1.TableCell>
                  </table_1.TableRow>); })}
              </table_1.TableBody>
            </table_1.Table>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </main>);
}
