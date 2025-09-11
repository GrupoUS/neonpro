import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

describe('AuthForm', () => {
  it('switches between modes', async () => {
    render(<AuthForm />);

    // default: sign-in visible
    expect(screen.getByRole('tab', { name: /Entrar/i, selected: true })).toBeInTheDocument();

    // go to sign-up
    await userEvent.click(screen.getByRole('tab', { name: /Criar conta/i }));
    expect(screen.getByRole('tab', { name: /Criar conta/i, selected: true })).toBeInTheDocument();

    // go to forgot
    await userEvent.click(screen.getByRole('tab', { name: /Recuperar/i }));
    expect(screen.getByRole('tab', { name: /Recuperar/i, selected: true })).toBeInTheDocument();
  });
});
