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
  Plus,
  Search,
  Filter,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Thermometer,
  Shield
} from 'lucide-react'

interface Product {
  id: string
  name: string
  category: 'botox' | 'fillers' | 'skincare' | 'equipment' | 'consumables'
  brand: string
  ncmCode: string
  anvisaRegistration?: string
  currentStock: number
  minStock: number
  maxStock: number
  unitPrice: number
  unitCost: number
  unit: string
  location: string
  temperatureControlled: boolean
  controlledSubstance: boolean
  expirationDate?: string
  batchNumber?: string
  supplier: string
  supplierCnpj: string
  status: 'active' | 'inactive' | 'discontinued'
}

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: 'PRD001',
    name: 'Botox Allergan 100U',
    category: 'botox',
    brand: 'Allergan',
    ncmCode: '30042000',
    anvisaRegistration: '10295770028',
    currentStock: 15,
    minStock: 10,
    maxStock: 50,
    unitPrice: 890.00,
    unitCost: 650.00,
    unit: 'frasco',
    location: 'Geladeira A1-03',
    temperatureControlled: true,
    controlledSubstance: true,
    expirationDate: '2024-12-15',
    batchNumber: 'BT240915',
    supplier: 'Medfarma Distribuidora',
    supplierCnpj: '12.345.678/0001-90',
    status: 'active'
  },
  {
    id: 'PRD002',
    name: 'Ácido Hialurônico Juvederm Ultra 3',
    category: 'fillers',
    brand: 'Allergan',
    ncmCode: '30042000',
    anvisaRegistration: '10295770029',
    currentStock: 8,
    minStock: 5,
    maxStock: 30,
    unitPrice: 1250.00,
    unitCost: 950.00,
    unit: 'seringa',
    location: 'Geladeira A1-04',
    temperatureControlled: true,
    controlledSubstance: false,
    expirationDate: '2025-03-20',
    batchNumber: 'JV241020',
    supplier: 'Beauty Supply LTDA',
    supplierCnpj: '23.456.789/0001-01',
    status: 'active'
  }
]const categories = [
  { 
    id: 'botox', 
    name: 'Toxina Botulínica', 
    icon: '💉',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  { 
    id: 'fillers', 
    name: 'Preenchedores', 
    icon: '🧪',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  { 
    id: 'skincare', 
    name: 'Dermocosméticos', 
    icon: '✨',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  { 
    id: 'equipment', 
    name: 'Equipamentos', 
    icon: '⚕️',
    color: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  { 
    id: 'consumables', 
    name: 'Descartáveis', 
    icon: '🧤',
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  }
]

/**
 * Product Catalog Component for NeonPro Inventory Management
 * 
 * Features:
 * - Multi-category product management (botox, fillers, skincare, equipment, consumables)
 * - ANVISA registration tracking for medical devices
 * - Temperature-controlled storage indicators
 * - Controlled substance tracking (botox, prescription items)
 * - Brazilian tax compliance (NCM codes)
 * - Stock level monitoring with visual indicators
 * - Search and filtering capabilities
 * 
 * @author VoidBeast V4.0 + neonpro-code-guardian
 * @version 1.0.0
 * @compliance ANVISA, CFM, LGPD
 */
export function ProductCatalog() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.ncmCode.includes(searchTerm)
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus
      
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [searchTerm, selectedCategory, selectedStatus])

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= product.minStock) {
      return { status: 'low', color: 'text-red-600 bg-red-50 border-red-200', icon: AlertTriangle }
    }
    if (product.currentStock >= product.maxStock * 0.8) {
      return { status: 'high', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle }
    }
    return { status: 'normal', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Package }
  }

  const isExpiringSoon = (expirationDate?: string) => {
    if (!expirationDate) return false
    const expDate = new Date(expirationDate)
    const today = new Date()
    const diffTime = expDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  return (
    &lt;div className="space-y-6"&gt;
      {/* Search and Filters */}
      &lt;div className="flex flex-col sm:flex-row gap-4"&gt;
        &lt;div className="relative flex-1"&gt;
          &lt;Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" /&gt;
          &lt;Input
            placeholder="Buscar produtos por nome, marca ou NCM..."
            value={searchTerm}
            onChange={(e) =&gt; setSearchTerm(e.target.value)}
            className="pl-10"
          /&gt;
        &lt;/div&gt;
        
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

        &lt;Select value={selectedStatus} onValueChange={setSelectedStatus}&gt;
          &lt;SelectTrigger className="w-32"&gt;
            &lt;SelectValue placeholder="Status" /&gt;
          &lt;/SelectTrigger&gt;
          &lt;SelectContent&gt;
            &lt;SelectItem value="all"&gt;Todos&lt;/SelectItem&gt;
            &lt;SelectItem value="active"&gt;Ativo&lt;/SelectItem&gt;
            &lt;SelectItem value="inactive"&gt;Inativo&lt;/SelectItem&gt;
            &lt;SelectItem value="discontinued"&gt;Descontinuado&lt;/SelectItem&gt;
          &lt;/SelectContent&gt;
        &lt;/Select&gt;

        &lt;Button&gt;
          &lt;Plus className="w-4 h-4 mr-2" /&gt;
          Novo Produto
        &lt;/Button&gt;
      &lt;/div&gt;

      {/* Category Summary Cards */}
      &lt;div className="grid grid-cols-2 md:grid-cols-5 gap-4"&gt;
        {categories.map(category =&gt; {
          const categoryCount = mockProducts.filter(p =&gt; p.category === category.id && p.status === 'active').length
          return (
            &lt;Card 
              key={category.id} 
              className={`cursor-pointer transition-colors hover:shadow-md ${ 
                selectedCategory === category.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() =&gt; setSelectedCategory(selectedCategory === category.id ? 'all' : category.id)}
            &gt;
              &lt;CardContent className="p-4 text-center"&gt;
                &lt;div className="text-2xl mb-2"&gt;{category.icon}&lt;/div&gt;
                &lt;div className="font-medium text-sm mb-1"&gt;{category.name}&lt;/div&gt;
                &lt;Badge variant="outline" className={category.color}&gt;
                  {categoryCount} itens
                &lt;/Badge&gt;
              &lt;/CardContent&gt;
            &lt;/Card&gt;
          )
        })}
      &lt;/div&gt;      {/* Products Table */}
      &lt;Card&gt;
        &lt;CardHeader&gt;
          &lt;CardTitle className="flex items-center justify-between"&gt;
            &lt;span&gt;Produtos ({filteredProducts.length})&lt;/span&gt;
            &lt;div className="flex items-center gap-2"&gt;
              &lt;Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"&gt;
                &lt;Shield className="w-3 h-3 mr-1" /&gt;
                ANVISA Compliant
              &lt;/Badge&gt;
            &lt;/div&gt;
          &lt;/CardTitle&gt;
          &lt;CardDescription&gt;
            Catálogo completo com controle de estoque e compliance regulatório
          &lt;/CardDescription&gt;
        &lt;/CardHeader&gt;
        &lt;CardContent&gt;
          &lt;div className="overflow-x-auto"&gt;
            &lt;Table&gt;
              &lt;TableHeader&gt;
                &lt;TableRow&gt;
                  &lt;TableHead&gt;Produto&lt;/TableHead&gt;
                  &lt;TableHead&gt;Categoria&lt;/TableHead&gt;
                  &lt;TableHead&gt;Estoque&lt;/TableHead&gt;
                  &lt;TableHead&gt;Localização&lt;/TableHead&gt;
                  &lt;TableHead&gt;Validade&lt;/TableHead&gt;
                  &lt;TableHead&gt;Preço Unit.&lt;/TableHead&gt;
                  &lt;TableHead&gt;Compliance&lt;/TableHead&gt;
                  &lt;TableHead&gt;Status&lt;/TableHead&gt;
                &lt;/TableRow&gt;
              &lt;/TableHeader&gt;
              &lt;TableBody&gt;
                {filteredProducts.map((product) =&gt; {
                  const stockStatus = getStockStatus(product)
                  const StockIcon = stockStatus.icon
                  const category = categories.find(c =&gt; c.id === product.category)
                  const expiringSoon = isExpiringSoon(product.expirationDate)
                  
                  return (
                    &lt;TableRow key={product.id} className="hover:bg-muted/50"&gt;
                      &lt;TableCell&gt;
                        &lt;div&gt;
                          &lt;div className="font-medium"&gt;{product.name}&lt;/div&gt;
                          &lt;div className="text-sm text-muted-foreground"&gt;
                            {product.brand} • NCM: {product.ncmCode}
                          &lt;/div&gt;
                          {product.anvisaRegistration && (
                            &lt;div className="text-xs text-blue-600"&gt;
                              ANVISA: {product.anvisaRegistration}
                            &lt;/div&gt;
                          )}
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;Badge variant="outline" className={category?.color}&gt;
                          {category?.icon} {category?.name}
                        &lt;/Badge&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;div className="flex items-center gap-2"&gt;
                          &lt;Badge variant="outline" className={stockStatus.color}&gt;
                            &lt;StockIcon className="w-3 h-3 mr-1" /&gt;
                            {product.currentStock} {product.unit}
                          &lt;/Badge&gt;
                          &lt;div className="text-xs text-muted-foreground"&gt;
                            Min: {product.minStock}
                          &lt;/div&gt;
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;div className="flex items-center gap-1"&gt;
                          {product.temperatureControlled && (
                            &lt;Thermometer className="w-3 h-3 text-blue-500" /&gt;
                          )}
                          &lt;span className="text-sm"&gt;{product.location}&lt;/span&gt;
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        {product.expirationDate ? (
                          &lt;div className={`text-sm ${expiringSoon ? 'text-amber-600 font-medium' : ''}`}&gt;
                            {expiringSoon && &lt;Clock className="w-3 h-3 inline mr-1" /&gt;}
                            {new Date(product.expirationDate).toLocaleDateString('pt-BR')}
                            {product.batchNumber && (
                              &lt;div className="text-xs text-muted-foreground"&gt;
                                Lote: {product.batchNumber}
                              &lt;/div&gt;
                            )}
                          &lt;/div&gt;
                        ) : (
                          &lt;span className="text-muted-foreground text-sm"&gt;N/A&lt;/span&gt;
                        )}
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;div className="font-medium"&gt;
                          R$ {product.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        &lt;/div&gt;
                        &lt;div className="text-xs text-muted-foreground"&gt;
                          Custo: R$ {product.unitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;div className="flex flex-col gap-1"&gt;
                          {product.controlledSubstance && (
                            &lt;Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs"&gt;
                              Controlado
                            &lt;/Badge&gt;
                          )}
                          {product.temperatureControlled && (
                            &lt;Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs"&gt;
                              Refrigerado
                            &lt;/Badge&gt;
                          )}
                          {product.anvisaRegistration && (
                            &lt;Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs"&gt;
                              ANVISA
                            &lt;/Badge&gt;
                          )}
                        &lt;/div&gt;
                      &lt;/TableCell&gt;
                      
                      &lt;TableCell&gt;
                        &lt;Badge 
                          variant={product.status === 'active' ? 'default' : 'secondary'}
                          className={
                            product.status === 'active' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : product.status === 'inactive'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }
                        &gt;
                          {product.status === 'active' ? 'Ativo' : 
                           product.status === 'inactive' ? 'Inativo' : 'Descontinuado'}
                        &lt;/Badge&gt;
                      &lt;/TableCell&gt;
                    &lt;/TableRow&gt;
                  )
                })}
              &lt;/TableBody&gt;
            &lt;/Table&gt;
            
            {filteredProducts.length === 0 && (
              &lt;div className="text-center py-8 text-muted-foreground"&gt;
                &lt;Package className="w-12 h-12 mx-auto mb-4 opacity-50" /&gt;
                &lt;p&gt;Nenhum produto encontrado com os filtros aplicados.&lt;/p&gt;
              &lt;/div&gt;
            )}
          &lt;/div&gt;
        &lt;/CardContent&gt;
      &lt;/Card&gt;
    &lt;/div&gt;
  )
}