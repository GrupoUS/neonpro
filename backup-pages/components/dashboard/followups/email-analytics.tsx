'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEmail } from '@/app/hooks/use-email';
import { EmailProvider } from '@/app/types/email';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Loader2, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Eye,
  MousePointer,
  UserCheck
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function EmailAnalytics() {
  const [dateRange, setDateRange] = useState('7days');
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string | 'all'>('all');

  const { analytics, templates, isLoading } = useEmail({
    startDate: getStartDate(dateRange),
    endDate: new Date().toISOString(),
    provider: selectedProvider === 'all' ? undefined : selectedProvider,
    templateId: selectedTemplate === 'all' ? undefined : selectedTemplate
  });

  const summaryCards = useMemo(() => {
    if (!analytics) return [];

    return [
      {
        title: 'Total de Emails',
        value: analytics.totalEmails || 0,
        icon: Mail,
        color: 'blue',
        change: analytics.totalEmailsChange || 0
      },
      {
        title: 'Emails Entregues',
        value: analytics.deliveredEmails || 0,
        icon: CheckCircle,
        color: 'green',
        percentage: analytics.totalEmails ? 
          Math.round((analytics.deliveredEmails / analytics.totalEmails) * 100) : 0
      },
      {
        title: 'Emails Abertos',
        value: analytics.openedEmails || 0,
        icon: Eye,
        color: 'purple',
        percentage: analytics.deliveredEmails ? 
          Math.round((analytics.openedEmails / analytics.deliveredEmails) * 100) : 0
      },
      {
        title: 'Cliques',
        value: analytics.clickedEmails || 0,
        icon: MousePointer,
        color: 'orange',
        percentage: analytics.openedEmails ? 
          Math.round((analytics.clickedEmails / analytics.openedEmails) * 100) : 0
      }
    ];
  }, [analytics]);

  const chartData = useMemo(() => {
    if (!analytics?.dailyStats) return [];

    return analytics.dailyStats.map(stat => ({
      date: format(new Date(stat.date), 'dd/MM', { locale: ptBR }),
      sent: stat.sent || 0,
      delivered: stat.delivered || 0,
      opened: stat.opened || 0,
      clicked: stat.clicked || 0,
      bounced: stat.bounced || 0
    }));
  }, [analytics]);

  const statusData = useMemo(() => {
    if (!analytics) return [];

    return [
      { name: 'Entregues', value: analytics.deliveredEmails || 0, color: '#00C49F' },
      { name: 'Pendentes', value: analytics.pendingEmails || 0, color: '#FFBB28' },
      { name: 'Falharam', value: analytics.failedEmails || 0, color: '#FF8042' },
      { name: 'Rejeitados', value: analytics.bouncedEmails || 0, color: '#8884D8' }
    ];
  }, [analytics]);

  const providerData = useMemo(() => {
    if (!analytics?.providerStats) return [];

    return analytics.providerStats.map((stat, index) => ({
      name: stat.provider,
      emails: stat.totalEmails,
      delivered: stat.deliveredEmails,
      deliveryRate: stat.totalEmails ? 
        Math.round((stat.deliveredEmails / stat.totalEmails) * 100) : 0,
      color: COLORS[index % COLORS.length]
    }));
  }, [analytics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Analytics de Email</h3>
          <p className="text-sm text-muted-foreground">
            Acompanhe o desempenho dos seus emails
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="thisMonth">Este mês</SelectItem>
                  <SelectItem value="lastMonth">Mês passado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Provedor</Label>
              <Select value={selectedProvider} onValueChange={(value: EmailProvider | 'all') => setSelectedProvider(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os provedores</SelectItem>
                  <SelectItem value="postmark">Postmark</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="mailgun">Mailgun</SelectItem>
                  <SelectItem value="smtp">SMTP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os templates</SelectItem>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">
                        {card.value.toLocaleString()}
                      </p>
                      {card.percentage !== undefined && (
                        <Badge variant="secondary">
                          {card.percentage}%
                        </Badge>
                      )}
                    </div>
                    {card.change !== undefined && card.change !== 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className={`h-3 w-3 ${card.change > 0 ? 'text-green-600' : 'text-red-600'}`} />
                        <span className={`text-xs ${card.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {card.change > 0 ? '+' : ''}{card.change}%
                        </span>
                      </div>
                    )}
                  </div>
                  <Icon className={`h-8 w-8 text-${card.color}-500`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Linha - Emails ao longo do tempo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emails ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sent" stroke="#8884d8" name="Enviados" />
                  <Line type="monotone" dataKey="delivered" stroke="#82ca9d" name="Entregues" />
                  <Line type="monotone" dataKey="opened" stroke="#ffc658" name="Abertos" />
                  <Line type="monotone" dataKey="clicked" stroke="#ff7300" name="Clicados" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Status dos Emails */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status dos Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Barras - Desempenho por Provedor */}
      {providerData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Desempenho por Provedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={providerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="emails" fill="#8884d8" name="Total de Emails" />
                  <Bar dataKey="delivered" fill="#82ca9d" name="Entregues" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Templates */}
      {analytics?.templateStats && analytics.templateStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Desempenho por Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Template</th>
                    <th className="text-right p-2">Enviados</th>
                    <th className="text-right p-2">Entregues</th>
                    <th className="text-right p-2">Abertos</th>
                    <th className="text-right p-2">Clicados</th>
                    <th className="text-right p-2">Taxa de Abertura</th>
                    <th className="text-right p-2">Taxa de Clique</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.templateStats.map((stat) => (
                    <tr key={stat.templateId} className="border-b">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{stat.templateName}</p>
                        </div>
                      </td>
                      <td className="text-right p-2">{stat.totalEmails}</td>
                      <td className="text-right p-2">{stat.deliveredEmails}</td>
                      <td className="text-right p-2">{stat.openedEmails}</td>
                      <td className="text-right p-2">{stat.clickedEmails}</td>
                      <td className="text-right p-2">
                        <Badge variant="secondary">
                          {stat.openRate}%
                        </Badge>
                      </td>
                      <td className="text-right p-2">
                        <Badge variant="secondary">
                          {stat.clickRate}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getStartDate(range: string): string {
  const now = new Date();
  
  switch (range) {
    case '7days':
      return subDays(now, 7).toISOString();
    case '30days':
      return subDays(now, 30).toISOString();
    case 'thisMonth':
      return startOfMonth(now).toISOString();
    case 'lastMonth':
      const lastMonth = subDays(startOfMonth(now), 1);
      return startOfMonth(lastMonth).toISOString();
    default:
      return subDays(now, 7).toISOString();
  }
}