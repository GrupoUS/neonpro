// Main Dashboard Layout - STORY-SUB-002 Task 4
// Integrates analytics overview, conversion charts, and trial management
// Based on research: SaaS dashboard best practices + shadcn/ui patterns
// Created: 2025-01-22

"use client";

import type { useState } from "react";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type {
  BarChart3,
  Users,
  TrendingUp,
  Settings,
  RefreshCw,
  Bell,
  Download,
  Filter,
} from "lucide-react";
import type { cn } from "@/lib/utils";
import type { AnalyticsOverview } from "./analytics/analytics-overview";
import type { ConversionCharts } from "./analytics/conversion-charts";
import type { TrialManagement } from "./trial-management/trial-management";

interface DashboardProps {
  className?: string;
}

export function Dashboard({ className }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className={cn("flex-1 space-y-4 p-4 md:p-8 pt-6", className)}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights and trial management for your SaaS platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="mr-2 h-4 w-4" />
            Alerts
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>{" "}
      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="trials" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Trial Management</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Analytics Overview */}
        <TabsContent value="overview" className="space-y-4">
          <AnalyticsOverview />
        </TabsContent>

        {/* Analytics Tab - Conversion Charts */}
        <TabsContent value="analytics" className="space-y-4">
          <ConversionCharts />
        </TabsContent>

        {/* Trial Management Tab */}
        <TabsContent value="trials" className="space-y-4">
          <TrialManagement />
        </TabsContent>
      </Tabs>
      {/* Quick Stats Cards - Always Visible */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">26.8%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Trials</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-2</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,420</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15.7%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
