// ============================================================================
// Supplier Management Hooks - Epic 6, Story 6.3
// ============================================================================
// React hooks for supplier management, performance tracking, procurement,
// and quality management in NeonPro clinic management system
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/app/utils/supabase/client';
import {
  type ContractType,
  IssueStatus,
  type ProcurementRequest,
  type QualityIssue,
  type QualityIssueType,
  type RiskLevel,
  type Supplier,
  type SupplierAnalytics,
  type SupplierBid,
  type SupplierCategory,
  type SupplierCommunication,
  type SupplierContract,
  type SupplierFormData,
  type SupplierPerformance,
  SupplierStatus,
} from '@/lib/types/supplier';

// ============================================================================
// SUPPLIER MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook for managing suppliers - CRUD operations with validation and caching
 */
export function useSuppliers(
  clinicId?: string,
  filters?: {
    status?: SupplierStatus[];
    category?: SupplierCategory[];
    search?: string;
    riskLevel?: RiskLevel[];
  }
) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Use demo clinic ID if not provided (for testing)
  const effectiveClinicId = clinicId || '89084c3a-9200-4058-a15a-b440d3c60687';

  // Query for fetching suppliers
  const {
    data: suppliers = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['suppliers', effectiveClinicId, filters],
    queryFn: async () => {
      let query = supabase
        .from('suppliers')
        .select(
          `
          *,
          contacts:supplier_contacts(*),
          products:supplier_products(*),
          contracts:supplier_contracts(*),
          performance:supplier_performance_metrics(*)
        `
        )
        .eq('clinic_id', effectiveClinicId)
        .order('name');

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.category?.length) {
        query = query.in('category', filters.category);
      }
      if (filters?.riskLevel?.length) {
        query = query.in('risk_level', filters.riskLevel);
      }
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,legal_name.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }
      return data as Supplier[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Create supplier mutation
  const createSupplier = useMutation({
    mutationFn: async (
      supplierData: Omit<SupplierFormData, 'id' | 'created_at' | 'updated_at'>
    ) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          ...supplierData,
          clinic_id: effectiveClinicId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data as Supplier;
    },
    onSuccess: (newSupplier) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success(`Fornecedor ${newSupplier.name} criado com sucesso!`);
    },
    onError: (error) => {
      console.error('Erro ao criar fornecedor:', error);
      toast.error('Erro ao criar fornecedor. Tente novamente.');
    },
  });

  // Update supplier mutation
  const updateSupplier = useMutation({
    mutationFn: async ({
      id,
      ...supplierData
    }: Partial<SupplierFormData> & { id: string }) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update({
          ...supplierData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data as Supplier;
    },
    onSuccess: (updatedSupplier) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({
        queryKey: ['supplier', updatedSupplier.id],
      });
      toast.success(
        `Fornecedor ${updatedSupplier.name} atualizado com sucesso!`
      );
    },
    onError: (error) => {
      console.error('Erro ao atualizar fornecedor:', error);
      toast.error('Erro ao atualizar fornecedor. Tente novamente.');
    },
  });

  // Delete supplier mutation
  const deleteSupplier = useMutation({
    mutationFn: async (supplierId: string) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId);

      if (error) {
        throw error;
      }
      return supplierId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Fornecedor removido com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao remover fornecedor:', error);
      toast.error('Erro ao remover fornecedor. Tente novamente.');
    },
  });

  // Activate/Deactivate supplier
  const toggleSupplierStatus = useMutation({
    mutationFn: async ({
      supplierId,
      newStatus,
    }: {
      supplierId: string;
      newStatus: SupplierStatus;
    }) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', supplierId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data as Supplier;
    },
    onSuccess: (updatedSupplier) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      const statusText =
        updatedSupplier.status === SupplierStatus.ACTIVE
          ? 'ativado'
          : 'desativado';
      toast.success(
        `Fornecedor ${updatedSupplier.name} ${statusText} com sucesso!`
      );
    },
    onError: (error) => {
      console.error('Erro ao alterar status do fornecedor:', error);
      toast.error('Erro ao alterar status do fornecedor. Tente novamente.');
    },
  });

  return {
    suppliers,
    isLoading,
    error,
    refetch,
    createSupplier: createSupplier.mutate,
    updateSupplier: updateSupplier.mutate,
    deleteSupplier: deleteSupplier.mutate,
    toggleSupplierStatus: toggleSupplierStatus.mutate,
    isCreating: createSupplier.isPending,
    isUpdating: updateSupplier.isPending,
    isDeleting: deleteSupplier.isPending,
    isTogglingStatus: toggleSupplierStatus.isPending,
  };
}

/**
 * Hook for managing a single supplier - detailed view with relationships
 */
export function useSupplier(supplierId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const {
    data: supplier,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select(
          `
          *,
          contacts:supplier_contacts(*),
          products:supplier_products(*),
          contracts:supplier_contracts(*),
          performance:supplier_performance_metrics(*),
          communications:supplier_communications(*)
        `
        )
        .eq('id', supplierId)
        .single();

      if (error) {
        throw error;
      }
      return data as Supplier;
    },
    enabled: Boolean(supplierId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    supplier,
    isLoading,
    error,
    refetch: () =>
      queryClient.invalidateQueries({ queryKey: ['supplier', supplierId] }),
  };
}

// ============================================================================
// PERFORMANCE TRACKING HOOKS
// ============================================================================

/**
 * Hook for managing supplier performance tracking and analytics
 */
export function useSupplierPerformance(supplierId: string, period?: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Get performance data for supplier
  const {
    data: performance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['supplier-performance', supplierId, period],
    queryFn: async () => {
      let query = supabase
        .from('supplier_performance_metrics')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('metric_date', { ascending: false });

      if (period) {
        query = query.eq('metric_period', period);
      } else {
        query = query.limit(12); // Last 12 periods
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }
      return data as SupplierPerformance[];
    },
    enabled: Boolean(supplierId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Create performance evaluation
  const createPerformanceEvaluation = useMutation({
    mutationFn: async (
      performanceData: Omit<SupplierPerformance, 'id' | 'created_at'>
    ) => {
      const { data, error } = await supabase
        .from('supplier_performance_metrics')
        .insert({
          ...performanceData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data as SupplierPerformance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-performance'] });
      toast.success('Avaliação de performance criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar avaliação:', error);
      toast.error('Erro ao criar avaliação. Tente novamente.');
    },
  });

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (!performance?.length) {
      return null;
    }

    const latest = performance[0];
    const previous = performance[1];

    return {
      current: latest,
      trend: previous
        ? {
            scoreChange: latest.quality_score - previous.quality_score,
            deliveryChange:
              latest.on_time_delivery_rate - previous.on_time_delivery_rate,
            serviceChange:
              latest.customer_satisfaction - previous.customer_satisfaction,
          }
        : null,
      averageQualityScore:
        performance.reduce((sum, p) => sum + p.quality_score, 0) /
        performance.length,
      averageDeliveryRate:
        performance.reduce((sum, p) => sum + p.on_time_delivery_rate, 0) /
        performance.length,
      averageServiceScore:
        performance.reduce((sum, p) => sum + p.customer_satisfaction, 0) /
        performance.length,
    };
  }, [performance]);

  return {
    performance,
    performanceMetrics,
    isLoading,
    error,
    createPerformanceEvaluation: createPerformanceEvaluation.mutate,
    isCreatingEvaluation: createPerformanceEvaluation.isPending,
  };
}

/**
 * Hook for performance analytics across all suppliers
 */
export function useSupplierAnalytics(
  clinicId?: string,
  options?: {
    period?: string;
    category?: SupplierCategory;
    compareWith?: 'industry' | 'category' | 'previous';
  }
) {
  const supabase = createClient();
  const effectiveClinicId = clinicId || '89084c3a-9200-4058-a15a-b440d3c60687';

  const {
    data: analytics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['supplier-analytics', clinicId, options],
    queryFn: async () => {
      // This would typically call a stored procedure or complex query
      // For now, we'll simulate the analytics structure
      const { data, error } = await supabase
        .from('supplier_analytics')
        .select('*')
        .eq('clinic_id', effectiveClinicId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data as SupplierAnalytics | null;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    analytics,
    isLoading,
    error,
  };
}

// ============================================================================
// PROCUREMENT & BIDDING HOOKS
// ============================================================================

/**
 * Hook for managing procurement requests
 */
export function useProcurementRequests(
  clinicId?: string,
  filters?: {
    status?: string[];
    category?: SupplierCategory[];
    dateRange?: { start: string; end: string };
  }
) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const effectiveClinicId = clinicId || '89084c3a-9200-4058-a15a-b440d3c60687';

  const {
    data: requests = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['procurement-requests', clinicId, filters],
    queryFn: async () => {
      let query = supabase
        .from('procurement_requests')
        .select(
          `
          *,
          items:procurement_items(*),
          bids:supplier_bids(*)
        `
        )
        .eq('clinic_id', effectiveClinicId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.category?.length) {
        query = query.in('category', filters.category);
      }
      if (filters?.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }
      return data as ProcurementRequest[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Create procurement request
  const createProcurementRequest = useMutation({
    mutationFn: async (
      requestData: Omit<ProcurementRequest, 'id' | 'created_at'>
    ) => {
      const { data, error } = await supabase
        .from('procurement_requests')
        .insert({
          ...requestData,
          clinic_id: clinicId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data as ProcurementRequest;
    },
    onSuccess: (newRequest) => {
      queryClient.invalidateQueries({ queryKey: ['procurement-requests'] });
      toast.success(`Solicitação ${newRequest.title} criada com sucesso!`);
    },
    onError: (error) => {
      console.error('Erro ao criar solicitação:', error);
      toast.error('Erro ao criar solicitação. Tente novamente.');
    },
  });

  return {
    requests,
    isLoading,
    error,
    createProcurementRequest: createProcurementRequest.mutate,
    isCreating: createProcurementRequest.isPending,
  };
}

/**
 * Hook for managing supplier bids
 */
export function useSupplierBids(procurementRequestId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const {
    data: bids = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['supplier-bids', procurementRequestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_bids')
        .select(
          `
          *,
          supplier:suppliers(*),
          bid_items:bid_items(*),
          documents:bid_documents(*)
        `
        )
        .eq('procurement_request_id', procurementRequestId)
        .order('submitted_at', { ascending: false });

      if (error) {
        throw error;
      }
      return data as SupplierBid[];
    },
    enabled: Boolean(procurementRequestId),
    staleTime: 2 * 60 * 1000,
  });

  // Submit bid evaluation
  const evaluateBid = useMutation({
    mutationFn: async ({
      bidId,
      technicalScore,
      commercialScore,
      overallScore,
      notes,
    }: {
      bidId: string;
      technicalScore: number;
      commercialScore: number;
      overallScore: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('supplier_bids')
        .update({
          technical_score: technicalScore,
          commercial_score: commercialScore,
          overall_score: overallScore,
          evaluation_notes: notes,
          evaluated_at: new Date().toISOString(),
        })
        .eq('id', bidId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data as SupplierBid;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-bids'] });
      toast.success('Avaliação da proposta salva com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao avaliar proposta:', error);
      toast.error('Erro ao avaliar proposta. Tente novamente.');
    },
  });

  return {
    bids,
    isLoading,
    error,
    evaluateBid: evaluateBid.mutate,
    isEvaluating: evaluateBid.isPending,
  };
}

// ============================================================================
// QUALITY MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook for managing quality issues
 */
export function useQualityIssues(
  clinicId?: string,
  filters?: {
    supplierId?: string;
    status?: IssueStatus[];
    severity?: string[];
    type?: QualityIssueType[];
  }
) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const effectiveClinicId = clinicId || '89084c3a-9200-4058-a15a-b440d3c60687';

  const {
    data: issues = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['quality-issues', clinicId, filters],
    queryFn: async () => {
      let query = supabase
        .from('quality_issues')
        .select(
          `
          *,
          supplier:suppliers(*),
          corrective_actions:corrective_actions(*),
          documents:quality_documents(*)
        `
        )
        .eq('clinic_id', effectiveClinicId)
        .order('reported_date', { ascending: false });

      // Apply filters
      if (filters?.supplierId) {
        query = query.eq('supplier_id', filters.supplierId);
      }
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.severity?.length) {
        query = query.in('severity', filters.severity);
      }
      if (filters?.type?.length) {
        query = query.in('type', filters.type);
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }
      return data as QualityIssue[];
    },
    staleTime: 3 * 60 * 1000,
  });

  // Create quality issue
  const createQualityIssue = useMutation({
    mutationFn: async (
      issueData: Omit<
        QualityIssue,
        'id' | 'reported_date' | 'created_at' | 'updated_at'
      >
    ) => {
      const { data, error } = await supabase
        .from('quality_issues')
        .insert({
          ...issueData,
          clinic_id: clinicId,
          reported_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data as QualityIssue;
    },
    onSuccess: (newIssue) => {
      queryClient.invalidateQueries({ queryKey: ['quality-issues'] });
      toast.success(
        `Problema de qualidade #${newIssue.issue_number} registrado com sucesso!`
      );
    },
    onError: (error) => {
      console.error('Erro ao registrar problema:', error);
      toast.error('Erro ao registrar problema. Tente novamente.');
    },
  });

  // Update issue status
  const updateIssueStatus = useMutation({
    mutationFn: async ({
      issueId,
      newStatus,
      notes,
    }: {
      issueId: string;
      newStatus: IssueStatus;
      notes?: string;
    }) => {
      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Set resolution date if resolving
      if (newStatus === IssueStatus.RESOLVED) {
        updates.resolved_date = new Date().toISOString();
      }

      // Set closure date if closing
      if (newStatus === IssueStatus.CLOSED) {
        updates.closure_date = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('quality_issues')
        .update(updates)
        .eq('id', issueId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data as QualityIssue;
    },
    onSuccess: (updatedIssue) => {
      queryClient.invalidateQueries({ queryKey: ['quality-issues'] });
      toast.success(
        `Status do problema #${updatedIssue.issue_number} atualizado!`
      );
    },
    onError: (error) => {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status. Tente novamente.');
    },
  });

  return {
    issues,
    isLoading,
    error,
    createQualityIssue: createQualityIssue.mutate,
    updateIssueStatus: updateIssueStatus.mutate,
    isCreating: createQualityIssue.isPending,
    isUpdatingStatus: updateIssueStatus.isPending,
  };
}

// ============================================================================
// CONTRACT MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook for managing supplier contracts
 */
export function useSupplierContracts(
  clinicId?: string,
  filters?: {
    supplierId?: string;
    status?: string[];
    type?: ContractType[];
    expiringIn?: number; // days
  }
) {
  const _queryClient = useQueryClient();
  const supabase = createClient();
  const effectiveClinicId = clinicId || '89084c3a-9200-4058-a15a-b440d3c60687';

  const {
    data: contracts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['supplier-contracts', clinicId, filters],
    queryFn: async () => {
      let query = supabase
        .from('supplier_contracts')
        .select(
          `
          *,
          supplier:suppliers(*),
          amendments:contract_amendments(*)
        `
        )
        .eq('clinic_id', effectiveClinicId)
        .order('start_date', { ascending: false });

      // Apply filters
      if (filters?.supplierId) {
        query = query.eq('supplier_id', filters.supplierId);
      }
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.type?.length) {
        query = query.in('type', filters.type);
      }
      if (filters?.expiringIn) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + filters.expiringIn);
        query = query.lte('end_date', futureDate.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        throw error;
      }
      return data as SupplierContract[];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Get contracts expiring soon
  const expiringContracts = useMemo(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return contracts.filter(
      (contract) =>
        contract.end_date &&
        new Date(contract.end_date) <= thirtyDaysFromNow &&
        contract.status === 'active'
    );
  }, [contracts]);

  return {
    contracts,
    expiringContracts,
    isLoading,
    error,
  };
}

// ============================================================================
// COMMUNICATION HOOKS
// ============================================================================

/**
 * Hook for managing supplier communications
 */
export function useSupplierCommunications(supplierId: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const {
    data: communications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['supplier-communications', supplierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_communications')
        .select(
          `
          *,
          attachments:communication_attachments(*)
        `
        )
        .eq('supplier_id', supplierId)
        .order('timestamp', { ascending: false });

      if (error) {
        throw error;
      }
      return data as SupplierCommunication[];
    },
    enabled: Boolean(supplierId),
    staleTime: 2 * 60 * 1000,
  });

  // Create communication record
  const createCommunication = useMutation({
    mutationFn: async (
      communicationData: Omit<SupplierCommunication, 'id' | 'timestamp'>
    ) => {
      const { data, error } = await supabase
        .from('supplier_communications')
        .insert({
          ...communicationData,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data as SupplierCommunication;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-communications'] });
      toast.success('Comunicação registrada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao registrar comunicação:', error);
      toast.error('Erro ao registrar comunicação. Tente novamente.');
    },
  });

  return {
    communications,
    isLoading,
    error,
    createCommunication: createCommunication.mutate,
    isCreating: createCommunication.isPending,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for supplier search and filtering
 */
export function useSupplierSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<
    SupplierCategory[]
  >([]);
  const [selectedStatuses, setSelectedStatuses] = useState<SupplierStatus[]>(
    []
  );
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<RiskLevel[]>([]);

  const filters = useMemo(
    () => ({
      search: searchTerm.trim() || undefined,
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      riskLevel: selectedRiskLevels.length > 0 ? selectedRiskLevels : undefined,
    }),
    [searchTerm, selectedCategories, selectedStatuses, selectedRiskLevels]
  );

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setSelectedRiskLevels([]);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategories,
    setSelectedCategories,
    selectedStatuses,
    setSelectedStatuses,
    selectedRiskLevels,
    setSelectedRiskLevels,
    filters,
    clearFilters,
    hasActiveFilters: Object.values(filters).some(Boolean),
  };
}

/**
 * Hook for supplier dashboard statistics
 */
export function useSupplierDashboard(clinicId: string) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['supplier-dashboard', clinicId],
    queryFn: async () => {
      // This would typically be a complex aggregation query
      // For now, we'll return placeholder data
      return {
        totalSuppliers: 0,
        activeSuppliers: 0,
        averagePerformance: 0,
        qualityIssues: 0,
        expiringContracts: 0,
        pendingEvaluations: 0,
      };
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    stats,
    isLoading,
  };
}

/**
 * Hook for supplier procurement metrics and management
 */
export function useSupplierProcurement(supplierId: string, clinicId?: string) {
  const effectiveClinicId = clinicId || 'demo-clinic-id';

  const { data: procurementData, isLoading } = useQuery({
    queryKey: ['supplier-procurement', supplierId, effectiveClinicId],
    queryFn: async () => {
      const supabase = createClient();

      // Get procurement history
      const { data: procurements } = await supabase
        .from('supplier_products')
        .select(
          `
          *,
          supplier_contracts!inner(*)
        `
        )
        .eq('supplier_id', supplierId);

      return {
        procurements: procurements || [],
        totalOrders: procurements?.length || 0,
        totalValue:
          procurements?.reduce(
            (sum, p) => sum + p.unit_price * p.minimum_order_quantity,
            0
          ) || 0,
        averageOrderTime: 7, // placeholder
        onTimeDeliveryRate: 0.85, // placeholder
      };
    },
    enabled: Boolean(supplierId),
  });

  return {
    procurementData,
    isLoading,
  };
}

/**
 * Hook for supplier quality metrics and tracking
 */
export function useSupplierQuality(supplierId: string, clinicId?: string) {
  const effectiveClinicId = clinicId || 'demo-clinic-id';

  const { data: qualityData, isLoading } = useQuery({
    queryKey: ['supplier-quality', supplierId, effectiveClinicId],
    queryFn: async () => {
      const supabase = createClient();

      // Get quality metrics
      const { data: performance } = await supabase
        .from('supplier_performance')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('evaluation_date', { ascending: false })
        .limit(12); // Last 12 evaluations

      return {
        performance: performance || [],
        averageRating:
          performance?.reduce((sum, p) => sum + p.overall_rating, 0) /
            (performance?.length || 1) || 0,
        qualityTrend: 'stable', // placeholder
        certificationStatus: 'valid', // placeholder
      };
    },
    enabled: Boolean(supplierId),
  });

  return {
    qualityData,
    isLoading,
  };
}

/**
 * Hook for supplier statistics and analytics
 */
export function useSupplierStats(clinicId?: string) {
  const effectiveClinicId = clinicId || 'demo-clinic-id';

  const { data: stats, isLoading } = useQuery({
    queryKey: ['supplier-stats', effectiveClinicId],
    queryFn: async () => {
      const supabase = createClient();

      // Get supplier counts by status
      const { data: suppliers } = await supabase
        .from('suppliers')
        .select('status, category, risk_level');

      const totalSuppliers = suppliers?.length || 0;
      const activeSuppliers =
        suppliers?.filter((s) => s.status === 'active').length || 0;
      const categoryCounts =
        suppliers?.reduce(
          (acc, s) => {
            acc[s.category] = (acc[s.category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ) || {};

      return {
        totalSuppliers,
        activeSuppliers,
        categoryCounts,
        riskDistribution: {
          low: suppliers?.filter((s) => s.risk_level === 'low').length || 0,
          medium:
            suppliers?.filter((s) => s.risk_level === 'medium').length || 0,
          high: suppliers?.filter((s) => s.risk_level === 'high').length || 0,
        },
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    stats,
    isLoading,
  };
}
