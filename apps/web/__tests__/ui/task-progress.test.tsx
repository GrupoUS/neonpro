import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithI18n as render, screen } from '../test-utils';

import { TaskProgress } from '@/components/chat/TaskProgress';

describe('Task Progress (T016)', () => {
  test('shows staged progress and cancel works', async () => {
    const onCancel = vi.fn();
    const { rerender } = render(
      <TaskProgress stage='queued' percent={0} onCancel={onCancel} />,
      { i18n: { locale: 'en-US' } },
    );

    expect(screen.getByText(/queued/i)).toBeInTheDocument();

    rerender(<TaskProgress stage='running' percent={45} onCancel={onCancel} />);
    expect(screen.getByText(/45%/)).toBeInTheDocument(); // percent text is locale-independent

    rerender(
      <TaskProgress stage='completed' percent={100} onCancel={onCancel} />,
    );
    expect(screen.getByText(/completed/i)).toBeInTheDocument();

    // Cancel should be clickable when not completed
    rerender(<TaskProgress stage='running' percent={60} onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
