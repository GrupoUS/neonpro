'use client'

import { useState } from 'react'
import { 
  Search, 
  Plus, 
  UserCheck, 
  Award, 
  Calendar, 
  Clock, 
  Mail,
  Phone,
  MapPin,
  Star,
  Users,
  TrendingUp,
  Activity,
  Badge as BadgeIcon,
  Filter,
  Grid3x3,
  List,
  Edit,
  Eye,
  MoreHorizontal
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Healthcare Professional Interface
interface HealthcareProfessional {
  id: string
  name: string
  role: 'medico' | 'enfermeiro' | 'esteticista' | 'recepcionista' | 'administrador'
  specialty?: string
  crm?: string
  coren?: string
  cpf: string
  email: string
  phone: string
  address: string
  avatar?: string
  status: 'active' | 'inactive' | 'vacation' | 'suspended'
  startDate: string
  certifications: string[]
  experience: number // years
  rating: number
  totalPatients: number
  monthlyRevenue: number
  availability: {
    monday: string[]
    tuesday: string[]
    wednesday: string[]
    thursday: string[]
    friday: string[]
    saturday: string[]
    sunday: string[]
  }
  languages: string[]
  bio: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  lastLogin: string
  permissions: string[]
}

// Professional Roles
const professionalRoles = [
  { id: 'medico', name: 'Médico', icon: UserCheck, color: 'bg-blue-500' },
  { id: 'enfermeiro', name: 'Enfermeiro', icon: Award, color: 'bg-green-500' },
  { id: 'esteticista', name: 'Esteticista', icon: Star, color: 'bg-pink-500' },
  { id: 'recepcionista', name: 'Recepcionista', icon: Users, color: 'bg-purple-500' },
  { id: 'administrador', name: 'Administrador', icon: BadgeIcon, color: 'bg-gray-700' }
]

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', label: 'Ativo' },
    inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inativo' },
    vacation: { color: 'bg-blue-100 text-blue-800', label: 'Férias' },
    suspended: { color: 'bg-red-100 text-red-800', label: 'Suspenso' }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
  
  return (
    <Badge className={config.color}>
      {config.label}
    </Badge>
  )
}

// Professional Card Component
const ProfessionalCard = ({ professional }: { professional: HealthcareProfessional }) => {
  const role = professionalRoles.find(r => r.id === professional.role)
  const Icon = role?.icon || UserCheck
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={professional.avatar} alt={professional.name} />
              <AvatarFallback className="text-lg font-semibold">
                {professional.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{professional.name}</CardTitle>
              <p className="text-sm text-gray-600">{role?.name}</p>
              {professional.specialty && (
                <p className="text-xs text-gray-500">{professional.specialty}</p>
              )}
              {(professional.crm || professional.coren) && (
                <p className="text-xs text-blue-600">
                  {professional.crm || professional.coren}
                </p>
              )}
            </div>
          </div>
          <StatusBadge status={professional.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{professional.email}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{professional.phone}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{professional.experience} anos de experiência</span>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium">{professional.rating.toFixed(1)}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Pacientes</p>
              <p className="text-sm font-medium">{professional.totalPatients}</p>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="w-4 h-4 mr-1" />
              Ver Perfil
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Calendar className="w-4 h-4 mr-1" />
              Agenda
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Team Statistics Card
const TeamStatCard = ({ 
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

// Mock Healthcare Professionals Data
const mockHealthcareProfessionals: HealthcareProfessional[] = [
  {
    id: 'prof-001',
    name: 'Dra. Maria Silva Santos',
    role: 'medico',
    specialty: 'Dermatologia',
    crm: 'CRM/SP 123456',
    cpf: '123.456.789-00',
    email: 'maria.santos@neonpro.com',
    phone: '+55 11 99999-1234',
    address: 'Rua Augusta, 123 - São Paulo/SP',
    status: 'active',
    startDate: '2020-03-15',
    certifications: ['ANVISA', 'SBD', 'CFM'],
    experience: 12,
    rating: 4.9,
    totalPatients: 1250,
    monthlyRevenue: 85000,
    availability: {
      monday: ['08:00-12:00', '14:00-18:00'],
      tuesday: ['08:00-12:00', '14:00-18:00'],
      wednesday: ['08:00-12:00'],
      thursday: ['08:00-12:00', '14:00-18:00'],
      friday: ['08:00-12:00', '14:00-17:00'],
      saturday: ['08:00-12:00'],
      sunday: []
    },
    languages: ['Português', 'Inglês', 'Espanhol'],
    bio: 'Especialista em dermatologia clínica e estética com mais de 12 anos de experiência.',
    emergencyContact: {
      name: 'João Santos',
      phone: '+55 11 98888-5678',
      relationship: 'Cônjuge'
    },
    lastLogin: '2025-01-14T10:30:00',
    permissions: ['patients:read', 'patients:write', 'schedules:manage']
  },
  {
    id: 'prof-002',
    name: 'Carlos Eduardo Oliveira',
    role: 'enfermeiro',
    specialty: 'Enfermagem Estética',
    coren: 'COREN/SP 456789',
    cpf: '987.654.321-00',
    email: 'carlos.oliveira@neonpro.com',
    phone: '+55 11 98888-5678',
    address: 'Av. Paulista, 1000 - São Paulo/SP',
    status: 'active',
    startDate: '2021-06-10',
    certifications: ['COFEN', 'SOBEST'],
    experience: 8,
    rating: 4.7,
    totalPatients: 890,
    monthlyRevenue: 45000,
    availability: {
      monday: ['08:00-18:00'],
      tuesday: ['08:00-18:00'],
      wednesday: ['08:00-18:00'],
      thursday: ['08:00-18:00'],
      friday: ['08:00-17:00'],
      saturday: [],
      sunday: []
    },
    languages: ['Português', 'Inglês'],
    bio: 'Enfermeiro especializado em procedimentos estéticos minimamente invasivos.',
    emergencyContact: {
      name: 'Ana Oliveira',
      phone: '+55 11 97777-1234',
      relationship: 'Mãe'
    },
    lastLogin: '2025-01-14T09:15:00',
    permissions: ['patients:read', 'procedures:execute']
  },
  {
    id: 'prof-003',
    name: 'Ana Paula Ferreira',
    role: 'esteticista',
    specialty: 'Estética Facial',
    cpf: '456.789.123-00',
    email: 'ana.ferreira@neonpro.com',
    phone: '+55 11 97777-9012',
    address: 'Rua Oscar Freire, 456 - São Paulo/SP',
    status: 'active',
    startDate: '2022-01-20',
    certifications: ['SENAC', 'ABRE'],
    experience: 6,
    rating: 4.8,
    totalPatients: 650,
    monthlyRevenue: 32000,
    availability: {
      monday: ['09:00-17:00'],
      tuesday: ['09:00-17:00'],
      wednesday: ['09:00-17:00'],
      thursday: ['09:00-17:00'],
      friday: ['09:00-16:00'],
      saturday: ['09:00-13:00'],
      sunday: []
    },
    languages: ['Português'],
    bio: 'Esteticista especializada em tratamentos faciais e corporais avançados.',
    emergencyContact: {
      name: 'Roberto Ferreira',
      phone: '+55 11 96666-5432',
      relationship: 'Pai'
    },
    lastLogin: '2025-01-14T08:45:00',
    permissions: ['schedules:read', 'treatments:execute']
  },
  {
    id: 'prof-004',
    name: 'Juliana Costa Lima',
    role: 'recepcionista',
    cpf: '789.123.456-00',
    email: 'juliana.lima@neonpro.com',
    phone: '+55 11 96666-7890',
    address: 'Rua Consolação, 789 - São Paulo/SP',
    status: 'active',
    startDate: '2023-05-15',
    certifications: ['Atendimento ao Cliente', 'LGPD'],
    experience: 3,
    rating: 4.6,
    totalPatients: 2500, // Atendimentos
    monthlyRevenue: 0, // Não gera receita direta
    availability: {
      monday: ['08:00-17:00'],
      tuesday: ['08:00-17:00'],
      wednesday: ['08:00-17:00'],
      thursday: ['08:00-17:00'],
      friday: ['08:00-17:00'],
      saturday: ['08:00-12:00'],
      sunday: []
    },
    languages: ['Português', 'Inglês'],
    bio: 'Responsável pelo atendimento ao cliente e gestão de agendamentos.',
    emergencyContact: {
      name: 'Marcos Lima',
      phone: '+55 11 95555-3210',
      relationship: 'Esposo'
    },
    lastLogin: '2025-01-14T07:30:00',
    permissions: ['schedules:manage', 'patients:basic']
  }
]

export default function EquipePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // Filter professionals
  const filteredProfessionals = mockHealthcareProfessionals.filter(prof => {
    const matchesSearch = 
      prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prof.specialty && prof.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      prof.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = selectedRole === 'all' || prof.role === selectedRole
    
    return matchesSearch && matchesRole
  })

  // Calculate statistics
  const totalStaff = mockHealthcareProfessionals.length
  const activeStaff = mockHealthcareProfessionals.filter(p => p.status === 'active').length
  const totalPatients = mockHealthcareProfessionals.reduce((acc, p) => acc + p.totalPatients, 0)
  const avgRating = mockHealthcareProfessionals.reduce((acc, p) => acc + p.rating, 0) / mockHealthcareProfessionals.length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Healthcare Team Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users className="w-8 h-8" />
                Gestão de Equipe
              </h1>
              <p className="text-blue-100 mt-1">
                Profissionais de saúde certificados • CFM/COREN Compliant
              </p>
            </div>
            <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Profissional
            </Button>
          </div>
        </div>
      </header>

      {/* Team Statistics */}
      <div className="max-w-7xl mx-auto p-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <TeamStatCard
            title="Total da Equipe"
            value={totalStaff}
            icon={Users}
            trend="+2 este mês"
            color="bg-blue-600"
          />
          <TeamStatCard
            title="Profissionais Ativos"
            value={activeStaff}
            icon={Activity}
            color="bg-green-600"
          />
          <TeamStatCard
            title="Pacientes Atendidos"
            value={`${(totalPatients / 1000).toFixed(1)}k`}
            icon={UserCheck}
            trend="+15% este mês"
            color="bg-purple-600"
          />
          <TeamStatCard
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
                placeholder="Buscar profissionais..."
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

        {/* Role Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {professionalRoles.map(role => (
              <TabsTrigger key={role.id} value={role.id}>
                {role.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfessionals.map(professional => (
                  <ProfessionalCard key={professional.id} professional={professional} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Profissional</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Registro</TableHead>
                        <TableHead>Experiência</TableHead>
                        <TableHead>Avaliação</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pacientes</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfessionals.map(professional => {
                        const role = professionalRoles.find(r => r.id === professional.role)
                        const Icon = role?.icon || UserCheck
                        
                        return (
                          <TableRow key={professional.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={professional.avatar} />
                                  <AvatarFallback>
                                    {professional.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{professional.name}</p>
                                  <p className="text-sm text-gray-500">{professional.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`${role?.color || 'bg-gray-500'} p-1 rounded`}>
                                  <Icon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium">{role?.name}</p>
                                  {professional.specialty && (
                                    <p className="text-xs text-gray-500">{professional.specialty}</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {professional.crm || professional.coren || '-'}
                            </TableCell>
                            <TableCell>{professional.experience} anos</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                {professional.rating.toFixed(1)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={professional.status} />
                            </TableCell>
                            <TableCell>{professional.totalPatients.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Calendar className="w-4 h-4" />
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
          
          {professionalRoles.map(role => (
            <TabsContent key={role.id} value={role.id} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProfessionals
                  .filter(professional => professional.role === role.id)
                  .map(professional => (
                    <ProfessionalCard key={professional.id} professional={professional} />
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
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              CFM Certified
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-600">
              COREN Certified
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-600">
              LGPD Compliant
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            Todos os profissionais possuem certificações válidas
          </p>
        </div>
      </footer>
    </div>
  )
}