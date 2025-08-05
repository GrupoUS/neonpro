/**
 * Story 11.2: Waitlist Optimization Component
 * Intelligent waitlist management with demand forecasting and slot optimization
 */
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitlistOptimization = WaitlistOptimization;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var dialog_1 = require("@/components/ui/dialog");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var PRIORITY_COLORS = {
  LOW: "#10B981",
  MEDIUM: "#F59E0B",
  HIGH: "#EF4444",
  URGENT: "#DC2626",
};
var PRIORITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};
function WaitlistOptimization(_a) {
  var waitlistEntries = _a.waitlistEntries,
    onUpdateEntry = _a.onUpdateEntry,
    onContactPatient = _a.onContactPatient,
    onScheduleAppointment = _a.onScheduleAppointment;
  var _b = (0, react_1.useState)(null),
    selectedEntry = _b[0],
    setSelectedEntry = _b[1];
  var _c = (0, react_1.useState)("overview"),
    activeTab = _c[0],
    setActiveTab = _c[1];
  var _d = (0, react_1.useState)("ALL"),
    priorityFilter = _d[0],
    setPriorityFilter = _d[1];
  var _e = (0, react_1.useState)("ALL"),
    specialtyFilter = _e[0],
    setSpecialtyFilter = _e[1];
  var _f = (0, react_1.useState)("waitTime"),
    sortBy = _f[0],
    setSortBy = _f[1];
  var _g = (0, react_1.useState)(false),
    showOptimizations = _g[0],
    setShowOptimizations = _g[1];
  /**
   * Calculate waitlist analytics
   */
  var analytics = (0, react_1.useMemo)(
    function () {
      var activeEntries = waitlistEntries.filter(function (e) {
        return e.status === "WAITING" || e.status === "CONTACTED";
      });
      // Basic metrics
      var averageWaitTime =
        activeEntries.reduce(function (sum, entry) {
          return sum + entry.estimatedWaitTime;
        }, 0) / activeEntries.length || 0;
      var totalWaiting = activeEntries.length;
      // Priority distribution
      var priorityGroups = activeEntries.reduce(function (acc, entry) {
        if (!acc[entry.priority]) {
          acc[entry.priority] = [];
        }
        acc[entry.priority].push(entry);
        return acc;
      }, {});
      var priorityDistribution = Object.entries(priorityGroups).map(function (_a) {
        var priority = _a[0],
          entries = _a[1];
        return {
          priority: PRIORITY_LABELS[priority],
          count: entries.length,
          avgWait:
            entries.reduce(function (sum, e) {
              return sum + e.estimatedWaitTime;
            }, 0) / entries.length,
          color: PRIORITY_COLORS[priority],
        };
      });
      // Specialty breakdown
      var specialtyGroups = activeEntries.reduce(function (acc, entry) {
        if (!acc[entry.specialty]) {
          acc[entry.specialty] = [];
        }
        acc[entry.specialty].push(entry);
        return acc;
      }, {});
      var specialtyBreakdown = Object.entries(specialtyGroups).map(function (_a) {
        var specialty = _a[0],
          entries = _a[1];
        return {
          specialty: specialty,
          waiting: entries.length,
          avgWait:
            entries.reduce(function (sum, e) {
              return sum + e.estimatedWaitTime;
            }, 0) / entries.length,
          capacity: 100, // Mock capacity
        };
      });
      // Wait time projection (mock data for demo)
      var waitTimeProjection = Array.from({ length: 30 }, function (_, i) {
        var date = new Date();
        date.setDate(date.getDate() + i);
        return {
          date: date.toISOString().split("T")[0],
          projected: Math.max(0, averageWaitTime - i * 0.5 + Math.random() * 2),
          historical: Math.max(0, averageWaitTime + Math.random() * 3),
          optimized: Math.max(0, averageWaitTime - i * 0.8 + Math.random() * 1),
        };
      });
      // Conversion rates
      var conversionRates = [
        { stage: "Waitlist Entry", rate: 100, count: totalWaiting },
        { stage: "First Contact", rate: 85, count: Math.round(totalWaiting * 0.85) },
        { stage: "Response", rate: 68, count: Math.round(totalWaiting * 0.68) },
        { stage: "Scheduled", rate: 78, count: Math.round(totalWaiting * 0.78) },
        { stage: "Attended", rate: 82, count: Math.round(totalWaiting * 0.82) },
      ];
      return {
        averageWaitTime: averageWaitTime,
        totalWaiting: totalWaiting,
        dailyThroughput: 15, // Mock
        utilizationRate: 78, // Mock
        priorityDistribution: priorityDistribution,
        specialtyBreakdown: specialtyBreakdown,
        waitTimeProjection: waitTimeProjection,
        conversionRates: conversionRates,
      };
    },
    [waitlistEntries],
  );
  /**
   * Generate optimization suggestions
   */
  var optimizationSuggestions = (0, react_1.useMemo)(
    function () {
      var suggestions = [];
      // High-risk patients that need immediate attention
      var highRiskPatients = waitlistEntries.filter(function (e) {
        return e.noShowRisk > 70 && e.status === "WAITING";
      });
      if (highRiskPatients.length > 0) {
        suggestions.push({
          type: "PROACTIVE_CONTACT",
          description: "".concat(
            highRiskPatients.length,
            " high-risk patients need immediate contact to prevent dropout",
          ),
          impact: "HIGH",
          estimatedReduction: 3,
          affectedPatients: highRiskPatients.length,
          confidence: 85,
          actionRequired: "Contact high-risk patients within 24 hours",
        });
      }
      // Long-waiting urgent patients
      var urgentLongWait = waitlistEntries.filter(function (e) {
        return e.priority === "URGENT" && e.estimatedWaitTime > 7;
      });
      if (urgentLongWait.length > 0) {
        suggestions.push({
          type: "PRIORITY_ADJUSTMENT",
          description: "".concat(urgentLongWait.length, " urgent patients waiting over 7 days"),
          impact: "HIGH",
          estimatedReduction: 5,
          affectedPatients: urgentLongWait.length,
          confidence: 92,
          actionRequired: "Reallocate urgent slots or add emergency capacity",
        });
      }
      // Slot reallocation opportunities
      var overCapacitySpecialties = analytics.specialtyBreakdown.filter(function (s) {
        return s.waiting > s.capacity * 0.8;
      });
      if (overCapacitySpecialties.length > 0) {
        suggestions.push({
          type: "SLOT_REALLOCATION",
          description: "Rebalance capacity for ".concat(
            overCapacitySpecialties.length,
            " over-capacity specialties",
          ),
          impact: "MEDIUM",
          estimatedReduction: 2,
          affectedPatients: overCapacitySpecialties.reduce(function (sum, s) {
            return sum + s.waiting;
          }, 0),
          confidence: 78,
          actionRequired: "Review and redistribute appointment slots",
        });
      }
      // Potential cancellations based on patterns
      var likelyCancellations = waitlistEntries.filter(function (e) {
        return e.contactAttempts > 2 && !e.lastContact && e.estimatedWaitTime > 14;
      });
      if (likelyCancellations.length > 0) {
        suggestions.push({
          type: "CANCELLATION_PREDICTION",
          description: "".concat(
            likelyCancellations.length,
            " patients likely to cancel based on engagement patterns",
          ),
          impact: "MEDIUM",
          estimatedReduction: 1,
          affectedPatients: likelyCancellations.length,
          confidence: 65,
          actionRequired: "Follow up with disengaged patients or mark for removal",
        });
      }
      return suggestions.sort(function (a, b) {
        var impactOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
      });
    },
    [waitlistEntries, analytics],
  );
  /**
   * Filter and sort waitlist entries
   */
  var filteredEntries = (0, react_1.useMemo)(
    function () {
      var filtered = waitlistEntries.filter(function (entry) {
        if (priorityFilter !== "ALL" && entry.priority !== priorityFilter) return false;
        if (specialtyFilter !== "ALL" && entry.specialty !== specialtyFilter) return false;
        return true;
      });
      return filtered.sort(function (a, b) {
        switch (sortBy) {
          case "waitTime":
            return b.estimatedWaitTime - a.estimatedWaitTime;
          case "priority":
            var priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          case "risk":
            return b.noShowRisk - a.noShowRisk;
          case "date":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          default:
            return 0;
        }
      });
    },
    [waitlistEntries, priorityFilter, specialtyFilter, sortBy],
  );
  /**
   * Get priority badge variant
   */
  var getPriorityVariant = function (priority) {
    switch (priority) {
      case "URGENT":
        return "destructive";
      case "HIGH":
        return "destructive";
      case "MEDIUM":
        return "default";
      case "LOW":
        return "secondary";
      default:
        return "outline";
    }
  };
  /**
   * Get wait time color
   */
  var getWaitTimeColor = function (days) {
    if (days <= 3) return "text-green-600";
    if (days <= 7) return "text-yellow-600";
    if (days <= 14) return "text-orange-600";
    return "text-red-600";
  };
  /**
   * Format days to readable format
   */
  var formatWaitTime = function (days) {
    if (days < 1) return "Same day";
    if (days === 1) return "1 day";
    if (days < 7) return "".concat(Math.round(days), " days");
    var weeks = Math.round(days / 7);
    return weeks === 1 ? "1 week" : "".concat(weeks, " weeks");
  };
  /**
   * Handle contact patient
   */
  var handleContactPatient = function (entry, method) {
    onContactPatient(entry.patientId, method);
    onUpdateEntry(entry.id, {
      contactAttempts: entry.contactAttempts + 1,
      lastContact: new Date(),
      status: "CONTACTED",
    });
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Waitlist Optimization</h2>
          <p className="text-muted-foreground">
            Intelligent waitlist management with demand forecasting and slot optimization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button_1.Button
            variant="outline"
            onClick={function () {
              return setShowOptimizations(!showOptimizations);
            }}
          >
            <lucide_react_1.Target className="h-4 w-4 mr-2" />
            {showOptimizations ? "Hide" : "Show"} Optimizations
          </button_1.Button>
          <button_1.Button variant="outline">
            <lucide_react_1.Settings className="h-4 w-4 mr-2" />
            Settings
          </button_1.Button>
          <button_1.Button>
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button_1.Button>
        </div>
      </div>

      {/* Optimization Alerts */}
      {showOptimizations && optimizationSuggestions.length > 0 && (
        <div className="space-y-3">
          {optimizationSuggestions.slice(0, 3).map(function (suggestion, index) {
            return (
              <alert_1.Alert
                key={index}
                className={
                  suggestion.impact === "HIGH"
                    ? "border-red-200 bg-red-50"
                    : suggestion.impact === "MEDIUM"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-blue-200 bg-blue-50"
                }
              >
                <lucide_react_1.AlertTriangle className="h-4 w-4" />
                <alert_1.AlertDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{suggestion.description}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {suggestion.actionRequired}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <badge_1.Badge
                        variant={
                          suggestion.impact === "HIGH"
                            ? "destructive"
                            : suggestion.impact === "MEDIUM"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {suggestion.impact} Impact
                      </badge_1.Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        -{suggestion.estimatedReduction} days • {suggestion.confidence}% confidence
                      </div>
                    </div>
                  </div>
                </alert_1.AlertDescription>
              </alert_1.Alert>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.Users className="h-4 w-4" />
              Total Waiting
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{analytics.totalWaiting}</div>
            <div className="text-xs text-muted-foreground">Active waitlist entries</div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.Clock className="h-4 w-4" />
              Average Wait
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div
              className={"text-2xl font-bold ".concat(getWaitTimeColor(analytics.averageWaitTime))}
            >
              {formatWaitTime(analytics.averageWaitTime)}
            </div>
            <div className="text-xs text-muted-foreground">Current average</div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.TrendingUp className="h-4 w-4" />
              Daily Throughput
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.dailyThroughput}</div>
            <div className="text-xs text-muted-foreground">Patients/day</div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm font-medium flex items-center gap-2">
              <lucide_react_1.Target className="h-4 w-4" />
              Utilization Rate
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.utilizationRate}%</div>
            <div className="text-xs text-muted-foreground">Capacity usage</div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Content Tabs */}
      <tabs_1.Tabs
        value={activeTab}
        onValueChange={function (value) {
          return setActiveTab(value);
        }}
      >
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="optimization">Optimization</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Analytics</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="settings">Settings</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-6">
          {/* Filters and Controls */}
          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Priority:</label>
                  <select_1.Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <select_1.SelectTrigger className="w-32">
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="ALL">All</select_1.SelectItem>
                      <select_1.SelectItem value="URGENT">Urgent</select_1.SelectItem>
                      <select_1.SelectItem value="HIGH">High</select_1.SelectItem>
                      <select_1.SelectItem value="MEDIUM">Medium</select_1.SelectItem>
                      <select_1.SelectItem value="LOW">Low</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Specialty:</label>
                  <select_1.Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                    <select_1.SelectTrigger className="w-40">
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="ALL">All Specialties</select_1.SelectItem>
                      {analytics.specialtyBreakdown.map(function (specialty) {
                        return (
                          <select_1.SelectItem
                            key={specialty.specialty}
                            value={specialty.specialty}
                          >
                            {specialty.specialty} ({specialty.waiting})
                          </select_1.SelectItem>
                        );
                      })}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Sort by:</label>
                  <select_1.Select
                    value={sortBy}
                    onValueChange={function (value) {
                      return setSortBy(value);
                    }}
                  >
                    <select_1.SelectTrigger className="w-32">
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="waitTime">Wait Time</select_1.SelectItem>
                      <select_1.SelectItem value="priority">Priority</select_1.SelectItem>
                      <select_1.SelectItem value="risk">No-Show Risk</select_1.SelectItem>
                      <select_1.SelectItem value="date">Date Added</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                <div className="ml-auto text-sm text-muted-foreground">
                  Showing {filteredEntries.length} of {waitlistEntries.length} entries
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Waitlist Entries */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Users className="h-5 w-5" />
                Waitlist Entries
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {filteredEntries.length === 0
                  ? <div className="text-center py-8 text-muted-foreground">
                      No waitlist entries match the current filters.
                    </div>
                  : filteredEntries.map(function (entry) {
                      return (
                        <card_1.Card
                          key={entry.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={function () {
                            return setSelectedEntry(entry);
                          }}
                        >
                          <card_1.CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <badge_1.Badge variant={getPriorityVariant(entry.priority)}>
                                  {PRIORITY_LABELS[entry.priority]}
                                </badge_1.Badge>
                                <span className="font-medium">{entry.patientName}</span>
                                <badge_1.Badge variant="outline">{entry.specialty}</badge_1.Badge>
                              </div>
                              <div className="text-right">
                                <div
                                  className={"font-bold ".concat(
                                    getWaitTimeColor(entry.estimatedWaitTime),
                                  )}
                                >
                                  {formatWaitTime(entry.estimatedWaitTime)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {entry.noShowRisk}% risk
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              <div>
                                <div className="text-xs text-muted-foreground">Doctor</div>
                                <div className="text-sm font-medium">{entry.doctor}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Requested Date</div>
                                <div className="text-sm font-medium">
                                  {entry.requestedDate.toLocaleDateString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Status</div>
                                <badge_1.Badge
                                  variant={
                                    entry.status === "WAITING"
                                      ? "default"
                                      : entry.status === "CONTACTED"
                                        ? "secondary"
                                        : entry.status === "SCHEDULED"
                                          ? "outline"
                                          : "destructive"
                                  }
                                >
                                  {entry.status.toLowerCase()}
                                </badge_1.Badge>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">
                                  Contact Attempts
                                </div>
                                <div className="text-sm font-medium">{entry.contactAttempts}</div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-xs text-muted-foreground">
                                Added: {entry.createdAt.toLocaleDateString()}
                                {entry.lastContact && (
                                  <span>
                                    {" "}
                                    • Last contact: {entry.lastContact.toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button_1.Button
                                  variant="outline"
                                  size="sm"
                                  onClick={function (e) {
                                    e.stopPropagation();
                                    handleContactPatient(entry, "SMS");
                                  }}
                                >
                                  <lucide_react_1.MessageSquare className="h-4 w-4" />
                                </button_1.Button>
                                <button_1.Button
                                  variant="outline"
                                  size="sm"
                                  onClick={function (e) {
                                    e.stopPropagation();
                                    handleContactPatient(entry, "PHONE");
                                  }}
                                >
                                  <lucide_react_1.Phone className="h-4 w-4" />
                                </button_1.Button>
                                <button_1.Button
                                  variant="outline"
                                  size="sm"
                                  onClick={function (e) {
                                    e.stopPropagation();
                                    setSelectedEntry(entry);
                                  }}
                                >
                                  <lucide_react_1.Eye className="h-4 w-4" />
                                </button_1.Button>
                              </div>
                            </div>
                          </card_1.CardContent>
                        </card_1.Card>
                      );
                    })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="optimization" className="space-y-6">
          {/* Optimization Suggestions */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Zap className="h-5 w-5" />
                Optimization Suggestions
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {optimizationSuggestions.length === 0
                  ? <div className="text-center py-8 text-muted-foreground">
                      No optimization suggestions at the moment. Your waitlist is well-managed!
                    </div>
                  : optimizationSuggestions.map(function (suggestion, index) {
                      return (
                        <card_1.Card key={index} className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <badge_1.Badge
                                  variant={
                                    suggestion.impact === "HIGH"
                                      ? "destructive"
                                      : suggestion.impact === "MEDIUM"
                                        ? "default"
                                        : "secondary"
                                  }
                                >
                                  {suggestion.impact} Impact
                                </badge_1.Badge>
                                <span className="text-sm text-muted-foreground">
                                  {suggestion.confidence}% confidence
                                </span>
                              </div>
                              <h4 className="font-medium mb-1">{suggestion.description}</h4>
                              <p className="text-sm text-muted-foreground">
                                {suggestion.actionRequired}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-lg font-bold text-green-600">
                                -{suggestion.estimatedReduction} days
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {suggestion.affectedPatients} patients
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button_1.Button size="sm">Apply Suggestion</button_1.Button>
                            <button_1.Button variant="outline" size="sm">
                              View Details
                            </button_1.Button>
                          </div>
                        </card_1.Card>
                      );
                    })}
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Capacity Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Specialty Capacity Analysis</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {analytics.specialtyBreakdown.map(function (specialty, index) {
                    var utilizationRate = (specialty.waiting / specialty.capacity) * 100;
                    return (
                      <div key={specialty.specialty} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{specialty.specialty}</span>
                          <div className="text-right">
                            <span className="text-sm font-medium">
                              {specialty.waiting}/{specialty.capacity}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {formatWaitTime(specialty.avgWait)} avg
                            </div>
                          </div>
                        </div>
                        <progress_1.Progress
                          value={utilizationRate}
                          className={"h-2 ".concat(
                            utilizationRate > 80
                              ? "bg-red-100"
                              : utilizationRate > 60
                                ? "bg-yellow-100"
                                : "bg-green-100",
                          )}
                        />
                        <div className="text-xs text-muted-foreground">
                          {utilizationRate.toFixed(0)}% capacity utilization
                        </div>
                      </div>
                    );
                  })}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Wait Time Projection</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.LineChart data={analytics.waitTimeProjection.slice(0, 14)}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" />
                    <recharts_1.XAxis
                      dataKey="date"
                      tickFormatter={function (date) {
                        return new Date(date).toLocaleDateString("pt-BR", {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                    />
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip
                      labelFormatter={function (date) {
                        return new Date(date).toLocaleDateString("pt-BR");
                      }}
                      formatter={function (value, name) {
                        return [
                          "".concat(value.toFixed(1), " days"),
                          name === "projected"
                            ? "Current Trend"
                            : name === "historical"
                              ? "Historical"
                              : "Optimized",
                        ];
                      }}
                    />
                    <recharts_1.Line
                      type="monotone"
                      dataKey="historical"
                      stroke="#9CA3AF"
                      strokeDasharray="5 5"
                      name="historical"
                    />
                    <recharts_1.Line
                      type="monotone"
                      dataKey="projected"
                      stroke="#EF4444"
                      strokeWidth={2}
                      name="projected"
                    />
                    <recharts_1.Line
                      type="monotone"
                      dataKey="optimized"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="optimized"
                    />
                  </recharts_1.LineChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="analytics" className="space-y-6">
          {/* Priority Distribution and Conversion Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Priority Distribution</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.BarChart data={analytics.priorityDistribution}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" />
                    <recharts_1.XAxis dataKey="priority" />
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip />
                    <recharts_1.Bar dataKey="count" name="Count">
                      {analytics.priorityDistribution.map(function (entry, index) {
                        return <recharts_1.Cell key={"cell-".concat(index)} fill={entry.color} />;
                      })}
                    </recharts_1.Bar>
                  </recharts_1.BarChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Conversion Funnel</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {analytics.conversionRates.map(function (stage, index) {
                    return (
                      <div key={stage.stage} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{stage.stage}</span>
                          <div className="text-right">
                            <span className="font-bold">{stage.rate}%</span>
                            <div className="text-xs text-muted-foreground">
                              {stage.count} patients
                            </div>
                          </div>
                        </div>
                        <progress_1.Progress value={stage.rate} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Wait Time Trends */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Wait Time Trends (30 Days)</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <recharts_1.ResponsiveContainer width="100%" height={400}>
                <recharts_1.AreaChart data={analytics.waitTimeProjection}>
                  <recharts_1.CartesianGrid strokeDasharray="3 3" />
                  <recharts_1.XAxis
                    dataKey="date"
                    tickFormatter={function (date) {
                      return new Date(date).toLocaleDateString("pt-BR", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <recharts_1.YAxis />
                  <recharts_1.Tooltip
                    labelFormatter={function (date) {
                      return new Date(date).toLocaleDateString("pt-BR");
                    }}
                    formatter={function (value, name) {
                      return [
                        "".concat(value.toFixed(1), " days"),
                        name === "projected"
                          ? "Projected"
                          : name === "historical"
                            ? "Historical"
                            : "Optimized",
                      ];
                    }}
                  />
                  <recharts_1.Area
                    type="monotone"
                    dataKey="historical"
                    stackId="1"
                    stroke="#9CA3AF"
                    fill="#F3F4F6"
                    name="historical"
                  />
                  <recharts_1.Area
                    type="monotone"
                    dataKey="projected"
                    stackId="2"
                    stroke="#EF4444"
                    fill="#FEE2E2"
                    name="projected"
                  />
                  <recharts_1.Area
                    type="monotone"
                    dataKey="optimized"
                    stackId="3"
                    stroke="#10B981"
                    fill="#DCFCE7"
                    name="optimized"
                  />
                </recharts_1.AreaChart>
              </recharts_1.ResponsiveContainer>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="settings" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Waitlist Configuration</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Waitlist configuration settings coming soon.
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Selected Entry Detail Modal */}
      {selectedEntry && (
        <dialog_1.Dialog
          open={!!selectedEntry}
          onOpenChange={function () {
            return setSelectedEntry(null);
          }}
        >
          <dialog_1.DialogContent className="max-w-2xl">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle className="flex items-center gap-2">
                <badge_1.Badge variant={getPriorityVariant(selectedEntry.priority)}>
                  {PRIORITY_LABELS[selectedEntry.priority]}
                </badge_1.Badge>
                {selectedEntry.patientName}
              </dialog_1.DialogTitle>
            </dialog_1.DialogHeader>
            <div className="space-y-6">
              {/* Patient Details */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Specialty</label>
                    <div>{selectedEntry.specialty}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Doctor</label>
                    <div>{selectedEntry.doctor}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Requested Date
                    </label>
                    <div>{selectedEntry.requestedDate.toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Estimated Wait
                    </label>
                    <div
                      className={"font-medium ".concat(
                        getWaitTimeColor(selectedEntry.estimatedWaitTime),
                      )}
                    >
                      {formatWaitTime(selectedEntry.estimatedWaitTime)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      No-Show Risk
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedEntry.noShowRisk}%</span>
                      <progress_1.Progress
                        value={selectedEntry.noShowRisk}
                        className="h-2 flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <badge_1.Badge
                      variant={
                        selectedEntry.status === "WAITING"
                          ? "default"
                          : selectedEntry.status === "CONTACTED"
                            ? "secondary"
                            : selectedEntry.status === "SCHEDULED"
                              ? "outline"
                              : "destructive"
                      }
                    >
                      {selectedEntry.status.toLowerCase()}
                    </badge_1.Badge>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="font-medium mb-3">Contact History</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Contact Attempts:</span>
                    <span className="font-medium">{selectedEntry.contactAttempts}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Contact:</span>
                    <span className="font-medium">
                      {selectedEntry.lastContact
                        ? selectedEntry.lastContact.toLocaleDateString()
                        : "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Added to Waitlist:</span>
                    <span className="font-medium">
                      {selectedEntry.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferred Time Slots */}
              <div>
                <h4 className="font-medium mb-3">Preferred Time Slots</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEntry.preferredTimeSlots.map(function (slot, index) {
                    return (
                      <badge_1.Badge key={index} variant="outline">
                        {slot}
                      </badge_1.Badge>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <button_1.Button
                    variant="outline"
                    onClick={function () {
                      return handleContactPatient(selectedEntry, "SMS");
                    }}
                  >
                    <lucide_react_1.MessageSquare className="h-4 w-4 mr-2" />
                    Send SMS
                  </button_1.Button>
                  <button_1.Button
                    variant="outline"
                    onClick={function () {
                      return handleContactPatient(selectedEntry, "PHONE");
                    }}
                  >
                    <lucide_react_1.Phone className="h-4 w-4 mr-2" />
                    Call
                  </button_1.Button>
                  <button_1.Button
                    variant="outline"
                    onClick={function () {
                      return handleContactPatient(selectedEntry, "EMAIL");
                    }}
                  >
                    <lucide_react_1.Mail className="h-4 w-4 mr-2" />
                    Email
                  </button_1.Button>
                </div>
                <div className="flex gap-2">
                  <button_1.Button
                    variant="outline"
                    onClick={function () {
                      return setSelectedEntry(null);
                    }}
                  >
                    Close
                  </button_1.Button>
                  <button_1.Button>
                    <lucide_react_1.Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </button_1.Button>
                </div>
              </div>
            </div>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      )}
    </div>
  );
}
