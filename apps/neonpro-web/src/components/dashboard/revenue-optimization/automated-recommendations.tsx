/**
 * Automated Recommendations Component
 * 
 * Displays AI-powered revenue optimization recommendations
 * with implementation priorities and impact projections
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Lightbulb, 
  TrendingUp, 
  Clock, 
  Target, 
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Star
} from 'lucide-react';

interface Recommendation {
  type: string;
  priority: string;
  description: string;
  expectedImpact: number;
  implementationEffort: string;
  timeframe: string;
}

interface AutomatedRecommendationsProps {
  recommendations: Recommendation[];
  implementationPlan: string[];
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
  critical: 'bg-purple-100 text-purple-800 border-purple-200'
};

const effortColors = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-red-600'
};

export function AutomatedRecommendations({ 
  recommendations, 
  implementationPlan 
}: AutomatedRecommendationsProps) {
  
  const sortedRecommendations = recommendations.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority as keyof typeof priorityOrder] - 
           priorityOrder[a.priority as keyof typeof priorityOrder];
  });

  const totalImpact = recommendations.reduce((sum, rec) => sum + rec.expectedImpact, 0);

  return (
    <div className="space-y-4">
      {/* Summary Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <span className="font-medium">Total Projected Impact</span>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          +{totalImpact.toFixed(1)}% Revenue
        </Badge>
      </div>

      <Separator />

      {/* Recommendations List */}
      <div className="space-y-3">
        {sortedRecommendations.map((recommendation, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={priorityColors[recommendation.priority as keyof typeof priorityColors]}
                    >
                      {recommendation.priority.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {recommendation.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium leading-relaxed">
                    {recommendation.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>+{recommendation.expectedImpact.toFixed(1)}% impact</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className={`h-3 w-3 ${effortColors[recommendation.implementationEffort as keyof typeof effortColors]}`} />
                      <span className={effortColors[recommendation.implementationEffort as keyof typeof effortColors]}>
                        {recommendation.implementationEffort} effort
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{recommendation.timeframe}</span>
                    </div>
                  </div>

                  {/* Impact Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Expected Impact</span>
                      <span>{recommendation.expectedImpact.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={Math.min(recommendation.expectedImpact * 5, 100)} 
                      className="h-2"
                    />
                  </div>
                </div>

                <Button size="sm" variant="outline">
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Implementation Plan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Implementation Roadmap
          </CardTitle>
          <CardDescription>
            Phased approach for maximum impact and minimal disruption
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {implementationPlan.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <Button className="flex-1" size="sm">
          <Lightbulb className="h-4 w-4 mr-1" />
          Start Implementation
        </Button>
        <Button variant="outline" size="sm">
          Export Report
        </Button>
      </div>
    </div>
  );
}