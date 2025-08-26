"use client";

import { createClient } from "@/app/utils/supabase/client";
import type {
  AestheticTreatmentCategory,
  TreatmentPlan,
  TreatmentPlanSummary,
  TreatmentProgress,
  TreatmentProtocol,
  TreatmentSession,
  TreatmentStatus,
} from "@/types/treatments";
import { useCallback, useEffect, useMemo, useState } from "react";

interface TreatmentsHook {
  // Treatment Plans
  treatmentPlans: TreatmentPlan[];
  activeTreatments: TreatmentPlan[];
  completedTreatments: TreatmentPlan[];
  treatmentPlansSummary: TreatmentPlanSummary[];

  // Treatment Sessions
  upcomingSessions: TreatmentSession[];
  recentSessions: TreatmentSession[];
  todaysSessions: TreatmentSession[];

  // Treatment Protocols
  availableProtocols: TreatmentProtocol[];
  popularProtocols: TreatmentProtocol[];

  // Statistics and Analytics
  totalTreatments: number;
  activeSessionsCount: number;
  completionRate: number;
  averageSatisfactionScore: number;

  // Loading and Error States
  loading: boolean;
  error: Error | null;

  // Search and Filter Functions
  searchTreatments: (query: string) => void;
  filterByCategory: (category: AestheticTreatmentCategory | null) => void;
  filterByStatus: (status: TreatmentStatus | null) => void;
  filterByPatient: (patientId: string | null) => void;

  // CRUD Operations
  getTreatmentById: (id: string) => TreatmentPlan | null;
  createTreatmentPlan: (
    plan: Omit<TreatmentPlan, "id" | "created_at" | "updated_at">,
  ) => Promise<TreatmentPlan | null>;
  updateTreatmentPlan: (
    id: string,
    updates: Partial<TreatmentPlan>,
  ) => Promise<TreatmentPlan | null>;
  deleteTreatmentPlan: (id: string) => Promise<boolean>;

  // Session Management
  scheduleSession: (
    session: Omit<TreatmentSession, "id" | "created_at" | "updated_at">,
  ) => Promise<TreatmentSession | null>;
  completeSession: (
    sessionId: string,
    sessionData: Partial<TreatmentSession>,
  ) => Promise<TreatmentSession | null>;
  cancelSession: (sessionId: string, reason: string) => Promise<boolean>;

  // Progress Tracking
  updateProgress: (
    progressData: Omit<TreatmentProgress, "id" | "recorded_at">,
  ) => Promise<TreatmentProgress | null>;
  getProgressHistory: (treatmentPlanId: string) => Promise<TreatmentProgress[]>;

  // Brazilian Compliance Functions
  validateCFMCompliance: (treatmentPlanId: string) => Promise<boolean>;
  updateLGPDConsent: (
    treatmentPlanId: string,
    consentStatus: boolean,
  ) => Promise<boolean>;
  generateComplianceReport: (treatmentPlanId: string) => Promise<any>;

  // Utility Functions
  refreshData: () => Promise<void>;
  exportTreatmentData: (treatmentPlanId: string) => Promise<any>;
}

export function useTreatments(): TreatmentsHook {
  // State Management
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [treatmentSessions, setTreatmentSessions] = useState<
    TreatmentSession[]
  >([]);
  const [treatmentProtocols, setTreatmentProtocols] = useState<
    TreatmentProtocol[]
  >([]);
  const [_treatmentProgress, _setTreatmentProgress] = useState<
    TreatmentProgress[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<AestheticTreatmentCategory | null>();
  const [statusFilter, setStatusFilter] = useState<TreatmentStatus | null>();
  const [patientFilter, setPatientFilter] = useState<string | null>();

  const supabase = createClient();

  // Fetch Treatment Plans
  const fetchTreatmentPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      let query = supabase
        .from("treatment_plans")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      // Apply filters
      if (searchQuery.trim()) {
        query = query.or(
          `treatment_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`,
        );
      }

      if (categoryFilter) {
        query = query.eq("category", categoryFilter);
      }

      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }

      if (patientFilter) {
        query = query.eq("patient_id", patientFilter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(
          `Erro ao carregar planos de tratamento: ${fetchError.message}`,
        );
      }

      setTreatmentPlans(data || []);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }, [supabase, searchQuery, categoryFilter, statusFilter, patientFilter]);

  // Fetch Treatment Sessions
  const fetchTreatmentSessions = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("treatment_sessions")
        .select("*")
        .order("scheduled_date", { ascending: true });

      if (fetchError) {
        throw new Error(`Erro ao carregar sessões: ${fetchError.message}`);
      }

      setTreatmentSessions(data || []);
    } catch (error) {
      setError(error as Error);
    }
  }, [supabase]);

  // Fetch Treatment Protocols
  const fetchTreatmentProtocols = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("treatment_protocols")
        .select("*")
        .eq("cfm_approved", true)
        .order("protocol_name", { ascending: true });

      if (fetchError) {
        throw new Error(`Erro ao carregar protocolos: ${fetchError.message}`);
      }

      setTreatmentProtocols(data || []);
    } catch (error) {
      setError(error as Error);
    }
  }, [supabase]);

  // Computed Values
  const activeTreatments = useMemo(() => {
    return treatmentPlans.filter((plan) =>
      ["planned", "consent_pending", "active"].includes(plan.status),
    );
  }, [treatmentPlans]);

  const completedTreatments = useMemo(() => {
    return treatmentPlans.filter((plan) => plan.status === "completed");
  }, [treatmentPlans]);

  const treatmentPlansSummary = useMemo((): TreatmentPlanSummary[] => {
    return treatmentPlans.map((plan) => ({
      id: plan.id,
      treatment_name: plan.treatment_name,
      category: plan.category,
      status: plan.status,
      expected_sessions: plan.expected_sessions,
      completed_sessions: plan.completed_sessions,
    }));
  }, [treatmentPlans]);

  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return treatmentSessions
      .filter(
        (session) =>
          session.status === "scheduled" &&
          new Date(session.scheduled_date) > now,
      )
      .slice(0, 10);
  }, [treatmentSessions]);

  const recentSessions = useMemo(() => {
    return treatmentSessions
      .filter((session) => session.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.actual_date || b.scheduled_date).getTime() -
          new Date(a.actual_date || a.scheduled_date).getTime(),
      )
      .slice(0, 10);
  }, [treatmentSessions]);

  const todaysSessions = useMemo(() => {
    const today = new Date().toDateString();
    return treatmentSessions.filter(
      (session) => new Date(session.scheduled_date).toDateString() === today,
    );
  }, [treatmentSessions]);

  const availableProtocols = useMemo(() => {
    return treatmentProtocols.filter((protocol) => protocol.cfm_approved);
  }, [treatmentProtocols]);

  const popularProtocols = useMemo(() => {
    return treatmentProtocols
      .filter((protocol) => protocol.success_rate >= 80)
      .sort(
        (a, b) =>
          b.patient_satisfaction_average - a.patient_satisfaction_average,
      )
      .slice(0, 5);
  }, [treatmentProtocols]);

  // Statistics
  const totalTreatments = treatmentPlans.length;
  const activeSessionsCount = upcomingSessions.length;
  const completionRate =
    totalTreatments > 0
      ? (completedTreatments.length / totalTreatments) * 100
      : 0;
  const averageSatisfactionScore = useMemo(() => {
    const sessionsWithScores = treatmentSessions.filter(
      (s) => s.patient_satisfaction_score,
    );
    if (sessionsWithScores.length === 0) {
      return 0;
    }
    const total = sessionsWithScores.reduce(
      (sum, s) => sum + (s.patient_satisfaction_score || 0),
      0,
    );
    return total / sessionsWithScores.length;
  }, [treatmentSessions]);

  // Filter Functions
  const searchTreatments = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const filterByCategory = useCallback(
    (category: AestheticTreatmentCategory | null) => {
      setCategoryFilter(category);
    },
    [],
  );

  const filterByStatus = useCallback((status: TreatmentStatus | null) => {
    setStatusFilter(status);
  }, []);

  const filterByPatient = useCallback((patientId: string | null) => {
    setPatientFilter(patientId);
  }, []);

  // CRUD Operations
  const getTreatmentById = useCallback(
    (id: string): TreatmentPlan | null => {
      return treatmentPlans.find((plan) => plan.id === id) || undefined;
    },
    [treatmentPlans],
  );

  const createTreatmentPlan = useCallback(
    async (
      plan: Omit<TreatmentPlan, "id" | "created_at" | "updated_at">,
    ): Promise<TreatmentPlan | null> => {
      try {
        const { data, error } = await supabase
          .from("treatment_plans")
          .insert([plan])
          .select()
          .single();

        if (error) {
          throw new Error(
            `Erro ao criar plano de tratamento: ${error.message}`,
          );
        }

        return data;
      } catch (error) {
        setError(error as Error);
        return;
      }
    },
    [supabase],
  );

  const updateTreatmentPlan = useCallback(
    async (
      id: string,
      updates: Partial<TreatmentPlan>,
    ): Promise<TreatmentPlan | null> => {
      try {
        const { data, error } = await supabase
          .from("treatment_plans")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          throw new Error(
            `Erro ao atualizar plano de tratamento: ${error.message}`,
          );
        }

        return data;
      } catch (error) {
        setError(error as Error);
        return;
      }
    },
    [supabase],
  );

  const deleteTreatmentPlan = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error } = await supabase
          .from("treatment_plans")
          .delete()
          .eq("id", id);

        if (error) {
          throw new Error(
            `Erro ao excluir plano de tratamento: ${error.message}`,
          );
        }

        return true;
      } catch (error) {
        setError(error as Error);
        return false;
      }
    },
    [supabase],
  );

  // Session Management Functions (placeholder implementations)
  const scheduleSession = useCallback(
    async (
      _session: Omit<TreatmentSession, "id" | "created_at" | "updated_at">,
    ): Promise<TreatmentSession | null> => {
      return;
    },
    [],
  );

  const completeSession = useCallback(
    async (
      _sessionId: string,
      _sessionData: Partial<TreatmentSession>,
    ): Promise<TreatmentSession | null> => {
      return;
    },
    [],
  );

  const cancelSession = useCallback(
    async (_sessionId: string, _reason: string): Promise<boolean> => {
      return true;
    },
    [],
  );

  // Progress Tracking Functions (placeholder implementations)
  const updateProgress = useCallback(
    async (
      _progressData: Omit<TreatmentProgress, "id" | "recorded_at">,
    ): Promise<TreatmentProgress | null> => {
      return;
    },
    [],
  );

  const getProgressHistory = useCallback(
    async (_treatmentPlanId: string): Promise<TreatmentProgress[]> => {
      return [];
    },
    [],
  );

  // Brazilian Compliance Functions (placeholder implementations)
  const validateCFMCompliance = useCallback(
    async (_treatmentPlanId: string): Promise<boolean> => {
      return true;
    },
    [],
  );

  const updateLGPDConsent = useCallback(
    async (
      _treatmentPlanId: string,
      _consentStatus: boolean,
    ): Promise<boolean> => {
      return true;
    },
    [],
  );

  const generateComplianceReport = useCallback(
    async (_treatmentPlanId: string): Promise<any> => {
      return {};
    },
    [],
  );

  // Utility Functions
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchTreatmentPlans(),
      fetchTreatmentSessions(),
      fetchTreatmentProtocols(),
    ]);
  }, [fetchTreatmentPlans, fetchTreatmentSessions, fetchTreatmentProtocols]);

  const exportTreatmentData = useCallback(
    async (_treatmentPlanId: string): Promise<any> => {
      return {};
    },
    [],
  );

  // Effects
  useEffect(() => {
    fetchTreatmentPlans();
  }, [fetchTreatmentPlans]);

  useEffect(() => {
    fetchTreatmentSessions();
    fetchTreatmentProtocols();
  }, [fetchTreatmentSessions, fetchTreatmentProtocols]);

  // Real-time subscriptions
  useEffect(() => {
    const treatmentPlansChannel = supabase
      .channel("treatment-plans-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "treatment_plans",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTreatmentPlans((prev) => [
              payload.new as TreatmentPlan,
              ...prev,
            ]);
          } else if (payload.eventType === "UPDATE") {
            setTreatmentPlans((prev) =>
              prev.map((plan) =>
                plan.id === payload.new.id
                  ? (payload.new as TreatmentPlan)
                  : plan,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setTreatmentPlans((prev) =>
              prev.filter((plan) => plan.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    const treatmentSessionsChannel = supabase
      .channel("treatment-sessions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "treatment_sessions",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTreatmentSessions((prev) => [
              ...prev,
              payload.new as TreatmentSession,
            ]);
          } else if (payload.eventType === "UPDATE") {
            setTreatmentSessions((prev) =>
              prev.map((session) =>
                session.id === payload.new.id
                  ? (payload.new as TreatmentSession)
                  : session,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setTreatmentSessions((prev) =>
              prev.filter((session) => session.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      treatmentPlansChannel.unsubscribe();
      treatmentSessionsChannel.unsubscribe();
    };
  }, [supabase]);

  return {
    // Treatment Plans
    treatmentPlans,
    activeTreatments,
    completedTreatments,
    treatmentPlansSummary,

    // Treatment Sessions
    upcomingSessions,
    recentSessions,
    todaysSessions,

    // Treatment Protocols
    availableProtocols,
    popularProtocols,

    // Statistics and Analytics
    totalTreatments,
    activeSessionsCount,
    completionRate,
    averageSatisfactionScore,

    // Loading and Error States
    loading,
    error,

    // Search and Filter Functions
    searchTreatments,
    filterByCategory,
    filterByStatus,
    filterByPatient,

    // CRUD Operations
    getTreatmentById,
    createTreatmentPlan,
    updateTreatmentPlan,
    deleteTreatmentPlan,

    // Session Management
    scheduleSession,
    completeSession,
    cancelSession,

    // Progress Tracking
    updateProgress,
    getProgressHistory,

    // Brazilian Compliance Functions
    validateCFMCompliance,
    updateLGPDConsent,
    generateComplianceReport,

    // Utility Functions
    refreshData,
    exportTreatmentData,
  };
}
