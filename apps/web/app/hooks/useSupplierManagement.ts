// =====================================================================================
// SUPPLIER MANAGEMENT HOOK
// Epic 6 - Story 6.3: Comprehensive supplier management with performance tracking
// =====================================================================================

import { useCallback, useEffect, useState } from 'react';
import type {
  ContractRenewalAlert,
  CreateContractRequest,
  CreateEvaluationRequest,
  CreateQualityIssueRequest,
  CreateSupplierRequest,
  QualityIssuesSummary,
  Supplier,
  SupplierAnalytics,
  SupplierCommunication,
  SupplierComparison,
  SupplierContact,
  SupplierContract,
  SupplierDashboardData,
  SupplierEvaluation,
  SupplierFilters,
  SupplierListResponse,
  SupplierQualityIssue,
  UpdateSupplierRequest,
} from '@/app/types/suppliers';

interface UseSupplierManagementProps {
  clinicId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseSupplierManagementReturn {
  // State
  suppliers: Supplier[];
  supplierDetails: Supplier | null;
  contracts: SupplierContract[];
  contacts: SupplierContact[];
  evaluations: SupplierEvaluation[];
  qualityIssues: SupplierQualityIssue[];
  communications: SupplierCommunication[];
  dashboardData: SupplierDashboardData | null;
  contractAlerts: ContractRenewalAlert[];
  qualityIssuesSummary: QualityIssuesSummary[];
  analytics: SupplierAnalytics | null;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Error states
  error: string | null;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
  };

  // Actions
  loadSuppliers: (
    filters?: SupplierFilters,
    page?: number,
    limit?: number
  ) => Promise<void>;
  loadSupplierDetails: (supplierId: string) => Promise<void>;
  createSupplier: (
    supplierData: CreateSupplierRequest
  ) => Promise<Supplier | null>;
  updateSupplier: (
    supplierId: string,
    updates: UpdateSupplierRequest
  ) => Promise<Supplier | null>;
  deleteSupplier: (supplierId: string) => Promise<boolean>;

  // Contract management
  loadContracts: (supplierId: string) => Promise<void>;
  createContract: (
    contractData: CreateContractRequest
  ) => Promise<SupplierContract | null>;
  updateContract: (
    contractId: string,
    updates: Partial<CreateContractRequest>
  ) => Promise<SupplierContract | null>;
  loadContractAlerts: (daysAhead?: number) => Promise<void>;

  // Contact management
  loadContacts: (supplierId: string) => Promise<void>;
  createContact: (contactData: any) => Promise<SupplierContact | null>;
  updateContact: (
    contactId: string,
    updates: any
  ) => Promise<SupplierContact | null>;

  // Performance and evaluation
  loadEvaluations: (supplierId: string) => Promise<void>;
  createEvaluation: (
    evaluationData: CreateEvaluationRequest
  ) => Promise<SupplierEvaluation | null>;

  // Quality issues
  loadQualityIssuesSummary: () => Promise<void>;
  createQualityIssue: (
    issueData: CreateQualityIssueRequest
  ) => Promise<SupplierQualityIssue | null>;
  updateQualityIssue: (
    issueId: string,
    updates: any
  ) => Promise<SupplierQualityIssue | null>;

  // Communications
  loadCommunications: (supplierId: string) => Promise<void>;
  createCommunication: (
    communicationData: any
  ) => Promise<SupplierCommunication | null>;

  // Dashboard and analytics
  loadDashboardData: () => Promise<void>;
  loadAnalytics: (periodStart: string, periodEnd: string) => Promise<void>;
  compareSuppliers: (
    supplierIds: string[]
  ) => Promise<SupplierComparison | null>;

  // Utility functions
  refreshData: () => Promise<void>;
  clearError: () => void;
  resetState: () => void;
}

export function useSupplierManagement({
  clinicId,
  autoRefresh = false,
  refreshInterval = 300_000, // 5 minutes
}: UseSupplierManagementProps): UseSupplierManagementReturn {
  // State management
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierDetails, setSupplierDetails] = useState<Supplier | null>(null);
  const [contracts, setContracts] = useState<SupplierContract[]>([]);
  const [contacts, setContacts] = useState<SupplierContact[]>([]);
  const [evaluations, setEvaluations] = useState<SupplierEvaluation[]>([]);
  const [qualityIssues, setQualityIssues] = useState<SupplierQualityIssue[]>(
    []
  );
  const [communications, setCommunications] = useState<SupplierCommunication[]>(
    []
  );
  const [dashboardData, setDashboardData] =
    useState<SupplierDashboardData | null>(null);
  const [contractAlerts, setContractAlerts] = useState<ContractRenewalAlert[]>(
    []
  );
  const [qualityIssuesSummary, setQualityIssuesSummary] = useState<
    QualityIssuesSummary[]
  >([]);
  const [analytics, setAnalytics] = useState<SupplierAnalytics | null>(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
  });

  // Helper function for API calls
  const handleApiCall = async <T>(
    apiCall: () => Promise<T>,
    onSuccess?: (data: T) => void,
    loadingState?: 'loading' | 'creating' | 'updating' | 'deleting'
  ): Promise<T | null> => {
    try {
      setError(null);

      if (loadingState === 'loading') setIsLoading(true);
      else if (loadingState === 'creating') setIsCreating(true);
      else if (loadingState === 'updating') setIsUpdating(true);
      else if (loadingState === 'deleting') setIsDeleting(true);

      const result = await apiCall();

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('API call error:', err);
      return null;
    } finally {
      setIsLoading(false);
      setIsCreating(false);
      setIsUpdating(false);
      setIsDeleting(false);
    }
  };

  // =====================================================================================
  // SUPPLIER MANAGEMENT
  // =====================================================================================

  const loadSuppliers = useCallback(
    async (filters?: SupplierFilters, page = 1, limit = 50) => {
      await handleApiCall(
        async () => {
          const queryParams = new URLSearchParams({
            clinic_id: clinicId,
            page: page.toString(),
            limit: limit.toString(),
          });

          if (filters) {
            if (filters.supplier_type?.length) {
              queryParams.append(
                'supplier_type',
                filters.supplier_type.join(',')
              );
            }
            if (filters.status?.length) {
              queryParams.append('status', filters.status.join(','));
            }
            if (filters.is_preferred !== undefined) {
              queryParams.append(
                'is_preferred',
                filters.is_preferred.toString()
              );
            }
            if (filters.is_critical !== undefined) {
              queryParams.append('is_critical', filters.is_critical.toString());
            }
            if (filters.performance_score_min !== undefined) {
              queryParams.append(
                'performance_score_min',
                filters.performance_score_min.toString()
              );
            }
            if (filters.performance_score_max !== undefined) {
              queryParams.append(
                'performance_score_max',
                filters.performance_score_max.toString()
              );
            }
            if (filters.search) {
              queryParams.append('search', filters.search);
            }
          }

          const response = await fetch(`/api/suppliers?${queryParams}`);
          if (!response.ok) {
            throw new Error('Erro ao carregar fornecedores');
          }

          const data: SupplierListResponse = await response.json();
          return data;
        },
        (data) => {
          setSuppliers(data.suppliers);
          setPagination({
            page: data.page,
            limit: data.limit,
            total: data.total,
          });
        },
        'loading'
      );
    },
    [clinicId, handleApiCall]
  );

  const loadSupplierDetails = useCallback(
    async (supplierId: string) => {
      await handleApiCall(
        async () => {
          const response = await fetch(
            `/api/suppliers/${supplierId}?clinic_id=${clinicId}`
          );
          if (!response.ok) {
            throw new Error('Erro ao carregar detalhes do fornecedor');
          }
          return response.json();
        },
        (data) => setSupplierDetails(data),
        'loading'
      );
    },
    [clinicId, handleApiCall]
  );

  const createSupplier = useCallback(
    async (supplierData: CreateSupplierRequest) => {
      return await handleApiCall(
        async () => {
          const response = await fetch('/api/suppliers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...supplierData, clinic_id: clinicId }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar fornecedor');
          }

          return response.json();
        },
        (newSupplier) => {
          setSuppliers((prev) => [newSupplier, ...prev]);
        },
        'creating'
      );
    },
    [clinicId, handleApiCall]
  );

  const updateSupplier = useCallback(
    async (supplierId: string, updates: UpdateSupplierRequest) => {
      return await handleApiCall(
        async () => {
          const response = await fetch(
            `/api/suppliers/${supplierId}?clinic_id=${clinicId}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao atualizar fornecedor');
          }

          return response.json();
        },
        (updatedSupplier) => {
          setSuppliers((prev) =>
            prev.map((supplier) =>
              supplier.id === supplierId ? updatedSupplier : supplier
            )
          );
          if (supplierDetails?.id === supplierId) {
            setSupplierDetails(updatedSupplier);
          }
        },
        'updating'
      );
    },
    [clinicId, supplierDetails, handleApiCall]
  );

  const deleteSupplier = useCallback(
    async (supplierId: string): Promise<boolean> => {
      const result = await handleApiCall(
        async () => {
          const response = await fetch(
            `/api/suppliers/${supplierId}?clinic_id=${clinicId}`,
            {
              method: 'DELETE',
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao excluir fornecedor');
          }

          return true;
        },
        () => {
          setSuppliers((prev) =>
            prev.filter((supplier) => supplier.id !== supplierId)
          );
          if (supplierDetails?.id === supplierId) {
            setSupplierDetails(null);
          }
        },
        'deleting'
      );

      return result !== null;
    },
    [clinicId, supplierDetails, handleApiCall]
  );

  // =====================================================================================
  // CONTRACT MANAGEMENT
  // =====================================================================================

  const loadContracts = useCallback(
    async (supplierId: string) => {
      await handleApiCall(
        async () => {
          const response = await fetch(
            `/api/suppliers/contracts?supplier_id=${supplierId}`
          );
          if (!response.ok) {
            throw new Error('Erro ao carregar contratos');
          }
          const data = await response.json();
          return data.contracts;
        },
        (contractsData) => setContracts(contractsData),
        'loading'
      );
    },
    [handleApiCall]
  );

  const createContract = useCallback(
    async (contractData: CreateContractRequest) => {
      return await handleApiCall(
        async () => {
          const response = await fetch('/api/suppliers/contracts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contractData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar contrato');
          }

          return response.json();
        },
        (newContract) => {
          setContracts((prev) => [newContract, ...prev]);
        },
        'creating'
      );
    },
    [handleApiCall]
  );

  const updateContract = useCallback(
    async (contractId: string, updates: Partial<CreateContractRequest>) => {
      return await handleApiCall(
        async () => {
          const response = await fetch(
            `/api/suppliers/contracts/${contractId}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao atualizar contrato');
          }

          return response.json();
        },
        (updatedContract) => {
          setContracts((prev) =>
            prev.map((contract) =>
              contract.id === contractId ? updatedContract : contract
            )
          );
        },
        'updating'
      );
    },
    [handleApiCall]
  );

  const loadContractAlerts = useCallback(
    async (daysAhead = 90) => {
      await handleApiCall(
        async () => {
          const response = await fetch(
            `/api/suppliers/contracts?clinic_id=${clinicId}&action=renewal-alerts&days_ahead=${daysAhead}`
          );
          if (!response.ok) {
            throw new Error('Erro ao carregar alertas de contrato');
          }
          const data = await response.json();
          return data.alerts;
        },
        (alertsData) => setContractAlerts(alertsData),
        'loading'
      );
    },
    [clinicId, handleApiCall]
  );

  // =====================================================================================
  // CONTACT MANAGEMENT
  // =====================================================================================

  const loadContacts = useCallback(
    async (supplierId: string) => {
      await handleApiCall(
        async () => {
          const response = await fetch(
            `/api/suppliers/contacts?supplier_id=${supplierId}`
          );
          if (!response.ok) {
            throw new Error('Erro ao carregar contatos');
          }
          const data = await response.json();
          return data.contacts;
        },
        (contactsData) => setContacts(contactsData),
        'loading'
      );
    },
    [handleApiCall]
  );

  const createContact = useCallback(
    async (contactData: any) => {
      return await handleApiCall(
        async () => {
          const response = await fetch('/api/suppliers/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar contato');
          }

          return response.json();
        },
        (newContact) => {
          setContacts((prev) => [newContact, ...prev]);
        },
        'creating'
      );
    },
    [handleApiCall]
  );

  const updateContact = useCallback(
    async (contactId: string, updates: any) => {
      return await handleApiCall(
        async () => {
          const response = await fetch(`/api/suppliers/contacts/${contactId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao atualizar contato');
          }

          return response.json();
        },
        (updatedContact) => {
          setContacts((prev) =>
            prev.map((contact) =>
              contact.id === contactId ? updatedContact : contact
            )
          );
        },
        'updating'
      );
    },
    [handleApiCall]
  );

  // =====================================================================================
  // EVALUATION MANAGEMENT
  // =====================================================================================

  const loadEvaluations = useCallback(
    async (supplierId: string) => {
      await handleApiCall(
        async () => {
          const response = await fetch(
            `/api/suppliers/evaluations?supplier_id=${supplierId}`
          );
          if (!response.ok) {
            throw new Error('Erro ao carregar avaliações');
          }
          const data = await response.json();
          return data.evaluations;
        },
        (evaluationsData) => setEvaluations(evaluationsData),
        'loading'
      );
    },
    [handleApiCall]
  );

  const createEvaluation = useCallback(
    async (evaluationData: CreateEvaluationRequest) => {
      return await handleApiCall(
        async () => {
          const response = await fetch('/api/suppliers/evaluations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(evaluationData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar avaliação');
          }

          return response.json();
        },
        (newEvaluation) => {
          setEvaluations((prev) => [newEvaluation, ...prev]);
        },
        'creating'
      );
    },
    [handleApiCall]
  );

  // =====================================================================================
  // QUALITY ISSUE MANAGEMENT
  // =====================================================================================

  const loadQualityIssuesSummary = useCallback(async () => {
    await handleApiCall(
      async () => {
        const response = await fetch(
          `/api/suppliers/quality-issues?clinic_id=${clinicId}`
        );
        if (!response.ok) {
          throw new Error('Erro ao carregar resumo de issues');
        }
        const data = await response.json();
        return data.summary;
      },
      (summaryData) => setQualityIssuesSummary(summaryData),
      'loading'
    );
  }, [clinicId, handleApiCall]);

  const createQualityIssue = useCallback(
    async (issueData: CreateQualityIssueRequest) => {
      return await handleApiCall(
        async () => {
          const response = await fetch('/api/suppliers/quality-issues', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(issueData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar issue');
          }

          return response.json();
        },
        (newIssue) => {
          setQualityIssues((prev) => [newIssue, ...prev]);
        },
        'creating'
      );
    },
    [handleApiCall]
  );

  const updateQualityIssue = useCallback(
    async (issueId: string, updates: any) => {
      return await handleApiCall(
        async () => {
          const response = await fetch(
            `/api/suppliers/quality-issues/${issueId}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao atualizar issue');
          }

          return response.json();
        },
        (updatedIssue) => {
          setQualityIssues((prev) =>
            prev.map((issue) => (issue.id === issueId ? updatedIssue : issue))
          );
        },
        'updating'
      );
    },
    [handleApiCall]
  );

  // =====================================================================================
  // COMMUNICATION MANAGEMENT
  // =====================================================================================

  const loadCommunications = useCallback(
    async (supplierId: string) => {
      await handleApiCall(
        async () => {
          const response = await fetch(
            `/api/suppliers/communications?supplier_id=${supplierId}`
          );
          if (!response.ok) {
            throw new Error('Erro ao carregar comunicações');
          }
          const data = await response.json();
          return data.communications;
        },
        (communicationsData) => setCommunications(communicationsData),
        'loading'
      );
    },
    [handleApiCall]
  );

  const createCommunication = useCallback(
    async (communicationData: any) => {
      return await handleApiCall(
        async () => {
          const response = await fetch('/api/suppliers/communications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(communicationData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao criar comunicação');
          }

          return response.json();
        },
        (newCommunication) => {
          setCommunications((prev) => [newCommunication, ...prev]);
        },
        'creating'
      );
    },
    [handleApiCall]
  );

  // =====================================================================================
  // DASHBOARD AND ANALYTICS
  // =====================================================================================

  const loadDashboardData = useCallback(async () => {
    await handleApiCall(
      async () => {
        const response = await fetch(
          `/api/suppliers/dashboard?clinic_id=${clinicId}`
        );
        if (!response.ok) {
          throw new Error('Erro ao carregar dados do dashboard');
        }
        return response.json();
      },
      (data) => setDashboardData(data),
      'loading'
    );
  }, [clinicId, handleApiCall]);

  const loadAnalytics = useCallback(
    async (periodStart: string, periodEnd: string) => {
      await handleApiCall(
        async () => {
          const response = await fetch(
            `/api/suppliers/analytics?clinic_id=${clinicId}&period_start=${periodStart}&period_end=${periodEnd}`
          );
          if (!response.ok) {
            throw new Error('Erro ao carregar analytics');
          }
          return response.json();
        },
        (data) => setAnalytics(data),
        'loading'
      );
    },
    [clinicId, handleApiCall]
  );

  const compareSuppliers = useCallback(
    async (supplierIds: string[]) => {
      return await handleApiCall(
        async () => {
          const response = await fetch('/api/suppliers/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              supplier_ids: supplierIds,
              comparison_criteria: [
                'delivery_performance',
                'quality_rating',
                'cost_effectiveness',
                'response_time',
              ],
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao comparar fornecedores');
          }

          return response.json();
        },
        undefined,
        'loading'
      );
    },
    [handleApiCall]
  );

  // =====================================================================================
  // UTILITY FUNCTIONS
  // =====================================================================================

  const refreshData = useCallback(async () => {
    await Promise.all([
      loadSuppliers(),
      loadDashboardData(),
      loadContractAlerts(),
      loadQualityIssuesSummary(),
    ]);
  }, [
    loadSuppliers,
    loadDashboardData,
    loadContractAlerts,
    loadQualityIssuesSummary,
  ]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    setSuppliers([]);
    setSupplierDetails(null);
    setContracts([]);
    setContacts([]);
    setEvaluations([]);
    setQualityIssues([]);
    setCommunications([]);
    setDashboardData(null);
    setContractAlerts([]);
    setQualityIssuesSummary([]);
    setAnalytics(null);
    setError(null);
    setPagination({ page: 1, limit: 50, total: 0 });
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshData]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    // State
    suppliers,
    supplierDetails,
    contracts,
    contacts,
    evaluations,
    qualityIssues,
    communications,
    dashboardData,
    contractAlerts,
    qualityIssuesSummary,
    analytics,

    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,

    // Error state
    error,

    // Pagination
    pagination,

    // Actions
    loadSuppliers,
    loadSupplierDetails,
    createSupplier,
    updateSupplier,
    deleteSupplier,

    // Contract management
    loadContracts,
    createContract,
    updateContract,
    loadContractAlerts,

    // Contact management
    loadContacts,
    createContact,
    updateContact,

    // Performance and evaluation
    loadEvaluations,
    createEvaluation,

    // Quality issues
    loadQualityIssuesSummary,
    createQualityIssue,
    updateQualityIssue,

    // Communications
    loadCommunications,
    createCommunication,

    // Dashboard and analytics
    loadDashboardData,
    loadAnalytics,
    compareSuppliers,

    // Utility functions
    refreshData,
    clearError,
    resetState,
  };
}
