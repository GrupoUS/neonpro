import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PatientRegistrationWizard } from '../PatientRegistrationWizard';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('PatientRegistrationWizard', () => {
  const defaultProps = {
    open: true,
    onOpenChange: () => {},
    clinicId: 'test-clinic-id',
    onPatientCreated: () => {},
  };

  it('renders the wizard with first step active', () => {
    render(<PatientRegistrationWizard {...defaultProps} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Cadastrar Novo Paciente')).toBeInTheDocument();
    expect(screen.getByText('Etapa 1 de 5')).toBeInTheDocument();
    expect(screen.getByText('Informações Básicas')).toBeInTheDocument();
  });
});
