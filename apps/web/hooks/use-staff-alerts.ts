'use client'

import { useEffect, useState, } from 'react'

export interface StaffAlert {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'scheduling' | 'patient' | 'system' | 'compliance' | 'emergency'
  staffId?: string
  departmentId?: string
  createdAt: Date
  readAt?: Date
  acknowledgedAt?: Date
  resolvedAt?: Date
  actions?: StaffAlertAction[]
  metadata?: Record<string, unknown>
}

export interface StaffAlertAction {
  id: string
  label: string
  type: 'button' | 'link' | 'navigation'
  action: string
  variant?: 'primary' | 'secondary' | 'destructive'
}

export function useStaffAlerts() {
  const [alerts, setAlerts,] = useState<StaffAlert[]>([],)
  const [unreadCount, setUnreadCount,] = useState(0,)
  const [isLoading, setIsLoading,] = useState(true,)

  useEffect(() => {
    // Mock data
    const mockAlerts: StaffAlert[] = [
      {
        id: '1',
        title: 'Emergency Alert',
        message: 'Patient in room 205 requires immediate attention',
        type: 'error',
        priority: 'urgent',
        category: 'emergency',
        createdAt: new Date(),
        actions: [
          {
            id: '1',
            label: 'View Patient',
            type: 'navigation',
            action: '/patients/205',
            variant: 'primary',
          },
        ],
      },
      {
        id: '2',
        title: 'Schedule Conflict',
        message: 'Dr. Smith has overlapping appointments',
        type: 'warning',
        priority: 'high',
        category: 'scheduling',
        createdAt: new Date(),
      },
    ]

    setAlerts(mockAlerts,)
    setUnreadCount(mockAlerts.filter(a => !a.readAt).length,)
    setIsLoading(false,)
  }, [],)

  const markAsRead = (alertId: string,) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? { ...alert, readAt: new Date(), }
          : alert
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1,))
  }

  const acknowledge = (alertId: string,) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? { ...alert, acknowledgedAt: new Date(), }
          : alert
      )
    )
  }

  const resolve = (alertId: string,) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId
          ? { ...alert, resolvedAt: new Date(), }
          : alert
      )
    )
  }

  const dismiss = (alertId: string,) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }

  return {
    alerts,
    unreadCount,
    isLoading,
    markAsRead,
    acknowledge,
    resolve,
    dismiss,
  }
}
