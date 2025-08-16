/**
 * NFSe Dashboard - Tax Management & Brazilian Compliance
 * NeonPro Healthcare System - Story 4.4 Architecture Alignment
 *
 * Comprehensive NFSe generation and tax management dashboard for Brazilian
 * aesthetic clinics with municipal integration and automated compliance.
 */

'use client';

import {
  AlertTriangle,
  Building2,
  Calculator,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileText,
  RefreshCw,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// =================== TYPES ===================

type NFSeDocument = {
  id: string;
  numeroNFSe: string;
  numeroRPS: string;
  serie: string;
  dataEmissao: Date;
  competencia: Date;
  status: 'draft' | 'pending' | 'issued' | 'cancelled' | 'error';
  valorServicos: number;
  valorDeducoes: number;
  valorPIS: number;
  valorCOFINS: number;
  valorINSS: number;
  valorIR: number;
  valorCSLL: number;
  valorISSQN: number;
  valorLiquido: number;
  aliquotaISSQN: number;
  itemListaServico: string;
  codigoTributacaoMunicipio: string;
  discriminacao: string;
  municipioPrestacao: string;
  tomador: {
    cnpjCpf: string;
    inscricaoMunicipal?: string;
    razaoSocial: string;
    endereco: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      uf: string;
      cep: string;
    };
    contato?: {
      telefone?: string;
      email?: string;
    };
  };
  tratamentos: Array<{
    id: string;
    nome: string;
    valor: number;
    quantidade: number;
    paciente: string;
  }>;
  protocoloEnvio?: string;
  linkNFSe?: string;
  motivoCancelamento?: string;
  observacoes?: string;
};

type TaxSummary = {
  periodo: { inicio: Date; fim: Date };
  totalServicos: number;
  totalImpostos: number;
  totalLiquido: number;
  totalNFSeEmitidas: number;
  totalCanceladas: number;
  impostos: {
    issqn: number;
    pis: number;
    cofins: number;
    inss: number;
    ir: number;
    csll: number;
  };
  por_municipio: Record<
    string,
    {
      valor: number;
      quantidade: number;
      aliquota: number;
    }
  >;
};

type MunicipalConfig = {
  codigo: string;
  nome: string;
  uf: string;
  webservice_url: string;
  certificado_requerido: boolean;
  versao_schema: string;
  aliquota_padrao: number;
  isss_retido: boolean;
  status_conexao: 'connected' | 'disconnected' | 'error';
  ultimo_teste: Date;
};

type DashboardData = {
  nfseDocuments: NFSeDocument[];
  taxSummary: TaxSummary;
  municipalConfigs: MunicipalConfig[];
  pendingIssues: Array<{
    id: string;
    type: 'config_error' | 'transmission_error' | 'validation_error';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    createdAt: Date;
  }>;
  isLoading: boolean;
};

// =================== HOOKS ===================

const useNFSeData = (dateRange: { start: Date; end: Date }) => {
  const [data, setData] = useState<DashboardData>({
    nfseDocuments: [],
    taxSummary: {
      periodo: dateRange,
      totalServicos: 0,
      totalImpostos: 0,
      totalLiquido: 0,
      totalNFSeEmitidas: 0,
      totalCanceladas: 0,
      impostos: { issqn: 0, pis: 0, cofins: 0, inss: 0, ir: 0, csll: 0 },
      por_municipio: {},
    },
    municipalConfigs: [],
    pendingIssues: [],
    isLoading: true,
  });

  const fetchNFSeData = async () => {
    setData((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/tax/nfse/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const nfseData = await response.json();

      setData({
        nfseDocuments: nfseData.documents || [],
        taxSummary: nfseData.summary || data.taxSummary,
        municipalConfigs: nfseData.municipalConfigs || [],
        pendingIssues: nfseData.issues || [],
        isLoading: false,
      });
    } catch (_error) {
      setData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const generateNFSe = async (tratamentoIds: string[]) => {
    const response = await fetch('/api/tax/nfse/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tratamentoIds }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    await fetchNFSeData();
    return await response.json();
  };

  useEffect(() => {
    fetchNFSeData();
  }, [fetchNFSeData]);

  return { data, refreshData: fetchNFSeData, generateNFSe };
};

// =================== COMPONENTS ===================

const NFSeCard: React.FC<{
  nfse: NFSeDocument;
  onView: (id: string) => void;
  onCancel: (id: string) => void;
}> = ({ nfse, onView, onCancel }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'draft':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'issued':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'draft':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'issued':
        return 'Emitida';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelada';
      case 'error':
        return 'Erro';
      case 'draft':
        return 'Rascunho';
      default:
        return 'Desconhecido';
    }
  };

  const canCancel = nfse.status === 'issued' && !nfse.motivoCancelamento;

  return (
    <Card className={`border ${getStatusColor(nfse.status)}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(nfse.status)}
            <span>NFSe {nfse.numeroNFSe || nfse.numeroRPS}</span>
          </div>
          <Badge variant="outline">{getStatusText(nfse.status)}</Badge>
        </CardTitle>
        <CardDescription>
          {nfse.tomador.razaoSocial} - {nfse.municipioPrestacao}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Valor dos Serviços:</span>
            <div className="font-medium">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(nfse.valorServicos)}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Valor Líquido:</span>
            <div className="font-medium">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(nfse.valorLiquido)}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">ISSQN:</span>
            <div className="font-medium">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(nfse.valorISSQN)}
              <span className="ml-1 text-xs">
                ({(nfse.aliquotaISSQN * 100).toFixed(2)}%)
              </span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Data de Emissão:</span>
            <div className="font-medium">
              {nfse.dataEmissao.toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-muted-foreground text-sm">Tratamentos:</span>
          <div className="text-sm">
            {nfse.tratamentos.slice(0, 2).map((tratamento, index) => (
              <div className="flex justify-between" key={index}>
                <span>{tratamento.nome}</span>
                <span>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(tratamento.valor)}
                </span>
              </div>
            ))}
            {nfse.tratamentos.length > 2 && (
              <div className="text-muted-foreground text-xs">
                +{nfse.tratamentos.length - 2} tratamentos
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={() => onView(nfse.id)} size="sm" variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Visualizar
          </Button>
          {nfse.linkNFSe && (
            <Button asChild size="sm" variant="outline">
              <a href={nfse.linkNFSe} rel="noopener noreferrer" target="_blank">
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          )}
          {canCancel && (
            <Button
              onClick={() => onCancel(nfse.id)}
              size="sm"
              variant="destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          )}
        </div>

        {nfse.protocoloEnvio && (
          <div className="border-t pt-2 text-muted-foreground text-xs">
            <strong>Protocolo:</strong> {nfse.protocoloEnvio}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MunicipalConfigCard: React.FC<{
  config: MunicipalConfig;
  onTest: (codigo: string) => void;
}> = ({ config, onTest }) => {
  const getConnectionColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'border-l-green-500 bg-green-50';
      case 'disconnected':
        return 'border-l-gray-500 bg-gray-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getConnectionIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className={`border-l-4 ${getConnectionColor(config.status_conexao)}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>
              {config.nome}/{config.uf}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {getConnectionIcon(config.status_conexao)}
            {config.certificado_requerido && (
              <Badge variant="outline">Certificado</Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Código: {config.codigo} | Alíquota:{' '}
          {(config.aliquota_padrao * 100).toFixed(2)}%
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Versão do Schema:</span>
            <span>{config.versao_schema}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">ISS Retido:</span>
            <Badge variant={config.isss_retido ? 'default' : 'secondary'}>
              {config.isss_retido ? 'Sim' : 'Não'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Último Teste:</span>
            <span>{config.ultimo_teste.toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={() => onTest(config.codigo)}
          size="sm"
          variant="outline"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Testar Conexão
        </Button>
      </CardContent>
    </Card>
  );
};

const TaxBreakdown: React.FC<{ summary: TaxSummary }> = ({ summary }) => {
  const taxItems = [
    { name: 'ISSQN', value: summary.impostos.issqn, color: 'bg-blue-500' },
    { name: 'PIS', value: summary.impostos.pis, color: 'bg-green-500' },
    { name: 'COFINS', value: summary.impostos.cofins, color: 'bg-yellow-500' },
    { name: 'INSS', value: summary.impostos.inss, color: 'bg-purple-500' },
    { name: 'IR', value: summary.impostos.ir, color: 'bg-red-500' },
    { name: 'CSLL', value: summary.impostos.csll, color: 'bg-orange-500' },
  ];

  const totalTaxes = Object.values(summary.impostos).reduce(
    (sum, tax) => sum + tax,
    0
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="mb-3 font-medium text-sm">Resumo Fiscal</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total de Serviços:</span>
              <span className="font-medium">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(summary.totalServicos)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total de Impostos:</span>
              <span className="font-medium text-red-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(summary.totalImpostos)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Valor Líquido:</span>
              <span className="font-medium text-green-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(summary.totalLiquido)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-medium text-sm">NFSe Emitidas</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Emitidas:</span>
              <span className="font-medium text-green-600">
                {summary.totalNFSeEmitidas}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Canceladas:</span>
              <span className="font-medium text-red-600">
                {summary.totalCanceladas}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Taxa de Sucesso:</span>
              <span className="font-medium">
                {summary.totalNFSeEmitidas > 0
                  ? (
                      ((summary.totalNFSeEmitidas - summary.totalCanceladas) /
                        summary.totalNFSeEmitidas) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-3 font-medium text-sm">Detalhamento dos Impostos</h4>
        <div className="space-y-3">
          {taxItems
            .filter((item) => item.value > 0)
            .sort((a, b) => b.value - a.value)
            .map((tax) => {
              const percentage =
                totalTaxes > 0 ? (tax.value / totalTaxes) * 100 : 0;
              return (
                <div className="space-y-1" key={tax.name}>
                  <div className="flex justify-between text-sm">
                    <span>{tax.name}</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(tax.value)}
                    </span>
                  </div>
                  <Progress className={`h-2 ${tax.color}`} value={percentage} />
                  <div className="text-right text-muted-foreground text-xs">
                    {percentage.toFixed(1)}% do total de impostos
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {Object.keys(summary.por_municipio).length > 0 && (
        <div>
          <h4 className="mb-3 font-medium text-sm">
            Distribuição por Município
          </h4>
          <div className="space-y-2">
            {Object.entries(summary.por_municipio)
              .sort(([, a], [, b]) => b.valor - a.valor)
              .slice(0, 5)
              .map(([municipio, data]) => (
                <div
                  className="flex items-center justify-between text-sm"
                  key={municipio}
                >
                  <div>
                    <div className="font-medium">{municipio}</div>
                    <div className="text-muted-foreground text-xs">
                      {data.quantidade} NFSe •{' '}
                      {(data.aliquota * 100).toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(data.valor)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// =================== MAIN COMPONENT ===================

export const NFSeDashboard: React.FC = () => {
  const [dateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    end: new Date(),
  });

  const [activeTab, setActiveTab] = useState('overview');
  const { data, refreshData, generateNFSe } = useNFSeData(dateRange);

  const handleViewNFSe = (_id: string) => {};

  const handleCancelNFSe = async (id: string) => {
    try {
      await fetch(`/api/tax/nfse/cancel/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motivo: 'Cancelamento solicitado pelo usuário',
        }),
      });
      await refreshData();
    } catch (_error) {}
  };

  const handleTestConnection = async (municipalCode: string) => {
    try {
      await fetch(`/api/tax/nfse/test-connection/${municipalCode}`, {
        method: 'POST',
      });
      await refreshData();
    } catch (_error) {}
  };

  const handleGenerateReport = async () => {
    try {
      const response = await fetch('/api/tax/nfse/reports/fiscal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: dateRange.start.toISOString(),
          endDate: dateRange.end.toISOString(),
          format: 'pdf',
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `relatorio-fiscal-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (_error) {}
  };

  const criticalIssues = data.pendingIssues.filter(
    (issue) => issue.severity === 'critical'
  );
  const draftDocuments = data.nfseDocuments.filter(
    (doc) => doc.status === 'draft'
  );
  const pendingDocuments = data.nfseDocuments.filter(
    (doc) => doc.status === 'pending'
  );
  const errorDocuments = data.nfseDocuments.filter(
    (doc) => doc.status === 'error'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            NFSe - Gestão Fiscal
          </h1>
          <p className="text-muted-foreground">
            Emissão e gerenciamento de Notas Fiscais de Serviços Eletrônicas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            disabled={data.isLoading}
            onClick={refreshData}
            variant="outline"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${data.isLoading ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
          <Button onClick={handleGenerateReport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Relatório Fiscal
          </Button>
        </div>
      </div>

      {/* Critical Issues Alert */}
      {criticalIssues.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>
              {criticalIssues.length} problema(s) crítico(s) detectado(s):
            </strong>
            <ul className="mt-1 list-inside list-disc">
              {criticalIssues.slice(0, 2).map((issue) => (
                <li key={issue.id}>{issue.description}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">NFSe Emitidas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {data.taxSummary.totalNFSeEmitidas}
            </div>
            <p className="text-muted-foreground text-xs">
              {data.taxSummary.totalCanceladas} canceladas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Valor dos Serviços
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                notation: 'compact',
              }).format(data.taxSummary.totalServicos)}
            </div>
            <p className="text-muted-foreground text-xs">
              Total faturado no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Total de Impostos
            </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-red-600">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                notation: 'compact',
              }).format(data.taxSummary.totalImpostos)}
            </div>
            <p className="text-muted-foreground text-xs">
              {data.taxSummary.totalServicos > 0
                ? (
                    (data.taxSummary.totalImpostos /
                      data.taxSummary.totalServicos) *
                    100
                  ).toFixed(1)
                : 0}
              % da receita
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Valor Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl text-green-600">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                notation: 'compact',
              }).format(data.taxSummary.totalLiquido)}
            </div>
            <p className="text-muted-foreground text-xs">Após impostos</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs onValueChange={setActiveTab} value={activeTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="documents">
            Documentos
            {draftDocuments.length +
              pendingDocuments.length +
              errorDocuments.length >
              0 && (
              <Badge className="ml-2" variant="secondary">
                {draftDocuments.length +
                  pendingDocuments.length +
                  errorDocuments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resumo Fiscal</CardTitle>
                <CardDescription>
                  Análise dos impostos e faturamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaxBreakdown summary={data.taxSummary} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status dos Municípios</CardTitle>
                <CardDescription>Conexão com prefeituras</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.municipalConfigs.slice(0, 5).map((config) => (
                    <div
                      className="flex items-center justify-between"
                      key={config.codigo}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            config.status_conexao === 'connected'
                              ? 'bg-green-500'
                              : config.status_conexao === 'error'
                                ? 'bg-red-500'
                                : 'bg-gray-500'
                          }`}
                        />
                        <span className="text-sm">
                          {config.nome}/{config.uf}
                        </span>
                      </div>
                      <Badge
                        variant={
                          config.status_conexao === 'connected'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {config.status_conexao === 'connected'
                          ? 'OK'
                          : config.status_conexao === 'error'
                            ? 'Erro'
                            : 'Offline'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="space-y-6" value="documents">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">
                Todas ({data.nfseDocuments.length})
              </TabsTrigger>
              <TabsTrigger value="draft">
                Rascunhos ({draftDocuments.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pendentes ({pendingDocuments.length})
              </TabsTrigger>
              <TabsTrigger value="error">
                Com Erro ({errorDocuments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-4" value="all">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.nfseDocuments.map((nfse) => (
                  <NFSeCard
                    key={nfse.id}
                    nfse={nfse}
                    onCancel={handleCancelNFSe}
                    onView={handleViewNFSe}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent className="space-y-4" value="draft">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {draftDocuments.map((nfse) => (
                  <NFSeCard
                    key={nfse.id}
                    nfse={nfse}
                    onCancel={handleCancelNFSe}
                    onView={handleViewNFSe}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent className="space-y-4" value="pending">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingDocuments.map((nfse) => (
                  <NFSeCard
                    key={nfse.id}
                    nfse={nfse}
                    onCancel={handleCancelNFSe}
                    onView={handleViewNFSe}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent className="space-y-4" value="error">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {errorDocuments.map((nfse) => (
                  <NFSeCard
                    key={nfse.id}
                    nfse={nfse}
                    onCancel={handleCancelNFSe}
                    onView={handleViewNFSe}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent className="space-y-6" value="config">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.municipalConfigs.map((config) => (
              <MunicipalConfigCard
                config={config}
                key={config.codigo}
                onTest={handleTestConnection}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent className="space-y-6" value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Fiscais</CardTitle>
              <CardDescription>
                Gere relatórios para análise e compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full" onClick={handleGenerateReport}>
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório Fiscal Completo (PDF)
                </Button>
                <p className="text-muted-foreground text-sm">
                  O relatório incluirá todas as NFSe emitidas, impostos
                  coletados e análise por município para o período selecionado.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NFSeDashboard;
