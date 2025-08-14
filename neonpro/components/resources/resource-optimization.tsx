// =====================================================
// Resource Optimization Dashboard Component
// Story 2.4: Smart Resource Management - Frontend
// =====================================================

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUpIcon, 
  TrendingDownIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  LightBulbIcon,
  CalendarIcon,
  WrenchIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

// =====================================================
// Types
// =====================================================

interface OptimizationMetrics {
  utilization_rate: number;
  efficiency_score: number;
  cost_effectiveness: number;
  maintenance_compliance: number;
  trend_analysis: {
    utilization_trend: 'up' | 'down' | 'stable';
    efficiency_trend: 'up' | 'down' | 'stable';
    cost_trend: 'up' | 'down' | 'stable';
  };
}

interface ResourceUtilization {
  resource_id: string;
  resource_name: string;
  resource_type: string;
  total_hours: number;
  allocated_hours: number;
  utilization_percentage: number;
  revenue_generated: number;
  cost_per_hour: number;
  efficiency_score: number;
}

interface OptimizationSuggestion {
  id: string;
  resource_id: string;
  resource_name: string;
  suggestion_type: 'schedule_optimization' | 'capacity_adjustment' | 'maintenance_planning' | 'cost_reduction';
  description: string;
  potential_impact: string;
  confidence_score: number;
  implementation_effort: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface TimeSeriesData {
  date: string;
  utilization: number;
  efficiency: number;
  revenue: number;
}

// =====================================================
// Resource Optimization Dashboard
// =====================================================

interface ResourceOptimizationProps {
  clinicId: string;
  userRole: string;
}

export default function ResourceOptimization({ clinicId, userRole }: ResourceOptimizationProps) {
  const [metrics, setMetrics] = useState<OptimizationMetrics | null>(null);
  const [utilization, setUtilization] = useState<ResourceUtilization[]>([]);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // =====================================================
  // Data Fetching
  // =====================================================

  useEffect(() => {
    fetchOptimizationData();
  }, [clinicId, selectedPeriod]);

  const fetchOptimizationData = async () => {
    try {
      setLoading(true);
      const [metricsRes, utilizationRes, suggestionsRes] = await Promise.all([
        fetch(`/api/resources/optimize/metrics?clinic_id=${clinicId}&period=${selectedPeriod}`),
        fetch(`/api/resources/optimize/utilization?clinic_id=${clinicId}&period=${selectedPeriod}`),
        fetch(`/api/resources/optimize/suggestions?clinic_id=${clinicId}`)
      ]);

      const [metricsData, utilizationData, suggestionsData] = await Promise.all([
        metricsRes.json(),
        utilizationRes.json(),
        suggestionsRes.json()
      ]);

      if (metricsData.success) setMetrics(metricsData.data);
      if (utilizationData.success) setUtilization(utilizationData.data);
      if (suggestionsData.success) setSuggestions(suggestionsData.data);

      // Generate mock time series data for charts
      generateTimeSeriesData();
    } catch (error) {
      console.error('Error fetching optimization data:', error);
      toast.error('Error loading optimization data');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSeriesData = () => {
    const days = parseInt(selectedPeriod);
    const data: TimeSeriesData[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString(),
        utilization: Math.random() * 40 + 60, // 60-100%
        efficiency: Math.random() * 30 + 70,  // 70-100%
        revenue: Math.random() * 2000 + 1000  // $1000-3000
      });
    }

    setTimeSeriesData(data);
  };

  // =====================================================
  // Optimization Actions
  // =====================================================

  const runOptimization = async () => {
    try {
      setOptimizing(true);
      const response = await fetch('/api/resources/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clinic_id: clinicId,
          optimization_type: 'full',
          period: selectedPeriod
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Optimization completed successfully');
        fetchOptimizationData();
      } else {
        toast.error('Optimization failed');
      }
    } catch (error) {
      console.error('Error running optimization:', error);
      toast.error('Error running optimization');
    } finally {
      setOptimizing(false);
    }
  };

  // =====================================================
  // UI Helpers
  // =====================================================

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'schedule_optimization': return <CalendarIcon className="h-5 w-5" />;
      case 'capacity_adjustment': return <ChartBarIcon className="h-5 w-5" />;
      case 'maintenance_planning': return <WrenchIcon className="h-5 w-5" />;
      case 'cost_reduction': return <CurrencyDollarIcon className="h-5 w-5" />;
      default: return <LightBulbIcon className="h-5 w-5" />;
    }
  };

  // =====================================================
  // Chart Colors
  // =====================================================

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // =====================================================
  // Render Components
  // =====================================================

  const MetricsOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
              <p className="text-2xl font-bold">
                {metrics?.utilization_rate ? `${Math.round(metrics.utilization_rate)}%` : 'N/A'}
              </p>
            </div>
            <div className="flex items-center">
              {metrics?.trend_analysis?.utilization_trend && getTrendIcon(metrics.trend_analysis.utilization_trend)}
            </div>
          </div>
          {metrics?.utilization_rate && (
            <Progress value={metrics.utilization_rate} className="mt-2" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Efficiency Score</p>
              <p className="text-2xl font-bold">
                {metrics?.efficiency_score ? `${Math.round(metrics.efficiency_score)}%` : 'N/A'}
              </p>
            </div>
            <div className="flex items-center">
              {metrics?.trend_analysis?.efficiency_trend && getTrendIcon(metrics.trend_analysis.efficiency_trend)}
            </div>
          </div>
          {metrics?.efficiency_score && (
            <Progress value={metrics.efficiency_score} className="mt-2" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cost Effectiveness</p>
              <p className="text-2xl font-bold">
                {metrics?.cost_effectiveness ? `${Math.round(metrics.cost_effectiveness)}%` : 'N/A'}
              </p>
            </div>
            <div className="flex items-center">
              {metrics?.trend_analysis?.cost_trend && getTrendIcon(metrics.trend_analysis.cost_trend)}
            </div>
          </div>
          {metrics?.cost_effectiveness && (
            <Progress value={metrics.cost_effectiveness} className="mt-2" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance Compliance</p>
              <p className="text-2xl font-bold">
                {metrics?.maintenance_compliance ? `${Math.round(metrics.maintenance_compliance)}%` : 'N/A'}
              </p>
            </div>
            <WrenchIcon className="h-6 w-6 text-gray-400" />
          </div>
          {metrics?.maintenance_compliance && (
            <Progress value={metrics.maintenance_compliance} className="mt-2" />
          )}
        </CardContent>
      </Card>
    </div>
  );

  const UtilizationChart = () => (
    <Card>
      <CardHeader>
        <CardTitle>Resource Utilization</CardTitle>
        <CardDescription>
          Utilization percentage by resource over the selected period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={utilization}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="resource_name" 
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [`${value}%`, 'Utilization']}
              labelFormatter={(label) => `Resource: ${label}`}
            />
            <Bar dataKey="utilization_percentage" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const TimeSeriesChart = () => (
    <Card>
      <CardHeader>
        <CardTitle>Trends Over Time</CardTitle>
        <CardDescription>
          Key metrics trends over the selected period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="utilization" stroke="#8884d8" name="Utilization %" />
            <Line type="monotone" dataKey="efficiency" stroke="#82ca9d" name="Efficiency %" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const SuggestionsList = () => (
    <Card>
      <CardHeader>
        <CardTitle>Optimization Suggestions</CardTitle>
        <CardDescription>
          AI-powered recommendations to improve resource efficiency
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No suggestions available</p>
          ) : (
            suggestions.map((suggestion) => (
              <div key={suggestion.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getSuggestionIcon(suggestion.suggestion_type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{suggestion.resource_name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {suggestion.description}
                      </div>
                      <div className="text-sm text-blue-600 mt-1">
                        <strong>Potential Impact:</strong> {suggestion.potential_impact}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Badge className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority}
                    </Badge>
                    <Badge className={getEffortColor(suggestion.implementation_effort)}>
                      {suggestion.implementation_effort} effort
                    </Badge>
                    <Badge variant="outline">
                      {Math.round(suggestion.confidence_score * 100)}% confidence
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  // =====================================================
  // Main Render
  // =====================================================

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Loading optimization data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resource Optimization</h1>
          <p className="text-gray-600 mt-2">
            AI-powered insights and recommendations for optimal resource utilization
          </p>
        </div>
        <div className="flex space-x-3">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          {userRole !== 'patient' && (
            <Button onClick={runOptimization} disabled={optimizing}>
              {optimizing ? 'Optimizing...' : 'Run Optimization'}
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Overview */}
      <MetricsOverview />

      {/* Charts and Analysis */}
      <Tabs defaultValue="utilization" className="w-full">
        <TabsList>
          <TabsTrigger value="utilization">Utilization Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>
        <TabsContent value="utilization" className="mt-6">
          <UtilizationChart />
        </TabsContent>
        <TabsContent value="trends" className="mt-6">
          <TimeSeriesChart />
        </TabsContent>
        <TabsContent value="suggestions" className="mt-6">
          <SuggestionsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}