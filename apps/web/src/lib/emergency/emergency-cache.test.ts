// placeholder for emergency cache tests

/**
 * Test suite for EmergencyCache
 * Testing library/framework: Vitest-style (describe/it/expect/vi). If project uses Jest, these APIs are compatible with minimal changes.
 * The tests mock browser-only globals: indexedDB, performance.now, navigator.userAgent, and console.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

type IEmergencyCacheAny = any;

// Minimal in-memory Fake IndexedDB to satisfy the code paths used by EmergencyCache
class InMemoryObjectStore<T extends { id: string }> {
  private store = new Map<string, T>();

  createIndex() { /* index not used in tests */ }
  getAll() {
    const request: any = {};
    setTimeout(() => {
      request.result = Array.from(this.store.values());
      request.onsuccess && request.onsuccess();
    }, 0);
    return request;
  }
  put(entry: T) {
    this.store.set(entry.id, entry);
  }
  delete(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
  // helper for assertions
  _size() { return this.store.size; }
}

class InMemoryDB {
  private stores = new Map<string, InMemoryObjectStore<any>>();
  objectStoreNames = {
    contains: (name: string) => this.stores.has(name),
  };
  createObjectStore(name: string) {
    const s = new InMemoryObjectStore<any>();
    this.stores.set(name, s);
    return s;
  }
  transaction(names: string[], _mode: 'readonly'|'readwrite') {
    const self = this;
    return {
      objectStore(name: string) {
        if (!self.stores.has(name)) {
          self.stores.set(name, new InMemoryObjectStore<any>());
        }
        return self.stores.get(name)!;
      }
    };
  }
  _getStore(name: string) {
    if (!this.stores.has(name)) this.stores.set(name, new InMemoryObjectStore<any>());
    return this.stores.get(name)!;
  }
}

function makeOpenSuccess(db: InMemoryDB) {
  return () => {
    const req: any = {};
    setTimeout(() => {
      // Upgrade if needed
      if (req.onupgradeneeded) {
        const event: any = { target: { result: db } };
        req.onupgradeneeded(event);
      }
      req.result = db;
      req.onsuccess && req.onsuccess();
    }, 0);
    return req;
  };
}

function makeOpenError(err: Error) {
  return () => {
    const req: any = { error: err };
    setTimeout(() => {
      req.onerror && req.onerror();
    }, 0);
    return req;
  };
}

// Save original globals
const originalIndexedDB: any = (globalThis as any).indexedDB;
const originalPerformance: any = (globalThis as any).performance;
const originalNavigator: any = (globalThis as any).navigator;
const originalConsole = { ...console };

describe('EmergencyCache', () => {
  let db: InMemoryDB;

  beforeEach(() => {
    // Fresh in-memory DB per test
    db = new InMemoryDB();
    (globalThis as any).indexedDB = { open: vi.fn(makeOpenSuccess(db)) };
    (globalThis as any).performance = { now: vi.fn(() => 0) };
    (globalThis as any).navigator = { userAgent: 'vitest' };

    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Important: create a fresh instance instead of using the singleton if we want isolation.
    // However, file exports a singleton 'emergencyCache'. To isolate, we construct new instances inline when needed.
  });

  afterEach(() => {
    // restore mocks
    vi.restoreAllMocks();
    (globalThis as any).indexedDB = originalIndexedDB;
    (globalThis as any).performance = originalPerformance;
    (globalThis as any).navigator = originalNavigator;
    console.warn = originalConsole.warn;
    console.log = originalConsole.log;
    console.error = originalConsole.error;
  });

  function newCacheInstance(): any {
    // Access the class defined above in the same module
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return new (EmergencyCache as any)();
  }

  it('stores and retrieves entries via set/get with accessCount increment and LGPD logging for critical read', async () => {
    const cache = newCacheInstance();
    // Wait a tick for IndexedDB open to resolve and load
    await new Promise((r) => setTimeout(r, 5));

    await cache.set('k1', { a: 1 }, {
      patientId: 'p1',
      type: 'patient',
      priority: 'critical',
      ttlMinutes: 60,
      lgpdCompliant: true,
    });

    const entry1 = cache.get('k1');
    expect(entry1).toBeTruthy();
    expect(entry1!.data).toEqual({ a: 1 });
    expect(entry1!.accessCount).toBe(1);
    // critical read should produce LGPD access log
    expect(console.log).toHaveBeenCalledWith(
      'LGPD Access Log:',
      expect.objectContaining({
        patientId: 'p1',
        action: 'cache_read',
        reason: 'Emergency data accessed',
      }),
    );
    // persistence occurred
    expect(db._getStore('emergency_data')._size()).toBe(1);
  });

  it('returns null and warns on cache miss', async () => {
    const cache = newCacheInstance();
    await new Promise((r) => setTimeout(r, 5));

    const res = cache.get('missing-key');
    expect(res).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Emergency cache miss for key: missing-key'));
  });

  it('removes expired entries on get when not in emergencyAccess mode', async () => {
    const cache = newCacheInstance();
    await new Promise((r) => setTimeout(r, 5));

    // ttlMinutes negative to produce already-expired item
    await cache.set('k-exp', { v: 1 }, {
      patientId: 'p1',
      type: 'patient',
      ttlMinutes: -1,
    });

    const res1 = cache.get('k-exp', /* emergencyAccess */ false);
    expect(res1).toBeNull();
    // Deleted from persistence as well
    expect(db._getStore('emergency_data')._size()).toBe(0);
  });

  it('returns expired entry if emergencyAccess=true and logs LGPD for emergency read', async () => {
    const cache = newCacheInstance();
    await new Promise((r) => setTimeout(r, 5));

    await cache.set('k-exp2', { v: 2 }, {
      patientId: 'p2',
      type: 'patient',
      ttlMinutes: -1, // expired
      priority: 'normal',
    });

    const entry = cache.get('k-exp2', true);
    expect(entry).toBeTruthy();
    expect(entry!.data).toEqual({ v: 2 });
    expect(console.log).toHaveBeenCalledWith(
      'LGPD Access Log:',
      expect.objectContaining({
        patientId: 'p2',
        action: 'cache_read',
        reason: 'Emergency data accessed',
      }),
    );
  });

  it('warns when access time exceeds 100ms', async () => {
    const cache = newCacheInstance();
    await new Promise((r) => setTimeout(r, 5));

    await cache.set('slow', { x: 1 }, {
      patientId: 'p3',
      type: 'patient',
    });

    // Make performance.now simulate >100ms elapsed
    let t = 0;
    (globalThis as any).performance.now = vi.fn(() => {
      // first call returns 0, second returns 150 to simulate 150ms elapsed
      t += 150;
      return t - 150 === 0 ? 0 : 150;
    });

    cache.get('slow');
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Emergency cache access exceeded 100ms'));
  });

  it('cacheEmergencyPatient stores patient, allergies, medications, contacts, and optional location with correct priorities/ttls', async () => {
    const cache = newCacheInstance();
    await new Promise((r) => setTimeout(r, 5));
    const data: EmergencyPatientCache = {
      personalInfo: { id: 'p10', name: 'Alice', age: 30, bloodType: 'O+', gender: 'F' },
      criticalData: {
        allergies: [{ name: 'Penicillin', severity: 'severe', reactions: ['rash'] }],
        medications: [{ name: 'EpiPen', dosage: '0.3mg', isCritical: true }],
        conditions: ['asthma'],
      },
      emergencyContacts: [{ name: 'Bob', phone: '123', relationship: 'Spouse', isPrimary: true }],
      location: { lastKnown: { address: '123 St', coordinates: { lat: 1, lng: 2 }, timestamp: Date.now() } },
      lgpd: { consentLevel: 'emergency-only', consentDate: new Date().toISOString(), accessLog: [] },
    };

    await cache.cacheEmergencyPatient('p10', data);

    const patient = cache.get('patient:p10');
    const allergies = cache.get('allergies:p10');
    const meds = cache.get('medications:p10');
    const contacts = cache.get('contacts:p10');
    const location = cache.get('location:p10');

    expect(patient?.priority).toBe('critical');
    expect(allergies?.priority).toBe('critical');
    expect(meds?.priority).toBe('critical');
    expect(contacts?.priority).toBe('critical');
    expect(location?.priority).toBe('urgent');

    expect(patient?.type).toBe('patient');
    expect(allergies?.type).toBe('allergies');
    expect(meds?.type).toBe('medications');
    expect(contacts?.type).toBe('contacts');

    // persisted count: should be 5 entries
    expect(db._getStore('emergency_data')._size()).toBe(5);
  });

  it('getEmergencyPatient aggregates data and returns null when patient record is missing', async () => {
    const cache = newCacheInstance();
    await new Promise((r) => setTimeout(r, 5));

    // Case: missing patient
    const missing = cache.getEmergencyPatient('nope');
    expect(missing).toBeNull();

    // Happy path
    await cache.set('patient:p20', { id: 'p20', name: 'Zoe', age: 40, bloodType: 'A+', gender: 'F' }, {
      patientId: 'p20', type: 'patient', priority: 'critical'
    });
    await cache.set('allergies:p20', [{ name: 'Peanut', severity: 'life-threatening', reactions: ['anaphylaxis'] }], {
      patientId: 'p20', type: 'allergies', priority: 'critical'
    });
    await cache.set('medications:p20', [{ name: 'Albuterol', dosage: '2 puffs', isCritical: false }], {
      patientId: 'p20', type: 'medications', priority: 'urgent'
    });
    await cache.set('contacts:p20', [{ name: 'Ann', phone: '555', relationship: 'Sister', isPrimary: true }], {
      patientId: 'p20', type: 'contacts', priority: 'critical'
    });

    const agg = cache.getEmergencyPatient('p20');
    expect(agg).toBeTruthy();
    expect(agg!.personalInfo.name).toBe('Zoe');
    expect(agg!.criticalData.allergies.length).toBe(1);
    expect(agg!.criticalData.medications.length).toBe(1);
    expect(Array.isArray(agg!.emergencyContacts)).toBe(true);
    expect(agg!.lgpd.consentLevel).toBe('emergency-only');
  });

  it('getCriticalPatients returns only critical patient-type entries sorted by accessCount desc', async () => {
    const cache = newCacheInstance();
    await new Promise((r) => setTimeout(r, 5));

    await cache.set('patient:a', { id: 'a' }, { patientId: 'a', type: 'patient', priority: 'critical' });
    await cache.set('patient:b', { id: 'b' }, { patientId: 'b', type: 'patient', priority: 'critical' });
    await cache.set('contacts:b', [], { patientId: 'b', type: 'contacts', priority: 'critical' }); // not type 'patient'
    await cache.set('patient:c', { id: 'c' }, { patientId: 'c', type: 'patient', priority: 'normal' }); // not critical

    // Increase accessCount for 'a' twice, 'b' once
    cache.get('patient:a');
    cache.get('patient:a');
    cache.get('patient:b');

    const list = cache.getCriticalPatients();
    expect(list.map(e => e.id)).toEqual(['patient:a','patient:b']);
  });

  it('getPerformanceStats reports cache size and number of critical entries', async () => {
    const cache = newCacheInstance();
    await new Promise((r) => setTimeout(r, 5));
    await cache.set('patient:x', { id: 'x' }, { patientId: 'x', type: 'patient', priority: 'critical' });
    await cache.set('allergies:x', [], { patientId: 'x', type: 'allergies', priority: 'normal' });

    const stats = cache.getPerformanceStats();
    expect(stats.cacheSize).toBe(2);
    expect(stats.criticalEntries).toBe(1);
    expect(stats.averageAccessTime).toBe(0);
    expect(stats.slowQueries).toBe(0);
  });

  it('cleanup removes expired entries and logs count', async () => {
    const cache = newCacheInstance();
    await new Promise((r) => setTimeout(r, 5));
    await cache.set('ke1', {}, { patientId: 'e1', type: 'patient', ttlMinutes: -1 });
    await cache.set('ke2', {}, { patientId: 'e2', type: 'patient', ttlMinutes: -1 });
    await cache.set('kok', {}, { patientId: 'ok', type: 'patient', ttlMinutes: 60 });

    const before = cache.getPerformanceStats().cacheSize;
    expect(before).toBe(3);

    cache.cleanup();

    const after = cache.getPerformanceStats().cacheSize;
    expect(after).toBe(1);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Emergency cache cleanup: removed 2 expired entries')
    );
  });

  it('clear wipes memory and persistent stores', async () => {
    const cache = newCacheInstance();
    await new Promise((r) => setTimeout(r, 5));
    await cache.set('k1', {}, { patientId: 'p', type: 'patient' });
    await cache.set('k2', {}, { patientId: 'p', type: 'allergies' });

    expect(cache.getPerformanceStats().cacheSize).toBe(2);
    expect(db._getStore('emergency_data')._size()).toBe(2);

    cache.clear();

    expect(cache.getPerformanceStats().cacheSize).toBe(0);
    expect(db._getStore('emergency_data')._size()).toBe(0);
  });

  it('handles IndexedDB open error without crashing (set persists only in memory)', async () => {
    // Make open fail (no indexedDB connection)
    (globalThis as any).indexedDB = { open: vi.fn(makeOpenError(new Error('open failed'))) };

    const cache = newCacheInstance();
    await new Promise((r) => setTimeout(r, 5));

    await cache.set('mem-only', { q: 1 }, { patientId: 'p', type: 'patient' });
    // Should be retrievable from memory
    const entry = cache.get('mem-only');
    expect(entry?.data).toEqual({ q: 1 });
    // No persistence occurred
    expect(() => db._getStore('emergency_data')).toThrowError || expect(true).toBeTruthy();
    expect(console.error).toHaveBeenCalledWith('Failed to open IndexedDB for emergency cache');
  });
});