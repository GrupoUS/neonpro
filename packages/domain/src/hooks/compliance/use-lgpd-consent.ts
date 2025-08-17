'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from '../placeholders/sonner';

export type ConsentType =
  | 'data_collection'
  | 'data_processing'
  | 'data_sharing'
  | 'marketing'
  | 'analytics'
  | 'cookies'
  | 'medical_data'
  | 'sensitive_data';

export type ConsentRecord = {
  id: string;
  patient_id: string;
  consent_type: ConsentType;
  granted: boolean;
  purpose: string;
  legal_basis: string;
  granted_at?: string;
  revoked_at?: string;
  expires_at?: string;
  version: number;
  metadata?: Record<string, any>;
};

export type DataAccessLog = {
  id: string;
  patient_id: string;
  user_id: string;
  action: string;
  resource: string;
  purpose: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
};

export type UseLGPDConsentOptions = {
  patientId?: string;
  autoRefresh?: boolean;
  onConsentChange?: (consents: ConsentRecord[]) => void;
};

export type UseLGPDConsentReturn = {
  consents: ConsentRecord[];
  isLoading: boolean;
  error: string | null;
  grantConsent: (
    patientId: string,
    consentTypes: ConsentType[],
    purpose: string,
    legalBasis: string
  ) => Promise<boolean>;
  revokeConsent: (
    patientId: string,
    consentTypes: string[]
  ) => Promise<boolean>;
  checkConsent: (patientId: string, consentType: ConsentType) => boolean | null;
  getConsentHistory: (
    patientId: string,
    consentType?: ConsentType
  ) => Promise<ConsentRecord[]>;
  getDataAccessLogs: (
    patientId: string,
    dateRange?: { start: Date; end: Date }
  ) => Promise<DataAccessLog[]>;
  exportConsentData: (
    patientId: string,
    format?: 'json' | 'csv'
  ) => Promise<string | null>;
  refreshConsents: () => Promise<void>;
};

export function useLGPDConsent(
  options: UseLGPDConsentOptions = {}
): UseLGPDConsentReturn {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log functions defined first
  const logDataAccess = useCallback(
    (
      _action: string,
      _resource: string,
      _patientId: string,
      _purpose: string
    ) => {},
    []
  );

  const logDataModification = useCallback(
    (
      _action: string,
      _resource: string,
      _patientId: string,
      _changes: any
    ) => {},
    []
  );

  const refreshConsents = useCallback(async (): Promise<void> => {
    if (!options.patientId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Placeholder implementation
      const mockConsents: ConsentRecord[] = [
        {
          id: '1',
          patient_id: options.patientId,
          consent_type: 'data_collection',
          granted: true,
          purpose: 'Medical treatment',
          legal_basis: 'Legitimate interest',
          granted_at: new Date().toISOString(),
          version: 1,
        },
      ];

      setConsents(mockConsents);

      if (options.onConsentChange) {
        options.onConsentChange(mockConsents);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro ao carregar consentimentos: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [options.patientId, options.onConsentChange]);

  const grantConsent = useCallback(
    async (
      patientId: string,
      consentTypes: ConsentType[],
      purpose: string,
      legalBasis: string
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        logDataAccess('grant_consent', 'patient_consents', patientId, purpose);

        const newConsents: ConsentRecord[] = consentTypes.map((type) => ({
          id: `consent-${Date.now()}-${type}`,
          patient_id: patientId,
          consent_type: type,
          granted: true,
          purpose,
          legal_basis: legalBasis,
          granted_at: new Date().toISOString(),
          version: 1,
        }));

        setConsents((prev) => [...prev, ...newConsents]);

        toast.success('Consentimento registrado com sucesso');
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        toast.error(`Erro ao registrar consentimento: ${errorMessage}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [logDataAccess]
  );

  const revokeConsent = useCallback(
    async (patientId: string, consentTypes: string[]): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        logDataAccess(
          'revoke_consent',
          'patient_consents',
          patientId,
          'Consent revocation'
        );

        setConsents((prev) =>
          prev.map((consent) =>
            consentTypes.includes(consent.consent_type) &&
            consent.patient_id === patientId
              ? {
                  ...consent,
                  granted: false,
                  revoked_at: new Date().toISOString(),
                }
              : consent
          )
        );

        logDataModification('revoke_consent', 'patient_consents', patientId, {
          consentTypes,
        });

        toast.success('Consentimento revogado com sucesso');
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        toast.error(`Erro ao revogar consentimento: ${errorMessage}`);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [logDataAccess, logDataModification]
  );

  const checkConsent = useCallback(
    (patientId: string, consentType: ConsentType): boolean | null => {
      const consent = consents.find(
        (c) => c.patient_id === patientId && c.consent_type === consentType
      );

      if (!consent) {
        return null;
      }

      if (consent.expires_at && new Date(consent.expires_at) < new Date()) {
        return false;
      }

      return consent.granted;
    },
    [consents]
  );

  const getConsentHistory = useCallback(
    async (
      patientId: string,
      consentType?: ConsentType
    ): Promise<ConsentRecord[]> => {
      try {
        logDataAccess(
          'get_consent_history',
          'patient_consents',
          patientId,
          'History review'
        );

        // Placeholder implementation
        const filteredConsents = consents.filter((consent) => {
          if (consent.patient_id !== patientId) {
            return false;
          }
          if (consentType && consent.consent_type !== consentType) {
            return false;
          }
          return true;
        });

        return filteredConsents;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        return [];
      }
    },
    [consents, logDataAccess]
  );

  const getDataAccessLogs = useCallback(
    async (
      patientId: string,
      _dateRange?: { start: Date; end: Date }
    ): Promise<DataAccessLog[]> => {
      try {
        logDataAccess(
          'get_access_logs',
          'data_access_logs',
          patientId,
          'Audit review'
        );

        // Placeholder implementation
        const mockLogs: DataAccessLog[] = [
          {
            id: '1',
            patient_id: patientId,
            user_id: 'user-1',
            action: 'read',
            resource: 'patient_data',
            purpose: 'Medical consultation',
            timestamp: new Date().toISOString(),
          },
        ];

        return mockLogs;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        return [];
      }
    },
    [logDataAccess]
  );

  const exportConsentData = useCallback(
    async (
      patientId: string,
      format: 'json' | 'csv' = 'json'
    ): Promise<string | null> => {
      try {
        logDataAccess(
          'export_consent_data',
          'patient_consents',
          patientId,
          'Data export'
        );

        const patientConsents = consents.filter(
          (c) => c.patient_id === patientId
        );

        if (format === 'json') {
          return JSON.stringify(patientConsents, null, 2);
        }
        // CSV format
        const headers = [
          'ID',
          'Tipo',
          'Concedido',
          'Propósito',
          'Base Legal',
          'Data de Concessão',
        ];
        const csvRows = [
          headers.join(','),
          ...patientConsents.map((c) =>
            [
              c.id,
              c.consent_type,
              c.granted ? 'Sim' : 'Não',
              c.purpose,
              c.legal_basis,
              c.granted_at || '',
            ].join(',')
          ),
        ];
        return csvRows.join('\n');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        return null;
      }
    },
    [consents, logDataAccess]
  );

  // Initialize data
  useEffect(() => {
    if (options.patientId) {
      refreshConsents();
    }
  }, [options.patientId, refreshConsents]);

  // Auto-refresh
  useEffect(() => {
    if (!(options.autoRefresh && options.patientId)) {
      return;
    }

    const interval = setInterval(() => {
      refreshConsents();
    }, 30_000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [options.autoRefresh, options.patientId, refreshConsents]);

  return {
    consents,
    isLoading,
    error,
    grantConsent,
    revokeConsent,
    checkConsent,
    getConsentHistory,
    getDataAccessLogs,
    exportConsentData,
    refreshConsents,
  };
}
