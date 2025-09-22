/**
 * Communication Components Index
 * Healthcare communication system with LGPD compliance and WCAG 2.1 AA+ accessibility
 */

export { default as HealthcareCommunicationSystem } from './HealthcareCommunicationSystem';
export type { HealthcareCommunicationSystemProps } from './HealthcareCommunicationSystem';

// Re-export commonly used types and interfaces
export type {
  Contact,
  Message,
  MessageAttachment,
  Notification,
} from './HealthcareCommunicationSystem';

// Component constants and configuration
export const COMMUNICATION_CONFIG = {
  maxMessageLength: 5000,
  maxFileSize: 10485760, // 10MB
  supportedAttachmentTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
  ],
  emergencyKeywords: [
    'emergência',
    'urgente',
    'socorro',
    'ajuda',
    'emergency',
    'urgent',
  ],
  messageTemplates: {
    appointment_reminder: 'Lembrete: Sua consulta está agendada para {date} às {time}.',
    prescription_ready: 'Sua receita está pronta para retirada na farmácia.',
    test_result: 'Seus resultados de exames estão disponíveis no portal.',
    follow_up: 'Como você está se sentindo após o tratamento?',
    emergency_contact: 'Por favor, entre em contato imediatamente.',
    treatment_progress: 'Seu tratamento está progredindo bem. Vamos marcar a próxima sessão?',
  },
  defaultSettings: {
    dataRetentionDays: 365,
    requireConsentForMessages: true,
    enableMessageEncryption: true,
    emergencyEnabled: true,
    videoConsultationEnabled: true,
  },
} as const;
