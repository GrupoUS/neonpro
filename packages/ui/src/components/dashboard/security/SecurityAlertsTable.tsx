"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";

interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description?: string;
  source_ip?: string;
  user_id?: string;
  session_id?: string;
  alert_data?: Record<string, any>;
  affected_resources?: Record<string, any>;
  status: "active" | "acknowledged" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "urgent";
  response_required: boolean;
  escalation_level: number;
  assigned_to?: string;
  acknowledged_by?: string;
  resolved_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export function SecurityAlertsTable() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>();

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/security/alerts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch security alerts");
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch {
      toast.error("Erro ao carregar alertas de segurança");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleUpdateStatus = async (alertId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/security/alerts/${alertId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update alert status");
      }

      await fetchAlerts();
      toast.success("Status do alerta atualizado com sucesso");
    } catch {
      toast.error("Erro ao atualizar status do alerta");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": {
        return "destructive";
      }
      case "high": {
        return "destructive";
      }
      case "medium": {
        return "secondary";
      }
      case "low": {
        return "outline";
      }
      default: {
        return "outline";
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": {
        return "destructive";
      }
      case "acknowledged": {
        return "secondary";
      }
      case "resolved": {
        return "default";
      }
      case "dismissed": {
        return "outline";
      }
      default: {
        return "outline";
      }
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent": {
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      }
      case "high": {
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      }
      case "medium": {
        return <Clock className="h-4 w-4 text-yellow-500" />;
      }
      case "low": {
        return <Clock className="h-4 w-4 text-blue-500" />;
      }
      default: {
        return <Clock className="h-4 w-4 text-gray-500" />;
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": {
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      }
      case "acknowledged": {
        return <Eye className="h-4 w-4 text-yellow-500" />;
      }
      case "resolved": {
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      }
      case "dismissed": {
        return <XCircle className="h-4 w-4 text-gray-500" />;
      }
      default: {
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
      }
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.alert_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.source_ip?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === "all" || alert.severity === severityFilter;
    const matchesStatus =
      statusFilter === "all" || alert.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando alertas de segurança...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Label htmlFor="search">Buscar alertas</Label>
          <div className="relative">
            <Search className="-translate-y-1/2 absolute top-1/2 left-2 h-4 w-4 transform text-muted-foreground" />
            <Input
              className="pl-8"
              id="search"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, descrição, tipo ou IP..."
              value={searchTerm}
            />
          </div>
        </div>
        <div className="min-w-[140px]">
          <Label htmlFor="severity-filter">Severidade</Label>
          <Select onValueChange={setSeverityFilter} value={severityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[140px]">
          <Label htmlFor="status-filter">Status</Label>
          <Select onValueChange={setStatusFilter} value={statusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="acknowledged">Reconhecido</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="dismissed">Descartado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={fetchAlerts} size="sm" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Prioridade</TableHead>
              <TableHead>Alerta</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Severidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlerts.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-muted-foreground"
                  colSpan={7}
                >
                  Nenhum alerta de segurança encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredAlerts.map((alert) => (
                <TableRow
                  className={alert.status === "active" ? "bg-red-50/50" : ""}
                  key={alert.id}
                >
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(alert.priority)}
                      <Badge variant={getSeverityColor(alert.priority)}>
                        {alert.priority === "urgent" && "URGENTE"}
                        {alert.priority === "high" && "ALTA"}
                        {alert.priority === "medium" && "MÉDIA"}
                        {alert.priority === "low" && "BAIXA"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="flex items-center space-x-2 font-medium">
                        {alert.response_required && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <span>{alert.title}</span>
                      </div>
                      {alert.description && (
                        <div className="text-muted-foreground text-sm">
                          {alert.description.length > 50
                            ? `${alert.description.slice(0, 50)}...`
                            : alert.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{alert.alert_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity === "critical" && "CRÍTICA"}
                      {alert.severity === "high" && "ALTA"}
                      {alert.severity === "medium" && "MÉDIA"}
                      {alert.severity === "low" && "BAIXA"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(alert.status)}
                      <Badge variant={getStatusColor(alert.status)}>
                        {alert.status === "active" && "Ativo"}
                        {alert.status === "acknowledged" && "Reconhecido"}
                        {alert.status === "resolved" && "Resolvido"}
                        {alert.status === "dismissed" && "Descartado"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(alert.created_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => setSelectedAlert(alert)}
                            size="sm"
                            variant="ghost"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              {getPriorityIcon(alert.priority)}
                              <span>{alert.title}</span>
                              {alert.response_required && (
                                <Badge variant="destructive">
                                  Resposta Necessária
                                </Badge>
                              )}
                            </DialogTitle>
                            <DialogDescription>
                              Detalhes do alerta de segurança #{alert.id}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedAlert && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Tipo de Alerta</Label>
                                  <div className="mt-1">
                                    <Badge variant="outline">
                                      {selectedAlert.alert_type}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>Severidade</Label>
                                  <div className="mt-1">
                                    <Badge
                                      variant={getSeverityColor(
                                        selectedAlert.severity,
                                      )}
                                    >
                                      {selectedAlert.severity === "critical" &&
                                        "CRÍTICA"}
                                      {selectedAlert.severity === "high" &&
                                        "ALTA"}
                                      {selectedAlert.severity === "medium" &&
                                        "MÉDIA"}
                                      {selectedAlert.severity === "low" &&
                                        "BAIXA"}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>Prioridade</Label>
                                  <div className="mt-1 flex items-center space-x-2">
                                    {getPriorityIcon(selectedAlert.priority)}
                                    <Badge
                                      variant={getSeverityColor(
                                        selectedAlert.priority,
                                      )}
                                    >
                                      {selectedAlert.priority === "urgent" &&
                                        "URGENTE"}
                                      {selectedAlert.priority === "high" &&
                                        "ALTA"}
                                      {selectedAlert.priority === "medium" &&
                                        "MÉDIA"}
                                      {selectedAlert.priority === "low" &&
                                        "BAIXA"}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div className="mt-1 flex items-center space-x-2">
                                    {getStatusIcon(selectedAlert.status)}
                                    <Badge
                                      variant={getStatusColor(
                                        selectedAlert.status,
                                      )}
                                    >
                                      {selectedAlert.status === "active" &&
                                        "Ativo"}
                                      {selectedAlert.status ===
                                        "acknowledged" && "Reconhecido"}
                                      {selectedAlert.status === "resolved" &&
                                        "Resolvido"}
                                      {selectedAlert.status === "dismissed" &&
                                        "Descartado"}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>IP de Origem</Label>
                                  <div className="mt-1">
                                    <code className="rounded bg-muted px-2 py-1 text-sm">
                                      {selectedAlert.source_ip || "N/A"}
                                    </code>
                                  </div>
                                </div>
                                <div>
                                  <Label>Nível de Escalação</Label>
                                  <div className="mt-1">
                                    <Badge variant="outline">
                                      Nível {selectedAlert.escalation_level}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>Criado em</Label>
                                  <div className="mt-1 text-sm">
                                    {format(
                                      new Date(selectedAlert.created_at),
                                      "dd/MM/yyyy HH:mm:ss",
                                      {
                                        locale: ptBR,
                                      },
                                    )}
                                  </div>
                                </div>
                                {selectedAlert.acknowledged_at && (
                                  <div>
                                    <Label>Reconhecido em</Label>
                                    <div className="mt-1 text-sm">
                                      {format(
                                        new Date(selectedAlert.acknowledged_at),
                                        "dd/MM/yyyy HH:mm:ss",
                                        {
                                          locale: ptBR,
                                        },
                                      )}
                                    </div>
                                  </div>
                                )}
                                {selectedAlert.resolved_at && (
                                  <div>
                                    <Label>Resolvido em</Label>
                                    <div className="mt-1 text-sm">
                                      {format(
                                        new Date(selectedAlert.resolved_at),
                                        "dd/MM/yyyy HH:mm:ss",
                                        {
                                          locale: ptBR,
                                        },
                                      )}
                                    </div>
                                  </div>
                                )}
                                {selectedAlert.assigned_to && (
                                  <div>
                                    <Label>Atribuído para</Label>
                                    <div className="mt-1 text-sm">
                                      {selectedAlert.assigned_to}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {selectedAlert.description && (
                                <div>
                                  <Label>Descrição</Label>
                                  <div className="mt-1 rounded bg-muted p-3 text-sm">
                                    {selectedAlert.description}
                                  </div>
                                </div>
                              )}

                              {selectedAlert.alert_data &&
                                Object.keys(selectedAlert.alert_data).length >
                                  0 && (
                                  <div>
                                    <Label>Dados do Alerta</Label>
                                    <div className="mt-1">
                                      <pre className="max-h-40 overflow-auto rounded bg-muted p-3 text-xs">
                                        {JSON.stringify(
                                          selectedAlert.alert_data,
                                          undefined,
                                          2,
                                        )}
                                      </pre>
                                    </div>
                                  </div>
                                )}

                              {selectedAlert.affected_resources &&
                                Object.keys(selectedAlert.affected_resources)
                                  .length > 0 && (
                                  <div>
                                    <Label>Recursos Afetados</Label>
                                    <div className="mt-1">
                                      <pre className="max-h-40 overflow-auto rounded bg-muted p-3 text-xs">
                                        {JSON.stringify(
                                          selectedAlert.affected_resources,
                                          undefined,
                                          2,
                                        )}
                                      </pre>
                                    </div>
                                  </div>
                                )}

                              <div className="flex items-center space-x-2 pt-4">
                                <Label>Atualizar Status:</Label>
                                <Select
                                  onValueChange={(value) => {
                                    handleUpdateStatus(selectedAlert.id, value);
                                    setSelectedAlert({
                                      ...selectedAlert,
                                      status: value as any,
                                    });
                                  }}
                                  value={selectedAlert.status}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">
                                      Ativo
                                    </SelectItem>
                                    <SelectItem value="acknowledged">
                                      Reconhecido
                                    </SelectItem>
                                    <SelectItem value="resolved">
                                      Resolvido
                                    </SelectItem>
                                    <SelectItem value="dismissed">
                                      Descartado
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-muted-foreground text-sm">
        <span>
          Mostrando {filteredAlerts.length} de {alerts.length} alertas de
          segurança
        </span>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span>
              Ativos: {alerts.filter((a) => a.status === "active").length}
            </span>
          </span>
          <span className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>
              Resolvidos: {alerts.filter((a) => a.status === "resolved").length}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
