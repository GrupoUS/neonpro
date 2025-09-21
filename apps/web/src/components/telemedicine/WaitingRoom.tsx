/**
 * Waiting Room Component for Telemedicine Platform
 * Handles patient queuing, real-time updates, and CFM compliance verification
 * Features appointment validation, queue management, and emergency triage
 */

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  BellOff,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  Info,
  LogOut,
  Phone,
  RefreshCw,
  Ruler,
  Scale,
  Settings,
  Shield,
  Thermometer,
  User,
  Users,
  Video,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs } from '@/components/ui/tabs';
import { toast } from 'sonner';

import {
  useEmergencyTriage,
  usePreConsultationCheck,
  useQueuePosition,
  useSessionConsent,
  useWaitingRoom,
} from '@/hooks/use-telemedicine';

interface WaitingRoomProps {
  appointmentId: string;
  patientId: string;
  onSessionStart?: (sessionId: string) => void;
  onEmergencyEscalation?: () => void;
  className?: string;
}

interface QueueInfo {
  position: number;
  estimatedWaitTime: number;
  totalInQueue: number;
  currentlyServingId?: string;
}

interface VitalSigns {
  bloodPressure?: { systolic: number; diastolic: number };
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  oxygenSaturation?: number;
}

interface PreConsultationData {
  symptoms: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  vitalSigns?: VitalSigns;
  medications: string[];
  allergies: string[];
  notes?: string;
}

export function WaitingRoom({
  appointmentId,
  patientId,
  onSessionStart,
  onEmergencyEscalation,
  className = '',
}: WaitingRoomProps) {
  // Hooks
  const {
    waitingRoom,
    joinWaitingRoom,
    leaveWaitingRoom,
    updatePreConsultationData,
    isJoining,
    isLeaving,
  } = useWaitingRoom({ appointmentId, patientId });

  const { queueInfo, refreshPosition } = useQueuePosition(appointmentId);
  const { checkResults, performCheck, isChecking } = usePreConsultationCheck(appointmentId);
  const { consent, requestConsent, updateConsent } = useSessionConsent(appointmentId);
  const { triageAssessment, performTriage } = useEmergencyTriage(appointmentId);

  // State
  const [preConsultationData, setPreConsultationData] = useState<PreConsultationData>({
    symptoms: [],
    urgencyLevel: 'low',
    medications: [],
    allergies: [],
  });
  const [isPreparationComplete, setIsPreparationComplete] = useState(false);
  const [showVitalsDialog, setShowVitalsDialog] = useState(false);
  const [showTriageDialog, setShowTriageDialog] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [volume, setVolume] = useState([80]);
  const [waitingTime, setWaitingTime] = useState(0);

  // Effects
  useEffect(() => {
    if (appointmentId && patientId) {
      joinWaitingRoom();
    }

    return () => {
      leaveWaitingRoom();
    };
  }, [appointmentId, patientId, joinWaitingRoom, leaveWaitingRoom]);

  // Waiting time counter
  useEffect(() => {
    if (waitingRoom?.joinedAt) {
      const interval = setInterval(() => {
        const joinTime = new Date(waitingRoom.joinedAt!).getTime();
        const currentTime = Date.now();
        setWaitingTime(Math.floor((currentTime - joinTime) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [waitingRoom?.joinedAt]);

  // Auto-perform pre-consultation check
  useEffect(() => {
    if (waitingRoom && !checkResults) {
      performCheck();
    }
  }, [waitingRoom, checkResults, performCheck]);

  // Check if ready for consultation
  useEffect(() => {
    const isReady = Boolean(
      checkResults?.systemCheck
        && checkResults?.connectionCheck
        && consent?.given
        && preConsultationData.symptoms.length > 0,
    );
    setIsPreparationComplete(isReady);
  }, [checkResults, consent, preConsultationData]);

  // Format time
  const formatTime = useCallback((_seconds: any) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Format wait time estimate
  const formatWaitTimeEstimate = useCallback((_minutes: any) => {
    if (minutes < 1) return 'Menos de 1 minuto';
    if (minutes === 1) return '1 minuto';
    if (minutes < 60) return `${minutes} minutos`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
  }, []);

  // Handle emergency escalation
  const handleEmergencyEscalation = useCallback(async () => {
    try {
      const assessment = await performTriage({
        symptoms: preConsultationData.symptoms,
        vitalSigns: preConsultationData.vitalSigns,
        urgencyLevel: 'critical',
      });

      if (assessment.requiresImmediate) {
        onEmergencyEscalation?.();
        toast.success('Emergência escalada com prioridade máxima');
      } else {
        setShowTriageDialog(true);
      }
    } catch (_error) {
      toast.error('Erro ao processar emergência');
    }
  }, [preConsultationData, performTriage, onEmergencyEscalation]);

  // Handle consultation start
  const handleConsultationStart = useCallback(async () => {
    if (!isPreparationComplete) {
      toast.error('Complete a preparação antes de iniciar');
      return;
    }

    try {
      // Update pre-consultation data
      await updatePreConsultationData(preConsultationData);

      // Start session
      const sessionId = `session_${appointmentId}_${Date.now()}`;
      onSessionStart?.(sessionId);

      toast.success('Iniciando consulta...');
    } catch (_error) {
      toast.error('Erro ao iniciar consulta');
    }
  }, [
    isPreparationComplete,
    preConsultationData,
    updatePreConsultationData,
    appointmentId,
    onSessionStart,
  ]);

  // Handle vital signs update
  const handleVitalSignsUpdate = useCallback((_vitals: any) => {
    setPreConsultationData(prev => ({
      ...prev,
      vitalSigns: { ...prev.vitalSigns, ...vitals },
    }));
    setShowVitalsDialog(false);
    toast.success('Sinais vitais atualizados');
  }, []);

  // Handle symptoms update
  const handleSymptomsUpdate = useCallback((symptoms: string[]) => {
    setPreConsultationData(prev => ({
      ...prev,
      symptoms,
    }));
  }, []);

  // Handle consent completion
  const handleConsentComplete = useCallback(async () => {
    try {
      await updateConsent({
        given: true,
        timestamp: new Date(),
        type: 'telemedicine_consultation',
      });
      setShowConsentDialog(false);
      toast.success('Consentimento registrado');
    } catch (_error) {
      toast.error('Erro ao registrar consentimento');
    }
  }, [updateConsent]);

  if (!waitingRoom) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-center'>
          <Activity className='h-8 w-8 animate-spin mx-auto mb-4' />
          <p>Conectando à sala de espera...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 ${className}`}
    >
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Header */}
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Sala de Espera Virtual
          </h1>
          <p className='text-gray-600'>
            Aguarde ser chamado para sua consulta de telemedicina
          </p>
        </div>

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Queue Information */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Queue Status */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Users className='h-5 w-5' />
                  <span>Status da Fila</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {queueInfo && (
                  <>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-blue-600'>
                          {queueInfo.position}
                        </div>
                        <div className='text-sm text-gray-600'>Sua Posição</div>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-green-600'>
                          {formatWaitTimeEstimate(queueInfo.estimatedWaitTime)}
                        </div>
                        <div className='text-sm text-gray-600'>
                          Tempo Estimado
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-orange-600'>
                          {queueInfo.totalInQueue}
                        </div>
                        <div className='text-sm text-gray-600'>
                          Total na Fila
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-purple-600'>
                          {formatTime(waitingTime)}
                        </div>
                        <div className='text-sm text-gray-600'>
                          Tempo Aguardando
                        </div>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm text-gray-600'>
                        <span>Progresso na fila</span>
                        <span>
                          {Math.round(
                            ((queueInfo.totalInQueue - queueInfo.position + 1)
                              / queueInfo.totalInQueue)
                              * 100,
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={((queueInfo.totalInQueue - queueInfo.position + 1)
                          / queueInfo.totalInQueue)
                          * 100}
                        className='h-2'
                      />
                    </div>

                    <div className='flex justify-between items-center'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={refreshPosition}
                        className='flex items-center space-x-1'
                      >
                        <RefreshCw className='h-4 w-4' />
                        <span>Atualizar</span>
                      </Button>

                      {queueInfo.position <= 3 && (
                        <Alert className='flex-1 ml-4'>
                          <Bell className='h-4 w-4' />
                          <AlertDescription>
                            Você está próximo! Prepare-se para a consulta.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Pre-Consultation Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <CheckCircle className='h-5 w-5' />
                  <span>Preparação para Consulta</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid gap-3'>
                  {/* System Check */}
                  <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          checkResults?.systemCheck
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {checkResults?.systemCheck
                          ? <CheckCircle className='h-4 w-4' />
                          : <Activity className='h-4 w-4' />}
                      </div>
                      <div>
                        <div className='font-medium'>
                          Verificação do Sistema
                        </div>
                        <div className='text-sm text-gray-600'>
                          {checkResults?.systemCheck
                            ? 'Sistema compatível'
                            : 'Verificando compatibilidade...'}
                        </div>
                      </div>
                    </div>
                    {isChecking && <Activity className='h-4 w-4 animate-spin' />}
                  </div>

                  {/* Connection Check */}
                  <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          checkResults?.connectionCheck
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {checkResults?.connectionCheck
                          ? <CheckCircle className='h-4 w-4' />
                          : <Activity className='h-4 w-4' />}
                      </div>
                      <div>
                        <div className='font-medium'>Teste de Conexão</div>
                        <div className='text-sm text-gray-600'>
                          {checkResults?.connectionCheck
                            ? 'Conexão estável'
                            : 'Testando velocidade...'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consent Check */}
                  <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          consent?.given
                            ? 'bg-green-100 text-green-600'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}
                      >
                        {consent?.given
                          ? <CheckCircle className='h-4 w-4' />
                          : <AlertCircle className='h-4 w-4' />}
                      </div>
                      <div>
                        <div className='font-medium'>Consentimento</div>
                        <div className='text-sm text-gray-600'>
                          {consent?.given
                            ? 'Consentimento dado'
                            : 'Aguardando consentimento'}
                        </div>
                      </div>
                    </div>
                    {!consent?.given && (
                      <Button
                        size='sm'
                        onClick={() => setShowConsentDialog(true)}
                        className='ml-2'
                      >
                        Dar Consentimento
                      </Button>
                    )}
                  </div>

                  {/* Symptoms Check */}
                  <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          preConsultationData.symptoms.length > 0
                            ? 'bg-green-100 text-green-600'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}
                      >
                        {preConsultationData.symptoms.length > 0
                          ? <CheckCircle className='h-4 w-4' />
                          : <AlertCircle className='h-4 w-4' />}
                      </div>
                      <div>
                        <div className='font-medium'>Sintomas Informados</div>
                        <div className='text-sm text-gray-600'>
                          {preConsultationData.symptoms.length > 0
                            ? `${preConsultationData.symptoms.length} sintoma(s) reportado(s)`
                            : 'Nenhum sintoma informado'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ready Status */}
                {isPreparationComplete && (
                  <Alert className='bg-green-50 border-green-200'>
                    <CheckCircle className='h-4 w-4 text-green-600' />
                    <AlertDescription className='text-green-800'>
                      Preparação completa! Você está pronto para a consulta.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Emergency Alert */}
            <Card className='border-red-200 bg-red-50'>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2 text-red-700'>
                  <AlertTriangle className='h-5 w-5' />
                  <span>Emergência Médica</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-red-600 text-sm mb-4'>
                  Se você está passando por uma emergência médica, clique no botão abaixo para ser
                  atendido com prioridade máxima.
                </p>
                <Button
                  variant='destructive'
                  onClick={handleEmergencyEscalation}
                  className='w-full'
                >
                  <Heart className='h-4 w-4 mr-2' />
                  Declarar Emergência Médica
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Settings and Actions */}
          <div className='space-y-6'>
            {/* Patient Info */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <User className='h-5 w-5' />
                  <span>Sua Consulta</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='text-center'>
                  <Avatar className='h-16 w-16 mx-auto mb-3'>
                    <AvatarImage src='' />
                    <AvatarFallback className='bg-blue-100 text-blue-600 text-lg'>
                      {waitingRoom.patientName
                        ?.split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase() || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className='font-semibold'>{waitingRoom.patientName}</h3>
                  <p className='text-sm text-gray-600'>
                    Consulta de {waitingRoom.appointmentType}
                  </p>
                </div>

                <Separator />

                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Agendamento:</span>
                    <span>{appointmentId}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Status:</span>
                    <Badge variant='outline' className='text-xs'>
                      {waitingRoom.status}
                    </Badge>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Profissional:</span>
                    <span>{waitingRoom.professionalName || 'A definir'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Button
                  className='w-full'
                  onClick={() => setShowVitalsDialog(true)}
                  variant='outline'
                >
                  <Thermometer className='h-4 w-4 mr-2' />
                  Informar Sinais Vitais
                </Button>

                <Button
                  className='w-full'
                  onClick={() => setShowTriageDialog(true)}
                  variant='outline'
                >
                  <FileText className='h-4 w-4 mr-2' />
                  Pré-Triagem
                </Button>

                <Button
                  className='w-full'
                  onClick={handleConsultationStart}
                  disabled={!isPreparationComplete}
                  variant={isPreparationComplete ? 'default' : 'outline'}
                >
                  <Video className='h-4 w-4 mr-2' />
                  {isPreparationComplete
                    ? 'Entrar na Consulta'
                    : 'Complete a Preparação'}
                </Button>

                <Separator />

                <Button
                  className='w-full'
                  onClick={leaveWaitingRoom}
                  disabled={isLeaving}
                  variant='outline'
                >
                  <LogOut className='h-4 w-4 mr-2' />
                  {isLeaving ? 'Saindo...' : 'Sair da Fila'}
                </Button>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Settings className='h-5 w-5' />
                  <span>Configurações</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    {notificationsEnabled
                      ? <Bell className='h-4 w-4' />
                      : <BellOff className='h-4 w-4' />}
                    <span className='text-sm'>Notificações</span>
                  </div>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    {audioEnabled
                      ? <Volume2 className='h-4 w-4' />
                      : <VolumeX className='h-4 w-4' />}
                    <span className='text-sm'>Áudio</span>
                  </div>
                  <Switch
                    checked={audioEnabled}
                    onCheckedChange={setAudioEnabled}
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2'>
                    {videoEnabled ? <Video className='h-4 w-4' /> : <XCircle className='h-4 w-4' />}
                    <span className='text-sm'>Vídeo</span>
                  </div>
                  <Switch
                    checked={videoEnabled}
                    onCheckedChange={setVideoEnabled}
                  />
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm'>Volume</span>
                    <span className='text-sm text-gray-600'>{volume[0]}%</span>
                  </div>
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={10}
                    className='w-full'
                  />
                </div>
              </CardContent>
            </Card>

            {/* Compliance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                  <Shield className='h-5 w-5' />
                  <span>Conformidade</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>CFM Compliant</span>
                  <Badge
                    variant='outline'
                    className='bg-green-50 text-green-700 border-green-200'
                  >
                    ✓ Ativo
                  </Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>LGPD Compliant</span>
                  <Badge
                    variant='outline'
                    className='bg-green-50 text-green-700 border-green-200'
                  >
                    ✓ Ativo
                  </Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm'>Criptografia E2E</span>
                  <Badge
                    variant='outline'
                    className='bg-green-50 text-green-700 border-green-200'
                  >
                    ✓ Ativo
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Vitals Dialog */}
        <Dialog open={showVitalsDialog} onOpenChange={setShowVitalsDialog}>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>Sinais Vitais</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Pressão Sistólica
                  </label>
                  <input
                    type='number'
                    placeholder='120'
                    className='w-full px-3 py-2 border rounded-lg text-sm'
                    onChange={e => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        setPreConsultationData(prev => ({
                          ...prev,
                          vitalSigns: {
                            ...prev.vitalSigns,
                            bloodPressure: {
                              ...prev.vitalSigns?.bloodPressure,
                              systolic: value,
                              diastolic: prev.vitalSigns?.bloodPressure?.diastolic || 80,
                            },
                          },
                        }));
                      }
                    }}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Pressão Diastólica
                  </label>
                  <input
                    type='number'
                    placeholder='80'
                    className='w-full px-3 py-2 border rounded-lg text-sm'
                    onChange={e => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        setPreConsultationData(prev => ({
                          ...prev,
                          vitalSigns: {
                            ...prev.vitalSigns,
                            bloodPressure: {
                              ...prev.vitalSigns?.bloodPressure,
                              diastolic: value,
                              systolic: prev.vitalSigns?.bloodPressure?.systolic || 120,
                            },
                          },
                        }));
                      }
                    }}
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Frequência Cardíaca
                  </label>
                  <input
                    type='number'
                    placeholder='70'
                    className='w-full px-3 py-2 border rounded-lg text-sm'
                    onChange={e => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        setPreConsultationData(prev => ({
                          ...prev,
                          vitalSigns: { ...prev.vitalSigns, heartRate: value },
                        }));
                      }
                    }}
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Temperatura (°C)
                  </label>
                  <input
                    type='number'
                    step='0.1'
                    placeholder='36.5'
                    className='w-full px-3 py-2 border rounded-lg text-sm'
                    onChange={e => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        setPreConsultationData(prev => ({
                          ...prev,
                          vitalSigns: {
                            ...prev.vitalSigns,
                            temperature: value,
                          },
                        }));
                      }
                    }}
                  />
                </div>
              </div>

              <div className='flex justify-end space-x-2'>
                <Button
                  variant='outline'
                  onClick={() => setShowVitalsDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    handleVitalSignsUpdate(
                      preConsultationData.vitalSigns || {},
                    );
                  }}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Consent Dialog */}
        <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>Consentimento para Telemedicina</DialogTitle>
            </DialogHeader>
            <ScrollArea className='max-h-96'>
              <div className='space-y-4 text-sm'>
                <p>
                  Ao prosseguir com a consulta de telemedicina, você concorda com os seguintes
                  termos:
                </p>
                <ul className='list-disc list-inside space-y-2 text-gray-600'>
                  <li>
                    Entendo que esta é uma consulta médica via telemedicina
                  </li>
                  <li>Confirmo a veracidade das informações fornecidas</li>
                  <li>
                    Autorizo a gravação da sessão para fins médicos e legais
                  </li>
                  <li>
                    Estou ciente dos benefícios e limitações da telemedicina
                  </li>
                  <li>
                    Concordo com o tratamento dos meus dados conforme a LGPD
                  </li>
                </ul>
              </div>
            </ScrollArea>
            <div className='flex justify-end space-x-2'>
              <Button
                variant='outline'
                onClick={() => setShowConsentDialog(false)}
              >
                Recusar
              </Button>
              <Button onClick={handleConsentComplete}>Concordo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default WaitingRoom;
