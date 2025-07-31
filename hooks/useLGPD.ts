'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { LGPDComplianceManager } from '@/lib/lgpd/compliance-manager';
import {
  ConsentRecord,
  ConsentRequest,
  DataSubjectRequest,
  CreateDataSubjectRequest,
  AuditLog,
  BreachIncident,
  ComplianceAssessment,
  LGPDDashboardMetrics,
  LGPDDataType,
  LGPDPurpose,
  DataSubjectRequestType,
  LGPDConfiguration
} from '@/types/lgpd';

/**
 * LGPD Compliance Hook
 * 
 * Provides React integration for LGPD compliance management
 */
export function useLGPDCompliance() {
  const { supabase } = useSupabase();
  const [complianceManager, setComplianceManager] = useState<LGPDComplianceManager | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize compliance manager
  useEffect(() => {
    if (supabase) {
      const config: LGPDConfiguration = {
        auto_consent_renewal: true,
        consent_expiry_days: 730, // 2 years
        data_retention_days: 2555, // 7 years
        breach_notification_hours: 72,
        assessment_schedule: 'quarterly',
        auto_data_cleanup: true,
        require_explicit_consent: true,
        enable_audit_trail: true,
        notification_email: process.env.NEXT_PUBLIC_LGPD_NOTIFICATION_EMAIL || 'lgpd@neonpro.com.br'
      };

      const manager = new LGPDComplianceManager(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        config
      );
      
      setComplianceManager(manager);
    }
  }, [supabase]);

  const handleError = useCallback((error: unknown, context: string) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`LGPD ${context} error:`, error);
    setError(`${context}: ${message}`);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    complianceManager,
    loading,
    error,
    clearError
  };
}

/**
 * Consent Management Hook
 */
export function useConsentManagement() {
  const { complianceManager } = useLGPDCompliance();
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grantConsent = useCallback(async (
    userId: string,
    request: ConsentRequest,
    metadata?: { ip_address?: string; user_agent?: string }
  ) => {
    if (!complianceManager) throw new Error('Compliance manager not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      const consent = await complianceManager.grantConsent(userId, request, metadata);
      setConsents(prev => [consent, ...prev]);
      return consent;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to grant consent';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [complianceManager]);

  const withdrawConsent = useCallback(async (
    userId: string,
    consentId: string,
    reason?: string
  ) => {
    if (!complianceManager) throw new Error('Compliance manager not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      await complianceManager.withdrawConsent(userId, consentId, reason);
      setConsents(prev => prev.map(consent => 
        consent.id === consentId 
          ? { ...consent, consent_given: false, withdrawn_at: new Date() }
          : consent
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to withdraw consent';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [complianceManager]);

  const getUserConsents = useCallback(async (userId: string) => {
    if (!complianceManager) throw new Error('Compliance manager not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      const userConsents = await complianceManager.getUserConsents(userId);
      setConsents(userConsents);
      return userConsents;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get user consents';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [complianceManager]);

  const getActiveConsent = useCallback(async (
    userId: string,
    dataType: LGPDDataType,
    purpose: LGPDPurpose
  ) => {
    if (!complianceManager) throw new Error('Compliance manager not initialized');
    
    try {
      return await complianceManager.getActiveConsent(userId, dataType, purpose);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get active consent';
      setError(message);
      throw err;
    }
  }, [complianceManager]);

  return {
    consents,
    loading,
    error,
    grantConsent,
    withdrawConsent,
    getUserConsents,
    getActiveConsent,
    clearError: () => setError(null)
  };
}

/**
 * Data Subject Rights Hook
 */
export function useDataSubjectRights() {
  const { complianceManager } = useLGPDCompliance();
  const [requests, setRequests] = useState<DataSubjectRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRequest = useCallback(async (
    userId: string,
    request: CreateDataSubjectRequest
  ) => {
    if (!complianceManager) throw new Error('Compliance manager not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      const dataSubjectRequest = await complianceManager.createDataSubjectRequest(userId, request);
      setRequests(prev => [dataSubjectRequest, ...prev]);
      return dataSubjectRequest;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create data subject request';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [complianceManager]);

  const processRequest = useCallback(async (requestId: string) => {
    if (!complianceManager) throw new Error('Compliance manager not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      await complianceManager.processDataSubjectRequest(requestId);
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'fulfilled', fulfilled_at: new Date() }
          : req
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process data subject request';
      setError(message);
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected', rejection_reason: message }
          : req
      ));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [complianceManager]);

  return {
    requests,
    loading,
    error,
    createRequest,
    processRequest,
    clearError: () => setError(null)
  };
}

/**
 * Audit Trail Hook
 */
export function useAuditTrail() {
  const { complianceManager } = useLGPDCompliance();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyIntegrity = useCallback(async (startDate?: Date, endDate?: Date) => {
    if (!complianceManager) throw new Error('Compliance manager not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await complianceManager.verifyAuditTrailIntegrity(startDate, endDate);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify audit trail integrity';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [complianceManager]);

  return {
    auditLogs,
    loading,
    error,
    verifyIntegrity,
    clearError: () => setError(null)
  };
}

/**
 * Breach Management Hook
 */
export function useBreachManagement() {
  const { complianceManager } = useLGPDCompliance();
  const [incidents, setIncidents] = useState<BreachIncident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportBreach = useCallback(async (incident: Omit<BreachIncident, 'id' | 'detected_at' | 'reported_to_authority' | 'created_at' | 'updated_at'>) => {
    if (!complianceManager) throw new Error('Compliance manager not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      const breachIncident = await complianceManager.reportBreach(incident);
      setIncidents(prev => [breachIncident, ...prev]);
      return breachIncident;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to report breach';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [complianceManager]);

  return {
    incidents,
    loading,
    error,
    reportBreach,
    clearError: () => setError(null)
  };
}

/**
 * Compliance Assessment Hook
 */
export function useComplianceAssessment() {
  const { complianceManager } = useLGPDCompliance();
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAssessment = useCallback(async () => {
    if (!complianceManager) throw new Error('Compliance manager not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      const assessment = await complianceManager.runComplianceAssessment();
      setAssessments(prev => [assessment, ...prev]);
      return assessment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to run compliance assessment';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [complianceManager]);

  return {
    assessments,
    loading,
    error,
    runAssessment,
    clearError: () => setError(null)
  };
}

/**
 * LGPD Dashboard Hook
 */
export function useLGPDDashboard() {
  const { complianceManager } = useLGPDCompliance();
  const [metrics, setMetrics] = useState<LGPDDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    if (!complianceManager) throw new Error('Compliance manager not initialized');
    
    setLoading(true);
    setError(null);
    
    try {
      const dashboardMetrics = await complianceManager.getDashboardMetrics();
      setMetrics(dashboardMetrics);
      return dashboardMetrics;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard metrics';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [complianceManager]);

  // Auto-load metrics when manager is available
  useEffect(() => {
    if (complianceManager && !metrics) {
      loadMetrics();
    }
  }, [complianceManager, metrics, loadMetrics]);

  return {
    metrics,
    loading,
    error,
    loadMetrics,
    clearError: () => setError(null)
  };
}

/**
 * Consent Banner Hook
 * 
 * Simplified hook for consent banner implementation
 */
export function useConsentBanner(userId?: string) {
  const { grantConsent, getActiveConsent } = useConsentManagement();
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const checkConsent = useCallback(async (dataType: LGPDDataType, purpose: LGPDPurpose) => {
    if (!userId) return false;
    
    setLoading(true);
    try {
      const consent = await getActiveConsent(userId, dataType, purpose);
      const hasActiveConsent = consent?.consent_given && !consent.withdrawn_at;
      setHasConsent(hasActiveConsent);
      return hasActiveConsent;
    } catch (error) {
      console.error('Error checking consent:', error);
      setHasConsent(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId, getActiveConsent]);

  const acceptConsent = useCallback(async (
    dataType: LGPDDataType,
    purpose: LGPDPurpose,
    metadata?: { ip_address?: string; user_agent?: string }
  ) => {
    if (!userId) throw new Error('User ID required');
    
    const request: ConsentRequest = {
      data_type: dataType,
      purpose,
      consent_given: true,
      legal_basis: 'consent'
    };

    await grantConsent(userId, request, metadata);
    setHasConsent(true);
  }, [userId, grantConsent]);

  return {
    hasConsent,
    loading,
    checkConsent,
    acceptConsent
  };
}
