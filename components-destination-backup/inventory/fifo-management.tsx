'use client';

/**
 * Story 11.3: FIFO Management Component
 * Advanced FIFO optimization and expiry management interface
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FIFOManager,
  type FIFOAnalysis,
  type ExpiryAlert,
  type FIFORecommendation
} from '@/lib/inventory';
import { useToast } from '@/hooks/use-toast';

interface FIFOManagementProps {
  onRefresh: () => void;
  className?: string;
}

export function FIFOManagement({ onRefresh, className }: FIFOManagementProps) {
  const [fifoAnalysis, setFifoAnalysis] = useState<FIFOAnalysis[]>([]);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const { toast } = useToast();

  const fifoManager = new FIFOManager();

  useEffect(() => {
    loadFIFOData();
  }, []);

  const loadFIFOData = async () => {
    try {
      setIsLoading(true);

      // Get FIFO analysis
      const { data: analysis, error: analysisError } = await fifoManager.getFIFOAnalysis();
      if (analysisError) {
        throw new Error(analysisError);
      }
      setFifoAnalysis(analysis || []);

      // Get expiry alerts
      const { data: alerts, error: alertsError } = await fifoManager.getExpiryAlerts(30);
      if (alertsError) {
        throw new Error(alertsError);
      }
      setExpiryAlerts(alerts || []);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar dados FIFO';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockExpiringBatches = async () => {
    try {
      const { blocked, error } = await fifoManager.blockExpiringBatches(0);
      
      if (error) {
        throw new Error(error);
      }

      toast({
        title: 'Sucesso',
        description: `${blocked} lotes vencidos foram bloqueados automaticamente`,
      });

      loadFIFOData();
      onRefresh();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao bloquear lotes vencidos';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleExecuteTransfer = async (alert: ExpiryAlert) => {
    try {
      const { success, error } = await fifoManager.executeBatchTransfer({
        lote_id: alert.lote_id,
        centro_custo_origem: alert.centro_custo_principal,
        centro_custo_destino: 'cc001', // Would be selected by user
        quantidade: Math.min(alert.quantidade_disponivel, 50),
        motivo: `Transferência automática - produto vencendo em ${alert.dias_para_vencer} dias`,
        urgente: alert.dias_para_vencer <= 7
      });

      if (!success) {
        throw new Error(error || 'Erro ao executar transferência');
      }

      toast({
        title: 'Sucesso',
        description: 'Transferência executada com sucesso',
      });

      loadFIFOData();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao executar transferência';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'baixa': 'bg-green-100 text-green-800',
      'media': 'bg-yellow-100 text-yellow-800',
      'alta': 'bg-orange-100 text-orange-800',
      'critica': 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critica': return <Icons.AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'alta': return <Icons.AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'media': return <Icons.Info className="h-4 w-4 text-yellow-500" />;
      default: return <Icons.CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestão FIFO</h2>
            <p className="text-muted-foreground">Otimização e controle de vencimentos</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-48 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalExpiring = expiryAlerts.length;
  const criticalAlerts = expiryAlerts.filter(alert => alert.prioridade === 'critica').length;
  const totalWasteValue = expiryAlerts.reduce((sum, alert) => sum + alert.valor_estimado, 0);
  const fifoComplianceScore = fifoAnalysis.length > 0 
    ? Math.round(fifoAnalysis.reduce((sum, analysis) => sum + (analysis.economia_fifo / 100), 0) / fifoAnalysis.length * 100)
    : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão FIFO</h2>
          <p className="text-muted-foreground">
            Otimização de uso e controle de vencimentos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadFIFOData}>
            <Icons.RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleBlockExpiringBatches}
            disabled={criticalAlerts === 0}
          >
            <Icons.Ban className="w-4 h-4 mr-2" />
            Bloquear Vencidos
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              FIFO Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fifoComplianceScore}%</div>
            <Progress value={fifoComplianceScore} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-1">Score de conformidade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produtos Vencendo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalExpiring}</div>
            <div className="flex items-center gap-2 mt-2">
              {criticalAlerts > 0 && (
                <Badge variant="destructive">
                  {criticalAlerts} críticos
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor em Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalWasteValue)}
            </div>
            <p className="text-sm text-muted-foreground">Produtos próximos ao vencimento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Economia FIFO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                fifoAnalysis.reduce((sum, analysis) => sum + analysis.desperdicioEvitado, 0)
              )}
            </div>
            <p className="text-sm text-muted-foreground">Desperdício evitado</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Expiry Alerts */}
      {criticalAlerts > 0 && (
        <Alert variant="destructive">
          <Icons.AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Existem {criticalAlerts} produtos com vencimento crítico que requerem ação imediata.
          </AlertDescription>
        </Alert>
      )}

      {/* Expiry Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.Clock className="h-5 w-5" />
            Alertas de Vencimento
          </CardTitle>
          <CardDescription>
            Produtos que vencem nos próximos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expiryAlerts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiryAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">{alert.nome_produto}</TableCell>
                    <TableCell>{alert.numero_lote}</TableCell>
                    <TableCell>
                      {alert.data_validade.toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getUrgencyIcon(alert.prioridade)}
                        {alert.dias_para_vencer} dias
                      </div>
                    </TableCell>
                    <TableCell>{alert.quantidade_disponivel}</TableCell>
                    <TableCell>{formatCurrency(alert.valor_estimado)}</TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(alert.prioridade)}>
                        {alert.prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleExecuteTransfer(alert)}
                        >
                          <Icons.ArrowUpDown className="w-3 h-3 mr-1" />
                          Transferir
                        </Button>
                        <Button size="sm" variant="outline">
                          <Icons.Users className="w-3 h-3 mr-1" />
                          Usar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Icons.CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground">Nenhum produto próximo ao vencimento</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FIFO Analysis by Product */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.BarChart3 className="h-5 w-5" />
            Análise FIFO por Produto
          </CardTitle>
          <CardDescription>
            Análise detalhada de otimização FIFO por produto
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fifoAnalysis.length > 0 ? (
            <div className="space-y-6">
              {fifoAnalysis.slice(0, 5).map((analysis) => (
                <div key={analysis.produto_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">{analysis.nome_produto}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {analysis.lotes_disponiveis.length} lotes
                      </Badge>
                      <Badge variant="secondary">
                        {formatCurrency(analysis.economia_fifo)} economia
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {analysis.lotes_priorizados.length}
                      </div>
                      <p className="text-sm text-muted-foreground">Lotes Priorizados</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">
                        {analysis.lotes_vencendo.length}
                      </div>
                      <p className="text-sm text-muted-foreground">Vencendo Logo</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(analysis.desperdicioEvitado)}
                      </div>
                      <p className="text-sm text-muted-foreground">Desperdício Evitado</p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {analysis.recomendacoes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Recomendações:</h4>
                      {analysis.recomendacoes.slice(0, 3).map((rec, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                        >
                          <div className="flex items-center gap-2">
                            {getUrgencyIcon(rec.urgencia)}
                            <span>{rec.acao_recomendada}</span>
                          </div>
                          <Badge variant="outline">
                            {formatCurrency(rec.impacto_financeiro)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {fifoAnalysis.length > 5 && (
                <div className="text-center">
                  <Button variant="outline">
                    Ver Todos os Produtos ({fifoAnalysis.length})
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icons.Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma análise FIFO disponível</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FIFO Configuration Quick Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.Settings className="h-5 w-5" />
            Configurações FIFO
          </CardTitle>
          <CardDescription>
            Configurações rápidas de otimização FIFO
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Alertas de Vencimento</span>
                <Badge variant="secondary">30 dias</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bloqueio Automático</span>
                <Badge variant="secondary">7 dias</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Priorização Automática</span>
                <Badge variant="secondary">Ativada</Badge>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Transferências Sugeridas</span>
                <Badge variant="secondary">Ativadas</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Override FIFO</span>
                <Badge variant="outline">Restrito</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Justificativa Obrigatória</span>
                <Badge variant="secondary">Sim</Badge>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button variant="outline">
              <Icons.Settings className="w-4 h-4 mr-2" />
              Configurar FIFO
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}