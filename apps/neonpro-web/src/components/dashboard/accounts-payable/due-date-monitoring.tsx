"use client";

import type { format, isToday, isTomorrow, isYesterday } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  AlertTriangle,
  Bell,
  Calendar,
  Clock,
  Eye,
  Filter,
  Mail,
  Search,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Input } from "@/components/ui/input";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data - substituir por dados reais do Supabase
const mockPaymentReminders = [
  {
    id: "1",
    vendor: {
      id: "1",
      name: "Fornecedor Alpha",
      document: "12.345.678/0001-90",
    },
    description: "Equipamentos médicos",
    amount: 15000,
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Amanhã
    status: "pending",
    priority: "high" as const,
    alert_type: "due_soon" as const,
    days_until_due: 1,
    days_overdue: 0,
  },
  {
    id: "2",
    vendor: {
      id: "2",
      name: "Fornecedor Beta",
      document: "98.765.432/0001-10",
    },
    description: "Material de consumo",
    amount: 8500,
    due_date: new Date().toISOString(), // Hoje
    status: "approved",
    priority: "high" as const,
    alert_type: "due_today" as const,
    days_until_due: 0,
    days_overdue: 0,
  },
  {
    id: "3",
    vendor: {
      id: "3",
      name: "Fornecedor Gamma",
      document: "11.222.333/0001-44",
    },
    description: "Serviços de limpeza",
    amount: 3200,
    due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
    status: "pending",
    priority: "urgent" as const,
    alert_type: "overdue" as const,
    days_until_due: 0,
    days_overdue: 3,
  },
  {
    id: "4",
    vendor: {
      id: "4",
      name: "Fornecedor Delta",
      document: "55.666.777/0001-88",
    },
    description: "Software médico",
    amount: 25000,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 semana
    status: "pending",
    priority: "medium" as const,
    alert_type: "due_soon" as const,
    days_until_due: 7,
    days_overdue: 0,
  },
  {
    id: "5",
    vendor: {
      id: "5",
      name: "Fornecedor Epsilon",
      document: "99.888.777/0001-66",
    },
    description: "Manutenção de equipamentos",
    amount: 12000,
    due_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dias atrás
    status: "pending",
    priority: "urgent" as const,
    alert_type: "overdue" as const,
    days_until_due: 0,
    days_overdue: 10,
  },
];

interface PaymentReminder {
  id: string;
  vendor: {
    id: string;
    name: string;
    document: string;
  };
  description: string;
  amount: number;
  due_date: string;
  status: string;
  priority: "low" | "medium" | "high" | "urgent";
  alert_type: "due_soon" | "due_today" | "overdue";
  days_until_due: number;
  days_overdue: number;
}

interface DueDateMonitoringProps {
  clinicId: string;
}

export function DueDateMonitoring({ clinicId }: DueDateMonitoringProps) {
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<PaymentReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadReminders();
  }, [clinicId]);

  useEffect(() => {
    applyFilters();
  }, [reminders, filterType, filterPriority, searchTerm]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      // TODO: Implementar chamada real para o serviço
      // const data = await notificationService.getDuePayments(clinicId, 30)

      // Usando dados mock por enquanto
      setTimeout(() => {
        setReminders(mockPaymentReminders);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error loading reminders:", error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = reminders;

    // Filtro por tipo de alerta
    if (filterType !== "all") {
      filtered = filtered.filter((reminder) => reminder.alert_type === filterType);
    }

    // Filtro por prioridade
    if (filterPriority !== "all") {
      filtered = filtered.filter((reminder) => reminder.priority === filterPriority);
    }

    // Filtro por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (reminder) =>
          reminder.vendor.name.toLowerCase().includes(term) ||
          reminder.description.toLowerCase().includes(term) ||
          reminder.vendor.document.includes(term),
      );
    }

    setFilteredReminders(filtered);
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

  const getAlertTypeBadgeColor = (alertType: string) => {
    switch (alertType) {
      case "overdue":
        return "destructive";
      case "due_today":
        return "destructive";
      case "due_soon":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getAlertTypeLabel = (alertType: string) => {
    switch (alertType) {
      case "overdue":
        return "Em atraso";
      case "due_today":
        return "Vence hoje";
      case "due_soon":
        return "Vence em breve";
      default:
        return "Desconhecido";
    }
  };

  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);

    if (isToday(date)) {
      return "Hoje";
    } else if (isTomorrow(date)) {
      return "Amanhã";
    } else if (isYesterday(date)) {
      return "Ontem";
    } else {
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const getDaysDisplay = (reminder: PaymentReminder) => {
    if (reminder.days_overdue > 0) {
      return `${reminder.days_overdue} dias em atraso`;
    } else if (reminder.days_until_due === 0) {
      return "Vence hoje";
    } else if (reminder.days_until_due === 1) {
      return "Vence amanhã";
    } else {
      return `Vence em ${reminder.days_until_due} dias`;
    }
  };

  // Estatísticas resumidas
  const stats = {
    total: reminders.length,
    overdue: reminders.filter((r) => r.alert_type === "overdue").length,
    dueToday: reminders.filter((r) => r.alert_type === "due_today").length,
    dueSoon: reminders.filter((r) => r.alert_type === "due_soon").length,
    totalAmount: reminders.reduce((sum, r) => sum + r.amount, 0),
    urgentAmount: reminders
      .filter((r) => r.priority === "urgent")
      .reduce((sum, r) => sum + r.amount, 0),
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="animate-pulse p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-300 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.urgentAmount)} urgente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vence Hoje</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.dueToday}</div>
            <p className="text-xs text-muted-foreground">Atenção imediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.dueSoon}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.totalAmount)} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Monitoramento de Vencimentos
          </CardTitle>
          <CardDescription>Acompanhe contas próximas do vencimento e em atraso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por fornecedor, descrição ou documento..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo de alerta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="overdue">Em atraso</SelectItem>
                <SelectItem value="due_today">Vence hoje</SelectItem>
                <SelectItem value="due_soon">Vence em breve</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[150px]">
                <TrendingUp className="h-4 w-4 mr-2" />
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

          {/* Tabela de Lembretes */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReminders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {reminders.length === 0
                            ? "Nenhum pagamento próximo do vencimento"
                            : "Nenhum resultado encontrado para os filtros aplicados"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReminders.map((reminder) => (
                    <TableRow key={reminder.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reminder.vendor.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {reminder.vendor.document}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">{reminder.description}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(reminder.amount)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDateDisplay(reminder.due_date)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {reminder.status === "pending"
                            ? "Pendente"
                            : reminder.status === "approved"
                              ? "Aprovado"
                              : "Pago"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityBadgeColor(reminder.priority)}>
                          {reminder.priority === "urgent"
                            ? "Urgente"
                            : reminder.priority === "high"
                              ? "Alta"
                              : reminder.priority === "medium"
                                ? "Média"
                                : "Baixa"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant={getAlertTypeBadgeColor(reminder.alert_type)}>
                            {getAlertTypeLabel(reminder.alert_type)}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {getDaysDisplay(reminder)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Zap className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
