import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Progress } from "@/components/ui/progress";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";

interface ProtocolOptimizationData {
  currentVersion: string;
  optimizationScore: number;
  activeExperiments: number;
  completedAnalyses: number;
  improvementRate: number;
  nextRecommendation: string;
  status: "active" | "pending" | "completed";
}

interface AutomatedProtocolOptimizationProps {
  data?: ProtocolOptimizationData;
}

const defaultData: ProtocolOptimizationData = {
  currentVersion: "v2.1.3",
  optimizationScore: 87,
  activeExperiments: 3,
  completedAnalyses: 12,
  improvementRate: 15.2,
  nextRecommendation: "Increase treatment frequency for improved outcomes",
  status: "active",
};

export default function AutomatedProtocolOptimization({
  data = defaultData,
}: AutomatedProtocolOptimizationProps) {
  const statusColor = {
    active: "bg-green-500",
    pending: "bg-yellow-500",
    completed: "bg-blue-500",
  };

  const statusIcon = {
    active: <Activity className="h-4 w-4" />,
    pending: <Clock className="h-4 w-4" />,
    completed: <CheckCircle className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Protocol Optimization</h2>
          <p className="text-muted-foreground">
            AI-powered protocol analysis and automated improvements
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={`${statusColor[data.status]} text-white border-0`}>
            {statusIcon[data.status]}
            <span className="ml-1 capitalize">{data.status}</span>
          </Badge>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Version</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.currentVersion}</div>
            <p className="text-xs text-muted-foreground">Latest protocol version</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.optimizationScore}%</div>
            <Progress value={data.optimizationScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              +{data.improvementRate}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Experiments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeExperiments}</div>
            <p className="text-xs text-muted-foreground">Running optimization tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Analyses</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completedAnalyses}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Protocol Performance</CardTitle>
                <CardDescription>Real-time analysis of protocol effectiveness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted/10 rounded-lg">
                  <p className="text-muted-foreground">Performance Chart Placeholder</p>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Next Recommendation</CardTitle>
                <CardDescription>AI-suggested optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Priority Action</p>
                    <p className="text-sm text-muted-foreground">{data.nextRecommendation}</p>
                  </div>
                </div>
                <Button className="w-full">Implement Recommendation</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Experiments</CardTitle>
              <CardDescription>Currently running protocol optimization experiments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/10 rounded-lg">
                <p className="text-muted-foreground">Experiments List Placeholder</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Protocol Analytics</CardTitle>
              <CardDescription>Detailed analytics and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/10 rounded-lg">
                <p className="text-muted-foreground">Analytics Dashboard Placeholder</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>Machine learning-powered protocol improvements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center bg-muted/10 rounded-lg">
                <p className="text-muted-foreground">Recommendations Engine Placeholder</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
