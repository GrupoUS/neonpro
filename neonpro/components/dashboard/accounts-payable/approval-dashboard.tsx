"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Loader2,
  Search,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ApprovalHierarchyConfig from "./approval-hierarchy-config";
import ApprovalRequestTracker from "./approval-request-tracker";

export interface ApprovalDashboardStats {
  pending: number;
  approved: number;
  rejected: number;
  escalated: number;
  overdue: number;
  myPending: number;
  avgApprovalTime: number;
  totalAmount: number;
}

export interface ApprovalRequestSummary {
  id: string;
  accounts_payable_id: string;
  requester_name: string;
  request_date: string;
  amount: number;
  current_level: number;
  status: "pending" | "approved" | "rejected" | "escalated" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  due_date: string;
  vendor_name?: string;
  invoice_number?: string;
  category?: string;
  level_name?: string;
  time_remaining_hours?: number;
}

interface ApprovalDashboardProps {
  onRequestApproval?: (payableId: string) => void;
}

const statusConfig = {
  pending: {
    label: "Pendente",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  approved: {
    label: "Aprovado",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejeitado",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  escalated: {
    label: "Escalado",
    color: "bg-orange-100 text-orange-800",
    icon: AlertTriangle,
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-gray-100 text-gray-800",
    icon: XCircle,
  },
};

const priorityConfig = {
  low: { label: "Baixa", color: "bg-blue-100 text-blue-800" },
  normal: { label: "Normal", color: "bg-gray-100 text-gray-800" },
  high: { label: "Alta", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Urgente", color: "bg-red-100 text-red-800" },
};

export default function ApprovalDashboard({
  onRequestApproval,
}: ApprovalDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ApprovalDashboardStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    escalated: 0,
    overdue: 0,
    myPending: 0,
    avgApprovalTime: 0,
    totalAmount: 0,
  });

  const [pendingApprovals, setPendingApprovals] = useState<
    ApprovalRequestSummary[]
  >([]);
  const [myRequests, setMyRequests] = useState<ApprovalRequestSummary[]>([]);
  const [allRequests, setAllRequests] = useState<ApprovalRequestSummary[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Modals
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [showRequestTracker, setShowRequestTracker] = useState(false);
  const [showHierarchyConfig, setShowHierarchyConfig] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data - In real implementation, this would come from approval service
      const mockStats: ApprovalDashboardStats = {
        pending: 15,
        approved: 42,
        rejected: 3,
        escalated: 2,
        overdue: 5,
        myPending: 8,
        avgApprovalTime: 18.5,
        totalAmount: 125000,
      };

      const mockPendingApprovals: ApprovalRequestSummary[] = [
        {
          id: "req_001",
          accounts_payable_id: "ap_001",
          requester_name: "Ana Silva",
          request_date: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          amount: 15000,
          current_level: 2,
          status: "pending",
          priority: "high",
          due_date: new Date(
            Date.now() + 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          vendor_name: "MedEquip Ltda",
          invoice_number: "INV-2024-001",
          category: "Equipamentos",
          level_name: "Gerente Departamental",
          time_remaining_hours: 24,
        },
        {
          id: "req_002",
          accounts_payable_id: "ap_002",
          requester_name: "Carlos Santos",
          request_date: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          amount: 3500,
          current_level: 1,
          status: "pending",
          priority: "normal",
          due_date: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          vendor_name: "Office Solutions",
          invoice_number: "INV-2024-002",
          category: "Material de Escritório",
          level_name: "Supervisor Direto",
          time_remaining_hours: 48,
        },
        {
          id: "req_003",
          accounts_payable_id: "ap_003",
          requester_name: "Marina Costa",
          request_date: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          amount: 25000,
          current_level: 3,
          status: "pending",
          priority: "urgent",
          due_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Overdue
          vendor_name: "TechCorp Brasil",
          invoice_number: "INV-2024-003",
          category: "Software",
          level_name: "Diretor Financeiro",
          time_remaining_hours: -2, // Overdue by 2 hours
        },
      ];

      const mockMyRequests: ApprovalRequestSummary[] = [
        {
          id: "req_004",
          accounts_payable_id: "ap_004",
          requester_name: "Eu mesmo",
          request_date: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          amount: 5000,
          current_level: 2,
          status: "pending",
          priority: "normal",
          due_date: new Date(
            Date.now() + 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          vendor_name: "Supplies Inc",
          invoice_number: "INV-2024-004",
          category: "Suprimentos",
          level_name: "Gerente Departamental",
          time_remaining_hours: 24,
        },
      ];

      const mockAllRequests = [
        ...mockPendingApprovals,
        ...mockMyRequests,
        {
          id: "req_005",
          accounts_payable_id: "ap_005",
          requester_name: "João Oliveira",
          request_date: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
          ).toISOString(),
          amount: 8000,
          current_level: 3,
          status: "approved" as const,
          priority: "normal" as const,
          due_date: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          vendor_name: "Service Pro",
          invoice_number: "INV-2024-005",
          category: "Serviços",
          level_name: "Diretor Financeiro",
        },
      ];

      setStats(mockStats);
      setPendingApprovals(mockPendingApprovals);
      setMyRequests(mockMyRequests);
      setAllRequests(mockAllRequests);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const deadline = new Date(dueDate);
    const diff = deadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 0) {
      return { text: `${Math.abs(hours)}h atrasado`, isOverdue: true };
    } else if (hours < 24) {
      return { text: `${hours}h restantes`, isOverdue: false };
    } else {
      const days = Math.floor(hours / 24);
      return { text: `${days}d ${hours % 24}h restantes`, isOverdue: false };
    }
  };

  const handleViewRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShowRequestTracker(true);
  };

  const filterRequests = (requests: ApprovalRequestSummary[]) => {
    return requests.filter((request) => {
      const matchesSearch =
        searchTerm === "" ||
        request.requester_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        request.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.invoice_number
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || request.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  const StatsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">
                {stats.approved}
              </p>
              <p className="text-xs text-muted-foreground">Aprovadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </p>
              <p className="text-xs text-muted-foreground">Rejeitadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {stats.escalated}
              </p>
              <p className="text-xs text-muted-foreground">Escaladas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              <p className="text-xs text-muted-foreground">Atrasadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {stats.myPending}
              </p>
              <p className="text-xs text-muted-foreground">Minhas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {stats.avgApprovalTime}h
              </p>
              <p className="text-xs text-muted-foreground">Tempo Médio</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(stats.totalAmount)
                  .replace("R$", "R$")
                  .slice(0, 6)}
                k
              </p>
              <p className="text-xs text-muted-foreground">Volume</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const RequestTable = ({
    requests,
    title,
  }: {
    requests: ApprovalRequestSummary[];
    title: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-48 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-28 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-28 h-9">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Solicitação</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Nível Atual</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filterRequests(requests).map((request) => {
              const StatusIcon = statusConfig[request.status].icon;
              const timeInfo = getTimeRemaining(request.due_date);

              return (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.vendor_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.invoice_number} • {request.requester_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          className={cn(
                            "text-xs",
                            priorityConfig[request.priority].color
                          )}
                        >
                          {priorityConfig[request.priority].label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {request.category}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {formatCurrency(request.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(request.request_date), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {request.current_level}
                      </div>
                      <span className="text-sm">{request.level_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">
                        {format(
                          new Date(request.due_date),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR }
                        )}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          timeInfo.isOverdue
                            ? "text-red-600"
                            : "text-muted-foreground"
                        )}
                      >
                        {timeInfo.text}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "text-xs",
                        statusConfig[request.status].color
                      )}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig[request.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewRequest(request.id)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filterRequests(requests).length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhuma solicitação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Aprovações</h2>
          <p className="text-muted-foreground">
            Gerencie solicitações de aprovação de contas a pagar
          </p>
        </div>
        <Button onClick={() => setShowHierarchyConfig(true)} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Configurar Hierarquia
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pendentes para Mim ({stats.myPending})
          </TabsTrigger>
          <TabsTrigger value="my-requests">
            Minhas Solicitações ({myRequests.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Todas as Solicitações ({allRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <RequestTable
            requests={pendingApprovals}
            title="Aprovações Pendentes"
          />
        </TabsContent>

        <TabsContent value="my-requests">
          <RequestTable
            requests={myRequests}
            title="Minhas Solicitações de Aprovação"
          />
        </TabsContent>

        <TabsContent value="all">
          <RequestTable requests={allRequests} title="Todas as Solicitações" />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ApprovalRequestTracker
        requestId={selectedRequestId}
        open={showRequestTracker}
        onOpenChange={setShowRequestTracker}
      />

      <ApprovalHierarchyConfig
        open={showHierarchyConfig}
        onOpenChange={setShowHierarchyConfig}
        onSave={() => {
          toast.success("Hierarquia de aprovação atualizada");
          loadDashboardData(); // Reload data
        }}
      />
    </div>
  );
}
