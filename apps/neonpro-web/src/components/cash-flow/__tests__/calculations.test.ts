// Cash Flow Utilities Tests
// Testing utility functions for cash flow management

import type {
  calculateNewBalance,
  formatCurrency,
  generateReferenceNumber,
  getCategoryDisplayName,
  getDateRange,
  getPaymentMethodIcon,
  getTransactionTypeColor,
  parseCurrency,
  validateAmount,
} from "../utils/calculations";

describe("Cash Flow Utilities", () => {
  describe("formatCurrency", () => {
    it("formats Brazilian currency correctly", () => {
      expect(formatCurrency(1234.56)).toBe("R$ 1.234,56");
      expect(formatCurrency(0)).toBe("R$ 0,00");
      expect(formatCurrency(1000000)).toBe("R$ 1.000.000,00");
    });
  });

  describe("parseCurrency", () => {
    it("parses currency strings correctly", () => {
      expect(parseCurrency("R$ 1.234,56")).toBe(1234.56);
      expect(parseCurrency("1,234.56")).toBe(1234.56);
      expect(parseCurrency("invalid")).toBe(0);
    });
  });

  describe("validateAmount", () => {
    it("validates amounts correctly", () => {
      expect(validateAmount(100)).toBe(true);
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-100)).toBe(false);
      expect(validateAmount(NaN)).toBe(false);
      expect(validateAmount(999999999)).toBe(true);
      expect(validateAmount(1000000000)).toBe(false);
    });
  });

  describe("calculateNewBalance", () => {
    it("calculates balance for income transactions", () => {
      expect(calculateNewBalance(1000, 500, "receipt")).toBe(1500);
      expect(calculateNewBalance(1000, 500, "opening_balance")).toBe(1500);
    });

    it("calculates balance for expense transactions", () => {
      expect(calculateNewBalance(1000, 300, "payment")).toBe(700);
      expect(calculateNewBalance(1000, 300, "closing_balance")).toBe(700);
    });

    it("maintains balance for adjustment transactions", () => {
      expect(calculateNewBalance(1000, 100, "adjustment")).toBe(1000);
    });
  });

  describe("generateReferenceNumber", () => {
    it("generates reference numbers with correct prefix", () => {
      const ref = generateReferenceNumber("receipt");
      expect(ref).toMatch(/^REC-\d{8}$/);

      const payRef = generateReferenceNumber("payment");
      expect(payRef).toMatch(/^PAY-\d{8}$/);
    });
  });

  describe("getTransactionTypeColor", () => {
    it("returns correct colors for transaction types", () => {
      expect(getTransactionTypeColor("receipt")).toBe("text-green-600");
      expect(getTransactionTypeColor("payment")).toBe("text-red-600");
      expect(getTransactionTypeColor("transfer")).toBe("text-blue-600");
      expect(getTransactionTypeColor("adjustment")).toBe("text-yellow-600");
      expect(getTransactionTypeColor("unknown")).toBe("text-gray-600");
    });
  });

  describe("getPaymentMethodIcon", () => {
    it("returns correct icons for payment methods", () => {
      expect(getPaymentMethodIcon("cash")).toBe("💵");
      expect(getPaymentMethodIcon("credit_card")).toBe("💳");
      expect(getPaymentMethodIcon("pix")).toBe("📱");
      expect(getPaymentMethodIcon("bank_transfer")).toBe("🏦");
      expect(getPaymentMethodIcon("unknown")).toBe("💰");
    });
  });

  describe("getCategoryDisplayName", () => {
    it("returns correct display names for categories", () => {
      expect(getCategoryDisplayName("service_payment")).toBe("Pagamento de Serviço");
      expect(getCategoryDisplayName("product_sale")).toBe("Venda de Produto");
      expect(getCategoryDisplayName("expense")).toBe("Despesa");
      expect(getCategoryDisplayName("other")).toBe("Outros");
    });
  });

  describe("getDateRange", () => {
    const now = new Date("2025-01-24T10:00:00.000Z");
    const mockNow = jest.spyOn(global, "Date").mockImplementation(() => now);

    afterEach(() => {
      mockNow.mockRestore();
    });

    it("returns correct date ranges", () => {
      const today = getDateRange("today");
      expect(new Date(today.start).getHours()).toBe(0);
      expect(new Date(today.end)).toEqual(now);

      const week = getDateRange("week");
      const expectedWeekStart = new Date("2025-01-17T10:00:00.000Z");
      expect(new Date(week.start)).toEqual(expectedWeekStart);

      const month = getDateRange("month");
      const expectedMonthStart = new Date("2024-12-24T10:00:00.000Z");
      expect(new Date(month.start)).toEqual(expectedMonthStart);
    });
  });
});
