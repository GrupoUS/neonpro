'use client'

import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Barcode,
  FileText,
  ShoppingCart,
  Activity,
  Settings
} from 'lucide-react'
import { ProductCatalog } from '@/components/inventory/product-catalog'
import { StockAlerts } from '@/components/inventory/stock-alerts'
import { SupplierManagement } from '@/components/inventory/supplier-management'
import { BatchTracking } from '@/components/inventory/batch-tracking'
import { StockMovement } from '@/components/inventory/stock-movement'
import { CostAnalysis } from '@/components/inventory/cost-analysis'
import { ReorderManagement } from '@/components/inventory/reorder-management'

/**
 * Inventory Management Dashboard for NeonPro Aesthetic Clinic
 * 
 * Comprehensive stock management system with Brazilian healthcare compliance:
 * - ANVISA medical device tracking
 * - CFM equipment maintenance logging  
 * - LGPD data protection for suppliers
 * - Brazilian tax compliance (CNPJ, NCM codes)
 * - Temperature-controlled storage monitoring
 * - Controlled substance tracking (botox, prescription items)
 * 
 * @author VoidBeast V4.0 + neonpro-code-guardian
 * @version 1.0.0
 * @compliance ANVISA, CFM, LGPD
 */
export default function InventoryPage() {
  return (
    &lt;div className="space-y-6 p-6"&gt;
      {/* Header Section */}
      &lt;div className="flex items-center justify-between"&gt;
        &lt;div&gt;
          &lt;h1 className="text-3xl font-bold tracking-tight text-gray-900"&gt;
            Gestão de Estoque
          &lt;/h1&gt;
          &lt;p className="text-muted-foreground mt-2"&gt;
            Sistema completo de controle de estoque para clínica estética com compliance ANVISA/CFM/LGPD
          &lt;/p&gt;
        &lt;/div&gt;
        &lt;div className="flex items-center gap-2"&gt;
          &lt;Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"&gt;
            &lt;Activity className="w-3 h-3 mr-1" /&gt;
            Sistema Ativo
          &lt;/Badge&gt;
          &lt;Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"&gt;
            ANVISA Compliant
          &lt;/Badge&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      {/* Quick Stats Overview */}
      &lt;div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"&gt;
        &lt;Card&gt;
          &lt;CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"&gt;
            &lt;CardTitle className="text-sm font-medium"&gt;
              Produtos Ativos
            &lt;/CardTitle&gt;
            &lt;Package className="h-4 w-4 text-muted-foreground" /&gt;
          &lt;/CardHeader&gt;
          &lt;CardContent&gt;
            &lt;div className="text-2xl font-bold"&gt;247&lt;/div&gt;
            &lt;p className="text-xs text-muted-foreground"&gt;
              +12 este mês
            &lt;/p&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;

        &lt;Card&gt;
          &lt;CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"&gt;
            &lt;CardTitle className="text-sm font-medium"&gt;
              Alertas Críticos
            &lt;/CardTitle&gt;
            &lt;AlertTriangle className="h-4 w-4 text-amber-500" /&gt;
          &lt;/CardHeader&gt;
          &lt;CardContent&gt;
            &lt;div className="text-2xl font-bold text-amber-600"&gt;8&lt;/div&gt;
            &lt;p className="text-xs text-muted-foreground"&gt;
              Requer atenção imediata
            &lt;/p&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;

        &lt;Card&gt;
          &lt;CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"&gt;
            &lt;CardTitle className="text-sm font-medium"&gt;
              Valor do Estoque
            &lt;/CardTitle&gt;
            &lt;TrendingUp className="h-4 w-4 text-green-500" /&gt;
          &lt;/CardHeader&gt;
          &lt;CardContent&gt;
            &lt;div className="text-2xl font-bold"&gt;R$ 89.247&lt;/div&gt;
            &lt;p className="text-xs text-muted-foreground"&gt;
              +5.2% vs mês anterior
            &lt;/p&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;

        &lt;Card&gt;
          &lt;CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"&gt;
            &lt;CardTitle className="text-sm font-medium"&gt;
              Pedidos Pendentes
            &lt;/CardTitle&gt;
            &lt;ShoppingCart className="h-4 w-4 text-blue-500" /&gt;
          &lt;/CardHeader&gt;
          &lt;CardContent&gt;
            &lt;div className="text-2xl font-bold"&gt;23&lt;/div&gt;
            &lt;p className="text-xs text-muted-foreground"&gt;
              Entrega prevista 3-7 dias
            &lt;/p&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;
      &lt;/div&gt;

      {/* Main Tabs Navigation */}
      &lt;Tabs defaultValue="catalog" className="space-y-4"&gt;
        &lt;TabsList className="grid w-full grid-cols-7"&gt;
          &lt;TabsTrigger value="catalog" className="flex items-center gap-2"&gt;
            &lt;Package className="w-4 h-4" /&gt;
            Catálogo
          &lt;/TabsTrigger&gt;
          &lt;TabsTrigger value="alerts" className="flex items-center gap-2"&gt;
            &lt;AlertTriangle className="w-4 h-4" /&gt;
            Alertas
          &lt;/TabsTrigger&gt;
          &lt;TabsTrigger value="suppliers" className="flex items-center gap-2"&gt;
            &lt;FileText className="w-4 h-4" /&gt;
            Fornecedores
          &lt;/TabsTrigger&gt;
          &lt;TabsTrigger value="batches" className="flex items-center gap-2"&gt;
            &lt;Barcode className="w-4 h-4" /&gt;
            Lotes
          &lt;/TabsTrigger&gt;
          &lt;TabsTrigger value="movements" className="flex items-center gap-2"&gt;
            &lt;Activity className="w-4 h-4" /&gt;
            Movimentação
          &lt;/TabsTrigger&gt;
          &lt;TabsTrigger value="costs" className="flex items-center gap-2"&gt;
            &lt;TrendingUp className="w-4 h-4" /&gt;
            Custos
          &lt;/TabsTrigger&gt;
          &lt;TabsTrigger value="reorder" className="flex items-center gap-2"&gt;
            &lt;ShoppingCart className="w-4 h-4" /&gt;
            Reposição
          &lt;/TabsTrigger&gt;
        &lt;/TabsList&gt;

        {/* Product Catalog Tab */}
        &lt;TabsContent value="catalog" className="space-y-4"&gt;
          &lt;Card&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle&gt;Catálogo de Produtos&lt;/CardTitle&gt;
              &lt;CardDescription&gt;
                Gestão completa do catálogo com categorias médicas e controle ANVISA
              &lt;/CardDescription&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent&gt;
              &lt;Suspense fallback={&lt;div&gt;Carregando catálogo...&lt;/div&gt;}&gt;
                &lt;ProductCatalog /&gt;
              &lt;/Suspense&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/TabsContent&gt;

        {/* Stock Alerts Tab */}
        &lt;TabsContent value="alerts" className="space-y-4"&gt;
          &lt;Card&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle&gt;Alertas de Estoque&lt;/CardTitle&gt;
              &lt;CardDescription&gt;
                Monitoramento de estoque baixo, vencimentos e alertas ANVISA
              &lt;/CardDescription&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent&gt;
              &lt;Suspense fallback={&lt;div&gt;Carregando alertas...&lt;/div&gt;}&gt;
                &lt;StockAlerts /&gt;
              &lt;/Suspense&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/TabsContent&gt;

        {/* Supplier Management Tab */}
        &lt;TabsContent value="suppliers" className="space-y-4"&gt;
          &lt;Card&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle&gt;Gestão de Fornecedores&lt;/CardTitle&gt;
              &lt;CardDescription&gt;
                Cadastro com validação CNPJ e compliance fiscal brasileiro
              &lt;/CardDescription&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent&gt;
              &lt;Suspense fallback={&lt;div&gt;Carregando fornecedores...&lt;/div&gt;}&gt;
                &lt;SupplierManagement /&gt;
              &lt;/Suspense&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/TabsContent&gt;

        {/* Batch Tracking Tab */}
        &lt;TabsContent value="batches" className="space-y-4"&gt;
          &lt;Card&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle&gt;Rastreamento de Lotes&lt;/CardTitle&gt;
              &lt;CardDescription&gt;
                Controle de lotes médicos com rastreabilidade ANVISA completa
              &lt;/CardDescription&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent&gt;
              &lt;Suspense fallback={&lt;div&gt;Carregando lotes...&lt;/div&gt;}&gt;
                &lt;BatchTracking /&gt;
              &lt;/Suspense&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/TabsContent&gt;

        {/* Stock Movement Tab */}
        &lt;TabsContent value="movements" className="space-y-4"&gt;
          &lt;Card&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle&gt;Movimentação de Estoque&lt;/CardTitle&gt;
              &lt;CardDescription&gt;
                Auditoria completa de entradas e saídas com trilha de auditoria
              &lt;/CardDescription&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent&gt;
              &lt;Suspense fallback={&lt;div&gt;Carregando movimentações...&lt;/div&gt;}&gt;
                &lt;StockMovement /&gt;
              &lt;/Suspense&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/TabsContent&gt;

        {/* Cost Analysis Tab */}
        &lt;TabsContent value="costs" className="space-y-4"&gt;
          &lt;Card&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle&gt;Análise de Custos&lt;/CardTitle&gt;
              &lt;CardDescription&gt;
                Relatórios de custos e margens com cálculos fiscais brasileiros
              &lt;/CardDescription&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent&gt;
              &lt;Suspense fallback={&lt;div&gt;Carregando análise...&lt;/div&gt;}&gt;
                &lt;CostAnalysis /&gt;
              &lt;/Suspense&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/TabsContent&gt;

        {/* Reorder Management Tab */}
        &lt;TabsContent value="reorder" className="space-y-4"&gt;
          &lt;Card&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle&gt;Gestão de Reposição&lt;/CardTitle&gt;
              &lt;CardDescription&gt;
                Sugestões automáticas de reposição com análise preditiva
              &lt;/CardDescription&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent&gt;
              &lt;Suspense fallback={&lt;div&gt;Carregando reposição...&lt;/div&gt;}&gt;
                &lt;ReorderManagement /&gt;
              &lt;/Suspense&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/TabsContent&gt;
      &lt;/Tabs&gt;
    &lt;/div&gt;
  )
}