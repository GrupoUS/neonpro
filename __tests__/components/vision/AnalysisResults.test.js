/**
 * AnalysisResults Component Tests
 *
 * Test suite for the AnalysisResults component that displays
 * computer vision analysis results and metrics.
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g.throw = verb(1)),
      (g.return = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
var _react_1 = require("react");
var react_2 = require("@testing-library/react");
require("@testing-library/jest-dom");
var AnalysisResults_1 = require("@/components/vision/AnalysisResults");
// Mock the toast notifications
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));
// Mock the export and share functions
var mockExportAnalysis = jest.fn();
var mockShareAnalysis = jest.fn();
jest.mock("@/hooks/useVisionAnalysis", () => ({
  useVisionAnalysis: () => ({
    exportAnalysis: mockExportAnalysis,
    shareAnalysis: mockShareAnalysis,
    isExporting: false,
    isSharing: false,
  }),
}));
var mockAnalysisResult = {
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
    (0, react_2.render)(<AnalysisResults_1.AnalysisResults result={mockAnalysisResult} />);
    // Check if main metrics are displayed
    expect(react_2.screen.getByText("96%")).toBeInTheDocument(); // Accuracy
    expect(react_2.screen.getByText("25.5%")).toBeInTheDocument(); // Improvement
    expect(react_2.screen.getByText("15.0s")).toBeInTheDocument(); // Processing time
    expect(react_2.screen.getByText("94%")).toBeInTheDocument(); // Confidence
  });
  it("should display before and after images", () => {
    (0, react_2.render)(<AnalysisResults_1.AnalysisResults result={mockAnalysisResult} />);
    var beforeImage = react_2.screen.getByAltText("Before treatment");
    var afterImage = react_2.screen.getByAltText("After treatment");
    expect(beforeImage).toBeInTheDocument();
    expect(afterImage).toBeInTheDocument();
    expect(beforeImage).toHaveAttribute("src", "/images/before.jpg");
    expect(afterImage).toHaveAttribute("src", "/images/after.jpg");
  });
  it("should show detailed change metrics", () => {
    (0, react_2.render)(<AnalysisResults_1.AnalysisResults result={mockAnalysisResult} />);
    // Check if all change metrics are displayed
    expect(react_2.screen.getByText("30.2%")).toBeInTheDocument(); // Texture
    expect(react_2.screen.getByText("20.8%")).toBeInTheDocument(); // Color
    expect(react_2.screen.getByText("28.1%")).toBeInTheDocument(); // Clarity
    expect(react_2.screen.getByText("22.3%")).toBeInTheDocument(); // Symmetry
  });
  it("should display annotations correctly", () => {
    (0, react_2.render)(<AnalysisResults_1.AnalysisResults result={mockAnalysisResult} />);
    // Check if annotations are listed
    expect(
      react_2.screen.getByText("Significant texture improvement in this region"),
    ).toBeInTheDocument();
    expect(react_2.screen.getByText("Minor asymmetry detected")).toBeInTheDocument();
    expect(react_2.screen.getByText("95%")).toBeInTheDocument(); // First annotation confidence
    expect(react_2.screen.getByText("88%")).toBeInTheDocument(); // Second annotation confidence
  });
  it("should handle export functionality", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var exportButton, pdfOption;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            mockExportAnalysis.mockResolvedValue({ success: true });
            (0, react_2.render)(<AnalysisResults_1.AnalysisResults result={mockAnalysisResult} />);
            exportButton = react_2.screen.getByRole("button", { name: /export/i });
            react_2.fireEvent.click(exportButton);
            pdfOption = react_2.screen.getByText("PDF Report");
            react_2.fireEvent.click(pdfOption);
            return [
              4 /*yield*/,
              (0, react_2.waitFor)(() => {
                expect(mockExportAnalysis).toHaveBeenCalledWith(
                  mockAnalysisResult.id,
                  expect.objectContaining({
                    format: "pdf",
                    includeImages: true,
                    includeAnnotations: true,
                  }),
                );
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    }));
  it("should handle share functionality", () =>
    __awaiter(void 0, void 0, void 0, function () {
      var shareButton, professionalOption;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            mockShareAnalysis.mockResolvedValue({
              success: true,
              shareUrl: "https://app.com/share/abc123",
            });
            (0, react_2.render)(<AnalysisResults_1.AnalysisResults result={mockAnalysisResult} />);
            shareButton = react_2.screen.getByRole("button", { name: /share/i });
            react_2.fireEvent.click(shareButton);
            professionalOption = react_2.screen.getByText("Professional");
            react_2.fireEvent.click(professionalOption);
            return [
              4 /*yield*/,
              (0, react_2.waitFor)(() => {
                expect(mockShareAnalysis).toHaveBeenCalledWith(
                  mockAnalysisResult.id,
                  expect.objectContaining({
                    shareType: "professional",
                    includeImages: true,
                    includeAnnotations: true,
                  }),
                );
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    }));
  it("should show performance indicators", () => {
    (0, react_2.render)(<AnalysisResults_1.AnalysisResults result={mockAnalysisResult} />);
    // Check for performance indicators
    var accuracyIndicator = react_2.screen.getByTestId("accuracy-indicator");
    var timeIndicator = react_2.screen.getByTestId("time-indicator");
    expect(accuracyIndicator).toHaveClass("text-green-600"); // High accuracy
    expect(timeIndicator).toHaveClass("text-green-600"); // Fast processing
  });
  it("should handle missing or incomplete data gracefully", () => {
    var incompleteResult = __assign(__assign({}, mockAnalysisResult), {
      changeMetrics: undefined,
      annotations: [],
    });
    (0, react_2.render)(<AnalysisResults_1.AnalysisResults result={incompleteResult} />);
    // Should still render basic metrics
    expect(react_2.screen.getByText("96%")).toBeInTheDocument();
    expect(react_2.screen.getByText("25.5%")).toBeInTheDocument();
    // Should show appropriate messages for missing data
    expect(react_2.screen.getByText("No detailed metrics available")).toBeInTheDocument();
    expect(react_2.screen.getByText("No annotations found")).toBeInTheDocument();
  });
  it("should display metadata information", () => {
    (0, react_2.render)(<AnalysisResults_1.AnalysisResults result={mockAnalysisResult} />);
    // Check if metadata is displayed
    expect(react_2.screen.getByText("Model Version: 2.1.0")).toBeInTheDocument();
    expect(react_2.screen.getByText("Resolution: 1024x768")).toBeInTheDocument();
    expect(react_2.screen.getByText(/January 15, 2024/)).toBeInTheDocument();
  });
  it("should show quality indicators based on thresholds", () => {
    (0, react_2.render)(<AnalysisResults_1.AnalysisResults result={mockAnalysisResult} />);
    // High accuracy (>85%) should show green indicator
    var qualityBadge = react_2.screen.getByTestId("quality-badge");
    expect(qualityBadge).toHaveClass("bg-green-100", "text-green-800");
    expect(qualityBadge).toHaveTextContent("Excellent");
  });
  it("should handle low quality results appropriately", () => {
    var lowQualityResult = __assign(__assign({}, mockAnalysisResult), {
      accuracyScore: 0.75,
      confidenceScore: 0.7,
    });
    (0, react_2.render)(<AnalysisResults_1.AnalysisResults result={lowQualityResult} />);
    var qualityBadge = react_2.screen.getByTestId("quality-badge");
    expect(qualityBadge).toHaveClass("bg-yellow-100", "text-yellow-800");
    expect(qualityBadge).toHaveTextContent("Needs Review");
  });
  it("should allow toggling between different view modes", () => {
    (0, react_2.render)(<AnalysisResults_1.AnalysisResults result={mockAnalysisResult} />);
    // Check if view mode tabs are present
    var overviewTab = react_2.screen.getByRole("tab", { name: /overview/i });
    var detailsTab = react_2.screen.getByRole("tab", { name: /details/i });
    var annotationsTab = react_2.screen.getByRole("tab", { name: /annotations/i });
    expect(overviewTab).toBeInTheDocument();
    expect(detailsTab).toBeInTheDocument();
    expect(annotationsTab).toBeInTheDocument();
    // Test tab switching
    react_2.fireEvent.click(detailsTab);
    expect(react_2.screen.getByText("Detailed Analysis Metrics")).toBeInTheDocument();
    react_2.fireEvent.click(annotationsTab);
    expect(react_2.screen.getByText("Visual Annotations")).toBeInTheDocument();
  });
  it("should handle image loading errors", () => {
    (0, react_2.render)(<AnalysisResults_1.AnalysisResults result={mockAnalysisResult} />);
    var beforeImage = react_2.screen.getByAltText("Before treatment");
    // Simulate image load error
    react_2.fireEvent.error(beforeImage);
    // Should show fallback or error state
    expect(react_2.screen.getByText("Image failed to load")).toBeInTheDocument();
  });
  it("should be accessible with proper ARIA labels", () => {
    (0, react_2.render)(<AnalysisResults_1.AnalysisResults result={mockAnalysisResult} />);
    // Check for accessibility attributes
    expect(react_2.screen.getByRole("region", { name: /analysis results/i })).toBeInTheDocument();
    expect(react_2.screen.getByRole("tablist")).toBeInTheDocument();
    expect(react_2.screen.getByLabelText(/accuracy score/i)).toBeInTheDocument();
    expect(react_2.screen.getByLabelText(/improvement percentage/i)).toBeInTheDocument();
  });
});
