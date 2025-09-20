import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithI18n as render, screen } from '../test-utils';

import { Conversation } from '@/components/chat/Conversation';

describe('Conversation thread (T018)', () => {
  test('renders list and can reset history', async () => {
    const messages = [
      { id: '1', role: 'user', text: 'Olá' },
      { id: '2', role: 'assistant', text: 'Como posso ajudar?' },
    ];
    const onReset = vi.fn();

    render(<Conversation messages={messages as any} onReset={onReset} />, {
      i18n: { locale: 'en-US' },
    });

    expect(screen.getByText('Olá')).toBeInTheDocument();
    expect(screen.getByText('Como posso ajudar?')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /reset history|limpar histórico/i }),
    );
    expect(onReset).toHaveBeenCalled();
  });
});
