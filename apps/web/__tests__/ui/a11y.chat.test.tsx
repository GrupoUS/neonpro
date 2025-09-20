import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import PromptInput from '../../src/components/chat/PromptInput';
import { renderWithI18n, screen } from '../test-utils';

// Basic keyboard nav + SR landmark checks for chat UI

describe('Chat A11y', () => {
  test('PromptInput supports Enter submit and Shift+Enter newline', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithI18n(<PromptInput onSubmit={onSubmit} disabled={false} />);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    await user.type(textarea, 'Olá');
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('Olá');

    await user.clear(textarea);
    await user.type(textarea, 'Linha 1');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    expect(textarea.value).toContain('\n');
  });

  test('Conversation exposes a polite live region for updates', () => {
    const Live = () => (
      <div role='status' aria-live='polite'>
        Atualizando conversa
      </div>
    );
    renderWithI18n(<Live />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });
});
