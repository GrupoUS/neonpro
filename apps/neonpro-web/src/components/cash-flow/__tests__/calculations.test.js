// Cash Flow Utilities Tests
// Testing utility functions for cash flow management
Object.defineProperty(exports, "__esModule", { value: true });
var calculations_1 = require("../utils/calculations");
describe("Cash Flow Utilities", () => {
  describe("formatCurrency", () => {
    it("formats Brazilian currency correctly", () => {
      expect((0, calculations_1.formatCurrency)(1234.56)).toBe("R$ 1.234,56");
      expect((0, calculations_1.formatCurrency)(0)).toBe("R$ 0,00");
      expect((0, calculations_1.formatCurrency)(1000000)).toBe("R$ 1.000.000,00");
    });
  });
  describe("parseCurrency", () => {
    it("parses currency strings correctly", () => {
      expect((0, calculations_1.parseCurrency)("R$ 1.234,56")).toBe(1234.56);
      expect((0, calculations_1.parseCurrency)("1,234.56")).toBe(1234.56);
      expect((0, calculations_1.parseCurrency)("invalid")).toBe(0);
    });
  });
  describe("validateAmount", () => {
    it("validates amounts correctly", () => {
      expect((0, calculations_1.validateAmount)(100)).toBe(true);
      expect((0, calculations_1.validateAmount)(0)).toBe(false);
      expect((0, calculations_1.validateAmount)(-100)).toBe(false);
      expect((0, calculations_1.validateAmount)(NaN)).toBe(false);
      expect((0, calculations_1.validateAmount)(999999999)).toBe(true);
      expect((0, calculations_1.validateAmount)(1000000000)).toBe(false);
    });
  });
  describe("calculateNewBalance", () => {
    it("calculates balance for income transactions", () => {
      expect((0, calculations_1.calculateNewBalance)(1000, 500, "receipt")).toBe(1500);
      expect((0, calculations_1.calculateNewBalance)(1000, 500, "opening_balance")).toBe(1500);
    });
    it("calculates balance for expense transactions", () => {
      expect((0, calculations_1.calculateNewBalance)(1000, 300, "payment")).toBe(700);
      expect((0, calculations_1.calculateNewBalance)(1000, 300, "closing_balance")).toBe(700);
    });
    it("maintains balance for adjustment transactions", () => {
      expect((0, calculations_1.calculateNewBalance)(1000, 100, "adjustment")).toBe(1000);
    });
  });
  describe("generateReferenceNumber", () => {
    it("generates reference numbers with correct prefix", () => {
      var ref = (0, calculations_1.generateReferenceNumber)("receipt");
      expect(ref).toMatch(/^REC-\d{8}$/);
      var payRef = (0, calculations_1.generateReferenceNumber)("payment");
      expect(payRef).toMatch(/^PAY-\d{8}$/);
    });
  });
  describe("getTransactionTypeColor", () => {
    it("returns correct colors for transaction types", () => {
      expect((0, calculations_1.getTransactionTypeColor)("receipt")).toBe("text-green-600");
      expect((0, calculations_1.getTransactionTypeColor)("payment")).toBe("text-red-600");
      expect((0, calculations_1.getTransactionTypeColor)("transfer")).toBe("text-blue-600");
      expect((0, calculations_1.getTransactionTypeColor)("adjustment")).toBe("text-yellow-600");
      expect((0, calculations_1.getTransactionTypeColor)("unknown")).toBe("text-gray-600");
    });
  });
  describe("getPaymentMethodIcon", () => {
    it("returns correct icons for payment methods", () => {
      expect((0, calculations_1.getPaymentMethodIcon)("cash")).toBe("💵");
      expect((0, calculations_1.getPaymentMethodIcon)("credit_card")).toBe("💳");
      expect((0, calculations_1.getPaymentMethodIcon)("pix")).toBe("📱");
      expect((0, calculations_1.getPaymentMethodIcon)("bank_transfer")).toBe("🏦");
      expect((0, calculations_1.getPaymentMethodIcon)("unknown")).toBe("💰");
    });
  });
  describe("getCategoryDisplayName", () => {
    it("returns correct display names for categories", () => {
      expect((0, calculations_1.getCategoryDisplayName)("service_payment")).toBe(
        "Pagamento de Serviço",
      );
      expect((0, calculations_1.getCategoryDisplayName)("product_sale")).toBe("Venda de Produto");
      expect((0, calculations_1.getCategoryDisplayName)("expense")).toBe("Despesa");
      expect((0, calculations_1.getCategoryDisplayName)("other")).toBe("Outros");
    });
  });
  describe("getDateRange", () => {
    var now = new Date("2025-01-24T10:00:00.000Z");
    var mockNow = jest.spyOn(global, "Date").mockImplementation(() => now);
    afterEach(() => {
      mockNow.mockRestore();
    });
    it("returns correct date ranges", () => {
      var today = (0, calculations_1.getDateRange)("today");
      expect(new Date(today.start).getHours()).toBe(0);
      expect(new Date(today.end)).toEqual(now);
      var week = (0, calculations_1.getDateRange)("week");
      var expectedWeekStart = new Date("2025-01-17T10:00:00.000Z");
      expect(new Date(week.start)).toEqual(expectedWeekStart);
      var month = (0, calculations_1.getDateRange)("month");
      var expectedMonthStart = new Date("2024-12-24T10:00:00.000Z");
      expect(new Date(month.start)).toEqual(expectedMonthStart);
    });
  });
});
