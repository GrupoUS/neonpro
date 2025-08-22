import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * NEONPRO HEALTHCARE - CONTRAST VALIDATOR COMPONENT
 *
 * Real-time color contrast validation component that ensures WCAG 2.1 AA
 * compliance for healthcare interfaces. Provides visual and programmatic
 * feedback about contrast ratios.
 *
 * WCAG 2.1 AA Requirements:
 * - Normal text: minimum 4.5:1 (healthcare enhanced: 7.0:1)
 * - Large text: minimum 3.0:1 (healthcare enhanced: 4.5:1)
 * - Graphical objects: minimum 3.0:1 (healthcare enhanced: 4.5:1)
 *
 * Healthcare Enhancement:
 * - Emergency interfaces: minimum 7.0:1
 * - Patient data: minimum 7.0:1
 * - Medical forms: minimum 7.0:1
 */

interface ContrastValidatorProps {
  /**
   * Background color to test against
   */
  backgroundColor: string;

  /**
   * Foreground/text color to test
   */
  foregroundColor: string;

  /**
   * Minimum contrast ratio required (default: 7.0 for healthcare)
   */
  minimumRatio?: number;

  /**
   * Text size category
   */
  textSize?: 'normal' | 'large';

  /**
   * Healthcare context for specialized requirements
   */
  medicalContext?: 'emergency' | 'patient-data' | 'form' | 'general';

  /**
   * Whether to show visual indicator
   */
  showIndicator?: boolean;

  /**
   * Position of the indicator
   */
  indicatorPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /**
   * Callback when contrast validation changes
   */
  onValidationChange?: (isValid: boolean, ratio: number) => void;

  /**
   * Children to render with contrast validation
   */
  children?: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Convert hex color to RGB values
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null;
};

/**
 * Parse CSS color string to RGB
 */
const parseColor = (
  color: string
): { r: number; g: number; b: number } | null => {
  // Handle hex colors
  if (color.startsWith('#')) {
    return hexToRgb(color);
  }

  // Handle rgb/rgba colors
  const rgbMatch = color.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
  );
  if (rgbMatch) {
    return {
      r: Number.parseInt(rgbMatch[1], 10),
      g: Number.parseInt(rgbMatch[2], 10),
      b: Number.parseInt(rgbMatch[3], 10),
    };
  }

  // Handle hsl colors (basic implementation)
  const hslMatch = color.match(
    /hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/
  );
  if (hslMatch) {
    // Convert HSL to RGB (simplified)
    const h = Number.parseInt(hslMatch[1], 10) / 360;
    const s = Number.parseInt(hslMatch[2], 10) / 100;
    const l = Number.parseInt(hslMatch[3], 10) / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  return null;
};

/**
 * Calculate relative luminance of a color
 */
const getRelativeLuminance = (rgb: {
  r: number;
  g: number;
  b: number;
}): number => {
  const { r, g, b } = rgb;

  const [rSRGB, gSRGB, bSRGB] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.039_28 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * rSRGB + 0.7152 * gSRGB + 0.0722 * bSRGB;
};

/**
 * Calculate contrast ratio between two colors
 */
const calculateContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);

  if (!(rgb1 && rgb2)) return 0;

  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Get minimum ratio based on context and text size
 */
const getMinimumRatio = (
  textSize: 'normal' | 'large',
  medicalContext: 'emergency' | 'patient-data' | 'form' | 'general',
  customMinimum?: number
): number => {
  if (customMinimum) return customMinimum;

  // Healthcare enhanced requirements
  switch (medicalContext) {
    case 'emergency':
      return 7.0; // Critical visibility
    case 'patient-data':
      return 7.0; // Sensitive data clarity
    case 'form':
      return textSize === 'large' ? 4.5 : 7.0; // Form clarity
    case 'general':
    default:
      return textSize === 'large' ? 4.5 : 7.0; // Healthcare standard
  }
};

const ContrastValidator = React.forwardRef<
  HTMLDivElement,
  ContrastValidatorProps
>(
  (
    {
      backgroundColor,
      foregroundColor,
      minimumRatio,
      textSize = 'normal',
      medicalContext = 'general',
      showIndicator = true,
      indicatorPosition = 'top-right',
      onValidationChange,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const [contrastRatio, setContrastRatio] = React.useState<number>(0);
    const [isValid, setIsValid] = React.useState<boolean>(false);

    const requiredRatio = getMinimumRatio(
      textSize,
      medicalContext,
      minimumRatio
    );

    React.useEffect(() => {
      const ratio = calculateContrastRatio(backgroundColor, foregroundColor);
      const valid = ratio >= requiredRatio;

      setContrastRatio(ratio);
      setIsValid(valid);

      onValidationChange?.(valid, ratio);
    }, [backgroundColor, foregroundColor, requiredRatio, onValidationChange]);

    const getIndicatorColor = () => {
      if (contrastRatio >= 7.0) return 'bg-green-500'; // Excellent
      if (contrastRatio >= 4.5) return 'bg-yellow-500'; // Good (AA)
      if (contrastRatio >= 3.0) return 'bg-orange-500'; // Poor (AA Large)
      return 'bg-red-500'; // Failed
    };

    const getIndicatorText = () => {
      if (contrastRatio >= 7.0) return 'AAA';
      if (contrastRatio >= 4.5) return 'AA';
      if (contrastRatio >= 3.0) return 'AA Large';
      return 'Failed';
    };

    const getAccessibilityStatus = () => {
      const status = isValid ? 'Compliant' : 'Non-compliant';
      const level =
        contrastRatio >= 7.0 ? 'AAA' : contrastRatio >= 4.5 ? 'AA' : 'Failed';
      return `${status} - ${level} (${contrastRatio.toFixed(2)}:1)`;
    };

    return (
      <div
        className={cn('relative contrast-validator', className)}
        data-contrast-ratio={contrastRatio.toFixed(2)}
        data-is-valid={isValid}
        data-medical-context={medicalContext}
        ref={ref}
        {...props}
      >
        {children}

        {showIndicator && (
          <div
            aria-label={`Contrast ratio: ${getAccessibilityStatus()}`}
            className={cn(
              'absolute z-10 flex items-center gap-1 rounded-md px-2 py-1 font-medium text-white text-xs shadow-lg',
              getIndicatorColor(),
              {
                'top-2 left-2': indicatorPosition === 'top-left',
                'top-2 right-2': indicatorPosition === 'top-right',
                'bottom-2 left-2': indicatorPosition === 'bottom-left',
                'right-2 bottom-2': indicatorPosition === 'bottom-right',
              }
            )}
            role="status"
            title={`Contrast: ${contrastRatio.toFixed(2)}:1 (Required: ${requiredRatio}:1)`}
          >
            <div
              aria-hidden="true"
              className="h-3 w-3 rounded-full border border-white/50"
              style={{ backgroundColor: foregroundColor }}
            />
            <div
              aria-hidden="true"
              className="h-3 w-3 rounded-full border border-white/50"
              style={{ backgroundColor }}
            />
            <span>{getIndicatorText()}</span>
            <span className="font-mono text-[10px]">
              {contrastRatio.toFixed(1)}:1
            </span>
          </div>
        )}

        {/* Screen reader announcement */}
        <div aria-live="polite" className="sr-only" role="status">
          {isValid
            ? `Contrast ratio ${contrastRatio.toFixed(2)}:1 meets ${medicalContext} accessibility requirements`
            : `Contrast ratio ${contrastRatio.toFixed(2)}:1 does not meet ${medicalContext} accessibility requirements. Minimum required: ${requiredRatio}:1`}
        </div>
      </div>
    );
  }
);

ContrastValidator.displayName = 'ContrastValidator';

/**
 * Hook for programmatic contrast validation
 */
export const useContrastValidation = (
  backgroundColor: string,
  foregroundColor: string,
  medicalContext: 'emergency' | 'patient-data' | 'form' | 'general' = 'general',
  textSize: 'normal' | 'large' = 'normal'
) => {
  const [validation, setValidation] = React.useState({
    ratio: 0,
    isValid: false,
    level: 'Failed' as 'AAA' | 'AA' | 'AA Large' | 'Failed',
    requiredRatio: 0,
  });

  React.useEffect(() => {
    const ratio = calculateContrastRatio(backgroundColor, foregroundColor);
    const requiredRatio = getMinimumRatio(textSize, medicalContext);
    const isValid = ratio >= requiredRatio;

    let level: 'AAA' | 'AA' | 'AA Large' | 'Failed' = 'Failed';
    if (ratio >= 7.0) level = 'AAA';
    else if (ratio >= 4.5) level = 'AA';
    else if (ratio >= 3.0) level = 'AA Large';

    setValidation({ ratio, isValid, level, requiredRatio });
  }, [backgroundColor, foregroundColor, medicalContext, textSize]);

  return validation;
};

/**
 * Batch contrast validation for multiple color combinations
 */
export const validateColorPalette = (
  palette: Array<{ bg: string; fg: string; context?: string }>
): Array<{
  bg: string;
  fg: string;
  context?: string;
  ratio: number;
  isValid: boolean;
}> => {
  return palette.map(({ bg, fg, context = 'general' }) => {
    const ratio = calculateContrastRatio(bg, fg);
    const requiredRatio = getMinimumRatio('normal', context as any);
    const isValid = ratio >= requiredRatio;

    return { bg, fg, context, ratio, isValid };
  });
};

/**
 * Component wrapper that adds contrast validation to any element
 */
interface ContrastWrapperProps extends ContrastValidatorProps {
  element?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
}

const ContrastWrapper = React.forwardRef<HTMLElement, ContrastWrapperProps>(
  (
    {
      element: Element = 'div',
      style,
      backgroundColor,
      foregroundColor,
      children,
      ...props
    },
    ref
  ) => {
    const computedStyle = {
      backgroundColor,
      color: foregroundColor,
      ...style,
    };

    return React.createElement(
      Element,
      { ref, style: computedStyle },
      <ContrastValidator
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
        {...props}
      >
        {children}
      </ContrastValidator>
    );
  }
);

ContrastWrapper.displayName = 'ContrastWrapper';

export {
  ContrastValidator,
  ContrastWrapper,
  calculateContrastRatio,
  type ContrastValidatorProps,
  type ContrastWrapperProps,
};
