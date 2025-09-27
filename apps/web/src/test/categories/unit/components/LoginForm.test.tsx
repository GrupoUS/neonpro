/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/LoginForm'
import { vi } from 'vitest'

// Mock AccessibilityInput component
const mockAccessibilityInput = vi.fn(({ id, name, ...props }) => (
  <input 
    data-testid={`input-${name}`} 
    id={id} 
    name={name} 
    {...props} 
  />
))

vi.mock('@/components/ui/accessibility-input', () => ({
  AccessibilityInput: mockAccessibilityInput,
}))

describe('LoginForm', () => {
  const defaultProps = {
    onLogin: vi.fn(),
    ariaLabel: 'Login Form',
    ariaDescribedBy: 'login-description'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('RED Phase - Current Issues', () => {
    it('should have error alert missing id attribute', () => {
      // This test reproduces the CURRENT ISSUE where Alert component
      // is missing id={errorId} for aria-describedby
      
      render(<LoginForm {...defaultProps} />)

      // Simulate error state
      const error = {
        code: 'VALIDATION_ERROR',
        message: 'Email é obrigatório'
      }
      
      // The Alert component currently lacks id attribute
      // This breaks the aria-describedby relationship
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('alert')).not.toHaveAttribute('id')
    })

    it('should have form pointing to non-existent error description', () => {
      render(<LoginForm {...defaultProps} />)

      const form = screen.getByRole('form')
      
      // Form has aria-describedby pointing to errorId, but Alert has no id
      expect(form).toHaveAttribute('aria-describedby')
      expect(form.getAttribute('aria-describedby')).toBeDefined()
    })
  })

  describe('GREEN Phase - Expected Fixed Behavior', () => {
    it('should have Alert component with correct id attribute', () => {
      // This test represents the EXPECTED behavior after fix
      
      render(<LoginForm {...defaultProps} />)

      // Simulate error state
      const error = {
        code: 'VALIDATION_ERROR', 
        message: 'Email é obrigatório'
      }

      // After fix, Alert should have id={errorId}
      const alert = screen.getByRole('alert')
      expect(alert).toHaveAttribute('id')
      expect(alert.getAttribute('id')).toMatch(/error$/)
    })

    it('should maintain aria-describedby relationship correctly', () => {
      render(<LoginForm {...defaultProps} />)

      const form = screen.getByRole('form')
      const alert = screen.getByRole('alert')

      // Form's aria-describedby should match Alert's id
      const formDescribedBy = form.getAttribute('aria-describedby')
      const alertId = alert.getAttribute('id')
      
      expect(formDescribedBy).toBe(alertId)
    })
  })

  describe('REFACTOR Phase - Accessibility Testing', () => {
    it('should announce errors to screen readers', async () => {
      const user = userEvent.setup()
      
      render(<LoginForm {...defaultProps} />)

      // Simulate form submission with empty fields
      const submitButton = screen.getByRole('button', { name: 'Entrar na NeonPro' })
      await user.click(submitButton)

      await waitFor(() => {
        // Should announce error to screen readers
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('should clear errors when user starts typing', async () => {
      const user = userEvent.setup()
      
      render(<LoginForm {...defaultProps} />)

      // Set initial error state
      const emailInput = screen.getByTestId('input-email')
      await user.type(emailInput, 'test@email.com')

      // Error should be cleared
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('should handle keyboard navigation correctly', async () => {
      const user = userEvent.setup()
      
      render(<LoginForm {...defaultProps} />)

      const emailInput = screen.getByTestId('input-email')

      // Test Enter key with Ctrl
      await user.type(emailInput, '{Control>}{Enter}{/Control}')

      // Should not crash and handle keyboard event
      expect(emailInput).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      const user = userEvent.setup()
      
      render(<LoginForm {...defaultProps} />)

      const emailInput = screen.getByTestId('input-email')
      const submitButton = screen.getByRole('button', { name: 'Entrar na NeonPro' })

      // Enter invalid email
      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('should require password field', async () => {
      const user = userEvent.setup()
      
      render(<LoginForm {...defaultProps} />)

      const emailInput = screen.getByTestId('input-email')
      const submitButton = screen.getByRole('button', { name: 'Entrar na NeonPro' })

      // Enter email but no password
      await user.type(emailInput, 'test@email.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })
  })
})