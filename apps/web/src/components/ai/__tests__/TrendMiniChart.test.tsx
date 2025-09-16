import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

// The chart is defined inside insights-dashboard; import named export
import { TrendMiniChart } from '../insights-dashboard';

describe('TrendMiniChart', () => {
  it('renders fallback when no data', () => {
    render(<TrendMiniChart data={[]} ariaLabel='Trends' />);
    expect(screen.getByText(/Sem dados de tendências/i)).toBeInTheDocument();
  });

  it('renders accessible svg with role and label', () => {
    const data = [{ value: 1 }, { value: 3 }, { value: 2 }];
    render(
      <TrendMiniChart
        data={data}
        ariaLabel='Trends chart'
        title='Tendências'
        desc='Mini gráfico'
      />,
    );

    const svg = screen.getByRole('img', { name: /trends chart/i }) as SVGSVGElement;
    expect(svg).toBeInTheDocument();
    expect(svg.tagName.toLowerCase()).toBe('svg');

    // Title/Desc should be present in the document
    expect(screen.getByText(/Tendências/i)).toBeInTheDocument();
    expect(screen.getByText(/Mini gráfico/i)).toBeInTheDocument();
  });

  it('renders a path element to draw the line', () => {
    const data = [{ value: 2 }, { value: 4 }, { value: 6 }];
    const { container } = render(<TrendMiniChart data={data} ariaLabel='Line' />);

    const path = container.querySelector('svg path');
    expect(path).not.toBeNull();
    expect(path!.getAttribute('d')).toMatch(/M\s+\d+\.?\d*\s+\d+\.?\d*\s+L/); // starts with M then L commands
  });
});
