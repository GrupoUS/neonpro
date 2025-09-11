import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { RiskAssessmentTable } from '../RiskAssessmentTable';

describe('RiskAssessmentTable', () => {
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

  it('renders risk assessment title', () => {
    renderWithProviders(<RiskAssessmentTable />);
    expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
  });

  it('displays risk table headers', () => {
    renderWithProviders(<RiskAssessmentTable />);
    expect(screen.getByText('Risk ID')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Severity')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Assignee')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
  });

  it('has proper table structure', () => {
    renderWithProviders(<RiskAssessmentTable />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
