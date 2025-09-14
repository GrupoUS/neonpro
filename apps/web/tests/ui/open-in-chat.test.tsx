import { renderWithI18n as render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { OpenInChat } from '@/components/chat/OpenInChat';

describe('Open-in-Chat (T020)', () => {
  test('prefills from pages', async () => {
    const onOpen = vi.fn();
    render(<OpenInChat getPrefill={() => 'Saldo do paciente #123'} onOpen={onOpen} />);

    await userEvent.click(screen.getByRole('button', { name: /abrir no chat/i }));
    expect(onOpen).toHaveBeenCalledWith('Saldo do paciente #123');
  });
});
