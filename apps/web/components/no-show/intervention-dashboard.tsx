"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Phone,
  RefreshCw,
  Search,
  Send,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";
import React from "react";

export interface InterventionAction {
  id: string;
  type: "reminder" | "confirmation" | "call" | "reschedule" | "cancel";
  priority: "low" | "medium" | "high" | "critical";
  patientId: string;
  patientName: string;
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string;
  riskScore: number;
  dueDate: string;
  status: "pending" | "scheduled" | "completed" | "failed" | "cancelled";
  assignedTo?: string;
  description: string;
  automated: boolean;
  attempts?: number;
  lastAttempt?: string;
  notes?: string;
  estimatedMinutes: number;
  tags: string[];
}

export interface InterventionDashboardProps {
  actions: InterventionAction[];
  onActionApprove: (actionId: string, notes?: string) => void;
  onActionReject: (actionId: string, reason: string) => void;
  onActionComplete: (actionId: string, result: "success" | "failed", notes?: string) => void;
  onBulkApprove: (actionIds: string[]) => void;
  onCreateAction: (action: Omit<InterventionAction, "id">) => void;
  className?: string;
  currentUserId?: string;
}

const actionTypeConfig = {
  reminder: {
    label: "Lembrete",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Mail,
  },
  confirmation: {
    label: "Confirmação",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
  },
  call: {
    label: "Ligação",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Phone,
  },
  reschedule: {
    label: "Reagendar",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Calendar,
  },
  cancel: {
    label: "Cancelar",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: X,
  },
};

const priorityConfig = {
  low: { label: "Baixa", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Média", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "Alta", color: "bg-orange-100 text-orange-800" },
  critical: { label: "Crítica", color: "bg-red-100 text-red-800" },
};

const statusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  scheduled: { label: "Agendado", color: "bg-blue-100 text-blue-800", icon: Calendar },
  completed: { label: "Concluído", color: "bg-green-100 text-green-800", icon: Check },
  failed: { label: "Falhou", color: "bg-red-100 text-red-800", icon: AlertCircle },
  cancelled: { label: "Cancelado", color: "bg-gray-100 text-gray-800", icon: X },
};

export function InterventionDashboard({
  actions,
  onActionApprove,
  onActionReject,
  onActionComplete,
  onBulkApprove,
  onCreateAction,
  className,
  currentUserId,
}: InterventionDashboardProps) {
  const [selectedActions, setSelectedActions] = React.useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [filterPriority, setFilterPriority] = React.useState<string>("all");
  const [filterType, setFilterType] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  // Filtrar ações
  const filteredActions = React.useMemo(() => {
    return actions.filter((action) => {
      const matchesStatus = filterStatus === "all" || action.status === filterStatus;
      const matchesPriority = filterPriority === "all" || action.priority === filterPriority;
      const matchesType = filterType === "all" || action.type === filterType;
      const matchesSearch = !searchQuery
        || action.patientName.toLowerCase().includes(searchQuery.toLowerCase())
        || action.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesPriority && matchesType && matchesSearch;
    });
  }, [actions, filterStatus, filterPriority, filterType, searchQuery]);

  // Estatísticas
  const stats = React.useMemo(() => {
    const pending = actions.filter(a => a.status === "pending").length;
    const critical = actions.filter(a => a.priority === "critical").length;
    const automated = actions.filter(a => a.automated).length;
    const overdue = actions.filter(a =>
      a.status === "pending" && new Date(a.dueDate) < new Date()
    ).length;

    return { pending, critical, automated, overdue };
  }, [actions]);

  const handleSelectAction = (actionId: string, checked: boolean) => {
    const newSelected = new Set(selectedActions);
    if (checked) {
      newSelected.add(actionId);
    } else {
      newSelected.delete(actionId);
    }
    setSelectedActions(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedActions(new Set(filteredActions.map(a => a.id)));
    } else {
      setSelectedActions(new Set());
    }
  };

  const handleBulkApprove = () => {
    onBulkApprove(Array.from(selectedActions));
    setSelectedActions(new Set());
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{stats.critical}</div>
                <div className="text-sm text-muted-foreground">Críticas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.automated}</div>
                <div className="text-sm text-muted-foreground">Automatizadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <X className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{stats.overdue}</div>
                <div className="text-sm text-muted-foreground">Atrasadas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-xl font-semibold">
              Fila de Intervenções
            </CardTitle>

            {/* Ações em massa */}
            {selectedActions.size > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {selectedActions.size} selecionada{selectedActions.size !== 1 ? "s" : ""}
                </Badge>
                <Button
                  size="sm"
                  onClick={handleBulkApprove}
                  className="text-xs"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Aprovar Todas
                </Button>
              </div>
            )}
          </div>

          {/* Filtros e busca */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar paciente ou ação..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="scheduled">Agendados</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="reminder">Lembrete</SelectItem>
                  <SelectItem value="confirmation">Confirmação</SelectItem>
                  <SelectItem value="call">Ligação</SelectItem>
                  <SelectItem value="reschedule">Reagendar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Header da tabela com seleção */}
          <div className="px-4 py-3 border-b bg-muted/50">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={filteredActions.length > 0
                  && selectedActions.size === filteredActions.length}
                onCheckedChange={handleSelectAll}
              />
              <div className="text-sm font-medium">
                Selecionar todas ({filteredActions.length})
              </div>
            </div>
          </div>

          {/* Lista de ações */}
          <div className="divide-y">
            {filteredActions.map((action) => {
              const actionType = actionTypeConfig[action.type];
              const priority = priorityConfig[action.priority];
              const status = statusConfig[action.status];
              const ActionIcon = actionType.icon;
              const StatusIcon = status.icon;
              const isOverdue = action.status === "pending"
                && new Date(action.dueDate) < new Date();

              return (
                <div
                  key={action.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors",
                    isOverdue && "bg-red-50 border-l-4 border-red-400",
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <Checkbox
                      checked={selectedActions.has(action.id)}
                      onCheckedChange={(checked) => handleSelectAction(action.id, !!checked)}
                      className="mt-1"
                    />

                    {/* Conteúdo principal */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ActionIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{action.patientName}</span>
                            {action.automated && (
                              <Badge variant="outline" className="text-xs px-2 py-0.5">
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Auto
                              </Badge>
                            )}
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {action.description}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Consulta: {action.appointmentDate} às {action.appointmentTime}
                            {action.attempts && action.attempts > 0 && (
                              <span className="ml-2">
                                • {action.attempts} tentativa{action.attempts !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right space-y-2 shrink-0">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn("text-xs", priority.color)}
                            >
                              {priority.label}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn("text-xs", actionType.color)}
                            >
                              {actionType.label}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-3 w-3" />
                            <Badge
                              variant="outline"
                              className={cn("text-xs", status.color)}
                            >
                              {status.label}
                            </Badge>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Risco: {action.riskScore}%
                          </div>

                          {isOverdue && (
                            <div className="text-xs text-red-600 font-medium">
                              Atrasada
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ações */}
                      {action.status === "pending" && (
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => onActionApprove(action.id)}
                            className="text-xs"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Aprovar
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onActionReject(action.id, "Rejeitada manualmente")}
                            className="text-xs"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Rejeitar
                          </Button>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs h-8 w-8 p-0"
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Mais opções</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}

                      {(action.status === "scheduled" || action.status === "completed")
                        && action.notes && (
                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                          <strong>Notas:</strong> {action.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredActions.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <div className="text-sm">Nenhuma ação encontrada</div>
              <div className="text-xs">
                Ajuste os filtros ou crie uma nova intervenção
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão flutuante para criar nova ação */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="rounded-full shadow-lg"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Send className="w-4 h-4 mr-2" />
          Nova Intervenção
        </Button>
      </div>

      {/* Dialog para criar nova ação */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Intervenção</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Crie uma nova intervenção manual para prevenir no-shows.
            </div>

            {/* Formulário simplificado */}
            <div className="space-y-4">
              <div>
                <label htmlFor="intervention-type" className="text-sm font-medium">
                  Tipo de Intervenção
                </label>
                <Select>
                  <SelectTrigger id="intervention-type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reminder">Lembrete automático</SelectItem>
                    <SelectItem value="confirmation">Ligação de confirmação</SelectItem>
                    <SelectItem value="call">Ligação personalizada</SelectItem>
                    <SelectItem value="reschedule">Reagendamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="intervention-priority" className="text-sm font-medium">
                  Prioridade
                </label>
                <Select>
                  <SelectTrigger id="intervention-priority">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="intervention-description" className="text-sm font-medium">
                  Descrição
                </label>
                <Textarea
                  id="intervention-description"
                  placeholder="Descreva a intervenção necessária..."
                  className="min-h-20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Criar Intervenção
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InterventionDashboard;
