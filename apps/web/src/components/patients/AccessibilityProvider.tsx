'use client';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Slider,
  Switch,
} from '@neonpro/ui';
import { cn } from '@neonpro/utils';
import {
  Contrast,
  Eye,
  Keyboard,
  Moon,
  MousePointer,
  RotateCcw,
  Sun,
  Type,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Accessibility preferences interface
interface AccessibilityPreferences {
  // Visual
  highContrast: boolean;
  largeFonts: boolean;
  fontSize: number; // 12-24px
  darkMode: boolean;
  reduceMotion: boolean;

  // Motor
  stickyKeys: boolean;
  slowKeys: boolean;
  mouseKeys: boolean;
  clickDelay: number; // milliseconds

  // Cognitive
  reducedAnimations: boolean;
  simplifiedUI: boolean;
  screenReader: boolean;

  // Audio
  soundEffects: boolean;
  voiceAnnouncements: boolean;

  // Touch/Mobile
  largerTouchTargets: boolean;
  hapticFeedback: boolean;
}

// Default accessibility preferences
const defaultPreferences: AccessibilityPreferences = {
  highContrast: false,
  largeFonts: false,
  fontSize: 16,
  darkMode: false,
  reduceMotion: false,
  stickyKeys: false,
  slowKeys: false,
  mouseKeys: false,
  clickDelay: 0,
  reducedAnimations: false,
  simplifiedUI: false,
  screenReader: false,
  soundEffects: true,
  voiceAnnouncements: false,
  largerTouchTargets: false,
  hapticFeedback: true,
};

// Accessibility context
interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  updatePreference: <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K],
  ) => void;
  resetPreferences: () => void;
  announceToScreenReader: (message: string) => void;
  isAccessibilityPanelOpen: boolean;
  setAccessibilityPanelOpen: (open: boolean) => void;
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

// Screen reader announcements
const ScreenReaderAnnouncer = () => {
  const [announcement, setAnnouncement] = useState<string>('');

  useEffect(() => {
    const handleAnnouncement = (event: CustomEvent<string>) => {
      setAnnouncement(event.detail);
      // Clear after a short delay to allow screen reader to process
      setTimeout(() => setAnnouncement(''), 100);
    };

    window.addEventListener(
      'accessibility-announce',
      handleAnnouncement as EventListener,
    );
    return () => {
      window.removeEventListener(
        'accessibility-announce',
        handleAnnouncement as EventListener,
      );
    };
  }, []);

  return (
    <div
      aria-live='polite'
      aria-atomic='true'
      className='sr-only'
      role='status'
    >
      {announcement}
    </div>
  );
};

// Accessibility floating panel
const AccessibilityPanel = () => {
  const context = useContext(AccessibilityContext);
  if (!context) return null;

  const {
    preferences,
    updatePreference,
    resetPreferences,
    isAccessibilityPanelOpen,
    setAccessibilityPanelOpen,
  } = context;

  if (!isAccessibilityPanelOpen) {
    return (
      <Button
        onClick={() => setAccessibilityPanelOpen(true)}
        className='fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg'
        size='sm'
        aria-label='Abrir painel de acessibilidade'
        title='Configurações de Acessibilidade'
      >
        <Eye className='h-5 w-5' />
      </Button>
    );
  }

  return (
    <Card className='fixed bottom-4 right-4 z-50 w-80 max-h-96 overflow-y-auto shadow-xl'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg'>Acessibilidade</CardTitle>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setAccessibilityPanelOpen(false)}
            aria-label='Fechar painel de acessibilidade'
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Visual Accessibility */}
        <div>
          <h4 className='font-medium text-sm mb-3 flex items-center gap-2'>
            <Eye className='h-4 w-4' />
            Visual
          </h4>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <label htmlFor='high-contrast' className='text-sm'>
                Alto contraste
              </label>
              <Switch
                id='high-contrast'
                checked={preferences.highContrast}
                onCheckedChange={checked => updatePreference('highContrast', checked)}
              />
            </div>

            <div className='flex items-center justify-between'>
              <label htmlFor='large-fonts' className='text-sm'>
                Fonte grande
              </label>
              <Switch
                id='large-fonts'
                checked={preferences.largeFonts}
                onCheckedChange={checked => updatePreference('largeFonts', checked)}
              />
            </div>

            <div className='space-y-2'>
              <label
                htmlFor='font-size'
                className='text-sm flex items-center gap-2'
              >
                <Type className='h-3 w-3' />
                Tamanho da fonte: {preferences.fontSize}px
              </label>
              <Slider
                id='font-size'
                min={12}
                max={24}
                step={1}
                value={[preferences.fontSize]}
                onValueChange={value => updatePreference('fontSize', value[0])}
                className='w-full'
              />
            </div>

            <div className='flex items-center justify-between'>
              <label
                htmlFor='dark-mode'
                className='text-sm flex items-center gap-2'
              >
                {preferences.darkMode ? <Moon className='h-3 w-3' /> : <Sun className='h-3 w-3' />}
                Modo escuro
              </label>
              <Switch
                id='dark-mode'
                checked={preferences.darkMode}
                onCheckedChange={checked => updatePreference('darkMode', checked)}
              />
            </div>

            <div className='flex items-center justify-between'>
              <label htmlFor='reduce-motion' className='text-sm'>
                Reduzir movimento
              </label>
              <Switch
                id='reduce-motion'
                checked={preferences.reduceMotion}
                onCheckedChange={checked => updatePreference('reduceMotion', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Motor Accessibility */}
        <div>
          <h4 className='font-medium text-sm mb-3 flex items-center gap-2'>
            <MousePointer className='h-4 w-4' />
            Motor
          </h4>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <label htmlFor='larger-touch' className='text-sm'>
                Alvos de toque maiores
              </label>
              <Switch
                id='larger-touch'
                checked={preferences.largerTouchTargets}
                onCheckedChange={checked => updatePreference('largerTouchTargets', checked)}
              />
            </div>

            <div className='space-y-2'>
              <label htmlFor='click-delay' className='text-sm'>
                Atraso do clique: {preferences.clickDelay}ms
              </label>
              <Slider
                id='click-delay'
                min={0}
                max={1000}
                step={100}
                value={[preferences.clickDelay]}
                onValueChange={value => updatePreference('clickDelay', value[0])}
                className='w-full'
              />
            </div>

            <div className='flex items-center justify-between'>
              <label htmlFor='sticky-keys' className='text-sm'>
                Teclas de aderência
              </label>
              <Switch
                id='sticky-keys'
                checked={preferences.stickyKeys}
                onCheckedChange={checked => updatePreference('stickyKeys', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Cognitive Accessibility */}
        <div>
          <h4 className='font-medium text-sm mb-3 flex items-center gap-2'>
            <Keyboard className='h-4 w-4' />
            Cognitivo
          </h4>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <label htmlFor='simplified-ui' className='text-sm'>
                Interface simplificada
              </label>
              <Switch
                id='simplified-ui'
                checked={preferences.simplifiedUI}
                onCheckedChange={checked => updatePreference('simplifiedUI', checked)}
              />
            </div>

            <div className='flex items-center justify-between'>
              <label htmlFor='screen-reader' className='text-sm'>
                Leitor de tela
              </label>
              <Switch
                id='screen-reader'
                checked={preferences.screenReader}
                onCheckedChange={checked => updatePreference('screenReader', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Audio Accessibility */}
        <div>
          <h4 className='font-medium text-sm mb-3 flex items-center gap-2'>
            <Volume2 className='h-4 w-4' />
            Áudio
          </h4>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <label htmlFor='sound-effects' className='text-sm'>
                Efeitos sonoros
              </label>
              <Switch
                id='sound-effects'
                checked={preferences.soundEffects}
                onCheckedChange={checked => updatePreference('soundEffects', checked)}
              />
            </div>

            <div className='flex items-center justify-between'>
              <label htmlFor='voice-announcements' className='text-sm'>
                Anúncios por voz
              </label>
              <Switch
                id='voice-announcements'
                checked={preferences.voiceAnnouncements}
                onCheckedChange={checked => updatePreference('voiceAnnouncements', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Reset Button */}
        <Button
          onClick={resetPreferences}
          variant='outline'
          className='w-full'
          size='sm'
        >
          <RotateCcw className='mr-2 h-4 w-4' />
          Restaurar Padrões
        </Button>
      </CardContent>
    </Card>
  );
};

// Accessibility Provider Component
interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({
  children,
}: AccessibilityProviderProps) {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);
  const [isAccessibilityPanelOpen, setAccessibilityPanelOpen] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem(
      'neonpro-accessibility-preferences',
    );
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences({ ...defaultPreferences, ...parsed });
      } catch (_error) {
        console.error('Error loading accessibility preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem(
      'neonpro-accessibility-preferences',
      JSON.stringify(preferences),
    );
  }, [preferences]);

  // Apply accessibility preferences to DOM
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    root.style.setProperty(
      '--accessibility-font-size',
      `${preferences.fontSize}px`,
    );

    // High contrast
    root.classList.toggle(
      'accessibility-high-contrast',
      preferences.highContrast,
    );

    // Large fonts
    root.classList.toggle('accessibility-large-fonts', preferences.largeFonts);

    // Dark mode
    root.classList.toggle('dark', preferences.darkMode);

    // Reduce motion
    root.classList.toggle(
      'accessibility-reduce-motion',
      preferences.reduceMotion,
    );

    // Larger touch targets
    root.classList.toggle(
      'accessibility-large-touch',
      preferences.largerTouchTargets,
    );

    // Simplified UI
    root.classList.toggle('accessibility-simplified', preferences.simplifiedUI);

    // CSS custom properties for preferences
    root.style.setProperty(
      '--accessibility-click-delay',
      `${preferences.clickDelay}ms`,
    );
  }, [preferences]);

  // Detect system preferences
  useEffect(() => {
    // Detect prefers-reduced-motion
    const reduceMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    if (reduceMotionQuery.matches) {
      updatePreference('reduceMotion', true);
    }

    // Detect prefers-color-scheme
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (darkModeQuery.matches) {
      updatePreference('darkMode', true);
    }

    // Detect high contrast
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    if (highContrastQuery.matches) {
      updatePreference('highContrast', true);
    }
  }, []);

  const updatePreference = <K extends keyof AccessibilityPreferences>(
    key: K,
    value: AccessibilityPreferences[K],
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    announceToScreenReader(
      'Configurações de acessibilidade restauradas para os valores padrão',
    );
  };

  const announceToScreenReader = (message: string) => {
    const event = new CustomEvent('accessibility-announce', {
      detail: message,
    });
    window.dispatchEvent(event);
  };

  const contextValue: AccessibilityContextType = {
    preferences,
    updatePreference,
    resetPreferences,
    announceToScreenReader,
    isAccessibilityPanelOpen,
    setAccessibilityPanelOpen,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <div
        className={cn(
          'accessibility-provider',
          preferences.highContrast && 'accessibility-high-contrast',
          preferences.largeFonts && 'accessibility-large-fonts',
          preferences.largerTouchTargets && 'accessibility-large-touch',
          preferences.simplifiedUI && 'accessibility-simplified',
          preferences.reduceMotion && 'accessibility-reduce-motion',
        )}
      >
        {children}
        <ScreenReaderAnnouncer />
        <AccessibilityPanel />
      </div>
    </AccessibilityContext.Provider>
  );
}

// Hook to use accessibility context
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider',
    );
  }
  return context;
}

// HOC for accessible components
export function withAccessibility<P extends object>(
  Component: React.ComponentType<P>,
) {
  const AccessibleComponent = (props: P) => {
    const { preferences, announceToScreenReader } = useAccessibility();

    return (
      <Component
        {...props}
        accessibilityPreferences={preferences}
        announceToScreenReader={announceToScreenReader}
      />
    );
  };

  AccessibleComponent.displayName = `withAccessibility(${Component.displayName || Component.name})`;

  return AccessibleComponent;
}

// Keyboard navigation hook
export function useKeyboardNavigation() {
  const { preferences } = useAccessibility();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Add keyboard delay if enabled
      if (preferences.slowKeys && preferences.clickDelay > 0) {
        setTimeout(() => {
          // Process key after delay
        }, preferences.clickDelay);
      }

      // Handle escape key for closing modals/panels
      if (event.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement?.getAttribute('role') === 'dialog') {
          activeElement.blur();
        }
      }

      // Handle tab navigation enhancements
      if (event.key === 'Tab') {
        // Ensure visible focus indicators
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      // Remove keyboard navigation class when using mouse
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [preferences.slowKeys, preferences.clickDelay]);
}

// Focus management hook
export function useFocusManagement() {
  const { announceToScreenReader } = useAccessibility();

  const trapFocus = (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  };

  const moveFocusTo = (selector: string, announceText?: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      if (announceText) {
        announceToScreenReader(announceText);
      }
    }
  };

  return { trapFocus, moveFocusTo };
}

export default AccessibilityProvider;
