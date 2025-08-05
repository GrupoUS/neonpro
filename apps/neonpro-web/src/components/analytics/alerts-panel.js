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
"use client";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsPanel = AlertsPanel;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var scroll_area_1 = require("@/components/ui/scroll-area");
var lucide_react_1 = require("lucide-react");
function AlertsPanel(_a) {
  var alerts = _a.alerts,
    isLoading = _a.isLoading;
  var _b = (0, react_1.useState)("all"),
    selectedCategory = _b[0],
    setSelectedCategory = _b[1];
  var _c = (0, react_1.useState)(false),
    showAcknowledged = _c[0],
    setShowAcknowledged = _c[1];
  /**
   * Process alerts with additional metadata
   */
  var processedAlerts = (0, react_1.useMemo)(
    () =>
      alerts.map((alert) => {
        // Category icon
        var categoryIcon;
        switch (alert.category) {
          case "performance":
            categoryIcon = <lucide_react_1.Activity className="w-4 h-4" />;
            break;
          case "clinical":
            categoryIcon = <lucide_react_1.Shield className="w-4 h-4" />;
            break;
          case "compliance":
            categoryIcon = <lucide_react_1.CheckCircle className="w-4 h-4" />;
            break;
          case "ai_model":
            categoryIcon = <lucide_react_1.Brain className="w-4 h-4" />;
            break;
          case "system":
            categoryIcon = <lucide_react_1.Server className="w-4 h-4" />;
            break;
          case "database":
            categoryIcon = <lucide_react_1.Database className="w-4 h-4" />;
            break;
          case "network":
            categoryIcon = <lucide_react_1.Wifi className="w-4 h-4" />;
            break;
          case "user":
            categoryIcon = <lucide_react_1.Users className="w-4 h-4" />;
            break;
          default:
            categoryIcon = <lucide_react_1.AlertTriangle className="w-4 h-4" />;
        }
        // Severity color
        var severityColor;
        switch (alert.severity) {
          case "critical":
            severityColor = "text-red-600 bg-red-50 border-red-200";
            break;
          case "warning":
            severityColor = "text-amber-600 bg-amber-50 border-amber-200";
            break;
          case "info":
            severityColor = "text-blue-600 bg-blue-50 border-blue-200";
            break;
          default:
            severityColor = "text-gray-600 bg-gray-50 border-gray-200";
        }
        // Time ago calculation
        var alertTime = new Date(alert.timestamp);
        var now = new Date();
        var diffMs = now.getTime() - alertTime.getTime();
        var diffMinutes = Math.floor(diffMs / (1000 * 60));
        var diffHours = Math.floor(diffMinutes / 60);
        var diffDays = Math.floor(diffHours / 24);
        var timeAgo;
        if (diffMinutes < 1) {
          timeAgo = "Just now";
        } else if (diffMinutes < 60) {
          timeAgo = "".concat(diffMinutes, "m ago");
        } else if (diffHours < 24) {
          timeAgo = "".concat(diffHours, "h ago");
        } else {
          timeAgo = "".concat(diffDays, "d ago");
        }
        var isRecent = diffMinutes < 30;
        return __assign(__assign({}, alert), {
          categoryIcon: categoryIcon,
          severityColor: severityColor,
          timeAgo: timeAgo,
          isRecent: isRecent,
        });
      }),
    [alerts],
  );
  /**
   * Filter alerts
   */
  var filteredAlerts = (0, react_1.useMemo)(
    () =>
      processedAlerts.filter((alert) => {
        // Category filter
        if (selectedCategory !== "all" && alert.category !== selectedCategory) {
          return false;
        }
        // Acknowledged filter
        if (!showAcknowledged && alert.acknowledged) {
          return false;
        }
        return true;
      }),
    [processedAlerts, selectedCategory, showAcknowledged],
  );
  /**
   * Alert summary statistics
   */
  var alertSummary = (0, react_1.useMemo)(
    () =>
      processedAlerts.reduce(
        (summary, alert) => ({
          total: summary.total + 1,
          critical: summary.critical + (alert.severity === "critical" ? 1 : 0),
          warning: summary.warning + (alert.severity === "warning" ? 1 : 0),
          info: summary.info + (alert.severity === "info" ? 1 : 0),
          acknowledged: summary.acknowledged + (alert.acknowledged ? 1 : 0),
        }),
        { total: 0, critical: 0, warning: 0, info: 0, acknowledged: 0 },
      ),
    [processedAlerts],
  );
  /**
   * Group alerts by category
   */
  var alertsByCategory = (0, react_1.useMemo)(() => {
    var categories = new Map();
    processedAlerts.forEach((alert) => {
      if (!categories.has(alert.category)) {
        categories.set(alert.category, []);
      }
      categories.get(alert.category).push(alert);
    });
    return Array.from(categories.entries()).map((_a) => {
      var category = _a[0],
        alerts = _a[1];
      return {
        category: category,
        alerts: alerts,
        count: alerts.length,
        criticalCount: alerts.filter((a) => a.severity === "critical").length,
      };
    });
  }, [processedAlerts]);
  /**
   * Handle alert acknowledgment
   */
  var handleAcknowledge = (alertId) => {
    // In a real implementation, this would call an API
    console.log("Acknowledging alert:", alertId);
  };
  /**
   * Alert card component
   */
  var AlertCard = (_a) => {
    var alert = _a.alert;
    return (
      <card_1.Card
        className={"border-l-4 "
          .concat(alert.severityColor, " ")
          .concat(alert.isRecent ? "ring-2 ring-blue-100" : "")}
      >
        <card_1.CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {alert.categoryIcon}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{alert.title}</h4>
                  {alert.isRecent && (
                    <badge_1.Badge variant="secondary" className="text-xs">
                      New
                    </badge_1.Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{alert.description}</p>

                {/* Alert Details */}
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Category: {alert.category.replace("_", " ")}</span>
                    <span>{alert.timeAgo}</span>
                  </div>
                  {alert.source && <div>Source: {alert.source}</div>}
                  {alert.affectedResources && alert.affectedResources.length > 0 && (
                    <div>
                      Affected: {alert.affectedResources.slice(0, 2).join(", ")}
                      {alert.affectedResources.length > 2 &&
                        " +".concat(alert.affectedResources.length - 2, " more")}
                    </div>
                  )}
                </div>

                {/* Resolution Steps */}
                {alert.resolutionSteps && alert.resolutionSteps.length > 0 && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <div className="font-medium text-gray-700 mb-1">Resolution Steps:</div>
                    <ol className="list-decimal list-inside space-y-0.5 text-gray-600">
                      {alert.resolutionSteps.slice(0, 2).map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <badge_1.Badge
                variant={alert.severity === "critical" ? "destructive" : "secondary"}
                className="text-xs"
              >
                {alert.severity}
              </badge_1.Badge>

              {!alert.acknowledged && (
                <button_1.Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAcknowledge(alert.id)}
                  className="text-xs"
                >
                  <lucide_react_1.CheckCircle className="w-3 h-3 mr-1" />
                  Acknowledge
                </button_1.Button>
              )}

              {alert.acknowledged && (
                <badge_1.Badge variant="secondary" className="text-xs">
                  <lucide_react_1.CheckCircle className="w-3 h-3 mr-1" />
                  Acknowledged
                </badge_1.Badge>
              )}
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  if (isLoading) {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Bell className="w-5 h-5 text-orange-600" />
            System Alerts
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="animate-pulse space-y-4">
            {__spreadArray([], Array(3), true).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Bell className="w-5 h-5 text-orange-600" />
              System Alerts
              {alertSummary.total > 0 && (
                <badge_1.Badge variant={alertSummary.critical > 0 ? "destructive" : "secondary"}>
                  {alertSummary.total}
                </badge_1.Badge>
              )}
            </card_1.CardTitle>
            <card_1.CardDescription>
              Active alerts and notifications requiring attention
            </card_1.CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <button_1.Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAcknowledged(!showAcknowledged)}
            >
              {showAcknowledged ? "Hide" : "Show"} Acknowledged
            </button_1.Button>
          </div>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent>
        {/* Alert Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{alertSummary.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{alertSummary.critical}</div>
            <div className="text-xs text-gray-600">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{alertSummary.warning}</div>
            <div className="text-xs text-gray-600">Warning</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{alertSummary.acknowledged}</div>
            <div className="text-xs text-gray-600">Resolved</div>
          </div>
        </div>

        {alertSummary.total === 0
          ? <div className="text-center py-8">
              <lucide_react_1.CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Clear</h3>
              <p className="text-gray-600">No active alerts at this time.</p>
            </div>
          : <tabs_1.Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <tabs_1.TabsList className="grid w-full grid-cols-6">
                <tabs_1.TabsTrigger value="all">
                  All
                  <badge_1.Badge variant="secondary" className="ml-1">
                    {alertSummary.total}
                  </badge_1.Badge>
                </tabs_1.TabsTrigger>
                {alertsByCategory.slice(0, 5).map((_a) => {
                  var category = _a.category,
                    count = _a.count,
                    criticalCount = _a.criticalCount;
                  return (
                    <tabs_1.TabsTrigger
                      key={category}
                      value={category}
                      className="flex items-center gap-1"
                    >
                      <span className="hidden lg:inline">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                      <badge_1.Badge
                        variant={criticalCount > 0 ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {count}
                      </badge_1.Badge>
                    </tabs_1.TabsTrigger>
                  );
                })}
              </tabs_1.TabsList>

              <tabs_1.TabsContent value={selectedCategory} className="mt-6">
                <scroll_area_1.ScrollArea className="h-96">
                  <div className="space-y-4">
                    {filteredAlerts.length === 0
                      ? <div className="text-center py-8">
                          <lucide_react_1.Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">No alerts in this category.</p>
                        </div>
                      : filteredAlerts
                          .sort((a, b) => {
                            // Sort by severity (critical first), then by timestamp (newest first)
                            var severityOrder = { critical: 3, warning: 2, info: 1 };
                            var severityDiff =
                              severityOrder[b.severity] - severityOrder[a.severity];
                            if (severityDiff !== 0) return severityDiff;
                            return (
                              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                            );
                          })
                          .map((alert, index) => (
                            <AlertCard key={"".concat(alert.id, "-").concat(index)} alert={alert} />
                          ))}
                  </div>
                </scroll_area_1.ScrollArea>
              </tabs_1.TabsContent>
            </tabs_1.Tabs>}
      </card_1.CardContent>
    </card_1.Card>
  );
}
