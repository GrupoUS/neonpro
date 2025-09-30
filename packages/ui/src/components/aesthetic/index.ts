/**
 * NeonPro Aesthetic Components
 * 
 * Premium UI components for aesthetic clinics in Brazil
 * WCAG 2.1 AA+ compliant with Brazilian Portuguese localization
 */

// Consultation Components
export {
  ConsultationNotification,
  ConsultationNotificationManager,
  type ConsultationNotificationProps,
  type ConsultationNotificationData
} from './consultation/consultation-notification'

// Client Components  
export {
  VIPClientStatus,
  type VIPClientStatusProps
} from './client/client-vip-status'

// Treatment Components
export {
  TreatmentProgress,
  type TreatmentProgressProps,
  type TreatmentStep
} from './treatments/treatment-progress'

// Wellness Components
export {
  WellnessTracker,
  type WellnessTrackerProps,
  type WellnessMetrics,
  type WellnessGoal,
  type WellnessReminder
} from './wellness/wellness-tracker'

// Component Categories for Organization
export const AestheticComponents = {
  consultation: {
    ConsultationNotification,
    ConsultationNotificationManager
  },
  client: {
    VIPClientStatus
  },
  treatments: {
    TreatmentProgress
  },
  wellness: {
    WellnessTracker
  }
} as const

// NeonPro Brand Colors for Aesthetic Components
export const NEONPRO_COLORS = {
  primary: '#AC9469',      // Golden Primary - Aesthetic Luxury
  deepBlue: '#112031',     // Healthcare Professional - Trust & Reliability
  accent: '#D2AA60',       // Gold Accent - Premium Services
  neutral: '#B4AC9C',      // Calming Light Beige
  background: '#D2D0C8',   // Soft Gray Background
  wellness: '#E8D5B7',     // Soft wellness tone
  luxury: '#B8860B',       // Gold luxury accent
  purpleAccent: '#9B7EBD', // Soft purple for elegance
} as const

// Brazilian Portuguese Labels
export const AESTHETIC_LABELS = {
  consultation: 'Consulta',
  treatment: 'Tratamento',
  client: 'Cliente',
  wellness: 'Bem-Estar',
  aesthetic: 'Estética',
  beauty: 'Beleza',
  premium: 'Premium',
  vip: 'VIP',
  satisfaction: 'Satisfação',
  progress: 'Progresso',
  schedule: 'Agendamento',
  before: 'Antes',
  after: 'Depois',
  results: 'Resultados'
} as const

// Treatment Categories for Brazilian Aesthetic Clinics
export const TREATMENT_CATEGORIES = {
  facial: 'Facial',
  corporal: 'Corporal', 
  injetaveis: 'Injetáveis',
  laser: 'Laser',
  preenchimento: 'Preenchimento',
  toxina: 'Toxina Botulínica',
  fios: 'Fios de Sustentação',
  peeling: 'Peeling',
  limpeza: 'Limpeza de Pele',
  hidratacao: 'Hidratação',
  rejuvenescimento: 'Rejuvenescimento',
  estrias: 'Estrias',
  celulite: 'Celulite',
  gordura_localizada: 'Gordura Localizada'
} as const

// VIP Levels for Brazilian Aesthetic Clinics
export const VIP_LEVELS = {
  silver: {
    name: 'Silver',
    benefits: ['10% desconto', 'Atendimento prioritário', 'Produtos exclusivos'],
    minSpent: 5000
  },
  gold: {
    name: 'Gold', 
    benefits: ['15% desconto', 'Acesso VIP', 'Tratamentos exclusivos', 'Consultor pessoal'],
    minSpent: 15000
  },
  platinum: {
    name: 'Platinum',
    benefits: ['20% desconto', 'Serviço concierge', 'Eventos exclusivos', 'Tratamentos premium'],
    minSpent: 30000
  },
  diamond: {
    name: 'Diamond',
    benefits: ['25% desconto', 'Acesso irrestrito', 'Experiências personalizadas', 'Clínica privada'],
    minSpent: 50000
  }
} as const

// Accessibility Constants for Aesthetic Components
export const AESTHETIC_ACCESSIBILITY = {
  // ARIA Labels
  consultationNotification: 'Notificação de consulta estética',
  vipClientStatus: 'Status de cliente VIP',
  treatmentProgress: 'Progresso do tratamento estético',
  wellnessTracker: 'Painel de bem-estar e saúde da pele',
  
  // Screen Reader Messages
  newConsultation: 'Nova solicitação de consulta recebida',
  vipArrival: 'Cliente VIP chegou à clínica',
  treatmentStarted: 'Tratamento iniciado',
  treatmentCompleted: 'Tratamento concluído com sucesso',
  wellnessImproved: 'Métricas de bem-estar melhoraram',
  
  // Keyboard Navigation
  focusVisible: 'ring-2 ring-purple-500 ring-offset-2',
  highContrast: 'border-2 border-black',
  reducedMotion: 'transition-none'
} as const

// Animation Presets for Aesthetic Components
export const AESTHETIC_ANIMATIONS = {
  // Gentle animations for relaxation
  pulse: 'animate-pulse',
  fadeIn: 'animate-in fade-in duration-300',
  slideUp: 'animate-in slide-in-from-bottom duration-300',
  
  // Luxury animations for VIP elements
  sparkle: 'animate-pulse shadow-lg',
  glow: 'animate-pulse ring-2 ring-yellow-400 ring-opacity-50',
  shimmer: 'bg-gradient-to-r from-transparent via-white to-transparent bg-[length:200%_100%] animate-shimmer',
  
  // Smooth transitions for tablet use
  smooth: 'transition-all duration-300 ease-in-out',
  gentle: 'transition-all duration-500 ease-out',
  elegant: 'transition-all duration-200 ease-in-out'
} as const

export default {
  ConsultationNotification,
  ConsultationNotificationManager,
  VIPClientStatus,
  TreatmentProgress,
  WellnessTracker,
  NEONPRO_COLORS,
  AESTHETIC_LABELS,
  TREATMENT_CATEGORIES,
  VIP_LEVELS,
  AESTHETIC_ACCESSIBILITY,
  AESTHETIC_ANIMATIONS
}