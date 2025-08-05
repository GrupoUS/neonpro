/**
 * Pricing Optimization Panel Component
 *
 * Displays pricing strategies and optimization recommendations
 */
'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingOptimizationPanel = PricingOptimizationPanel;
exports.ServiceMixChart = ServiceMixChart;
exports.CLVEnhancementPanel = CLVEnhancementPanel;
exports.CompetitiveAnalysisChart = CompetitiveAnalysisChart;
exports.ROITrackingPanel = ROITrackingPanel;
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
function PricingOptimizationPanel(_a) {
    var pricingData = _a.pricingData, clinicId = _a.clinicId;
    return (<div className="grid gap-4 md:grid-cols-2">
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.DollarSign className="h-5 w-5"/>
            Current Pricing Strategy
          </card_1.CardTitle>
          <card_1.CardDescription>
            Active pricing models and configurations
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          {pricingData.currentStrategy ? (<div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Strategy Name</span>
                <badge_1.Badge variant="outline">{pricingData.currentStrategy.strategy_name}</badge_1.Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Type</span>
                <span className="text-sm">{pricingData.currentStrategy.strategy_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Base Price</span>
                <span className="text-sm font-mono">R$ {pricingData.currentStrategy.base_price}</span>
              </div>
            </div>) : (<div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">No active pricing strategy</p>
              <button_1.Button size="sm">
                <lucide_react_1.Settings className="h-4 w-4 mr-1"/>
                Configure Strategy
              </button_1.Button>
            </div>)}
        </card_1.CardContent>
      </card_1.Card>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.TrendingUp className="h-5 w-5"/>
            Optimization Recommendations
          </card_1.CardTitle>
          <card_1.CardDescription>
            AI-powered pricing improvement suggestions
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Projected Increase</span>
              <badge_1.Badge variant="outline" className="text-green-600">
                +{pricingData.projectedIncrease.toFixed(1)}%
              </badge_1.Badge>
            </div>
            
            <div className="space-y-2">
              {pricingData.recommendations.map(function (recommendation, index) { return (<div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                  <lucide_react_1.Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0"/>
                  <span className="text-sm">{recommendation}</span>
                </div>); })}
            </div>

            <button_1.Button className="w-full mt-4" size="sm">
              Apply Recommendations
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
// Placeholder components for other panels
function ServiceMixChart(_a) {
    var serviceMixData = _a.serviceMixData, clinicId = _a.clinicId;
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Service Mix Optimization</card_1.CardTitle>
        <card_1.CardDescription>
          Optimize service allocation for maximum profitability
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Profitability Gain: +{serviceMixData.profitabilityGain.toFixed(1)}%
          </p>
          <div className="mt-4 space-y-2">
            {serviceMixData.recommendations.map(function (rec, index) { return (<div key={index} className="text-sm p-2 bg-gray-50 rounded">
                {rec}
              </div>); })}
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
function CLVEnhancementPanel(_a) {
    var clvData = _a.clvData, clinicId = _a.clinicId;
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Customer Lifetime Value Enhancement</card_1.CardTitle>
        <card_1.CardDescription>
          Strategies to increase customer value and retention
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            Projected CLV Increase: +{clvData.projectedIncrease.toFixed(1)}%
          </p>
          <div className="mt-4 space-y-2">
            {clvData.enhancementStrategies.map(function (strategy, index) { return (<div key={index} className="text-sm p-2 bg-gray-50 rounded">
                {strategy}
              </div>); })}
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
function CompetitiveAnalysisChart(_a) {
    var competitiveData = _a.competitiveData, clinicId = _a.clinicId;
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>Competitive Analysis</card_1.CardTitle>
        <card_1.CardDescription>
          Market positioning and competitive intelligence
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-4">
            Market Position: {competitiveData.marketPosition}
          </p>
          <div className="space-y-2">
            {competitiveData.opportunityAreas.map(function (area, index) { return (<div key={index} className="text-sm p-2 bg-gray-50 rounded">
                {area}
              </div>); })}
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
function ROITrackingPanel(_a) {
    var performanceData = _a.performanceData, clinicId = _a.clinicId;
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle>ROI Performance Tracking</card_1.CardTitle>
        <card_1.CardDescription>
          Track return on investment for optimization initiatives
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
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
            {performanceData.recommendations.map(function (rec, index) { return (<div key={index} className="text-sm p-2 bg-gray-50 rounded">
                {rec}
              </div>); })}
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
