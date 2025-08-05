"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
var globals_1 = require("@jest/globals");
var page_1 = require("@/app/dashboard/page");
// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', function () { return ({
    motion: {
        div: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <div {...props}>{children}</div>;
        },
        button: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <button {...props}>{children}</button>;
        },
        h1: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <h1 {...props}>{children}</h1>;
        },
        p: function (_a) {
            var children = _a.children, props = __rest(_a, ["children"]);
            return <p {...props}>{children}</p>;
        }
    }
}); });
// Mock lucide-react icons
jest.mock('lucide-react', function () { return ({
    Users: function () { return <div data-testid="users-icon">👥</div>; },
    Calendar: function () { return <div data-testid="calendar-icon">📅</div>; },
    TrendingUp: function () { return <div data-testid="trending-up-icon">📈</div>; },
    DollarSign: function () { return <div data-testid="dollar-icon">💲</div>; },
    Activity: function () { return <div data-testid="activity-icon">⚡</div>; },
    Clock: function () { return <div data-testid="clock-icon">🕐</div>; },
    UserPlus: function () { return <div data-testid="user-plus-icon">👤➕</div>; },
    CalendarPlus: function () { return <div data-testid="calendar-plus-icon">📅➕</div>; }
}); });
(0, globals_1.describe)('Dashboard Component', function () {
    (0, globals_1.beforeEach)(function () {
        // Reset any mocks before each test
    });
    (0, globals_1.test)('should render dashboard title', function () {
        (0, react_1.render)(<page_1.default />);
        var titleElement = react_1.screen.getByText('Dashboard Executivo');
        (0, globals_1.expect)(titleElement).toBeInTheDocument();
    });
    (0, globals_1.test)('should render dashboard subtitle', function () {
        (0, react_1.render)(<page_1.default />);
        var subtitleElement = react_1.screen.getByText('Visão geral da sua clínica estética');
        (0, globals_1.expect)(subtitleElement).toBeInTheDocument();
    });
    (0, globals_1.test)('should render all KPI cards', function () {
        (0, react_1.render)(<page_1.default />);
        // Check for KPI values
        (0, globals_1.expect)(react_1.screen.getByText('1,234')).toBeInTheDocument(); // Total Patients
        (0, globals_1.expect)(react_1.screen.getByText('28')).toBeInTheDocument(); // Today's Appointments
        (0, globals_1.expect)(react_1.screen.getByText('R$ 45,280')).toBeInTheDocument(); // Monthly Revenue
        (0, globals_1.expect)(react_1.screen.getByText('94.2%')).toBeInTheDocument(); // Satisfaction Rate
    });
    (0, globals_1.test)('should render KPI labels', function () {
        (0, react_1.render)(<page_1.default />);
        (0, globals_1.expect)(react_1.screen.getByText('Total de Pacientes')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('Consultas Hoje')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('Receita Mensal')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('Taxa de Satisfação')).toBeInTheDocument();
    });
    (0, globals_1.test)('should render action buttons', function () {
        (0, react_1.render)(<page_1.default />);
        var newPatientButton = react_1.screen.getByText('Novo Paciente');
        var newAppointmentButton = react_1.screen.getByText('Novo Agendamento');
        (0, globals_1.expect)(newPatientButton).toBeInTheDocument();
        (0, globals_1.expect)(newAppointmentButton).toBeInTheDocument();
    });
    (0, globals_1.test)('should render quick actions section', function () {
        (0, react_1.render)(<page_1.default />);
        var quickActionsTitle = react_1.screen.getByText('Ações Rápidas');
        (0, globals_1.expect)(quickActionsTitle).toBeInTheDocument();
        // Check for quick action buttons
        (0, globals_1.expect)(react_1.screen.getByText('Gerenciar Pacientes')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('Ver Agenda')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('Relatórios Financeiros')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('Configurações')).toBeInTheDocument();
    });
    (0, globals_1.test)('should render recent activities section', function () {
        (0, react_1.render)(<page_1.default />);
        var recentActivitiesTitle = react_1.screen.getByText('Atividades Recentes');
        (0, globals_1.expect)(recentActivitiesTitle).toBeInTheDocument();
        // Check for sample activities
        (0, globals_1.expect)(react_1.screen.getByText('Nova consulta agendada')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('Ana Silva')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('Botox realizado')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('Carlos Santos')).toBeInTheDocument();
    });
    (0, globals_1.test)('should render all icons correctly', function () {
        (0, react_1.render)(<page_1.default />);
        (0, globals_1.expect)(react_1.screen.getByTestId('users-icon')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByTestId('calendar-icon')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByTestId('trending-up-icon')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByTestId('dollar-icon')).toBeInTheDocument();
    });
    (0, globals_1.test)('should handle button clicks without errors', function () {
        (0, react_1.render)(<page_1.default />);
        var newPatientButton = react_1.screen.getByText('Novo Paciente');
        var newAppointmentButton = react_1.screen.getByText('Novo Agendamento');
        // These should not throw errors (no actual navigation implemented yet)
        react_1.fireEvent.click(newPatientButton);
        react_1.fireEvent.click(newAppointmentButton);
        (0, globals_1.expect)(newPatientButton).toBeInTheDocument();
        (0, globals_1.expect)(newAppointmentButton).toBeInTheDocument();
    });
    (0, globals_1.test)('should render with correct accessibility attributes', function () {
        (0, react_1.render)(<page_1.default />);
        var titleElement = react_1.screen.getByText('Dashboard Executivo');
        (0, globals_1.expect)(titleElement.tagName).toBe('H1');
        // Check that buttons are properly rendered
        var buttons = react_1.screen.getAllByRole('button');
        (0, globals_1.expect)(buttons.length).toBeGreaterThan(0);
    });
    (0, globals_1.test)('should render monthly growth indicators', function () {
        (0, react_1.render)(<page_1.default />);
        // Check for growth indicators in KPI cards
        (0, globals_1.expect)(react_1.screen.getByText('+8.2% vs mês anterior')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('+12.5% vs mês anterior')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('+15.3% vs mês anterior')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('+2.1% vs mês anterior')).toBeInTheDocument();
    });
    (0, globals_1.test)('should render dashboard with proper layout structure', function () {
        var container = (0, react_1.render)(<page_1.default />).container;
        // Check for main layout elements
        var mainContainer = container.querySelector('div');
        (0, globals_1.expect)(mainContainer).toHaveClass('min-h-screen');
        (0, globals_1.expect)(mainContainer).toHaveClass('bg-gradient-to-br');
    });
    (0, globals_1.test)('should render with healthcare-specific data', function () {
        (0, react_1.render)(<page_1.default />);
        // Check for healthcare-specific terms
        (0, globals_1.expect)(react_1.screen.getByText('clínica estética')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('Consultas')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('Pacientes')).toBeInTheDocument();
        (0, globals_1.expect)(react_1.screen.getByText('Satisfação')).toBeInTheDocument();
    });
});
