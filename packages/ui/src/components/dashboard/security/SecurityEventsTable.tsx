'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@neonpro/ui/badge';
import { Button } from '@neonpro/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neonpro/ui/card';
import { Input } from '@neonpro/ui/input';
import { Label } from '@neonpro/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@neonpro/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@neonpro/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@neonpro/ui/dialog';
import { AlertTriangle, Eye, Search, Filter, RefreshCw, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description?: string;
  source_ip?: string;
  user_id?: string;
  session_id?: string;
  event_data?: Record<string, any>;
  affected_resources?: Record<string, any>;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/security/events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch security events');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching security events:', error);
      toast.error('Erro ao carregar eventos de segurança');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleUpdateStatus = async (eventId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/security/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update event status');
      }

      await fetchEvents();
      toast.success('Status do evento atualizado com sucesso');
    } catch (error) {
      console.error('Error updating event status:', error);
      toast.error('Erro ao atualizar status do evento');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'investigating':
        return 'secondary';
      case 'resolved':
        return 'default';
      case 'false_positive':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.source_ip?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;

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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Buscar eventos</Label>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar por título, descrição, tipo ou IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="min-w-[140px]">
          <Label htmlFor="severity-filter">Severidade</Label>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          <Button onClick={fetchEvents} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
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
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
                        <div className="text-sm text-muted-foreground">
                          {event.description.length > 50 
                            ? `${event.description.substring(0, 50)}...`
                            : event.description
                          }
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{event.event_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-1 py-0.5 rounded">
                      {event.source_ip || 'N/A'}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(event.status)}>
                      {event.status === 'open' && 'Aberto'}
                      {event.status === 'investigating' && 'Investigando'}
                      {event.status === 'resolved' && 'Resolvido'}
                      {event.status === 'false_positive' && 'Falso Positivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(event.detected_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedEvent(event)}
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
                                    <Badge variant="outline">{selectedEvent.event_type}</Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>Severidade</Label>
                                  <div className="mt-1">
                                    <Badge variant={getSeverityColor(selectedEvent.severity)}>
                                      {selectedEvent.severity.toUpperCase()}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>Status</Label>
                                  <div className="mt-1">
                                    <Badge variant={getStatusColor(selectedEvent.status)}>
                                      {selectedEvent.status === 'open' && 'Aberto'}
                                      {selectedEvent.status === 'investigating' && 'Investigando'}
                                      {selectedEvent.status === 'resolved' && 'Resolvido'}
                                      {selectedEvent.status === 'false_positive' && 'Falso Positivo'}
                                    </Badge>
                                  </div>
                                </div>
                                <div>
                                  <Label>IP de Origem</Label>
                                  <div className="mt-1">
                                    <code className="text-sm bg-muted px-2 py-1 rounded">
                                      {selectedEvent.source_ip || 'N/A'}
                                    </code>
                                  </div>
                                </div>
                                <div>
                                  <Label>Detectado em</Label>
                                  <div className="mt-1 text-sm">
                                    {format(new Date(selectedEvent.detected_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                                  </div>
                                </div>
                                {selectedEvent.resolved_at && (
                                  <div>
                                    <Label>Resolvido em</Label>
                                    <div className="mt-1 text-sm">
                                      {format(new Date(selectedEvent.resolved_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {selectedEvent.description && (
                                <div>
                                  <Label>Descrição</Label>
                                  <div className="mt-1 text-sm bg-muted p-3 rounded">
                                    {selectedEvent.description}
                                  </div>
                                </div>
                              )}

                              {selectedEvent.event_data && Object.keys(selectedEvent.event_data).length > 0 && (
                                <div>
                                  <Label>Dados do Evento</Label>
                                  <div className="mt-1">
                                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                                      {JSON.stringify(selectedEvent.event_data, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              {selectedEvent.affected_resources && Object.keys(selectedEvent.affected_resources).length > 0 && (
                                <div>
                                  <Label>Recursos Afetados</Label>
                                  <div className="mt-1">
                                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                                      {JSON.stringify(selectedEvent.affected_resources, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center space-x-2 pt-4">
                                <Label>Atualizar Status:</Label>
                                <Select
                                  value={selectedEvent.status}
                                  onValueChange={(value) => {
                                    handleUpdateStatus(selectedEvent.id, value);
                                    setSelectedEvent({ ...selectedEvent, status: value as any });
                                  }}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open">Aberto</SelectItem>
                                    <SelectItem value="investigating">Investigando</SelectItem>
                                    <SelectItem value="resolved">Resolvido</SelectItem>
                                    <SelectItem value="false_positive">Falso Positivo</SelectItem>
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
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredEvents.length} de {events.length} eventos de segurança
      </div>
    </div>
  );
}