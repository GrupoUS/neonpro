import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithI18n as render, screen } from '../test-utils';

import { ContextInput } from '@/components/chat/ContextInput';

describe('Context input (T019)', () => {
  test('optional note and scoped usage', async () => {
    const onChange = vi.fn();
    render(<ContextInput value='' onChange={onChange} />);

    const textarea = screen.getByPlaceholderText(/contexto opcional/i);
    await userEvent.type(textarea, 'Pré-condições: sem alergias.');
    expect(onChange).toHaveBeenCalledWith('Pré-condições: sem alergias.');

    // scope checkbox (use for next message only)
    await userEvent.click(screen.getByRole('checkbox', { name: /usar apenas na próxima/i }));
    expect(onChange).toHaveBeenCalledWith('Pré-condições: sem alergias.');
  });
});
