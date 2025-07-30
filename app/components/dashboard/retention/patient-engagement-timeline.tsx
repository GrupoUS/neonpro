'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  Star,
  Search,
  Filter,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { usePatientEngagementLogs } from '@/hooks/use-retention-analytics';
import { PatientEngagementLog, EngagementType } from '@/types/retention-analytics';
import { cn } from '@/lib/utils';

interface PatientEngagementTimelineProps {
  clinicId: string;
}

export function PatientEngagementTimeline({ clinicId }: PatientEngagementTimelineProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<EngagementType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const { data: logs, loading, error } = usePatientEngagementLogs(clinicId, {
    days: dateFilter === 'all' ? undefined : parseInt(dateFilter),
    engagement_type: typeFilter === 'all' ? undefined : typeFilter,
    search: searchTerm || undefined
  });

  const getEngagementIcon = (type: EngagementType) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4" />;
      case 'email_open':
      case 'email_click':
        return <Mail className="h-4 w-4" />;
      case 'phone_call':
        return <Phone className="h-4 w-4" />;
      case 'sms_response':
        return <MessageSquare className="h-4 w-4" />;
      case 'website_visit':
        return <TrendingUp className="h-4 w-4" />;
      case 'review_left':
        return <Star className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getEngagementColor = (type: EngagementType) => {
    switch (type) {
      case 'appointment':
        return 'text-blue-600 bg-blue-50';
      case 'email_open':
      case 'email_click':
        return 'text-green-600 bg-green-50';
      case 'phone_call':
        return 'text-purple-600 bg-purple-50';
      case 'sms_response':
        return 'text-orange-600 bg-orange-50';
      case 'website_visit':
        return 'text-cyan-600 bg-cyan-50';
      case 'review_left':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getEngagementLabel = (type: EngagementType) => {
    const labels = {
      appointment: 'Consulta',
      email_open: 'Email Aberto',
      email_click: 'Click no Email',
      phone_call: 'Ligação',
      sms_response: 'Resposta SMS',
      website_visit: 'Visita ao Site',
      review_left: 'Avaliação',
      campaign_interaction: 'Interação com Campanha'
    };
    return labels[type] || type;
  };

  const formatDateTime = (date: string) => {
    const d = new Date(date);
    return {
      date: d.toLocaleDateString('pt-BR'),
      time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 8) return 'default';
    if (score >= 6) return 'secondary';
    if (score >= 4) return 'outline';
    return 'destructive';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando timeline de engajamento...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-red-600">
            Erro ao carregar dados de engajamento: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline de Engajamento de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={(value: EngagementType | 'all') => setTypeFilter(value)}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo de engajamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="appointment">Consultas</SelectItem>
                <SelectItem value="email_open">Email Aberto</SelectItem>
                <SelectItem value="email_click">Click no Email</SelectItem>
                <SelectItem value="phone_call">Ligações</SelectItem>
                <SelectItem value="sms_response">Resposta SMS</SelectItem>
                <SelectItem value="website_visit">Visita ao Site</SelectItem>
                <SelectItem value="review_left">Avaliações</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={(value: '7d' | '30d' | '90d' | 'all') => setDateFilter(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          {logs && logs.length > 0 ? (
            <div className="space-y-6">
              {logs.map((log, index) => {
                const { date, time } = formatDateTime(log.engagement_date);
                const isFirst = index === 0;
                const isLast = index === logs.length - 1;

                return (
                  <div key={log.id} className="relative">
                    {/* Linha de conexão */}
                    {!isLast && (
                      <div className="absolute left-8 top-16 h-full w-px bg-border" />
                    )}

                    <div className="flex gap-4">
                      {/* Ícone do tipo de engajamento */}
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full border-2 border-background",
                        getEngagementColor(log.engagement_type)
                      )}>
                        {getEngagementIcon(log.engagement_type)}
                      </div>

                      {/* Conteúdo do engajamento */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {log.patient_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{log.patient_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {getEngagementLabel(log.engagement_type)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant={getScoreBadgeVariant(log.engagement_score)}>
                              Score: {log.engagement_score}/10
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {time}
                            </div>
                          </div>
                        </div>

                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="rounded-lg bg-muted p-3">
                            <h5 className="text-sm font-medium mb-2">Detalhes</h5>
                            <div className="space-y-1">
                              {Object.entries(log.metadata).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground capitalize">
                                    {key.replace('_', ' ')}:
                                  </span>
                                  <span>{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Linha separadora */}
                        {!isLast && <hr className="mt-6" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingDown className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum engajamento encontrado</h3>
              <p className="text-sm">
                Não há registros de engajamento para os filtros selecionados
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}