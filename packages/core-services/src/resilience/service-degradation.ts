/**
 * Service Degradation Management for Healthcare Systems
 * Provides graceful fallback strategies when services become unavailable
 */

export enum DegradationLevel {
  NONE = 0,
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  COMPLETE = 5,
}

export interface DegradationStrategy {
  level: DegradationLevel;
  condition: string;
  fallback: string;
  userMessage: string;
  enabledFeatures?: string[];
  disabledFeatures?: string[];
}

export interface ServiceDegradationConfig {
  serviceName: string;
  degradationLevels: DegradationStrategy[];
  fallbackMethods: string[];
  userNotification: boolean;
  emergencyBypass?: boolean; // For critical healthcare scenarios
}

/**
 * Healthcare-specific service degradation strategies
 */
export const healthcareServiceDegradations: Record<
  string,
  ServiceDegradationConfig
> = {
  "appointment-booking": {
    serviceName: "appointment-booking",
    degradationLevels: [
      {
        level: DegradationLevel.LEVEL_1,
        condition: "payment_service_down",
        fallback: "allow_booking_without_payment",
        userMessage: "Pagamento será processado quando o serviço for restaurado",
        disabledFeatures: ["instant_payment"],
      },
      {
        level: DegradationLevel.LEVEL_2,
        condition: "sms_service_down",
        fallback: "email_notifications_only",
        userMessage: "Notificações por SMS temporariamente indisponíveis",
        disabledFeatures: ["sms_notifications"],
      },
      {
        level: DegradationLevel.LEVEL_3,
        condition: "external_calendar_down",
        fallback: "internal_scheduling_only",
        userMessage: "Sincronização com calendários externos temporariamente desabilitada",
        disabledFeatures: ["calendar_sync", "google_calendar"],
      },
    ],
    fallbackMethods: [
      "offline_mode_with_sync",
      "manual_notification_queue",
      "simplified_booking_form",
    ],
    userNotification: true,
  },
  "patient-data-access": {
    serviceName: "patient-data-access",
    degradationLevels: [
      {
        level: DegradationLevel.LEVEL_1,
        condition: "external_medical_records_down",
        fallback: "local_records_only",
        userMessage: "Acesso a registros médicos externos temporariamente limitado",
        disabledFeatures: ["external_records_import"],
      },
      {
        level: DegradationLevel.LEVEL_2,
        condition: "image_processing_down",
        fallback: "manual_image_review",
        userMessage: "Processamento automático de imagens indisponível",
        disabledFeatures: ["auto_image_analysis", "ai_diagnostics"],
      },
    ],
    fallbackMethods: [
      "cached_data_mode",
      "manual_data_entry",
      "emergency_access_protocol",
    ],
    userNotification: true,
    emergencyBypass: true, // Critical for patient care
  },

  "communication-services": {
    serviceName: "communication-services",
    degradationLevels: [
      {
        level: DegradationLevel.LEVEL_1,
        condition: "whatsapp_api_down",
        fallback: "sms_only",
        userMessage: "WhatsApp temporariamente indisponível, usando SMS",
        disabledFeatures: ["whatsapp_messaging"],
      },
      {
        level: DegradationLevel.LEVEL_2,
        condition: "sms_service_down",
        fallback: "email_only",
        userMessage: "SMS temporariamente indisponível, usando email",
        disabledFeatures: ["sms_messaging", "whatsapp_messaging"],
      },
      {
        level: DegradationLevel.LEVEL_3,
        condition: "all_external_comm_down",
        fallback: "manual_communication",
        userMessage: "Comunicação automática indisponível, contato manual necessário",
        disabledFeatures: ["automated_messaging"],
      },
    ],
    fallbackMethods: [
      "message_queue_storage",
      "manual_notification_list",
      "phone_call_escalation",
    ],
    userNotification: true,
  },
};
