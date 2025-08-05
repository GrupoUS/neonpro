Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var utils_1 = require("@/lib/analytics/utils");
// Mock date-fns
globals_1.jest.mock("date-fns", () => ({
  format: globals_1.jest.fn((date, formatStr) => {
    var d = new Date(date);
    if (formatStr === "yyyy-MM-dd") {
      return d.toISOString().split("T")[0]; // Returns actual yyyy-mm-dd format
    }
    if (formatStr === "MMM yyyy") {
      var monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return "".concat(monthNames[d.getMonth()], " ").concat(d.getFullYear()); // Returns actual month year format
    }
    return d.toISOString().split("T")[0];
  }),
  subDays: globals_1.jest.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  subMonths: globals_1.jest.fn((date, months) => {
    var newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - months);
    return newDate;
  }),
  startOfMonth: globals_1.jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), 1)),
  endOfMonth: globals_1.jest.fn((date) => new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  isValid: globals_1.jest.fn(() => true),
  parseISO: globals_1.jest.fn((dateStr) => new Date(dateStr)),
  differenceInDays: globals_1.jest.fn(() => 30),
  differenceInMonths: globals_1.jest.fn(() => 12),
}));
// Mock lodash groupBy
globals_1.jest.mock("lodash", () => ({
  groupBy: globals_1.jest.fn((collection, keyFn) => {
    var result = {};
    for (var _i = 0, collection_1 = collection; _i < collection_1.length; _i++) {
      var item = collection_1[_i];
      var key = keyFn(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
    }
    return result;
  }),
}));
// Mock jsPDF and xlsx
var mockPDFInstance = {
  text: globals_1.jest.fn(),
  addPage: globals_1.jest.fn(),
  save: globals_1.jest.fn(),
  output: globals_1.jest.fn().mockReturnValue("mock-pdf-data"),
};
globals_1.jest.mock("jspdf", () => ({
  __esModule: true,
  default: globals_1.jest.fn(() => mockPDFInstance),
}));
globals_1.jest.mock("xlsx", () => ({
  utils: {
    json_to_sheet: globals_1.jest.fn().mockReturnValue({}),
    book_new: globals_1.jest.fn().mockReturnValue({}),
    book_append_sheet: globals_1.jest.fn(),
    sheet_to_csv: globals_1.jest.fn().mockReturnValue("mock,csv,data"),
  },
  write: globals_1.jest.fn().mockReturnValue("mock-xlsx-data"),
}));
(0, globals_1.describe)("Analytics Utils", () => {
  (0, globals_1.beforeEach)(() => {
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.describe)("formatCurrency", () => {
    (0, globals_1.test)("should format positive amounts correctly", () => {
      // Test various amounts
      (0, globals_1.expect)((0, utils_1.formatCurrency)(1234.56)).toBe("$1,234.56");
      (0, globals_1.expect)((0, utils_1.formatCurrency)(0)).toBe("$0.00");
      (0, globals_1.expect)((0, utils_1.formatCurrency)(1000000)).toBe("$1,000,000.00");
    });
    (0, globals_1.test)("should format negative amounts correctly", () => {
      (0, globals_1.expect)((0, utils_1.formatCurrency)(-1234.56)).toBe("-$1,234.56");
    });
    (0, globals_1.test)("should handle different currencies", () => {
      (0, globals_1.expect)((0, utils_1.formatCurrency)(1234.56, "EUR")).toBe("€1,234.56");
      (0, globals_1.expect)((0, utils_1.formatCurrency)(1234.56, "GBP")).toBe("£1,234.56");
    });
    (0, globals_1.test)("should handle decimal precision", () => {
      (0, globals_1.expect)((0, utils_1.formatCurrency)(1234.5, "USD", 0)).toBe("$1,235");
      (0, globals_1.expect)((0, utils_1.formatCurrency)(1234.567, "USD", 3)).toBe("$1,234.567");
    });
    (0, globals_1.test)("should handle invalid inputs", () => {
      (0, globals_1.expect)((0, utils_1.formatCurrency)(NaN)).toBe("$0.00");
      (0, globals_1.expect)((0, utils_1.formatCurrency)(null)).toBe("$0.00");
      (0, globals_1.expect)((0, utils_1.formatCurrency)(undefined)).toBe("$0.00");
    });
  });
  (0, globals_1.describe)("formatPercentage", () => {
    (0, globals_1.test)("should format decimal percentages correctly", () => {
      (0, globals_1.expect)((0, utils_1.formatPercentage)(0.1234)).toBe("12.34%");
      (0, globals_1.expect)((0, utils_1.formatPercentage)(0.5)).toBe("50.00%");
      (0, globals_1.expect)((0, utils_1.formatPercentage)(1.0)).toBe("100.00%");
    });
    (0, globals_1.test)("should handle negative percentages", () => {
      (0, globals_1.expect)((0, utils_1.formatPercentage)(-0.1234)).toBe("-12.34%");
    });
    (0, globals_1.test)("should handle precision parameter", () => {
      (0, globals_1.expect)((0, utils_1.formatPercentage)(0.1234, 0)).toBe("12%");
      (0, globals_1.expect)((0, utils_1.formatPercentage)(0.1234, 1)).toBe("12.3%");
      (0, globals_1.expect)((0, utils_1.formatPercentage)(0.1234, 3)).toBe("12.340%");
    });
    (0, globals_1.test)("should handle edge cases", () => {
      (0, globals_1.expect)((0, utils_1.formatPercentage)(0)).toBe("0.00%");
      (0, globals_1.expect)((0, utils_1.formatPercentage)(NaN)).toBe("0.00%");
      (0, globals_1.expect)((0, utils_1.formatPercentage)(Infinity)).toBe("0.00%");
    });
  });
  (0, globals_1.describe)("calculateGrowthRate", () => {
    (0, globals_1.test)("should calculate growth rate correctly", () => {
      (0, globals_1.expect)((0, utils_1.calculateGrowthRate)(100, 150)).toBe(0.5); // 50% growth
      (0, globals_1.expect)((0, utils_1.calculateGrowthRate)(200, 100)).toBe(-0.5); // -50% decline
      (0, globals_1.expect)((0, utils_1.calculateGrowthRate)(100, 100)).toBe(0); // No change
    });
    (0, globals_1.test)("should handle zero current value", () => {
      (0, globals_1.expect)((0, utils_1.calculateGrowthRate)(0, 100)).toBe(Infinity);
    });
    (0, globals_1.test)("should handle zero previous value", () => {
      (0, globals_1.expect)((0, utils_1.calculateGrowthRate)(100, 0)).toBe(-1); // -100% decline
    });
    (0, globals_1.test)("should handle invalid inputs", () => {
      (0, globals_1.expect)((0, utils_1.calculateGrowthRate)(NaN, 100)).toBeNaN();
      (0, globals_1.expect)((0, utils_1.calculateGrowthRate)(100, NaN)).toBeNaN();
    });
  });
  (0, globals_1.describe)("calculateChurnRate", () => {
    (0, globals_1.test)("should calculate churn rate correctly", () => {
      (0, globals_1.expect)((0, utils_1.calculateChurnRate)(10, 100)).toBe(0.1); // 10% churn
      (0, globals_1.expect)((0, utils_1.calculateChurnRate)(0, 100)).toBe(0); // No churn
      (0, globals_1.expect)((0, utils_1.calculateChurnRate)(25, 200)).toBe(0.125); // 12.5% churn
    });
    (0, globals_1.test)("should handle zero customers at start", () => {
      (0, globals_1.expect)((0, utils_1.calculateChurnRate)(10, 0)).toBe(0);
    });
    (0, globals_1.test)("should handle more churned than started", () => {
      (0, globals_1.expect)((0, utils_1.calculateChurnRate)(150, 100)).toBe(1.5);
    });
    (0, globals_1.test)("should handle invalid inputs", () => {
      (0, globals_1.expect)((0, utils_1.calculateChurnRate)(NaN, 100)).toBeNaN();
      (0, globals_1.expect)((0, utils_1.calculateChurnRate)(10, NaN)).toBeNaN();
      (0, globals_1.expect)((0, utils_1.calculateChurnRate)(-10, 100)).toBe(0); // Negative churn should be 0
    });
  });
  (0, globals_1.describe)("calculateLTV", () => {
    (0, globals_1.test)("should calculate LTV correctly with typical values", () => {
      (0, globals_1.expect)((0, utils_1.calculateLTV)(50, 0.05)).toBe(1000); // $50 ARPU, 5% churn
      (0, globals_1.expect)((0, utils_1.calculateLTV)(100, 0.1)).toBe(1000); // $100 ARPU, 10% churn
    });
    (0, globals_1.test)("should handle zero churn rate", () => {
      (0, globals_1.expect)((0, utils_1.calculateLTV)(50, 0)).toBe(Infinity);
    });
    (0, globals_1.test)("should handle zero ARPU", () => {
      (0, globals_1.expect)((0, utils_1.calculateLTV)(0, 0.05)).toBe(0);
    });
    (0, globals_1.test)("should handle invalid inputs", () => {
      (0, globals_1.expect)((0, utils_1.calculateLTV)(NaN, 0.05)).toBeNaN();
      (0, globals_1.expect)((0, utils_1.calculateLTV)(50, NaN)).toBeNaN();
      (0, globals_1.expect)((0, utils_1.calculateLTV)(-50, 0.05)).toBe(0); // Negative ARPU should return 0
    });
  });
  (0, globals_1.describe)("calculateMRR", () => {
    (0, globals_1.test)("should calculate MRR from subscriptions", () => {
      var subscriptions = [
        { amount: 2900, status: "active" }, // $29
        { amount: 4900, status: "active" }, // $49
        { amount: 9900, status: "cancelled" }, // Should be excluded
        { amount: 1900, status: "active" }, // $19
      ];
      (0, globals_1.expect)((0, utils_1.calculateMRR)(subscriptions)).toBe(97); // $97 MRR
    });
    (0, globals_1.test)("should handle empty subscriptions array", () => {
      (0, globals_1.expect)((0, utils_1.calculateMRR)([])).toBe(0);
    });
    (0, globals_1.test)("should only include active subscriptions", () => {
      var subscriptions = [
        { amount: 2900, status: "cancelled" },
        { amount: 4900, status: "past_due" },
        { amount: 1900, status: "paused" },
      ];
      (0, globals_1.expect)((0, utils_1.calculateMRR)(subscriptions)).toBe(0);
    });
    (0, globals_1.test)("should handle invalid subscription data", () => {
      var subscriptions = [
        { amount: NaN, status: "active" },
        { amount: null, status: "active" },
        { status: "active" }, // Missing amount
        { amount: 2900 }, // Missing status
      ];
      (0, globals_1.expect)((0, utils_1.calculateMRR)(subscriptions)).toBe(0);
    });
  });
  (0, globals_1.describe)("calculateARR", () => {
    (0, globals_1.test)("should calculate ARR from MRR", () => {
      (0, globals_1.expect)((0, utils_1.calculateARR)(1000)).toBe(12000); // $1000 MRR = $12,000 ARR
      (0, globals_1.expect)((0, utils_1.calculateARR)(0)).toBe(0);
    });
    (0, globals_1.test)("should handle invalid MRR values", () => {
      (0, globals_1.expect)((0, utils_1.calculateARR)(NaN)).toBeNaN();
      (0, globals_1.expect)((0, utils_1.calculateARR)(-1000)).toBe(-12000); // Negative ARR
    });
  });
  (0, globals_1.describe)("aggregateMetricsByPeriod", () => {
    var sampleData = [
      { date: "2024-01-01", value: 100, category: "A" },
      { date: "2024-01-15", value: 150, category: "B" },
      { date: "2024-02-01", value: 200, category: "A" },
      { date: "2024-02-15", value: 250, category: "B" },
    ];
    (0, globals_1.test)("should aggregate by month", () => {
      var result = (0, utils_1.aggregateMetricsByPeriod)(sampleData, "month", (items) =>
        items.reduce((sum, item) => sum + item.value, 0),
      );
      (0, globals_1.expect)(result).toEqual([
        { period: "Jan 2024", value: 250 },
        { period: "Feb 2024", value: 450 },
      ]);
    });
    (0, globals_1.test)("should aggregate by day", () => {
      var result = (0, utils_1.aggregateMetricsByPeriod)(sampleData, "day", (items) =>
        items.reduce((sum, item) => sum + item.value, 0),
      );
      (0, globals_1.expect)(result).toHaveLength(4);
      (0, globals_1.expect)(result[0]).toEqual({ period: "2024-01-01", value: 100 });
    });
    (0, globals_1.test)("should handle empty data", () => {
      var result = (0, utils_1.aggregateMetricsByPeriod)([], "month", (items) =>
        items.reduce((sum, item) => sum + item.value, 0),
      );
      (0, globals_1.expect)(result).toEqual([]);
    });
    (0, globals_1.test)("should handle custom aggregation functions", () => {
      var result = (0, utils_1.aggregateMetricsByPeriod)(sampleData, "month", (items) =>
        Math.max.apply(
          Math,
          items.map((item) => item.value),
        ),
      );
      (0, globals_1.expect)(result).toEqual([
        { period: "Jan 2024", value: 150 },
        { period: "Feb 2024", value: 250 },
      ]);
    });
  });
  (0, globals_1.describe)("generateDateRange", () => {
    (0, globals_1.test)("should generate date range correctly", () => {
      var start = new Date("2024-01-01");
      var end = new Date("2024-01-03");
      var result = (0, utils_1.generateDateRange)(start, end);
      (0, globals_1.expect)(result).toHaveLength(3);
      (0, globals_1.expect)(result[0].toISOString().substring(0, 10)).toBe("2024-01-01");
      (0, globals_1.expect)(result[2].toISOString().substring(0, 10)).toBe("2024-01-03");
    });
    (0, globals_1.test)("should handle single day range", () => {
      var date = new Date("2024-01-01");
      var result = (0, utils_1.generateDateRange)(date, date);
      (0, globals_1.expect)(result).toHaveLength(1);
      (0, globals_1.expect)(result[0].toISOString().substring(0, 10)).toBe("2024-01-01");
    });
    (0, globals_1.test)("should handle reverse date order", () => {
      var start = new Date("2024-01-03");
      var end = new Date("2024-01-01");
      (0, globals_1.expect)(() => (0, utils_1.generateDateRange)(start, end)).toThrow(
        "Start date must be before or equal to end date",
      );
    });
  });
  (0, globals_1.describe)("validateDateRange", () => {
    (0, globals_1.test)("should validate correct date ranges", () => {
      var start = new Date("2024-01-01");
      var end = new Date("2024-01-31");
      (0, globals_1.expect)((0, utils_1.validateDateRange)(start, end)).toBe(true);
    });
    (0, globals_1.test)("should reject invalid date ranges", () => {
      var start = new Date("2024-01-31");
      var end = new Date("2024-01-01");
      (0, globals_1.expect)((0, utils_1.validateDateRange)(start, end)).toBe(false);
    });
    (0, globals_1.test)("should handle equal dates", () => {
      var date = new Date("2024-01-01");
      (0, globals_1.expect)((0, utils_1.validateDateRange)(date, date)).toBe(true);
    });
    (0, globals_1.test)("should handle invalid dates", () => {
      var invalidDate = new Date("invalid");
      var validDate = new Date("2024-01-01");
      // Should return false for invalid dates (Date('invalid') creates Invalid Date)
      (0, globals_1.expect)((0, utils_1.validateDateRange)(invalidDate, validDate)).toBe(false);
    });
  });
  (0, globals_1.describe)("parseAnalyticsFilters", () => {
    (0, globals_1.test)("should parse valid filter parameters", () => {
      var params = new URLSearchParams({
        period: "last_month",
        metric: "subscriptions",
        start_date: "2024-01-01",
        end_date: "2024-01-31",
        group_by: "plan",
      });
      var result = (0, utils_1.parseAnalyticsFilters)(params);
      (0, globals_1.expect)(result).toEqual({
        period: "last_month",
        metric: "subscriptions",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-31"),
        groupBy: "plan",
        filters: {},
      });
    });
    (0, globals_1.test)("should provide default values for missing parameters", () => {
      var params = new URLSearchParams({});
      var result = (0, utils_1.parseAnalyticsFilters)(params);
      (0, globals_1.expect)(result.period).toBe("last_30_days");
      (0, globals_1.expect)(result.metric).toBe("all");
      (0, globals_1.expect)(result.startDate).toBeInstanceOf(Date);
      (0, globals_1.expect)(result.endDate).toBeInstanceOf(Date);
    });
    (0, globals_1.test)("should validate filter parameters", () => {
      var params = new URLSearchParams({
        period: "invalid_period",
        metric: "invalid_metric",
        start_date: "invalid_date",
      });
      (0, globals_1.expect)(() => (0, utils_1.parseAnalyticsFilters)(params)).toThrow(
        "Invalid filter parameters",
      );
    });
    (0, globals_1.test)("should handle complex filters", () => {
      var params = new URLSearchParams({
        period: "custom",
        start_date: "2024-01-01",
        end_date: "2024-01-31",
        "filter[status]": "active",
        "filter[plan]": "premium",
      });
      var result = (0, utils_1.parseAnalyticsFilters)(params);
      (0, globals_1.expect)(result.filters).toEqual({
        status: "active",
        plan: "premium",
      });
    });
  });
  (0, globals_1.describe)("export functions", () => {
    var sampleData = [
      { id: 1, name: "John Doe", email: "john@example.com", amount: 29.99 },
      { id: 2, name: "Jane Smith", email: "jane@example.com", amount: 49.99 },
    ];
    (0, globals_1.describe)("exportToCSV", () => {
      (0, globals_1.test)("should export data to CSV format", () => {
        var result = (0, utils_1.exportToCSV)(sampleData, "subscriptions");
        (0, globals_1.expect)(result).toBe("mock,csv,data");
        var XLSX = require("xlsx");
        (0, globals_1.expect)(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(sampleData);
        (0, globals_1.expect)(XLSX.utils.sheet_to_csv).toHaveBeenCalled();
      });
      (0, globals_1.test)("should handle empty data", () => {
        var result = (0, utils_1.exportToCSV)([], "subscriptions");
        (0, globals_1.expect)(result).toBe("mock,csv,data");
      });
      (0, globals_1.test)("should include metadata in filename", () => {
        var result = (0, utils_1.exportToCSV)(sampleData, "subscriptions", {
          filename: "custom_export",
          includeTimestamp: true,
        });
        (0, globals_1.expect)(result).toBe("mock,csv,data");
      });
    });
    (0, globals_1.describe)("exportToPDF", () => {
      (0, globals_1.test)("should export data to PDF format", () => {
        var result = (0, utils_1.exportToPDF)(sampleData, "Subscription Report");
        (0, globals_1.expect)(result).toBe("mock-pdf-data");
        var jsPDF = require("jspdf").default;
        (0, globals_1.expect)(jsPDF).toHaveBeenCalled();
      });
      (0, globals_1.test)("should handle custom styling options", () => {
        var options = {
          title: "Custom Report",
          fontSize: 12,
          margins: { top: 20, left: 20 },
        };
        var result = (0, utils_1.exportToPDF)(sampleData, "Custom Report", options);
        (0, globals_1.expect)(result).toBe("mock-pdf-data");
      });
      (0, globals_1.test)("should handle large datasets with pagination", () => {
        var largeData = Array(1000)
          .fill(null)
          .map((_, i) => ({
            id: i,
            name: "User ".concat(i),
            amount: Math.random() * 100,
          }));
        var result = (0, utils_1.exportToPDF)(largeData, "Large Report");
        (0, globals_1.expect)(result).toBe("mock-pdf-data");
        (0, globals_1.expect)(mockPDFInstance.addPage).toHaveBeenCalled();
      });
    });
    (0, globals_1.describe)("exportToExcel", () => {
      (0, globals_1.test)("should export data to Excel format", () => {
        var result = (0, utils_1.exportToExcel)(sampleData, "subscriptions");
        (0, globals_1.expect)(result).toBe("mock-xlsx-data");
        var XLSX = require("xlsx");
        (0, globals_1.expect)(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(sampleData);
        (0, globals_1.expect)(XLSX.utils.book_new).toHaveBeenCalled();
        (0, globals_1.expect)(XLSX.utils.book_append_sheet).toHaveBeenCalled();
      });
      (0, globals_1.test)("should handle multiple sheets", () => {
        var multiSheetData = {
          subscriptions: sampleData,
          analytics: [{ metric: "MRR", value: 15000 }],
        };
        var result = (0, utils_1.exportToExcel)(multiSheetData, "multi_sheet_report");
        (0, globals_1.expect)(result).toBe("mock-xlsx-data");
        var XLSX = require("xlsx");
        (0, globals_1.expect)(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(2);
      });
      (0, globals_1.test)("should apply formatting options", () => {
        var options = {
          formatting: {
            currency: ["amount"],
            percentage: ["growth_rate"],
            date: ["created_at"],
          },
        };
        var result = (0, utils_1.exportToExcel)(sampleData, "formatted_export", options);
        (0, globals_1.expect)(result).toBe("mock-xlsx-data");
      });
    });
  });
  (0, globals_1.describe)("error handling and edge cases", () => {
    (0, globals_1.test)("should handle null and undefined inputs gracefully", () => {
      (0, globals_1.expect)((0, utils_1.formatCurrency)(null)).toBe("$0.00");
      (0, globals_1.expect)((0, utils_1.formatPercentage)(undefined)).toBe("0.00%");
      (0, globals_1.expect)((0, utils_1.calculateGrowthRate)(null, undefined)).toBeNaN();
      (0, globals_1.expect)((0, utils_1.calculateMRR)(null)).toBe(0);
    });
    (0, globals_1.test)("should handle extremely large numbers", () => {
      var largeNumber = Number.MAX_SAFE_INTEGER;
      (0, globals_1.expect)((0, utils_1.formatCurrency)(largeNumber)).toContain("$");
      (0, globals_1.expect)((0, utils_1.calculateGrowthRate)(largeNumber, largeNumber * 2)).toBe(1);
    });
    (0, globals_1.test)("should handle floating point precision issues", () => {
      (0, globals_1.expect)((0, utils_1.calculateGrowthRate)(0.1 + 0.2, 0.3)).toBeCloseTo(0, 10);
      (0, globals_1.expect)((0, utils_1.formatCurrency)(0.1 + 0.2)).toBe("$0.30");
    });
    (0, globals_1.test)("should validate data types in complex functions", () => {
      var invalidData = [
        { amount: "not a number", status: "active" },
        { amount: 100, status: 123 },
        "not an object",
      ];
      (0, globals_1.expect)((0, utils_1.calculateMRR)(invalidData)).toBe(0);
    });
  });
});
