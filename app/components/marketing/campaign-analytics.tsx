// =====================================================================================
// MARKETING CAMPAIGN ANALYTICS COMPONENT - Story 7.2
// Real-time analytics and ROI measurement for marketing campaigns
// =====================================================================================

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Mail,
  MousePointer,
  DollarSign,
  Target,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  MessageSquare,
  ShoppingCart
} from 'lucide-react';

interface CampaignMetrics {
  campaign_id: string;
  campaign_name: string;
  period: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  bounced: number;
  unsubscribed: number;
  revenue: number;
  cost: number;
  roi: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
  bounce_rate: number;
  unsubscribe_rate: number;
}

interface ChannelMetrics {
  channel: 'email' | 'whatsapp' | 'sms' | 'push';
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  cost: number;
  roi: number;
}

// Mock analytics data
const mockCampaignMetrics: CampaignMetrics[] = [
  {
    campaign_id: '1',
    campaign_name: 'Welcome Series - New Patients',
    period: 'Last 30 days',
    sent: 1250,
    delivered: 1205,
    opened: 820,
    clicked: 197,
    converted: 89,
    bounced: 45,
    unsubscribed: 12,
    revenue: 23450,
    cost: 3200,
    roi: 7.33,
    delivery_rate: 0.964,
    open_rate: 0.68,
    click_rate: 0.24,
    conversion_rate: 0.108,
    bounce_rate: 0.036,
    unsubscribe_rate: 0.0096
  },
  {
    campaign_id: '2',
    campaign_name: 'Treatment Follow-up Campaign',
    period: 'Last 30 days',
    sent: 890,
    delivered: 867,
    opened: 624,
    clicked: 194,
    converted: 78,
    bounced: 23,
    unsubscribed: 8,
    revenue: 18900,
    cost: 2100,
    roi: 9.0,
    delivery_rate: 0.974,
    open_rate: 0.72,
    click_rate: 0.31,
    conversion_rate: 0.12,
    bounce_rate: 0.026,
    unsubscribe_rate: 0.009
  }
];

const mockChannelMetrics: ChannelMetrics[] = [
  {
    channel: 'email',
    sent: 15420,
    delivered: 14875,
    opened: 10512,
    clicked: 2945,
    converted: 1247,
    revenue: 89250,
    cost: 12800,
    roi: 6.97
  },
  {
    channel: 'whatsapp',
    sent: 8940,
    delivered: 8823,
    opened: 7940,
    clicked: 2387,
    converted: 856,
    revenue: 45600,
    cost: 8900,
    roi: 5.12
  },
  {
    channel: 'sms',
    sent: 3250,
    delivered: 3198,
    opened: 2875,
    clicked: 892,
    converted: 234,
    revenue: 12450,
    cost: 2600,
    roi: 4.79
  }
];

export function CampaignAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  const totalMetrics = mockCampaignMetrics.reduce((acc, campaign) => ({
    sent: acc.sent + campaign.sent,
    delivered: acc.delivered + campaign.delivered,
    opened: acc.opened + campaign.opened,
    clicked: acc.clicked + campaign.clicked,
    converted: acc.converted + campaign.converted,
    revenue: acc.revenue + campaign.revenue,
    cost: acc.cost + campaign.cost
  }), { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, revenue: 0, cost: 0 });

  const avgROI = totalMetrics.cost > 0 ? (totalMetrics.revenue / totalMetrics.cost) : 0;
  const avgOpenRate = totalMetrics.delivered > 0 ? (totalMetrics.opened / totalMetrics.delivered) : 0;
  const avgClickRate = totalMetrics.opened > 0 ? (totalMetrics.clicked / totalMetrics.opened) : 0;
  const avgConversionRate = totalMetrics.clicked > 0 ? (totalMetrics.converted / totalMetrics.clicked) : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'sent': return <Mail className="h-4 w-4" />;
      case 'opened': return <Eye className="h-4 w-4" />;
      case 'clicked': return <MousePointer className="h-4 w-4" />;
      case 'converted': return <ShoppingCart className="h-4 w-4" />;
      case 'revenue': return <DollarSign className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (value: number, isPositiveGood = true) => {
    const isPositive = value > 0;
    const shouldShowUp = isPositiveGood ? isPositive : !isPositive;
    
    return shouldShowUp ? (
      <TrendingUp className="h-3 w-3 text-green-500" />
    ) : (
      <TrendingDown className="h-3 w-3 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {mockCampaignMetrics.map(campaign => (
                <SelectItem key={campaign.campaign_id} value={campaign.campaign_id}>
                  {campaign.campaign_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.sent.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(8.2)}
              <span>+8.2% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(avgOpenRate)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(2.1)}
              <span>+2.1% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(avgConversionRate)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(12.5)}
              <span>+12.5% vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgROI.toFixed(1)}x</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(15.3)}
              <span>+15.3% vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-[600px] grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Performance Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Campaign Funnel
                </CardTitle>
                <CardDescription>
                  Conversion funnel across all campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Sent</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{totalMetrics.sent.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">100%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Opened</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{totalMetrics.opened.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatPercentage(avgOpenRate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MousePointer className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Clicked</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{totalMetrics.clicked.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatPercentage(totalMetrics.clicked / totalMetrics.sent)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Converted</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{totalMetrics.converted.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatPercentage(totalMetrics.converted / totalMetrics.sent)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Impact
                </CardTitle>
                <CardDescription>
                  Financial performance and ROI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(totalMetrics.revenue)}
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Campaign Cost</div>
                    <div className="text-xl font-bold text-red-600">
                      {formatCurrency(totalMetrics.cost)}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Return on Investment</div>
                  <div className="text-2xl font-bold text-primary">
                    {avgROI.toFixed(1)}x ROI
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(totalMetrics.revenue - totalMetrics.cost)} profit
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Revenue per Email</span>
                    <span className="font-medium">
                      {formatCurrency(totalMetrics.revenue / totalMetrics.sent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cost per Conversion</span>
                    <span className="font-medium">
                      {formatCurrency(totalMetrics.cost / totalMetrics.converted)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Detailed metrics for each marketing campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCampaignMetrics.map((campaign) => (
                  <div key={campaign.campaign_id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{campaign.campaign_name}</h3>
                        <p className="text-sm text-muted-foreground">{campaign.period}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {campaign.roi.toFixed(1)}x ROI
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(campaign.revenue)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Sent</div>
                        <div className="font-medium">{campaign.sent.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Open Rate</div>
                        <div className="font-medium">{formatPercentage(campaign.open_rate)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Click Rate</div>
                        <div className="font-medium">{formatPercentage(campaign.click_rate)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Conversion</div>
                        <div className="font-medium">{formatPercentage(campaign.conversion_rate)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance</CardTitle>
              <CardDescription>
                Multi-channel campaign effectiveness comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockChannelMetrics.map((channel) => (
                  <div key={channel.channel} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getMetricIcon(channel.channel)}
                        <h3 className="font-medium capitalize">{channel.channel}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">
                          {channel.roi.toFixed(1)}x ROI
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(channel.revenue)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Sent</div>
                        <div className="font-medium">{channel.sent.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Delivered</div>
                        <div className="font-medium">{channel.delivered.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Opened</div>
                        <div className="font-medium">{channel.opened.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Clicked</div>
                        <div className="font-medium">{channel.clicked.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Converted</div>
                        <div className="font-medium">{channel.converted.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
              <CardDescription>
                Financial performance and profitability metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Revenue Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Detailed revenue attribution and profitability analysis
                </p>
                <Button variant="outline">
                  View Revenue Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}