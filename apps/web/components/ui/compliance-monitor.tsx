'use client'

import React from 'react'

export interface ComplianceItem {
  id: string
  category: 'lgpd' | 'anvisa' | 'cfm' | 'data_protection'
  title: string
  description: string
  status: 'compliant' | 'warning' | 'violation' | 'pending'
  priority: 'high' | 'medium' | 'low'
  lastChecked: Date
  nextReview: Date
  affectedRecords?: number
  actions?: string[]
}

export interface DataProcessingActivity {
  id: string
  activity: string
  personalData: string[]
  legalBasis: string
  recipients: string[]
  retentionPeriod: string
  lastAudit: Date
  status: 'active' | 'suspended' | 'under_review'
}

export interface ComplianceMonitorProps {
  userRole: 'Admin' | 'Professional' | 'Assistant' | 'Coordinator'
  onExportReport?: () => void
  onRefreshData?: () => void
  onViewDetails?: (itemId: string,) => void
  className?: string
}

export function ComplianceMonitor({ className, }: ComplianceMonitorProps,) {
  return (
    <div className={className}>
      Compliance Monitor is temporarily unavailable. This placeholder restores build while we fix
      the original component markup.
    </div>
  )
}
