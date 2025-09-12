import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AIGovernanceMetrics } from '../AIGovernanceMetrics';

describe('AIGovernanceMetrics', () => {
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

  it('renders AI governance title', () => {
    renderWithProviders(<AIGovernanceMetrics />);
    expect(screen.getByText('AI Governance')).toBeInTheDocument();
  });

  it('displays compliance score section', () => {
    renderWithProviders(<AIGovernanceMetrics />);
    expect(screen.getByText('Compliance Score:')).toBeInTheDocument();
  });

  it('shows active models section', () => {
    renderWithProviders(<AIGovernanceMetrics />);
    expect(screen.getByText('Active Models')).toBeInTheDocument();
  });
});
