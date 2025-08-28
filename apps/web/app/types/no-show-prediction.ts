// No-Show Prediction Types for NeonPro AI Healthcare Platform
// Risk-Scoring UI Integration Types

export interface NoShowPrediction {
  id: string;
  patientId: string;
  appointmentId: string;
  riskScore: number; // 0-100 percentage
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100 percentage
  factors: RiskFactor[];
  predictedAt: Date;
  modelVersion: string;
}

export interface RiskFactor {
  factor: string;
  impact: number; // -100 to 100 (negative reduces risk, positive increases risk)
  description: string;
  category: 'behavioral' | 'historical' | 'scheduling' | 'demographic';
}

export interface AppointmentWithRisk {
  id: string;
  patient?: {
    id: string;
    name: string;
  };
  time: string;
  type: string;
  date: Date;
  riskPrediction?: NoShowPrediction;
}

export interface RiskIndicatorProps {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  className?: string;
}

export interface PatientRiskContextProps {
  prediction: NoShowPrediction;
  patient: {
    id: string;
    name: string;
  };
  showActions?: boolean;
}

export interface RiskTooltipContent {
  riskScore: number;
  confidence: number;
  topFactors: RiskFactor[];
  recommendedActions: string[];
}

// Risk threshold constants
export const RISK_THRESHOLDS = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
  CRITICAL: 90,
} as const;

// Brazilian Portuguese localization
export const RISK_LABELS_PT = {
  low: 'Baixo Risco',
  medium: 'Risco Moderado', 
  high: 'Alto Risco',
  critical: 'Risco Crítico',
} as const;

export const RISK_COLORS = {
  low: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200', 
  critical: 'text-red-600 bg-red-50 border-red-200',
} as const;

export const INTERVENTION_ACTIONS_PT = {
  low: ['Lembrete por WhatsApp 24h antes'],
  medium: ['Lembrete SMS + WhatsApp', 'Confirmação telefônica'],
  high: ['Ligação de confirmação', 'Reagendamento proativo', 'Desconto especial'],
  critical: ['Contato urgente', 'Reunião presencial', 'Acompanhamento psicológico'],
} as const;