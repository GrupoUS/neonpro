import type React from 'react';

type AnalyticsMetric = {
  id: string;
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
};

type AnalyticsDashboardProps = {
  metrics?: AnalyticsMetric[];
  loading?: boolean;
  title?: string;
  dateRange?: {
    start: string;
    end: string;
  };
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  metrics = [],
  loading = false,
  title = 'Analytics Dashboard',
  dateRange
}) => {
  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow" data-testid="loading-state">
        <div className="animate-pulse">
          <div className="mb-4 h-6 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...new Array(4)].map((_, i) => (
              <div className="h-24 rounded bg-gray-200" key={i} />
            ))}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow" data-testid="analytics-dashboard">
      <div className="mb-6">
        <h2 className="font-bold text-2xl text-gray-900">{title}</h2>
        {dateRange && (
          <p className="mt-1 text-gray-500 text-sm">
            {dateRange.start} - {dateRange.end}
          </p>
        )}
      </div>

      {metrics.length === 0 ? (
        <div className="py-8 text-center text-gray-500" data-testid="empty-state">
          No analytics data available
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="metrics-grid">
          {metrics.map((metric) => (
            <div
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              data-testid={`metric-${metric.id}`}
              key={metric.id}
            >
              <h3 className="mb-2 font-medium text-gray-500 text-sm">{metric.label}</h3>
              <div className="flex items-center justify-between">
                <span className="font-bold text-2xl text-gray-900">{metric.value}</span>
                {metric.change !== undefined && (
                  <span className={`flex items-center font-medium text-sm ${
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
