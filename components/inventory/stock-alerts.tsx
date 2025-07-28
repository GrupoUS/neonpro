'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { 
  AlertTriangle,
  Clock,
  Package,
  Thermometer,
  Shield,
  Bell,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface StockAlert {
  id: string
  type: 'low_stock' | 'expiring' | 'expired' | 'temperature' | 'anvisa_compliance' | 'maintenance'
  severity: 'critical' | 'warning' | 'info'
  productId: string
  productName: string
  category: string
  message: string
  details: string
  createdAt: string
  resolvedAt?: string
  actionRequired: boolean
  anvisaRegistration?: string
  batchNumber?: string
  location?: string
  temperatureReading?: number
  targetTemperatureRange?: string
}

// Mock data for demonstration
const mockAlerts: StockAlert[] = [
  {
    id: 'ALT001',
    type: 'expired',
    severity: 'critical',
    productId: 'PRD003',
    productName: 'Ácido Hialurônico Restylane',
    category: 'fillers',
    message: 'Produto vencido encontrado no estoque',
    details: 'Lote JV240815 venceu em 15/11/2024. Remoção imediata necessária.',
    createdAt: '2024-11-16T08:30:00Z',
    actionRequired: true,
    anvisaRegistration: '10295770030',
    batchNumber: 'JV240815',
    location: 'Geladeira A1-05'
  },
  {
    id: 'ALT002',
    type: 'low_stock',
    severity: 'warning',
    productId: 'PRD001',
    productName: 'Botox Allergan 100U',
    category: 'botox',
    message: 'Estoque abaixo do mínimo',
    details: 'Apenas 8 unidades restantes. Mínimo configurado: 10 unidades.',
    createdAt: '2024-11-15T14:22:00Z',
    actionRequired: true,
    anvisaRegistration: '10295770028',
    location: 'Geladeira A1-03'
  },
  {
    id: 'ALT003',
    type: 'expiring',
    severity: 'warning',
    productId: 'PRD002',
    productName: 'Preenchedor Juvederm Ultra',
    category: 'fillers',
    message: 'Produto próximo do vencimento',
    details: 'Vencimento em 12 dias (28/11/2024). Priorizar uso.',
    createdAt: '2024-11-16T09:15:00Z',
    actionRequired: true,
    anvisaRegistration: '10295770029',
    batchNumber: 'JV241015',
    location: 'Geladeira A1-04'
  },
  {
    id: 'ALT004',
    type: 'temperature',
    severity: 'critical',
    productId: 'PRD004',
    productName: 'Equipamento Laser CO2',
    category: 'equipment',
    message: 'Falha no sistema de refrigeração',
    details: 'Temperatura da sala de equipamentos acima de 25°C.',
    createdAt: '2024-11-16T10:45:00Z',
    actionRequired: true,
    location: 'Sala de Equipamentos B',
    temperatureReading: 28.5,
    targetTemperatureRange: '18-22°C'
  },
  {
    id: 'ALT005',
    type: 'anvisa_compliance',
    severity: 'warning',
    productId: 'PRD005',
    productName: 'Dermógrafo Elétrico',
    category: 'equipment',
    message: 'Manutenção preventiva vencida',
    details: 'Calibração ANVISA venceu em 10/11/2024. Reagendar manutenção.',
    createdAt: '2024-11-11T16:00:00Z',
    actionRequired: true,
    anvisaRegistration: '80146170015',
    location: 'Sala de Procedimentos 1'
  }
]

const alertTypeConfig = {
  low_stock: {
    icon: Package,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    bgColor: 'bg-amber-50',
    label: 'Estoque Baixo'
  },
  expiring: {
    icon: Clock,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    bgColor: 'bg-orange-50',
    label: 'Próximo ao Vencimento'
  },
  expired: {
    icon: XCircle,
    color: 'text-red-600 bg-red-50 border-red-200',
    bgColor: 'bg-red-50',
    label: 'Vencido'
  },
  temperature: {
    icon: Thermometer,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    bgColor: 'bg-blue-50',
    label: 'Controle de Temperatura'
  },
  anvisa_compliance: {
    icon: Shield,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    bgColor: 'bg-purple-50',
    label: 'Compliance ANVISA'
  },
  maintenance: {
    icon: AlertTriangle,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    bgColor: 'bg-yellow-50',
    label: 'Manutenção'
  }
}

/**
 * Stock Alerts Component for NeonPro Inventory Management
 * 
 * Features:
 * - Multi-type alert system (stock, expiration, temperature, compliance)
 * - ANVISA medical device compliance monitoring
 * - Temperature-controlled storage alerts
 * - Controlled substance expiration tracking
 * - CFM equipment maintenance alerts
 * - Brazilian healthcare regulation compliance
 * - Priority-based alert categorization
 * - Action-required workflow management
 * 
 * @author VoidBeast V4.0 + neonpro-code-guardian
 * @version 1.0.0
 * @compliance ANVISA, CFM, LGPD
 */
export function StockAlerts() {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')

  const alertCounts = useMemo(() => {
    const unresolved = mockAlerts.filter(alert => !alert.resolvedAt)
    return {
      total: unresolved.length,
      critical: unresolved.filter(alert => alert.severity === 'critical').length,
      warning: unresolved.filter(alert => alert.severity === 'warning').length,
      actionRequired: unresolved.filter(alert => alert.actionRequired).length
    }
  }, [])

  const filteredAlerts = useMemo(() => {
    return mockAlerts.filter(alert => {
      if (alert.resolvedAt) return false // Only show unresolved alerts
      
      const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity
      const matchesType = selectedType === 'all' || alert.type === selectedType
      
      return matchesSeverity && matchesType
    })
  }, [selectedSeverity, selectedType])

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleResolveAlert = (alertId: string) => {
    // In a real implementation, this would update the database
    console.log('Resolving alert:', alertId)
  }

  return (
    &lt;div className="space-y-6"&gt;
      {/* Alert Summary Cards */}
      &lt;div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"&gt;
        &lt;Card&gt;
          &lt;CardContent className="p-4"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm font-medium text-muted-foreground"&gt;Total de Alertas&lt;/p&gt;
                &lt;p className="text-2xl font-bold"&gt;{alertCounts.total}&lt;/p&gt;
              &lt;/div&gt;
              &lt;Bell className="h-8 w-8 text-muted-foreground" /&gt;
            &lt;/div&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;

        &lt;Card&gt;
          &lt;CardContent className="p-4"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm font-medium text-muted-foreground"&gt;Críticos&lt;/p&gt;
                &lt;p className="text-2xl font-bold text-red-600"&gt;{alertCounts.critical}&lt;/p&gt;
              &lt;/div&gt;
              &lt;XCircle className="h-8 w-8 text-red-500" /&gt;
            &lt;/div&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;

        &lt;Card&gt;
          &lt;CardContent className="p-4"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm font-medium text-muted-foreground"&gt;Avisos&lt;/p&gt;
                &lt;p className="text-2xl font-bold text-amber-600"&gt;{alertCounts.warning}&lt;/p&gt;
              &lt;/div&gt;
              &lt;AlertTriangle className="h-8 w-8 text-amber-500" /&gt;
            &lt;/div&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;

        &lt;Card&gt;
          &lt;CardContent className="p-4"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm font-medium text-muted-foreground"&gt;Ação Necessária&lt;/p&gt;
                &lt;p className="text-2xl font-bold text-blue-600"&gt;{alertCounts.actionRequired}&lt;/p&gt;
              &lt;/div&gt;
              &lt;CheckCircle className="h-8 w-8 text-blue-500" /&gt;
            &lt;/div&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;
      &lt;/div&gt;      {/* Filters */}
      &lt;div className="flex gap-4"&gt;
        &lt;Tabs value={selectedSeverity} onValueChange={setSelectedSeverity}&gt;
          &lt;TabsList&gt;
            &lt;TabsTrigger value="all"&gt;Todos&lt;/TabsTrigger&gt;
            &lt;TabsTrigger value="critical"&gt;Críticos&lt;/TabsTrigger&gt;
            &lt;TabsTrigger value="warning"&gt;Avisos&lt;/TabsTrigger&gt;
            &lt;TabsTrigger value="info"&gt;Informativos&lt;/TabsTrigger&gt;
          &lt;/TabsList&gt;
        &lt;/Tabs&gt;

        &lt;Tabs value={selectedType} onValueChange={setSelectedType}&gt;
          &lt;TabsList&gt;
            &lt;TabsTrigger value="all"&gt;Todos os Tipos&lt;/TabsTrigger&gt;
            &lt;TabsTrigger value="expired"&gt;Vencidos&lt;/TabsTrigger&gt;
            &lt;TabsTrigger value="expiring"&gt;Vencendo&lt;/TabsTrigger&gt;
            &lt;TabsTrigger value="low_stock"&gt;Estoque Baixo&lt;/TabsTrigger&gt;
            &lt;TabsTrigger value="anvisa_compliance"&gt;ANVISA&lt;/TabsTrigger&gt;
          &lt;/TabsList&gt;
        &lt;/Tabs&gt;
      &lt;/div&gt;

      {/* Alerts List */}
      &lt;div className="space-y-4"&gt;
        {filteredAlerts.map((alert) =&gt; {
          const config = alertTypeConfig[alert.type]
          const Icon = config.icon
          
          return (
            &lt;Card key={alert.id} className={`border-l-4 ${alert.severity === 'critical' ? 'border-l-red-500' : alert.severity === 'warning' ? 'border-l-amber-500' : 'border-l-blue-500'}`}&gt;
              &lt;CardHeader className="pb-3"&gt;
                &lt;div className="flex items-start justify-between"&gt;
                  &lt;div className="flex items-start gap-3"&gt;
                    &lt;div className={`p-2 rounded-lg ${config.bgColor}`}&gt;
                      &lt;Icon className="w-5 h-5" /&gt;
                    &lt;/div&gt;
                    
                    &lt;div className="space-y-1"&gt;
                      &lt;div className="flex items-center gap-2"&gt;
                        &lt;CardTitle className="text-base"&gt;{alert.message}&lt;/CardTitle&gt;
                        &lt;Badge variant="outline" className={getSeverityBadgeColor(alert.severity)}&gt;
                          {alert.severity === 'critical' ? 'Crítico' : 
                           alert.severity === 'warning' ? 'Aviso' : 'Info'}
                        &lt;/Badge&gt;
                        &lt;Badge variant="outline" className={config.color}&gt;
                          {config.label}
                        &lt;/Badge&gt;
                      &lt;/div&gt;
                      
                      &lt;CardDescription className="text-sm"&gt;
                        &lt;strong&gt;{alert.productName}&lt;/strong&gt; • {alert.category}
                      &lt;/CardDescription&gt;
                    &lt;/div&gt;
                  &lt;/div&gt;
                  
                  &lt;div className="flex items-center gap-2"&gt;
                    {alert.actionRequired && (
                      &lt;Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"&gt;
                        Ação Necessária
                      &lt;/Badge&gt;
                    )}
                    &lt;Button 
                      size="sm" 
                      variant="outline"
                      onClick={() =&gt; handleResolveAlert(alert.id)}
                    &gt;
                      &lt;CheckCircle className="w-4 h-4 mr-1" /&gt;
                      Resolver
                    &lt;/Button&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/CardHeader&gt;
              
              &lt;CardContent className="pt-0"&gt;
                &lt;div className="space-y-3"&gt;
                  &lt;p className="text-sm text-muted-foreground"&gt;
                    {alert.details}
                  &lt;/p&gt;
                  
                  &lt;div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"&gt;
                    {alert.location && (
                      &lt;div&gt;
                        &lt;span className="font-medium text-muted-foreground"&gt;Localização:&lt;/span&gt;
                        &lt;br /&gt;
                        {alert.location}
                      &lt;/div&gt;
                    )}
                    
                    {alert.batchNumber && (
                      &lt;div&gt;
                        &lt;span className="font-medium text-muted-foreground"&gt;Lote:&lt;/span&gt;
                        &lt;br /&gt;
                        {alert.batchNumber}
                      &lt;/div&gt;
                    )}
                    
                    {alert.anvisaRegistration && (
                      &lt;div&gt;
                        &lt;span className="font-medium text-muted-foreground"&gt;ANVISA:&lt;/span&gt;
                        &lt;br /&gt;
                        &lt;Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs"&gt;
                          &lt;Shield className="w-3 h-3 mr-1" /&gt;
                          {alert.anvisaRegistration}
                        &lt;/Badge&gt;
                      &lt;/div&gt;
                    )}
                    
                    {alert.temperatureReading && (
                      &lt;div&gt;
                        &lt;span className="font-medium text-muted-foreground"&gt;Temperatura:&lt;/span&gt;
                        &lt;br /&gt;
                        &lt;Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs"&gt;
                          &lt;Thermometer className="w-3 h-3 mr-1" /&gt;
                          {alert.temperatureReading}°C
                        &lt;/Badge&gt;
                        {alert.targetTemperatureRange && (
                          &lt;div className="text-xs text-muted-foreground mt-1"&gt;
                            Ideal: {alert.targetTemperatureRange}
                          &lt;/div&gt;
                        )}
                      &lt;/div&gt;
                    )}
                  &lt;/div&gt;
                  
                  &lt;div className="flex items-center justify-between pt-2 border-t border-muted"&gt;
                    &lt;span className="text-xs text-muted-foreground"&gt;
                      Criado em: {new Date(alert.createdAt).toLocaleString('pt-BR')}
                    &lt;/span&gt;
                    
                    {alert.type === 'anvisa_compliance' && (
                      &lt;Alert className="max-w-md"&gt;
                        &lt;Shield className="h-4 w-4" /&gt;
                        &lt;AlertTitle&gt;Compliance ANVISA&lt;/AlertTitle&gt;
                        &lt;AlertDescription className="text-xs"&gt;
                          Este alerta requer ação imediata para manter compliance regulatório.
                        &lt;/AlertDescription&gt;
                      &lt;/Alert&gt;
                    )}
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/CardContent&gt;
            &lt;/Card&gt;
          )
        })}
        
        {filteredAlerts.length === 0 && (
          &lt;Card&gt;
            &lt;CardContent className="p-8 text-center"&gt;
              &lt;CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-50" /&gt;
              &lt;h3 className="text-lg font-medium mb-2"&gt;Nenhum alerta encontrado&lt;/h3&gt;
              &lt;p className="text-muted-foreground"&gt;
                {selectedSeverity === 'all' && selectedType === 'all' 
                  ? 'Todos os alertas foram resolvidos. Excelente trabalho!'
                  : 'Nenhum alerta corresponde aos filtros selecionados.'
                }
              &lt;/p&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        )}
      &lt;/div&gt;
    &lt;/div&gt;
  )
}