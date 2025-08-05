// =====================================================================================
// NeonPro Inventory Alerts Component
// Epic 6: Real-time Stock Tracking System
// Created: 2025-01-26
// =====================================================================================

"use client";

import type {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle,
  Clock,
  Package,
  TrendingDown,
  X,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// =====================================================================================
// TYPES & INTERFACES
// =====================================================================================

interface InventoryAlert {
  id: string;
  type: "low_stock" | "out_of_stock" | "expired" | "expiring_soon" | "overstock";
  title: string;
  message: string;
  item_name: string;
  item_id: string;
  location_name?: string;
  current_quantity?: number;
  min_quantity?: number;
  expiry_date?: string;
  severity: "low" | "medium" | "high" | "critical";
  is_read: boolean;
  created_at: string;
}

// =====================================================================================
// COMPONENT CONFIGURATION
// =====================================================================================

const ALERT_CONFIG = {
  low_stock: {
    icon: TrendingDown,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  out_of_stock: {
    icon: Package,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  expired: {
    icon: X,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  expiring_soon: {
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  overstock: {
    icon: AlertTriangle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
};

const SEVERITY_CONFIG = {
  low: { label: "Baixa", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Média", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "Alta", color: "bg-orange-100 text-orange-800" },
  critical: { label: "Crítica", color: "bg-red-100 text-red-800" },
};

// =====================================================================================
// MAIN COMPONENT
// =====================================================================================

export default function InventoryAlerts() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "critical">("all");
  const [error, setError] = useState<string | null>(null);

  // =====================================================================================
  // DATA FETCHING
  // =====================================================================================

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/inventory/alerts");

      if (!response.ok) {
        throw new Error("Failed to load alerts");
      }

      const data = await response.json();
      setAlerts(data);
    } catch (err) {
      console.error("Error loading alerts:", err);
      setError("Failed to load inventory alerts");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================================================
  // EVENT HANDLERS
  // =====================================================================================

  const markAsRead = async (alertId: string) => {
    try {
      const response = await fetch(`/api/inventory/alerts/${alertId}/read`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to mark alert as read");
      }

      setAlerts((prev) =>
        prev.map((alert) => (alert.id === alertId ? { ...alert, is_read: true } : alert)),
      );
    } catch (err) {
      console.error("Error marking alert as read:", err);
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/inventory/alerts/${alertId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to dismiss alert");
      }

      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    } catch (err) {
      console.error("Error dismissing alert:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/inventory/alerts/mark-all-read", {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to mark all alerts as read");
      }

      setAlerts((prev) => prev.map((alert) => ({ ...alert, is_read: true })));
    } catch (err) {
      console.error("Error marking all alerts as read:", err);
    }
  };

  // =====================================================================================
  // FILTERING & SORTING
  // =====================================================================================

  const filteredAlerts = alerts
    .filter((alert) => {
      switch (filter) {
        case "unread":
          return !alert.is_read;
        case "critical":
          return alert.severity === "critical" || alert.severity === "high";
        default:
          return true;
      }
    })
    .sort((a, b) => {
      // Sort by severity first, then by date
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const unreadCount = alerts.filter((alert) => !alert.is_read).length;
  const criticalCount = alerts.filter(
    (alert) => alert.severity === "critical" || alert.severity === "high",
  ).length;

  // =====================================================================================
  // LOADING STATE
  // =====================================================================================

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Inventory Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-gray-200 rounded" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-48" />
                      <div className="h-3 bg-gray-200 rounded w-64" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-5 bg-gray-200 rounded" />
                    <div className="w-8 h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // =====================================================================================
  // ERROR STATE
  // =====================================================================================

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Error Loading Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadAlerts} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // =====================================================================================
  // MAIN RENDER
  // =====================================================================================

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {unreadCount > 0 ? (
                <Bell className="h-5 w-5 text-orange-500" />
              ) : (
                <BellOff className="h-5 w-5 text-gray-400" />
              )}
              Inventory Alerts
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Monitor stock levels, expiration dates, and inventory issues
            </CardDescription>
          </div>

          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 pt-4">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({alerts.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === "critical" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("critical")}
          >
            Critical ({criticalCount})
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === "all" ? "No alerts" : `No ${filter} alerts`}
            </h3>
            <p className="text-gray-500">
              {filter === "all"
                ? "Your inventory is running smoothly!"
                : `All ${filter} alerts have been addressed.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const config = ALERT_CONFIG[alert.type];
              const Icon = config.icon;
              const severityConfig = SEVERITY_CONFIG[alert.severity];

              return (
                <div
                  key={alert.id}
                  className={`
                    p-4 border rounded-lg transition-all duration-200 hover:shadow-sm
                    ${config.bgColor} ${config.borderColor}
                    ${!alert.is_read ? "border-l-4" : ""}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <Badge variant="outline" className={severityConfig.color}>
                            {severityConfig.label}
                          </Badge>
                          {!alert.is_read && (
                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                              New
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{alert.message}</p>

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Item: {alert.item_name}</span>
                          {alert.location_name && <span>Location: {alert.location_name}</span>}
                          {alert.current_quantity !== undefined && (
                            <span>Current: {alert.current_quantity}</span>
                          )}
                          {alert.expiry_date && (
                            <span>Expires: {new Date(alert.expiry_date).toLocaleDateString()}</span>
                          )}
                          <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {!alert.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(alert.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
