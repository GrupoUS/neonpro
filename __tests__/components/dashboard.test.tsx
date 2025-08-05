import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, beforeEach } from "@jest/globals";
import Dashboard from "@/app/dashboard/page";

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Users: () => <div data-testid="users-icon">👥</div>,
  Calendar: () => <div data-testid="calendar-icon">📅</div>,
  TrendingUp: () => <div data-testid="trending-up-icon">📈</div>,
  DollarSign: () => <div data-testid="dollar-icon">💲</div>,
  Activity: () => <div data-testid="activity-icon">⚡</div>,
  Clock: () => <div data-testid="clock-icon">🕐</div>,
  UserPlus: () => <div data-testid="user-plus-icon">👤➕</div>,
  CalendarPlus: () => <div data-testid="calendar-plus-icon">📅➕</div>,
}));

describe("Dashboard Component", () => {
  beforeEach(() => {
    // Reset any mocks before each test
  });

  test("should render dashboard title", () => {
    render(<Dashboard />);

    const titleElement = screen.getByText("Dashboard Executivo");
    expect(titleElement).toBeInTheDocument();
  });

  test("should render dashboard subtitle", () => {
    render(<Dashboard />);

    const subtitleElement = screen.getByText("Visão geral da sua clínica estética");
    expect(subtitleElement).toBeInTheDocument();
  });

  test("should render all KPI cards", () => {
    render(<Dashboard />);

    // Check for KPI values
    expect(screen.getByText("1,234")).toBeInTheDocument(); // Total Patients
    expect(screen.getByText("28")).toBeInTheDocument(); // Today's Appointments
    expect(screen.getByText("R$ 45,280")).toBeInTheDocument(); // Monthly Revenue
    expect(screen.getByText("94.2%")).toBeInTheDocument(); // Satisfaction Rate
  });

  test("should render KPI labels", () => {
    render(<Dashboard />);

    expect(screen.getByText("Total de Pacientes")).toBeInTheDocument();
    expect(screen.getByText("Consultas Hoje")).toBeInTheDocument();
    expect(screen.getByText("Receita Mensal")).toBeInTheDocument();
    expect(screen.getByText("Taxa de Satisfação")).toBeInTheDocument();
  });

  test("should render action buttons", () => {
    render(<Dashboard />);

    const newPatientButton = screen.getByText("Novo Paciente");
    const newAppointmentButton = screen.getByText("Novo Agendamento");

    expect(newPatientButton).toBeInTheDocument();
    expect(newAppointmentButton).toBeInTheDocument();
  });

  test("should render quick actions section", () => {
    render(<Dashboard />);

    const quickActionsTitle = screen.getByText("Ações Rápidas");
    expect(quickActionsTitle).toBeInTheDocument();

    // Check for quick action buttons
    expect(screen.getByText("Gerenciar Pacientes")).toBeInTheDocument();
    expect(screen.getByText("Ver Agenda")).toBeInTheDocument();
    expect(screen.getByText("Relatórios Financeiros")).toBeInTheDocument();
    expect(screen.getByText("Configurações")).toBeInTheDocument();
  });

  test("should render recent activities section", () => {
    render(<Dashboard />);

    const recentActivitiesTitle = screen.getByText("Atividades Recentes");
    expect(recentActivitiesTitle).toBeInTheDocument();

    // Check for sample activities
    expect(screen.getByText("Nova consulta agendada")).toBeInTheDocument();
    expect(screen.getByText("Ana Silva")).toBeInTheDocument();
    expect(screen.getByText("Botox realizado")).toBeInTheDocument();
    expect(screen.getByText("Carlos Santos")).toBeInTheDocument();
  });

  test("should render all icons correctly", () => {
    render(<Dashboard />);

    expect(screen.getByTestId("users-icon")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();
    expect(screen.getByTestId("trending-up-icon")).toBeInTheDocument();
    expect(screen.getByTestId("dollar-icon")).toBeInTheDocument();
  });

  test("should handle button clicks without errors", () => {
    render(<Dashboard />);

    const newPatientButton = screen.getByText("Novo Paciente");
    const newAppointmentButton = screen.getByText("Novo Agendamento");

    // These should not throw errors (no actual navigation implemented yet)
    fireEvent.click(newPatientButton);
    fireEvent.click(newAppointmentButton);

    expect(newPatientButton).toBeInTheDocument();
    expect(newAppointmentButton).toBeInTheDocument();
  });

  test("should render with correct accessibility attributes", () => {
    render(<Dashboard />);

    const titleElement = screen.getByText("Dashboard Executivo");
    expect(titleElement.tagName).toBe("H1");

    // Check that buttons are properly rendered
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  test("should render monthly growth indicators", () => {
    render(<Dashboard />);

    // Check for growth indicators in KPI cards
    expect(screen.getByText("+8.2% vs mês anterior")).toBeInTheDocument();
    expect(screen.getByText("+12.5% vs mês anterior")).toBeInTheDocument();
    expect(screen.getByText("+15.3% vs mês anterior")).toBeInTheDocument();
    expect(screen.getByText("+2.1% vs mês anterior")).toBeInTheDocument();
  });

  test("should render dashboard with proper layout structure", () => {
    const { container } = render(<Dashboard />);

    // Check for main layout elements
    const mainContainer = container.querySelector("div");
    expect(mainContainer).toHaveClass("min-h-screen");
    expect(mainContainer).toHaveClass("bg-gradient-to-br");
  });

  test("should render with healthcare-specific data", () => {
    render(<Dashboard />);

    // Check for healthcare-specific terms
    expect(screen.getByText("clínica estética")).toBeInTheDocument();
    expect(screen.getByText("Consultas")).toBeInTheDocument();
    expect(screen.getByText("Pacientes")).toBeInTheDocument();
    expect(screen.getByText("Satisfação")).toBeInTheDocument();
  });
});
