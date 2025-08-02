/**
 * Marketing ROI Analysis Dashboard
 * Comprehensive dashboard for marketing campaign ROI tracking and business intelligence
 * Story 8.5: Marketing ROI Analysis
 */

import { Suspense } from 'react';
import { createClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { MarketingROIDashboard } from '@/components/dashboard/marketing-roi/MarketingROIDashboard';
import { MarketingROIMetricsCards } from '@/components/dashboard/marketing-roi/MarketingROIMetricsCards';
import { MarketingROICharts } from '@/components/dashboard/marketing-roi/MarketingROICharts';
import { CampaignsList } from '@/components/dashboard/marketing-roi/CampaignsList';
import { TreatmentProfitabilityTable } from '@/components/dashboard/marketing-roi/TreatmentProfitabilityTable';
import { CACLTVAnalysis } from '@/components/dashboard/marketing-roi/CACLTVAnalysis';
import { ROIAlertsPanel } from '@/components/dashboard/marketing-roi/ROIAlertsPanel';
import { OptimizationRecommendations } from '@/components/dashboard/marketing-roi/OptimizationRecommendations';
import { ROIForecastingPanel } from '@/components/dashboard/marketing-roi/ROIForecastingPanel';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Target, 
  AlertTriangle, 
  Lightbulb,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

export default async function MarketingROIPage() {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Get user's clinic
  const { data: userClinic, error: clinicError } = await supabase
    .from('user_clinics')
    .select(`
      clinic_id,
      role,
      clinics!inner(
        id,
        name,
        slug
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (clinicError || !userClinic) {
    console.error('Clinic access error:', clinicError);
    redirect('/dashboard');
  }

  const clinic = userClinic.clinics;
  
  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Business Intelligence', href: '/dashboard/business-dashboard' },
    { title: 'Marketing ROI Analysis' }
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Marketing ROI Analysis</h1>
            <p className="text-muted-foreground">
              Comprehensive marketing campaign ROI tracking and business intelligence
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Real-time Analytics
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Target className="w-3 h-3 mr-1" />
                ROI Optimization
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Lightbulb className="w-3 h-3 mr-1" />
                AI Recommendations
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Metrics Overview */}
        <Suspense fallback={<LoadingSpinner />}>
          <MarketingROIMetricsCards clinicId={clinic.id} />
        </Suspense>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="treatments" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Treatments
            </TabsTrigger>
            <TabsTrigger value="cac-ltv" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              CAC & LTV
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Optimization
            </TabsTrigger>
            <TabsTrigger value="forecasting" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Forecasting
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    ROI Trends & Analytics
                  </CardTitle>
                  <CardDescription>
                    Comprehensive ROI analytics with trend analysis and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<LoadingSpinner />}>
                    <MarketingROICharts clinicId={clinic.id} />
                  </Suspense>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Executive Dashboard
                  </CardTitle>
                  <CardDescription>
                    High-level insights and KPIs for strategic decision making
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<LoadingSpinner />}>
                    <MarketingROIDashboard clinicId={clinic.id} />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Marketing Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Marketing Campaigns ROI
                </CardTitle>
                <CardDescription>
                  Detailed analysis of marketing campaign performance and ROI metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<LoadingSpinner />}>
                  <CampaignsList clinicId={clinic.id} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Treatment Profitability Tab */}
          <TabsContent value="treatments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Treatment Profitability Analysis
                </CardTitle>
                <CardDescription>
                  Analyze treatment ROI, profitability metrics and optimization opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<LoadingSpinner />}>
                  <TreatmentProfitabilityTable clinicId={clinic.id} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CAC & LTV Analysis Tab */}
          <TabsContent value="cac-ltv" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Customer Acquisition Cost & Lifetime Value
                </CardTitle>
                <CardDescription>
                  Comprehensive CAC and LTV analysis with predictive insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<LoadingSpinner />}>
                  <CACLTVAnalysis clinicId={clinic.id} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ROI Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  ROI Monitoring & Alerts
                </CardTitle>
                <CardDescription>
                  Real-time ROI monitoring with intelligent alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<LoadingSpinner />}>
                  <ROIAlertsPanel clinicId={clinic.id} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Optimization Recommendations Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  AI-Powered Optimization Recommendations
                </CardTitle>
                <CardDescription>
                  Intelligent recommendations for ROI optimization and marketing strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<LoadingSpinner />}>
                  <OptimizationRecommendations clinicId={clinic.id} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictive Forecasting Tab */}
          <TabsContent value="forecasting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Predictive ROI Forecasting
                </CardTitle>
                <CardDescription>
                  Advanced forecasting models for ROI prediction and scenario planning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<LoadingSpinner />}>
                  <ROIForecastingPanel clinicId={clinic.id} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}