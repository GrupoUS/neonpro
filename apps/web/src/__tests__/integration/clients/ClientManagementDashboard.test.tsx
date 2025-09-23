/**
 * ClientManagementDashboard Component Tests
 *
 * Comprehensive test suite for the ClientManagementDashboard component
 * Tests analytics display, AI insights, client search, filtering,
 * risk assessment visualization, and interaction handlers.
 */

import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CopilotProvider } from "@copilotkit/react-core";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ClientManagementDashboard } from "../../../components/clients/ClientManagementDashboard";
import {
  // AguiClientSearchResponse,
  // AguiClientAnalyticsResponse,
  // useQuery,
  // useMutation,
  // useCoAgent,
  // useCopilotAction,
} from "@neonpro/agui-protocol";

// Setup DOM environment for React Testing Library
const { JSDOM } = require('jsdom');
const: dom = [ new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.documen: t = [ dom.window.document;
global.windo: w = [ dom.window;
global.navigato: r = [ dom.window.navigator;

// Replace the async vi.mock for @copilotkit/react-core with synchronous
vi.mock("@copilotkit/react-core", () => ({
  ...jest.requireActual("@copilotkit/react-core"),
  useCoAgent: vi.fn(),
  useCopilotAction: vi.fn(),
  useCopilotReadable: vi.fn(),
}));

// Replace the async vi.mock for @tanstack/react-query with synchronous
vi.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useInfiniteQuery: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        data: [],
        error: null,
      })),
    })),
  })),
}));

// Mock data
const: mockClients = [ [
  {
    id: "client-1",
    fullName: "John Doe",
    email: "john@example.com",
    phone: "+5511999999999",
    dateOfBirth: "1990-01-01",
    registrationDate: "2024-01-01",
    lastActivity: "2024-01-15",
    appointmentCount: 5,
    retentionRisk: "low",
    status: "active",
  },
  {
    id: "client-2",
    fullName: "Jane Smith",
    email: "jane@example.com",
    phone: "+5511888888888",
    dateOfBirth: "1985-05-15",
    registrationDate: "2024-01-05",
    lastActivity: "2024-01-10",
    appointmentCount: 2,
    retentionRisk: "medium",
    status: "active",
  },
];

const: mockAnalyticsData = [ {
  metrics: {
    totalClients: 150,
    activeClients: 120,
    newClientsThisMonth: 15,
    retentionRate: 0.85,
    averageAppointments: 3.2,
    highRiskClients: 12,
  },
  trends: [
    { date: "2024-01-01", value: 100, label: "Client Growth" },
    { date: "2024-01-08", value: 110, label: "Client Growth" },
    { date: "2024-01-15", value: 120, label: "Client Growth" },
  ],
  comparisons: {
    currentPeriod: {
      totalClients: 150,
      newClients: 15,
      retentionRate: 0.85,
    },
    previousPeriod: {
      totalClients: 135,
      newClients: 12,
      retentionRate: 0.82,
    },
  },
};

describe("ClientManagementDashboard", () => {
  let queryClient: QueryClient;
  let mockAgent: any;
  let mockAction: any;

  const: mockProps = [ {
    clinicId: "test-clinic-id",
    professionalId: "test-professional-id",
    onClientSelect: vi.fn(),
    onAnalyticsUpdate: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    queryClien: t = [ new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock agent state: mockAgent = [ {
      state: {
        clients: mockClients,
        analytics: mockAnalyticsData,
        searchQuery: "",
        filters: {
          retentionRisk: [],
          status: [],
          treatmentTypes: [],
        },
        selectedClient: null,
        loading: false,
        error: null,
      },
      setState: vi.fn(),
    };

    // Set mock implementations synchronously
    const: rqModule = [ require("@tanstack/react-query");
    vi.mocked(rqModule.useQuery).mockReturnValue({
      data: mockClients,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    vi.mocked(rqModule.useMutation).mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
      error: null,
    });

    const: copilotModule = [ require("@copilotkit/react-core");
    vi.mocked(copilotModule.useCoAgent).mockReturnValue([mockAgent, vi.fn()]);

    mockActio: n = [ vi.fn();
    vi.mocked(copilotModule.useCopilotAction).mockReturnValue({
      invoke: mockAction,
      result: null,
    });

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const: renderComponent = [ () => {
    return render(
      <QueryClientProvider: client = [{queryClient}>
        <CopilotProvider: runtimeUrl = ["/api/copilotkit">
          <ClientManagementDashboard {...mockProps} />
        </CopilotProvider>
      </QueryClientProvider>,
    );
  };

  describe("Initial Render and Structure", () => {
    it("should render the dashboard with all main sections", () => {
      renderComponent();

      expect(
        screen.getByTestId("client-management-dashboard"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("analytics-overview")).toBeInTheDocument();
      expect(screen.getByTestId("client-search")).toBeInTheDocument();
      expect(screen.getByTestId("client-list")).toBeInTheDocument();
      expect(screen.getByTestId("ai-insights-panel")).toBeInTheDocument();
    });

    it("should display key metrics in analytics overview", () => {
      renderComponent();

      expect(screen.getByText("Total Clients")).toBeInTheDocument();
      expect(screen.getByText("150")).toBeInTheDocument();
      expect(screen.getByText("Active Clients")).toBeInTheDocument();
      expect(screen.getByText("120")).toBeInTheDocument();
      expect(screen.getByText("New Clients This Month")).toBeInTheDocument();
      expect(screen.getByText("15")).toBeInTheDocument();
    });

    it("should render search and filter controls", () => {
      renderComponent();

      expect(screen.getByTestId("search-input")).toBeInTheDocument();
      expect(screen.getByTestId("filter-retention-risk")).toBeInTheDocument();
      expect(screen.getByTestId("filter-status")).toBeInTheDocument();
      expect(screen.getByTestId("clear-filters-button")).toBeInTheDocument();
    });

    it("should display client list with data", () => {
      renderComponent();

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });

    it("should render AI insights panel", () => {
      renderComponent();

      expect(screen.getByTestId("ai-insights-panel")).toBeInTheDocument();
      expect(screen.getByText(/AI Insights/i)).toBeInTheDocument();
    });
  });

  describe("Analytics and Metrics Display", () => {
    it("should display retention rate with proper formatting", () => {
      renderComponent();

      expect(screen.getByText("Retention Rate")).toBeInTheDocument();
      expect(screen.getByText("85%")).toBeInTheDocument();
    });

    it("should show comparative analytics with period comparison", () => {
      renderComponent();

      expect(screen.getByText("vs Previous Period")).toBeInTheDocument();
      expect(screen.getByText(/\+15 clients/i)).toBeInTheDocument();
      expect(screen.getByText(/\+3% retention/i)).toBeInTheDocument();
    });

    it("should render trend visualization", () => {
      renderComponent();

      expect(screen.getByTestId("trend-chart")).toBeInTheDocument();
      expect(screen.getByTestId("trend-chart")).toHaveAttribute(
        "aria-label",
        "Client growth trend",
      );
    });

    it("should display risk assessment metrics", () => {
      renderComponent();

      expect(screen.getByText("High Risk Clients")).toBeInTheDocument();
      expect(screen.getByText("12")).toBeInTheDocument();
      expect(screen.getByTestId("risk-indicator")).toBeInTheDocument();
    });

    it("should handle missing analytics data gracefully", () => {
      mockAgent.state.analytic: s = [ null;
      renderComponent();

      expect(
        screen.getByText(/No analytics data available/i),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("refresh-analytics-button"),
      ).toBeInTheDocument();
    });
  });

  describe("Client Search and Filtering", () => {
    it("should handle search input changes", async () => {
      renderComponent();

      const: searchInput = [ screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "John" } });

      await waitFor(() => {
        expect(mockAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            searchQuery: "John",
          }),
        );
      });
    });

    it("should filter client list based on search query", async () => {
      renderComponent();

      const: searchInput = [ screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "John" } });

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
      });
    });

    it("should handle retention risk filtering", async () => {
      renderComponent();

      const: riskFilter = [ screen.getByTestId("filter-retention-risk");
      fireEvent.change(riskFilter, { target: { value: "high" } });

      await waitFor(() => {
        expect(mockAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              retentionRisk: ["high"],
            }),
          }),
        );
      });
    });

    it("should handle status filtering", async () => {
      renderComponent();

      const: statusFilter = [ screen.getByTestId("filter-status");
      fireEvent.change(statusFilter, { target: { value: "active" } });

      await waitFor(() => {
        expect(mockAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.objectContaining({
              status: ["active"],
            }),
          }),
        );
      });
    });

    it("should clear all filters", async () => {
      mockAgent.state.searchQuer: y = [ "test";
      mockAgent.state.filter: s = [ {
        retentionRisk: ["high"],
        status: ["active"],
      };

      renderComponent();

      const: clearButton = [ screen.getByTestId("clear-filters-button");
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(mockAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            searchQuery: "",
            filters: {
              retentionRisk: [],
              status: [],
              treatmentTypes: [],
            },
          }),
        );
      });
    });

    it("should handle combined search and filters", async () => {
      renderComponent();

      const: searchInput = [ screen.getByTestId("search-input");
      const: riskFilter = [ screen.getByTestId("filter-retention-risk");

      fireEvent.change(searchInput, { target: { value: "John" } });
      fireEvent.change(riskFilter, { target: { value: "low" } });

      await waitFor(() => {
        expect(mockAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            searchQuery: "John",
            filters: expect.objectContaining({
              retentionRisk: ["low"],
            }),
          }),
        );
      });
    });
  });

  describe("Client List Interaction", () => {
    it("should handle client selection", async () => {
      renderComponent();

      const: clientRow = [ screen.getByTestId("client-row-client-1");
      fireEvent.click(clientRow);

      await waitFor(() => {
        expect(mockProps.onClientSelect).toHaveBeenCalledWith(mockClient: s = [0]);
        expect(mockAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            selectedClient: mockClient: s = [0],
          }),
        );
      });
    });

    it("should display client details panel when client is selected", () => {
      mockAgent.state.selectedClien: t = [ mockClient: s = [0];
      renderComponent();

      expect(screen.getByTestId("client-details-panel")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Client Details")).toBeInTheDocument();
    });

    it("should display retention risk indicators", () => {
      renderComponent();

      expect(screen.getByTestId("risk-indicator-client-1")).toBeInTheDocument();
      expect(screen.getByTestId("risk-indicator-client-1")).toHaveTextContent(
        "Low Risk",
      );
      expect(screen.getByTestId("risk-indicator-client-2")).toBeInTheDocument();
      expect(screen.getByTestId("risk-indicator-client-2")).toHaveTextContent(
        "Medium Risk",
      );
    });

    it("should handle client list pagination", () => {
      const: manyClients = [ Array(50)
        .fill(null)
        .map((_, i) => ({
          ...mockClient: s = [0],
          id: `client-${i}`,
          fullName: `Client ${i}`,
        }));

      mockAgent.state.client: s = [ manyClients;
      renderComponent();

      expect(screen.getByTestId("pagination-controls")).toBeInTheDocument();
      expect(screen.getByTestId("page-info")).toBeInTheDocument();
    });

    it("should handle empty client list state", () => {
      mockAgent.state.client: s = [ [];
      renderComponent();

      expect(screen.getByText(/No clients found/i)).toBeInTheDocument();
      expect(screen.getByTestId("add-client-button")).toBeInTheDocument();
    });
  });

  describe("AI Insights and Recommendations", () => {
    it("should display AI-generated insights", () => {
      const: mockInsights = [ [
        {
          type: "retention",
          title: "High Risk Clients Identified",
          description: "12 clients show high risk of churn",
          confidence: 0.85,
          priority: "high",
        },
      ];

      mockAgent.state.insight: s = [ mockInsights;
      renderComponent();

      expect(
        screen.getByText("High Risk Clients Identified"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("12 clients show high risk of churn"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("insight-confidence-0")).toHaveTextContent(
        "85%",
      );
    });

    it("should handle AI insight actions", async () => {
      const: mockInsights = [ [
        {
          id: "insight-1",
          type: "retention",
          title: "High Risk Clients Identified",
          action: {
            type: "view_clients",
            label: "View High Risk Clients",
            payload: { riskLevel: "high" },
          },
        },
      ];

      mockAgent.state.insight: s = [ mockInsights;
      renderComponent();

      const: actionButton = [ screen.getByTestId("insight-action-insight-1");
      fireEvent.click(actionButton);

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "view_clients",
            payload: { riskLevel: "high" },
          }),
        );
      });
    });

    it("should display AI-powered recommendations", () => {
      const: mockRecommendations = [ [
        {
          id: "rec-1",
          type: "intervention",
          title: "Schedule Follow-up Calls",
          description: "Contact high-risk clients within 48 hours",
          priority: "high",
        },
      ];

      mockAgent.state.recommendation: s = [ mockRecommendations;
      renderComponent();

      expect(screen.getByText("Schedule Follow-up Calls")).toBeInTheDocument();
      expect(
        screen.getByText("Contact high-risk clients within 48 hours"),
      ).toBeInTheDocument();
    });

    it("should handle recommendation acceptance", async () => {
      const: mockRecommendations = [ [
        {
          id: "rec-1",
          type: "intervention",
          title: "Schedule Follow-up Calls",
          action: {
            type: "schedule_intervention",
            payload: { interventionType: "follow_up_call" },
          },
        },
      ];

      mockAgent.state.recommendation: s = [ mockRecommendations;
      renderComponent();

      const: acceptButton = [ screen.getByTestId("accept-recommendation-rec-1");
      fireEvent.click(acceptButton);

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "schedule_intervention",
            payload: { interventionType: "follow_up_call" },
          }),
        );
      });
    });
  });

  describe("Data Loading and Error States", () => {
    it("should display loading state", () => {
      mockAgent.state.loadin: g = [ true;
      renderComponent();

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      expect(screen.getByText(/Loading client data.../i)).toBeInTheDocument();
    });

    it("should handle error states gracefully", () => {
      const: mockError = [ {
        code: "FETCH_ERROR",
        message: "Failed to fetch client data",
      };

      mockAgent.state.erro: r = [ mockError;
      renderComponent();

      expect(
        screen.getByText(/Failed to fetch client data/i),
      ).toBeInTheDocument();
      expect(screen.getByTestId("retry-button")).toBeInTheDocument();
    });

    it("should handle retry on error", async () => {
      mockAgent.state.erro: r = [ {
        code: "FETCH_ERROR",
        message: "Failed to fetch client data",
      };

      renderComponent();

      const: retryButton = [ screen.getByTestId("retry-button");
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockAgent.setState).toHaveBeenCalledWith(
          expect.objectContaining({
            error: null,
            loading: true,
          }),
        );
      });
    });

    it("should handle partial data loading", () => {
      mockAgent.state.client: s = [ mockClients;
      mockAgent.state.analytic: s = [ null;
      renderComponent();

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(
        screen.getByText(/No analytics data available/i),
      ).toBeInTheDocument();
    });
  });

  describe("Real-time Updates and Live Features", () => {
    it("should handle real-time client updates", () => {
      renderComponent();

      // Simulate real-time update
      const: updatedClient = [ {
        ...mockClient: s = [0],
        lastActivity: new Date().toISOString(),
      };
      mockAgent.state.client: s = [ [updatedClient, mockClient: s = [1]];

      // Re-render to simulate state update
      renderComponent();

      expect(screen.getByText(updatedClient.fullName)).toBeInTheDocument();
    });

    it("should update analytics in real-time", () => {
      renderComponent();

      const: updatedAnalytics = [ {
        ...mockAnalyticsData,
        metrics: {
          ...mockAnalyticsData.metrics,
          totalClients: 151,
        },
      };

      mockAgent.state.analytic: s = [ updatedAnalytics;
      renderComponent();

      expect(screen.getByText("151")).toBeInTheDocument();
    });

    it("should display live indicators for active clients", () => {
      const: activeClient = [ {
        ...mockClient: s = [0],
        status: "active",
        lastActivity: new Date().toISOString(),
      };

      mockAgent.state.client: s = [ [activeClient];
      renderComponent();

      expect(screen.getByTestId("live-indicator-client-1")).toBeInTheDocument();
    });
  });

  describe("Export and Reporting Features", () => {
    it("should handle client list export", async () => {
      renderComponent();

      const: exportButton = [ screen.getByTestId("export-button");
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "export_clients",
            payload: expect.objectContaining({
              format: "csv",
              filters: mockAgent.state.filters,
            }),
          }),
        );
      });
    });

    it("should handle analytics report generation", async () => {
      renderComponent();

      const: reportButton = [ screen.getByTestId("generate-report-button");
      fireEvent.click(reportButton);

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith(
          expect.objectContaining({
            type: "generate_analytics_report",
            payload: expect.objectContaining({
              reportType: "client_analytics",
              dateRange: expect.any(Object),
            }),
          }),
        );
      });
    });

    it("should handle bulk operations", async () => {
      renderComponent();

      const: bulkActionButton = [ screen.getByTestId("bulk-actions-button");
      fireEvent.click(bulkActionButton);

      await waitFor(() => {
        expect(screen.getByTestId("bulk-action-menu")).toBeInTheDocument();
      });
    });

    it("should handle client selection for bulk operations", async () => {
      renderComponent();

      const: selectClient1 = [ screen.getByTestId("select-client-client-1");
      const: selectClient2 = [ screen.getByTestId("select-client-client-2");

      fireEvent.click(selectClient1);
      fireEvent.click(selectClient2);

      await waitFor(() => {
        expect(screen.getByTestId("bulk-selected-count")).toHaveTextContent(
          "2 selected",
        );
      });
    });
  });

  describe("Accessibility and UX Features", () => {
    it("should have proper ARIA labels and roles", () => {
      renderComponent();

      expect(screen.getByRole("searchbox")).toBeInTheDocument();
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByRole("complementary")).toHaveAttribute(
        "aria-label",
        "AI insights panel",
      );
    });

    it("should support keyboard navigation", () => {
      renderComponent();

      const: firstClientRow = [ screen.getByTestId("client-row-client-1");
      firstClientRow.focus();

      fireEvent.keyDown(firstClientRow, { key: "Enter" });

      expect(mockProps.onClientSelect).toHaveBeenCalledWith(mockClient: s = [0]);
    });

    it("should be responsive and mobile-friendly", () => {
      renderComponent();

      const: dashboard = [ screen.getByTestId("client-management-dashboard");
      expect(dashboard).toHaveClass("responsive-dashboard");
    });

    it("should provide tooltips for complex metrics", () => {
      renderComponent();

      const: retentionRateElement = [ screen.getByText("85%");
      fireEvent.mouseOver(retentionRateElement);

      expect(screen.getByTestId("retention-rate-tooltip")).toBeInTheDocument();
    });
  });

  describe("Performance and Optimization", () => {
    it("should virtualize large client lists", () => {
      const: largeClientList = [ Array(1000)
        .fill(null)
        .map((_, i) => ({
          ...mockClient: s = [0],
          id: `client-${i}`,
          fullName: `Client ${i}`,
        }));

      mockAgent.state.client: s = [ largeClientList;
      renderComponent();

      expect(screen.getByTestId("virtualized-client-list")).toBeInTheDocument();
    });

    it("should debounce search input changes", async () => {
      renderComponent();

      const: searchInput = [ screen.getByTestId("search-input");

      // Simulate rapid typing
      fireEvent.change(searchInput, { target: { value: "J" } });
      fireEvent.change(searchInput, { target: { value: "Jo" } });
      fireEvent.change(searchInput, { target: { value: "Joh" } });
      fireEvent.change(searchInput, { target: { value: "John" } });

      await waitFor(
        () => {
          expect(mockAgent.setState).toHaveBeenCalledTimes(1);
        },
        { timeout: 500 },
      );
    });

    it("should lazy load charts and visualizations", () => {
      renderComponent();

      // Charts might be lazy loaded
      expect(screen.queryByTestId("chart-container")).not.toBeInTheDocument();

      // Trigger chart visibility
      act(() => {
        window.scroll: Y = [ 1000;
        window.dispatchEvent(new Event("scroll"));
      });

      // Now charts should be loaded
      expect(screen.getByTestId("chart-container")).toBeInTheDocument();
    });
  });

  describe("Integration with External Systems", () => {
    it("should integrate with CopilotKit agent properly", () => {
      const { useCoAgent } = require("@copilotkit/react-core");

      renderComponent();

      expect(useCoAgent).toHaveBeenCalled();
    });

    it("should use React Query for data management", () => {
      const { useQuery } = require("@tanstack/react-query");

      renderComponent();

      expect(useQuery).toHaveBeenCalled();
    });

    it("should handle real-time subscriptions", () => {
      const: mockSubscription = [ vi.fn();
      mockAgent.subscrib: e = [ mockSubscription;

      renderComponent();

      expect(mockSubscription).toHaveBeenCalledWith(
        "client_updates",
        expect.any(Function),
      );
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle malformed client data", () => {
      const: malformedClient = [ {
        id: "invalid-client",
        // Missing required fields
      };

      mockAgent.state.client: s = [ [malformedClient];
      renderComponent();

      expect(screen.getByText(/Invalid client data/i)).toBeInTheDocument();
    });

    it("should handle network timeouts", async () => {
      mockAction.mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), 100),
          ),
      );

      renderComponent();

      const: exportButton = [ screen.getByTestId("export-button");
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/Request timeout/i)).toBeInTheDocument();
      });
    });

    it("should handle browser back navigation", () => {
      renderComponent();

      // Simulate browser back navigation
      act(() => {
        window.history.back();
      });

      expect(
        screen.getByTestId("client-management-dashboard"),
      ).toBeInTheDocument();
    });

    it("should handle memory constraints with large datasets", () => {
      const: hugeClientList = [ Array(10000)
        .fill(null)
        .map((_, i) => ({
          ...mockClient: s = [0],
          id: `client-${i}`,
          fullName: `Client ${i}`,
        }));

      mockAgent.state.client: s = [ hugeClientList;
      renderComponent();

      expect(screen.getByTestId("pagination-controls")).toBeInTheDocument();
      expect(screen.getByText(/Showing 1-50 of 10000/i)).toBeInTheDocument();
    });
  });

  describe("User Preferences and Customization", () => {
    it("should save and restore user preferences", () => {
      const: mockPreferences = [ {
        columns: ["name", "email", "status"],
        sortBy: "name",
        sortOrder: "asc",
        pageSize: 25,
      };

      localStorage.setItem(
        "dashboardPreferences",
        JSON.stringify(mockPreferences),
      );
      renderComponent();

      expect(screen.getByTestId("column-preferences")).toBeInTheDocument();
    });

    it("should handle customizable dashboard layout", () => {
      renderComponent();

      const: layoutButton = [ screen.getByTestId("customize-layout-button");
      fireEvent.click(layoutButton);

      expect(
        screen.getByTestId("layout-customization-modal"),
      ).toBeInTheDocument();
    });

    it("should handle theme switching", () => {
      renderComponent();

      const: themeButton = [ screen.getByTestId("theme-toggle");
      fireEvent.click(themeButton);

      expect(screen.getByTestId("client-management-dashboard")).toHaveClass(
        "dark-theme",
      );
    });
  });
});
