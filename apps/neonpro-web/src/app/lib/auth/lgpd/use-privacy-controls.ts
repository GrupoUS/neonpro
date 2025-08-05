/**
 * React Hook for LGPD Privacy Management
 *
 * Provides comprehensive privacy controls, consent management, and data subject
 * rights interface for the NeonPro healthcare application.
 */

import type { useState, useEffect, useCallback } from "react";
import type {
  lgpdComplianceManager,
  PrivacySettings,
  ConsentType,
  DataProcessingPurpose,
  LGPDRights,
  DataSubjectRequest,
  ConsentRecord,
} from "./lgpd-compliance-manager";

export interface UsePrivacyControlsResult {
  settings: PrivacySettings | null;
  isLoading: boolean;
  error?: string;
  updateConsent: (type: ConsentType, granted: boolean) => Promise<void>;
  updateCommunicationPreferences: (preferences: any) => Promise<void>;
  requestDataExport: () => Promise<void>;
  requestDataDeletion: () => Promise<void>;
  requestDataAccess: () => Promise<void>;
  getDataInventory: () => any[];
  refresh: () => Promise<void>;
}

export function usePrivacyControls(userId: string): UsePrivacyControlsResult {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Load privacy settings
  const loadSettings = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(undefined);

      const privacySettings = await lgpdComplianceManager.getPrivacySettings(userId);
      setSettings(privacySettings);
    } catch (err) {
      console.error("Error loading privacy settings:", err);
      setError("Falha ao carregar configurações de privacidade");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Update consent
  const updateConsent = useCallback(
    async (type: ConsentType, granted: boolean) => {
      if (!userId || !settings) return;

      try {
        const updatedSettings = {
          ...settings,
          consents: {
            ...settings.consents,
            [type]: granted,
          },
        };

        await lgpdComplianceManager.updatePrivacySettings(userId, updatedSettings);
        setSettings(updatedSettings);
      } catch (err) {
        console.error("Error updating consent:", err);
        setError("Falha ao atualizar consentimento");
      }
    },
    [userId, settings],
  );

  // Update communication preferences
  const updateCommunicationPreferences = useCallback(
    async (preferences: any) => {
      if (!userId || !settings) return;

      try {
        const updatedSettings = {
          ...settings,
          communicationPreferences: {
            ...settings.communicationPreferences,
            ...preferences,
          },
        };

        await lgpdComplianceManager.updatePrivacySettings(userId, updatedSettings);
        setSettings(updatedSettings);
      } catch (err) {
        console.error("Error updating communication preferences:", err);
        setError("Falha ao atualizar preferências de comunicação");
      }
    },
    [userId, settings],
  );

  // Request data export
  const requestDataExport = useCallback(async () => {
    if (!userId) return;

    try {
      await lgpdComplianceManager.processDataSubjectRequest(userId, LGPDRights.PORTABILITY);
      // In production, would trigger download or email
      alert(
        "Solicitação de exportação de dados enviada. Você receberá um email com os dados em até 30 dias.",
      );
    } catch (err) {
      console.error("Error requesting data export:", err);
      setError("Falha ao solicitar exportação de dados");
    }
  }, [userId]);

  // Request data deletion
  const requestDataDeletion = useCallback(async () => {
    if (!userId) return;

    const confirmed = window.confirm(
      "Tem certeza que deseja solicitar a exclusão dos seus dados? " +
        "Esta ação pode não ser reversível. Dados médicos podem ser mantidos " +
        "conforme exigências legais.",
    );

    if (!confirmed) return;

    try {
      await lgpdComplianceManager.processDataSubjectRequest(userId, LGPDRights.DELETION);
      alert("Solicitação de exclusão de dados enviada. Entraremos em contato em até 30 dias.");
    } catch (err) {
      console.error("Error requesting data deletion:", err);
      setError("Falha ao solicitar exclusão de dados");
    }
  }, [userId]);

  // Request data access
  const requestDataAccess = useCallback(async () => {
    if (!userId) return;

    try {
      await lgpdComplianceManager.processDataSubjectRequest(userId, LGPDRights.ACCESS);
      alert("Solicitação de acesso aos dados enviada. Você receberá um relatório em até 30 dias.");
    } catch (err) {
      console.error("Error requesting data access:", err);
      setError("Falha ao solicitar acesso aos dados");
    }
  }, [userId]);

  // Get data inventory
  const getDataInventory = useCallback(() => {
    return lgpdComplianceManager.getDataRetentionSchedule();
  }, []);

  // Refresh settings
  const refresh = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    error,
    updateConsent,
    updateCommunicationPreferences,
    requestDataExport,
    requestDataDeletion,
    requestDataAccess,
    getDataInventory,
    refresh,
  };
}

// Hook for consent management
export function useConsentManagement(userId: string) {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadConsents = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);

      // Get consent history from localStorage (in production, from API)
      const stored = localStorage.getItem("lgpd_consents");
      const allConsents: ConsentRecord[] = stored ? JSON.parse(stored) : [];
      const userConsents = allConsents.filter((c) => c.userId === userId);

      setConsents(userConsents);
    } catch (err) {
      console.error("Error loading consents:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const grantConsent = useCallback(
    async (type: ConsentType, purpose: DataProcessingPurpose) => {
      if (!userId) return;

      try {
        const consent = await lgpdComplianceManager.recordConsent(userId, type, purpose, true);
        setConsents((prev) => [...prev, consent]);
      } catch (err) {
        console.error("Error granting consent:", err);
      }
    },
    [userId],
  );

  const withdrawConsent = useCallback(
    async (type: ConsentType, purpose: DataProcessingPurpose) => {
      if (!userId) return;

      try {
        const consent = await lgpdComplianceManager.recordConsent(userId, type, purpose, false);
        setConsents((prev) => [...prev, consent]);
      } catch (err) {
        console.error("Error withdrawing consent:", err);
      }
    },
    [userId],
  );

  useEffect(() => {
    loadConsents();
  }, [loadConsents]);

  return {
    consents,
    isLoading,
    grantConsent,
    withdrawConsent,
    refresh: loadConsents,
  };
}

// Hook for data subject requests
export function useDataSubjectRequests(userId: string) {
  const [requests, setRequests] = useState<DataSubjectRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);

      // Get requests from localStorage (in production, from API)
      const stored = localStorage.getItem("lgpd_requests");
      const allRequests: DataSubjectRequest[] = stored ? JSON.parse(stored) : [];
      const userRequests = allRequests.filter((r) => r.userId === userId);

      setRequests(userRequests);
    } catch (err) {
      console.error("Error loading data subject requests:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const submitRequest = useCallback(
    async (type: LGPDRights, description?: string) => {
      if (!userId) return;

      try {
        const request = await lgpdComplianceManager.processDataSubjectRequest(
          userId,
          type,
          description,
        );
        setRequests((prev) => [...prev, request]);
        return request;
      } catch (err) {
        console.error("Error submitting data subject request:", err);
        throw err;
      }
    },
    [userId],
  );

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  return {
    requests,
    isLoading,
    submitRequest,
    refresh: loadRequests,
  };
}
