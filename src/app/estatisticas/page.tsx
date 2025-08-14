'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  DollarSign,
  Activity,
  Star,
  Target,
  Clock,
  Zap,
  Eye,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

// Statistics Interfaces
interface PeriodMetrics {
  period: string
  revenue: number
  patients: number
  procedures: number
  satisfaction: number
  conversion: number
}

interface ServiceMetrics {
  id: string
  name: string
  category: string
  revenue: number
  bookings: number
  avgRating: number
  growthRate: number
  profitMargin: number
}

interface ProfessionalMetrics {
  id: string
  name: string
  role: string
  patients: number
  revenue: number
  satisfaction: number
  efficiency: number
  certifications: number
}

// KPI Card Component
const KPICard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  trend, 
  color = "bg-blue-600" 
}: {
  title: string
  value: string | number
  icon: any
  change?: number
  trend: 'up' | 'down' | 'stable'
  color?: string
}) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                <span className={`text-sm font-medium ${trendColor}`}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
          </div>
          <div className={`${color} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Performance Chart Component
const PerformanceChart = ({ data, title }: { data: PeriodMetrics[], title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>{title}</span>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          Detalhes
        </Button>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{item.period}</span>
              <div className="flex items-center gap-4 text-sm">
                <span>R$ {item.revenue.toLocaleString('pt-BR')}</span>
                <span>{item.patients} pacientes</span>
              </div>
            </div>
            <Progress value={(item.revenue / 150000) * 100} className="h-2" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

// Top Services Card
const TopServicesCard = ({ services }: { services: ServiceMetrics[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Star className="w-5 h-5" />
        Serviços Mais Performantes
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {services.slice(0, 5).map((service, index) => (
          <div key={service.id} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-sm text-gray-500">{service.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">R$ {service.revenue.toLocaleString('pt-BR')}</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-sm">{service.avgRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

// Professional Performance Card
const ProfessionalPerformanceCard = ({ professionals }: { professionals: ProfessionalMetrics[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="w-5 h-5" />
        Performance da Equipe
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {professionals.map((prof) => (
          <div key={prof.id} className="p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium">{prof.name}</p>
                <p className="text-sm text-gray-500">{prof.role}</p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                {prof.efficiency}% eficiência
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Pacientes</p>
                <p className="font-medium">{prof.patients}</p>
              </div>
              <div>
                <p className="text-gray-500">Receita</p>
                <p className="font-medium">R$ {(prof.revenue / 1000).toFixed(0)}k</p>
              </div>
              <div>
                <p className="text-gray-500">Satisfação</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{prof.satisfaction.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

// Mock Statistics Data
const mockPeriodMetrics: PeriodMetrics[] = [
  { period: 'Janeiro', revenue: 145000, patients: 320, procedures: 480, satisfaction: 4.8, conversion: 85 },
  { period: 'Fevereiro', revenue: 132000, patients: 298, procedures: 445, satisfaction: 4.7, conversion: 82 },
  { period: 'Março', revenue: 156000, patients: 345, procedures: 520, satisfaction: 4.9, conversion: 87 },
  { period: 'Abril', revenue: 148000, patients: 335, procedures: 505, satisfaction: 4.8, conversion: 86 },
  { period: 'Maio', revenue: 162000, patients: 365, procedures: 545, satisfaction: 4.9, conversion: 89 }
]

const mockServiceMetrics: ServiceMetrics[] = [
  {
    id: 'srv-001',
    name: 'Botox Terapêutico',
    category: 'Estética',
    revenue: 85000,
    bookings: 156,
    avgRating: 4.9,
    growthRate: 15.2,
    profitMargin: 68
  },
  {
    id: 'srv-002',
    name: 'Preenchimento Facial',
    category: 'Estética',
    revenue: 78000,
    bookings: 124,
    avgRating: 4.8,
    growthRate: 12.5,
    profitMargin: 65
  },
  {
    id: 'srv-003',
    name: 'Laser CO2',
    category: 'Tratamento',
    revenue: 65000,
    bookings: 89,
    avgRating: 4.7,
    growthRate: 18.3,
    profitMargin: 72
  },
  {
    id: 'srv-004',
    name: 'Limpeza de Pele',
    category: 'Clínica',
    revenue: 35000,
    bookings: 298,
    avgRating: 4.6,
    growthRate: 8.9,
    profitMargin: 45
  },
  {
    id: 'srv-005',
    name: 'Peeling Químico',
    category: 'Tratamento',
    revenue: 28000,
    bookings: 87,
    avgRating: 4.5,
    growthRate: 22.1,
    profitMargin: 58
  }
]

const mockProfessionalMetrics: ProfessionalMetrics[] = [
  {
    id: 'prof-001',
    name: 'Dra. Maria Santos',
    role: 'Dermatologista',
    patients: 1250,
    revenue: 185000,
    satisfaction: 4.9,
    efficiency: 94,
    certifications: 8
  },
  {
    id: 'prof-002',
    name: 'Carlos Oliveira',
    role: 'Enfermeiro Estético',
    patients: 890,
    revenue: 125000,
    satisfaction: 4.7,
    efficiency: 88,
    certifications: 5
  },
  {
    id: 'prof-003',
    name: 'Ana Ferreira',
    role: 'Esteticista',
    patients: 650,
    revenue: 95000,
    satisfaction: 4.8,
    efficiency: 91,
    certifications: 6
  }
]

export default function EstatisticasPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  
  // Calculate current month KPIs
  const currentMonth = mockPeriodMetrics[mockPeriodMetrics.length - 1]
  const previousMonth = mockPeriodMetrics[mockPeriodMetrics.length - 2]
  
  const revenueChange = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
  const patientChange = ((currentMonth.patients - previousMonth.patients) / previousMonth.patients) * 100
  const procedureChange = ((currentMonth.procedures - previousMonth.procedures) / previousMonth.procedures) * 100
  const satisfactionChange = ((currentMonth.satisfaction - previousMonth.satisfaction) / previousMonth.satisfaction) * 100
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Statistics Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <BarChart3 className="w-8 h-8" />
                Analytics e Estatísticas
              </h1>
              <p className="text-indigo-100 mt-1">
                Métricas de performance • Business Intelligence • Healthcare Analytics
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 -mt-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Receita Mensal"
            value={`R$ ${(currentMonth.revenue / 1000).toFixed(0)}k`}
            icon={DollarSign}
            change={Math.round(revenueChange)}
            trend={revenueChange > 0 ? 'up' : 'down'}
            color="bg-green-600"
          />
          <KPICard
            title="Pacientes Atendidos"
            value={currentMonth.patients}
            icon={Users}
            change={Math.round(patientChange)}
            trend={patientChange > 0 ? 'up' : 'down'}
            color="bg-blue-600"
          />
          <KPICard
            title="Procedimentos"
            value={currentMonth.procedures}
            icon={Activity}
            change={Math.round(procedureChange)}
            trend={procedureChange > 0 ? 'up' : 'down'}
            color="bg-purple-600"
          />
          <KPICard
            title="Satisfação Média"
            value={currentMonth.satisfaction.toFixed(1)}
            icon={Star}
            change={Math.round(satisfactionChange * 10) / 10}
            trend={satisfactionChange > 0 ? 'up' : 'down'}
            color="bg-amber-600"
          />
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="services">Serviços</TabsTrigger>
              <TabsTrigger value="team">Equipe</TabsTrigger>
              <TabsTrigger value="financial">Financeiro</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button 
                variant={selectedPeriod === 'week' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('week')}
              >
                Semana
              </Button>
              <Button 
                variant={selectedPeriod === 'month' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('month')}
              >
                Mês
              </Button>
              <Button 
                variant={selectedPeriod === 'year' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('year')}
              >
                Ano
              </Button>
            </div>
          </div>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart data={mockPeriodMetrics} title="Performance Mensal" />
              <TopServicesCard services={mockServiceMetrics} />
            </div>
          </TabsContent>
          
          <TabsContent value="services" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mockServiceMetrics.map((service) => (
                      <div key={service.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-lg">{service.name}</h3>
                            <p className="text-sm text-gray-500">{service.category}</p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`${service.growthRate > 15 ? 'text-green-600 border-green-600' : 'text-blue-600 border-blue-600'}`}
                          >
                            {service.growthRate > 0 ? '+' : ''}{service.growthRate.toFixed(1)}% crescimento
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Receita</p>
                            <p className="font-medium">R$ {service.revenue.toLocaleString('pt-BR')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Agendamentos</p>
                            <p className="font-medium">{service.bookings}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Avaliação</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="font-medium">{service.avgRating.toFixed(1)}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Margem</p>
                            <p className="font-medium">{service.profitMargin}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="team" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProfessionalPerformanceCard professionals={mockProfessionalMetrics} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Métricas da Equipe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Produtividade Geral</span>
                        <span className="text-sm text-gray-600">91%</span>
                      </div>
                      <Progress value={91} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Satisfação da Equipe</span>
                        <span className="text-sm text-gray-600">4.6/5.0</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Retenção de Funcionários</span>
                        <span className="text-sm text-gray-600">95%</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Cumprimento de Metas</span>
                        <span className="text-sm text-gray-600">87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="financial" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Receita por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Procedimentos Estéticos</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span>Tratamentos Clínicos</span>
                      <span className="font-medium">25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span>Produtos</span>
                      <span className="font-medium">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Custos Operacionais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Pessoal</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span>Produtos</span>
                      <span className="font-medium">30%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span>Infraestrutura</span>
                      <span className="font-medium">25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Projeções</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Receita Projetada (6 meses)</p>
                      <p className="text-2xl font-bold text-green-600">R$ 980k</p>
                      <p className="text-xs text-green-600">+18% crescimento</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Novos Pacientes</p>
                      <p className="text-2xl font-bold text-blue-600">450</p>
                      <p className="text-xs text-blue-600">Meta: 500</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Analytics Footer */}
      <footer className="bg-white border-t p-6 mt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-indigo-600 border-indigo-600">
              Real-time Analytics
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-600">
              Business Intelligence
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Healthcare Metrics
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            Dados atualizados em tempo real • Última atualização: {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </footer>
    </div>
  )
}