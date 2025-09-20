/**
 * Healthcare Accessibility Audit Hook
 *
 * React hook for real-time healthcare accessibility auditing
 * with Brazilian regulatory compliance validation
 *
 * @package NeonPro Healthcare Accessibility
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AccessibilityTestingOptions } from '../utils/accessibility-testing';
import {
  HealthcareAccessibilityAuditor,
  type HealthcareAccessibilityAuditResult,
  type HealthcareAuditContext,
} from '../utils/healthcare-accessibility-audit';

interface UseHealthcareAccessibilityAuditOptions extends AccessibilityTestingOptions {
  autoRun?: boolean;
  context?: Partial<HealthcareAuditContext>;
  debounceMs?: number;
  enableRealtimeMonitoring?: boolean;
  reportingIntervalMs?: number;
}

interface HealthcareAccessibilityAuditState {
  result: HealthcareAccessibilityAuditResult | null;
  isLoading: boolean;
  error: string | null;
  lastRun: Date | null;
  auditCount: number;
  isMonitoring: boolean;
}

/**
 * React hook for healthcare accessibility auditing
 */
export function useHealthcareAccessibilityAudit(
  targetElement?: HTMLElement | null,
  options: UseHealthcareAccessibilityAuditOptions = {},
) {
  const {
    autoRun = true,
    context: initialContext,
    debounceMs = 500,
    enableRealtimeMonitoring = false,
    reportingIntervalMs = 30000,
    ...axeOptions
  } = options;

  const [state, setState] = useState<HealthcareAccessibilityAuditState>({
    result: null,
    isLoading: false,
    error: null,
    lastRun: null,
    auditCount: 0,
    isMonitoring: enableRealtimeMonitoring,
  });

  const auditorRef = useRef<HealthcareAccessibilityAuditor | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize auditor
  useEffect(() => {
    auditorRef.current = new HealthcareAccessibilityAuditor(initialContext);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, [initialContext]);

  // Auto-run audit on mount and when dependencies change
  useEffect(() => {
    if (autoRun && targetElement) {
      runAudit();
    }
  }, [targetElement, autoRun]);

  // Set up monitoring if enabled
  useEffect(() => {
    if (enableRealtimeMonitoring && targetElement) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [enableRealtimeMonitoring, targetElement]);

  // Main audit function
  const runAudit = useCallback(
    async (customContext?: Partial<HealthcareAuditContext>) => {
      if (!auditorRef.current || !targetElement) {
        setState(prev => ({
          ...prev,
          error: 'Auditor not initialized or target element not available',
        }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Update auditor context if provided
        if (customContext) {
          auditorRef.current.setContext(customContext);
        }

        const result = await auditorRef.current.auditAccessibility(
          targetElement,
          axeOptions,
        );

        setState(prev => ({
          ...prev,
          result,
          isLoading: false,
          lastRun: new Date(),
          auditCount: prev.auditCount + 1,
          error: null,
        }));

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during audit';
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [targetElement, axeOptions],
  );

  // Debounced audit function for performance optimization
  const runAuditDebounced = useCallback(
    (customContext?: Partial<HealthcareAuditContext>) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        runAudit(customContext);
      }, debounceMs);
    },
    [runAudit, debounceMs],
  );

  // Update audit context
  const updateContext = useCallback(
    (context: Partial<HealthcareAuditContext>) => {
      if (auditorRef.current) {
        auditorRef.current.setContext(context);
        // Re-run audit with new context
        runAuditDebounced(context);
      }
    },
    [runAuditDebounced],
  );

  // Start real-time monitoring
  const startMonitoring = useCallback(() => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
    }

    setState(prev => ({ ...prev, isMonitoring: true }));

    monitoringIntervalRef.current = setInterval(() => {
      runAudit().catch(error => {
        console.error('Monitoring audit failed:', error);
      });
    }, reportingIntervalMs);
  }, [runAudit, reportingIntervalMs]);

  // Stop real-time monitoring
  const stopMonitoring = useCallback(() => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }

    setState(prev => ({ ...prev, isMonitoring: false }));
  }, []);

  // Get compliance status
  const getComplianceStatus = useCallback(() => {
    if (!state.result) return 'unknown';

    const { complianceScore, accessibilityScore, healthcareSpecificScore } = state.result;
    const averageScore = (complianceScore + accessibilityScore + healthcareSpecificScore) / 3;

    if (averageScore >= 95) return 'excellent';
    if (averageScore >= 85) return 'good';
    if (averageScore >= 70) return 'fair';
    return 'poor';
  }, [state.result]);

  // Get critical issues count
  const getCriticalIssuesCount = useCallback(() => {
    return state.result?.criticalIssuesCount || 0;
  }, [state.result]);

  // Get emergency issues count
  const getEmergencyIssuesCount = useCallback(() => {
    return state.result?.emergencyIssuesCount || 0;
  }, [state.result]);

  // Get recommendations by priority
  const getRecommendationsByPriority = useCallback(
    (priority: 'immediate' | 'high' | 'medium' | 'low') => {
      return (
        state.result?.recommendations.filter(
          rec => rec.priority === priority,
        ) || []
      );
    },
    [state.result],
  );

  // Check if specific healthcare standard is compliant
  const isStandardCompliant = useCallback(
    (standardId: string) => {
      if (!state.result) return false;

      const standardViolations = state.result.issues.filter(issue =>
        issue.complianceStandards.some(std => std.id === standardId)
      );

      return standardViolations.length === 0;
    },
    [state.result],
  );

  // Generate compliance report
  const generateComplianceReport = useCallback(() => {
    if (!state.result || !auditorRef.current) return null;

    return auditorRef.current.generateComplianceReport(state.result);
  }, [state.result]);

  // Export audit data
  const exportAuditData = useCallback(() => {
    if (!state.result) return null;

    return {
      timestamp: state.result.timestamp,
      context: state.result.context,
      scores: {
        overall: state.result.accessibilityScore,
        healthcare: state.result.healthcareSpecificScore,
        compliance: state.result.complianceScore,
      },
      issues: state.result.issues,
      recommendations: state.result.recommendations,
      summary: {
        totalIssues: state.result.issues.length,
        criticalIssues: state.result.criticalIssuesCount,
        emergencyIssues: state.result.emergencyIssuesCount,
        complianceStatus: getComplianceStatus(),
      },
    };
  }, [state.result, getComplianceStatus]);

  // Simulate user with disability for testing
  const simulateDisabilityProfile = useCallback(
    (profile: 'visual' | 'auditory' | 'motor' | 'cognitive' | 'multiple') => {
      const context: Partial<HealthcareAuditContext> = {
        userDisabilityProfile: profile,
      };

      // Adjust audit options based on disability profile
      const adjustedOptions: AccessibilityTestingOptions = {
        ...axeOptions,
        rules: {
          ...axeOptions.rules,
          // Enable/disable rules based on disability profile
          'color-contrast': profile === 'visual' ? { enabled: true } : { enabled: false },
          'audio-caption': profile === 'auditory' ? { enabled: true } : { enabled: false },
          'keyboard-navigation': profile === 'motor' ? { enabled: true } : { enabled: false },
          'cognitive-complexity': profile === 'cognitive' ? { enabled: true } : { enabled: false },
        },
      };

      updateContext(context);
      return runAudit(context, adjustedOptions);
    },
    [updateContext, runAudit, axeOptions],
  );

  // Simulate emergency scenario
  const simulateEmergencyScenario = useCallback(() => {
    const emergencyContext: Partial<HealthcareAuditContext> = {
      emergencyContext: true,
      patientJourney: 'emergency',
      dataSensitivity: 'critical',
    };

    updateContext(emergencyContext);
    return runAudit(emergencyContext);
  }, [updateContext, runAudit]);

  // Reset audit state
  const resetAudit = useCallback(() => {
    setState({
      result: null,
      isLoading: false,
      error: null,
      lastRun: null,
      auditCount: 0,
      isMonitoring: enableRealtimeMonitoring,
    });
  }, [enableRealtimeMonitoring]);

  return {
    // State
    result: state.result,
    isLoading: state.isLoading,
    error: state.error,
    lastRun: state.lastRun,
    auditCount: state.auditCount,
    isMonitoring: state.isMonitoring,

    // Actions
    runAudit,
    runAuditDebounced,
    updateContext,
    startMonitoring,
    stopMonitoring,
    resetAudit,

    // Analysis helpers
    getComplianceStatus,
    getCriticalIssuesCount,
    getEmergencyIssuesCount,
    getRecommendationsByPriority,
    isStandardCompliant,
    generateComplianceReport,
    exportAuditData,

    // Simulation helpers
    simulateDisabilityProfile,
    simulateEmergencyScenario,

    // Convenience getters
    complianceStatus: getComplianceStatus(),
    criticalIssuesCount: getCriticalIssuesCount(),
    emergencyIssuesCount: getEmergencyIssuesCount(),
    isCompliant: state.result
      ? state.result.accessibilityScore >= 90
        && state.result.complianceScore >= 90
      : false,
    hasCriticalIssues: getCriticalIssuesCount() > 0,
    hasEmergencyIssues: getEmergencyIssuesCount() > 0,
  };
}

/**
 * Hook for specific healthcare journey auditing
 */
export function useHealthcareJourneyAudit(
  journey: HealthcareAuditContext['patientJourney'],
  targetElement?: HTMLElement | null,
  options: Omit<UseHealthcareAccessibilityAuditOptions, 'context'> = {},
) {
  const journeyContext: Partial<HealthcareAuditContext> = {
    patientJourney: journey,
    dataSensitivity: getDataSensitivityForJourney(journey),
  };

  return useHealthcareAccessibilityAudit(targetElement, {
    ...options,
    context: journeyContext,
  });
}

/**
 * Hook for emergency accessibility monitoring
 */
export function useEmergencyAccessibilityAudit(
  targetElement?: HTMLElement | null,
  options: Omit<
    UseHealthcareAccessibilityAuditOptions,
    'context' | 'enableRealtimeMonitoring'
  > = {},
) {
  const emergencyContext: Partial<HealthcareAuditContext> = {
    emergencyContext: true,
    patientJourney: 'emergency',
    dataSensitivity: 'critical',
  };

  return useHealthcareAccessibilityAudit(targetElement, {
    ...options,
    context: emergencyContext,
    enableRealtimeMonitoring: true,
    reportingIntervalMs: 10000, // More frequent monitoring for emergencies
  });
}

// Helper function to determine data sensitivity for journey type
function getDataSensitivityForJourney(
  journey: HealthcareAuditContext['patientJourney'],
): HealthcareAuditContext['dataSensitivity'] {
  switch (journey) {
    case 'emergency':
      return 'critical';
    case 'treatment':
    case 'registration':
      return 'high';
    case 'follow-up':
      return 'medium';
    default:
      return 'medium';
  }
}

export type { HealthcareAccessibilityAuditState, UseHealthcareAccessibilityAuditOptions };
