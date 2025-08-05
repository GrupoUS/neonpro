/**
 * AnalysisResults Component Tests
 *
 * Test suite for the AnalysisResults component that displays
 * computer vision analysis results and metrics.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AnalysisResults } from "@/components/vision/AnalysisResults";
import { VisionAnalysisResult } from "@/types/vision";

// Mock the toast notifications
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock the export and share functions
const mockExportAnalysis = jest.fn();
const mockShareAnalysis = jest.fn();

jest.mock("@/hooks/useVisionAnalysis", () => ({
  useVisionAnalysis: () => ({
    exportAnalysis: mockExportAnalysis,
    shareAnalysis: mockShareAnalysis,
    isExporting: false,
    isSharing: false,
  }),
}));

const mockAnalysisResult: VisionAnalysisResult = {
  id: "analysis-123",
  patientId: "patient-456",
  treatmentId: "treatment-789",
  beforeImageUrl: "/images/before.jpg",
  afterImageUrl: "/images/after.jpg",
  accuracyScore: 0.96,
  confidenceScore: 0.94,
  processingTime: 15000,
  improvementPercentage: 25.5,
  changeMetrics: {
    overallImprovement: 25.5,
    textureImprovement: 30.2,
    colorImprovement: 20.8,
    clarityImprovement: 28.1,
    symmetryImprovement: 22.3,
  },
  annotations: [
    {
      id: "ann-1",
      type: "improvement",
      coordinates: { x: 100, y: 150, width: 50, height: 50 },
      confidence: 0.95,
      description: "Significant texture improvement in this region",
    },
    {
      id: "ann-2",
      type: "concern",
      coordinates: { x: 200, y: 250, width: 30, height: 30 },
      confidence: 0.88,
      description: "Minor asymmetry detected",
    },
  ],
  metadata: {
    modelVersion: "2.1.0",
    analysisDate: "2024-01-15T10:30:00Z",
    imageResolution: "1024x768",
  },
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
};

describe("AnalysisResults", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render analysis results correctly", () => {
    render(<AnalysisResults result={mockAnalysisResult} />);

    // Check if main metrics are displayed
    expect(screen.getByText("96%")).toBeInTheDocument(); // Accuracy
    expect(screen.getByText("25.5%")).toBeInTheDocument(); // Improvement
    expect(screen.getByText("15.0s")).toBeInTheDocument(); // Processing time
    expect(screen.getByText("94%")).toBeInTheDocument(); // Confidence
  });

  it("should display before and after images", () => {
    render(<AnalysisResults result={mockAnalysisResult} />);

    const beforeImage = screen.getByAltText("Before treatment");
    const afterImage = screen.getByAltText("After treatment");

    expect(beforeImage).toBeInTheDocument();
    expect(afterImage).toBeInTheDocument();
    expect(beforeImage).toHaveAttribute("src", "/images/before.jpg");
    expect(afterImage).toHaveAttribute("src", "/images/after.jpg");
  });

  it("should show detailed change metrics", () => {
    render(<AnalysisResults result={mockAnalysisResult} />);

    // Check if all change metrics are displayed
    expect(screen.getByText("30.2%")).toBeInTheDocument(); // Texture
    expect(screen.getByText("20.8%")).toBeInTheDocument(); // Color
    expect(screen.getByText("28.1%")).toBeInTheDocument(); // Clarity
    expect(screen.getByText("22.3%")).toBeInTheDocument(); // Symmetry
  });

  it("should display annotations correctly", () => {
    render(<AnalysisResults result={mockAnalysisResult} />);

    // Check if annotations are listed
    expect(screen.getByText("Significant texture improvement in this region")).toBeInTheDocument();
    expect(screen.getByText("Minor asymmetry detected")).toBeInTheDocument();
    expect(screen.getByText("95%")).toBeInTheDocument(); // First annotation confidence
    expect(screen.getByText("88%")).toBeInTheDocument(); // Second annotation confidence
  });

  it("should handle export functionality", async () => {
    mockExportAnalysis.mockResolvedValue({ success: true });

    render(<AnalysisResults result={mockAnalysisResult} />);

    const exportButton = screen.getByRole("button", { name: /export/i });
    fireEvent.click(exportButton);

    // Check if export options are shown
    const pdfOption = screen.getByText("PDF Report");
    fireEvent.click(pdfOption);

    await waitFor(() => {
      expect(mockExportAnalysis).toHaveBeenCalledWith(
        mockAnalysisResult.id,
        expect.objectContaining({
          format: "pdf",
          includeImages: true,
          includeAnnotations: true,
        }),
      );
    });
  });

  it("should handle share functionality", async () => {
    mockShareAnalysis.mockResolvedValue({
      success: true,
      shareUrl: "https://app.com/share/abc123",
    });

    render(<AnalysisResults result={mockAnalysisResult} />);

    const shareButton = screen.getByRole("button", { name: /share/i });
    fireEvent.click(shareButton);

    // Check if share options are shown
    const professionalOption = screen.getByText("Professional");
    fireEvent.click(professionalOption);

    await waitFor(() => {
      expect(mockShareAnalysis).toHaveBeenCalledWith(
        mockAnalysisResult.id,
        expect.objectContaining({
          shareType: "professional",
          includeImages: true,
          includeAnnotations: true,
        }),
      );
    });
  });

  it("should show performance indicators", () => {
    render(<AnalysisResults result={mockAnalysisResult} />);

    // Check for performance indicators
    const accuracyIndicator = screen.getByTestId("accuracy-indicator");
    const timeIndicator = screen.getByTestId("time-indicator");

    expect(accuracyIndicator).toHaveClass("text-green-600"); // High accuracy
    expect(timeIndicator).toHaveClass("text-green-600"); // Fast processing
  });

  it("should handle missing or incomplete data gracefully", () => {
    const incompleteResult = {
      ...mockAnalysisResult,
      changeMetrics: undefined,
      annotations: [],
    };

    render(<AnalysisResults result={incompleteResult} />);

    // Should still render basic metrics
    expect(screen.getByText("96%")).toBeInTheDocument();
    expect(screen.getByText("25.5%")).toBeInTheDocument();

    // Should show appropriate messages for missing data
    expect(screen.getByText("No detailed metrics available")).toBeInTheDocument();
    expect(screen.getByText("No annotations found")).toBeInTheDocument();
  });

  it("should display metadata information", () => {
    render(<AnalysisResults result={mockAnalysisResult} />);

    // Check if metadata is displayed
    expect(screen.getByText("Model Version: 2.1.0")).toBeInTheDocument();
    expect(screen.getByText("Resolution: 1024x768")).toBeInTheDocument();
    expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
  });

  it("should show quality indicators based on thresholds", () => {
    render(<AnalysisResults result={mockAnalysisResult} />);

    // High accuracy (>85%) should show green indicator
    const qualityBadge = screen.getByTestId("quality-badge");
    expect(qualityBadge).toHaveClass("bg-green-100", "text-green-800");
    expect(qualityBadge).toHaveTextContent("Excellent");
  });

  it("should handle low quality results appropriately", () => {
    const lowQualityResult = {
      ...mockAnalysisResult,
      accuracyScore: 0.75, // Below 85% threshold
      confidenceScore: 0.7,
    };

    render(<AnalysisResults result={lowQualityResult} />);

    const qualityBadge = screen.getByTestId("quality-badge");
    expect(qualityBadge).toHaveClass("bg-yellow-100", "text-yellow-800");
    expect(qualityBadge).toHaveTextContent("Needs Review");
  });

  it("should allow toggling between different view modes", () => {
    render(<AnalysisResults result={mockAnalysisResult} />);

    // Check if view mode tabs are present
    const overviewTab = screen.getByRole("tab", { name: /overview/i });
    const detailsTab = screen.getByRole("tab", { name: /details/i });
    const annotationsTab = screen.getByRole("tab", { name: /annotations/i });

    expect(overviewTab).toBeInTheDocument();
    expect(detailsTab).toBeInTheDocument();
    expect(annotationsTab).toBeInTheDocument();

    // Test tab switching
    fireEvent.click(detailsTab);
    expect(screen.getByText("Detailed Analysis Metrics")).toBeInTheDocument();

    fireEvent.click(annotationsTab);
    expect(screen.getByText("Visual Annotations")).toBeInTheDocument();
  });

  it("should handle image loading errors", () => {
    render(<AnalysisResults result={mockAnalysisResult} />);

    const beforeImage = screen.getByAltText("Before treatment");

    // Simulate image load error
    fireEvent.error(beforeImage);

    // Should show fallback or error state
    expect(screen.getByText("Image failed to load")).toBeInTheDocument();
  });

  it("should be accessible with proper ARIA labels", () => {
    render(<AnalysisResults result={mockAnalysisResult} />);

    // Check for accessibility attributes
    expect(screen.getByRole("region", { name: /analysis results/i })).toBeInTheDocument();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByLabelText(/accuracy score/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/improvement percentage/i)).toBeInTheDocument();
  });
});
