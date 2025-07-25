'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  Clock, 
  Shield, 
  FileText, 
  Users, 
  CheckCircle,
  XCircle,
  Settings,
  Calendar,
  Trash2,
  Eye,
  Filter
} from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/hooks/use-toast'

interface ComplianceAlert {
  id: string
  clinic_id: string
  alert_type: 'consent_expiring' | 'consent_pending' | 'audit_required' | 'regulatory_deadline' | 'privacy_breach' | 'system_security'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  resource_type: string
  resource_id: string
  created_at: string
  resolved_at: string | null
  resolved_by: string | null
  is_read: boolean
  metadata: Record<string, any>
}

interface NotificationSettings {
  email_enabled: boolean
  push_enabled: boolean
  sms_enabled: boolean
  real_time_enabled: boolean
  severity_threshold: string
  alert_types: string[]
}

interface ComplianceAlertsSystemProps {
  clinicId: string
  userId: string
}

export default function ComplianceAlertsSystem({ clinicId, userId }: ComplianceAlertsSystemProps) {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([])
  const [settings, setSettings] = useState<NotificationSettings>({
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    real_time_enabled: true,
    severity_threshold: 'medium',
    alert_types: ['consent_expiring', 'consent_pending', 'audit_required']
  })
  const [loading, setLoading] = useState(true)
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [showResolved, setShowResolved] = useState(false)
  
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchAlerts()
    loadSettings()
    
    // Set up real-time subscription for new alerts
    const channel = supabase
      .channel('compliance_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'compliance_alerts',
          filter: `clinic_id=eq.${clinicId}`
        },
        (payload) => {
          const newAlert = payload.new as ComplianceAlert
          setAlerts(prev => [newAlert, ...prev])
          
          // Show toast notification for high/critical alerts
          if (newAlert.severity === 'high' || newAlert.severity === 'critical') {
            toast({
              title: '🚨 Critical Compliance Alert',
              description: newAlert.title,
              variant: 'destructive'
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clinicId, selectedSeverity, selectedType, showResolved])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('compliance_alerts')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })

      if (!showResolved) {
        query = query.is('resolved_at', null)
      }

      if (selectedSeverity !== 'all') {
        query = query.eq('severity', selectedSeverity)
      }

      if (selectedType !== 'all') {
        query = query.eq('alert_type', selectedType)
      }

      const { data, error } = await query.limit(100)

      if (error) {
        console.error('Error fetching alerts:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch compliance alerts',
          variant: 'destructive'
        })
        return
      }

      setAlerts(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = () => {
    // Load from localStorage or API
    const saved = localStorage.getItem(`compliance_notifications_${clinicId}`)
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings)
    localStorage.setItem(`compliance_notifications_${clinicId}`, JSON.stringify(newSettings))
    toast({
      title: 'Settings Saved',
      description: 'Notification preferences updated successfully',
      variant: 'default'
    })
  }

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('compliance_alerts')
        .update({ is_read: true })
        .eq('id', alertId)

      if (error) {
        console.error('Error marking alert as read:', error)
        return
      }

      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, is_read: true }
            : alert
        )
      )
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('compliance_alerts')
        .update({ 
          resolved_at: new Date().toISOString(),
          resolved_by: userId
        })
        .eq('id', alertId)

      if (error) {
        console.error('Error resolving alert:', error)
        toast({
          title: 'Error',
          description: 'Failed to resolve alert',
          variant: 'destructive'
        })
        return
      }

      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
      
      toast({
        title: 'Alert Resolved',
        description: 'The alert has been marked as resolved',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('compliance_alerts')
        .delete()
        .eq('id', alertId)

      if (error) {
        console.error('Error deleting alert:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete alert',
          variant: 'destructive'
        })
        return
      }

      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
      
      toast({
        title: 'Alert Deleted',
        description: 'The alert has been permanently deleted',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive'
    } as const

    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }

    return (
      <Badge variant={variants[severity as keyof typeof variants]} className={colors[severity as keyof typeof colors]}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    )
  }

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'consent_expiring':
      case 'consent_pending':
        return <FileText className="h-4 w-4" />
      case 'audit_required':
        return <Shield className="h-4 w-4" />
      case 'regulatory_deadline':
        return <Calendar className="h-4 w-4" />
      case 'privacy_breach':
        return <AlertTriangle className="h-4 w-4" />
      case 'system_security':
        return <Shield className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const unreadCount = alerts.filter(alert => !alert.is_read).length
  const criticalCount = alerts.filter(alert => alert.severity === 'critical' && !alert.resolved_at).length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance Alerts & Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Alerts</CardTitle>
            <BellRing className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${criticalCount > 0 ? 'text-red-500' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">
              Need immediate action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              In current filter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Compliance Alerts & Notifications
          </CardTitle>
          <CardDescription>
            Monitor compliance issues, regulatory deadlines, and system alerts in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end mb-4">
            <div className="flex-1">
              <Label htmlFor="severity">Severity</Label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="type">Alert Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="consent_expiring">Consent Expiring</SelectItem>
                  <SelectItem value="consent_pending">Consent Pending</SelectItem>
                  <SelectItem value="audit_required">Audit Required</SelectItem>
                  <SelectItem value="regulatory_deadline">Regulatory Deadline</SelectItem>
                  <SelectItem value="privacy_breach">Privacy Breach</SelectItem>
                  <SelectItem value="system_security">System Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-resolved"
                checked={showResolved}
                onCheckedChange={setShowResolved}
              />
              <Label htmlFor="show-resolved">Show Resolved</Label>
            </div>
            
            {/* Settings Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Notification Settings</DialogTitle>
                  <DialogDescription>
                    Configure how you want to receive compliance alerts and notifications
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <Switch
                        id="email-notifications"
                        checked={settings.email_enabled}
                        onCheckedChange={(checked) => 
                          saveSettings({ ...settings, email_enabled: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <Switch
                        id="push-notifications"
                        checked={settings.push_enabled}
                        onCheckedChange={(checked) => 
                          saveSettings({ ...settings, push_enabled: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <Switch
                        id="sms-notifications"
                        checked={settings.sms_enabled}
                        onCheckedChange={(checked) => 
                          saveSettings({ ...settings, sms_enabled: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="real-time">Real-time Updates</Label>
                      <Switch
                        id="real-time"
                        checked={settings.real_time_enabled}
                        onCheckedChange={(checked) => 
                          saveSettings({ ...settings, real_time_enabled: checked })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="severity-threshold">Minimum Severity</Label>
                    <Select 
                      value={settings.severity_threshold} 
                      onValueChange={(value) => 
                        saveSettings({ ...settings, severity_threshold: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low and above</SelectItem>
                        <SelectItem value="medium">Medium and above</SelectItem>
                        <SelectItem value="high">High and above</SelectItem>
                        <SelectItem value="critical">Critical only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => {}}>Save Settings</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No compliance alerts found. Your system is up to date!
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow 
                    key={alert.id}
                    className={!alert.is_read ? 'bg-blue-50 dark:bg-blue-950/20' : ''}
                  >
                    <TableCell>
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.alert_type)}
                        <div>
                          <div className="font-medium">{alert.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {alert.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {alert.alert_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {formatDate(alert.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!alert.is_read && (
                          <Badge variant="default" className="text-xs">
                            Unread
                          </Badge>
                        )}
                        {alert.resolved_at && (
                          <Badge variant="outline" className="text-xs">
                            Resolved
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!alert.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(alert.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {!alert.resolved_at && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAlert(alert.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}