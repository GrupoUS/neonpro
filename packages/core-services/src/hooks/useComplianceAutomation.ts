// ================================================
// COMPLIANCE AUTOMATION HOOKS
// Custom React hooks for healthcare compliance automation
// ================================================

"use client";

// CONTENT CHECK: import { useState, useEffect, useCallback } from 'react';

// ================================================
// TYPES AND INTERFACES
// ================================================

interface ComplianceStatus {
  overall_score: number;
  overall_status: string;
  lgpd_score: number;
  anvisa_score: number;
  cfm_score: number;
  critical_alerts: number;
  pending_requests: number;
  requires_attention: boolean;
  assessed_at: string;
}

interface ComplianceAlert {
  id: string;
  alert_type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  created_at: string;
  affected_systems: string[];
  alert_status: string;
}

interface DataClassificationRequest {
  tableName: string;
  columnName: string;
  sampleData?: string;
  overrideClassification?: {
    category?: "public" | "internal" | "personal" | "sensitive";
    sensitivity?: number;
    encryptionRequired?: boolean;
    retentionDays?: number;
  };
}

interface DataSubjectRequest {
  requestType:
    | "access"
    | "rectification"
    | "erasure"
    | "portability"
    | "objection";
  dataSubjectId: string;
  clinicId: string;
  identityVerificationData: {
    documentType: string;
    documentNumber: string;
    verificationMethod: "in_person" | "video_call" | "digital_signature";
  };
  requestDetails?: Record<string, unknown>;
  urgency?: "normal" | "urgent" | "critical";
}

interface SoftwareValidationRequest {
  softwareItemName: string;
  softwareVersion: string;
  changeDescription?: string;
  safetyClassification?: "A" | "B" | "C";
  riskAssessmentRequired?: boolean;
}

interface ProfessionalValidationRequest {
  professionalId: string;
  validationType?: "license" | "credentials" | "ethics" | "comprehensive";
  includeRecommendations?: boolean;
}

// ================================================
// MAIN COMPLIANCE STATUS HOOK
// ================================================

export const useComplianceStatus = (clinicId?: string, autoRefresh = true) => {
  const [status, setStatus] = useState<ComplianceStatus | null>();
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const url = new URL(
        "/api/compliance/monitor/status",
        window.location.origin,
      );
      if (clinicId) {
        url.searchParams.set("clinicId", clinicId);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch compliance status");
      }

      if (data.success) {
        setStatus(data.compliance_status);
        setAlerts(data.recent_alerts || []);
        setLastRefresh(new Date());
      } else {
        throw new Error(data.error || "Invalid response format");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchStatus();

    if (autoRefresh) {
      // Auto-refresh every 5 minutes
      const interval = setInterval(fetchStatus, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchStatus, autoRefresh]);

  return {
    status,
    alerts,
    loading,
    error,
    lastRefresh,
    refresh: fetchStatus,
  };
};

// ================================================
// LGPD COMPLIANCE HOOKS
// ================================================

export const useDataClassification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>();

  const classifyData = useCallback(
    async (request: DataClassificationRequest) => {
      try {
        setLoading(true);
        setError(undefined);

        const response = await fetch(
          "/api/compliance/lgpd/data-classification",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to classify data");
        }

        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    classifyData,
    loading,
    error,
  };
};

export const useDataSubjectRequests = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>();

  const createRequest = useCallback(async (request: DataSubjectRequest) => {
    try {
      setLoading(true);
      setError(undefined);

      const response = await fetch(
        "/api/compliance/lgpd/data-subject-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create data subject request");
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createRequest,
    loading,
    error,
  };
};

export const useConsentStatus = (dataSubjectId: string) => {
  const [consentData, setConsentData] = useState<unknown>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>();

  const fetchConsentStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const response = await fetch(
        `/api/compliance/lgpd/consent/${dataSubjectId}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch consent status");
      }

      setConsentData(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  }, [dataSubjectId]);

  useEffect(() => {
    if (dataSubjectId) {
      fetchConsentStatus();
    }
  }, [dataSubjectId, fetchConsentStatus]);

  return {
    consentData,
    loading,
    error,
    refresh: fetchConsentStatus,
  };
};

// ================================================
// ANVISA COMPLIANCE HOOKS
// ================================================

export const useSoftwareValidation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>();

  const validateSoftware = useCallback(
    async (request: SoftwareValidationRequest) => {
      try {
        setLoading(true);
        setError(undefined);

        const response = await fetch(
          "/api/compliance/anvisa/software-validation",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to validate software");
        }

        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    validateSoftware,
    loading,
    error,
  };
};

export const useSoftwareLifecycle = (itemName: string) => {
  const [lifecycleData, setLifecycleData] = useState<unknown>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>();

  const fetchLifecycle = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const response = await fetch(
        `/api/compliance/anvisa/software-lifecycle/${encodeURIComponent(itemName)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch software lifecycle");
      }

      setLifecycleData(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  }, [itemName]);

  useEffect(() => {
    if (itemName) {
      fetchLifecycle();
    }
  }, [itemName, fetchLifecycle]);

  return {
    lifecycleData,
    loading,
    error,
    refresh: fetchLifecycle,
  };
};

// ================================================
// CFM COMPLIANCE HOOKS
// ================================================

export const useProfessionalValidation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>();

  const validateProfessional = useCallback(
    async (request: ProfessionalValidationRequest) => {
      try {
        setLoading(true);
        setError(undefined);

        const response = await fetch(
          "/api/compliance/cfm/professional-validation",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to validate professional");
        }

        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    validateProfessional,
    loading,
    error,
  };
};

export const useProfessionalStatus = (professionalId: string) => {
  const [professionalData, setProfessionalData] = useState<unknown>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>();

  const fetchProfessionalStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const response = await fetch(
        `/api/compliance/cfm/professional-status/${professionalId}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch professional status");
      }

      setProfessionalData(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  }, [professionalId]);

  useEffect(() => {
    if (professionalId) {
      fetchProfessionalStatus();
    }
  }, [professionalId, fetchProfessionalStatus]);

  return {
    professionalData,
    loading,
    error,
    refresh: fetchProfessionalStatus,
  };
};

// ================================================
// ALERT MANAGEMENT HOOK
// ================================================

export const useComplianceAlerts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>();

  const createAlert = useCallback(
    async (alertData: {
      alertType: string;
      severity: "low" | "medium" | "high" | "critical";
      clinicId?: string;
      description: string;
      affectedSystems?: string[];
      autoResolve?: boolean;
    }) => {
      try {
        setLoading(true);
        setError(undefined);

        const response = await fetch("/api/compliance/alerts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(alertData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create alert");
        }

        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    createAlert,
    loading,
    error,
  };
};

// ================================================
// UTILITY HOOKS
// ================================================

export const useComplianceReport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>();

  const generateReport = useCallback(
    async (
      type: "lgpd" | "anvisa" | "cfm" | "comprehensive",
      clinicId?: string,
    ) => {
      try {
        setLoading(true);
        setError(undefined);

        const url = new URL(
          `/api/compliance/reports/${type}`,
          window.location.origin,
        );
        if (clinicId) {
          url.searchParams.set("clinicId", clinicId);
        }

        const response = await fetch(url.toString());

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to generate report");
        }

        // Handle file download
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `compliance-report-${type}-${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.append(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    generateReport,
    loading,
    error,
  };
};
