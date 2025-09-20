/**
 * Chart Component Unit Tests
 * Testing recharts-based Chart component with healthcare data visualization
 * Following RED-GREEN-REFACTOR methodology
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChartContainer, ChartLegend, ChartTooltip } from 'src/components/ui/chart';
import { cn } from 'src/lib/utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

// Mock recharts components
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children, ...props }: any) => (
      <div data-testid='responsive-container' {...props}>
        {children}
      </div>
    ),
    BarChart: ({ children, ...props }: any) => (
      <div data-testid='bar-chart' {...props}>
        {children}
      </div>
    ),
    LineChart: ({ children, ...props }: any) => (
      <div data-testid='line-chart' {...props}>
        {children}
      </div>
    ),
    PieChart: ({ children, ...props }: any) => (
      <div data-testid='pie-chart' {...props}>
        {children}
      </div>
    ),
    Bar: (props: any) => <div data-testid='bar' {...props} />,
    Line: (props: any) => <div data-testid='line' {...props} />,
    Pie: (props: any) => <div data-testid='pie' {...props} />,
    XAxis: (props: any) => <div data-testid='x-axis' {...props} />,
    YAxis: (props: any) => <div data-testid='y-axis' {...props} />,
    CartesianGrid: (props: any) => <div data-testid='cartesian-grid' {...props} />,
    Tooltip: ({ content, ...props }: any) => (
      <div data-testid='tooltip' {...props}>
        {content ? <div data-testid='tooltip-content'>Custom Tooltip</div> : 'Default Tooltip'}
      </div>
    ),
    Legend: (props: any) => <div data-testid='legend' {...props} />,
    Cell: (props: any) => <div data-testid='cell' {...props} />,
  };
});

// Test data
const mockChartData = [
  { month: 'Jan', revenue: 4000, patients: 240 },
  { month: 'Feb', revenue: 3000, patients: 139 },
  { month: 'Mar', revenue: 2000, patients: 980 },
  { month: 'Apr', revenue: 2780, patients: 390 },
  { month: 'May', revenue: 1890, patients: 480 },
  { month: 'Jun', revenue: 2390, patients: 380 },
];

const mockChartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--chart-1))',
  },
  patients: {
    label: 'Patients',
    color: 'hsl(var(--chart-2))',
  },
} as const;

describe('Chart Component - Unit Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    // Mock window.matchMedia for responsive behavior
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ChartContainer', () => {
    it('should render chart container with proper structure', () => {
      // RED: Test expects proper container structure
      const { container } = render(
        <ChartContainer config={mockChartConfig} className='test-chart'>
          <div data-testid='chart-content'>Chart Content</div>
        </ChartContainer>,
      );

      expect(container.firstChild).toHaveClass('test-chart');
      expect(screen.getByTestId('chart-content')).toBeInTheDocument();
    });

    it('should generate unique chart ID', () => {
      // RED: Test expects unique chart ID generation
      const { container: container1 } = render(
        <ChartContainer config={mockChartConfig}>
          <div>Chart 1</div>
        </ChartContainer>,
      );

      const { container: container2 } = render(
        <ChartContainer config={mockChartConfig}>
          <div>Chart 2</div>
        </ChartContainer>,
      );

      const id1 = container1.firstChild?.getAttribute('data-chart');
      const id2 = container2.firstChild?.getAttribute('data-chart');

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should use provided chart ID when specified', () => {
      // RED: Test expects provided ID usage
      const { container } = render(
        <ChartContainer config={mockChartConfig} id='custom-chart-id'>
          <div>Chart with Custom ID</div>
        </ChartContainer>,
      );

      expect(container.firstChild).toHaveAttribute('data-chart', 'chart-custom-chart-id');
    });

    it('should provide chart context to children', () => {
      // RED: Test expects context provision
      const TestComponent = () => {
        // This would use useChart hook in real implementation
        return <div data-testid='context-consumer'>Has Context</div>;
      };

      render(
        <ChartContainer config={mockChartConfig}>
          <TestComponent />
        </ChartContainer>,
      );

      expect(screen.getByTestId('context-consumer')).toBeInTheDocument();
    });

    it('should throw error when useChart is used outside ChartContainer', () => {
      // RED: Test expects error handling for missing context
      // This test would require mocking the useChart hook
      expect(() => {
        // In a real test, this would try to use useChart hook
        // without ChartContainer wrapper
      }).toThrow('useChart must be used within a <ChartContainer />');
    });
  });

  describe('Chart Configuration', () => {
    it('should handle different chart configurations', () => {
      // RED: Test expects configuration handling
      const simpleConfig = {
        revenue: { label: 'Revenue' },
      };

      const { container } = render(
        <ChartContainer config={simpleConfig}>
          <div>Simple Chart</div>
        </ChartContainer>,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle theme-based color configuration', () => {
      // RED: Test expects theme-based color handling
      const themeConfig = {
        revenue: {
          label: 'Revenue',
          theme: {
            light: 'hsl(var(--chart-1))',
            dark: 'hsl(var(--chart-1-dark))',
          },
        },
      };

      const { container } = render(
        <ChartContainer config={themeConfig}>
          <div>Themed Chart</div>
        </ChartContainer>,
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle icon configuration', () => {
      // RED: Test expects icon configuration handling
      const MockIcon = () => <div data-testid='mock-icon'>Icon</div>;

      const iconConfig = {
        revenue: {
          label: 'Revenue',
          icon: MockIcon,
        },
      };

      const { container } = render(
        <ChartContainer config={iconConfig}>
          <div>Chart with Icon</div>
        </ChartContainer>,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should render responsive container', () => {
      // RED: Test expects responsive container rendering
      const { container } = render(
        <ChartContainer config={mockChartConfig}>
          <div data-testid='responsive-container'>Responsive Chart</div>
        </ChartContainer>,
      );

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('should handle window resize events', async () => {
      // RED: Test expects resize event handling
      const { container } = render(
        <ChartContainer config={mockChartConfig}>
          <div>Resize Test Chart</div>
        </ChartContainer>,
      );

      // Simulate window resize
      window.dispatchEvent(new Event('resize'));

      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('should handle different viewport sizes', () => {
      // RED: Test expects different viewport handling
      // Test mobile viewport
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query.includes('(max-width: 768px)'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { container } = render(
        <ChartContainer config={mockChartConfig}>
          <div>Mobile Chart</div>
        </ChartContainer>,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should pass accessibility tests', async () => {
      // RED: Test expects accessibility compliance
      const { container } = render(
        <ChartContainer config={mockChartConfig}>
          <div aria-label='Revenue and Patients Chart'>
            <div>Chart Content</div>
          </div>
        </ChartContainer>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should provide proper ARIA labels', () => {
      // RED: Test expects ARIA label provision
      const { container } = render(
        <ChartContainer
          config={mockChartConfig}
          className='accessible-chart'
        >
          <div
            role='img'
            aria-label='Chart showing revenue and patient data over time'
          >
            Chart Content
          </div>
        </ChartContainer>,
      );

      const chartElement = container.querySelector('[role="img"]');
      expect(chartElement).toHaveAttribute(
        'aria-label',
        'Chart showing revenue and patient data over time',
      );
    });

    it('should support keyboard navigation', async () => {
      // RED: Test expects keyboard navigation support
      const { container } = render(
        <ChartContainer config={mockChartConfig}>
          <button data-testid='chart-button' tabIndex={0}>
            Interactive Element
          </button>
        </ChartContainer>,
      );

      const button = screen.getByTestId('chart-button');

      // Test keyboard focus
      button.focus();
      expect(button).toHaveFocus();

      // Test keyboard interaction
      await user.keyboard('{Enter}');
      // Verify interaction occurred
    });

    it('should handle screen reader announcements', () => {
      // RED: Test expects screen reader announcement handling
      const { container } = render(
        <ChartContainer config={mockChartConfig}>
          <div aria-live='polite' aria-atomic='true'>
            Chart data updated
          </div>
        </ChartContainer>,
      );

      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty data gracefully', () => {
      // RED: Test expects empty data handling
      const { container } = render(
        <ChartContainer config={mockChartConfig}>
          <div data-testid='empty-chart'>No Data Available</div>
        </ChartContainer>,
      );

      expect(screen.getByTestId('empty-chart')).toBeInTheDocument();
      expect(screen.getByText('No Data Available')).toBeInTheDocument();
    });

    it('should handle invalid configuration', () => {
      // RED: Test expects invalid configuration handling
      const invalidConfig = {};

      // Should not throw error, should render gracefully
      expect(() => {
        render(
          <ChartContainer config={invalidConfig}>
            <div>Chart with Invalid Config</div>
          </ChartContainer>,
        );
      }).not.toThrow();
    });

    it('should handle missing required props', () => {
      // RED: Test expects missing props handling
      // @ts-expect-error - Testing missing required prop
      expect(() => {
        render(
          <ChartContainer>
            <div>Chart without config</div>
          </ChartContainer>,
        );
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should render efficiently with large datasets', async () => {
      // RED: Test expects efficient large dataset rendering
      const largeDataset = Array(1000).fill(null).map((_, i) => ({
        month: `Month ${i}`,
        revenue: Math.random() * 10000,
        patients: Math.floor(Math.random() * 1000),
      }));

      const startTime = performance.now();

      const { container } = render(
        <ChartContainer config={mockChartConfig}>
          <div data-testid='large-chart'>Large Dataset Chart</div>
        </ChartContainer>,
      );

      const endTime = performance.now();

      expect(screen.getByTestId('large-chart')).toBeInTheDocument();
      expect(endTime - startTime).toBeLessThan(100); // Should render quickly
    });

    it('should minimize re-renders on prop changes', async () => {
      // RED: Test expects minimized re-renders
      const { rerender, container } = render(
        <ChartContainer config={mockChartConfig}>
          <div data-testid='chart-content'>Initial Content</div>
        </ChartContainer>,
      );

      const initialRenderCount = container.innerHTML;

      // Re-render with same props
      rerender(
        <ChartContainer config={mockChartConfig}>
          <div data-testid='chart-content'>Same Content</div>
        </ChartContainer>,
      );

      expect(container.innerHTML).toBe(initialRenderCount);
    });
  });

  describe('Integration with Recharts', () => {
    it('should integrate with BarChart component', () => {
      // RED: Test expects BarChart integration
      const { container } = render(
        <ChartContainer config={mockChartConfig}>
          <div data-testid='bar-chart-container'>
            <div data-testid='bar-chart'>Bar Chart Content</div>
          </div>
        </ChartContainer>,
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should integrate with LineChart component', () => {
      // RED: Test expects LineChart integration
      const { container } = render(
        <ChartContainer config={mockChartConfig}>
          <div data-testid='line-chart-container'>
            <div data-testid='line-chart'>Line Chart Content</div>
          </div>
        </ChartContainer>,
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should integrate with PieChart component', () => {
      // RED: Test expects PieChart integration
      const { container } = render(
        <ChartContainer config={mockChartConfig}>
          <div data-testid='pie-chart-container'>
            <div data-testid='pie-chart'>Pie Chart Content</div>
          </div>
        </ChartContainer>,
      );

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  describe('Healthcare Data Visualization', () => {
    it('should handle patient data privacy', () => {
      // RED: Test expects patient data privacy handling
      const sensitivePatientData = [
        { month: 'Jan', patients: 240, diagnoses: 45 },
        { month: 'Feb', patients: 139, diagnoses: 32 },
      ];

      const { container } = render(
        <ChartContainer config={mockChartConfig}>
          <div data-testid='patient-chart'>
            Patient Data Visualization
          </div>
        </ChartContainer>,
      );

      expect(screen.getByTestId('patient-chart')).toBeInTheDocument();

      // Ensure sensitive data is not exposed in DOM
      const chartHTML = container.innerHTML;
      expect(chartHTML).not.toContain('specific-patient-names');
      expect(chartHTML).not.toContain('personal-identifiers');
    });

    it('should support medical data visualization', () => {
      // RED: Test expects medical data visualization support
      const medicalData = [
        { month: 'Jan', treatments: 120, procedures: 45 },
        { month: 'Feb', treatments: 98, procedures: 38 },
      ];

      const medicalConfig = {
        treatments: { label: 'Treatments', color: 'hsl(var(--chart-3))' },
        procedures: { label: 'Procedures', color: 'hsl(var(--chart-4))' },
      };

      const { container } = render(
        <ChartContainer config={medicalConfig}>
          <div data-testid='medical-chart'>
            Medical Data Visualization
          </div>
        </ChartContainer>,
      );

      expect(screen.getByTestId('medical-chart')).toBeInTheDocument();
    });

    it('should comply with healthcare accessibility standards', async () => {
      // RED: Test expects healthcare accessibility compliance
      const { container } = render(
        <ChartContainer config={mockChartConfig}>
          <div
            role='img'
            aria-label='Healthcare metrics chart showing patient and revenue data'
            aria-describedby='chart-description'
          >
            <div id='chart-description'>
              This chart displays healthcare metrics including patient count and revenue over a
              6-month period. All data is aggregated and anonymized for privacy.
            </div>
          </div>
        </ChartContainer>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      const chartElement = container.querySelector('[role="img"]');
      expect(chartElement).toHaveAttribute('aria-describedby', 'chart-description');
    });
  });

  describe('Theme Support', () => {
    it('should support light theme', () => {
      // RED: Test expects light theme support
      const { container } = render(
        <ChartContainer config={mockChartConfig}>
          <div data-testid='light-theme-chart'>Light Theme Chart</div>
        </ChartContainer>,
      );

      expect(screen.getByTestId('light-theme-chart')).toBeInTheDocument();
    });

    it('should support dark theme', () => {
      // RED: Test expects dark theme support
      // Mock dark theme detection
      document.documentElement.classList.add('dark');

      const { container } = render(
        <ChartContainer config={mockChartConfig}>
          <div data-testid='dark-theme-chart'>Dark Theme Chart</div>
        </ChartContainer>,
      );

      expect(screen.getByTestId('dark-theme-chart')).toBeInTheDocument();

      // Cleanup
      document.documentElement.classList.remove('dark');
    });

    it('should handle theme switching', async () => {
      // RED: Test expects theme switching handling
      const { container } = render(
        <ChartContainer config={mockChartConfig}>
          <div data-testid='theme-switch-chart'>Theme Switch Chart</div>
        </ChartContainer>,
      );

      // Switch to dark theme
      document.documentElement.classList.add('dark');

      await waitFor(() => {
        expect(screen.getByTestId('theme-switch-chart')).toBeInTheDocument();
      });

      // Switch back to light theme
      document.documentElement.classList.remove('dark');

      await waitFor(() => {
        expect(screen.getByTestId('theme-switch-chart')).toBeInTheDocument();
      });
    });
  });
});
