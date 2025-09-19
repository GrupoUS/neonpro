import { Alert, AlertDescription } from '@/components/ui/alert';
// Fallback to shared UI Avatar not available; using simple initials circle inline below
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  Calendar,
  Download,
  Edit,
  FileText,
  Heart,
  Mail,
  MapPin,
  Phone,
  Share2,
  TrendingUp,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

export const Route = createFileRoute('/patients/id-backup')({
  component: PatientDetailPage,
});

// Types
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
  allergies: string[];
  medications: string[];
  chronicConditions: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
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
  createdAt: string;
  updatedAt: string;
}

interface Appointment {
  id: string;
  type: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  doctor: string;
  specialty: string;
  notes?: string;
  aiPrediction?: {
    noShowRisk: number;
    confidence: number;
    factors: string[];
  };
}

interface MedicalRecord {
  id: string;
  date: string;
  type: string;
  doctor: string;
  diagnosis: string;
  prescription: string[];
  notes: string;
  attachments: string[];
}

interface AIInsight {
  id: string;
  type: 'health_risk' | 'treatment_optimization' | 'prevention' | 'compliance';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  createdAt: string;
}

function PatientDetailPage() {
  const { id } = useParams({ from: '/patients/$id' });
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        // Mock data for development
        const mockPatient: Patient = {
          id: id || '1',
          name: 'Maria Santos Oliveira',
          email: 'maria.santos@email.com',
          phone: '+55 11 98765-4321',
          cpf: '123.456.789-00',
          rg: '12.345.678-9',
          birthDate: '1985-03-15',
          gender: 'F',
          bloodType: 'O+',
          allergies: ['Penicilina', 'Amoxicilina'],
          medications: ['Losartana 50mg', 'Metformina 850mg'],
          chronicConditions: ['Hipertensão', 'Diabetes Tipo 2'],
          emergencyContact: {
            name: 'José Oliveira Santos',
            relationship: 'Esposo',
            phone: '+55 11 91234-5678',
          },
          address: {
            street: 'Rua das Flores',
            number: '123',
            complement: 'Apto 45',
            neighborhood: 'Vila Madalena',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '05432-100',
          },
          healthInsurance: {
            provider: 'Unimed',
            plan: 'Unimed Básico',
            cardNumber: '1234567890123456',
            validity: '12/2025',
          },
          createdAt: '2023-01-15T10:30:00Z',
          updatedAt: '2024-01-10T14:20:00Z',
        };

        const mockAppointments: Appointment[] = [
          {
            id: '1',
            type: 'Consulta de Rotina',
            date: '2024-01-25',
            time: '14:00',
            status: 'scheduled',
            doctor: 'Dr. Carlos Silva',
            specialty: 'Clínico Geral',
            aiPrediction: {
              noShowRisk: 15,
              confidence: 85,
              factors: ['Histórico de comparecimento bom', 'Horário conveniente'],
            },
          },
          {
            id: '2',
            type: 'Retorno Cardiológico',
            date: '2024-01-18',
            time: '10:30',
            status: 'completed',
            doctor: 'Dra. Ana Paula Cardoso',
            specialty: 'Cardiologia',
            notes: 'Paciente estável, manter medicação atual',
          },
        ];

        const mockMedicalRecords: MedicalRecord[] = [
          {
            id: '1',
            date: '2024-01-10',
            type: 'Consulta de Rotina',
            doctor: 'Dr. Carlos Silva',
            diagnosis: 'Hipertensão controlada, Diabetes compensada',
            prescription: ['Losartana 50mg 1x ao dia', 'Metformina 850mg 2x ao dia'],
            notes: 'Paciente orientada sobre dieta e exercícios',
            attachments: ['exame_sangue_jan2024.pdf'],
          },
        ];

        const mockInsights: AIInsight[] = [
          {
            id: '1',
            type: 'prevention',
            title: 'Risco de Descompensação Diabética',
            description: 'Análise dos dados sugere risco moderado de descompensação glicêmica',
            confidence: 78,
            priority: 'medium',
            recommendations: [
              'Aumentar frequência de monitoramento glicêmico',
              'Reforçar orientações sobre dieta',
              'Considerar ajuste posológico',
            ],
            createdAt: '2024-01-15T09:00:00Z',
          },
        ];

        setPatient(mockPatient);
        setAppointments(mockAppointments);
        setMedicalRecords(mockMedicalRecords);
        setAiInsights(mockInsights);
      } catch (err) {
        setError('Erro ao carregar dados do paciente');
        console.error('Error fetching patient data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: { variant: 'default' as const, label: 'Agendada' },
      completed: { variant: 'secondary' as const, label: 'Realizada' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelada' },
      'no-show': { variant: 'destructive' as const, label: 'Não Compareceu' },
    };
    return variants[status as keyof typeof variants] || variants.scheduled;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: { variant: 'outline' as const, label: 'Baixa' },
      medium: { variant: 'default' as const, label: 'Média' },
      high: { variant: 'secondary' as const, label: 'Alta' },
      critical: { variant: 'destructive' as const, label: 'Crítica' },
    };
    return variants[priority as keyof typeof variants] || variants.low;
  };

  const formatBirthDate = (dateString: string) => {
    return format(new Date(dateString), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR });
  };

  const getLastSync = () => {
    return new Date().toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-6'>
        <div className='flex items-center gap-4 mb-6'>
          <Skeleton className='h-10 w-10' />
          <Skeleton className='h-8 w-48' />
        </div>
        <div className='grid gap-6'>
          <Skeleton className='h-64' />
          <Skeleton className='h-64' />
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className='container mx-auto px-4 py-6'>
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>{error || 'Paciente não encontrado'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-4 sm:py-6 max-w-7xl'>
      {/* Header - Mobile-first responsive */}
      <header className='mb-6 space-y-4 sm:space-y-0'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-start sm:items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => navigate({ to: '/patients' })}
              className='h-10 px-3 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              aria-label='Voltar para lista de pacientes'
            >
              <ArrowLeft className='h-4 w-4 mr-2' aria-hidden='true' />
              Voltar
            </Button>
            <div className='flex items-center gap-3 sm:gap-4'>
              <div className='h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0'>
                <span className='font-semibold text-blue-700 text-sm sm:text-base'>
                  {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div className='min-w-0 flex-1'>
                <h1 className='text-xl sm:text-2xl font-bold text-gray-900 truncate'>
                  {patient.name}
                </h1>
                <p className='text-sm text-gray-600 mt-1'>
                  {calculateAge(patient.birthDate)} anos • {patient.bloodType}
                  <span className='sr-only'>, tipo sanguíneo</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons - Mobile-optimized */}
          <div className='flex flex-wrap sm:flex-nowrap items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='h-9 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              aria-label='Exportar dados do paciente'
            >
              <Download className='h-4 w-4 mr-2' aria-hidden='true' />
              Exportar
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='h-9 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              aria-label='Compartilhar perfil do paciente'
            >
              <Share2 className='h-4 w-4 mr-2' aria-hidden='true' />
              Compartilhar
            </Button>
            <Button
              size='sm'
              className='h-9 px-3 text-sm bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              aria-label='Editar informações do paciente'
            >
              <Edit className='h-4 w-4 mr-2' aria-hidden='true' />
              Editar
            </Button>
          </div>
        </div>
      </header>

      {/* Quick Info Cards - Enhanced accessibility */}
      <section aria-labelledby='patient-info-heading' className='mb-6'>
        <h2 id='patient-info-heading' className='sr-only'>Informações de contato do paciente</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card className='transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2'>
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <Phone className='h-5 w-5 text-blue-600 flex-shrink-0' aria-hidden='true' />
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-medium text-gray-900'>Telefone</p>
                  <p className='text-sm text-gray-600 truncate' title={patient.phone}>
                    <a
                      href={`tel:${patient.phone}`}
                      className='hover:text-blue-600 focus:text-blue-600 focus:outline-none focus:underline'
                      aria-label={`Ligar para ${patient.phone}`}
                    >
                      {patient.phone}
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2'>
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <Mail className='h-5 w-5 text-blue-600 flex-shrink-0' aria-hidden='true' />
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-medium text-gray-900'>Email</p>
                  <p className='text-sm text-gray-600 truncate' title={patient.email}>
                    <a
                      href={`mailto:${patient.email}`}
                      className='hover:text-blue-600 focus:text-blue-600 focus:outline-none focus:underline'
                      aria-label={`Enviar email para ${patient.email}`}
                    >
                      {patient.email}
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='transition-shadow hover:shadow-md'>
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <Calendar className='h-5 w-5 text-blue-600 flex-shrink-0' aria-hidden='true' />
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-medium text-gray-900'>Data de Nascimento</p>
                  <p className='text-sm text-gray-600'>
                    <time dateTime={patient.birthDate}>
                      {formatBirthDate(patient.birthDate)}
                    </time>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='transition-shadow hover:shadow-md'>
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <MapPin className='h-5 w-5 text-blue-600 flex-shrink-0' aria-hidden='true' />
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-medium text-gray-900'>Localização</p>
                  <p
                    className='text-sm text-gray-600 truncate'
                    title={`${patient.city} - ${patient.state}`}
                  >
                    {patient.city} - {patient.state}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content Tabs - Mobile-responsive */}
      <main>
        <Tabs defaultValue='overview' className='space-y-4' orientation='horizontal'>
          <div className='overflow-x-auto'>
            <TabsList className='grid w-full min-w-max grid-cols-5 h-auto p-1 bg-gray-100'>
              <TabsTrigger
                value='overview'
                className='text-sm px-3 py-2 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              >
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value='medical'
                className='text-sm px-3 py-2 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              >
                Histórico Médico
              </TabsTrigger>
              <TabsTrigger
                value='appointments'
                className='text-sm px-3 py-2 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              >
                Consultas
              </TabsTrigger>
              <TabsTrigger
                value='insights'
                className='text-sm px-3 py-2 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              >
                Insights IA
              </TabsTrigger>
              <TabsTrigger
                value='compliance'
                className='text-sm px-3 py-2 whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              >
                LGPD
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='overview' className='space-y-6'>
            {/* Health Overview */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Heart className='h-5 w-5' />
                    Informações de Saúde
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <h4 className='font-medium mb-2'>Alergias</h4>
                    <div className='flex flex-wrap gap-2'>
                      {patient.allergies.map((allergy, index) => (
                        <Badge key={index} variant='destructive'>{allergy}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className='font-medium mb-2'>Medicamentos em Uso</h4>
                    <div className='flex flex-wrap gap-2'>
                      {patient.medications.map((medication, index) => (
                        <Badge key={index} variant='outline'>{medication}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className='font-medium mb-2'>Condições Crônicas</h4>
                    <div className='flex flex-wrap gap-2'>
                      {patient.chronicConditions.map((condition, index) => (
                        <Badge key={index} variant='secondary'>{condition}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <User className='h-5 w-5' />
                    Contato de Emergência
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div>
                      <p className='font-medium'>{patient.emergencyContact.name}</p>
                      <p className='text-sm text-muted-foreground'>
                        {patient.emergencyContact.relationship}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Phone className='h-4 w-4 text-muted-foreground' />
                      <p className='text-sm'>{patient.emergencyContact.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Insurance */}
            <Card>
              <CardHeader>
                <CardTitle>Plano de Saúde</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  <div>
                    <p className='text-sm font-medium'>Operadora</p>
                    <p className='text-sm text-muted-foreground'>
                      {patient.healthInsurance.provider}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm font-medium'>Plano</p>
                    <p className='text-sm text-muted-foreground'>{patient.healthInsurance.plan}</p>
                  </div>
                  <div>
                    <p className='text-sm font-medium'>Carteirinha</p>
                    <p className='text-sm text-muted-foreground'>
                      •••• {patient.healthInsurance.cardNumber.slice(-4)}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm font-medium'>Validade</p>
                    <p className='text-sm text-muted-foreground'>
                      {patient.healthInsurance.validity}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <p>
                    {patient.address.street}, {patient.address.number}
                    {patient.address.complement && ` - ${patient.address.complement}`}
                  </p>
                  <p>
                    {patient.address.neighborhood} - {patient.address.city}/{patient.address.state}
                  </p>
                  <p>CEP: {patient.address.zipCode}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='medical' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Prontuário Médico</CardTitle>
              </CardHeader>
              <CardContent>
                {medicalRecords.length > 0
                  ? (
                    <div className='space-y-4'>
                      {medicalRecords.map(record => (
                        <div key={record.id} className='border rounded-lg p-4'>
                          <div className='flex justify-between items-start mb-2'>
                            <div>
                              <h4 className='font-medium'>{record.type}</h4>
                              <p className='text-sm text-muted-foreground'>
                                {format(new Date(record.date), 'dd/MM/yyyy', { locale: ptBR })}{' '}
                                • Dr(a). {record.doctor}
                              </p>
                            </div>
                            <Badge variant='outline'>{record.type}</Badge>
                          </div>
                          <div className='space-y-2'>
                            <div>
                              <p className='text-sm font-medium'>Diagnóstico:</p>
                              <p className='text-sm'>{record.diagnosis}</p>
                            </div>
                            {record.prescription.length > 0 && (
                              <div>
                                <p className='text-sm font-medium'>Prescrição:</p>
                                <ul className='text-sm list-disc list-inside'>
                                  {record.prescription.map((med, index) => (
                                    <li key={index}>{med}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div>
                              <p className='text-sm font-medium'>Observações:</p>
                              <p className='text-sm'>{record.notes}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                  : (
                    <p className='text-center text-muted-foreground py-8'>
                      Nenhum registro médico encontrado
                    </p>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='appointments' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Consultas</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length > 0
                  ? (
                    <div className='space-y-4'>
                      {appointments.map(appointment => (
                        <div key={appointment.id} className='border rounded-lg p-4'>
                          <div className='flex justify-between items-start mb-2'>
                            <div>
                              <h4 className='font-medium'>{appointment.type}</h4>
                              <p className='text-sm text-muted-foreground'>
                                {format(new Date(appointment.date), 'dd/MM/yyyy', { locale: ptBR })}
                                {' '}
                                • {appointment.time}
                              </p>
                              <p className='text-sm text-muted-foreground'>
                                Dr(a). {appointment.doctor} • {appointment.specialty}
                              </p>
                            </div>
                            <Badge {...getStatusBadge(appointment.status)}>
                              {getStatusBadge(appointment.status).label}
                            </Badge>
                          </div>

                          {appointment.aiPrediction && (
                            <div className='mt-3 p-3 bg-blue-50 rounded-lg'>
                              <div className='flex items-center gap-2 mb-2'>
                                <Brain className='h-4 w-4 text-blue-600' />
                                <span className='text-sm font-medium text-blue-800'>
                                  Previsão de Comparecimento:{' '}
                                  {appointment.aiPrediction.noShowRisk}% risco de não comparecimento
                                </span>
                              </div>
                              <div className='text-xs text-blue-700'>
                                Confiança: {appointment.aiPrediction.confidence}% • Fatores:{' '}
                                {appointment.aiPrediction.factors.join(', ')}
                              </div>
                            </div>
                          )}

                          {appointment.notes && (
                            <div className='mt-3 p-3 bg-gray-50 rounded-lg'>
                              <p className='text-sm font-medium'>Observações:</p>
                              <p className='text-sm'>{appointment.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                  : (
                    <p className='text-center text-muted-foreground py-8'>
                      Nenhuma consulta encontrada
                    </p>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='insights' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5' />
                  Insights e Recomendações da IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiInsights.length > 0
                  ? (
                    <div className='space-y-4'>
                      {aiInsights.map(insight => (
                        <div key={insight.id} className='border rounded-lg p-4'>
                          <div className='flex justify-between items-start mb-2'>
                            <div>
                              <h4 className='font-medium'>{insight.title}</h4>
                              <p className='text-sm text-muted-foreground'>
                                {format(new Date(insight.createdAt), 'dd/MM/yyyy HH:mm', {
                                  locale: ptBR,
                                })}
                              </p>
                            </div>
                            <div className='flex gap-2'>
                              <Badge {...getPriorityBadge(insight.priority)}>
                                {getPriorityBadge(insight.priority).label}
                              </Badge>
                              <Badge variant='outline'>{insight.confidence}% confiança</Badge>
                            </div>
                          </div>

                          <p className='text-sm mb-3'>{insight.description}</p>

                          <div>
                            <p className='text-sm font-medium mb-2'>Recomendações:</p>
                            <ul className='text-sm list-disc list-inside space-y-1'>
                              {insight.recommendations.map((recommendation, index) => (
                                <li key={index}>{recommendation}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                  : (
                    <p className='text-center text-muted-foreground py-8'>
                      Nenhum insight disponível no momento
                    </p>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='compliance' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>LGPD - Proteção de Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <div>
                    <h4 className='font-medium mb-3'>Consentimentos Ativos</h4>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                        <div>
                          <p className='font-medium text-green-800'>Tratamento de Dados de Saúde</p>
                          <p className='text-sm text-green-700'>
                            Consentimento para processamento de informações médicas
                          </p>
                        </div>
                        <Badge variant='outline'>Ativo</Badge>
                      </div>
                      <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                        <div>
                          <p className='font-medium text-green-800'>
                            Compartilhamento com Profissionais
                          </p>
                          <p className='text-sm text-green-700'>
                            Autorização para compartilhamento com equipe médica
                          </p>
                        </div>
                        <Badge variant='outline'>Ativo</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className='font-medium mb-3'>Solicitações LGPD</h4>
                    <div className='space-y-2'>
                      <div className='p-3 bg-gray-50 rounded-lg'>
                        <p className='font-medium'>Nenhuma solicitação registrada</p>
                        <p className='text-sm text-muted-foreground'>
                          O paciente não realizou solicitações LGPD
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className='font-medium mb-3'>Audit Trail</h4>
                    <div className='text-sm text-muted-foreground'>
                      <p>• Último acesso: {getLastSync()}</p>
                      <p>• Total de acessos: 127</p>
                      <p>• Dados criptografados em repouso e trânsito</p>
                      <p>• Backup automático diário às 02:00</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
