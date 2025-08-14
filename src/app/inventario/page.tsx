'use client'

import { useState } from 'react'
import { 
  Search, 
  Plus, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  ShoppingCart,
  Box,
  Zap,
  Thermometer,
  Shield,
  Calendar,
  Eye,
  Edit,
  Filter,
  Download,
  BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

// Inventory Item Interface
interface InventoryItem {
  id: string
  name: string
  category: 'produtos' | 'equipamentos' | 'consumiveis' | 'medicamentos'
  subcategory: string
  brand: string
  model?: string
  serialNumber?: string
  currentStock: number
  minStock: number
  maxStock: number
  unitPrice: number
  totalValue: number
  supplier: string
  expiryDate?: string
  batchNumber?: string
  location: string
  status: 'active' | 'inactive' | 'expired' | 'recalled'
  lastRestocked: string
  nextMaintenance?: string
  certifications: string[]
  description: string
  usage: {
    lastMonth: number
    thisMonth: number
    projected: number
  }
  alerts: {
    lowStock: boolean
    expiringSoon: boolean
    maintenanceDue: boolean
  }
}

// Category Configuration
const inventoryCategories = [
  { id: 'produtos', name: 'Produtos', icon: Package, color: 'bg-blue-500' },
  { id: 'equipamentos', name: 'Equipamentos', icon: Zap, color: 'bg-purple-500' },
  { id: 'consumiveis', name: 'Consumíveis', icon: Box, color: 'bg-green-500' },
  { id: 'medicamentos', name: 'Medicamentos', icon: Shield, color: 'bg-red-500' }
]

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', label: 'Ativo' },
    inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inativo' },
    expired: { color: 'bg-red-100 text-red-800', label: 'Vencido' },
    recalled: { color: 'bg-orange-100 text-orange-800', label: 'Recall' }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
  
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  )
}

// Stock Level Indicator
const StockLevelIndicator = ({ current, min, max }: { current: number, min: number, max: number }) => {
  const percentage = Math.min((current / max) * 100, 100)
  const isLow = current <= min
  const isCritical = current <= (min * 0.5)
  
  const color = isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-green-500'
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{current}/{max}</span>
        <span className={`${isCritical ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-green-600'} font-medium`}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      {isLow && (
        <div className="flex items-center gap-1 text-xs text-amber-600">
          <AlertTriangle className="w-3 h-3" />
          Estoque baixo
        </div>
      )}
    </div>
  )
}

// Inventory Statistics Card
const InventoryStatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = "bg-blue-600" 
}: {
  title: string
  value: string | number
  icon: any
  trend?: string
  color?: string
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">{trend}</p>
          )}
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

// Alert Card Component
const AlertCard = ({ items }: { items: InventoryItem[] }) => {
  const lowStockItems = items.filter(item => item.alerts.lowStock)
  const expiringItems = items.filter(item => item.alerts.expiringSoon)
  const maintenanceItems = items.filter(item => item.alerts.maintenanceDue)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Alertas do Inventário
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lowStockItems.length > 0 && (
            <div>
              <h4 className="font-medium text-amber-700 mb-2">Estoque Baixo ({lowStockItems.length})</h4>
              {lowStockItems.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <p className="text-sm">{item.name}</p>
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    {item.currentStock} restantes
                  </Badge>
                </div>
              ))}
            </div>
          )}
          
          {expiringItems.length > 0 && (
            <div>
              <h4 className="font-medium text-red-700 mb-2">Vencendo em Breve ({expiringItems.length})</h4>
              {expiringItems.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <p className="text-sm">{item.name}</p>
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    {item.expiryDate}
                  </Badge>
                </div>
              ))}
            </div>
          )}
          
          {maintenanceItems.length > 0 && (
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Manutenção Pendente ({maintenanceItems.length})</h4>
              {maintenanceItems.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <p className="text-sm">{item.name}</p>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    {item.nextMaintenance}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Mock Inventory Data
const mockInventoryItems: InventoryItem[] = [
  {
    id: 'inv-001',
    name: 'Ácido Hialurônico Premium',
    category: 'produtos',
    subcategory: 'Injetáveis',
    brand: 'Allergan',
    currentStock: 15,
    minStock: 10,
    maxStock: 50,
    unitPrice: 850,
    totalValue: 12750,
    supplier: 'Distribuidora Med SP',
    expiryDate: '2025-12-15',
    batchNumber: 'AH2024-156',
    location: 'Geladeira A - Prateleira 2',
    status: 'active',
    lastRestocked: '2025-01-10',
    certifications: ['ANVISA', 'FDA'],
    description: 'Preenchimento facial de alta qualidade para tratamentos estéticos',
    usage: {
      lastMonth: 12,
      thisMonth: 8,
      projected: 15
    },
    alerts: {
      lowStock: true,
      expiringSoon: false,
      maintenanceDue: false
    }
  },
  {
    id: 'inv-002',
    name: 'Laser CO2 Fracionado',
    category: 'equipamentos',
    subcategory: 'Laser',
    brand: 'Lumenis',
    model: 'UltraPulse',
    serialNumber: 'LP2024-001',
    currentStock: 1,
    minStock: 1,
    maxStock: 1,
    unitPrice: 180000,
    totalValue: 180000,
    supplier: 'Lumenis Brasil',
    location: 'Sala 3 - Procedimentos',
    status: 'active',
    lastRestocked: '2023-08-15',
    nextMaintenance: '2025-02-15',
    certifications: ['ANVISA', 'INMETRO', 'CE'],
    description: 'Equipamento de laser fracionado para rejuvenescimento e tratamento de cicatrizes',
    usage: {
      lastMonth: 45,
      thisMonth: 52,
      projected: 48
    },
    alerts: {
      lowStock: false,
      expiringSoon: false,
      maintenanceDue: true
    }
  },
  {
    id: 'inv-003',
    name: 'Luvas Descartáveis Nitrilo',
    category: 'consumiveis',
    subcategory: 'EPIs',
    brand: 'MedGlove',
    currentStock: 2500,
    minStock: 1000,
    maxStock: 5000,
    unitPrice: 0.45,
    totalValue: 1125,
    supplier: 'Suprimentos Médicos Ltda',
    expiryDate: '2026-08-30',
    batchNumber: 'NG2024-890',
    location: 'Almoxarifado - Prateleira C',
    status: 'active',
    lastRestocked: '2025-01-05',
    certifications: ['ANVISA', 'CA'],
    description: 'Luvas de proteção individual para procedimentos médicos',
    usage: {
      lastMonth: 800,
      thisMonth: 650,
      projected: 750
    },
    alerts: {
      lowStock: false,
      expiringSoon: false,
      maintenanceDue: false
    }
  },
  {
    id: 'inv-004',
    name: 'Lidocaína Spray 10%',
    category: 'medicamentos',
    subcategory: 'Anestésicos',
    brand: 'Cristália',
    currentStock: 8,
    minStock: 15,
    maxStock: 30,
    unitPrice: 24.50,
    totalValue: 196,
    supplier: 'Distribuidora Pharma',
    expiryDate: '2025-03-20',
    batchNumber: 'LID2024-445',
    location: 'Armário Medicamentos - Gaveta 2',
    status: 'active',
    lastRestocked: '2024-12-20',
    certifications: ['ANVISA'],
    description: 'Anestésico tópico para procedimentos minimamente invasivos',
    usage: {
      lastMonth: 5,
      thisMonth: 7,
      projected: 6
    },
    alerts: {
      lowStock: true,
      expiringSoon: true,
      maintenanceDue: false
    }
  }
]

export default function InventarioPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Filter items
  const filteredItems = mockInventoryItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Calculate statistics
  const totalItems = mockInventoryItems.length
  const totalValue = mockInventoryItems.reduce((acc, item) => acc + item.totalValue, 0)
  const lowStockItems = mockInventoryItems.filter(item => item.alerts.lowStock).length
  const alertsCount = mockInventoryItems.reduce((acc, item) => 
    acc + (item.alerts.lowStock ? 1 : 0) + (item.alerts.expiringSoon ? 1 : 0) + (item.alerts.maintenanceDue ? 1 : 0), 0
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Inventory Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Package className="w-8 h-8" />
                Gestão de Inventário
              </h1>
              <p className="text-emerald-100 mt-1">
                Controle de estoque • ANVISA Compliant • Rastreabilidade completa
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="bg-white text-emerald-600 hover:bg-emerald-50">
                <Download className="w-4 h-4 mr-2" />
                Relatório
              </Button>
              <Button variant="secondary" className="bg-white text-emerald-600 hover:bg-emerald-50">
                <Plus className="w-4 h-4 mr-2" />
                Novo Item
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Inventory Statistics */}
      <div className="max-w-7xl mx-auto p-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <InventoryStatCard
            title="Total de Itens"
            value={totalItems}
            icon={Package}
            trend="+5 este mês"
            color="bg-emerald-600"
          />
          <InventoryStatCard
            title="Valor do Estoque"
            value={`R$ ${(totalValue / 1000).toFixed(0)}k`}
            icon={TrendingUp}
            trend="+12% este mês"
            color="bg-blue-600"
          />
          <InventoryStatCard
            title="Estoque Baixo"
            value={lowStockItems}
            icon={AlertTriangle}
            color="bg-amber-600"
          />
          <InventoryStatCard
            title="Alertas Ativos"
            value={alertsCount}
            icon={Activity}
            color="bg-red-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Inventory Table */}
          <div className="lg:col-span-3">
            {/* Search and Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar itens do inventário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>
              
              <Button variant="outline">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>

            {/* Category Tabs */}
            <Tabs defaultValue="all">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">Todos</TabsTrigger>
                {inventoryCategories.map(category => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                <Card>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Estoque</TableHead>
                          <TableHead>Valor Unitário</TableHead>
                          <TableHead>Valor Total</TableHead>
                          <TableHead>Localização</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map(item => {
                          const category = inventoryCategories.find(c => c.id === item.category)
                          const Icon = category?.icon || Package
                          
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className={`${category?.color || 'bg-gray-500'} p-2 rounded-lg`}>
                                    <Icon className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.brand}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{category?.name}</p>
                                  <p className="text-sm text-gray-500">{item.subcategory}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <StockLevelIndicator 
                                  current={item.currentStock}
                                  min={item.minStock}
                                  max={item.maxStock}
                                />
                              </TableCell>
                              <TableCell>R$ {item.unitPrice.toLocaleString('pt-BR')}</TableCell>
                              <TableCell>R$ {item.totalValue.toLocaleString('pt-BR')}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Box className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm">{item.location}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={item.status} />
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <ShoppingCart className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {inventoryCategories.map(category => (
                <TabsContent key={category.id} value={category.id} className="mt-6">
                  <Card>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Subcategoria</TableHead>
                            <TableHead>Estoque</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Localização</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredItems
                            .filter(item => item.category === category.id)
                            .map(item => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.brand}</p>
                                  </div>
                                </TableCell>
                                <TableCell>{item.subcategory}</TableCell>
                                <TableCell>
                                  <StockLevelIndicator 
                                    current={item.currentStock}
                                    min={item.minStock}
                                    max={item.maxStock}
                                  />
                                </TableCell>
                                <TableCell>R$ {item.totalValue.toLocaleString('pt-BR')}</TableCell>
                                <TableCell>{item.location}</TableCell>
                                <TableCell><StatusBadge status={item.status} /></TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Alerts Sidebar */}
          <div>
            <AlertCard items={mockInventoryItems} />
          </div>
        </div>
      </div>

      {/* Compliance Footer */}
      <footer className="bg-white border-t p-6 mt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-emerald-600 border-emerald-600">
              ANVISA Compliant
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Rastreabilidade Completa
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-600">
              Controle de Lote
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            Gestão de inventário com rastreabilidade regulatória completa
          </p>
        </div>
      </footer>
    </div>
  )
}