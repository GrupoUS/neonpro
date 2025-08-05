/**
 * Security Events Table Component
 * Story 1.4: Session Management & Security
 *
 * Comprehensive table for viewing and managing security events
 * with filtering, sorting, and resolution capabilities.
 */

"use client";

import React, { useState, useMemo } from "react";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Input } from "@/components/ui/input";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Eye,
  Shield,
  Clock,
  MapPin,
  Monitor,
} from "lucide-react";
import type { SessionSecurityEvent, SecurityEventType, SecuritySeverity } from "@/types/session";
import type { useSecurityEvents } from "@/hooks/useSession";
import type { format } from "date-fns";
import type { ptBR } from "date-fns/locale";

// ============================================================================
// INTERFACES
// ============================================================================

interface SecurityEventsTableProps {
  events: SessionSecurityEvent[];
  onReportActivity: (eventType: SecurityEventType, details?: any) => Promise<void>;
}

interface EventFilters {
  search: string;
  severity: SecuritySeverity | "all";
  eventType: SecurityEventType | "all";
  resolved: "all" | "resolved" | "unresolved";
  dateRange: "all" | "24h" | "7d" | "30d";
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SecurityEventsTable({
  events,
  onReportActivity,
}: SecurityEventsTableProps) {
  const { resolveEvent, dismissEvent } = useSecurityEvents();
  const [filters, setFilters] = useState<EventFilters>({
    search: "",
    severity: "all",
    eventType: "all",
    resolved: "all",
    dateRange: "all",
  });
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  // ============================================================================
  // FILTERING AND SORTING
  // ============================================================================

  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.event_type.toLowerCase().includes(searchLower) ||
          event.ip_address.toLowerCase().includes(searchLower) ||
          (event.details && JSON.stringify(event.details).toLowerCase().includes(searchLower)),
      );
    }

    // Severity filter
    if (filters.severity !== "all") {
      filtered = filtered.filter((event) => event.severity === filters.severity);
    }

    // Event type filter
    if (filters.eventType !== "all") {
      filtered = filtered.filter((event) => event.event_type === filters.eventType);
    }

    // Resolved filter
    if (filters.resolved !== "all") {
      filtered = filtered.filter((event) =>
        filters.resolved === "resolved" ? event.resolved : !event.resolved,
      );
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const cutoff = new Date();

      switch (filters.dateRange) {
        case "24h":
          cutoff.setHours(now.getHours() - 24);
          break;
        case "7d":
          cutoff.setDate(now.getDate() - 7);
          break;
        case "30d":
          cutoff.setDate(now.getDate() - 30);
          break;
      }

      filtered = filtered.filter((event) => new Date(event.timestamp) >= cutoff);
    }

    // Sort by timestamp (newest first)
    return filtered.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [events, filters]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleResolveEvent = async (eventId: string) => {
    try {
      await resolveEvent(eventId);
    } catch (error) {
      console.error("Failed to resolve event:", error);
    }
  };

  const handleDismissEvent = async (eventId: string) => {
    try {
      await dismissEvent(eventId);
    } catch (error) {
      console.error("Failed to dismiss event:", error);
    }
  };

  const handleBulkResolve = async () => {
    try {
      await Promise.all(selectedEvents.map((eventId) => resolveEvent(eventId)));
      setSelectedEvents([]);
    } catch (error) {
      console.error("Failed to bulk resolve events:", error);
    }
  };

  const handleExportEvents = () => {
    const csvContent = [
      ["Timestamp", "Event Type", "Severity", "IP Address", "Resolved", "Details"].join(","),
      ...filteredEvents.map((event) =>
        [
          format(new Date(event.timestamp), "yyyy-MM-dd HH:mm:ss"),
          event.event_type,
          event.severity,
          event.ip_address,
          event.resolved ? "Yes" : "No",
          JSON.stringify(event.details || {}),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-events-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getSeverityBadge = (severity: SecuritySeverity) => {
    const config = {
      low: { variant: "secondary" as const, color: "text-blue-600" },
      medium: { variant: "default" as const, color: "text-yellow-600" },
      high: { variant: "destructive" as const, color: "text-orange-600" },
      critical: { variant: "destructive" as const, color: "text-red-600" },
    };

    const { variant, color } = config[severity] || config.medium;

    return (
      <Badge variant={variant} className={color}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getEventTypeLabel = (eventType: SecurityEventType) => {
    const labels = {
      [SecurityEventType.UNUSUAL_LOCATION]: "Localização Incomum",
      [SecurityEventType.DEVICE_CHANGE]: "Mudança de Dispositivo",
      [SecurityEventType.RAPID_REQUESTS]: "Requisições Rápidas",
      [SecurityEventType.SESSION_HIJACK_ATTEMPT]: "Tentativa de Sequestro",
      [SecurityEventType.SUSPICIOUS_USER_AGENT]: "User Agent Suspeito",
      [SecurityEventType.CONCURRENT_SESSION_LIMIT]: "Limite de Sessões",
      [SecurityEventType.FAILED_AUTHENTICATION]: "Falha na Autenticação",
      [SecurityEventType.PRIVILEGE_ESCALATION]: "Escalação de Privilégios",
    };

    return labels[eventType] || eventType;
  };

  const getEventTypeIcon = (eventType: SecurityEventType) => {
    const icons = {
      [SecurityEventType.UNUSUAL_LOCATION]: <MapPin className="h-4 w-4" />,
      [SecurityEventType.DEVICE_CHANGE]: <Monitor className="h-4 w-4" />,
      [SecurityEventType.RAPID_REQUESTS]: <Clock className="h-4 w-4" />,
      [SecurityEventType.SESSION_HIJACK_ATTEMPT]: <Shield className="h-4 w-4" />,
      [SecurityEventType.SUSPICIOUS_USER_AGENT]: <Eye className="h-4 w-4" />,
      [SecurityEventType.CONCURRENT_SESSION_LIMIT]: <AlertTriangle className="h-4 w-4" />,
      [SecurityEventType.FAILED_AUTHENTICATION]: <XCircle className="h-4 w-4" />,
      [SecurityEventType.PRIVILEGE_ESCALATION]: <Shield className="h-4 w-4" />,
    };

    return icons[eventType] || <AlertTriangle className="h-4 w-4" />;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Eventos de Segurança</CardTitle>
            <CardDescription>Monitore e gerencie eventos de segurança da sessão</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {selectedEvents.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleBulkResolve}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolver Selecionados ({selectedEvents.length})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExportEvents}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onReportActivity(SecurityEventType.SUSPICIOUS_USER_AGENT, {
                  manual_report: true,
                  description: "Atividade suspeita reportada pelo usuário",
                })
              }
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Reportar Atividade
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="pl-8"
              />
            </div>
          </div>

          <Select
            value={filters.severity}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                severity: value as SecuritySeverity | "all",
              }))
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.eventType}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                eventType: value as SecurityEventType | "all",
              }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de Evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.values(SecurityEventType).map((type) => (
                <SelectItem key={type} value={type}>
                  {getEventTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.resolved}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                resolved: value as "all" | "resolved" | "unresolved",
              }))
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="unresolved">Pendentes</SelectItem>
              <SelectItem value="resolved">Resolvidos</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.dateRange}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                dateRange: value as EventFilters["dateRange"],
              }))
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="24h">24h</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <input
                    type="checkbox"
                    checked={
                      selectedEvents.length === filteredEvents.length && filteredEvents.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEvents(filteredEvents.map((event) => event.id));
                      } else {
                        setSelectedEvents([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum evento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEvents((prev) => [...prev, event.id]);
                          } else {
                            setSelectedEvents((prev) => prev.filter((id) => id !== event.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getEventTypeIcon(event.event_type)}
                        <span className="font-medium">{getEventTypeLabel(event.event_type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                    <TableCell className="font-mono text-sm">{event.ip_address}</TableCell>
                    <TableCell>
                      {format(new Date(event.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {event.resolved ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Resolvido</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span>Pendente</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {!event.resolved && (
                            <>
                              <DropdownMenuItem onClick={() => handleResolveEvent(event.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Resolver
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDismissEvent(event.id)}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Descartar
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(event, null, 2));
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>
            Mostrando {filteredEvents.length} de {events.length} eventos
          </span>
          <span>
            {filteredEvents.filter((e) => !e.resolved).length} pendentes,{" "}
            {filteredEvents.filter((e) => e.resolved).length} resolvidos
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
