"use strict";
// Cash Flow Validation Tests
// Testing Zod validation schemas
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
Object.defineProperty(exports, "__esModule", { value: true });
var validation_1 = require("../utils/validation");
describe("Cash Flow Validation", function () {
  describe("CashFlowEntrySchema", function () {
    var validEntry = {
      clinic_id: "123e4567-e89b-12d3-a456-426614174000",
      transaction_type: "receipt",
      category: "service_payment",
      amount: 100.5,
      currency: "BRL",
      description: "Test transaction",
      payment_method: "cash",
      created_by: "123e4567-e89b-12d3-a456-426614174001",
    };
    it("validates correct cash flow entry", function () {
      var result = (0, validation_1.validateCashFlowEntry)(validEntry);
      expect(result.success).toBe(true);
    });
    it("rejects invalid clinic_id", function () {
      var _a;
      var result = (0, validation_1.validateCashFlowEntry)(
        __assign(__assign({}, validEntry), { clinic_id: "invalid-uuid" }),
      );
      expect(result.success).toBe(false);
      expect(
        (_a = result.error) === null || _a === void 0 ? void 0 : _a.issues[0].message,
      ).toContain("Invalid clinic ID");
    });
    it("rejects negative amounts", function () {
      var _a;
      var result = (0, validation_1.validateCashFlowEntry)(
        __assign(__assign({}, validEntry), { amount: -50 }),
      );
      expect(result.success).toBe(false);
      expect(
        (_a = result.error) === null || _a === void 0 ? void 0 : _a.issues[0].message,
      ).toContain("Amount must be positive");
    });
    it("rejects empty description", function () {
      var _a;
      var result = (0, validation_1.validateCashFlowEntry)(
        __assign(__assign({}, validEntry), { description: "" }),
      );
      expect(result.success).toBe(false);
      expect(
        (_a = result.error) === null || _a === void 0 ? void 0 : _a.issues[0].message,
      ).toContain("Description is required");
    });
    it("rejects invalid transaction type", function () {
      var result = (0, validation_1.validateCashFlowEntry)(
        __assign(__assign({}, validEntry), { transaction_type: "invalid_type" }),
      );
      expect(result.success).toBe(false);
    });
  });
  describe("CashRegisterSchema", function () {
    var validRegister = {
      clinic_id: "123e4567-e89b-12d3-a456-426614174000",
      register_name: "Caixa Principal",
      register_code: "CX001",
      location: "Recepção",
      responsible_user_id: "123e4567-e89b-12d3-a456-426614174001",
      opening_balance: 1000.0,
      is_active: true,
    };
    it("validates correct cash register", function () {
      var result = (0, validation_1.validateCashRegister)(validRegister);
      expect(result.success).toBe(true);
    });
    it("rejects empty register name", function () {
      var _a;
      var result = (0, validation_1.validateCashRegister)(
        __assign(__assign({}, validRegister), { register_name: "" }),
      );
      expect(result.success).toBe(false);
      expect(
        (_a = result.error) === null || _a === void 0 ? void 0 : _a.issues[0].message,
      ).toContain("Register name is required");
    });
    it("rejects negative opening balance", function () {
      var _a;
      var result = (0, validation_1.validateCashRegister)(
        __assign(__assign({}, validRegister), { opening_balance: -100 }),
      );
      expect(result.success).toBe(false);
      expect(
        (_a = result.error) === null || _a === void 0 ? void 0 : _a.issues[0].message,
      ).toContain("Opening balance cannot be negative");
    });
  });
  describe("CashFlowFiltersSchema", function () {
    it("validates correct filters", function () {
      var _a;
      try {
        process.stderr.write("🚀 TEST STARTED: validates correct filters\n");
        // Test with clearly different dates using YYYY-MM-DD format (date strings, not datetime)
        var filters = {
          dateFrom: "2025-01-01",
          dateTo: "2025-01-02",
          transactionType: "receipt",
          search: "test",
        };
        process.stderr.write("📦 Test data prepared: " + JSON.stringify(filters, null, 2) + "\n");
        process.stderr.write("🔍 About to call validateCashFlowFilters function...\n");
        var result = void 0;
        try {
          result = (0, validation_1.validateCashFlowFilters)(filters);
          process.stderr.write("✅ Function call completed successfully\n");
        } catch (validateError) {
          process.stderr.write("❌ Error during validation function call:\n");
          process.stderr.write("- Error type: " + typeof validateError + "\n");
          process.stderr.write(
            "- Error message: " +
              ((validateError === null || validateError === void 0
                ? void 0
                : validateError.message) || "N/A") +
              "\n",
          );
          throw validateError;
        }
        process.stderr.write("📊 Raw result object: " + JSON.stringify(result, null, 2) + "\n");
        process.stderr.write("📊 Result success: " + result.success + "\n");
        if (!result.success) {
          process.stderr.write("❌ VALIDATION FAILED - ERROR ANALYSIS:\n");
          process.stderr.write("- Error exists: " + !!result.error + "\n");
          if ((_a = result.error) === null || _a === void 0 ? void 0 : _a.issues) {
            process.stderr.write("- Issues count: " + result.error.issues.length + "\n");
            result.error.issues.forEach(function (issue, index) {
              process.stderr.write("  Issue ".concat(index + 1, ":\n"));
              process.stderr.write("    - Code: ".concat(issue.code, "\n"));
              process.stderr.write("    - Path: ".concat(JSON.stringify(issue.path), "\n"));
              process.stderr.write("    - Message: ".concat(issue.message, "\n"));
            });
          }
        } else {
          process.stderr.write("✅ Validation passed successfully\n");
          process.stderr.write("Parsed data: " + JSON.stringify(result.data, null, 2) + "\n");
        }
        process.stderr.write("🎯 About to run assertion...\n");
        expect(result.success).toBe(true);
      } catch (testError) {
        process.stderr.write("🚨 UNEXPECTED ERROR IN TEST:\n");
        process.stderr.write("- Error type: " + typeof testError + "\n");
        process.stderr.write(
          "- Error message: " +
            ((testError === null || testError === void 0 ? void 0 : testError.message) || "N/A") +
            "\n",
        );
        throw testError;
      }
    });
    it("rejects invalid date range", function () {
      var _a, _b;
      var filters = {
        dateFrom: "2025-01-31",
        dateTo: "2025-01-01",
      };
      console.log("Testing filters:", filters);
      console.log(
        "Date comparison:",
        new Date(filters.dateFrom),
        "<=",
        new Date(filters.dateTo),
        "=",
        new Date(filters.dateFrom) <= new Date(filters.dateTo),
      );
      var result = (0, validation_1.validateCashFlowFilters)(filters);
      console.log("Validation result:", result);
      if (!result.success) {
        console.log(
          "Error details:",
          (_a = result.error) === null || _a === void 0 ? void 0 : _a.issues,
        );
      }
      expect(result.success).toBe(false);
      expect(
        (_b = result.error) === null || _b === void 0 ? void 0 : _b.issues[0].message,
      ).toContain("Start date must be before end date");
    });
    it("validates empty filters", function () {
      var result = (0, validation_1.validateCashFlowFilters)({});
      expect(result.success).toBe(true);
    });
  });
});
