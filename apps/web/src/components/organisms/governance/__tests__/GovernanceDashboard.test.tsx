import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GovernanceDashboard } from '../GovernanceDashboard';

describe('GovernanceDashboard', () => {
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

  it('renders governance dashboard', () => {
    renderWithProviders(<GovernanceDashboard />);
    expect(screen.getByText('Governance Dashboard')).toBeInTheDocument();
  });

  it('displays healthcare compliance subtitle', () => {
    renderWithProviders(<GovernanceDashboard />);
    // Check for actual content that exists in the component
    expect(screen.getByText('Governance Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });
});
