// hooks/useLGPDCompliance.ts
// React hooks for LGPD compliance in NeonPro frontend
// Provides easy-to-use hooks for audit logging, consent management, and data subject rights

import type { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import type { createClient } from "@/lib/supabase/client";
import type {
  LGPDComplianceManager,
  LGPDConsentType,
  LGPDDataSubjectRights,
  LGPDEventType,
  lgpdUtils,
} from "@/lib/supabase/lgpd-compliance";

// Hook return types
interface UseLGPDAuditReturn {
  logEvent: (
    eventType: LGPDEventType,
    details: {
      patientId?: string;
      clinicId?: string;
      tableName: string;
      action: string;
      recordId?: string;
      purpose?: string;
    },
  ) => Promise<void>;
  logPatientAccess: (
    patientId: string,
    clinicId: string,
    action: "view" | "edit" | "create" | "delete",
    tableName?: string,
    recordId?: string,
  ) => Promise<void>;
  logSensitiveAccess: (
    patientId: string,
    clinicId: string,
    dataType: "financial" | "medical_procedure" | "photo" | "biometric",
    action: string,
    recordId?: string,
  ) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

interface UseConsentManagementReturn {
  consents: PatientConsent[];
  activeConsents: PatientConsent[];
  checkConsent: (consentType: LGPDConsentType) => boolean;
  grantConsent: (
    consentType: LGPDConsentType,
    purpose: string,
    details?: Record<string, any>,
  ) => Promise<boolean>;
  revokeConsent: (consentId: string, reason?: string) => Promise<boolean>;
  refreshConsents: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

interface UseDataSubjectRightsReturn {
  requests: DataSubjectRequest[];
  submitRequest: (
    requestType: LGPDDataSubjectRights,
    description: string,
    details?: Record<string, any>,
  ) => Promise<{ success: boolean; requestId?: string }>;
  trackRequest: (requestId: string) => DataSubjectRequest | null;
  downloadData: () => Promise<{ success: boolean; data?: any }>;
  requestDeletion: (reason?: string) => Promise<{ success: boolean }>;
  isLoading: boolean;
  error: string | null;
}

// Supporting types
interface PatientConsent {
  id: string;
  consent_type: LGPDConsentType;
  consent_status: "active" | "withdrawn" | "expired" | "updated";
  consent_date: string;
  withdrawal_date?: string;
  purpose: string;
  consent_version: string;
  can_withdraw: boolean;
}

interface DataSubjectRequest {
  id: string;
  request_number: string;
  request_type: LGPDDataSubjectRights;
  request_description: string;
  request_status: "submitted" | "under_review" | "approved" | "completed" | "rejected";
  submitted_at: string;
  deadline: string;
  completed_at?: string;
}

// Main LGPD audit logging hook
export const useLGPDAudit = (): UseLGPDAuditReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = await createClient();
  const compliance = new LGPDComplianceManager();

  const logEvent = useCallback(
    async (
      eventType: LGPDEventType,
      details: {
        patientId?: string;
        clinicId?: string;
        tableName: string;
        action: string;
        recordId?: string;
        purpose?: string;
      },
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        const result = await compliance.createAuditLog({
          event_type: eventType,
          user_id: user.id,
          patient_id: details.patientId,
          clinic_id: details.clinicId,
          table_name: details.tableName,
          action: details.action,
          record_id: details.recordId,
          purpose: details.purpose || "Healthcare service provision",
          legal_basis: "Article 11, II - Protection of life or physical safety",
        });

        if (!result.success) {
          throw new Error(result.error || "Failed to log LGPD event");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("LGPD Audit Log Error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [compliance, supabase],
  );

  const logPatientAccess = useCallback(
    async (
      patientId: string,
      clinicId: string,
      action: "view" | "edit" | "create" | "delete",
      tableName = "patients",
      recordId?: string,
    ) => {
      await logEvent("patient_record_access", {
        patientId,
        clinicId,
        tableName,
        action,
        recordId,
        purpose: "Patient care and medical record management",
      });
    },
    [logEvent],
  );

  const logSensitiveAccess = useCallback(
    async (
      patientId: string,
      clinicId: string,
      dataType: "financial" | "medical_procedure" | "photo" | "biometric",
      action: string,
      recordId?: string,
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        await compliance.logSensitiveDataAccess(
          user.id,
          patientId,
          clinicId,
          dataType,
          action,
          recordId,
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("LGPD Sensitive Access Log Error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [compliance, supabase],
  );

  return {
    logEvent,
    logPatientAccess,
    logSensitiveAccess,
    isLoading,
    error,
  };
};

// Consent management hook
export const useConsentManagement = (
  patientId?: string,
  clinicId?: string,
): UseConsentManagementReturn => {
  const [consents, setConsents] = useState<PatientConsent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = await createClient();
  const compliance = new LGPDComplianceManager();

  const refreshConsents = useCallback(async () => {
    if (!patientId || !clinicId) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("patient_consents")
        .select("*")
        .eq("patient_id", patientId)
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setConsents(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch consents";
      setError(errorMessage);
      console.error("Consent Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [patientId, clinicId, supabase]);

  useEffect(() => {
    refreshConsents();
  }, [refreshConsents]);

  const activeConsents = consents.filter((consent) => consent.consent_status === "active");

  const checkConsent = useCallback(
    (consentType: LGPDConsentType): boolean => {
      return activeConsents.some((consent) => consent.consent_type === consentType);
    },
    [activeConsents],
  );

  const grantConsent = useCallback(
    async (
      consentType: LGPDConsentType,
      purpose: string,
      details?: Record<string, any>,
    ): Promise<boolean> => {
      if (!patientId || !clinicId) {
        setError("Patient ID and Clinic ID are required");
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        const consentData = lgpdUtils.generateConsentFormData(consentType, purpose);

        const { error: insertError } = await supabase.from("patient_consents").insert({
          patient_id: patientId,
          clinic_id: clinicId,
          user_id: user.id,
          ...consentData,
          ...details,
        });

        if (insertError) {
          throw new Error(insertError.message);
        }

        // Log consent action
        await compliance.logConsentAction(patientId, clinicId, consentType, "granted", {
          purpose,
          ...details,
        });

        await refreshConsents();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to grant consent";
        setError(errorMessage);
        console.error("Grant Consent Error:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [patientId, clinicId, supabase, compliance, refreshConsents],
  );

  const revokeConsent = useCallback(
    async (consentId: string, reason?: string): Promise<boolean> => {
      if (!patientId || !clinicId) {
        setError("Patient ID and Clinic ID are required");
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { error: updateError } = await supabase
          .from("patient_consents")
          .update({
            consent_status: "withdrawn",
            withdrawal_date: new Date().toISOString(),
            metadata: { withdrawal_reason: reason },
          })
          .eq("id", consentId);

        if (updateError) {
          throw new Error(updateError.message);
        }

        // Log consent revocation
        const consent = consents.find((c) => c.id === consentId);
        if (consent) {
          await compliance.logConsentAction(patientId, clinicId, consent.consent_type, "revoked", {
            reason,
            consent_id: consentId,
          });
        }

        await refreshConsents();
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to revoke consent";
        setError(errorMessage);
        console.error("Revoke Consent Error:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [patientId, clinicId, supabase, compliance, consents, refreshConsents],
  );

  return {
    consents,
    activeConsents,
    checkConsent,
    grantConsent,
    revokeConsent,
    refreshConsents,
    isLoading,
    error,
  };
};

// Data subject rights hook
export const useDataSubjectRights = (
  patientId?: string,
  clinicId?: string,
): UseDataSubjectRightsReturn => {
  const [requests, setRequests] = useState<DataSubjectRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = await createClient();
  const compliance = new LGPDComplianceManager();
  const router = useRouter();

  const refreshRequests = useCallback(async () => {
    if (!patientId || !clinicId) return;

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from("data_subject_requests")
        .select("*")
        .eq("patient_id", patientId)
        .eq("clinic_id", clinicId)
        .order("submitted_at", { ascending: false });

      if (fetchError) throw new Error(fetchError.message);
      setRequests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch requests");
    } finally {
      setIsLoading(false);
    }
  }, [patientId, clinicId, supabase]);

  useEffect(() => {
    refreshRequests();
  }, [refreshRequests]);

  const submitRequest = useCallback(
    async (
      requestType: LGPDDataSubjectRights,
      description: string,
      details?: Record<string, any>,
    ): Promise<{ success: boolean; requestId?: string }> => {
      if (!patientId || !clinicId) {
        setError("Patient ID and Clinic ID are required");
        return { success: false };
      }

      try {
        setIsLoading(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        const { data, error: insertError } = await supabase
          .from("data_subject_requests")
          .insert({
            patient_id: patientId,
            clinic_id: clinicId,
            requestor_user_id: user.id,
            request_type: requestType,
            request_description: description,
            metadata: details || {},
          })
          .select("id")
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        // Process the request automatically for certain types
        if (data?.id) {
          await compliance.processDataSubjectRequest(patientId, clinicId, requestType, {
            description,
            ...details,
          });
        }

        await refreshRequests();
        return { success: true, requestId: data?.id };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to submit request";
        setError(errorMessage);
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },
    [patientId, clinicId, supabase, compliance, refreshRequests],
  );

  const trackRequest = useCallback(
    (requestId: string): DataSubjectRequest | null => {
      return requests.find((req) => req.id === requestId) || null;
    },
    [requests],
  );

  const downloadData = useCallback(async (): Promise<{ success: boolean; data?: any }> => {
    if (!patientId || !clinicId) {
      setError("Patient ID and Clinic ID are required");
      return { success: false };
    }

    try {
      setIsLoading(true);
      const result = await compliance.processDataSubjectRequest(
        patientId,
        clinicId,
        "portability",
        { format: "json", include_metadata: true },
      );

      if (result.success && result.data) {
        // Create downloadable file
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `patient-data-${patientId}-${new Date().toISOString().split("T")[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to download data";
      setError(errorMessage);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [patientId, clinicId, compliance]);

  const requestDeletion = useCallback(
    async (reason?: string): Promise<{ success: boolean }> => {
      return await submitRequest(
        "erasure",
        reason || "Patient requests deletion of personal data under LGPD Article 18",
        { deletion_reason: reason },
      );
    },
    [submitRequest],
  );

  return {
    requests,
    submitRequest,
    trackRequest,
    downloadData,
    requestDeletion,
    isLoading,
    error,
  };
};

// Higher-order component for LGPD-protected components
export const withLGPDProtection = <P extends object>(
  Component: React.ComponentType<P>,
  config: {
    requiredConsents?: LGPDConsentType[];
    logAccess?: boolean;
    sensitiveData?: boolean;
  } = {},
) => {
  return function LGPDProtectedComponent(props: P) {
    const { logEvent } = useLGPDAudit();
    const [accessLogged, setAccessLogged] = useState(false);

    useEffect(() => {
      if (config.logAccess && !accessLogged) {
        logEvent("data_access", {
          tableName: "component_access",
          action: "view",
          purpose: "Component access logging",
        });
        setAccessLogged(true);
      }
    }, [logEvent, accessLogged]);

    return React.createElement(Component, props);
  };
};

// Utility hook for LGPD compliance status
export const useLGPDComplianceStatus = (patientId?: string, clinicId?: string) => {
  const [complianceStatus, setComplianceStatus] = useState({
    hasActiveConsents: false,
    pendingRequests: 0,
    recentAuditEntries: 0,
    lastAccess: null as string | null,
    complianceScore: 0,
  });
  const supabase = await createClient();

  useEffect(() => {
    if (!patientId || !clinicId) return;

    const fetchComplianceStatus = async () => {
      try {
        const { data } = await supabase
          .from("lgpd_compliance_summary")
          .select("*")
          .eq("patient_id", patientId)
          .eq("clinic_id", clinicId)
          .single();

        if (data) {
          setComplianceStatus({
            hasActiveConsents: data.active_consents > 0,
            pendingRequests: data.total_requests - data.completed_requests,
            recentAuditEntries: data.recent_audit_entries,
            lastAccess: data.last_record_access,
            complianceScore: calculateComplianceScore(data),
          });
        }
      } catch (error) {
        console.error("Failed to fetch compliance status:", error);
      }
    };

    fetchComplianceStatus();
  }, [patientId, clinicId, supabase]);

  return complianceStatus;
};

// Helper function to calculate compliance score
const calculateComplianceScore = (data: any): number => {
  let score = 0;

  // Has active consents
  if (data.active_consents > 0) score += 30;

  // No pending requests
  if (data.total_requests === data.completed_requests) score += 25;

  // Recent audit activity indicates proper monitoring
  if (data.recent_audit_entries > 0) score += 25;

  // Recent access indicates active use
  if (data.last_record_access) score += 20;

  return score;
};

export default {
  useLGPDAudit,
  useConsentManagement,
  useDataSubjectRights,
  withLGPDProtection,
  useLGPDComplianceStatus,
};
