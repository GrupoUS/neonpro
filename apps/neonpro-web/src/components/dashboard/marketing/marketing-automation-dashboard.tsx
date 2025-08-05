'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  Clock,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  Send,
  Target,
  Users,
  BarChart3,
  Settings,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Marketing Automation Dashboard Component - Research-Backed Implementation
 * 
 * Features:
 * - Campaign creation and management
 * - Automated workflow configuration
 * - Performance tracking and analytics
 * - Multi-platform campaign orchestration
 * - A/B testing and optimization
 * 
 * Based on modern marketing automation platforms and best practices
 */

interface MarketingCampaign {
  id: string;
  name: string;
  description?: string;
  type: 'email' | 'social_post' | 'whatsapp_broadcast' | 'lead_nurture' | 'abandoned_cart';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  target_platforms: string[];
  audience_filters: any;
  automation_rules: any;
  schedule?: any;
  performance_metrics?: {
    total_sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
  };
  created_at: string;
  updated_at: string;
  last_run_at?: string;
  next_run_at?: string;
}

interface AutomationTrigger {
  id: string;
  name: string;
  type: 'event' | 'schedule' | 'condition';
  configuration: any;
  active: boolean;
  campaigns: string[];
}

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  configuration: any;
  is_system: boolean;
}

const CAMPAIGN_TYPES = [
  {
    value: 'email',
    label: 'Email Campaign',
    description: 'Send targeted email campaigns to your audience',
    icon: Send,
  },
  {
    value: 'social_post',
    label: 'Social Media Post',
    description: 'Schedule and publish content across social platforms',
    icon: Target,
  },
  {
    value: 'whatsapp_broadcast',
    label: 'WhatsApp Broadcast',
    description: 'Send bulk messages via WhatsApp Business',
    icon: Send,
  },
  {
    value: 'lead_nurture',
    label: 'Lead Nurturing',
    description: 'Automated sequence to convert leads to customers',
    icon: Users,
  },
  {
    value: 'abandoned_cart',
    label: 'Abandoned Cart Recovery',
    description: 'Re-engage customers who left items in their cart',
    icon: AlertTriangle,
  },
];

export function MarketingAutomationDashboard() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [triggers, setTriggers] = useState<AutomationTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Partial<MarketingCampaign>>({});

  useEffect(() => {
    loadCampaigns();
    loadTemplates();
    loadTriggers();
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await fetch('/api/marketing/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      toast.error('Failed to load campaign data');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/marketing/campaigns/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadTriggers = async () => {
    try {
      const response = await fetch('/api/marketing/automation/triggers');
      if (response.ok) {
        const data = await response.json();
        setTriggers(data.triggers || []);
      }
    } catch (error) {
      console.error('Failed to load triggers:', error);
    }
  };

  const createCampaign = async () => {
    try {
      const response = await fetch('/api/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCampaign),
      });
      
      if (response.ok) {
        toast.success('Campaign created successfully');
        loadCampaigns();
        setShowCreateDialog(false);
        setEditingCampaign({});
      } else {
        throw new Error('Failed to create campaign');
      }
    } catch (error) {
      console.error('Create campaign failed:', error);
      toast.error('Failed to create campaign');
    }
  };

  const updateCampaign = async (campaignId: string, updates: Partial<MarketingCampaign>) => {
    try {
      const response = await fetch(`/api/marketing/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        toast.success('Campaign updated successfully');
        loadCampaigns();
      } else {
        throw new Error('Failed to update campaign');
      }
    } catch (error) {
      console.error('Update campaign failed:', error);
      toast.error('Failed to update campaign');
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/marketing/campaigns/${campaignId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Campaign deleted successfully');
        loadCampaigns();
      } else {
        throw new Error('Failed to delete campaign');
      }
    } catch (error) {
      console.error('Delete campaign failed:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const runCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/marketing/campaigns/${campaignId}/run`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast.success('Campaign started successfully');
        loadCampaigns();
      } else {
        throw new Error('Failed to start campaign');
      }
    } catch (error) {
      console.error('Run campaign failed:', error);
      toast.error('Failed to start campaign');
    }
  };

  const pauseCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/marketing/campaigns/${campaignId}/pause`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast.success('Campaign paused successfully');
        loadCampaigns();
      } else {
        throw new Error('Failed to pause campaign');
      }
    } catch (error) {
      console.error('Pause campaign failed:', error);
      toast.error('Failed to pause campaign');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><Play className="w-3 h-3 mr-1" />Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800"><Pause className="w-3 h-3 mr-1" />Paused</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const getCampaignTypeIcon = (type: string) => {
    const campaignType = CAMPAIGN_TYPES.find(t => t.value === type);
    if (campaignType) {
      const Icon = campaignType.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <Target className="w-4 h-4" />;
  };

  const getCampaignTypeName = (type: string) => {
    const campaignType = CAMPAIGN_TYPES.find(t => t.value === type);
    return campaignType?.label || type;
  };

  const formatMetrics = (metrics?: MarketingCampaign['performance_metrics']) => {
    if (!metrics) return 'No data';
    
    const openRate = metrics.total_sent > 0 ? (metrics.opened / metrics.total_sent * 100).toFixed(1) : '0';
    const clickRate = metrics.opened > 0 ? (metrics.clicked / metrics.opened * 100).toFixed(1) : '0';
    const conversionRate = metrics.total_sent > 0 ? (metrics.converted / metrics.total_sent * 100).toFixed(1) : '0';
    
    return `${openRate}% open, ${clickRate}% click, ${conversionRate}% conversion`;
  };

  const formatRevenue = (revenue: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(revenue);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Campaign Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
              <Target className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Play className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatRevenue(
                    campaigns.reduce((sum, c) => sum + (c.performance_metrics?.revenue || 0), 0)
                  )}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Conversion</p>
                <p className="text-2xl font-bold">
                  {campaigns.length > 0 ? (
                    campaigns.reduce((sum, c) => {
                      const metrics = c.performance_metrics;
                      if (!metrics || metrics.total_sent === 0) return sum;
                      return sum + (metrics.converted / metrics.total_sent * 100);
                    }, 0) / campaigns.filter(c => c.performance_metrics?.total_sent).length
                  ).toFixed(1) : '0'}%
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Marketing Campaigns</CardTitle>
              <CardDescription>
                Create and manage automated marketing campaigns
              </CardDescription>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Campaign</DialogTitle>
                  <DialogDescription>
                    Set up a new automated marketing campaign
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Campaign Name</Label>
                      <Input
                        id="name"
                        value={editingCampaign.name || ''}
                        onChange={(e) => setEditingCampaign(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter campaign name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="type">Campaign Type</Label>
                      <Select
                        value={editingCampaign.type || ''}
                        onValueChange={(value) => setEditingCampaign(prev => ({ ...prev, type: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select campaign type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CAMPAIGN_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center space-x-2">
                                <type.icon className="w-4 h-4" />
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editingCampaign.description || ''}
                      onChange={(e) => setEditingCampaign(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the campaign goals and strategy"
                      rows={3}
                    />
                  </div>
                  
                  {editingCampaign.type && (
                    <Alert>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        {CAMPAIGN_TYPES.find(t => t.value === editingCampaign.type)?.description}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createCampaign} disabled={!editingCampaign.name || !editingCampaign.type}>
                    Create Campaign
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      {campaign.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {campaign.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getCampaignTypeIcon(campaign.type)}
                      <span className="text-sm">{getCampaignTypeName(campaign.type)}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  
                  <TableCell className="text-sm">
                    {formatMetrics(campaign.performance_metrics)}
                  </TableCell>
                  
                  <TableCell className="text-sm font-medium">
                    {campaign.performance_metrics?.revenue 
                      ? formatRevenue(campaign.performance_metrics.revenue)
                      : '-'
                    }
                  </TableCell>
                  
                  <TableCell className="text-sm">
                    {campaign.last_run_at 
                      ? new Date(campaign.last_run_at).toLocaleDateString()
                      : 'Never'
                    }
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {campaign.status === 'draft' || campaign.status === 'paused' ? (
                        <Button variant="ghost" size="sm" onClick={() => runCampaign(campaign.id)}>
                          <Play className="w-4 h-4" />
                        </Button>
                      ) : campaign.status === 'active' ? (
                        <Button variant="ghost" size="sm" onClick={() => pauseCampaign(campaign.id)}>
                          <Pause className="w-4 h-4" />
                        </Button>
                      ) : null}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Campaign
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            Campaign Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteCampaign(campaign.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Campaign
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {campaigns.length === 0 && (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No campaigns created yet</p>
              <p className="text-sm text-gray-500">Create your first marketing campaign to get started</p>
              <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Campaign
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
