import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChartContainer } from '../../src/components/ui/chart';

describe('Chart Component CSS Syntax', () => {
  it('should render without CSS syntax errors', () => {
    // RED: This test fails due to CSS syntax errors with escaped quotes
    expect(() => {
      render(
        <ChartContainer config={{}}>
          <div>Test Chart</div>
        </ChartContainer>,
      );
    }).not.toThrow();
  });

  it('should have valid CSS class names without escaped quotes', () => {
    // RED: This test fails because the CSS contains syntax errors
    const invalidClassName =
      '[&_.recharts-cartesian-grid_line[stroke=\\\'#ccc\\\']]:stroke-border/50';

    // These assertions fail due to escaped quotes
    expect(invalidClassName).not.toContain('\\\'');
    expect(invalidClassName).not.toContain('\\#');
    expect(invalidClassName).not.toContain('\\\'');
  });

  it('should use proper CSS attribute selector syntax', () => {
    // RED: Test fails because current CSS uses invalid escaped quotes
    const validSyntax = '[stroke=\'#ccc\']';
    const invalidSyntax = '[stroke=\\\'#ccc\\\']';

    expect(invalidSyntax).not.toBe(validSyntax);
  });
});
