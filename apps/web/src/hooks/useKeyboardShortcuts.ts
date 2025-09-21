/**
 * Keyboard Shortcuts Hook - Provides accessible keyboard navigation
 * Essential for WCAG 2.1 AA+ compliance and healthcare accessibility
 */

'use client';

import { useEffect, useRef } from 'react';

export type KeyboardShortcutHandler = (e: KeyboardEvent) => void;

export interface KeyboardShortcuts {
  [key: string]: KeyboardShortcutHandler;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcuts,
  deps: any[] = [],
) {
  const shortcutsRef = useRef(shortcuts);

  // Update shortcuts ref when dependencies change
  useEffect(_() => {
    shortcutsRef.current = shortcuts;
  }, deps);

  useEffect(_() => {
    const handleKeyDown = (_e: any) => {
      const handler = shortcutsRef.current[e.key];
      if (handler) {
        // Prevent default behavior for handled shortcuts
        e.preventDefault();
        handler(e);
      }
    };

    // Add event listener with passive option for better performance
    window.addEventListener('keydown', handleKeyDown, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, deps); // Include dependencies to reattach when they change

  // Helper function to check if modifier keys are pressed
  const isModifierPressed = (_e: any) => {
    return e.ctrlKey || e.metaKey || e.altKey || e.shiftKey;
  };

  // Helper function to check if we're in an input field
  const isInInputField = (_target: any) => {
    const element = target as HTMLElement;
    return (
      element.tagName === 'INPUT'
      || element.tagName === 'TEXTAREA'
      || element.tagName === 'SELECT'
      || element.isContentEditable
      || element.closest('[contenteditable="true"]')
    );
  };

  return {
    isModifierPressed,
    isInInputField,
  };
}

// Enhanced version with modifier key support
export function useAdvancedKeyboardShortcuts(
  shortcuts: Record<string, KeyboardShortcutHandler>,
  options: {
    ignoreInputs?: boolean;
    preventDefault?: boolean;
    stopPropagation?: boolean;
  } = {},
  deps: any[] = [],
) {
  const {
    ignoreInputs = true,
    preventDefault = true,
    stopPropagation = false,
  } = options;
  const shortcutsRef = useRef(shortcuts);

  useEffect(_() => {
    shortcutsRef.current = shortcuts;
  }, deps);

  useEffect(_() => {
    const handleKeyDown = (_e: any) => {
      // Check if we should ignore shortcuts in input fields
      if (ignoreInputs && isInInputField(e.target)) {
        return;
      }

      // Build the shortcut key combination
      const key = [
        e.ctrlKey ? 'Ctrl+' : '',
        e.metaKey ? 'Meta+' : '',
        e.altKey ? 'Alt+' : '',
        e.shiftKey ? 'Shift+' : '',
        e.key,
      ]
        .filter(Boolean)
        .join('');

      const handler = shortcutsRef.current[key];
      if (handler) {
        if (preventDefault) {
          e.preventDefault();
        }
        if (stopPropagation) {
          e.stopPropagation();
        }
        handler(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, deps);

  return {
    shortcuts: Object.keys(shortcuts),
  };
}

// Helper function to check if we're in an input field
function isInInputField(target: EventTarget) {
  const element = target as HTMLElement;
  return (
    element.tagName === 'INPUT'
    || element.tagName === 'TEXTAREA'
    || element.tagName === 'SELECT'
    || element.isContentEditable
    || element.closest('[contenteditable="true"]')
  );
}

export default useKeyboardShortcuts;
