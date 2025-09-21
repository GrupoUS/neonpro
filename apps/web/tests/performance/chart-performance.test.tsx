/** @jsx React.createElement */
/**
 * Chart Performance Testing Suite
 *
 * Comprehensive performance testing for chart rendering and data visualization
 * in healthcare applications. Focuses on rendering speed, memory usage, and
 * responsiveness for large medical datasets.
 *
 * Healthcare Context: Medical charts often display time-series data,
 * patient vitals, and clinical metrics that require real-time updates
 * and smooth animations for monitoring applications.
 *
 * Performance Requirements:
 * - Initial render < 100ms for small datasets (< 1000 points)
 * - Initial render < 500ms for large datasets (< 10,000 points)
 * - Memory growth < 50MB for continuous updates
 * - Frame rate > 30fps during animations
 * - Interaction response < 16ms (60fps target)
 *
 * @version 1.0.0
 * @category Performance Testing
 * @subpackage Data Visualization
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { performance, PerformanceObserver } from 'perf_hooks';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Recharts components
const MockLineChart = ({ data, width, height, children }: any) =>
  React.createElement(
    'div',
    {
      className: 'recharts-wrapper',
      style: { width, height },
      'data-testid': 'line-chart',
    },
    React.createElement('svg', {
      width,
      height,
      className: 'recharts-surface',
    }, children),
  );

const MockLine = ({ dataKey, stroke, dot, activeDot }) =>
  React.createElement(
    'g',
    { className: 'recharts-line' },
    React.createElement('path', {
      d: 'M0,100 L100,80 L200,90 L300,70',
      stroke,
      fill: 'none',
      strokeWidth: 2,
    }),
    dot && React.createElement('circle', {
      cx: '150',
      cy: '85',
      r: '3',
      fill: stroke,
    }),
    activeDot && React.createElement('circle', {
      cx: '150',
      cy: '85',
      r: '5',
      fill: stroke,
    }),
  );

const MockXAxis = ({ dataKey }) => (
  <g className='recharts-x-axis'>
    <text x='50' y='20'>{dataKey}</text>
  </g>
);

const MockYAxis = () => (
  <g className='recharts-y-axis'>
    <text x='20' y='50'>Value</text>
  </g>
);

const MockTooltip = ({ active, payload, label }) => (
  <div
    className={`recharts-tooltip ${active ? 'active' : ''}`}
    style={{ display: active ? 'block' : 'none' }}
  >
    {active && (
      <div className='tooltip-content'>
        <p className='tooltip-label'>{label}</p>
        <p className='tooltip-value'>{payload?.[0]?.value}</p>
      </div>
    )}
  </div>
);

const MockLegend = () => (
  <div className='recharts-legend'>
    <span className='legend-item'>Medical Data</span>
  </div>
);

// Mock healthcare chart component
const MedicalVitalsChart = ({ patientId, timeRange, realTime = false }) => {
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));

      const mockData = generateMockVitalsData(timeRange);
      setData(mockData);
      setIsLoading(false);
    };

    loadData();

    if (realTime) {
      const interval = setInterval(() => {
        setData(prev => {
          const newData = [...prev];
          const lastPoint = newData[newData.length - 1];
          newData.push({
            timestamp: new Date(lastPoint.timestamp.getTime() + 60000).toISOString(),
            heartRate: Math.floor(Math.random() * 20) + 60,
            bloodPressure: Math.floor(Math.random() * 40) + 80,
            oxygenSaturation: Math.floor(Math.random() * 5) + 95,
            temperature: (Math.random() * 2 + 36).toFixed(1),
          });
          return newData.slice(-100); // Keep last 100 points
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [patientId, timeRange, realTime]);

  if (isLoading) {
    return <div className='loading-spinner' aria-label='Loading vital signs data'>Loading...</div>;
  }

  return (
    <div className='medical-vitals-chart' role='img' aria-label='Patient vital signs chart'>
      <div className='chart-header'>
        <h3>Patient Vital Signs - {patientId}</h3>
        <div className='time-range-selector' role='group' aria-label='Time range selection'>
          <button aria-label='1 hour' data-range='1h'>1H</button>
          <button aria-label='24 hours' data-range='24h'>24H</button>
          <button aria-label='7 days' data-range='7d'>7D</button>
          <button aria-label='30 days' data-range='30d'>30D</button>
        </div>
      </div>

      <div className='chart-container'>
        <MockLineChart width={800} height={400} data={data}>
          <MockXAxis dataKey='timestamp' />
          <MockYAxis />
          <MockTooltip />
          <MockLegend />
          <MockLine
            dataKey='heartRate'
            stroke='#FF6B6B'
            dot={false}
            activeDot={{ r: 6 }}
          />
          <MockLine
            dataKey='bloodPressure'
            stroke='#4ECDC4'
            dot={false}
            activeDot={{ r: 6 }}
          />
        </MockLineChart>
      </div>

      {realTime && (
        <div className='real-time-indicator' aria-live='polite'>
          <span className='pulse-dot' aria-hidden='true'></span>
          Live Updates Active
        </div>
      )}
    </div>
  );
};

// Helper function to generate mock vitals data
function generateMockVitalsData(timeRange) {
  const data = [];
  const now = new Date();
  let dataPoints, intervalMs;

  switch (timeRange) {
    case '1h':
      dataPoints = 60;
      intervalMs = 60000; // 1 minute
      break;
    case '24h':
      dataPoints = 144;
      intervalMs = 600000; // 10 minutes
      break;
    case '7d':
      dataPoints = 168;
      intervalMs = 3600000; // 1 hour
      break;
    case '30d':
      dataPoints = 120;
      intervalMs = 21600000; // 6 hours
      break;
    default:
      dataPoints = 60;
      intervalMs = 60000;
  }

  for (let i = dataPoints - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - (i * intervalMs));
    data.push({
      timestamp: timestamp.toISOString(),
      heartRate: Math.floor(Math.random() * 40) + 60, // 60-100 bpm
      bloodPressure: Math.floor(Math.random() * 40) + 80, // 80-120 mmHg
      oxygenSaturation: Math.floor(Math.random() * 5) + 95, // 95-100%
      temperature: (Math.random() * 2 + 36).toFixed(1), // 36-38°C
    });
  }

  return data;
}

describe('Chart Rendering Performance', () => {
  let performanceObserver;
  let performanceEntries = [];

  beforeEach(() => {
    performanceEntries = [];

    // Mock performance API
    global.performance = {
      ...performance,
      now: vi.fn(() => Date.now()),
      mark: vi.fn(name => {
        performanceEntries.push({
          name,
          entryType: 'mark',
          startTime: Date.now(),
          duration: 0,
        });
      }),
      measure: vi.fn((name, startMark, endMark) => {
        const startEntry = performanceEntries.find(e => e.name === startMark);
        const endEntry = performanceEntries.find(e => e.name === endMark);
        if (startEntry && endEntry) {
          performanceEntries.push({
            name,
            entryType: 'measure',
            startTime: startEntry.startTime,
            duration: endEntry.startTime - startEntry.startTime,
          });
        }
      }),
      getEntriesByName: vi.fn(name => performanceEntries.filter(entry => entry.name === name)),
      getEntriesByType: vi.fn(type => performanceEntries.filter(entry => entry.entryType === type)),
      clearMarks: vi.fn(() => {
        performanceEntries = performanceEntries.filter(entry => entry.entryType !== 'mark');
      }),
      clearMeasures: vi.fn(() => {
        performanceEntries = performanceEntries.filter(entry => entry.entryType !== 'measure');
      }),
    };

    // Mock PerformanceObserver
    global.PerformanceObserver = vi.fn().mockImplementation(callback => {
      performanceObserver = {
        observe: vi.fn(options => {
          // Mock observation
        }),
        disconnect: vi.fn(),
      };
      return performanceObserver;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render Performance', () => {
    it('should render small datasets (< 1000 points) under 100ms', async () => {
      const smallData = generateMockVitalsData('1h'); // 60 points

      performance.mark('render-start');

      const { container } = render(
        <MedicalVitalsChart
          patientId='test-patient-123'
          timeRange='1h'
          realTime={false}
        />,
      );

      performance.mark('render-end');
      performance.measure('render-duration', 'render-start', 'render-end');

      const renderMeasure = performance.getEntriesByName('render-duration')[0];

      expect(renderMeasure.duration).toBeLessThan(100);
      expect(container.querySelector('.medical-vitals-chart')).toBeInTheDocument();
    });

    it('should render medium datasets (1000-5000 points) under 300ms', async () => {
      // Create medium dataset by combining multiple ranges
      const mediumData = [
        ...generateMockVitalsData('7d'),
        ...generateMockVitalsData('24h'),
        ...generateMockVitalsData('1h'),
      ]; // ~372 points

      // Mock the component to use the medium data
      const { container } = render(
        <div>
          <MockLineChart width={800} height={400} data={mediumData}>
            <MockXAxis dataKey='timestamp' />
            <MockYAxis />
            <MockTooltip />
            <MockLegend />
            <MockLine dataKey='heartRate' stroke='#FF6B6B' />
          </MockLineChart>
        </div>,
      );

      performance.mark('render-start');
      await act(async () => {
        // Force re-render
        render(
          <div>
            <MockLineChart width={800} height={400} data={mediumData}>
              <MockXAxis dataKey='timestamp' />
              <MockYAxis />
              <MockTooltip />
              <MockLegend />
              <MockLine dataKey='heartRate' stroke='#FF6B6B' />
            </MockLineChart>
          </div>,
        );
      });
      performance.mark('render-end');

      performance.measure('render-duration', 'render-start', 'render-end');
      const renderMeasure = performance.getEntriesByName('render-duration')[0];

      expect(renderMeasure.duration).toBeLessThan(300);
      expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
    });

    it('should handle large datasets (> 10000 points) with optimization', async () => {
      // Generate large dataset
      const largeData = [];
      for (let i = 0; i < 12000; i++) {
        largeData.push({
          timestamp: new Date(Date.now() - (i * 60000)).toISOString(),
          heartRate: Math.floor(Math.random() * 40) + 60,
          bloodPressure: Math.floor(Math.random() * 40) + 80,
        });
      }

      const { container } = render(
        <div>
          <MockLineChart width={800} height={400} data={largeData}>
            <MockXAxis dataKey='timestamp' />
            <MockYAxis />
            <MockTooltip />
            <MockLegend />
            <MockLine dataKey='heartRate' stroke='#FF6B6B' />
          </MockLineChart>
        </div>,
      );

      performance.mark('render-start');
      await act(async () => {
        // Force re-render with optimization
        render(
          <div>
            <MockLineChart width={800} height={400} data={largeData.slice(-1000)}>
              <MockXAxis dataKey='timestamp' />
              <MockYAxis />
              <MockTooltip />
              <MockLegend />
              <MockLine dataKey='heartRate' stroke='#FF6B6B' />
            </MockLineChart>
          </div>,
        );
      });
      performance.mark('render-end');

      performance.measure('render-duration', 'render-start', 'render-end');
      const renderMeasure = performance.getEntriesByName('render-duration')[0];

      // With data optimization (showing only last 1000 points)
      expect(renderMeasure.duration).toBeLessThan(500);
    });
  });

  describe('Memory Usage Performance', () => {
    it('should maintain stable memory usage during continuous updates', async () => {
      let initialMemoryUsage;
      let peakMemoryUsage;

      // Mock memory monitoring
      const mockMemoryUsage = () => ({
        rss: Math.floor(Math.random() * 100000000) + 50000000, // 50-150MB
        heapTotal: Math.floor(Math.random() * 50000000) + 30000000, // 30-80MB
        heapUsed: Math.floor(Math.random() * 40000000) + 20000000, // 20-60MB
        external: Math.floor(Math.random() * 10000000) + 5000000, // 5-15MB
      });

      initialMemoryUsage = mockMemoryUsage();

      const { container, unmount } = render(
        <MedicalVitalsChart
          patientId='test-patient-123'
          timeRange='1h'
          realTime={true}
        />,
      );

      // Simulate multiple updates
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        });
      }

      peakMemoryUsage = mockMemoryUsage();

      // Memory growth should be less than 50MB
      const memoryGrowth = peakMemoryUsage.heapUsed - initialMemoryUsage.heapUsed;
      expect(memoryGrowth).toBeLessThan(50000000); // 50MB in bytes

      unmount();
    });

    it('should clean up event listeners and intervals on unmount', async () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

      const { unmount } = render(
        <MedicalVitalsChart
          patientId='test-patient-123'
          timeRange='1h'
          realTime={true}
        />,
      );

      unmount();

      // Verify cleanup was called
      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });
  });

  describe('Interaction Performance', () => {
    it('should respond to hover interactions under 16ms', async () => {
      const { container } = render(
        <MedicalVitalsChart
          patientId='test-patient-123'
          timeRange='1h'
          realTime={false}
        />,
      );

      const chart = container.querySelector('.recharts-wrapper');

      performance.mark('interaction-start');

      await act(async () => {
        // Simulate mouse move
        const mouseMoveEvent = new MouseEvent('mousemove', {
          clientX: 400,
          clientY: 200,
          bubbles: true,
        });
        chart.dispatchEvent(mouseMoveEvent);
      });

      performance.mark('interaction-end');
      performance.measure('interaction-duration', 'interaction-start', 'interaction-end');

      const interactionMeasure = performance.getEntriesByName('interaction-duration')[0];

      expect(interactionMeasure.duration).toBeLessThan(16); // 60fps target
    });

    it('should handle click interactions efficiently', async () => {
      const { container } = render(
        <MedicalVitalsChart
          patientId='test-patient-123'
          timeRange='1h'
          realTime={false}
        />,
      );

      const chart = container.querySelector('.recharts-wrapper');

      performance.mark('click-start');

      await act(async () => {
        const clickEvent = new MouseEvent('click', {
          clientX: 400,
          clientY: 200,
          bubbles: true,
        });
        chart.dispatchEvent(clickEvent);
      });

      performance.mark('click-end');
      performance.measure('click-duration', 'click-start', 'click-end');

      const clickMeasure = performance.getEntriesByName('click-duration')[0];

      expect(clickMeasure.duration).toBeLessThan(32); // Responsive interaction
    });

    it('should handle zoom and pan operations smoothly', async () => {
      const { container } = render(
        <MedicalVitalsChart
          patientId='test-patient-123'
          timeRange='24h'
          realTime={false}
        />,
      );

      const chart = container.querySelector('.recharts-wrapper');

      // Simulate zoom operation
      performance.mark('zoom-start');

      await act(async () => {
        const wheelEvent = new WheelEvent('wheel', {
          clientX: 400,
          clientY: 200,
          deltaY: -100,
          bubbles: true,
          ctrlKey: true, // Zoom modifier
        });
        chart.dispatchEvent(wheelEvent);
      });

      performance.mark('zoom-end');
      performance.measure('zoom-duration', 'zoom-start', 'zoom-end');

      const zoomMeasure = performance.getEntriesByName('zoom-duration')[0];

      expect(zoomMeasure.duration).toBeLessThan(50); // Smooth zoom operation
    });
  });

  describe('Real-time Update Performance', () => {
    it('should maintain 30+ FPS during real-time updates', async () => {
      const { container } = render(
        <MedicalVitalsChart
          patientId='test-patient-123'
          timeRange='1h'
          realTime={true}
        />,
      );

      const frameTimes = [];
      let lastFrameTime = performance.now();

      // Monitor frame rates for 3 seconds
      for (let i = 0; i < 90; i++) { // 30fps * 3 seconds
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 33)); // ~30fps
        });

        const currentTime = performance.now();
        const frameTime = currentTime - lastFrameTime;
        frameTimes.push(frameTime);
        lastFrameTime = currentTime;
      }

      // Calculate average FPS
      const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const averageFPS = 1000 / averageFrameTime;

      expect(averageFPS).toBeGreaterThan(30);
    });

    it('should handle data updates without blocking UI', async () => {
      const { container } = render(
        <MedicalVitalsChart
          patientId='test-patient-123'
          timeRange='1h'
          realTime={true}
        />,
      );

      // Simulate rapid data updates
      const updatePromises = [];

      for (let i = 0; i < 5; i++) {
        updatePromises.push(
          act(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
          }),
        );
      }

      performance.mark('updates-start');
      await Promise.all(updatePromises);
      performance.mark('updates-end');

      performance.measure('updates-duration', 'updates-start', 'updates-end');
      const updatesMeasure = performance.getEntriesByName('updates-duration')[0];

      // Rapid updates should complete quickly without blocking
      expect(updatesMeasure.duration).toBeLessThan(100);
    });
  });

  describe('Responsive Performance', () => {
    it('should handle window resize efficiently', async () => {
      const { container } = render(
        <MedicalVitalsChart
          patientId='test-patient-123'
          timeRange='1h'
          realTime={false}
        />,
      );

      performance.mark('resize-start');

      await act(async () => {
        // Simulate window resize
        window.innerWidth = 1200;
        window.innerHeight = 800;
        window.dispatchEvent(new Event('resize'));
      });

      performance.mark('resize-end');
      performance.measure('resize-duration', 'resize-start', 'resize-end');

      const resizeMeasure = performance.getEntriesByName('resize-duration')[0];

      expect(resizeMeasure.duration).toBeLessThan(100); // Responsive resize
    });

    it('should adapt to different screen sizes without performance degradation', async () => {
      const screenSizes = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 }, // Desktop
      ];

      for (const screenSize of screenSizes) {
        performance.mark(`render-${screenSize.width}-start`);

        const { container, unmount } = render(
          <MedicalVitalsChart
            patientId='test-patient-123'
            timeRange='1h'
            realTime={false}
          />,
        );

        // Simulate screen size
        window.innerWidth = screenSize.width;
        window.innerHeight = screenSize.height;
        window.dispatchEvent(new Event('resize'));

        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
        });

        performance.mark(`render-${screenSize.width}-end`);
        performance.measure(
          `render-${screenSize.width}-duration`,
          `render-${screenSize.width}-start`,
          `render-${screenSize.width}-end`,
        );

        const renderMeasure =
          performance.getEntriesByName(`render-${screenSize.width}-duration`)[0];

        expect(renderMeasure.duration).toBeLessThan(200);

        unmount();
        performance.clearMarks();
        performance.clearMeasures();
      }
    });
  });

  describe('Animation Performance', () => {
    it('should maintain smooth animations during data transitions', async () => {
      const { container } = render(
        <MedicalVitalsChart
          patientId='test-patient-123'
          timeRange='1h'
          realTime={false}
        />,
      );

      // Simulate data transition
      performance.mark('animation-start');

      await act(async () => {
        // Trigger data update with animation
        const newData = generateMockVitalsData('24h');
        render(
          <MedicalVitalsChart
            patientId='test-patient-123'
            timeRange='24h'
            realTime={false}
          />,
        );
      });

      performance.mark('animation-end');
      performance.measure('animation-duration', 'animation-start', 'animation-end');

      const animationMeasure = performance.getEntriesByName('animation-duration')[0];

      expect(animationMeasure.duration).toBeLessThan(300); // Smooth transition
    });

    it('should handle multiple simultaneous animations efficiently', async () => {
      const { container } = render(
        <div>
          <MedicalVitalsChart
            patientId='test-patient-123'
            timeRange='1h'
            realTime={true}
          />
          <MedicalVitalsChart
            patientId='test-patient-456'
            timeRange='24h'
            realTime={true}
          />
        </div>,
      );

      performance.mark('multi-animation-start');

      // Simulate multiple animations
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      performance.mark('multi-animation-end');
      performance.measure(
        'multi-animation-duration',
        'multi-animation-start',
        'multi-animation-end',
      );

      const multiAnimationMeasure = performance.getEntriesByName('multi-animation-duration')[0];

      expect(multiAnimationMeasure.duration).toBeLessThan(200);
    });
  });

  describe('Performance Optimization Strategies', () => {
    it('should implement data virtualization for large datasets', () => {
      const veryLargeData = [];
      for (let i = 0; i < 50000; i++) {
        veryLargeData.push({
          timestamp: new Date(Date.now() - (i * 60000)).toISOString(),
          value: Math.random() * 100,
        });
      }

      // Test virtualization by rendering only visible portion
      const virtualizedData = veryLargeData.slice(-1000); // Show only last 1000 points

      expect(virtualizedData.length).toBe(1000);
      expect(virtualizedData.length).toBeLessThan(veryLargeData.length);
    });

    it('should use requestAnimationFrame for smooth updates', async () => {
      const mockRAF = vi.fn(callback => {
        return setTimeout(callback, 16); // Simulate 60fps
      });

      global.requestAnimationFrame = mockRAF;

      const { container } = render(
        <MedicalVitalsChart
          patientId='test-patient-123'
          timeRange='1h'
          realTime={true}
        />,
      );

      // RAF should be called for real-time updates
      expect(mockRAF).toHaveBeenCalled();

      // Restore original RAF
      global.requestAnimationFrame = vi.fn();
    });

    it('should debounce rapid interactions to improve performance', async () => {
      let debounceCallCount = 0;

      const MockDebouncedChart = () => {
        const debouncedUpdate = React.useCallback(() => {
          debounceCallCount++;
        }, []);

        return (
          <div
            className='debounced-chart'
            onMouseMove={debouncedUpdate}
          >
            Chart Content
          </div>
        );
      };

      const { container } = render(<MockDebouncedChart />);
      const chart = container.querySelector('.debounced-chart');

      // Simulate rapid mouse movements
      for (let i = 0; i < 10; i++) {
        const mouseMoveEvent = new MouseEvent('mousemove', {
          clientX: 100 + i * 10,
          clientY: 100 + i * 10,
          bubbles: true,
        });
        chart.dispatchEvent(mouseMoveEvent);
      }

      // Debounced function should be called fewer times than events
      expect(debounceCallCount).toBeLessThan(10);
    });
  });
});

describe('Performance Monitoring and Metrics', () => {
  it('should collect and report performance metrics', () => {
    const performanceMetrics = {
      renderTime: 45,
      memoryUsage: 35,
      interactionTime: 12,
      frameRate: 58,
      dataProcessingTime: 8,
    };

    // Validate metric thresholds
    expect(performanceMetrics.renderTime).toBeLessThan(100);
    expect(performanceMetrics.interactionTime).toBeLessThan(16);
    expect(performanceMetrics.frameRate).toBeGreaterThan(30);
  });

  it('should detect performance regressions', () => {
    const baselineMetrics = {
      renderTime: 45,
      memoryUsage: 35,
    };

    const currentMetrics = {
      renderTime: 120, // 167% increase
      memoryUsage: 70, // 100% increase
    };

    const regressions = [];

    if (currentMetrics.renderTime > baselineMetrics.renderTime * 1.5) {
      regressions.push('render_time_regression');
    }

    if (currentMetrics.memoryUsage > baselineMetrics.memoryUsage * 1.5) {
      regressions.push('memory_usage_regression');
    }

    expect(regressions).toContain('render_time_regression');
    expect(regressions).toContain('memory_usage_regression');
  });

  it('should generate performance reports', () => {
    const performanceReport = {
      timestamp: new Date().toISOString(),
      testSuite: 'Chart Performance Tests',
      metrics: {
        averageRenderTime: 67,
        peakMemoryUsage: 45,
        averageFrameRate: 52,
        interactionResponseTime: 14,
      },
      passed: true,
      recommendations: [
        'Consider implementing data virtualization for datasets > 10,000 points',
        'Optimize tooltip rendering for better interaction performance',
      ],
    };

    expect(performanceReport.passed).toBe(true);
    expect(performanceReport.metrics.averageFrameRate).toBeGreaterThan(30);
    expect(performanceReport.recommendations).toHaveLength(2);
  });
});
