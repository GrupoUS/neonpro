// Cash Flow Calculations and Utilities
// Following financial dashboard patterns from Context7 research

import type { CashFlowEntry, CashFlowAnalytics } from "../types";

// Currency formatting for Brazilian Real
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return "R$ 0,00";

  // Use manual formatting to ensure consistent output for tests
  const absAmount = Math.abs(amount);
  const integerPart = Math.floor(absAmount);
  const decimalPart = Math.round((absAmount - integerPart) * 100);

  // Format integer part with thousand separators (dots)
  const formattedInteger = integerPart.toLocaleString("pt-BR");

  // Format decimal part with leading zero if needed
  const formattedDecimal = decimalPart.toString().padStart(2, "0");

  const sign = amount < 0 ? "-" : "";
  return `${sign}R$ ${formattedInteger},${formattedDecimal}`;
}

// Parse currency string to number
export function parseCurrency(value: string): number {
  if (!value || typeof value !== "string") return 0;

  // Normalize the string by removing any spaces and currency symbols
  let cleanValue = value.trim().replace(/R\$[\s\u00A0]*/, "");

  // Detect format based on patterns:
  // Brazilian: 1.234.567,89 (dots for thousands, comma for decimals)
  // American: 1,234,567.89 (commas for thousands, dot for decimals)

  if (cleanValue.includes(",") && cleanValue.includes(".")) {
    // Mixed format - determine which is the decimal separator
    const lastCommaIndex = cleanValue.lastIndexOf(",");
    const lastDotIndex = cleanValue.lastIndexOf(".");

    if (lastDotIndex > lastCommaIndex) {
      // American format: 1,234.56
      cleanValue = cleanValue.replace(/,/g, ""); // Remove thousand separators
    } else {
      // Brazilian format: 1.234,56
      cleanValue = cleanValue.replace(/\./g, "").replace(",", "."); // Remove dots, convert comma to dot
    }
  } else if (cleanValue.includes(",")) {
    // Only comma - assume Brazilian decimal separator
    cleanValue = cleanValue.replace(/,/g, ".");
  }
  // If only dots or no separators, assume American format (already valid for parseFloat)

  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

// Validate transaction amount
export function validateAmount(amount: number): boolean {
  return !isNaN(amount) && amount > 0 && amount <= 999999999;
}

// Generate reference number
export function generateReferenceNumber(type: string): string {
  const timestamp = Date.now().toString().slice(-8);
  const prefix = type.toUpperCase().slice(0, 3);
  return `${prefix}-${timestamp}`;
}

// Calculate register balance after transaction
export function calculateNewBalance(
  currentBalance: number,
  amount: number,
  transactionType: string,
): number {
  const incomeTypes = ["receipt", "opening_balance", "transfer_in"];
  const expenseTypes = ["payment", "closing_balance", "transfer_out"];

  if (incomeTypes.includes(transactionType)) {
    return currentBalance + amount;
  } else if (expenseTypes.includes(transactionType)) {
    return currentBalance - amount;
  }

  return currentBalance; // For adjustment type, handle separately
}

// Get transaction type color for UI
export function getTransactionTypeColor(type: string): string {
  switch (type) {
    case "receipt":
    case "opening_balance":
      return "text-green-600";
    case "payment":
    case "closing_balance":
      return "text-red-600";
    case "transfer":
      return "text-blue-600";
    case "adjustment":
      return "text-yellow-600";
    default:
      return "text-gray-600";
  }
} // Get payment method icon for UI
export function getPaymentMethodIcon(method: string): string {
  switch (method) {
    case "cash":
      return "💵";
    case "credit_card":
      return "💳";
    case "debit_card":
      return "💳";
    case "pix":
      return "📱";
    case "bank_transfer":
      return "🏦";
    case "check":
      return "📄";
    default:
      return "💰";
  }
}

// Get category display name
export function getCategoryDisplayName(category: string): string {
  const categoryNames = {
    service_payment: "Pagamento de Serviço",
    product_sale: "Venda de Produto",
    expense: "Despesa",
    tax: "Taxa/Imposto",
    fee: "Tarifa",
    refund: "Reembolso",
    other: "Outros",
  };

  return categoryNames[category as keyof typeof categoryNames] || category;
}

// Get transaction type display name
export function getTransactionTypeDisplayName(type: string): string {
  const typeNames = {
    receipt: "Recebimento",
    payment: "Pagamento",
    transfer: "Transferência",
    adjustment: "Ajuste",
    opening_balance: "Saldo Inicial",
    closing_balance: "Saldo Final",
  };

  return typeNames[type as keyof typeof typeNames] || type;
}

// Get payment method display name
export function getPaymentMethodDisplayName(method: string): string {
  const methodNames = {
    cash: "Dinheiro",
    credit_card: "Cartão de Crédito",
    debit_card: "Cartão de Débito",
    pix: "PIX",
    bank_transfer: "Transferência Bancária",
    check: "Cheque",
    other: "Outros",
  };

  return methodNames[method as keyof typeof methodNames] || method;
}

// Calculate percentage change
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Date formatting utilities
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("pt-BR");
}

// Period calculation utilities
export function getDateRange(period: "today" | "week" | "month" | "year"): {
  start: string;
  end: string;
} {
  const now = new Date();
  const start = new Date();

  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "week":
      start.setDate(now.getDate() - 7);
      break;
    case "month":
      start.setMonth(now.getMonth() - 1);
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      break;
  }

  return {
    start: start.toISOString(),
    end: now.toISOString(),
  };
}

// Cash flow summary calculation
export function getCashFlowSummary(entries: CashFlowEntry[]): {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  transactionCount: number;
  recentTransactions: CashFlowEntry[];
} {
  const income = entries
    .filter((entry) => entry.transaction_type === "receipt")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const expenses = entries
    .filter((entry) => entry.transaction_type === "expense")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const netCashFlow = income - expenses;

  // Get recent transactions (last 5)
  const recentTransactions = entries
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return {
    totalIncome: income,
    totalExpenses: expenses,
    netCashFlow,
    transactionCount: entries.length,
    recentTransactions,
  };
}
