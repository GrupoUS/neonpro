import { useEffect, useRef, useState } from 'react';

/**
 * Hook for managing focus accessibility in healthcare applications
 * Provides WCAG 2.1 AA+ compliant focus management
 */
export function useFocusManagement<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null);

  /**
   * Trap focus within a container (for modals, dialogs, etc.)
   */
  const trapFocus = useCallback(() => {
    const container = ref.current;
    if (!container) return;

    // Save current focused element
    setLastFocusedElement(document.activeElement as HTMLElement);

    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as HTMLElement[];

    if (focusableElements.length === 0) return;

    // Focus first element
    const firstElement = focusableElements[0];
    firstElement.focus();

    // Handle tab key to trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab on first element -> focus last element
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } // Tab on last element -> focus first element
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  /**
   * Restore focus to last focused element
   */
  const restoreFocus = useCallback(() => {
    if (lastFocusedElement) {
      lastFocusedElement.focus();
      setLastFocusedElement(null);
    }
  }, [lastFocusedElement]);

  /**
   * Focus first element in container
   */
  const focusFirst = useCallback(() => {
    const container = ref.current;
    if (!container) return;

    const firstFocusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as HTMLElement;

    if (firstFocusable) {
      firstFocusable.focus();
    }
  }, []);

  /**
   * Focus last element in container
   */
  const focusLast = useCallback(() => {
    const container = ref.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as HTMLElement[];

    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, []);

  return {
    ref,
    trapFocus,
    restoreFocus,
    focusFirst,
    focusLast,
    lastFocusedElement,
  };
}

/**
 * Hook for managing ARIA announcements for screen readers
 */
export function useScreenReaderAnnouncer() {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, { message, priority, timestamp: Date.now() }]);

    // Clear after announcement
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 1000);
  }, []);

  const announcePolite = useCallback((message: string) => {
    announce(message, 'polite');
  }, [announce]);

  const announceAssertive = useCallback((message: string) => {
    announce(message, 'assertive');
  }, [announce]);

  return {
    announce,
    announcePolite,
    announceAssertive,
    announcements,
  };
}

/**
 * Hook for keyboard navigation support
 */
export function useKeyboardNavigation(
  onEnter?: () => void,
  onSpace?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void,
  onHome?: () => void,
  onEnd?: () => void,
  onTab?: (e: KeyboardEvent) => void,
  onShiftTab?: (e: KeyboardEvent) => void,
) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        onEnter?.();
        break;
      case ' ':
        e.preventDefault();
        onSpace?.();
        break;
      case 'Escape':
        e.preventDefault();
        onEscape?.();
        break;
      case 'ArrowUp':
        e.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        e.preventDefault();
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        e.preventDefault();
        onArrowRight?.();
        break;
      case 'Home':
        e.preventDefault();
        onHome?.();
        break;
      case 'End':
        e.preventDefault();
        onEnd?.();
        break;
      case 'Tab':
        if (e.shiftKey) {
          onShiftTab?.(e);
        } else {
          onTab?.(e);
        }
        break;
    }
  }, [
    onEnter,
    onSpace,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onHome,
    onEnd,
    onTab,
    onShiftTab,
  ]);

  return { handleKeyDown };
}
