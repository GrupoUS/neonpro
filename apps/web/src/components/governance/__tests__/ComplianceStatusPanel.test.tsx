import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ComplianceStatusPanel } from '../ComplianceStatusPanel';

describe('ComplianceStatusPanel', () => {
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

  it('renders compliance status title', () => {
    renderWithProviders(<ComplianceStatusPanel />);
    expect(screen.getByText('Compliance Status')).toBeInTheDocument();
  });

  it('displays overall score section', () => {
    renderWithProviders(<ComplianceStatusPanel />);
    expect(screen.getByText('Overall Score:')).toBeInTheDocument();
  });

  it('shows HIPAA and LGPD compliance cards', () => {
    renderWithProviders(<ComplianceStatusPanel />);
    expect(screen.getByText('HIPAA Compliance')).toBeInTheDocument();
    expect(screen.getByText('LGPD Compliance')).toBeInTheDocument();
  });
});
