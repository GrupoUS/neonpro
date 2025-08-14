/**
 * NeonPro Revenue Optimization Dashboard
 * 
 * Comprehensive revenue optimization dashboard featuring:
 * - Real-time revenue metrics and KPIs
 * - Dynamic pricing strategies visualization
 * - Service mix optimization analysis
 * - Customer lifetime value enhancement
 * - Automated revenue recommendations
 * - Competitive analysis and benchmarking
 * - ROI tracking and performance monitoring
 * 
 * Target: +15% revenue increase through intelligent optimization
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Zap,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Lightbulb,
  Rocket
} from 'lucide-react';

// Component imports for modular dashboard
import { RevenueMetricsCard } from '@/components/dashboard/revenue-optimization/revenue-metrics-card';
import { PricingOptimizationPanel } from '@/components/dashboard/revenue-optimization/pricing-optimization-panel';
import { ServiceMixChart } from '@/components/dashboard/revenue-optimization/service-mix-chart';
import { CLVEnhancementPanel } from '@/components/dashboard/revenue-optimization/clv-enhancement-panel';
import { AutomatedRecommendations } from '@/components/dashboard/revenue-optimization/automated-recommendations';
import { CompetitiveAnalysisChart } from '@/components/dashboard/revenue-optimization/competitive-analysis-chart';
import { ROITrackingPanel } from '@/components/dashboard/revenue-optimization/roi-tracking-panel';
import { OptimizationsList } from '@/components/dashboard/revenue-optimization/optimizations-list';

async function getRevenueOptimizationData(clinicId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/revenue-optimization?clinicId=${clinicId}`,
      { 
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch revenue optimization data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching revenue optimization data:', error);
    return null;
  }
}

export default async function RevenueOptimizationDashboard() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user's clinic
  const { data: professional } = await supabase
    .from('professionals')
    .select('clinic_id, clinics(*)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (!professional) {
    redirect('/dashboard');
  }

  const clinicId = professional.clinic_id;
  const optimizationData = await getRevenueOptimizationData(clinicId);

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Revenue Optimization" }
  ];

  if (!optimizationData) {
    return (
      <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-96">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <CardTitle>Unable to Load Data</CardTitle>
              <CardDescription>
                Failed to load revenue optimization data. Please try again later.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* 📊 Header Section with Key Metrics */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Revenue Optimization</h1>
            <p className="text-muted-foreground mt-2">
              Maximize revenue through intelligent pricing, service optimization, and customer value enhancement
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-3 py-1">
              <Target className="h-4 w-4 mr-1" />
              Target: +15% Revenue
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Configure
            </Button>
          </div>
        </div>

        {/* 🎯 Revenue Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Optimizations</CardTitle>
              <Rocket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{optimizationData.summary.totalOptimizations}</div>
              <p className="text-xs text-muted-foreground">
                {optimizationData.summary.activeOptimizations} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projected Increase</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{optimizationData.summary.totalProjectedIncrease.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue growth potential
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(optimizationData.summary.averageROI * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Return on investment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(optimizationData.summary.successRate * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Optimization success
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 📈 Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="services">Service Mix</TabsTrigger>
            <TabsTrigger value="clv">Customer Value</TabsTrigger>
            <TabsTrigger value="competitive">Competition</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* 🔍 Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Automated Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Automated Recommendations
                  </CardTitle>
                  <CardDescription>
                    AI-powered optimization suggestions for maximum revenue impact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div>Loading recommendations...</div>}>
                    <AutomatedRecommendations 
                      recommendations={optimizationData.automated.recommendations}
                      implementationPlan={optimizationData.automated.implementationPlan}
                    />
                  </Suspense>
                </CardContent>
              </Card>

              {/* Active Optimizations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Active Optimizations
                  </CardTitle>
                  <CardDescription>
                    Current optimization initiatives and their progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<div>Loading optimizations...</div>}>
                    <OptimizationsList clinicId={clinicId} />
                  </Suspense>
                </CardContent>
              </Card>
            </div>

            {/* Quick Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>
                  Real-time performance metrics across all optimization areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pricing Optimization</span>
                      <span className="text-sm text-green-600">
                        +{optimizationData.pricing.projectedIncrease.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={optimizationData.pricing.projectedIncrease * 5} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Service Mix Optimization</span>
                      <span className="text-sm text-blue-600">
                        +{optimizationData.serviceMix.profitabilityGain.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={optimizationData.serviceMix.profitabilityGain * 4} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Customer Lifetime Value</span>
                      <span className="text-sm text-purple-600">
                        +{optimizationData.clv.projectedIncrease.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={optimizationData.clv.projectedIncrease * 3} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 💰 Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <Suspense fallback={<div>Loading pricing optimization...</div>}>
              <PricingOptimizationPanel 
                pricingData={optimizationData.pricing}
                clinicId={clinicId}
              />
            </Suspense>
          </TabsContent>

          {/* 🎨 Service Mix Tab */}
          <TabsContent value="services" className="space-y-4">
            <Suspense fallback={<div>Loading service mix analysis...</div>}>
              <ServiceMixChart 
                serviceMixData={optimizationData.serviceMix}
                clinicId={clinicId}
              />
            </Suspense>
          </TabsContent>

          {/* 👥 Customer Value Tab */}
          <TabsContent value="clv" className="space-y-4">
            <Suspense fallback={<div>Loading CLV enhancement...</div>}>
              <CLVEnhancementPanel 
                clvData={optimizationData.clv}
                clinicId={clinicId}
              />
            </Suspense>
          </TabsContent>

          {/* 🏆 Competitive Tab */}
          <TabsContent value="competitive" className="space-y-4">
            <Suspense fallback={<div>Loading competitive analysis...</div>}>
              <CompetitiveAnalysisChart 
                competitiveData={optimizationData.competitive}
                clinicId={clinicId}
              />
            </Suspense>
          </TabsContent>

          {/* 📊 Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Suspense fallback={<div>Loading performance tracking...</div>}>
              <ROITrackingPanel 
                performanceData={optimizationData.performance}
                clinicId={clinicId}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}