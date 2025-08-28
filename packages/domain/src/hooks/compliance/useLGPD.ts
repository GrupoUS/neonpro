"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useCallback, useEffect, useState } from "react";
import { toast } from "../placeholders/sonner";
import { useUser } from "../placeholders/supabase-auth-helpers-react";

// Types
export interface LGPDMetrics {
  compliance_percentage: number;
  active_consents: number;
  pending_requests: number;
  active_breaches: number;
  total_users: number;
  consent_rate: number;
  avg_response_time: number;
  last_assessment: string | null;
}

export interface ConsentRecord {
  id: string;
  user_id: string;
  purpose_id: string;
  purpose_name: string;
  purpose_description: string;
  granted: boolean;
  granted_at: string | null;
  withdrawn_at: string | null;
  expires_at: string | null;
  version: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface DataSubjectRequest {
  id: string;
  user_id: string;
  request_type:
    | "access"
    | "rectification"
    | "erasure"
    | "portability"
    | "restriction"
    | "objection";
  status: "pending" | "in_progress" | "completed" | "rejected";
  description: string | null;
  requested_at: string;
  processed_at: string | null;
  processed_by: string | null;
  response_data: unknown | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BreachIncident {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "reported" | "investigating" | "contained" | "resolved";
  affected_users: number;
  data_types: string[];
  discovered_at: string;
  reported_at: string | null;
  resolved_at: string | null;
  reported_by: string;
  assigned_to: string | null;
  authority_notified: boolean;
  users_notified: boolean;
  mitigation_steps: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditEvent {
  id: string;
  event_type: string;
  user_id: string | null;
  resource_type: string | null;
  resource_id: string | null;
  action: string;
  details: unknown | null;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
}

export interface ComplianceAssessment {
  id: string;
  assessment_type: "manual" | "automated";
  status: "pending" | "in_progress" | "completed" | "failed";
  score: number | null;
  max_score: number;
  findings: unknown | null;
  recommendations: string[] | null;
  conducted_by: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Main LGPD Dashboard Hook
export function useLGPDDashboard() {
  const [metrics, setMetrics] = useState<LGPDMetrics | null>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>();
  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      const response = await fetch("/api/lgpd/compliance");
      if (!response.ok) {
        throw new Error("Failed to fetch LGPD metrics");
      }

      const data = await response.json();
      setMetrics(data.metrics);
    } catch (error) {
      setError(error as Error);
      toast.error("Erro ao carregar métricas LGPD");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchMetrics,
  };
}

// Consent Management Hook
export function useConsentManagement() {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>();
  const fetchConsents = useCallback(
    async (filters?: {
      user_id?: string;
      purpose_id?: string;
      granted?: boolean;
      page?: number;
      limit?: number;
    }) => {
      try {
        setIsLoading(true);
        setError(undefined);

        const params = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
              params.append(key, value?.toString() || "");
            }
          });
        }

        const response = await fetch(`/api/lgpd/consent?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch consents");
        }

        const data = await response.json();
        setConsents(data.consents);
      } catch (error) {
        setError(error as Error);
        toast.error("Erro ao carregar consentimentos");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const updateConsent = useCallback(
    async (consentData: {
      user_id?: string;
      purpose_id: string;
      granted: boolean;
      ip_address?: string;
      user_agent?: string;
    }) => {
      try {
        const response = await fetch("/api/lgpd/consent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(consentData),
        });

        if (!response.ok) {
          throw new Error("Failed to update consent");
        }

        const data = await response.json();
        toast.success("Consentimento atualizado com sucesso");

        // Refresh consents
        await fetchConsents();

        return data.consent;
      } catch (error) {
        setError(error as Error);
        toast.error("Erro ao atualizar consentimento");
        throw error;
      }
    },
    [fetchConsents],
  );

  const withdrawConsent = useCallback(
    async (consentId: string) => {
      try {
        const response = await fetch("/api/lgpd/consent", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ consent_id: consentId }),
        });

        if (!response.ok) {
          throw new Error("Failed to withdraw consent");
        }

        toast.success("Consentimento retirado com sucesso");

        // Refresh consents
        await fetchConsents();
      } catch (error) {
        setError(error as Error);
        toast.error("Erro ao retirar consentimento");
        throw error;
      }
    },
    [fetchConsents],
  );

  return {
    consents,
    isLoading,
    error,
    fetchConsents,
    updateConsent,
    withdrawConsent,
  };
}

// Data Subject Rights Hook
export function useDataSubjectRights() {
  const [requests, setRequests] = useState<DataSubjectRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>();

  const fetchRequests = useCallback(
    async (filters?: {
      user_id?: string;
      request_type?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) => {
      try {
        setIsLoading(true);
        setError(undefined);

        const params = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
              params.append(key, value.toString());
            }
          });
        }

        const response = await fetch(`/api/lgpd/data-subject-rights?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data subject requests");
        }

        const data = await response.json();
        setRequests(data.requests);
      } catch (error) {
        setError(error as Error);
        toast.error("Erro ao carregar solicitações");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const createRequest = useCallback(
    async (requestData: { request_type: string; description?: string }) => {
      try {
        const response = await fetch("/api/lgpd/data-subject-rights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          throw new Error("Failed to create request");
        }

        const data = await response.json();
        toast.success("Solicitação criada com sucesso");

        // Refresh requests
        await fetchRequests();

        return data.request;
      } catch (error) {
        setError(error as Error);
        toast.error("Erro ao criar solicitação");
        throw error;
      }
    },
    [fetchRequests],
  );

  const updateRequest = useCallback(
    async (
      requestId: string,
      updateData: {
        status?: string;
        response_data?: unknown;
        notes?: string;
      },
    ) => {
      try {
        const response = await fetch("/api/lgpd/data-subject-rights", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ request_id: requestId, ...updateData }),
        });

        if (!response.ok) {
          throw new Error("Failed to update request");
        }

        const data = await response.json();
        toast.success("Solicitação atualizada com sucesso");

        // Refresh requests
        await fetchRequests();

        return data.request;
      } catch (error) {
        setError(error as Error);
        toast.error("Erro ao atualizar solicitação");
        throw error;
      }
    },
    [fetchRequests],
  );

  return {
    requests,
    isLoading,
    error,
    fetchRequests,
    createRequest,
    updateRequest,
  };
}

// Breach Management Hook
export function useBreachManagement() {
  const [breaches, setBreaches] = useState<BreachIncident[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>();

  const fetchBreaches = useCallback(
    async (filters?: {
      severity?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) => {
      try {
        setIsLoading(true);
        setError(undefined);

        const params = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
              params.append(key, value.toString());
            }
          });
        }

        const response = await fetch(`/api/lgpd/breach?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch breach incidents");
        }

        const data = await response.json();
        setBreaches(data.breaches);
      } catch (error) {
        setError(error as Error);
        toast.error("Erro ao carregar incidentes");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const reportBreach = useCallback(
    async (breachData: {
      title: string;
      description: string;
      severity: string;
      affected_users: number;
      data_types: string[];
      discovered_at: string;
    }) => {
      try {
        const response = await fetch("/api/lgpd/breach", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(breachData),
        });

        if (!response.ok) {
          throw new Error("Failed to report breach");
        }

        const data = await response.json();
        toast.success("Incidente reportado com sucesso");

        // Refresh breaches
        await fetchBreaches();

        return data.breach;
      } catch (error) {
        setError(error as Error);
        toast.error("Erro ao reportar incidente");
        throw error;
      }
    },
    [fetchBreaches],
  );

  const updateBreach = useCallback(
    async (
      breachId: string,
      updateData: {
        status?: string;
        severity?: string;
        assigned_to?: string;
        authority_notified?: boolean;
        users_notified?: boolean;
        mitigation_steps?: string;
      },
    ) => {
      try {
        const response = await fetch("/api/lgpd/breach", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ breach_id: breachId, ...updateData }),
        });

        if (!response.ok) {
          throw new Error("Failed to update breach");
        }

        const data = await response.json();
        toast.success("Incidente atualizado com sucesso");

        // Refresh breaches
        await fetchBreaches();

        return data.breach;
      } catch (error) {
        setError(error as Error);
        toast.error("Erro ao atualizar incidente");
        throw error;
      }
    },
    [fetchBreaches],
  );

  return {
    breaches,
    isLoading,
    error,
    fetchBreaches,
    reportBreach,
    updateBreach,
  };
}

// Audit Trail Hook
export function useAuditTrail() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>();

  const fetchEvents = useCallback(
    async (filters?: {
      event_type?: string;
      user_id?: string;
      resource_type?: string;
      action?: string;
      start_date?: string;
      end_date?: string;
      page?: number;
      limit?: number;
    }) => {
      try {
        setIsLoading(true);
        setError(undefined);

        const params = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
              params.append(key, value.toString());
            }
          });
        }

        const response = await fetch(`/api/lgpd/audit?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch audit events");
        }

        const data = await response.json();
        setEvents(data.events);
      } catch (error) {
        setError(error as Error);
        toast.error("Erro ao carregar eventos de auditoria");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const exportEvents = useCallback(
    async (format: "json" | "csv", filters?: unknown) => {
      try {
        const params = new URLSearchParams();
        params.append("export", format);

        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              params.append(key, value.toString());
            }
          });
        }

        const response = await fetch(`/api/lgpd/audit?${params}`);
        if (!response.ok) {
          throw new Error("Failed to export audit events");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-trail-${new Date().toISOString().split("T")[0]}.${format}`;
        document.body.append(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success("Exportação concluída com sucesso");
      } catch (error) {
        setError(error as Error);
        toast.error("Erro ao exportar eventos");
        throw error;
      }
    },
    [],
  );

  return {
    events,
    isLoading,
    error,
    fetchEvents,
    exportEvents,
  };
}

// Compliance Assessment Hook
export function useComplianceAssessment() {
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>();

  const fetchAssessments = useCallback(
    async (filters?: {
      assessment_type?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) => {
      try {
        setIsLoading(true);
        setError(undefined);

        const params = new URLSearchParams();
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
              params.append(key, value.toString());
            }
          });
        }

        const response = await fetch(`/api/lgpd/compliance?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch assessments");
        }

        const data = await response.json();
        setAssessments(data.assessments || []);
      } catch (error) {
        setError(error as Error);
        toast.error("Erro ao carregar avaliações");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const createAssessment = useCallback(
    async (assessmentData: { assessment_type: "manual" | "automated" }) => {
      try {
        const response = await fetch("/api/lgpd/compliance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(assessmentData),
        });

        if (!response.ok) {
          throw new Error("Failed to create assessment");
        }

        const data = await response.json();
        toast.success("Avaliação criada com sucesso");

        // Refresh assessments
        await fetchAssessments();

        return data.assessment;
      } catch (error) {
        setError(error as Error);
        toast.error("Erro ao criar avaliação");
        throw error;
      }
    },
    [fetchAssessments],
  );

  const runAutomatedAssessment = useCallback(async () => {
    try {
      const response = await fetch("/api/lgpd/compliance", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to run automated assessment");
      }

      const data = await response.json();
      toast.success("Avaliação automatizada executada com sucesso");

      // Refresh assessments
      await fetchAssessments();

      return data.assessment;
    } catch (error) {
      setError(error as Error);
      toast.error("Erro ao executar avaliação automatizada");
      throw error;
    }
  }, [fetchAssessments]);

  return {
    assessments,
    isLoading,
    error,
    fetchAssessments,
    createAssessment,
    runAutomatedAssessment,
  };
}

// Consent Banner Hook (for public use)
export function useConsentBanner() {
  const [purposes, setPurposes] = useState<any[]>([]);
  const [userConsents, setUserConsents] = useState<ConsentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>();
  const user = useUser();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  );

  const fetchConsentPurposes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      const { data, error } = await supabase
        .from("lgpd_consent_purposes")
        .select("*")
        .eq("active", true)
        .order("display_order");

      if (error) {
        throw error;
      }
      setPurposes(data || []);
    } catch (error) {
      setError(error as Error);
      toast.error("Erro ao carregar finalidades de consentimento");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const fetchUserConsents = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      const response = await fetch(`/api/lgpd/consent?user_id=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user consents");
      }

      const data = await response.json();
      setUserConsents(data.consents || []);
    } catch (error) {
      setError(error as Error);
    }
  }, [user?.id]);

  const updateUserConsent = useCallback(
    async (purposeId: string, granted: boolean) => {
      try {
        const response = await fetch("/api/lgpd/consent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            purpose_id: purposeId,
            granted,
            ip_address: window.location.hostname,
            user_agent: navigator.userAgent,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update consent");
        }

        // Refresh user consents
        await fetchUserConsents();

        toast.success(
          granted ? "Consentimento concedido" : "Consentimento retirado",
        );
      } catch (error) {
        setError(error as Error);
        toast.error("Erro ao atualizar consentimento");
        throw error;
      }
    },
    [fetchUserConsents],
  );

  useEffect(() => {
    fetchConsentPurposes();
  }, [fetchConsentPurposes]);

  useEffect(() => {
    if (user?.id) {
      fetchUserConsents();
    }
  }, [user?.id, fetchUserConsents]);

  return {
    purposes,
    userConsents,
    isLoading,
    error,
    updateUserConsent,
    refetch: () => {
      fetchConsentPurposes();
      fetchUserConsents();
    },
  };
}
