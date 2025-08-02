"use client"

import { useState } from 'react'
import { 
  Users, 
  UserPlus, 
  Calendar, 
  TrendingUp, 
  Search, 
  Filter, 
  Edit, 
  FileText, 
  Phone, 
  Mail, 
  MapPin,
  Star,
  Activity,
  Clock,
  Zap
} from 'lucide-react'

// NeonGradientCard Component
const NeonGradientCard = ({ children, className = "" }) => (
  <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 border border-blue-500/20 backdrop-blur-sm ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-emerald-500/10 animate-background-position-spin" />
    <div className="relative z-10 p-6">
      {children}
    </div>
  </div>
)

// CosmicGlowButton Component
const CosmicGlowButton = ({ children, variant = "primary", size = "md", className = "", onClick, disabled = false }) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25 hover:shadow-blue-400/40",
    secondary: "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/40",
    warning: "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-lg shadow-amber-500/25 hover:shadow-amber-400/40",
    danger: "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/25 hover:shadow-red-400/40"
  }
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center
        ${variants[variant]}
        ${sizes[size]}
        text-white font-medium rounded-lg
        transform transition-all duration-200
        hover:scale-105 hover:animate-glow-scale
        focus:outline-none focus:ring-2 focus:ring-blue-500/50
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        animate-glow-slide
        ${className}
      `}
    >
      <div className="relative z-10 flex items-center gap-2">
        {children}
      </div>
    </button>
  )
}

// Patient Card Component
const PatientCard = ({ patient }) => (
  <NeonGradientCard className="hover:border-blue-400/40 transition-all duration-300 group">
    <div className="flex items-start gap-4">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
          {patient.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-800 ${
          patient.status === 'Ativo' ? 'bg-emerald-500' :
          patient.status === 'VIP' ? 'bg-amber-500' : 'bg-gray-500'
        }`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
            {patient.name}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            patient.status === 'Ativo' ? 'bg-emerald-500/20 text-emerald-400' :
            patient.status === 'VIP' ? 'bg-amber-500/20 text-amber-400' : 
            'bg-gray-500/20 text-gray-400'
          }`}>
            {patient.status}
          </span>
        </div>
        
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-400" />
            <span>{patient.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Último: {patient.lastVisit}</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span>{patient.treatments.join(', ')}</span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <CosmicGlowButton size="sm" variant="primary">
            <Edit className="w-4 h-4" />
            Editar
          </CosmicGlowButton>
          <CosmicGlowButton size="sm" variant="secondary">
            <FileText className="w-4 h-4" />
            Prontuário
          </CosmicGlowButton>
        </div>
      </div>
    </div>
  </NeonGradientCard>
)

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')

  // Sample patient data with Brazilian aesthetic treatments
  const patients = [
    {
      id: 1,
      name: "Maria Silva",
      phone: "(11) 99999-1234",
      email: "maria.silva@email.com",
      cpf: "123.456.789-01",
      status: "Ativo",
      lastVisit: "15/01/2024",
      treatments: ["Harmonização Facial", "Botox"],
      totalVisits: 12,
      address: "São Paulo, SP"
    },
    {
      id: 2,
      name: "Ana Costa",
      phone: "(11) 98888-5678",
      email: "ana.costa@email.com",
      cpf: "234.567.890-12",
      status: "VIP",
      lastVisit: "20/01/2024",
      treatments: ["Preenchimento Labial", "Limpeza de Pele"],
      totalVisits: 25,
      address: "Rio de Janeiro, RJ"
    },
    {
      id: 3,
      name: "Julia Santos",
      phone: "(11) 97777-9012",
      email: "julia.santos@email.com",
      cpf: "345.678.901-23",
      status: "Ativo",
      lastVisit: "18/01/2024",
      treatments: ["Microagulhamento", "Peeling"],
      totalVisits: 8,
      address: "Belo Horizonte, MG"
    },
    {
      id: 4,
      name: "Carla Mendes",
      phone: "(11) 96666-3456",
      email: "carla.mendes@email.com",
      cpf: "456.789.012-34",
      status: "Ativo",
      lastVisit: "12/01/2024",
      treatments: ["Radiofrequência", "Drenagem"],
      totalVisits: 15,
      address: "Brasília, DF"
    },
    {
      id: 5,
      name: "Fernanda Lima",
      phone: "(11) 95555-7890",
      email: "fernanda.lima@email.com",
      cpf: "567.890.123-45",
      status: "Inativo",
      lastVisit: "28/12/2023",
      treatments: ["Laser", "Hidratação"],
      totalVisits: 6,
      address: "Salvador, BA"
    },
    {
      id: 6,
      name: "Patricia Oliveira",
      phone: "(11) 94444-2345",
      email: "patricia.oliveira@email.com",
      cpf: "678.901.234-56",
      status: "VIP",
      lastVisit: "22/01/2024",
      treatments: ["Lifting", "Toxina Botulínica"],
      totalVisits: 32,
      address: "Curitiba, PR"
    }
  ]

  // KPIs data
  const kpis = [
    {
      title: "Total Pacientes",
      value: "156",
      change: "+12%",
      icon: Users,
      color: "from-blue-600 to-blue-500",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400"
    },
    {
      title: "Pacientes Ativos",
      value: "134",
      change: "+8%",
      icon: Activity,
      color: "from-emerald-600 to-emerald-500",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400"
    },
    {
      title: "Novos no Mês",
      value: "23",
      change: "+15%",
      icon: UserPlus,
      color: "from-amber-600 to-amber-500",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-400"
    },
    {
      title: "Taxa Retorno",
      value: "87%",
      change: "+5%",
      icon: TrendingUp,
      color: "from-purple-600 to-purple-500",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400"
    }
  ]

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.treatments.some(treatment => 
                           treatment.toLowerCase().includes(searchTerm.toLowerCase())
                         )
    const matchesStatus = statusFilter === 'todos' || 
                         patient.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-glow-scale" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl animate-glow-slide" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-background-position-spin" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                Gestão de Pacientes
              </h1>
              <p className="text-gray-400 mt-2">
                Gerencie informações e histórico dos seus pacientes
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <CosmicGlowButton variant="primary" className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Novo Paciente
              </CosmicGlowButton>
              <CosmicGlowButton variant="secondary" className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Relatórios
              </CosmicGlowButton>
            </div>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon
            return (
              <NeonGradientCard key={index} className="group hover:border-blue-400/40 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{kpi.title}</p>
                    <p className="text-2xl lg:text-3xl font-bold text-white group-hover:scale-105 transition-transform">
                      {kpi.value}
                    </p>
                    <p className={`text-sm ${kpi.textColor} font-medium`}>
                      {kpi.change} vs mês anterior
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${kpi.bgColor} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${kpi.textColor}`} />
                  </div>
                </div>
              </NeonGradientCard>
            )
          })}
        </div>

        {/* Search and Filters */}
        <NeonGradientCard className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou tratamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="todos">Todos Status</option>
                  <option value="ativo">Ativo</option>
                  <option value="vip">VIP</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
              
              <CosmicGlowButton variant="secondary">
                <Calendar className="w-5 h-5" />
                Filtrar Data
              </CosmicGlowButton>
            </div>
          </div>
        </NeonGradientCard>        {/* Patient Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <NeonGradientCard className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Lista de Pacientes</h3>
              <span className="text-gray-400 text-sm">
                {filteredPatients.length} de {patients.length} pacientes
              </span>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              {filteredPatients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
              
              {filteredPatients.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Nenhum paciente encontrado</p>
                </div>
              )}
            </div>
          </NeonGradientCard>

          {/* Quick Actions */}
          <NeonGradientCard>
            <h3 className="text-xl font-semibold text-white mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <CosmicGlowButton variant="primary" className="w-full justify-start">
                <UserPlus className="w-5 h-5" />
                Cadastrar Novo Paciente
              </CosmicGlowButton>
              
              <CosmicGlowButton variant="secondary" className="w-full justify-start">
                <Calendar className="w-5 h-5" />
                Agendar Consulta
              </CosmicGlowButton>
              
              <CosmicGlowButton variant="warning" className="w-full justify-start">
                <FileText className="w-5 h-5" />
                Relatório Mensal
              </CosmicGlowButton>
              
              <CosmicGlowButton variant="danger" className="w-full justify-start">
                <Clock className="w-5 h-5" />
                Pacientes Inativos
              </CosmicGlowButton>
            </div>

            {/* Recent Activity */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-lg font-medium text-white mb-3">Atividade Recente</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <div className="text-sm">
                    <p className="text-white">Maria Silva agendou consulta</p>
                    <p className="text-gray-400">Há 2 horas</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="text-sm">
                    <p className="text-white">Ana Costa finalizou tratamento</p>
                    <p className="text-gray-400">Há 4 horas</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <div className="text-sm">
                    <p className="text-white">Julia Santos cancelou agendamento</p>
                    <p className="text-gray-400">Há 6 horas</p>
                  </div>
                </div>
              </div>
            </div>
          </NeonGradientCard>
        </div>

        {/* Treatment Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NeonGradientCard>
            <h3 className="text-xl font-semibold text-white mb-4">Tratamentos Mais Populares</h3>
            <div className="space-y-4">
              {[
                { name: "Harmonização Facial", count: 45, percentage: 85 },
                { name: "Botox", count: 38, percentage: 72 },
                { name: "Preenchimento Labial", count: 32, percentage: 60 },
                { name: "Limpeza de Pele", count: 28, percentage: 53 },
                { name: "Microagulhamento", count: 24, percentage: 45 }
              ].map((treatment, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">{treatment.name}</span>
                    <span className="text-gray-400">{treatment.count} pacientes</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${
                        index === 0 ? 'from-blue-500 to-blue-400' :
                        index === 1 ? 'from-emerald-500 to-emerald-400' :
                        index === 2 ? 'from-amber-500 to-amber-400' :
                        index === 3 ? 'from-purple-500 to-purple-400' :
                        'from-pink-500 to-pink-400'
                      }`}
                      style={{ width: `${treatment.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </NeonGradientCard>

          <NeonGradientCard>
            <h3 className="text-xl font-semibold text-white mb-4">Próximos Agendamentos</h3>
            <div className="space-y-4">
              {[
                { patient: "Maria Silva", treatment: "Botox", time: "09:00", date: "Hoje" },
                { patient: "Ana Costa", treatment: "Preenchimento", time: "14:30", date: "Hoje" },
                { patient: "Julia Santos", treatment: "Peeling", time: "10:00", date: "Amanhã" },
                { patient: "Carla Mendes", treatment: "Radiofrequência", time: "16:00", date: "Amanhã" }
              ].map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                  <div>
                    <p className="text-white font-medium">{appointment.patient}</p>
                    <p className="text-gray-400 text-sm">{appointment.treatment}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 font-medium">{appointment.time}</p>
                    <p className="text-gray-400 text-sm">{appointment.date}</p>
                  </div>
                </div>
              ))}
              
              <CosmicGlowButton variant="primary" className="w-full">
                <Calendar className="w-5 h-5" />
                Ver Agenda Completa
              </CosmicGlowButton>
            </div>
          </NeonGradientCard>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>

      {/* Animation Keyframes */}
      <style jsx global>{`
        @keyframes background-position-spin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes glow-scale {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        
        @keyframes glow-slide {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          25% { transform: translateX(10px) translateY(-10px); }
          50% { transform: translateX(-5px) translateY(10px); }
          75% { transform: translateX(-10px) translateY(-5px); }
        }
        
        .animate-background-position-spin {
          animation: background-position-spin 8s ease-in-out infinite;
          background-size: 200% 200%;
        }
        
        .animate-glow-scale {
          animation: glow-scale 3s ease-in-out infinite;
        }
        
        .animate-glow-slide {
          animation: glow-slide 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}