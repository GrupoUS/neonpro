'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle,
  Target,
  Activity,
  Heart,
  BarChart3,
  Lightbulb,
  Shield
} from 'lucide-react';

interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high';
  impact_score: number;
  description: string;
  mitigation_strategies: string[];
}

interface RiskAssessment {
  overall_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: RiskFactor[];
  recommendations: string[];
  confidence: number;
  last_updated: string;
}

interface HealthTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'declining';
  change_rate: number;
  period_months: number;
  confidence: number;
  data_points: { date: string; value: number }[];
}

interface BehavioralPattern {
  pattern_type: 'appointment_adherence' | 'treatment_compliance' | 'communication_preference' | 'scheduling_preference';
  description: string;
  frequency: number;
  strength: number;
  actionable_insights: string[];
}

interface TreatmentPrediction {
  treatment_type: string;
  success_probability: number;
  expected_duration: string;
  optimal_frequency: string;
  contraindications: string[];
  supporting_factors: string[];
}

interface OptimizationSuggestion {
  category: 'scheduling' | 'treatment' | 'communication' | 'preventive';
  suggestion: string;
  impact_score: number;
  implementation_effort: 'low' | 'medium' | 'high';
  expected_outcome: string;
}

interface PatientInsights {
  health_trends: HealthTrend[];
  behavioral_patterns: BehavioralPattern[];
  treatment_predictions: TreatmentPrediction[];
  optimization_suggestions: OptimizationSuggestion[];
  risk_assessment: RiskAssessment;
}

interface AIInsightsDashboardProps {
  patientId: string;
}

export default function AIInsightsDashboard({ patientId }: AIInsightsDashboardProps) {
  const [insights, setInsights] = useState<PatientInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, [patientId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/patients/${patientId}/insights`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch patient insights');
      }

      const data = await response.json();
      setInsights(data.insights);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async () => {
    try {
      setGenerating(true);
      const response = await fetch(`/api/patients/${patientId}/insights`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate new insights');
      }

      await fetchInsights();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
    } finally {
      setGenerating(false);
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
          <Button onClick={fetchInsights} className="mt-4">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Generate AI Insights</h3>
          <p className="text-gray-600 mb-4">
            Analyze patient data to generate personalized insights and recommendations
          </p>
          <Button onClick={generateNewInsights} disabled={generating}>
            {generating ? 'Generating...' : 'Generate Insights'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Patient Insights</h2>
          <p className="text-gray-600">
            Last updated: {new Date(insights.risk_assessment.last_updated).toLocaleDateString()}
          </p>
        </div>
        <Button onClick={generateNewInsights} disabled={generating}>
          {generating ? 'Regenerating...' : 'Refresh Insights'}
        </Button>
      </div>

      {/* Risk Assessment Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Risk Assessment</CardTitle>
            </div>
            <Badge className={getRiskBadgeColor(insights.risk_assessment.risk_level)}>
              {insights.risk_assessment.risk_level.toUpperCase()} RISK
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Risk Score</span>
                <span className="text-sm font-bold">
                  {Math.round(insights.risk_assessment.overall_score * 100)}%
                </span>
              </div>
              <Progress 
                value={insights.risk_assessment.overall_score * 100} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Assessment Confidence</span>
                <span className="text-sm font-bold">
                  {Math.round(insights.risk_assessment.confidence * 100)}%
                </span>
              </div>
              <Progress 
                value={insights.risk_assessment.confidence * 100} 
                className="h-2"
              />
            </div>

            {insights.risk_assessment.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Key Recommendations</h4>
                <ul className="space-y-1">
                  {insights.risk_assessment.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Insights Tabs */}
      <Tabs defaultValue="risk-factors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risk-factors">Risk Factors</TabsTrigger>
          <TabsTrigger value="trends">Health Trends</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Risk Factors Tab */}
        <TabsContent value="risk-factors" className="space-y-4">
          <div className="grid gap-4">
            {insights.risk_assessment.risk_factors.map((factor, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{factor.factor.replace('_', ' ').toUpperCase()}</CardTitle>
                    <Badge className={getSeverityBadgeColor(factor.severity)}>
                      {factor.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription>{factor.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Impact Score</span>
                        <span className="text-sm font-bold">
                          {Math.round(factor.impact_score * 100)}%
                        </span>
                      </div>
                      <Progress value={factor.impact_score * 100} className="h-2" />
                    </div>
                    
                    {factor.mitigation_strategies.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Mitigation Strategies</h5>
                        <ul className="space-y-1">
                          {factor.mitigation_strategies.map((strategy, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <span className="mr-2">•</span>
                              {strategy}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Health Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4">
            {insights.health_trends.map((trend, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>{trend.metric.replace('_', ' ').toUpperCase()}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(trend.trend)}
                      <span className="text-sm font-medium capitalize">{trend.trend}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Change Rate:</span>
                        <span className="ml-2">{trend.change_rate.toFixed(3)}/month</span>
                      </div>
                      <div>
                        <span className="font-medium">Period:</span>
                        <span className="ml-2">{trend.period_months} months</span>
                      </div>
                      <div>
                        <span className="font-medium">Confidence:</span>
                        <span className="ml-2">{Math.round(trend.confidence * 100)}%</span>
                      </div>
                      <div>
                        <span className="font-medium">Data Points:</span>
                        <span className="ml-2">{trend.data_points.length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Treatment Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4">
            {insights.treatment_predictions.map((prediction, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>{prediction.treatment_type}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Success Probability</span>
                        <span className="text-sm font-bold">
                          {Math.round(prediction.success_probability * 100)}%
                        </span>
                      </div>
                      <Progress value={prediction.success_probability * 100} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Expected Duration:</span>
                        <span className="ml-2">{prediction.expected_duration}</span>
                      </div>
                      <div>
                        <span className="font-medium">Optimal Frequency:</span>
                        <span className="ml-2">{prediction.optimal_frequency}</span>
                      </div>
                    </div>

                    {prediction.supporting_factors.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2 text-green-700">Supporting Factors</h5>
                        <ul className="space-y-1">
                          {prediction.supporting_factors.map((factor, idx) => (
                            <li key={idx} className="text-sm text-green-600 flex items-start">
                              <span className="mr-2">✓</span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {prediction.contraindications.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2 text-red-700">Contraindications</h5>
                        <ul className="space-y-1">
                          {prediction.contraindications.map((contra, idx) => (
                            <li key={idx} className="text-sm text-red-600 flex items-start">
                              <span className="mr-2">⚠</span>
                              {contra}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Optimization Suggestions Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <div className="grid gap-4">
            {insights.optimization_suggestions.map((suggestion, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5" />
                      <span className="capitalize">{suggestion.category} Optimization</span>
                    </CardTitle>
                    <Badge variant="outline" className={getEffortColor(suggestion.implementation_effort)}>
                      {suggestion.implementation_effort.toUpperCase()} EFFORT
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">{suggestion.suggestion}</p>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Expected Impact</span>
                        <span className="text-sm font-bold">
                          {Math.round(suggestion.impact_score * 100)}%
                        </span>
                      </div>
                      <Progress value={suggestion.impact_score * 100} className="h-2" />
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium mb-1 text-blue-800">Expected Outcome</h5>
                      <p className="text-sm text-blue-700">{suggestion.expected_outcome}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}