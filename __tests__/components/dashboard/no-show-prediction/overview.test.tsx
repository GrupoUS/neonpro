// Story 11.2: No-Show Prediction Overview Component Tests
// Test suite for overview dashboard component

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoShowPredictionOverview from "@/components/dashboard/no-show-prediction/overview";

// Mock fetch
global.fetch = jest.fn();

// Mock toast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockOverviewData = {
  total_predictions: 150,
  accuracy_rate: 0.85,
  high_risk_patients: 12,
  interventions_today: 8,
  revenue_protected: 15000,
  cost_savings: 3500,
  recent_predictions: [
    {
      id: "pred-1",
      patient_name: "João Silva",
      appointment_date: "2024-02-15T14:00:00Z",
      risk_score: 0.85,
      intervention_status: "pending",
    },
    {
      id: "pred-2",
      patient_name: "Maria Santos",
      appointment_date: "2024-02-16T10:00:00Z",
      risk_score: 0.92,
      intervention_status: "completed",
    },
  ],
};

describe("NoShowPredictionOverview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should render overview metrics correctly", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOverviewData,
    });

    render(<NoShowPredictionOverview />);

    await waitFor(() => {
      expect(screen.getByText("150")).toBeInTheDocument();
      expect(screen.getByText("85.0%")).toBeInTheDocument();
      expect(screen.getByText("12")).toBeInTheDocument();
      expect(screen.getByText("8")).toBeInTheDocument();
      expect(screen.getByText("R$ 15,000")).toBeInTheDocument();
      expect(screen.getByText("R$ 3,500")).toBeInTheDocument();
    });
  });

  it("should display recent predictions", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOverviewData,
    });

    render(<NoShowPredictionOverview />);

    await waitFor(() => {
      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText("Maria Santos")).toBeInTheDocument();
      expect(screen.getByText("85% risk")).toBeInTheDocument();
      expect(screen.getByText("92% risk")).toBeInTheDocument();
      expect(screen.getByText("pending")).toBeInTheDocument();
      expect(screen.getByText("completed")).toBeInTheDocument();
    });
  });

  it("should show loading state initially", () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<NoShowPredictionOverview />);

    expect(screen.getAllByRole("progressbar")).toHaveLength(6);
  });

  it("should handle fetch errors gracefully", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<NoShowPredictionOverview />);

    await waitFor(() => {
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });
  });

  it("should display quick action buttons", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockOverviewData,
    });

    render(<NoShowPredictionOverview />);

    await waitFor(() => {
      expect(screen.getByText("Run New Prediction")).toBeInTheDocument();
      expect(screen.getByText("Model Settings")).toBeInTheDocument();
      expect(screen.getByText("Export Report")).toBeInTheDocument();
      expect(screen.getByText("Schedule Analysis")).toBeInTheDocument();
    });
  });

  it("should handle empty recent predictions", async () => {
    const emptyData = {
      ...mockOverviewData,
      recent_predictions: [],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => emptyData,
    });

    render(<NoShowPredictionOverview />);

    await waitFor(() => {
      expect(screen.getByText("No high-risk predictions found")).toBeInTheDocument();
    });
  });
});
