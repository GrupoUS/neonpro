/**
 * 📱 NeonPro - Real-time Dashboard Client
 * 
 * Cliente React para dashboard de monitoramento em tempo real
 * com WebSocket integration e visualizações interativas.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface MetricValue {
  timestamp: number;
  value: number;
  metadata?: Record<string, any>;
}

interface Alert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: number;
  resolved: boolean;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  score: number;
  lastCheck: number;
  issues: string[];
}

interface DashboardData {
  health: HealthStatus;
  alerts: Alert[];
  metrics: Record<string, MetricValue[]>;
}

const COLORS = {
  healthy: '#10B981',
  degraded: '#F59E0B',
  down: '#EF4444',
  info: '#3B82F6',
  warning: '#F59E0B',
  error: '#EF4444',
  critical: '#DC2626'
};

export const RealTimeDashboard: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [data, setData] = useState<DashboardData>({
    health: { status: 'healthy', score: 100, lastCheck: Date.now(), issues: [] },
    alerts: [],
    metrics: {}
  });
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'alerts' | 'health'>('overview');

  // 🔌 Configurar WebSocket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3003');
    
    newSocket.on('connect', () => {
      setConnected(true);
      console.log('📱 Conectado ao monitor');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      console.log('📱 Desconectado do monitor');
    });

    newSocket.on('initial-data', (initialData: DashboardData) => {
      setData(initialData);
    });

    newSocket.on('health-update', (health: HealthStatus) => {
      setData(prev => ({ ...prev, health }));
    });

    newSocket.on('metrics-update', (update: { timestamp: number; metrics: any }) => {
      setData(prev => {
        const newMetrics = { ...prev.metrics };
        
        Object.entries(update.metrics).forEach(([key, value]) => {
          if (!newMetrics[key]) newMetrics[key] = [];
          newMetrics[key].push({
            timestamp: update.timestamp,
            value: value as number
          });
          
          // Manter apenas últimas 50 entradas
          if (newMetrics[key].length > 50) {
            newMetrics[key] = newMetrics[key].slice(-50);
          }
        });
        
        return { ...prev, metrics: newMetrics };
      });
    });

    newSocket.on('new-alert', (alert: Alert) => {
      setData(prev => ({
        ...prev,
        alerts: [alert, ...prev.alerts].slice(0, 20) // Manter últimos 20
      }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // 📊 Formatar dados para gráficos
  const formatMetricData = useCallback((metricName: string) => {
    const metrics = data.metrics[metricName] || [];
    return metrics.map(m => ({
      time: new Date(m.timestamp).toLocaleTimeString(),
      value: m.value,
      timestamp: m.timestamp
    }));
  }, [data.metrics]);

  // 🎨 Obter cor baseada no status
  const getStatusColor = (status: string) => {
    return COLORS[status as keyof typeof COLORS] || '#6B7280';
  };

  // 📈 Componente de métricas overview
  const MetricsOverview: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Object.entries(data.metrics).map(([key, values]) => {
        const latestValue = values[values.length - 1]?.value || 0;
        const previousValue = values[values.length - 2]?.value || latestValue;
        const trend = latestValue - previousValue;
        
        return (
          <div key={key} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {latestValue.toFixed(1)}%
                </p>
              </div>
              <div className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    latestValue >= 90 ? 'bg-green-500' :
                    latestValue >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(latestValue, 100)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // 🏥 Componente de status de saúde
  const HealthStatus: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          data.health.status === 'healthy' ? 'bg-green-100 text-green-800' :
          data.health.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {data.health.status.toUpperCase()}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Health Score</span>
          <span className="text-2xl font-bold text-gray-900">{data.health.score}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              data.health.score >= 90 ? 'bg-green-500' :
              data.health.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${data.health.score}%` }}
          />
        </div>
      </div>

      {data.health.issues.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Current Issues</h4>
          <ul className="space-y-1">
            {data.health.issues.map((issue, index) => (
              <li key={index} className="text-sm text-red-600 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  // 🚨 Componente de alertas
  const AlertsList: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {data.alerts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No alerts</p>
        ) : (
          data.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded border-l-4 ${
                alert.level === 'critical' ? 'border-red-500 bg-red-50' :
                alert.level === 'error' ? 'border-red-400 bg-red-50' :
                alert.level === 'warning' ? 'border-yellow-400 bg-yellow-50' :
                'border-blue-400 bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium uppercase ${
                  alert.level === 'critical' ? 'text-red-800' :
                  alert.level === 'error' ? 'text-red-700' :
                  alert.level === 'warning' ? 'text-yellow-700' :
                  'text-blue-700'
                }`}>
                  {alert.level}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-800 mt-1">{alert.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // 📊 Componente de gráficos de métricas
  const MetricsCharts: React.FC = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Object.keys(data.metrics).map((metricName) => {
        const chartData = formatMetricData(metricName);
        
        return (
          <div key={metricName} className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
              {metricName.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(label) => `Time: ${label}`}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, metricName]}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                📈 NeonPro Quality Monitor
              </h1>
              <div className={`ml-4 flex items-center ${
                connected ? 'text-green-600' : 'text-red-600'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  connected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm font-medium">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            
            <nav className="flex space-x-4">
              {['overview', 'metrics', 'alerts', 'health'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-3 py-2 rounded-md text-sm font-medium capitalize ${
                    activeTab === tab
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div>
            <MetricsOverview />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HealthStatus />
              <AlertsList />
            </div>
          </div>
        )}
        
        {activeTab === 'metrics' && <MetricsCharts />}
        
        {activeTab === 'alerts' && (
          <div className="max-w-4xl">
            <AlertsList />
          </div>
        )}
        
        {activeTab === 'health' && (
          <div className="max-w-2xl">
            <HealthStatus />
          </div>
        )}
      </main>
    </div>
  );
};

export default RealTimeDashboard;