'use client';

import { AccessiblePatientCard } from '@/components/accessibility/AccessiblePatientCard';
import { MobilePatientCard } from '@/components/patients/MobilePatientCard';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs } from '@/components/ui/tabs';
import { UniversalButton } from '@/components/ui/universal-button';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { format, isThisMonth, isThisWeek, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Brain,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  MoreVertical,
  Phone,
  Pill,
  Printer,
  Share2,
  Shield,
  Stethoscope,
  TrendingUp,
  User,
  UserPlus,
  Video,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export const Route = createFileRoute('/patients/id')({
  component: PatientDetailPage,
});

// Enhanced Types with Brazilian healthcare context
interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  rg: string;
  birthDate: string;
  gender: 'M' | 'F' | 'Other';
  bloodType: string;
  height?: number;
  weight?: number;
  allergies: string[];
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
  }[];
  chronicConditions: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  healthInsurance: {
    provider: string;
    plan: string;
    cardNumber: string;
    validity: string;
  };
  status: 'active' | 'inactive' | 'pending';
  riskScore: number;
  lastVisit?: string;
  nextAppointment?: {
    date: string;
    time: string;
    type: string;
    doctor: string;
  };
  createdAt: string;
  updatedAt: string;
  lgpdConsent: {
    dataProcessing: boolean;
    marketing: boolean;
    aiProcessing: boolean;
    consentDate: string;
    lastUpdate: string;
  };
}

interface Appointment {
  id: string;
  type: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'in-progress';
  doctor: string;
  specialty: string;
  duration: number;
  notes?: string;
  aiPrediction?: {
    noShowRisk: number;
    confidence: number;
    factors: string[];
  };
  virtual?: boolean;
  location?: string;
}

interface MedicalRecord {
  id: string;
  date: string;
  type: 'consultation' | 'exam' | 'procedure' | 'surgery';
  doctor: string;
  specialty: string;
  diagnosis: string;
  prescription: {
    medication: string;
    dosage: string;
    duration: string;
  }[];
  notes: string;
  attachments: string[];
  vitalSigns?: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight?: number;
    height?: number;
  };
}

interface AIInsight {
  id: string;
  type:
    | 'risk_assessment'
    | 'treatment_recommendation'
    | 'lifestyle_suggestion'
    | 'follow_up_alert';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  actionLabel?: string;
  timestamp: Date;
  category: 'health' | 'treatment' | 'prevention' | 'administrative';
}

interface TreatmentPlan {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number;
  procedures: string[];
  goals: string[];
  notes: string;
}

// Mock data generator for development
const generateMockPatient = (id: string): Patient => ({
  id,
  name: 'João Silva Santos',
  email: 'joao.silva@email.com',
  phone: '+55 11 99999-8888',
  cpf: '123.456.789-00',
  rg: '12.345.678-9',
  birthDate: '1980-03-15',
  gender: 'M',
  bloodType: 'O+',
  height: 175,
  weight: 75,
  allergies: ['Penicilina', 'Amoxicilina'],
  medications: [
    {
      name: 'Losartana',
      dosage: '50mg',
      frequency: '2x ao dia',
      startDate: '2024-01-01',
    },
    {
      name: 'Atorvastatina',
      dosage: '20mg',
      frequency: '1x ao dia',
      startDate: '2024-01-01',
    },
  ],
  chronicConditions: ['Hipertensão', 'Dislipidemia'],
  emergencyContact: {
    name: 'Maria Silva Santos',
    relationship: 'Esposa',
    phone: '+55 11 98888-7777',
    email: 'maria.santos@email.com',
  },
  address: {
    street: 'Rua das Flores',
    number: '123',
    complement: 'Apto 45',
    neighborhood: 'Jardins',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01434-000',
  },
  healthInsurance: {
    provider: 'Unimed',
    plan: 'Plano Diamond',
    cardNumber: '**** **** **** 1234',
    validity: '2025-12-31',
  },
  status: 'active',
  riskScore: 0.4,
  lastVisit: '2024-01-15',
  nextAppointment: {
    date: '2024-02-01',
    time: '14:30',
    type: 'Consulta de retorno',
    doctor: 'Dr. Carlos Oliveira',
  },
  createdAt: '2023-06-15',
  updatedAt: '2024-01-15',
  lgpdConsent: {
    dataProcessing: true,
    marketing: false,
    aiProcessing: true,
    consentDate: '2023-06-15',
    lastUpdate: '2024-01-10',
  },
});

const generateMockAppointments = (_patientId: string): Appointment[] => [
  {
    id: '1',
    type: 'Consulta inicial',
    date: '2024-01-15',
    time: '09:00',
    status: 'completed',
    doctor: 'Dr. Carlos Oliveira',
    specialty: 'Clínico Geral',
    duration: 30,
    notes: 'Consulta de rotina, paciente estável',
  },
  {
    id: '2',
    type: 'Retorno',
    date: '2024-02-01',
    time: '14:30',
    status: 'scheduled',
    doctor: 'Dr. Carlos Oliveira',
    specialty: 'Clínico Geral',
    duration: 30,
    aiPrediction: {
      noShowRisk: 0.15,
      confidence: 0.82,
      factors: ['Histórico de comparecimento', 'Consulta de retorno'],
    },
  },
];

const generateMockMedicalRecords = (_patientId: string): MedicalRecord[] => [
  {
    id: '1',
    date: '2024-01-15',
    type: 'consultation',
    doctor: 'Dr. Carlos Oliveira',
    specialty: 'Clínico Geral',
    diagnosis: 'Hipertensão controlada',
    prescription: [
      { medication: 'Losartana', dosage: '50mg', duration: '30 dias' },
      { medication: 'Atorvastatina', dosage: '20mg', duration: '30 dias' },
    ],
    notes: 'Paciente apresenta boa evolução. Pressão arterial controlada. Manter tratamento.',
    attachments: ['exame_sangue_2024-01-15.pdf'],
    vitalSigns: {
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 36.5,
      weight: 75,
      height: 175,
    },
  },
];

const generateMockAIInsights = (_patientId: string): AIInsight[] => [
  {
    id: '1',
    type: 'treatment_recommendation',
    title: 'Otimização de medicação',
    description:
      'Baseado nos padrões de resposta, sugere-se ajuste na dosagem de Losartana para melhor controle pressórico',
    confidence: 0.85,
    priority: 'medium',
    actionable: true,
    actionLabel: 'Revisar prescrição',
    timestamp: new Date(),
    category: 'treatment',
  },
  {
    id: '2',
    type: 'lifestyle_suggestion',
    title: 'Recomendação de atividade física',
    description:
      'Paciente se beneficiaria de caminhadas diárias de 30 minutos para melhorar controle cardiovascular',
    confidence: 0.92,
    priority: 'medium',
    actionable: true,
    actionLabel: 'Recomendar exercícios',
    timestamp: new Date(),
    category: 'prevention',
  },
];

// Utility functions
const maskCPF = (cpf: string): string => {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const maskCardNumber = (cardNumber: string): string => {
  return cardNumber.replace(/(\d{4})\d{8}(\d{4})/, '$1 **** **** $2');
};

const getAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

const getRiskColor = (_riskScore: any) => {
  if (riskScore >= 0.8) return 'text-red-600 bg-red-50 border-red-200';
  if (riskScore >= 0.6) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-green-600 bg-green-50 border-green-200';
};

const getRiskLabel = (_riskScore: any) => {
  if (riskScore >= 0.8) return 'Alto Risco';
  if (riskScore >= 0.6) return 'Médio Risco';
  return 'Baixo Risco';
};

const getStatusColor = (_status: any) => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'inactive':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'pending':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusLabel = (_status: any) => {
  switch (status) {
    case 'active':
      return 'Ativo';
    case 'inactive':
      return 'Inativo';
    case 'pending':
      return 'Pendente';
    default:
      return status;
  }
};

function PatientDetailPage() {
  const { patientId } = useParams({ from: '/patients/$patientId' });
  const navigate = useNavigate();
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Initialize mock data
  useEffect(() => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (patientId) {
        setPatient(generateMockPatient(patientId));
        setAppointments(generateMockAppointments(patientId));
        setMedicalRecords(generateMockMedicalRecords(patientId));
        setAiInsights(generateMockAIInsights(patientId));
      }
      setLoading(false);
    }, 1000);
  }, [patientId]);

  const handleEditPatient = () => {
    navigate({
      to: '/patients/$patientId/edit',
      params: { patientId: patientId! },
    });
  };

  const handleScheduleAppointment = () => {
    navigate({ to: '/appointments/new', search: { patientId } });
  };

  const handleExportData = () => {
    toast({
      title: 'Exportação iniciada',
      description: 'Os dados do paciente estão sendo exportados conforme LGPD.',
    });
  };

  const handleAIInsightAction = (_insight: any) => {
    toast({
      title: 'Ação executada',
      description: `${insight.actionLabel} foi realizada com sucesso.`,
    });
  };

  if (loading) {
    return (
      <div className='container mx-auto p-4 sm:p-6 max-w-6xl'>
        <div className='space-y-6'>
          {/* Header skeleton */}
          <div className='flex items-center gap-4'>
            <Skeleton className='h-10 w-10' />
            <div className='space-y-2'>
              <Skeleton className='h-6 w-48' />
              <Skeleton className='h-4 w-32' />
            </div>
          </div>

          {/* Content skeleton */}
          <div className='grid gap-6 grid-cols-1 lg:grid-cols-3'>
            <div className='lg:col-span-1 space-y-4'>
              <Skeleton className='h-64' />
              <Skeleton className='h-48' />
            </div>
            <div className='lg:col-span-2 space-y-4'>
              <Skeleton className='h-96' />
              <Skeleton className='h-64' />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className='container mx-auto p-4 sm:p-6 max-w-6xl'>
        <Alert>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>
            Paciente não encontrado. Verifique o ID e tente novamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4 sm:p-6 max-w-6xl'>
      {/* Header with CFM compliance */}
      <header className='space-y-4 sm:space-y-6 mb-6 sm:mb-8'>
        {/* CFM Header */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <Shield className='h-5 w-5 text-blue-600' />
              <span className='text-sm sm:text-base font-medium text-blue-900'>
                CRM/SP 123456 - Dr. João Silva
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <FileText className='h-4 w-4 text-blue-600' />
              <span className='text-xs sm:text-sm text-blue-700'>
                Acesso conforme LGPD - Resolução CFM 2.314/2022
              </span>
            </div>
          </div>
        </div>

        {/* Patient Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => navigate({ to: '/patients/dashboard' })}
              className='h-10 w-10 p-0'
              aria-label='Voltar para dashboard de pacientes'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>

            <div>
              <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-gray-900'>
                {patient.name}
              </h1>
              <p className='text-sm sm:text-base text-muted-foreground mt-1'>
                Paciente desde {format(new Date(patient.createdAt), 'dd/MM/yyyy', {
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>

          {/* Status and Risk */}
          <div className='flex flex-wrap items-center gap-2'>
            <Badge className={getStatusColor(patient.status)}>
              {getStatusLabel(patient.status)}
            </Badge>
            <Badge className={getRiskColor(patient.riskScore)}>
              {getRiskLabel(patient.riskScore)}
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className='flex flex-wrap gap-3'>
          <UniversalButton
            variant='outline'
            onClick={handleEditPatient}
            className='h-11 sm:h-10 text-base sm:text-sm font-medium'
            aria-label={`Editar paciente ${patient.name}`}
          >
            <Edit className='h-4 w-4 mr-2' />
            Editar
          </UniversalButton>

          <UniversalButton
            variant='primary'
            onClick={handleScheduleAppointment}
            className='h-11 sm:h-10 text-base sm:text-sm font-medium'
            aria-label={`Agendar consulta para ${patient.name}`}
          >
            <Calendar className='h-4 w-4 mr-2' />
            Agendar Consulta
          </UniversalButton>

          <UniversalButton
            variant='outline'
            onClick={handleExportData}
            className='h-11 sm:h-10 text-base sm:text-sm font-medium'
            aria-label={`Exportar dados do paciente ${patient.name}`}
          >
            <Download className='h-4 w-4 mr-2' />
            Exportar Dados
          </UniversalButton>

          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className='h-11 sm:h-10 text-base sm:text-sm font-medium'
            aria-label={showSensitiveData
              ? 'Ocultar dados sensíveis'
              : 'Mostrar dados sensíveis'}
          >
            {showSensitiveData
              ? <EyeOff className='h-4 w-4 mr-2' />
              : <Eye className='h-4 w-4 mr-2' />}
            {showSensitiveData ? 'Ocultar Dados' : 'Mostrar Dados'}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className='grid gap-6 grid-cols-1 lg:grid-cols-3'>
        {/* Sidebar */}
        <div className='lg:col-span-1 space-y-6'>
          {/* Patient Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5 text-blue-600' />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Idade:</span>
                  <span className='font-medium'>
                    {getAge(patient.birthDate)} anos
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Gênero:</span>
                  <span className='font-medium'>
                    {patient.gender === 'M'
                      ? 'Masculino'
                      : patient.gender === 'F'
                      ? 'Feminino'
                      : 'Outro'}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Tipo Sanguíneo:</span>
                  <span className='font-medium'>{patient.bloodType}</span>
                </div>
                {patient.height && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Altura:</span>
                    <span className='font-medium'>{patient.height} cm</span>
                  </div>
                )}
                {patient.weight && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Peso:</span>
                    <span className='font-medium'>{patient.weight} kg</span>
                  </div>
                )}
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>CPF:</span>
                  <span className='font-medium font-mono'>
                    {showSensitiveData
                      ? maskCPF(patient.cpf)
                      : '***.***.***-**'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Phone className='h-5 w-5 text-green-600' />
                Contato
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex items-start gap-2'>
                  <Mail className='h-4 w-4 text-muted-foreground mt-0.5' />
                  <div>
                    <div className='text-sm font-medium'>{patient.email}</div>
                  </div>
                </div>
                <div className='flex items-start gap-2'>
                  <Phone className='h-4 w-4 text-muted-foreground mt-0.5' />
                  <div>
                    <div className='text-sm font-medium'>{patient.phone}</div>
                  </div>
                </div>
                <div className='flex items-start gap-2'>
                  <MapPin className='h-4 w-4 text-muted-foreground mt-0.5' />
                  <div>
                    <div className='text-sm font-medium'>
                      {patient.address.street}, {patient.address.number}
                      {patient.address.complement
                        && ` - ${patient.address.complement}`}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      {patient.address.neighborhood}, {patient.address.city} -{' '}
                      {patient.address.state}
                    </div>
                    <div className='text-sm text-muted-foreground font-mono'>
                      {patient.address.zipCode}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className='border-red-200'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-red-600'>
                <AlertTriangle className='h-5 w-5' />
                Contato de Emergência
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Nome:</span>
                  <span className='font-medium'>
                    {patient.emergencyContact.name}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Relação:</span>
                  <span className='font-medium'>
                    {patient.emergencyContact.relationship}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Telefone:</span>
                  <span className='font-medium'>
                    {patient.emergencyContact.phone}
                  </span>
                </div>
                {patient.emergencyContact.email && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Email:</span>
                    <span className='font-medium'>
                      {patient.emergencyContact.email}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Health Insurance */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5 text-purple-600' />
                Plano de Saúde
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Operadora:</span>
                  <span className='font-medium'>
                    {patient.healthInsurance.provider}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Plano:</span>
                  <span className='font-medium'>
                    {patient.healthInsurance.plan}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Cartão:</span>
                  <span className='font-medium font-mono'>
                    {showSensitiveData
                      ? maskCardNumber(patient.healthInsurance.cardNumber)
                      : '**** **** **** ****'}
                  </span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Validade:</span>
                  <span className='font-medium'>
                    {format(
                      new Date(patient.healthInsurance.validity),
                      'dd/MM/yyyy',
                      {
                        locale: ptBR,
                      },
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className='lg:col-span-2'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-6'
          >
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='overview' className='text-sm sm:text-base'>
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value='appointments'
                className='text-sm sm:text-base'
              >
                Consultas
              </TabsTrigger>
              <TabsTrigger value='medical' className='text-sm sm:text-base'>
                Histórico
              </TabsTrigger>
              <TabsTrigger value='insights' className='text-sm sm:text-base'>
                Insights
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value='overview' className='space-y-6'>
              {/* Health Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Heart className='h-5 w-5 text-red-600' />
                    Resumo da Saúde
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid gap-4 grid-cols-1 sm:grid-cols-2'>
                    <div>
                      <h4 className='font-medium text-sm mb-2'>
                        Condições Crônicas
                      </h4>
                      <div className='space-y-1'>
                        {patient.chronicConditions.map((condition, index) => (
                          <Badge
                            key={index}
                            variant='outline'
                            className='text-xs'
                          >
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className='font-medium text-sm mb-2'>Alergias</h4>
                      <div className='space-y-1'>
                        {patient.allergies.map((allergy, index) => (
                          <Badge
                            key={index}
                            variant='destructive'
                            className='text-xs'
                          >
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className='font-medium text-sm mb-2'>
                      Medicações Atuais
                    </h4>
                    <div className='space-y-2'>
                      {patient.medications.map((medication, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-2 bg-gray-50 rounded text-sm'
                        >
                          <div>
                            <span className='font-medium'>
                              {medication.name}
                            </span>
                            <span className='text-muted-foreground ml-2'>
                              {medication.dosage} - {medication.frequency}
                            </span>
                          </div>
                          <Pill className='h-4 w-4 text-blue-600' />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Appointment */}
              {patient.nextAppointment && (
                <Card className='border-blue-200'>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Calendar className='h-5 w-5 text-blue-600' />
                      Próxima Consulta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid gap-4 grid-cols-1 sm:grid-cols-2'>
                      <div className='space-y-2'>
                        <div className='text-sm text-muted-foreground'>
                          Data e Hora
                        </div>
                        <div className='font-medium'>
                          {format(
                            new Date(patient.nextAppointment.date),
                            'dd/MM/yyyy HH:mm',
                            {
                              locale: ptBR,
                            },
                          )}
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <div className='text-sm text-muted-foreground'>
                          Tipo
                        </div>
                        <div className='font-medium'>
                          {patient.nextAppointment.type}
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <div className='text-sm text-muted-foreground'>
                          Médico
                        </div>
                        <div className='font-medium'>
                          {patient.nextAppointment.doctor}
                        </div>
                      </div>
                    </div>

                    <div className='flex gap-2'>
                      <Button variant='outline' size='sm'>
                        <Video className='h-4 w-4 mr-2' />
                        Teleconsulta
                      </Button>
                      <Button variant='outline' size='sm'>
                        <MessageCircle className='h-4 w-4 mr-2' />
                        Enviar Mensagem
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Insights Preview */}
              {aiInsights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Brain className='h-5 w-5 text-purple-600' />
                      Insights de IA
                    </CardTitle>
                    <CardDescription>
                      Recomendações baseadas em análise dos dados do paciente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {aiInsights.slice(0, 2).map(insight => (
                      <div key={insight.id} className='p-3 border rounded-lg'>
                        <div className='flex items-center justify-between mb-2'>
                          <h4 className='font-medium text-sm'>
                            {insight.title}
                          </h4>
                          <Badge
                            variant={insight.priority === 'high'
                              ? 'destructive'
                              : insight.priority === 'medium'
                              ? 'warning'
                              : 'default'}
                          >
                            {insight.priority === 'high'
                              ? 'Alto'
                              : insight.priority === 'medium'
                              ? 'Médio'
                              : 'Baixo'}
                          </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground mb-2'>
                          {insight.description}
                        </p>
                        {insight.actionable && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleAIInsightAction(insight)}
                          >
                            {insight.actionLabel}
                          </Button>
                        )}
                      </div>
                    ))}
                    {aiInsights.length > 2 && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => setActiveTab('insights')}
                      >
                        Ver todos os insights ({aiInsights.length})
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value='appointments' className='space-y-6'>
              <Card>
                <CardHeader>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div>
                      <CardTitle>Agendamentos</CardTitle>
                      <CardDescription>
                        Histórico de consultas e procedimentos
                      </CardDescription>
                    </div>
                    <Button onClick={handleScheduleAppointment}>
                      <Calendar className='h-4 w-4 mr-2' />
                      Nova Consulta
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {appointments.length === 0
                    ? (
                      <div className='text-center py-8'>
                        <Calendar className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                        <h3 className='text-lg font-medium mb-2'>
                          Nenhuma consulta agendada
                        </h3>
                        <p className='text-muted-foreground mb-4'>
                          Agende a primeira consulta para este paciente.
                        </p>
                        <Button onClick={handleScheduleAppointment}>
                          Agendar Consulta
                        </Button>
                      </div>
                    )
                    : (
                      <div className='space-y-3'>
                        {appointments.map(appointment => (
                          <div
                            key={appointment.id}
                            className='p-4 border rounded-lg'
                          >
                            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                              <div className='space-y-1'>
                                <div className='flex items-center gap-2'>
                                  <h4 className='font-medium'>
                                    {appointment.type}
                                  </h4>
                                  <Badge
                                    variant={appointment.status === 'completed'
                                      ? 'default'
                                      : appointment.status === 'scheduled'
                                      ? 'secondary'
                                      : appointment.status === 'no-show'
                                      ? 'destructive'
                                      : appointment.status === 'cancelled'
                                      ? 'outline'
                                      : 'default'}
                                  >
                                    {appointment.status === 'completed'
                                      ? 'Concluída'
                                      : appointment.status === 'scheduled'
                                      ? 'Agendada'
                                      : appointment.status === 'no-show'
                                      ? 'Não compareceu'
                                      : appointment.status === 'cancelled'
                                      ? 'Cancelada'
                                      : 'Em andamento'}
                                  </Badge>
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  {format(
                                    new Date(appointment.date),
                                    'dd/MM/yyyy HH:mm',
                                    {
                                      locale: ptBR,
                                    },
                                  )} • {appointment.duration} min
                                </div>
                                <div className='text-sm'>
                                  <span className='text-muted-foreground'>
                                    Médico:
                                  </span>{' '}
                                  {appointment.doctor} • {appointment.specialty}
                                </div>
                              </div>

                              <div className='flex gap-2'>
                                {appointment.status === 'scheduled' && (
                                  <>
                                    <Button variant='outline' size='sm'>
                                      <Video className='h-4 w-4 mr-1' />
                                      Teleconsulta
                                    </Button>
                                    <Button variant='outline' size='sm'>
                                      <MessageCircle className='h-4 w-4 mr-1' />
                                      Mensagem
                                    </Button>
                                  </>
                                )}
                                <Button variant='outline' size='sm'>
                                  <MoreVertical className='h-4 w-4' />
                                </Button>
                              </div>
                            </div>

                            {appointment.aiPrediction && (
                              <div className='mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm'>
                                <div className='flex items-center gap-2'>
                                  <Brain className='h-4 w-4 text-yellow-600' />
                                  <span className='font-medium'>
                                    Previsão de não comparecimento:
                                  </span>
                                  <span className='text-yellow-700'>
                                    {(
                                      appointment.aiPrediction.noShowRisk * 100
                                    ).toFixed(0)}
                                    % de risco
                                  </span>
                                </div>
                                <div className='text-xs text-yellow-600 mt-1'>
                                  Confiança: {(
                                    appointment.aiPrediction.confidence * 100
                                  ).toFixed(0)}
                                  %
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Medical History Tab */}
            <TabsContent value='medical' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Histórico Médico</CardTitle>
                  <CardDescription>
                    Registros de consultas, exames e procedimentos
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {medicalRecords.length === 0
                    ? (
                      <div className='text-center py-8'>
                        <FileText className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                        <h3 className='text-lg font-medium mb-2'>
                          Nenhum registro médico
                        </h3>
                        <p className='text-muted-foreground'>
                          Nenhum registro médico encontrado para este paciente.
                        </p>
                      </div>
                    )
                    : (
                      <div className='space-y-4'>
                        {medicalRecords.map(record => (
                          <div key={record.id} className='p-4 border rounded-lg'>
                            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3'>
                              <div>
                                <div className='flex items-center gap-2'>
                                  <h4 className='font-medium'>{record.type}</h4>
                                  <Badge variant='outline'>
                                    {format(new Date(record.date), 'dd/MM/yyyy', {
                                      locale: ptBR,
                                    })}
                                  </Badge>
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  {record.doctor} • {record.specialty}
                                </div>
                              </div>
                              <Button variant='outline' size='sm'>
                                <Printer className='h-4 w-4 mr-2' />
                                Imprimir
                              </Button>
                            </div>

                            <div className='space-y-3'>
                              <div>
                                <div className='text-sm font-medium mb-1'>
                                  Diagnóstico
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  {record.diagnosis}
                                </div>
                              </div>

                              {record.prescription.length > 0 && (
                                <div>
                                  <div className='text-sm font-medium mb-1'>
                                    Prescrição
                                  </div>
                                  <div className='space-y-1'>
                                    {record.prescription.map((presc, index) => (
                                      <div
                                        key={index}
                                        className='text-sm text-muted-foreground'
                                      >
                                        • {presc.medication} {presc.dosage} - {presc.duration}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {record.vitalSigns && (
                                <div>
                                  <div className='text-sm font-medium mb-1'>
                                    Sinais Vitais
                                  </div>
                                  <div className='grid gap-2 grid-cols-2 sm:grid-cols-4 text-sm'>
                                    <div>
                                      <span className='text-muted-foreground'>
                                        PA:
                                      </span>
                                      <span className='ml-1 font-medium'>
                                        {record.vitalSigns.bloodPressure}
                                      </span>
                                    </div>
                                    <div>
                                      <span className='text-muted-foreground'>
                                        FC:
                                      </span>
                                      <span className='ml-1 font-medium'>
                                        {record.vitalSigns.heartRate} bpm
                                      </span>
                                    </div>
                                    <div>
                                      <span className='text-muted-foreground'>
                                        Temp:
                                      </span>
                                      <span className='ml-1 font-medium'>
                                        {record.vitalSigns.temperature}°C
                                      </span>
                                    </div>
                                    {record.vitalSigns.weight && (
                                      <div>
                                        <span className='text-muted-foreground'>
                                          Peso:
                                        </span>
                                        <span className='ml-1 font-medium'>
                                          {record.vitalSigns.weight} kg
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {record.notes && (
                                <div>
                                  <div className='text-sm font-medium mb-1'>
                                    Observações
                                  </div>
                                  <div className='text-sm text-muted-foreground'>
                                    {record.notes}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value='insights' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Brain className='h-5 w-5 text-purple-600' />
                    Insights de Inteligência Artificial
                  </CardTitle>
                  <CardDescription>
                    Análises personalizadas e recomendações para o paciente
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {aiInsights.length === 0
                    ? (
                      <div className='text-center py-8'>
                        <Brain className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                        <h3 className='text-lg font-medium mb-2'>
                          Nenhum insight disponível
                        </h3>
                        <p className='text-muted-foreground'>
                          Os insights de IA serão gerados conforme mais dados forem coletados.
                        </p>
                      </div>
                    )
                    : (
                      <div className='space-y-4'>
                        {aiInsights.map(insight => (
                          <div key={insight.id} className='p-4 border rounded-lg'>
                            <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3'>
                              <div className='flex-1'>
                                <div className='flex items-center gap-2 mb-2'>
                                  <h4 className='font-medium'>{insight.title}</h4>
                                  <Badge
                                    variant={insight.priority === 'critical'
                                      ? 'destructive'
                                      : insight.priority === 'high'
                                      ? 'destructive'
                                      : insight.priority === 'medium'
                                      ? 'warning'
                                      : 'default'}
                                  >
                                    {insight.priority === 'critical'
                                      ? 'Crítico'
                                      : insight.priority === 'high'
                                      ? 'Alto'
                                      : insight.priority === 'medium'
                                      ? 'Médio'
                                      : 'Baixo'}
                                  </Badge>
                                  <Badge variant='outline'>
                                    {insight.category === 'health'
                                      ? 'Saúde'
                                      : insight.category === 'treatment'
                                      ? 'Tratamento'
                                      : insight.category === 'prevention'
                                      ? 'Prevenção'
                                      : 'Administrativo'}
                                  </Badge>
                                </div>
                                <p className='text-sm text-muted-foreground mb-2'>
                                  {insight.description}
                                </p>
                                <div className='text-xs text-muted-foreground'>
                                  Confiança: {(insight.confidence * 100).toFixed(0)}% •
                                  {format(insight.timestamp, 'dd/MM/yyyy HH:mm', {
                                    locale: ptBR,
                                  })}
                                </div>
                              </div>

                              {insight.actionable && (
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleAIInsightAction(insight)}
                                >
                                  {insight.actionLabel}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* LGPD Compliance Footer */}
      <footer className='mt-8 sm:mt-12'>
        <Card className='bg-gray-50'>
          <CardContent className='p-4 sm:p-6'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <Shield className='h-6 w-6 text-blue-600' />
                <div>
                  <h3 className='text-sm font-medium text-gray-900'>
                    Conformidade LGPD
                  </h3>
                  <p className='text-xs text-gray-600'>
                    Acesso autorizado • Dados criptografados • Audit trail registrado
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-xs'>
                  Consentimento: {patient.lgpdConsent.dataProcessing ? 'Sim' : 'Não'}
                </Badge>
                <Badge variant='outline' className='text-xs'>
                  IA: {patient.lgpdConsent.aiProcessing ? 'Sim' : 'Não'}
                </Badge>
                <Badge variant='outline' className='text-xs'>
                  Marketing: {patient.lgpdConsent.marketing ? 'Sim' : 'Não'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </footer>
    </div>
  );
}
