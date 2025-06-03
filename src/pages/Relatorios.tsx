import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePatients } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';
import { useTransactions } from '@/hooks/useTransactions';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  Target,
  Activity,
  Download,
  Filter
} from 'lucide-react';

interface MetricasPeriodo {
  periodo: string;
  consultas: number;
  novosClientes: number;
  receita: number;
  cancelamentos: number;
  taxaOcupacao: number;
  ticketMedio: number;
}

const Relatorios: React.FC = () => {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('30');
  const { patients } = usePatients();
  const { appointments } = useAppointments();
  const { transacoes, calcularMetricas } = useTransactions();

  // Calcular métricas do período
  const calcularMetricasPeriodo = (): MetricasPeriodo => {
    const agora = new Date();
    const diasAtras = new Date();
    diasAtras.setDate(agora.getDate() - parseInt(periodoSelecionado));

    const consultasPeriodo = appointments.filter(app => 
      new Date(app.data_agendamento) >= diasAtras
    );

    const clientesPeriodo = patients.filter(client => 
      new Date(client.created_at) >= diasAtras
    );

    const receitaPeriodo = transacoes
      .filter(trans => 
        trans.tipo === 'receita' && 
        new Date(trans.data_transacao) >= diasAtras
      )
      .reduce((total, trans) => total + trans.valor, 0);

    const cancelamentosPeriodo = consultasPeriodo.filter(app => 
      app.status === 'cancelado'
    ).length;

    const diasUteis = parseInt(periodoSelecionado);
    const consultasPossiveis = diasUteis * 10; // Assumindo 10 consultas por dia
    const taxaOcupacao = (consultasPeriodo.length / consultasPossiveis) * 100;

    const ticketMedio = consultasPeriodo.length > 0 
      ? receitaPeriodo / consultasPeriodo.length 
      : 0;

    return {
      periodo: `${periodoSelecionado} dias`,
      consultas: consultasPeriodo.length,
      novosClientes: clientesPeriodo.length,
      receita: receitaPeriodo,
      cancelamentos: cancelamentosPeriodo,
      taxaOcupacao: Math.min(taxaOcupacao, 100),
      ticketMedio
    };
  };

  const metricas = calcularMetricasPeriodo();

  // Dados para gráficos (simulados)
  const dadosConsultasPorDia = Array.from({ length: 7 }, (_, i) => ({
    dia: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'][i],
    consultas: Math.floor(Math.random() * 12) + 3
  }));

  const dadosReceitaPorMes = Array.from({ length: 6 }, (_, i) => {
    const data = new Date();
    data.setMonth(data.getMonth() - i);
    return {
      mes: data.toLocaleDateString('pt-BR', { month: 'short' }),
      receita: Math.floor(Math.random() * 15000) + 5000
    };
  }).reverse();

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Relatórios e Analytics</h1>
          <p className="text-muted-foreground">
            Métricas e análises detalhadas da clínica
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Realizadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.consultas}</div>
            <p className="text-xs text-muted-foreground">
              {metricas.periodo}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.novosClientes}</div>
            <p className="text-xs text-muted-foreground">
              {metricas.periodo}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(metricas.receita)}</div>
            <p className="text-xs text-muted-foreground">
              {metricas.periodo}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.taxaOcupacao.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metricas.periodo}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatarMoeda(metricas.ticketMedio)}</div>
            <p className="text-xs text-muted-foreground">
              Por consulta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelamentos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.cancelamentos}</div>
            <p className="text-xs text-muted-foreground">
              {metricas.consultas > 0 ? ((metricas.cancelamentos / metricas.consultas) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((metricas.consultas - metricas.cancelamentos) / Math.max(metricas.consultas, 1) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Consultas realizadas vs agendadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Consultas por Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Consultas por Dia da Semana
            </CardTitle>
            <CardDescription>
              Distribuição de consultas nos últimos {periodoSelecionado} dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dadosConsultasPorDia.map((dia) => (
                <div key={dia.dia} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-sm font-medium">{dia.dia}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(dia.consultas / 15) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{dia.consultas}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Receita por Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Evolução da Receita
            </CardTitle>
            <CardDescription>
              Receita mensal dos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dadosReceitaPorMes.map((mes, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-sm font-medium">{mes.mes}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${(mes.receita / 20000) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium w-20 text-right">
                    {formatarMoeda(mes.receita)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights e Recomendações</CardTitle>
          <CardDescription>
            Análise automática dos dados da clínica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metricas.taxaOcupacao > 80 && (
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium">Alta Taxa de Ocupação</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Sua taxa de ocupação está excelente ({metricas.taxaOcupacao.toFixed(1)}%). 
                  Considere expandir os horários ou contratar mais profissionais.
                </p>
              </div>
            )}

            {metricas.cancelamentos > metricas.consultas * 0.15 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Taxa de Cancelamento Elevada</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {((metricas.cancelamentos / metricas.consultas) * 100).toFixed(1)}% das consultas foram canceladas. 
                  Considere implementar lembretes automáticos ou políticas de confirmação.
                </p>
              </div>
            )}

            {metricas.novosClientes > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Crescimento de Clientes</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {metricas.novosClientes} novos clientes nos últimos {periodoSelecionado} dias. 
                  Continue focando na qualidade do atendimento para manter esse crescimento.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;
