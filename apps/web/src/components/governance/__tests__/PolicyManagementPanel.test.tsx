import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PolicyManagementPanel } from '../PolicyManagementPanel';

describe('PolicyManagementPanel', () => {
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

  it('renders policy management title', () => {
    renderWithProviders(<PolicyManagementPanel />);
    expect(screen.getByText('Policy Management')).toBeInTheDocument();
  });

  it('displays policy details section', () => {
    renderWithProviders(<PolicyManagementPanel />);
    expect(screen.getByText('Policy Details')).toBeInTheDocument();
  });

  it('has proper table structure', () => {
    renderWithProviders(<PolicyManagementPanel />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
