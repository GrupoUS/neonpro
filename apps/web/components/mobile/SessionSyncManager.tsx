'use client'

/**
 * Session Sync Manager Component
 * T3.3: Cross-Device Continuity e QR Handoff System
 *
 * Real-time session synchronization across multiple devices
 * Features:
 * - Real-time sync status indicators
 * - Active device tracking
 * - Conflict detection and resolution
 * - Bandwidth-aware synchronization
 * - Visual sync progress indicators
 * - LGPD compliant session management
 */

import { Alert, AlertDescription, } from '@/components/ui/alert'
import { Badge, } from '@/components/ui/badge'
import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, } from '@/components/ui/card'
// import { Progress } from "@/components/ui/progress"; // Unused import
import { Separator, } from '@/components/ui/separator'
import { supabase, } from '@/lib/supabase'
import { cn, } from '@/lib/utils'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cloud,
  CloudOff,
  Eye,
  EyeOff,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
  Users,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState, } from 'react'

// Types
interface DeviceSession {
  id: string
  deviceType: 'mobile' | 'tablet' | 'desktop'
  deviceFingerprint: Record<string, unknown>
  lastActive: number
  isCurrentDevice: boolean
  syncStatus: 'synced' | 'syncing' | 'conflict' | 'offline'
  conflictCount: number
  location?: string
}

interface SyncActivity {
  id: string
  action: string
  deviceId: string
  timestamp: number
  status: 'pending' | 'completed' | 'failed'
  progress?: number
}

interface SyncStats {
  totalDevices: number
  activeDevices: number
  syncedDevices: number
  conflictingDevices: number
  lastSyncTime: number
  networkQuality: 'excellent' | 'good' | 'poor' | 'offline'
  dataTransferred: number
  averageLatency: number
}

export interface SessionSyncManagerProps {
  className?: string
  emergencyMode?: boolean
  userId?: string
  onSyncStatusChange?: (status: SyncStats,) => void
  onConflictDetected?: (conflicts: Record<string, unknown>[],) => void
  realTimeEnabled?: boolean
}

// Network Quality Hook
const useNetworkQuality = () => {
  const [quality, setQuality,] = useState<'excellent' | 'good' | 'poor' | 'offline'>('excellent',)
  const [latency, setLatency,] = useState(0,)

  useEffect(() => {
    const measureLatency = async () => {
      try {
        const start = performance.now()
        await fetch('/api/ping', { method: 'HEAD', },)
        const end = performance.now()
        const pingTime = end - start
        setLatency(pingTime,)

        if (pingTime < 100) setQuality('excellent',)
        else if (pingTime < 300) setQuality('good',)
        else setQuality('poor',)
      } catch {
        setQuality('offline',)
      }
    }

    measureLatency()
    const interval = setInterval(measureLatency, 10_000,) // Check every 10 seconds

    return () => clearInterval(interval,)
  }, [],)

  return { quality, latency, }
}

// Real-time Sync Hook
const useRealTimeSync = (userId: string, enabled: boolean = true,) => {
  const [devices, setDevices,] = useState<DeviceSession[]>([],)
  const [activities, setActivities,] = useState<SyncActivity[]>([],)
  const [stats, setStats,] = useState<SyncStats>({
    totalDevices: 0,
    activeDevices: 0,
    syncedDevices: 0,
    conflictingDevices: 0,
    lastSyncTime: Date.now(),
    networkQuality: 'excellent',
    dataTransferred: 0,
    averageLatency: 0,
  },)

  const supabase = createClient()
  const channelRef = useRef<any>(null,)

  // Initialize real-time subscription
  useEffect(() => {
    if (!enabled || !userId) return

    const setupRealTimeSync = async () => {
      // Subscribe to session changes
      channelRef.current = supabase
        .channel(`session-sync-${userId}`,)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_sessions',
          filter: `user_id=eq.${userId}`,
        }, (payload,) => {
          handleSessionChange(payload,)
        },)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'sync_activities',
          filter: `user_id=eq.${userId}`,
        }, (payload,) => {
          handleActivityChange(payload,)
        },)
        .subscribe()

      // Initial data fetch
      await fetchSessionData()
    }

    setupRealTimeSync()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current,)
      }
    }
  }, [userId, enabled, supabase,],)

  const fetchSessionData = useCallback(async () => {
    try {
      // Fetch active sessions
      const { data: sessions, } = await supabase
        .from('user_sessions',)
        .select('*',)
        .eq('user_id', userId,)
        .gte('last_active', new Date(Date.now() - 24 * 60 * 60 * 1000,).toISOString(),)

      if (sessions) {
        const deviceSessions: DeviceSession[] = (sessions || []).map((session: any,) => ({
          id: session.id,
          deviceType: session.device_type,
          deviceFingerprint: session.device_fingerprint,
          lastActive: new Date(session.last_active,).getTime(),
          isCurrentDevice: session.is_current,
          syncStatus: session.sync_status,
          conflictCount: session.conflict_count || 0,
          location: session.location,
        }))

        setDevices(deviceSessions,)
        updateStats(deviceSessions,)
      }

      // Fetch recent activities
      const { data: recentActivities, } = await supabase
        .from('sync_activities',)
        .select('*',)
        .eq('user_id', userId,)
        .order('created_at', { ascending: false, },)
        .limit(20,)

      if (recentActivities) {
        const syncActivities: SyncActivity[] = (recentActivities || []).map((activity: any,) => ({
          id: activity.id,
          action: activity.action,
          deviceId: activity.device_id,
          timestamp: new Date(activity.created_at,).getTime(),
          status: activity.status,
          progress: activity.progress,
        }))

        setActivities(syncActivities,)
      }
    } catch (error) {
      console.error('Error fetching session data:', error,)
    }
  }, [userId, supabase,],)

  const handleSessionChange = (payload: Record<string, unknown>,) => {
    const { eventType, new: newRecord, old: oldRecord, } = payload
    const newRecordTyped = newRecord as any
    const oldRecordTyped = oldRecord as any

    setDevices(prev => {
      switch (eventType) {
        case 'INSERT':
          return [...prev, {
            id: newRecordTyped.id,
            deviceType: newRecordTyped.device_type,
            deviceFingerprint: newRecordTyped.device_fingerprint,
            lastActive: new Date(newRecordTyped.last_active,).getTime(),
            isCurrentDevice: newRecordTyped.is_current,
            syncStatus: newRecordTyped.sync_status,
            conflictCount: newRecordTyped.conflict_count || 0,
            location: newRecordTyped.location,
          },]
        case 'UPDATE':
          return prev.map(device =>
            device.id === newRecordTyped.id
              ? {
                ...device,
                lastActive: new Date(newRecordTyped.last_active,).getTime(),
                syncStatus: newRecordTyped.sync_status,
                conflictCount: newRecordTyped.conflict_count || 0,
              }
              : device
          )
        case 'DELETE':
          return prev.filter(device => device.id !== oldRecordTyped.id)
        default:
          return prev
      }
    },)
  }

  const handleActivityChange = (payload: Record<string, unknown>,) => {
    const { eventType, new: newRecord, } = payload
    const newRecordTyped = newRecord as any

    if (eventType === 'INSERT') {
      setActivities(prev => [{
        id: newRecordTyped.id,
        action: newRecordTyped.action,
        deviceId: newRecordTyped.device_id,
        timestamp: new Date(newRecordTyped.created_at,).getTime(),
        status: newRecordTyped.status,
        progress: newRecordTyped.progress,
      }, ...prev.slice(0, 19,),])
    }
  }

  const updateStats = (deviceSessions: DeviceSession[],) => {
    const now = Date.now()
    const activeThreshold = 5 * 60 * 1000 // 5 minutes

    const activeDevices = deviceSessions.filter(d => now - d.lastActive < activeThreshold).length

    const syncedDevices = deviceSessions.filter(d => d.syncStatus === 'synced').length

    const conflictingDevices = deviceSessions.filter(d => d.syncStatus === 'conflict').length

    setStats(prev => ({
      ...prev,
      totalDevices: deviceSessions.length,
      activeDevices,
      syncedDevices,
      conflictingDevices,
      lastSyncTime: Math.max(...deviceSessions.map(d => d.lastActive),),
    }))
  }

  return {
    devices,
    activities,
    stats,
    refreshData: fetchSessionData,
  }
}

export default function SessionSyncManager({
  className,
  emergencyMode = false,
  userId = '',
  onSyncStatusChange,
  onConflictDetected,
  realTimeEnabled = true,
}: SessionSyncManagerProps,) {
  const [isExpanded, setIsExpanded,] = useState(false,)
  const { quality: networkQuality, latency, } = useNetworkQuality()
  const { devices, activities, stats, refreshData, } = useRealTimeSync(userId, realTimeEnabled,)

  // Notify parent components of sync status changes
  useEffect(() => {
    onSyncStatusChange?.({
      ...stats,
      networkQuality,
      averageLatency: latency,
    },)
  }, [stats, networkQuality, latency, onSyncStatusChange,],)

  // Notify parent of conflicts
  useEffect(() => {
    const conflicts = devices.filter(d => d.syncStatus === 'conflict')
    if (conflicts.length > 0) {
      onConflictDetected?.(conflicts as any,)
    }
  }, [devices, onConflictDetected,],)

  // Get device icon
  const getDeviceIcon = (type: string, size = 'h-4 w-4',) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className={size} />
      case 'tablet':
        return <Tablet className={size} />
      default:
        return <Monitor className={size} />
    }
  }

  // Get sync status color and icon
  const getSyncStatusDisplay = (status: string,) => {
    switch (status) {
      case 'synced':
        return {
          color: 'text-green-600',
          icon: <CheckCircle className="h-4 w-4" />,
          bg: 'bg-green-50',
        }
      case 'syncing':
        return {
          color: 'text-blue-600',
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          bg: 'bg-blue-50',
        }
      case 'conflict':
        return {
          color: 'text-amber-600',
          icon: <AlertTriangle className="h-4 w-4" />,
          bg: 'bg-amber-50',
        }
      case 'offline':
        return { color: 'text-gray-600', icon: <CloudOff className="h-4 w-4" />, bg: 'bg-gray-50', }
      default:
        return { color: 'text-gray-600', icon: <Cloud className="h-4 w-4" />, bg: 'bg-gray-50', }
    }
  }

  // Format time ago
  const formatTimeAgo = (timestamp: number,): string => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / (1000 * 60),)
    const hours = Math.floor(minutes / 60,)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24,)}d ago`
  }

  const currentDevice = devices.find(d => d.isCurrentDevice)

  return (
    <Card
      className={cn(
        'w-full',
        emergencyMode && 'border-2 border-blue-500 shadow-lg',
        className,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4" />
            Session Sync
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={networkQuality === 'excellent' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {networkQuality === 'offline'
                ? <WifiOff className="h-3 w-3" />
                : <Wifi className="h-3 w-3" />}
              <span className="ml-1">{latency}ms</span>
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded,)}
            >
              {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{stats.activeDevices}/{stats.totalDevices} active</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>{stats.syncedDevices} synced</span>
          </div>
        </div>

        {/* Current Device */}
        {currentDevice && (
          <div
            className={cn(
              'p-2 rounded-lg border-2 border-dashed',
              getSyncStatusDisplay(currentDevice.syncStatus,).bg,
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getDeviceIcon(currentDevice.deviceType,)}
                <span className="text-sm font-medium">This Device</span>
              </div>
              <div className="flex items-center gap-1">
                {getSyncStatusDisplay(currentDevice.syncStatus,).icon}
                <span
                  className={cn('text-xs', getSyncStatusDisplay(currentDevice.syncStatus,).color,)}
                >
                  {currentDevice.syncStatus}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Conflicts Alert */}
        {stats.conflictingDevices > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {stats.conflictingDevices} device{stats.conflictingDevices > 1 ? 's have' : ' has'}
              {' '}
              sync conflicts that need resolution.
            </AlertDescription>
          </Alert>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <>
            <Separator />

            {/* All Devices */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Connected Devices
              </h4>

              {devices.length === 0
                ? <p className="text-sm text-muted-foreground">No active devices</p>
                : (
                  <div className="space-y-2">
                    {devices.map((device,) => {
                      const statusDisplay = getSyncStatusDisplay(device.syncStatus,)
                      return (
                        <div
                          key={device.id}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                        >
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(device.deviceType,)}
                            <div>
                              <div className="text-sm font-medium">
                                {device.deviceType}
                                {device.isCurrentDevice && ' (Current)'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatTimeAgo(device.lastActive,)}
                                {device.location && ` • ${device.location}`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {device.conflictCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {device.conflictCount} conflicts
                              </Badge>
                            )}
                            <div className="flex items-center gap-1">
                              {statusDisplay.icon}
                              <span className={cn('text-xs', statusDisplay.color,)}>
                                {device.syncStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    },)}
                  </div>
                )}
            </div>

            {/* Recent Activities */}
            {activities.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Activity
                  </h4>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {activities.slice(0, 5,).map((activity,) => (
                      <div key={activity.id} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate flex-1">
                          {activity.action}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {formatTimeAgo(activity.timestamp,)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Refresh Button */}
        <Button
          onClick={refreshData}
          variant="outline"
          size="sm"
          className="w-full"
          disabled={networkQuality === 'offline'}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Sync Status
        </Button>
      </CardContent>
    </Card>
  )
}
