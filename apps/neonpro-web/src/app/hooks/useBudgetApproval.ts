import type {
  BudgetForecast,
  BudgetOptimizationRecommendation,
  BudgetValidationResult,
  CreateApprovalRequest,
  InventoryBudget,
} from "@/app/types/budget-approval";
import type { useEffect, useState } from "react";

interface UseBudgetApprovalReturn {
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
  updateBudget: (budgetId: string, updates: Partial<InventoryBudget>) => Promise<void>;
  deleteBudget: (budgetId: string) => Promise<void>;

  // Approval Actions
  createApproval: (approvalData: Partial<CreateApprovalRequest>) => Promise<void>;
  processApproval: (
    approvalId: string,
    action: "approve" | "reject" | "request_changes",
    comments?: string,
  ) => Promise<void>;

  // Analytics
  generateOptimizationRecommendations: (budgetIds: string[]) => Promise<void>;
  generateForecast: (budgetId: string, periods?: number) => Promise<void>;
  validateBudget: (budgetId: string) => Promise<void>;

  // Refresh
  refreshBudgets: () => Promise<void>;
  refreshApprovals: () => Promise<void>;
}

export function useBudgetApproval(): UseBudgetApprovalReturn {
  const [budgets, setBudgets] = useState<InventoryBudget[]>([]);
  const [currentBudget, setCurrentBudget] = useState<InventoryBudget | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(false);

  const [approvals, setApprovals] = useState<CreateApprovalRequest[]>([]);
  const [approvalLoading, setApprovalLoading] = useState(false);

  const [recommendations, setRecommendations] = useState<BudgetOptimizationRecommendation[]>([]);
  const [forecasts, setForecasts] = useState<BudgetForecast[]>([]);
  const [validationResult, setValidationResult] = useState<BudgetValidationResult | null>(null);

  const pendingApprovals = approvals.filter(
    (approval) => (approval as any).status === "pending" || !("status" in approval),
  );

  const fetchBudgets = async () => {
    setBudgetLoading(true);
    try {
      const response = await fetch("/api/inventory/budget");
      if (response.ok) {
        const data = await response.json();
        setBudgets(data.budgets || []);
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setBudgetLoading(false);
    }
  };

  const fetchApprovals = async () => {
    setApprovalLoading(true);
    try {
      const response = await fetch("/api/inventory/approvals");
      if (response.ok) {
        const data = await response.json();
        setApprovals(data.approvals || []);
      }
    } catch (error) {
      console.error("Error fetching approvals:", error);
    } finally {
      setApprovalLoading(false);
    }
  };

  const createBudget = async (budgetData: Partial<InventoryBudget>) => {
    try {
      const response = await fetch("/api/inventory/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budgetData),
      });

      if (response.ok) {
        await fetchBudgets();
      }
    } catch (error) {
      console.error("Error creating budget:", error);
      throw error;
    }
  };

  const updateBudget = async (budgetId: string, updates: Partial<InventoryBudget>) => {
    try {
      const response = await fetch(`/api/inventory/budget/${budgetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchBudgets();
      }
    } catch (error) {
      console.error("Error updating budget:", error);
      throw error;
    }
  };

  const deleteBudget = async (budgetId: string) => {
    try {
      const response = await fetch(`/api/inventory/budget/${budgetId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchBudgets();
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
      throw error;
    }
  };

  const createApproval = async (approvalData: Partial<CreateApprovalRequest>) => {
    try {
      const response = await fetch("/api/inventory/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(approvalData),
      });

      if (response.ok) {
        await fetchApprovals();
      }
    } catch (error) {
      console.error("Error creating approval:", error);
      throw error;
    }
  };

  const processApproval = async (
    approvalId: string,
    action: "approve" | "reject" | "request_changes",
    comments?: string,
  ) => {
    try {
      const response = await fetch(`/api/inventory/approvals/${approvalId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments }),
      });

      if (response.ok) {
        await fetchApprovals();
      }
    } catch (error) {
      console.error("Error processing approval:", error);
      throw error;
    }
  };

  const generateOptimizationRecommendations = async (budgetIds: string[]) => {
    try {
      const response = await fetch("/api/inventory/budget/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget_ids: budgetIds }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
      throw error;
    }
  };

  const generateForecast = async (budgetId: string, periods: number = 12) => {
    try {
      const response = await fetch(
        `/api/inventory/budget/optimize?budgetId=${budgetId}&period=${periods}`,
      );

      if (response.ok) {
        const data = await response.json();
        setForecasts(data.forecasts || []);
      }
    } catch (error) {
      console.error("Error generating forecast:", error);
      throw error;
    }
  };

  const validateBudget = async (budgetId: string) => {
    try {
      // This would need a separate validation endpoint
      // For now, we'll simulate the validation
      setValidationResult({
        is_valid: true,
        errors: [],
        warnings: [],
        recommendations: [],
      });
    } catch (error) {
      console.error("Error validating budget:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchApprovals();
  }, []);

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
