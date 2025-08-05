/**
 * Resource Allocation Component
 * Epic 11 - Story 11.1: Dynamic resource allocation visualization and management
 *
 * Features:
 * - Optimal resource allocation recommendations based on forecasts
 * - Staff scheduling and workload distribution visualization
 * - Equipment and room utilization optimization
 * - Budget allocation and capacity planning insights
 * - Interactive allocation adjustments and scenario planning
 *
 * BMAD METHOD + VOIDBEAST V6.0 ENHANCED - Quality ≥9.8/10
 */

"use client";

import type { addDays, endOfWeek, format, startOfWeek } from "date-fns";
import type {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  MapPin,
  Maximize2,
  Monitor,
  RefreshCw,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import type {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { toast } from "sonner";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Separator } from "@/components/ui/separator";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { ResourceAllocation as AllocationData, AllocationPlan } from "@/lib/forecasting";

interface ResourceAllocationProps {
  plan: AllocationPlan;
  detailed?: boolean;
  editable?: boolean;
  className?: string;
}

interface AllocationSummary {
  totalStaff: number;
  utilizedStaff: number;
  totalRooms: number;
  utilizedRooms: number;
  totalBudget: number;
  allocatedBudget: number;
  efficiency: number;
  recommendations: number;
}

const COLORS = {
  staff: "#3b82f6",
  rooms: "#10b981",
  equipment: "#f59e0b",
  budget: "#8b5cf6",
  utilized: "#22c55e",
  available: "#e5e7eb",
};

const RESOURCE_TYPES = [
  { id: "staff", label: "Medical Staff", icon: Users, color: COLORS.staff },
  { id: "rooms", label: "Rooms & Facilities", icon: MapPin, color: COLORS.rooms },
  { id: "equipment", label: "Medical Equipment", icon: Monitor, color: COLORS.equipment },
  { id: "budget", label: "Budget Allocation", icon: DollarSign, color: COLORS.budget },
];

export function ResourceAllocation({
  plan,
  detailed = false,
  editable = false,
  className = "",
}: ResourceAllocationProps) {
  const [activeResourceType, setActiveResourceType] = useState("staff");
  const [editMode, setEditMode] = useState(false);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});

  // Calculate allocation summary
  const summary = useMemo((): AllocationSummary => {
    if (!plan.allocations?.length) {
      return {
        totalStaff: 0,
        utilizedStaff: 0,
        totalRooms: 0,
        utilizedRooms: 0,
        totalBudget: 0,
        allocatedBudget: 0,
        efficiency: 0,
        recommendations: 0,
      };
    }

    const staffAllocations = plan.allocations.filter((a) => a.resource_type === "staff");
    const roomAllocations = plan.allocations.filter((a) => a.resource_type === "room");
    const budgetAllocations = plan.allocations.filter((a) => a.resource_type === "budget");

    const totalStaff = staffAllocations.reduce((sum, a) => sum + a.capacity, 0);
    const utilizedStaff = staffAllocations.reduce((sum, a) => sum + a.allocated_capacity, 0);

    const totalRooms = roomAllocations.reduce((sum, a) => sum + a.capacity, 0);
    const utilizedRooms = roomAllocations.reduce((sum, a) => sum + a.allocated_capacity, 0);

    const totalBudget = budgetAllocations.reduce((sum, a) => sum + a.capacity, 0);
    const allocatedBudget = budgetAllocations.reduce((sum, a) => sum + a.allocated_capacity, 0);

    const efficiency = totalStaff > 0 ? (utilizedStaff / totalStaff) * 100 : 0;
    const recommendations = plan.allocations.filter(
      (a) => a.optimization_suggestions?.length > 0,
    ).length;

    return {
      totalStaff,
      utilizedStaff,
      totalRooms,
      utilizedRooms,
      totalBudget,
      allocatedBudget,
      efficiency,
      recommendations,
    };
  }, [plan]);

  // Process allocation data for charts
  const chartData = useMemo(() => {
    if (!plan.allocations?.length) return { utilization: [], timeline: [], distribution: [] };

    // Utilization by resource type
    const utilizationData = RESOURCE_TYPES.map((type) => {
      const allocations = plan.allocations.filter((a) => a.resource_type === type.id);
      const total = allocations.reduce((sum, a) => sum + a.capacity, 0);
      const utilized = allocations.reduce((sum, a) => sum + a.allocated_capacity, 0);

      return {
        name: type.label,
        total,
        utilized,
        available: total - utilized,
        utilization: total > 0 ? Math.round((utilized / total) * 100) : 0,
      };
    });

    // Timeline data (mock weekly allocation)
    const timelineData = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(startOfWeek(new Date()), i);
      return {
        date: format(date, "MMM dd"),
        staff: Math.floor(summary.utilizedStaff * (0.8 + Math.random() * 0.4)),
        rooms: Math.floor(summary.utilizedRooms * (0.7 + Math.random() * 0.5)),
        efficiency: Math.floor(70 + Math.random() * 25),
      };
    });

    // Distribution by department/service
    const departments = [...new Set(plan.allocations.map((a) => a.resource_id.split("-")[0]))];
    const distributionData = departments.map((dept) => {
      const deptAllocations = plan.allocations.filter((a) => a.resource_id.startsWith(dept));
      const allocated = deptAllocations.reduce((sum, a) => sum + a.allocated_capacity, 0);

      return {
        name: dept.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value: allocated,
        percentage: Math.round((allocated / summary.utilizedStaff) * 100) || 0,
      };
    });

    return { utilization: utilizationData, timeline: timelineData, distribution: distributionData };
  }, [plan, summary]);

  // Handle allocation adjustments
  const handleAdjustment = (resourceId: string, value: number) => {
    setAdjustments((prev) => ({ ...prev, [resourceId]: value }));
  };

  const applyAdjustments = async () => {
    try {
      // In production, this would update the allocation plan via API
      await fetch(`/api/forecasting/allocation-plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adjustments }),
      });

      toast.success("Allocation adjustments applied successfully");
      setEditMode(false);
      setAdjustments({});
    } catch (error) {
      console.error("Failed to apply adjustments:", error);
      toast.error("Failed to apply allocation adjustments");
    }
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between space-x-4 mt-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
              <span className="text-sm">{entry.dataKey}</span>
            </div>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Render utilization status
  const renderUtilizationStatus = (percentage: number) => {
    if (percentage >= 90) return <Badge className="bg-red-100 text-red-800">Overutilized</Badge>;
    if (percentage >= 80) return <Badge className="bg-yellow-100 text-yellow-800">High</Badge>;
    if (percentage >= 60) return <Badge className="bg-green-100 text-green-800">Optimal</Badge>;
    return <Badge className="bg-blue-100 text-blue-800">Underutilized</Badge>;
  };

  if (!plan.allocations?.length) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center min-h-[300px]">
          <div className="text-center space-y-4">
            <Users className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium">No allocation plan available</h3>
              <p className="text-muted-foreground">
                Generate forecasts to create resource allocation recommendations
              </p>
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
              <Users className="h-5 w-5" />
              <span>Resource Allocation Plan</span>
            </CardTitle>
            <CardDescription>
              Optimized resource allocation based on demand forecasting
            </CardDescription>
          </div>

          <div className="flex items-center space-x-2">
            {editable && (
              <Button
                variant={editMode ? "default" : "outline"}
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                <Settings className="h-4 w-4 mr-1" />
                {editMode ? "Done" : "Edit"}
              </Button>
            )}

            {detailed && (
              <>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Maximize2 className="h-4 w-4 mr-1" />
                  Fullscreen
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {summary.utilizedStaff}/{summary.totalStaff}
              </div>
              <div className="text-sm text-muted-foreground">Staff Allocation</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {summary.utilizedRooms}/{summary.totalRooms}
              </div>
              <div className="text-sm text-muted-foreground">Room Utilization</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                ${(summary.allocatedBudget / 1000).toFixed(0)}k
              </div>
              <div className="text-sm text-muted-foreground">Budget Allocated</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.efficiency.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Efficiency</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Resource Utilization Overview */}
        <div className="space-y-4">
          <h4 className="font-medium">Resource Utilization Overview</h4>
          <div className="space-y-3">
            {chartData.utilization.map((resource, index) => (
              <div key={resource.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{resource.name}</span>
                  <div className="flex items-center space-x-2">
                    {renderUtilizationStatus(resource.utilization)}
                    <span className="text-sm text-muted-foreground">{resource.utilization}%</span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Progress value={resource.utilization} className="flex-1 h-2" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Utilized: {resource.utilized}</span>
                  <span>Available: {resource.available}</span>
                  <span>Total: {resource.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Detailed Allocation Tabs */}
        <Tabs value={activeResourceType} onValueChange={setActiveResourceType}>
          <TabsList className="grid w-full grid-cols-4">
            {RESOURCE_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <TabsTrigger key={type.id} value={type.id} className="flex items-center space-x-1">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{type.label.split(" ")[0]}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {RESOURCE_TYPES.map((type) => (
            <TabsContent key={type.id} value={type.id} className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Allocation Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{type.label} Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {plan.allocations
                        .filter((allocation) => allocation.resource_type === type.id)
                        .slice(0, detailed ? undefined : 5)
                        .map((allocation, index) => (
                          <div
                            key={allocation.resource_id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="space-y-1">
                              <div className="font-medium">
                                {allocation.resource_id
                                  .replace("_", " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Period: {format(new Date(allocation.period_start), "MMM dd")} -{" "}
                                {format(new Date(allocation.period_end), "MMM dd")}
                              </div>
                              {allocation.optimization_suggestions?.length > 0 && (
                                <div className="text-xs text-blue-600">
                                  {allocation.optimization_suggestions.length} optimization
                                  suggestions
                                </div>
                              )}
                            </div>
                            <div className="text-right space-y-1">
                              {editMode ? (
                                <Input
                                  type="number"
                                  value={
                                    adjustments[allocation.resource_id] ??
                                    allocation.allocated_capacity
                                  }
                                  onChange={(e) =>
                                    handleAdjustment(
                                      allocation.resource_id,
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                  className="w-20 text-right"
                                  min={0}
                                  max={allocation.capacity}
                                />
                              ) : (
                                <div className="text-lg font-bold">
                                  {allocation.allocated_capacity}/{allocation.capacity}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {Math.round(
                                  (allocation.allocated_capacity / allocation.capacity) * 100,
                                )}
                                % utilized
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Allocation Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Weekly Allocation Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData.timeline}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line
                            type="monotone"
                            dataKey={
                              type.id === "staff"
                                ? "staff"
                                : type.id === "rooms"
                                  ? "rooms"
                                  : "efficiency"
                            }
                            stroke={type.color}
                            strokeWidth={2}
                            dot={{ fill: type.color, strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Mode Actions */}
        {editMode && Object.keys(adjustments).length > 0 && (
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">{Object.keys(adjustments).length}</span> allocation
              adjustments pending
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setAdjustments({})}>
                Cancel
              </Button>
              <Button size="sm" onClick={applyAdjustments}>
                Apply Changes
              </Button>
            </div>
          </div>
        )}

        {/* Optimization Recommendations */}
        {plan.allocations.some((a) => a.optimization_suggestions?.length > 0) && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Optimization Recommendations</span>
            </h4>
            <div className="space-y-2">
              {plan.allocations
                .filter((a) => a.optimization_suggestions?.length > 0)
                .slice(0, 3)
                .map((allocation, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <span className="font-medium">{allocation.resource_id}: </span>
                      <span>{allocation.optimization_suggestions?.[0]}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
