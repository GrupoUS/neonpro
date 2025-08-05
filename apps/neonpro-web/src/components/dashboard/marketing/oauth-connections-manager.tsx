'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Instagram,
  Facebook,
  MessageCircle,
  Building2,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical,
  ExternalLink,
  Trash2,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * OAuth Connection Management Component - Research-Backed Implementation
 * 
 * Features:
 * - Platform connection status monitoring
 * - OAuth flow initiation and management
 * - Connection health analytics
 * - Token refresh management
 * - Account configuration and settings
 * 
 * Based on modern dashboard patterns and OAuth UX best practices
 */

interface SocialMediaAccount {
  id: string;
  platform: 'instagram' | 'facebook' | 'whatsapp' | 'hubspot';
  platform_account_id: string;
  account_name: string;
  account_username?: string;
  status: 'active' | 'inactive' | 'needs_reauth' | 'error';
  last_sync_at?: string;
  last_token_refresh?: string;
  token_expires_at?: string;
  account_metadata?: any;
  sync_enabled: boolean;
  scopes: string[];
  created_at: string;
  updated_at: string;
}

interface ConnectionStats {
  total_connections: number;
  active_connections: number;
  needs_attention: number;
  last_sync_errors: number;
}

interface PlatformConfig {
  platform: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  features: string[];
  requiredScopes: string[];
}

const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    platform: 'instagram',
    name: 'Instagram Business',
    icon: Instagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    description: 'Connect your Instagram Business account for posts and analytics',
    features: ['Post Publishing', 'Stories', 'Analytics', 'Comments Management'],
    requiredScopes: ['instagram_basic', 'instagram_content_publish', 'pages_show_list']
  },
  {
    platform: 'facebook',
    name: 'Facebook Pages',
    icon: Facebook,
    color: 'bg-blue-600',
    description: 'Manage your Facebook business pages and engagement',
    features: ['Page Management', 'Post Publishing', 'Messages', 'Insights'],
    requiredScopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_messaging']
  },
  {
    platform: 'whatsapp',
    name: 'WhatsApp Business',
    icon: MessageCircle,
    color: 'bg-green-600',
    description: 'Customer communication through WhatsApp Business API',
    features: ['Message Automation', 'Customer Support', 'Broadcast Lists', 'Templates'],
    requiredScopes: ['whatsapp_business_management', 'whatsapp_business_messaging']
  },
  {
    platform: 'hubspot',
    name: 'HubSpot CRM',
    icon: Building2,
    color: 'bg-orange-600',
    description: 'Integrate with HubSpot for complete CRM synchronization',
    features: ['Contact Sync', 'Deal Tracking', 'Email Marketing', 'Analytics'],
    requiredScopes: ['contacts', 'content', 'timeline', 'automation']
  }
];

export function OAuthConnectionsManager() {
  const [connections, setConnections] = useState<SocialMediaAccount[]>([]);
  const [stats, setStats] = useState<ConnectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<SocialMediaAccount | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
    loadStats();
  }, []);

  const loadConnections = async () => {
    try {
      const response = await fetch('/api/social-media/accounts');
      if (response.ok) {
        const data = await response.json();
        setConnections(data.accounts || []);
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
      toast.error('Failed to load connection data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/social-media/accounts?stats=true');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const initiateOAuthFlow = async (platform: string) => {
    setConnectingPlatform(platform);
    try {
      const response = await fetch(`/api/oauth/${platform}/auth`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to initiate OAuth flow');
      }
    } catch (error) {
      console.error('OAuth initiation failed:', error);
      toast.error(`Failed to connect to ${platform}`);
    } finally {
      setConnectingPlatform(null);
    }
  };

  const refreshConnection = async (connectionId: string, platform: string) => {
    setRefreshing(connectionId);
    try {
      const response = await fetch(`/api/oauth/${platform}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });
      
      if (response.ok) {
        toast.success('Connection refreshed successfully');
        loadConnections();
      } else {
        throw new Error('Failed to refresh connection');
      }
    } catch (error) {
      console.error('Connection refresh failed:', error);
      toast.error('Failed to refresh connection');
    } finally {
      setRefreshing(null);
    }
  };

  const toggleSync = async (connectionId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/social-media/accounts/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sync_enabled: enabled }),
      });
      
      if (response.ok) {
        setConnections(prev => 
          prev.map(conn => 
            conn.id === connectionId 
              ? { ...conn, sync_enabled: enabled }
              : conn
          )
        );
        toast.success(`Sync ${enabled ? 'enabled' : 'disabled'} successfully`);
      } else {
        throw new Error('Failed to update sync setting');
      }
    } catch (error) {
      console.error('Toggle sync failed:', error);
      toast.error('Failed to update sync setting');
    }
  };

  const deleteConnection = async () => {
    if (!selectedConnection) return;
    
    try {
      const response = await fetch(`/api/oauth/${selectedConnection.platform}/${selectedConnection.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Connection removed successfully');
        loadConnections();
        loadStats();
      } else {
        throw new Error('Failed to delete connection');
      }
    } catch (error) {
      console.error('Delete connection failed:', error);
      toast.error('Failed to remove connection');
    } finally {
      setShowDeleteDialog(false);
      setSelectedConnection(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'needs_reauth':
        return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Needs Reauth</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  const getTokenExpirationStatus = (expiresAt?: string) => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expiration = new Date(expiresAt);
    const hoursUntilExpiration = (expiration.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilExpiration < 24) {
      return (
        <div className="text-sm text-yellow-600">
          <AlertTriangle className="w-4 h-4 inline mr-1" />
          Expires in {Math.round(hoursUntilExpiration)} hours
        </div>
      );
    }
    
    const daysUntilExpiration = Math.round(hoursUntilExpiration / 24);
    return (
      <div className="text-sm text-gray-500">
        Expires in {daysUntilExpiration} days
      </div>
    );
  };

  const getPlatformConfig = (platform: string) => 
    PLATFORM_CONFIGS.find(config => config.platform === platform);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Connections</p>
                  <p className="text-2xl font-bold">{stats.total_connections}</p>
                </div>
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active_connections}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Needs Attention</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.needs_attention}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recent Errors</p>
                  <p className="text-2xl font-bold text-red-600">{stats.last_sync_errors}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Available Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Connect New Platform</CardTitle>
          <CardDescription>
            Add social media and marketing platforms to expand your reach
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLATFORM_CONFIGS.map((config) => {
              const isConnected = connections.some(conn => conn.platform === config.platform);
              const Icon = config.icon;
              
              return (
                <Card key={config.platform} className={`relative overflow-hidden ${isConnected ? 'opacity-50' : 'hover:shadow-md'}`}>
                  <CardContent className="p-4">
                    <div className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{config.name}</h3>
                    <p className="text-xs text-gray-600 mb-3">{config.description}</p>
                    
                    {isConnected ? (
                      <Badge variant="secondary" className="text-xs">Connected</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => initiateOAuthFlow(config.platform)}
                        disabled={connectingPlatform === config.platform}
                        className="w-full"
                      >
                        {connectingPlatform === config.platform ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ExternalLink className="w-4 h-4 mr-2" />
                        )}
                        Connect
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <CardDescription>
              Manage your connected social media and marketing accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {connections.map((connection) => {
                const config = getPlatformConfig(connection.platform);
                if (!config) return null;
                
                const Icon = config.icon;
                
                return (
                  <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{connection.account_name}</h3>
                          {getStatusBadge(connection.status)}
                        </div>
                        
                        {connection.account_username && (
                          <p className="text-sm text-gray-600">@{connection.account_username}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {connection.last_sync_at && (
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Last sync: {new Date(connection.last_sync_at).toLocaleDateString()}
                            </span>
                          )}
                          
                          {getTokenExpirationStatus(connection.token_expires_at)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Sync</span>
                        <Switch
                          checked={connection.sync_enabled}
                          onCheckedChange={(enabled) => toggleSync(connection.id, enabled)}
                        />
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => refreshConnection(connection.id, connection.platform)}
                            disabled={refreshing === connection.id}
                          >
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing === connection.id ? 'animate-spin' : ''}`} />
                            Refresh Token
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <Separator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedConnection(connection);
                              setShowDeleteDialog(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Connection
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Connection</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the connection to{' '}
              <strong>{selectedConnection?.account_name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteConnection}>
              Remove Connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
