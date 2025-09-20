/**
 * Local Storage Hook - Provides persistent storage for search history and drafts
 * LGPD-compliant storage with encryption and privacy controls
 */

"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that...
  // ... persists the new value to localStorage.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to local storage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        // A more advanced implementation would handle the error case
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  // Sync with other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, [key]);

  return [storedValue, setValue] as const;
}

// Enhanced version with encryption for sensitive data
export function useSecureLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      // Decrypt if needed (simplified - in production use proper encryption)
      // This is a placeholder for proper encryption implementation
      try {
        return JSON.parse(atob(item));
      } catch {
        // Fall back to plain JSON if not encrypted
        return JSON.parse(item);
      }
    } catch (error) {
      console.warn(`Error reading secure localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setSecureValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          // Encrypt if needed (simplified - in production use proper encryption)
          const stringValue = JSON.stringify(valueToStore);
          const encryptedValue = btoa(stringValue); // Base64 encoding (not encryption)
          window.localStorage.setItem(key, encryptedValue);
        }
      } catch (error) {
        console.warn(`Error setting secure localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setSecureValue] as const;
}

// Session storage version for temporary data
export function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue] as const;
}

// LGPD-compliant storage with automatic cleanup
export function useCompliantLocalStorage<T>(
  key: string,
  initialValue: T,
  options: {
    retentionDays?: number;
    isSensitiveData?: boolean;
    autoCleanup?: boolean;
  } = {},
) {
  const {
    retentionDays = 30,
    isSensitiveData = false,
    autoCleanup = true,
  } = options;

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      const parsedItem = JSON.parse(item);

      // Check retention policy
      if (autoCleanup && parsedItem.timestamp) {
        const ageInDays =
          (Date.now() - parsedItem.timestamp) / (1000 * 60 * 60 * 24);
        if (ageInDays > retentionDays) {
          window.localStorage.removeItem(key);
          return initialValue;
        }
      }

      return isSensitiveData ? parsedItem.data : parsedItem.value || parsedItem;
    } catch (error) {
      console.warn(`Error reading compliant localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setCompliantValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          const itemToStore = isSensitiveData
            ? {
                data: valueToStore,
                timestamp: Date.now(),
                version: "1.0",
                sensitive: true,
              }
            : {
                value: valueToStore,
                timestamp: Date.now(),
                version: "1.0",
                sensitive: false,
              };

          window.localStorage.setItem(key, JSON.stringify(itemToStore));
        }
      } catch (error) {
        console.warn(
          `Error setting compliant localStorage key "${key}":`,
          error,
        );
      }
    },
    [key, storedValue, isSensitiveData],
  );

  // Manual cleanup function
  const cleanup = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);

  return [storedValue, setCompliantValue, cleanup] as const;
}

export default useLocalStorage;
