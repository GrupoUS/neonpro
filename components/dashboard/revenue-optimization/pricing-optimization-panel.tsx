/**
 * Pricing Optimization Panel Component
 * 
 * Displays pricing strategies and optimization recommendations
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Settings, Lightbulb } from 'lucide-react';

interface PricingOptimizationPanelProps {
  pricingData: {
    currentStrategy: any;
    recommendations: string[];
    projectedIncrease: number;
  };
  clinicId: string;
}

export function PricingOptimizationPanel({ pricingData, clinicId }: PricingOptimizationPanelProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Current Pricing Strategy
          </CardTitle>
          <CardDescription>
            Active pricing models and configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pricingData.currentStrategy ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Strategy Name</span>
                <Badge variant="outline">{pricingData.currentStrategy.strategy_name}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Type</span>
                <span className="text-sm">{pricingData.currentStrategy.strategy_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Base Price</span>
                <span className="text-sm font-mono">R$ {pricingData.currentStrategy.base_price}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">No active pricing strategy</p>
              <Button size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Configure Strategy
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Optimization Recommendations
          </CardTitle>
          <CardDescription>
            AI-powered pricing improvement suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Projected Increase</span>
              <Badge variant="outline" className="text-green-600">
                +{pricingData.projectedIncrease.toFixed(1)}%
              </Badge>
            </div>
            
            <div className="space-y-2">
              {pricingData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                  <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>

            <Button className="w-full mt-4" size="sm">
              Apply Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Placeholder components for other panels
export function ServiceMixChart({ serviceMixData, clinicId }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Mix Optimization</CardTitle>
        <CardDescription>
          Optimize service allocation for maximum profitability
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Profitability Gain: +{serviceMixData.profitabilityGain.toFixed(1)}%
          </p>
          <div className="mt-4 space-y-2">
            {serviceMixData.recommendations.map((rec: string, index: number) => (
              <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                {rec}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CLVEnhancementPanel({ clvData, clinicId }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Lifetime Value Enhancement</CardTitle>
        <CardDescription>
          Strategies to increase customer value and retention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Projected CLV Increase: +{clvData.projectedIncrease.toFixed(1)}%
          </p>
          <div className="mt-4 space-y-2">
            {clvData.enhancementStrategies.map((strategy: string, index: number) => (
              <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                {strategy}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompetitiveAnalysisChart({ competitiveData, clinicId }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Competitive Analysis</CardTitle>
        <CardDescription>
          Market positioning and competitive intelligence
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-4">
            Market Position: {competitiveData.marketPosition}
          </p>
          <div className="space-y-2">
            {competitiveData.opportunityAreas.map((area: string, index: number) => (
              <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                {area}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ROITrackingPanel({ performanceData, clinicId }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ROI Performance Tracking</CardTitle>
        <CardDescription>
          Track return on investment for optimization initiatives
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {performanceData.roiMetrics.length}
              </p>
              <p className="text-sm text-muted-foreground">Active ROI Tracking</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {performanceData.trendAnalysis.improving}
              </p>
              <p className="text-sm text-muted-foreground">Improving</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {performanceData.trendAnalysis.stable}
              </p>
              <p className="text-sm text-muted-foreground">Stable</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {performanceData.recommendations.map((rec: string, index: number) => (
              <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                {rec}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}