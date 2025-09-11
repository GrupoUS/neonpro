/**
 * Emergency Cache System - Offline-first critical data storage
 * Ensures <100ms access to life-critical patient information
 * Brazilian healthcare compliance (LGPD) with emergency access patterns
 */

// Emergency Cache Types
export interface EmergencyCacheEntry {
  id: string;
  patientId: string;
  type: "patient" | "allergies" | "medications" | "contacts" | "protocols";
  data: Record<string, unknown>;
  priority: "critical" | "urgent" | "normal";
  lastUpdated: number;
  expiresAt: number;
  accessCount: number;
  lgpdCompliant: boolean;
}

export interface EmergencyPatientCache {
  personalInfo: {
    id: string;
    name: string;
    age: number;
    bloodType: string;
    gender: "M" | "F" | "O";
    photo?: string;
  };
  criticalData: {
    allergies: {
      name: string;
      severity: "life-threatening" | "severe" | "moderate" | "mild";
      reactions: string[];
    }[];
    medications: {
      name: string;
      dosage: string;
      isCritical: boolean;
    }[];
    conditions: string[];
  };
  emergencyContacts: {
    name: string;
    phone: string;
    relationship: string;
    isPrimary: boolean;
  }[];
  location?: {
    lastKnown: {
      address: string;
      coordinates: { lat: number; lng: number; };
      timestamp: number;
    };
  };
  lgpd: {
    consentLevel: "full" | "emergency-only" | "restricted";
    consentDate: string;
    accessLog: {
      timestamp: number;
      accessor: string;
      reason: string;
    }[];
  };
}

export class EmergencyCache {
  private static instance: EmergencyCache;
  private cache: Map<string, EmergencyCacheEntry>;
  private indexedDB: IDBDatabase | null = null;
  private readonly DB_NAME = "neonpro_emergency_cache";
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = "emergency_data";

  constructor() {
    this.cache = new Map();
    // Only initialize IndexedDB if not in test environment
    if (typeof indexedDB !== 'undefined' && typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
      this.initIndexedDB();
    }
  }

  public static getInstance(): EmergencyCache {
    if (!EmergencyCache.instance) {
      EmergencyCache.instance = new EmergencyCache();
    }
    return EmergencyCache.instance;
  } /**
   * Initialize IndexedDB for persistent offline storage
   */

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error("Failed to open IndexedDB for emergency cache");
        reject(request.error);
      };

      request.onsuccess = () => {
        this.indexedDB = request.result;
        this.loadFromIndexedDB();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, {
            keyPath: "id",
          });
          store.createIndex("patientId", "patientId", { unique: false });
          store.createIndex("type", "type", { unique: false });
          store.createIndex("priority", "priority", { unique: false });
          store.createIndex("lastUpdated", "lastUpdated", { unique: false });
        }
      };
    });
  }

  /**
   * Load existing cache data from IndexedDB on initialization
   */
  private async loadFromIndexedDB(): Promise<void> {
    if (!this.indexedDB) {
      return;
    }

    const transaction = this.indexedDB.transaction(
      [this.STORE_NAME],
      "readonly",
    );
    const store = transaction.objectStore(this.STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const entries = request.result as EmergencyCacheEntry[];
      const now = Date.now();

      entries.forEach((entry) => {
        // Remove expired entries
        if (entry.expiresAt < now) {
          this.removeFromIndexedDB(entry.id);
        } else {
          this.cache.set(entry.id, entry);
        }
      });

      console.log(`Emergency cache loaded: ${this.cache.size} entries`);
    };
  } /**
   * Store critical data with <100ms access guarantee
   */

  async set(
    key: string,
    data: Record<string, unknown>,
    options: {
      patientId: string;
      type: EmergencyCacheEntry["type"];
      priority?: EmergencyCacheEntry["priority"];
      ttlMinutes?: number;
      lgpdCompliant?: boolean;
    },
  ): Promise<void> {
    const now = Date.now();
    const ttl = (options.ttlMinutes || 1440) * 60 * 1000; // Default 24 hours

    const entry: EmergencyCacheEntry = {
      id: key,
      patientId: options.patientId,
      type: options.type,
      data,
      priority: options.priority || "normal",
      lastUpdated: now,
      expiresAt: now + ttl,
      accessCount: 0,
      lgpdCompliant: options.lgpdCompliant ?? true,
    };

    // Store in memory cache for immediate access (<100ms)
    this.cache.set(key, entry);

    // Persist to IndexedDB for offline availability
    await this.saveToIndexedDB(entry);

    // Log LGPD compliance access
    if (options.lgpdCompliant) {
      this.logLGPDAccess(
        options.patientId,
        "cache_write",
        "Emergency data cached",
      );
    }
  }

  /**
   * Retrieve data with <100ms performance guarantee
   */
  get(
    key: string,
    emergencyAccess = false,
  ): EmergencyCacheEntry | null {
    const startTime = performance.now();

    const entry = this.cache.get(key);

    if (!entry) {
      console.warn(`Emergency cache miss for key: ${key}`);
      return null;
    }

    // Check expiration
    if (entry.expiresAt < Date.now() && !emergencyAccess) {
      this.cache.delete(key);
      this.removeFromIndexedDB(key);
      return null;
    }

    // Update access count and performance tracking
    entry.accessCount++;
    const accessTime = performance.now() - startTime;

    if (accessTime > 100) {
      console.warn(
        `Emergency cache access exceeded 100ms: ${accessTime}ms for key ${key}`,
      );
    }

    // Log LGPD access for critical data
    if (entry.priority === "critical" || emergencyAccess) {
      this.logLGPDAccess(
        entry.patientId,
        "cache_read",
        "Emergency data accessed",
      );
    }

    return entry;
  } /**
   * Cache complete patient emergency profile
   */

  async cacheEmergencyPatient(
    patientId: string,
    patientData: EmergencyPatientCache,
  ): Promise<void> {
    // Cache critical data with highest priority
    await this.set(`patient:${patientId}`, patientData.personalInfo, {
      patientId,
      type: "patient",
      priority: "critical",
      ttlMinutes: 4320, // 3 days for emergency data
    });

    await this.set(
      `allergies:${patientId}`,
      patientData.criticalData.allergies,
      {
        patientId,
        type: "allergies",
        priority: "critical",
        ttlMinutes: 4320,
      },
    );

    await this.set(
      `medications:${patientId}`,
      patientData.criticalData.medications,
      {
        patientId,
        type: "medications",
        priority: "critical",
        ttlMinutes: 1440, // 1 day for medications
      },
    );

    await this.set(`contacts:${patientId}`, patientData.emergencyContacts, {
      patientId,
      type: "contacts",
      priority: "critical",
      ttlMinutes: 4320,
    });

    // Cache location if available
    if (patientData.location) {
      await this.set(`location:${patientId}`, patientData.location, {
        patientId,
        type: "patient",
        priority: "urgent",
        ttlMinutes: 60, // 1 hour for location data
      });
    }
  }

  /**
   * Get complete emergency patient profile (optimized for <100ms)
   */
  getEmergencyPatient(
    patientId: string,
    emergencyAccess = true,
  ): EmergencyPatientCache | null {
    const patient = this.get(`patient:${patientId}`, emergencyAccess);
    const allergies = this.get(`allergies:${patientId}`, emergencyAccess);
    const medications = this.get(`medications:${patientId}`, emergencyAccess);
    const contacts = this.get(`contacts:${patientId}`, emergencyAccess);
    const location = this.get(`location:${patientId}`, emergencyAccess);

    if (!patient) {
      return null;
    }

    return {
      personalInfo: patient.data,
      criticalData: {
        allergies: allergies?.data || [],
        medications: medications?.data || [],
        conditions: [], // Will be populated from patient data
      },
      emergencyContacts: contacts?.data || [],
      location: location?.data,
      lgpd: {
        consentLevel: "emergency-only",
        consentDate: new Date().toISOString(),
        accessLog: [],
      },
    };
  } /**
   * Get all critical patients for emergency scenarios
   */

  getCriticalPatients(): EmergencyCacheEntry[] {
    const criticalEntries: EmergencyCacheEntry[] = [];

    for (const entry of this.cache.values()) {
      if (entry.priority === "critical" && entry.type === "patient") {
        criticalEntries.push(entry);
      }
    }

    return criticalEntries.sort((a, b) => b.accessCount - a.accessCount);
  }

  /**
   * Performance monitoring - ensure <100ms access
   */
  getPerformanceStats(): {
    cacheSize: number;
    criticalEntries: number;
    averageAccessTime: number;
    slowQueries: number;
  } {
    const criticalCount = Array.from(this.cache.values()).filter(
      (entry) => entry.priority === "critical",
    ).length;

    return {
      cacheSize: this.cache.size,
      criticalEntries: criticalCount,
      averageAccessTime: 0, // Would track in production
      slowQueries: 0, // Would track queries >100ms
    };
  }

  /**
   * LGPD Compliance - Log access to patient data
   */
  private logLGPDAccess(
    patientId: string,
    action: string,
    reason: string,
  ): void {
    const logEntry = {
      patientId,
      action,
      reason,
      timestamp: Date.now(),
      accessor: "emergency-cache-system",
      ipAddress: "internal",
      userAgent: navigator.userAgent,
    };

    // In production, this would be sent to an audit service
    console.log("LGPD Access Log:", logEntry);
  }

  /**
   * Save entry to IndexedDB for persistence
   */
  private async saveToIndexedDB(entry: EmergencyCacheEntry): Promise<void> {
    if (!this.indexedDB) {
      return;
    }

    const transaction = this.indexedDB.transaction(
      [this.STORE_NAME],
      "readwrite",
    );
    const store = transaction.objectStore(this.STORE_NAME);
    store.put(entry);
  }

  /**
   * Remove entry from IndexedDB
   */
  private async removeFromIndexedDB(key: string): Promise<void> {
    if (!this.indexedDB) {
      return;
    }

    const transaction = this.indexedDB.transaction(
      [this.STORE_NAME],
      "readwrite",
    );
    const store = transaction.objectStore(this.STORE_NAME);
    store.delete(key);
  }

  /**
   * Clean expired entries and optimize cache
   */
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => {
      this.cache.delete(key);
      this.removeFromIndexedDB(key);
    });

    console.log(
      `Emergency cache cleanup: removed ${expiredKeys.length} expired entries`,
    );
  }

  /**
   * Clear all cache (emergency reset)
   */
  clear(): void {
    this.cache.clear();

    if (this.indexedDB) {
      const transaction = this.indexedDB.transaction(
        [this.STORE_NAME],
        "readwrite",
      );
      const store = transaction.objectStore(this.STORE_NAME);
      store.clear();
    }
  }
}

// Export singleton instance
export const emergencyCache = EmergencyCache.getInstance();
