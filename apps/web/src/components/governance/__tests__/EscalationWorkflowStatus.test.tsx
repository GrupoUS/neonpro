import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EscalationWorkflowStatus } from '../EscalationWorkflowStatus';

describe('EscalationWorkflowStatus', () => {
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

  it('renders escalation workflow title', () => {
    renderWithProviders(<EscalationWorkflowStatus />);
    expect(screen.getByText('Escalation Workflow')).toBeInTheDocument();
  });

  it('displays active escalations section', () => {
    renderWithProviders(<EscalationWorkflowStatus />);
    expect(screen.getByText('Active Escalations')).toBeInTheDocument();
  });

  it('has proper table structure', () => {
    renderWithProviders(<EscalationWorkflowStatus />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
