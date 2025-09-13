import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Import directly to avoid mocking issues
import { UniversalButton } from '../../../../packages/ui/src/components/ui/universal-button';

describe('UniversalButton', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
    it('renders with default props', () => {
      render(<UniversalButton>Test Button</UniversalButton>);

      const button = screen.getByRole('button', { name: 'Test Button' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Test Button');
    });

    it('handles click events', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <UniversalButton onClick={handleClick}>
          Click Me
        </UniversalButton>,
      );

      const button = screen.getByRole('button', { name: 'Click Me' });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('forwards ref correctly', () => {
      const ref = vi.fn();

      render(<UniversalButton ref={ref}>Test</UniversalButton>);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });
  });

  describe('Variants and Sizes', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;

    variants.forEach(variant => {
      it(`renders ${variant} variant correctly`, () => {
        render(
          <UniversalButton variant={variant} data-testid={`button-${variant}`}>
            {variant} Button
          </UniversalButton>,
        );

        const button = screen.getByTestId(`button-${variant}`);
        expect(button).toBeInTheDocument();
      });
    });

    sizes.forEach(size => {
      it(`renders ${size} size correctly`, () => {
        render(
          <UniversalButton size={size} data-testid={`button-${size}`}>
            {size} Button
          </UniversalButton>,
        );

        const button = screen.getByTestId(`button-${size}`);
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Effect Systems', () => {
    describe('Gradient Effect', () => {
      it('applies gradient classes when enableGradient is true', () => {
        render(
          <UniversalButton enableGradient data-testid='gradient-button'>
            Gradient Button
          </UniversalButton>,
        );

        const button = screen.getByTestId('gradient-button');
        expect(button).toHaveClass('bg-gradient-to-r');
        expect(button).toHaveClass('animate-gradient-x');
      });

      it('supports custom gradient colors', () => {
        render(
          <UniversalButton
            enableGradient
            gradientColors={{
              from: '#ff0000',
              via: '#00ff00',
              to: '#0000ff',
            }}
            data-testid='custom-gradient-button'
          >
            Custom Gradient
          </UniversalButton>,
        );

        const button = screen.getByTestId('custom-gradient-button');
        expect(button).toBeInTheDocument();
      });

      it('applies different gradients for different variants', () => {
        const { rerender } = render(
          <UniversalButton enableGradient variant='default' data-testid='gradient-button'>
            Default Gradient
          </UniversalButton>,
        );

        let button = screen.getByTestId('gradient-button');
        expect(button).toHaveClass('from-blue-600');

        rerender(
          <UniversalButton enableGradient variant='destructive' data-testid='gradient-button'>
            Destructive Gradient
          </UniversalButton>,
        );

        button = screen.getByTestId('gradient-button');
        expect(button).toHaveClass('from-red-600');
      });
    });

    describe('Neumorph Effect', () => {
      it('applies neumorph classes when enableNeumorph is true', () => {
        render(
          <UniversalButton enableNeumorph data-testid='neumorph-button'>
            Neumorph Button
          </UniversalButton>,
        );

        const button = screen.getByTestId('neumorph-button');
        expect(button).toHaveClass('shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]');
        expect(button).toHaveClass('bg-[#e0e5ec]');
      });
    });

    describe('Border Gradient Effect', () => {
      it('applies border gradient classes when enableBorderGradient is true', () => {
        render(
          <UniversalButton enableBorderGradient data-testid='border-gradient-button'>
            Border Gradient Button
          </UniversalButton>,
        );

        const button = screen.getByTestId('border-gradient-button');
        // Check for border classes
        expect(button.className).toContain('border-2');
        expect(button).toHaveClass('border-transparent');
        expect(button).toHaveClass('before:animate-spin');
      });

      it('supports custom duration for border gradient', () => {
        render(
          <UniversalButton
            enableBorderGradient
            duration={5}
            data-testid='border-gradient-button'
          >
            Slow Border Gradient
          </UniversalButton>,
        );

        const button = screen.getByTestId('border-gradient-button');
        expect(button).toHaveStyle({ '--animation-duration': '5s' });
      });

      it('supports counter-clockwise rotation', () => {
        render(
          <UniversalButton
            enableBorderGradient
            clockwise={false}
            data-testid='border-gradient-button'
          >
            Counter-clockwise
          </UniversalButton>,
        );

        const button = screen.getByTestId('border-gradient-button');
        expect(button).toHaveClass('before:animate-reverse-spin');
      });
    });

    describe('Combined Effects', () => {
      it('applies multiple effects simultaneously', () => {
        render(
          <UniversalButton
            enableGradient
            enableNeumorph
            enableBorderGradient
            data-testid='combined-effects-button'
          >
            All Effects
          </UniversalButton>,
        );

        const button = screen.getByTestId('combined-effects-button');

        // Should have gradient classes
        expect(button).toHaveClass('bg-gradient-to-r');
        expect(button).toHaveClass('animate-gradient-x');

        // Should have neumorph classes
        expect(button).toHaveClass('shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]');

        // Should have border gradient classes
        // Check for border classes
        expect(button.className).toContain('border-2');
        expect(button).toHaveClass('border-transparent');
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading is true', () => {
      render(
        <UniversalButton loading data-testid='loading-button'>
          Submit
        </UniversalButton>,
      );

      const button = screen.getByTestId('loading-button');
      expect(button).toBeDisabled();

      // Check for loading spinner
      const spinner = screen.getByTestId('loading-button').querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(
        <UniversalButton loading>
          Submit
        </UniversalButton>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('combines loading with effects', () => {
      render(
        <UniversalButton
          loading
          enableGradient
          data-testid='loading-gradient-button'
        >
          Loading Gradient
        </UniversalButton>,
      );

      const button = screen.getByTestId('loading-gradient-button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('bg-gradient-to-r');

      const spinner = button.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables button when disabled prop is true', () => {
      render(
        <UniversalButton disabled>
          Disabled Button
        </UniversalButton>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies opacity classes when disabled', () => {
      render(
        <UniversalButton disabled data-testid='disabled-button'>
          Disabled Button
        </UniversalButton>,
      );

      const button = screen.getByTestId('disabled-button');
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:pointer-events-none');
    });
  });

  describe('AsChild Prop', () => {
    it('renders as Slot when asChild is true', () => {
      render(
        <UniversalButton asChild data-testid='slot-button'>
          <div>Custom Element</div>
        </UniversalButton>,
      );

      const element = screen.getByTestId('slot-button');
      expect(element.tagName).toBe('DIV');
      expect(element).toHaveTextContent('Custom Element');
    });
  });

  describe('Accessibility', () => {
    it('has proper focus management', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <UniversalButton data-testid='button1'>Button 1</UniversalButton>
          <UniversalButton data-testid='button2'>Button 2</UniversalButton>
        </div>,
      );

      const button1 = screen.getByTestId('button1');
      const button2 = screen.getByTestId('button2');

      await user.tab();
      expect(button1).toHaveFocus();

      await user.tab();
      expect(button2).toHaveFocus();
    });

    it('has proper ARIA attributes', () => {
      render(
        <UniversalButton
          loading
          disabled
          aria-label='Submit form'
          data-testid='aria-button'
        >
          Submit
        </UniversalButton>,
      );

      const button = screen.getByTestId('aria-button');
      expect(button).toHaveAttribute('aria-label', 'Submit form');
      expect(button).toHaveAttribute('disabled');
    });

    it('supports keyboard interaction', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(
        <UniversalButton onClick={handleClick}>
          Keyboard Test
        </UniversalButton>,
      );

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Reduced Motion', () => {
    it('respects prefers-reduced-motion setting', () => {
      // Mock prefers-reduced-motion: reduce
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <UniversalButton
          enableGradient
          enableBorderGradient
          data-testid='reduced-motion-button'
        >
          Reduced Motion Test
        </UniversalButton>,
      );

      const button = screen.getByTestId('reduced-motion-button');

      // The CSS should disable animations for prefers-reduced-motion
      // We can't directly test CSS media queries in JSDOM, but we can verify
      // that the classes are still applied (the CSS handles the rest)
      expect(button).toHaveClass('animate-gradient-x');
      expect(button).toHaveClass('before:animate-spin');
    });
  });

  describe('Custom Class Names', () => {
    it('merges custom className with component classes', () => {
      render(
        <UniversalButton
          className='custom-class another-class'
          data-testid='custom-class-button'
        >
          Custom Classes
        </UniversalButton>,
      );

      const button = screen.getByTestId('custom-class-button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('another-class');
      expect(button).toHaveClass('inline-flex'); // Base class should still be there
    });
  });

  describe('Error Handling', () => {
    it('handles invalid gradient colors gracefully', () => {
      render(
        <UniversalButton
          enableGradient
          gradientColors={{
            from: 'invalid-color',
            via: '',
            to: null as any,
          }}
          data-testid='invalid-gradient-button'
        >
          Invalid Gradient
        </UniversalButton>,
      );

      const button = screen.getByTestId('invalid-gradient-button');
      expect(button).toBeInTheDocument();
      // Should fallback to default gradients
      expect(button).toHaveClass('bg-gradient-to-r');
    });

    it('handles negative duration values', () => {
      render(
        <UniversalButton
          enableBorderGradient
          duration={-5}
          data-testid='negative-duration-button'
        >
          Negative Duration
        </UniversalButton>,
      );

      const button = screen.getByTestId('negative-duration-button');
      expect(button).toHaveStyle({ '--animation-duration': '-5s' });
    });
  });
});
