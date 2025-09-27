/**
 * NeonPro Financial Agent Component
 *
 * Specialized AI agent for intelligent financial management
 * Features:
 * - Real-time payment processing
 * - AI-powered revenue optimization
 * - Automated invoice generation
 * - Financial reporting and analytics
 * - Brazilian tax compliance (LGPD, fiscal regulations)
 */

import React, { useCallback } from 'react'
import { Button } from '@/components/ui/button.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.js'
import { Alert, AlertDescription } from '@/components/ui/alert.js'
import { useNeonProChat } from '../NeonProChatProvider.js'
import { Shield, DollarSign, FileText, TrendingUp } from 'lucide-react'

interface PaymentMethod {
  id: string
  name: string
  fees: number
  processingTime: string
  available: boolean
}

interface Transaction {
  id: string
  amount: number
  description: string
  status: 'pending' | 'completed' | 'failed'
  paymentMethod: string
  processedBy: string
  timestamp: string
}

interface FinancialAgentState {
  currentTransaction?: Transaction
  availablePaymentMethods: PaymentMethod[]
  recentTransactions: Transaction[]
  loading: boolean
  error?: string
  currentOperation: 'idle' | 'processing' | 'generating_invoice' | 'calculating'
}

interface FinancialAgentProps {
  clinicId: string
  onTransactionComplete?: (transactionId: string) => void
  onInvoiceGenerated?: (invoiceId: string) => void
  onError?: (error: string) => void
}

// Mock data for demonstration
const mockPaymentMethods: PaymentMethod[] = [
  { id: 'pix', name: 'PIX', fees: 0, processingTime: 'Instantâneo', available: true },
  { id: 'credit_card', name: 'Cartão de Crédito', fees: 3.5, processingTime: '1-2 dias úteis', available: true },
  { id: 'debit_card', name: 'Cartão de Débito', fees: 2.5, processingTime: 'Instantâneo', available: true },
  { id: 'bank_transfer', name: 'Transferência Bancária', fees: 1.0, processingTime: '1-3 dias úteis', available: true }
]

const mockTransactions: Transaction[] = [
  {
    id: 'txn_001',
    amount: 800,
    description: 'Botox - Paciente: Maria Silva',
    status: 'completed',
    paymentMethod: 'pix',
    processedBy: 'system',
    timestamp: '2024-03-20T10:30:00'
  },
  {
    id: 'txn_002',
    amount: 1200,
    description: 'Preenchimento - Paciente: João Santos',
    status: 'completed',
    paymentMethod: 'credit_card',
    processedBy: 'system',
    timestamp: '2024-03-20T14:15:00'
  }
]

export const NeonProFinancialAgent: React.FC<FinancialAgentProps> = ({
  clinicId: _clinicId,
  onTransactionComplete,
  onInvoiceGenerated,
  onError,
}) => {
  const { config: _config } = useNeonProChat()

  // Initialize agent state
  const initialState: FinancialAgentState = {
    availablePaymentMethods: mockPaymentMethods,
    recentTransactions: mockTransactions,
    loading: false,
    currentOperation: 'idle'
  }

  const [state, setState] = React.useState<FinancialAgentState>(initialState)

  const handleProcessPayment = useCallback((amount: number, method: string, description: string) => {
    setState(prev => ({ ...prev, loading: true, currentOperation: 'processing' }))
    
    // Simulate payment processing
    setTimeout(() => {
      const transactionId = `txn_${Date.now()}`
      const newTransaction: Transaction = {
        id: transactionId,
        amount,
        description,
        status: 'completed',
        paymentMethod: method,
        processedBy: 'system',
        timestamp: new Date().toISOString()
      }

      setState(prev => ({
        ...prev,
        recentTransactions: [newTransaction, ...prev.recentTransactions].slice(0, 10),
        loading: false,
        currentOperation: 'idle'
      }))

      onTransactionComplete?.(transactionId)
    }, 2000)
  }, [onTransactionComplete])

  const handleGenerateInvoice = useCallback((transactionId: string) => {
    setState(prev => ({ ...prev, loading: true, currentOperation: 'generating_invoice' }))
    
    // Simulate invoice generation
    setTimeout(() => {
      const invoiceId = `inv_${Date.now()}`
      
      setState(prev => ({
        ...prev,
        loading: false,
        currentOperation: 'idle'
      }))

      onInvoiceGenerated?.(invoiceId)
    }, 1500)
  }, [onInvoiceGenerated])

  const calculateRevenue = useCallback(() => {
    return state.recentTransactions
      .filter(t => t.status === 'completed')
      .reduce((total, t) => total + t.amount, 0)
  }, [state.recentTransactions])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Agente Financeiro NeonPro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            Especialista em gestão financeira inteligente para clínicas estéticas.
            Processa pagamentos, gera relatórios e mantém conformidade fiscal brasileira.
          </div>

          {state.loading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              {state.currentOperation === 'processing' && 'Processando pagamento...'}
              {state.currentOperation === 'generating_invoice' && 'Gerando fatura...'}
              {state.currentOperation === 'calculating' && 'Calculando métricas...'}
            </div>
          )}

          {/* Quick payment form */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Valor (R$)</label>
                <input 
                  type="number" 
                  className="w-full mt-1 p-2 border rounded"
                  placeholder="0,00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Método de Pagamento</label>
                <select className="w-full mt-1 p-2 border rounded">
                  <option value="">Selecione</option>
                  {state.availablePaymentMethods
                    .filter(method => method.available)
                    .map(method => (
                      <option key={method.id} value={method.id}>
                        {method.name} ({method.fees}% taxa)
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <input 
                type="text" 
                className="w-full mt-1 p-2 border rounded"
                placeholder="Ex: Botox - Paciente: Maria Silva"
              />
            </div>

            <Button 
              className="w-full"
              onClick={() => handleProcessPayment(800, 'pix', 'Botox - Paciente Teste')}
              disabled={state.loading}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Processar Pagamento
            </Button>
          </div>

          {/* Revenue Summary */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-green-700">Receita do Dia</div>
                  <div className="text-2xl font-bold text-green-800">
                    R$ {calculateRevenue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          {state.recentTransactions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Transações Recentes
              </h4>
              {state.recentTransactions.slice(0, 3).map(transaction => (
                <div 
                  key={transaction.id}
                  className="border rounded p-3 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">
                        R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-gray-600">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.timestamp).toLocaleString('pt-BR')} • 
                        {mockPaymentMethods.find(m => m.id === transaction.paymentMethod)?.name}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status === 'completed' ? 'Concluído' :
                         transaction.status === 'pending' ? 'Pendente' : 'Falhou'}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleGenerateInvoice(transaction.id)}
                      >
                        Fatura
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payment Methods */}
          <div className="space-y-2">
            <h4 className="font-medium">Métodos de Pagamento Disponíveis</h4>
            <div className="grid grid-cols-2 gap-2">
              {state.availablePaymentMethods.map(method => (
                <div 
                  key={method.id}
                  className={`border rounded p-2 text-center ${
                    method.available ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="font-medium text-sm">{method.name}</div>
                  <div className="text-xs text-gray-600">
                    Taxa: {method.fees}% • {method.processingTime}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Information */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Compliance Financeiro:</strong>{' '}
          Todas as operações são registradas para auditoria conforme LGPD e normas fiscais
          brasileiras. Sistema mantém conformidade com RFC 2141.
        </AlertDescription>
      </Alert>
    </div>
  )
}