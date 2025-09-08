'use client'

import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  // Textarea, // Unused import
} from '@/components/ui'
import { format, } from 'date-fns'
import { ptBR, } from 'date-fns/locale'
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Globe,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, } from 'react'

// Mock data - in real implementation this would come from API/database
const mockClinicData = {
  id: 'clinic-123',
  clinic_code: 'CLINIC001',
  clinic_name: 'Clínica Estética Premium',
  legal_name: 'Premium Aesthetics LTDA',
  tax_id: '12.345.678/0001-90',
  email: 'contato@clinicapremium.com.br',
  phone: '(11) 99999-9999',
  website: 'https://clinicapremium.com.br',
  address_line1: 'Rua das Flores, 123',
  address_line2: 'Sala 456',
  city: 'São Paulo',
  state: 'SP',
  postal_code: '01234-567',
  neighborhood: 'Jardins',
  country: 'Brasil',
  specialties: ['Harmonização Facial', 'Tratamentos Corporais', 'Laserterapia',],
  services_offered: [
    'Botox',
    'Preenchimento',
    'Peeling',
    'Criolipólise',
    'Laser Hair Removal',
  ],
  is_active: true,
  subscription_status: 'active' as const,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-12-01T15:30:00Z',
}

const mockClinicStats = {
  totalPatients: 1247,
  monthlyAppointments: 342,
  staffMembers: 12,
  activeServices: 15,
  revenue: 89_500,
  growthRate: 12.5,
}

export default function ClinicaPage() {
  const [clinic, setClinic,] = useState(mockClinicData,)
  const [stats, setStats,] = useState(mockClinicStats,)
  const [loading, setLoading,] = useState(false,)
  const [editMode, setEditMode,] = useState(false,)
  const [editedClinic, setEditedClinic,] = useState(clinic,)

  // In real implementation, this would fetch data from API
  useEffect(() => {
    // Simulated API call
    setLoading(false,)
  }, [],)

  const handleSave = async () => {
    setLoading(true,)
    // Simulate API call
    setTimeout(() => {
      setClinic(editedClinic,)
      setEditMode(false,)
      setLoading(false,)
    }, 1000,)
  }

  const handleCancel = () => {
    setEditedClinic(clinic,)
    setEditMode(false,)
  }

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Carregando dados da clínica...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center">
            <Building2 className="h-8 w-8 mr-3" />
            Gerenciamento da Clínica
          </h1>
          <p className="text-muted-foreground mt-1">
            {clinic.clinic_name} • {clinic.clinic_code}
          </p>
        </div>
        <div className="flex space-x-2">
          {!editMode
            ? (
              <Button onClick={() => setEditMode(true,)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )
            : (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            )}
        </div>
      </div>

      {/* Status Banner */}
      <Alert>
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription>
          <span className="font-medium text-green-600">Clínica Ativa</span> • Última atualização:
          {' '}
          {format(new Date(clinic.updated_at,), 'dd/MM/yyyy HH:mm', { locale: ptBR, },)}
        </AlertDescription>
      </Alert>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              total cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyAppointments}</div>
            <p className="text-xs text-muted-foreground">
              este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.staffMembers}</div>
            <p className="text-xs text-muted-foreground">
              equipe ativa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.revenue.toLocaleString('pt-BR',)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats.growthRate}% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Informações Empresariais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clinic_name">Nome da Clínica</Label>
                  {editMode
                    ? (
                      <Input
                        id="clinic_name"
                        value={editedClinic.clinic_name}
                        onChange={(e,) =>
                          setEditedClinic({ ...editedClinic, clinic_name: e.target.value, },)}
                      />
                    )
                    : <p className="text-lg font-medium">{clinic.clinic_name}</p>}
                </div>

                <div>
                  <Label>Razão Social</Label>
                  {editMode
                    ? (
                      <Input
                        value={editedClinic.legal_name || ''}
                        onChange={(e,) =>
                          setEditedClinic({ ...editedClinic, legal_name: e.target.value, },)}
                      />
                    )
                    : <p className="text-sm text-muted-foreground">{clinic.legal_name}</p>}
                </div>

                <div>
                  <Label>CNPJ</Label>
                  {editMode
                    ? (
                      <Input
                        value={editedClinic.tax_id || ''}
                        onChange={(e,) =>
                          setEditedClinic({ ...editedClinic, tax_id: e.target.value, },)}
                      />
                    )
                    : <p className="text-sm font-mono">{clinic.tax_id}</p>}
                </div>

                <div>
                  <Label>Especialidades</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {clinic.specialties?.map((specialty, index,) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {editMode
                    ? (
                      <Input
                        type="email"
                        value={editedClinic.email || ''}
                        onChange={(e,) =>
                          setEditedClinic({ ...editedClinic, email: e.target.value, },)}
                      />
                    )
                    : <p>{clinic.email}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {editMode
                    ? (
                      <Input
                        value={editedClinic.phone || ''}
                        onChange={(e,) =>
                          setEditedClinic({ ...editedClinic, phone: e.target.value, },)}
                      />
                    )
                    : <p>{clinic.phone}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  {editMode
                    ? (
                      <Input
                        value={editedClinic.website || ''}
                        onChange={(e,) =>
                          setEditedClinic({ ...editedClinic, website: e.target.value, },)}
                      />
                    )
                    : (
                      <a
                        href={clinic.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {clinic.website}
                      </a>
                    )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Label>Endereço</Label>
                  </div>
                  {editMode
                    ? (
                      <div className="space-y-2 ml-6">
                        <Input
                          placeholder="Logradouro"
                          value={editedClinic.address_line1 || ''}
                          onChange={(e,) =>
                            setEditedClinic({ ...editedClinic, address_line1: e.target.value, },)}
                        />
                        <Input
                          placeholder="Complemento"
                          value={editedClinic.address_line2 || ''}
                          onChange={(e,) =>
                            setEditedClinic({ ...editedClinic, address_line2: e.target.value, },)}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Cidade"
                            value={editedClinic.city || ''}
                            onChange={(e,) =>
                              setEditedClinic({ ...editedClinic, city: e.target.value, },)}
                          />
                          <Input
                            placeholder="CEP"
                            value={editedClinic.postal_code || ''}
                            onChange={(e,) =>
                              setEditedClinic({ ...editedClinic, postal_code: e.target.value, },)}
                          />
                        </div>
                      </div>
                    )
                    : (
                      <div className="ml-6 text-sm">
                        <p>{clinic.address_line1}</p>
                        {clinic.address_line2 && <p>{clinic.address_line2}</p>}
                        <p>{clinic.neighborhood} • {clinic.city}/{clinic.state}</p>
                        <p>CEP: {clinic.postal_code}</p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Serviços Oferecidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {clinic.services_offered?.map((service, index,) => (
                  <Badge key={index} variant="outline" className="justify-center">
                    {service}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configurações da Clínica
              </CardTitle>
              <CardDescription>
                Configure horários de funcionamento, políticas e integrações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Horário de Funcionamento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p>
                        <strong>Segunda - Sexta:</strong> 08:00 - 18:00
                      </p>
                      <p>
                        <strong>Sábado:</strong> 08:00 - 14:00
                      </p>
                      <p>
                        <strong>Domingo:</strong> Fechado
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        Intervalo para almoço: 12:00 - 13:00
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Configurações de Agendamento</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Duração padrão: 60 minutos</p>
                    <p>• Intervalo entre consultas: 15 minutos</p>
                    <p>• Antecedência mínima: 24 horas</p>
                    <p>• Cancelamento até: 4 horas antes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Gerenciamento de Equipe
                </div>
                <Button asChild>
                  <Link href="/team">
                    Gerenciar Equipe
                  </Link>
                </Button>
              </CardTitle>
              <CardDescription>
                Visualize e gerencie sua equipe de profissionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.staffMembers}</div>
                    <div className="text-sm text-muted-foreground">Funcionários Ativos</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-muted-foreground">Profissionais</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">4</div>
                    <div className="text-sm text-muted-foreground">Administrativo</div>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    Acesse a página de{' '}
                    <Link href="/team" className="font-medium text-primary hover:underline">
                      Gerenciamento de Equipe
                    </Link>{' '}
                    para visualizar detalhes completos, adicionar novos funcionários e gerenciar
                    permissões.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Compliance & Regulamentação
              </CardTitle>
              <CardDescription>
                Status de conformidade com ANVISA, LGPD e outras regulamentações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">ANVISA</h3>
                      <Badge variant="default">Conforme</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Registro sanitário atualizado e em conformidade
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">LGPD</h3>
                      <Badge variant="default">Conforme</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Políticas de privacidade implementadas
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">CFM</h3>
                      <Badge variant="default">Conforme</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Registros médicos atualizados
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Backup de Dados</h3>
                      <Badge variant="secondary">Automático</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Última cópia: hoje às 03:00
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
