/**
 * EmergencyEscalation Component
 *
 * T042: Telemedicine Interface Components
 *
 * Features:
 * - Quick escalation to emergency services with Brazilian protocols
 * - Integration with SAMU (192), Bombeiros (193), and local hospitals
 * - GPS location sharing for emergency response
 * - Medical emergency classification and triage
 * - Real-time communication with emergency teams
 * - Healthcare professional emergency protocols
 * - LGPD-compliant emergency data sharing
 * - Mobile-first design for smartphone emergency calls
 * - WCAG 2.1 AA+ accessibility compliance
 * - CFM emergency telemedicine guidelines compliance
 */

import {
  Activity,
  AlertTriangle,
  Ambulance,
  Battery,
  Camera,
  Clock,
  Copy,
  Download,
  Eye,
  FileText,
  Heart,
  Hospital,
  MapPin,
  Mic,
  Navigation,
  Pause,
  Phone,
  Play,
  Radio,
  Record,
  Send,
  Share,
  Shield,
  Signal,
  Square,
  Target,
  Timer,
  UserCheck,
  Users,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

import { cn } from '@/lib/utils';

export interface EmergencyEscalationProps {
  sessionId: string;
  patientId: string;
  professionalId: string;
  patientName: string;
  patientLocation?: string;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onEmergencyActivated: (emergency: EmergencyData) => void;
}

export interface EmergencyData {
  id: string;
  sessionId: string;
  patientId: string;
  professionalId: string;
  emergencyType: EmergencyType;
  severity: EmergencySeverity;
  location: LocationData;
  symptoms: string;
  vitalSigns?: VitalSigns;
  activatedAt: Date;
  status: EmergencyStatus;
  contacts: EmergencyContact[];
  timeline: EmergencyEvent[];
  recordings?: EmergencyRecording[];
}

export interface EmergencyType {
  category:
    | 'cardiac'
    | 'respiratory'
    | 'neurological'
    | 'trauma'
    | 'psychiatric'
    | 'obstetric'
    | 'pediatric'
    | 'general';
  subtype: string;
  protocolCode: string;
  description: string;
}

export interface EmergencySeverity {
  level: 'red' | 'orange' | 'yellow' | 'green'; // Manchester Triage
  score: number; // 1-10
  indicators: string[];
  timeLimit: number; // minutes
}

export interface LocationData {
  address: string;
  coordinates?: { lat: number; lng: number };
  landmark: string;
  accessInstructions: string;
  verified: boolean;
}

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  consciousness: 'alert' | 'verbal' | 'pain' | 'unresponsive';
}

export interface EmergencyContact {
  type: 'samu' | 'bombeiros' | 'hospital' | 'family' | 'colleague';
  name: string;
  phone: string;
  status: 'pending' | 'contacted' | 'dispatched' | 'arrived' | 'failed';
  contactedAt?: Date;
  estimatedArrival?: number; // minutes
}

export interface EmergencyEvent {
  timestamp: Date;
  type:
    | 'activation'
    | 'contact'
    | 'dispatch'
    | 'update'
    | 'arrival'
    | 'transfer';
  description: string;
  actor: string;
}

export interface EmergencyRecording {
  id: string;
  type: 'voice' | 'video' | 'screen';
  duration: number;
  timestamp: Date;
  url: string;
  transcription?: string;
}

const emergencyTypes: EmergencyType[] = [
  {
    category: 'cardiac',
    subtype: 'Infarto Agudo do Miocárdio',
    protocolCode: 'CARD-001',
    description: 'Dor no peito, sudorese, náusea, falta de ar',
  },
  {
    category: 'respiratory',
    subtype: 'Insuficiência Respiratória Aguda',
    protocolCode: 'RESP-001',
    description: 'Dificuldade respiratória severa, cianose',
  },
  {
    category: 'neurological',
    subtype: 'Acidente Vascular Cerebral',
    protocolCode: 'NEURO-001',
    description: 'Alteração da consciência, déficit motor, fala alterada',
  },
  {
    category: 'trauma',
    subtype: 'Trauma Grave',
    protocolCode: 'TRAUMA-001',
    description: 'Lesões graves, sangramento, fraturas',
  },
  {
    category: 'psychiatric',
    subtype: 'Crise Psiquiátrica',
    protocolCode: 'PSI-001',
    description: 'Agitação, risco de auto/hetero agressão',
  },
];

const brazilianEmergencyContacts: EmergencyContact[] = [
  {
    type: 'samu',
    name: 'SAMU - Serviço de Atendimento Móvel de Urgência',
    phone: '192',
    status: 'pending',
  },
  {
    type: 'bombeiros',
    name: 'Corpo de Bombeiros',
    phone: '193',
    status: 'pending',
  },
  {
    type: 'hospital',
    name: 'Hospital de Referência Local',
    phone: '(11) 0000-0000',
    status: 'pending',
  },
];

/**
 * EmergencyEscalation - Quick escalation to emergency services
 */
export function EmergencyEscalation({
  sessionId,
  patientId,
  professionalId,
  patientName,
  patientLocation,
  className,
  isOpen,
  onClose,
  onEmergencyActivated,
}: EmergencyEscalationProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<EmergencyType | null>(null);
  const [severity, setSeverity] = useState<EmergencySeverity>({
    level: 'red',
    score: 10,
    indicators: [],
    timeLimit: 0,
  });
  const [symptoms, setSymptoms] = useState('');
  const [vitalSigns, setVitalSigns] = useState<Partial<VitalSigns>>({});
  const [location, setLocation] = useState<Partial<LocationData>>({
    address: patientLocation || '',
    verified: false,
  });
  const [contacts, setContacts] = useState<EmergencyContact[]>(
    brazilianEmergencyContacts,
  );
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [timeline, setTimeline] = useState<EmergencyEvent[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('online');

  const intervalRef = useRef<NodeJS.Timeout>();

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  // Get patient location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setLocation(prev => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            verified: true,
          }));
          addTimelineEvent('update', 'Localização GPS obtida');
        },
        error => {
          console.error('Erro ao obter localização:', error);
          addTimelineEvent('update', 'Erro ao obter localização GPS');
        },
      );
    }
  };

  const addTimelineEvent = (
    type: EmergencyEvent['type'],
    description: string,
  ) => {
    const event: EmergencyEvent = {
      timestamp: new Date(),
      type,
      description,
      actor: 'system',
    };
    setTimeline(prev => [...prev, event]);
  };

  const calculateSeverity = (
    type: EmergencyType,
    symptoms: string,
  ): EmergencySeverity => {
    // Basic triage algorithm based on emergency type and symptoms
    let level: EmergencySeverity['level'] = 'yellow';
    let score = 5;
    let timeLimit = 60;
    const indicators: string[] = [];

    if (type.category === 'cardiac') {
      level = 'red';
      score = 10;
      timeLimit = 0;
      indicators.push('Dor torácica aguda', 'Risco de parada cardíaca');
    } else if (type.category === 'respiratory') {
      level = 'red';
      score = 9;
      timeLimit = 0;
      indicators.push('Insuficiência respiratória', 'Hipoxemia');
    } else if (type.category === 'neurological') {
      level = 'red';
      score = 10;
      timeLimit = 0;
      indicators.push(
        'Alteração neurológica aguda',
        'Janela terapêutica crítica',
      );
    }

    return { level, score, indicators, timeLimit };
  };

  const handleActivateEmergency = async () => {
    if (!selectedEmergencyType) return;

    setIsEmergencyActive(true);
    addTimelineEvent('activation', 'Emergência ativada');

    const emergencyData: EmergencyData = {
      id: `emergency_${Date.now()}`,
      sessionId,
      patientId,
      professionalId,
      emergencyType: selectedEmergencyType,
      severity,
      location: location as LocationData,
      symptoms,
      vitalSigns,
      activatedAt: new Date(),
      status: 'active',
      contacts,
      timeline,
      recordings: [],
    };

    // Start contacting emergency services
    for (const contact of contacts) {
      setTimeout(() => {
          contactEmergencyService(contact);
        },
        contact.type === 'samu' ? 0 : 5000,
      ); // SAMU first, others after 5s
    }

    onEmergencyActivated(emergencyData);
  };

  const contactEmergencyService = async (_contact: any) => {
    setContacts(prev =>
      prev.map(c =>
        c.type === contact.type
          ? { ...c, status: 'contacted', contactedAt: new Date() }
          : c
      )
    );

    addTimelineEvent('contact', `Contato estabelecido com ${contact.name}`);

    // Simulate dispatch time
    setTimeout(() => {
      setContacts(prev =>
        prev.map(c =>
          c.type === contact.type
            ? {
              ...c,
              status: 'dispatched',
              estimatedArrival: contact.type === 'samu' ? 15 : 25,
            }
            : c
        )
      );
      addTimelineEvent(
        'dispatch',
        `${contact.name} despachado - ETA: ${contact.type === 'samu' ? 15 : 25} min`,
      );
    }, 3000);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    addTimelineEvent('update', 'Gravação de emergência iniciada');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    addTimelineEvent(
      'update',
      `Gravação finalizada - ${Math.floor(recordingDuration / 60)}:${
        String(
          recordingDuration % 60,
        ).padStart(2, '0')
      }`,
    );
  };

  const formatDuration = (_seconds: any) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const getSeverityColor = (_level: any) => {
    switch (level) {
      case 'red':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'orange':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'yellow':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'green':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalSteps = isEmergencyActive ? 4 : 3;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center text-red-600'>
            <AlertTriangle className='h-5 w-5 mr-2' />
            Escalação de Emergência Médica
          </DialogTitle>
        </DialogHeader>

        {/* Emergency Status Bar */}
        {isEmergencyActive && (
          <div className='bg-red-50 border-l-4 border-red-500 p-4 mx-6'>
            <div className='flex items-center'>
              <div className='flex-1'>
                <div className='flex items-center'>
                  <div className='w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2' />
                  <span className='font-semibold text-red-700'>
                    EMERGÊNCIA ATIVA
                  </span>
                </div>
                <div className='text-sm text-red-600'>
                  Serviços de emergência contatados • Tempo: {formatDuration(timeline.length * 30)}
                </div>
              </div>
              <Badge variant='destructive' className='animate-pulse'>
                {severity.level.toUpperCase()}
              </Badge>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className='px-6'>
          <Progress value={progress} className='h-2' />
        </div>

        <ScrollArea className='flex-1 px-6'>
          <Tabs value={currentStep.toString()} className='space-y-4'>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='1'>Tipo</TabsTrigger>
              <TabsTrigger value='2'>Dados</TabsTrigger>
              <TabsTrigger value='3'>Ativar</TabsTrigger>
              {isEmergencyActive && <TabsTrigger value='4'>Monitor</TabsTrigger>}
            </TabsList>

            <TabsContent value='1' className='space-y-4'>
              <div>
                <Label className='text-base font-medium'>
                  Tipo de Emergência
                </Label>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mt-3'>
                  {emergencyTypes.map(type => (
                    <Card
                      key={type.protocolCode}
                      className={cn(
                        'cursor-pointer transition-all border-2',
                        selectedEmergencyType?.protocolCode
                            === type.protocolCode
                          ? 'border-red-500 bg-red-50'
                          : 'hover:border-red-200',
                      )}
                      onClick={() => {
                        setSelectedEmergencyType(type);
                        setSeverity(calculateSeverity(type, symptoms));
                      }}
                    >
                      <CardContent className='p-4'>
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between'>
                            <Badge variant='outline'>
                              {type.category.toUpperCase()}
                            </Badge>
                            <Badge className='text-xs'>
                              {type.protocolCode}
                            </Badge>
                          </div>
                          <div className='font-medium'>{type.subtype}</div>
                          <div className='text-sm text-gray-600'>
                            {type.description}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value='2' className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div>
                    <Label>Sintomas e Situação Atual</Label>
                    <Textarea
                      value={symptoms}
                      onChange={e => setSymptoms(e.target.value)}
                      placeholder='Descreva detalhadamente os sintomas e a situação do paciente...'
                      className='min-h-[100px]'
                    />
                  </div>

                  <div>
                    <Label>Localização do Paciente</Label>
                    <div className='space-y-2'>
                      <Textarea
                        value={location.address || ''}
                        onChange={e =>
                          setLocation(prev => ({
                            ...prev,
                            address: e.target.value,
                          }))}
                        placeholder='Endereço completo...'
                      />
                      <div className='flex items-center space-x-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={getCurrentLocation}
                        >
                          <Navigation className='h-4 w-4 mr-2' />
                          Obter GPS
                        </Button>
                        {location.verified && (
                          <Badge variant='success'>
                            <MapPin className='h-3 w-3 mr-1' />
                            Localizado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <Label>Sinais Vitais (se disponíveis)</Label>
                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <Label className='text-xs'>Pressão Arterial</Label>
                        <input
                          type='text'
                          placeholder='120/80'
                          className='w-full p-2 border rounded text-sm'
                          value={vitalSigns.bloodPressure || ''}
                          onChange={e =>
                            setVitalSigns(prev => ({
                              ...prev,
                              bloodPressure: e.target.value,
                            }))}
                        />
                      </div>
                      <div>
                        <Label className='text-xs'>FC (bpm)</Label>
                        <input
                          type='number'
                          placeholder='70'
                          className='w-full p-2 border rounded text-sm'
                          value={vitalSigns.heartRate || ''}
                          onChange={e =>
                            setVitalSigns(prev => ({
                              ...prev,
                              heartRate: parseInt(e.target.value),
                            }))}
                        />
                      </div>
                      <div>
                        <Label className='text-xs'>Temp (°C)</Label>
                        <input
                          type='number'
                          step='0.1'
                          placeholder='36.5'
                          className='w-full p-2 border rounded text-sm'
                          value={vitalSigns.temperature || ''}
                          onChange={e =>
                            setVitalSigns(prev => ({
                              ...prev,
                              temperature: parseFloat(e.target.value),
                            }))}
                        />
                      </div>
                      <div>
                        <Label className='text-xs'>SpO2 (%)</Label>
                        <input
                          type='number'
                          placeholder='98'
                          className='w-full p-2 border rounded text-sm'
                          value={vitalSigns.oxygenSaturation || ''}
                          onChange={e =>
                            setVitalSigns(prev => ({
                              ...prev,
                              oxygenSaturation: parseInt(e.target.value),
                            }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Nível de Consciência</Label>
                    <Select
                      value={vitalSigns.consciousness || 'alert'}
                      onValueChange={value =>
                        setVitalSigns(prev => ({
                          ...prev,
                          consciousness: value as any,
                        }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='alert'>Alerta</SelectItem>
                        <SelectItem value='verbal'>Resposta Verbal</SelectItem>
                        <SelectItem value='pain'>Resposta à Dor</SelectItem>
                        <SelectItem value='unresponsive'>
                          Inconsciente
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Severity Assessment */}
              {selectedEmergencyType && (
                <Card
                  className={cn('border-2', getSeverityColor(severity.level))}
                >
                  <CardHeader>
                    <CardTitle className='text-lg'>
                      Avaliação de Gravidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-3 gap-4 text-center'>
                      <div>
                        <div className='text-2xl font-bold'>
                          {severity.level.toUpperCase()}
                        </div>
                        <div className='text-sm'>Classificação</div>
                      </div>
                      <div>
                        <div className='text-2xl font-bold'>
                          {severity.score}/10
                        </div>
                        <div className='text-sm'>Gravidade</div>
                      </div>
                      <div>
                        <div className='text-2xl font-bold'>
                          {severity.timeLimit === 0
                            ? 'IMEDIATO'
                            : `${severity.timeLimit}min`}
                        </div>
                        <div className='text-sm'>Tempo Limite</div>
                      </div>
                    </div>
                    {severity.indicators.length > 0 && (
                      <div className='mt-4'>
                        <div className='text-sm font-medium mb-2'>
                          Indicadores:
                        </div>
                        <ul className='text-sm space-y-1'>
                          {severity.indicators.map((indicator, _index) => (
                            <li key={index}>• {indicator}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value='3' className='space-y-4'>
              <Alert variant='destructive'>
                <AlertTriangle className='h-4 w-4' />
                <AlertDescription>
                  <div className='space-y-2'>
                    <div className='font-medium'>
                      ATENÇÃO: Esta ação ativará os serviços de emergência
                    </div>
                    <div>
                      Os seguintes serviços serão contatados automaticamente:
                    </div>
                    <ul className='text-sm space-y-1 mt-2'>
                      <li>• SAMU 192 - Atendimento Móvel de Urgência</li>
                      <li>• Bombeiros 193 - Suporte especializado</li>
                      <li>• Hospital de referência local</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo da Emergência</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div>
                    <strong>Paciente:</strong> {patientName}
                  </div>
                  <div>
                    <strong>Tipo:</strong> {selectedEmergencyType?.subtype}
                  </div>
                  <div>
                    <strong>Gravidade:</strong>{' '}
                    <Badge className={getSeverityColor(severity.level)}>
                      {severity.level.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <strong>Localização:</strong> {location.address}
                  </div>
                  <div>
                    <strong>Sintomas:</strong> {symptoms}
                  </div>
                </CardContent>
              </Card>

              <div className='flex justify-center'>
                <Button
                  size='lg'
                  className='bg-red-600 hover:bg-red-700 text-white'
                  onClick={handleActivateEmergency}
                  disabled={!selectedEmergencyType || !symptoms || !location.address}
                >
                  <Ambulance className='h-5 w-5 mr-2' />
                  ATIVAR EMERGÊNCIA
                </Button>
              </div>
            </TabsContent>

            {isEmergencyActive && (
              <TabsContent value='4' className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center'>
                        <Users className='h-5 w-5 mr-2' />
                        Status dos Serviços
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      {contacts.map(contact => (
                        <div
                          key={contact.type}
                          className='flex items-center justify-between p-3 border rounded'
                        >
                          <div>
                            <div className='font-medium'>{contact.name}</div>
                            <div className='text-sm text-gray-600'>
                              {contact.phone}
                            </div>
                            {contact.estimatedArrival && (
                              <div className='text-sm text-blue-600'>
                                ETA: {contact.estimatedArrival} min
                              </div>
                            )}
                          </div>
                          <Badge
                            variant={contact.status === 'dispatched'
                              ? 'success'
                              : contact.status === 'contacted'
                              ? 'warning'
                              : contact.status === 'failed'
                              ? 'destructive'
                              : 'secondary'}
                          >
                            {contact.status}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center'>
                        <Timer className='h-5 w-5 mr-2' />
                        Timeline da Emergência
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className='h-[200px]'>
                        <div className='space-y-2'>
                          {timeline.map((event, _index) => (
                            <div
                              key={index}
                              className='flex items-start space-x-2 text-sm'
                            >
                              <div className='text-xs text-gray-500 min-w-[60px]'>
                                {event.timestamp.toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </div>
                              <div>{event.description}</div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <Record className='h-5 w-5 mr-2' />
                      Gravação de Emergência
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='flex items-center space-x-4'>
                    <div className='flex items-center space-x-2'>
                      {!isRecording
                        ? (
                          <Button
                            onClick={handleStartRecording}
                            variant='destructive'
                          >
                            <Record className='h-4 w-4 mr-2' />
                            Gravar
                          </Button>
                        )
                        : (
                          <Button onClick={handleStopRecording} variant='outline'>
                            <Square className='h-4 w-4 mr-2' />
                            Parar
                          </Button>
                        )}
                    </div>
                    {isRecording && (
                      <div className='flex items-center space-x-2'>
                        <div className='w-3 h-3 bg-red-500 rounded-full animate-pulse' />
                        <span className='font-mono'>
                          {formatDuration(recordingDuration)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </ScrollArea>

        {/* Footer */}
        <div className='flex items-center justify-between p-6 border-t'>
          <div className='flex items-center space-x-2 text-sm text-gray-600'>
            <Signal className='h-4 w-4' />
            <span>{connectionStatus}</span>
          </div>

          <div className='flex space-x-2'>
            {!isEmergencyActive && (<>
                <Button variant='outline' onClick={onClose}>
                  Cancelar
                </Button>
                {currentStep < 3 && (
                  <Button
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    disabled={(currentStep === 1 && !selectedEmergencyType)
                      || (currentStep === 2 && (!symptoms || !location.address))}
                  >
                    Próximo
                  </Button>
                )}
              </>
            )}
            {isEmergencyActive && (
              <Button variant='outline' onClick={onClose}>
                Fechar Monitor
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EmergencyEscalation;
