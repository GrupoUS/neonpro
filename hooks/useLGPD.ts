/**
 * LGPD Compliance Framework - React Hook
 * Hook para gerenciamento de conformidade LGPD no frontend
 * 
 * @author APEX Master Developer
 * @version 1.0.0
 * @compliance LGPD Art. 7º, 8º, 9º, 18º
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import {
  ConsentType,
  ConsentStatus,
  LegalBasis,
  ConsentRecord,
  DataSubjectRight,
  DataSubjectRequest,
  ConsentCheckResult,
  LGPDContext,
  LGPDApiResponse
} from '../types/lgpd';

// ============================================================================
// TYPES
// ============================================================================

interface UseLGPDOptions {
  clinicId: string;
  autoCheck?: boolean;
  onConsentChange?: (consent: ConsentRecord) => void;
  onError?: (error: string) => void;
}

interface LGPDState {
  consents: ConsentRecord[];
  requests: DataSubjectRequest[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

interface ConsentOptions {
  purpose: string;
  description: string;
  legalBasis?: LegalBasis;
  expiresAt?: Date;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useLGPD(options: UseLGPDOptions) {
  const user = useUser();
  const [state, setState] = useState<LGPDState>({
    consents: [],
    requests: [],
    loading: false,
    error: null,
    initialized: false
  });

  // ============================================================================
  // CONTEXT CREATION
  // ============================================================================

  const createContext = useCallback((): LGPDContext => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    return {
      userId: user.id,
      clinicId: options.clinicId,
      ipAddress: 'client-side', // Will be set server-side
      userAgent: navigator.userAgent,
      timestamp: new Date()
    };
  }, [user?.id, options.clinicId]);

  // ============================================================================
  // API CALLS
  // ============================================================================

  const apiCall = useCallback(async <T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<LGPDApiResponse<T>> => {
    try {
      const response = await fetch(`/api/compliance/${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      options.onError?.(errorMessage);
      throw error;
    }
  }, [options]);

  // ============================================================================
  // CONSENT MANAGEMENT
  // ============================================================================

  const grantConsent = useCallback(async (
    consentType: ConsentType,
    consentOptions: ConsentOptions
  ): Promise<ConsentRecord> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const context = createContext();
      const response = await apiCall<ConsentRecord>('consent/grant', 'POST', {
        context,
        consentType,
        ...consentOptions
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to grant consent');
      }

      const newConsent = response.data;
      setState(prev => ({
        ...prev,
        consents: [newConsent, ...prev.consents],
        loading: false
      }));

      options.onConsentChange?.(newConsent);
      return newConsent;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to grant consent';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  }, [createContext, apiCall, options]);

  const withdrawConsent = useCallback(async (
    consentId: string
  ): Promise<ConsentRecord> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const context = createContext();
      const response = await apiCall<ConsentRecord>('consent/withdraw', 'POST', {
        context,
        consentId
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to withdraw consent');
      }

      const updatedConsent = response.data;
      setState(prev => ({
        ...prev,
        consents: prev.consents.map(c => 
          c.id === consentId ? updatedConsent : c
        ),
        loading: false
      }));

      options.onConsentChange?.(updatedConsent);
      return updatedConsent;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to withdraw consent';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  }, [createContext, apiCall, options]);

  const checkConsent = useCallback(async (
    consentType: ConsentType
  ): Promise<ConsentCheckResult> => {
    try {
      const response = await apiCall<ConsentCheckResult>(
        `consent/check?type=${consentType}&userId=${user?.id}&clinicId=${options.clinicId}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to check consent');
      }

      return response.data;
    } catch (error) {
      console.error('Failed to check consent:', error);
      return {
        hasConsent: false,
        consentType,
        legalBasis: LegalBasis.CONSENT,
        canProcess: false,
        warnings: ['Failed to verify consent']
      };
    }
  }, [user?.id, options.clinicId, apiCall]);

  // ============================================================================
  // DATA SUBJECT RIGHTS
  // ============================================================================

  const submitDataRequest = useCallback(async (
    requestType: DataSubjectRight,
    description: string
  ): Promise<DataSubjectRequest> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const context = createContext();
      const response = await apiCall<DataSubjectRequest>('data-subject/request', 'POST', {
        context,
        requestType,
        description
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to submit request');
      }

      const newRequest = response.data;
      setState(prev => ({
        ...prev,
        requests: [newRequest, ...prev.requests],
        loading: false
      }));

      return newRequest;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit request';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  }, [createContext, apiCall]);

  const requestDataExport = useCallback(async (): Promise<DataSubjectRequest> => {
    return submitDataRequest(
      DataSubjectRight.PORTABILITY,
      'Solicitação de exportação de dados pessoais conforme Art. 18º V da LGPD'
    );
  }, [submitDataRequest]);

  const requestDataDeletion = useCallback(async (): Promise<DataSubjectRequest> => {
    return submitDataRequest(
      DataSubjectRight.ELIMINATION,
      'Solicitação de eliminação de dados pessoais conforme Art. 18º III da LGPD'
    );
  }, [submitDataRequest]);

  const requestDataCorrection = useCallback(async (
    description: string
  ): Promise<DataSubjectRequest> => {
    return submitDataRequest(
      DataSubjectRight.RECTIFICATION,
      `Solicitação de correção de dados: ${description}`
    );
  }, [submitDataRequest]);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadUserConsents = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await apiCall<ConsentRecord[]>(
        `consent/user?userId=${user.id}&clinicId=${options.clinicId}`
      );

      if (response.success && response.data) {
        setState(prev => ({ ...prev, consents: response.data! }));
      }
    } catch (error) {
      console.error('Failed to load user consents:', error);
    }
  }, [user?.id, options.clinicId, apiCall]);

  const loadUserRequests = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await apiCall<DataSubjectRequest[]>(
        `data-subject/requests?userId=${user.id}&clinicId=${options.clinicId}`
      );

      if (response.success && response.data) {
        setState(prev => ({ ...prev, requests: response.data! }));
      }
    } catch (error) {
      console.error('Failed to load user requests:', error);
    }
  }, [user?.id, options.clinicId, apiCall]);

  const initialize = useCallback(async () => {
    if (!user?.id || state.initialized) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      await Promise.all([
        loadUserConsents(),
        loadUserRequests()
      ]);

      setState(prev => ({ 
        ...prev, 
        loading: false, 
        initialized: true,
        error: null 
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Initialization failed';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
    }
  }, [user?.id, state.initialized, loadUserConsents, loadUserRequests]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const activeConsents = useMemo(() => {
    const now = new Date();
    return state.consents.filter(consent => 
      consent.status === ConsentStatus.GRANTED &&
      (!consent.expiresAt || new Date(consent.expiresAt) > now)
    );
  }, [state.consents]);

  const hasValidConsent = useCallback((consentType: ConsentType): boolean => {
    return activeConsents.some(consent => consent.consentType === consentType);
  }, [activeConsents]);

  const getConsentByType = useCallback((consentType: ConsentType): ConsentRecord | undefined => {
    return activeConsents.find(consent => consent.consentType === consentType);
  }, [activeConsents]);

  const pendingRequests = useMemo(() => {
    return state.requests.filter(request => 
      request.status === 'pending' || request.status === 'in_progress'
    );
  }, [state.requests]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (options.autoCheck !== false && user?.id) {
      initialize();
    }
  }, [user?.id, options.autoCheck, initialize]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    ...state,
    activeConsents,
    pendingRequests,

    // Consent Management
    grantConsent,
    withdrawConsent,
    checkConsent,
    hasValidConsent,
    getConsentByType,

    // Data Subject Rights
    submitDataRequest,
    requestDataExport,
    requestDataDeletion,
    requestDataCorrection,

    // Utilities
    initialize,
    refresh: () => {
      setState(prev => ({ ...prev, initialized: false }));
      initialize();
    },
    clearError: () => setState(prev => ({ ...prev, error: null }))
  };
}

export default useLGPD;
