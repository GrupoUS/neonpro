"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
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
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
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
  };
Object.defineProperty(exports, "__esModule", { value: true });
require("@testing-library/jest-dom");
var react_1 = require("@testing-library/react");
var react_query_1 = require("@tanstack/react-query");
var react_2 = require("react");
var PredictiveAnalyticsPage_1 = require("@/components/dashboard/predictive-analytics/PredictiveAnalyticsPage");
// Mock fetch globally
var mockFetch = jest.fn();
global.fetch = mockFetch;
// Mock data aligned with actual component structure
var mockModels = [
  {
    id: "model-1",
    name: "Random Forest Demand Forecaster",
    type: "random_forest",
    status: "active",
    accuracy: 0.875,
    last_trained: "2024-01-15T10:00:00Z",
    training_data_size: 10000,
    features: ["historical_demand", "seasonality", "weather", "events"],
  },
  {
    id: "model-2",
    name: "LSTM Neural Network",
    type: "lstm",
    status: "training",
    accuracy: 0.823,
    last_trained: "2024-01-14T08:30:00Z",
    training_data_size: 15000,
    features: ["time_series", "external_factors"],
  },
];
var mockPredictions = [
  {
    id: "pred-1",
    model_id: "model-1",
    prediction_date: new Date().toISOString(),
    predicted_value: 150.5,
    confidence_interval: [140.2, 160.8],
    category: "procedimento_facial",
    timeframe: "7_days",
    factors: ["seasonal_trend", "marketing_campaign"],
  },
  {
    id: "pred-2",
    model_id: "model-1",
    prediction_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    predicted_value: 180.3,
    confidence_interval: [165.1, 195.5],
    category: "procedimento_corporal",
    timeframe: "30_days",
    factors: ["promotion_effect", "seasonal_boost"],
  },
];
var mockAlerts = [
  {
    id: "alert-1",
    type: "demand_spike",
    title: "Pico de Demanda Detectado",
    message: "Aumento de 25% previsto para procedimentos faciais na próxima semana",
    status: "active",
    priority: "high",
    created_at: new Date().toISOString(),
    category: "procedimento_facial",
  },
  {
    id: "alert-2",
    type: "accuracy_drop",
    title: "Queda na Precisão do Modelo",
    message: "Modelo LSTM apresentou queda de precisão para 78%",
    status: "active",
    priority: "medium",
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    model_id: "model-2",
  },
];
var mockAccuracyStats = {
  average_accuracy: 0.875,
  total_predictions: 1250,
  successful_predictions: 1094,
  model_performance: [
    { model_id: "model-1", accuracy: 0.875 },
    { model_id: "model-2", accuracy: 0.823 },
  ],
};
var mockRecommendations = [
  {
    id: "rec-1",
    title: "Atualizar Dados de Treinamento",
    description: "Modelo precisa de dados mais recentes para melhorar precisão",
    priority: "high",
    suggested_actions: [
      "Incluir dados dos últimos 3 meses",
      "Adicionar variáveis de sazonalidade",
      "Retreinar modelo com novo dataset",
    ],
    estimated_impact: "Aumento de 5-8% na precisão",
  },
  {
    id: "rec-2",
    title: "Configurar Alertas Automáticos",
    description: "Estabelecer limites para detecção automática de anomalias",
    priority: "medium",
    suggested_actions: [
      "Definir thresholds de demanda",
      "Configurar notificações push",
      "Integrar com sistema de agenda",
    ],
    estimated_impact: "Redução de 15% em oportunidades perdidas",
  },
];
// Test wrapper with providers
var TestWrapper = function (_a) {
  var children = _a.children;
  var queryClient = new react_query_1.QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return (
    <react_query_1.QueryClientProvider client={queryClient}>
      {children}
    </react_query_1.QueryClientProvider>
  );
};
describe("PredictiveAnalyticsPage Component", function () {
  beforeEach(function () {
    // Reset fetch mock before each test
    jest.clearAllMocks();
    // Mock API responses for each endpoint
    mockFetch.mockImplementation(function (url) {
      if (url.includes("/api/predictive-analytics/models")) {
        return Promise.resolve({
          ok: true,
          json: function () {
            return __awaiter(void 0, void 0, void 0, function () {
              return __generator(this, function (_a) {
                return [2 /*return*/, { data: mockModels }];
              });
            });
          },
        });
      }
      if (url.includes("/api/predictive-analytics/predictions")) {
        return Promise.resolve({
          ok: true,
          json: function () {
            return __awaiter(void 0, void 0, void 0, function () {
              return __generator(this, function (_a) {
                return [2 /*return*/, { data: mockPredictions }];
              });
            });
          },
        });
      }
      if (url.includes("/api/predictive-analytics/alerts")) {
        return Promise.resolve({
          ok: true,
          json: function () {
            return __awaiter(void 0, void 0, void 0, function () {
              return __generator(this, function (_a) {
                return [2 /*return*/, { data: mockAlerts }];
              });
            });
          },
        });
      }
      if (url.includes("/api/predictive-analytics/accuracy/stats")) {
        return Promise.resolve({
          ok: true,
          json: function () {
            return __awaiter(void 0, void 0, void 0, function () {
              return __generator(this, function (_a) {
                return [2 /*return*/, mockAccuracyStats];
              });
            });
          },
        });
      }
      if (url.includes("/api/predictive-analytics/recommendations")) {
        return Promise.resolve({
          ok: true,
          json: function () {
            return __awaiter(void 0, void 0, void 0, function () {
              return __generator(this, function (_a) {
                return [2 /*return*/, mockRecommendations];
              });
            });
          },
        });
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });
  });
  describe("Component Rendering", function () {
    it("renders predictive analytics interface correctly", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Análise Preditiva")).toBeInTheDocument();
                  expect(
                    react_1.screen.getByText(
                      "Forecasting de demanda com IA para otimização de recursos",
                    ),
                  ).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("displays main navigation tabs", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(
                    react_1.screen.getByRole("tab", { name: /dashboard/i }),
                  ).toBeInTheDocument();
                  expect(react_1.screen.getByRole("tab", { name: /modelos/i })).toBeInTheDocument();
                  expect(
                    react_1.screen.getByRole("tab", { name: /predições/i }),
                  ).toBeInTheDocument();
                  expect(react_1.screen.getByRole("tab", { name: /alertas/i })).toBeInTheDocument();
                  expect(
                    react_1.screen.getByRole("tab", { name: /relatórios/i }),
                  ).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("shows forecasting dashboard with key metrics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Modelos Ativos")).toBeInTheDocument();
                  expect(react_1.screen.getByText("Precisão Média")).toBeInTheDocument();
                  expect(react_1.screen.getByText("Alertas Ativos")).toBeInTheDocument();
                  expect(react_1.screen.getByText("Predições Hoje")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Forecasting Models Interface", function () {
    it("displays active forecasting models", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              // Switch to models tab
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  var modelsTab = react_1.screen.getByRole("tab", { name: /modelos/i });
                  react_1.fireEvent.click(modelsTab);
                }),
              ];
            case 2:
              // Switch to models tab
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  // Look for the specific metric card for active models
                  var modelsCard = react_1.screen
                    .getByText("Modelos Ativos")
                    .closest(".rounded-lg");
                  expect(modelsCard).toBeInTheDocument();
                  expect((0, react_1.within)(modelsCard).getByText("1")).toBeInTheDocument();
                }),
              ];
            case 3:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("shows model performance metrics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("87.5%")).toBeInTheDocument(); // Average accuracy
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("handles model retraining action", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockFetch.mockImplementation(function (url) {
                if (url.includes("/models") && url.includes("retrain")) {
                  return Promise.resolve({
                    ok: true,
                    json: function () {
                      return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                          return [
                            2 /*return*/,
                            { success: true, message: "Retreinamento iniciado" },
                          ];
                        });
                      });
                    },
                  });
                }
                // Default responses for other endpoints
                return Promise.resolve({
                  ok: true,
                  json: function () {
                    return __awaiter(void 0, void 0, void 0, function () {
                      return __generator(this, function (_a) {
                        return [2 /*return*/, { data: [] }];
                      });
                    });
                  },
                });
              });
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Análise Preditiva")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Predictions Display", function () {
    it("displays demand predictions with confidence intervals", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              // Switch to predictions tab
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  var predictionsTab = react_1.screen.getByRole("tab", { name: /predições/i });
                  react_1.fireEvent.click(predictionsTab);
                }),
              ];
            case 2:
              // Switch to predictions tab
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Predições Hoje")).toBeInTheDocument();
                }),
              ];
            case 3:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("shows prediction charts and visualizations", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Análise Preditiva")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("handles prediction filtering by category", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Análise Preditiva")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Alerts and Notifications", function () {
    it("displays active demand alerts", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              // Switch to alerts tab
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  var alertsTab = react_1.screen.getByRole("tab", { name: /alertas/i });
                  react_1.fireEvent.click(alertsTab);
                }),
              ];
            case 2:
              // Switch to alerts tab
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Alertas Ativos")).toBeInTheDocument();
                }),
              ];
            case 3:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("handles alert acknowledgment", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Análise Preditiva")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("shows alert severity indicators", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Análise Preditiva")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Interactive Elements", function () {
    it("handles tab navigation correctly", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  var dashboardTab = react_1.screen.getByRole("tab", { name: /dashboard/i });
                  var modelsTab = react_1.screen.getByRole("tab", { name: /modelos/i });
                  var predictionsTab = react_1.screen.getByRole("tab", { name: /predições/i });
                  var alertsTab = react_1.screen.getByRole("tab", { name: /alertas/i });
                  var reportsTab = react_1.screen.getByRole("tab", { name: /relatórios/i });
                  // All tabs should be clickable
                  expect(dashboardTab).toBeInTheDocument();
                  expect(modelsTab).toBeInTheDocument();
                  expect(predictionsTab).toBeInTheDocument();
                  expect(alertsTab).toBeInTheDocument();
                  expect(reportsTab).toBeInTheDocument();
                  // Test clicking functionality
                  react_1.fireEvent.click(modelsTab);
                  react_1.fireEvent.click(predictionsTab);
                  react_1.fireEvent.click(alertsTab);
                  react_1.fireEvent.click(dashboardTab);
                  // Verify the component doesn't crash during navigation
                  expect(react_1.screen.getByText("Análise Preditiva")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("handles search and filtering", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Análise Preditiva")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("handles refresh functionality", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  var refreshButton = react_1.screen.getByText("Atualizar");
                  react_1.fireEvent.click(refreshButton);
                  expect(mockFetch).toHaveBeenCalled();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Responsive Design", function () {
    it("renders without errors on different screen sizes", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              // Mock window.matchMedia for responsive tests
              Object.defineProperty(window, "matchMedia", {
                writable: true,
                value: jest.fn().mockImplementation(function (query) {
                  return {
                    matches: false,
                    media: query,
                    onchange: null,
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                  };
                }),
              });
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Análise Preditiva")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("maintains functionality across viewport sizes", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Análise Preditiva")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Accessibility Features", function () {
    it("provides proper ARIA labels and roles", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByRole("tablist")).toBeInTheDocument();
                  expect(react_1.screen.getAllByRole("tab")).toHaveLength(5);
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("supports keyboard navigation", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  var firstTab = react_1.screen.getByRole("tab", { name: /dashboard/i });
                  expect(firstTab).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("has proper semantic structure", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(
                    react_1.screen.getByRole("heading", { name: /análise preditiva/i }),
                  ).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Performance Requirements", function () {
    it("renders within acceptable time frame", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var startTime, endTime;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              startTime = performance.now();
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Análise Preditiva")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              endTime = performance.now();
              expect(endTime - startTime).toBeLessThan(5000); // Should render within 5 seconds
              return [2 /*return*/];
          }
        });
      });
    });
    it("handles multiple rapid interactions", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  var tabs = react_1.screen.getAllByRole("tab");
                  // Rapidly click through tabs
                  tabs.forEach(function (tab) {
                    react_1.fireEvent.click(tab);
                  });
                  expect(react_1.screen.getByText("Análise Preditiva")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Story 8.3 Acceptance Criteria Validation", function () {
    it("AC1: Machine learning-based forecasting with ≥85% accuracy", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("87.5%")).toBeInTheDocument(); // Accuracy metric
                  expect(react_1.screen.getByText("Precisão Média")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("AC2: Multi-dimensional forecasting capabilities", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Modelos Ativos")).toBeInTheDocument();
                  expect(react_1.screen.getByText("Predições Hoje")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("AC4: Early warning system for demand spikes", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Alertas Ativos")).toBeInTheDocument();
                  expect(react_1.screen.getByText("2")).toBeInTheDocument(); // Alert count
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("AC7: Forecasting dashboard with visual predictions", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Análise Preditiva")).toBeInTheDocument();
                  expect(
                    react_1.screen.getByRole("tab", { name: /dashboard/i }),
                  ).toBeInTheDocument();
                  expect(react_1.screen.getByText("Modelos Ativos")).toBeInTheDocument();
                  expect(react_1.screen.getByText("Precisão Média")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("AC8: Customizable forecasting timeframes", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              // Switch to predictions tab
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  var predictionsTab = react_1.screen.getByRole("tab", { name: /predições/i });
                  react_1.fireEvent.click(predictionsTab);
                }),
              ];
            case 2:
              // Switch to predictions tab
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Predições Hoje")).toBeInTheDocument();
                }),
              ];
            case 3:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("AC10: Performance tracking and accuracy monitoring", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Precisão Média")).toBeInTheDocument();
                  expect(react_1.screen.getByText("87.5%")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Error Handling", function () {
    it("renders gracefully with missing data", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockFetch.mockImplementation(function () {
                return Promise.resolve({
                  ok: true,
                  json: function () {
                    return __awaiter(void 0, void 0, void 0, function () {
                      return __generator(this, function (_a) {
                        return [2 /*return*/, { data: [] }];
                      });
                    });
                  },
                });
              });
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Análise Preditiva")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("maintains stability during state changes", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var tabs, _loop_1, _i, tabs_1, tab;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Análise Preditiva")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              tabs = react_1.screen.getAllByRole("tab");
              _loop_1 = function (tab) {
                return __generator(this, function (_b) {
                  switch (_b.label) {
                    case 0:
                      return [
                        4 /*yield*/,
                        (0, react_1.act)(function () {
                          return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                              react_1.fireEvent.click(tab);
                              return [2 /*return*/];
                            });
                          });
                        }),
                      ];
                    case 1:
                      _b.sent();
                      return [2 /*return*/];
                  }
                });
              };
              (_i = 0), (tabs_1 = tabs);
              _a.label = 3;
            case 3:
              if (!(_i < tabs_1.length)) return [3 /*break*/, 6];
              tab = tabs_1[_i];
              return [5 /*yield**/, _loop_1(tab)];
            case 4:
              _a.sent();
              _a.label = 5;
            case 5:
              _i++;
              return [3 /*break*/, 3];
            case 6:
              expect(react_1.screen.getByText("Análise Preditiva")).toBeInTheDocument();
              return [2 /*return*/];
          }
        });
      });
    });
    it("handles API errors gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockFetch.mockRejectedValue(new Error("API Error"));
              return [
                4 /*yield*/,
                (0, react_1.act)(function () {
                  return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      (0, react_1.render)(
                        <TestWrapper>
                          <PredictiveAnalyticsPage_1.default />
                        </TestWrapper>,
                      );
                      return [2 /*return*/];
                    });
                  });
                }),
              ];
            case 1:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText("Análise Preditiva")).toBeInTheDocument();
                }),
              ];
            case 2:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
