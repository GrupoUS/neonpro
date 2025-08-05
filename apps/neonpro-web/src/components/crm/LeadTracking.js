/**
 * Lead Tracking Component
 * Lead scoring, pipeline management, and conversion tracking
 * Created: January 24, 2025
 */
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadTracking = LeadTracking;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("./utils");
function LeadTracking(_a) {
  var _b = _a.customers,
    customers = _b === void 0 ? [] : _b,
    _c = _a.appointments,
    appointments = _c === void 0 ? [] : _c,
    onLeadAction = _a.onLeadAction,
    _d = _a.className,
    className = _d === void 0 ? "" : _d;
  var _e = (0, react_1.useState)("all"),
    selectedPriority = _e[0],
    setSelectedPriority = _e[1];
  var _f = (0, react_1.useState)("all"),
    selectedLifecycle = _f[0],
    setSelectedLifecycle = _f[1];
  var _g = (0, react_1.useState)(""),
    searchTerm = _g[0],
    setSearchTerm = _g[1];
  var _h = (0, react_1.useState)("score"),
    sortBy = _h[0],
    setSortBy = _h[1];
  // Calculate lead scores for all customers
  var customerLeadScores = (0, react_1.useMemo)(
    function () {
      return customers.map(function (customer) {
        var customerAppointments = appointments.filter(function (apt) {
          return apt.customerId === customer.id;
        });
        var leadScore = (0, utils_1.calculateLeadScore)(customer, customerAppointments);
        var lifecycle = (0, utils_1.determineCustomerLifecycle)(customer);
        var churnRisk = (0, utils_1.predictChurnRisk)(customer);
        var lifetimeValue = (0, utils_1.calculateCustomerLifetimeValue)(customerAppointments);
        return {
          customer: customer,
          leadScore: leadScore,
          lifecycle: lifecycle,
          churnRisk: churnRisk,
          lifetimeValue: lifetimeValue,
          appointments: customerAppointments,
        };
      });
    },
    [customers, appointments],
  );
  // Filter and sort leads
  var filteredLeads = (0, react_1.useMemo)(
    function () {
      var filtered = customerLeadScores.filter(function (lead) {
        var matchesSearch =
          lead.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesPriority =
          selectedPriority === "all" || lead.leadScore.priority === selectedPriority;
        var matchesLifecycle = selectedLifecycle === "all" || lead.lifecycle === selectedLifecycle;
        return matchesSearch && matchesPriority && matchesLifecycle;
      });
      // Sort leads
      switch (sortBy) {
        case "score":
          filtered.sort(function (a, b) {
            return b.leadScore.score - a.leadScore.score;
          });
          break;
        case "value":
          filtered.sort(function (a, b) {
            return b.lifetimeValue - a.lifetimeValue;
          });
          break;
        case "risk":
          filtered.sort(function (a, b) {
            return b.churnRisk - a.churnRisk;
          });
          break;
        case "name":
          filtered.sort(function (a, b) {
            return a.customer.name.localeCompare(b.customer.name);
          });
          break;
        default:
          break;
      }
      return filtered;
    },
    [customerLeadScores, searchTerm, selectedPriority, selectedLifecycle, sortBy],
  );
  // Calculate pipeline analytics
  var pipelineAnalytics = (0, react_1.useMemo)(
    function () {
      var totalLeads = customerLeadScores.length;
      var highPriorityLeads = customerLeadScores.filter(function (lead) {
        return lead.leadScore.priority === "high";
      }).length;
      var mediumPriorityLeads = customerLeadScores.filter(function (lead) {
        return lead.leadScore.priority === "medium";
      }).length;
      var lowPriorityLeads = customerLeadScores.filter(function (lead) {
        return lead.leadScore.priority === "low";
      }).length;
      var averageScore =
        totalLeads > 0
          ? customerLeadScores.reduce(function (sum, lead) {
              return sum + lead.leadScore.score;
            }, 0) / totalLeads
          : 0;
      var conversionOpportunities = customerLeadScores.filter(function (lead) {
        return lead.leadScore.score >= 60 && lead.lifecycle === "new";
      }).length;
      var atRiskHighValue = customerLeadScores.filter(function (lead) {
        return lead.churnRisk > 50 && lead.lifetimeValue > 500;
      }).length;
      return {
        totalLeads: totalLeads,
        highPriorityLeads: highPriorityLeads,
        mediumPriorityLeads: mediumPriorityLeads,
        lowPriorityLeads: lowPriorityLeads,
        averageScore: averageScore,
        conversionOpportunities: conversionOpportunities,
        atRiskHighValue: atRiskHighValue,
      };
    },
    [customerLeadScores],
  );
  // Get priority color
  var getPriorityColor = function (priority) {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  // Get lifecycle color
  var getLifecycleColor = function (lifecycle) {
    switch (lifecycle) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "at-risk":
        return "bg-yellow-100 text-yellow-800";
      case "churned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  // Handle lead action
  var handleLeadAction = function (customerId, action) {
    onLeadAction === null || onLeadAction === void 0 ? void 0 : onLeadAction(customerId, action);
  };
  // Render lead card
  var renderLeadCard = function (leadData) {
    var customer = leadData.customer,
      leadScore = leadData.leadScore,
      lifecycle = leadData.lifecycle,
      churnRisk = leadData.churnRisk,
      lifetimeValue = leadData.lifetimeValue;
    return (
      <card_1.Card key={customer.id} className="hover:shadow-md transition-shadow">
        <card_1.CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle className="text-lg">{customer.name}</card_1.CardTitle>
              <card_1.CardDescription>{customer.email}</card_1.CardDescription>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <badge_1.Badge className={getPriorityColor(leadScore.priority)}>
                {leadScore.priority} priority
              </badge_1.Badge>
              <badge_1.Badge className={getLifecycleColor(lifecycle)}>{lifecycle}</badge_1.Badge>
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent className="space-y-4">
          {/* Lead Score */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Lead Score</span>
              <span className="text-sm font-bold">{leadScore.score}/100</span>
            </div>
            <progress_1.Progress value={leadScore.score} className="h-2" />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Lifetime Value:</span>
              <span className="font-medium">${lifetimeValue.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Appointments:</span>
              <span className="font-medium">{customer.appointmentCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Churn Risk:</span>
              <span
                className={"font-medium ".concat(
                  churnRisk > 60
                    ? "text-red-600"
                    : churnRisk > 30
                      ? "text-yellow-600"
                      : "text-green-600",
                )}
              >
                {churnRisk.toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Lead Source:</span>
              <span className="font-medium">{customer.leadSource}</span>
            </div>
          </div>

          {/* Score Factors */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700">Score Breakdown:</div>
            <div className="grid grid-cols-4 gap-1 text-xs">
              <div className="text-center">
                <div className="font-medium">{leadScore.factors.engagement}</div>
                <div className="text-gray-500">Engage</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{leadScore.factors.value}</div>
                <div className="text-gray-500">Value</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{leadScore.factors.frequency}</div>
                <div className="text-gray-500">Freq</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{leadScore.factors.recency}</div>
                <div className="text-gray-500">Recent</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <button_1.Button
              size="sm"
              variant="default"
              onClick={function () {
                return handleLeadAction(customer.id, "contact");
              }}
              className="flex-1"
            >
              Contact
            </button_1.Button>
            <button_1.Button
              size="sm"
              variant="outline"
              onClick={function () {
                return handleLeadAction(customer.id, "schedule");
              }}
              className="flex-1"
            >
              Schedule
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Pipeline Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm flex items-center">
              <lucide_react_1.Users className="h-4 w-4 mr-2" />
              Total Leads
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{pipelineAnalytics.totalLeads}</div>
            <p className="text-xs text-gray-500">Active prospects</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm flex items-center">
              <lucide_react_1.Target className="h-4 w-4 mr-2" />
              High Priority
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-red-600">
              {pipelineAnalytics.highPriorityLeads}
            </div>
            <p className="text-xs text-gray-500">Immediate attention</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm flex items-center">
              <lucide_react_1.TrendingUp className="h-4 w-4 mr-2" />
              Avg Score
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{pipelineAnalytics.averageScore.toFixed(1)}</div>
            <p className="text-xs text-gray-500">Lead quality metric</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm flex items-center">
              <lucide_react_1.AlertCircle className="h-4 w-4 mr-2" />
              At Risk (High Value)
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pipelineAnalytics.atRiskHighValue}
            </div>
            <p className="text-xs text-gray-500">Needs retention effort</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Conversion Opportunities */}
      {pipelineAnalytics.conversionOpportunities > 0 && (
        <card_1.Card className="border-green-200 bg-green-50">
          <card_1.CardHeader>
            <card_1.CardTitle className="text-green-800 flex items-center">
              <lucide_react_1.CheckCircle className="h-5 w-5 mr-2" />
              Conversion Opportunities
            </card_1.CardTitle>
            <card_1.CardDescription className="text-green-700">
              {pipelineAnalytics.conversionOpportunities} high-scoring new customers ready for
              conversion
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <button_1.Button className="bg-green-600 hover:bg-green-700">
              View Opportunities
              <lucide_react_1.ArrowRight className="h-4 w-4 ml-2" />
            </button_1.Button>
          </card_1.CardContent>
        </card_1.Card>
      )}

      <tabs_1.Tabs defaultValue="pipeline" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="pipeline">Lead Pipeline</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics">Analytics</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="priorities">Priority Queue</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="pipeline" className="space-y-4">
          {/* Filters */}
          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label_1.Label htmlFor="lead-search">Search Leads</label_1.Label>
                  <div className="relative">
                    <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input_1.Input
                      id="lead-search"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={function (e) {
                        return setSearchTerm(e.target.value);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-40">
                  <label_1.Label>Priority</label_1.Label>
                  <select_1.Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="all">All Priorities</select_1.SelectItem>
                      <select_1.SelectItem value="high">High</select_1.SelectItem>
                      <select_1.SelectItem value="medium">Medium</select_1.SelectItem>
                      <select_1.SelectItem value="low">Low</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
                <div className="w-full md:w-40">
                  <label_1.Label>Lifecycle</label_1.Label>
                  <select_1.Select value={selectedLifecycle} onValueChange={setSelectedLifecycle}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="all">All Stages</select_1.SelectItem>
                      <select_1.SelectItem value="new">New</select_1.SelectItem>
                      <select_1.SelectItem value="active">Active</select_1.SelectItem>
                      <select_1.SelectItem value="at-risk">At Risk</select_1.SelectItem>
                      <select_1.SelectItem value="churned">Churned</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
                <div className="w-full md:w-40">
                  <label_1.Label>Sort By</label_1.Label>
                  <select_1.Select value={sortBy} onValueChange={setSortBy}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="score">Lead Score</select_1.SelectItem>
                      <select_1.SelectItem value="value">Lifetime Value</select_1.SelectItem>
                      <select_1.SelectItem value="risk">Churn Risk</select_1.SelectItem>
                      <select_1.SelectItem value="name">Name</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Lead Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map(renderLeadCard)}
          </div>

          {filteredLeads.length === 0 && (
            <card_1.Card>
              <card_1.CardContent className="text-center py-8">
                <lucide_react_1.Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No leads found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </card_1.CardContent>
            </card_1.Card>
          )}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority Distribution */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Priority Distribution</card_1.CardTitle>
                <card_1.CardDescription>Lead distribution by priority level</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Priority</span>
                    <span className="text-sm font-medium">
                      {pipelineAnalytics.highPriorityLeads}
                    </span>
                  </div>
                  <progress_1.Progress
                    value={
                      (pipelineAnalytics.highPriorityLeads / pipelineAnalytics.totalLeads) * 100
                    }
                    className="h-2"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Medium Priority</span>
                    <span className="text-sm font-medium">
                      {pipelineAnalytics.mediumPriorityLeads}
                    </span>
                  </div>
                  <progress_1.Progress
                    value={
                      (pipelineAnalytics.mediumPriorityLeads / pipelineAnalytics.totalLeads) * 100
                    }
                    className="h-2"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Low Priority</span>
                    <span className="text-sm font-medium">
                      {pipelineAnalytics.lowPriorityLeads}
                    </span>
                  </div>
                  <progress_1.Progress
                    value={
                      (pipelineAnalytics.lowPriorityLeads / pipelineAnalytics.totalLeads) * 100
                    }
                    className="h-2"
                  />
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Top Performers */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Top Scoring Leads</card_1.CardTitle>
                <card_1.CardDescription>Highest potential customers</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  {filteredLeads.slice(0, 5).map(function (lead, index) {
                    return (
                      <div
                        key={lead.customer.id}
                        className="flex items-center justify-between p-2 rounded bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <badge_1.Badge variant="outline">{index + 1}</badge_1.Badge>
                          <div>
                            <div className="font-medium text-sm">{lead.customer.name}</div>
                            <div className="text-xs text-gray-500">{lead.customer.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-sm">{lead.leadScore.score}</div>
                          <badge_1.Badge
                            className={getPriorityColor(lead.leadScore.priority)}
                            variant="outline"
                          >
                            {lead.leadScore.priority}
                          </badge_1.Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="priorities" className="space-y-4">
          {/* High Priority Leads */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-red-600 flex items-center">
                <lucide_react_1.AlertCircle className="h-5 w-5 mr-2" />
                High Priority Leads ({pipelineAnalytics.highPriorityLeads})
              </card_1.CardTitle>
              <card_1.CardDescription>Leads requiring immediate attention</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLeads
                  .filter(function (lead) {
                    return lead.leadScore.priority === "high";
                  })
                  .slice(0, 6)
                  .map(renderLeadCard)}
              </div>
              {filteredLeads.filter(function (lead) {
                return lead.leadScore.priority === "high";
              }).length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No high priority leads at this time
                </p>
              )}
            </card_1.CardContent>
          </card_1.Card>

          {/* At-Risk High Value Customers */}
          {pipelineAnalytics.atRiskHighValue > 0 && (
            <card_1.Card className="border-orange-200">
              <card_1.CardHeader>
                <card_1.CardTitle className="text-orange-600 flex items-center">
                  <lucide_react_1.DollarSign className="h-5 w-5 mr-2" />
                  At-Risk High Value Customers ({pipelineAnalytics.atRiskHighValue})
                </card_1.CardTitle>
                <card_1.CardDescription>
                  High-value customers with elevated churn risk
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLeads
                    .filter(function (lead) {
                      return lead.churnRisk > 50 && lead.lifetimeValue > 500;
                    })
                    .slice(0, 4)
                    .map(renderLeadCard)}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          )}
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
