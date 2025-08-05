"use client";
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
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
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
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
      return (v) => step([n, v]);
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
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentCalendar = PaymentCalendar;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
// Mock data - substituir por dados reais do Supabase
var mockPaymentCalendar = [
  {
    id: "1",
    vendor_name: "Fornecedor Alpha",
    description: "Equipamentos médicos",
    amount: 15000,
    due_date: new Date(2025, 6, 22).toISOString(), // 22 de julho
    status: "pending",
    priority: "high",
    recurring: false,
  },
  {
    id: "2",
    vendor_name: "Fornecedor Beta",
    description: "Material de consumo",
    amount: 8500,
    due_date: new Date(2025, 6, 21).toISOString(), // Hoje (21 de julho)
    status: "approved",
    priority: "high",
    recurring: false,
  },
  {
    id: "3",
    vendor_name: "Fornecedor Gamma",
    description: "Serviços de limpeza",
    amount: 3200,
    due_date: new Date(2025, 6, 18).toISOString(), // 18 de julho (passou)
    status: "pending",
    priority: "urgent",
    recurring: true,
  },
  {
    id: "4",
    vendor_name: "Fornecedor Delta",
    description: "Software médico",
    amount: 25000,
    due_date: new Date(2025, 6, 28).toISOString(), // 28 de julho
    status: "pending",
    priority: "medium",
    recurring: false,
  },
  {
    id: "5",
    vendor_name: "Fornecedor Epsilon",
    description: "Manutenção",
    amount: 12000,
    due_date: new Date(2025, 6, 11).toISOString(), // 11 de julho (passou)
    status: "pending",
    priority: "urgent",
    recurring: false,
  },
  {
    id: "6",
    vendor_name: "Fornecedor Zeta",
    description: "Aluguel",
    amount: 5000,
    due_date: new Date(2025, 6, 30).toISOString(), // 30 de julho
    status: "approved",
    priority: "medium",
    recurring: true,
  },
  {
    id: "7",
    vendor_name: "Fornecedor Theta",
    description: "Internet",
    amount: 800,
    due_date: new Date(2025, 6, 25).toISOString(), // 25 de julho
    status: "paid",
    priority: "low",
    recurring: true,
  },
];
function PaymentCalendar(_a) {
  var clinicId = _a.clinicId;
  var _b = (0, react_1.useState)([]),
    payments = _b[0],
    setPayments = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)(null),
    currentDate = _d[0],
    setCurrentDate = _d[1];
  var _e = (0, react_1.useState)(null),
    selectedDate = _e[0],
    setSelectedDate = _e[1];
  // Initialize currentDate on client side only
  (0, react_1.useEffect)(() => {
    setCurrentDate(new Date());
  }, []);
  var _f = (0, react_1.useState)("all"),
    statusFilter = _f[0],
    setStatusFilter = _f[1];
  var _g = (0, react_1.useState)("all"),
    priorityFilter = _g[0],
    setPriorityFilter = _g[1];
  (0, react_1.useEffect)(() => {
    loadPayments();
  }, [clinicId, currentDate]);
  var loadPayments = () =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          setLoading(true);
          // TODO: Implementar chamada real para o serviço
          // const data = await paymentService.getPaymentsByMonth(clinicId, currentDate)
          // Usando dados mock por enquanto
          setTimeout(() => {
            setPayments(mockPaymentCalendar);
            setLoading(false);
          }, 300);
        } catch (error) {
          console.error("Error loading payments:", error);
          setLoading(false);
        }
        return [2 /*return*/];
      });
    });
  // Filtros aplicados
  var filteredPayments = (0, react_1.useMemo)(() => {
    var filtered = payments;
    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }
    if (priorityFilter !== "all") {
      filtered = filtered.filter((payment) => payment.priority === priorityFilter);
    }
    return filtered;
  }, [payments, statusFilter, priorityFilter]);
  // Organizar pagamentos por data
  var paymentsByDate = (0, react_1.useMemo)(() => {
    var grouped = {};
    filteredPayments.forEach((payment) => {
      var dateKey = (0, date_fns_1.format)(new Date(payment.due_date), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(payment);
    });
    return grouped;
  }, [filteredPayments]);
  // Dias do mês atual
  var monthStart = currentDate ? (0, date_fns_1.startOfMonth)(currentDate) : null;
  var monthEnd = currentDate ? (0, date_fns_1.endOfMonth)(currentDate) : null;
  var calendarDays =
    monthStart && monthEnd
      ? (0, date_fns_1.eachDayOfInterval)({ start: monthStart, end: monthEnd })
      : [];
  var navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      if (!prev) return new Date();
      return direction === "prev"
        ? (0, date_fns_1.subMonths)(prev, 1)
        : (0, date_fns_1.addMonths)(prev, 1);
    });
    setSelectedDate(null);
  };
  var getDayPayments = (date) => {
    var dateKey = (0, date_fns_1.format)(date, "yyyy-MM-dd");
    return paymentsByDate[dateKey] || [];
  };
  var getDayStatus = (date) => {
    var dayPayments = getDayPayments(date);
    if (dayPayments.length === 0) return "empty";
    var hasOverdue = dayPayments.some((p) => {
      var paymentDate = new Date(p.due_date);
      return paymentDate < new Date() && p.status !== "paid";
    });
    if (hasOverdue) return "overdue";
    var hasUrgent = dayPayments.some((p) => p.priority === "urgent");
    if (hasUrgent) return "urgent";
    var hasHigh = dayPayments.some((p) => p.priority === "high");
    if (hasHigh) return "high";
    return "normal";
  };
  var getDayBadgeColor = (status) => {
    switch (status) {
      case "overdue":
        return "bg-red-500";
      case "urgent":
        return "bg-orange-500";
      case "high":
        return "bg-yellow-500";
      case "normal":
        return "bg-blue-500";
      default:
        return "bg-gray-200";
    }
  };
  var formatCurrency = (amount) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  var getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };
  var getStatusBadgeColor = (status) => {
    switch (status) {
      case "paid":
        return "default";
      case "approved":
        return "secondary";
      case "pending":
        return "outline";
      case "overdue":
        return "destructive";
      default:
        return "outline";
    }
  };
  var getStatusLabel = (status) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "approved":
        return "Aprovado";
      case "pending":
        return "Pendente";
      case "overdue":
        return "Em Atraso";
      default:
        return status;
    }
  };
  if (loading || !currentDate) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  var selectedDatePayments = selectedDate ? getDayPayments(selectedDate) : [];
  return (
    <div className="space-y-6">
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Calendar className="h-5 w-5" />
                Calendário de Pagamentos
              </card_1.CardTitle>
              <card_1.CardDescription>
                Visualize e acompanhe pagamentos por data de vencimento
              </card_1.CardDescription>
            </div>

            <div className="flex gap-2">
              <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
                <select_1.SelectTrigger className="w-[140px]">
                  <lucide_react_1.Filter className="h-4 w-4 mr-2" />
                  <select_1.SelectValue placeholder="Status" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="pending">Pendentes</select_1.SelectItem>
                  <select_1.SelectItem value="approved">Aprovados</select_1.SelectItem>
                  <select_1.SelectItem value="paid">Pagos</select_1.SelectItem>
                  <select_1.SelectItem value="overdue">Em Atraso</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>

              <select_1.Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <select_1.SelectTrigger className="w-[130px]">
                  <select_1.SelectValue placeholder="Prioridade" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todas</select_1.SelectItem>
                  <select_1.SelectItem value="urgent">Urgente</select_1.SelectItem>
                  <select_1.SelectItem value="high">Alta</select_1.SelectItem>
                  <select_1.SelectItem value="medium">Média</select_1.SelectItem>
                  <select_1.SelectItem value="low">Baixa</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
        </card_1.CardHeader>

        <card_1.CardContent>
          {/* Navegação do Calendário */}
          <div className="flex items-center justify-between mb-6">
            <button_1.Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <lucide_react_1.ChevronLeft className="h-4 w-4" />
            </button_1.Button>

            <h3 className="text-lg font-semibold">
              {(0, date_fns_1.format)(currentDate, "MMMM yyyy", { locale: locale_1.ptBR })}
            </h3>

            <button_1.Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <lucide_react_1.ChevronRight className="h-4 w-4" />
            </button_1.Button>
          </div>

          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grid do Calendário */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              var dayPayments = getDayPayments(day);
              var dayStatus = getDayStatus(day);
              var isSelected = selectedDate && (0, date_fns_1.isSameDay)(day, selectedDate);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={"\n                    relative min-h-[80px] p-2 rounded-lg border text-left transition-colors\n                    "
                    .concat(
                      isSelected ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted/50",
                      "\n                    ",
                    )
                    .concat(
                      !(0, date_fns_1.isSameMonth)(day, currentDate)
                        ? "text-muted-foreground bg-muted/20"
                        : "",
                      "\n                    ",
                    )
                    .concat(
                      (0, date_fns_1.isToday)(day) ? "font-bold border-primary" : "border-border",
                      "\n                    ",
                    )
                    .concat(
                      (0, date_fns_1.isWeekend)(day) ? "bg-muted/10" : "",
                      "\n                  ",
                    )}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={"text-sm ".concat(
                        (0, date_fns_1.isToday)(day) ? "text-primary" : "",
                      )}
                    >
                      {(0, date_fns_1.format)(day, "d")}
                    </span>

                    {dayPayments.length > 0 && (
                      <div className="flex gap-1">
                        <span
                          className={"w-2 h-2 rounded-full ".concat(getDayBadgeColor(dayStatus))}
                        />
                        {dayPayments.length > 1 && (
                          <span className="text-xs text-muted-foreground">
                            +{dayPayments.length - 1}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {dayPayments.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {dayPayments.slice(0, 2).map((payment) => (
                        <div
                          key={payment.id}
                          className="text-xs p-1 rounded bg-background/80 border truncate"
                        >
                          <div className="font-medium truncate">{payment.vendor_name}</div>
                          <div className="text-muted-foreground">
                            {formatCurrency(payment.amount)}
                          </div>
                        </div>
                      ))}
                      {dayPayments.length > 2 && (
                        <div className="text-xs text-center text-muted-foreground">
                          +{dayPayments.length - 2} mais
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Detalhes do Dia Selecionado */}
      {selectedDate && (
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Clock className="h-5 w-5" />
              Pagamentos para{" "}
              {(0, date_fns_1.format)(selectedDate, "dd 'de' MMMM", { locale: locale_1.ptBR })}
            </card_1.CardTitle>
            <card_1.CardDescription>
              {selectedDatePayments.length === 0
                ? "Nenhum pagamento programado para este dia"
                : "".concat(selectedDatePayments.length, " pagamento(s) programado(s)")}
            </card_1.CardDescription>
          </card_1.CardHeader>

          {selectedDatePayments.length > 0 && (
            <card_1.CardContent>
              <div className="space-y-3">
                {selectedDatePayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{payment.vendor_name}</h4>
                        {payment.recurring && (
                          <badge_1.Badge variant="outline" className="text-xs">
                            Recorrente
                          </badge_1.Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{payment.description}</p>
                      <div className="flex items-center gap-2">
                        <badge_1.Badge variant={getStatusBadgeColor(payment.status)}>
                          {getStatusLabel(payment.status)}
                        </badge_1.Badge>
                        <badge_1.Badge variant={getPriorityBadgeColor(payment.priority)}>
                          {payment.priority === "urgent"
                            ? "Urgente"
                            : payment.priority === "high"
                              ? "Alta"
                              : payment.priority === "medium"
                                ? "Média"
                                : "Baixa"}
                        </badge_1.Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                        {new Date(payment.due_date) < new Date() && payment.status !== "paid" && (
                          <div className="flex items-center gap-1 text-red-600 text-sm">
                            <lucide_react_1.AlertTriangle className="h-3 w-3" />
                            Em atraso
                          </div>
                        )}
                      </div>
                      <button_1.Button size="sm" variant="outline">
                        <lucide_react_1.Eye className="h-4 w-4" />
                      </button_1.Button>
                    </div>
                  </div>
                ))}
              </div>
            </card_1.CardContent>
          )}
        </card_1.Card>
      )}
    </div>
  );
}
