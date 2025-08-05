"use client";

import type {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  isWeekend,
  startOfMonth,
  subMonths,
} from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
} from "lucide-react";
import type { useEffect, useMemo, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data - substituir por dados reais do Supabase
const mockPaymentCalendar = [
  {
    id: "1",
    vendor_name: "Fornecedor Alpha",
    description: "Equipamentos médicos",
    amount: 15000,
    due_date: new Date(2025, 6, 22).toISOString(), // 22 de julho
    status: "pending" as const,
    priority: "high" as const,
    recurring: false,
  },
  {
    id: "2",
    vendor_name: "Fornecedor Beta",
    description: "Material de consumo",
    amount: 8500,
    due_date: new Date(2025, 6, 21).toISOString(), // Hoje (21 de julho)
    status: "approved" as const,
    priority: "high" as const,
    recurring: false,
  },
  {
    id: "3",
    vendor_name: "Fornecedor Gamma",
    description: "Serviços de limpeza",
    amount: 3200,
    due_date: new Date(2025, 6, 18).toISOString(), // 18 de julho (passou)
    status: "pending" as const,
    priority: "urgent" as const,
    recurring: true,
  },
  {
    id: "4",
    vendor_name: "Fornecedor Delta",
    description: "Software médico",
    amount: 25000,
    due_date: new Date(2025, 6, 28).toISOString(), // 28 de julho
    status: "pending" as const,
    priority: "medium" as const,
    recurring: false,
  },
  {
    id: "5",
    vendor_name: "Fornecedor Epsilon",
    description: "Manutenção",
    amount: 12000,
    due_date: new Date(2025, 6, 11).toISOString(), // 11 de julho (passou)
    status: "pending" as const,
    priority: "urgent" as const,
    recurring: false,
  },
  {
    id: "6",
    vendor_name: "Fornecedor Zeta",
    description: "Aluguel",
    amount: 5000,
    due_date: new Date(2025, 6, 30).toISOString(), // 30 de julho
    status: "approved" as const,
    priority: "medium" as const,
    recurring: true,
  },
  {
    id: "7",
    vendor_name: "Fornecedor Theta",
    description: "Internet",
    amount: 800,
    due_date: new Date(2025, 6, 25).toISOString(), // 25 de julho
    status: "paid" as const,
    priority: "low" as const,
    recurring: true,
  },
];

interface PaymentCalendarItem {
  id: string;
  vendor_name: string;
  description: string;
  amount: number;
  due_date: string;
  status: "pending" | "approved" | "paid" | "overdue";
  priority: "low" | "medium" | "high" | "urgent";
  recurring: boolean;
}

interface PaymentCalendarProps {
  clinicId: string;
}

export function PaymentCalendar({ clinicId }: PaymentCalendarProps) {
  const [payments, setPayments] = useState<PaymentCalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Initialize currentDate on client side only
  useEffect(() => {
    setCurrentDate(new Date());
  }, []);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  useEffect(() => {
    loadPayments();
  }, [clinicId, currentDate]);

  const loadPayments = async () => {
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
  };

  // Filtros aplicados
  const filteredPayments = useMemo(() => {
    let filtered = payments;

    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((payment) => payment.priority === priorityFilter);
    }

    return filtered;
  }, [payments, statusFilter, priorityFilter]);

  // Organizar pagamentos por data
  const paymentsByDate = useMemo(() => {
    const grouped: Record<string, PaymentCalendarItem[]> = {};

    filteredPayments.forEach((payment) => {
      const dateKey = format(new Date(payment.due_date), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(payment);
    });

    return grouped;
  }, [filteredPayments]);

  // Dias do mês atual
  const monthStart = currentDate ? startOfMonth(currentDate) : null;
  const monthEnd = currentDate ? endOfMonth(currentDate) : null;
  const calendarDays =
    monthStart && monthEnd ? eachDayOfInterval({ start: monthStart, end: monthEnd }) : [];

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      if (!prev) return new Date();
      return direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1);
    });
    setSelectedDate(null);
  };

  const getDayPayments = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return paymentsByDate[dateKey] || [];
  };

  const getDayStatus = (date: Date) => {
    const dayPayments = getDayPayments(date);

    if (dayPayments.length === 0) return "empty";

    const hasOverdue = dayPayments.some((p) => {
      const paymentDate = new Date(p.due_date);
      return paymentDate < new Date() && p.status !== "paid";
    });

    if (hasOverdue) return "overdue";

    const hasUrgent = dayPayments.some((p) => p.priority === "urgent");
    if (hasUrgent) return "urgent";

    const hasHigh = dayPayments.some((p) => p.priority === "high");
    if (hasHigh) return "high";

    return "normal";
  };

  const getDayBadgeColor = (status: string) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const getPriorityBadgeColor = (priority: string) => {
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

  const getStatusBadgeColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
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

  const selectedDatePayments = selectedDate ? getDayPayments(selectedDate) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendário de Pagamentos
              </CardTitle>
              <CardDescription>
                Visualize e acompanhe pagamentos por data de vencimento
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="approved">Aprovados</SelectItem>
                  <SelectItem value="paid">Pagos</SelectItem>
                  <SelectItem value="overdue">Em Atraso</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Navegação do Calendário */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <h3 className="text-lg font-semibold">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </h3>

            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
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
              const dayPayments = getDayPayments(day);
              const dayStatus = getDayStatus(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative min-h-[80px] p-2 rounded-lg border text-left transition-colors
                    ${isSelected ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted/50"}
                    ${!isSameMonth(day, currentDate) ? "text-muted-foreground bg-muted/20" : ""}
                    ${isToday(day) ? "font-bold border-primary" : "border-border"}
                    ${isWeekend(day) ? "bg-muted/10" : ""}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-sm ${isToday(day) ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </span>

                    {dayPayments.length > 0 && (
                      <div className="flex gap-1">
                        <span className={`w-2 h-2 rounded-full ${getDayBadgeColor(dayStatus)}`} />
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
        </CardContent>
      </Card>

      {/* Detalhes do Dia Selecionado */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pagamentos para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </CardTitle>
            <CardDescription>
              {selectedDatePayments.length === 0
                ? "Nenhum pagamento programado para este dia"
                : `${selectedDatePayments.length} pagamento(s) programado(s)`}
            </CardDescription>
          </CardHeader>

          {selectedDatePayments.length > 0 && (
            <CardContent>
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
                          <Badge variant="outline" className="text-xs">
                            Recorrente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{payment.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeColor(payment.status)}>
                          {getStatusLabel(payment.status)}
                        </Badge>
                        <Badge variant={getPriorityBadgeColor(payment.priority)}>
                          {payment.priority === "urgent"
                            ? "Urgente"
                            : payment.priority === "high"
                              ? "Alta"
                              : payment.priority === "medium"
                                ? "Média"
                                : "Baixa"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                        {new Date(payment.due_date) < new Date() && payment.status !== "paid" && (
                          <div className="flex items-center gap-1 text-red-600 text-sm">
                            <AlertTriangle className="h-3 w-3" />
                            Em atraso
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
