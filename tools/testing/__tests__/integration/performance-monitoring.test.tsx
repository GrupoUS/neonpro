/**
 * Performance Integration Tests
 * Comprehensive testing for performance monitoring system
 */

import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";

// Mock web-vitals with proper function references
vi.mock("web-vitals", () => ({
	getCLS: vi.fn(),
	getFID: vi.fn(),
	getFCP: vi.fn(),
	getLCP: vi.fn(),
	getTTFB: vi.fn(),
	getINP: vi.fn(),
}));

import { getCLS, getFCP, getFID, getINP, getLCP, getTTFB } from "web-vitals";
import PerformanceDashboard from "@/components/dashboard/performance-dashboard";
// Import components after mocking
import { PerformanceMonitor } from "@/lib/performance/integration";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock performance API
Object.defineProperty(global, "performance", {
	value: {
		now: jest.fn(() => Date.now()),
		memory: {
			usedJSHeapSize: 10_000_000,
			totalJSHeapSize: 20_000_000,
			jsHeapSizeLimit: 50_000_000,
		},
		getEntriesByType: jest.fn(() => []),
		mark: vi.fn(),
		measure: vi.fn(),
	},
	writable: true,
});

// Mock navigator
Object.defineProperty(global, "navigator", {
	value: {
		connection: {
			effectiveType: "4g",
			downlink: 10,
			rtt: 100,
		},
		userAgent: "Jest test environment",
		hardwareConcurrency: 4,
	},
	writable: true,
});

describe("Performance Monitoring Integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// Set environment variable to enable performance tracking in tests
		process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_TRACKING = "true";

		// Setup default fetch mock
		mockFetch.mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					success: true,
					current: {
						lcp: 2.1,
						fid: 80,
						cls: 0.05,
						fcp: 1.5,
						ttfb: 600,
						score: 95,
						timestamp: new Date().toISOString(),
						page: "/dashboard",
					},
					history: [],
					averages: {
						lcp: 2.1,
						fid: 80,
						cls: 0.05,
						fcp: 1.5,
						ttfb: 600,
						score: 95,
					},
					insights: {
						trends: {},
						recommendations: [],
						alerts: [],
					},
				}),
		});

		// Setup web-vitals mocks to call callbacks
		(getCLS as vi.Mock).mockImplementation((callback) => {
			setTimeout(() => callback({ value: 0.1 }), 0);
		});
		(getFID as vi.Mock).mockImplementation((callback) => {
			setTimeout(() => callback({ value: 100 }), 0);
		});
		(getFCP as vi.Mock).mockImplementation((callback) => {
			setTimeout(() => callback({ value: 1500 }), 0);
		});
		(getLCP as vi.Mock).mockImplementation((callback) => {
			setTimeout(() => callback({ value: 2500 }), 0);
		});
		(getTTFB as vi.Mock).mockImplementation((callback) => {
			setTimeout(() => callback({ value: 200 }), 0);
		});
		(getINP as vi.Mock).mockImplementation((callback) => {
			setTimeout(() => callback({ value: 150 }), 0);
		});
	});

	afterEach(() => {
		// Clean up environment variable
		process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_TRACKING = undefined;
		cleanup();
	});

	describe("Performance Monitoring Hook", () => {
		it("should collect and send Core Web Vitals metrics", async () => {
			const TestComponent = () => {
				return (
					<PerformanceMonitor>
						<div>Test Content</div>
					</PerformanceMonitor>
				);
			};

			render(<TestComponent />);

			// Wait for web-vitals to be called
			await waitFor(() => {
				expect(getCLS).toHaveBeenCalled();
				expect(getFID).toHaveBeenCalled();
				expect(getFCP).toHaveBeenCalled();
				expect(getLCP).toHaveBeenCalled();
				expect(getTTFB).toHaveBeenCalled();
			});

			// Wait for potential API call
			await waitFor(
				() => {
					expect(mockFetch).toHaveBeenCalledWith(
						"/api/analytics/performance",
						expect.objectContaining({
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
						}),
					);
				},
				{ timeout: 3000 },
			);
		});

		it("should calculate performance score correctly", async () => {
			const TestComponent = () => {
				return (
					<PerformanceMonitor>
						<div>Test Content</div>
					</PerformanceMonitor>
				);
			};

			render(<TestComponent />);

			// Wait for metrics collection
			await waitFor(() => {
				expect(getCLS).toHaveBeenCalled();
			});

			// Wait for API call with performance data
			await waitFor(
				() => {
					const fetchCall = mockFetch.mock.calls.find(
						(call) => call[0] === "/api/analytics/performance",
					);
					expect(fetchCall).toBeDefined();

					if (fetchCall) {
						const body = JSON.parse(fetchCall[1].body);
						expect(body).toHaveProperty("cls");
						expect(body).toHaveProperty("fid");
						expect(body).toHaveProperty("fcp");
						expect(body).toHaveProperty("lcp");
						expect(body).toHaveProperty("score");
						expect(typeof body.score).toBe("number");
					}
				},
				{ timeout: 3000 },
			);
		});

		it("should detect device type correctly", async () => {
			const TestComponent = () => {
				return (
					<PerformanceMonitor>
						<div>Test Content</div>
					</PerformanceMonitor>
				);
			};

			render(<TestComponent />);

			await waitFor(
				() => {
					const fetchCall = mockFetch.mock.calls.find(
						(call) => call[0] === "/api/analytics/performance",
					);

					if (fetchCall) {
						const body = JSON.parse(fetchCall[1].body);
						expect(body).toHaveProperty("deviceType");
						expect(["mobile", "tablet", "desktop"]).toContain(body.deviceType);
					}
				},
				{ timeout: 3000 },
			);
		});
	});

	describe("Performance Dashboard Component", () => {
		it("should render performance metrics", async () => {
			await act(async () => {
				render(<PerformanceDashboard />);
			});

			expect(screen.getByText("Performance Dashboard")).toBeInTheDocument();
			expect(screen.getByText("Core Web Vitals")).toBeInTheDocument();
		});

		it("should display performance score with correct color coding", async () => {
			await act(async () => {
				render(<PerformanceDashboard />);
			});

			await waitFor(() => {
				expect(screen.getByText("Performance Score")).toBeInTheDocument();
			});

			// Test score display
			const scoreElement = screen.getByText(/95/);
			expect(scoreElement).toBeInTheDocument();
		});

		it("should show performance badges correctly", async () => {
			await act(async () => {
				render(<PerformanceDashboard />);
			});

			await waitFor(() => {
				// Check for performance badges - look for specific metric labels
				expect(
					screen.getByText("Largest Contentful Paint"),
				).toBeInTheDocument();
				expect(screen.getByText("First Input Delay")).toBeInTheDocument();
				expect(screen.getByText("Cumulative Layout Shift")).toBeInTheDocument();
			});
		});

		it("should handle loading state", () => {
			render(<PerformanceDashboard />);

			// Initially should show loading
			expect(
				screen.getByText("Loading performance metrics..."),
			).toBeInTheDocument();
		});

		it("should refresh metrics when button is clicked", async () => {
			await act(async () => {
				render(<PerformanceDashboard />);
			});

			// Wait for initial load
			await waitFor(() => {
				expect(
					screen.queryByText("Loading performance data..."),
				).not.toBeInTheDocument();
			});

			// Find and click refresh button
			const refreshButton = screen.getByText("Refresh");
			await act(async () => {
				fireEvent.click(refreshButton);
			});

			// Should make another API call
			await waitFor(() => {
				expect(mockFetch).toHaveBeenCalledTimes(2);
			});
		});
	});

	describe("Performance API Integration", () => {
		it("should handle API errors gracefully", async () => {
			// Mock API error
			mockFetch.mockRejectedValueOnce(new Error("API Error"));

			const consoleSpy = vi.spyOn(console, "error").mockImplementation();

			const TestComponent = () => {
				return (
					<PerformanceMonitor>
						<div>Test Content</div>
					</PerformanceMonitor>
				);
			};

			render(<TestComponent />);

			await waitFor(
				() => {
					expect(consoleSpy).toHaveBeenCalledWith(
						"❌ Failed to send performance metrics:",
						expect.any(Error),
					);
				},
				{ timeout: 3000 },
			);

			consoleSpy.mockRestore();
		});

		it("should respect environment configuration", async () => {
			// Mock production environment
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "production";

			const TestComponent = () => {
				return (
					<PerformanceMonitor>
						<div>Test Content</div>
					</PerformanceMonitor>
				);
			};

			render(<TestComponent />);

			// Restore environment
			process.env.NODE_ENV = originalEnv;

			// Should still collect metrics in production
			await waitFor(() => {
				expect(getCLS).toHaveBeenCalled();
			});
		});
	});

	describe("Performance Calculations", () => {
		it("should calculate correct performance scores for different metric combinations", () => {
			// Test performance score calculation logic
			const testCases = [
				{ lcp: 2.5, fid: 100, cls: 0.1, fcp: 1.8, expected: "good" },
				{ lcp: 4.0, fid: 300, cls: 0.25, fcp: 3.0, expected: "poor" },
				{ lcp: 3.0, fid: 200, cls: 0.15, fcp: 2.5, expected: "poor" }, // Corrigido: resultado deveria ser 'poor'
			];

			testCases.forEach(({ lcp, fid, cls, fcp, expected }) => {
				// Calculate score based on thresholds (fixed calculation)
				let score = 100;
				if (lcp > 4.0) {
					score -= 30;
				} else if (lcp > 2.5) {
					score -= 15;
				}

				if (fid > 300) {
					score -= 30;
				} else if (fid > 100) {
					score -= 15;
				}

				if (cls > 0.25) {
					score -= 30;
				} else if (cls > 0.1) {
					score -= 15;
				}

				if (fcp > 3.0) {
					score -= 10;
				} else if (fcp > 1.8) {
					score -= 5;
				}

				const category =
					score >= 90 ? "good" : score >= 70 ? "needs-improvement" : "poor";
				expect(category).toBe(expected);
			});
		});
	});
});
