/**
 * Customer Analytics Component
 * Advanced analytics and insights for customer relationship management
 * Created: January 24, 2025
 */

'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign,
  Calendar,
  Heart,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Clock
} from 'lucide-react';
import {
  Customer,
  Appointment,
  CustomerSegment,
  SegmentCriteria,
  RetentionAnalysis,
  calculateLeadScore,
  determineCustomerLifecycle,
  calculateCustomerLifetimeValue,
  calculateAverageAppointmentValue,
  rankCustomersByValue,
  segmentCustomers,
  calculateRetentionRate,
  predictChurnRisk
} from './utils';

interface CustomerAnalyticsProps {
  customers?: Customer[];
  appointments?: Appointment[];
  className?: string;
}

export function CustomerAnalytics({
  customers = [],
  appointments = [],
  className = ''
}: CustomerAnalyticsProps) {

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const totalCustomers = customers.length;
    
    if (totalCustomers === 0) {
      return {
        overview: {
          totalCustomers: 0,
          activeCustomers: 0,
          newCustomers: 0,
          atRiskCustomers: 0,
          churnedCustomers: 0,
          averageLifetimeValue: 0,
          totalRevenue: 0,
          averageSatisfaction: 0,
          retentionRate: 0
        },
        lifecycle: {
          new: 0,
          active: 0,
          atRisk: 0,
          churned: 0
        },
        segments: [],
        topCustomers: [],
        retention: {
          totalCustomers: 0,
          activeCustomers: 0,
          churnedCustomers: 0,
          retentionRate: 0,
          averageLifetimeValue: 0,
          riskCustomers: []
        }
      };
    }

    // Overview metrics
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const newCustomers = customers.filter(c => {
      const registrationDate = new Date(c.registrationDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return registrationDate >= thirtyDaysAgo;
    }).length;
    
    const customerLifecycles = customers.map(c => ({
      customer: c,
      lifecycle: determineCustomerLifecycle(c),
      churnRisk: predictChurnRisk(c)
    }));
    
    const atRiskCustomers = customerLifecycles.filter(cl => cl.lifecycle === 'at-risk').length;
    const churnedCustomers = customerLifecycles.filter(cl => cl.lifecycle === 'churned').length;
    
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageLifetimeValue = totalRevenue / totalCustomers;
    
    const customersWithSatisfaction = customers.filter(c => c.satisfactionRating);
    const averageSatisfaction = customersWithSatisfaction.length > 0
      ? customersWithSatisfaction.reduce((sum, c) => sum + (c.satisfactionRating || 0), 0) / customersWithSatisfaction.length
      : 0;

    // Lifecycle distribution
    const lifecycleDistribution = {
      new: customerLifecycles.filter(cl => cl.lifecycle === 'new').length,
      active: customerLifecycles.filter(cl => cl.lifecycle === 'active').length,
      atRisk: customerLifecycles.filter(cl => cl.lifecycle === 'at-risk').length,
      churned: customerLifecycles.filter(cl => cl.lifecycle === 'churned').length
    };

    // Customer segmentation
    const segmentCriteria: SegmentCriteria = {
      minTotalSpent: 1000, // High value customers
      minAppointments: 5,  // Frequent customers
      daysSinceLastVisit: 90, // At-risk customers
      satisfactionThreshold: 4 // Satisfied customers
    };
    const segments = segmentCustomers(customers, segmentCriteria);

    // Top customers by value
    const topCustomers = rankCustomersByValue(customers).slice(0, 10);

    // Retention analysis
    const retention = calculateRetentionRate(customers, 12); // 12 months

    return {
      overview: {
        totalCustomers,
        activeCustomers,
        newCustomers,
        atRiskCustomers,
        churnedCustomers,
        averageLifetimeValue,
        totalRevenue,
        averageSatisfaction,
        retentionRate: retention.retentionRate
      },
      lifecycle: lifecycleDistribution,
      segments,
      topCustomers,
      retention
    };
  }, [customers, appointments]);

  // Calculate monthly trends (mock data for demonstration)
  const monthlyTrends = useMemo(() => {
    // In a real application, this would calculate actual monthly trends
    // For demo purposes, we'll generate sample trend data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return {
      customerGrowth: [10, 15, 25, 30, 45, 52],
      revenue: [15000, 18000, 22000, 26000, 32000, 38000],
      satisfaction: [4.2, 4.3, 4.1, 4.4, 4.5, 4.6],
      retention: [85, 87, 84, 89, 91, 88]
    };
  }, []);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Get trend indicator
  const getTrendIndicator = (current: number, previous: number) => {
    if (current > previous) {
      return { icon: TrendingUp, color: 'text-green-600', direction: 'up' };
    } else if (current < previous) {
      return { icon: TrendingDown, color: 'text-red-600', direction: 'down' };
    }
    return { icon: Activity, color: 'text-gray-600', direction: 'stable' };
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalCustomers}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              {analytics.overview.newCustomers} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.overview.totalRevenue)}</div>
            <p className="text-xs text-gray-600 mt-1">
              Avg LTV: {formatCurrency(analytics.overview.averageLifetimeValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Customer Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.averageSatisfaction.toFixed(1)}/5</div>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Heart
                  key={star}
                  className={`h-3 w-3 ${
                    star <= Math.round(analytics.overview.averageSatisfaction)
                      ? 'text-red-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Retention Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.overview.retentionRate)}</div>
            <Progress value={analytics.overview.retentionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Warning Cards */}
      {analytics.overview.atRiskCustomers > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-yellow-800">{analytics.overview.atRiskCustomers}</div>
                <p className="text-yellow-700">Customers at risk of churning</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-800">{analytics.retention.riskCustomers.length}</div>
                <p className="text-red-700">High-value customers at risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Lifecycle Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Customer Lifecycle Distribution
                </CardTitle>
                <CardDescription>Distribution of customers across lifecycle stages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-sm">New Customers</span>
                    </div>
                    <span className="text-sm font-medium">{analytics.lifecycle.new}</span>
                  </div>
                  <Progress value={(analytics.lifecycle.new / analytics.overview.totalCustomers) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-sm">Active Customers</span>
                    </div>
                    <span className="text-sm font-medium">{analytics.lifecycle.active}</span>
                  </div>
                  <Progress value={(analytics.lifecycle.active / analytics.overview.totalCustomers) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span className="text-sm">At-Risk Customers</span>
                    </div>
                    <span className="text-sm font-medium">{analytics.lifecycle.atRisk}</span>
                  </div>
                  <Progress value={(analytics.lifecycle.atRisk / analytics.overview.totalCustomers) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-sm">Churned Customers</span>
                    </div>
                    <span className="text-sm font-medium">{analytics.lifecycle.churned}</span>
                  </div>
                  <Progress value={(analytics.lifecycle.churned / analytics.overview.totalCustomers) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Top Customers by Value
                </CardTitle>
                <CardDescription>Highest lifetime value customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topCustomers.slice(0, 5).map((customer, index) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <div className="font-medium text-sm">{customer.name}</div>
                          <div className="text-xs text-gray-500">{customer.appointmentCount} visits</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">{formatCurrency(customer.totalSpent)}</div>
                        {customer.satisfactionRating && (
                          <div className="text-xs text-gray-500">{customer.satisfactionRating}/5 ⭐</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lifecycle" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-700">New Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{analytics.lifecycle.new}</div>
                <p className="text-xs text-blue-600 mt-1">
                  {((analytics.lifecycle.new / analytics.overview.totalCustomers) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-700">Active Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{analytics.lifecycle.active}</div>
                <p className="text-xs text-green-600 mt-1">
                  {((analytics.lifecycle.active / analytics.overview.totalCustomers) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-yellow-700">At-Risk Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{analytics.lifecycle.atRisk}</div>
                <p className="text-xs text-yellow-600 mt-1">
                  {((analytics.lifecycle.atRisk / analytics.overview.totalCustomers) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-700">Churned Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{analytics.lifecycle.churned}</div>
                <p className="text-xs text-red-600 mt-1">
                  {((analytics.lifecycle.churned / analytics.overview.totalCustomers) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lifecycle Management Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">Growth Opportunities</CardTitle>
                <CardDescription>Actions to drive customer growth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 rounded">
                  <div className="font-medium text-green-800">New Customer Onboarding</div>
                  <div className="text-sm text-green-700">{analytics.lifecycle.new} customers need welcome sequence</div>
                </div>
                <div className="p-3 bg-blue-50 rounded">
                  <div className="font-medium text-blue-800">Active Customer Upselling</div>
                  <div className="text-sm text-blue-700">{analytics.lifecycle.active} customers ready for additional services</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">Retention Priorities</CardTitle>
                <CardDescription>Urgent actions to prevent churn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded">
                  <div className="font-medium text-yellow-800">At-Risk Customer Outreach</div>
                  <div className="text-sm text-yellow-700">{analytics.lifecycle.atRisk} customers need immediate attention</div>
                </div>
                <div className="p-3 bg-red-50 rounded">
                  <div className="font-medium text-red-800">Win-Back Campaigns</div>
                  <div className="text-sm text-red-700">{analytics.lifecycle.churned} customers eligible for win-back</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analytics.segments.map((segment, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{segment.name}</CardTitle>
                  <CardDescription>{segment.criteria}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">{segment.size}</div>
                  <div className="text-sm text-gray-600 mb-4">
                    {((segment.size / analytics.overview.totalCustomers) * 100).toFixed(1)}% of total customers
                  </div>
                  <Progress value={(segment.size / analytics.overview.totalCustomers) * 100} className="h-2" />
                  
                  {segment.customers.slice(0, 3).map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between mt-3 p-2 bg-gray-50 rounded text-sm">
                      <span>{customer.name}</span>
                      <span className="font-medium">{formatCurrency(customer.totalSpent)}</span>
                    </div>
                  ))}
                  
                  {segment.customers.length > 3 && (
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      +{segment.customers.length - 3} more customers
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {analytics.segments.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No segments available</h3>
                <p className="text-gray-500">Add more customers to generate meaningful segments.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Retention Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Retention Analysis (12 Months)
              </CardTitle>
              <CardDescription>Customer retention metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{analytics.retention.totalCustomers}</div>
                  <div className="text-sm text-gray-600">Total Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.retention.activeCustomers}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{analytics.retention.churnedCustomers}</div>
                  <div className="text-sm text-gray-600">Churned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatPercentage(analytics.retention.retentionRate)}</div>
                  <div className="text-sm text-gray-600">Retention Rate</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Retention Rate</span>
                  <span>{formatPercentage(analytics.retention.retentionRate)}</span>
                </div>
                <Progress value={analytics.retention.retentionRate} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Average Customer Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.retention.averageLifetimeValue)}</div>
                <p className="text-xs text-gray-600 mt-1">Per customer lifetime</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Customer Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.overview.averageSatisfaction > 0 
                    ? `${(analytics.overview.averageSatisfaction * 20).toFixed(0)}/100`
                    : 'N/A'
                  }
                </div>
                <p className="text-xs text-gray-600 mt-1">Based on satisfaction</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Growth Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{analytics.overview.newCustomers}
                </div>
                <p className="text-xs text-gray-600 mt-1">New customers this month</p>
              </CardContent>
            </Card>
          </div>

          {/* Risk Customers */}
          {analytics.retention.riskCustomers.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-700 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  High-Risk Customers ({analytics.retention.riskCustomers.length})
                </CardTitle>
                <CardDescription>Customers who need immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.retention.riskCustomers.slice(0, 5).map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 bg-orange-50 rounded">
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-600">{customer.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(customer.totalSpent)}</div>
                        <Badge variant="destructive">High Risk</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}