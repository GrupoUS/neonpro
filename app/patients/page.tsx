"use client"

import * as React from "react"
import { useState } from "react"
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Camera,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Download,
  Star,
  Activity,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Menu,
  X,
  Settings,
  LogOut,
  Home,
  BarChart3,
  LayoutDashboard
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  age: number
  gender: string
  address: string
  lastVisit: string
  nextAppointment?: string
  status: "active" | "inactive" | "pending"
  avatar?: string
  medicalHistory: MedicalRecord[]
  beforeAfterPhotos: BeforeAfterPhoto[]
  appointments: Appointment[]
  treatments: Treatment[]
}

interface MedicalRecord {
  id: string
  date: string
  diagnosis: string
  treatment: string
  notes: string
  doctor: string
}

interface BeforeAfterPhoto {
  id: string
  date: string
  treatment: string
  beforeImage: string
  afterImage: string
  notes: string
}

interface Appointment {
  id: string
  date: string
  time: string
  type: string
  status: "scheduled" | "completed" | "cancelled" | "no-show"
  doctor: string
  notes?: string
}

interface Treatment {
  id: string
  name: string
  date: string
  cost: number
  status: "completed" | "ongoing" | "planned"
  notes: string
}

const mockPatients: Patient[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+55 (11) 99999-9999",
    age: 32,
    gender: "Feminino",
    address: "Rua Augusta, 123 - São Paulo, SP",
    lastVisit: "2024-01-15",
    nextAppointment: "2024-02-20",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
    medicalHistory: [
      {
        id: "1",
        date: "2024-01-15",
        diagnosis: "Consulta de Rejuvenescimento Facial",
        treatment: "Aplicação de Botox",
        notes: "Paciente respondeu bem ao tratamento",
        doctor: "Dr. Silva"
      }
    ],
    beforeAfterPhotos: [
      {
        id: "1",
        date: "2024-01-15",
        treatment: "Botox",
        beforeImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300",
        afterImage: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=300",
        notes: "Excelentes resultados após 2 semanas"
      }
    ],
    appointments: [
      {
        id: "1",
        date: "2024-02-20",
        time: "10:00",
        type: "Retorno",
        status: "scheduled",
        doctor: "Dr. Silva"
      }
    ],
    treatments: [
      {
        id: "1",
        name: "Aplicação de Botox",
        date: "2024-01-15",
        cost: 450,
        status: "completed",
        notes: "Testa e pés de galinha"
      }
    ]
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    phone: "+55 (21) 98888-8888",
    age: 28,
    gender: "Masculino",
    address: "Av. Copacabana, 456 - Rio de Janeiro, RJ",
    lastVisit: "2024-01-10",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    medicalHistory: [
      {
        id: "2",
        date: "2024-01-10",
        diagnosis: "Cicatrizes de Acne",
        treatment: "Laser Fracionado",
        notes: "Consulta inicial realizada",
        doctor: "Dr. Johnson"
      }
    ],
    beforeAfterPhotos: [],
    appointments: [
      {
        id: "2",
        date: "2024-02-15",
        time: "14:00",
        type: "Tratamento",
        status: "scheduled",
        doctor: "Dr. Johnson"
      }
    ],
    treatments: [
      {
        id: "2",
        name: "Laser Fracionado",
        date: "2024-02-15",
        cost: 1200,
        status: "planned",
        notes: "Tratamento facial completo planejado"
      }
    ]
  }
]

const PatientManagementPage = () => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const patientsPerPage = 10

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage)
  const startIndex = (currentPage - 1) * patientsPerPage
  const currentPatients = filteredPatients.slice(startIndex, startIndex + patientsPerPage)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-primary/10 text-primary"
      case "inactive": return "bg-muted text-muted-foreground"
      case "pending": return "bg-accent/10 text-accent-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-primary/10 text-primary"
      case "completed": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-destructive/10 text-destructive"
      case "no-show": return "bg-orange-100 text-orange-800"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getTreatmentStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "ongoing": return "bg-primary/10 text-primary"
      case "planned": return "bg-accent/10 text-accent-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Pacientes', icon: Users, href: '/patients', active: true },
    { name: 'Agendamentos', icon: Calendar, href: '/appointments' },
    { name: 'Procedimentos', icon: Activity, href: '/treatments' },
    { name: 'Relatórios', icon: BarChart3, href: '/reports' },
    { name: 'Configurações', icon: Settings, href: '/settings' }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card shadow-lg border border-border"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out z-40 shadow-xl",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 w-64"
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">NP</span>
            </div>
            <h1 className="text-xl font-bold text-sidebar-foreground">
              NeonPro
            </h1>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.name}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                  item.active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        <div className="p-6 ml-16 lg:ml-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciamento de Pacientes</h1>
            <p className="text-muted-foreground">Gerencie pacientes, consultas e histórico médico da clínica</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground/80 text-sm">Total de Pacientes</p>
                    <p className="text-3xl font-bold">{patients.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary-foreground/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Pacientes Ativos</p>
                    <p className="text-3xl font-bold">{patients.filter(p => p.status === 'active').length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-accent-foreground/80 text-sm">Consultas Hoje</p>
                    <p className="text-3xl font-bold">8</p>
                  </div>
                  <Calendar className="h-8 w-8 text-accent-foreground/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Receita Mensal</p>
                    <p className="text-3xl font-bold">R$ 45.2K</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                    <Input
                      placeholder="Buscar por nome, email ou telefone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="bg-gradient-to-r from-primary to-accent">
                  <Plus className="mr-2" size={16} />
                  Novo Paciente
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Patients Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left p-4 font-semibold text-foreground">Paciente</th>
                      <th className="text-left p-4 font-semibold text-foreground">Contato</th>
                      <th className="text-left p-4 font-semibold text-foreground">Idade/Gênero</th>
                      <th className="text-left p-4 font-semibold text-foreground">Última Consulta</th>
                      <th className="text-left p-4 font-semibold text-foreground">Próxima Consulta</th>
                      <th className="text-left p-4 font-semibold text-foreground">Status</th>
                      <th className="text-left p-4 font-semibold text-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPatients.map((patient) => (
                      <tr key={patient.id} className="border-b border-border hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={patient.avatar} />
                              <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground">{patient.name}</p>
                              <p className="text-sm text-muted-foreground">ID: {patient.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Mail size={14} className="mr-2" />
                              {patient.email}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone size={14} className="mr-2" />
                              {patient.phone}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <p className="text-foreground">{patient.age} anos</p>
                            <p className="text-muted-foreground">{patient.gender}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock size={14} className="mr-2" />
                            {new Date(patient.lastVisit).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="p-4">
                          {patient.nextAppointment ? (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar size={14} className="mr-2" />
                              {new Date(patient.nextAppointment).toLocaleDateString('pt-BR')}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Sem agendamento</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status === 'active' ? 'Ativo' : 
                             patient.status === 'inactive' ? 'Inativo' : 'Pendente'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedPatient(patient)}
                                >
                                  <Eye size={14} className="mr-1" />
                                  Ver
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center space-x-3">
                                    <Avatar>
                                      <AvatarImage src={selectedPatient?.avatar} />
                                      <AvatarFallback>
                                        {selectedPatient?.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h2 className="text-xl font-bold">{selectedPatient?.name}</h2>
                                      <p className="text-sm text-muted-foreground">ID do Paciente: {selectedPatient?.id}</p>
                                    </div>
                                  </DialogTitle>
                                </DialogHeader>

                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                  <TabsList className="grid w-full grid-cols-5">
                                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                                    <TabsTrigger value="medical">Histórico Médico</TabsTrigger>
                                    <TabsTrigger value="photos">Antes/Depois</TabsTrigger>
                                    <TabsTrigger value="appointments">Consultas</TabsTrigger>
                                    <TabsTrigger value="treatments">Tratamentos</TabsTrigger>
                                  </TabsList>

                                  <TabsContent value="overview" className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="flex items-center">
                                            <User className="mr-2" size={20} />
                                            Informações Pessoais
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                          <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                            <p className="text-foreground">{selectedPatient?.email}</p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                                            <p className="text-foreground">{selectedPatient?.phone}</p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Idade</Label>
                                            <p className="text-foreground">{selectedPatient?.age} anos</p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Gênero</Label>
                                            <p className="text-foreground">{selectedPatient?.gender}</p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Endereço</Label>
                                            <p className="text-foreground">{selectedPatient?.address}</p>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="flex items-center">
                                            <Activity className="mr-2" size={20} />
                                            Atividade Recente
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                          <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Última Consulta</Label>
                                            <p className="text-foreground">
                                              {selectedPatient?.lastVisit && new Date(selectedPatient.lastVisit).toLocaleDateString('pt-BR')}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Próxima Consulta</Label>
                                            <p className="text-foreground">
                                              {selectedPatient?.nextAppointment 
                                                ? new Date(selectedPatient.nextAppointment).toLocaleDateString('pt-BR')
                                                : "Nenhuma consulta agendada"
                                              }
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                            <Badge className={getStatusColor(selectedPatient?.status || "")}>
                                              {selectedPatient?.status === 'active' ? 'Ativo' : 
                                               selectedPatient?.status === 'inactive' ? 'Inativo' : 'Pendente'}
                                            </Badge>
                                          </div>
                                          <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Total de Tratamentos</Label>
                                            <p className="text-foreground">{selectedPatient?.treatments.length || 0}</p>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="medical" className="space-y-4">
                                    <div className="flex justify-between items-center">
                                      <h3 className="text-lg font-semibold">Histórico Médico</h3>
                                      <Button size="sm">
                                        <Plus className="mr-2" size={16} />
                                        Adicionar Registro
                                      </Button>
                                    </div>
                                    <div className="space-y-4">
                                      {selectedPatient?.medicalHistory.map((record) => (
                                        <Card key={record.id}>
                                          <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                              <div>
                                                <h4 className="font-semibold text-foreground">{record.diagnosis}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                  {new Date(record.date).toLocaleDateString('pt-BR')} • {record.doctor}
                                                </p>
                                              </div>
                                              <Button variant="outline" size="sm">
                                                <Edit size={14} />
                                              </Button>
                                            </div>
                                            <div className="space-y-2">
                                              <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Tratamento</Label>
                                                <p className="text-foreground">{record.treatment}</p>
                                              </div>
                                              <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Observações</Label>
                                                <p className="text-foreground">{record.notes}</p>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="photos" className="space-y-4">
                                    <div className="flex justify-between items-center">
                                      <h3 className="text-lg font-semibold">Fotos Antes & Depois</h3>
                                      <Button size="sm">
                                        <Camera className="mr-2" size={16} />
                                        Upload de Fotos
                                      </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      {selectedPatient?.beforeAfterPhotos.map((photo) => (
                                        <Card key={photo.id}>
                                          <CardHeader>
                                            <CardTitle className="text-base">{photo.treatment}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{new Date(photo.date).toLocaleDateString('pt-BR')}</p>
                                          </CardHeader>
                                          <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                              <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Antes</Label>
                                                <img 
                                                  src={photo.beforeImage} 
                                                  alt="Antes" 
                                                  className="w-full h-32 object-cover rounded-lg border"
                                                />
                                              </div>
                                              <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Depois</Label>
                                                <img 
                                                  src={photo.afterImage} 
                                                  alt="Depois" 
                                                  className="w-full h-32 object-cover rounded-lg border"
                                                />
                                              </div>
                                            </div>
                                            <div>
                                              <Label className="text-sm font-medium text-muted-foreground">Observações</Label>
                                              <p className="text-foreground text-sm">{photo.notes}</p>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="appointments" className="space-y-4">
                                    <div className="flex justify-between items-center">
                                      <h3 className="text-lg font-semibold">Consultas</h3>
                                      <Button size="sm">
                                        <Calendar className="mr-2" size={16} />
                                        Agendar Consulta
                                      </Button>
                                    </div>
                                    <div className="space-y-4">
                                      {selectedPatient?.appointments.map((appointment) => (
                                        <Card key={appointment.id}>
                                          <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                              <div className="space-y-2">
                                                <div className="flex items-center space-x-4">
                                                  <h4 className="font-semibold text-foreground">{appointment.type}</h4>
                                                  <Badge className={getAppointmentStatusColor(appointment.status)}>
                                                    {appointment.status === 'scheduled' ? 'Agendado' :
                                                     appointment.status === 'completed' ? 'Concluído' :
                                                     appointment.status === 'cancelled' ? 'Cancelado' : 'Não compareceu'}
                                                  </Badge>
                                                </div>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                  <Calendar size={14} className="mr-2" />
                                                  {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                                                </div>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                  <User size={14} className="mr-2" />
                                                  {appointment.doctor}
                                                </div>
                                                {appointment.notes && (
                                                  <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                                                )}
                                              </div>
                                              <Button variant="outline" size="sm">
                                                <Edit size={14} />
                                              </Button>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="treatments" className="space-y-4">
                                    <div className="flex justify-between items-center">
                                      <h3 className="text-lg font-semibold">Tratamentos</h3>
                                      <Button size="sm">
                                        <Plus className="mr-2" size={16} />
                                        Adicionar Tratamento
                                      </Button>
                                    </div>
                                    <div className="space-y-4">
                                      {selectedPatient?.treatments.map((treatment) => (
                                        <Card key={treatment.id}>
                                          <CardContent className="p-4">
                                            <div className="flex justify-between items-start">
                                              <div className="space-y-2">
                                                <div className="flex items-center space-x-4">
                                                  <h4 className="font-semibold text-foreground">{treatment.name}</h4>
                                                  <Badge className={getTreatmentStatusColor(treatment.status)}>
                                                    {treatment.status === 'completed' ? 'Concluído' :
                                                     treatment.status === 'ongoing' ? 'Em andamento' : 'Planejado'}
                                                  </Badge>
                                                </div>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                  <Calendar size={14} className="mr-2" />
                                                  {new Date(treatment.date).toLocaleDateString('pt-BR')}
                                                </div>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                  <span className="font-medium">Custo: R$ {treatment.cost}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{treatment.notes}</p>
                                              </div>
                                              <Button variant="outline" size="sm">
                                                <Edit size={14} />
                                              </Button>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              </DialogContent>
                            </Dialog>

                            <Button variant="outline" size="sm">
                              <Edit size={14} className="mr-1" />
                              Editar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + patientsPerPage, filteredPatients.length)} de {filteredPatients.length} pacientes
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      )
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2">...</span>
                        <Button
                          variant={currentPage === totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próximo
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PatientManagementPage