import React from 'react';

interface AnalyticsMetric {
  id: string;
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

interface AnalyticsDashboardProps {
  metrics?: AnalyticsMetric[];
  loading?: boolean;
  title?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  metrics = [],
  loading = false,
  title = 'Analytics Dashboard',
  dateRange
}) => {
  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow" data-testid="loading-state">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow" data-testid="analytics-dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {dateRange && (
          <p className="text-sm text-gray-500 mt-1">
            {dateRange.start} - {dateRange.end}
          </p>
        )}
      </div>

      {metrics.length === 0 ? (
        <div className="text-center py-8 text-gray-500" data-testid="empty-state">
          No analytics data available
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="metrics-grid">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              data-testid={`metric-${metric.id}`}
            >
              <h3 className="text-sm font-medium text-gray-500 mb-2">{metric.label}</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                {metric.change !== undefined && (
                  <span className={`text-sm font-medium flex items-center ${
                    metric.trend === 'up' ? 'text-green-600' :
                    metric.trend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {metric.trend === 'up' && '↗'}
                    {metric.trend === 'down' && '↘'}
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
