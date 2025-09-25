/**
 * Minimal UI Component Library
 * Basic types and utilities for healthcare applications
 * @version 1.0.0
 */

// Basic types
export interface BaseComponentProps {
  className?: string
}

export interface ButtonProps extends BaseComponentProps {
  children: string
  onClick?: () => void
  disabled?: boolean
}

export interface InputProps extends BaseComponentProps {
  type?: string
  placeholder?: string
  value?: string
}

export interface CardProps extends BaseComponentProps {
  children: string
}

// Utility functions
export const cn = (...classes: (string | undefined)[]): string => {
  return classes.filter(Boolean).join(' ')
}

// Version info
export const UI_PACKAGE_VERSION = '1.0.0'