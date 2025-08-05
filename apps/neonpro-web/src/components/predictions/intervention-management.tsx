/**
 * Story 11.2: Intervention Management Component
 * Automated intervention strategies and proactive patient engagement
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  MessageSquare,
  Phone,
  Mail,
  Bell,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  Send,
  Eye,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Heart,
  Shield
} from 'lucide-react';
import type { 
  InterventionStrategy,
  InterventionTrigger,
  InterventionOutcome,
  InterventionType,
  CommunicationChannel
} from '@/lib/analytics/intervention-engine';

interface InterventionManagementProps {
  interventions: InterventionStrategy[];
  outcomes: InterventionOutcome[];
  onCreateIntervention: (intervention: Partial<InterventionStrategy>) => void;
  onUpdateIntervention: (id: string, updates: Partial<InterventionStrategy>) => void;
  onDeleteIntervention: (id: string) => void;
}

interface InterventionForm {
  name: string;
  type: InterventionType;
  triggers: InterventionTrigger[];
  channels: CommunicationChannel[];
  template: string;
  timing: {
    delay: number;
    followUp: number;
    maxAttempts: number;
  };
  conditions: {
    riskThreshold: number;
    timeWindow: number;
    excludeRecent: boolean;
  };
  active: boolean;
}

interface InterventionAnalytics {
  effectiveness: Array<{
    intervention: string;
    successRate: number;
    totalSent: number;
    responseRate: number;
    noShowReduction: number;
  }>;
  channelPerformance: Array<{
    channel: string;
    deliveryRate: number;
    responseRate: number;
    cost: number;
    satisfaction: number;
  }>;
  timingAnalysis: Array<{
    timing: string;
    effectiveness: number;
    volume: number;
  }>;
  patientSegments: Array<{
    segment: string;
    preferredChannel: string;
    bestTiming: string;
    responseRate: number;
  }>;
}

const INTERVENTION_TYPES: Array<{ value: InterventionType; label: string; icon: React.ReactNode }> = [
  { value: 'SMS_REMINDER', label: 'SMS Reminder', icon: <MessageSquare className="h-4 w-4" /> },
  { value: 'PHONE_CALL', label: 'Phone Call', icon: <Phone className="h-4 w-4" /> },
  { value: 'EMAIL_REMINDER', label: 'Email Reminder', icon: <Mail className="h-4 w-4" /> },
  { value: 'PUSH_NOTIFICATION', label: 'Push Notification', icon: <Bell className="h-4 w-4" /> },
  { value: 'PERSONAL_OUTREACH', label: 'Personal Outreach', icon: <Users className="h-4 w-4" /> },
  { value: 'AUTOMATED_SEQUENCE', label: 'Automated Sequence', icon: <Zap className="h-4 w-4" /> }
];

const COMMUNICATION_CHANNELS: Array<{ value: CommunicationChannel; label: string }> = [
  { value: 'SMS', label: 'SMS' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'PUSH', label: 'Push Notification' },
  { value: 'IN_APP', label: 'In-App Message' }
];

const TRIGGER_CONDITIONS = [
  { value: 'HIGH_RISK_SCORE', label: 'High Risk Score (≥70%)' },
  { value: 'HISTORICAL_NO_SHOW', label: 'Historical No-Show Pattern' },
  { value: 'SHORT_NOTICE_BOOKING', label: 'Short Notice Booking (<24h)' },
  { value: 'FIRST_TIME_PATIENT', label: 'First Time Patient' },
  { value: 'MISSED_LAST_APPOINTMENT', label: 'Missed Last Appointment' },
  { value: 'COMMUNICATION_DECLINE', label: 'Communication Response Decline' },
  { value: 'WEATHER_ALERT', label: 'Weather Alert' },
  { value: 'APPOINTMENT_CHANGE', label: 'Appointment Change' }
];

export function InterventionManagement({
  interventions,
  outcomes,
  onCreateIntervention,
  onUpdateIntervention,
  onDeleteIntervention
}: InterventionManagementProps) {
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionStrategy | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'analytics' | 'templates' | 'settings'>('active');
  const [interventionForm, setInterventionForm] = useState<InterventionForm>({
    name: '',
    type: 'SMS_REMINDER',
    triggers: [],
    channels: ['SMS'],
    template: '',
    timing: {
      delay: 24,
      followUp: 2,
      maxAttempts: 3
    },
    conditions: {
      riskThreshold: 50,
      timeWindow: 7,
      excludeRecent: true
    },
    active: true
  });

  /**
   * Calculate intervention analytics from outcomes
   */
  const interventionAnalytics = useMemo((): InterventionAnalytics => {
    // Group outcomes by intervention
    const interventionGroups = outcomes.reduce((acc, outcome) => {
      if (!acc[outcome.interventionId]) {
        acc[outcome.interventionId] = [];
      }
      acc[outcome.interventionId].push(outcome);
      return acc;
    }, {} as Record<string, InterventionOutcome[]>);

    // Calculate effectiveness metrics
    const effectiveness = Object.entries(interventionGroups).map(([interventionId, outcomes]) => {
      const intervention = interventions.find(i => i.id === interventionId);
      const successfulOutcomes = outcomes.filter(o => o.success);
      const noShowReduction = outcomes.filter(o => o.noShowPrevented).length;
      
      return {
        intervention: intervention?.name || 'Unknown',
        successRate: (successfulOutcomes.length / outcomes.length) * 100,
        totalSent: outcomes.length,
        responseRate: (outcomes.filter(o => o.patientEngaged).length / outcomes.length) * 100,
        noShowReduction: (noShowReduction / outcomes.length) * 100
      };
    });

    // Channel performance analysis
    const channelGroups = outcomes.reduce((acc, outcome) => {
      const channel = outcome.channel;
      if (!acc[channel]) {
        acc[channel] = [];
      }
      acc[channel].push(outcome);
      return acc;
    }, {} as Record<string, InterventionOutcome[]>);

    const channelPerformance = Object.entries(channelGroups).map(([channel, outcomes]) => ({
      channel: channel.charAt(0) + channel.slice(1).toLowerCase(),
      deliveryRate: (outcomes.filter(o => o.delivered).length / outcomes.length) * 100,
      responseRate: (outcomes.filter(o => o.patientEngaged).length / outcomes.length) * 100,
      cost: outcomes.reduce((sum, o) => sum + (o.cost || 0), 0) / outcomes.length,
      satisfaction: outcomes.reduce((sum, o) => sum + (o.satisfactionScore || 0), 0) / outcomes.length
    }));

    // Timing analysis (mock data for now)
    const timingAnalysis = [
      { timing: '24h before', effectiveness: 85, volume: 1240 },
      { timing: '2h before', effectiveness: 92, volume: 890 },
      { timing: '30min before', effectiveness: 78, volume: 450 },
      { timing: 'Day after booking', effectiveness: 65, volume: 2100 },
      { timing: 'Weekly reminder', effectiveness: 70, volume: 1800 }
    ];

    // Patient segments (mock data)
    const patientSegments = [
      { segment: 'Young Adults (18-30)', preferredChannel: 'SMS', bestTiming: '2h before', responseRate: 78 },
      { segment: 'Working Adults (31-50)', preferredChannel: 'Email', bestTiming: '24h before', responseRate: 85 },
      { segment: 'Seniors (51+)', preferredChannel: 'Phone', bestTiming: '24h before', responseRate: 92 },
      { segment: 'First-time Patients', preferredChannel: 'SMS + Email', bestTiming: 'Day after booking', responseRate: 68 }
    ];

    return {
      effectiveness,
      channelPerformance,
      timingAnalysis,
      patientSegments
    };
  }, [interventions, outcomes]);

  /**
   * Handle form submission
   */
  const handleSubmitIntervention = () => {
    const newIntervention: Partial<InterventionStrategy> = {
      name: interventionForm.name,
      type: interventionForm.type,
      triggers: interventionForm.triggers,
      channels: interventionForm.channels,
      template: interventionForm.template,
      timing: interventionForm.timing,
      conditions: {
        riskThreshold: interventionForm.conditions.riskThreshold,
        timeWindow: interventionForm.conditions.timeWindow,
        excludeRecent: interventionForm.conditions.excludeRecent
      },
      active: interventionForm.active
    };

    onCreateIntervention(newIntervention);
    setShowCreateForm(false);
    setInterventionForm({
      name: '',
      type: 'SMS_REMINDER',
      triggers: [],
      channels: ['SMS'],
      template: '',
      timing: { delay: 24, followUp: 2, maxAttempts: 3 },
      conditions: { riskThreshold: 50, timeWindow: 7, excludeRecent: true },
      active: true
    });
  };

  /**
   * Toggle intervention active status
   */
  const toggleInterventionStatus = (intervention: InterventionStrategy) => {
    onUpdateIntervention(intervention.id, { active: !intervention.active });
  };

  /**
   * Get intervention type icon and label
   */
  const getInterventionTypeInfo = (type: InterventionType) => {
    return INTERVENTION_TYPES.find(t => t.value === type) || INTERVENTION_TYPES[0];
  };

  /**
   * Get effectiveness color based on percentage
   */
  const getEffectivenessColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Intervention Management</h2>
          <p className="text-muted-foreground">
            Manage automated interventions and proactive patient engagement strategies
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button>
                <Zap className="h-4 w-4 mr-2" />
                New Intervention
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Intervention</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Intervention Name</label>
                    <Input
                      value={interventionForm.name}
                      onChange={(e) => setInterventionForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., High Risk SMS Reminder"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select 
                      value={interventionForm.type}
                      onValueChange={(value: InterventionType) => 
                        setInterventionForm(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INTERVENTION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Communication Channels</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {COMMUNICATION_CHANNELS.map(channel => (
                        <label key={channel.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={interventionForm.channels.includes(channel.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setInterventionForm(prev => ({
                                  ...prev,
                                  channels: [...prev.channels, channel.value]
                                }));
                              } else {
                                setInterventionForm(prev => ({
                                  ...prev,
                                  channels: prev.channels.filter(c => c !== channel.value)
                                }));
                              }
                            }}
                          />
                          <span className="text-sm">{channel.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Trigger Conditions */}
                <div className="space-y-4">
                  <h4 className="font-medium">Trigger Conditions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {TRIGGER_CONDITIONS.map(trigger => (
                      <label key={trigger.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={interventionForm.triggers.includes(trigger.value as InterventionTrigger)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setInterventionForm(prev => ({
                                ...prev,
                                triggers: [...prev.triggers, trigger.value as InterventionTrigger]
                              }));
                            } else {
                              setInterventionForm(prev => ({
                                ...prev,
                                triggers: prev.triggers.filter(t => t !== trigger.value)
                              }));
                            }
                          }}
                        />
                        <span className="text-sm">{trigger.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Message Template */}
                <div>
                  <label className="text-sm font-medium">Message Template</label>
                  <Textarea
                    value={interventionForm.template}
                    onChange={(e) => setInterventionForm(prev => ({ ...prev, template: e.target.value }))}
                    placeholder="Olá {patientName}, você tem uma consulta agendada para {appointmentDate} às {appointmentTime}. Para confirmar, responda SIM."
                    rows={3}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Available variables: {'{patientName}'}, {'{appointmentDate}'}, {'{appointmentTime}'}, {'{doctorName}'}
                  </div>
                </div>

                {/* Timing Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium">Timing Settings</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Delay (hours)</label>
                      <Input
                        type="number"
                        value={interventionForm.timing.delay}
                        onChange={(e) => setInterventionForm(prev => ({
                          ...prev,
                          timing: { ...prev.timing, delay: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Follow-up (hours)</label>
                      <Input
                        type="number"
                        value={interventionForm.timing.followUp}
                        onChange={(e) => setInterventionForm(prev => ({
                          ...prev,
                          timing: { ...prev.timing, followUp: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Max Attempts</label>
                      <Input
                        type="number"
                        value={interventionForm.timing.maxAttempts}
                        onChange={(e) => setInterventionForm(prev => ({
                          ...prev,
                          timing: { ...prev.timing, maxAttempts: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                <div className="space-y-4">
                  <h4 className="font-medium">Conditions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Risk Threshold (%)</label>
                      <Input
                        type="number"
                        value={interventionForm.conditions.riskThreshold}
                        onChange={(e) => setInterventionForm(prev => ({
                          ...prev,
                          conditions: { ...prev.conditions, riskThreshold: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Time Window (days)</label>
                      <Input
                        type="number"
                        value={interventionForm.conditions.timeWindow}
                        onChange={(e) => setInterventionForm(prev => ({
                          ...prev,
                          conditions: { ...prev.conditions, timeWindow: parseInt(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={interventionForm.conditions.excludeRecent}
                      onCheckedChange={(checked) => setInterventionForm(prev => ({
                        ...prev,
                        conditions: { ...prev.conditions, excludeRecent: checked }
                      }))}
                    />
                    <label className="text-sm">Exclude patients contacted in last 24h</label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={interventionForm.active}
                      onCheckedChange={(checked) => setInterventionForm(prev => ({ ...prev, active: checked }))}
                    />
                    <label className="text-sm font-medium">Active</label>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitIntervention}>
                      Create Intervention
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Interventions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Active Interventions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {interventions.filter(i => i.active).length}
                </div>
                <div className="text-xs text-muted-foreground">
                  Of {interventions.length} total
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Messages Sent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {outcomes.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  This month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {outcomes.length > 0 ? 
                    Math.round((outcomes.filter(o => o.success).length / outcomes.length) * 100)
                    : 0
                  }%
                </div>
                <div className="text-xs text-muted-foreground">
                  Overall effectiveness
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  No-Shows Prevented
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {outcomes.filter(o => o.noShowPrevented).length}
                </div>
                <div className="text-xs text-muted-foreground">
                  This month
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Interventions List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Active Interventions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interventions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No interventions configured yet. Create your first intervention to start preventing no-shows.
                  </div>
                ) : (
                  interventions.map((intervention) => {
                    const typeInfo = getInterventionTypeInfo(intervention.type);
                    const interventionOutcomes = outcomes.filter(o => o.interventionId === intervention.id);
                    const successRate = interventionOutcomes.length > 0 ? 
                      (interventionOutcomes.filter(o => o.success).length / interventionOutcomes.length) * 100 : 0;

                    return (
                      <Card 
                        key={intervention.id}
                        className={`cursor-pointer transition-colors ${
                          intervention.active ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50/50'
                        }`}
                        onClick={() => setSelectedIntervention(intervention)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {typeInfo.icon}
                                <span className="font-medium">{intervention.name}</span>
                              </div>
                              <Badge variant={intervention.active ? 'default' : 'secondary'}>
                                {intervention.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleInterventionStatus(intervention);
                                }}
                              >
                                {intervention.active ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedIntervention(intervention);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <div className="text-xs text-muted-foreground">Type</div>
                              <div className="text-sm font-medium">{typeInfo.label}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Channels</div>
                              <div className="text-sm font-medium">
                                {intervention.channels.join(', ')}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Success Rate</div>
                              <div className={`text-sm font-medium ${getEffectivenessColor(successRate)}`}>
                                {successRate.toFixed(0)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Messages Sent</div>
                              <div className="text-sm font-medium">{interventionOutcomes.length}</div>
                            </div>
                          </div>

                          <Progress value={successRate} className="h-2" />

                          <div className="flex items-center justify-between mt-3">
                            <div className="text-xs text-muted-foreground">
                              Triggers: {intervention.triggers.length} conditions
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last updated: {intervention.lastUpdated.toLocaleDateString()}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Intervention Effectiveness Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Intervention Effectiveness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={interventionAnalytics.effectiveness}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="intervention" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}${name.includes('Rate') || name.includes('Reduction') ? '%' : ''}`,
                      name
                    ]}
                  />
                  <Bar dataKey="successRate" name="Success Rate" fill="#10B981" />
                  <Bar dataKey="responseRate" name="Response Rate" fill="#3B82F6" />
                  <Bar dataKey="noShowReduction" name="No-Show Reduction" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Channel Performance and Timing Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Channel Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interventionAnalytics.channelPerformance.map((channel, index) => (
                    <div key={channel.channel} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{channel.channel}</span>
                        <span className="text-sm text-muted-foreground">
                          {channel.deliveryRate.toFixed(0)}% delivery
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Response</div>
                          <div className="font-medium">{channel.responseRate.toFixed(0)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Cost</div>
                          <div className="font-medium">R$ {channel.cost.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Satisfaction</div>
                          <div className="font-medium">{channel.satisfaction.toFixed(1)}/5</div>
                        </div>
                      </div>
                      <Progress value={channel.responseRate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timing Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={interventionAnalytics.timingAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timing" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="effectiveness" name="Effectiveness %" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Patient Segments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Patient Segment Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {interventionAnalytics.patientSegments.map((segment, index) => (
                  <div key={segment.segment} className="space-y-3">
                    <div className="font-medium">{segment.segment}</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Preferred Channel:</span>
                        <span className="font-medium">{segment.preferredChannel}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Best Timing:</span>
                        <span className="font-medium">{segment.bestTiming}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Response Rate:</span>
                        <span className={`font-medium ${getEffectivenessColor(segment.responseRate)}`}>
                          {segment.responseRate}%
                        </span>
                      </div>
                    </div>
                    <Progress value={segment.responseRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Template management functionality coming soon.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Intervention Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Global settings and configuration options coming soon.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Intervention Detail Modal */}
      {selectedIntervention && (
        <Dialog open={!!selectedIntervention} onOpenChange={() => setSelectedIntervention(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getInterventionTypeInfo(selectedIntervention.type).icon}
                {selectedIntervention.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Intervention Details */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{getInterventionTypeInfo(selectedIntervention.type).label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Channels:</span>
                        <span>{selectedIntervention.channels.join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={selectedIntervention.active ? 'default' : 'secondary'}>
                          {selectedIntervention.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Timing</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delay:</span>
                        <span>{selectedIntervention.timing.delay}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Follow-up:</span>
                        <span>{selectedIntervention.timing.followUp}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Attempts:</span>
                        <span>{selectedIntervention.timing.maxAttempts}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Conditions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risk Threshold:</span>
                        <span>{selectedIntervention.conditions.riskThreshold}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time Window:</span>
                        <span>{selectedIntervention.conditions.timeWindow} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Exclude Recent:</span>
                        <span>{selectedIntervention.conditions.excludeRecent ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Triggers</h4>
                    <div className="space-y-1">
                      {selectedIntervention.triggers.map((trigger, index) => (
                        <Badge key={index} variant="outline" className="mr-1 mb-1">
                          {trigger.replace(/_/g, ' ').toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Template */}
              <div>
                <h4 className="font-medium mb-2">Message Template</h4>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  {selectedIntervention.template}
                </div>
              </div>

              {/* Recent Performance */}
              <div>
                <h4 className="font-medium mb-2">Recent Performance</h4>
                {(() => {
                  const interventionOutcomes = outcomes.filter(o => o.interventionId === selectedIntervention.id);
                  const successRate = interventionOutcomes.length > 0 ? 
                    (interventionOutcomes.filter(o => o.success).length / interventionOutcomes.length) * 100 : 0;
                  
                  return (
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{interventionOutcomes.length}</div>
                        <div className="text-xs text-muted-foreground">Messages Sent</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getEffectivenessColor(successRate)}`}>
                          {successRate.toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {interventionOutcomes.filter(o => o.noShowPrevented).length}
                        </div>
                        <div className="text-xs text-muted-foreground">No-Shows Prevented</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {interventionOutcomes.filter(o => o.patientEngaged).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Patient Engaged</div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedIntervention(null)}>
                  Close
                </Button>
                <Button>
                  Edit Intervention
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
