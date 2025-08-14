// Component Types
// Story 1.4: Session Management & Security Implementation

import type { SecurityEventType } from '../types';

// SessionStatus Component Props
export interface SessionStatusProps {
  className?: string;
  showTimeRemaining?: boolean;
  showSecurityStatus?: boolean;
  showExtendButton?: boolean;
  compact?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// SecurityAlerts Component Props
export interface SecurityAlertsProps {
  className?: string;
  maxAlerts?: number;
  showDismissed?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  filterByType?: SecurityEventType[];
  showFilters?: boolean;
  compact?: boolean;
}

// DeviceManager Component Props
export interface DeviceManagerProps {
  className?: string;
  showCurrentDevice?: boolean;
  allowDeviceActions?: boolean;
  compact?: boolean;
}

// SessionMetrics Component Props
export interface SessionMetricsProps {
  className?: string;
  timeRange?: '1h' | '24h' | '7d' | '30d';
  showExport?: boolean;
  compact?: boolean;
}

// Common Component Props
export interface BaseComponentProps {
  className?: string;
  compact?: boolean;
}

// Alert Severity Levels
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

// Component State Types
export interface ComponentLoadingState {
  isLoading: boolean;
  error?: string;
}

export interface ComponentRefreshState {
  lastRefresh: Date;
  autoRefresh: boolean;
  refreshInterval: number;
}
