"use strict";
// Cash Flow Calculations and Utilities
// Following financial dashboard patterns from Context7 research
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.parseCurrency = parseCurrency;
exports.validateAmount = validateAmount;
exports.generateReferenceNumber = generateReferenceNumber;
exports.calculateNewBalance = calculateNewBalance;
exports.getTransactionTypeColor = getTransactionTypeColor;
exports.getPaymentMethodIcon = getPaymentMethodIcon;
exports.getCategoryDisplayName = getCategoryDisplayName;
exports.getTransactionTypeDisplayName = getTransactionTypeDisplayName;
exports.getPaymentMethodDisplayName = getPaymentMethodDisplayName;
exports.calculatePercentageChange = calculatePercentageChange;
exports.formatPercentage = formatPercentage;
exports.formatDate = formatDate;
exports.formatDateTime = formatDateTime;
exports.getDateRange = getDateRange;
exports.getCashFlowSummary = getCashFlowSummary;
// Currency formatting for Brazilian Real
function formatCurrency(amount) {
  if (isNaN(amount)) return "R$ 0,00";
  // Use manual formatting to ensure consistent output for tests
  var absAmount = Math.abs(amount);
  var integerPart = Math.floor(absAmount);
  var decimalPart = Math.round((absAmount - integerPart) * 100);
  // Format integer part with thousand separators (dots)
  var formattedInteger = integerPart.toLocaleString("pt-BR");
  // Format decimal part with leading zero if needed
  var formattedDecimal = decimalPart.toString().padStart(2, "0");
  var sign = amount < 0 ? "-" : "";
  return "".concat(sign, "R$ ").concat(formattedInteger, ",").concat(formattedDecimal);
}
// Parse currency string to number
function parseCurrency(value) {
  if (!value || typeof value !== "string") return 0;
  // Normalize the string by removing any spaces and currency symbols
  var cleanValue = value.trim().replace(/R\$[\s\u00A0]*/, "");
  // Detect format based on patterns:
  // Brazilian: 1.234.567,89 (dots for thousands, comma for decimals)
  // American: 1,234,567.89 (commas for thousands, dot for decimals)
  if (cleanValue.includes(",") && cleanValue.includes(".")) {
    // Mixed format - determine which is the decimal separator
    var lastCommaIndex = cleanValue.lastIndexOf(",");
    var lastDotIndex = cleanValue.lastIndexOf(".");
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
  var parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}
// Validate transaction amount
function validateAmount(amount) {
  return !isNaN(amount) && amount > 0 && amount <= 999999999;
}
// Generate reference number
function generateReferenceNumber(type) {
  var timestamp = Date.now().toString().slice(-8);
  var prefix = type.toUpperCase().slice(0, 3);
  return "".concat(prefix, "-").concat(timestamp);
}
// Calculate register balance after transaction
function calculateNewBalance(currentBalance, amount, transactionType) {
  var incomeTypes = ["receipt", "opening_balance", "transfer_in"];
  var expenseTypes = ["payment", "closing_balance", "transfer_out"];
  if (incomeTypes.includes(transactionType)) {
    return currentBalance + amount;
  } else if (expenseTypes.includes(transactionType)) {
    return currentBalance - amount;
  }
  return currentBalance; // For adjustment type, handle separately
}
// Get transaction type color for UI
function getTransactionTypeColor(type) {
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
function getPaymentMethodIcon(method) {
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
function getCategoryDisplayName(category) {
  var categoryNames = {
    service_payment: "Pagamento de Serviço",
    product_sale: "Venda de Produto",
    expense: "Despesa",
    tax: "Taxa/Imposto",
    fee: "Tarifa",
    refund: "Reembolso",
    other: "Outros",
  };
  return categoryNames[category] || category;
}
// Get transaction type display name
function getTransactionTypeDisplayName(type) {
  var typeNames = {
    receipt: "Recebimento",
    payment: "Pagamento",
    transfer: "Transferência",
    adjustment: "Ajuste",
    opening_balance: "Saldo Inicial",
    closing_balance: "Saldo Final",
  };
  return typeNames[type] || type;
}
// Get payment method display name
function getPaymentMethodDisplayName(method) {
  var methodNames = {
    cash: "Dinheiro",
    credit_card: "Cartão de Crédito",
    debit_card: "Cartão de Débito",
    pix: "PIX",
    bank_transfer: "Transferência Bancária",
    check: "Cheque",
    other: "Outros",
  };
  return methodNames[method] || method;
}
// Calculate percentage change
function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
// Format percentage
function formatPercentage(value, decimals) {
  if (decimals === void 0) {
    decimals = 1;
  }
  return "".concat(value.toFixed(decimals), "%");
}
// Date formatting utilities
function formatDate(date) {
  return new Date(date).toLocaleDateString("pt-BR");
}
function formatDateTime(date) {
  return new Date(date).toLocaleString("pt-BR");
}
// Period calculation utilities
function getDateRange(period) {
  var now = new Date();
  var start = new Date();
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
function getCashFlowSummary(entries) {
  var income = entries
    .filter(function (entry) {
      return entry.transaction_type === "receipt";
    })
    .reduce(function (sum, entry) {
      return sum + entry.amount;
    }, 0);
  var expenses = entries
    .filter(function (entry) {
      return entry.transaction_type === "expense";
    })
    .reduce(function (sum, entry) {
      return sum + entry.amount;
    }, 0);
  var netCashFlow = income - expenses;
  // Get recent transactions (last 5)
  var recentTransactions = entries
    .sort(function (a, b) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, 5);
  return {
    totalIncome: income,
    totalExpenses: expenses,
    netCashFlow: netCashFlow,
    transactionCount: entries.length,
    recentTransactions: recentTransactions,
  };
}
