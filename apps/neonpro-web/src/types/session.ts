// Temporary session types for build compatibility
export interface SessionDevice {
  id: string;
  userAgent: string;
  ip: string;
  lastAccessed: string;
}

export interface SessionData {
  userId: string;
  devices: SessionDevice[];
  expiresAt: string;
}
// Temporary session exports
export enum SecurityEventType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  SESSION_EXTEND = 'SESSION_EXTEND',
  DEVICE_REGISTER = 'DEVICE_REGISTER',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY'
}

export enum SecuritySeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}
