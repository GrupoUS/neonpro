"use client";

// Phase 4 Validation Dashboard
// Dashboard abrangente para sistema de validação de saúde

import { usePhase4Validation } from "@/app/hooks/use-phase4-validation";
import type {
  ValidationRule,
  ValidationSession,
  ValidationStatus,
  ValidationType,
} from "@/app/types/phase4-validation";
import { ValidationLabels, ValidationLevel } from "@/app/types/phase4-validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Heart,
  Info,
  PauseCircle,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Settings2,
  Shield,
  Stethoscope,
  Trash2,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface ValidationDashboardProps {
  clinic_id: string;
}

export function ValidationDashboard({ clinic_id }: ValidationDashboardProps) {
  const validation = usePhase4Validation({
    clinic_id,
    real_time_updates: true,
    auto_validate: true,
    cache_results: true,
    strict_mode: false,
  });

  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [selectedSession, setSelectedSession] = useState<ValidationSession | null>(null);
  const [selectedRule, setSelectedRule] = useState<ValidationRule | null>(null);
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ValidationStatus | "all">(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<ValidationType | "all">("all");

  // Icon mapping for validation types
  const getTypeIcon = (type: ValidationType) => {
    switch (type) {
      case "patient_data":
        return <Users className="h-4 w-4" />;
      case "appointment":
        return <Calendar className="h-4 w-4" />;
      case "treatment":
        return <Stethoscope className="h-4 w-4" />;
      case "compliance":
        return <Shield className="h-4 w-4" />;
      case "billing":
        return <DollarSign className="h-4 w-4" />;
      case "staff":
        return <Users className="h-4 w-4" />;
      case "equipment":
        return <Settings2 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Status icon mapping
  const getStatusIcon = (status: ValidationStatus) => {
    switch (status) {
      case "passed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "validating":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "requires_review":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  // Filter sessions based on search and filters
  const filteredSessions = validation.sessions.filter((session) => {
    const matchesSearch = searchTerm === ""
      || session.entity_id.toLowerCase().includes(searchTerm.toLowerCase())
      || session.entity_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || session.status === statusFilter;
    const matchesType = typeFilter === "all" || session.entity_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleExportResults = async (format: "pdf" | "excel" | "csv") => {
    try {
      const selectedSessionIds = filteredSessions.map((session) => session.id);
      const blob = await validation.exportResults(selectedSessionIds, format);

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `validation-results.${format}`;
      document.body.append(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export results:", error);
    }
  };

  const handleValidateEntity = async (
    type: ValidationType,
    entityId: string,
    data: unknown,
  ) => {
    try {
      await validation.validateEntity(type, entityId, data);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Validação Phase 4</h1>
          <p className="text-gray-600 mt-1">
            Monitoramento abrangente e validação de dados clínicos
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {validation.connected
              ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Conectado</span>
                </>
              )
              : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">Desconectado</span>
                </>
              )}
          </div>

          {validation.lastUpdate && (
            <span className="text-sm text-gray-500">
              Última atualização: {new Date(validation.lastUpdate).toLocaleTimeString("pt-BR")}
            </span>
          )}

          <Button onClick={() => setIsConfigOpen(true)} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Validações Hoje
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validation.dashboard?.summary.today_validations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{validation.activeSessions.length} em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Sucesso
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validation.dashboard?.summary.success_rate
                ? `${validation.dashboard.summary.success_rate}%`
                : "0%"}
            </div>
            <Progress
              value={validation.dashboard?.summary.success_rate || 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {validation.dashboard?.summary.average_response_time
                ? `${validation.dashboard.summary.average_response_time}ms`
                : "0ms"}
            </div>
            <p className="text-xs text-muted-foreground">Tempo de resposta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas Críticos
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {validation.dashboard?.summary.critical_errors || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requer atenção imediata
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health Status */}
      {validation.systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge
                  variant={validation.systemHealth.status === "healthy"
                    ? "default"
                    : "destructive"}
                >
                  {ValidationLabels.system_health[
                    validation.systemHealth.status
                  ]}
                </Badge>
                <span className="text-sm text-gray-600">
                  Uptime: {Math.round(validation.systemHealth.uptime / 3600)}h
                </span>
                <span className="text-sm text-gray-600">
                  CPU: {validation.systemHealth.cpu_usage}%
                </span>
                <span className="text-sm text-gray-600">
                  Memória: {validation.systemHealth.memory_usage}%
                </span>
              </div>
              <Button
                onClick={validation.checkSystemHealth}
                size="sm"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
                <CardDescription>Últimas validações realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {validation.dashboard?.recent_activities
                    ?.slice(0, 5)
                    .map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {getTypeIcon(activity.type)}
                          <div>
                            <p className="text-sm font-medium">
                              {ValidationLabels.validation_types[activity.type]}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {activity.entity_id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(activity.status)}
                          <span className="text-xs text-gray-500">
                            {activity.duration}ms
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* System Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recomendações do Sistema</CardTitle>
                <CardDescription>Sugestões para otimização</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {validation.dashboard?.recommendations
                    ?.slice(0, 3)
                    .map((rec, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-500 pl-4"
                      >
                        <h4 className="font-medium text-sm">{rec.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {rec.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Impacto: {rec.impact === "high"
                              ? "Alto"
                              : rec.impact === "medium"
                              ? "Médio"
                              : "Baixo"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Esforço: {rec.effort === "high"
                              ? "Alto"
                              : rec.effort === "medium"
                              ? "Médio"
                              : "Baixo"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Sessões de Validação
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleExportResults("excel")}
                    size="sm"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button
                    onClick={validation.loadSessions}
                    size="sm"
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por ID ou tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={statusFilter}
                  onValueChange={(value: ValidationStatus | "all") => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="validating">Validando</SelectItem>
                    <SelectItem value="passed">Aprovado</SelectItem>
                    <SelectItem value="failed">Rejeitado</SelectItem>
                    <SelectItem value="requires_review">
                      Requer Revisão
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={typeFilter}
                  onValueChange={(value: ValidationType | "all") => setTypeFilter(value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="patient_data">
                      Dados do Paciente
                    </SelectItem>
                    <SelectItem value="appointment">Consulta</SelectItem>
                    <SelectItem value="treatment">Tratamento</SelectItem>
                    <SelectItem value="compliance">Conformidade</SelectItem>
                    <SelectItem value="billing">Faturamento</SelectItem>
                    <SelectItem value="staff">Funcionário</SelectItem>
                    <SelectItem value="equipment">Equipamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sessions Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-mono text-xs">
                          {session.entity_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(session.entity_type)}
                            {ValidationLabels.validation_types[
                              session.entity_type
                            ]}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(session.status)}
                            {ValidationLabels.validation_status[session.status]}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {session.overall_score}%
                            </span>
                            <Progress
                              value={session.overall_score}
                              className="w-16 h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          {session.duration ? `${session.duration}ms` : "-"}
                        </TableCell>
                        <TableCell>
                          {new Date(session.start_time).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedSession(session)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {session.status === "failed" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => validation.retryValidation(session.id)}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Regras de Validação
                <Button onClick={() => setIsCreateRuleOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Regra
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validation.rules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(enabled) =>
                            validation.toggleRule(rule.id, enabled)}
                        />
                        <div>
                          <h4 className="font-medium">{rule.name}</h4>
                          <p className="text-sm text-gray-600">
                            {rule.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {ValidationLabels.validation_types[rule.type]}
                        </Badge>
                        <Badge variant="secondary">
                          {ValidationLabels.validation_levels[rule.level]}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            validation.deleteRule(rule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                {validation.stats && (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total de Validações:</span>
                      <span className="font-medium">
                        {validation.stats.total_validations}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de Sucesso:</span>
                      <span className="font-medium">
                        {validation.stats.success_rate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Score Médio:</span>
                      <span className="font-medium">
                        {validation.stats.average_score}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Score de Conformidade:</span>
                      <span className="font-medium">
                        {validation.stats.compliance_score}%
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Erros Mais Comuns</CardTitle>
              </CardHeader>
              <CardContent>
                {validation.stats?.common_errors && (
                  <div className="space-y-3">
                    {validation.stats.common_errors.slice(0, 5).map((error) => (
                      <div
                        key={error.error_code}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {error.error_code}
                          </p>
                          <p className="text-xs text-gray-600">
                            {error.percentage}%
                          </p>
                        </div>
                        <Badge variant="outline">{error.count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alertas do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validation.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="border-l-4 border-red-500 bg-red-50 p-4 rounded"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <h4 className="font-medium">{alert.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => validation.acknowledgeAlert(alert.id)}
                          >
                            Reconhecer
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => validation.dismissAlert(alert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={alert.type === "error" ? "destructive" : "secondary"}
                      >
                        {ValidationLabels.alert_types[alert.type]}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Session Detail Dialog */}
      {selectedSession && (
        <Dialog
          open={!!selectedSession}
          onOpenChange={() => setSelectedSession(null)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Sessão de Validação</DialogTitle>
              <DialogDescription>
                Resultados detalhados da validação {selectedSession.id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Session Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Entidade</Label>
                  <p className="font-medium">
                    {ValidationLabels.validation_types[
                      selectedSession.entity_type
                    ]}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedSession.status)}
                    <span>
                      {ValidationLabels.validation_status[
                        selectedSession.status
                      ]}
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Score Geral</Label>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {selectedSession.overall_score}%
                    </span>
                    <Progress
                      value={selectedSession.overall_score}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Duração</Label>
                  <p className="font-medium">
                    {selectedSession.duration
                      ? `${selectedSession.duration}ms`
                      : "Em andamento"}
                  </p>
                </div>
              </div>

              {/* Validation Results */}
              <div>
                <Label>Resultados das Regras</Label>
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {selectedSession.results.map((result) => (
                    <div key={result.id} className="border rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          <span className="font-medium">
                            Regra {result.rule_id}
                          </span>
                        </div>
                        <Badge
                          variant={result.passed ? "default" : "destructive"}
                        >
                          {result.score}%
                        </Badge>
                      </div>

                      {result.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-red-600">
                            Erros:
                          </p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {result.errors.map((error, index) => (
                              <li key={index} className="text-red-600">
                                {error.field}: {error.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.warnings.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-yellow-600">
                            Avisos:
                          </p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {result.warnings.map((warning, index) => (
                              <li key={index} className="text-yellow-600">
                                {warning.field}: {warning.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
