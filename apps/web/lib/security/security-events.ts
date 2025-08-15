// lib/security/security-events.ts
export interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  description: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export function logSecurityEvent(
  event: Omit<SecurityEvent, 'id' | 'timestamp'>
) {
  console.log('Security Event:', event);
  return {
    id: Math.random().toString(36),
    timestamp: new Date(),
    ...event,
  };
}

export function getSecurityEvents() {
  return [];
}
