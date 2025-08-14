'use client'

import { useState } from 'react'
import { 
  Search, 
  Plus, 
  Scissors, 
  Zap, 
  Droplets, 
  Sparkles, 
  Star, 
  Clock, 
  DollarSign,
  Filter,
  Grid3x3,
  List,
  Eye,
  Edit,
  Calendar
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

// Healthcare Service Interface
interface HealthcareService {
  id: string
  name: string
  category: 'estetica' | 'clinica' | 'cirurgica' | 'preventiva'
  description: string
  duration: number // in minutes
  price: number
  popularity: number // 1-5 stars
  preparations?: string[]
  contraindications?: string[]
  equipment: string[]
  anesthesia: 'none' | 'local' | 'sedation' | 'general'
  recovery: {
    time: string
    instructions: string[]
  }
  certifications: string[]
  lastUpdated: string
  status: 'active' | 'inactive' | 'pending'
  bookingCount: number
  revenue: number
}

// Service Categories
const serviceCategories = [
  { id: 'estetica', name: 'Estética', icon: Sparkles, color: 'bg-pink-500' },
  { id: 'clinica', name: 'Clínica', icon: Zap, color: 'bg-blue-500' },
  { id: 'cirurgica', name: 'Cirúrgica', icon: Scissors, color: 'bg-red-500' },
  { id: 'preventiva', name: 'Preventiva', icon: Droplets, color: 'bg-green-500' }
]

// Service Status Badge
const ServiceStatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', label: 'Ativo' },
    inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inativo' },
    pending: { color: 'bg-amber-100 text-amber-800', label: 'Pendente' }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
  
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  )
}

// Star Rating Component
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star 
        key={star}
        className={`w-4 h-4 ${
          star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ))}
    <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
  </div>
)

// Service Card Component
const ServiceCard = ({ service }: { service: HealthcareService }) => {
  const category = serviceCategories.find(c => c.id === service.category)
  const Icon = category?.icon || Sparkles
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`${category?.color || 'bg-gray-500'} p-2 rounded-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <p className="text-sm text-gray-600">{category?.name}</p>
            </div>
          </div>
          <ServiceStatusBadge status={service.status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-4">{service.description}</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{service.duration} min</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="font-medium">R$ {service.price.toLocaleString('pt-BR')}</span>
            </div>
          </div>
          
          <StarRating rating={service.popularity} />
          
          <div className="flex items-center justify-between pt-2 border-t">
            <p className="text-sm text-gray-600">
              {service.bookingCount} agendamentos
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                Ver
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button size="sm">
                <Calendar className="w-4 h-4 mr-1" />
                Agendar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Service Statistics Card
const ServiceStatCard = ({ 
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

// Mock Healthcare Services Data
const mockHealthcareServices: HealthcareService[] = [
  {
    id: 'srv-001',
    name: 'Botox Terapêutico',
    category: 'estetica',
    description: 'Aplicação de toxina botulínica para rejuvenescimento facial e tratamento de rugas dinâmicas.',
    duration: 45,
    price: 650,
    popularity: 4.8,
    preparations: [
      'Evitar álcool 24h antes',
      'Não usar anticoagulantes',
      'Limpeza da pele'
    ],
    contraindications: [
      'Gravidez e amamentação',
      'Infecções na área',
      'Distúrbios neuromusculares'
    ],
    equipment: ['Agulhas ultra-finas', 'Toxina botulínica aprovada ANVISA'],
    anesthesia: 'local',
    recovery: {
      time: '2-3 dias',
      instructions: [
        'Evitar exercícios por 24h',
        'Não massagear a área',
        'Manter a cabeça elevada'
      ]
    },
    certifications: ['ANVISA', 'CFM'],
    lastUpdated: '2025-01-10',
    status: 'active',
    bookingCount: 156,
    revenue: 101400
  },
  {
    id: 'srv-002',
    name: 'Preenchimento com Ácido Hialurônico',
    category: 'estetica',
    description: 'Preenchimento facial para restaurar volume e reduzir sinais de envelhecimento.',
    duration: 60,
    price: 850,
    popularity: 4.7,
    preparations: [
      'Suspender anticoagulantes',
      'Evitar exercícios intensos',
      'Hidratação adequada'
    ],
    equipment: ['Ácido hialurônico certificado', 'Cânulas especializadas'],
    anesthesia: 'local',
    recovery: {
      time: '3-5 dias',
      instructions: [
        'Evitar calor excessivo',
        'Não fazer expressões extremas',
        'Aplicar gelo se necessário'
      ]
    },
    certifications: ['ANVISA', 'CFM'],
    lastUpdated: '2025-01-08',
    status: 'active',
    bookingCount: 124,
    revenue: 105400
  },
  {
    id: 'srv-003',
    name: 'Limpeza de Pele Profunda',
    category: 'clinica',
    description: 'Procedimento de limpeza profunda com extração e hidratação da pele facial.',
    duration: 90,
    price: 180,
    popularity: 4.5,
    equipment: ['Vapor de ozônio', 'Equipamentos de extração', 'Máscaras terapêuticas'],
    anesthesia: 'none',
    recovery: {
      time: '1-2 dias',
      instructions: [
        'Evitar sol direto',
        'Usar protetor solar',
        'Hidratação constante'
      ]
    },
    certifications: ['ANVISA'],
    lastUpdated: '2025-01-12',
    status: 'active',
    bookingCount: 298,
    revenue: 53640
  },
  {
    id: 'srv-004',
    name: 'Peeling Químico',
    category: 'clinica',
    description: 'Renovação celular através de peeling químico personalizado para cada tipo de pele.',
    duration: 75,
    price: 320,
    popularity: 4.6,
    equipment: ['Ácidos certificados', 'Neutralizantes', 'Equipamentos de segurança'],
    anesthesia: 'none',
    recovery: {
      time: '5-7 dias',
      instructions: [
        'Proteção solar rigorosa',
        'Hidratação intensiva',
        'Evitar produtos com álcool'
      ]
    },
    certifications: ['ANVISA', 'SBCD'],
    lastUpdated: '2025-01-09',
    status: 'active',
    bookingCount: 87,
    revenue: 27840
  }
]

export default function ServicosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Filter services
  const filteredServices = mockHealthcareServices.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Calculate statistics
  const totalServices = mockHealthcareServices.length
  const activeServices = mockHealthcareServices.filter(s => s.status === 'active').length
  const totalRevenue = mockHealthcareServices.reduce((acc, s) => acc + s.revenue, 0)
  const avgRating = mockHealthcareServices.reduce((acc, s) => acc + s.popularity, 0) / mockHealthcareServices.length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Healthcare Services Header */}
      <header className="bg-gradient-to-r from-pink-600 to-purple-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                Catálogo de Serviços
              </h1>
              <p className="text-pink-100 mt-1">
                Procedimentos estéticos e clínicos certificados • ANVISA Compliant
              </p>
            </div>
            <Button variant="secondary" className="bg-white text-pink-600 hover:bg-pink-50">
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Button>
          </div>
        </div>
      </header>

      {/* Service Statistics */}
      <div className="max-w-7xl mx-auto p-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ServiceStatCard
            title="Total de Serviços"
            value={totalServices}
            icon={Sparkles}
            trend="+3 novos este mês"
            color="bg-pink-600"
          />
          <ServiceStatCard
            title="Serviços Ativos"
            value={activeServices}
            icon={Zap}
            color="bg-blue-600"
          />
          <ServiceStatCard
            title="Receita Total"
            value={`R$ ${(totalRevenue / 1000).toFixed(0)}k`}
            icon={DollarSign}
            trend="+18% este mês"
            color="bg-green-600"
          />
          <ServiceStatCard
            title="Avaliação Média"
            value={avgRating.toFixed(1)}
            icon={Star}
            trend="Excelente"
            color="bg-amber-600"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar serviços..."
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
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {serviceCategories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Serviço</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Duração</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Avaliação</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Agendamentos</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredServices.map(service => {
                        const category = serviceCategories.find(c => c.id === service.category)
                        const Icon = category?.icon || Sparkles
                        
                        return (
                          <TableRow key={service.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className={`${category?.color || 'bg-gray-500'} p-2 rounded-lg`}>
                                  <Icon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium">{service.name}</p>
                                  <p className="text-sm text-gray-500 truncate max-w-xs">
                                    {service.description}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{category?.name}</TableCell>
                            <TableCell>{service.duration} min</TableCell>
                            <TableCell>R$ {service.price.toLocaleString('pt-BR')}</TableCell>
                            <TableCell>
                              <StarRating rating={service.popularity} />
                            </TableCell>
                            <TableCell>
                              <ServiceStatusBadge status={service.status} />
                            </TableCell>
                            <TableCell>{service.bookingCount}</TableCell>
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
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {serviceCategories.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices
                  .filter(service => service.category === category.id)
                  .map(service => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Healthcare Compliance Footer */}
      <footer className="bg-white border-t p-6 mt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-pink-600 border-pink-600">
              ANVISA Certified
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              CFM Approved
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-600">
              SBCD Member
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            Todos os procedimentos seguem protocolos de segurança internacionais
          </p>
        </div>
      </footer>
    </div>
  )
}