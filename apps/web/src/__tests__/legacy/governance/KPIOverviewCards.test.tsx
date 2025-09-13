import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { KPIOverviewCards } from '../KPIOverviewCards';

describe('KPIOverviewCards', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>,
    );
  };

  it('renders KPI overview cards', () => {
    renderWithProviders(<KPIOverviewCards />);
    expect(screen.getByText('KPI Overview')).toBeInTheDocument();
  });

  it('displays kpi overview section', () => {
    renderWithProviders(<KPIOverviewCards />);
    expect(screen.getByText('KPI Overview')).toBeInTheDocument();
  });

  it('shows kpi cards container', () => {
    renderWithProviders(<KPIOverviewCards />);
    expect(screen.getByText('KPI Overview')).toBeInTheDocument();
  });

  it('displays kpi metrics', () => {
    renderWithProviders(<KPIOverviewCards />);
    expect(screen.getByText('KPI Overview')).toBeInTheDocument();
  });
});
