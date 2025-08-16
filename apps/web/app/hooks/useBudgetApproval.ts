import { useEffect, useState } from 'react';
import type {
  BudgetForecast,
  BudgetOptimizationRecommendation,
  BudgetValidationResult,
  CreateApprovalRequest,
  InventoryBudget,
} from '@/app/types/budget-approval';

type UseBudgetApprovalReturn = {
  // Budget Management
  budgets: InventoryBudget[];
  currentBudget: InventoryBudget | null;
  budgetLoading: boolean;

  // Approval Management
  approvals: CreateApprovalRequest[];
  pendingApprovals: CreateApprovalRequest[];
  approvalLoading: boolean;

  // Optimization & Forecasting
  recommendations: BudgetOptimizationRecommendation[];
  forecasts: BudgetForecast[];
  validationResult: BudgetValidationResult | null;

  // Actions
  createBudget: (budgetData: Partial<InventoryBudget>) => Promise<void>;
  updateBudget: (
    budgetId: string,
    updates: Partial<InventoryBudget>
  ) => Promise<void>;
  deleteBudget: (budgetId: string) => Promise<void>;

  // Approval Actions
  createApproval: (
    approvalData: Partial<CreateApprovalRequest>
  ) => Promise<void>;
  processApproval: (
    approvalId: string,
    action: 'approve' | 'reject' | 'request_changes',
    comments?: string
  ) => Promise<void>;

  // Analytics
  generateOptimizationRecommendations: (budgetIds: string[]) => Promise<void>;
  generateForecast: (budgetId: string, periods?: number) => Promise<void>;
  validateBudget: (budgetId: string) => Promise<void>;

  // Refresh
  refreshBudgets: () => Promise<void>;
  refreshApprovals: () => Promise<void>;
};

export function useBudgetApproval(): UseBudgetApprovalReturn {
  const [budgets, setBudgets] = useState<InventoryBudget[]>([]);
  const [currentBudget, _setCurrentBudget] = useState<InventoryBudget | null>(
    null
  );
  const [budgetLoading, setBudgetLoading] = useState(false);

  const [approvals, setApprovals] = useState<CreateApprovalRequest[]>([]);
  const [approvalLoading, setApprovalLoading] = useState(false);

  const [recommendations, setRecommendations] = useState<
    BudgetOptimizationRecommendation[]
  >([]);
  const [forecasts, setForecasts] = useState<BudgetForecast[]>([]);
  const [validationResult, setValidationResult] =
    useState<BudgetValidationResult | null>(null);

  const pendingApprovals = approvals.filter(
    (approval) =>
      (approval as any).status === 'pending' || !('status' in approval)
  );

  const fetchBudgets = async () => {
    setBudgetLoading(true);
    try {
      const response = await fetch('/api/inventory/budget');
      if (response.ok) {
        const data = await response.json();
        setBudgets(data.budgets || []);
      }
    } catch (_error) {
    } finally {
      setBudgetLoading(false);
    }
  };

  const fetchApprovals = async () => {
    setApprovalLoading(true);
    try {
      const response = await fetch('/api/inventory/approvals');
      if (response.ok) {
        const data = await response.json();
        setApprovals(data.approvals || []);
      }
    } catch (_error) {
    } finally {
      setApprovalLoading(false);
    }
  };

  const createBudget = async (budgetData: Partial<InventoryBudget>) => {
    const response = await fetch('/api/inventory/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budgetData),
    });

    if (response.ok) {
      await fetchBudgets();
    }
  };

  const updateBudget = async (
    budgetId: string,
    updates: Partial<InventoryBudget>
  ) => {
    const response = await fetch(`/api/inventory/budget/${budgetId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      await fetchBudgets();
    }
  };

  const deleteBudget = async (budgetId: string) => {
    const response = await fetch(`/api/inventory/budget/${budgetId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      await fetchBudgets();
    }
  };

  const createApproval = async (
    approvalData: Partial<CreateApprovalRequest>
  ) => {
    const response = await fetch('/api/inventory/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(approvalData),
    });

    if (response.ok) {
      await fetchApprovals();
    }
  };

  const processApproval = async (
    approvalId: string,
    action: 'approve' | 'reject' | 'request_changes',
    comments?: string
  ) => {
    const response = await fetch(
      `/api/inventory/approvals/${approvalId}/${action}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments }),
      }
    );

    if (response.ok) {
      await fetchApprovals();
    }
  };

  const generateOptimizationRecommendations = async (budgetIds: string[]) => {
    const response = await fetch('/api/inventory/budget/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget_ids: budgetIds }),
    });

    if (response.ok) {
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    }
  };

  const generateForecast = async (budgetId: string, periods = 12) => {
    const response = await fetch(
      `/api/inventory/budget/optimize?budgetId=${budgetId}&period=${periods}`
    );

    if (response.ok) {
      const data = await response.json();
      setForecasts(data.forecasts || []);
    }
  };

  const validateBudget = async (_budgetId: string) => {
    // This would need a separate validation endpoint
    // For now, we'll simulate the validation
    setValidationResult({
      is_valid: true,
      errors: [],
      warnings: [],
      recommendations: [],
    });
  };

  useEffect(() => {
    fetchBudgets();
    fetchApprovals();
  }, [fetchApprovals, fetchBudgets]);

  return {
    // Budget Management
    budgets,
    currentBudget,
    budgetLoading,

    // Approval Management
    approvals,
    pendingApprovals,
    approvalLoading,

    // Optimization & Forecasting
    recommendations,
    forecasts,
    validationResult,

    // Actions
    createBudget,
    updateBudget,
    deleteBudget,

    // Approval Actions
    createApproval,
    processApproval,

    // Analytics
    generateOptimizationRecommendations,
    generateForecast,
    validateBudget,

    // Refresh
    refreshBudgets: fetchBudgets,
    refreshApprovals: fetchApprovals,
  };
}
