/**
 * Story 11.2: Prediction Overview Component
 * Comprehensive overview of no-show predictions with risk visualization and insights
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Calendar,
  User,
  Phone,
  MessageSquare,
  Target,
  Activity
} from 'lucide-react';
import type { 
  NoShowPrediction, 
  PatientRiskProfile,
  RiskFactor
} from '@/lib/analytics/no-show-prediction';
import { 
  formatRiskScore, 
  getRiskColor, 
  getRiskBadgeColor 
} from '@/lib/analytics/no-show-prediction';

interface PredictionOverviewProps {
  predictions: NoShowPrediction[];
  riskProfiles: PatientRiskProfile[];
  timeRange: '24h' | '7d' | '30d' | '90d';
  onTimeRangeChange: (range: '24h' | '7d' | '30d' | '90d') => void;
  riskLevelFilter: 'ALL' | 'HIGH' | 'CRITICAL';
  onRiskLevelChange: (level: 'ALL' | 'HIGH' | 'CRITICAL') => void;
}

interface PredictionSummaryData {
  riskDistribution: Array<{ level: string; count: number; color: string }>;
  timeDistribution: Array<{ hour: string; predictions: number; avgRisk: number }>;
  riskTrends: Array<{ date: string; avgRisk: number; count: number }>;
  topRiskFactors: Array<{ factor: string; impact: number; frequency: number }>;
}

export function PredictionOverview({
  predictions,
  riskProfiles,
  timeRange,
  onTimeRangeChange,
  riskLevelFilter,
  onRiskLevelChange
}: PredictionOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'riskScore' | 'predictedAt' | 'patientName'>('riskScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPrediction, setSelectedPrediction] = useState<NoShowPrediction | null>(null);

  /**
   * Filter and sort predictions based on current criteria
   */
  const filteredPredictions = useMemo(() => {
    let filtered = predictions;

    // Apply risk level filter
    if (riskLevelFilter !== 'ALL') {
      filtered = filtered.filter(p => p.riskLevel === riskLevelFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.appointmentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'riskScore':
          comparison = a.riskScore - b.riskScore;
          break;
        case 'predictedAt':
          comparison = new Date(a.predictedAt).getTime() - new Date(b.predictedAt).getTime();
          break;
        case 'patientName':
          comparison = a.patientId.localeCompare(b.patientId);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [predictions, riskLevelFilter, searchTerm, sortBy, sortOrder]);

  /**
   * Generate summary analytics data
   */
  const summaryData = useMemo((): PredictionSummaryData => {
    // Risk level distribution
    const riskDistribution = [
      { 
        level: 'LOW', 
        count: predictions.filter(p => p.riskLevel === 'LOW').length,
        color: '#10B981'
      },
      { 
        level: 'MEDIUM', 
        count: predictions.filter(p => p.riskLevel === 'MEDIUM').length,
        color: '#F59E0B'
      },
      { 
        level: 'HIGH', 
        count: predictions.filter(p => p.riskLevel === 'HIGH').length,
        color: '#F97316'
      },
      { 
        level: 'CRITICAL', 
        count: predictions.filter(p => p.riskLevel === 'CRITICAL').length,
        color: '#EF4444'
      }
    ];

    // Time-based distribution (hourly)
    const timeDistribution = Array.from({ length: 24 }, (_, hour) => {
      const hourPredictions = predictions.filter(p => {
        const predHour = new Date(p.predictedAt).getHours();
        return predHour === hour;
      });

      const avgRisk = hourPredictions.length > 0
        ? hourPredictions.reduce((sum, p) => sum + p.riskScore, 0) / hourPredictions.length
        : 0;

      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        predictions: hourPredictions.length,
        avgRisk: Math.round(avgRisk)
      };
    });

    // Risk trends over time (daily for last 7 days)
    const riskTrends = Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - dayIndex));
      
      const dayPredictions = predictions.filter(p => {
        const predDate = new Date(p.predictedAt);
        return predDate.toDateString() === date.toDateString();
      });

      const avgRisk = dayPredictions.length > 0
        ? dayPredictions.reduce((sum, p) => sum + p.riskScore, 0) / dayPredictions.length
        : 0;

      return {
        date: date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        avgRisk: Math.round(avgRisk),
        count: dayPredictions.length
      };
    });

    // Top risk factors analysis
    const factorImpacts: Record<string, { impact: number; frequency: number }> = {};
    
    predictions.forEach(prediction => {
      prediction.factors.forEach(factor => {
        if (!factorImpacts[factor.factorName]) {
          factorImpacts[factor.factorName] = { impact: 0, frequency: 0 };
        }
        factorImpacts[factor.factorName].impact += factor.contribution;
        factorImpacts[factor.factorName].frequency += 1;
      });
    });

    const topRiskFactors = Object.entries(factorImpacts)
      .map(([factor, data]) => ({
        factor,
        impact: Math.round(data.impact / data.frequency), // Average impact
        frequency: data.frequency
      }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 10);

    return {
      riskDistribution,
      timeDistribution,
      riskTrends,
      topRiskFactors
    };
  }, [predictions]);

  /**
   * Get recommendation for a specific prediction
   */
  const getRecommendation = (prediction: NoShowPrediction): string => {
    const recommendations = prediction.interventionRecommendations;
    if (recommendations.length === 0) return 'No specific intervention required';
    
    const highestPriority = recommendations.sort((a, b) => {
      const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })[0];

    return highestPriority.message;
  };

  /**
   * Format confidence level for display
   */
  const formatConfidence = (confidence: number): string => {
    const percentage = Math.round(confidence * 100);
    if (percentage >= 90) return 'Very High';
    if (percentage >= 70) return 'High';
    if (percentage >= 50) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <div className="text-xs text-muted-foreground">
              {filteredPredictions.length} after filters
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {predictions.length > 0 
                ? Math.round(predictions.reduce((sum, p) => sum + p.riskScore, 0) / predictions.length)
                : 0}%
            </div>
            <div className="text-xs text-muted-foreground">
              Across all patients
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Risk Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {predictions.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length}
            </div>
            <div className="text-xs text-muted-foreground">
              Requiring intervention
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Model Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {predictions.length > 0 
                ? Math.round((predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length) * 100)
                : 0}%
            </div>
            <div className="text-xs text-muted-foreground">
              Average confidence
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Risk Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summaryData.riskDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ level, count, percent }) => 
                    `${level}: ${count} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {summaryData.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Hourly Prediction Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={summaryData.timeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip 
                  labelFormatter={(hour) => `Time: ${hour}`}
                  formatter={(value, name) => [
                    value,
                    name === 'predictions' ? 'Predictions' : 'Avg Risk %'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="predictions" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgRisk" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Trends and Top Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Risk Trends (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={summaryData.riskTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    value,
                    name === 'avgRisk' ? 'Avg Risk %' : 'Count'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgRisk" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                />
                <Bar dataKey="count" fill="#3B82F6" opacity={0.3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Risk Factors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Top Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summaryData.topRiskFactors.slice(0, 8).map((factor, index) => (
                <div key={factor.factor} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{factor.factor}</div>
                    <div className="text-xs text-muted-foreground">
                      Frequency: {factor.frequency} patients
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={factor.impact} className="w-16 h-2" />
                    <span className="text-sm font-medium">{factor.impact}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Prediction Details
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Search by patient ID or appointment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={riskLevelFilter} onValueChange={onRiskLevelChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Risk Levels</SelectItem>
                <SelectItem value="HIGH">High Risk Only</SelectItem>
                <SelectItem value="CRITICAL">Critical Risk Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="riskScore">Risk Score</SelectItem>
                <SelectItem value="predictedAt">Prediction Time</SelectItem>
                <SelectItem value="patientName">Patient ID</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Predictions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Top Risk Factor</TableHead>
                  <TableHead>Recommendation</TableHead>
                  <TableHead>Predicted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPredictions.slice(0, 20).map((prediction) => {
                  const topFactor = prediction.factors.sort((a, b) => b.contribution - a.contribution)[0];
                  
                  return (
                    <TableRow 
                      key={prediction.appointmentId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedPrediction(prediction)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {prediction.patientId.slice(-8)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={prediction.riskScore} className="w-16 h-2" />
                          <span className="font-medium">{prediction.riskScore}%</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getRiskBadgeColor(prediction.riskLevel)}>
                          {prediction.riskLevel}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">
                          {formatConfidence(prediction.confidence)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {topFactor ? topFactor.factorName : 'None'}
                        </div>
                        {topFactor && (
                          <div className="text-xs text-muted-foreground">
                            +{topFactor.contribution.toFixed(1)}% impact
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell className="max-w-xs">
                        <div className="text-sm truncate">
                          {getRecommendation(prediction)}
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(prediction.predictedAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredPredictions.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No predictions found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search criteria
              </p>
            </div>
          )}

          {filteredPredictions.length > 20 && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Showing 20 of {filteredPredictions.length} predictions.
                Use filters to narrow down results.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Prediction Details Modal/Card */}
      {selectedPrediction && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Prediction Details</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedPrediction(null)}
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-medium">Prediction Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patient ID:</span>
                    <span className="font-medium">{selectedPrediction.patientId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Score:</span>
                    <span className={`font-bold ${getRiskColor(selectedPrediction.riskLevel)}`}>
                      {selectedPrediction.riskScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="font-medium">
                      {formatConfidence(selectedPrediction.confidence)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model Version:</span>
                    <span className="font-medium">{selectedPrediction.modelVersion}</span>
                  </div>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="space-y-4">
                <h4 className="font-medium">Risk Factors</h4>
                <div className="space-y-2">
                  {selectedPrediction.factors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{factor.factorName}</div>
                        <div className="text-xs text-muted-foreground">
                          {factor.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          +{factor.contribution.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Weight: {(factor.weight * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Intervention Recommendations */}
            {selectedPrediction.interventionRecommendations.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-4">Recommended Interventions</h4>
                <div className="space-y-3">
                  {selectedPrediction.interventionRecommendations.map((intervention, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{intervention.type}</div>
                            <div className="text-sm">{intervention.message}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Channel: {intervention.channel} | Timing: {intervention.timing}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              intervention.priority === 'URGENT' ? 'destructive' :
                              intervention.priority === 'HIGH' ? 'default' : 'secondary'
                            }>
                              {intervention.priority}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {(intervention.effectiveness * 100).toFixed(0)}% effective
                            </div>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
