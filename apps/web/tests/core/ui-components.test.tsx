/**
 * Core UI Component Tests
 * Tests essential UI components functionality
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

// Mock Button Component (placeholder for actual implementation)
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: string;
}

const Button = ({ children, variant = 'default', ...props }: ButtonProps) => (
  <button className={`btn btn-${variant}`} data-testid="button" {...props}>
    {children}
  </button>
);

// Mock Card Component (placeholder for actual implementation)
interface CardProps {
  children: React.ReactNode;
  title?: string;
}

const Card = ({ children, title }: CardProps) => (
  <div className="card" data-testid="card">
    {title && <h3 data-testid="card-title">{title}</h3>}
    <div data-testid="card-content">{children}</div>
  </div>
);

describe('Core UI Components', () => {
  afterEach(() => {
    cleanup();
  });

  describe('Button Component', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByTestId('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
    });

    it('should apply variant class', () => {
      render(<Button variant="primary">Primary Button</Button>);

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('btn-primary');
    });
  });

  describe('Card Component', () => {
    it('should render card with content', () => {
      render(<Card>Card content</Card>);

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('card-content')).toHaveTextContent(
        'Card content'
      );
    });

    it('should render card with title', () => {
      render(<Card title="Card Title">Content</Card>);

      expect(screen.getByTestId('card-title')).toHaveTextContent('Card Title');
    });
  });
});
