import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  FileText,
  Package,
  Shield,
} from 'lucide-react'

import type {
  ControlledPrescriptionStatus,
  ControlledSubstanceClass,
} from '@/lib/compliance/anvisa-controlled-substances'

// ANVISA Substance Class Configuration
export const SUBSTANCE_CLASS_CONFIG = {
  A1: {
    label: 'Classe A1 (Narcóticos)',
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-300',
    icon: AlertTriangle,
    description: 'Substâncias de controle especial - Lista A1',
  },
  A2: {
    label: 'Classe A2 (Psicotrópicos)',
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-300',
    icon: AlertCircle,
    description: 'Substâncias psicotrópicas - Lista A2',
  },
  A3: {
    label: 'Classe A3 (Imunossupressores)',
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-300',
    icon: Shield,
    description: 'Substâncias imunossupressoras - Lista A3',
  },
  B1: {
    label: 'Classe B1 (Psicotrópicos)',
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-300',
    icon: Activity,
    description: 'Substâncias psicotrópicas - Lista B1',
  },
  B2: {
    label: 'Classe B2 (Psicotrópicos)',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
    icon: Package,
    description: 'Substâncias psicotrópicas anorexígenas - Lista B2',
  },
  C1: {
    label: 'Classe C1 (Ret. Especial)',
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-300',
    icon: CheckCircle,
    description: 'Outras substâncias sujeitas a controle especial - Lista C1',
  },
  C2: {
    label: 'Classe C2 (Ret. Comum)',
    bg: 'bg-gray-100 dark:bg-gray-900/20',
    text: 'text-gray-700 dark:text-gray-300',
    icon: FileText,
    description: 'Substâncias retinóicas de uso tópico - Lista C2',
  },
} as const satisfies Record<ControlledSubstanceClass, {
  label: string
  bg: string
  text: string
  icon: unknown
  description: string
}>

// ANVISA Prescription Status Configuration
export const STATUS_CONFIG = {
  active: {
    label: 'Ativo',
    bg: 'bg-green-100 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-300',
    icon: CheckCircle,
  },
  expired: {
    label: 'Expirado',
    bg: 'bg-red-100 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-300',
    icon: AlertTriangle,
  },
  used: {
    label: 'Utilizado',
    bg: 'bg-gray-100 dark:bg-gray-900/20',
    text: 'text-gray-700 dark:text-gray-300',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelado',
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-300',
    icon: AlertCircle,
  },
} as const satisfies Record<ControlledPrescriptionStatus, {
  label: string
  bg: string
  text: string
  icon: unknown
}>

// Helper functions for getting configuration
export const getSubstanceClassConfig = (substanceClass: ControlledSubstanceClass,) => {
  return SUBSTANCE_CLASS_CONFIG[substanceClass]
}

export const getStatusConfig = (status: ControlledPrescriptionStatus,) => {
  return STATUS_CONFIG[status]
}
