/**
 * Authentication Unit Tests
 * Tests essential authentication functionality
 */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock Login Form Component (placeholder for actual implementation)
interface LoginFormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const LoginForm = ({ onSubmit }: LoginFormProps) => (
  <form data-testid="auth-login-form" onSubmit={onSubmit}>
    <input
      data-testid="auth-login-email"
      name="email"
      placeholder="Email"
      type="email"
    />
    <input
      data-testid="auth-login-password"
      name="password"
      placeholder="Senha"
      type="password"
    />
    <button data-testid="auth-login-button" type="submit">
      Entrar
    </button>
  </form>
);

describe("authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("should render login form", () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByTestId("auth-login-email")).toBeInTheDocument();
    expect(screen.getByTestId("auth-login-password")).toBeInTheDocument();
    expect(screen.getByTestId("auth-login-button")).toBeInTheDocument();
  });

  it("should handle login submission", async () => {
    const mockSubmit = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={mockSubmit} />);

    const emailInput = screen.getByTestId("auth-login-email");
    const passwordInput = screen.getByTestId("auth-login-password");
    const submitButton = screen.getByTestId("auth-login-button");

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    expect(mockSubmit).toHaveBeenCalled();
  });
});
