"use client";

import type {
  Activity,
  AlertTriangle,
  BarChart3,
  PieChart,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Progress } from "@/components/ui/progress";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SegmentPerformance {
  id: string;
  name: string;
  metrics: {
    size: number;
    engagementRate: number;
    conversionRate: number;
    averageRevenue: number;
    retentionRate: number;
    growthRate: number;
  };
  campaigns: {
    active: number;
    completed: number;
    totalROI: number;
  };
  trends: {
    period: string;
    engagement: number;
    conversion: number;
    revenue: number;
  }[];
  alerts: {
    type: "warning" | "info" | "success";
    message: string;
    metric: string;
  }[];
}

interface ComparisonData {
  segments: {
    name: string;
    engagementRate: number;
    conversionRate: number;
    averageRevenue: number;
    color: string;
  }[];
}

export default function PerformanceTracking() {
  const [performanceData, setPerformanceData] = useState<SegmentPerformance[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData: SegmentPerformance[] = [
        {
          id: "1",
          name: "High-Value Customers",
          metrics: {
            size: 245,
            engagementRate: 78.5,
            conversionRate: 34.2,
            averageRevenue: 1250.0,
            retentionRate: 89.3,
            growthRate: 12.5,
          },
          campaigns: {
            active: 3,
            completed: 12,
            totalROI: 285.4,
          },
          trends: [
            { period: "Jan", engagement: 75, conversion: 30, revenue: 1180 },
            { period: "Feb", engagement: 77, conversion: 32, revenue: 1220 },
            { period: "Mar", engagement: 79, conversion: 34, revenue: 1250 },
          ],
          alerts: [
            {
              type: "success",
              message: "Engagement rate increased by 5% this month",
              metric: "engagement",
            },
          ],
        },
        {
          id: "2",
          name: "New Patients",
          metrics: {
            size: 156,
            engagementRate: 45.8,
            conversionRate: 18.7,
            averageRevenue: 420.0,
            retentionRate: 34.6,
            growthRate: 45.2,
          },
          campaigns: {
            active: 2,
            completed: 8,
            totalROI: 145.8,
          },
          trends: [
            { period: "Jan", engagement: 38, conversion: 15, revenue: 380 },
            { period: "Feb", engagement: 42, conversion: 17, revenue: 400 },
            { period: "Mar", engagement: 46, conversion: 19, revenue: 420 },
          ],
          alerts: [
            {
              type: "warning",
              message: "Retention rate below target (35%)",
              metric: "retention",
            },
          ],
        },
        {
          id: "3",
          name: "Aesthetic Enthusiasts",
          metrics: {
            size: 189,
            engagementRate: 65.2,
            conversionRate: 28.9,
            averageRevenue: 890.0,
            retentionRate: 72.1,
            growthRate: 8.7,
          },
          campaigns: {
            active: 4,
            completed: 15,
            totalROI: 220.3,
          },
          trends: [
            { period: "Jan", engagement: 62, conversion: 26, revenue: 850 },
            { period: "Feb", engagement: 64, conversion: 28, revenue: 870 },
            { period: "Mar", engagement: 65, conversion: 29, revenue: 890 },
          ],
          alerts: [
            {
              type: "info",
              message: "Steady growth in conversion rates",
              metric: "conversion",
            },
          ],
        },
      ];

      setPerformanceData(mockData);
      setSelectedSegment(mockData[0]?.id || "");

      // Mock comparison data
      setComparisonData({
        segments: mockData.map((segment, index) => ({
          name: segment.name,
          engagementRate: segment.metrics.engagementRate,
          conversionRate: segment.metrics.conversionRate,
          averageRevenue: segment.metrics.averageRevenue,
          color: ["#8884d8", "#82ca9d", "#ffc658"][index % 3],
        })),
      });
    } catch (error) {
      console.error("Failed to load performance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSegmentData = performanceData.find((s) => s.id === selectedSegment);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getMetricTrend = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      direction: change >= 0 ? "up" : "down",
      value: Math.abs(change),
      color: change >= 0 ? "text-green-600" : "text-red-600",
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Segments</p>
                <div className="flex items-center">
                  <div className="text-2xl font-bold">{performanceData.length}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Avg Engagement</p>
                <div className="flex items-center">
                  <div className="text-2xl font-bold">
                    {formatPercentage(
                      performanceData.reduce((acc, s) => acc + s.metrics.engagementRate, 0) /
                        performanceData.length,
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Avg Conversion</p>
                <div className="flex items-center">
                  <div className="text-2xl font-bold">
                    {formatPercentage(
                      performanceData.reduce((acc, s) => acc + s.metrics.conversionRate, 0) /
                        performanceData.length,
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total ROI</p>
                <div className="flex items-center">
                  <div className="text-2xl font-bold">
                    {formatPercentage(
                      performanceData.reduce((acc, s) => acc + s.campaigns.totalROI, 0) /
                        performanceData.length,
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance Overview</TabsTrigger>
          <TabsTrigger value="comparison">Segment Comparison</TabsTrigger>
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          {/* Segment Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Segment Performance</CardTitle>
              <CardDescription>
                Detailed performance metrics for individual segments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-6">
                {performanceData.map((segment) => (
                  <Button
                    key={segment.id}
                    variant={selectedSegment === segment.id ? "default" : "outline"}
                    onClick={() => setSelectedSegment(segment.id)}
                  >
                    {segment.name}
                  </Button>
                ))}
              </div>

              {selectedSegmentData && (
                <div className="space-y-6">
                  {/* Alerts */}
                  {selectedSegmentData.alerts.length > 0 && (
                    <div className="space-y-2">
                      {selectedSegmentData.alerts.map((alert, index) => (
                        <Alert
                          key={index}
                          variant={alert.type === "warning" ? "destructive" : "default"}
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{alert.message}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Segment Size
                            </p>
                            <div className="text-2xl font-bold">
                              {selectedSegmentData.metrics.size}
                            </div>
                            <div className="flex items-center text-sm">
                              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                              <span className="text-green-600">
                                +{formatPercentage(selectedSegmentData.metrics.growthRate)}
                              </span>
                            </div>
                          </div>
                          <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Engagement Rate
                            </p>
                            <div className="text-2xl font-bold">
                              {formatPercentage(selectedSegmentData.metrics.engagementRate)}
                            </div>
                            <Progress
                              value={selectedSegmentData.metrics.engagementRate}
                              className="mt-2"
                            />
                          </div>
                          <Activity className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Conversion Rate
                            </p>
                            <div className="text-2xl font-bold">
                              {formatPercentage(selectedSegmentData.metrics.conversionRate)}
                            </div>
                            <Progress
                              value={selectedSegmentData.metrics.conversionRate}
                              className="mt-2"
                            />
                          </div>
                          <Target className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Average Revenue
                            </p>
                            <div className="text-2xl font-bold">
                              {formatCurrency(selectedSegmentData.metrics.averageRevenue)}
                            </div>
                          </div>
                          <BarChart3 className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Retention Rate
                            </p>
                            <div className="text-2xl font-bold">
                              {formatPercentage(selectedSegmentData.metrics.retentionRate)}
                            </div>
                            <Progress
                              value={selectedSegmentData.metrics.retentionRate}
                              className="mt-2"
                            />
                          </div>
                          <PieChart className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Campaign ROI
                            </p>
                            <div className="text-2xl font-bold">
                              {formatPercentage(selectedSegmentData.campaigns.totalROI)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {selectedSegmentData.campaigns.active} active,{" "}
                              {selectedSegmentData.campaigns.completed} completed
                            </div>
                          </div>
                          <TrendingUp className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Trends Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-sm font-medium">Engagement</div>
                            <div className="text-lg font-bold">
                              {formatPercentage(
                                selectedSegmentData.trends[selectedSegmentData.trends.length - 1]
                                  ?.engagement || 0,
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Conversion</div>
                            <div className="text-lg font-bold">
                              {formatPercentage(
                                selectedSegmentData.trends[selectedSegmentData.trends.length - 1]
                                  ?.conversion || 0,
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Revenue</div>
                            <div className="text-lg font-bold">
                              {formatCurrency(
                                selectedSegmentData.trends[selectedSegmentData.trends.length - 1]
                                  ?.revenue || 0,
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Segment Comparison</CardTitle>
              <CardDescription>
                Compare performance metrics across different segments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segment</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Conversion</TableHead>
                    <TableHead>Avg Revenue</TableHead>
                    <TableHead>ROI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData.map((segment) => (
                    <TableRow key={segment.id}>
                      <TableCell className="font-medium">{segment.name}</TableCell>
                      <TableCell>{segment.metrics.size}</TableCell>
                      <TableCell>{formatPercentage(segment.metrics.engagementRate)}</TableCell>
                      <TableCell>{formatPercentage(segment.metrics.conversionRate)}</TableCell>
                      <TableCell>{formatCurrency(segment.metrics.averageRevenue)}</TableCell>
                      <TableCell>{formatPercentage(segment.campaigns.totalROI)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Deep insights and predictive analytics for segment performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Advanced Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and predictions will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ab-testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>A/B Testing</CardTitle>
              <CardDescription>
                Set up and monitor A/B tests for segment-based campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">A/B Testing Platform</h3>
                <p className="text-muted-foreground">
                  Create and manage A/B tests for different segments
                </p>
                <Button className="mt-4">Create New Test</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
