'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { 
  Search,
  Barcode,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Thermometer,
  Shield,
  Package,
  FileText,
  QrCode,
  Truck
} from 'lucide-react'

interface Batch {
  id: string
  batchNumber: string
  productId: string
  productName: string
  category: string
  brand: string
  quantity: number
  unit: string
  manufactureDate: string
  expirationDate: string
  supplierName: string
  supplierCnpj: string
  receivedDate: string
  receivedBy: string
  currentLocation: string
  temperatureControlled: boolean
  storageTemperature?: string
  anvisaRegistration?: string
  ncmCode: string
  invoiceNumber: string
  unitCost: number
  totalCost: number
  qualityControl: {
    status: 'pending' | 'approved' | 'rejected'
    inspector: string
    inspectionDate?: string
    notes?: string
  }
  traceabilityChain: TraceabilityEntry[]
  status: 'quarantine' | 'available' | 'in_use' | 'expired' | 'recalled'
  utilizationTracking: UtilizationEntry[]
}

interface TraceabilityEntry {
  id: string
  date: string
  action: string
  user: string
  location: string
  details: string
  temperature?: number
  validated: boolean
}

interface UtilizationEntry {
  id: string
  date: string
  patientId?: string
  procedureType: string
  quantityUsed: number
  professionalId: string
  professionalName: string
  notes?: string
}

// Mock data for demonstration
const mockBatches: Batch[] = [
  {
    id: 'BATCH001',
    batchNumber: 'BT240915',
    productId: 'PRD001',
    productName: 'Botox Allergan 100U',
    category: 'botox',
    brand: 'Allergan',
    quantity: 50,
    unit: 'frasco',
    manufactureDate: '2024-09-15',
    expirationDate: '2024-12-15',
    supplierName: 'Medfarma Distribuidora',
    supplierCnpj: '12.345.678/0001-90',
    receivedDate: '2024-09-20T14:30:00Z',
    receivedBy: 'João Silva - Farmacêutico',
    currentLocation: 'Geladeira A1-03',
    temperatureControlled: true,
    storageTemperature: '2-8°C',
    anvisaRegistration: '10295770028',
    ncmCode: '30042000',
    invoiceNumber: 'NF-001234',
    unitCost: 650.00,
    totalCost: 32500.00,
    qualityControl: {
      status: 'approved',
      inspector: 'Maria Santos - QC',
      inspectionDate: '2024-09-20T16:00:00Z',
      notes: 'Produto dentro das especificações. Embalagem íntegra.'
    },
    traceabilityChain: [
      {
        id: 'TRACE001',
        date: '2024-09-20T14:30:00Z',
        action: 'Recebimento',
        user: 'João Silva',
        location: 'Almoxarifado',
        details: 'Recebimento de 50 frascos conforme NF-001234',
        temperature: 4.2,
        validated: true
      },
      {
        id: 'TRACE002',
        date: '2024-09-20T16:00:00Z',
        action: 'Aprovação CQ',
        user: 'Maria Santos',
        location: 'Laboratório QC',
        details: 'Aprovado após inspeção visual e documental',
        validated: true
      },
      {
        id: 'TRACE003',
        date: '2024-09-20T16:30:00Z',
        action: 'Armazenamento',
        user: 'João Silva',
        location: 'Geladeira A1-03',
        details: 'Armazenado em refrigeração controlada',
        temperature: 3.8,
        validated: true
      }
    ],
    status: 'available',
    utilizationTracking: [
      {
        id: 'UTIL001',
        date: '2024-10-15T09:30:00Z',
        patientId: 'PAT12345',
        procedureType: 'Aplicação Botox - Rugas de Expressão',
        quantityUsed: 1,
        professionalId: 'PROF001',
        professionalName: 'Dr. Ana Costa - CRM 123456',
        notes: 'Aplicação em região frontal - 20 unidades'
      }
    ]
  }
]

const statusConfig = {
  quarantine: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Quarentena',
    icon: Clock
  },
  available: {
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Disponível',
    icon: CheckCircle
  },
  in_use: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Em Uso',
    icon: Package
  },
  expired: {
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Vencido',
    icon: AlertTriangle
  },
  recalled: {
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    label: 'Recall',
    icon: AlertTriangle
  }
}

/**
 * Batch Tracking Component for NeonPro Inventory Management
 * 
 * Features:
 * - Complete batch/lot tracking with ANVISA compliance
 * - Medical device registration tracking
 * - Temperature-controlled storage monitoring
 * - Quality control approval workflow
 * - Full traceability chain from receipt to patient use
 * - Controlled substance utilization tracking
 * - Expiration date monitoring with Brazilian date format
 * - ANVISA recall management integration
 * - Patient safety audit trail
 * 
 * @author VoidBeast V4.0 + neonpro-code-guardian
 * @version 1.0.0
 * @compliance ANVISA, CFM, LGPD
 */
export function BatchTracking() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary')

  const filteredBatches = useMemo(() => {
    return mockBatches.filter(batch => {
      const matchesSearch = batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           batch.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = selectedStatus === 'all' || batch.status === selectedStatus
      const matchesCategory = selectedCategory === 'all' || batch.category === selectedCategory
      
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [searchTerm, selectedStatus, selectedCategory])

  const getBatchAlert = (batch: Batch) => {
    const today = new Date()
    const expDate = new Date(batch.expirationDate)
    const daysToExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysToExpiry <= 0) {
      return { type: 'expired', message: 'Lote vencido', color: 'bg-red-50 border-red-200' }
    } else if (daysToExpiry <= 30) {
      return { type: 'expiring', message: `Vence em ${daysToExpiry} dias`, color: 'bg-amber-50 border-amber-200' }
    } else if (batch.status === 'quarantine') {
      return { type: 'quarantine', message: 'Aguardando liberação', color: 'bg-yellow-50 border-yellow-200' }
    }
    return null
  }

  const formatBrazilianDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    &lt;div className="space-y-6"&gt;
      {/* Search and Filters */}
      &lt;div className="flex flex-col sm:flex-row gap-4"&gt;
        &lt;div className="relative flex-1"&gt;
          &lt;Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /&gt;
          &lt;Input
            placeholder="Buscar por lote, produto ou fornecedor..."
            value={searchTerm}
            onChange={(e) =&gt; setSearchTerm(e.target.value)}
            className="pl-10"
          /&gt;
        &lt;/div&gt;
        
        &lt;Select value={selectedStatus} onValueChange={setSelectedStatus}&gt;
          &lt;SelectTrigger className="w-40"&gt;
            &lt;SelectValue placeholder="Status" /&gt;
          &lt;/SelectTrigger&gt;
          &lt;SelectContent&gt;
            &lt;SelectItem value="all"&gt;Todos os Status&lt;/SelectItem&gt;
            &lt;SelectItem value="quarantine"&gt;Quarentena&lt;/SelectItem&gt;
            &lt;SelectItem value="available"&gt;Disponível&lt;/SelectItem&gt;
            &lt;SelectItem value="in_use"&gt;Em Uso&lt;/SelectItem&gt;
            &lt;SelectItem value="expired"&gt;Vencido&lt;/SelectItem&gt;
            &lt;SelectItem value="recalled"&gt;Recall&lt;/SelectItem&gt;
          &lt;/SelectContent&gt;
        &lt;/Select&gt;

        &lt;Select value={selectedCategory} onValueChange={setSelectedCategory}&gt;
          &lt;SelectTrigger className="w-48"&gt;
            &lt;SelectValue placeholder="Categoria" /&gt;
          &lt;/SelectTrigger&gt;
          &lt;SelectContent&gt;
            &lt;SelectItem value="all"&gt;Todas as Categorias&lt;/SelectItem&gt;
            &lt;SelectItem value="botox"&gt;💉 Toxina Botulínica&lt;/SelectItem&gt;
            &lt;SelectItem value="fillers"&gt;🧪 Preenchedores&lt;/SelectItem&gt;
            &lt;SelectItem value="skincare"&gt;✨ Dermocosméticos&lt;/SelectItem&gt;
            &lt;SelectItem value="equipment"&gt;⚕️ Equipamentos&lt;/SelectItem&gt;
            &lt;SelectItem value="consumables"&gt;🧤 Descartáveis&lt;/SelectItem&gt;
          &lt;/SelectContent&gt;
        &lt;/Select&gt;

        &lt;Tabs value={viewMode} onValueChange={(value) =&gt; setViewMode(value as 'summary' | 'detailed')}&gt;
          &lt;TabsList&gt;
            &lt;TabsTrigger value="summary"&gt;Resumo&lt;/TabsTrigger&gt;
            &lt;TabsTrigger value="detailed"&gt;Detalhado&lt;/TabsTrigger&gt;
          &lt;/TabsList&gt;
        &lt;/Tabs&gt;
      &lt;/div&gt;

      {/* Summary Statistics */}
      &lt;div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"&gt;
        &lt;Card&gt;
          &lt;CardContent className="p-4"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm font-medium text-muted-foreground"&gt;Lotes Ativos&lt;/p&gt;
                &lt;p className="text-2xl font-bold"&gt;{mockBatches.filter(b =&gt; b.status === 'available').length}&lt;/p&gt;
              &lt;/div&gt;
              &lt;Barcode className="h-8 w-8 text-green-500" /&gt;
            &lt;/div&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;

        &lt;Card&gt;
          &lt;CardContent className="p-4"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm font-medium text-muted-foreground"&gt;Vencendo (30 dias)&lt;/p&gt;
                &lt;p className="text-2xl font-bold text-amber-600"&gt;
                  {mockBatches.filter(b =&gt; {
                    const daysToExpiry = Math.ceil((new Date(b.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    return daysToExpiry &gt; 0 && daysToExpiry &lt;= 30
                  }).length}
                &lt;/p&gt;
              &lt;/div&gt;
              &lt;Clock className="h-8 w-8 text-amber-500" /&gt;
            &lt;/div&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;

        &lt;Card&gt;
          &lt;CardContent className="p-4"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm font-medium text-muted-foreground"&gt;Controle Temp.&lt;/p&gt;
                &lt;p className="text-2xl font-bold text-blue-600"&gt;
                  {mockBatches.filter(b =&gt; b.temperatureControlled).length}
                &lt;/p&gt;
              &lt;/div&gt;
              &lt;Thermometer className="h-8 w-8 text-blue-500" /&gt;
            &lt;/div&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;

        &lt;Card&gt;
          &lt;CardContent className="p-4"&gt;
            &lt;div className="flex items-center justify-between"&gt;
              &lt;div&gt;
                &lt;p className="text-sm font-medium text-muted-foreground"&gt;ANVISA Compliant&lt;/p&gt;
                &lt;p className="text-2xl font-bold text-green-600"&gt;
                  {mockBatches.filter(b =&gt; b.anvisaRegistration).length}
                &lt;/p&gt;
              &lt;/div&gt;
              &lt;Shield className="h-8 w-8 text-green-500" /&gt;
            &lt;/div&gt;
          &lt;/CardContent&gt;
        &lt;/Card&gt;
      &lt;/div&gt;      {/* Batches Table */}
      &lt;Card&gt;
        &lt;CardHeader&gt;
          &lt;CardTitle className="flex items-center justify-between"&gt;
            &lt;span&gt;Lotes Registrados ({filteredBatches.length})&lt;/span&gt;
            &lt;div className="flex items-center gap-2"&gt;
              &lt;Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"&gt;
                &lt;Shield className="w-3 h-3 mr-1" /&gt;
                ANVISA Tracking
              &lt;/Badge&gt;
              &lt;Button size="sm"&gt;
                &lt;QrCode className="w-4 h-4 mr-2" /&gt;
                Escanear Lote
              &lt;/Button&gt;
            &lt;/div&gt;
          &lt;/CardTitle&gt;
          &lt;CardDescription&gt;
            Rastreamento completo com compliance ANVISA e auditoria
          &lt;/CardDescription&gt;
        &lt;/CardHeader&gt;
        &lt;CardContent&gt;
          &lt;div className="overflow-x-auto"&gt;
            &lt;Table&gt;
              &lt;TableHeader&gt;
                &lt;TableRow&gt;
                  &lt;TableHead&gt;Lote / Produto&lt;/TableHead&gt;
                  &lt;TableHead&gt;Quantidade&lt;/TableHead&gt;
                  &lt;TableHead&gt;Validade&lt;/TableHead&gt;
                  &lt;TableHead&gt;Fornecedor&lt;/TableHead&gt;
                  &lt;TableHead&gt;Localização&lt;/TableHead&gt;
                  &lt;TableHead&gt;Compliance&lt;/TableHead&gt;
                  &lt;TableHead&gt;Status&lt;/TableHead&gt;
                  {viewMode === 'detailed' && &lt;TableHead&gt;Rastreabilidade&lt;/TableHead&gt;}
                &lt;/TableRow&gt;
              &lt;/TableHeader&gt;
              &lt;TableBody&gt;
                {filteredBatches.map((batch) =&gt; {
                  const alert = getBatchAlert(batch)
                  const statusConfig_ = statusConfig[batch.status]
                  const StatusIcon = statusConfig_.icon
                  
                  return (
                    &lt;TableRow key={batch.id} className="hover:bg-muted/50"&gt;
                      &lt;TableCell&gt;
                        &lt;div className="space-y-1"&gt;
                          &lt;div className="flex items-center gap-2"&gt;
                            &lt;Barcode className="w-4 h-4 text-muted-foreground" /&gt;
                            &lt;span className="font-mono font-medium"&gt;{batch.batchNumber}&lt;/span&gt;
                          &lt;/div&gt;
                          &lt;div className="font-medium"&gt;{batch.productName}&lt;/div&gt;
                          &lt;div className="text-sm text-muted-foreground"&gt;
                            {batch.brand} • NCM: {batch.ncmCode}
                          &lt;/div&gt;
                          {alert && (
                            &lt;Alert className={`${alert.color} p-2`}&gt;
                              &lt;AlertTriangle className="h-3 w-3" /&gt;
                              &lt;AlertDescription className="text-xs font-medium"&gt;
                                {alert.message}
                              &lt;/AlertDescription&gt;
                            &lt;/Alert&gt;
                          )}
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;div className="text-center"&gt;
                          &lt;div className="font-medium"&gt;{batch.quantity}&lt;/div&gt;
                          &lt;div className="text-sm text-muted-foreground"&gt;{batch.unit}&lt;/div&gt;
                          {batch.utilizationTracking.length &gt; 0 && (
                            &lt;div className="text-xs text-blue-600"&gt;
                              {batch.utilizationTracking.reduce((acc, util) =&gt; acc + util.quantityUsed, 0)} utilizados
                            &lt;/div&gt;
                          )}
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;div className="space-y-1"&gt;
                          &lt;div className="flex items-center gap-1"&gt;
                            &lt;Calendar className="w-3 h-3 text-muted-foreground" /&gt;
                            &lt;span className="text-sm"&gt;{formatBrazilianDate(batch.expirationDate)}&lt;/span&gt;
                          &lt;/div&gt;
                          &lt;div className="text-xs text-muted-foreground"&gt;
                            Fabricação: {formatBrazilianDate(batch.manufactureDate)}
                          &lt;/div&gt;
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;div className="space-y-1"&gt;
                          &lt;div className="font-medium text-sm"&gt;{batch.supplierName}&lt;/div&gt;
                          &lt;div className="text-xs text-muted-foreground font-mono"&gt;
                            {batch.supplierCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}
                          &lt;/div&gt;
                          &lt;div className="flex items-center gap-1"&gt;
                            &lt;Truck className="w-3 h-3 text-muted-foreground" /&gt;
                            &lt;span className="text-xs text-muted-foreground"&gt;
                              Recebido: {formatBrazilianDate(batch.receivedDate)}
                            &lt;/span&gt;
                          &lt;/div&gt;
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;div className="space-y-1"&gt;
                          &lt;div className="flex items-center gap-1"&gt;
                            &lt;Package className="w-3 h-3 text-muted-foreground" /&gt;
                            &lt;span className="text-sm"&gt;{batch.currentLocation}&lt;/span&gt;
                          &lt;/div&gt;
                          {batch.temperatureControlled && (
                            &lt;Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs"&gt;
                              &lt;Thermometer className="w-3 h-3 mr-1" /&gt;
                              {batch.storageTemperature}
                            &lt;/Badge&gt;
                          )}
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;div className="space-y-1"&gt;
                          {batch.anvisaRegistration && (
                            &lt;Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs"&gt;
                              &lt;Shield className="w-3 h-3 mr-1" /&gt;
                              ANVISA
                            &lt;/Badge&gt;
                          )}
                          &lt;Badge 
                            variant="outline" 
                            className={
                              batch.qualityControl.status === 'approved' 
                                ? 'bg-green-50 text-green-700 border-green-200 text-xs'
                                : batch.qualityControl.status === 'pending'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200 text-xs'
                                : 'bg-red-50 text-red-700 border-red-200 text-xs'
                            }
                          &gt;
                            &lt;FileText className="w-3 h-3 mr-1" /&gt;
                            QC {batch.qualityControl.status === 'approved' ? 'Aprovado' : 
                                batch.qualityControl.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                          &lt;/Badge&gt;
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;Badge variant="outline" className={statusConfig_.color}&gt;
                          &lt;StatusIcon className="w-3 h-3 mr-1" /&gt;
                          {statusConfig_.label}
                        &lt;/Badge&gt;
                      &lt;/TableCell&gt;
                      
                      {viewMode === 'detailed' && (
                        &lt;TableCell&gt;
                          &lt;div className="space-y-1 max-w-[200px]"&gt;
                            &lt;div className="text-xs font-medium"&gt;Última Movimentação:&lt;/div&gt;
                            {batch.traceabilityChain.slice(-1).map(entry =&gt; (
                              &lt;div key={entry.id} className="text-xs text-muted-foreground"&gt;
                                &lt;div&gt;{entry.action}&lt;/div&gt;
                                &lt;div&gt;{entry.user} • {formatBrazilianDate(entry.date)}&lt;/div&gt;
                              &lt;/div&gt;
                            ))}
                            &lt;div className="text-xs text-blue-600 font-medium"&gt;
                              {batch.traceabilityChain.length} registros
                            &lt;/div&gt;
                          &lt;/div&gt;
                        &lt;/TableCell&gt;
                      )}
                    &lt;/TableRow&gt;
                  )
                })}
              &lt;/TableBody&gt;
            &lt;/Table&gt;
            
            {filteredBatches.length === 0 && (
              &lt;div className="text-center py-8 text-muted-foreground"&gt;
                &lt;Barcode className="w-12 h-12 mx-auto mb-4 opacity-50" /&gt;
                &lt;p&gt;Nenhum lote encontrado com os filtros aplicados.&lt;/p&gt;
              &lt;/div&gt;
            )}
          &lt;/div&gt;
        &lt;/CardContent&gt;
      &lt;/Card&gt;

      {/* Detailed Traceability Section (when detailed view is selected) */}
      {viewMode === 'detailed' && filteredBatches.length &gt; 0 && (
        &lt;Card&gt;
          &lt;CardHeader&gt;
            &lt;CardTitle&gt;Auditoria de Rastreabilidade&lt;/CardTitle&gt;
            &lt;CardDescription&gt;
              Histórico completo de movimentações com validação ANVISA
            &lt;/CardDescription&gt;
          &lt;/CardHeader&gt;
          &lt;CardContent className="space-y-6"&gt;
            {filteredBatches.slice(0, 1).map(batch =&gt; ( // Show details for first batch as example
              &lt;div key={batch.id} className="space-y-4"&gt;
                &lt;div className="flex items-center gap-2 pb-2 border-b"&gt;
                  &lt;Barcode className="w-5 h-5" /&gt;
                  &lt;span className="font-mono font-medium"&gt;{batch.batchNumber}&lt;/span&gt;
                  &lt;span className="text-muted-foreground"&gt;•&lt;/span&gt;
                  &lt;span className="font-medium"&gt;{batch.productName}&lt;/span&gt;
                &lt;/div&gt;
                
                &lt;div className="grid gap-4 md:grid-cols-2"&gt;
                  {/* Traceability Chain */}
                  &lt;div className="space-y-3"&gt;
                    &lt;h4 className="font-medium flex items-center gap-2"&gt;
                      &lt;FileText className="w-4 h-4" /&gt;
                      Cadeia de Rastreabilidade
                    &lt;/h4&gt;
                    &lt;div className="space-y-2"&gt;
                      {batch.traceabilityChain.map((entry, index) =&gt; (
                        &lt;div key={entry.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"&gt;
                          &lt;div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium"&gt;
                            {index + 1}
                          &lt;/div&gt;
                          &lt;div className="flex-1 space-y-1"&gt;
                            &lt;div className="flex items-center justify-between"&gt;
                              &lt;span className="font-medium text-sm"&gt;{entry.action}&lt;/span&gt;
                              {entry.validated && (
                                &lt;Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"&gt;
                                  &lt;CheckCircle className="w-3 h-3 mr-1" /&gt;
                                  Validado
                                &lt;/Badge&gt;
                              )}
                            &lt;/div&gt;
                            &lt;div className="text-xs text-muted-foreground"&gt;
                              {entry.user} • {entry.location}
                            &lt;/div&gt;
                            &lt;div className="text-xs text-muted-foreground"&gt;
                              {new Date(entry.date).toLocaleString('pt-BR')}
                            &lt;/div&gt;
                            {entry.temperature && (
                              &lt;div className="flex items-center gap-1 text-xs text-blue-600"&gt;
                                &lt;Thermometer className="w-3 h-3" /&gt;
                                {entry.temperature}°C
                              &lt;/div&gt;
                            )}
                            &lt;p className="text-xs text-muted-foreground"&gt;{entry.details}&lt;/p&gt;
                          &lt;/div&gt;
                        &lt;/div&gt;
                      ))}
                    &lt;/div&gt;
                  &lt;/div&gt;

                  {/* Utilization Tracking */}
                  &lt;div className="space-y-3"&gt;
                    &lt;h4 className="font-medium flex items-center gap-2"&gt;
                      &lt;Package className="w-4 h-4" /&gt;
                      Rastreamento de Utilização
                    &lt;/h4&gt;
                    {batch.utilizationTracking.length &gt; 0 ? (
                      &lt;div className="space-y-2"&gt;
                        {batch.utilizationTracking.map((util) =&gt; (
                          &lt;div key={util.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg"&gt;
                            &lt;div className="flex items-center justify-between mb-2"&gt;
                              &lt;span className="font-medium text-sm"&gt;{util.procedureType}&lt;/span&gt;
                              &lt;Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300"&gt;
                                {util.quantityUsed} {batch.unit}
                              &lt;/Badge&gt;
                            &lt;/div&gt;
                            &lt;div className="space-y-1 text-xs text-muted-foreground"&gt;
                              &lt;div&gt;Profissional: {util.professionalName}&lt;/div&gt;
                              &lt;div&gt;Data: {new Date(util.date).toLocaleString('pt-BR')}&lt;/div&gt;
                              {util.patientId && (
                                &lt;div&gt;Paciente ID: {util.patientId} (LGPD Protected)&lt;/div&gt;
                              )}
                              {util.notes && &lt;div&gt;Obs: {util.notes}&lt;/div&gt;}
                            &lt;/div&gt;
                          &lt;/div&gt;
                        ))}
                      &lt;/div&gt;
                    ) : (
                      &lt;p className="text-sm text-muted-foreground"&gt;
                        Nenhuma utilização registrada ainda.
                      &lt;/p&gt;
                    )}
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            ))}
          &lt;/CardContent&gt;
        &lt;/Card&gt;
      )}
    &lt;/div&gt;
  )
}