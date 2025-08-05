/**
 * Executive Dashboard Component Tests
 * Story 7.1: Executive Dashboard Implementation
 *
 * Tests for the frontend React components of the executive dashboard
 */

import type { render, screen, waitFor, fireEvent } from "@testing-library/react";
import type { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ExecutiveDashboard } from "@/components/dashboard/executive-dashboard";

// Mock the API fetch functions
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock chart components
jest.mock("recharts", () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

// Mock shadcn/ui components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className, ...props }: any) => (
    <div data-testid="card" className={className} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div data-testid="card-content" className={className} {...props}>
      {children}
    </div>
  ),
  CardDescription: ({ children, className, ...props }: any) => (
    <div data-testid="card-description" className={className} {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div data-testid="card-header" className={className} {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <div data-testid="card-title" className={className} {...props}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div data-testid="select">{children}</div>,
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-testid="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <div data-testid="select-value">{placeholder}</div>,
}));

jest.mock("@/components/ui/alert", () => ({
  Alert: ({ children }: any) => <div data-testid="alert">{children}</div>,
  AlertDescription: ({ children }: any) => <div data-testid="alert-description">{children}</div>,
  AlertTitle: ({ children }: any) => <div data-testid="alert-title">{children}</div>,
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("ExecutiveDashboard Component", () => {
  const mockProps = {
    clinicId: "clinic-1",
    userId: "user-1",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful API responses
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/api/executive-dashboard/kpis")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: [
                {
                  id: "1",
                  kpi_name: "total_revenue",
                  kpi_value: 85000,
                  unit: "BRL",
                  period_type: "monthly",
                },
                {
                  id: "2",
                  kpi_name: "total_appointments",
                  kpi_value: 342,
                  unit: "appointments",
                  period_type: "monthly",
                },
              ],
            }),
        });
      }

      if (url.includes("/api/executive-dashboard/alerts")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: [
                {
                  id: "1",
                  alert_type: "revenue_drop",
                  severity: "high",
                  title: "Queda na conversão",
                  message: "A taxa de conversão está abaixo do esperado",
                  is_active: true,
                },
              ],
            }),
        });
      }

      if (url.includes("/api/executive-dashboard/widgets")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: [
                {
                  id: "1",
                  widget_type: "revenue_chart",
                  position_x: 0,
                  position_y: 0,
                  width: 6,
                  height: 4,
                  configuration: { chart_type: "line" },
                },
              ],
            }),
        });
      }

      if (url.includes("/api/executive-dashboard/comparison")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                total_revenue: {
                  current: 85000,
                  previous: 78500,
                  change: 6500,
                  changePercent: 8.28,
                },
              },
            }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      });
    });
  });

  it("should render dashboard with loading state initially", () => {
    render(
      <TestWrapper>
        <ExecutiveDashboard {...mockProps} />
      </TestWrapper>,
    );

    expect(screen.getByText("Dashboard Executivo")).toBeInTheDocument();
    expect(screen.getByText("Carregando dados do dashboard...")).toBeInTheDocument();
  });

  it("should render KPI cards after data loads", async () => {
    render(
      <TestWrapper>
        <ExecutiveDashboard {...mockProps} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("Receita Total")).toBeInTheDocument();
      expect(screen.getByText("R$ 85.000,00")).toBeInTheDocument();
      expect(screen.getByText("Total de Consultas")).toBeInTheDocument();
      expect(screen.getByText("342")).toBeInTheDocument();
    });
  });

  it("should render alerts section", async () => {
    render(
      <TestWrapper>
        <ExecutiveDashboard {...mockProps} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("Alertas Ativos")).toBeInTheDocument();
      expect(screen.getByText("Queda na conversão")).toBeInTheDocument();
      expect(screen.getByText("A taxa de conversão está abaixo do esperado")).toBeInTheDocument();
    });
  });

  it("should handle period selection change", async () => {
    render(
      <TestWrapper>
        <ExecutiveDashboard {...mockProps} />
      </TestWrapper>,
    );

    await waitFor(() => {
      const periodSelect = screen.getByTestId("select");
      expect(periodSelect).toBeInTheDocument();
    });

    // Test period change functionality
    const periodTrigger = screen.getByTestId("select-trigger");
    fireEvent.click(periodTrigger);

    const weeklyOption = screen.getByText("Semanal");
    if (weeklyOption) {
      fireEvent.click(weeklyOption);
    }

    // Should trigger new API calls with updated period
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("period_type=weekly"),
        expect.any(Object),
      );
    });
  });

  it("should render comparison data with trend indicators", async () => {
    render(
      <TestWrapper>
        <ExecutiveDashboard {...mockProps} />
      </TestWrapper>,
    );

    await waitFor(() => {
      // Should show percentage change
      expect(screen.getByText("+8.28%")).toBeInTheDocument();
    });
  });

  it("should handle chart type switching", async () => {
    render(
      <TestWrapper>
        <ExecutiveDashboard {...mockProps} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    // Test chart type toggle if implemented
    const chartToggle = screen.queryByText("Gráfico de Barras");
    if (chartToggle) {
      fireEvent.click(chartToggle);
      await waitFor(() => {
        expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
      });
    }
  });

  it("should handle API errors gracefully", async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            success: false,
            error: "API Error",
          }),
      }),
    );

    render(
      <TestWrapper>
        <ExecutiveDashboard {...mockProps} />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("Erro ao carregar dados")).toBeInTheDocument();
    });
  });

  it("should export report when button is clicked", async () => {
    render(
      <TestWrapper>
        <ExecutiveDashboard {...mockProps} />
      </TestWrapper>,
    );

    await waitFor(() => {
      const exportButton = screen.getByText("Exportar Relatório");
      expect(exportButton).toBeInTheDocument();
    });

    const exportButton = screen.getByText("Exportar Relatório");
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/executive-dashboard/reports"),
        expect.objectContaining({
          method: "POST",
        }),
      );
    });
  });

  it("should render responsive layout", () => {
    render(
      <TestWrapper>
        <ExecutiveDashboard {...mockProps} />
      </TestWrapper>,
    );

    const dashboard = screen.getByTestId("executive-dashboard");
    expect(dashboard).toHaveClass("grid");

    // Should have responsive grid classes
    expect(dashboard).toHaveClass("grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3");
  });

  it("should handle widget drag and drop configuration", async () => {
    render(
      <TestWrapper>
        <ExecutiveDashboard {...mockProps} />
      </TestWrapper>,
    );

    await waitFor(() => {
      const configButton = screen.queryByText("Configurar Layout");
      if (configButton) {
        fireEvent.click(configButton);

        // Should enable drag mode
        expect(screen.getByText("Modo de Edição Ativado")).toBeInTheDocument();
      }
    });
  });
});
