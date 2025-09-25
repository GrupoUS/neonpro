import { expect } from 'vitest'

// Custom matchers for testing
export const toBeValidEmail = (received: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const pass = emailRegex.test(received)

  return {
    message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid email address`,
    pass,
  }
}

export const toBeValidPhone = (received: string) => {
  // Brazilian phone number validation
  const phoneRegex = /^\+55\s?\d{2}\s?\d{4,5}-?\d{4}$/
  const pass = phoneRegex.test(received)

  return {
    message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid Brazilian phone number`,
    pass,
  }
}

export const toBeValidCPF = (received: string) => {
  // Basic CPF validation (11 digits, no check digit validation)
  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
  const pass = cpfRegex.test(received)

  return {
    message: () => `expected ${received} ${pass ? 'not ' : ''}to be a valid CPF format`,
    pass,
  }
}

export const toHaveLoadingState = (received: any) => {
  const pass = received && typeof received.isLoading === 'boolean'

  return {
    message: () => `expected component ${pass ? 'not ' : ''}to have loading state`,
    pass,
  }
}

export const toHaveErrorState = (received: any) => {
  const pass = received && typeof received.error !== 'undefined'

  return {
    message: () => `expected component ${pass ? 'not ' : ''}to have error state`,
    pass,
  }
}

// Register custom matchers
expect.extend({
  toBeValidEmail,
  toBeValidPhone,
  toBeValidCPF,
  toHaveLoadingState,
  toHaveErrorState,
})

// Type definitions for custom matchers
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidEmail(): void
    toBeValidPhone(): void
    toBeValidCPF(): void
    toHaveLoadingState(): void
    toHaveErrorState(): void
  }
}
