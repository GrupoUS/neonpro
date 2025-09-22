/**
 * Accessible Patient Card Component Tests
 * T081 - WCAG 2.1 AA+ Accessibility Compliance
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessiblePatientCard } from '../AccessiblePatientCard';

// Mock the accessibility hooks
vi.mock(('../../hooks/useAccessibility', () => ({
  useAccessibilityPreferences: () => ({
    prefersHighContrast: false,
    prefersReducedMotion: false,
  }),
  useScreenReaderAnnouncement: () => ({
    announceHealthcareData: vi.fn(),
  }),
}));

const mockPatient = {
  id: '1',
  name: 'João Silva',
  email: 'joao@example.com',
  phone: '(11) 99999-9999',
  birthDate: new Date('1990-01-15'),
  lastAppointment: new Date('2024-01-10'),
  status: 'active' as const,
  lgpdConsent: true,
};

describe(('AccessiblePatientCard', () => {
  const mockOnClick = vi.fn();
  const mockOnKeyboardSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(('should render patient information correctly', () => {
    render(
      <AccessiblePatientCard
        patient={mockPatient}
        onClick={mockOnClick}
        showSensitiveData={true}
      />,
    );

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Ativo')).toBeInTheDocument();
    expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument();
    expect(screen.getByText(/\d+ anos/)).toBeInTheDocument();
  });

  it(('should have proper ARIA attributes', () => {
    render(
      <AccessiblePatientCard
        patient={mockPatient}
        onClick={mockOnClick}
      />,
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-selected', 'false');
    expect(card).toHaveAttribute('aria-describedby');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it(('should indicate selected state correctly', () => {
    render(
      <AccessiblePatientCard
        patient={mockPatient}
        onClick={mockOnClick}
        isSelected={true}
      />,
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-selected', 'true');
    expect(card).toHaveClass('ring-2', 'ring-primary');
  });

  it(('should show LGPD consent status', () => {
    render(
      <AccessiblePatientCard
        patient={mockPatient}
        onClick={mockOnClick}
      />,
    );

    const consentIndicator = screen.getByLabelText(/Consentimento LGPD: Concedido/);
    expect(consentIndicator).toBeInTheDocument();
    expect(consentIndicator).toHaveClass('bg-green-500');
  });

  it(('should show LGPD consent denied status', () => {
    const patientWithoutConsent = { ...mockPatient, lgpdConsent: false };

    render(
      <AccessiblePatientCard
        patient={patientWithoutConsent}
        onClick={mockOnClick}
      />,
    );

    const consentIndicator = screen.getByLabelText(/Consentimento LGPD: Não concedido/);
    expect(consentIndicator).toBeInTheDocument();
    expect(consentIndicator).toHaveClass('bg-red-500');
  });

  it(('should hide sensitive data when showSensitiveData is false', () => {
    render(
      <AccessiblePatientCard
        patient={mockPatient}
        onClick={mockOnClick}
        showSensitiveData={false}
      />,
    );

    expect(screen.queryByText('(11) 99999-9999')).not.toBeInTheDocument();
  });

  it(('should handle click events', () => {
    render(
      <AccessiblePatientCard
        patient={mockPatient}
        onClick={mockOnClick}
      />,
    );

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledWith(mockPatient);
  });

  it(('should handle keyboard events', () => {
    render(
      <AccessiblePatientCard
        patient={mockPatient}
        onKeyboardSelect={mockOnKeyboardSelect}
      />,
    );

    const card = screen.getByRole('button');

    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnKeyboardSelect).toHaveBeenCalledWith(mockPatient);

    // Test Space key
    fireEvent.keyDown(card, { key: ' ' });
    expect(mockOnKeyboardSelect).toHaveBeenCalledTimes(2);
  });

  it(('should display different status colors', () => {
    const inactivePatient = { ...mockPatient, status: 'inactive' as const };

    const { rerender } = render(
      <AccessiblePatientCard
        patient={mockPatient}
        onClick={mockOnClick}
      />,
    );

    expect(screen.getByText('Ativo')).toHaveClass('text-green-700');

    rerender(
      <AccessiblePatientCard
        patient={inactivePatient}
        onClick={mockOnClick}
      />,
    );

    expect(screen.getByText('Inativo')).toHaveClass('text-gray-600');
  });

  it(('should calculate age correctly', () => {
    const youngPatient = {
      ...mockPatient,
      birthDate: new Date('2000-06-15'),
    };

    render(
      <AccessiblePatientCard
        patient={youngPatient}
        onClick={mockOnClick}
      />,
    );

    // Age should be calculated based on current date
    expect(screen.getByText(/\d+ anos/)).toBeInTheDocument();
  });

  it(('should format last appointment date', () => {
    render(
      <AccessiblePatientCard
        patient={mockPatient}
        onClick={mockOnClick}
      />,
    );

    expect(screen.getByText(/Último agendamento: \d{2}\/\d{2}\/\d{4}/)).toBeInTheDocument();
  });

  it(('should have screen reader friendly content', () => {
    render(
      <AccessiblePatientCard
        patient={mockPatient}
        onClick={mockOnClick}
        showSensitiveData={true}
      />,
    );

    const card = screen.getByRole('button');
    const ariaLabel = card.getAttribute('aria-label');

    expect(ariaLabel).toContain('Paciente: João Silva');
    expect(ariaLabel).toContain('Status: Ativo');
    expect(ariaLabel).toContain('Telefone: (11) 99999-9999');
    expect(ariaLabel).toContain('Consentimento LGPD: Sim');
  });
});

describe(('AccessiblePatientList', () => {
  const mockPatients = [
    mockPatient,
    {
      id: '2',
      name: 'Maria Santos',
      status: 'pending' as const,
      lgpdConsent: false,
    },
  ];

  const mockOnPatientSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(('should render list of patients', () => {
    render(
      <AccessiblePatientList
        patients={mockPatients}
        onPatientSelect={mockOnPatientSelect}
      />,
    );

    expect(screen.getByText('João Silva')).toBeInTheDocument();
    expect(screen.getByText('Maria Santos')).toBeInTheDocument();
  });

  it(('should have proper list ARIA attributes', () => {
    render(
      <AccessiblePatientList
        patients={mockPatients}
        onPatientSelect={mockOnPatientSelect}
      />,
    );

    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('aria-label', 'Lista de pacientes. 2 pacientes encontrados.');

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);

    expect(listItems[0]).toHaveAttribute('aria-setsize', '2');
    expect(listItems[0]).toHaveAttribute('aria-posinset', '1');
    expect(listItems[1]).toHaveAttribute('aria-posinset', '2');
  });

  it(('should handle patient selection', () => {
    render(
      <AccessiblePatientList
        patients={mockPatients}
        onPatientSelect={mockOnPatientSelect}
        selectedPatientId='1'
      />,
    );

    const firstPatientCard = screen.getByLabelText(/Paciente: João Silva/);
    fireEvent.click(firstPatientCard);

    expect(mockOnPatientSelect).toHaveBeenCalledWith(mockPatient);
  });

  it(('should show selected patient correctly', () => {
    render(
      <AccessiblePatientList
        patients={mockPatients}
        onPatientSelect={mockOnPatientSelect}
        selectedPatientId='1'
      />,
    );

    const selectedCard = screen.getByLabelText(/Paciente: João Silva/);
    expect(selectedCard).toHaveAttribute('aria-selected', 'true');
    expect(selectedCard).toHaveClass('ring-2', 'ring-primary');
  });

  it(('should show empty state when no patients', () => {
    render(
      <AccessiblePatientList
        patients={[]}
        onPatientSelect={mockOnPatientSelect}
      />,
    );

    const emptyMessage = screen.getByRole('status');
    expect(emptyMessage).toHaveTextContent('Nenhum paciente encontrado.');
    expect(emptyMessage).toHaveAttribute('aria-live', 'polite');
  });

  it(('should pass showSensitiveData prop to cards', () => {
    render(
      <AccessiblePatientList
        patients={mockPatients}
        onPatientSelect={mockOnPatientSelect}
        showSensitiveData={true}
      />,
    );

    // Should show phone number when showSensitiveData is true
    expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument();
  });

  it(('should hide sensitive data when showSensitiveData is false', () => {
    render(
      <AccessiblePatientList
        patients={mockPatients}
        onPatientSelect={mockOnPatientSelect}
        showSensitiveData={false}
      />,
    );

    // Should not show phone number when showSensitiveData is false
    expect(screen.queryByText('(11) 99999-9999')).not.toBeInTheDocument();
  });
});
