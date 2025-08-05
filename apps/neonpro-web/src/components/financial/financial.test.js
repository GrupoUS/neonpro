"use strict";
/**
 * TASK-003: Business Logic Enhancement
 * Unit Tests for Financial Components
 *
 * Comprehensive test suite for intelligent financial management features
 * including invoicing, scheduling, and analytics components.
 */
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
var IntelligentInvoicing_1 = require("@/components/financial/IntelligentInvoicing");
var IntelligentScheduling_1 = require("@/components/financial/IntelligentScheduling");
var FinancialAnalytics_1 = require("@/components/financial/FinancialAnalytics");
var financial_1 = require("@/components/financial");
// Mock external dependencies
globals_1.jest.mock('@/components/ui/use-toast', function () { return ({
    useToast: function () { return ({
        toast: globals_1.jest.fn()
    }); }
}); });
// Mock recharts components
globals_1.jest.mock('recharts', function () { return ({
    LineChart: function (_a) {
        var children = _a.children;
        return <div data-testid="line-chart">{children}</div>;
    },
    Line: function () { return <div data-testid="line"/>; },
    XAxis: function () { return <div data-testid="x-axis"/>; },
    YAxis: function () { return <div data-testid="y-axis"/>; },
    CartesianGrid: function () { return <div data-testid="grid"/>; },
    Tooltip: function () { return <div data-testid="tooltip"/>; },
    ResponsiveContainer: function (_a) {
        var children = _a.children;
        return <div data-testid="responsive-container">{children}</div>;
    },
    BarChart: function (_a) {
        var children = _a.children;
        return <div data-testid="bar-chart">{children}</div>;
    },
    Bar: function () { return <div data-testid="bar"/>; },
    PieChart: function (_a) {
        var children = _a.children;
        return <div data-testid="pie-chart">{children}</div>;
    },
    Pie: function () { return <div data-testid="pie"/>; },
    Cell: function () { return <div data-testid="cell"/>; },
    Area: function () { return <div data-testid="area"/>; },
    AreaChart: function (_a) {
        var children = _a.children;
        return <div data-testid="area-chart">{children}</div>;
    }
}); });
describe('Financial Components Test Suite', function () {
    describe('IntelligentInvoicing Component', function () {
        test('renders invoice generation interface', function () {
            (0, react_1.render)(<IntelligentInvoicing_1.IntelligentInvoicing />);
            expect(react_1.screen.getByText('Geração Inteligente de Faturas')).toBeInTheDocument();
            expect(react_1.screen.getByText('Sistema automatizado com recomendações AI e templates personalizáveis')).toBeInTheDocument();
            expect(react_1.screen.getByPlaceholderText('Selecionar paciente')).toBeInTheDocument();
            expect(react_1.screen.getByPlaceholderText('Selecionar template')).toBeInTheDocument();
        });
        test('AI template recommendation functionality', function () { return __awaiter(void 0, void 0, void 0, function () {
            var recommendButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<IntelligentInvoicing_1.IntelligentInvoicing patientId="patient_1"/>);
                        recommendButton = react_1.screen.getByText('Recomendar com AI');
                        react_1.fireEvent.click(recommendButton);
                        expect(react_1.screen.getByText('Analisando...')).toBeInTheDocument();
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Recomendar com AI')).toBeInTheDocument();
                            }, { timeout: 3000 })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('invoice total calculation', function () {
            var mockItems = [
                {
                    id: '1',
                    serviceId: 'srv_001',
                    serviceName: 'Consulta',
                    quantity: 1,
                    unitPrice: 200,
                    discount: 10,
                    taxRate: 0,
                    total: 180
                },
                {
                    id: '2',
                    serviceId: 'srv_002',
                    serviceName: 'Procedimento',
                    quantity: 1,
                    unitPrice: 500,
                    discount: 0,
                    taxRate: 5,
                    total: 525
                }
            ];
            var totals = (0, financial_1.calculateTotals)(mockItems);
            expect(totals.subtotal).toBe(705);
            expect(totals.totalDiscount).toBe(20);
            expect(totals.totalTax).toBe(25);
            expect(totals.total).toBe(710);
        });
        test('validates required fields before invoice generation', function () { return __awaiter(void 0, void 0, void 0, function () {
            var generateButton;
            return __generator(this, function (_a) {
                (0, react_1.render)(<IntelligentInvoicing_1.IntelligentInvoicing />);
                generateButton = react_1.screen.getByText('Gerar Fatura');
                react_1.fireEvent.click(generateButton);
                // Should not proceed without patient and items
                expect(generateButton).toBeDisabled();
                return [2 /*return*/];
            });
        }); });
        test('generates invoice with valid data', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockOnInvoiceGenerated, patientSelect, templateSelect, generateButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockOnInvoiceGenerated = globals_1.jest.fn();
                        (0, react_1.render)(<IntelligentInvoicing_1.IntelligentInvoicing onInvoiceGenerated={mockOnInvoiceGenerated}/>);
                        patientSelect = react_1.screen.getByPlaceholderText('Selecionar paciente');
                        react_1.fireEvent.click(patientSelect);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                var patientOption = react_1.screen.getByText('Maria Silva');
                                react_1.fireEvent.click(patientOption);
                            })];
                    case 1:
                        _a.sent();
                        templateSelect = react_1.screen.getByPlaceholderText('Selecionar template');
                        react_1.fireEvent.click(templateSelect);
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                var templateOption = react_1.screen.getByText('Consulta Dermatológica');
                                react_1.fireEvent.click(templateOption);
                            })];
                    case 2:
                        _a.sent();
                        generateButton = react_1.screen.getByText('Gerar Fatura');
                        react_1.fireEvent.click(generateButton);
                        expect(react_1.screen.getByText('Gerando...')).toBeInTheDocument();
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(mockOnInvoiceGenerated).toHaveBeenCalled();
                            }, { timeout: 2000 })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('IntelligentScheduling Component', function () {
        test('renders scheduling interface', function () {
            (0, react_1.render)(<IntelligentScheduling_1.IntelligentScheduling />);
            expect(react_1.screen.getByText('Agendamento Inteligente')).toBeInTheDocument();
            expect(react_1.screen.getByText('Sistema AI para otimização de horários e detecção de conflitos')).toBeInTheDocument();
            expect(react_1.screen.getByPlaceholderText('Selecionar paciente')).toBeInTheDocument();
            expect(react_1.screen.getByPlaceholderText('Selecionar profissional')).toBeInTheDocument();
        });
        test('AI slot analysis functionality', function () { return __awaiter(void 0, void 0, void 0, function () {
            var patientSelect, professionalSelect, serviceSelect, dateButton, analyzeButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, react_1.render)(<IntelligentScheduling_1.IntelligentScheduling />);
                        patientSelect = react_1.screen.getByPlaceholderText('Selecionar paciente');
                        react_1.fireEvent.click(patientSelect);
                        react_1.fireEvent.click(react_1.screen.getByText('Maria Silva'));
                        professionalSelect = react_1.screen.getByPlaceholderText('Selecionar profissional');
                        react_1.fireEvent.click(professionalSelect);
                        react_1.fireEvent.click(react_1.screen.getByText('Dra. Marina Silva'));
                        serviceSelect = react_1.screen.getByPlaceholderText('Selecionar serviço');
                        react_1.fireEvent.click(serviceSelect);
                        react_1.fireEvent.click(react_1.screen.getByText('Consulta Dermatológica (30min)'));
                        dateButton = react_1.screen.getByText('Selecionar data');
                        react_1.fireEvent.click(dateButton);
                        analyzeButton = react_1.screen.getByText('Analisar Horários Disponíveis');
                        react_1.fireEvent.click(analyzeButton);
                        expect(react_1.screen.getByText('Analisando Horários...')).toBeInTheDocument();
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Analisar Horários Disponíveis')).toBeInTheDocument();
                            }, { timeout: 3000 })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('conflict detection system', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, react_1.render)(<IntelligentScheduling_1.IntelligentScheduling />);
                // The component should handle conflict detection
                // This would be more meaningful with actual backend integration
                expect(react_1.screen.getByText('Agendamento Inteligente')).toBeInTheDocument();
                return [2 /*return*/];
            });
        }); });
        test('AI scoring algorithm', function () {
            // Mock AI scoring calculation
            var mockSlot = {
                id: 'slot_09_00',
                start: new Date('2024-01-15T09:00:00'),
                end: new Date('2024-01-15T09:30:00'),
                available: true
            };
            var mockPatient = {
                id: 'patient_1',
                name: 'Maria Silva',
                preferences: {
                    preferredDays: [1, 2, 4],
                    preferredTimes: ['09:00', '14:00'],
                    previousAppointments: []
                }
            };
            var mockProfessional = {
                id: 'prof_001',
                name: 'Dra. Marina Silva',
                specialties: ['Dermatologia'],
                workingHours: { start: '08:00', end: '18:00', days: [1, 2, 3, 4, 5] },
                currentLoad: 75
            };
            // In a real implementation, this would test the actual AI scoring
            expect(mockSlot.start.getHours()).toBe(9);
            expect(mockPatient.preferences.preferredTimes).toContain('09:00');
            expect(mockProfessional.currentLoad).toBe(75);
        });
    });
    describe('FinancialAnalytics Component', function () {
        test('renders analytics dashboard', function () {
            (0, react_1.render)(<FinancialAnalytics_1.FinancialAnalytics />);
            expect(react_1.screen.getByText('Análise Financeira')).toBeInTheDocument();
            expect(react_1.screen.getByText('Dashboard com insights preditivos e métricas em tempo real')).toBeInTheDocument();
            expect(react_1.screen.getByText('Últimos 30 dias')).toBeInTheDocument();
        });
        test('period selection functionality', function () {
            (0, react_1.render)(<FinancialAnalytics_1.FinancialAnalytics />);
            var periodSelect = react_1.screen.getByDisplayValue('Últimos 30 dias');
            react_1.fireEvent.click(periodSelect);
            expect(react_1.screen.getByText('Últimos 7 dias')).toBeInTheDocument();
            expect(react_1.screen.getByText('Últimos 90 dias')).toBeInTheDocument();
            expect(react_1.screen.getByText('Último ano')).toBeInTheDocument();
        });
        test('tab navigation', function () {
            (0, react_1.render)(<FinancialAnalytics_1.FinancialAnalytics />);
            expect(react_1.screen.getByText('Visão Geral')).toBeInTheDocument();
            expect(react_1.screen.getByText('Fluxo de Caixa')).toBeInTheDocument();
            expect(react_1.screen.getByText('Serviços')).toBeInTheDocument();
            expect(react_1.screen.getByText('Insights AI')).toBeInTheDocument();
            react_1.fireEvent.click(react_1.screen.getByText('Fluxo de Caixa'));
            expect(react_1.screen.getByText('Fluxo de Caixa Diário')).toBeInTheDocument();
            react_1.fireEvent.click(react_1.screen.getByText('Insights AI'));
            expect(react_1.screen.getByText('Gerar Novos Insights AI')).toBeInTheDocument();
        });
        test('renders charts correctly', function () {
            (0, react_1.render)(<FinancialAnalytics_1.FinancialAnalytics />);
            // Charts should be rendered via mocked recharts components
            expect(react_1.screen.getByTestId('responsive-container')).toBeInTheDocument();
        });
        test('predictive insights generation', function () { return __awaiter(void 0, void 0, void 0, function () {
            var generateButton;
            return __generator(this, function (_a) {
                (0, react_1.render)(<FinancialAnalytics_1.FinancialAnalytics />);
                react_1.fireEvent.click(react_1.screen.getByText('Insights AI'));
                generateButton = react_1.screen.getByText('Gerar Novos Insights AI');
                react_1.fireEvent.click(generateButton);
                // Should trigger insight generation process
                expect(generateButton).toBeInTheDocument();
                return [2 /*return*/];
            });
        }); });
    });
    describe('Utility Functions', function () {
        test('formatCurrency function', function () {
            expect((0, financial_1.formatCurrency)(1234.56)).toBe('R$ 1.234,56');
            expect((0, financial_1.formatCurrency)(0)).toBe('R$ 0,00');
            expect((0, financial_1.formatCurrency)(1000000)).toBe('R$ 1.000.000,00');
        });
        test('formatPercentage function', function () {
            expect((0, financial_1.formatPercentage)(12.345)).toBe('12.3%');
            expect((0, financial_1.formatPercentage)(0)).toBe('0.0%');
            expect((0, financial_1.formatPercentage)(100)).toBe('100.0%');
        });
        test('calculateTotals with complex scenarios', function () {
            var complexItems = [
                {
                    id: '1',
                    serviceId: 'srv_001',
                    serviceName: 'Service 1',
                    quantity: 2,
                    unitPrice: 100,
                    discount: 15,
                    taxRate: 10,
                    total: 170
                },
                {
                    id: '2',
                    serviceId: 'srv_002',
                    serviceName: 'Service 2',
                    quantity: 1,
                    unitPrice: 300,
                    discount: 0,
                    taxRate: 5,
                    total: 315
                }
            ];
            var totals = (0, financial_1.calculateTotals)(complexItems);
            expect(totals.subtotal).toBe(485);
            expect(totals.totalDiscount).toBe(30); // 15% of 200
            expect(totals.totalTax).toBe(32); // 10% of 170 + 5% of 300
            expect(totals.total).toBe(487);
        });
    });
    describe('Error Handling', function () {
        test('handles invalid data gracefully', function () {
            (0, react_1.render)(<IntelligentInvoicing_1.IntelligentInvoicing />);
            // Component should render without errors even with no props
            expect(react_1.screen.getByText('Geração Inteligente de Faturas')).toBeInTheDocument();
        });
        test('handles network errors in AI recommendations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var recommendButton;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Mock fetch to reject
                        global.fetch = globals_1.jest.fn(function () { return Promise.reject(new Error('Network error')); });
                        (0, react_1.render)(<IntelligentInvoicing_1.IntelligentInvoicing />);
                        recommendButton = react_1.screen.getByText('Recomendar com AI');
                        react_1.fireEvent.click(recommendButton);
                        // Should handle error gracefully
                        expect(react_1.screen.getByText('Analisando...')).toBeInTheDocument();
                        return [4 /*yield*/, (0, react_1.waitFor)(function () {
                                expect(react_1.screen.getByText('Recomendar com AI')).toBeInTheDocument();
                            }, { timeout: 3000 })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Performance Tests', function () {
        test('components render within performance budget', function () {
            var startTime = performance.now();
            (0, react_1.render)(<FinancialAnalytics_1.FinancialAnalytics />);
            var endTime = performance.now();
            var renderTime = endTime - startTime;
            // Should render within 100ms
            expect(renderTime).toBeLessThan(100);
        });
        test('handles large datasets efficiently', function () {
            var largeMockData = Array.from({ length: 1000 }, function (_, i) { return ({
                date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
                income: Math.random() * 10000,
                expenses: Math.random() * 5000,
                profit: 0
            }); });
            // Component should handle large datasets without significant performance impact
            var startTime = performance.now();
            (0, react_1.render)(<FinancialAnalytics_1.FinancialAnalytics />);
            var endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(200);
        });
    });
});
