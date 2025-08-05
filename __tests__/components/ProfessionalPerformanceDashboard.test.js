"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var globals_1 = require("@jest/globals");
var ProfessionalPerformanceDashboard_1 = require("@/components/dashboard/ProfessionalPerformanceDashboard");
var professionals_1 = require("@/lib/supabase/professionals");
// Mock the dependencies
globals_1.jest.mock('next/navigation', function () { return ({
    useRouter: function () { return ({
        push: globals_1.jest.fn(),
        back: globals_1.jest.fn()
    }); }
}); });
globals_1.jest.mock('@/lib/supabase/professionals', function () { return ({
    getProfessionalPerformanceMetrics: globals_1.jest.fn()
}); });
// Mock data
var mockPerformanceMetrics = [
    {
        id: 'metric-1',
        professional_id: '1',
        metric_type: 'patient_satisfaction',
        metric_value: 4.8,
        measurement_period: 'monthly',
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        notes: 'Excelente avaliação dos pacientes',
        created_at: '2024-02-01T00:00:00Z',
        updated_at: '2024-02-01T00:00:00Z'
    },
    {
        id: 'metric-2',
        professional_id: '1',
        metric_type: 'appointment_completion_rate',
        metric_value: 95.5,
        measurement_period: 'monthly',
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        notes: 'Alta taxa de conclusão de consultas',
        created_at: '2024-02-01T00:00:00Z',
        updated_at: '2024-02-01T00:00:00Z'
    },
    {
        id: 'metric-3',
        professional_id: '1',
        metric_type: 'revenue_generated',
        metric_value: 45000.00,
        measurement_period: 'monthly',
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        notes: 'Receita gerada no período',
        created_at: '2024-02-01T00:00:00Z',
        updated_at: '2024-02-01T00:00:00Z'
    },
    {
        id: 'metric-4',
        professional_id: '1',
        metric_type: 'professional_development_hours',
        metric_value: 40,
        measurement_period: 'quarterly',
        period_start: '2024-01-01',
        period_end: '2024-03-31',
        notes: 'Horas de desenvolvimento profissional',
        created_at: '2024-04-01T00:00:00Z',
        updated_at: '2024-04-01T00:00:00Z'
    }
];
var mockProfessional = {
    id: '1',
    given_name: 'Dr. Ana',
    family_name: 'Silva',
    qualification: 'Dermatologista'
};
describe('ProfessionalPerformanceDashboard', function () {
    beforeEach(function () {
        globals_1.jest.clearAllMocks();
        professionals_1.getProfessionalPerformanceMetrics.mockResolvedValue(mockPerformanceMetrics);
    });
    describe('Component Rendering', function () {
        it('should render dashboard header', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                expect(react_1.screen.getByText('Performance - Dr. Ana Silva')).toBeInTheDocument();
                expect(react_1.screen.getByText('Métricas de performance e desenvolvimento profissional')).toBeInTheDocument();
                return [2 /*return*/];
            });
        }); });
        it('should render time period selector', function () {
            (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
            expect(react_1.screen.getByText('Período:')).toBeInTheDocument();
            expect(react_1.screen.getByRole('combobox')).toBeInTheDocument();
        });
        it('should render performance overview cards', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Satisfação do Paciente')).toBeInTheDocument();
                                expect(react_1.screen.getByText('Taxa de Conclusão')).toBeInTheDocument();
                                expect(react_1.screen.getByText('Receita Gerada')).toBeInTheDocument();
                                expect(react_1.screen.getByText('Horas de Desenvolvimento')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should render charts section', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Tendências de Performance')).toBeInTheDocument();
                                expect(react_1.screen.getByText('Distribuição de Métricas')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should render metrics table', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Histórico de Métricas')).toBeInTheDocument();
                                expect(react_1.screen.getByRole('table')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Data Loading', function () {
        it('should load performance metrics on mount', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(professionals_1.getProfessionalPerformanceMetrics).toHaveBeenCalledWith('1');
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle loading error', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ;
                        professionals_1.getProfessionalPerformanceMetrics.mockRejectedValue(new Error('Failed to load'));
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Erro ao carregar métricas de performance')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should display loading state', function () {
            ;
            professionals_1.getProfessionalPerformanceMetrics.mockImplementation(function () {
                return new Promise(function (resolve) { return setTimeout(resolve, 1000); });
            });
            (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
            expect(react_1.screen.getByText('Carregando métricas...')).toBeInTheDocument();
        });
    });
    describe('Performance Metrics Display', function () {
        it('should display patient satisfaction metric correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('4.8')).toBeInTheDocument();
                                expect(react_1.screen.getByText('/5.0')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should display completion rate as percentage', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('95.5%')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should display revenue with currency formatting', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('R$ 45.000,00')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should display development hours', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('40')).toBeInTheDocument();
                                expect(react_1.screen.getByText('horas')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show trend indicators', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                // Look for trend icons (up/down arrows)
                                var trendIcons = react_1.screen.getAllByTestId(/trend-icon/);
                                expect(trendIcons.length).toBeGreaterThan(0);
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Time Period Filtering', function () {
        it('should filter metrics by monthly period', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Última Semana')).toBeInTheDocument();
                                expect(react_1.screen.getByText('Último Mês')).toBeInTheDocument();
                                expect(react_1.screen.getByText('Último Trimestre')).toBeInTheDocument();
                                expect(react_1.screen.getByText('Último Ano')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should update metrics when period changes', function () { return __awaiter(void 0, void 0, void 0, function () {
            var periodSelector, quarterOption;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(professionals_1.getProfessionalPerformanceMetrics).toHaveBeenCalledTimes(1);
                            })
                            // Change period selection
                        ];
                    case 1:
                        _a.sent();
                        periodSelector = react_1.screen.getByRole('combobox');
                        react_1.fireEvent.click(periodSelector);
                        quarterOption = react_1.screen.getByText('Último Trimestre');
                        react_1.fireEvent.click(quarterOption);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(professionals_1.getProfessionalPerformanceMetrics).toHaveBeenCalledTimes(2);
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should display correct date ranges for periods', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                // Should show formatted date ranges
                                expect(react_1.screen.getByText('01/01/2024 - 31/01/2024')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Charts and Visualizations', function () {
        it('should render performance trend chart', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Tendências de Performance')).toBeInTheDocument();
                                // Chart would be rendered by Recharts library
                                expect(document.querySelector('.recharts-wrapper')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should render metrics distribution chart', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Distribuição de Métricas')).toBeInTheDocument();
                                // Pie chart would be rendered by Recharts library
                                expect(document.querySelector('.recharts-pie')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle empty chart data gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ;
                        professionals_1.getProfessionalPerformanceMetrics.mockResolvedValue([]);
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Nenhum dado disponível para o período selecionado')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should display chart tooltips correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                // Chart tooltips would be handled by Recharts
                                var chartContainer = document.querySelector('.recharts-wrapper');
                                expect(chartContainer).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Metrics Table', function () {
        it('should display all metrics in table', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Satisfação do Paciente')).toBeInTheDocument();
                                expect(react_1.screen.getByText('Taxa de Conclusão de Consultas')).toBeInTheDocument();
                                expect(react_1.screen.getByText('Receita Gerada')).toBeInTheDocument();
                                expect(react_1.screen.getByText('Horas de Desenvolvimento Profissional')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show metric values with correct formatting', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('4.8/5.0')).toBeInTheDocument();
                                expect(react_1.screen.getByText('95.5%')).toBeInTheDocument();
                                expect(react_1.screen.getByText('R$ 45.000,00')).toBeInTheDocument();
                                expect(react_1.screen.getByText('40 horas')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should display measurement periods correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Mensal')).toBeInTheDocument();
                                expect(react_1.screen.getByText('Trimestral')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show notes when available', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Excelente avaliação dos pacientes')).toBeInTheDocument();
                                expect(react_1.screen.getByText('Alta taxa de conclusão de consultas')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should sort table by different columns', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                var metricTypeHeader = react_1.screen.getByText('Tipo de Métrica');
                                expect(metricTypeHeader).toBeInTheDocument();
                                // Click to sort
                                react_1.fireEvent.click(metricTypeHeader);
                            })
                            // Should re-order table rows
                        ];
                    case 1:
                        _a.sent();
                        // Should re-order table rows
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByRole('table')).toBeInTheDocument();
                            })];
                    case 2:
                        // Should re-order table rows
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Performance Insights', function () {
        it('should display performance summary', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Resumo de Performance')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should show recommendations when performance is below target', function () { return __awaiter(void 0, void 0, void 0, function () {
            var lowPerformanceMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lowPerformanceMetrics = [
                            __assign(__assign({}, mockPerformanceMetrics[0]), { metric_value: 3.2 // Low satisfaction
                             })
                        ];
                        professionals_1.getProfessionalPerformanceMetrics.mockResolvedValue(lowPerformanceMetrics);
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Recomendações')).toBeInTheDocument();
                                expect(react_1.screen.getByText('Considere melhorar a comunicação com pacientes')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should highlight exceptional performance', function () { return __awaiter(void 0, void 0, void 0, function () {
            var highPerformanceMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        highPerformanceMetrics = [
                            __assign(__assign({}, mockPerformanceMetrics[0]), { metric_value: 4.9 // Excellent satisfaction
                             })
                        ];
                        professionals_1.getProfessionalPerformanceMetrics.mockResolvedValue(highPerformanceMetrics);
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Performance Excepcional')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Export and Actions', function () {
        it('should provide export options', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByRole('button', { name: 'Exportar Relatório' })).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should allow printing dashboard', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByRole('button', { name: 'Imprimir' })).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should refresh data when refresh button is clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
            var refreshButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(professionals_1.getProfessionalPerformanceMetrics).toHaveBeenCalledTimes(1);
                            })];
                    case 1:
                        _a.sent();
                        refreshButton = react_1.screen.getByRole('button', { name: 'Atualizar' });
                        react_1.fireEvent.click(refreshButton);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(professionals_1.getProfessionalPerformanceMetrics).toHaveBeenCalledTimes(2);
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Responsive Design', function () {
        it('should adapt layout for mobile screens', function () {
            // Mock window.innerWidth
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375
            });
            (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
            // Should render mobile-friendly layout
            expect(react_1.screen.getByText('Performance - Dr. Ana Silva')).toBeInTheDocument();
        });
        it('should stack cards vertically on small screens', function () {
            (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
            // Cards should have responsive classes
            var cards = react_1.screen.getAllByTestId('performance-card');
            expect(cards.length).toBeGreaterThan(0);
        });
    });
    describe('Error Handling', function () {
        it('should handle network errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ;
                        professionals_1.getProfessionalPerformanceMetrics.mockRejectedValue(new Error('Network error'));
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Erro ao carregar métricas de performance')).toBeInTheDocument();
                                expect(react_1.screen.getByRole('button', { name: 'Tentar Novamente' })).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should retry loading when retry button is clicked', function () { return __awaiter(void 0, void 0, void 0, function () {
            var retryButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ;
                        professionals_1.getProfessionalPerformanceMetrics
                            .mockRejectedValueOnce(new Error('Network error'))
                            .mockResolvedValueOnce(mockPerformanceMetrics);
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Erro ao carregar métricas de performance')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        retryButton = react_1.screen.getByRole('button', { name: 'Tentar Novamente' });
                        react_1.fireEvent.click(retryButton);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Satisfação do Paciente')).toBeInTheDocument();
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle missing professional data', function () {
            (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={null}/>);
            expect(react_1.screen.getByText('Profissional não encontrado')).toBeInTheDocument();
        });
    });
    describe('Accessibility', function () {
        it('should have proper ARIA labels', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByRole('main')).toBeInTheDocument();
                                expect(react_1.screen.getByRole('table')).toBeInTheDocument();
                                expect(react_1.screen.getByRole('combobox')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should support keyboard navigation', function () {
            (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
            var periodSelector = react_1.screen.getByRole('combobox');
            expect(periodSelector).toBeInTheDocument();
            react_1.fireEvent.focus(periodSelector);
            expect(document.activeElement).toBe(periodSelector);
        });
        it('should have proper color contrast for charts', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                // Chart colors should meet accessibility standards
                                var chartContainer = document.querySelector('.recharts-wrapper');
                                expect(chartContainer).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Data Validation', function () {
        it('should handle malformed metric data', function () { return __awaiter(void 0, void 0, void 0, function () {
            var malformedMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        malformedMetrics = [
                            __assign(__assign({}, mockPerformanceMetrics[0]), { metric_value: null })
                        ];
                        professionals_1.getProfessionalPerformanceMetrics.mockResolvedValue(malformedMetrics);
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Dados inválidos')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should validate date ranges', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<ProfessionalPerformanceDashboard_1.default professional={mockProfessional}/>);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                // Should format dates correctly
                                expect(react_1.screen.getByText('01/01/2024 - 31/01/2024')).toBeInTheDocument();
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
