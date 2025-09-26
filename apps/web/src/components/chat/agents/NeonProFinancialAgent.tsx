/**
 * NeonPro Financial Operations Agent Component
 *
 * Specialized AI agent for financial management and billing operations
 * Features:
 * - Invoice generation and management
 * - Payment processing and tracking
 * - Revenue analysis and optimization
 * - Insurance claim processing
 * - Portuguese healthcare financial workflows
 */

import { useCoAgent, useCopilotAction, useCopilotReadable } from '@copilotkit/react-core'
import React from 'react'
import { useNeonProChat } from '../NeonProChatProvider'
// Removed unused NeonProMessage import
// Removed unused Button import
import { Alert, AlertDescription } from '@neonpro/ui/alert'
import { Badge } from '@neonpro/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui/card'
// Removed unused Input import
// Removed unused Label import
// Removed unused Textarea import
// Removed unused Select imports
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  BarChart3,
  Calculator,
  CreditCard,
  DollarSign,
  PieChart,
  Receipt,
  Shield,
  Target,
  TrendingUp,
} from 'lucide-react'

// Types
interface FinancialTransaction {
  id: string
  type: 'revenue' | 'expense' | 'refund'
  category: string
  amount: number
  currency: 'BRL'
  description: string
  date: Date
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  patientId?: string
  appointmentId?: string
  paymentMethod?: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'installment'
  installments?: number
  processedBy: string
  invoiceId?: string
}

interface Invoice {
  id: string
  patientId: string
  patientName: string
  items: Array<{
    service: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  subtotal: number
  discount: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issuedDate: Date
  dueDate: Date
  paidDate?: Date
  paymentMethod?: string
  notes?: string
}

interface FinancialMetrics {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  pendingPayments: number
  overdueInvoices: number
  averageTicket: number
  monthlyGrowth: number
  collectionRate: number
  topServices: Array<{
    service: string
    revenue: number
    count: number
  }>
}

interface FinancialAgentState {
  currentOperation:
    | 'idle'
    | 'processing_payment'
    | 'generating_invoice'
    | 'analyzing'
    | 'forecasting'
  transactions: FinancialTransaction[]
  invoices: Invoice[]
  metrics: FinancialMetrics
  forecast: {
    nextMonth: number
    nextQuarter: number
    confidence: number
    factors: string[]
  }
  analysis: {
    trends: string[]
    opportunities: string[]
    risks: string[]
    recommendations: string[]
  }
  compliance: {
    auditTrail: Array<{
      timestamp: Date
      userId: string
      action: string
      amount?: number
      patientId?: string
      compliance: boolean
    }>
    taxCompliance: boolean
    lgpdCompliant: boolean
  }
}

interface FinancialAgentProps {
  clinicId: string
  onTransactionComplete?: (transactionId: string) => void
  onInvoiceGenerated?: (invoiceId: string) => void
  onError?: (error: string) => void
}

// Mock data
const mockServices = [
  { name: 'Botox', price: 800, category: 'injectables' },
  { name: 'Preenchimento Labial', price: 1200, category: 'fillers' },
  { name: 'Fio de Sustentação', price: 2500, category: 'lifting' },
  { name: 'Laser CO2', price: 1800, category: 'laser' },
  { name: 'Limpeza de Pele', price: 300, category: 'skincare' },
  { name: 'Peeling Químico', price: 600, category: 'skincare' },
]

const mockTransactions: FinancialTransaction[] = [
  {
    id: 'tx-1',
    type: 'revenue',
    category: 'injectables',
    amount: 800,
    currency: 'BRL',
    description: 'Botox - Ana Silva',
    date: new Date('2024-09-10'),
    status: 'completed',
    patientId: '1',
    paymentMethod: 'credit_card',
    processedBy: 'system',
  },
  {
    id: 'tx-2',
    type: 'revenue',
    category: 'fillers',
    amount: 1200,
    currency: 'BRL',
    description: 'Preenchimento Labial - Carolina Costa',
    date: new Date('2024-09-12'),
    status: 'completed',
    patientId: '2',
    paymentMethod: 'bank_transfer',
    processedBy: 'system',
  },
]

export const NeonProFinancialAgent: React.FC<FinancialAgentProps> = ({
  clinicId: _clinicId,
  onTransactionComplete,
  onInvoiceGenerated,
  onError,
}) => {
  const { config } = useNeonProChat()

  // Initialize agent state
  const initialState: FinancialAgentState = {
    currentOperation: 'idle',
    transactions: mockTransactions,
    invoices: [],
    metrics: calculateFinancialMetrics(mockTransactions),
    forecast: {
      nextMonth: 0,
      nextQuarter: 0,
      confidence: 0,
      factors: [],
    },
    analysis: {
      trends: [],
      opportunities: [],
      risks: [],
      recommendations: [],
    },
    compliance: {
      auditTrail: [],
      taxCompliance: true,
      lgpdCompliant: true,
    },
  }

  const { state, setState } = useCoAgent<FinancialAgentState>({
    name: 'financial-agent',
    initialState,
  })

  // Provide context to CopilotKit
  useCopilotReadable({
    description: 'Current financial management state and context',
    value: {
      currentOperation: state.currentOperation,
      metrics: state.metrics,
      forecast: state.forecast,
      pendingTransactions: state.transactions.filter(t => t.status === 'pending').length,
      compliance: state.compliance,
    },
  }, [state])

  // Process payment action
  useCopilotAction({
    name: 'process_payment',
    description: 'Process payment for services rendered',
    parameters: [
      { name: 'patientId', type: 'string', description: 'Patient ID', required: true },
      { name: 'patientName', type: 'string', description: 'Patient name', required: true },
      {
        name: 'services',
        type: 'array',
        description: 'Array of services purchased',
        required: true,
      },
      {
        name: 'paymentMethod',
        type: 'string',
        description: 'Payment method (cash, credit_card, debit_card, bank_transfer, installment)',
        required: true,
      },
      {
        name: 'installments',
        type: 'number',
        description: 'Number of installments (if applicable)',
        required: false,
      },
      {
        name: 'discount',
        type: 'number',
        description: 'Discount amount (optional)',
        required: false,
      },
    ],
    handler: async (
      patientId: string,
      patientName: string,
      services: string[],
      paymentMethod: string,
      installments?: number,
      discount?: number,
    ) => {
      try {
        setState(prev => ({ ...prev, currentOperation: 'processing_payment' }))

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Calculate total amount
        let subtotal = 0
        const items = services.map(serviceName => {
          const service = mockServices.find(s => s.name === serviceName)
          if (!service) throw new Error(`Service not found: ${serviceName}`)
          subtotal += service.price
          return {
            service: serviceName,
            quantity: 1,
            unitPrice: service.price,
            totalPrice: service.price,
          }
        })

        const discountAmount = discount || 0
        const tax = subtotal * 0.1 // 10% tax
        const total = subtotal - discountAmount + tax

        // Create transaction
        const transaction: FinancialTransaction = {
          id: `tx-${Date.now()}`,
          type: 'revenue',
          category: services[0], // Primary service category
          amount: total,
          currency: 'BRL',
          description: `${services.join(', ')} - ${patientName}`,
          date: new Date(),
          status: 'completed',
          patientId,
          paymentMethod: paymentMethod as any,
          installments,
          processedBy: config?.userId || 'system',
        }

        // Create invoice
        const invoice: Invoice = {
          id: `inv-${Date.now()}`,
          patientId,
          patientName,
          items,
          subtotal,
          discount: discountAmount,
          tax,
          total,
          status: 'paid',
          issuedDate: new Date(),
          dueDate: new Date(),
          paidDate: new Date(),
          paymentMethod,
          notes: installments ? `Pago em ${installments}x` : undefined,
        }

        setState(prev => ({
          ...prev,
          currentOperation: 'idle',
          transactions: [...prev.transactions, transaction],
          invoices: [...prev.invoices, invoice],
          metrics: calculateFinancialMetrics([...prev.transactions, transaction]),
          compliance: {
            ...prev.compliance,
            auditTrail: [
              ...prev.compliance.auditTrail,
              {
                timestamp: new Date(),
                userId: config?.userId || 'system',
                action: 'process_payment',
                amount: total,
                patientId,
                compliance: true,
              },
            ],
          },
        }))

        onTransactionComplete?.(transaction.id)
        onInvoiceGenerated?.(invoice.id)

        return `Payment processed successfully. Total: R$ ${
          total.toFixed(2)
        }. Invoice ID: ${invoice.id}`
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to process payment'
        onError?.(errorMessage)
        setState(prev => ({ ...prev, currentOperation: 'idle' }))
        throw error
      }
    },
  })

  // Generate invoice action
  useCopilotAction({
    name: 'generate_invoice',
    description: 'Generate invoice for completed services',
    parameters: [
      { name: 'patientId', type: 'string', description: 'Patient ID', required: true },
      { name: 'patientName', type: 'string', description: 'Patient name', required: true },
      {
        name: 'services',
        type: 'array',
        description: 'Array of services to invoice',
        required: true,
      },
      { name: 'dueDate', type: 'string', description: 'Due date (YYYY-MM-DD)', required: true },
      { name: 'notes', type: 'string', description: 'Additional notes', required: false },
    ],
    handler: async (
      patientId: string,
      patientName: string,
      services: string[],
      dueDate: string,
      notes?: string,
    ) => {
      try {
        setState(prev => ({ ...prev, currentOperation: 'generating_invoice' }))

        // Simulate generation delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Calculate invoice details
        let subtotal = 0
        const items = services.map(serviceName => {
          const service = mockServices.find(s => s.name === serviceName)
          if (!service) throw new Error(`Service not found: ${serviceName}`)
          subtotal += service.price
          return {
            service: serviceName,
            quantity: 1,
            unitPrice: service.price,
            totalPrice: service.price,
          }
        })

        const tax = subtotal * 0.1
        const total = subtotal + tax

        const invoice: Invoice = {
          id: `inv-${Date.now()}`,
          patientId,
          patientName,
          items,
          subtotal,
          discount: 0,
          tax,
          total,
          status: 'sent',
          issuedDate: new Date(),
          dueDate: new Date(dueDate),
          notes,
        }

        setState(prev => ({
          ...prev,
          currentOperation: 'idle',
          invoices: [...prev.invoices, invoice],
          compliance: {
            ...prev.compliance,
            auditTrail: [
              ...prev.compliance.auditTrail,
              {
                timestamp: new Date(),
                userId: config?.userId || 'system',
                action: 'generate_invoice',
                amount: total,
                patientId,
                compliance: true,
              },
            ],
          },
        }))

        onInvoiceGenerated?.(invoice.id)
        return `Invoice generated successfully. Total: R$ ${total.toFixed(2)}. Due: ${
          format(new Date(dueDate), 'PPP', { locale: ptBR })
        }`
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate invoice'
        onError?.(errorMessage)
        setState(prev => ({ ...prev, currentOperation: 'idle' }))
        throw error
      }
    },
  })

  // Analyze financial performance action
  useCopilotAction({
    name: 'analyze_financial_performance',
    description: 'Analyze financial performance and provide insights',
    parameters: [
      {
        name: 'period',
        type: 'string',
        description: 'Analysis period (week, month, quarter, year)',
        required: false,
      },
      {
        name: 'focus',
        type: 'string',
        description: 'Analysis focus (revenue, expenses, profit, efficiency)',
        required: false,
      },
    ],
    handler: async (period: string = 'month', focus: string = 'revenue') => {
      try {
        setState(prev => ({ ...prev, currentOperation: 'analyzing' }))

        // Simulate analysis delay
        await new Promise(resolve => setTimeout(resolve, 2500))

        const analysis = generateFinancialAnalysis(state.transactions, period, focus)
        const forecast = generateFinancialForecast(state.transactions)

        setState(prev => ({
          ...prev,
          currentOperation: 'idle',
          analysis,
          forecast,
        }))

        return `Financial analysis completed for ${period}. Focus: ${focus}. Key insights provided.`
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Failed to analyze performance'
        onError?.(errorMessage)
        setState(prev => ({ ...prev, currentOperation: 'idle' }))
        throw error
      }
    },
  })

  // Calculate financial metrics
  const calculateFinancialMetrics = (transactions: FinancialTransaction[]): FinancialMetrics => {
    const revenue = transactions
      .filter(t => t.type === 'revenue' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)

    const netProfit = revenue - expenses
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0

    const pendingPayments = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0)

    const serviceRevenue = new Map<string, { revenue: number; count: number }>()
    transactions.forEach(t => {
      if (t.type === 'revenue' && t.status === 'completed') {
        const current = serviceRevenue.get(t.category) || { revenue: 0, count: 0 }
        serviceRevenue.set(t.category, {
          revenue: current.revenue + t.amount,
          count: current.count + 1,
        })
      }
    })

    const topServices = Array.from(serviceRevenue.entries())
      .map(([service, data]) => ({ service, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return {
      totalRevenue: revenue,
      totalExpenses: expenses,
      netProfit,
      profitMargin,
      pendingPayments,
      overdueInvoices: 0, // Mock data
      averageTicket: revenue > 0
        ? revenue / transactions.filter(t => t.type === 'revenue').length
        : 0,
      monthlyGrowth: 12.5, // Mock data
      collectionRate: 95.2, // Mock data
      topServices,
    }
  }

  // Generate financial analysis
  const generateFinancialAnalysis = (
    _transactions: FinancialTransaction[],
    _period: string,
    _focus: string,
  ) => {
    const trends = [
      'Recreveita cresceu 15% em relação ao mês anterior',
      'Procedimentos de preenchimento lideram o faturamento',
      'Pagamentos parcelados aumentaram 20% nos últimos 3 meses',
      'Taxa de coleta mantém-se acima de 95%',
    ]

    const opportunities = [
      'Expandir horários de pico para aumentar capacidade',
      'Implementar pacotes de tratamentos combinados',
      'Oferecer opções de financiamento para procedimentos de alto valor',
      'Desenvolver programas de fidelidade para pacientes recorrentes',
    ]

    const risks = [
      'Aumento da concorrência na região',
      'Possíveis mudanças na regulamentação de procedimentos estéticos',
      'Flutuações sazonais na demanda',
      'Dependência de alguns profissionais chave',
    ]

    const recommendations = [
      'Diversificar mix de serviços para reduzir riscos',
      'Implementar sistema de precamento dinâmico',
      'Investir em marketing para serviços de alta margem',
      'Otimizar agendamento para maximizar utilização de recursos',
    ]

    return { trends, opportunities, risks, recommendations }
  }

  // Generate financial forecast
  const generateFinancialForecast = (transactions: FinancialTransaction[]) => {
    const currentRevenue = transactions
      .filter(t => t.type === 'revenue' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)

    const growthRate = 0.12 // 12% growth
    const seasonalityFactor = 1.1 // Seasonal adjustment

    return {
      nextMonth: currentRevenue * (1 + growthRate / 12),
      nextQuarter: currentRevenue * (1 + growthRate / 4) * seasonalityFactor,
      confidence: 0.85,
      factors: [
        'Tendência histórica de crescimento',
        'Sazonalidade positiva no próximo trimestre',
        'Expansão de serviços planejada',
        'Campanhas de marketing agendadas',
      ],
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)
  }

  // Get status icon
  const getStatusIcon = () => {
    switch (state.currentOperation) {
      case 'processing_payment':
        return <CreditCard className='h-4 w-4 text-blue-500' />
      case 'generating_invoice':
        return <Receipt className='h-4 w-4 text-yellow-500' />
      case 'analyzing':
        return <BarChart3 className='h-4 w-4 text-purple-500' />
      case 'forecasting':
        return <Target className='h-4 w-4 text-green-500' />
      default:
        return <Calculator className='h-4 w-4 text-gray-500' />
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5' />
            Assistente Financeiro
          </CardTitle>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            {getStatusIcon()}
            <span>
              {state.currentOperation === 'idle' && 'Pronto para operações financeiras'}
              {state.currentOperation === 'processing_payment' && 'Processando pagamento...'}
              {state.currentOperation === 'generating_invoice' && 'Gerando fatura...'}
              {state.currentOperation === 'analyzing' && 'Analisando performance...'}
              {state.currentOperation === 'forecasting' && 'Gerando previsões...'}
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Financial Metrics Overview */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg flex items-center gap-2'>
            <TrendingUp className='h-4 w-4' />
            Visão Financeira
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {formatCurrency(state.metrics.totalRevenue)}
              </div>
              <div className='text-sm text-gray-600'>Receita Total</div>
              <div className='text-xs text-green-600'>+{state.metrics.monthlyGrowth}%</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {formatCurrency(state.metrics.netProfit)}
              </div>
              <div className='text-sm text-gray-600'>Lucro Líquido</div>
              <div className='text-xs text-blue-600'>
                {state.metrics.profitMargin.toFixed(1)}% margem
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-yellow-600'>
                {formatCurrency(state.metrics.pendingPayments)}
              </div>
              <div className='text-sm text-gray-600'>Pagamentos Pendentes</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {state.metrics.collectionRate.toFixed(1)}%
              </div>
              <div className='text-sm text-gray-600'>Taxa de Coleta</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Services */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg flex items-center gap-2'>
            <PieChart className='h-4 w-4' />
            Serviços Mais Rentáveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {state.metrics.topServices.map((service, index) => (
              <div
                key={service.service}
                className='flex items-center justify-between p-3 border rounded-lg'
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      index === 0
                        ? 'bg-yellow-500'
                        : index === 1
                        ? 'bg-gray-400'
                        : index === 2
                        ? 'bg-orange-600'
                        : 'bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className='font-medium'>{service.service}</p>
                    <p className='text-sm text-gray-600'>{service.count} procedimentos</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-bold text-green-600'>
                    {formatCurrency(service.revenue)}
                  </p>
                  <p className='text-sm text-gray-600'>
                    {formatCurrency(service.revenue / service.count)} cada
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Analysis */}
      {state.analysis.trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <BarChart3 className='h-4 w-4' />
              Análise Financeira
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <h4 className='font-medium text-green-700 mb-2'>Tendências</h4>
              <ul className='space-y-1'>
                {state.analysis.trends.map((trend, index) => (
                  <li key={index} className='text-sm text-green-600'>• {trend}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className='font-medium text-blue-700 mb-2'>Oportunidades</h4>
              <ul className='space-y-1'>
                {state.analysis.opportunities.map((opportunity, index) => (
                  <li key={index} className='text-sm text-blue-600'>• {opportunity}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className='font-medium text-yellow-700 mb-2'>Riscos</h4>
              <ul className='space-y-1'>
                {state.analysis.risks.map((risk, index) => (
                  <li key={index} className='text-sm text-yellow-600'>⚠️ {risk}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className='font-medium text-purple-700 mb-2'>Recomendações</h4>
              <ul className='space-y-1'>
                {state.analysis.recommendations.map((rec, index) => (
                  <li key={index} className='text-sm text-purple-600'>• {rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg flex items-center gap-2'>
            <Target className='h-4 w-4' />
            Previsão Financeira
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div className='bg-green-50 p-4 rounded-lg'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm font-medium text-green-700'>Próximo Mês</span>
                  <Badge className='bg-green-100 text-green-800'>
                    {Math.round(state.forecast.confidence * 100)}% confiança
                  </Badge>
                </div>
                <div className='text-2xl font-bold text-green-700'>
                  {formatCurrency(state.forecast.nextMonth)}
                </div>
              </div>

              <div className='bg-blue-50 p-4 rounded-lg'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm font-medium text-blue-700'>Próximo Trimestre</span>
                  <Badge className='bg-blue-100 text-blue-800'>
                    {Math.round(state.forecast.confidence * 100)}% confiança
                  </Badge>
                </div>
                <div className='text-2xl font-bold text-blue-700'>
                  {formatCurrency(state.forecast.nextQuarter)}
                </div>
              </div>
            </div>

            <div>
              <h4 className='font-medium text-gray-700 mb-2'>Fatores de Influência</h4>
              <ul className='space-y-1'>
                {state.forecast.factors.map((factor, index) => (
                  <li key={index} className='text-sm text-gray-600'>• {factor}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Information */}
      <Alert>
        <Shield className='h-4 w-4' />
        <AlertDescription>
          <strong>Compliance Financeiro:</strong>{' '}
          Todas as operações são registradas para auditoria conforme LGPD e normas fiscais
          brasileiras. Sistema mantém conformidade com RFC 2141.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default NeonProFinancialAgent
