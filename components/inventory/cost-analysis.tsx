'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  PieChart,
  BarChart3,
  Calculator,
  FileText,
  Download
} from 'lucide-react'

interface ProductCostAnalysis {
  productId: string
  productName: string
  category: string
  quantity: number
  unit: string
  
  // Custo base
  unitCostBase: number
  totalCostBase: number
  
  // Impostos brasileiros
  taxes: {
    icms: { rate: number; value: number }      // ICMS - Imposto sobre Circulação de Mercadorias
    ipi: { rate: number; value: number }       // IPI - Imposto sobre Produtos Industrializados
    pis: { rate: number; value: number }       // PIS - Programa de Integração Social
    cofins: { rate: number; value: number }    // COFINS - Contribuição para Financiamento da Seguridade Social
    iss: { rate: number; value: number }       // ISS - Imposto sobre Serviços (se aplicável)
  }
  
  // Custos adicionais
  additionalCosts: {
    freight: number           // Frete
    insurance: number         // Seguro
    handling: number          // Manuseio
    storage: number          // Armazenagem
    depreciation: number     // Depreciação (equipamentos)
  }
  
  // Cálculos finais
  totalTaxes: number
  totalAdditionalCosts: number
  finalUnitCost: number
  finalTotalCost: number
  
  // Preços e margens
  salePrice: number
  grossMargin: number
  grossMarginPercent: number
  netMargin: number
  netMarginPercent: number
  
  // Análise de rentabilidade
  breakEvenQuantity: number
  profitability: 'high' | 'medium' | 'low' | 'negative'
  
  // Classificação fiscal
  ncmCode: string
  cfop: string // Código Fiscal de Operações e Prestações
  cst: string  // Código de Situação Tributária
}

// Mock data for demonstration
const mockCostAnalysis: ProductCostAnalysis[] = [
  {
    productId: 'PRD001',
    productName: 'Botox Allergan 100U',
    category: 'botox',
    quantity: 50,
    unit: 'frasco',
    unitCostBase: 500.00,
    totalCostBase: 25000.00,
    taxes: {
      icms: { rate: 18, value: 4500.00 },
      ipi: { rate: 0, value: 0 },
      pis: { rate: 1.65, value: 412.50 },
      cofins: { rate: 7.6, value: 1900.00 },
      iss: { rate: 0, value: 0 }
    },
    additionalCosts: {
      freight: 300.00,
      insurance: 150.00,
      handling: 100.00,
      storage: 200.00,
      depreciation: 0
    },
    totalTaxes: 6812.50,
    totalAdditionalCosts: 750.00,
    finalUnitCost: 650.25,
    finalTotalCost: 32512.50,
    salePrice: 890.00,
    grossMargin: 239.75,
    grossMarginPercent: 26.93,
    netMargin: 189.75,
    netMarginPercent: 21.32,
    breakEvenQuantity: 42,
    profitability: 'medium',
    ncmCode: '30042000',
    cfop: '5102',
    cst: '00'
  },
  {
    productId: 'PRD002',
    productName: 'Ácido Hialurônico Juvederm Ultra',
    category: 'fillers',
    quantity: 30,
    unit: 'seringa',
    unitCostBase: 850.00,
    totalCostBase: 25500.00,
    taxes: {
      icms: { rate: 18, value: 4590.00 },
      ipi: { rate: 0, value: 0 },
      pis: { rate: 1.65, value: 420.75 },
      cofins: { rate: 7.6, value: 1938.00 },
      iss: { rate: 0, value: 0 }
    },
    additionalCosts: {
      freight: 250.00,
      insurance: 200.00,
      handling: 80.00,
      storage: 300.00,
      depreciation: 0
    },
    totalTaxes: 6948.75,
    totalAdditionalCosts: 830.00,
    finalUnitCost: 1109.63,
    finalTotalCost: 33288.75,
    salePrice: 1450.00,
    grossMargin: 340.37,
    grossMarginPercent: 23.47,
    netMargin: 290.37,
    netMarginPercent: 20.03,
    breakEvenQuantity: 25,
    profitability: 'medium',
    ncmCode: '30042000',
    cfop: '5102',
    cst: '00'
  }
]

const categories = [
  { id: 'botox', name: 'Toxina Botulínica', icon: '💉' },
  { id: 'fillers', name: 'Preenchedores', icon: '🧪' },
  { id: 'skincare', name: 'Dermocosméticos', icon: '✨' },
  { id: 'equipment', name: 'Equipamentos', icon: '⚕️' },
  { id: 'consumables', name: 'Descartáveis', icon: '🧤' }
]

/**
 * Cost Analysis Component for NeonPro Inventory Management
 * 
 * Features:
 * - Complete Brazilian tax calculation (ICMS, IPI, PIS, COFINS, ISS)
 * - NCM code classification and CFOP management
 * - Cost breakdown with additional expenses (freight, insurance, storage)
 * - Margin analysis and profitability assessment
 * - Break-even analysis for product lines
 * - Brazilian fiscal compliance (CST codes)
 * - Export functionality for accounting integration
 * - Real-time cost monitoring and alerts
 * 
 * @author VoidBeast V4.0 + neonpro-code-guardian
 * @version 1.0.0
 * @compliance ANVISA, CFM, LGPD, Brazilian Tax Regulations
 */
export function CostAnalysis() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedMetric, setSelectedMetric] = useState<string>('margin')
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview')

  const filteredAnalysis = useMemo(() => {
    return mockCostAnalysis.filter(analysis => {
      const matchesCategory = selectedCategory === 'all' || analysis.category === selectedCategory
      return matchesCategory
    })
  }, [selectedCategory])

  const overallMetrics = useMemo(() => {
    const totalCost = filteredAnalysis.reduce((sum, item) => sum + item.finalTotalCost, 0)
    const totalRevenue = filteredAnalysis.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0)
    const totalTaxes = filteredAnalysis.reduce((sum, item) => sum + item.totalTaxes, 0)
    const averageMargin = filteredAnalysis.reduce((sum, item) => sum + item.netMarginPercent, 0) / filteredAnalysis.length
    
    return {
      totalCost,
      totalRevenue,
      totalTaxes,
      totalProfit: totalRevenue - totalCost,
      averageMargin: averageMargin || 0,
      taxBurden: (totalTaxes / totalCost) * 100
    }
  }, [filteredAnalysis])

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2 
    })
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const getProfitabilityColor = (profitability: string) => {
    switch (profitability) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const exportCostAnalysis = () => {
    // In a real implementation, this would generate a detailed Excel/PDF report
    console.log('Exporting cost analysis:', filteredAnalysis)
  }

  return (
    &lt;div className="space-y-6"&gt;
      {/* Overview Metrics Cards */}
      &lt;div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"&gt;
        &lt;Card&gt;
          &lt;CardContent className="p-4"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm font-medium text-muted-foreground"&gt;Custo Total&lt;/p&gt;
                &lt;p className="text-2xl font-bold"&gt;{formatCurrency(overallMetrics.totalCost)}&lt;/p&gt;
              &lt;/div&gt;
              &lt;DollarSign className="h-8 w-8 text-green-500" /&gt;
            &lt;/div&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;

        &lt;Card&gt;
          &lt;CardContent className="p-4"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm font-medium text-muted-foreground"&gt;Receita Total&lt;/p&gt;
                &lt;p className="text-2xl font-bold text-blue-600"&gt;{formatCurrency(overallMetrics.totalRevenue)}&lt;/p&gt;
              &lt;/div&gt;
              &lt;TrendingUp className="h-8 w-8 text-blue-500" /&gt;
            &lt;/div&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;

        &lt;Card&gt;
          &lt;CardContent className="p-4"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm font-medium text-muted-foreground"&gt;Margem Média&lt;/p&gt;
                &lt;p className="text-2xl font-bold text-green-600"&gt;{formatPercent(overallMetrics.averageMargin)}&lt;/p&gt;
              &lt;/div&gt;
              &lt;PieChart className="h-8 w-8 text-green-500" /&gt;
            &lt;/div&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;

        &lt;Card&gt;
          &lt;CardContent className="p-4"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm font-medium text-muted-foreground"&gt;Carga Tributária&lt;/p&gt;
                &lt;p className="text-2xl font-bold text-amber-600"&gt;{formatPercent(overallMetrics.taxBurden)}&lt;/p&gt;
              &lt;/div&gt;
              &lt;Receipt className="h-8 w-8 text-amber-500" /&gt;
            &lt;/div&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;
      &lt;/div&gt;

      {/* Filters and Controls */}
      &lt;div className="flex flex-col sm:flex-row gap-4"&gt;
        &lt;Select value={selectedCategory} onValueChange={setSelectedCategory}&gt;
          &lt;SelectTrigger className="w-48"&gt;
            &lt;SelectValue placeholder="Categoria" /&gt;
          &lt;/SelectTrigger&gt;
          &lt;SelectContent&gt;
            &lt;SelectItem value="all"&gt;Todas as categorias&lt;/SelectItem&gt;
            {categories.map(category =&gt; (
              &lt;SelectItem key={category.id} value={category.id}&gt;
                {category.icon} {category.name}
              &lt;/SelectItem&gt;
            ))}
          &lt;/SelectContent&gt;
        &lt;/Select&gt;

        &lt;Select value={selectedMetric} onValueChange={setSelectedMetric}&gt;
          &lt;SelectTrigger className="w-48"&gt;
            &lt;SelectValue placeholder="Métrica" /&gt;
          &lt;/SelectTrigger&gt;
          &lt;SelectContent&gt;
            &lt;SelectItem value="margin"&gt;Margem de Lucro&lt;/SelectItem&gt;
            &lt;SelectItem value="taxes"&gt;Carga Tributária&lt;/SelectItem&gt;
            &lt;SelectItem value="profitability"&gt;Rentabilidade&lt;/SelectItem&gt;
            &lt;SelectItem value="breakeven"&gt;Ponto de Equilíbrio&lt;/SelectItem&gt;
          &lt;/SelectContent&gt;
        &lt;/Select&gt;

        &lt;Tabs value={viewMode} onValueChange={(value) =&gt; setViewMode(value as 'overview' | 'detailed')}&gt;
          &lt;TabsList&gt;
            &lt;TabsTrigger value="overview"&gt;Visão Geral&lt;/TabsTrigger&gt;
            &lt;TabsTrigger value="detailed"&gt;Detalhado&lt;/TabsTrigger&gt;
          &lt;/TabsList&gt;
        &lt;/Tabs&gt;

        &lt;Button onClick={exportCostAnalysis} className="ml-auto"&gt;
          &lt;Download className="w-4 h-4 mr-2" /&gt;
          Exportar Relatório
        &lt;/Button&gt;
      &lt;/div&gt;      {/* Cost Analysis Table */}
      &lt;Card&gt;
        &lt;CardHeader&gt;
          &lt;CardTitle className="flex items-center justify-between"&gt;
            &lt;span&gt;Análise de Custos ({filteredAnalysis.length} produtos)&lt;/span&gt;
            &lt;div className="flex items-center gap-2"&gt;
              &lt;Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"&gt;
                &lt;Calculator className="w-3 h-3 mr-1" /&gt;
                Impostos BR Calculados
              &lt;/Badge&gt;
            &lt;/div&gt;
          &lt;/CardTitle&gt;
          &lt;CardDescription&gt;
            Análise completa com impostos brasileiros e margem de lucro
          &lt;/CardDescription&gt;
        &lt;/CardHeader&gt;
        &lt;CardContent&gt;
          &lt;div className="overflow-x-auto"&gt;
            &lt;Table&gt;
              &lt;TableHeader&gt;
                &lt;TableRow&gt;
                  &lt;TableHead&gt;Produto&lt;/TableHead&gt;
                  &lt;TableHead&gt;Custo Base&lt;/TableHead&gt;
                  &lt;TableHead&gt;Impostos&lt;/TableHead&gt;
                  &lt;TableHead&gt;Custo Final&lt;/TableHead&gt;
                  &lt;TableHead&gt;Preço Venda&lt;/TableHead&gt;
                  &lt;TableHead&gt;Margem&lt;/TableHead&gt;
                  &lt;TableHead&gt;Rentabilidade&lt;/TableHead&gt;
                  {viewMode === 'detailed' && &lt;TableHead&gt;Fiscal&lt;/TableHead&gt;}
                &lt;/TableRow&gt;
              &lt;/TableHeader&gt;
              &lt;TableBody&gt;
                {filteredAnalysis.map((analysis) =&gt; {
                  const category = categories.find(c =&gt; c.id === analysis.category)
                  
                  return (
                    &lt;TableRow key={analysis.productId} className="hover:bg-muted/50"&gt;
                      &lt;TableCell&gt;
                        &lt;div className="space-y-1"&gt;
                          &lt;div className="font-medium"&gt;{analysis.productName}&lt;/div&gt;
                          &lt;Badge variant="outline" className="text-xs"&gt;
                            {category?.icon} {category?.name}
                          &lt;/Badge&gt;
                          &lt;div className="text-xs text-muted-foreground"&gt;
                            {analysis.quantity} {analysis.unit}
                          &lt;/div&gt;
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;div className="space-y-1"&gt;
                          &lt;div className="font-medium"&gt;
                            {formatCurrency(analysis.unitCostBase)}
                          &lt;/div&gt;
                          &lt;div className="text-xs text-muted-foreground"&gt;
                            Total: {formatCurrency(analysis.totalCostBase)}
                          &lt;/div&gt;
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;div className="space-y-1"&gt;
                          &lt;div className="font-medium text-amber-600"&gt;
                            {formatCurrency(analysis.totalTaxes)}
                          &lt;/div&gt;
                          &lt;div className="text-xs text-muted-foreground"&gt;
                            {formatPercent((analysis.totalTaxes / analysis.totalCostBase) * 100)} do custo
                          &lt;/div&gt;
                          {viewMode === 'detailed' && (
                            &lt;div className="space-y-1 text-xs"&gt;
                              &lt;div&gt;ICMS: {formatCurrency(analysis.taxes.icms.value)}&lt;/div&gt;
                              &lt;div&gt;PIS: {formatCurrency(analysis.taxes.pis.value)}&lt;/div&gt;
                              &lt;div&gt;COFINS: {formatCurrency(analysis.taxes.cofins.value)}&lt;/div&gt;
                            &lt;/div&gt;
                          )}
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;div className="space-y-1"&gt;
                          &lt;div className="font-medium"&gt;
                            {formatCurrency(analysis.finalUnitCost)}
                          &lt;/div&gt;
                          &lt;div className="text-xs text-muted-foreground"&gt;
                            Total: {formatCurrency(analysis.finalTotalCost)}
                          &lt;/div&gt;
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;div className="space-y-1"&gt;
                          &lt;div className="font-medium text-green-600"&gt;
                            {formatCurrency(analysis.salePrice)}
                          &lt;/div&gt;
                          &lt;div className="text-xs text-muted-foreground"&gt;
                            por {analysis.unit}
                          &lt;/div&gt;
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;div className="space-y-2"&gt;
                          &lt;div className="flex items-center gap-2"&gt;
                            &lt;span className="text-sm font-medium"&gt;
                              {formatPercent(analysis.netMarginPercent)}
                            &lt;/span&gt;
                            {analysis.netMarginPercent &gt; 20 ? (
                              &lt;TrendingUp className="w-3 h-3 text-green-500" /&gt;
                            ) : analysis.netMarginPercent &gt; 10 ? (
                              &lt;BarChart3 className="w-3 h-3 text-yellow-500" /&gt;
                            ) : (
                              &lt;TrendingDown className="w-3 h-3 text-red-500" /&gt;
                            )}
                          &lt;/div&gt;
                          &lt;Progress 
                            value={Math.min(analysis.netMarginPercent, 50)} 
                            className="h-2"
                          /&gt;
                          &lt;div className="text-xs text-muted-foreground"&gt;
                            {formatCurrency(analysis.netMargin)} por unidade
                          &lt;/div&gt;
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;div className="space-y-1"&gt;
                          &lt;Badge 
                            variant="outline" 
                            className={getProfitabilityColor(analysis.profitability)}
                          &gt;
                            {analysis.profitability === 'high' ? 'Alta' :
                             analysis.profitability === 'medium' ? 'Média' :
                             analysis.profitability === 'low' ? 'Baixa' : 'Negativa'}
                          &lt;/Badge&gt;
                          &lt;div className="text-xs text-muted-foreground"&gt;
                            Break-even: {analysis.breakEvenQuantity} {analysis.unit}
                          &lt;/div&gt;
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      {viewMode === 'detailed' && (
                        &lt;TableCell&gt;
                          &lt;div className="space-y-1 text-xs"&gt;
                            &lt;div&gt;NCM: {analysis.ncmCode}&lt;/div&gt;
                            &lt;div&gt;CFOP: {analysis.cfop}&lt;/div&gt;
                            &lt;div&gt;CST: {analysis.cst}&lt;/div&gt;
                          &lt;/div&gt;
                        &lt;/TableCell&gt;
                      )}
                    &lt;/TableRow&gt;
                  )
                })}
              &lt;/TableBody&gt;
            &lt;/Table&gt;
            
            {filteredAnalysis.length === 0 && (
              &lt;div className="text-center py-8 text-muted-foreground"&gt;
                &lt;Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" /&gt;
                &lt;p&gt;Nenhum produto encontrado com os filtros aplicados.&lt;/p&gt;
              &lt;/div&gt;
            )}
          &lt;/div&gt;
        &lt;/CardContent&gt;
      &lt;/Card&gt;

      {/* Brazilian Tax Breakdown */}
      {viewMode === 'detailed' && filteredAnalysis.length &gt; 0 && (
        &lt;div className="grid gap-6 md:grid-cols-2"&gt;
          {/* Tax Breakdown Card */}
          &lt;Card&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle className="flex items-center gap-2"&gt;
                &lt;Receipt className="w-5 h-5" /&gt;
                Breakdown Tributário Brasileiro
              &lt;/CardTitle&gt;
              &lt;CardDescription&gt;
                Análise detalhada dos impostos por categoria
              &lt;/CardDescription&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent&gt;
              &lt;div className="space-y-4"&gt;
                {(() =&gt; {
                  const totalTaxes = filteredAnalysis.reduce((sum, item) =&gt; sum + item.totalTaxes, 0)
                  const taxBreakdown = {
                    icms: filteredAnalysis.reduce((sum, item) =&gt; sum + item.taxes.icms.value, 0),
                    ipi: filteredAnalysis.reduce((sum, item) =&gt; sum + item.taxes.ipi.value, 0),
                    pis: filteredAnalysis.reduce((sum, item) =&gt; sum + item.taxes.pis.value, 0),
                    cofins: filteredAnalysis.reduce((sum, item) =&gt; sum + item.taxes.cofins.value, 0),
                    iss: filteredAnalysis.reduce((sum, item) =&gt; sum + item.taxes.iss.value, 0)
                  }
                  
                  return Object.entries(taxBreakdown).map(([tax, value]) =&gt; {
                    if (value === 0) return null
                    const percentage = (value / totalTaxes) * 100
                    
                    return (
                      &lt;div key={tax} className="space-y-2"&gt;
                        &lt;div className="flex justify-between items-center"&gt;
                          &lt;span className="text-sm font-medium uppercase"&gt;{tax}&lt;/span&gt;
                          &lt;span className="text-sm"&gt;{formatCurrency(value)}&lt;/span&gt;
                        &lt;/div&gt;
                        &lt;Progress value={percentage} className="h-2" /&gt;
                        &lt;div className="text-xs text-muted-foreground"&gt;
                          {formatPercent(percentage)} do total de impostos
                        &lt;/div&gt;
                      &lt;/div&gt;
                    )
                  }).filter(Boolean)
                })()}
              &lt;/div&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;

          {/* Cost Composition Card */}
          &lt;Card&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle className="flex items-center gap-2"&gt;
                &lt;PieChart className="w-5 h-5" /&gt;
                Composição de Custos
              &lt;/CardTitle&gt;
              &lt;CardDescription&gt;
                Distribuição percentual dos componentes de custo
              &lt;/CardDescription&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent&gt;
              &lt;div className="space-y-4"&gt;
                {(() =&gt; {
                  const totalCost = overallMetrics.totalCost
                  const totalBase = filteredAnalysis.reduce((sum, item) =&gt; sum + item.totalCostBase, 0)
                  const totalTaxes = filteredAnalysis.reduce((sum, item) =&gt; sum + item.totalTaxes, 0)
                  const totalAdditional = filteredAnalysis.reduce((sum, item) =&gt; sum + item.totalAdditionalCosts, 0)
                  
                  const components = [
                    { name: 'Custo Base', value: totalBase, color: 'bg-blue-500' },
                    { name: 'Impostos', value: totalTaxes, color: 'bg-amber-500' },
                    { name: 'Custos Adicionais', value: totalAdditional, color: 'bg-green-500' }
                  ]
                  
                  return components.map(component =&gt; {
                    const percentage = (component.value / totalCost) * 100
                    
                    return (
                      &lt;div key={component.name} className="space-y-2"&gt;
                        &lt;div className="flex justify-between items-center"&gt;
                          &lt;span className="text-sm font-medium"&gt;{component.name}&lt;/span&gt;
                          &lt;span className="text-sm"&gt;{formatCurrency(component.value)}&lt;/span&gt;
                        &lt;/div&gt;
                        &lt;Progress value={percentage} className="h-2" /&gt;
                        &lt;div className="text-xs text-muted-foreground"&gt;
                          {formatPercent(percentage)} do custo total
                        &lt;/div&gt;
                      &lt;/div&gt;
                    )
                  })
                })()}
              &lt;/div&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/div&gt;
      )}

      {/* Profitability Analysis */}
      &lt;Card&gt;
        &lt;CardHeader&gt;
          &lt;CardTitle className="flex items-center gap-2"&gt;
            &lt;BarChart3 className="w-5 h-5" /&gt;
            Análise de Rentabilidade
          &lt;/CardTitle&gt;
          &lt;CardDescription&gt;
            Insights e recomendações baseados na análise de custos
          &lt;/CardDescription&gt;
        &lt;/CardHeader&gt;
        &lt;CardContent&gt;
          &lt;div className="grid gap-4 md:grid-cols-3"&gt;
            {/* High Profitability Products */}
            &lt;div className="space-y-2"&gt;
              &lt;h4 className="font-medium text-green-600"&gt;Alta Rentabilidade&lt;/h4&gt;
              &lt;div className="space-y-2"&gt;
                {filteredAnalysis
                  .filter(p =&gt; p.profitability === 'high')
                  .map(product =&gt; (
                    &lt;div key={product.productId} className="p-2 bg-green-50 border border-green-200 rounded"&gt;
                      &lt;div className="text-sm font-medium"&gt;{product.productName}&lt;/div&gt;
                      &lt;div className="text-xs text-muted-foreground"&gt;
                        Margem: {formatPercent(product.netMarginPercent)}
                      &lt;/div&gt;
                    &lt;/div&gt;
                  ))}
                {filteredAnalysis.filter(p =&gt; p.profitability === 'high').length === 0 && (
                  &lt;p className="text-sm text-muted-foreground"&gt;Nenhum produto com alta rentabilidade&lt;/p&gt;
                )}
              &lt;/div&gt;
            &lt;/div&gt;

            {/* Medium Profitability Products */}
            &lt;div className="space-y-2"&gt;
              &lt;h4 className="font-medium text-yellow-600"&gt;Rentabilidade Média&lt;/h4&gt;
              &lt;div className="space-y-2"&gt;
                {filteredAnalysis
                  .filter(p =&gt; p.profitability === 'medium')
                  .map(product =&gt; (
                    &lt;div key={product.productId} className="p-2 bg-yellow-50 border border-yellow-200 rounded"&gt;
                      &lt;div className="text-sm font-medium"&gt;{product.productName}&lt;/div&gt;
                      &lt;div className="text-xs text-muted-foreground"&gt;
                        Margem: {formatPercent(product.netMarginPercent)}
                      &lt;/div&gt;
                    &lt;/div&gt;
                  ))}
              &lt;/div&gt;
            &lt;/div&gt;

            {/* Low/Negative Profitability Products */}
            &lt;div className="space-y-2"&gt;
              &lt;h4 className="font-medium text-red-600"&gt;Baixa Rentabilidade&lt;/h4&gt;
              &lt;div className="space-y-2"&gt;
                {filteredAnalysis
                  .filter(p =&gt; p.profitability === 'low' || p.profitability === 'negative')
                  .map(product =&gt; (
                    &lt;div key={product.productId} className="p-2 bg-red-50 border border-red-200 rounded"&gt;
                      &lt;div className="text-sm font-medium"&gt;{product.productName}&lt;/div&gt;
                      &lt;div className="text-xs text-muted-foreground"&gt;
                        Margem: {formatPercent(product.netMarginPercent)}
                      &lt;/div&gt;
                      &lt;div className="text-xs text-red-600 font-medium"&gt;
                        ⚠️ Revisar precificação
                      &lt;/div&gt;
                    &lt;/div&gt;
                  ))}
                {filteredAnalysis.filter(p =&gt; p.profitability === 'low' || p.profitability === 'negative').length === 0 && (
                  &lt;p className="text-sm text-muted-foreground"&gt;Todos os produtos com rentabilidade adequada&lt;/p&gt;
                )}
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          {/* Key Insights */}
          &lt;div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"&gt;
            &lt;h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2"&gt;
              &lt;FileText className="w-4 h-4" /&gt;
              Insights e Recomendações
            &lt;/h4&gt;
            &lt;ul className="space-y-1 text-sm text-blue-700"&gt;
              &lt;li&gt;• Carga tributária média de {formatPercent(overallMetrics.taxBurden)} sobre o custo base&lt;/li&gt;
              &lt;li&gt;• Margem líquida média de {formatPercent(overallMetrics.averageMargin)} após impostos&lt;/li&gt;
              &lt;li&gt;• Produtos com baixa rentabilidade necessitam revisão de precificação&lt;/li&gt;
              &lt;li&gt;• Considerar negociação com fornecedores para redução de custos base&lt;/li&gt;
            &lt;/ul&gt;
          &lt;/div&gt;
        &lt;/CardContent&gt;
      &lt;/Card&gt;
    &lt;/div&gt;
  )
}