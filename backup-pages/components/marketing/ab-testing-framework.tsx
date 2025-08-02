// =====================================================================================
// A/B TESTING FRAMEWORK COMPONENT - Story 7.2
// Statistical A/B testing for marketing campaigns
// =====================================================================================

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Progress } from '@/app/components/ui/progress';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  TestTube, 
  TrendingUp, 
  Users, 
  Target,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Trophy,
  Clock,
  Zap
} from 'lucide-react';

interface ABTest {
  id: string;
  name: string;
  campaign_id: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  test_type: 'subject_line' | 'content' | 'send_time' | 'sender_name' | 'call_to_action';
  variant_a: {
    name: string;
    content: string;
    recipients: number;
    open_rate: number;
    click_rate: number;
    conversion_rate: number;
  };
  variant_b: {
    name: string;
    content: string;
    recipients: number;
    open_rate: number;
    click_rate: number;
    conversion_rate: number;
  };
  traffic_split: number; // Percentage for variant A (remaining goes to B)
  confidence_level: number;
  statistical_significance: number;
  winner?: 'a' | 'b' | 'inconclusive';
  start_date: string;
  end_date?: string;
  duration_hours: number;
  min_sample_size: number;
}

// Mock A/B tests data
const mockABTests: ABTest[] = [
  {
    id: '1',
    name: 'Welcome Email Subject Line Test',
    campaign_id: 'camp_1',
    status: 'completed',
    test_type: 'subject_line',
    variant_a: {
      name: 'Welcome to NeonPro Clinic',
      content: 'Welcome to NeonPro Clinic',
      recipients: 500,
      open_rate: 0.68,
      click_rate: 0.24,
      conversion_rate: 0.08
    },
    variant_b: {
      name: 'Your Beauty Journey Starts Here',
      content: 'Your Beauty Journey Starts Here',
      recipients: 500,
      open_rate: 0.74,
      click_rate: 0.31,
      conversion_rate: 0.12
    },
    traffic_split: 50,
    confidence_level: 95,
    statistical_significance: 0.97,
    winner: 'b',
    start_date: '2025-01-25T10:00:00Z',
    end_date: '2025-01-27T10:00:00Z',
    duration_hours: 48,
    min_sample_size: 1000
  },
  {
    id: '2',
    name: 'Treatment Reminder Send Time',
    campaign_id: 'camp_2',
    status: 'running',
    test_type: 'send_time',
    variant_a: {
      name: 'Morning Send (9 AM)',
      content: '9:00 AM send time',
      recipients: 234,
      open_rate: 0.71,
      click_rate: 0.28,
      conversion_rate: 0.09
    },
    variant_b: {
      name: 'Evening Send (6 PM)',
      content: '6:00 PM send time',
      recipients: 241,
      open_rate: 0.76,
      click_rate: 0.33,
      conversion_rate: 0.11
    },
    traffic_split: 50,
    confidence_level: 95,
    statistical_significance: 0.78,
    start_date: '2025-01-28T09:00:00Z',
    duration_hours: 72,
    min_sample_size: 800
  }
];

interface ABTestFrameworkProps {
  campaignId?: string;
}

export function ABTestingFramework({ campaignId }: ABTestFrameworkProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);

  const runningTests = mockABTests.filter(test => test.status === 'running');
  const completedTests = mockABTests.filter(test => test.status === 'completed');

  const getStatusIcon = (status: ABTest['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-500" />;
    }
  };

  const getWinnerBadge = (test: ABTest) => {
    if (!test.winner) return null;
    
    const winnerVariant = test.winner === 'a' ? test.variant_a : test.variant_b;
    const improvementRate = test.winner === 'b' 
      ? ((test.variant_b.conversion_rate - test.variant_a.conversion_rate) / test.variant_a.conversion_rate * 100)
      : ((test.variant_a.conversion_rate - test.variant_b.conversion_rate) / test.variant_b.conversion_rate * 100);

    return (
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-yellow-500" />
        <span className="text-sm font-medium">
          Winner: {winnerVariant.name}
        </span>
        <Badge variant="secondary">
          +{improvementRate.toFixed(1)}% conversion
        </Badge>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* A/B Testing Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningTests.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTests.length}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Lift</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+18.3%</div>
            <p className="text-xs text-muted-foreground">
              Conversion improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95%</div>
            <p className="text-xs text-muted-foreground">
              Statistical significance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main A/B Testing Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-[400px] grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="running">Running Tests</TabsTrigger>
            <TabsTrigger value="create">Create Test</TabsTrigger>
          </TabsList>
          
          <Button>
            <TestTube className="mr-2 h-4 w-4" />
            New A/B Test
          </Button>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Running Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Currently Running
                </CardTitle>
                <CardDescription>
                  Active A/B tests and their progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {runningTests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No tests currently running
                  </p>
                ) : (
                  runningTests.map((test) => (
                    <div key={test.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{test.name}</h4>
                        <Badge variant="outline">
                          {test.test_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Statistical Significance</span>
                          <span className="font-medium">
                            {(test.statistical_significance * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={test.statistical_significance * 100} />
                        
                        <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                          <div>
                            <span className="text-muted-foreground">Variant A: </span>
                            <span className="font-medium">
                              {(test.variant_a.conversion_rate * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Variant B: </span>
                            <span className="font-medium">
                              {(test.variant_b.conversion_rate * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Recent Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Recent Results
                </CardTitle>
                <CardDescription>
                  Completed tests and their outcomes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {completedTests.slice(0, 3).map((test) => (
                  <div key={test.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{test.name}</h4>
                      {getStatusIcon(test.status)}
                    </div>
                    
                    {getWinnerBadge(test)}
                    
                    <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">A: </span>
                        <span className="font-medium">
                          {(test.variant_a.conversion_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">B: </span>
                        <span className="font-medium">
                          {(test.variant_b.conversion_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Running Tests Tab */}
        <TabsContent value="running" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Running A/B Tests</CardTitle>
              <CardDescription>
                Monitor and manage currently active tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {runningTests.map((test) => (
                  <div key={test.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">{test.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{test.test_type.replace('_', ' ')}</Badge>
                          <Badge variant={test.status === 'running' ? 'default' : 'secondary'}>
                            {test.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Pause Test
                        </Button>
                      </div>
                    </div>

                    {/* Test Progress */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Statistical Significance</span>
                          <span>{(test.statistical_significance * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={test.statistical_significance * 100} />
                      </div>

                      {/* Variants Comparison */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded">
                          <h4 className="font-medium text-sm mb-2">Variant A</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {test.variant_a.name}
                          </p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Recipients:</span>
                              <span>{test.variant_a.recipients}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Open Rate:</span>
                              <span>{(test.variant_a.open_rate * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Click Rate:</span>
                              <span>{(test.variant_a.click_rate * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Conversion:</span>
                              <span>{(test.variant_a.conversion_rate * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 border rounded">
                          <h4 className="font-medium text-sm mb-2">Variant B</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {test.variant_b.name}
                          </p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span>Recipients:</span>
                              <span>{test.variant_b.recipients}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Open Rate:</span>
                              <span>{(test.variant_b.open_rate * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Click Rate:</span>
                              <span>{(test.variant_b.click_rate * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Conversion:</span>
                              <span>{(test.variant_b.conversion_rate * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Test Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Create New A/B Test
              </CardTitle>
              <CardDescription>
                Set up a new statistical A/B test for your campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">A/B Test Creation</h3>
                <p className="text-muted-foreground mb-4">
                  Full A/B test creation form will be implemented here
                </p>
                <Button>
                  <Zap className="mr-2 h-4 w-4" />
                  Start Test Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}