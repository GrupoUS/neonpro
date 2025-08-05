/**
 * Customer Management Component
 * Comprehensive customer profile and relationship management
 * Created: January 24, 2025
 */
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerManagement = CustomerManagement;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var avatar_1 = require("@/components/ui/avatar");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("./utils");
function CustomerManagement(_a) {
  var _b = _a.customers,
    customers = _b === void 0 ? [] : _b,
    _c = _a.appointments,
    appointments = _c === void 0 ? [] : _c,
    onCustomerSelect = _a.onCustomerSelect,
    onFollowUpSchedule = _a.onFollowUpSchedule,
    _d = _a.className,
    className = _d === void 0 ? "" : _d;
  var _e = (0, react_1.useState)(null),
    selectedCustomer = _e[0],
    setSelectedCustomer = _e[1];
  var _f = (0, react_1.useState)(""),
    searchTerm = _f[0],
    setSearchTerm = _f[1];
  var _g = (0, react_1.useState)("all"),
    filterStatus = _g[0],
    setFilterStatus = _g[1];
  var _h = (0, react_1.useState)("all"),
    filterLifecycle = _h[0],
    setFilterLifecycle = _h[1];
  // Filter and search customers
  var filteredCustomers = (0, react_1.useMemo)(
    function () {
      return customers.filter(function (customer) {
        var matchesSearch =
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm);
        var matchesStatus = filterStatus === "all" || customer.status === filterStatus;
        var lifecycle = (0, utils_1.determineCustomerLifecycle)(customer);
        var matchesLifecycle = filterLifecycle === "all" || lifecycle === filterLifecycle;
        return matchesSearch && matchesStatus && matchesLifecycle;
      });
    },
    [customers, searchTerm, filterStatus, filterLifecycle],
  );
  // Calculate customer analytics
  var customerAnalytics = (0, react_1.useMemo)(
    function () {
      var totalCustomers = customers.length;
      var activeCustomers = customers.filter(function (c) {
        return c.status === "active";
      }).length;
      var averageLifetimeValue =
        customers.reduce(function (sum, c) {
          return sum + c.totalSpent;
        }, 0) / totalCustomers;
      var averageSatisfaction =
        customers
          .filter(function (c) {
            return c.satisfactionRating;
          })
          .reduce(function (sum, c) {
            return sum + (c.satisfactionRating || 0);
          }, 0) /
        customers.filter(function (c) {
          return c.satisfactionRating;
        }).length;
      return {
        totalCustomers: totalCustomers,
        activeCustomers: activeCustomers,
        averageLifetimeValue: averageLifetimeValue || 0,
        averageSatisfaction: averageSatisfaction || 0,
        retentionRate: totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0,
      };
    },
    [customers],
  );
  // Get customer appointments
  var getCustomerAppointments = function (customerId) {
    return appointments.filter(function (apt) {
      return apt.customerId === customerId;
    });
  };
  // Handle customer selection
  var handleCustomerSelect = function (customer) {
    setSelectedCustomer(customer);
    onCustomerSelect === null || onCustomerSelect === void 0 ? void 0 : onCustomerSelect(customer);
  };
  // Handle follow-up scheduling
  var handleScheduleFollowUp = function (customer, context) {
    var lifecycle = (0, utils_1.determineCustomerLifecycle)(customer);
    var lastContactDate = customer.lastVisitDate || customer.registrationDate;
    var followUpDate = (0, utils_1.determineNextFollowUpDate)(lastContactDate, lifecycle);
    var message = (0, utils_1.generateFollowUpMessage)(customer, context);
    onFollowUpSchedule === null || onFollowUpSchedule === void 0
      ? void 0
      : onFollowUpSchedule(customer.id, followUpDate, message);
  };
  // Render customer card
  var renderCustomerCard = function (customer) {
    var customerAppointments = getCustomerAppointments(customer.id);
    var leadScore = (0, utils_1.calculateLeadScore)(customer, customerAppointments);
    var lifecycle = (0, utils_1.determineCustomerLifecycle)(customer);
    var churnRisk = (0, utils_1.predictChurnRisk)(customer);
    var lifetimeValue = (0, utils_1.calculateCustomerLifetimeValue)(customerAppointments);
    var daysSinceLastVisit = customer.lastVisitDate
      ? (0, utils_1.calculateDaysSinceLastVisit)(customer.lastVisitDate)
      : null;
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
    var getPriorityColor = function (priority) {
      switch (priority) {
        case "high":
          return "bg-red-100 text-red-800";
        case "medium":
          return "bg-yellow-100 text-yellow-800";
        case "low":
          return "bg-green-100 text-green-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };
    return (
      <card_1.Card
        key={customer.id}
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={function () {
          return handleCustomerSelect(customer);
        }}
      >
        <card_1.CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <avatar_1.Avatar>
                <avatar_1.AvatarFallback>
                  {customer.name
                    .split(" ")
                    .map(function (n) {
                      return n[0];
                    })
                    .join("")}
                </avatar_1.AvatarFallback>
              </avatar_1.Avatar>
              <div>
                <card_1.CardTitle className="text-lg">{customer.name}</card_1.CardTitle>
                <card_1.CardDescription className="flex items-center space-x-2">
                  <lucide_react_1.Mail className="h-3 w-3" />
                  <span>{customer.email}</span>
                </card_1.CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <badge_1.Badge className={getLifecycleColor(lifecycle)}>
                {lifecycle.charAt(0).toUpperCase() + lifecycle.slice(1)}
              </badge_1.Badge>
              <badge_1.Badge className={getPriorityColor(leadScore.priority)}>
                Score: {leadScore.score}
              </badge_1.Badge>
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <lucide_react_1.DollarSign className="h-4 w-4 text-green-600" />
              <span>LTV: ${lifetimeValue.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <lucide_react_1.Calendar className="h-4 w-4 text-blue-600" />
              <span>{customer.appointmentCount} visits</span>
            </div>
            <div className="flex items-center space-x-2">
              <lucide_react_1.Phone className="h-4 w-4 text-purple-600" />
              <span>{customer.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              {churnRisk > 60
                ? <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-600" />
                : <lucide_react_1.Heart className="h-4 w-4 text-pink-600" />}
              <span>{churnRisk.toFixed(0)}% risk</span>
            </div>
          </div>

          {daysSinceLastVisit !== null && (
            <div className="mt-3 text-xs text-gray-500">
              Last visit: {daysSinceLastVisit} days ago
            </div>
          )}

          {customer.satisfactionRating && (
            <div className="mt-2 flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map(function (star) {
                return (
                  <lucide_react_1.Star
                    key={star}
                    className={"h-3 w-3 ".concat(
                      star <= customer.satisfactionRating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300",
                    )}
                  />
                );
              })}
              <span className="text-xs text-gray-500 ml-1">({customer.satisfactionRating}/5)</span>
            </div>
          )}
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  // Render customer details
  var renderCustomerDetails = function (customer) {
    var customerAppointments = getCustomerAppointments(customer.id);
    var leadScore = (0, utils_1.calculateLeadScore)(customer, customerAppointments);
    var lifecycle = (0, utils_1.determineCustomerLifecycle)(customer);
    var churnRisk = (0, utils_1.predictChurnRisk)(customer);
    var lifetimeValue = (0, utils_1.calculateCustomerLifetimeValue)(customerAppointments);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{customer.name}</h3>
            <p className="text-gray-600">{customer.email}</p>
          </div>
          <div className="flex space-x-2">
            <button_1.Button
              variant="outline"
              size="sm"
              onClick={function () {
                return handleScheduleFollowUp(customer, "appointment");
              }}
            >
              <lucide_react_1.MessageSquare className="h-4 w-4 mr-2" />
              Schedule Follow-up
            </button_1.Button>
            <button_1.Button
              variant="outline"
              size="sm"
              onClick={function () {
                return handleScheduleFollowUp(customer, "satisfaction");
              }}
            >
              <lucide_react_1.Star className="h-4 w-4 mr-2" />
              Request Feedback
            </button_1.Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm">Lead Score</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{leadScore.score}/100</div>
              <progress_1.Progress value={leadScore.score} className="mt-2" />
              <badge_1.Badge className="mt-2">{leadScore.priority} priority</badge_1.Badge>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm">Lifetime Value</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">${lifetimeValue.toFixed(2)}</div>
              <p className="text-xs text-gray-500">{customer.appointmentCount} appointments</p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm">Lifecycle Stage</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-lg font-semibold capitalize">{lifecycle}</div>
              <p className="text-xs text-gray-500">
                {customer.lastVisitDate
                  ? "Last visit: ".concat(
                      (0, utils_1.calculateDaysSinceLastVisit)(customer.lastVisitDate),
                      " days ago",
                    )
                  : "No visits yet"}
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="pb-2">
              <card_1.CardTitle className="text-sm">Churn Risk</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{churnRisk.toFixed(0)}%</div>
              <progress_1.Progress
                value={churnRisk}
                className="mt-2"
                // @ts-ignore
                style={{
                  "--progress-background":
                    churnRisk > 60 ? "#ef4444" : churnRisk > 30 ? "#f59e0b" : "#10b981",
                }}
              />
            </card_1.CardContent>
          </card_1.Card>
        </div>

        <tabs_1.Tabs defaultValue="details">
          <tabs_1.TabsList>
            <tabs_1.TabsTrigger value="details">Details</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="scoring">Lead Scoring</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="appointments">Appointments</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="details" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Contact Information</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label_1.Label>Phone</label_1.Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <lucide_react_1.Phone className="h-4 w-4 text-gray-500" />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                  <div>
                    <label_1.Label>Preferred Communication</label_1.Label>
                    <div className="mt-1 capitalize">{customer.communicationPreference}</div>
                  </div>
                  <div>
                    <label_1.Label>Registration Date</label_1.Label>
                    <div className="mt-1">
                      {new Date(customer.registrationDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label_1.Label>Lead Source</label_1.Label>
                    <div className="mt-1">{customer.leadSource}</div>
                  </div>
                </div>
                {customer.tags.length > 0 && (
                  <div>
                    <label_1.Label>Tags</label_1.Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {customer.tags.map(function (tag, index) {
                        return (
                          <badge_1.Badge key={index} variant="secondary">
                            {tag}
                          </badge_1.Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
                {customer.notes && (
                  <div>
                    <label_1.Label>Notes</label_1.Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded text-sm">{customer.notes}</div>
                  </div>
                )}
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="scoring" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Lead Score Breakdown</card_1.CardTitle>
                <card_1.CardDescription>
                  Score factors contributing to overall lead quality
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Engagement ({leadScore.factors.engagement}/25)</span>
                      <span>{((leadScore.factors.engagement / 25) * 100).toFixed(0)}%</span>
                    </div>
                    <progress_1.Progress value={(leadScore.factors.engagement / 25) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Value ({leadScore.factors.value}/25)</span>
                      <span>{((leadScore.factors.value / 25) * 100).toFixed(0)}%</span>
                    </div>
                    <progress_1.Progress value={(leadScore.factors.value / 25) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Frequency ({leadScore.factors.frequency}/25)</span>
                      <span>{((leadScore.factors.frequency / 25) * 100).toFixed(0)}%</span>
                    </div>
                    <progress_1.Progress value={(leadScore.factors.frequency / 25) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Recency ({leadScore.factors.recency}/25)</span>
                      <span>{((leadScore.factors.recency / 25) * 100).toFixed(0)}%</span>
                    </div>
                    <progress_1.Progress value={(leadScore.factors.recency / 25) * 100} />
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="appointments" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Appointment History</card_1.CardTitle>
                <card_1.CardDescription>
                  {customerAppointments.length} total appointments
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-2">
                  {customerAppointments.length === 0
                    ? <p className="text-gray-500 text-center py-4">No appointments found</p>
                    : customerAppointments.slice(0, 5).map(function (appointment) {
                        return (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between p-3 border rounded"
                          >
                            <div>
                              <div className="font-medium">{appointment.service}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(appointment.date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">${appointment.cost.toFixed(2)}</div>
                              <badge_1.Badge
                                variant={
                                  appointment.status === "completed"
                                    ? "default"
                                    : appointment.status === "cancelled"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {appointment.status}
                              </badge_1.Badge>
                            </div>
                          </div>
                        );
                      })}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </div>
    );
  };
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm">Total Customers</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{customerAnalytics.totalCustomers}</div>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm">Active Customers</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{customerAnalytics.activeCustomers}</div>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm">Avg Lifetime Value</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              ${customerAnalytics.averageLifetimeValue.toFixed(2)}
            </div>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm">Retention Rate</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">{customerAnalytics.retentionRate.toFixed(1)}%</div>
          </card_1.CardContent>
        </card_1.Card>
        <card_1.Card>
          <card_1.CardHeader className="pb-2">
            <card_1.CardTitle className="text-sm">Avg Satisfaction</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {customerAnalytics.averageSatisfaction.toFixed(1)}/5
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Filters and Search */}
      <card_1.Card>
        <card_1.CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label_1.Label htmlFor="search">Search Customers</label_1.Label>
              <input_1.Input
                id="search"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={function (e) {
                  return setSearchTerm(e.target.value);
                }}
              />
            </div>
            <div className="w-full md:w-48">
              <label_1.Label>Status</label_1.Label>
              <select_1.Select value={filterStatus} onValueChange={setFilterStatus}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">All Status</select_1.SelectItem>
                  <select_1.SelectItem value="active">Active</select_1.SelectItem>
                  <select_1.SelectItem value="inactive">Inactive</select_1.SelectItem>
                  <select_1.SelectItem value="churned">Churned</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            <div className="w-full md:w-48">
              <label_1.Label>Lifecycle</label_1.Label>
              <select_1.Select value={filterLifecycle} onValueChange={setFilterLifecycle}>
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
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Customer Details or Customer List */}
      {selectedCustomer
        ? <div>
            <button_1.Button
              variant="outline"
              onClick={function () {
                return setSelectedCustomer(null);
              }}
              className="mb-4"
            >
              ← Back to Customer List
            </button_1.Button>
            {renderCustomerDetails(selectedCustomer)}
          </div>
        : <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Customers ({filteredCustomers.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map(renderCustomerCard)}
            </div>
            {filteredCustomers.length === 0 && (
              <card_1.Card>
                <card_1.CardContent className="text-center py-8">
                  <lucide_react_1.User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No customers found</h3>
                  <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                </card_1.CardContent>
              </card_1.Card>
            )}
          </div>}
    </div>
  );
}
