'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Calendar, Receipt, PieChart, BarChart3 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// NeonGradientCard com todas as animações do Dashboard
const NeonGradientCard = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
  <motion.div
    className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 via-blue-900/20 to-slate-800/90 backdrop-blur-xl border border-blue-500/20 p-6 ${className}`}
    whileHover={{ 
      scale: 1.02,
      borderColor: "rgb(59 130 246 / 0.5)",
      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(59 130 246 / 0.1)"
    }}
    transition={{ duration: 0.2 }}
    {...props}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-400/5 to-purple-600/0"
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }}
    />
    <div className="relative z-10">
      {children}
    </div>
  </motion.div>
)

// CosmicGlowButton com todos os efeitos do Dashboard
const CosmicGlowButton = ({ children, variant = "default", size = "default", className = "", ...props }: { 
  children: React.ReactNode, 
  variant?: string, 
  size?: string, 
  className?: string,
  [key: string]: any 
}) => (
  <motion.button
    className={`relative overflow-hidden rounded-lg px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 ${className}`}
    whileHover={{ 
      scale: 1.05,
      boxShadow: "0 20px 25px -5px rgb(59 130 246 / 0.3), 0 10px 10px -5px rgb(59 130 246 / 0.2)"
    }}
    whileTap={{ scale: 0.95 }}
    {...props}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      initial={{ x: "-100%" }}
      whileHover={{ x: "100%" }}
      transition={{ duration: 0.6 }}
    />
    <span className="relative z-10 flex items-center gap-2">
      {children}
    </span>
  </motion.button>
)

export default function FinanceiroPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('mes')
  
  const transactions = [
    {
      id: 1,
      date: "2024-08-01",
      description: "Consulta - Ana Silva",
      category: "Receita",
      amount: 450.00,
      type: "income",
      method: "Cartão de Crédito"
    },
    {
      id: 2,
      date: "2024-08-01",
      description: "Botox - Carlos Santos",
      category: "Receita",
      amount: 800.00,
      type: "income",
      method: "PIX"
    },
    {
      id: 3,
      date: "2024-08-01",
      description: "Fornecedor - Materiais",
      category: "Despesa",
      amount: -320.00,
      type: "expense",
      method: "Transferência"
    },
    {
      id: 4,
      date: "2024-08-01",
      description: "Harmonização - Mariana Costa",
      category: "Receita",
      amount: 1200.00,
      type: "income",
      method: "Dinheiro"
    }
  ]

  const totalRevenue = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = Math.abs(
    transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const netProfit = totalRevenue - totalExpenses

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Background Animation - Exato como no Dashboard */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 80%, rgb(120, 119, 198, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgb(255, 119, 198, 0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 40%, rgb(120, 219, 255, 0.3) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 80% 80%, rgb(59, 130, 246, 0.4) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 20%, rgb(147, 51, 234, 0.4) 0%, transparent 50%)",
            "radial-gradient(circle at 60% 60%, rgb(16, 185, 129, 0.4) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 15, repeat: Infinity, delay: 2 }}
      />

      <div className="relative z-10 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <motion.h1 
                className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Gestão Financeira
              </motion.h1>
              <motion.p 
                className="text-slate-400 mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Controle completo das finanças da sua clínica estética
              </motion.p>
            </div>
            <div className="flex gap-3">
              <CosmicGlowButton>
                <Receipt className="w-4 h-4" />
                Nova Transação
              </CosmicGlowButton>
              <CosmicGlowButton className="bg-gradient-to-r from-green-600 via-green-500 to-green-700">
                <BarChart3 className="w-4 h-4" />
                Relatório
              </CosmicGlowButton>
            </div>
          </div>

          {/* Financial Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <NeonGradientCard>
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-500/20">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-400">Receita Total</p>
                    <p className="text-2xl font-bold text-white">R$ {totalRevenue.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-green-400">+12.5% vs mês anterior</p>
                  </div>
                </div>
              </NeonGradientCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <NeonGradientCard>
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-500/20">
                    <TrendingDown className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-400">Despesas</p>
                    <p className="text-2xl font-bold text-white">R$ {totalExpenses.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-red-400">+3.2% vs mês anterior</p>
                  </div>
                </div>
              </NeonGradientCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <NeonGradientCard>
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-500/20">
                    <DollarSign className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-400">Lucro Líquido</p>
                    <p className="text-2xl font-bold text-white">R$ {netProfit.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-blue-400">+18.7% vs mês anterior</p>
                  </div>
                </div>
              </NeonGradientCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <NeonGradientCard>
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-500/20">
                    <PieChart className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-400">Margem de Lucro</p>
                    <p className="text-2xl font-bold text-white">87.2%</p>
                    <p className="text-xs text-purple-400">+2.1% vs mês anterior</p>
                  </div>
                </div>
              </NeonGradientCard>
            </motion.div>
          </div>

          {/* Period Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <NeonGradientCard className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Período de Análise</h3>
                <div className="flex gap-2">
                  {[
                    { key: 'hoje', label: 'Hoje' },
                    { key: 'semana', label: 'Esta Semana' },
                    { key: 'mes', label: 'Este Mês' },
                    { key: 'ano', label: 'Este Ano' }
                  ].map((period) => (
                    <Button
                      key={period.key}
                      variant={selectedPeriod === period.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPeriod(period.key)}
                      className={selectedPeriod === period.key 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "border-slate-600 text-slate-300 hover:bg-slate-800"
                      }
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
              </div>
            </NeonGradientCard>
          </motion.div>

          {/* Transactions List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <NeonGradientCard>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">Transações Recentes</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                      <Calendar className="w-4 h-4 mr-2" />
                      Filtrar por Data
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                      Exportar
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {transactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${
                          transaction.type === 'income' 
                            ? 'bg-green-500/20' 
                            : 'bg-red-500/20'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="w-5 h-5 text-green-400" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{transaction.description}</h4>
                          <p className="text-sm text-slate-400">{transaction.category}</p>
                          <p className="text-xs text-slate-500">{transaction.date}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <Badge variant="outline" className="border-slate-600 text-slate-300 mb-1">
                            {transaction.method}
                          </Badge>
                        </div>
                        
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            transaction.type === 'income' 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : ''}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                            Editar
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-600 text-red-300 hover:bg-red-900/20">
                            Remover
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </NeonGradientCard>
          </motion.div>

          {/* Charts Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NeonGradientCard>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">Gráfico de Receita por Mês</p>
                    <p className="text-xs text-slate-500 mt-2">Em desenvolvimento</p>
                  </div>
                </div>
              </NeonGradientCard>
              
              <NeonGradientCard>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">Distribuição por Categoria</p>
                    <p className="text-xs text-slate-500 mt-2">Em desenvolvimento</p>
                  </div>
                </div>
              </NeonGradientCard>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}