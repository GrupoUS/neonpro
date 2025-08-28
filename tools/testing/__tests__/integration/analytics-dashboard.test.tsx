import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { mockAnalyticsData } from "../../utils/mockData";

// MSW server setup for API mocking
const server = setupServer(
  // Mock analytics data endpoint
  rest.get("/api/analytics/data", (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockAnalyticsData));
  }),
  // Mock export endpoint
  rest.post("/api/analytics/export", (req, res, ctx) => {
    const { format } = req.body as { format: string };

    switch (format) {
      case "pdf": {
        return res(
          ctx.status(200),
          ctx.set("Content-Type", "application/pdf"),
          ctx.set(
            "Content-Disposition",
            'attachment; filename="analytics-report.pdf"',
          ),
          ctx.body("mock-pdf-content"),
        );
      }
      case "excel": {
        return res(
          ctx.status(200),
          ctx.set(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ),
          ctx.set(
            "Content-Disposition",
            'attachment; filename="analytics-report.xlsx"',
          ),
          ctx.body("mock-excel-content"),
        );
      }
      case "csv": {
        return res(
          ctx.status(200),
          ctx.set("Content-Type", "text/csv"),
          ctx.set(
            "Content-Disposition",
            'attachment; filename="analytics-report.csv"',
          ),
          ctx.text("Patient,Revenue\n100,10000\n120,12000"),
        );
      }
      default: {
        return res(ctx.status(400), ctx.json({ error: "Invalid format" }));
      }
    }
  }),
  // Mock error scenarios
  rest.get("/api/analytics/data-error", (_req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ error: "Database connection failed" }),
    );
  }),
);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

describe("analytics Dashboard Integration", () => {
  it("should load data and export to PDF end-to-end", async () => {
    const user = userEvent.setup();

    render(<AnalyticsDashboard />, { wrapper: createWrapper() });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("1,250")).toBeInTheDocument();
    });

    // Verify dashboard displays data correctly
    expect(screen.getByText("$125,000")).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();

    // Test export functionality
    const exportButton = screen.getByText("Export PDF");
    await user.click(exportButton);

    // Verify export was initiated
    await waitFor(() => {
      expect(
        screen.getByText("Export completed successfully"),
      ).toBeInTheDocument();
    });
  });

  it("should handle date range filtering end-to-end", async () => {
    const user = userEvent.setup();

    // Mock API with date range filtering
    server.use(
      rest.get("/api/analytics/data", (req, res, ctx) => {
        const startDate = req.url.searchParams.get("startDate");
        // Return different data based on date range
        const filteredData = {
          ...mockAnalyticsData,
          totalPatients: startDate === "2024-02-01" ? 800 : 1250,
        };

        return res(ctx.status(200), ctx.json(filteredData));
      }),
    );

    render(<AnalyticsDashboard />, { wrapper: createWrapper() });

    // Wait for initial data
    await waitFor(() => {
      expect(screen.getByText("1,250")).toBeInTheDocument();
    });

    // Change date range
    const startDateInput = screen.getByLabelText("Start Date");
    const endDateInput = screen.getByLabelText("End Date");

    await user.clear(startDateInput);
    await user.type(startDateInput, "2024-02-01");

    await user.clear(endDateInput);
    await user.type(endDateInput, "2024-02-28");

    // Apply filters
    const applyButton = screen.getByText("Apply Filters");
    await user.click(applyButton);

    // Verify filtered data is displayed
    await waitFor(() => {
      expect(screen.getByText("800")).toBeInTheDocument();
    });
  });

  it("should handle API errors gracefully", async () => {
    // Mock API error
    server.use(
      rest.get("/api/analytics/data", (_req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: "Database connection failed" }),
        );
      }),
    );

    render(<AnalyticsDashboard />, { wrapper: createWrapper() });

    // Wait for error state
    await waitFor(() => {
      expect(
        screen.getByText("Database connection failed"),
      ).toBeInTheDocument();
    });

    // Verify error UI is displayed
    expect(screen.getByTestId("analytics-error")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("should handle export errors", async () => {
    const user = userEvent.setup();

    // Mock export error
    server.use(
      rest.post("/api/analytics/export", (_req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: "Export service unavailable" }),
        );
      }),
    );

    render(<AnalyticsDashboard />, { wrapper: createWrapper() });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("1,250")).toBeInTheDocument();
    });

    // Try to export
    const exportButton = screen.getByText("Export PDF");
    await user.click(exportButton);

    // Verify error handling
    await waitFor(() => {
      expect(
        screen.getByText("Export service unavailable"),
      ).toBeInTheDocument();
    });
  });

  it("should handle multiple simultaneous operations", async () => {
    const user = userEvent.setup();

    render(<AnalyticsDashboard />, { wrapper: createWrapper() });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("1,250")).toBeInTheDocument();
    });

    // Trigger multiple operations simultaneously
    const exportPDFButton = screen.getByText("Export PDF");
    const exportExcelButton = screen.getByText("Export Excel");
    const refreshButton = screen.getByText("Refresh Data");

    await Promise.all([
      user.click(exportPDFButton),
      user.click(exportExcelButton),
      user.click(refreshButton),
    ]);

    // Verify all operations complete successfully
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  it("should maintain state during navigation", async () => {
    const user = userEvent.setup();

    render(<AnalyticsDashboard />, { wrapper: createWrapper() });

    // Set filters
    const startDateInput = screen.getByLabelText("Start Date");
    await user.clear(startDateInput);
    await user.type(startDateInput, "2024-02-01");

    const treatmentFilter = screen.getByLabelText("Treatments");
    await user.click(treatmentFilter);
    const facialOption = screen.getByRole("option", { name: "Facial" });
    await user.click(facialOption);

    // Apply filters
    const applyButton = screen.getByText("Apply Filters");
    await user.click(applyButton);

    // Verify filters are maintained after re-render
    expect(startDateInput).toHaveValue("2024-02-01");
    expect(screen.getByText("Facial")).toBeInTheDocument();
  });

  it("should handle real-time data updates", async () => {
    let callCount = 0;

    // Mock API with changing data
    server.use(
      rest.get("/api/analytics/data", (_req, res, ctx) => {
        callCount++;
        const data = {
          ...mockAnalyticsData,
          totalPatients: mockAnalyticsData.totalPatients + callCount * 10,
        };
        return res(ctx.status(200), ctx.json(data));
      }),
    );

    render(<AnalyticsDashboard />, { wrapper: createWrapper() });

    // Initial data load
    await waitFor(() => {
      expect(screen.getByText("1,260")).toBeInTheDocument(); // 1250 + 10
    });

    // Trigger refresh
    const refreshButton = screen.getByText("Refresh Data");
    await userEvent.click(refreshButton);

    // Verify updated data
    await waitFor(() => {
      expect(screen.getByText("1,270")).toBeInTheDocument(); // 1250 + 20
    });
  });

  it("should handle offline/network errors", async () => {
    // Mock network error
    server.use(
      rest.get("/api/analytics/data", (_req, res, _ctx) => {
        return res.networkError("Network connection failed");
      }),
    );

    render(<AnalyticsDashboard />, { wrapper: createWrapper() });

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/network/i)).toBeInTheDocument();
    });

    // Verify offline UI
    expect(screen.getByTestId("offline-indicator")).toBeInTheDocument();
  });
});
