// SMS Analytics Component for NeonPro
// Comprehensive SMS metrics, delivery reports, and performance analytics

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Send,
  Users,
  DollarSign,
  Calendar,
  Download,
  Filter,
  Loader2,
  MessageSquare,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  useSMSAnalytics, 
  useSMSMessages, 
  useSMSDeliveryReports,
  useActiveSMSProvider
} from '@/app/hooks/use-sms';
import type { SMSAnalytics, SMSMessage, SMSDeliveryStatus } from '@/app/types/sms';

// Date range options
const DATE_RANGES = [
  { label: 'Últimas 24h', value: '1d', days: 1 },
  { label: 'Última semana', value: '7d', days: 7 },
  { label: 'Último mês', value: '30d', days: 30 },
  { label: 'Últimos 3 meses', value: '90d', days: 90 }
];

// Status colors
const STATUS_COLORS = {
  delivered: '#22c55e',
  failed: '#ef4444',
  pending: '#f59e0b',
  sent: '#3b82f6'
};

// Status labels
const STATUS_LABELS = {
  delivered: 'Entregue',
  failed: 'Falhou',
  pending: 'Pendente',
  sent: 'Enviado'
};

export default function SMSAnalytics() {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  
  // Calculate date range
  const days = DATE_RANGES.find(r => r.value === dateRange)?.days || 7;
  const startDate = startOfDay(subDays(new Date(), days));
  const endDate = endOfDay(new Date());
  
  // API hooks
  const { data: activeProvider } = useActiveSMSProvider();
  const { 
    data: analytics, 
    isLoading: analyticsLoading 
  } = useSMSAnalytics({ 
    start_date: startDate.toISOString(), 
    end_date: endDate.toISOString(),
    provider_id: selectedProvider === 'all' ? undefined : selectedProvider
  });
  
  const { 
    data: messages = [], 
    isLoading: messagesLoading 
  } = useSMSMessages({
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    limit: 100
  });
  
  const { 
    data: deliveryReports = [] 
  } = useSMSDeliveryReports({
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString()
  });

  // Format currency
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);

  // Format percentage
  const formatPercentage = (value: number) => 
    `${value.toFixed(1)}%`;

  // Render overview cards
  const renderOverviewCards = () => {
    if (!analytics) return null;

    const deliveryRate = analytics.total_sent > 0 
      ? (analytics.total_delivered / analytics.total_sent) * 100 
      : 0;

    const avgCostPerSMS = analytics.total_sent > 0 
      ? analytics.total_cost / analytics.total_sent 
      : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SMS Enviados</p>
                <p className="text-2xl font-bold">{analytics.total_sent.toLocaleString('pt-BR')}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Send className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500">+12%</span>
              <span className="text-muted-foreground ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Entrega</p>
                <p className="text-2xl font-bold">{formatPercentage(deliveryRate)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={deliveryRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.total_cost)}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-muted-foreground">
                Média: {formatCurrency(avgCostPerSMS)} por SMS
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Falhas</p>
                <p className="text-2xl font-bold">{analytics.total_failed}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-muted-foreground">
                {formatPercentage(analytics.total_sent > 0 ? (analytics.total_failed / analytics.total_sent) * 100 : 0)} do total
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render delivery trends chart
  const renderDeliveryTrends = () => {
    if (!analytics?.delivery_trends) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Tendências de Entrega
          </CardTitle>
          <CardDescription>
            Evolução das entregas ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.delivery_trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: ptBR })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy', { locale: ptBR })}
                formatter={(value: number, name: string) => [value, STATUS_LABELS[name as keyof typeof STATUS_LABELS] || name]}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="delivered" 
                stackId="1" 
                stroke={STATUS_COLORS.delivered} 
                fill={STATUS_COLORS.delivered}
                name="Entregue"
              />
              <Area 
                type="monotone" 
                dataKey="failed" 
                stackId="1" 
                stroke={STATUS_COLORS.failed} 
                fill={STATUS_COLORS.failed}
                name="Falhou"
              />
              <Area 
                type="monotone" 
                dataKey="pending" 
                stackId="1" 
                stroke={STATUS_COLORS.pending} 
                fill={STATUS_COLORS.pending}
                name="Pendente"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  // Render provider performance
  const renderProviderPerformance = () => {
    if (!analytics?.provider_stats) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Performance por Provedor
          </CardTitle>
          <CardDescription>
            Comparativo de desempenho entre provedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.provider_stats.map((provider) => {
              const deliveryRate = provider.total_sent > 0 
                ? (provider.delivered / provider.total_sent) * 100 
                : 0;
              
              return (
                <div key={provider.provider_name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{provider.provider_name}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span>{provider.total_sent} enviados</span>
                      <Badge variant={deliveryRate >= 95 ? 'default' : deliveryRate >= 90 ? 'secondary' : 'destructive'}>
                        {formatPercentage(deliveryRate)}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={deliveryRate} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Custo total: {formatCurrency(provider.total_cost)}</span>
                    <span>Média: {formatCurrency(provider.total_sent > 0 ? provider.total_cost / provider.total_sent : 0)}/SMS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render hourly distribution
  const renderHourlyDistribution = () => {
    if (!analytics?.hourly_distribution) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Distribuição por Horário
          </CardTitle>
          <CardDescription>
            Volume de envios ao longo do dia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.hourly_distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={(value) => `${value}h`} />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [value, 'SMS enviados']}
                labelFormatter={(value) => `${value}:00`}
              />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  // Render recent messages table
  const renderRecentMessages = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Mensagens Recentes
        </CardTitle>
        <CardDescription>
          Últimas mensagens enviadas com status de entrega
        </CardDescription>
      </CardHeader>
      <CardContent>
        {messagesLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Provedor</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Custo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.slice(0, 10).map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="font-medium">
                      {message.to}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {message.message}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          message.status === 'delivered' ? 'default' :
                          message.status === 'failed' ? 'destructive' :
                          message.status === 'pending' ? 'secondary' : 'outline'
                        }
                      >
                        {STATUS_LABELS[message.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                    </TableCell>
                    <TableCell>{message.provider}</TableCell>
                    <TableCell>
                      {format(new Date(message.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {message.cost ? formatCurrency(message.cost) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma mensagem encontrada no período selecionado
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Main render
  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics SMS</h2>
          <p className="text-muted-foreground">
            Métricas detalhadas e relatórios de entrega
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Provider status */}
      {activeProvider && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            Dados do provedor ativo: <strong>{activeProvider.name}</strong>
            {analytics && (
              <span className="ml-2">
                • {analytics.total_sent} SMS enviados no período selecionado
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Overview cards */}
      {renderOverviewCards()}

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderDeliveryTrends()}
        {renderProviderPerformance()}
        {renderHourlyDistribution()}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Status de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics && (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Entregue', value: analytics.total_delivered, color: STATUS_COLORS.delivered },
                      { name: 'Falhou', value: analytics.total_failed, color: STATUS_COLORS.failed },
                      { name: 'Pendente', value: analytics.total_pending, color: STATUS_COLORS.pending }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {analytics && [
                      { name: 'Entregue', value: analytics.total_delivered, color: STATUS_COLORS.delivered },
                      { name: 'Falhou', value: analytics.total_failed, color: STATUS_COLORS.failed },
                      { name: 'Pendente', value: analytics.total_pending, color: STATUS_COLORS.pending }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, 'SMS']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent messages */}
      {renderRecentMessages()}
    </div>
  );
}