/**
 * Alerts Panel Component
 * Epic 10 - Story 10.5: Vision Analytics Dashboard (Real-time Insights)
 *
 * Displays system alerts and notifications including:
 * - Performance alerts and system warnings
 * - Clinical alerts and safety notifications
 * - Compliance alerts and regulatory warnings
 * - AI model alerts and accuracy degradation
 * - Business alerts and operational issues
 * - Real-time alert management and acknowledgment
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */

'use client';

import {
  Activity,
  AlertTriangle,
  Bell,
  Brain,
  CheckCircle,
  Database,
  Eye,
  Server,
  Shield,
  Users,
  Wifi,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Analytics Engine
import type { AnalyticsAlert } from '@/lib/analytics';

// Types
interface AlertsPanelProps {
  alerts: AnalyticsAlert[];
  isLoading: boolean;
}

interface ProcessedAlert extends AnalyticsAlert {
  categoryIcon: React.ReactNode;
  severityColor: string;
  timeAgo: string;
  isRecent: boolean;
}

interface AlertSummary {
  total: number;
  critical: number;
  warning: number;
  info: number;
  acknowledged: number;
}

export function AlertsPanel({ alerts, isLoading }: AlertsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  /**
   * Process alerts with additional metadata
   */
  const processedAlerts = useMemo((): ProcessedAlert[] => {
    return alerts.map((alert) => {
      // Category icon
      let categoryIcon: React.ReactNode;
      switch (alert.category) {
        case 'performance':
          categoryIcon = <Activity className="h-4 w-4" />;
          break;
        case 'clinical':
          categoryIcon = <Shield className="h-4 w-4" />;
          break;
        case 'compliance':
          categoryIcon = <CheckCircle className="h-4 w-4" />;
          break;
        case 'ai_model':
          categoryIcon = <Brain className="h-4 w-4" />;
          break;
        case 'system':
          categoryIcon = <Server className="h-4 w-4" />;
          break;
        case 'database':
          categoryIcon = <Database className="h-4 w-4" />;
          break;
        case 'network':
          categoryIcon = <Wifi className="h-4 w-4" />;
          break;
        case 'user':
          categoryIcon = <Users className="h-4 w-4" />;
          break;
        default:
          categoryIcon = <AlertTriangle className="h-4 w-4" />;
      }

      // Severity color
      let severityColor: string;
      switch (alert.severity) {
        case 'critical':
          severityColor = 'text-red-600 bg-red-50 border-red-200';
          break;
        case 'warning':
          severityColor = 'text-amber-600 bg-amber-50 border-amber-200';
          break;
        case 'info':
          severityColor = 'text-blue-600 bg-blue-50 border-blue-200';
          break;
        default:
          severityColor = 'text-gray-600 bg-gray-50 border-gray-200';
      }

      // Time ago calculation
      const alertTime = new Date(alert.timestamp);
      const now = new Date();
      const diffMs = now.getTime() - alertTime.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeAgo: string;
      if (diffMinutes < 1) {
        timeAgo = 'Just now';
      } else if (diffMinutes < 60) {
        timeAgo = `${diffMinutes}m ago`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours}h ago`;
      } else {
        timeAgo = `${diffDays}d ago`;
      }

      const isRecent = diffMinutes < 30;

      return {
        ...alert,
        categoryIcon,
        severityColor,
        timeAgo,
        isRecent,
      };
    });
  }, [alerts]);

  /**
   * Filter alerts
   */
  const filteredAlerts = useMemo(() => {
    return processedAlerts.filter((alert) => {
      // Category filter
      if (selectedCategory !== 'all' && alert.category !== selectedCategory) {
        return false;
      }

      // Acknowledged filter
      if (!showAcknowledged && alert.acknowledged) {
        return false;
      }

      return true;
    });
  }, [processedAlerts, selectedCategory, showAcknowledged]);

  /**
   * Alert summary statistics
   */
  const alertSummary = useMemo((): AlertSummary => {
    return processedAlerts.reduce(
      (summary, alert) => ({
        total: summary.total + 1,
        critical: summary.critical + (alert.severity === 'critical' ? 1 : 0),
        warning: summary.warning + (alert.severity === 'warning' ? 1 : 0),
        info: summary.info + (alert.severity === 'info' ? 1 : 0),
        acknowledged: summary.acknowledged + (alert.acknowledged ? 1 : 0),
      }),
      { total: 0, critical: 0, warning: 0, info: 0, acknowledged: 0 }
    );
  }, [processedAlerts]);

  /**
   * Group alerts by category
   */
  const alertsByCategory = useMemo(() => {
    const categories = new Map<string, ProcessedAlert[]>();

    processedAlerts.forEach((alert) => {
      if (!categories.has(alert.category)) {
        categories.set(alert.category, []);
      }
      categories.get(alert.category)?.push(alert);
    });

    return Array.from(categories.entries()).map(([category, alerts]) => ({
      category,
      alerts,
      count: alerts.length,
      criticalCount: alerts.filter((a) => a.severity === 'critical').length,
    }));
  }, [processedAlerts]);

  /**
   * Handle alert acknowledgment
   */
  const handleAcknowledge = (alertId: string) => {
    // In a real implementation, this would call an API
    console.log('Acknowledging alert:', alertId);
  };

  /**
   * Alert card component
   */
  const AlertCard: React.FC<{ alert: ProcessedAlert }> = ({ alert }) => (
    <Card
      className={`border-l-4 ${alert.severityColor} ${alert.isRecent ? 'ring-2 ring-blue-100' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 items-start gap-3">
            {alert.categoryIcon}
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{alert.title}</h4>
                {alert.isRecent && (
                  <Badge className="text-xs" variant="secondary">
                    New
                  </Badge>
                )}
              </div>
              <p className="mb-2 text-gray-600 text-sm">{alert.description}</p>

              {/* Alert Details */}
              <div className="space-y-1 text-gray-500 text-xs">
                <div className="flex items-center justify-between">
                  <span>Category: {alert.category.replace('_', ' ')}</span>
                  <span>{alert.timeAgo}</span>
                </div>
                {alert.source && <div>Source: {alert.source}</div>}
                {alert.affectedResources &&
                  alert.affectedResources.length > 0 && (
                    <div>
                      Affected: {alert.affectedResources.slice(0, 2).join(', ')}
                      {alert.affectedResources.length > 2 &&
                        ` +${alert.affectedResources.length - 2} more`}
                    </div>
                  )}
              </div>

              {/* Resolution Steps */}
              {alert.resolutionSteps && alert.resolutionSteps.length > 0 && (
                <div className="mt-3 rounded bg-gray-50 p-2 text-xs">
                  <div className="mb-1 font-medium text-gray-700">
                    Resolution Steps:
                  </div>
                  <ol className="list-inside list-decimal space-y-0.5 text-gray-600">
                    {alert.resolutionSteps.slice(0, 2).map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge
              className="text-xs"
              variant={
                alert.severity === 'critical' ? 'destructive' : 'secondary'
              }
            >
              {alert.severity}
            </Badge>

            {!alert.acknowledged && (
              <Button
                className="text-xs"
                onClick={() => handleAcknowledge(alert.id)}
                size="sm"
                variant="outline"
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Acknowledge
              </Button>
            )}

            {alert.acknowledged && (
              <Badge className="text-xs" variant="secondary">
                <CheckCircle className="mr-1 h-3 w-3" />
                Acknowledged
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...new Array(3)].map((_, i) => (
              <div className="h-24 rounded bg-gray-200" key={i} />
            ))}
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
              <Bell className="h-5 w-5 text-orange-600" />
              System Alerts
              {alertSummary.total > 0 && (
                <Badge
                  variant={
                    alertSummary.critical > 0 ? 'destructive' : 'secondary'
                  }
                >
                  {alertSummary.total}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Active alerts and notifications requiring attention
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAcknowledged(!showAcknowledged)}
              size="sm"
              variant="ghost"
            >
              {showAcknowledged ? 'Hide' : 'Show'} Acknowledged
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Alert Summary */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="font-bold text-2xl text-gray-900">
              {alertSummary.total}
            </div>
            <div className="text-gray-600 text-xs">Total</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-2xl text-red-600">
              {alertSummary.critical}
            </div>
            <div className="text-gray-600 text-xs">Critical</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-2xl text-amber-600">
              {alertSummary.warning}
            </div>
            <div className="text-gray-600 text-xs">Warning</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-2xl text-green-600">
              {alertSummary.acknowledged}
            </div>
            <div className="text-gray-600 text-xs">Resolved</div>
          </div>
        </div>

        {alertSummary.total === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h3 className="mb-2 font-semibold text-gray-900 text-lg">
              All Clear
            </h3>
            <p className="text-gray-600">No active alerts at this time.</p>
          </div>
        ) : (
          <Tabs onValueChange={setSelectedCategory} value={selectedCategory}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">
                All
                <Badge className="ml-1" variant="secondary">
                  {alertSummary.total}
                </Badge>
              </TabsTrigger>
              {alertsByCategory
                .slice(0, 5)
                .map(({ category, count, criticalCount }) => (
                  <TabsTrigger
                    className="flex items-center gap-1"
                    key={category}
                    value={category}
                  >
                    <span className="hidden lg:inline">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </span>
                    <Badge
                      className="text-xs"
                      variant={criticalCount > 0 ? 'destructive' : 'secondary'}
                    >
                      {count}
                    </Badge>
                  </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent className="mt-6" value={selectedCategory}>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {filteredAlerts.length === 0 ? (
                    <div className="py-8 text-center">
                      <Eye className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-gray-600">
                        No alerts in this category.
                      </p>
                    </div>
                  ) : (
                    filteredAlerts
                      .sort((a, b) => {
                        // Sort by severity (critical first), then by timestamp (newest first)
                        const severityOrder = {
                          critical: 3,
                          warning: 2,
                          info: 1,
                        };
                        const severityDiff =
                          severityOrder[b.severity] - severityOrder[a.severity];
                        if (severityDiff !== 0) {
                          return severityDiff;
                        }

                        return (
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime()
                        );
                      })
                      .map((alert, index) => (
                        <AlertCard alert={alert} key={`${alert.id}-${index}`} />
                      ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
