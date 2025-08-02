// =====================================================================================
// CAMPAIGN CREATION FORM COMPONENT - Story 7.2
// Create new automated marketing campaigns with AI personalization
// =====================================================================================

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Badge } from '@/app/components/ui/badge';
import { 
  Brain, 
  Send, 
  Users, 
  Calendar, 
  Target,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface CampaignFormData {
  name: string;
  description: string;
  type: 'email' | 'whatsapp' | 'sms' | 'multi_channel';
  target_segment: string;
  automation_triggers: string[];
  personalization_enabled: boolean;
  ai_optimization: boolean;
  ab_testing_enabled: boolean;
  lgpd_compliance: boolean;
  schedule_type: 'immediate' | 'scheduled' | 'trigger_based';
  scheduled_date?: string;
}

const AUTOMATION_TRIGGERS = [
  { id: 'new_patient', label: 'New Patient Registration' },
  { id: 'appointment_booking', label: 'Appointment Booking' },
  { id: 'treatment_completion', label: 'Treatment Completion' },
  { id: 'birthday', label: 'Patient Birthday' },
  { id: 'followup_due', label: 'Follow-up Due' },
  { id: 'no_show', label: 'Appointment No-show' },
  { id: 'treatment_reminder', label: 'Treatment Reminder' },
  { id: 'feedback_request', label: 'Feedback Request' }
];

const TARGET_SEGMENTS = [
  { id: 'all_patients', label: 'All Patients' },
  { id: 'new_patients', label: 'New Patients (Last 30 days)' },
  { id: 'active_patients', label: 'Active Patients' },
  { id: 'inactive_patients', label: 'Inactive Patients (90+ days)' },
  { id: 'high_value', label: 'High Value Patients' },
  { id: 'birthday_month', label: 'Birthday This Month' },
  { id: 'treatment_specific', label: 'Specific Treatment Type' }
];

export function CampaignCreationForm({ onSubmit, onCancel }: {
  onSubmit: (data: CampaignFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    type: 'email',
    target_segment: '',
    automation_triggers: [],
    personalization_enabled: true,
    ai_optimization: true,
    ab_testing_enabled: false,
    lgpd_compliance: true,
    schedule_type: 'trigger_based'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTrigger = (triggerId: string) => {
    setFormData(prev => ({
      ...prev,
      automation_triggers: prev.automation_triggers.includes(triggerId)
        ? prev.automation_triggers.filter(id => id !== triggerId)
        : [...prev.automation_triggers, triggerId]
    }));
  };

  const getAutomationRate = () => {
    const enabledFeatures = [
      formData.personalization_enabled,
      formData.ai_optimization,
      formData.automation_triggers.length > 0,
      formData.schedule_type === 'trigger_based'
    ].filter(Boolean).length;
    
    return Math.min((enabledFeatures / 4) * 100, 95);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Campaign Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Campaign Details
            </CardTitle>
            <CardDescription>
              Basic information about your marketing campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Welcome Series - New Patients"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the purpose and goals of this campaign..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Campaign Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => 
                setFormData(prev => ({ ...prev, type: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Campaign</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp Campaign</SelectItem>
                  <SelectItem value="sms">SMS Campaign</SelectItem>
                  <SelectItem value="multi_channel">Multi-Channel Campaign</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_segment">Target Segment</Label>
              <Select value={formData.target_segment} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, target_segment: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_SEGMENTS.map(segment => (
                    <SelectItem key={segment.id} value={segment.id}>
                      {segment.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Automation & AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Automation Settings
            </CardTitle>
            <CardDescription>
              Configure AI-driven automation and personalization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Automation Rate Display */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Automation Rate</span>
                <span className="text-lg font-bold text-primary">
                  {getAutomationRate().toFixed(0)}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {getAutomationRate() >= 80 ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Meets ≥80% automation requirement
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-amber-600">
                    <AlertCircle className="h-3 w-3" />
                    Enable more features to reach 80% automation
                  </div>
                )}
              </div>
            </div>

            {/* AI Features */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    AI Personalization
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Personalize content based on patient data
                  </p>
                </div>
                <Switch
                  checked={formData.personalization_enabled}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, personalization_enabled: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>AI Optimization</Label>
                  <p className="text-xs text-muted-foreground">
                    Optimize send times and content automatically
                  </p>
                </div>
                <Switch
                  checked={formData.ai_optimization}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, ai_optimization: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>A/B Testing</Label>
                  <p className="text-xs text-muted-foreground">
                    Test different variations automatically
                  </p>
                </div>
                <Switch
                  checked={formData.ab_testing_enabled}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, ab_testing_enabled: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Automation Triggers
          </CardTitle>
          <CardDescription>
            Select the events that will automatically trigger this campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {AUTOMATION_TRIGGERS.map(trigger => (
              <div
                key={trigger.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.automation_triggers.includes(trigger.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => toggleTrigger(trigger.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{trigger.label}</span>
                  {formData.automation_triggers.includes(trigger.id) && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule & Compliance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={formData.schedule_type} onValueChange={(value: any) => 
              setFormData(prev => ({ ...prev, schedule_type: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Send Immediately</SelectItem>
                <SelectItem value="scheduled">Schedule for Later</SelectItem>
                <SelectItem value="trigger_based">Trigger-based (Recommended)</SelectItem>
              </SelectContent>
            </Select>

            {formData.schedule_type === 'scheduled' && (
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Scheduled Date & Time</Label>
                <Input
                  id="scheduled_date"
                  type="datetime-local"
                  value={formData.scheduled_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>LGPD Compliance</Label>
                  <p className="text-xs text-muted-foreground">
                    Ensure patient data protection compliance
                  </p>
                </div>
                <Switch
                  checked={formData.lgpd_compliance}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, lgpd_compliance: checked }))
                  }
                />
              </div>

              {formData.lgpd_compliance && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">LGPD Compliant</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    This campaign will respect patient consent preferences and data protection requirements.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.name || !formData.target_segment}>
          {isSubmitting ? 'Creating...' : 'Create Campaign'}
        </Button>
      </div>
    </form>
  );
}