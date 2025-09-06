/**
 * 🛡️ LGPD Real-time Compliance Hooks - NeonPro Healthcare
 * =======================================================
 *
 * React hooks for LGPD compliant real-time data processing
 * with consent validation and audit logging
 */

import type { RealtimePostgresChangesPayload, SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import {
  LGPDConsentStatus,
  LGPDConsentValidator,
  LGPDDataCategory,
  LGPDDataProcessor,
  LGPDProcessingPurpose,
} from "../compliance/lgpd-realtime";
import type { LGPDRealtimeConfig } from "../compliance/lgpd-realtime";
import { useRealtime } from "./use-realtime";
import type { UseRealtimeConfig } from "./use-realtime";

// LGPD-compliant realtime hook configuration
export interface UseLGPDRealtimeConfig extends Omit<UseRealtimeConfig, "enabled"> {
  userId: string;
  enabled?: boolean;
  dataCategory: LGPDDataCategory;
  processingPurpose: LGPDProcessingPurpose;
  lgpdConfig: LGPDRealtimeConfig;
  onConsentDenied?: (reason: string) => void;
  onDataProcessed?: (processedData: unknown) => void;
  validateConsent?: boolean;
}

// LGPD consent status hook
export function useLGPDConsentStatus(
  userId?: string,
  processingPurpose?: LGPDProcessingPurpose,
  dataCategory?: LGPDDataCategory,
) {
  const [consentStatus, setConsentStatus] = useState<LGPDConsentStatus | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>();

  const validateConsent = useCallback(async () => {
    if (!(userId && processingPurpose && dataCategory)) {
      setConsentStatus(undefined);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const result = await LGPDConsentValidator.validateConsent(
        userId,
        processingPurpose,
        dataCategory,
      );

      setConsentStatus(result.status);

      if (!result.valid && result.reason) {
        setError(new Error(`Consent denied: ${result.reason}`));
      }
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error("Consent validation failed");
      setError(errorInstance);
      setConsentStatus(LGPDConsentStatus.REVOKED);
    } finally {
      setIsLoading(false);
    }
  }, [userId, processingPurpose, dataCategory]);

  useEffect(() => {
    validateConsent();
  }, [validateConsent]);

  const refreshConsent = useCallback(() => {
    if (userId) {
      LGPDConsentValidator.clearConsentCache(userId);
      validateConsent();
    }
  }, [userId, validateConsent]);

  return {
    consentStatus,
    isLoading,
    error,
    validateConsent,
    refreshConsent,
    hasConsent: consentStatus === LGPDConsentStatus.GRANTED,
  };
}

/**
 * LGPD-compliant real-time hook with automatic data processing
 */
export function useLGPDRealtime<
  T extends Record<string, unknown> = Record<string, unknown>,
>(supabaseClient: SupabaseClient, config: UseLGPDRealtimeConfig) {
  const [processedData, setProcessedData] = useState<T | null>();
  const [dataProcessingError, setDataProcessingError] = useState<Error | null>();

  // Get consent status
  const {
    hasConsent,
    consentStatus,
    isLoading: consentLoading,
    error: consentError,
  } = useLGPDConsentStatus(
    config.userId,
    config.processingPurpose,
    config.dataCategory,
  );

  // Process data according to LGPD config
  const processRealtimeData = useCallback(
    (payload: RealtimePostgresChangesPayload<T>) => {
      try {
        let processedPayload = payload;

        // Apply data minimization if configured
        if (config.lgpdConfig.dataMinimization) {
          const allowedFields = config.lgpdConfig.sensitiveFields || [];
          processedPayload = LGPDDataProcessor.minimizeData<T>(
            processedPayload as RealtimePostgresChangesPayload<T & Record<string, unknown>>,
            allowedFields,
          );
        }

        // Apply anonymization if configured
        if (config.lgpdConfig.anonymization) {
          processedPayload = LGPDDataProcessor.anonymizePayload<T>(
            processedPayload as RealtimePostgresChangesPayload<T & Record<string, unknown>>,
            config.lgpdConfig,
          );
        }

        // Apply pseudonymization if configured
        if (config.lgpdConfig.pseudonymization) {
          processedPayload = LGPDDataProcessor.pseudonymizePayload<T>(
            processedPayload as RealtimePostgresChangesPayload<T & Record<string, unknown>>,
            config.lgpdConfig,
          );
        }

        setProcessedData(processedPayload.new as T);
        setDataProcessingError(undefined);

        // Notify about processed data
        config.onDataProcessed?.(processedPayload);

        return processedPayload;
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error("Data processing failed");
        setDataProcessingError(errorInstance);
        config.onError?.(errorInstance);
        return;
      }
    },
    [config],
  );

  // Enhanced event handlers with LGPD processing
  const createLGPDEventHandler = useCallback(
    (
      originalHandler?: (payload: RealtimePostgresChangesPayload<T>) => void,
    ) => {
      return (payload: RealtimePostgresChangesPayload<T>) => {
        // Check consent before processing
        if (config.validateConsent !== false && !hasConsent) {
          const reason =
            `Consent denied for ${config.processingPurpose} on ${config.dataCategory} data`;
          config.onConsentDenied?.(reason);
          return;
        }

        // Process data with LGPD compliance
        const processedPayload = processRealtimeData(payload);

        if (processedPayload && originalHandler) {
          originalHandler(processedPayload);
        }
      };
    },
    [hasConsent, config, processRealtimeData],
  );

  // Enhanced realtime config with LGPD handlers
  const lgpdRealtimeConfig: UseRealtimeConfig<T> = {
    ...config,
    enabled: (config.enabled ?? true)
      && (config.validateConsent === false || hasConsent),
    lgpdCompliance: true,
    auditLogging: config.lgpdConfig.auditLogging,
    onInsert: createLGPDEventHandler(config.onInsert),
    onUpdate: createLGPDEventHandler(config.onUpdate),
    onDelete: createLGPDEventHandler(config.onDelete),
    onError: (error: Error) => {
      setDataProcessingError(error);
      config.onError?.(error);
    },
  };

  // Use base realtime hook with LGPD config
  const realtimeResult = useRealtime(supabaseClient, lgpdRealtimeConfig);

  return {
    ...realtimeResult,
    // LGPD-specific states
    hasConsent,
    consentStatus,
    consentLoading,
    consentError,
    processedData,
    dataProcessingError,
    // Combined error state
    error: realtimeResult.error || consentError || dataProcessingError,
    // Enhanced connection status (requires consent)
    isConnected: realtimeResult.isConnected && hasConsent,
  };
}

/**
 * LGPD-compliant patient real-time hook
 */
export function useLGPDPatientRealtime(
  supabaseClient: SupabaseClient,
  options: {
    userId?: string;
    patientId?: string;
    clinicId?: string;
    enabled?: boolean;
    onPatientUpdate?: (patient: unknown) => void;
    onConsentDenied?: (reason: string) => void;
    strictMode?: boolean; // More restrictive data processing
  },
) {
  const lgpdConfig: LGPDRealtimeConfig = {
    enabled: true,
    dataCategory: LGPDDataCategory.SENSITIVE, // Patient data is sensitive
    processingPurpose: LGPDProcessingPurpose.HEALTHCARE_DELIVERY,
    consentRequired: true,
    auditLogging: true,
    dataMinimization: options.strictMode ?? false,
    anonymization: false,
    pseudonymization: options.strictMode ?? false,
    sensitiveFields: ["cpf", "rg", "email", "phone", "address", "birth_date"],
    dataSubjectRights: {
      accessRight: true,
      rectificationRight: true,
      erasureRight: true,
      portabilityRight: true,
      objectRight: true,
    },
  };

  const config: UseLGPDRealtimeConfig = {
    table: "patients",
    ...(options.patientId
      ? { filter: `id=eq.${options.patientId}` }
      : options.clinicId
      ? { filter: `clinic_id=eq.${options.clinicId}` }
      : {}),
    enabled: options.enabled ?? true,
    userId: options.userId ?? "",
    dataCategory: LGPDDataCategory.SENSITIVE,
    processingPurpose: LGPDProcessingPurpose.HEALTHCARE_DELIVERY,
    lgpdConfig,
    ...(options.onPatientUpdate && { onUpdate: options.onPatientUpdate }),
    ...(options.onConsentDenied && {
      onConsentDenied: options.onConsentDenied,
    }),
    validateConsent: true,
  };

  return useLGPDRealtime(supabaseClient, config);
}

/**
 * LGPD-compliant appointment real-time hook
 */
export function useLGPDAppointmentRealtime(
  supabaseClient: SupabaseClient,
  options: {
    userId?: string;
    appointmentId?: string;
    patientId?: string;
    professionalId?: string;
    clinicId?: string;
    enabled?: boolean;
    onAppointmentUpdate?: (appointment: unknown) => void;
    onConsentDenied?: (reason: string) => void;
  },
) {
  const lgpdConfig: LGPDRealtimeConfig = {
    enabled: true,
    dataCategory: LGPDDataCategory.PERSONAL, // Appointment data is personal
    processingPurpose: LGPDProcessingPurpose.APPOINTMENT_MANAGEMENT,
    consentRequired: true,
    auditLogging: true,
    dataMinimization: false,
    anonymization: false,
    pseudonymization: false,
    sensitiveFields: ["notes", "diagnosis", "treatment"],
    dataSubjectRights: {
      accessRight: true,
      rectificationRight: true,
      erasureRight: true,
      portabilityRight: true,
      objectRight: true,
    },
  };

  const buildFilter = useCallback(() => {
    const filters = [];

    if (options.appointmentId) {
      filters.push(`id=eq.${options.appointmentId}`);
    }
    if (options.patientId) {
      filters.push(`patient_id=eq.${options.patientId}`);
    }
    if (options.professionalId) {
      filters.push(`professional_id=eq.${options.professionalId}`);
    }
    if (options.clinicId) {
      filters.push(`clinic_id=eq.${options.clinicId}`);
    }

    return filters.join(",");
  }, [options]);

  const config: UseLGPDRealtimeConfig = {
    table: "appointments",
    filter: buildFilter(),
    enabled: options.enabled ?? true,
    userId: options.userId ?? "",
    dataCategory: LGPDDataCategory.PERSONAL,
    processingPurpose: LGPDProcessingPurpose.APPOINTMENT_MANAGEMENT,
    lgpdConfig,
    ...(options.onAppointmentUpdate && {
      onUpdate: options.onAppointmentUpdate,
    }),
    ...(options.onConsentDenied && {
      onConsentDenied: options.onConsentDenied,
    }),
    validateConsent: true,
  };

  return useLGPDRealtime(supabaseClient, config);
}

/**
 * LGPD compliance analytics hook for real-time monitoring
 */
export function useLGPDAnalytics(
  supabaseClient: SupabaseClient,
  options: {
    userId?: string;
    clinicId?: string;
    enabled?: boolean;
    onAnalyticsUpdate?: (data: unknown) => void;
  },
) {
  const lgpdConfig: LGPDRealtimeConfig = {
    enabled: true,
    dataCategory: LGPDDataCategory.AGGREGATE, // Analytics use aggregate data
    processingPurpose: LGPDProcessingPurpose.ANALYTICS,
    consentRequired: false, // Aggregate analytics don't require individual consent
    auditLogging: true,
    dataMinimization: true,
    anonymization: true, // Always anonymize analytics data
    pseudonymization: true,
    sensitiveFields: [],
    dataSubjectRights: {
      accessRight: false, // No individual access to aggregate data
      rectificationRight: false,
      erasureRight: false,
      portabilityRight: false,
      objectRight: true, // Can object to analytics processing
    },
  };

  const config: UseLGPDRealtimeConfig = {
    table: "analytics_events",
    ...(options.clinicId && { filter: `clinic_id=eq.${options.clinicId}` }),
    enabled: options.enabled ?? true,
    userId: options.userId ?? "",
    dataCategory: LGPDDataCategory.AGGREGATE,
    processingPurpose: LGPDProcessingPurpose.ANALYTICS,
    lgpdConfig,
    ...(options.onAnalyticsUpdate && { onInsert: options.onAnalyticsUpdate }),
    validateConsent: false, // Aggregate analytics don't require individual consent
  };

  return useLGPDRealtime(supabaseClient, config);
}
