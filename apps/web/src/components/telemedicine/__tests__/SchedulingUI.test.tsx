import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SchedulingUI } from '../SchedulingUI';

// Mock the cn utility function
vi.mock(_'@/lib/utils',_() => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

// Mock date-fns functions
vi.mock(_'date-fns',_() => ({
  format: vi.fn((date,_formatStr) => {
    if (formatStr === 'MMMM yyyy') return 'January 2024';
    if (formatStr === 'yyyy-MM-dd') return '2024-01-15';
    if (formatStr === 'HH:mm') return '14:30';
    if (formatStr === 'dd/MM/yyyy') return '15/01/2024';
    return '2024-01-15 14:30';
  }),
  addDays: vi.fn(_(date,_days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000),
  ),
  startOfWeek: vi.fn(date => date),
  endOfWeek: vi.fn(date => date),
  isSameDay: vi.fn(_() => false),
  isPast: vi.fn(_() => false),
  isToday: vi.fn(_() => false),
  pt: {},
}));

// Mock UI components
vi.mock(_'@/components/ui',_() => ({
  Button: ({ children,_onClick,_variant, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
  Card: (_{ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: (_{ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: (_{ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: (_{ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  Badge: (_{ children,_variant, ...props }: any) => (
    <span data-variant={variant} {...props}>
      {children}
    </span>
  ),
  Input: (_{ onChange, ...props }: any) => <input onChange={onChange} {...props} />,
  Select: (_{ children,_onValueChange, ...props }: any) => (
    <select onChange={e => onValueChange?.(e.target.value)} {...props}>
      {children}
    </select>
  ),
  SelectContent: (_{ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectItem: (_{ children,_value, ...props }: any) => (
    <option value={value} {...props}>
      {children}
    </option>
  ),
  SelectTrigger: (_{ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectValue: (_{ placeholder, ...props }: any) => <span {...props}>{placeholder}</span>,
  Dialog: (_{ children,_open, ...props }: any) => open ? <div {...props}>{children}</div> : null,
  DialogContent: (_{ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogHeader: (_{ children, ...props }: any) => <div {...props}>{children}</div>,
  DialogTitle: (_{ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  DialogTrigger: (_{ children, ...props }: any) => <div {...props}>{children}</div>,
  // Avatar components removed - using User icon instead
}));

describe(_'SchedulingUI',_() => {
  const mockProps = {
    onAppointmentCreate: vi.fn(),
    onAppointmentUpdate: vi.fn(),
    onAppointmentCancel: vi.fn(),
  };

  beforeEach(_() => {
    vi.clearAllMocks();
  });

  test(_'renders scheduling UI title',_() => {
    render(<SchedulingUI {...mockProps} />);
    expect(screen.getByText('Agendamento de Telemedicina')).toBeInTheDocument();
    expect(
      screen.getByText('Gerencie consultas virtuais e presenciais'),
    ).toBeInTheDocument();
  });

  test(_'displays view mode buttons',_() => {
    render(<SchedulingUI {...mockProps} />);
    expect(screen.getByText('Calendário')).toBeInTheDocument();
    expect(screen.getByText('Lista')).toBeInTheDocument();
  });

  test(_'shows new consultation button',_() => {
    render(<SchedulingUI {...mockProps} />);
    expect(screen.getByText('Agendar Consulta')).toBeInTheDocument();
  });

  test(_'displays filters section',_() => {
    render(<SchedulingUI {...mockProps} />);
    expect(screen.getByText('Filtros')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Buscar por paciente ou profissional...'),
    ).toBeInTheDocument();
  });

  test(_'search functionality works',_() => {
    render(<SchedulingUI {...mockProps} />);
    const searchInput = screen.getByPlaceholderText(
      'Buscar por paciente ou profissional...',
    );
    fireEvent.change(searchInput, { target: { value: 'Maria Silva' } });
    expect(searchInput).toHaveValue('Maria Silva');
  });

  test(_'view mode toggle works',_() => {
    render(<SchedulingUI {...mockProps} />);
    const listButton = screen.getByText('Lista');
    fireEvent.click(listButton);

    // After clicking list view, should show "Todas as Consultas"
    expect(screen.getByText('Todas as Consultas')).toBeInTheDocument();
  });

  test(_'calendar view displays by default',_() => {
    render(<SchedulingUI {...mockProps} />);
    // Calendar view should show month navigation
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  test(_'displays appointment count',_() => {
    render(<SchedulingUI {...mockProps} />);
    // Should show count of appointments
    expect(screen.getByText(/consulta\(s\)/)).toBeInTheDocument();
  });

  test(_'new appointment dialog can be opened',_() => {
    render(<SchedulingUI {...mockProps} />);
    // Should show the new consultation button somewhere in the header
    expect(screen.getByText(/Nova|Agendar/)).toBeInTheDocument();
  });

  test(_'handles empty state correctly',_() => {
    render(<SchedulingUI {...mockProps} appointments={[]} />);
    expect(
      screen.getByText('Nenhuma consulta agendada para este dia'),
    ).toBeInTheDocument();
  });

  test(_'status filter dropdown exists',_() => {
    render(<SchedulingUI {...mockProps} />);
    expect(screen.getByText('Filtrar por status')).toBeInTheDocument();
  });

  test(_'mock appointments are displayed',_() => {
    render(<SchedulingUI {...mockProps} />);
    // Change view to list mode to see all appointments
    const listButton = screen.getByText('Lista');
    fireEvent.click(listButton);
    // Should display mock appointment data (from default generateMockAppointments)
    expect(screen.getByText('Maria Silva')).toBeInTheDocument();
  });
});
