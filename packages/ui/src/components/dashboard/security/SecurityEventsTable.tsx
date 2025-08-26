"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, Eye, RefreshCw, Search } from "lucide-react";
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

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  description?: string;
  source_ip?: string;
  user_id?: string;
  session_id?: string;
  event_data?: Record<string, any>;
  affected_resources?: Record<string, any>;
  status: "open" | "investigating" | "resolved" | "false_positive";
  response_time_minutes?: number;
  assigned_to?: string;
  detected_at: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export function SecurityEventsTable() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/security/events", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch security events");
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch {
      toast.error("Erro ao carregar eventos de segurança");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleUpdateStatus = async (eventId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/security/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update event status");
      }

      await fetchEvents();
      toast.success("Status do evento atualizado com sucesso");
    } catch {
      toast.error("Erro ao atualizar status do evento");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": {
        return "destructive";
      }
      case "error": {
        return "destructive";
      }
      case "warning": {
        return "secondary";
      }
      case "info": {
        return "outline";
      }
      default: {
        return "outline";
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": {
        return "destructive";
      }
      case "investigating": {
        return "secondary";
      }
      case "resolved": {
        return "default";
      }
      case "false_positive": {
        return "outline";
      }
      default: {
        return "outline";
      }
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "error": {
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      }
      case "warning": {
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      }
      default: {
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      }
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.source_ip?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === "all" || event.severity === severityFilter;
    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Carregando eventos de segurança...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Label htmlFor="search">Buscar eventos</Label>
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
              <SelectItem value="error">Erro</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="info">Info</SelectItem>
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
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="investigating">Investigando</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="false_positive">Falso Positivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={fetchEvents} size="sm" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Severidade</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>IP Origem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Detectado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-muted-foreground"
                  colSpan={7}
                >
                  Nenhum evento de segurança encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getSeverityIcon(event.severity)}
                      <Badge variant={getSeverityColor(event.severity)}>
                        {event.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{event.title}</div>
                      {event.description && (
                        <div className="text-muted-foreground text-sm">
                          {event.description.length > 50
                            ? `${event.description.slice(0, 50)}...`
                            : event.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{event.event_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1 py-0.5 text-sm">
                      {event.source_ip || "N/A"}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(event.status)}>
                      {event.status === "open" && "Aberto"}
                      {event.status === "investigating" && "Investigando"}
                      {event.status === "resolved" && "Resolvido"}
                      {event.status === "false_positive" && "Falso Positivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(event.detected_at), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => setSelectedEvent(event)}
                            size="sm"
                            variant="ghost"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              {getSeverityIcon(event.severity)}
                              <span>{event.title}</span>
                            </DialogTitle>
                            <DialogDescription>
                              Detalhes do evento de segurança #{event.id}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedEvent && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Tipo de Evento</Label>
                                  <div className="mt-1">
                                    <Badge variant="outline">
                                      {selectedEvent.event_type}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>Severidade</Label>
                                  <div className="mt-1">
                                    <Badge
                                      variant={getSeverityColor(
                                        selectedEvent.severity,
                                      )}
                                    >
                                      {selectedEvent.severity.toUpperCase()}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div className="mt-1">
                                    <Badge
                                      variant={getStatusColor(
                                        selectedEvent.status,
                                      )}
                                    >
                                      {selectedEvent.status === "open" &&
                                        "Aberto"}
                                      {selectedEvent.status ===
                                        "investigating" && "Investigando"}
                                      {selectedEvent.status === "resolved" &&
                                        "Resolvido"}
                                      {selectedEvent.status ===
                                        "false_positive" && "Falso Positivo"}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>IP de Origem</Label>
                                  <div className="mt-1">
                                    <code className="rounded bg-muted px-2 py-1 text-sm">
                                      {selectedEvent.source_ip || "N/A"}
                                    </code>
                                  </div>
                                </div>
                                <div>
                                  <Label>Detectado em</Label>
                                  <div className="mt-1 text-sm">
                                    {format(
                                      new Date(selectedEvent.detected_at),
                                      "dd/MM/yyyy HH:mm:ss",
                                      {
                                        locale: ptBR,
                                      },
                                    )}
                                  </div>
                                </div>
                                {selectedEvent.resolved_at && (
                                  <div>
                                    <Label>Resolvido em</Label>
                                    <div className="mt-1 text-sm">
                                      {format(
                                        new Date(selectedEvent.resolved_at),
                                        "dd/MM/yyyy HH:mm:ss",
                                        {
                                          locale: ptBR,
                                        },
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {selectedEvent.description && (
                                <div>
                                  <Label>Descrição</Label>
                                  <div className="mt-1 rounded bg-muted p-3 text-sm">
                                    {selectedEvent.description}
                                  </div>
                                </div>
                              )}

                              {selectedEvent.event_data &&
                                Object.keys(selectedEvent.event_data).length >
                                  0 && (
                                  <div>
                                    <Label>Dados do Evento</Label>
                                    <div className="mt-1">
                                      <pre className="max-h-40 overflow-auto rounded bg-muted p-3 text-xs">
                                        {JSON.stringify(
                                          selectedEvent.event_data,
                                          undefined,
                                          2,
                                        )}
                                      </pre>
                                    </div>
                                  </div>
                                )}

                              {selectedEvent.affected_resources &&
                                Object.keys(selectedEvent.affected_resources)
                                  .length > 0 && (
                                  <div>
                                    <Label>Recursos Afetados</Label>
                                    <div className="mt-1">
                                      <pre className="max-h-40 overflow-auto rounded bg-muted p-3 text-xs">
                                        {JSON.stringify(
                                          selectedEvent.affected_resources,
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
                                    handleUpdateStatus(selectedEvent.id, value);
                                    setSelectedEvent({
                                      ...selectedEvent,
                                      status: value as any,
                                    });
                                  }}
                                  value={selectedEvent.status}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open">Aberto</SelectItem>
                                    <SelectItem value="investigating">
                                      Investigando
                                    </SelectItem>
                                    <SelectItem value="resolved">
                                      Resolvido
                                    </SelectItem>
                                    <SelectItem value="false_positive">
                                      Falso Positivo
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
      <div className="text-muted-foreground text-sm">
        Mostrando {filteredEvents.length} de {events.length} eventos de
        segurança
      </div>
    </div>
  );
}
