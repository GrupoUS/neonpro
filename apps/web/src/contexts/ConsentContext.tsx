import React, { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

// LGPD-compliant consent categories
export interface ConsentPreferences {
  necessary: boolean; // Always true - essential for app functionality
  analytics: boolean; // Web analytics and usage tracking
  functional: boolean; // Enhanced features and personalization
  marketing: boolean; // Marketing and advertising cookies
}

export interface ConsentContextValue {
  // Consent state
  preferences: ConsentPreferences;
  hasConsent: (category: keyof ConsentPreferences) => boolean;

  // Consent actions
  acceptAll: () => void;
  rejectOptional: () => void;
  updatePreferences: (preferences: Partial<ConsentPreferences>) => void;
  grantConsent: (category: keyof ConsentPreferences) => void;

  // Settings and configuration
  consentSettings: ConsentPreferences;
  updateConsentSettings: (settings: Partial<ConsentPreferences>) => void;
  consentHistory: Array<{
    timestamp: string;
    action: string;
    preferences: ConsentPreferences;
  }>;

  // UI state
  showConsentBanner: boolean;
  showPreferencesModal: boolean;
  setShowPreferencesModal: (show: boolean) => void;
  isConsentBannerVisible: boolean;
}

const ConsentContext = createContext<ConsentContextValue | undefined>(
  undefined,
);

const CONSENT_STORAGE_KEY = 'neonpro-consent-preferences';
const CONSENT_VERSION = '1.0'; // Increment when consent requirements change

interface ConsentProviderProps {
  children: ReactNode;
}

export function ConsentProvider({
  children,
}: ConsentProviderProps): React.JSX.Element {
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Always required for app functionality
    analytics: false, // Requires explicit consent under LGPD
    functional: false, // Enhanced features
    marketing: false, // Marketing/advertising
  });

  const [showConsentBanner, setShowConsentBanner] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [_consentVersion, setConsentVersion] = useState<string | null>(null);

  // Load saved preferences on mount
  useEffect(() => {
    const savedData = localStorage.getItem(CONSENT_STORAGE_KEY);

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);

        // Check if consent version matches current requirements
        if (parsed.version === CONSENT_VERSION) {
          setPreferences(prev => ({ ...prev, ...parsed.preferences }));
          setConsentVersion(parsed.version);
        } else {
          // Consent version changed - show banner again
          setShowConsentBanner(true);
        }
      } catch (_error) {
        console.warn('Failed to parse consent preferences:', error);
        setShowConsentBanner(true);
      }
    } else {
      // No saved preferences - show banner for new users
      setShowConsentBanner(true);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = (newPreferences: ConsentPreferences) => {
    const dataToSave = {
      version: CONSENT_VERSION,
      preferences: newPreferences,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(dataToSave));
      setConsentVersion(CONSENT_VERSION);
    } catch (_error) {
      console.error('Failed to save consent preferences:', error);
    }
  };

  const hasConsent = (category: keyof ConsentPreferences): boolean => {
    return preferences[category] === true;
  };

  const acceptAll = () => {
    const newPreferences: ConsentPreferences = {
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true,
    };

    setPreferences(newPreferences);
    savePreferences(newPreferences);
    setShowConsentBanner(false);

    // Trigger analytics initialization if analytics was just enabled
    if (!preferences.analytics) {
      dispatchConsentEvent('analytics', true);
    }
  };

  const rejectOptional = () => {
    const newPreferences: ConsentPreferences = {
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false,
    };

    setPreferences(newPreferences);
    savePreferences(newPreferences);
    setShowConsentBanner(false);

    // Trigger analytics cleanup if analytics was previously enabled
    if (preferences.analytics) {
      dispatchConsentEvent('analytics', false);
    }
  };

  const updatePreferences = (updates: Partial<ConsentPreferences>) => {
    const newPreferences: ConsentPreferences = {
      ...preferences,
      ...updates,
      necessary: true, // Always true
    };

    // Check for analytics consent changes
    const analyticsChanged = newPreferences.analytics !== preferences.analytics;

    setPreferences(newPreferences);
    savePreferences(newPreferences);

    // Trigger analytics events if consent changed
    if (analyticsChanged) {
      dispatchConsentEvent('analytics', newPreferences.analytics);
    }
  };

  // Dispatch custom events for consent changes
  const dispatchConsentEvent = (category: string, granted: boolean) => {
    window.dispatchEvent(
      new CustomEvent('consent-changed', {
        detail: { category, granted, timestamp: Date.now() },
      }),
    );
  };

  // Additional consent functions for compatibility
  const grantConsent = (category: keyof ConsentPreferences) => {
    updatePreferences({ [category]: true });
  };

  const updateConsentSettings = (settings: Partial<ConsentPreferences>) => {
    updatePreferences(settings);
  };

  // Mock consent history for now (TODO: implement proper history tracking)
  const consentHistory: Array<{
    timestamp: string;
    action: string;
    preferences: ConsentPreferences;
  }> = [];

  const contextValue: ConsentContextValue = {
    preferences,
    hasConsent,
    acceptAll,
    rejectOptional,
    updatePreferences,
    grantConsent,
    consentSettings: preferences,
    updateConsentSettings,
    consentHistory,
    showConsentBanner,
    showPreferencesModal,
    setShowPreferencesModal,
    isConsentBannerVisible: showConsentBanner,
  };

  return (
    <ConsentContext.Provider value={contextValue}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
}

// Type guard to check if analytics tracking should be active
export function canTrackAnalytics(): boolean {
  // Check if consent context is available
  try {
    const savedData = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return (
        parsed.version === CONSENT_VERSION
        && parsed.preferences?.analytics === true
      );
    }
  } catch {
    // If consent data is invalid, default to no tracking
  }
  return false;
}

// ConsentPreferences already exported at the top of the file
