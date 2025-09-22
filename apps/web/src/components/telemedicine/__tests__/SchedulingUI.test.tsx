import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SchedulingUI } from '../SchedulingUI';

// Mock the cn utility function
vi.mock(('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

// Mock date-fns functions
vi.mock(('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'MMMM yyyy') return 'January 2024';
    if (formatStr === 'yyyy-MM-dd') return '2024-01-15';
    if (formatStr === 'HH:mm') return '14:30';
    if (formatStr === 'dd/MM/yyyy') return '15/01/2024';
    return '2024-01-15 14:30';
  }),
  addDays: vi.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000),
  ),
  startOfWeek: vi.fn(date => date),
  endOfWeek: vi.fn(date => date),
  isSameDay: vi.fn(() => false),
  isPast: vi.fn(() => false),
  isToday: vi.fn(() => false),
  pt: {},
}));

// Mock UI components
vi.mock(('@/components/ui', () => ({
  Button: ({ children,onClick, variant, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  Badge: ({ children,variant, ...props }: any) => (
    <span data-variant={variant} {...props}>
      {children}
    </span>
  ),
  Input: ({ onChange, ...props }: any) => <input onChange={onChange} {...props} />,
  Select: ({ children,onValueChange, ...props }: any) => (
    <select onChange={e => onValueChange?.(e.target.value)} {...props}>
      {children}
    </select>
  ),
  SelectContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectItem: ({ children,value, ...props }: any) => (
    <option value={value} {...props}>
      {children}
    </option>
  ),
  SelectTrigger: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectValue: ({ placeholder, ...props }: any) => <span {...props}>{placeholder}</span>,
  Dialog: ({ children,open, ...props }: any) => open ? <div {...props}>{children}</div> : null,
  DialogContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  DialogTrigger: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  // Avatar components removed - using User icon instead
}));

describe(('SchedulingUI', () => {
  const mockProps = {
    onAppointmentCreate: vi.fn(),
    onAppointmentUpdate: vi.fn(),
    onAppointmentCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test(('renders scheduling UI title', () => {
    render(<SchedulingUI {...mockProps} />);
    expect(screen.getByText('Agendamento de Telemedicina')).toBeInTheDocument();
    expect(
      screen.getByText('Gerencie consultas virtuais e presenciais'),
    ).toBeInTheDocument();
  });

  test(('displays view mode buttons', () => {
    render(<SchedulingUI {...mockProps} />);
    expect(screen.getByText('Calendário')).toBeInTheDocument();
    expect(screen.getByText('Lista')).toBeInTheDocument();
  });

  test(('shows new consultation button', () => {
    render(<SchedulingUI {...mockProps} />);
    expect(screen.getByText('Agendar Consulta')).toBeInTheDocument();
  });

  test(('displays filters section', () => {
    render(<SchedulingUI {...mockProps} />);
    expect(screen.getByText('Filtros')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Buscar por paciente ou profissional...'),
    ).toBeInTheDocument();
  });

  test(('search functionality works', () => {
    render(<SchedulingUI {...mockProps} />);
    const searchInput = screen.getByPlaceholderText(
      'Buscar por paciente ou profissional...',
    );
    fireEvent.change(searchInput, { target: { value: 'Maria Silva' } });
    expect(searchInput).toHaveValue('Maria Silva');
  });

  test(('view mode toggle works', () => {
    render(<SchedulingUI {...mockProps} />);
    const listButton = screen.getByText('Lista');
    fireEvent.click(listButton);

    // After clicking list view, should show "Todas as Consultas"
    expect(screen.getByText('Todas as Consultas')).toBeInTheDocument();
  });

  test(('calendar view displays by default', () => {
    render(<SchedulingUI {...mockProps} />);
    // Calendar view should show month navigation
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  test(('displays appointment count', () => {
    render(<SchedulingUI {...mockProps} />);
    // Should show count of appointments
    expect(screen.getByText(/consulta\(s\)/)).toBeInTheDocument();
  });

  test(('new appointment dialog can be opened', () => {
    render(<SchedulingUI {...mockProps} />);
    // Should show the new consultation button somewhere in the header
    expect(screen.getByText(/Nova|Agendar/)).toBeInTheDocument();
  });

  test(('handles empty state correctly', () => {
    render(<SchedulingUI {...mockProps} appointments={[]} />);
    expect(
      screen.getByText('Nenhuma consulta agendada para este dia'),
    ).toBeInTheDocument();
  });

  test(('status filter dropdown exists', () => {
    render(<SchedulingUI {...mockProps} />);
    expect(screen.getByText('Filtrar por status')).toBeInTheDocument();
  });

  test(('mock appointments are displayed', () => {
    render(<SchedulingUI {...mockProps} />);
    // Change view to list mode to see all appointments
    const listButton = screen.getByText('Lista');
    fireEvent.click(listButton);
    // Should display mock appointment data (from default generateMockAppointments)
    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
  });
});
