// Minimal PWA utility stubs to satisfy type-check without pulling complex PWA code

export type OfflineData = { id?: string; type: string; action: string; payload?: unknown };

export const pwaIndexedDB = {
  async init() {/* no-op */},
  async getOfflineData(): Promise<OfflineData[]> {
    return [];
  },
  async cacheData(_key: string, _data: unknown, _ttl?: number) {/* no-op */},
  async getCachedData(_key: string) {
    return null as any;
  },
};

export const pwaOfflineSync = {
  async init() {/* no-op */},
  async sync() {/* no-op */},
  async addOfflineAction(_type: string, _action: string, _data: unknown): Promise<string> {
    return 'stub-id';
  },
};

export const pwaPushManager = {
  async requestPermission(): Promise<NotificationPermission> {
    return Notification.permission;
  },
  async init() {
    return null as any;
  },
  async sendLocalNotification(_title: string, _options?: NotificationOptions) {/* no-op */},
};

export const pwaStatus = {
  isPWAInstalled(): boolean {
    return false;
  },
  subscribe(_event: string, _cb: (value: any) => void) {
    return () => {};
  },
};
