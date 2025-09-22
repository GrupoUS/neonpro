/**
 * Treatment Progress Tracking (T061)
 * Comprehensive treatment progress tracking system for aesthetic procedures
 *
 * Features:
 * - Visual progress tracking for multiple aesthetic treatment types
 * - Session management with before/after photo comparisons
 * - Treatment timeline with milestones and achievements
 * - Patient satisfaction tracking and feedback collection
 * - Automated progress reports and analytics
 * - Brazilian healthcare compliance with ANVISA regulations
 * - WCAG 2.1 AA+ accessibility compliance
 * - Mobile-first responsive design
 * - Portuguese localization for aesthetic treatment terminology
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, differenceInDays, format, isAfter, isBefore, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Activity,
  AlertTriangle,
  Award,
  Calendar,
  Camera,
  Camera as CameraIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Droplets,
  Edit,
  Eye,
  FileText,
  Film,
  Gauge,
  Heart,
  Image as ImageIcon,
  Info,
  Maximize,
  MessageCircle,
  Mic,
  Minimize,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Scissors,
  Share2,
  Shield,
  Sparkles,
  Star,
  Sun,
  Target,
  Thermometer,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TrendingDown,
  TrendingUp,
  Video,
  Wind,
  XCircle,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HealthcareButton } from '@/components/ui/healthcare/healthcare-button';
import { HealthcareInput } from '@/components/ui/healthcare/healthcare-input';
import { HealthcareLoading } from '@/components/ui/healthcare/healthcare-loading';
import { useScreenReaderAnnouncer } from '@/hooks/accessibility/use-focus-management';
import { useMobileOptimization } from '@/hooks/accessibility/use-mobile-optimization';
import { cn } from '@/lib/utils';

// Brazilian aesthetic treatment types with detailed information
const brazilianAestheticTreatments = {
  injectable: {
    botox: {
      name: 'Toxina Botulínica',
      description: 'Redução de rugas dinâmicas e linhas de expressão',
      duration: 180,
      sessions: 1,
      recovery: '1-2 dias',
      results: '7-14 dias',
      longevity: '4-6 meses',
      icon: Droplets,
      color: 'blue',
      areas: ['Fronte', 'Glabela', 'Pés de galinha', 'Pescoço'],
    },
    filler: {
      name: 'Preenchimento Facial',
      description: 'Restauração de volume e contorno facial',
      duration: 120,
      sessions: 1,
      recovery: '2-3 dias',
      results: 'Imediato',
      longevity: '12-18 meses',
      icon: Sparkles,
      color: 'pink',
      areas: ['Maçãs do rosto', 'Lábios', 'Mandíbula', 'Temporas', 'Nariz'],
    },
  },
  device: {
    laser: {
      name: 'Tratamento a Laser',
      description: 'Rejuvenescimento e tratamento de lesões cutâneas',
      duration: 90,
      sessions: 6,
      recovery: '3-5 dias',
      results: 'Gradativo',
      longevity: '1-2 anos',
      icon: Zap,
      color: 'red',
      areas: ['Face completa', 'Mãos', 'Colo', 'Manchas', 'Cicatrizes'],
    },
    radiofrequency: {
      name: 'Radiofrequência',
      description: 'Estímulo de colágeno e firmeza da pele',
      duration: 90,
      sessions: 8,
      recovery: 'Mínimo',
      results: 'Gradativo',
      longevity: '6-12 meses',
      icon: Thermometer,
      color: 'orange',
      areas: ['Face', 'Pescoço', 'Abdômen', 'Glúteos', 'Coxas'],
    },
    ultrasound: {
      name: 'Ultrasom',
      description: 'Lifting não cirúrgico e estímulo de colágeno',
      duration: 60,
      sessions: 6,
      recovery: 'Mínimo',
      results: 'Gradativo',
      longevity: '6-12 meses',
      icon: Wind,
      color: 'cyan',
      areas: ['Face', 'Pescoço', 'Decote'],
    },
  },
  equipment: {
    hydra: {
      name: 'Hydra Facial',
      description: 'Limpeza profunda e hidratação intensiva',
      duration: 60,
      sessions: 1,
      recovery: 'Mínimo',
      results: 'Imediato',
      longevity: '4-6 semanas',
      icon: Droplets,
      color: 'blue',
      areas: ['Face'],
    },
    microdermabrasion: {
      name: 'Microdermoabrasão',
      description: 'Esfoliação e renovação celular',
      duration: 45,
      sessions: 6,
      recovery: '1-2 dias',
      results: 'Gradativo',
      longevity: '1-3 meses',
      icon: Gauge,
      color: 'purple',
      areas: ['Face', 'Pescoço', 'Mãos'],
    },
  },
  chemical: {
    peeling: {
      name: 'Peeling Químico',
      description: 'Renovação celular e tratamento de manchas',
      duration: 60,
      sessions: 4,
      recovery: '3-7 dias',
      results: 'Gradativo',
      longevity: '3-6 meses',
      icon: Sun,
      color: 'yellow',
      areas: ['Face', 'Mãos', 'Colo'],
    },
  },
};

// Session status types
const sessionStatus = {
  scheduled: { label: 'Agendada', color: 'blue', icon: Calendar },
  completed: { label: 'Concluída', color: 'green', icon: CheckCircle },
  cancelled: { label: 'Cancelada', color: 'red', icon: XCircle },
  missed: { label: 'Não compareceu', color: 'orange', icon: AlertTriangle },
  rescheduled: { label: 'Remarcada', color: 'purple', icon: RotateCcw },
};

// Satisfaction levels
const satisfactionLevels = [
  { value: 5, label: 'Excelente', color: 'green', icon: Star },
  { value: 4, label: 'Muito Bom', color: 'blue', icon: Star },
  { value: 3, label: 'Bom', color: 'yellow', icon: Star },
  { value: 2, label: 'Regular', color: 'orange', icon: Star },
  { value: 1, label: 'Ruim', color: 'red', icon: Star },
];

const sessionNoteSchema = z.object({
  sessionId: z.string().min(1, 'ID da sessão é obrigatório'),
  content: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
  observations: z.string().optional(),
  recommendations: z.string().optional(),
  satisfaction: z.number().min(1).max(5).optional(),
  nextSessionDate: z.string().optional(),
});

const progressPhotoSchema = z.object({
  sessionId: z.string().min(1, 'ID da sessão é obrigatório'),
  type: z.enum(['before', 'after', 'progress']),
  imageUrl: z.string().url('URL da imagem inválida'),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type SessionNote = z.infer<typeof sessionNoteSchema>;
type ProgressPhoto = z.infer<typeof progressPhotoSchema>;

interface TreatmentSession {
  id: string;
  treatmentId: string;
  sessionNumber: number;
  scheduledDate: string;
  completedDate?: string;
  status: keyof typeof sessionStatus;
  providerId: string;
  providerName: string;
  notes?: SessionNote;
  photos?: ProgressPhoto[];
  satisfaction?: number;
  observations?: string;
  recommendations?: string;
}

interface TreatmentProgress {
  id: string;
  patientId: string;
  patientName: string;
  treatmentType:
    | keyof typeof brazilianAestheticTreatments.injectable
    | keyof typeof brazilianAestheticTreatments.device
    | keyof typeof brazilianAestheticTreatments.equipment
    | keyof typeof brazilianAestheticTreatments.chemical;
  treatmentSubtype: string;
  startDate: string;
  expectedEndDate: string;
  totalSessions: number;
  completedSessions: number;
  status: 'planned' | 'in-progress' | 'completed' | 'paused' | 'cancelled';
  progress: number;
  overallSatisfaction: number;
  totalCost: number;
  paidAmount: number;
  sessions: TreatmentSession[];
  milestones: Array<{
    date: string;
    title: string;
    description: string;
    achieved: boolean;
  }>;
  beforePhotos?: string[];
  afterPhotos?: string[];
}

interface TreatmentProgressTrackingProps {
  treatment: TreatmentProgress;
  onUpdateSession: (sessionId: string, updates: Partial<TreatmentSession>) => Promise<void>;
  onAddSessionNote: (note: SessionNote) => Promise<void>;
  onUploadPhoto: (photo: ProgressPhoto) => Promise<void>;
  onUpdateTreatment: (treatmentId: string, updates: Partial<TreatmentProgress>) => Promise<void>;
  onGenerateReport: (treatmentId: string) => Promise<void>;
  onRescheduleSession: (sessionId: string, newDate: string) => Promise<void>;
  className?: string;
  testId?: string;
}

type ViewMode = 'overview' | 'timeline' | 'sessions' | 'photos' | 'analytics' | 'reports';

export const TreatmentProgressTracking: React.FC<TreatmentProgressTrackingProps> = ({
  treatment,onUpdateSession, onAddSessionNote,onUploadPhoto, onUpdateTreatment,onGenerateReport, onRescheduleSession,className, testId = 'treatment-progress-tracking', }) => {
  const [currentView, setCurrentView] = useState<ViewMode>('overview');
  const [selectedSession, setSelectedSession] = useState<TreatmentSession | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [photoViewer, setPhotoViewer] = useState<
    { open: boolean; photos: string[]; currentIndex: number }
  >({
    open: false,
    photos: [],
    currentIndex: 0,
  });

  const { announcePolite } = useScreenReaderAnnouncer();
  const { touchTargetSize } = useMobileOptimization();

  const noteForm = useForm<SessionNote>({
    resolver: zodResolver(sessionNoteSchema),
    defaultValues: {
      sessionId: '',
      content: '',
      observations: '',
      recommendations: '',
      satisfaction: undefined,
      nextSessionDate: '',
    },
  });

  // Get treatment configuration
  const getTreatmentConfig = () => {
    for (const category of Object.values(brazilianAestheticTreatments)) {
      if (category[treatment.treatmentSubtype as keyof typeof category]) {
        return category[treatment.treatmentSubtype as keyof typeof category];
      }
    }
    return null;
  };

  const treatmentConfig = getTreatmentConfig();

  // Calculate progress statistics
  const progressStats = useMemo(() => {
    const completedSessions = treatment.sessions.filter(s => s.status === 'completed');
    const avgSatisfaction = completedSessions.length > 0
      ? completedSessions.reduce((sum, session) => sum + (session.satisfaction || 0), 0)
        / completedSessions.length
      : 0;

    const adherenceRate = treatment.completedSessions / treatment.totalSessions;
    const daysPassed = differenceInDays(new Date(), new Date(treatment.startDate));
    const expectedDays = differenceInDays(
      new Date(treatment.expectedEndDate),
      new Date(treatment.startDate),
    );
    const timeProgress = daysPassed / expectedDays;
    const progressEfficiency = treatment.progress / Math.max(timeProgress * 100, 1);

    return {
      avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
      adherenceRate: Math.round(adherenceRate * 100),
      progressEfficiency: Math.round(progressEfficiency * 100),
      daysRemaining: Math.max(0, differenceInDays(new Date(treatment.expectedEndDate), new Date())),
      nextSession: treatment.sessions
        .filter(s => s.status === 'scheduled')
        .sort((a, b) =>
          new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
        )[0],
    };
  }, [treatment]);

  // Handle session status update
  const handleUpdateSessionStatus = useCallback(
    async (sessionId: string, status: keyof typeof sessionStatus) => {
      setIsLoading(true);
      setError(null);

      try {
        announcePolite(`Atualizando status da sessão para ${sessionStatus[status].label}...`);
        await onUpdateSession(sessionId, { status });

        if (status === 'completed') {
          setSuccess(true);
          announcePolite('Sessão marcada como concluída com sucesso');
          setTimeout(() => setSuccess(false), 3000);
        }
      } catch (_err) {
        const errorMessage = err instanceof Error
          ? err.message
          : 'Erro ao atualizar status da sessão';
        setError(errorMessage);
        announcePolite(`Erro ao atualizar status: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    },
    [onUpdateSession, announcePolite],
  );

  // Handle adding session note
  const handleAddNote = useCallback(async (data: SessionNote) => {
    setIsLoading(true);
    setError(null);

    try {
      announcePolite('Adicionando nota à sessão...');
      await onAddSessionNote(data);
      noteForm.reset();
      setIsAddingNote(false);
      setSuccess(true);
      announcePolite('Nota adicionada com sucesso');
      setTimeout(() => setSuccess(false), 3000);
    } catch (_err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar nota';
      setError(errorMessage);
      announcePolite(`Erro ao adicionar nota: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [onAddSessionNote, noteForm, announcePolite]);

  // Handle photo upload
  const handlePhotoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedSession) return;

    setIsUploadingPhoto(true);
    setError(null);

    try {
      announcePolite('Enviando foto...');

      // Simulate photo upload - in real app, this would upload to cloud storage
      const mockPhoto: ProgressPhoto = {
        sessionId: selectedSession.id,
        type: 'progress',
        imageUrl: URL.createObjectURL(file),
        caption: `Foto da sessão ${selectedSession.sessionNumber}`,
        tags: [],
      };

      await onUploadPhoto(mockPhoto);
      announcePolite('Foto enviada com sucesso');

      // Reset file input
      event.target.value = '';
    } catch (_err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar foto';
      setError(errorMessage);
      announcePolite(`Erro ao enviar foto: ${errorMessage}`);
    } finally {
      setIsUploadingPhoto(false);
    }
  }, [selectedSession, onUploadPhoto, announcePolite]);

  // Handle photo viewer
  const openPhotoViewer = useCallback((photos: string[], startIndex = 0) => {
    setPhotoViewer({ open: true, photos, currentIndex: startIndex });
    announcePolite('Visualizador de fotos aberto');
  }, [announcePolite]);

  const closePhotoViewer = useCallback(() => {
    setPhotoViewer({ open: false, photos: [], currentIndex: 0 });
    announcePolite('Visualizador de fotos fechado');
  }, [announcePolite]);

  // Render progress overview
  const renderOverview = () => (
    <div className='space-y-6'>
      {/* Treatment Header */}
      <div className='bg-white border rounded-lg p-6'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex-1'>
            <div className='flex items-center space-x-3 mb-2'>
              {treatmentConfig && (
                <div className={`p-2 rounded-lg bg-${treatmentConfig.color}-100`}>
                  <treatmentConfig.icon className='h-6 w-6 text-${treatmentConfig.color}-600' />
                </div>
              )}
              <div>
                <h2 className='text-xl font-bold'>{treatmentConfig?.name}</h2>
                <p className='text-sm text-muted-foreground'>{treatmentConfig?.description}</p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Progresso Geral</p>
                <div className='flex items-center space-x-2'>
                  <div className='flex-1 bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-green-500 h-2 rounded-full transition-all duration-300'
                      style={{ width: `${treatment.progress}%` }}
                    />
                  </div>
                  <span className='text-sm font-medium'>{treatment.progress}%</span>
                </div>
              </div>

              <div>
                <p className='text-sm text-muted-foreground'>Sessões</p>
                <p className='text-lg font-semibold'>
                  {treatment.completedSessions} / {treatment.totalSessions}
                </p>
              </div>

              <div>
                <p className='text-sm text-muted-foreground'>Status</p>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    treatment.status === 'completed' && 'bg-green-100 text-green-800',
                    treatment.status === 'in-progress' && 'bg-blue-100 text-blue-800',
                    treatment.status === 'paused' && 'bg-yellow-100 text-yellow-800',
                    treatment.status === 'cancelled' && 'bg-red-100 text-red-800',
                  )}
                >
                  {treatment.status === 'completed' && 'Concluído'}
                  {treatment.status === 'in-progress' && 'Em Andamento'}
                  {treatment.status === 'paused' && 'Pausado'}
                  {treatment.status === 'cancelled' && 'Cancelado'}
                </span>
              </div>
            </div>
          </div>

          <div className='text-right'>
            <p className='text-sm text-muted-foreground'>Valor Total</p>
            <p className='text-2xl font-bold text-green-600'>
              R$ {treatment.totalCost.toLocaleString()}
            </p>
            <p className='text-sm text-muted-foreground'>
              Pago: R$ {treatment.paidAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white border rounded-lg p-4'>
          <div className='flex items-center space-x-2 mb-2'>
            <Star className='h-5 w-5 text-yellow-500' />
            <span className='text-sm font-medium'>Satisfação Média</span>
          </div>
          <p className='text-2xl font-bold text-yellow-600'>
            {progressStats.avgSatisfaction}/5.0
          </p>
          <div className='flex space-x-1 mt-1'>
            {[1, 2, 3, 4, 5].map(rating => (
              <Star
                key={rating}
                className={cn(
                  'h-4 w-4',
                  rating <= Math.round(progressStats.avgSatisfaction)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300',
                )}
              />
            ))}
          </div>
        </div>

        <div className='bg-white border rounded-lg p-4'>
          <div className='flex items-center space-x-2 mb-2'>
            <Target className='h-5 w-5 text-blue-500' />
            <span className='text-sm font-medium'>Adesão ao Tratamento</span>
          </div>
          <p className='text-2xl font-bold text-blue-600'>{progressStats.adherenceRate}%</p>
          <div className='flex items-center space-x-1 mt-1'>
            {progressStats.adherenceRate >= 80
              ? <TrendingUp className='h-4 w-4 text-green-500' />
              : <TrendingDown className='h-4 w-4 text-red-500' />}
            <span className='text-xs text-muted-foreground'>
              {progressStats.adherenceRate >= 80 ? 'Excelente' : 'Precisa melhorar'}
            </span>
          </div>
        </div>

        <div className='bg-white border rounded-lg p-4'>
          <div className='flex items-center space-x-2 mb-2'>
            <Activity className='h-5 w-5 text-purple-500' />
            <span className='text-sm font-medium'>Eficiência do Progresso</span>
          </div>
          <p className='text-2xl font-bold text-purple-600'>{progressStats.progressEfficiency}%</p>
          <div className='flex items-center space-x-1 mt-1'>
            <Clock className='h-4 w-4 text-gray-400' />
            <span className='text-xs text-muted-foreground'>
              {progressStats.daysRemaining} dias restantes
            </span>
          </div>
        </div>

        <div className='bg-white border rounded-lg p-4'>
          <div className='flex items-center space-x-2 mb-2'>
            <Calendar className='h-5 w-5 text-green-500' />
            <span className='text-sm font-medium'>Próxima Sessão</span>
          </div>
          {progressStats.nextSession
            ? (
              <div>
                <p className='text-lg font-bold text-green-600'>
                  {format(new Date(progressStats.nextSession.scheduledDate), 'dd/MM', {
                    locale: ptBR,
                  })}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {format(new Date(progressStats.nextSession.scheduledDate), 'HH:mm', {
                    locale: ptBR,
                  })}
                </p>
              </div>
            )
            : <p className='text-sm text-muted-foreground'>Nenhuma sessão agendada</p>}
        </div>
      </div>

      {/* Treatment Information */}
      {treatmentConfig && (
        <div className='bg-white border rounded-lg p-6'>
          <h3 className='text-lg font-semibold mb-4'>Informações do Tratamento</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h4 className='font-medium mb-3'>Características</h4>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>Duração por sessão:</span>
                  <span className='text-sm font-medium'>{treatmentConfig.duration} minutos</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>Recuperação:</span>
                  <span className='text-sm font-medium'>{treatmentConfig.recovery}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>Resultados:</span>
                  <span className='text-sm font-medium'>{treatmentConfig.results}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-muted-foreground'>Duração:</span>
                  <span className='text-sm font-medium'>{treatmentConfig.longevity}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className='font-medium mb-3'>Áreas Tratadas</h4>
              <div className='flex flex-wrap gap-2'>
                {treatmentConfig.areas.map((area, index) => (
                  <span
                    key={index}
                    className='text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full'
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestones */}
      {treatment.milestones.length > 0 && (<div className='bg-white border rounded-lg p-6'>
          <h3 className='text-lg font-semibold mb-4'>Marcos do Tratamento</h3>
          <div className='space-y-3'>
            {treatment.milestones.map((milestone, index) => (
              <div key={index} className='flex items-center space-x-3 p-3 border rounded-lg'>
                <div
                  className={cn(
                    'p-1 rounded-full',
                    milestone.achieved ? 'bg-green-100' : 'bg-gray-100',
                  )}
                >
                  {milestone.achieved
                    ? <CheckCircle className='h-5 w-5 text-green-600' />
                    : <Clock className='h-5 w-5 text-gray-400' />}
                </div>
                <div className='flex-1'>
                  <h4 className='font-medium text-sm'>{milestone.title}</h4>
                  <p className='text-xs text-muted-foreground'>{milestone.description}</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {format(new Date(milestone.date), 'dd \'de\' MMMM \'de\' yyyy', {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render sessions timeline
  const renderSessionsTimeline = () => (<div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Linha do Tempo das Sessões</h3>
        <HealthcareButton onClick={() => {}} size='sm'>
          <Plus className='h-4 w-4 mr-2' />
          Nova Sessão
        </HealthcareButton>
      </div>

      <div className='relative'>
        {/* Timeline line */}
        <div className='absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200' />

        <div className='space-y-6'>
          {treatment.sessions
            .sort((a, b) =>
              new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
            )
            .map((session, index) => {
              const statusConfig = sessionStatus[session.status];
              const StatusIcon = statusConfig.icon;

              return (
                <div key={session.id} className='relative flex items-start space-x-6'>
                  {/* Timeline marker */}
                  <div
                    className={cn(
                      'relative z-10 w-16 h-16 rounded-full border-4 border-white flex items-center justify-center',
                      session.status === 'completed' && 'bg-green-500',
                      session.status === 'scheduled' && 'bg-blue-500',
                      session.status === 'in-progress' && 'bg-purple-500',
                      session.status === 'cancelled' && 'bg-red-500',
                      session.status === 'missed' && 'bg-orange-500',
                      session.status === 'rescheduled' && 'bg-yellow-500',
                    )}
                  >
                    <StatusIcon className='h-6 w-6 text-white' />
                  </div>

                  {/* Session content */}
                  <div className='flex-1 bg-white border rounded-lg p-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <div>
                        <h4 className='font-semibold'>Sessão {session.sessionNumber}</h4>
                        <p className='text-sm text-muted-foreground'>
                          {format(
                            new Date(session.scheduledDate),
                            'dd \'de\' MMMM \'de\' yyyy \'às\' HH:mm',
                            { locale: ptBR },
                          )}
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          Profissional: {session.providerName}
                        </p>
                      </div>

                      <div className='flex items-center space-x-2'>
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            session.status === 'completed' && 'bg-green-100 text-green-800',
                            session.status === 'scheduled' && 'bg-blue-100 text-blue-800',
                            session.status === 'in-progress' && 'bg-purple-100 text-purple-800',
                            session.status === 'cancelled' && 'bg-red-100 text-red-800',
                            session.status === 'missed' && 'bg-orange-100 text-orange-800',
                            session.status === 'rescheduled' && 'bg-yellow-100 text-yellow-800',
                          )}
                        >
                          <StatusIcon className='h-3 w-3 mr-1' />
                          {statusConfig.label}
                        </span>

                        <HealthcareButton
                          variant='ghost'
                          size='sm'
                          onClick={() => setSelectedSession(session)}
                        >
                          <MoreVertical className='h-4 w-4' />
                        </HealthcareButton>
                      </div>
                    </div>

                    {session.completedDate && (
                      <div className='flex items-center space-x-4 text-sm text-muted-foreground mb-3'>
                        <span>
                          Concluída em:{' '}
                          {format(new Date(session.completedDate), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                        {session.satisfaction && (
                          <div className='flex items-center space-x-1'>
                            {[1, 2, 3, 4, 5].map(rating => (
                              <Star
                                key={rating}
                                className={cn(
                                  'h-4 w-4',
                                  rating <= session.satisfaction
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300',
                                )}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {session.notes && (
                      <div className='bg-gray-50 p-3 rounded-lg'>
                        <p className='text-sm'>{session.notes.content}</p>
                        {session.notes.recommendations && (
                          <p className='text-sm text-muted-foreground mt-2'>
                            <strong>Recomendações:</strong> {session.notes.recommendations}
                          </p>
                        )}
                      </div>
                    )}

                    {session.photos && session.photos.length > 0 && (
                      <div className='mt-3'>
                        <p className='text-sm font-medium mb-2'>Fotos da sessão</p>
                        <div className='flex space-x-2'>
                          {session.photos.slice(0, 3).map((photo, photoIndex) => (<button
                              key={photoIndex}
                              onClick={() => openPhotoViewer([photo.imageUrl], photoIndex)}
                              className='relative w-16 h-16 rounded-lg overflow-hidden border'
                            >
                              <img
                                src={photo.imageUrl}
                                alt={photo.caption}
                                className='w-full h-full object-cover'
                              />
                              <div className='absolute inset-0 bg-black/20 flex items-center justify-center'>
                                <Eye className='h-4 w-4 text-white' />
                              </div>
                            </button>
                          ))}
                          {session.photos.length > 3 && (
                            <button className='w-16 h-16 rounded-lg border flex items-center justify-center text-sm text-muted-foreground'>
                              +{session.photos.length - 3}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Session actions */}
                    <div className='flex space-x-2 mt-4'>
                      {session.status === 'scheduled' && (<>
                          <HealthcareButton
                            variant='outline'
                            size='sm'
                            onClick={() => handleUpdateSessionStatus(session.id, 'in-progress')}
                            healthcareContext='treatment-progress'
                            accessibilityAction='start-session'
                          >
                            <Play className='h-4 w-4 mr-1' />
                            Iniciar
                          </HealthcareButton>
                          <HealthcareButton
                            variant='outline'
                            size='sm'
                            onClick={() => {}}
                            healthcareContext='treatment-progress'
                            accessibilityAction='reschedule'
                          >
                            <RotateCcw className='h-4 w-4 mr-1' />
                            Remarcar
                          </HealthcareButton>
                        </>
                      )}

                      {session.status === 'in-progress' && (<HealthcareButton
                          variant='outline'
                          size='sm'
                          onClick={() => handleUpdateSessionStatus(session.id, 'completed')}
                          healthcareContext='treatment-progress'
                          accessibilityAction='complete-session'
                        >
                          <CheckCircle className='h-4 w-4 mr-1' />
                          Concluir
                        </HealthcareButton>
                      )}

                      <HealthcareButton
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setSelectedSession(session);
                          setIsAddingNote(true);
                        }}
                        healthcareContext='treatment-progress'
                        accessibilityAction='add-note'
                      >
                        <MessageCircle className='h-4 w-4 mr-1' />
                        Nota
                      </HealthcareButton>

                      <input
                        type='file'
                        id={`photo-upload-${session.id}`}
                        onChange={handlePhotoUpload}
                        className='hidden'
                        accept='image/*'
                      />
                      <HealthcareButton
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setSelectedSession(session);
                          document.getElementById(`photo-upload-${session.id}`)?.click();
                        }}
                        healthcareContext='treatment-progress'
                        accessibilityAction='upload-photo'
                      >
                        <Camera className='h-4 w-4 mr-1' />
                        Foto
                      </HealthcareButton>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );

  // Render photos gallery
  const renderPhotosGallery = () => {
    const allPhotos = treatment.sessions.flatMap(session =>
      (session.photos || []).map(photo => ({
        ...photo,
        sessionNumber: session.sessionNumber,
        sessionDate: session.scheduledDate,
      }))
    ).sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());

    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-semibold'>Galeria de Fotos</h3>
          <div className='flex space-x-2'>
            <HealthcareButton variant='outline' size='sm'>
              <Download className='h-4 w-4 mr-2' />
              Baixar Todas
            </HealthcareButton>
            <HealthcareButton variant='outline' size='sm'>
              <Share2 className='h-4 w-4 mr-2' />
              Compartilhar
            </HealthcareButton>
          </div>
        </div>

        {allPhotos.length === 0
          ? (
            <div className='text-center py-12'>
              <CameraIcon className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
              <p className='text-muted-foreground'>Nenhuma foto disponível</p>
              <p className='text-sm text-muted-foreground mt-2'>
                Adicione fotos para acompanhar o progresso do tratamento
              </p>
            </div>
          )
          : (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {allPhotos.map((photo, index) => (<div key={index} className='relative group'>
                  <button
                    onClick={() => openPhotoViewer(allPhotos.map(p => p.imageUrl), index)}
                    className='relative w-full aspect-square rounded-lg overflow-hidden border'
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption}
                      className='w-full h-full object-cover'
                    />
                    <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                      <Eye className='h-6 w-6 text-white' />
                    </div>
                  </button>

                  <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2'>
                    <p className='text-xs text-white font-medium'>
                      Sessão {photo.sessionNumber}
                    </p>
                    <p className='text-xs text-white/80'>
                      {format(new Date(photo.sessionDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                    {photo.caption && (
                      <p className='text-xs text-white/80 truncate'>{photo.caption}</p>
                    )}
                  </div>

                  <div className='absolute top-2 right-2'>
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded-full',
                        photo.type === 'before' && 'bg-blue-100 text-blue-800',
                        photo.type === 'after' && 'bg-green-100 text-green-800',
                        photo.type === 'progress' && 'bg-purple-100 text-purple-800',
                      )}
                    >
                      {photo.type === 'before' && 'Antes'}
                      {photo.type === 'after' && 'Depois'}
                      {photo.type === 'progress' && 'Progresso'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    );
  };

  // Render analytics
  const renderAnalytics = () => (
    <div className='space-y-6'>
      <h3 className='text-lg font-semibold'>Análise do Tratamento</h3>

      {/* Progress chart */}
      <div className='bg-white border rounded-lg p-6'>
        <h4 className='font-medium mb-4'>Evolução do Progresso</h4>
        <div className='h-64 flex items-center justify-center text-muted-foreground'>
          <LineChart className='h-16 w-16 mb-2' />
          <p>Gráfico de evolução (em desenvolvimento)</p>
        </div>
      </div>

      {/* Satisfaction trends */}
      <div className='bg-white border rounded-lg p-6'>
        <h4 className='font-medium mb-4'>Tendência de Satisfação</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-muted-foreground'>Satisfação por Sessão</span>
              <span className='text-sm font-medium'>{progressStats.avgSatisfaction}/5.0</span>
            </div>
            <div className='space-y-2'>
              {treatment.sessions
                .filter(s => s.status === 'completed' && s.satisfaction)
                .map(session => (
                  <div key={session.id} className='flex items-center justify-between'>
                    <span className='text-sm'>Sessão {session.sessionNumber}</span>
                    <div className='flex space-x-1'>
                      {[1, 2, 3, 4, 5].map(rating => (
                        <Star
                          key={rating}
                          className={cn(
                            'h-3 w-3',
                            rating <= (session.satisfaction || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300',
                          )}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm text-muted-foreground'>Taxa de Conclusão</span>
              <span className='text-sm font-medium'>{progressStats.adherenceRate}%</span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-3'>
              <div
                className='bg-blue-500 h-3 rounded-full transition-all duration-300'
                style={{ width: `${progressStats.adherenceRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function for useMemo
  function useMemo<T>(factory: () => T, deps: any[]): T {
    const [memoized, setMemoized] = React.useState<T>(factory());
    React.useEffect(() => {
      setMemoized(factory());
    }, deps);
    return memoized;
  }

  return (
    <div className={cn('w-full max-w-7xl mx-auto p-6', className)} data-testid={testId}>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>Acompanhamento de Tratamento</h1>
            <p className='text-muted-foreground'>
              {treatment.patientName} - {treatmentConfig?.name}
            </p>
          </div>

          <div className='flex space-x-3'>
            <HealthcareButton variant='outline' onClick={() => onGenerateReport(treatment.id)}>
              <Download className='h-4 w-4 mr-2' />
              Relatório
            </HealthcareButton>
            <HealthcareButton variant='outline'>
              <Share2 className='h-4 w-4 mr-2' />
              Compartilhar
            </HealthcareButton>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          className='mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg'
          role='alert'
        >
          <p className='text-sm text-destructive font-medium'>{error}</p>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg' role='status'>
          <p className='text-sm text-green-800 font-medium'>Operação realizada com sucesso!</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className='border-b mb-6'>
        <nav className='flex space-x-8' role='tablist'>
          {[
            { id: 'overview', label: 'Visão Geral', icon: Activity },
            { id: 'sessions', label: 'Sessões', icon: Calendar },
            { id: 'photos', label: 'Fotos', icon: Camera },
            { id: 'analytics', label: 'Análise', icon: BarChart3 },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as ViewMode)}
                className={cn(
                  'py-2 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2',
                  currentView === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300',
                )}
                role='tab'
                aria-selected={currentView === tab.id}
                aria-controls={`${tab.id}-panel`}
              >
                <Icon className='h-4 w-4' />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <HealthcareLoading
            variant='spinner'
            size='lg'
            text='Processando...'
            healthcareContext='treatment-progress'
          />
        </div>
      )}

      {/* Content */}
      <div className='space-y-6'>
        {currentView === 'overview' && renderOverview()}
        {currentView === 'sessions' && renderSessionsTimeline()}
        {currentView === 'photos' && renderPhotosGallery()}
        {currentView === 'analytics' && renderAnalytics()}
      </div>

      {/* Add Note Modal */}
      {isAddingNote && selectedSession && (<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>
                Adicionar Nota - Sessão {selectedSession.sessionNumber}
              </h3>
              <HealthcareButton
                variant='ghost'
                size='sm'
                onClick={() => setIsAddingNote(false)}
                healthcareContext='treatment-progress'
                accessibilityAction='close'
              >
                <X className='h-4 w-4' />
              </HealthcareButton>
            </div>

            <form onSubmit={noteForm.handleSubmit(handleAddNote)} className='space-y-4'>
              <input type='hidden' {...noteForm.register('sessionId')} value={selectedSession.id} />

              <div>
                <label htmlFor='noteContent' className='block text-sm font-medium mb-1'>
                  Conteúdo da Nota *
                </label>
                <HealthcareInput
                  id='noteContent'
                  {...noteForm.register('content')}
                  type='textarea'
                  rows={4}
                  placeholder='Descreva os detalhes da sessão, procedimentos realizados, etc...'
                  healthcareContext='treatment-progress'
                  accessibilityAction='input'
                  aria-required='true'
                />
              </div>

              <div>
                <label htmlFor='observations' className='block text-sm font-medium mb-1'>
                  Observações
                </label>
                <HealthcareInput
                  id='observations'
                  {...noteForm.register('observations')}
                  placeholder='Observações adicionais...'
                  healthcareContext='treatment-progress'
                  accessibilityAction='input'
                />
              </div>

              <div>
                <label htmlFor='recommendations' className='block text-sm font-medium mb-1'>
                  Recomendações
                </label>
                <HealthcareInput
                  id='recommendations'
                  {...noteForm.register('recommendations')}
                  placeholder='Recomendações para o paciente...'
                  healthcareContext='treatment-progress'
                  accessibilityAction='input'
                />
              </div>

              <div>
                <label htmlFor='satisfaction' className='block text-sm font-medium mb-1'>
                  Satisfação do Paciente
                </label>
                <HealthcareInput
                  id='satisfaction'
                  {...noteForm.register('satisfaction', { valueAsNumber: true })}
                  type='select'
                  options={[
                    { value: '', label: 'Selecione...' },
                    ...satisfactionLevels.map(level => ({
                      value: level.value.toString(),
                      label: level.label,
                    })),
                  ]}
                  healthcareContext='treatment-progress'
                  accessibilityAction='select'
                />
              </div>

              <div className='flex space-x-3'>
                <HealthcareButton
                  type='button'
                  variant='outline'
                  onClick={() => setIsAddingNote(false)}
                  healthcareContext='treatment-progress'
                  accessibilityAction='cancel'
                  className='flex-1'
                >
                  Cancelar
                </HealthcareButton>
                <HealthcareButton
                  type='submit'
                  disabled={isLoading}
                  healthcareContext='treatment-progress'
                  accessibilityAction='submit'
                  className='flex-1'
                >
                  {isLoading ? 'Salvando...' : 'Salvar Nota'}
                </HealthcareButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {photoViewer.open && (
        <div className='fixed inset-0 bg-black/90 flex items-center justify-center z-50'>
          <div className='relative max-w-4xl max-h-[90vh]'>
            {/* Close button */}
            <HealthcareButton
              variant='ghost'
              size='sm'
              onClick={closePhotoViewer}
              className='absolute top-4 right-4 z-10 text-white hover:bg-white/20'
              healthcareContext='treatment-progress'
              accessibilityAction='close'
            >
              <X className='h-6 w-6' />
            </HealthcareButton>

            {/* Photo */}
            <img
              src={photoViewer.photos[photoViewer.currentIndex]}
              alt={`Foto ${photoViewer.currentIndex + 1} de ${photoViewer.photos.length}`}
              className='max-w-full max-h-[90vh] object-contain'
            />

            {/* Navigation */}
            {photoViewer.photos.length > 1 && (
              <>
                <HealthcareButton
                  variant='ghost'
                  size='sm'
                  onClick={() =>
                    setPhotoViewer(prev => ({
                      ...prev,
                      currentIndex: (prev.currentIndex - 1 + prev.photos.length)
                        % prev.photos.length,
                    }))}
                  className='absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20'
                  healthcareContext='treatment-progress'
                  accessibilityAction='previous-photo'
                >
                  <ChevronLeft className='h-8 w-8' />
                </HealthcareButton>

                <HealthcareButton
                  variant='ghost'
                  size='sm'
                  onClick={() =>
                    setPhotoViewer(prev => ({
                      ...prev,
                      currentIndex: (prev.currentIndex + 1) % prev.photos.length,
                    }))}
                  className='absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20'
                  healthcareContext='treatment-progress'
                  accessibilityAction='next-photo'
                >
                  <ChevronRight className='h-8 w-8' />
                </HealthcareButton>
              </>
            )}

            {/* Photo counter */}
            <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm'>
              {photoViewer.currentIndex + 1} / {photoViewer.photos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

TreatmentProgressTracking.displayName = 'TreatmentProgressTracking';

export default TreatmentProgressTracking;
