/**
 * Insights Panel Component
 * Epic 10 - Story 10.5: Vision Analytics Dashboard (Real-time Insights)
 *
 * Displays AI-generated insights and recommendations including:
 * - Key performance insights and trends
 * - Automated recommendations for improvement
 * - Pattern recognition and anomaly detection
 * - Predictive insights and forecasting
 * - Clinical outcome analysis
 * - Business intelligence recommendations
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */

'use client';

import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  Clock,
  Eye,
  Lightbulb,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Analytics Engine
import type { AnalyticsInsight, AnalyticsTimeframe } from '@/lib/analytics';

// Types
interface InsightsPanelProps {
  insights: AnalyticsInsight[];
  isLoading: boolean;
  timeframe: AnalyticsTimeframe;
}

interface ProcessedInsight extends AnalyticsInsight {
  categoryIcon: React.ReactNode;
  priorityColor: string;
  actionable: boolean;
  estimatedImpact: 'low' | 'medium' | 'high';
}

interface InsightCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  insights: ProcessedInsight[];
  averageConfidence: number;
  totalImpact: number;
}

export function InsightsPanel({
  insights,
  isLoading,
  timeframe,
}: InsightsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'priority' | 'confidence' | 'impact' | 'timestamp'
  >('priority');

  /**
   * Process insights with additional metadata
   */
  const processedInsights = useMemo((): ProcessedInsight[] => {
    return insights.map((insight) => {
      // Determine category icon
      let categoryIcon: React.ReactNode;
      switch (insight.category) {
        case 'performance':
          categoryIcon = <BarChart3 className="h-4 w-4" />;
          break;
        case 'clinical':
          categoryIcon = <Activity className="h-4 w-4" />;
          break;
        case 'business':
          categoryIcon = <Target className="h-4 w-4" />;
          break;
        case 'ai_model':
          categoryIcon = <Brain className="h-4 w-4" />;
          break;
        case 'compliance':
          categoryIcon = <Shield className="h-4 w-4" />;
          break;
        case 'user_experience':
          categoryIcon = <Users className="h-4 w-4" />;
          break;
        default:
          categoryIcon = <Lightbulb className="h-4 w-4" />;
      }

      // Determine priority color
      let priorityColor: string;
      switch (insight.priority) {
        case 'critical':
          priorityColor = 'text-red-600 bg-red-50 border-red-200';
          break;
        case 'high':
          priorityColor = 'text-orange-600 bg-orange-50 border-orange-200';
          break;
        case 'medium':
          priorityColor = 'text-yellow-600 bg-yellow-50 border-yellow-200';
          break;
        case 'low':
          priorityColor = 'text-blue-600 bg-blue-50 border-blue-200';
          break;
        default:
          priorityColor = 'text-gray-600 bg-gray-50 border-gray-200';
      }

      // Determine if actionable
      const actionable = !!(
        insight.recommendations && insight.recommendations.length > 0
      );

      // Estimate impact based on confidence and business value
      let estimatedImpact: 'low' | 'medium' | 'high';
      const impactScore =
        (insight.confidence / 100) * (insight.businessImpact?.efficiency || 50);
      if (impactScore >= 70) {
        estimatedImpact = 'high';
      } else if (impactScore >= 40) {
        estimatedImpact = 'medium';
      } else {
        estimatedImpact = 'low';
      }

      return {
        ...insight,
        categoryIcon,
        priorityColor,
        actionable,
        estimatedImpact,
      };
    });
  }, [insights]);

  /**
   * Group insights by category
   */
  const insightCategories = useMemo((): InsightCategory[] => {
    const categories = new Map<string, ProcessedInsight[]>();

    processedInsights.forEach((insight) => {
      const category = insight.category;
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)?.push(insight);
    });

    const categoryList: InsightCategory[] = [];

    categories.forEach((insights, categoryId) => {
      let label: string;
      let icon: React.ReactNode;

      switch (categoryId) {
        case 'performance':
          label = 'Performance';
          icon = <BarChart3 className="h-4 w-4" />;
          break;
        case 'clinical':
          label = 'Clinical';
          icon = <Activity className="h-4 w-4" />;
          break;
        case 'business':
          label = 'Business';
          icon = <Target className="h-4 w-4" />;
          break;
        case 'ai_model':
          label = 'AI Models';
          icon = <Brain className="h-4 w-4" />;
          break;
        case 'compliance':
          label = 'Compliance';
          icon = <Shield className="h-4 w-4" />;
          break;
        case 'user_experience':
          label = 'User Experience';
          icon = <Users className="h-4 w-4" />;
          break;
        default:
          label = 'General';
          icon = <Lightbulb className="h-4 w-4" />;
      }

      const averageConfidence =
        insights.reduce((sum, insight) => sum + insight.confidence, 0) /
        insights.length;
      const totalImpact = insights.reduce(
        (sum, insight) => sum + (insight.businessImpact?.efficiency || 0),
        0
      );

      categoryList.push({
        id: categoryId,
        label,
        icon,
        insights,
        averageConfidence,
        totalImpact,
      });
    });

    return categoryList.sort((a, b) => b.totalImpact - a.totalImpact);
  }, [processedInsights]);

  /**
   * Sort insights
   */
  const sortedInsights = useMemo(() => {
    const insightsToSort =
      selectedCategory === 'all'
        ? processedInsights
        : processedInsights.filter(
            (insight) => insight.category === selectedCategory
          );

    return insightsToSort.sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        case 'confidence':
          return b.confidence - a.confidence;
        case 'impact':
          return (
            (b.businessImpact?.efficiency || 0) -
            (a.businessImpact?.efficiency || 0)
          );
        case 'timestamp':
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        default:
          return 0;
      }
    });
  }, [processedInsights, selectedCategory, sortBy]);

  /**
   * Get insight trend icon
   */
  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Activity className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  /**
   * Get impact badge
   */
  const getImpactBadge = (impact: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-green-100 text-green-800',
    };

    return (
      <Badge className={colors[impact]}>
        {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
      </Badge>
    );
  };

  /**
   * Insight card component
   */
  const InsightCard: React.FC<{
    insight: ProcessedInsight;
    showCategory?: boolean;
  }> = ({ insight, showCategory = true }) => (
    <Card className={`border-l-4 ${insight.priorityColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {showCategory && insight.categoryIcon}
            <CardTitle className="text-base">{insight.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon(insight.trend)}
            <Badge
              variant={
                insight.priority === 'critical' ? 'destructive' : 'secondary'
              }
            >
              {insight.priority}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-sm">
          {insight.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-gray-600 text-sm">Confidence</div>
            <div className="flex items-center gap-2">
              <Progress className="flex-1" value={insight.confidence} />
              <span className="font-mono text-sm">{insight.confidence}%</span>
            </div>
          </div>
          <div>
            <div className="text-gray-600 text-sm">Business Impact</div>
            <div className="flex items-center gap-2">
              <Progress
                className="flex-1"
                value={insight.businessImpact?.efficiency || 0}
              />
              <span className="font-mono text-sm">
                {insight.businessImpact?.efficiency || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Impact Badge */}
        <div className="flex items-center justify-between">
          {getImpactBadge(insight.estimatedImpact)}
          <div className="text-gray-500 text-xs">
            <Clock className="mr-1 inline h-3 w-3" />
            {new Date(insight.timestamp).toLocaleDateString()}
          </div>
        </div>

        {/* Data Points */}
        {insight.dataPoints && insight.dataPoints.length > 0 && (
          <div className="space-y-2">
            <div className="font-medium text-gray-700 text-sm">
              Key Data Points
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {insight.dataPoints.slice(0, 4).map((point, index) => (
                <div className="flex justify-between" key={index}>
                  <span className="text-gray-600">{point.label}:</span>
                  <span className="font-mono">{point.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insight.recommendations && insight.recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-medium text-gray-700 text-sm">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              Recommendations
            </div>
            <div className="space-y-1">
              {insight.recommendations.slice(0, 3).map((rec, index) => (
                <div
                  className="flex items-start gap-2 text-gray-600 text-sm"
                  key={index}
                >
                  <ArrowRight className="mt-0.5 h-3 w-3 text-blue-600" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {insight.actionable && (
          <Button className="w-full" size="sm" variant="outline">
            <Zap className="mr-2 h-4 w-4" />
            Take Action
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div className="h-32 rounded bg-gray-200" key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <Brain className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 font-semibold text-gray-900 text-lg">
              No Insights Available
            </h3>
            <p className="text-gray-600">
              AI insights will appear here as data is processed and patterns are
              identified.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              AI Insights
            </CardTitle>
            <CardDescription>
              {insights.length} insights generated from {timeframe} data
              analysis
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="rounded border px-2 py-1 text-sm"
              onChange={(e) => setSortBy(e.target.value as any)}
              value={sortBy}
            >
              <option value="priority">Sort by Priority</option>
              <option value="confidence">Sort by Confidence</option>
              <option value="impact">Sort by Impact</option>
              <option value="timestamp">Sort by Date</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs onValueChange={setSelectedCategory} value={selectedCategory}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="all">All</TabsTrigger>
            {insightCategories.map((category) => (
              <TabsTrigger
                className="flex items-center gap-1"
                key={category.id}
                value={category.id}
              >
                {category.icon}
                <span className="hidden lg:inline">{category.label}</span>
                <Badge className="ml-1" variant="secondary">
                  {category.insights.length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent className="mt-6 space-y-4" value={selectedCategory}>
            {/* Category Summary */}
            {selectedCategory !== 'all' && (
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {(() => {
                  const category = insightCategories.find(
                    (cat) => cat.id === selectedCategory
                  );
                  if (!category) return null;

                  return (
                    <>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="font-bold text-2xl">
                            {category.insights.length}
                          </div>
                          <p className="text-muted-foreground text-sm">
                            Total Insights
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="font-bold text-2xl">
                            {category.averageConfidence.toFixed(0)}%
                          </div>
                          <p className="text-muted-foreground text-sm">
                            Avg Confidence
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="font-bold text-2xl">
                            {category.totalImpact.toFixed(0)}%
                          </div>
                          <p className="text-muted-foreground text-sm">
                            Total Impact
                          </p>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Insights List */}
            <div className="space-y-4">
              {sortedInsights.map((insight, index) => (
                <InsightCard
                  insight={insight}
                  key={`${insight.id}-${index}`}
                  showCategory={selectedCategory === 'all'}
                />
              ))}
            </div>

            {sortedInsights.length === 0 && (
              <div className="py-8 text-center">
                <Brain className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 font-semibold text-gray-900 text-lg">
                  No Insights in This Category
                </h3>
                <p className="text-gray-600">
                  Try selecting a different category or timeframe.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
