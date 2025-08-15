/**
 * Reconciliation Dashboard - Banking Integration & Automated Reconciliation
 * NeonPro Healthcare System - Story 4.5 Architecture Alignment
 * 
 * Automated financial reconciliation dashboard with banking integration,
 * real-time transaction matching, discrepancy detection, and audit trails.
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Download, 
  Upload,
  Search,
  Filter,
  Eye,
  Clock,
  CreditCard,
  Building,
  FileText,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

// =================== TYPES ===================

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'business';
  balance: number;
  lastSyncDate: Date;
  isConnected: boolean;
  syncStatus: 'success' | 'error' | 'pending';
}

interface ReconciliationTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  bankAccountId: string;
  systemTransactionId?: string;
  status: 'matched' | 'unmatched' | 'disputed' | 'approved';
  confidence: number;
  matchedWith?: {
    id: string;
    description: string;
    amount: number;
    date: Date;
  };
  notes?: string;
}

interface ReconciliationSummary {
  totalTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  disputedTransactions: number;
  matchRate: number;
  totalAmount: number;
  discrepancies: number;
  period: { start: Date; end: Date };
}

interface DiscrepancyItem {
  id: string;
  type: 'amount_mismatch' | 'missing_transaction' | 'duplicate' | 'date_mismatch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  bankTransaction?: ReconciliationTransaction;
  systemTransaction?: ReconciliationTransaction;
  suggestedAction: string;
  amount: number;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

interface ReconciliationData {
  accounts: BankAccount[];
  transactions: ReconciliationTransaction[];
  summary: ReconciliationSummary;
  discrepancies: DiscrepancyItem[];
  lastReconciliation: Date;
  isLoading: boolean;
  autoReconciliationEnabled: boolean;
}

// =================== HOOKS ===================

const useReconciliationData = () => {
  const [data, setData] = useState<ReconciliationData>({
    accounts: [],
    transactions: [],
    summary: {
      totalTransactions: 0,
      matchedTransactions: 0,
      unmatchedTransactions: 0,
      disputedTransactions: 0,
      matchRate: 0,
      totalAmount: 0,
      discrepancies: 0,
      period: { start: new Date(), end: new Date() },
    },
    discrepancies: [],
    lastReconciliation: new Date(),
    isLoading: true,
    autoReconciliationEnabled: false,
  });

  const fetchReconciliationData = async () => {
    setData(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch('/api/financial/reconciliation/dashboard');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reconciliationData = await response.json();
      
      setData({
        accounts: reconciliationData.accounts || [],
        transactions: reconciliationData.transactions || [],
        summary: reconciliationData.summary || data.summary,
        discrepancies: reconciliationData.discrepancies || [],
        lastReconciliation: new Date(reconciliationData.lastReconciliation),
        isLoading: false,
        autoReconciliationEnabled: reconciliationData.autoReconciliationEnabled || false,
      });
    } catch (error) {
      console.error('Error fetching reconciliation data:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const runReconciliation = async (accountId?: string) => {
    try {
      const response = await fetch('/api/financial/reconciliation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      await fetchReconciliationData();
      return await response.json();
    } catch (error) {
      console.error('Error running reconciliation:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchReconciliationData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchReconciliationData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { data, refreshData: fetchReconciliationData, runReconciliation };
};

// =================== COMPONENTS ===================

const BankAccountCard: React.FC<{ account: BankAccount; onSync: (id: string) => void }> = ({ account, onSync }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Sincronizado';
      case 'error': return 'Erro de Sync';
      case 'pending': return 'Sincronizando...';
      default: return 'Desconectado';
    }
  };

  return (
    <Card className={`border-l-4 ${account.isConnected ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>{account.bankName}</span>
          </div>
          <Badge variant={account.isConnected ? 'default' : 'destructive'}>
            {account.isConnected ? 'Conectado' : 'Desconectado'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Conta: {account.accountNumber} | {account.accountType === 'checking' ? 'Corrente' : 'Poupança'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Saldo Atual</span>
            <span className="text-xl font-semibold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(account.balance)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(account.syncStatus)}`} />
              <span className="text-sm">{getStatusText(account.syncStatus)}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {account.lastSyncDate.toLocaleString('pt-BR')}
            </span>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onSync(account.id)}
            disabled={account.syncStatus === 'pending'}
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${account.syncStatus === 'pending' ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const TransactionMatchingCard: React.FC<{ transaction: ReconciliationTransaction; onApprove: (id: string) => void; onDispute: (id: string) => void }> = ({ 
  transaction, onApprove, onDispute 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched': return 'text-green-600 bg-green-50 border-green-200';
      case 'unmatched': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'disputed': return 'text-red-600 bg-red-50 border-red-200';
      case 'approved': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'matched': return <CheckCircle2 className="h-4 w-4" />;
      case 'unmatched': return <Clock className="h-4 w-4" />;
      case 'disputed': return <XCircle className="h-4 w-4" />;
      case 'approved': return <CheckCircle2 className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`border ${getStatusColor(transaction.status)}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(transaction.status)}
              <span className="font-medium">{transaction.description}</span>
            </div>
            <Badge variant="outline">
              Confiança: {(transaction.confidence * 100).toFixed(0)}%
            </Badge>
          </div>

          {/* Transaction Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Data:</span>
              <span className="ml-2">{transaction.date.toLocaleDateString('pt-BR')}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Valor:</span>
              <span className={`ml-2 font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'credit' ? '+' : '-'}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(transaction.amount))}
              </span>
            </div>
          </div>

          {/* Matching Information */}
          {transaction.matchedWith && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center mb-2">
                <ArrowRight className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Correspondência no Sistema</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <div>{transaction.matchedWith.description}</div>
                <div className="flex justify-between mt-1">
                  <span>{transaction.matchedWith.date.toLocaleDateString('pt-BR')}</span>
                  <span>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.matchedWith.amount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {transaction.status === 'matched' && (
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => onApprove(transaction.id)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Aprovar
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDispute(transaction.id)}>
                <XCircle className="h-4 w-4 mr-2" />
                Contestar
              </Button>
            </div>
          )}

          {transaction.notes && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              <strong>Notas:</strong> {transaction.notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const DiscrepancyList: React.FC<{ discrepancies: DiscrepancyItem[]; onResolve: (id: string) => void }> = ({ 
  discrepancies, onResolve 
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-600 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Eye className="h-4 w-4 text-blue-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (discrepancies.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-green-700 mb-1">Nenhuma Discrepância</h3>
          <p className="text-sm text-muted-foreground">
            Todas as transações estão reconciliadas corretamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {discrepancies.map((discrepancy) => (
        <Card key={discrepancy.id} className={`border-l-4 ${getSeverityColor(discrepancy.severity)}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getSeverityIcon(discrepancy.severity)}
                <div>
                  <h4 className="font-medium">{discrepancy.description}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {discrepancy.suggestedAction}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                    <span>Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discrepancy.amount)}</span>
                    <span>Criado: {discrepancy.createdAt.toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={discrepancy.severity === 'critical' ? 'destructive' : 'secondary'}>
                  {discrepancy.severity === 'critical' ? 'Crítica' :
                   discrepancy.severity === 'high' ? 'Alta' :
                   discrepancy.severity === 'medium' ? 'Média' : 'Baixa'}
                </Badge>
                <Button size="sm" variant="outline" onClick={() => onResolve(discrepancy.id)}>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Resolver
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// =================== MAIN COMPONENT ===================

export const ReconciliationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { data, refreshData, runReconciliation } = useReconciliationData();

  const handleSyncAccount = async (accountId: string) => {
    try {
      await fetch(`/api/financial/reconciliation/sync/${accountId}`, {
        method: 'POST',
      });
      await refreshData();
    } catch (error) {
      console.error('Error syncing account:', error);
    }
  };

  const handleApproveTransaction = async (transactionId: string) => {
    try {
      await fetch(`/api/financial/reconciliation/approve/${transactionId}`, {
        method: 'POST',
      });
      await refreshData();
    } catch (error) {
      console.error('Error approving transaction:', error);
    }
  };

  const handleDisputeTransaction = async (transactionId: string) => {
    try {
      await fetch(`/api/financial/reconciliation/dispute/${transactionId}`, {
        method: 'POST',
      });
      await refreshData();
    } catch (error) {
      console.error('Error disputing transaction:', error);
    }
  };

  const handleResolveDiscrepancy = async (discrepancyId: string) => {
    try {
      await fetch(`/api/financial/reconciliation/resolve/${discrepancyId}`, {
        method: 'POST',
      });
      await refreshData();
    } catch (error) {
      console.error('Error resolving discrepancy:', error);
    }
  };

  const handleRunReconciliation = async () => {
    try {
      await runReconciliation();
    } catch (error) {
      console.error('Error running reconciliation:', error);
    }
  };

  const unmatchedTransactions = data.transactions.filter(t => t.status === 'unmatched');
  const matchedTransactions = data.transactions.filter(t => t.status === 'matched');
  const disputedTransactions = data.transactions.filter(t => t.status === 'disputed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reconciliação Bancária</h1>
          <p className="text-muted-foreground">
            Integração e reconciliação automática com bancos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={refreshData} disabled={data.isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${data.isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={handleRunReconciliation}>
            <CreditCard className="h-4 w-4 mr-2" />
            Executar Reconciliação
          </Button>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            Última: {data.lastReconciliation.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Reconciliação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.summary.matchRate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.matchedTransactions} de {data.summary.totalTransactions} transações
            </p>
            <Progress value={data.summary.matchRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transações Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.unmatchedTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando reconciliação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discrepâncias</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.discrepancies}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(data.summary.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor total das transações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Auto-reconciliation Status */}
      {data.autoReconciliationEnabled && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Reconciliação automática ativada. O sistema processa automaticamente novas transações a cada 15 minutos.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="accounts">Contas Bancárias</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="discrepancies">Discrepâncias</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status das Contas</CardTitle>
                <CardDescription>
                  Estado da conexão com instituições bancárias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.accounts.slice(0, 3).map((account) => (
                    <div key={account.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${account.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm">{account.bankName}</span>
                      </div>
                      <Badge variant={account.isConnected ? 'default' : 'secondary'}>
                        {account.isConnected ? 'Conectado' : 'Desconectado'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>
                  Últimas transações processadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium">{transaction.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.date.toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(transaction.amount))}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {transaction.status === 'matched' ? 'Reconciliado' :
                           transaction.status === 'unmatched' ? 'Pendente' :
                           transaction.status === 'disputed' ? 'Contestado' : 'Aprovado'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.accounts.map((account) => (
              <BankAccountCard
                key={account.id}
                account={account}
                onSync={handleSyncAccount}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Tabs defaultValue="unmatched">
            <TabsList>
              <TabsTrigger value="unmatched">
                Pendentes ({unmatchedTransactions.length})
              </TabsTrigger>
              <TabsTrigger value="matched">
                Reconciliadas ({matchedTransactions.length})
              </TabsTrigger>
              <TabsTrigger value="disputed">
                Contestadas ({disputedTransactions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unmatched" className="space-y-4">
              {unmatchedTransactions.map((transaction) => (
                <TransactionMatchingCard
                  key={transaction.id}
                  transaction={transaction}
                  onApprove={handleApproveTransaction}
                  onDispute={handleDisputeTransaction}
                />
              ))}
            </TabsContent>

            <TabsContent value="matched" className="space-y-4">
              {matchedTransactions.map((transaction) => (
                <TransactionMatchingCard
                  key={transaction.id}
                  transaction={transaction}
                  onApprove={handleApproveTransaction}
                  onDispute={handleDisputeTransaction}
                />
              ))}
            </TabsContent>

            <TabsContent value="disputed" className="space-y-4">
              {disputedTransactions.map((transaction) => (
                <TransactionMatchingCard
                  key={transaction.id}
                  transaction={transaction}
                  onApprove={handleApproveTransaction}
                  onDispute={handleDisputeTransaction}
                />
              ))}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="discrepancies" className="space-y-6">
          <DiscrepancyList 
            discrepancies={data.discrepancies} 
            onResolve={handleResolveDiscrepancy} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReconciliationDashboard;