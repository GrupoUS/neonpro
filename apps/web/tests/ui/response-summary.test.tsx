import { renderWithI18n as render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ResponseSummary } from '@/components/chat/ResponseSummary';

describe('Response summaries (T022)', () => {
  test('shows freshness and refine actions', async () => {
    const onRefine = vi.fn();
    render(
      <ResponseSummary
        summary="Resumo atualizado há 2 min"
        lastUpdated={Date.now() - 2 * 60 * 1000}
        onRefine={onRefine}
      />
    );

    expect(screen.getByText(/atualizado há/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /refinar/i }));
    expect(onRefine).toHaveBeenCalled();
  });
});
