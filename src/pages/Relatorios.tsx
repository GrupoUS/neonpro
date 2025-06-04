
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Users, TrendingUp, Download, Filter } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useAppointments } from '@/hooks/useAppointments';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Relatorios = () => {
  const { transacoes, loading: transacoesLoading, calcularMetricas } = useTransactions();
  const { agendamentos, isLoading: agendamentosLoading } = useAppointments();
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [periodoInicio, setPeriodoInicio] = useState<string>('');
  const [periodoFim, setPeriodoFim] = useState<string>('');

  const metricas = calcularMetricas();
  
  // Filtrar dados com base nos filtros selecionados
  const dadosFiltrados = transacoes.filter(transacao => {
    if (filtroTipo !== 'todos' && transacao.tipo !== filtroTipo) return false;
    if (periodoInicio && transacao.data_transacao < periodoInicio) return false;
    if (periodoFim && transacao.data_transacao > periodoFim) return false;
    return true;
  });

  const agendamentosDoMes = agendamentos.filter(agendamento => {
    const dataAgendamento = new Date(agendamento.data_hora);
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    return dataAgendamento >= primeiroDiaMes && dataAgendamento <= ultimoDiaMes;
  });

  const exportarDados = () => {
    const dados = dadosFiltrados.map(t => ({
      Data: t.data_transacao,
      Descrição: t.descricao,
      Valor: t.valor,
      Tipo: t.tipo,
      Categoria: t.categoria
    }));
    
    const csv = [
      Object.keys(dados[0]).join(','),
      ...dados.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio-financeiro.csv';
    a.click();
  };

  if (transacoesLoading || agendamentosLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-neon-brand">Relatórios</h1>
          <p className="text-neon-subtitle mt-1">
            Análise financeira e operacional da clínica
          </p>
        </div>
        <Button onClick={exportarDados} className="btn-neon-gradient">
          <Download className="h-4 w-4 mr-2" />
          Exportar Dados
        </Button>
      </div>

      {/* Filtros */}
      <Card className="card-neon">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="tipo">Tipo de Transação</Label>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="inicio">Data Início</Label>
            <Input
              id="inicio"
              type="date"
              value={periodoInicio}
              onChange={(e) => setPeriodoInicio(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="fim">Data Fim</Label>
            <Input
              id="fim"
              type="date"
              value={periodoFim}
              onChange={(e) => setPeriodoFim(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {metricas.receitasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {metricas.despesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-neon-accent" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metricas.lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {metricas.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="card-neon">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {agendamentosDoMes.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total do mês atual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Transações Filtradas */}
      <Card className="card-neon">
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {dadosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma transação encontrada para os filtros selecionados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dadosFiltrados.slice(0, 10).map((transacao) => (
                <div key={transacao.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{transacao.descricao}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transacao.data_transacao).toLocaleDateString('pt-BR')} • {transacao.categoria}
                    </p>
                  </div>
                  <div className={`font-bold ${transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                    {transacao.tipo === 'receita' ? '+' : '-'}R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;
