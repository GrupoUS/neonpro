// Session Preservation System
// Maintains session state during reconnections and network failures

import type { UserSession, UserDevice } from "@/types/session";
import type { SessionConfig } from "@/lib/auth/config/session-config";
import type { SessionUtils } from "@/lib/auth/utils/session-utils";

export interface SessionSnapshot {
  id: string;
  sessionId: string;
  userId: string;
  deviceId: string;
  timestamp: number;
  state: SessionState;
  metadata: SessionMetadata;
  checksum: string;
  version: number;
}

export interface SessionState {
  authentication: AuthenticationState;
  preferences: UserPreferences;
  navigation: NavigationState;
  forms: FormState[];
  cache: CacheState;
  permissions: PermissionState;
  activity: ActivityState;
}

export interface AuthenticationState {
  isAuthenticated: boolean;
  tokenExpiry: number;
  refreshTokenExpiry: number;
  lastActivity: number;
  mfaStatus: MFAStatus;
  roles: string[];
  permissions: string[];
}

export interface UserPreferences {
  theme: string;
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}

export interface NavigationState {
  currentPath: string;
  history: string[];
  breadcrumbs: Breadcrumb[];
  tabs: TabState[];
  modals: ModalState[];
}

export interface FormState {
  formId: string;
  fields: Record<string, any>;
  isDirty: boolean;
  isValid: boolean;
  errors: Record<string, string>;
  lastModified: number;
}

export interface CacheState {
  data: Record<string, CachedItem>;
  size: number;
  lastCleanup: number;
}

export interface CachedItem {
  key: string;
  value: any;
  timestamp: number;
  expiry: number;
  size: number;
}

export interface PermissionState {
  granted: string[];
  denied: string[];
  pending: string[];
  lastUpdated: number;
}

export interface ActivityState {
  actions: UserAction[];
  metrics: ActivityMetrics;
  patterns: BehaviorPattern[];
}

export interface UserAction {
  id: string;
  type: ActionType;
  target: string;
  data: any;
  timestamp: number;
  duration?: number;
}

export type ActionType =
  | "click"
  | "navigation"
  | "form_input"
  | "api_call"
  | "file_upload"
  | "download"
  | "search"
  | "filter"
  | "sort"
  | "export";

export interface ActivityMetrics {
  totalActions: number;
  sessionDuration: number;
  idleTime: number;
  activeTime: number;
  pageViews: number;
  apiCalls: number;
}

export interface BehaviorPattern {
  type: PatternType;
  frequency: number;
  lastOccurrence: number;
  confidence: number;
}

export type PatternType =
  | "frequent_navigation"
  | "form_abandonment"
  | "rapid_clicking"
  | "long_idle"
  | "api_heavy_usage"
  | "error_prone";

export interface SessionMetadata {
  device: DeviceInfo;
  network: NetworkInfo;
  browser: BrowserInfo;
  location: LocationInfo;
  performance: PerformanceInfo;
}

export interface DeviceInfo {
  type: string;
  os: string;
  screen: ScreenInfo;
  memory: number;
  storage: StorageInfo;
}

export interface NetworkInfo {
  type: string;
  speed: number;
  latency: number;
  isOnline: boolean;
  lastOnline: number;
}

export interface BrowserInfo {
  name: string;
  version: string;
  userAgent: string;
  language: string;
  cookiesEnabled: boolean;
  localStorageEnabled: boolean;
}

export interface LocationInfo {
  country: string;
  region: string;
  city: string;
  timezone: string;
  coordinates?: GeolocationCoordinates;
}

export interface PerformanceInfo {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkUsage: number;
}

export interface ScreenInfo {
  width: number;
  height: number;
  pixelRatio: number;
  orientation: string;
}

export interface StorageInfo {
  available: number;
  used: number;
  quota: number;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  frequency: string;
}

export interface PrivacySettings {
  analytics: boolean;
  cookies: boolean;
  tracking: boolean;
  dataSharing: boolean;
}

export interface AccessibilitySettings {
  fontSize: number;
  contrast: string;
  animations: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

export interface MFAStatus {
  enabled: boolean;
  methods: string[];
  lastVerified: number;
  required: boolean;
}

export interface Breadcrumb {
  label: string;
  path: string;
  timestamp: number;
}

export interface TabState {
  id: string;
  title: string;
  path: string;
  isActive: boolean;
  isDirty: boolean;
  data: any;
}

export interface ModalState {
  id: string;
  type: string;
  isOpen: boolean;
  data: any;
  zIndex: number;
}

export interface PreservationConfig {
  snapshotInterval: number;
  maxSnapshots: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  storageType: StorageType;
  retentionPeriod: number;
  autoRestore: boolean;
  conflictResolution: ConflictResolution;
}

export type StorageType = "localStorage" | "indexedDB" | "sessionStorage" | "memory";
export type ConflictResolution = "local" | "server" | "merge" | "prompt";

export class SessionPreservationManager {
  private config: SessionConfig;
  private utils: SessionUtils;
  private preservationConfig: PreservationConfig;
  private snapshots: Map<string, SessionSnapshot[]> = new Map();
  private currentState: Map<string, SessionState> = new Map();
  private snapshotInterval: NodeJS.Timeout | null = null;
  private storageQuota: number = 50 * 1024 * 1024; // 50MB
  private compressionRatio: number = 0.3;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config?: Partial<PreservationConfig>) {
    this.config = SessionConfig.getInstance();
    this.utils = new SessionUtils();

    this.preservationConfig = {
      snapshotInterval: 30000, // 30 seconds
      maxSnapshots: 10,
      compressionEnabled: true,
      encryptionEnabled: true,
      storageType: "indexedDB",
      retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
      autoRestore: true,
      conflictResolution: "merge",
      ...config,
    };
  }

  /**
   * Initialize preservation manager
   */
  public async initialize(): Promise<void> {
    try {
      // Initialize storage
      await this.initializeStorage();

      // Load existing snapshots
      await this.loadSnapshots();

      // Start automatic snapshots
      this.startAutomaticSnapshots();

      // Setup event listeners
      this.setupEventListeners();

      // Cleanup old snapshots
      await this.cleanupOldSnapshots();

      console.log("Session preservation manager initialized");
      this.emit("preservation_initialized", {});
    } catch (error) {
      console.error("Error initializing session preservation:", error);
      throw error;
    }
  }

  /**
   * Create session snapshot
   */
  public async createSnapshot(
    sessionId: string,
    userId: string,
    deviceId: string,
  ): Promise<SessionSnapshot> {
    try {
      const state = await this.captureSessionState(sessionId);
      const metadata = await this.captureSessionMetadata();

      const snapshot: SessionSnapshot = {
        id: this.utils.generateSessionToken(),
        sessionId,
        userId,
        deviceId,
        timestamp: Date.now(),
        state,
        metadata,
        checksum: this.calculateChecksum(state),
        version: this.getNextVersion(sessionId),
      };

      // Store snapshot
      await this.storeSnapshot(snapshot);

      // Update current state
      this.currentState.set(sessionId, state);

      this.emit("snapshot_created", snapshot);
      return snapshot;
    } catch (error) {
      console.error("Error creating session snapshot:", error);
      throw error;
    }
  }

  /**
   * Restore session from snapshot
   */
  public async restoreSession(
    sessionId: string,
    snapshotId?: string,
  ): Promise<SessionState | null> {
    try {
      const snapshot = snapshotId
        ? await this.getSnapshot(sessionId, snapshotId)
        : await this.getLatestSnapshot(sessionId);

      if (!snapshot) {
        console.warn(`No snapshot found for session ${sessionId}`);
        return null;
      }

      // Verify snapshot integrity
      if (!this.verifySnapshot(snapshot)) {
        console.error("Snapshot integrity check failed");
        return null;
      }

      // Restore session state
      await this.applySessionState(sessionId, snapshot.state);

      // Update current state
      this.currentState.set(sessionId, snapshot.state);

      this.emit("session_restored", { sessionId, snapshot });
      return snapshot.state;
    } catch (error) {
      console.error("Error restoring session:", error);
      return null;
    }
  }

  /**
   * Capture current session state
   */
  private async captureSessionState(sessionId: string): Promise<SessionState> {
    const [auth, prefs, nav, forms, cache, perms, activity] = await Promise.all([
      this.captureAuthenticationState(sessionId),
      this.captureUserPreferences(sessionId),
      this.captureNavigationState(),
      this.captureFormStates(),
      this.captureCacheState(),
      this.capturePermissionState(sessionId),
      this.captureActivityState(sessionId),
    ]);

    return {
      authentication: auth,
      preferences: prefs,
      navigation: nav,
      forms,
      cache,
      permissions: perms,
      activity,
    };
  }

  /**
   * Capture authentication state
   */
  private async captureAuthenticationState(sessionId: string): Promise<AuthenticationState> {
    try {
      const response = await fetch(`/api/session/${sessionId}/auth-state`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Error capturing auth state:", error);
    }

    return {
      isAuthenticated: false,
      tokenExpiry: 0,
      refreshTokenExpiry: 0,
      lastActivity: Date.now(),
      mfaStatus: { enabled: false, methods: [], lastVerified: 0, required: false },
      roles: [],
      permissions: [],
    };
  }

  /**
   * Capture user preferences
   */
  private async captureUserPreferences(sessionId: string): Promise<UserPreferences> {
    try {
      const response = await fetch(`/api/session/${sessionId}/preferences`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Error capturing preferences:", error);
    }

    return {
      theme: "light",
      language: "en",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notifications: {
        email: true,
        push: true,
        sms: false,
        inApp: true,
        frequency: "immediate",
      },
      privacy: {
        analytics: true,
        cookies: true,
        tracking: false,
        dataSharing: false,
      },
      accessibility: {
        fontSize: 14,
        contrast: "normal",
        animations: true,
        screenReader: false,
        keyboardNavigation: false,
      },
    };
  }

  /**
   * Capture navigation state
   */
  private captureNavigationState(): NavigationState {
    return {
      currentPath: window.location.pathname,
      history: this.getNavigationHistory(),
      breadcrumbs: this.getBreadcrumbs(),
      tabs: this.getTabStates(),
      modals: this.getModalStates(),
    };
  }

  /**
   * Capture form states
   */
  private captureFormStates(): FormState[] {
    const forms: FormState[] = [];
    const formElements = document.querySelectorAll("form[data-preserve]");

    formElements.forEach((form) => {
      const formId = form.getAttribute("data-preserve") || form.id;
      if (formId) {
        const formData = new FormData(form as HTMLFormElement);
        const fields: Record<string, any> = {};

        formData.forEach((value, key) => {
          fields[key] = value;
        });

        forms.push({
          formId,
          fields,
          isDirty: form.classList.contains("dirty"),
          isValid: form.classList.contains("valid"),
          errors: this.getFormErrors(form),
          lastModified: Date.now(),
        });
      }
    });

    return forms;
  }

  /**
   * Capture cache state
   */
  private captureCacheState(): CacheState {
    const cache: Record<string, CachedItem> = {};
    let totalSize = 0;

    // Capture localStorage items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("neonpro_cache_")) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || "{}");
          cache[key] = item;
          totalSize += JSON.stringify(item).length;
        } catch (error) {
          console.warn(`Error parsing cached item ${key}:`, error);
        }
      }
    }

    return {
      data: cache,
      size: totalSize,
      lastCleanup: Date.now(),
    };
  }

  /**
   * Capture permission state
   */
  private async capturePermissionState(sessionId: string): Promise<PermissionState> {
    try {
      const response = await fetch(`/api/session/${sessionId}/permissions`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Error capturing permissions:", error);
    }

    return {
      granted: [],
      denied: [],
      pending: [],
      lastUpdated: Date.now(),
    };
  }

  /**
   * Capture activity state
   */
  private async captureActivityState(sessionId: string): Promise<ActivityState> {
    try {
      const response = await fetch(`/api/session/${sessionId}/activity`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Error capturing activity:", error);
    }

    return {
      actions: [],
      metrics: {
        totalActions: 0,
        sessionDuration: 0,
        idleTime: 0,
        activeTime: 0,
        pageViews: 0,
        apiCalls: 0,
      },
      patterns: [],
    };
  }

  /**
   * Capture session metadata
   */
  private async captureSessionMetadata(): Promise<SessionMetadata> {
    return {
      device: this.getDeviceInfo(),
      network: await this.getNetworkInfo(),
      browser: this.getBrowserInfo(),
      location: await this.getLocationInfo(),
      performance: this.getPerformanceInfo(),
    };
  }

  /**
   * Apply session state
   */
  private async applySessionState(sessionId: string, state: SessionState): Promise<void> {
    try {
      // Apply authentication state
      await this.applyAuthenticationState(sessionId, state.authentication);

      // Apply preferences
      await this.applyUserPreferences(sessionId, state.preferences);

      // Apply navigation state
      this.applyNavigationState(state.navigation);

      // Apply form states
      this.applyFormStates(state.forms);

      // Apply cache state
      this.applyCacheState(state.cache);

      // Apply permission state
      await this.applyPermissionState(sessionId, state.permissions);

      console.log(`Session state applied for ${sessionId}`);
    } catch (error) {
      console.error("Error applying session state:", error);
      throw error;
    }
  }

  /**
   * Store snapshot
   */
  private async storeSnapshot(snapshot: SessionSnapshot): Promise<void> {
    try {
      let data = snapshot;

      // Compress if enabled
      if (this.preservationConfig.compressionEnabled) {
        data = await this.compressSnapshot(snapshot);
      }

      // Encrypt if enabled
      if (this.preservationConfig.encryptionEnabled) {
        data = await this.encryptSnapshot(data);
      }

      // Store based on storage type
      switch (this.preservationConfig.storageType) {
        case "localStorage":
          await this.storeInLocalStorage(snapshot.sessionId, data);
          break;

        case "indexedDB":
          await this.storeInIndexedDB(snapshot.sessionId, data);
          break;

        case "sessionStorage":
          await this.storeInSessionStorage(snapshot.sessionId, data);
          break;

        case "memory":
          this.storeInMemory(snapshot.sessionId, data);
          break;
      }

      // Update snapshots map
      if (!this.snapshots.has(snapshot.sessionId)) {
        this.snapshots.set(snapshot.sessionId, []);
      }

      const sessionSnapshots = this.snapshots.get(snapshot.sessionId)!;
      sessionSnapshots.push(snapshot);

      // Limit number of snapshots
      if (sessionSnapshots.length > this.preservationConfig.maxSnapshots) {
        const removed = sessionSnapshots.shift();
        if (removed) {
          await this.removeSnapshot(removed.id);
        }
      }
    } catch (error) {
      console.error("Error storing snapshot:", error);
      throw error;
    }
  }

  /**
   * Get latest snapshot
   */
  private async getLatestSnapshot(sessionId: string): Promise<SessionSnapshot | null> {
    const sessionSnapshots = this.snapshots.get(sessionId);
    if (!sessionSnapshots || sessionSnapshots.length === 0) {
      return null;
    }

    return sessionSnapshots[sessionSnapshots.length - 1];
  }

  /**
   * Get specific snapshot
   */
  private async getSnapshot(
    sessionId: string,
    snapshotId: string,
  ): Promise<SessionSnapshot | null> {
    const sessionSnapshots = this.snapshots.get(sessionId);
    if (!sessionSnapshots) {
      return null;
    }

    return sessionSnapshots.find((s) => s.id === snapshotId) || null;
  }

  /**
   * Verify snapshot integrity
   */
  private verifySnapshot(snapshot: SessionSnapshot): boolean {
    const calculatedChecksum = this.calculateChecksum(snapshot.state);
    return calculatedChecksum === snapshot.checksum;
  }

  /**
   * Calculate checksum
   */
  private calculateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * Get next version number
   */
  private getNextVersion(sessionId: string): number {
    const sessionSnapshots = this.snapshots.get(sessionId);
    if (!sessionSnapshots || sessionSnapshots.length === 0) {
      return 1;
    }

    const latestVersion = Math.max(...sessionSnapshots.map((s) => s.version));
    return latestVersion + 1;
  }

  /**
   * Utility methods for capturing state
   */
  private getNavigationHistory(): string[] {
    // Implementation depends on router used
    return [];
  }

  private getBreadcrumbs(): Breadcrumb[] {
    // Implementation depends on breadcrumb system
    return [];
  }

  private getTabStates(): TabState[] {
    // Implementation depends on tab system
    return [];
  }

  private getModalStates(): ModalState[] {
    // Implementation depends on modal system
    return [];
  }

  private getFormErrors(form: Element): Record<string, string> {
    const errors: Record<string, string> = {};
    const errorElements = form.querySelectorAll("[data-error]");

    errorElements.forEach((element) => {
      const field = element.getAttribute("data-field");
      const error = element.textContent;
      if (field && error) {
        errors[field] = error;
      }
    });

    return errors;
  }

  private getDeviceInfo(): DeviceInfo {
    return {
      type: this.getDeviceType(),
      os: this.getOperatingSystem(),
      screen: {
        width: screen.width,
        height: screen.height,
        pixelRatio: window.devicePixelRatio,
        orientation: screen.orientation?.type || "unknown",
      },
      memory: (navigator as any).deviceMemory || 0,
      storage: {
        available: 0,
        used: 0,
        quota: 0,
      },
    };
  }

  private async getNetworkInfo(): Promise<NetworkInfo> {
    const connection = (navigator as any).connection;
    return {
      type: connection?.effectiveType || "unknown",
      speed: connection?.downlink || 0,
      latency: connection?.rtt || 0,
      isOnline: navigator.onLine,
      lastOnline: Date.now(),
    };
  }

  private getBrowserInfo(): BrowserInfo {
    return {
      name: this.getBrowserName(),
      version: this.getBrowserVersion(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      localStorageEnabled: this.isLocalStorageEnabled(),
    };
  }

  private async getLocationInfo(): Promise<LocationInfo> {
    // Basic location info - in production, use proper geolocation service
    return {
      country: "Unknown",
      region: "Unknown",
      city: "Unknown",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  private getPerformanceInfo(): PerformanceInfo {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    return {
      loadTime: navigation?.loadEventEnd - navigation?.loadEventStart || 0,
      renderTime:
        navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      cpuUsage: 0, // Not available in browser
      networkUsage: 0, // Not available in browser
    };
  }

  /**
   * Helper methods
   */
  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return "tablet";
    }
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        userAgent,
      )
    ) {
      return "mobile";
    }
    return "desktop";
  }

  private getOperatingSystem(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Win") !== -1) return "Windows";
    if (userAgent.indexOf("Mac") !== -1) return "macOS";
    if (userAgent.indexOf("Linux") !== -1) return "Linux";
    if (userAgent.indexOf("Android") !== -1) return "Android";
    if (userAgent.indexOf("iOS") !== -1) return "iOS";
    return "Unknown";
  }

  private getBrowserName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf("Chrome") !== -1) return "Chrome";
    if (userAgent.indexOf("Firefox") !== -1) return "Firefox";
    if (userAgent.indexOf("Safari") !== -1) return "Safari";
    if (userAgent.indexOf("Edge") !== -1) return "Edge";
    return "Unknown";
  }

  private getBrowserVersion(): string {
    // Simplified version detection
    return navigator.userAgent.match(/\d+\.\d+/)?.[0] || "Unknown";
  }

  private isLocalStorageEnabled(): boolean {
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Storage implementations
   */
  private async storeInLocalStorage(sessionId: string, data: any): Promise<void> {
    const key = `neonpro_snapshot_${sessionId}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  private async storeInIndexedDB(sessionId: string, data: any): Promise<void> {
    // IndexedDB implementation
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("NeonProSnapshots", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["snapshots"], "readwrite");
        const store = transaction.objectStore("snapshots");

        const putRequest = store.put(data, sessionId);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("snapshots")) {
          db.createObjectStore("snapshots");
        }
      };
    });
  }

  private async storeInSessionStorage(sessionId: string, data: any): Promise<void> {
    const key = `neonpro_snapshot_${sessionId}`;
    sessionStorage.setItem(key, JSON.stringify(data));
  }

  private storeInMemory(sessionId: string, data: any): void {
    // Already stored in this.snapshots map
  }

  /**
   * Compression and encryption
   */
  private async compressSnapshot(snapshot: SessionSnapshot): Promise<any> {
    // Simple compression simulation
    const compressed = JSON.stringify(snapshot);
    return {
      ...snapshot,
      compressed: true,
      originalSize: JSON.stringify(snapshot).length,
      compressedSize: Math.floor(compressed.length * this.compressionRatio),
    };
  }

  private async encryptSnapshot(snapshot: any): Promise<any> {
    // Simple encryption simulation
    return {
      ...snapshot,
      encrypted: true,
      encryptionMethod: "AES-256",
    };
  }

  /**
   * State application methods
   */
  private async applyAuthenticationState(
    sessionId: string,
    auth: AuthenticationState,
  ): Promise<void> {
    await fetch(`/api/session/${sessionId}/restore-auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(auth),
    });
  }

  private async applyUserPreferences(sessionId: string, prefs: UserPreferences): Promise<void> {
    await fetch(`/api/session/${sessionId}/restore-preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
  }

  private applyNavigationState(nav: NavigationState): void {
    // Apply navigation state to current page
    if (nav.currentPath !== window.location.pathname) {
      // Navigate to preserved path if different
      window.history.pushState({}, "", nav.currentPath);
    }
  }

  private applyFormStates(forms: FormState[]): void {
    forms.forEach((formState) => {
      const form = document.querySelector(
        `form[data-preserve="${formState.formId}"]`,
      ) as HTMLFormElement;
      if (form) {
        Object.entries(formState.fields).forEach(([name, value]) => {
          const field = form.querySelector(`[name="${name}"]`) as HTMLInputElement;
          if (field) {
            field.value = value as string;
          }
        });
      }
    });
  }

  private applyCacheState(cache: CacheState): void {
    Object.entries(cache.data).forEach(([key, item]) => {
      if (item.expiry > Date.now()) {
        localStorage.setItem(key, JSON.stringify(item));
      }
    });
  }

  private async applyPermissionState(sessionId: string, perms: PermissionState): Promise<void> {
    await fetch(`/api/session/${sessionId}/restore-permissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(perms),
    });
  }

  /**
   * Cleanup and maintenance
   */
  private async cleanupOldSnapshots(): Promise<void> {
    const now = Date.now();
    const cutoff = now - this.preservationConfig.retentionPeriod;

    for (const [sessionId, snapshots] of this.snapshots.entries()) {
      const validSnapshots = snapshots.filter((s) => s.timestamp > cutoff);

      if (validSnapshots.length !== snapshots.length) {
        this.snapshots.set(sessionId, validSnapshots);

        // Remove from storage
        const removedSnapshots = snapshots.filter((s) => s.timestamp <= cutoff);
        for (const snapshot of removedSnapshots) {
          await this.removeSnapshot(snapshot.id);
        }
      }
    }
  }

  private async removeSnapshot(snapshotId: string): Promise<void> {
    // Remove from storage based on storage type
    switch (this.preservationConfig.storageType) {
      case "localStorage":
        localStorage.removeItem(`neonpro_snapshot_${snapshotId}`);
        break;

      case "indexedDB":
        // IndexedDB removal implementation
        break;

      case "sessionStorage":
        sessionStorage.removeItem(`neonpro_snapshot_${snapshotId}`);
        break;

      case "memory":
        // Already removed from memory map
        break;
    }
  }

  private async initializeStorage(): Promise<void> {
    if (this.preservationConfig.storageType === "indexedDB") {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open("NeonProSnapshots", 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();

        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains("snapshots")) {
            db.createObjectStore("snapshots");
          }
        };
      });
    }
  }

  private async loadSnapshots(): Promise<void> {
    // Load existing snapshots from storage
    switch (this.preservationConfig.storageType) {
      case "localStorage":
        this.loadFromLocalStorage();
        break;

      case "indexedDB":
        await this.loadFromIndexedDB();
        break;

      case "sessionStorage":
        this.loadFromSessionStorage();
        break;

      case "memory":
        // Nothing to load for memory storage
        break;
    }
  }

  private loadFromLocalStorage(): void {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("neonpro_snapshot_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || "{}");
          const sessionId = key.replace("neonpro_snapshot_", "");

          if (!this.snapshots.has(sessionId)) {
            this.snapshots.set(sessionId, []);
          }
          this.snapshots.get(sessionId)!.push(data);
        } catch (error) {
          console.warn(`Error loading snapshot from localStorage: ${key}`, error);
        }
      }
    }
  }

  private async loadFromIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("NeonProSnapshots", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(["snapshots"], "readonly");
        const store = transaction.objectStore("snapshots");

        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => {
          const snapshots = getAllRequest.result;
          snapshots.forEach((snapshot: SessionSnapshot) => {
            if (!this.snapshots.has(snapshot.sessionId)) {
              this.snapshots.set(snapshot.sessionId, []);
            }
            this.snapshots.get(snapshot.sessionId)!.push(snapshot);
          });
          resolve();
        };
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
    });
  }

  private loadFromSessionStorage(): void {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith("neonpro_snapshot_")) {
        try {
          const data = JSON.parse(sessionStorage.getItem(key) || "{}");
          const sessionId = key.replace("neonpro_snapshot_", "");

          if (!this.snapshots.has(sessionId)) {
            this.snapshots.set(sessionId, []);
          }
          this.snapshots.get(sessionId)!.push(data);
        } catch (error) {
          console.warn(`Error loading snapshot from sessionStorage: ${key}`, error);
        }
      }
    }
  }

  private startAutomaticSnapshots(): void {
    this.snapshotInterval = setInterval(() => {
      // Create snapshots for all active sessions
      this.currentState.forEach(async (state, sessionId) => {
        try {
          // Get session info
          const response = await fetch(`/api/session/${sessionId}`);
          if (response.ok) {
            const session = await response.json();
            await this.createSnapshot(sessionId, session.userId, session.deviceId);
          }
        } catch (error) {
          console.error(`Error creating automatic snapshot for ${sessionId}:`, error);
        }
      });
    }, this.preservationConfig.snapshotInterval);
  }

  private setupEventListeners(): void {
    // Listen for page unload to create final snapshot
    window.addEventListener("beforeunload", () => {
      this.currentState.forEach(async (state, sessionId) => {
        try {
          const response = await fetch(`/api/session/${sessionId}`);
          if (response.ok) {
            const session = await response.json();
            await this.createSnapshot(sessionId, session.userId, session.deviceId);
          }
        } catch (error) {
          console.error(`Error creating final snapshot for ${sessionId}:`, error);
        }
      });
    });

    // Listen for online/offline events
    window.addEventListener("online", () => {
      this.emit("network_restored", {});
    });

    window.addEventListener("offline", () => {
      this.emit("network_lost", {});
    });
  }

  /**
   * Event system
   */
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Public API methods
   */
  public async manualSnapshot(sessionId: string): Promise<SessionSnapshot | null> {
    try {
      const response = await fetch(`/api/session/${sessionId}`);
      if (response.ok) {
        const session = await response.json();
        return await this.createSnapshot(sessionId, session.userId, session.deviceId);
      }
    } catch (error) {
      console.error("Error creating manual snapshot:", error);
    }
    return null;
  }

  public getSessionSnapshots(sessionId: string): SessionSnapshot[] {
    return this.snapshots.get(sessionId) || [];
  }

  public async deleteSessionSnapshots(sessionId: string): Promise<void> {
    const snapshots = this.snapshots.get(sessionId);
    if (snapshots) {
      for (const snapshot of snapshots) {
        await this.removeSnapshot(snapshot.id);
      }
      this.snapshots.delete(sessionId);
    }
  }

  public getStorageUsage(): { used: number; available: number; quota: number } {
    let used = 0;

    // Calculate storage usage based on storage type
    switch (this.preservationConfig.storageType) {
      case "localStorage":
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("neonpro_snapshot_")) {
            used += localStorage.getItem(key)?.length || 0;
          }
        }
        break;

      case "memory":
        this.snapshots.forEach((snapshots) => {
          snapshots.forEach((snapshot) => {
            used += JSON.stringify(snapshot).length;
          });
        });
        break;
    }

    return {
      used,
      available: this.storageQuota - used,
      quota: this.storageQuota,
    };
  }

  public updateConfig(config: Partial<PreservationConfig>): void {
    this.preservationConfig = { ...this.preservationConfig, ...config };

    // Restart automatic snapshots if interval changed
    if (config.snapshotInterval && this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
      this.startAutomaticSnapshots();
    }
  }

  public destroy(): void {
    // Stop automatic snapshots
    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
      this.snapshotInterval = null;
    }

    // Clear state
    this.snapshots.clear();
    this.currentState.clear();
    this.eventListeners.clear();
  }
}

export default SessionPreservationManager;
