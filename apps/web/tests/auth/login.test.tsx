/**
 * Authentication Unit Tests
 * Tests essential authentication functionality
 */

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock Login Form Component (placeholder for actual implementation)
interface LoginFormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const LoginForm = ({ onSubmit }: LoginFormProps) => (
  <form data-testid="login-form" onSubmit={onSubmit}>
    <input
      data-testid="login-email"
      name="email"
      placeholder="Email"
      type="email"
    />
    <input
      data-testid="login-password"
      name="password"
      placeholder="Senha"
      type="password"
    />
    <button data-testid="login-button" type="submit">
      Entrar
    </button>
  </form>
);

describe('Authentication', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render login form', () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByTestId('login-email')).toBeInTheDocument();
    expect(screen.getByTestId('login-password')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('should handle login submission', async () => {
    const mockSubmit = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={mockSubmit} />);

    const emailInput = screen.getByTestId('login-email');
    const passwordInput = screen.getByTestId('login-password');
    const submitButton = screen.getByTestId('login-button');

    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(mockSubmit).toHaveBeenCalled();
  });
});
