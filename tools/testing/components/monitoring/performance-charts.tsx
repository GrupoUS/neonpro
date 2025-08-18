// Performance charts component
import type React from 'react';

interface PerformanceChartsProps {
  data?: Array<{ timestamp: Date; value: number }>;
  title?: string;
}

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({
  data = [],
  title = 'Performance Metrics',
}) => {
  return (
    <div className="performance-charts">
      <h3>{title}</h3>
      <div className="chart-container">
        {data.length === 0 ? (
          <p>No performance data available</p>
        ) : (
          <div className="chart-placeholder">
            Chart: {data.length} data points
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceCharts;
