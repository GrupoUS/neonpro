/**
 * Healthcare Design Tokens - TweakCN NEONPRO
 * Specialized tokens for Brazilian healthcare workflows
 * WCAG 2.1 AA+ accessibility compliant
 */

// Patient Priority Levels
export const patientPriority = {
  emergency: {
    color: '#dc2626',
    background: '#fef2f2',
    border: '#fecaca',
    icon: 'AlertTriangle',
    label: 'Emergência',
    order: 1,
  },
  urgent: {
    color: '#ea580c',
    background: '#fff7ed',
    border: '#fed7aa',
    icon: 'Clock',
    label: 'Urgente',
    order: 2,
  },
  routine: {
    color: '#0891b2',
    background: '#f0f9ff',
    border: '#bae6fd',
    icon: 'Calendar',
    label: 'Rotina',
    order: 3,
  },
  followup: {
    color: '#7c3aed',
    background: '#faf5ff',
    border: '#ddd6fe',
    icon: 'RotateCcw',
    label: 'Retorno',
    order: 4,
  },
} as const;

// Appointment Status
export const appointmentStatus = {
  scheduled: {
    color: '#0891b2',
    background: '#f0f9ff',
    border: '#bae6fd',
    label: 'Agendado',
  },
  confirmed: {
    color: '#059669',
    background: '#f0fdf4',
    border: '#bbf7d0',
    label: 'Confirmado',
  },
  inProgress: {
    color: '#d97706',
    background: '#fffbeb',
    border: '#fde68a',
    label: 'Em Andamento',
  },
  completed: {
    color: '#059669',
    background: '#f0fdf4',
    border: '#bbf7d0',
    label: 'Concluído',
  },
  cancelled: {
    color: '#dc2626',
    background: '#fef2f2',
    border: '#fecaca',
    label: 'Cancelado',
  },
  noShow: {
    color: '#7c2d12',
    background: '#fef7ff',
    border: '#f3e8ff',
    label: 'Não Compareceu',
  },
  rescheduled: {
    color: '#7c3aed',
    background: '#faf5ff',
    border: '#ddd6fe',
    label: 'Reagendado',
  },
} as const;

// Treatment Status
export const treatmentStatus = {
  planning: {
    color: '#0891b2',
    background: '#f0f9ff',
    border: '#bae6fd',
    label: 'Planejamento',
    icon: 'PenTool',
  },
  active: {
    color: '#059669',
    background: '#f0fdf4',
    border: '#bbf7d0',
    label: 'Em Tratamento',
    icon: 'Activity',
  },
  maintenance: {
    color: '#d97706',
    background: '#fffbeb',
    border: '#fde68a',
    label: 'Manutenção',
    icon: 'Settings',
  },
  completed: {
    color: '#059669',
    background: '#f0fdf4',
    border: '#bbf7d0',
    label: 'Finalizado',
    icon: 'CheckCircle',
  },
  suspended: {
    color: '#dc2626',
    background: '#fef2f2',
    border: '#fecaca',
    label: 'Suspenso',
    icon: 'PauseCircle',
  },
} as const;

// Payment Status
export const paymentStatus = {
  paid: {
    color: '#059669',
    background: '#f0fdf4',
    border: '#bbf7d0',
    label: 'Pago',
    icon: 'CheckCircle2',
  },
  pending: {
    color: '#d97706',
    background: '#fffbeb',
    border: '#fde68a',
    label: 'Pendente',
    icon: 'Clock',
  },
  overdue: {
    color: '#dc2626',
    background: '#fef2f2',
    border: '#fecaca',
    label: 'Vencido',
    icon: 'AlertCircle',
  },
  installments: {
    color: '#7c3aed',
    background: '#faf5ff',
    border: '#ddd6fe',
    label: 'Parcelado',
    icon: 'CreditCard',
  },
  insurance: {
    color: '#0891b2',
    background: '#f0f9ff',
    border: '#bae6fd',
    label: 'Convênio',
    icon: 'Shield',
  },
  refunded: {
    color: '#6b7280',
    background: '#f9fafb',
    border: '#e5e7eb',
    label: 'Reembolsado',
    icon: 'RotateCcw',
  },
} as const;

// Insurance Providers (ANS)
export const insuranceProviders = {
  bradesco: {
    color: '#dc2626',
    name: 'Bradesco Saúde',
    code: 'BS',
  },
  sulamerica: {
    color: '#059669',
    name: 'SulAmérica',
    code: 'SA',
  },
  unimed: {
    color: '#059669',
    name: 'Unimed',
    code: 'UN',
  },
  amil: {
    color: '#0891b2',
    name: 'Amil',
    code: 'AM',
  },
  notredame: {
    color: '#7c3aed',
    name: 'Notre Dame',
    code: 'ND',
  },
  golden: {
    color: '#d97706',
    name: 'Golden Cross',
    code: 'GC',
  },
  particular: {
    color: '#6b7280',
    name: 'Particular',
    code: 'PT',
  },
} as const;

// Medical Specialties
export const medicalSpecialties = {
  dermatology: {
    label: 'Dermatologia',
    color: '#7c3aed',
    icon: 'Stethoscope',
  },
  plasticSurgery: {
    label: 'Cirurgia Plástica',
    color: '#dc2626',
    icon: 'Scissors',
  },
  aesthetics: {
    label: 'Medicina Estética',
    color: '#059669',
    icon: 'Sparkles',
  },
  nutrition: {
    label: 'Nutrição',
    color: '#d97706',
    icon: 'Apple',
  },
  psychology: {
    label: 'Psicologia',
    color: '#0891b2',
    icon: 'Brain',
  },
  physiotherapy: {
    label: 'Fisioterapia',
    color: '#7c2d12',
    icon: 'Activity',
  },
} as const;

// Aesthetic Procedures
export const procedures = {
  botox: {
    label: 'Toxina Botulínica',
    category: 'Injetáveis',
    duration: 30, // minutes
    color: '#7c3aed',
  },
  fillers: {
    label: 'Preenchimento',
    category: 'Injetáveis',
    duration: 45,
    color: '#059669',
  },
  laser: {
    label: 'Laser',
    category: 'Tecnologia',
    duration: 60,
    color: '#dc2626',
  },
  peeling: {
    label: 'Peeling',
    category: 'Facial',
    duration: 90,
    color: '#d97706',
  },
  massage: {
    label: 'Massagem',
    category: 'Corporal',
    duration: 120,
    color: '#0891b2',
  },
  radiofrequency: {
    label: 'Radiofrequência',
    category: 'Tecnologia',
    duration: 75,
    color: '#7c2d12',
  },
} as const;

// Accessibility Tokens
export const accessibility = {
  focusRing: {
    width: '2px',
    offset: '2px',
    color: '#72e3ad',
    style: 'solid',
  },
  emergencyFocus: {
    width: '4px',
    offset: '2px',
    color: '#dc2626',
    style: 'solid',
  },
  touchTarget: {
    minimum: '44px',
    recommended: '48px',
    emergency: '56px',
  },
  contrast: {
    normalText: '4.5:1',
    largeText: '3:1',
    graphical: '3:1',
    medical: '7:1',
    emergency: '21:1',
  },
  fontSize: {
    minimum: '14px',
    recommended: '16px',
    large: '18px',
    emergency: '20px',
  },
  screenReader: {
    language: 'pt-BR',
    voice: 'pt-BR-FranciscaNeural',
    rate: 'medium',
    pitch: 'medium',
  },
} as const;

// Animation Tokens
export const animations = {
  microInteractions: {
    duration: '150ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  stateChanges: {
    duration: '200ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  pageTransitions: {
    duration: '300ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  loading: {
    duration: '1000ms',
    easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
  emergency: {
    duration: '100ms',
    easing: 'linear',
  },
} as const;

// Layout Tokens
export const layout = {
  sidebar: {
    width: '280px',
    collapsedWidth: '64px',
    breakpoint: '1024px',
  },
  header: {
    height: '64px',
    mobileHeight: '56px',
  },
  footer: {
    height: '48px',
  },
  container: {
    maxWidth: '1280px',
    padding: '24px',
    mobilePadding: '16px',
  },
  card: {
    padding: '24px',
    mobilePadding: '16px',
    borderRadius: '8px',
  },
  modal: {
    maxWidth: '600px',
    mobileMaxWidth: '90vw',
    padding: '32px',
    mobilePadding: '24px',
  },
} as const;

// Utility Functions
export const healthcareUtils = {
  /**
   * Get status color by type and status
   */
  getStatusColor: (
    type: 'patient' | 'appointment' | 'treatment' | 'payment',
    status: string
  ): string => {
    const statusMaps = {
      patient: patientPriority,
      appointment: appointmentStatus,
      treatment: treatmentStatus,
      payment: paymentStatus,
    };

    const statusMap = statusMaps[type];
    return statusMap[status as keyof typeof statusMap]?.color || '#6b7280';
  },

  /**
   * Get procedure category color
   */
  getProcedureColor: (procedureKey: keyof typeof procedures): string => {
    return procedures[procedureKey].color;
  },

  /**
   * Get insurance provider color
   */
  getInsuranceColor: (providerKey: keyof typeof insuranceProviders): string => {
    return insuranceProviders[providerKey].color;
  },

  /**
   * Format duration for display
   */
  formatDuration: (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  },

  /**
   * Get accessibility color contrast
   */
  getContrastColor: (backgroundHex: string): string => {
    // Simple contrast calculation - in production, use a proper contrast library
    const hex = backgroundHex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  },
} as const;

// Export all tokens
export const healthcareTokens = {
  patientPriority,
  appointmentStatus,
  treatmentStatus,
  paymentStatus,
  insuranceProviders,
  medicalSpecialties,
  procedures,
  accessibility,
  animations,
  layout,
  utils: healthcareUtils,
} as const;

export type HealthcareTokens = typeof healthcareTokens;