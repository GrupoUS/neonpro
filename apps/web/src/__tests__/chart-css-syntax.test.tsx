import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChartContainer } from '../components/ui/chart';

describe('Chart Component CSS Syntax', () => {
  it('should render without CSS syntax errors', () => {
    // This test will fail due to CSS syntax errors with escaped quotes
    expect(() => {
      render(
        <ChartContainer config={{}}>
          <div>Test Chart</div>
        </ChartContainer>,
      );
    }).not.toThrow();
  });

  it('should have valid CSS class names', () => {
    // Test that the className string is valid CSS
    const invalidClassName =
      '[&_.recharts-cartesian-grid_line[stroke=\\\'#ccc\\\']]:stroke-border/50';

    // This should fail because the CSS contains syntax errors
    expect(invalidClassName).not.toContain('\\\'');
    expect(invalidClassName).not.toContain('\\#');
  });
});
