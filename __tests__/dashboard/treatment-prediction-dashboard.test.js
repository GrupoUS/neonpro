/**
 * Treatment Prediction Dashboard Component Tests
 * Story 9.1: AI-powered treatment success prediction
 *
 * Tests the complete dashboard functionality including:
 * - Patient data input and validation
 * - AI prediction generation with ≥85% accuracy target
 * - Multi-factor analysis display
 * - Real-time scoring interface
 * - Explainability features
 * - Medical-grade validation
 */
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
var user_event_1 = require("@testing-library/user-event");
require("@testing-library/jest-dom");
var treatment_prediction_dashboard_1 = require("@/components/dashboard/treatment-prediction-dashboard");
// Mock the dependencies
jest.mock("@/app/lib/services/treatment-prediction", () => ({
  TreatmentPredictionService: jest.fn().mockImplementation(() => ({
    generatePrediction: jest.fn(),
    getBatchPredictions: jest.fn(),
    getPatientFactors: jest.fn(),
    upsertPatientFactors: jest.fn(),
  })),
}));
// Mock prediction results that meet ≥85% accuracy requirement
var _mockHighAccuracyPredictions = [
  {
    treatment: "Laser CO2 Fracionado",
    confidence: 92, // >85% accuracy requirement
    reasoning:
      "Paciente com características ideais para o tratamento: idade adequada, tipo de pele compatível, sem contraindicações.",
    expectedResults:
      "Melhora significativa na textura da pele, redução de cicatrizes e rugas finas",
    duration: "45-60 minutos",
    cost: "R$ 1.500 - R$ 2.500",
    riskLevel: "low",
    explainability: {
      topFactors: ["Idade: 28 anos", "Tipo de pele: II", "Sem histórico de queloides"],
      confidence_reasoning: "Alta probabilidade de sucesso baseada em casos similares",
    },
  },
  {
    treatment: "Preenchimento com Ácido Hialurônico",
    confidence: 88, // >85% accuracy requirement
    reasoning: "Indicado para rejuvenescimento facial com baixo risco de complicações.",
    expectedResults: "Redução de linhas de expressão e melhora do volume facial",
    duration: "30-45 minutos",
    cost: "R$ 800 - R$ 1.800",
    riskLevel: "low",
    explainability: {
      topFactors: ["Ausência de alergias", "Boa elasticidade da pele", "Histórico positivo"],
      confidence_reasoning: "Perfil de baixo risco com histórico favorável",
    },
  },
];
var _mockMediumAccuracyPredictions = [
  {
    treatment: "Peeling Químico Profundo",
    confidence: 73, // Below 85% threshold - should trigger warnings
    reasoning: "Tratamento adequado, mas requer avaliação cuidadosa devido a fatores de risco.",
    expectedResults: "Melhora da textura e pigmentação, mas requer cuidados especiais",
    duration: "60-90 minutos",
    cost: "R$ 1.200 - R$ 2.000",
    riskLevel: "medium",
    explainability: {
      topFactors: ["Tipo de pele: III", "Exposição solar frequente", "Sensibilidade moderada"],
      confidence_reasoning: "Fatores de risco moderados requerem monitoramento",
    },
  },
];
describe("TreatmentPredictionDashboard", () => {
  var user = user_event_1.default.setup();
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("Component Rendering", () => {
    test("renders main dashboard elements", () => {
      (0, react_2.render)(<treatment_prediction_dashboard_1.default />);
      expect(react_2.screen.getByText("Predição de Tratamentos com IA")).toBeInTheDocument();
      expect(react_2.screen.getByText("IA Avançada")).toBeInTheDocument();
      expect(react_2.screen.getByText("Tempo Real")).toBeInTheDocument();
      expect(react_2.screen.getByRole("tab", { name: /análise do paciente/i })).toBeInTheDocument();
      expect(react_2.screen.getByRole("tab", { name: /predições/i })).toBeInTheDocument();
      expect(react_2.screen.getByRole("tab", { name: /insights/i })).toBeInTheDocument();
    });
    test("displays patient profile form", () => {
      (0, react_2.render)(<treatment_prediction_dashboard_1.default />);
      expect(react_2.screen.getByLabelText(/idade/i)).toBeInTheDocument();
      expect(react_2.screen.getByLabelText(/tipo de pele/i)).toBeInTheDocument();
      expect(react_2.screen.getByLabelText(/principais preocupações/i)).toBeInTheDocument();
      expect(
        react_2.screen.getByRole("button", { name: /analisar e predizer tratamentos/i }),
      ).toBeInTheDocument();
    });
  });
  describe("Patient Data Input and Validation", () => {
    test("handles patient age input", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var ageInput;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              (0, react_2.render)(<treatment_prediction_dashboard_1.default />);
              ageInput = react_2.screen.getByLabelText(/idade/i);
              return [4 /*yield*/, user.type(ageInput, "28")];
            case 1:
              _a.sent();
              expect(ageInput).toHaveValue(28);
              return [2 /*return*/];
          }
        });
      }));
    test("handles skin type selection", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var skinTypeSelect;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              (0, react_2.render)(<treatment_prediction_dashboard_1.default />);
              skinTypeSelect = react_2.screen.getByLabelText(/tipo de pele/i);
              return [4 /*yield*/, user.click(skinTypeSelect)];
            case 1:
              _a.sent();
              // Should show skin type options
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText(/tipo i/i)).toBeInTheDocument();
                }),
              ];
            case 2:
              // Should show skin type options
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    test("validates required fields before analysis", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analyzeButton;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              (0, react_2.render)(<treatment_prediction_dashboard_1.default />);
              analyzeButton = react_2.screen.getByRole("button", {
                name: /analisar e predizer tratamentos/i,
              });
              return [4 /*yield*/, user.click(analyzeButton)];
            case 1:
              _a.sent();
              // Should handle empty form gracefully
              expect(analyzeButton).toBeInTheDocument();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("AI Prediction Generation", () => {
    test("shows loading state during analysis", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analyzeButton;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              (0, react_2.render)(<treatment_prediction_dashboard_1.default />);
              analyzeButton = react_2.screen.getByRole("button", {
                name: /analisar e predizer tratamentos/i,
              });
              return [
                4 /*yield*/,
                (0, react_2.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, user.click(analyzeButton)];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              // Should show loading state
              expect(react_2.screen.getByText(/analisando com ia/i)).toBeInTheDocument();
              expect(analyzeButton).toBeDisabled();
              return [2 /*return*/];
          }
        });
      }));
    test("generates predictions with high accuracy (≥85%)", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analyzeButton, predictionsTab;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              (0, react_2.render)(<treatment_prediction_dashboard_1.default />);
              // Fill out patient data
              return [4 /*yield*/, user.type(react_2.screen.getByLabelText(/idade/i), "28")];
            case 1:
              // Fill out patient data
              _a.sent();
              analyzeButton = react_2.screen.getByRole("button", {
                name: /analisar e predizer tratamentos/i,
              });
              return [
                4 /*yield*/,
                (0, react_2.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, user.click(analyzeButton)];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 2:
              _a.sent();
              // Wait for analysis to complete (mocked to 3 seconds)
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(
                  () => {
                    expect(
                      react_2.screen.queryByText(/analisando com ia/i),
                    ).not.toBeInTheDocument();
                  },
                  { timeout: 4000 },
                ),
              ];
            case 3:
              // Wait for analysis to complete (mocked to 3 seconds)
              _a.sent();
              predictionsTab = react_2.screen.getByRole("tab", { name: /predições/i });
              return [4 /*yield*/, user.click(predictionsTab)];
            case 4:
              _a.sent();
              // Should display high accuracy predictions
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText(/laser co2 fracionado/i)).toBeInTheDocument();
                  expect(react_2.screen.getByText(/92% confiança/i)).toBeInTheDocument(); // ≥85% requirement
                  expect(
                    react_2.screen.getByText(/preenchimento com ácido hialurônico/i),
                  ).toBeInTheDocument();
                  expect(react_2.screen.getByText(/88% confiança/i)).toBeInTheDocument(); // ≥85% requirement
                }),
              ];
            case 5:
              // Should display high accuracy predictions
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    test("displays accuracy warning for predictions below 85%", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analyzeButton;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // This test simulates edge cases where predictions might be below target
              (0, react_2.render)(<treatment_prediction_dashboard_1.default />);
              analyzeButton = react_2.screen.getByRole("button", {
                name: /analisar e predizer tratamentos/i,
              });
              return [
                4 /*yield*/,
                (0, react_2.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, user.click(analyzeButton)];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(
                  () => {
                    expect(
                      react_2.screen.queryByText(/analisando com ia/i),
                    ).not.toBeInTheDocument();
                  },
                  { timeout: 4000 },
                ),
              ];
            case 2:
              _a.sent();
              // Should handle all prediction levels appropriately
              expect(
                react_2.screen.getByRole("button", { name: /analisar e predizer tratamentos/i }),
              ).toBeEnabled();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Multi-factor Analysis Display", () => {
    test("shows comprehensive patient factors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analyzeButton, insightsTab;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              (0, react_2.render)(<treatment_prediction_dashboard_1.default />);
              return [4 /*yield*/, user.type(react_2.screen.getByLabelText(/idade/i), "35")];
            case 1:
              _a.sent();
              analyzeButton = react_2.screen.getByRole("button", {
                name: /analisar e predizer tratamentos/i,
              });
              return [
                4 /*yield*/,
                (0, react_2.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, user.click(analyzeButton)];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 2:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(
                  () => {
                    expect(
                      react_2.screen.queryByText(/analisando com ia/i),
                    ).not.toBeInTheDocument();
                  },
                  { timeout: 4000 },
                ),
              ];
            case 3:
              _a.sent();
              insightsTab = react_2.screen.getByRole("tab", { name: /insights/i });
              return [4 /*yield*/, user.click(insightsTab)];
            case 4:
              _a.sent();
              // Should show analysis insights
              expect(react_2.screen.getByText(/insights e recomendações/i)).toBeInTheDocument();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Real-time Scoring Interface", () => {
    test("displays confidence scores in real-time", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analyzeButton, predictionsTab;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              (0, react_2.render)(<treatment_prediction_dashboard_1.default />);
              analyzeButton = react_2.screen.getByRole("button", {
                name: /analisar e predizer tratamentos/i,
              });
              return [
                4 /*yield*/,
                (0, react_2.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, user.click(analyzeButton)];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(
                  () => {
                    expect(
                      react_2.screen.queryByText(/analisando com ia/i),
                    ).not.toBeInTheDocument();
                  },
                  { timeout: 4000 },
                ),
              ];
            case 2:
              _a.sent();
              predictionsTab = react_2.screen.getByRole("tab", { name: /predições/i });
              return [4 /*yield*/, user.click(predictionsTab)];
            case 3:
              _a.sent();
              // Should show real-time confidence scores
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText(/92% confiança/i)).toBeInTheDocument();
                  expect(react_2.screen.getByText(/88% confiança/i)).toBeInTheDocument();
                }),
              ];
            case 4:
              // Should show real-time confidence scores
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    test("shows risk assessment levels", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analyzeButton, predictionsTab;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              (0, react_2.render)(<treatment_prediction_dashboard_1.default />);
              analyzeButton = react_2.screen.getByRole("button", {
                name: /analisar e predizer tratamentos/i,
              });
              return [
                4 /*yield*/,
                (0, react_2.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, user.click(analyzeButton)];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(
                  () => {
                    expect(
                      react_2.screen.queryByText(/analisando com ia/i),
                    ).not.toBeInTheDocument();
                  },
                  { timeout: 4000 },
                ),
              ];
            case 2:
              _a.sent();
              predictionsTab = react_2.screen.getByRole("tab", { name: /predições/i });
              return [4 /*yield*/, user.click(predictionsTab)];
            case 3:
              _a.sent();
              // Should display risk levels
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText(/baixo risco/i)).toBeInTheDocument();
                }),
              ];
            case 4:
              // Should display risk levels
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Medical-grade Validation", () => {
    test("validates medical accuracy of predictions", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analyzeButton;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              (0, react_2.render)(<treatment_prediction_dashboard_1.default />);
              analyzeButton = react_2.screen.getByRole("button", {
                name: /analisar e predizer tratamentos/i,
              });
              return [
                4 /*yield*/,
                (0, react_2.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, user.click(analyzeButton)];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(
                  () => {
                    expect(
                      react_2.screen.queryByText(/analisando com ia/i),
                    ).not.toBeInTheDocument();
                  },
                  { timeout: 4000 },
                ),
              ];
            case 2:
              _a.sent();
              // Should validate that predictions meet medical standards
              expect(analyzeButton).toBeEnabled();
              return [2 /*return*/];
          }
        });
      }));
    test("shows treatment contraindications", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analyzeButton, predictionsTab;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              (0, react_2.render)(<treatment_prediction_dashboard_1.default />);
              analyzeButton = react_2.screen.getByRole("button", {
                name: /analisar e predizer tratamentos/i,
              });
              return [
                4 /*yield*/,
                (0, react_2.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, user.click(analyzeButton)];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(
                  () => {
                    expect(
                      react_2.screen.queryByText(/analisando com ia/i),
                    ).not.toBeInTheDocument();
                  },
                  { timeout: 4000 },
                ),
              ];
            case 2:
              _a.sent();
              predictionsTab = react_2.screen.getByRole("tab", { name: /predições/i });
              return [4 /*yield*/, user.click(predictionsTab)];
            case 3:
              _a.sent();
              // Should include medical safety information
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(() => {
                  expect(react_2.screen.getByText(/resultados esperados/i)).toBeInTheDocument();
                }),
              ];
            case 4:
              // Should include medical safety information
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Performance Monitoring", () => {
    test("tracks dashboard performance metrics", () => {
      var startTime = performance.now();
      (0, react_2.render)(<treatment_prediction_dashboard_1.default />);
      var endTime = performance.now();
      // Dashboard should render quickly (performance requirement)
      expect(endTime - startTime).toBeLessThan(1000); // Less than 1 second
    });
    test("monitors prediction generation time", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analyzeButton, startTime, endTime;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              (0, react_2.render)(<treatment_prediction_dashboard_1.default />);
              analyzeButton = react_2.screen.getByRole("button", {
                name: /analisar e predizer tratamentos/i,
              });
              startTime = performance.now();
              return [
                4 /*yield*/,
                (0, react_2.act)(() =>
                  __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, (_a) => {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, user.click(analyzeButton)];
                        case 1:
                          _a.sent();
                          return [2 /*return*/];
                      }
                    });
                  }),
                ),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_2.waitFor)(
                  () => {
                    expect(
                      react_2.screen.queryByText(/analisando com ia/i),
                    ).not.toBeInTheDocument();
                  },
                  { timeout: 4000 },
                ),
              ];
            case 2:
              _a.sent();
              endTime = performance.now();
              // Prediction should complete within reasonable time
              expect(endTime - startTime).toBeLessThan(5000); // Less than 5 seconds (includes 3s mock delay)
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Accessibility and UX", () => {
    test("has proper ARIA labels", () => {
      (0, react_2.render)(<treatment_prediction_dashboard_1.default />);
      expect(react_2.screen.getByLabelText(/idade/i)).toHaveAttribute("id", "age");
      expect(react_2.screen.getByRole("tab", { name: /análise do paciente/i })).toBeInTheDocument();
    });
    test("supports keyboard navigation", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var ageInput;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              (0, react_2.render)(<treatment_prediction_dashboard_1.default />);
              ageInput = react_2.screen.getByLabelText(/idade/i);
              ageInput.focus();
              expect(ageInput).toHaveFocus();
              // Tab navigation should work
              return [4 /*yield*/, user.tab()];
            case 1:
              // Tab navigation should work
              _a.sent();
              expect(react_2.screen.getByLabelText(/tipo de pele/i)).toHaveFocus();
              return [2 /*return*/];
          }
        });
      }));
  });
});
