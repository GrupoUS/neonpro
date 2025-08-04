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