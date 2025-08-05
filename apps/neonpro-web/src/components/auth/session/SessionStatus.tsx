// =====================================================
// SessionStatus Component - Session Information Display
// Story 1.4: Session Management & Security
// =====================================================

'use client'

import React from 'react'
import { useSession, useSessionTimeout, useSecurityMonitoring } from '@/hooks/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Shield, 
  Clock, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface SessionStatusProps {
  className?: string
  showExtendButton?: boolean
  showLogoutButton?: boolean
  showSecurityScore?: boolean
  showTimeRemaining?: boolean
  compact?: boolean
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function SessionStatus({
  className,
  showExtendButton = true,
  showLogoutButton = true,
  showSecurityScore = true,
  showTimeRemaining = true,
  compact = false
}: SessionStatusProps) {
  const { 
    isAuthenticated, 
    user, 
    session, 
    isExpiringSoon,
    extendSession,
    logout
  } = useSession()
  
  const { 
    timeRemainingFormatted 
  } = useSessionTimeout()
  
  const {
    securityScore,
    securityStatus,
    deviceRiskLevel,
    isDeviceTrusted
  } = useSecurityMonitoring()

  if (!isAuthenticated || !session) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">Not authenticated</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getSecurityColor = (status: string) => {
    switch (status) {
      case 'secure': return 'text-green-600'
      case 'moderate': return 'text-yellow-600'
      case 'warning': return 'text-orange-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getSecurityBadgeVariant = (status: string) => {
    switch (status) {
      case 'secure': return 'default'
      case 'moderate': return 'secondary'
      case 'warning': return 'outline'
      case 'critical': return 'destructive'
      default: return 'secondary'
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'high': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-4 p-2 rounded-lg border bg-card', className)}>
        {/* User Info */}
        <div className="flex items-center gap-2">
          <div className={cn(
            'h-2 w-2 rounded-full',
            isAuthenticated ? 'bg-green-500' : 'bg-red-500'
          )} />
          <span className="text-sm font-medium">{user?.email}</span>
        </div>

        {/* Time Remaining */}
        {showTimeRemaining && timeRemainingFormatted && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {timeRemainingFormatted.minutes}m {timeRemainingFormatted.seconds}s
            </span>
          </div>
        )}

        {/* Security Score */}
        {showSecurityScore && (
          <Badge variant={getSecurityBadgeVariant(securityStatus)} className="text-xs">
            {securityScore}%
          </Badge>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto">
          {showExtendButton && isExpiringSoon && (
            <Button
              size="sm"
              variant="outline"
              onClick={extendSession}
              className="h-6 px-2 text-xs"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
          {showLogoutButton && (
            <Button
              size="sm"
              variant="ghost"
              onClick={logout}
              className="h-6 px-2 text-xs"
            >
              <LogOut className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          Session Status
          <Badge 
            variant={getSecurityBadgeVariant(securityStatus)}
            className="ml-auto"
          >
            {securityStatus.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* User Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">User</span>
            <span className="text-sm text-muted-foreground">{user?.email}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Session ID</span>
            <span className="text-xs text-muted-foreground font-mono">
              {session.sessionId.slice(0, 8)}...
            </span>
          </div>
        </div>

        <Separator />

        {/* Time Information */}
        {showTimeRemaining && timeRemainingFormatted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time Remaining
              </span>
              <span className={cn(
                'text-sm font-mono',
                isExpiringSoon ? 'text-orange-600' : 'text-muted-foreground'
              )}>
                {timeRemainingFormatted.minutes}m {timeRemainingFormatted.seconds}s
              </span>
            </div>
            
            {isExpiringSoon && (
              <div className="flex items-center gap-2 p-2 rounded-md bg-orange-50 border border-orange-200">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-800">
                  Session expiring soon
                </span>
              </div>
            )}
          </div>
        )}

        {/* Security Information */}
        {showSecurityScore && (
          <div className="space-y-3">
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Security Score</span>
                <span className={cn('text-sm font-semibold', getSecurityColor(securityStatus))}>
                  {securityScore}%
                </span>
              </div>
              
              <Progress 
                value={securityScore} 
                className="h-2"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Device Trust</span>
              <div className="flex items-center gap-2">
                {isDeviceTrusted ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={cn(
                  'text-sm',
                  isDeviceTrusted ? 'text-green-600' : 'text-red-600'
                )}>
                  {isDeviceTrusted ? 'Trusted' : 'Untrusted'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risk Level</span>
              <span className={cn('text-sm font-medium', getRiskColor(deviceRiskLevel))}>
                {deviceRiskLevel.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Session Activity */}
        <div className="space-y-2">
          <Separator />
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Last Activity
            </span>
            <span className="text-sm text-muted-foreground">
              {session.lastActivity 
                ? new Date(session.lastActivity).toLocaleTimeString()
                : 'No activity'
              }
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Activities Count</span>
            <span className="text-sm text-muted-foreground">
              {session.activitiesCount || 0}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {showExtendButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={extendSession}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Extend Session
            </Button>
          )}
          
          {showLogoutButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex-1"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default SessionStatus
