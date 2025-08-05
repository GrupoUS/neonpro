/**
 * Story 11.2: Waitlist Optimization Component
 * Intelligent waitlist management with demand forecasting and slot optimization
 */

"use client";

import React, { useState, useMemo } from "react";
import type { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type { Input } from "@/components/ui/input";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Progress } from "@/components/ui/progress";
import type { Switch } from "@/components/ui/switch";
import type {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import type {
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
  Zap,
  Eye,
  Settings,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Phone,
  MessageSquare,
  Mail,
  Bell,
} from "lucide-react";

interface WaitlistEntry {
  id: string;
  patientId: string;
  patientName: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  requestedDate: Date;
  preferredTimeSlots: string[];
  specialty: string;
  doctor: string;
  estimatedWaitTime: number; // days
  noShowRisk: number;
  contactAttempts: number;
  lastContact: Date | null;
  status: "WAITING" | "CONTACTED" | "SCHEDULED" | "CANCELLED";
  createdAt: Date;
}

interface OptimizationSuggestion {
  type:
    | "SLOT_REALLOCATION"
    | "PRIORITY_ADJUSTMENT"
    | "PROACTIVE_CONTACT"
    | "CANCELLATION_PREDICTION";
  description: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  estimatedReduction: number; // days
  affectedPatients: number;
  confidence: number;
  actionRequired: string;
}

interface WaitlistAnalytics {
  averageWaitTime: number;
  totalWaiting: number;
  dailyThroughput: number;
  utilizationRate: number;
  priorityDistribution: Array<{
    priority: string;
    count: number;
    avgWait: number;
    color: string;
  }>;
  specialtyBreakdown: Array<{
    specialty: string;
    waiting: number;
    avgWait: number;
    capacity: number;
  }>;
  waitTimeProjection: Array<{
    date: string;
    projected: number;
    historical: number;
    optimized: number;
  }>;
  conversionRates: Array<{
    stage: string;
    rate: number;
    count: number;
  }>;
}

interface WaitlistOptimizationProps {
  waitlistEntries: WaitlistEntry[];
  onUpdateEntry: (id: string, updates: Partial<WaitlistEntry>) => void;
  onContactPatient: (patientId: string, method: "SMS" | "PHONE" | "EMAIL") => void;
  onScheduleAppointment: (entryId: string, appointmentData: any) => void;
}

const PRIORITY_COLORS = {
  LOW: "#10B981",
  MEDIUM: "#F59E0B",
  HIGH: "#EF4444",
  URGENT: "#DC2626",
};

const PRIORITY_LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export function WaitlistOptimization({
  waitlistEntries,
  onUpdateEntry,
  onContactPatient,
  onScheduleAppointment,
}: WaitlistOptimizationProps) {
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "optimization" | "analytics" | "settings"
  >("overview");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"waitTime" | "priority" | "risk" | "date">("waitTime");
  const [showOptimizations, setShowOptimizations] = useState(false);

  /**
   * Calculate waitlist analytics
   */
  const analytics = useMemo((): WaitlistAnalytics => {
    const activeEntries = waitlistEntries.filter(
      (e) => e.status === "WAITING" || e.status === "CONTACTED",
    );

    // Basic metrics
    const averageWaitTime =
      activeEntries.reduce((sum, entry) => sum + entry.estimatedWaitTime, 0) /
        activeEntries.length || 0;
    const totalWaiting = activeEntries.length;

    // Priority distribution
    const priorityGroups = activeEntries.reduce(
      (acc, entry) => {
        if (!acc[entry.priority]) {
          acc[entry.priority] = [];
        }
        acc[entry.priority].push(entry);
        return acc;
      },
      {} as Record<string, WaitlistEntry[]>,
    );

    const priorityDistribution = Object.entries(priorityGroups).map(([priority, entries]) => ({
      priority: PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS],
      count: entries.length,
      avgWait: entries.reduce((sum, e) => sum + e.estimatedWaitTime, 0) / entries.length,
      color: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS],
    }));

    // Specialty breakdown
    const specialtyGroups = activeEntries.reduce(
      (acc, entry) => {
        if (!acc[entry.specialty]) {
          acc[entry.specialty] = [];
        }
        acc[entry.specialty].push(entry);
        return acc;
      },
      {} as Record<string, WaitlistEntry[]>,
    );

    const specialtyBreakdown = Object.entries(specialtyGroups).map(([specialty, entries]) => ({
      specialty,
      waiting: entries.length,
      avgWait: entries.reduce((sum, e) => sum + e.estimatedWaitTime, 0) / entries.length,
      capacity: 100, // Mock capacity
    }));

    // Wait time projection (mock data for demo)
    const waitTimeProjection = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split("T")[0],
        projected: Math.max(0, averageWaitTime - i * 0.5 + Math.random() * 2),
        historical: Math.max(0, averageWaitTime + Math.random() * 3),
        optimized: Math.max(0, averageWaitTime - i * 0.8 + Math.random() * 1),
      };
    });

    // Conversion rates
    const conversionRates = [
      { stage: "Waitlist Entry", rate: 100, count: totalWaiting },
      { stage: "First Contact", rate: 85, count: Math.round(totalWaiting * 0.85) },
      { stage: "Response", rate: 68, count: Math.round(totalWaiting * 0.68) },
      { stage: "Scheduled", rate: 78, count: Math.round(totalWaiting * 0.78) },
      { stage: "Attended", rate: 82, count: Math.round(totalWaiting * 0.82) },
    ];

    return {
      averageWaitTime,
      totalWaiting,
      dailyThroughput: 15, // Mock
      utilizationRate: 78, // Mock
      priorityDistribution,
      specialtyBreakdown,
      waitTimeProjection,
      conversionRates,
    };
  }, [waitlistEntries]);

  /**
   * Generate optimization suggestions
   */
  const optimizationSuggestions = useMemo((): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];

    // High-risk patients that need immediate attention
    const highRiskPatients = waitlistEntries.filter(
      (e) => e.noShowRisk > 70 && e.status === "WAITING",
    );

    if (highRiskPatients.length > 0) {
      suggestions.push({
        type: "PROACTIVE_CONTACT",
        description: `${highRiskPatients.length} high-risk patients need immediate contact to prevent dropout`,
        impact: "HIGH",
        estimatedReduction: 3,
        affectedPatients: highRiskPatients.length,
        confidence: 85,
        actionRequired: "Contact high-risk patients within 24 hours",
      });
    }

    // Long-waiting urgent patients
    const urgentLongWait = waitlistEntries.filter(
      (e) => e.priority === "URGENT" && e.estimatedWaitTime > 7,
    );

    if (urgentLongWait.length > 0) {
      suggestions.push({
        type: "PRIORITY_ADJUSTMENT",
        description: `${urgentLongWait.length} urgent patients waiting over 7 days`,
        impact: "HIGH",
        estimatedReduction: 5,
        affectedPatients: urgentLongWait.length,
        confidence: 92,
        actionRequired: "Reallocate urgent slots or add emergency capacity",
      });
    }

    // Slot reallocation opportunities
    const overCapacitySpecialties = analytics.specialtyBreakdown.filter(
      (s) => s.waiting > s.capacity * 0.8,
    );

    if (overCapacitySpecialties.length > 0) {
      suggestions.push({
        type: "SLOT_REALLOCATION",
        description: `Rebalance capacity for ${overCapacitySpecialties.length} over-capacity specialties`,
        impact: "MEDIUM",
        estimatedReduction: 2,
        affectedPatients: overCapacitySpecialties.reduce((sum, s) => sum + s.waiting, 0),
        confidence: 78,
        actionRequired: "Review and redistribute appointment slots",
      });
    }

    // Potential cancellations based on patterns
    const likelyCancellations = waitlistEntries.filter(
      (e) => e.contactAttempts > 2 && !e.lastContact && e.estimatedWaitTime > 14,
    );

    if (likelyCancellations.length > 0) {
      suggestions.push({
        type: "CANCELLATION_PREDICTION",
        description: `${likelyCancellations.length} patients likely to cancel based on engagement patterns`,
        impact: "MEDIUM",
        estimatedReduction: 1,
        affectedPatients: likelyCancellations.length,
        confidence: 65,
        actionRequired: "Follow up with disengaged patients or mark for removal",
      });
    }

    return suggestions.sort((a, b) => {
      const impactOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }, [waitlistEntries, analytics]);

  /**
   * Filter and sort waitlist entries
   */
  const filteredEntries = useMemo(() => {
    const filtered = waitlistEntries.filter((entry) => {
      if (priorityFilter !== "ALL" && entry.priority !== priorityFilter) return false;
      if (specialtyFilter !== "ALL" && entry.specialty !== specialtyFilter) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "waitTime":
          return b.estimatedWaitTime - a.estimatedWaitTime;
        case "priority":
          const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "risk":
          return b.noShowRisk - a.noShowRisk;
        case "date":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [waitlistEntries, priorityFilter, specialtyFilter, sortBy]);

  /**
   * Get priority badge variant
   */
  const getPriorityVariant = (priority: string) => {
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
  const getWaitTimeColor = (days: number): string => {
    if (days <= 3) return "text-green-600";
    if (days <= 7) return "text-yellow-600";
    if (days <= 14) return "text-orange-600";
    return "text-red-600";
  };

  /**
   * Format days to readable format
   */
  const formatWaitTime = (days: number): string => {
    if (days < 1) return "Same day";
    if (days === 1) return "1 day";
    if (days < 7) return `${Math.round(days)} days`;
    const weeks = Math.round(days / 7);
    return weeks === 1 ? "1 week" : `${weeks} weeks`;
  };

  /**
   * Handle contact patient
   */
  const handleContactPatient = (entry: WaitlistEntry, method: "SMS" | "PHONE" | "EMAIL") => {
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
          <Button variant="outline" onClick={() => setShowOptimizations(!showOptimizations)}>
            <Target className="h-4 w-4 mr-2" />
            {showOptimizations ? "Hide" : "Show"} Optimizations
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Optimization Alerts */}
      {showOptimizations && optimizationSuggestions.length > 0 && (
        <div className="space-y-3">
          {optimizationSuggestions.slice(0, 3).map((suggestion, index) => (
            <Alert
              key={index}
              className={
                suggestion.impact === "HIGH"
                  ? "border-red-200 bg-red-50"
                  : suggestion.impact === "MEDIUM"
                    ? "border-yellow-200 bg-yellow-50"
                    : "border-blue-200 bg-blue-50"
              }
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{suggestion.description}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {suggestion.actionRequired}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <Badge
                      variant={
                        suggestion.impact === "HIGH"
                          ? "destructive"
                          : suggestion.impact === "MEDIUM"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {suggestion.impact} Impact
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      -{suggestion.estimatedReduction} days • {suggestion.confidence}% confidence
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Waiting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalWaiting}</div>
            <div className="text-xs text-muted-foreground">Active waitlist entries</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Average Wait
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getWaitTimeColor(analytics.averageWaitTime)}`}>
              {formatWaitTime(analytics.averageWaitTime)}
            </div>
            <div className="text-xs text-muted-foreground">Current average</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Daily Throughput
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.dailyThroughput}</div>
            <div className="text-xs text-muted-foreground">Patients/day</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Utilization Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.utilizationRate}%</div>
            <div className="text-xs text-muted-foreground">Capacity usage</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters and Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Priority:</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Specialty:</label>
                  <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Specialties</SelectItem>
                      {analytics.specialtyBreakdown.map((specialty) => (
                        <SelectItem key={specialty.specialty} value={specialty.specialty}>
                          {specialty.specialty} ({specialty.waiting})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Sort by:</label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="waitTime">Wait Time</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="risk">No-Show Risk</SelectItem>
                      <SelectItem value="date">Date Added</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="ml-auto text-sm text-muted-foreground">
                  Showing {filteredEntries.length} of {waitlistEntries.length} entries
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Waitlist Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Waitlist Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredEntries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No waitlist entries match the current filters.
                  </div>
                ) : (
                  filteredEntries.map((entry) => (
                    <Card
                      key={entry.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant={getPriorityVariant(entry.priority)}>
                              {PRIORITY_LABELS[entry.priority]}
                            </Badge>
                            <span className="font-medium">{entry.patientName}</span>
                            <Badge variant="outline">{entry.specialty}</Badge>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-bold ${getWaitTimeColor(entry.estimatedWaitTime)}`}
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
                            <Badge
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
                            </Badge>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Contact Attempts</div>
                            <div className="text-sm font-medium">{entry.contactAttempts}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            Added: {entry.createdAt.toLocaleDateString()}
                            {entry.lastContact && (
                              <span> • Last contact: {entry.lastContact.toLocaleDateString()}</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContactPatient(entry, "SMS");
                              }}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContactPatient(entry, "PHONE");
                              }}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEntry(entry);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          {/* Optimization Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Optimization Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationSuggestions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No optimization suggestions at the moment. Your waitlist is well-managed!
                  </div>
                ) : (
                  optimizationSuggestions.map((suggestion, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant={
                                suggestion.impact === "HIGH"
                                  ? "destructive"
                                  : suggestion.impact === "MEDIUM"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {suggestion.impact} Impact
                            </Badge>
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
                        <Button size="sm">Apply Suggestion</Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Capacity Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Specialty Capacity Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.specialtyBreakdown.map((specialty, index) => {
                    const utilizationRate = (specialty.waiting / specialty.capacity) * 100;
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
                        <Progress
                          value={utilizationRate}
                          className={`h-2 ${utilizationRate > 80 ? "bg-red-100" : utilizationRate > 60 ? "bg-yellow-100" : "bg-green-100"}`}
                        />
                        <div className="text-xs text-muted-foreground">
                          {utilizationRate.toFixed(0)}% capacity utilization
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wait Time Projection</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.waitTimeProjection.slice(0, 14)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString("pt-BR", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) => new Date(date).toLocaleDateString("pt-BR")}
                      formatter={(value, name) => [
                        `${value.toFixed(1)} days`,
                        name === "projected"
                          ? "Current Trend"
                          : name === "historical"
                            ? "Historical"
                            : "Optimized",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="historical"
                      stroke="#9CA3AF"
                      strokeDasharray="5 5"
                      name="historical"
                    />
                    <Line
                      type="monotone"
                      dataKey="projected"
                      stroke="#EF4444"
                      strokeWidth={2}
                      name="projected"
                    />
                    <Line
                      type="monotone"
                      dataKey="optimized"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="optimized"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Priority Distribution and Conversion Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.priorityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Count">
                      {analytics.priorityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.conversionRates.map((stage, index) => (
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
                      <Progress value={stage.rate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wait Time Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Wait Time Trends (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analytics.waitTimeProjection}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString("pt-BR", { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString("pt-BR")}
                    formatter={(value, name) => [
                      `${value.toFixed(1)} days`,
                      name === "projected"
                        ? "Projected"
                        : name === "historical"
                          ? "Historical"
                          : "Optimized",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="historical"
                    stackId="1"
                    stroke="#9CA3AF"
                    fill="#F3F4F6"
                    name="historical"
                  />
                  <Area
                    type="monotone"
                    dataKey="projected"
                    stackId="2"
                    stroke="#EF4444"
                    fill="#FEE2E2"
                    name="projected"
                  />
                  <Area
                    type="monotone"
                    dataKey="optimized"
                    stackId="3"
                    stroke="#10B981"
                    fill="#DCFCE7"
                    name="optimized"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Waitlist Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Waitlist configuration settings coming soon.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Entry Detail Modal */}
      {selectedEntry && (
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge variant={getPriorityVariant(selectedEntry.priority)}>
                  {PRIORITY_LABELS[selectedEntry.priority]}
                </Badge>
                {selectedEntry.patientName}
              </DialogTitle>
            </DialogHeader>
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
                      className={`font-medium ${getWaitTimeColor(selectedEntry.estimatedWaitTime)}`}
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
                      <Progress value={selectedEntry.noShowRisk} className="h-2 flex-1" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge
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
                    </Badge>
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
                  {selectedEntry.preferredTimeSlots.map((slot, index) => (
                    <Badge key={index} variant="outline">
                      {slot}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleContactPatient(selectedEntry, "SMS")}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send SMS
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleContactPatient(selectedEntry, "PHONE")}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleContactPatient(selectedEntry, "EMAIL")}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedEntry(null)}>
                    Close
                  </Button>
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
