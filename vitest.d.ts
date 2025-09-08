/**
 * Vitest Type Definitions - Global Types for NeonPro Healthcare
 * Configures TypeScript to recognize Vitest globals and custom matchers
 */

/// <reference types="vitest" />
/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

declare global {
  namespace Vi {
    type AsymmetricMatchersContaining = {
      toBeInTheDocument: () => void
      toHaveClass: (className: string,) => void
      toHaveAttribute: (attribute: string, value?: string,) => void
      toHaveTextContent: (text: string,) => void
      toBeVisible: () => void
      toBeDisabled: () => void
      toBeEnabled: () => void
      toHaveValue: (value: string | number,) => void
    }
  }
}

export {}
