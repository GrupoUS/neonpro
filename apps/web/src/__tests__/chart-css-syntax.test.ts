import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChartContainer } from '../components/ui/chart';

describe(_'Chart Component CSS Syntax',_() => {
  it(_'should render without CSS syntax errors',_() => {
    // This test will fail due to CSS syntax errors with escaped quotes
    expect(_() => {
      render(
        <ChartContainer config={{}}>
          <div>Test Chart</div>
        </ChartContainer>,
      );
    }).not.toThrow();
  });

  it(_'should have valid CSS class names',_() => {
    // Test that the className string is valid CSS
    const invalidClassName =
      '[&_.recharts-cartesian-grid_line[stroke=\\\'#ccc\\\']]:stroke-border/50';

    // This should fail because the CSS contains syntax errors
    expect(invalidClassName).not.toContain('\\\'');
    expect(invalidClassName).not.toContain('\\#');
  });
});
