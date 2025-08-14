// =====================================================================================
// MARKETING CAMPAIGNS DASHBOARD COMPONENT - Story 7.2
// Automated Marketing Campaigns + Personalization + A/B Testing
// =====================================================================================

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { 
  BarChart3, 
  Target, 
  Zap, 
  Users, 
  Send, 
  Brain,
  TestTube,
  Shield,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

// Mock data - replace with real API calls
const mockCampaigns = [
  {
    id: '1',
    name: 'Welcome Series - New Patients',
    type: 'email',
    status: 'active',
    automation_rate: 0.92,
    recipients: 1250,
    open_rate: 0.68,
    click_rate: 0.24,
    conversion_rate: 0.08,
    created_at: '2025-01-28T10:00:00Z'
  },
  {
    id: '2', 
    name: 'Treatment Follow-up Campaign',
    type: 'multi_channel',
    status: 'active',
    automation_rate: 0.87,
    recipients: 890,
    open_rate: 0.72,
    click_rate: 0.31,
    conversion_rate: 0.12,
    created_at: '2025-01-25T14:30:00Z'
  },
  {
    id: '3',
    name: 'Birthday Promotions',
    type: 'whatsapp',
    status: 'scheduled',
    automation_rate: 0.95,
    recipients: 2100,
    open_rate: 0.0,
    click_rate: 0.0,
    conversion_rate: 0.0,
    created_at: '2025-01-30T09:15:00Z'
  }
];

const mockMetrics = {
  total_campaigns: 12,
  active_campaigns: 8,
  automation_rate: 0.89,
  total_recipients: 15420,
  avg_open_rate: 0.71,
  avg_click_rate: 0.28,
  avg_conversion_rate: 0.09,
  roi: 4.2
};

export function MarketingCampaignsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.total_campaigns}</div>
            <p className="text-xs text-muted-foreground">
              {mockMetrics.active_campaigns} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(mockMetrics.automation_rate * 100).toFixed(0)}%</div>
            <Progress value={mockMetrics.automation_rate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.total_recipients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg. Open: {(mockMetrics.avg_open_rate * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.roi.toFixed(1)}x</div>
            <p className="text-xs text-muted-foreground">
              Conversion: {(mockMetrics.avg_conversion_rate * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-[600px] grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>
          
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Recent Campaigns
                </CardTitle>
                <CardDescription>
                  Latest automated marketing campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockCampaigns.slice(0, 3).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{campaign.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {campaign.recipients} recipients
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">
                        {(campaign.automation_rate * 100).toFixed(0)}% automated
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(campaign.conversion_rate * 100).toFixed(1)}% conversion
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Personalization Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Personalization
                </CardTitle>
                <CardDescription>
                  AI-driven campaign optimization status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Content Personalization</span>
                    <span className="text-sm font-medium">94% Active</span>
                  </div>
                  <Progress value={94} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Send Time Optimization</span>
                    <span className="text-sm font-medium">87% Active</span>
                  </div>
                  <Progress value={87} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Segment Targeting</span>
                    <span className="text-sm font-medium">91% Active</span>
                  </div>
                  <Progress value={91} />
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    <CheckCircle className="inline h-4 w-4 mr-1 text-green-500" />
                    LGPD Compliance: Active
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Campaigns</CardTitle>
              <CardDescription>
                Manage and monitor your automated marketing campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCampaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{campaign.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                          <Badge variant="outline">
                            {campaign.type}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Recipients</p>
                        <p className="font-medium">{campaign.recipients.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Open Rate</p>
                        <p className="font-medium">{(campaign.open_rate * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Click Rate</p>
                        <p className="font-medium">{(campaign.click_rate * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Automation</p>
                        <p className="font-medium">{(campaign.automation_rate * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B Testing Tab */}
        <TabsContent value="ab-testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                A/B Testing Framework
              </CardTitle>
              <CardDescription>
                Optimize campaigns with statistical A/B testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">A/B Testing Implementation</h3>
                <p className="text-muted-foreground mb-4">
                  Statistical A/B testing framework with automated winner selection
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create A/B Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Campaign Analytics
              </CardTitle>
              <CardDescription>
                Real-time performance tracking and ROI measurement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Real-time performance tracking with conversion attribution
                </p>
                <Button variant="outline">
                  View Full Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Campaign Automation Engine
              </CardTitle>
              <CardDescription>
                ≥80% automation rate with AI-driven optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Automation Status */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Trigger-based Campaigns</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold">94%</p>
                    <p className="text-xs text-muted-foreground">Automated lifecycle events</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">AI Personalization</span>
                      <Brain className="h-4 w-4 text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold">87%</p>
                    <p className="text-xs text-muted-foreground">Content personalization</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">LGPD Compliance</span>
                      <Shield className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold">100%</p>
                    <p className="text-xs text-muted-foreground">Consent management</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Quick Automation Setup</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Button variant="outline" className="justify-start">
                      <Clock className="mr-2 h-4 w-4" />
                      Schedule Campaign
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Setup Triggers
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Brain className="mr-2 h-4 w-4" />
                      AI Optimization
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Shield className="mr-2 h-4 w-4" />
                      Compliance Check
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}