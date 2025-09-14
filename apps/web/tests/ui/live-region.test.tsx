import { renderWithI18n as render, screen } from '../test-utils';
import React from 'react';

import { TaskProgress } from '@/components/chat/TaskProgress';
import { ReasoningSummary } from '@/components/chat/ReasoningSummary';

// T048 — a11y: streaming/live regions announce politely

describe('Live regions announce politely (T048)', () => {
  test('TaskProgress uses role=status with aria-live=polite', () => {
    render(<TaskProgress stage="queued" percent={0} onCancel={() => {}} />);
    const status = screen.getByRole('status', { name: /status/i });
    expect(status).toBeInTheDocument();
    // aria-live should be polite (checked via attribute)
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  test('ReasoningSummary content is wrapped in a polite live region when open', async () => {
    render(<ReasoningSummary summarized="Resumo de raciocínio" />);
    // Toggle to open
    await (await import('@testing-library/user-event')).default.click(screen.getByRole('button', { name: /mostrar raciocínio/i }));
    // When open, there should be a polite live region element
    expect(screen.getByText('Resumo de raciocínio').closest('[aria-live="polite"]')).toBeTruthy();
  });
});
