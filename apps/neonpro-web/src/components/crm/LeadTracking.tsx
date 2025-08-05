/**
 * Lead Tracking Component
 * Lead scoring, pipeline management, and conversion tracking
 * Created: January 24, 2025
 */

"use client";

import type { useState, useMemo } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Progress } from "@/components/ui/progress";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  TrendingUp,
  Target,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react";
import type {
  Customer,
  Appointment,
  LeadScore,
  calculateLeadScore,
  categorizeLeadPriority,
  determineCustomerLifecycle,
  predictChurnRisk,
  calculateCustomerLifetimeValue,
  rankCustomersByValue,
} from "./utils";

interface LeadTrackingProps {
  customers?: Customer[];
  appointments?: Appointment[];
  onLeadAction?: (customerId: string, action: string) => void;
  className?: string;
}

export function LeadTracking({
  customers = [],
  appointments = [],
  onLeadAction,
  className = "",
}: LeadTrackingProps) {
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedLifecycle, setSelectedLifecycle] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("score");

  // Calculate lead scores for all customers
  const customerLeadScores = useMemo(() => {
    return customers.map((customer) => {
      const customerAppointments = appointments.filter((apt) => apt.customerId === customer.id);
      const leadScore = calculateLeadScore(customer, customerAppointments);
      const lifecycle = determineCustomerLifecycle(customer);
      const churnRisk = predictChurnRisk(customer);
      const lifetimeValue = calculateCustomerLifetimeValue(customerAppointments);

      return {
        customer,
        leadScore,
        lifecycle,
        churnRisk,
        lifetimeValue,
        appointments: customerAppointments,
      };
    });
  }, [customers, appointments]);

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    const filtered = customerLeadScores.filter((lead) => {
      const matchesSearch =
        lead.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.customer.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPriority =
        selectedPriority === "all" || lead.leadScore.priority === selectedPriority;
      const matchesLifecycle = selectedLifecycle === "all" || lead.lifecycle === selectedLifecycle;

      return matchesSearch && matchesPriority && matchesLifecycle;
    });

    // Sort leads
    switch (sortBy) {
      case "score":
        filtered.sort((a, b) => b.leadScore.score - a.leadScore.score);
        break;
      case "value":
        filtered.sort((a, b) => b.lifetimeValue - a.lifetimeValue);
        break;
      case "risk":
        filtered.sort((a, b) => b.churnRisk - a.churnRisk);
        break;
      case "name":
        filtered.sort((a, b) => a.customer.name.localeCompare(b.customer.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [customerLeadScores, searchTerm, selectedPriority, selectedLifecycle, sortBy]);

  // Calculate pipeline analytics
  const pipelineAnalytics = useMemo(() => {
    const totalLeads = customerLeadScores.length;
    const highPriorityLeads = customerLeadScores.filter(
      (lead) => lead.leadScore.priority === "high",
    ).length;
    const mediumPriorityLeads = customerLeadScores.filter(
      (lead) => lead.leadScore.priority === "medium",
    ).length;
    const lowPriorityLeads = customerLeadScores.filter(
      (lead) => lead.leadScore.priority === "low",
    ).length;

    const averageScore =
      totalLeads > 0
        ? customerLeadScores.reduce((sum, lead) => sum + lead.leadScore.score, 0) / totalLeads
        : 0;

    const conversionOpportunities = customerLeadScores.filter(
      (lead) => lead.leadScore.score >= 60 && lead.lifecycle === "new",
    ).length;

    const atRiskHighValue = customerLeadScores.filter(
      (lead) => lead.churnRisk > 50 && lead.lifetimeValue > 500,
    ).length;

    return {
      totalLeads,
      highPriorityLeads,
      mediumPriorityLeads,
      lowPriorityLeads,
      averageScore,
      conversionOpportunities,
      atRiskHighValue,
    };
  }, [customerLeadScores]);

  // Get priority color
  const getPriorityColor = (priority: string) => {
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
  const getLifecycleColor = (lifecycle: string) => {
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
  const handleLeadAction = (customerId: string, action: string) => {
    onLeadAction?.(customerId, action);
  };

  // Render lead card
  const renderLeadCard = (leadData: any) => {
    const { customer, leadScore, lifecycle, churnRisk, lifetimeValue } = leadData;

    return (
      <Card key={customer.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{customer.name}</CardTitle>
              <CardDescription>{customer.email}</CardDescription>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge className={getPriorityColor(leadScore.priority)}>
                {leadScore.priority} priority
              </Badge>
              <Badge className={getLifecycleColor(lifecycle)}>{lifecycle}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lead Score */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Lead Score</span>
              <span className="text-sm font-bold">{leadScore.score}/100</span>
            </div>
            <Progress value={leadScore.score} className="h-2" />
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
                className={`font-medium ${churnRisk > 60 ? "text-red-600" : churnRisk > 30 ? "text-yellow-600" : "text-green-600"}`}
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
            <Button
              size="sm"
              variant="default"
              onClick={() => handleLeadAction(customer.id, "contact")}
              className="flex-1"
            >
              Contact
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleLeadAction(customer.id, "schedule")}
              className="flex-1"
            >
              Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Pipeline Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelineAnalytics.totalLeads}</div>
            <p className="text-xs text-gray-500">Active prospects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Target className="h-4 w-4 mr-2" />
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {pipelineAnalytics.highPriorityLeads}
            </div>
            <p className="text-xs text-gray-500">Immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelineAnalytics.averageScore.toFixed(1)}</div>
            <p className="text-xs text-gray-500">Lead quality metric</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              At Risk (High Value)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pipelineAnalytics.atRiskHighValue}
            </div>
            <p className="text-xs text-gray-500">Needs retention effort</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Opportunities */}
      {pipelineAnalytics.conversionOpportunities > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Conversion Opportunities
            </CardTitle>
            <CardDescription className="text-green-700">
              {pipelineAnalytics.conversionOpportunities} high-scoring new customers ready for
              conversion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-green-600 hover:bg-green-700">
              View Opportunities
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">Lead Pipeline</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="priorities">Priority Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="lead-search">Search Leads</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lead-search"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-40">
                  <Label>Priority</Label>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-40">
                  <Label>Lifecycle</Label>
                  <Select value={selectedLifecycle} onValueChange={setSelectedLifecycle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="at-risk">At Risk</SelectItem>
                      <SelectItem value="churned">Churned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-40">
                  <Label>Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="score">Lead Score</SelectItem>
                      <SelectItem value="value">Lifetime Value</SelectItem>
                      <SelectItem value="risk">Churn Risk</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map(renderLeadCard)}
          </div>

          {filteredLeads.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No leads found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
                <CardDescription>Lead distribution by priority level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">High Priority</span>
                    <span className="text-sm font-medium">
                      {pipelineAnalytics.highPriorityLeads}
                    </span>
                  </div>
                  <Progress
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
                  <Progress
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
                  <Progress
                    value={
                      (pipelineAnalytics.lowPriorityLeads / pipelineAnalytics.totalLeads) * 100
                    }
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Scoring Leads</CardTitle>
                <CardDescription>Highest potential customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredLeads.slice(0, 5).map((lead, index) => (
                    <div
                      key={lead.customer.id}
                      className="flex items-center justify-between p-2 rounded bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <div className="font-medium text-sm">{lead.customer.name}</div>
                          <div className="text-xs text-gray-500">{lead.customer.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">{lead.leadScore.score}</div>
                        <Badge
                          className={getPriorityColor(lead.leadScore.priority)}
                          variant="outline"
                        >
                          {lead.leadScore.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="priorities" className="space-y-4">
          {/* High Priority Leads */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                High Priority Leads ({pipelineAnalytics.highPriorityLeads})
              </CardTitle>
              <CardDescription>Leads requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLeads
                  .filter((lead) => lead.leadScore.priority === "high")
                  .slice(0, 6)
                  .map(renderLeadCard)}
              </div>
              {filteredLeads.filter((lead) => lead.leadScore.priority === "high").length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No high priority leads at this time
                </p>
              )}
            </CardContent>
          </Card>

          {/* At-Risk High Value Customers */}
          {pipelineAnalytics.atRiskHighValue > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-600 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  At-Risk High Value Customers ({pipelineAnalytics.atRiskHighValue})
                </CardTitle>
                <CardDescription>High-value customers with elevated churn risk</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLeads
                    .filter((lead) => lead.churnRisk > 50 && lead.lifetimeValue > 500)
                    .slice(0, 4)
                    .map(renderLeadCard)}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
