"use client";

import type {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Users,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
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
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Textarea } from "@/components/ui/textarea";
import type { useBreachManagement } from "@/hooks/useLGPD";
import type { BreachIncident } from "@/types/lgpd";

interface BreachManagementPanelProps {
  className?: string;
}

export function BreachManagementPanel({ className }: BreachManagementPanelProps) {
  const {
    incidents,
    isLoading,
    error,
    reportIncident,
    updateIncident,
    exportIncidents,
    refreshData,
  } = useBreachManagement();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [selectedIncident, setSelectedIncident] = useState<BreachIncident | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    severity: "medium" as "low" | "medium" | "high" | "critical",
    affected_data_types: [] as string[],
    affected_individuals_count: 0,
    discovery_method: "",
    containment_actions: "",
    notification_required: false,
  });

  // Filtrar incidentes
  const filteredIncidents =
    incidents?.filter((incident) => {
      const matchesSearch =
        incident.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || incident.status === statusFilter;
      const matchesSeverity = severityFilter === "all" || incident.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    }) || [];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "low":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Baixa
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Média
          </Badge>
        );
      case "high":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Alta
          </Badge>
        );
      case "critical":
        return <Badge variant="destructive">Crítica</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reported":
        return (
          <Badge variant="secondary">
            <Bell className="h-3 w-3 mr-1" />
            Reportado
          </Badge>
        );
      case "investigating":
        return (
          <Badge variant="default">
            <Search className="h-3 w-3 mr-1" />
            Investigando
          </Badge>
        );
      case "contained":
        return (
          <Badge variant="outline">
            <Shield className="h-3 w-3 mr-1" />
            Contido
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Resolvido
          </Badge>
        );
      case "closed":
        return (
          <Badge variant="outline">
            <XCircle className="h-3 w-3 mr-1" />
            Fechado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-orange-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleCreateIncident = async () => {
    try {
      await reportIncident(newIncident);
      setIsCreateOpen(false);
      setNewIncident({
        title: "",
        description: "",
        severity: "medium",
        affected_data_types: [],
        affected_individuals_count: 0,
        discovery_method: "",
        containment_actions: "",
        notification_required: false,
      });
    } catch (error) {
      console.error("Erro ao reportar incidente:", error);
    }
  };

  const handleUpdateIncident = async (id: string, updates: Partial<BreachIncident>) => {
    try {
      await updateIncident(id, updates);
      setIsEditOpen(false);
      setSelectedIncident(null);
    } catch (error) {
      console.error("Erro ao atualizar incidente:", error);
    }
  };

  // Calcular estatísticas
  const stats = {
    total: incidents?.length || 0,
    active: incidents?.filter((i) => !["resolved", "closed"].includes(i.status)).length || 0,
    critical: incidents?.filter((i) => i.severity === "critical").length || 0,
    thisMonth:
      incidents?.filter((i) => {
        const incidentDate = new Date(i.created_at);
        const now = new Date();
        return (
          incidentDate.getMonth() === now.getMonth() &&
          incidentDate.getFullYear() === now.getFullYear()
        );
      }).length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando incidentes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Erro ao carregar incidentes: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold">Gestão de Incidentes de Violação</h3>
          <p className="text-muted-foreground">
            Monitore e gerencie incidentes de violação de dados pessoais
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportIncidents}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Reportar Incidente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Reportar Novo Incidente</DialogTitle>
                <DialogDescription>
                  Registre um novo incidente de violação de dados pessoais
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título do Incidente</Label>
                  <Input
                    id="title"
                    value={newIncident.title}
                    onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                    placeholder="Ex: Acesso não autorizado ao banco de dados"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newIncident.description}
                    onChange={(e) =>
                      setNewIncident({ ...newIncident, description: e.target.value })
                    }
                    placeholder="Descreva detalhadamente o incidente..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="severity">Severidade</Label>
                    <Select
                      value={newIncident.severity}
                      onValueChange={(value: "low" | "medium" | "high" | "critical") =>
                        setNewIncident({ ...newIncident, severity: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a severidade" />
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
                    <Label htmlFor="count">Indivíduos Afetados</Label>
                    <Input
                      id="count"
                      type="number"
                      value={newIncident.affected_individuals_count}
                      onChange={(e) =>
                        setNewIncident({
                          ...newIncident,
                          affected_individuals_count: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="discovery">Método de Descoberta</Label>
                  <Input
                    id="discovery"
                    value={newIncident.discovery_method}
                    onChange={(e) =>
                      setNewIncident({ ...newIncident, discovery_method: e.target.value })
                    }
                    placeholder="Ex: Monitoramento de segurança, relatório de usuário"
                  />
                </div>

                <div>
                  <Label htmlFor="containment">Ações de Contenção</Label>
                  <Textarea
                    id="containment"
                    value={newIncident.containment_actions}
                    onChange={(e) =>
                      setNewIncident({ ...newIncident, containment_actions: e.target.value })
                    }
                    placeholder="Descreva as ações tomadas para conter o incidente..."
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateIncident}>Reportar Incidente</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Incidentes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Incidentes Ativos</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Incidentes Críticos</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Este Mês</p>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas para incidentes críticos */}
      {incidents?.filter(
        (i) => i.severity === "critical" && !["resolved", "closed"].includes(i.status),
      ).length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> Existem{" "}
            {
              incidents.filter(
                (i) => i.severity === "critical" && !["resolved", "closed"].includes(i.status),
              ).length
            }{" "}
            incidente(s) crítico(s) que requerem atenção imediata.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incidents">Incidentes</TabsTrigger>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Título ou descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="reported">Reportado</SelectItem>
                      <SelectItem value="investigating">Investigando</SelectItem>
                      <SelectItem value="contained">Contido</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                      <SelectItem value="closed">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="severity">Severidade</Label>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as severidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setSeverityFilter("all");
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de incidentes */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Incidentes ({filteredIncidents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incidente</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Indivíduos Afetados</TableHead>
                    <TableHead>Data de Reporte</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{incident.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {incident.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{incident.affected_individuals_count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(incident.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                Ver
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  {getSeverityBadge(incident.severity)}
                                  {incident.title}
                                </DialogTitle>
                                <DialogDescription>
                                  Incidente reportado em{" "}
                                  {new Date(incident.created_at).toLocaleDateString("pt-BR")}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                {/* Informações básicas */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Status Atual</Label>
                                    <div className="mt-1">{getStatusBadge(incident.status)}</div>
                                  </div>
                                  <div>
                                    <Label>Severidade</Label>
                                    <div className="mt-1">
                                      {getSeverityBadge(incident.severity)}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Indivíduos Afetados</Label>
                                    <p className="text-sm font-medium">
                                      {incident.affected_individuals_count || 0}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Notificação Requerida</Label>
                                    <p className="text-sm">
                                      {incident.notification_required ? "Sim" : "Não"}
                                    </p>
                                  </div>
                                </div>

                                {/* Descrição */}
                                <div>
                                  <Label>Descrição do Incidente</Label>
                                  <p className="text-sm mt-1 bg-muted p-3 rounded">
                                    {incident.description}
                                  </p>
                                </div>

                                {/* Tipos de dados afetados */}
                                {incident.affected_data_types &&
                                  incident.affected_data_types.length > 0 && (
                                    <div>
                                      <Label>Tipos de Dados Afetados</Label>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {incident.affected_data_types.map((type, index) => (
                                          <Badge key={index} variant="outline">
                                            {type}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                {/* Método de descoberta */}
                                {incident.discovery_method && (
                                  <div>
                                    <Label>Método de Descoberta</Label>
                                    <p className="text-sm mt-1">{incident.discovery_method}</p>
                                  </div>
                                )}

                                {/* Ações de contenção */}
                                {incident.containment_actions && (
                                  <div>
                                    <Label>Ações de Contenção</Label>
                                    <p className="text-sm mt-1 bg-muted p-3 rounded">
                                      {incident.containment_actions}
                                    </p>
                                  </div>
                                )}

                                {/* Notificações */}
                                {incident.notifications && incident.notifications.length > 0 && (
                                  <div>
                                    <Label>Notificações Enviadas</Label>
                                    <div className="space-y-2 mt-1">
                                      {incident.notifications.map((notification, index) => (
                                        <div
                                          key={index}
                                          className="text-sm bg-muted p-2 rounded flex items-center gap-2"
                                        >
                                          {notification.type === "email" ? (
                                            <Mail className="h-4 w-4" />
                                          ) : (
                                            <Bell className="h-4 w-4" />
                                          )}
                                          <span>
                                            {notification.recipient} -{" "}
                                            {notification.sent_at
                                              ? new Date(notification.sent_at).toLocaleString(
                                                  "pt-BR",
                                                )
                                              : "Pendente"}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedIncident(incident);
                                    setIsEditOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar Status
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredIncidents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum incidente encontrado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Linha do Tempo dos Incidentes</CardTitle>
              <CardDescription>Visualização cronológica dos incidentes de violação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents?.slice(0, 10).map((incident, index) => (
                  <div
                    key={incident.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-b-0"
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-3 h-3 rounded-full mt-2 ${
                          incident.severity === "critical"
                            ? "bg-red-500"
                            : incident.severity === "high"
                              ? "bg-orange-500"
                              : incident.severity === "medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{incident.title}</h4>
                        {getSeverityBadge(incident.severity)}
                        {getStatusBadge(incident.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(incident.created_at).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {incident.affected_individuals_count || 0} afetados
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {incidents?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum incidente registrado
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para editar status */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Status do Incidente</DialogTitle>
            <DialogDescription>{selectedIncident?.title}</DialogDescription>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Novo Status</Label>
                <Select
                  value={selectedIncident.status}
                  onValueChange={(value) =>
                    setSelectedIncident({ ...selectedIncident, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reported">Reportado</SelectItem>
                    <SelectItem value="investigating">Investigando</SelectItem>
                    <SelectItem value="contained">Contido</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() =>
                selectedIncident &&
                handleUpdateIncident(selectedIncident.id, {
                  status: selectedIncident.status,
                })
              }
            >
              Atualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
