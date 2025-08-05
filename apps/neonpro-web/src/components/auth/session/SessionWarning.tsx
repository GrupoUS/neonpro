// =====================================================
// SessionWarning Component - Session Expiration Warnings
// Story 1.4: Session Management & Security
// =====================================================

'use client'

import React, { useState, useEffect } from 'react'
import { useSession, useSessionTimeout } from '@/hooks/auth'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  LogOut,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

// =====================================================
// TYPES & INTERFACES
// =====================================================

export interface SessionWarningProps {
  className?: string
  warningThreshold?: number // minutes before expiration to show warning
  criticalThreshold?: number // minutes before expiration to show critical warning
  autoShow?: boolean
  showAsDialog?: boolean
  showAsAlert?: boolean
  onExtend?: () => void
  onLogout?: () => void
  onDismiss?: () => void
}

type WarningLevel = 'none' | 'warning' | 'critical' | 'expired'

// =====================================================
// MAIN COMPONENT
// =====================================================

export function SessionWarning({
  className,
  warningThreshold = 5, // 5 minutes
  criticalThreshold = 2, // 2 minutes
  autoShow = true,
  showAsDialog = true,
  showAsAlert = false,
  onExtend,
  onLogout,
  onDismiss
}: SessionWarningProps) {
  const { 
    isAuthenticated, 
    isExpiringSoon,
    isExpired,
    extendSession,
    logout
  } = useSession()
  
  const { 
    timeRemainingMinutes,
    timeRemainingFormatted 
  } = useSessionTimeout()

  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [lastWarningLevel, setLastWarningLevel] = useState<WarningLevel>('none')

  // Determine warning level
  const getWarningLevel = (): WarningLevel => {
    if (!isAuthenticated) return 'none'
    if (isExpired) return 'expired'
    if (timeRemainingMinutes <= criticalThreshold) return 'critical'
    if (timeRemainingMinutes <= warningThreshold) return 'warning'
    return 'none'
  }

  const warningLevel = getWarningLevel()

  // Auto-show logic
  useEffect(() => {
    if (!autoShow || !isAuthenticated) return

    const shouldShow = warningLevel !== 'none' && !isDismissed
    
    // Reset dismissal if warning level escalates
    if (warningLevel !== lastWarningLevel && warningLevel !== 'none') {
      setIsDismissed(false)
      setIsVisible(shouldShow)
    } else if (shouldShow && !isVisible) {
      setIsVisible(true)
    }

    setLastWarningLevel(warningLevel)
  }, [warningLevel, isDismissed, autoShow, isAuthenticated, lastWarningLevel, isVisible])

  // Handle actions
  const handleExtend = async () => {
    try {
      await extendSession()
      onExtend?.()
      setIsVisible(false)
      setIsDismissed(false)
    } catch (error) {
      console.error('Failed to extend session:', error)
    }
  }

  const handleLogout = () => {
    logout()
    onLogout?.()
    setIsVisible(false)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    onDismiss?.()
  }

  // Get warning configuration based on level
  const getWarningConfig = (level: WarningLevel) => {
    switch (level) {
      case 'expired':
        return {
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again to continue.',
          variant: 'destructive' as const,
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          showExtend: false,
          showLogout: true
        }
      case 'critical':
        return {
          title: 'Session Expiring Soon',
          description: `Your session will expire in ${timeRemainingFormatted?.minutes || 0} minutes and ${timeRemainingFormatted?.seconds || 0} seconds. Extend now to avoid losing your work.`,
          variant: 'destructive' as const,
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          showExtend: true,
          showLogout: true
        }
      case 'warning':
        return {
          title: 'Session Warning',
          description: `Your session will expire in ${timeRemainingFormatted?.minutes || 0} minutes. Consider extending your session to continue working.`,
          variant: 'default' as const,
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          showExtend: true,
          showLogout: false
        }
      default:
        return null
    }
  }

  const config = getWarningConfig(warningLevel)
  
  if (!config || !isVisible || warningLevel === 'none') {
    return null
  }

  const IconComponent = config.icon
  const progressValue = Math.max(0, (timeRemainingMinutes / warningThreshold) * 100)

  // Dialog variant
  if (showAsDialog) {
    return (
      <Dialog open={isVisible} onOpenChange={(open) => !open && handleDismiss()}>
        <DialogContent className={cn('sm:max-w-md', className)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconComponent className={cn('h-5 w-5', config.color)} />
              {config.title}
              <Badge 
                variant={config.variant}
                className="ml-auto"
              >
                {warningLevel.toUpperCase()}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-left">
              {config.description}
            </DialogDescription>
          </DialogHeader>

          {/* Time Progress */}
          {timeRemainingFormatted && warningLevel !== 'expired' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Time Remaining</span>
                <span className={cn('font-mono', config.color)}>
                  {timeRemainingFormatted.minutes}m {timeRemainingFormatted.seconds}s
                </span>
              </div>
              <Progress 
                value={progressValue} 
                className="h-2"
              />
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {config.showExtend && (
              <Button
                onClick={handleExtend}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Extend Session
              </Button>
            )}
            
            {config.showLogout && (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex-1"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
            
            {warningLevel === 'warning' && (
              <Button
                variant="ghost"
                onClick={handleDismiss}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Dismiss
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Alert variant
  if (showAsAlert) {
    return (
      <Alert 
        variant={config.variant}
        className={cn(
          'relative',
          config.bgColor,
          config.borderColor,
          className
        )}
      >
        <IconComponent className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between">
          {config.title}
          <Badge variant={config.variant} className="ml-2">
            {warningLevel.toUpperCase()}
          </Badge>
        </AlertTitle>
        <AlertDescription className="mt-2">
          {config.description}
        </AlertDescription>
        
        {/* Time Progress */}
        {timeRemainingFormatted && warningLevel !== 'expired' && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Time Remaining</span>
              <span className={cn('font-mono', config.color)}>
                {timeRemainingFormatted.minutes}m {timeRemainingFormatted.seconds}s
              </span>
            </div>
            <Progress 
              value={progressValue} 
              className="h-2"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {config.showExtend && (
            <Button
              size="sm"
              onClick={handleExtend}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Extend
            </Button>
          )}
          
          {config.showLogout && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
          
          {warningLevel === 'warning' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4 mr-2" />
              Dismiss
            </Button>
          )}
        </div>
        
        {/* Close button for alert */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="absolute top-2 right-2 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    )
  }

  return null
}

// =====================================================
// EXPORT DEFAULT
// =====================================================

export default SessionWarning
