// =====================================================
// SecurityDashboard Component - Security Monitoring
// Story 1.4: Session Management & Security
// =====================================================

'use client'

import React, { useState, useEffect } from 'react'
import { useSecurityMonitoring } from '@/hooks/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck,
  AlertTriangle, 
  Activity, 
  Eye,
  Clock,
  MapPin,
  Smartphone,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface SecurityDashboardProps {
  className?: string
  showDetailedEvents?: boolean
  maxEvents?: number
  autoRefresh?: boolean
  refreshInterval?: number // in seconds
}

interface SecurityEvent {
  id: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  timestamp: string
  ipAddress?: string
  location?: string
  deviceInfo?: string
  resolved: boolean
  metadata?: Record<string, any>
}

interface SecurityMetrics {
  totalEvents: number
  criticalEvents: number
  resolvedEvents: number
  activeThreats: number
  securityScore: number
  riskTrend: 'up' | 'down' | 'stable'
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function SecurityDashboard({
  className,
  showDetailedEvents = true,
  maxEvents = 10,
  autoRefresh = true,
  refreshInterval = 30
}: SecurityDashboardProps) {
  const {
    securityScore,
    securityStatus,
    deviceRiskLevel,
    isDeviceTrusted,
    securityEvents,
    refreshSecurityData
  } = useSecurityMonitoring()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')

  // Mock security metrics (in real implementation, this would come from the hook)
  const [metrics] = useState<SecurityMetrics>({
    totalEvents: securityEvents?.length || 0,
    criticalEvents: securityEvents?.filter(e => e.severity === 'critical').length || 0,
    resolvedEvents: securityEvents?.filter(e => e.resolved).length || 0,
    activeThreats: securityEvents?.filter(e => !e.resolved && e.severity === 'high').length || 0,
    securityScore: securityScore || 85,
    riskTrend: 'stable'
  })

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refreshSecurityData()
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refreshSecurityData])

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshSecurityData()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Get security status color
  const getSecurityColor = (status: string) => {
    switch (status) {
      case 'secure': return 'text-green-600'
      case 'moderate': return 'text-yellow-600'
      case 'warning': return 'text-orange-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Get security badge variant
  const getSecurityBadgeVariant = (status: string) => {
    switch (status) {
      case 'secure': return 'default'
      case 'moderate': return 'secondary'
      case 'warning': return 'outline'
      case 'critical': return 'destructive'
      default: return 'secondary'
    }
  }

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-orange-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Get severity badge variant
  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'low': return 'outline'
      case 'medium': return 'secondary'
      case 'high': return 'outline'
      case 'critical': return 'destructive'
      default: return 'outline'
    }
  }

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp
      case 'down': return TrendingDown
      default: return Minus
    }
  }

  // Get trend color
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-600'
      case 'down': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Security Dashboard</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Security Status Alert */}
      {securityStatus !== 'secure' && (
        <Alert variant={securityStatus === 'critical' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security Alert</AlertTitle>
          <AlertDescription>
            Your security status is currently <strong>{securityStatus}</strong>. 
            {securityStatus === 'critical' && 'Immediate attention required.'}
            {securityStatus === 'warning' && 'Please review security recommendations.'}
            {securityStatus === 'moderate' && 'Consider improving your security settings.'}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Security Score */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Security Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{securityScore}%</div>
                  <Progress value={securityScore} className="h-2" />
                  <Badge 
                    variant={getSecurityBadgeVariant(securityStatus)}
                    className="text-xs"
                  >
                    {securityStatus.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Active Threats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  Active Threats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-red-600">
                    {metrics.activeThreats}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {React.createElement(getTrendIcon(metrics.riskTrend), {
                      className: cn('h-3 w-3', getTrendColor(metrics.riskTrend))
                    })}
                    <span>Risk trend</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Device Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Device Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isDeviceTrusted ? (
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                    ) : (
                      <ShieldAlert className="h-4 w-4 text-orange-600" />
                    )}
                    <span className="text-sm font-medium">
                      {isDeviceTrusted ? 'Trusted' : 'Untrusted'}
                    </span>
                  </div>
                  <Badge 
                    variant={deviceRiskLevel === 'low' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {deviceRiskLevel.toUpperCase()} RISK
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Total Events */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Total Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{metrics.totalEvents}</div>
                  <div className="text-xs text-muted-foreground">
                    {metrics.resolvedEvents} resolved
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events Summary */}
          {securityEvents && securityEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <AlertTriangle className={cn(
                        'h-4 w-4 mt-0.5',
                        getSeverityColor(event.severity)
                      )} />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{event.type}</span>
                          <Badge 
                            variant={getSeverityBadgeVariant(event.severity)}
                            className="text-xs"
                          >
                            {event.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Security Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Security Events</span>
                <Badge variant="outline">
                  {securityEvents?.length || 0} events
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {securityEvents && securityEvents.length > 0 ? (
                <div className="space-y-3">
                  {securityEvents.slice(0, maxEvents).map((event) => (
                    <div 
                      key={event.id} 
                      className={cn(
                        'p-4 rounded-lg border transition-colors',
                        event.resolved ? 'bg-muted/30' : 'bg-card'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={cn(
                            'h-4 w-4 mt-0.5',
                            getSeverityColor(event.severity)
                          )} />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{event.type}</span>
                              {event.resolved && (
                                <Badge variant="outline" className="text-xs">
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {event.description}
                            </p>
                            {showDetailedEvents && (
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                                </div>
                                {event.ipAddress && (
                                  <span>IP: {event.ipAddress}</span>
                                )}
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                                {event.deviceInfo && (
                                  <span>Device: {event.deviceInfo}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant={getSeverityBadgeVariant(event.severity)}
                          className="text-xs"
                        >
                          {event.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No security events recorded</p>
                  <p className="text-sm">Your account security is being monitored</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Events</span>
                  <span className="text-sm">{metrics.totalEvents}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Critical Events</span>
                  <span className="text-sm text-red-600">{metrics.criticalEvents}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Resolved Events</span>
                  <span className="text-sm text-green-600">{metrics.resolvedEvents}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Threats</span>
                  <span className="text-sm text-orange-600">{metrics.activeThreats}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Device Trust</span>
                    <span>{isDeviceTrusted ? '100%' : '60%'}</span>
                  </div>
                  <Progress value={isDeviceTrusted ? 100 : 60} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Session Security</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Activity Patterns</span>
                    <span>90%</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Risk Assessment</span>
                    <span>{deviceRiskLevel === 'low' ? '95%' : deviceRiskLevel === 'medium' ? '70%' : '40%'}</span>
                  </div>
                  <Progress 
                    value={deviceRiskLevel === 'low' ? 95 : deviceRiskLevel === 'medium' ? 70 : 40} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default SecurityDashboard