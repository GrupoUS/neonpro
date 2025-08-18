import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ComplianceAutomationState {
  isCompliant: boolean;
  violations: string[];
  lastCheck: Date | null;
  isLoading: boolean;
}

export const useComplianceAutomation = () => {
  const [state, setState] = useState<ComplianceAutomationState>({
    isCompliant: false,
    violations: [],
    lastCheck: null,
    isLoading: false,
  });

  const checkCompliance = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Healthcare compliance checks for NeonPro
      const { data: complianceData, error } = await supabase
        .from('compliance_checks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      const violations: string[] = [];

      // LGPD compliance checks
      if (!complianceData?.[0]?.lgpd_compliant) {
        violations.push('LGPD compliance violation detected');
      }

      // ANVISA compliance checks
      if (!complianceData?.[0]?.anvisa_compliant) {
        violations.push('ANVISA compliance violation detected');
      }

      // CFM compliance checks
      if (!complianceData?.[0]?.cfm_compliant) {
        violations.push('CFM compliance violation detected');
      }

      setState({
        isCompliant: violations.length === 0,
        violations,
        lastCheck: new Date(),
        isLoading: false,
      });
    } catch (error) {
      console.error('Compliance check failed:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        violations: ['Compliance check system error'],
      }));
    }
  }, []);

  useEffect(() => {
    // Auto-check compliance on mount
    checkCompliance();
  }, [checkCompliance]);

  return {
    ...state,
    checkCompliance,
    refreshCompliance: checkCompliance,
  };
};
