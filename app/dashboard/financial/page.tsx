"use client";

/**
 * Financial Management Dashboard Page
 * Created: January 27, 2025
 * Purpose: Central dashboard for Epic 4 - Financial Management System
 * Features: Invoice generation, payment tracking, financial reporting
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Icons
import { 
  DollarSign, 
  CreditCard, 
  FileText, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Plus,
  Users,
  Calendar
} from 'lucide-react';

// Components
import { InvoiceManager } from '@/components/financial/invoice-manager';
import { PaymentManager } from '@/components/financial/payment-manager';
import FinancialReportingDashboard from '@/components/financial/financial-reporting-dashboard';
import PredictiveCashFlowDashboard from '@/components/financial/predictive-cash-flow-dashboard';

// Types
import type { Invoice, Payment } from '@/lib/types/financial';

// Services
import { 
  listInvoices, 
  getFinancialSummary,
  generateInvoicePDF
} from '@/lib/supabase/financial';

interface FinancialSummary {
  total_invoices: number;
  total_revenue: number;
  pending_payments: number;
  overdue_invoices: number;
  monthly_revenue: number;
  monthly_growth: number;
  payment_success_rate: number;
}

export default function FinancialDashboard() {
  const router = useRouter();
  
  // State Management
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payments' | 'reports'>('overview');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // Load Data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load summary data
      const summaryResult = await getFinancialSummary();
      setSummary(summaryResult);
      
      // Load recent invoices
      const invoicesResult = await listInvoices({
        page: 1,
        per_page: 10,
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      setInvoices(invoicesResult.invoices);
      
      // TODO: Load recent payments
      // const paymentsResult = await listPayments();
      // setPayments(paymentsResult);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleExportReport = async (type: 'pdf' | 'excel') => {
    try {
      setLoading(true);
      
      const report = await generateFinancialReport({
        format: type,
        date_range: {
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date().toISOString().split('T')[0]
        },
        include_invoices: true,
        include_payments: true,
        include_summary: true
      });
      
      // Create download link
      const blob = new Blob([report.content], { 
        type: type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.${type}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Failed to export report:', error);
      toast.error('Erro ao exportar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const pdfData = await generateInvoicePDF(invoiceId);
      
      // Create download link
      const blob = new Blob([pdfData.content], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fatura-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Fatura baixada com sucesso!');
    } catch (error) {
      console.error('Failed to download invoice:', error);
      toast.error('Erro ao baixar fatura');
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount / 100);
  };

  // Get status badge
  const getInvoiceStatusBadge = (status: Invoice['status']) => {
    const statusMap = {
      'draft': { label: 'Rascunho', color: 'bg-gray-500' },
      'issued': { label: 'Emitida', color: 'bg-blue-500' },
      'sent': { label: 'Enviada', color: 'bg-yellow-500' },
      'paid': { label: 'Paga', color: 'bg-green-500' },
      'cancelled': { label: 'Cancelada', color: 'bg-red-500' },
      'overdue': { label: 'Vencida', color: 'bg-orange-500' },
    };
    
    const { label, color } = statusMap[status] || { label: 'Desconhecido', color: 'bg-gray-500' };
    
    return (
      <Badge className={color}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão Financeira</h1>
          <p className="text-muted-foreground">
            Gerencie faturas, pagamentos e relatórios financeiros
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Export functionality is now handled by the Financial Reporting Dashboard */}
        </div>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="predictive">Previsões</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary ? formatCurrency(summary.total_revenue) : '--'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary && summary.monthly_growth > 0 ? '+' : ''}
                  {summary?.monthly_growth.toFixed(1)}% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturas Emitidas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.total_invoices || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary?.pending_payments || 0} pendentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary?.payment_success_rate.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Pagamentos processados com sucesso
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturas Vencidas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {summary?.overdue_invoices || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requer atenção imediata
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Faturas Recentes</CardTitle>
              <CardDescription>
                Últimas faturas emitidas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma fatura encontrada
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.slice(0, 5).map((invoice) => (
                    <div 
                      key={invoice.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => {
                        setSelectedInvoiceId(invoice.id);
                        setActiveTab('invoices');
                      }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">#{invoice.invoice_number}</span>
                          {getInvoiceStatusBadge(invoice.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.patient?.name || 'Paciente não encontrado'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Emitida: {new Date(invoice.issue_date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="font-semibold">
                          {formatCurrency(invoice.total_amount)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadInvoice(invoice.id);
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <InvoiceManager 
            defaultView={selectedInvoiceId ? 'edit' : 'list'}
            selectedInvoiceId={selectedInvoiceId}
          />
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <PaymentManager />
        </TabsContent>

        {/* Reports Tab - Advanced Financial Reporting Dashboard */}
        <TabsContent value="reports" className="space-y-6">
          <FinancialReportingDashboard 
            clinicId={clinicId || 'default-clinic-id'} 
            className="w-full"
          />
        </TabsContent>

        {/* Predictive Tab - Predictive Cash Flow Analysis */}
        <TabsContent value="predictive" className="space-y-6">
          <PredictiveCashFlowDashboard 
            clinicId={clinicId || 'default-clinic-id'} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}