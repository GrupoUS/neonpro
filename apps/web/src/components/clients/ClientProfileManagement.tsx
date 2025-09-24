/**
 * Enhanced Client Profile Management Interface with LGPD Compliance
 *
 * Comprehensive client profile management for aesthetic clinics with Brazilian
 * healthcare compliance, privacy controls, and integrated treatment history.
 */

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
// import { Textarea } from "@/components/ui/textarea";
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/integrations/supabase/client'
import { cn } from '@/lib/utils'
import {
  Activity,
  AlertTriangle,
  // Mail,
  // MapPin,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  Edit,
  // Lock,
  Eye,
  EyeOff,
  // Camera,
  FileText,
  Heart,
  // Ruler,
  Image as ImageIcon,
  Phone,
  Save,
  Scale,
  Shield,
  Upload,
  User,
  X,
} from 'lucide-react'

// =====================================
// TYPES AND SCHEMAS
// =====================================

interface ClientProfile {
  id: string
  name: string
  email: string
  phone: string
  cpf: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  medicalHistory: {
    allergies: string[]
    medications: string[]
    chronicConditions: string[]
    previousSurgeries: string[]
    skinType: 'normal' | 'dry' | 'oily' | 'combination' | 'sensitive'
    fitzpatrickType: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI'
  }
  aestheticHistory: {
    previousTreatments: TreatmentRecord[]
    skinConcerns: string[]
    treatmentGoals: string[]
    budgetRange: 'under_2k' | '2k_5k' | '5k_10k' | '10k_20k' | 'over_20k'
    preferredFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'as_needed'
  }
  privacySettings: {
    photoConsent: boolean
    marketingConsent: boolean
    dataSharingLevel: 'minimal' | 'standard' | 'full'
    emergencyContact: {
      name: string
      relationship: string
      phone: string
    }
  }
  financial: {
    paymentMethods: string[]
    insuranceInfo?: {
      provider: string
      policyNumber: string
      coverageDetails: string
    }
    billingAddress?: {
      street: string
      number: string
      complement?: string
      neighborhood: string
      city: string
      state: string
      zipCode: string
    }
  }
  createdAt: string
  updatedAt: string
  lastVisit?: string
  nextAppointment?: string
  status: 'active' | 'inactive' | 'prospect' | 'archived'
  riskLevel: 'low' | 'medium' | 'high'
  satisfactionScore?: number
  notes: string[]
  attachments: ClientAttachment[]
}

interface TreatmentRecord {
  id: string
  procedureName: string
  date: string
  professional: string
  clinic: string
  results: 'excellent' | 'good' | 'fair' | 'poor'
  notes: string
  beforePhotos?: string[]
  afterPhotos?: string[]
  cost: number
  satisfaction: number
}

interface ClientAttachment {
  id: string
  name: string
  type: 'photo' | 'document' | 'consent_form' | 'medical_record' | 'invoice'
  url: string
  uploadedAt: string
  size: number
  description?: string
  accessLevel: 'public' | 'restricted' | 'confidential'
}

interface LGPDComplianceStatus {
  consentVerified: boolean
  dataMinimizationApplied: boolean
  retentionPolicyCompliant: boolean
  accessControlsEnabled: boolean
  auditTrailActive: boolean
  lastAuditDate: string
}

const ClientProfileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  dateOfBirth: z.string().min(1, 'Data de nascimento é obrigatória'),
  gender: z.enum(['male', 'female', 'other']),
  address: z.object({
    street: z.string().min(1, 'Rua é obrigatória'),
    number: z.string().min(1, 'Número é obrigatório'),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z.string().min(2, 'Estado deve ter 2 caracteres'),
    zipCode: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
  }),
  medicalHistory: z.object({
    allergies: z.array(z.string()).default([]),
    medications: z.array(z.string()).default([]),
    chronicConditions: z.array(z.string()).default([]),
    previousSurgeries: z.array(z.string()).default([]),
    skinType: z.enum(['normal', 'dry', 'oily', 'combination', 'sensitive']),
    fitzpatrickType: z.enum(['I', 'II', 'III', 'IV', 'V', 'VI']),
  }).optional(),
  privacySettings: z.object({
    photoConsent: z.boolean(),
    marketingConsent: z.boolean(),
    dataSharingLevel: z.enum(['minimal', 'standard', 'full']),
    emergencyContact: z.object({
      name: z.string().min(1, 'Nome do contato é obrigatório'),
      relationship: z.string().min(1, 'Relação é obrigatória'),
      phone: z.string().min(10, 'Telefone do contato é obrigatório'),
    }),
  }),
}).refine((data) => {
  // Validate minimum age (18 years for aesthetic treatments)
  const age = new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear()
  return age >= 18
}, {
  message: 'Cliente deve ter pelo menos 18 anos para tratamentos estéticos',
  path: ['dateOfBirth'],
})

type ClientProfileFormData = z.infer<typeof ClientProfileSchema>

// =====================================
// MAIN COMPONENT
// =====================================

export const ClientProfileManagement: React.FC = () => {
  const [client, setClient] = useState<ClientProfile | null>(null)
  const [lgpdStatus, setLgpdStatus] = useState<LGPDComplianceStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showSensitiveData, setShowSensitiveData] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<ClientProfileFormData>({
    resolver: zodResolver(ClientProfileSchema),
    defaultValues: {
      privacySettings: {
        photoConsent: false,
        marketingConsent: false,
        dataSharingLevel: 'minimal',
        emergencyContact: {
          name: '',
          relationship: '',
          phone: '',
        },
      },
    },
  })

  const _supabase = createClient()

  // Load client data
  useEffect(() => {
    loadClientData()
  }, [])

  const loadClientData = async () => {
    setIsLoading(true)
    try {
      // Simulated API call - replace with actual tRPC call
      const mockClient: ClientProfile = {
        id: 'client-123',
        name: 'Maria Silva Santos',
        email: 'maria.silva@email.com',
        phone: '+55 11 98765-4321',
        cpf: '123.456.789-00',
        dateOfBirth: '1990-05-15',
        gender: 'female',
        address: {
          street: 'Rua das Flores',
          number: '123',
          complement: 'Apto 45',
          neighborhood: 'Jardins',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01423-001',
        },
        medicalHistory: {
          allergies: ['Penicilina', 'Frutos do mar'],
          medications: ['Anticoncepcional'],
          chronicConditions: ['Hipotireoidismo'],
          previousSurgeries: ['Rinoplastia - 2018'],
          skinType: 'combination',
          fitzpatrickType: 'III',
        },
        aestheticHistory: {
          previousTreatments: [
            {
              id: 'tx-001',
              procedureName: 'Botox Forehead',
              date: '2024-01-15',
              professional: 'Dra. Ana Costa',
              clinic: 'NeonPro Jardins',
              results: 'excellent',
              notes: 'Excelente resposta, sem efeitos colaterais',
              cost: 1200,
              satisfaction: 5,
            },
          ],
          skinConcerns: ['Linhas de expressão', 'Flacidez', 'Poros dilatados'],
          treatmentGoals: ['Prevenção de envelhecimento', 'Melhora da textura da pele'],
          budgetRange: '5k_10k',
          preferredFrequency: 'quarterly',
        },
        privacySettings: {
          photoConsent: true,
          marketingConsent: false,
          dataSharingLevel: 'minimal',
          emergencyContact: {
            name: 'João Silva Santos',
            relationship: 'Esposo',
            phone: '+55 11 99876-5432',
          },
        },
        financial: {
          paymentMethods: ['Cartão de crédito', 'PIX'],
          insuranceInfo: {
            provider: 'Unimed',
            policyNumber: '123456789',
            coverageDetails: 'Cobertura parcial para procedimentos estéticos',
          },
        },
        createdAt: '2023-06-15T10:30:00Z',
        updatedAt: '2024-01-15T14:20:00Z',
        lastVisit: '2024-01-15',
        nextAppointment: '2024-04-15',
        status: 'active',
        riskLevel: 'low',
        satisfactionScore: 4.8,
        notes: [
          'Cliente muito satisfeita com resultados',
          'Prefere horários vespertinos',
          'Sensível a odores fortes - usar produtos suaves',
        ],
        attachments: [
          {
            id: 'att-001',
            name: 'Consulta Inicial.pdf',
            type: 'medical_record',
            url: '/files/consulta-inicial.pdf',
            uploadedAt: '2023-06-15T10:30:00Z',
            size: 2048000,
            description: 'Registro da primeira consulta',
            accessLevel: 'restricted',
          },
        ],
      }

      const mockLgpdStatus: LGPDComplianceStatus = {
        consentVerified: true,
        dataMinimizationApplied: true,
        retentionPolicyCompliant: true,
        accessControlsEnabled: true,
        auditTrailActive: true,
        lastAuditDate: '2024-01-10',
      }

      setClient(mockClient)
      setLgpdStatus(mockLgpdStatus)

      // Populate form with client data
      form.reset({
        name: mockClient.name,
        email: mockClient.email,
        phone: mockClient.phone,
        cpf: mockClient.cpf,
        dateOfBirth: mockClient.dateOfBirth,
        gender: mockClient.gender,
        address: mockClient.address,
        medicalHistory: mockClient.medicalHistory,
        privacySettings: mockClient.privacySettings,
      })
    } catch (error) {
      console.error('Error loading client data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ClientProfileFormData) => {
    try {
      // Simulated API call - replace with actual tRPC mutation
      console.log('Updating client profile:', data)

      // Update local state
      if (client) {
        setClient({
          ...client,
          ...data,
          updatedAt: new Date().toISOString(),
        })
      }

      setIsEditing(false)

      // Show success feedback
      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Error updating client profile:', error)
      alert('Erro ao atualizar perfil. Tente novamente.')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulated upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            setIsUploading(false)
            return 100
          }
          return prev + 10
        })
      }, 200)

      // Actual upload logic would go here
      console.log('Uploading file:', file.name)
    } catch (error) {
      console.error('Error uploading file:', error)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'prospect':
        return 'bg-blue-100 text-blue-800'
      case 'archived':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTreatmentResultColor = (result: string) => {
    switch (result) {
      case 'excellent':
        return 'bg-green-100 text-green-800'
      case 'good':
        return 'bg-blue-100 text-blue-800'
      case 'fair':
        return 'bg-yellow-100 text-yellow-800'
      case 'poor':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const maskSensitiveData = (data: string) => {
    if (!showSensitiveData) {
      if (data.includes('@')) {
        const [local, domain] = data.split('@')
        return `${local.substring(0, 3)}***@${domain}`
      }
      if (data.length > 4) {
        return `***-${data.slice(-4)}`
      }
    }
    return data
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'>
          </div>
          <p>Carregando perfil do cliente...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <AlertTriangle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <p className='text-lg font-medium'>Cliente não encontrado</p>
          <p className='text-gray-600'>Verifique o ID do cliente e tente novamente.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <div className='relative'>
            <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold'>
              {client.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                getRiskColor(client.riskLevel)
              }`}
            >
            </div>
          </div>
          <div>
            <h1 className='text-2xl font-bold flex items-center'>
              <User className='h-6 w-6 mr-2' />
              {client.name}
            </h1>
            <div className='flex items-center space-x-4 mt-1'>
              <Badge className={getStatusColor(client.status)}>
                {client.status === 'active'
                  ? 'Ativo'
                  : client.status === 'inactive'
                  ? 'Inativo'
                  : client.status === 'prospect'
                  ? 'Prospect'
                  : 'Arquivado'}
              </Badge>
              {client.satisfactionScore && (
                <div className='flex items-center space-x-1'>
                  <span className='text-sm text-gray-600'>Satisfação:</span>
                  <span className='text-sm font-medium'>{client.satisfactionScore}/5</span>
                  <span className='text-yellow-500'>★</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='flex items-center space-x-4'>
          <Button
            variant='outline'
            onClick={() => setShowSensitiveData(!showSensitiveData)}
          >
            {showSensitiveData
              ? <EyeOff className='h-4 w-4 mr-2' />
              : <Eye className='h-4 w-4 mr-2' />}
            {showSensitiveData ? 'Ocultar Dados' : 'Mostrar Dados'}
          </Button>

          {isEditing
            ? (
              <div className='flex space-x-2'>
                <Button variant='outline' onClick={() => setIsEditing(false)}>
                  <X className='h-4 w-4 mr-2' />
                  Cancelar
                </Button>
                <Button onClick={form.handleSubmit(onSubmit)}>
                  <Save className='h-4 w-4 mr-2' />
                  Salvar
                </Button>
              </div>
            )
            : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className='h-4 w-4 mr-2' />
                Editar
              </Button>
            )}
        </div>
      </div>

      {/* LGPD Compliance Status */}
      {lgpdStatus && (
        <Card className='border-green-200 bg-green-50'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <Shield className='h-5 w-5 text-green-600' />
                <div>
                  <h3 className='font-medium text-green-800'>LGPD Compliance</h3>
                  <p className='text-sm text-green-600'>
                    Todos os requisitos de proteção de dados estão em conformidade
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <CheckCircle className='h-4 w-4 text-green-600' />
                <span className='text-sm text-green-700'>
                  Última auditoria: {formatDate(lgpdStatus.lastAuditDate)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='overview'>Visão Geral</TabsTrigger>
          <TabsTrigger value='personal'>Dados Pessoais</TabsTrigger>
          <TabsTrigger value='medical'>Histórico Médico</TabsTrigger>
          <TabsTrigger value='treatments'>Tratamentos</TabsTrigger>
          <TabsTrigger value='financial'>Financeiro</TabsTrigger>
          <TabsTrigger value='documents'>Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Quick Info Cards */}
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>Idade</p>
                    <p className='text-xl font-bold'>
                      {new Date().getFullYear() - new Date(client.dateOfBirth).getFullYear()} anos
                    </p>
                  </div>
                  <Calendar className='h-8 w-8 text-blue-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>Última Visita</p>
                    <p className='text-xl font-bold'>
                      {client.lastVisit ? formatDate(client.lastVisit) : 'Nunca'}
                    </p>
                  </div>
                  <Clock className='h-8 w-8 text-green-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>Próximo Agendamento</p>
                    <p className='text-xl font-bold'>
                      {client.nextAppointment ? formatDate(client.nextAppointment) : 'Não agendado'}
                    </p>
                  </div>
                  <Calendar className='h-8 w-8 text-purple-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-gray-600'>Tipo de Pele</p>
                    <p className='text-xl font-bold'>
                      {client.medicalHistory.skinType === 'normal'
                        ? 'Normal'
                        : client.medicalHistory.skinType === 'dry'
                        ? 'Seca'
                        : client.medicalHistory.skinType === 'oily'
                        ? 'Oleosa'
                        : client.medicalHistory.skinType === 'combination'
                        ? 'Mista'
                        : 'Sensível'}
                    </p>
                  </div>
                  <Scale className='h-8 w-8 text-orange-500' />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center'>
                <Phone className='h-5 w-5 mr-2' />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm text-gray-600'>Email</Label>
                  <p className='font-medium'>{maskSensitiveData(client.email)}</p>
                </div>
                <div>
                  <Label className='text-sm text-gray-600'>Telefone</Label>
                  <p className='font-medium'>{maskSensitiveData(client.phone)}</p>
                </div>
                <div>
                  <Label className='text-sm text-gray-600'>Endereço</Label>
                  <p className='font-medium'>
                    {client.address.street}, {client.address.number}
                    {client.address.complement && ` - ${client.address.complement}`}
                    <br />
                    {client.address.neighborhood}, {client.address.city} - {client.address.state}
                    <br />
                    {client.address.zipCode}
                  </p>
                </div>
                <div>
                  <Label className='text-sm text-gray-600'>Contato de Emergência</Label>
                  <p className='font-medium'>
                    {client.privacySettings.emergencyContact.name}{' '}
                    ({client.privacySettings.emergencyContact.relationship})<br />
                    {maskSensitiveData(client.privacySettings.emergencyContact.phone)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Treatment Goals */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center'>
                <Target className='h-5 w-5 mr-2' />
                Objetivos de Tratamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm text-gray-600'>Preocupações com a Pele</Label>
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {client.aestheticHistory.skinConcerns.map((concern, index) => (
                      <Badge key={index} variant='outline'>{concern}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className='text-sm text-gray-600'>Metas</Label>
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {client.aestheticHistory.treatmentGoals.map((goal, index) => (
                      <Badge key={index} variant='secondary'>{goal}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='personal' className='space-y-4'>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg flex items-center'>
                  <User className='h-5 w-5 mr-2' />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='name'>Nome Completo</Label>
                    <Input
                      id='name'
                      {...form.register('name')}
                      disabled={!isEditing}
                      className={cn(!isEditing && 'bg-gray-50')}
                    />
                    {form.formState.errors.name && (
                      <p className='text-sm text-red-600 mt-1'>
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                      id='email'
                      type='email'
                      {...form.register('email')}
                      disabled={!isEditing}
                      className={cn(!isEditing && 'bg-gray-50')}
                    />
                    {form.formState.errors.email && (
                      <p className='text-sm text-red-600 mt-1'>
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor='phone'>Telefone</Label>
                    <Input
                      id='phone'
                      {...form.register('phone')}
                      disabled={!isEditing}
                      className={cn(!isEditing && 'bg-gray-50')}
                    />
                    {form.formState.errors.phone && (
                      <p className='text-sm text-red-600 mt-1'>
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor='cpf'>CPF</Label>
                    <Input
                      id='cpf'
                      {...form.register('cpf')}
                      disabled={!isEditing}
                      className={cn(!isEditing && 'bg-gray-50')}
                    />
                    {form.formState.errors.cpf && (
                      <p className='text-sm text-red-600 mt-1'>
                        {form.formState.errors.cpf.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor='dateOfBirth'>Data de Nascimento</Label>
                    <Input
                      id='dateOfBirth'
                      type='date'
                      {...form.register('dateOfBirth')}
                      disabled={!isEditing}
                      className={cn(!isEditing && 'bg-gray-50')}
                    />
                    {form.formState.errors.dateOfBirth && (
                      <p className='text-sm text-red-600 mt-1'>
                        {form.formState.errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor='gender'>Gênero</Label>
                    <Select
                      value={form.watch('gender')}
                      onValueChange={(value) => form.setValue('gender', value as any)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className={cn(!isEditing && 'bg-gray-50')}>
                        <SelectValue placeholder='Selecione o gênero' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='male'>Masculino</SelectItem>
                        <SelectItem value='female'>Feminino</SelectItem>
                        <SelectItem value='other'>Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='space-y-4'>
                  <h4 className='font-medium'>Endereço</h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='street'>Rua</Label>
                      <Input
                        id='street'
                        {...form.register('address.street')}
                        disabled={!isEditing}
                        className={cn(!isEditing && 'bg-gray-50')}
                      />
                    </div>
                    <div>
                      <Label htmlFor='number'>Número</Label>
                      <Input
                        id='number'
                        {...form.register('address.number')}
                        disabled={!isEditing}
                        className={cn(!isEditing && 'bg-gray-50')}
                      />
                    </div>
                    <div>
                      <Label htmlFor='complement'>Complemento</Label>
                      <Input
                        id='complement'
                        {...form.register('address.complement')}
                        disabled={!isEditing}
                        className={cn(!isEditing && 'bg-gray-50')}
                      />
                    </div>
                    <div>
                      <Label htmlFor='neighborhood'>Bairro</Label>
                      <Input
                        id='neighborhood'
                        {...form.register('address.neighborhood')}
                        disabled={!isEditing}
                        className={cn(!isEditing && 'bg-gray-50')}
                      />
                    </div>
                    <div>
                      <Label htmlFor='city'>Cidade</Label>
                      <Input
                        id='city'
                        {...form.register('address.city')}
                        disabled={!isEditing}
                        className={cn(!isEditing && 'bg-gray-50')}
                      />
                    </div>
                    <div>
                      <Label htmlFor='state'>Estado</Label>
                      <Input
                        id='state'
                        maxLength={2}
                        {...form.register('address.state')}
                        disabled={!isEditing}
                        className={cn(!isEditing && 'bg-gray-50')}
                      />
                    </div>
                    <div className='md:col-span-2'>
                      <Label htmlFor='zipCode'>CEP</Label>
                      <Input
                        id='zipCode'
                        {...form.register('address.zipCode')}
                        disabled={!isEditing}
                        className={cn(!isEditing && 'bg-gray-50')}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg flex items-center'>
                  <Shield className='h-5 w-5 mr-2' />
                  Configurações de Privacidade
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='flex items-center space-x-2'>
                    <input
                      id='photoConsent'
                      type='checkbox'
                      {...form.register('privacySettings.photoConsent')}
                      disabled={!isEditing}
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='photoConsent'>Consentimento para fotos</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <input
                      id='marketingConsent'
                      type='checkbox'
                      {...form.register('privacySettings.marketingConsent')}
                      disabled={!isEditing}
                      className='rounded border-gray-300'
                    />
                    <Label htmlFor='marketingConsent'>Consentimento para marketing</Label>
                  </div>
                </div>

                <div className='space-y-4'>
                  <h4 className='font-medium'>Contato de Emergência</h4>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <Label htmlFor='emergencyName'>Nome</Label>
                      <Input
                        id='emergencyName'
                        {...form.register('privacySettings.emergencyContact.name')}
                        disabled={!isEditing}
                        className={cn(!isEditing && 'bg-gray-50')}
                      />
                    </div>
                    <div>
                      <Label htmlFor='emergencyRelationship'>Relação</Label>
                      <Input
                        id='emergencyRelationship'
                        {...form.register('privacySettings.emergencyContact.relationship')}
                        disabled={!isEditing}
                        className={cn(!isEditing && 'bg-gray-50')}
                      />
                    </div>
                    <div>
                      <Label htmlFor='emergencyPhone'>Telefone</Label>
                      <Input
                        id='emergencyPhone'
                        {...form.register('privacySettings.emergencyContact.phone')}
                        disabled={!isEditing}
                        className={cn(!isEditing && 'bg-gray-50')}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value='medical' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center'>
                <Heart className='h-5 w-5 mr-2' />
                Histórico Médico
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm text-gray-600'>Tipo de Pele</Label>
                  <p className='font-medium'>
                    {client.medicalHistory.skinType === 'normal'
                      ? 'Normal'
                      : client.medicalHistory.skinType === 'dry'
                      ? 'Seca'
                      : client.medicalHistory.skinType === 'oily'
                      ? 'Oleosa'
                      : client.medicalHistory.skinType === 'combination'
                      ? 'Mista'
                      : 'Sensível'}
                  </p>
                </div>
                <div>
                  <Label className='text-sm text-gray-600'>Fototipo de Fitzpatrick</Label>
                  <p className='font-medium'>Tipo {client.medicalHistory.fitzpatrickType}</p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm text-gray-600'>Alergias</Label>
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {client.medicalHistory.allergies.length > 0
                      ? (
                        client.medicalHistory.allergies.map((allergy, index) => (
                          <Badge key={index} variant='destructive'>{allergy}</Badge>
                        ))
                      )
                      : <p className='text-gray-500'>Nenhuma alergia registrada</p>}
                  </div>
                </div>
                <div>
                  <Label className='text-sm text-gray-600'>Medicamentos em Uso</Label>
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {client.medicalHistory.medications.length > 0
                      ? (
                        client.medicalHistory.medications.map((medication, index) => (
                          <Badge key={index} variant='outline'>{medication}</Badge>
                        ))
                      )
                      : <p className='text-gray-500'>Nenhum medicamento registrado</p>}
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm text-gray-600'>Condições Crônicas</Label>
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {client.medicalHistory.chronicConditions.length > 0
                      ? (
                        client.medicalHistory.chronicConditions.map((condition, index) => (
                          <Badge key={index} variant='secondary'>{condition}</Badge>
                        ))
                      )
                      : <p className='text-gray-500'>Nenhuma condição crônica registrada</p>}
                  </div>
                </div>
                <div>
                  <Label className='text-sm text-gray-600'>Cirurgias Anteriores</Label>
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {client.medicalHistory.previousSurgeries.length > 0
                      ? (
                        client.medicalHistory.previousSurgeries.map((surgery, index) => (
                          <Badge key={index} variant='outline'>{surgery}</Badge>
                        ))
                      )
                      : <p className='text-gray-500'>Nenhuma cirurgia anterior registrada</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='treatments' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center'>
                <Activity className='h-5 w-5 mr-2' />
                Histórico de Tratamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.aestheticHistory.previousTreatments.length > 0
                ? (
                  <div className='space-y-4'>
                    {client.aestheticHistory.previousTreatments.map((treatment) => (
                      <div key={treatment.id} className='border rounded-lg p-4'>
                        <div className='flex items-center justify-between mb-2'>
                          <h4 className='font-medium'>{treatment.procedureName}</h4>
                          <div className='flex items-center space-x-2'>
                            <Badge className={getTreatmentResultColor(treatment.results)}>
                              {treatment.results === 'excellent'
                                ? 'Excelente'
                                : treatment.results === 'good'
                                ? 'Bom'
                                : treatment.results === 'fair'
                                ? 'Regular'
                                : 'Ruim'}
                            </Badge>
                            <span className='text-sm text-gray-600'>
                              {formatDate(treatment.date)}
                            </span>
                          </div>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                          <div>
                            <span className='text-gray-600'>Profissional:</span>
                            <span className='ml-2 font-medium'>{treatment.professional}</span>
                          </div>
                          <div>
                            <span className='text-gray-600'>Clínica:</span>
                            <span className='ml-2 font-medium'>{treatment.clinic}</span>
                          </div>
                          <div>
                            <span className='text-gray-600'>Custo:</span>
                            <span className='ml-2 font-medium'>
                              {formatCurrency(treatment.cost)}
                            </span>
                          </div>
                        </div>
                        {treatment.notes && (
                          <div className='mt-2'>
                            <span className='text-gray-600'>Observações:</span>
                            <p className='mt-1 text-sm'>{treatment.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
                : <p className='text-gray-500'>Nenhum tratamento realizado anteriormente.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center'>
                <Target className='h-5 w-5 mr-2' />
                Preferências de Tratamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm text-gray-600'>Faixa de Orçamento</Label>
                  <p className='font-medium'>
                    {client.aestheticHistory.budgetRange === 'under_2k'
                      ? 'Até R$ 2.000'
                      : client.aestheticHistory.budgetRange === '2k_5k'
                      ? 'R$ 2.000 - R$ 5.000'
                      : client.aestheticHistory.budgetRange === '5k_10k'
                      ? 'R$ 5.000 - R$ 10.000'
                      : client.aestheticHistory.budgetRange === '10k_20k'
                      ? 'R$ 10.000 - R$ 20.000'
                      : 'Acima de R$ 20.000'}
                  </p>
                </div>
                <div>
                  <Label className='text-sm text-gray-600'>Frequência Preferida</Label>
                  <p className='font-medium'>
                    {client.aestheticHistory.preferredFrequency === 'weekly'
                      ? 'Semanal'
                      : client.aestheticHistory.preferredFrequency === 'biweekly'
                      ? 'Quinzenal'
                      : client.aestheticHistory.preferredFrequency === 'monthly'
                      ? 'Mensal'
                      : client.aestheticHistory.preferredFrequency === 'quarterly'
                      ? 'Trimestral'
                      : 'Conforme necessário'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='financial' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center'>
                <CreditCard className='h-5 w-5 mr-2' />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label className='text-sm text-gray-600'>Métodos de Pagamento</Label>
                <div className='flex flex-wrap gap-2 mt-1'>
                  {client.financial.paymentMethods.map((method, index) => (
                    <Badge key={index} variant='outline'>{method}</Badge>
                  ))}
                </div>
              </div>

              {client.financial.insuranceInfo && (
                <div>
                  <Label className='text-sm text-gray-600'>Plano de Saúde</Label>
                  <div className='mt-2 space-y-2'>
                    <div>
                      <span className='text-gray-600'>Operadora:</span>
                      <span className='ml-2 font-medium'>
                        {client.financial.insuranceInfo.provider}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-600'>Número da Apólice:</span>
                      <span className='ml-2 font-medium'>
                        {client.financial.insuranceInfo.policyNumber}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-600'>Cobertura:</span>
                      <p className='mt-1 text-sm'>
                        {client.financial.insuranceInfo.coverageDetails}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='documents' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg flex items-center'>
                <FileText className='h-5 w-5 mr-2' />
                Documentos e Anexos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='mb-4'>
                <Label htmlFor='file-upload' className='cursor-pointer'>
                  <Button variant='outline' className='w-full'>
                    <Upload className='h-4 w-4 mr-2' />
                    Upload de Documentos
                  </Button>
                </Label>
                <Input
                  id='file-upload'
                  type='file'
                  className='hidden'
                  onChange={handleFileUpload}
                  accept='.pdf,.jpg,.jpeg,.png,.doc,.docx'
                />
                {isUploading && (
                  <div className='mt-2'>
                    <div className='flex justify-between text-sm mb-1'>
                      <span>Enviando arquivo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className='w-full' />
                  </div>
                )}
              </div>

              {client.attachments.length > 0
                ? (
                  <div className='space-y-2'>
                    {client.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className='flex items-center justify-between p-3 border rounded-lg'
                      >
                        <div className='flex items-center space-x-3'>
                          <div className='p-2 bg-gray-100 rounded'>
                            {attachment.type === 'photo'
                              ? <ImageIcon className='h-4 w-4' />
                              : <FileText className='h-4 w-4' />}
                          </div>
                          <div>
                            <p className='font-medium'>{attachment.name}</p>
                            <p className='text-sm text-gray-600'>
                              {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')} •{' '}
                              {(attachment.size / 1024).toFixed(1)} KB
                            </p>
                            {attachment.description && (
                              <p className='text-xs text-gray-500'>{attachment.description}</p>
                            )}
                          </div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Badge variant='outline'>
                            {attachment.accessLevel === 'public'
                              ? 'Público'
                              : attachment.accessLevel === 'restricted'
                              ? 'Restrito'
                              : 'Confidencial'}
                          </Badge>
                          <Button variant='outline' size='sm'>
                            <Download className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
                : <p className='text-gray-500'>Nenhum documento anexado.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Export the component
export default ClientProfileManagement
