import type { useState, useCallback } from "react";
import type { toast } from "sonner";

interface LgpdConsentData {
  dataProcessingConsent: boolean;
  sensitiveDataConsent: boolean;
  marketingConsent: boolean;
  dataRetentionAcknowledgment: boolean;
  consentDate?: string;
  consentVersion: string;
}

interface LgpdAuditEntry {
  patientId: string;
  action: "create" | "read" | "update" | "delete" | "consent_given" | "consent_revoked";
  dataFields: string[];
  legalBasis: string;
  userAgent?: string;
  ipAddress?: string;
  timestamp: string;
}

interface UseLgpdConsentReturn {
  // Consent state
  consentData: LgpdConsentData | null;
  isLoading: boolean;
  error: string | null;

  // Consent actions
  recordConsent: (consent: LgpdConsentData, patientId: string) => Promise<boolean>;
  revokeConsent: (patientId: string, consentTypes: string[]) => Promise<boolean>;
  updateConsent: (patientId: string, updates: Partial<LgpdConsentData>) => Promise<boolean>;

  // Audit functions
  logDataAccess: (patientId: string, dataFields: string[], action: string) => Promise<void>;
  logDataModification: (patientId: string, dataFields: string[], action: string) => Promise<void>;

  // Compliance checks
  checkConsentValidity: (patientId: string, dataTypes: string[]) => Promise<boolean>;
  getConsentHistory: (patientId: string) => Promise<LgpdAuditEntry[]>;

  // Data rights
  exportPatientData: (patientId: string) => Promise<any>;
  deletePatientData: (patientId: string, confirmCode: string) => Promise<boolean>;
  anonymizePatientData: (patientId: string) => Promise<boolean>;
}

export function useLgpdConsent(): UseLgpdConsentReturn {
  const [consentData, setConsentData] = useState<LgpdConsentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Record initial consent
  const recordConsent = useCallback(
    async (consent: LgpdConsentData, patientId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const consentWithTimestamp = {
          ...consent,
          consentDate: new Date().toISOString(),
          consentVersion: "1.0",
        };

        const response = await fetch(`/api/patients/${patientId}/lgpd/consent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(consentWithTimestamp),
        });

        if (!response.ok) {
          throw new Error("Erro ao registrar consentimento");
        }

        const result = await response.json();
        setConsentData(result.consent);

        // Log consent action for audit
        await logDataAccess(patientId, Object.keys(consent), "consent_given");

        toast.success("Consentimento registrado com sucesso");
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        toast.error(`Erro ao registrar consentimento: ${errorMessage}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Revoke specific consent types
  const revokeConsent = useCallback(
    async (patientId: string, consentTypes: string[]): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/patients/${patientId}/lgpd/consent`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ consentTypes }),
        });

        if (!response.ok) {
          throw new Error("Erro ao revogar consentimento");
        }

        // Log revocation for audit
        await logDataAccess(patientId, consentTypes, "consent_revoked");

        toast.success("Consentimento revogado com sucesso");
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        toast.error(`Erro ao revogar consentimento: ${errorMessage}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Update existing consent
  const updateConsent = useCallback(
    async (patientId: string, updates: Partial<LgpdConsentData>): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/patients/${patientId}/lgpd/consent`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error("Erro ao atualizar consentimento");
        }

        const result = await response.json();
        setConsentData(result.consent);

        // Log update for audit
        await logDataModification(patientId, Object.keys(updates), "update");

        toast.success("Consentimento atualizado com sucesso");
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        toast.error(`Erro ao atualizar consentimento: ${errorMessage}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Log data access for audit trail
  const logDataAccess = useCallback(
    async (patientId: string, dataFields: string[], action: string): Promise<void> => {
      try {
        const auditEntry: LgpdAuditEntry = {
          patientId,
          action: action as any,
          dataFields,
          legalBasis: "Consentimento do titular (Art. 7°, I, LGPD)",
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        };

        await fetch("/api/lgpd/audit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(auditEntry),
        });
      } catch (err) {
        console.error("Erro ao registrar auditoria de acesso:", err);
      }
    },
    [],
  );

  // Log data modification for audit trail
  const logDataModification = useCallback(
    async (patientId: string, dataFields: string[], action: string): Promise<void> => {
      try {
        const auditEntry: LgpdAuditEntry = {
          patientId,
          action: action as any,
          dataFields,
          legalBasis: "Legítimo interesse (Art. 7°, IX, LGPD)",
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        };

        await fetch("/api/lgpd/audit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(auditEntry),
        });
      } catch (err) {
        console.error("Erro ao registrar auditoria de modificação:", err);
      }
    },
    [],
  );

  // Check if consent is valid for specific data types
  const checkConsentValidity = useCallback(
    async (patientId: string, dataTypes: string[]): Promise<boolean> => {
      try {
        const response = await fetch(`/api/patients/${patientId}/lgpd/consent/check`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dataTypes }),
        });

        if (!response.ok) {
          return false;
        }

        const result = await response.json();
        return result.isValid;
      } catch (err) {
        console.error("Erro ao verificar validade do consentimento:", err);
        return false;
      }
    },
    [],
  );

  // Get consent history for patient
  const getConsentHistory = useCallback(async (patientId: string): Promise<LgpdAuditEntry[]> => {
    try {
      const response = await fetch(`/api/patients/${patientId}/lgpd/consent/history`);

      if (!response.ok) {
        throw new Error("Erro ao buscar histórico de consentimento");
      }

      const result = await response.json();
      return result.history;
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
      return [];
    }
  }, []);

  // Export all patient data (LGPD portability right)
  const exportPatientData = useCallback(
    async (patientId: string): Promise<any> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/patients/${patientId}/lgpd/export`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Erro ao exportar dados do paciente");
        }

        const result = await response.json();

        // Log data export for audit
        await logDataAccess(patientId, ["all_data"], "read");

        return result.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [logDataAccess],
  );

  // Delete patient data (LGPD erasure right)
  const deletePatientData = useCallback(
    async (patientId: string, confirmCode: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/patients/${patientId}/lgpd/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ confirmCode }),
        });

        if (!response.ok) {
          throw new Error("Erro ao excluir dados do paciente");
        }

        // Log data deletion for audit
        await logDataModification(patientId, ["all_data"], "delete");

        toast.success("Dados do paciente excluídos com sucesso");
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        toast.error(`Erro ao excluir dados: ${errorMessage}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [logDataModification],
  );

  // Anonymize patient data (LGPD anonymization right)
  const anonymizePatientData = useCallback(
    async (patientId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/patients/${patientId}/lgpd/anonymize`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Erro ao anonimizar dados do paciente");
        }

        // Log data anonymization for audit
        await logDataModification(patientId, ["all_data"], "update");

        toast.success("Dados do paciente anonimizados com sucesso");
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        toast.error(`Erro ao anonimizar dados: ${errorMessage}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [logDataModification],
  );

  return {
    // State
    consentData,
    isLoading,
    error,

    // Consent management
    recordConsent,
    revokeConsent,
    updateConsent,

    // Audit functions
    logDataAccess,
    logDataModification,

    // Compliance checks
    checkConsentValidity,
    getConsentHistory,

    // Data rights
    exportPatientData,
    deletePatientData,
    anonymizePatientData,
  };
}
