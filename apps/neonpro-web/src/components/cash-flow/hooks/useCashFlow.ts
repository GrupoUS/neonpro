"use client";

// Temporary hooks for cash flow development
// These will be replaced with proper implementation

import type { useState, useEffect } from "react";
import type { CashFlowEntry, CashRegister, CashFlowAnalytics, CashFlowFilters } from "../types";

// Mock data for development
const mockRegisters: CashRegister[] = [
  {
    id: "1",
    clinic_id: "clinic-1",
    register_name: "Caixa Principal",
    register_code: "CP001",
    location: "Recepção",
    responsible_user_id: "user-1",
    current_balance: 1500.5,
    opening_balance: 1000.0,
    expected_balance: 1500.5,
    is_active: true,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
];

const mockEntries: CashFlowEntry[] = [
  {
    id: "1",
    clinic_id: "clinic-1",
    register_id: "1",
    transaction_type: "receipt",
    category: "service_payment",
    amount: 150.0,
    currency: "BRL",
    description: "Consulta dermatológica",
    payment_method: "pix",
    created_by: "user-1",
    created_at: "2025-01-20T10:00:00Z",
    updated_at: "2025-01-20T10:00:00Z",
    is_reconciled: false,
  },
];

const mockAnalytics: CashFlowAnalytics = {
  totalIncome: 1500.0,
  totalExpenses: 500.0,
  netCashFlow: 1000.0,
  periodStart: "2025-01-01",
  periodEnd: "2025-01-31",
  byCategory: [{ category: "service_payment", amount: 1500.0, percentage: 100 }],
  byPaymentMethod: [{ method: "pix", amount: 1500.0, count: 10 }],
  byDay: [],
  registers: [{ id: "1", name: "Caixa Principal", balance: 1500.5, transactions: 10 }],
};

export function useCashRegisters(clinicId: string) {
  const [registers, setRegisters] = useState<CashRegister[]>(mockRegisters);
  const [loading, setLoading] = useState(false);

  const refetch = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setRegisters(mockRegisters);
      setLoading(false);
    }, 500);
  };

  return { registers, loading, refetch };
}

export function useCashFlowEntries(clinicId: string, filters: CashFlowFilters) {
  const [entries, setEntries] = useState<CashFlowEntry[]>(mockEntries);
  const [loading, setLoading] = useState(false);

  const refetch = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setEntries(mockEntries);
      setLoading(false);
    }, 500);
  };

  return { entries, loading, refetch };
}

export function useCashFlowAnalytics(clinicId: string, filters: CashFlowFilters) {
  const [analytics, setAnalytics] = useState<CashFlowAnalytics>(mockAnalytics);
  const [loading, setLoading] = useState(false);

  const refetch = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAnalytics(mockAnalytics);
      setLoading(false);
    }, 500);
  };

  return { analytics, loading, refetch };
}
