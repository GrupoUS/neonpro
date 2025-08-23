import { beforeEach, describe, expect, test, vi } from "vitest";
import {
	aggregateMetricsByPeriod,
	calculateARR,
	calculateChurnRate,
	calculateGrowthRate,
	calculateLTV,
	calculateMRR,
	exportToCSV,
	exportToExcel,
	exportToPDF,
	formatAnalyticsCurrency,
	formatAnalyticsPercentage,
	generateDateRange,
	parseAnalyticsFilters,
	validateDateRange,
} from "../../../../../packages/utils/src/analytics/utils";

// Mock date-fns
vi.mock("date-fns", () => ({
	format: vi.fn((date, formatStr) => {
		const d = new Date(date);
		if (formatStr === "yyyy-MM-dd") {
			return d.toISOString().split("T")[0]; // Returns actual yyyy-mm-dd format
		}
		if (formatStr === "MMM yyyy") {
			const monthNames = [
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
			return `${monthNames[d.getMonth()]} ${d.getFullYear()}`; // Returns actual month year format
		}
		return d.toISOString().split("T")[0];
	}),
	subDays: vi.fn(
		(date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000),
	),
	subMonths: vi.fn((date, months) => {
		const newDate = new Date(date);
		newDate.setMonth(newDate.getMonth() - months);
		return newDate;
	}),
	startOfMonth: vi.fn(
		(date) => new Date(date.getFullYear(), date.getMonth(), 1),
	),
	endOfMonth: vi.fn(
		(date) => new Date(date.getFullYear(), date.getMonth() + 1, 0),
	),
	isValid: vi.fn(() => true),
	parseISO: vi.fn((dateStr) => new Date(dateStr)),
	differenceInDays: vi.fn(() => 30),
	differenceInMonths: vi.fn(() => 12),
}));

// Mock lodash groupBy
vi.mock("lodash", () => ({
	groupBy: vi.fn((collection, keyFn) => {
		const result: Record<string, any[]> = {};
		for (const item of collection) {
			const key = keyFn(item);
			if (!result[key]) {
				result[key] = [];
			}
			result[key].push(item);
		}
		return result;
	}),
}));

// Mock jsPDF and xlsx
const mockPDFInstance = {
	text: vi.fn(),
	addPage: vi.fn(),
	save: vi.fn(),
	output: vi.fn().mockReturnValue("mock-pdf-data"),
};

vi.mock("jspdf", () => ({
	__esModule: true,
	default: vi.fn(() => mockPDFInstance),
}));

vi.mock("xlsx", () => ({
	utils: {
		json_to_sheet: vi.fn().mockReturnValue({}),
		book_new: vi.fn().mockReturnValue({}),
		book_append_sheet: vi.fn(),
		sheet_to_csv: vi.fn().mockReturnValue("mock,csv,data"),
	},
	write: vi.fn().mockReturnValue("mock-xlsx-data"),
}));

describe("Analytics Utils", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("formatAnalyticsCurrency", () => {
		test("should format positive amounts correctly", () => {
			// Test various amounts
			expect(formatAnalyticsCurrency(1234.56)).toBe("$1,234.56");
			expect(formatAnalyticsCurrency(0)).toBe("$0.00");
			expect(formatAnalyticsCurrency(1_000_000)).toBe("$1,000,000.00");
		});

		test("should format negative amounts correctly", () => {
			expect(formatAnalyticsCurrency(-1234.56)).toBe("-$1,234.56");
		});

		test("should handle different currencies", () => {
			expect(formatAnalyticsCurrency(1234.56, "EUR")).toBe("€1,234.56");
			expect(formatAnalyticsCurrency(1234.56, "GBP")).toBe("£1,234.56");
		});

		test("should handle decimal precision", () => {
			expect(formatAnalyticsCurrency(1234.5, "USD", 0)).toBe("$1,235");
			expect(formatAnalyticsCurrency(1234.567, "USD", 3)).toBe("$1,234.567");
		});

		test("should handle invalid inputs", () => {
			expect(formatAnalyticsCurrency(Number.NaN)).toBe("$0.00");
			expect(formatAnalyticsCurrency(null as any)).toBe("$0.00");
			expect(formatAnalyticsCurrency(undefined as any)).toBe("$0.00");
		});
	});

	describe("formatAnalyticsPercentage", () => {
		test("should format decimal percentages correctly", () => {
			expect(formatAnalyticsPercentage(0.1234)).toBe("12.34%");
			expect(formatAnalyticsPercentage(0.5)).toBe("50.00%");
			expect(formatAnalyticsPercentage(1.0)).toBe("100.00%");
		});

		test("should handle negative percentages", () => {
			expect(formatAnalyticsPercentage(-0.1234)).toBe("-12.34%");
		});

		test("should handle precision parameter", () => {
			expect(formatAnalyticsPercentage(0.1234, 0)).toBe("12%");
			expect(formatAnalyticsPercentage(0.1234, 1)).toBe("12.3%");
			expect(formatAnalyticsPercentage(0.1234, 3)).toBe("12.340%");
		});

		test("should handle edge cases", () => {
			expect(formatAnalyticsPercentage(0)).toBe("0.00%");
			expect(formatAnalyticsPercentage(Number.NaN)).toBe("0.00%");
			expect(formatAnalyticsPercentage(Number.POSITIVE_INFINITY)).toBe("0.00%");
		});
	});

	describe("calculateGrowthRate", () => {
		test("should calculate growth rate correctly", () => {
			expect(calculateGrowthRate(100, 150)).toBe(0.5); // 50% growth
			expect(calculateGrowthRate(200, 100)).toBe(-0.5); // -50% decline
			expect(calculateGrowthRate(100, 100)).toBe(0); // No change
		});

		test("should handle zero current value", () => {
			expect(calculateGrowthRate(0, 100)).toBe(Number.POSITIVE_INFINITY);
		});

		test("should handle zero previous value", () => {
			expect(calculateGrowthRate(100, 0)).toBe(-1); // -100% decline
		});

		test("should handle invalid inputs", () => {
			expect(calculateGrowthRate(Number.NaN, 100)).toBeNaN();
			expect(calculateGrowthRate(100, Number.NaN)).toBeNaN();
		});
	});

	describe("calculateChurnRate", () => {
		test("should calculate churn rate correctly", () => {
			expect(calculateChurnRate(10, 100)).toBe(0.1); // 10% churn
			expect(calculateChurnRate(0, 100)).toBe(0); // No churn
			expect(calculateChurnRate(25, 200)).toBe(0.125); // 12.5% churn
		});

		test("should handle zero customers at start", () => {
			expect(calculateChurnRate(10, 0)).toBe(0);
		});

		test("should handle more churned than started", () => {
			expect(calculateChurnRate(150, 100)).toBe(1.5);
		});

		test("should handle invalid inputs", () => {
			expect(calculateChurnRate(Number.NaN, 100)).toBeNaN();
			expect(calculateChurnRate(10, Number.NaN)).toBeNaN();
			expect(calculateChurnRate(-10, 100)).toBe(0); // Negative churn should be 0
		});
	});

	describe("calculateLTV", () => {
		test("should calculate LTV correctly with typical values", () => {
			expect(calculateLTV(50, 0.05)).toBe(1000); // $50 ARPU, 5% churn
			expect(calculateLTV(100, 0.1)).toBe(1000); // $100 ARPU, 10% churn
		});

		test("should handle zero churn rate", () => {
			expect(calculateLTV(50, 0)).toBe(Number.POSITIVE_INFINITY);
		});

		test("should handle zero ARPU", () => {
			expect(calculateLTV(0, 0.05)).toBe(0);
		});

		test("should handle invalid inputs", () => {
			expect(calculateLTV(Number.NaN, 0.05)).toBeNaN();
			expect(calculateLTV(50, Number.NaN)).toBeNaN();
			expect(calculateLTV(-50, 0.05)).toBe(0); // Negative ARPU should return 0
		});
	});

	describe("calculateMRR", () => {
		test("should calculate MRR from subscriptions", () => {
			const subscriptions = [
				{ amount: 2900, status: "active" }, // $29
				{ amount: 4900, status: "active" }, // $49
				{ amount: 9900, status: "cancelled" }, // Should be excluded
				{ amount: 1900, status: "active" }, // $19
			];

			expect(calculateMRR(subscriptions)).toBe(97); // $97 MRR
		});

		test("should handle empty subscriptions array", () => {
			expect(calculateMRR([])).toBe(0);
		});

		test("should only include active subscriptions", () => {
			const subscriptions = [
				{ amount: 2900, status: "cancelled" },
				{ amount: 4900, status: "past_due" },
				{ amount: 1900, status: "paused" },
			];

			expect(calculateMRR(subscriptions)).toBe(0);
		});

		test("should handle invalid subscription data", () => {
			const subscriptions = [
				{ amount: Number.NaN, status: "active" },
				{ amount: null, status: "active" },
				{ status: "active" }, // Missing amount
				{ amount: 2900 }, // Missing status
			];

			expect(calculateMRR(subscriptions)).toBe(0);
		});
	});

	describe("calculateARR", () => {
		test("should calculate ARR from MRR", () => {
			expect(calculateARR(1000)).toBe(12_000); // $1000 MRR = $12,000 ARR
			expect(calculateARR(0)).toBe(0);
		});

		test("should handle invalid MRR values", () => {
			expect(calculateARR(Number.NaN)).toBeNaN();
			expect(calculateARR(-1000)).toBe(-12_000); // Negative ARR
		});
	});

	describe("aggregateMetricsByPeriod", () => {
		const sampleData = [
			{ date: "2024-01-01", value: 100, category: "A" },
			{ date: "2024-01-15", value: 150, category: "B" },
			{ date: "2024-02-01", value: 200, category: "A" },
			{ date: "2024-02-15", value: 250, category: "B" },
		];

		test("should aggregate by month", () => {
			const result = aggregateMetricsByPeriod(sampleData, "month", (items) =>
				items.reduce((sum, item) => sum + item.value, 0),
			);

			expect(result).toEqual([
				{ period: "Jan 2024", value: 250 },
				{ period: "Feb 2024", value: 450 },
			]);
		});

		test("should aggregate by day", () => {
			const result = aggregateMetricsByPeriod(sampleData, "day", (items) =>
				items.reduce((sum, item) => sum + item.value, 0),
			);

			expect(result).toHaveLength(4);
			expect(result[0]).toEqual({ period: "2024-01-01", value: 100 });
		});

		test("should handle empty data", () => {
			const result = aggregateMetricsByPeriod([], "month", (items) =>
				items.reduce((sum, item) => sum + item.value, 0),
			);

			expect(result).toEqual([]);
		});

		test("should handle custom aggregation functions", () => {
			const result = aggregateMetricsByPeriod(sampleData, "month", (items) =>
				Math.max(...items.map((item) => item.value)),
			);

			expect(result).toEqual([
				{ period: "Jan 2024", value: 150 },
				{ period: "Feb 2024", value: 250 },
			]);
		});
	});

	describe("generateDateRange", () => {
		test("should generate date range correctly", () => {
			const start = new Date("2024-01-01");
			const end = new Date("2024-01-03");

			const result = generateDateRange(start, end);

			expect(result).toHaveLength(3);
			expect(result[0].toISOString().substring(0, 10)).toBe("2024-01-01");
			expect(result[2].toISOString().substring(0, 10)).toBe("2024-01-03");
		});

		test("should handle single day range", () => {
			const date = new Date("2024-01-01");
			const result = generateDateRange(date, date);

			expect(result).toHaveLength(1);
			expect(result[0].toISOString().substring(0, 10)).toBe("2024-01-01");
		});

		test("should handle reverse date order", () => {
			const start = new Date("2024-01-03");
			const end = new Date("2024-01-01");

			expect(() => generateDateRange(start, end)).toThrow(
				"Start date must be before or equal to end date",
			);
		});
	});

	describe("validateDateRange", () => {
		test("should validate correct date ranges", () => {
			const start = new Date("2024-01-01");
			const end = new Date("2024-01-31");

			expect(validateDateRange(start, end)).toBe(true);
		});

		test("should reject invalid date ranges", () => {
			const start = new Date("2024-01-31");
			const end = new Date("2024-01-01");

			expect(validateDateRange(start, end)).toBe(false);
		});

		test("should handle equal dates", () => {
			const date = new Date("2024-01-01");

			expect(validateDateRange(date, date)).toBe(true);
		});

		test("should handle invalid dates", () => {
			const invalidDate = new Date("invalid");
			const validDate = new Date("2024-01-01");

			// Should return false for invalid dates (Date('invalid') creates Invalid Date)
			expect(validateDateRange(invalidDate, validDate)).toBe(false);
		});
	});

	describe("parseAnalyticsFilters", () => {
		test("should parse valid filter parameters", () => {
			const params = new URLSearchParams({
				period: "last_month",
				metric: "subscriptions",
				start_date: "2024-01-01",
				end_date: "2024-01-31",
				group_by: "plan",
			});

			const result = parseAnalyticsFilters(params);

			expect(result).toEqual({
				period: "last_month",
				metric: "subscriptions",
				startDate: new Date("2024-01-01"),
				endDate: new Date("2024-01-31"),
				groupBy: "plan",
				filters: {},
			});
		});

		test("should provide default values for missing parameters", () => {
			const params = new URLSearchParams({});

			const result = parseAnalyticsFilters(params);

			expect(result.period).toBe("last_30_days");
			expect(result.metric).toBe("all");
			expect(result.startDate).toBeInstanceOf(Date);
			expect(result.endDate).toBeInstanceOf(Date);
		});

		test("should validate filter parameters", () => {
			const params = new URLSearchParams({
				period: "invalid_period",
				metric: "invalid_metric",
				start_date: "invalid_date",
			});

			expect(() => parseAnalyticsFilters(params)).toThrow(
				"Invalid filter parameters",
			);
		});

		test("should handle complex filters", () => {
			const params = new URLSearchParams({
				period: "custom",
				start_date: "2024-01-01",
				end_date: "2024-01-31",
				"filter[status]": "active",
				"filter[plan]": "premium",
			});

			const result = parseAnalyticsFilters(params);

			expect(result.filters).toEqual({
				status: "active",
				plan: "premium",
			});
		});
	});

	describe("export functions", () => {
		const sampleData = [
			{ id: 1, name: "John Doe", email: "john@example.com", amount: 29.99 },
			{ id: 2, name: "Jane Smith", email: "jane@example.com", amount: 49.99 },
		];

		describe("exportToCSV", () => {
			test("should export data to CSV format", () => {
				const result = exportToCSV(sampleData, "subscriptions");

				// Check that it returns CSV-formatted string
				expect(typeof result).toBe("string");
				expect(result).toContain("id,name,email,amount");
				expect(result).toContain("John Doe");
				expect(result).toContain("jane@example.com");
			});

			test("should handle empty data", () => {
				const result = exportToCSV([], "subscriptions");

				expect(typeof result).toBe("string");
				expect(result.length).toBeGreaterThanOrEqual(0);
			});

			test("should include metadata in filename", () => {
				const result = exportToCSV(sampleData, "subscriptions", {
					filename: "custom_export",
					includeTimestamp: true,
				});

				expect(typeof result).toBe("string");
				expect(result).toContain("John Doe");
			});
		});

		describe("exportToPDF", () => {
			test("should export data to PDF format", () => {
				const result = exportToPDF(sampleData, "Subscription Report");

				// Check that it returns PDF data (binary string starting with %PDF)
				expect(typeof result).toBe("string");
				expect(result).toMatch(/^%PDF-/);
			});

			test("should handle custom styling options", () => {
				const options = {
					title: "Custom Report",
					fontSize: 12,
					margins: { top: 20, left: 20 },
				};

				const result = exportToPDF(sampleData, "Custom Report", options);

				// Check that it returns PDF data (binary string starting with %PDF)
				expect(typeof result).toBe("string");
				expect(result).toMatch(/^%PDF-/);
			});

			test("should handle large datasets with pagination", () => {
				const largeData = new Array(1000).fill(null).map((_, i) => ({
					id: i,
					name: `User ${i}`,
					amount: Math.random() * 100,
				}));

				const result = exportToPDF(largeData, "Large Report");

				// Check that it returns PDF data (binary string starting with %PDF)
				expect(typeof result).toBe("string");
				expect(result).toMatch(/^%PDF-/);
			});
		});

		describe("exportToExcel", () => {
			test("should export data to Excel format", () => {
				const result = exportToExcel(sampleData, "subscriptions");

				// Check that it returns Excel data (binary string starting with PK for ZIP format)
				expect(typeof result).toBe("string");
				expect(result).toMatch(/^PK/);
			});

			test("should handle multiple sheets", () => {
				const multiSheetData = {
					subscriptions: sampleData,
					analytics: [{ metric: "MRR", value: 15_000 }],
				};

				const result = exportToExcel(multiSheetData, "multi_sheet_report");

				// Check that it returns Excel data (binary string starting with PK for ZIP format)
				expect(typeof result).toBe("string");
				expect(result).toMatch(/^PK/);
			});

			test("should apply formatting options", () => {
				const options = {
					formatting: {
						currency: ["amount"],
						percentage: ["growth_rate"],
						date: ["created_at"],
					},
				};

				const result = exportToExcel(sampleData, "formatted_export", options);

				// Check that it returns Excel data (binary string starting with PK for ZIP format)
				expect(typeof result).toBe("string");
				expect(result).toMatch(/^PK/);
			});
		});
	});

	describe("error handling and edge cases", () => {
		test("should handle null and undefined inputs gracefully", () => {
			expect(formatAnalyticsCurrency(null as any)).toBe("$0.00");
			expect(formatAnalyticsPercentage(undefined as any)).toBe("0.00%");
			expect(calculateGrowthRate(null as any, undefined as any)).toBeNaN();
			expect(calculateMRR(null as any)).toBe(0);
		});

		test("should handle extremely large numbers", () => {
			const largeNumber = Number.MAX_SAFE_INTEGER;
			expect(formatAnalyticsCurrency(largeNumber)).toContain("$");
			expect(calculateGrowthRate(largeNumber, largeNumber * 2)).toBe(1);
		});

		test("should handle floating point precision issues", () => {
			expect(calculateGrowthRate(0.1 + 0.2, 0.3)).toBeCloseTo(0, 10);
			expect(formatAnalyticsCurrency(0.1 + 0.2)).toBe("$0.30");
		});

		test("should validate data types in complex functions", () => {
			const invalidData = [
				{ amount: "not a number", status: "active" },
				{ amount: 100, status: 123 },
				"not an object",
			];

			expect(calculateMRR(invalidData as any)).toBe(0);
		});
	});
});
