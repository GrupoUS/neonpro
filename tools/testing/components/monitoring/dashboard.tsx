// Monitoring dashboard component for NeonPro Healthcare System
import React from 'react';

interface MonitoringDashboardProps {
  metrics?: Record<string, number>;
  alerts?: string[];
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  metrics = {},
  alerts = []
}) => {
  return (
    <div className="monitoring-dashboard">
      <h2>System Monitoring Dashboard</h2>
      
      <div className="metrics-grid">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="metric-card">
            <span className="metric-name">{key}</span>
            <span className="metric-value">{value}</span>
          </div>
        ))}
      </div>

      {alerts.length > 0 && (
        <div className="alerts-section">
          <h3>Active Alerts</h3>
          {alerts.map((alert, index) => (
            <div key={index} className="alert-item">
              {alert}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonitoringDashboard;