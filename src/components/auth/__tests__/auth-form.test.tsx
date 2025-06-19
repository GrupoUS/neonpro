/**
 * Auth Form Component Tests
 * Tests for accessibility, functionality, and design system compliance
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthForm } from '../auth-form';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('AuthForm Component', () => {
  beforeEach(() => {
    render(<AuthForm />);
  });

  describe('Accessibility Tests', () => {
    test('should have proper ARIA labels for toggle buttons', () => {
      const signInTab = screen.getByRole('tab', { name: /sign in/i });
      const signUpTab = screen.getByRole('tab', { name: /sign up/i });
      
      expect(signInTab).toHaveAttribute('aria-selected', 'true');
      expect(signUpTab).toHaveAttribute('aria-selected', 'false');
      expect(signInTab).toHaveAttribute('aria-controls', 'auth-form-panel');
      expect(signUpTab).toHaveAttribute('aria-controls', 'auth-form-panel');
    });

    test('should have proper labels for form inputs', () => {
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
    });

    test('should have accessible password toggle button', () => {
      const toggleButton = screen.getByLabelText(/show password/i);
      
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
    });

    test('should have proper form labels', () => {
      const signInForm = screen.getByLabelText(/sign in form/i);
      expect(signInForm).toBeInTheDocument();
    });
  });

  describe('Functionality Tests', () => {
    test('should toggle between sign in and sign up forms', async () => {
      const user = userEvent.setup();
      const signUpTab = screen.getByRole('tab', { name: /sign up/i });
      
      await user.click(signUpTab);
      
      expect(signUpTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/clinic name/i)).toBeInTheDocument();
    });

    test('should toggle password visibility', async () => {
      const user = userEvent.setup();
      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByLabelText(/show password/i);
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      await user.click(toggleButton);
      
      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
      expect(toggleButton).toHaveAttribute('aria-label', 'Hide password');
    });

    test('should validate required fields', async () => {
      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.click(submitButton);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });
  });

  describe('Design System Compliance Tests', () => {
    test('should use GRUPO US color palette classes', () => {
      const brandingSection = document.querySelector('.bg-gradient-primary');
      expect(brandingSection).toBeInTheDocument();
    });

    test('should have proper focus states', () => {
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveClass('focus:ring-primary');
    });

    test('should use correct typography classes', () => {
      const title = screen.getByText(/welcome back/i);
      expect(title).toHaveClass('text-foreground');
    });
  });

  describe('Responsive Design Tests', () => {
    test('should show mobile logo on small screens', () => {
      const mobileLogoSection = document.querySelector('.lg\\:hidden');
      expect(mobileLogoSection).toBeInTheDocument();
    });

    test('should hide branding section on small screens', () => {
      const brandingSection = document.querySelector('.hidden.lg\\:flex');
      expect(brandingSection).toBeInTheDocument();
    });
  });

  describe('Loading States Tests', () => {
    test('should show loading state when submitting', async () => {
      const user = userEvent.setup();
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });
});
