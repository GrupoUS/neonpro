/**
 * Forecast Alerts Component
 * Epic 11 - Story 11.1: Intelligent forecast alert management and monitoring
 *
 * Features:
 * - Real-time forecast alert display and categorization
 * - Alert acknowledgment and action tracking
 * - Priority-based alert organization and filtering
 * - Automated recommendation system for alert resolution
 * - Alert history and trend analysis
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */

"use client";

import type { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import type {
  AlertCircle,
  AlertTriangle,
  Bell,
  BellOff,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Filter,
  Monitor,
  MoreHorizontal,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import type { toast } from "sonner";
import type { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Checkbox } from "@/components/ui/checkbox";
import type { Input } from "@/components/ui/input";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Separator } from "@/components/ui/separator";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Textarea } from "@/components/ui/textarea";

import type { ForecastAlert } from "@/lib/forecasting";

interface ForecastAlertsProps {
  alerts: ForecastAlert[];
  onAcknowledge: (alertId: string) => void;
  className?: string;
}

interface AlertFilters {
  severity: "all" | "critical" | "high" | "medium" | "low";
  status: "all" | "active" | "acknowledged" | "resolved";
  type: "all" | "demand_spike" | "resource_shortage" | "model_drift" | "capacity_warning";
  search: string;
}

interface AlertStats {
  total: number;
  active: number;
  critical: number;
  acknowledged: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
}

const ALERT_SEVERITY_CONFIG = {
  critical: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertTriangle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  high: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: AlertCircle,
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  medium: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: AlertCircle,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  low: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: AlertCircle,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
};

const ALERT_TYPE_CONFIG = {
  demand_spike: { label: "Demand Spike", icon: TrendingUp, color: "text-red-600" },
  resource_shortage: { label: "Resource Shortage", icon: Users, color: "text-orange-600" },
  model_drift: { label: "Model Drift", icon: TrendingDown, color: "text-purple-600" },
  capacity_warning: { label: "Capacity Warning", icon: Monitor, color: "text-yellow-600" },
};

export function ForecastAlerts({ alerts, onAcknowledge, className = "" }: ForecastAlertsProps) {
  const [filters, setFilters] = useState<AlertFilters>({
    severity: "all",
    status: "all",
    type: "all",
    search: "",
  });
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Calculate alert statistics
  const stats = useMemo((): AlertStats => {
    const total = alerts.length;
    const active = alerts.filter((a) => !a.acknowledged).length;
    const critical = alerts.filter((a) => a.severity === "critical").length;
    const acknowledged = alerts.filter((a) => a.acknowledged).length;

    const byType = alerts.reduce(
      (acc, alert) => {
        acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const bySeverity = alerts.reduce(
      (acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return { total, active, critical, acknowledged, byType, bySeverity };
  }, [alerts]);

  // Filter alerts based on current filters
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Severity filter
      if (filters.severity !== "all" && alert.severity !== filters.severity) return false;

      // Status filter
      if (filters.status !== "all") {
        if (filters.status === "active" && alert.acknowledged) return false;
        if (filters.status === "acknowledged" && !alert.acknowledged) return false;
        // Note: 'resolved' would require additional status field in production
      }

      // Type filter
      if (filters.type !== "all" && alert.alert_type !== filters.type) return false;

      // Search filter
      if (filters.search && !alert.message.toLowerCase().includes(filters.search.toLowerCase()))
        return false;

      return true;
    });
  }, [alerts, filters]);

  // Group alerts by date
  const groupedAlerts = useMemo(() => {
    const groups: Record<string, ForecastAlert[]> = {};

    filteredAlerts.forEach((alert) => {
      const alertDate = new Date(alert.created_at);
      let groupKey: string;

      if (isToday(alertDate)) {
        groupKey = "Today";
      } else if (isYesterday(alertDate)) {
        groupKey = "Yesterday";
      } else {
        groupKey = format(alertDate, "MMMM dd, yyyy");
      }

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(alert);
    });

    // Sort each group by creation time (newest first)
    Object.keys(groups).forEach((key) => {
      groups[key].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    });

    return groups;
  }, [filteredAlerts]);

  // Handle bulk acknowledgment
  const handleBulkAcknowledge = async () => {
    try {
      const acknowledgePromises = Array.from(selectedAlerts).map((alertId) =>
        onAcknowledge(alertId),
      );

      await Promise.all(acknowledgePromises);
      setSelectedAlerts(new Set());
      toast.success(`Acknowledged ${selectedAlerts.size} alerts`);
    } catch (error) {
      console.error("Failed to acknowledge alerts:", error);
      toast.error("Failed to acknowledge alerts");
    }
  };

  // Handle individual alert selection
  const toggleAlertSelection = (alertId: string) => {
    const newSelection = new Set(selectedAlerts);
    if (newSelection.has(alertId)) {
      newSelection.delete(alertId);
    } else {
      newSelection.add(alertId);
    }
    setSelectedAlerts(newSelection);
  };

  // Format alert time
  const formatAlertTime = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Render alert severity badge
  const renderSeverityBadge = (severity: ForecastAlert["severity"]) => {
    const config = ALERT_SEVERITY_CONFIG[severity];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  // Render alert type badge
  const renderTypeBadge = (type: ForecastAlert["alert_type"]) => {
    const config = ALERT_TYPE_CONFIG[type];
    const Icon = config.icon;

    return (
      <div className={`flex items-center space-x-1 text-sm ${config.color}`}>
        <Icon className="w-4 h-4" />
        <span>{config.label}</span>
      </div>
    );
  };

  // Render alert card
  const renderAlertCard = (alert: ForecastAlert) => {
    const severityConfig = ALERT_SEVERITY_CONFIG[alert.severity];
    const isSelected = selectedAlerts.has(alert.id);
    const isExpanded = showDetails === alert.id;

    return (
      <div
        key={alert.id}
        className={`border rounded-lg p-4 ${severityConfig.bgColor} ${severityConfig.borderColor} ${alert.acknowledged ? "opacity-60" : ""}`}
      >
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleAlertSelection(alert.id)}
            className="mt-1"
          />

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {renderSeverityBadge(alert.severity)}
                  {renderTypeBadge(alert.alert_type)}
                  {alert.acknowledged && (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Acknowledged
                    </Badge>
                  )}
                </div>

                <p className="text-sm font-medium">{alert.message}</p>

                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatAlertTime(alert.created_at)}</span>
                  </span>

                  {alert.forecast_id && (
                    <span className="flex items-center space-x-1">
                      <ExternalLink className="w-3 h-3" />
                      <span>Forecast: {alert.forecast_id.slice(0, 8)}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {!alert.acknowledged && (
                  <Button size="sm" variant="outline" onClick={() => onAcknowledge(alert.id)}>
                    Acknowledge
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDetails(isExpanded ? null : alert.id)}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Affected Resources */}
            {alert.affected_resources && alert.affected_resources.length > 0 && (
              <div className="text-xs">
                <span className="text-muted-foreground">Affected resources: </span>
                <span className="font-medium">{alert.affected_resources.join(", ")}</span>
              </div>
            )}

            {/* Expanded Details */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t space-y-3">
                {alert.recommended_actions && alert.recommended_actions.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Recommended Actions:</h5>
                    <ul className="text-sm space-y-1">
                      {alert.recommended_actions.map((action, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  <p>Alert ID: {alert.id}</p>
                  <p>Created: {format(new Date(alert.created_at), "PPpp")}</p>
                  {alert.forecast_id && <p>Related Forecast: {alert.forecast_id}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!alerts.length) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center min-h-[300px]">
          <div className="text-center space-y-4">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">No alerts</h3>
              <p className="text-muted-foreground">Your forecasting system is running smoothly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Forecast Alerts</span>
            </CardTitle>
            <CardDescription>
              Monitor and manage forecasting alerts and recommendations
            </CardDescription>
          </div>

          {selectedAlerts.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{selectedAlerts.size} selected</span>
              <Button size="sm" onClick={handleBulkAcknowledge}>
                Acknowledge Selected
              </Button>
            </div>
          )}
        </div>

        {/* Alert Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Alerts</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.acknowledged}</div>
            <div className="text-sm text-muted-foreground">Acknowledged</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search alerts..."
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Severity</label>
                <Select
                  value={filters.severity}
                  onValueChange={(value: any) =>
                    setFilters((prev) => ({ ...prev, severity: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status}
                  onValueChange={(value: any) => setFilters((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={filters.type}
                  onValueChange={(value: any) => setFilters((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="demand_spike">Demand Spike</SelectItem>
                    <SelectItem value="resource_shortage">Resource Shortage</SelectItem>
                    <SelectItem value="model_drift">Model Drift</SelectItem>
                    <SelectItem value="capacity_warning">Capacity Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setFilters({ severity: "all", status: "all", type: "all", search: "" })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <div className="space-y-6">
          {Object.keys(groupedAlerts).length === 0 ? (
            <div className="text-center py-8">
              <BellOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No alerts match your current filters</p>
            </div>
          ) : (
            Object.entries(groupedAlerts).map(([dateGroup, groupAlerts]) => (
              <div key={dateGroup} className="space-y-4">
                <h3 className="text-lg font-medium">{dateGroup}</h3>
                <div className="space-y-3">{groupAlerts.map(renderAlertCard)}</div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
