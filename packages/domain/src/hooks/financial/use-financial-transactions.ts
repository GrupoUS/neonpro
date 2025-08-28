"use client";

import { useCallback, useEffect, useState } from "react";

export interface FinancialTransaction {
  id: string;
  appointment_id?: string;
  patient_id: string;
  professional_id: string;
  type: "payment" | "refund" | "adjustment" | "fee";
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  payment_method?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentMethod {
  id: string;
  type: "credit_card" | "debit_card" | "pix" | "bank_transfer" | "cash";
  provider?: string;
  last_four?: string;
  is_default: boolean;
  is_active: boolean;
}

export interface UseFinancialTransactionsReturn {
  transactions: FinancialTransaction[];
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
  totalAmount: number;
  summary: {
    pending: number;
    completed: number;
    failed: number;
    refunded: number;
  };
  createTransaction: (
    transaction: Omit<FinancialTransaction, "id" | "created_at" | "updated_at">,
  ) => Promise<string | null>;
  updateTransaction: (
    id: string,
    updates: Partial<FinancialTransaction>,
  ) => Promise<boolean>;
  processPayment: (
    transactionId: string,
    paymentMethodId: string,
  ) => Promise<boolean>;
  processRefund: (
    transactionId: string,
    amount?: number,
  ) => Promise<string | null>;
  addPaymentMethod: (
    method: Omit<PaymentMethod, "id">,
  ) => Promise<string | null>;
  removePaymentMethod: (methodId: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

export function useFinancialTransactions(): UseFinancialTransactionsReturn {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [paymentMethods, _setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>();

  const refreshData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(undefined);

      // Placeholder implementation
      const mockTransactions: FinancialTransaction[] = [
        {
          id: "1",
          patient_id: "patient-1",
          professional_id: "prof-1",
          type: "payment",
          amount: 150,
          currency: "BRL",
          status: "completed",
          payment_method: "credit_card",
          description: "Consultation payment",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      setTransactions(mockTransactions);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to refresh data";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTransaction = useCallback(
    async (
      _transaction: Omit<
        FinancialTransaction,
        "id" | "created_at" | "updated_at"
      >,
    ): Promise<string | null> => {
      try {
        return `trans-${Date.now()}`;
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to create transaction",
        );
        return;
      }
    },
    [],
  );

  const updateTransaction = useCallback(
    async (
      _id: string,
      _updates: Partial<FinancialTransaction>,
    ): Promise<boolean> => {
      try {
        return true;
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to update transaction",
        );
        return false;
      }
    },
    [],
  );

  const processPayment = useCallback(
    async (
      _transactionId: string,
      _paymentMethodId: string,
    ): Promise<boolean> => {
      try {
        return true;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to process payment",
        );
        return false;
      }
    },
    [],
  );

  const processRefund = useCallback(
    async (
      _transactionId: string,
      _amount?: number,
    ): Promise<string | null> => {
      try {
        return `refund-${Date.now()}`;
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to process refund",
        );
        return;
      }
    },
    [],
  );

  const addPaymentMethod = useCallback(
    async (_method: Omit<PaymentMethod, "id">): Promise<string | null> => {
      try {
        return `method-${Date.now()}`;
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to add payment method",
        );
        return;
      }
    },
    [],
  );

  const removePaymentMethod = useCallback(
    async (_methodId: string): Promise<boolean> => {
      try {
        return true;
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to remove payment method",
        );
        return false;
      }
    },
    [],
  );

  // Computed values
  const totalAmount = transactions.reduce((sum, transaction) => {
    return transaction.status === "completed" ? sum + transaction.amount : sum;
  }, 0);

  const summary = {
    pending: transactions.filter((t) => t.status === "pending").length,
    completed: transactions.filter((t) => t.status === "completed").length,
    failed: transactions.filter((t) => t.status === "failed").length,
    refunded: transactions.filter((t) => t.type === "refund").length,
  };

  // Initialize data
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    transactions,
    paymentMethods,
    isLoading,
    error,
    totalAmount,
    summary,
    createTransaction,
    updateTransaction,
    processPayment,
    processRefund,
    addPaymentMethod,
    removePaymentMethod,
    refreshData,
  };
}
