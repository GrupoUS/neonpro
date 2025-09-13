import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuditTrailTable } from '../AuditTrailTable';

describe('AuditTrailTable', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>,
    );
  };

  it('renders audit trail component', () => {
    renderWithProviders(<AuditTrailTable />);
    expect(screen.getByText('Audit Trail')).toBeInTheDocument();
  });

  it('displays audit trail description', () => {
    renderWithProviders(<AuditTrailTable />);
    expect(
      screen.getByText('HIPAA/LGPD compliant access monitoring with comprehensive PHI tracking'),
    ).toBeInTheDocument();
  });

  it('has search functionality', () => {
    renderWithProviders(<AuditTrailTable />);
    expect(screen.getByPlaceholderText('Search audit logs...')).toBeInTheDocument();
  });

  it('has filter dropdowns', () => {
    renderWithProviders(<AuditTrailTable />);
    expect(screen.getByText('All Actions')).toBeInTheDocument();
    expect(screen.getByText('All Status')).toBeInTheDocument();
    expect(screen.getByText('All Risk Levels')).toBeInTheDocument();
  });
});
