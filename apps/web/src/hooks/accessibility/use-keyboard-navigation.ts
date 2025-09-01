"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  description: string;
  action: () => void;
  priority: "emergency" | "medical" | "standard";
}

interface FocusableElement {
  element: HTMLElement;
  priority: "emergency" | "medical" | "standard";
  context?: string;
}

interface UseKeyboardNavigationProps {
  onEmergencyTrigger?: () => void;
  onVoiceToggle?: () => void;
  onClearChat?: () => void;
  onShowHelp?: () => void;
  emergencyMode?: boolean;
  disabled?: boolean;
}

export function useKeyboardNavigation({
  onEmergencyTrigger,
  onVoiceToggle,
  onClearChat,
  onShowHelp,
  emergencyMode = false,
  disabled = false,
}: UseKeyboardNavigationProps = {}) {
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);
  const [announcementText, setAnnouncementText] = useState("");
  const focusableElementsRef = useRef<FocusableElement[]>([]);
  const shortcutsRef = useRef<KeyboardShortcut[]>([]);

  // Announce text to screen readers
  const announce = useCallback((text: string, priority: "polite" | "assertive" = "polite") => {
    setAnnouncementText(text);

    // Clear after announcement
    setTimeout(() => setAnnouncementText(""), 1000);

    // Also use native screen reader API if available
    if ("speechSynthesis" in window && priority === "assertive") {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.volume = 0.1; // Low volume for accessibility
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Define keyboard shortcuts
  const initializeShortcuts = useCallback(() => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: "e",
        ctrlKey: true,
        description: "Ativar modo de emergência médica",
        priority: "emergency",
        action: () => {
          if (onEmergencyTrigger) {
            onEmergencyTrigger();
            announce("Modo de emergência ativado. Conectando com médico de plantão.", "assertive");
          }
        },
      },
      {
        key: "E",
        altKey: true,
        description: "Ativar modo de emergência (alternativo)",
        priority: "emergency",
        action: () => {
          if (onEmergencyTrigger) {
            onEmergencyTrigger();
            announce("Emergência médica ativada via teclado.", "assertive");
          }
        },
      },
      {
        key: "m",
        ctrlKey: true,
        description: "Alternar reconhecimento de voz",
        priority: "medical",
        action: () => {
          if (onVoiceToggle) {
            onVoiceToggle();
            announce("Reconhecimento de voz alternado.", "polite");
          }
        },
      },
      {
        key: "l",
        ctrlKey: true,
        description: "Limpar histórico do chat",
        priority: "standard",
        action: () => {
          if (onClearChat) {
            onClearChat();
            announce("Histórico do chat limpo.", "polite");
          }
        },
      },
      {
        key: "/",
        ctrlKey: true,
        description: "Mostrar ajuda de atalhos do teclado",
        priority: "standard",
        action: () => {
          setIsHelpVisible(prev => !prev);
          announce(
            isHelpVisible
              ? "Ajuda de atalhos fechada."
              : "Ajuda de atalhos aberta. Use Tab para navegar e Escape para fechar.",
            "polite",
          );
        },
      },
      {
        key: "?",
        description: "Mostrar ajuda (alternativo)",
        priority: "standard",
        action: () => {
          if (onShowHelp) {
            onShowHelp();
          } else {
            setIsHelpVisible(prev => !prev);
          }
          announce("Menu de ajuda para navegação por teclado.", "polite");
        },
      },
      {
        key: "Escape",
        description: "Sair do modo de emergência ou fechar overlays",
        priority: "emergency",
        action: () => {
          if (emergencyMode && onEmergencyTrigger) {
            // This would typically be a different function to exit emergency mode
            announce("Saindo do modo de emergência.", "assertive");
          }

          if (isHelpVisible) {
            setIsHelpVisible(false);
            announce("Ajuda de atalhos fechada.", "polite");
          }
        },
      },
    ];

    // Filter out shortcuts without handlers
    shortcutsRef.current = shortcuts.filter(shortcut => {
      if (shortcut.priority === "emergency" && !onEmergencyTrigger) return false;
      if (shortcut.key === "m" && !onVoiceToggle) return false;
      if (shortcut.key === "l" && !onClearChat) return false;
      return true;
    });
  }, [
    onEmergencyTrigger,
    onVoiceToggle,
    onClearChat,
    onShowHelp,
    emergencyMode,
    isHelpVisible,
    announce,
  ]);

  // Get focusable elements in priority order
  const getFocusableElements = useCallback((): FocusableElement[] => {
    const selectors = [
      // Emergency elements (highest priority)
      '[data-emergency="true"]',
      'button[aria-label*="EMERGÊNCIA"]',
      'button[aria-label*="emergência"]',

      // Medical elements (medium priority)
      '[data-medical="true"]',
      'input[aria-label*="médico"]',
      'button[aria-label*="médico"]',
      'button[aria-label*="voz"]',

      // Standard focusable elements
      "button:not([disabled])",
      "input:not([disabled])",
      "textarea:not([disabled])",
      "select:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
      "a[href]",
    ];

    const elements: FocusableElement[] = [];

    selectors.forEach((selector, index) => {
      const found = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
      found.forEach(element => {
        // Skip if already added
        if (elements.some(el => el.element === element)) return;

        let priority: "emergency" | "medical" | "standard" = "standard";
        let context = "";

        if (index < 3) {
          priority = "emergency";
          context = "emergency";
        } else if (index < 6) {
          priority = "medical";
          context = "medical";
        }

        elements.push({ element, priority, context });
      });
    });

    // Sort by priority: emergency first, then medical, then standard
    return elements.sort((a, b) => {
      const priorityOrder = { emergency: 0, medical: 1, standard: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    // Don't interfere with input fields unless it's an emergency shortcut
    const isInputFocused = document.activeElement?.tagName === "INPUT"
      || document.activeElement?.tagName === "TEXTAREA";

    if (isInputFocused && !event.ctrlKey && !event.altKey && event.key !== "Escape") {
      return;
    }

    // Check for keyboard shortcuts
    const shortcut = shortcutsRef.current.find(s =>
      s.key === event.key
      && !!s.ctrlKey === event.ctrlKey
      && !!s.altKey === event.altKey
      && !!s.shiftKey === event.shiftKey
    );

    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();

      // Emergency shortcuts have highest priority
      if (shortcut.priority === "emergency") {
        shortcut.action();
        return;
      }

      // Only allow medical/standard shortcuts if not in an input
      if (!isInputFocused) {
        shortcut.action();
      }
    }

    // Handle Tab navigation for focus management
    if (event.key === "Tab" && !isInputFocused) {
      const focusableElements = getFocusableElements();
      focusableElementsRef.current = focusableElements;

      // If in emergency mode, prioritize emergency elements
      if (emergencyMode) {
        const emergencyElements = focusableElements.filter(el => el.priority === "emergency");
        if (emergencyElements.length > 0) {
          // Custom tab handling for emergency mode would go here
          announce(
            "Modo de emergência ativo. Use Tab para navegar entre controles de emergência.",
            "assertive",
          );
        }
      }
    }
  }, [disabled, getFocusableElements, emergencyMode, announce]);

  // Focus management functions
  const focusElement = useCallback((element: HTMLElement, reason?: string) => {
    if (element && element.focus) {
      element.focus();
      setFocusedElement(element);

      if (reason) {
        announce(`Foco movido para ${reason}`, "polite");
      }
    }
  }, [announce]);

  const focusFirstEmergencyElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    const emergencyElement = focusableElements.find(el => el.priority === "emergency");

    if (emergencyElement) {
      focusElement(emergencyElement.element, "controle de emergência");
      return true;
    }
    return false;
  }, [getFocusableElements, focusElement]);

  const focusFirstMedicalElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    const medicalElement = focusableElements.find(el => el.priority === "medical");

    if (medicalElement) {
      focusElement(medicalElement.element, "controle médico");
      return true;
    }
    return false;
  }, [getFocusableElements, focusElement]);

  // Initialize shortcuts on mount and when dependencies change
  useEffect(() => {
    initializeShortcuts();
  }, [initializeShortcuts]);

  // Add global keyboard listener
  useEffect(() => {
    if (disabled) return;

    document.addEventListener("keydown", handleKeyDown, { passive: false });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, disabled]);

  // Focus management for emergency mode
  useEffect(() => {
    if (emergencyMode) {
      // Auto-focus first emergency element when emergency mode activates
      focusFirstEmergencyElement();
    }
  }, [emergencyMode, focusFirstEmergencyElement]);

  // Generate keyboard shortcuts help content
  const getKeyboardShortcutsHelp = useCallback(() => {
    return shortcutsRef.current.map(shortcut => ({
      key: shortcut.key,
      modifiers: [
        shortcut.ctrlKey ? "Ctrl" : "",
        shortcut.altKey ? "Alt" : "",
        shortcut.shiftKey ? "Shift" : "",
      ].filter(Boolean),
      description: shortcut.description,
      priority: shortcut.priority,
    }));
  }, []);

  return {
    // State
    isHelpVisible,
    focusedElement,
    announcementText,

    // Actions
    announce,
    focusElement,
    focusFirstEmergencyElement,
    focusFirstMedicalElement,

    // Keyboard shortcuts
    shortcuts: getKeyboardShortcutsHelp(),

    // Help dialog controls
    showHelp: () => setIsHelpVisible(true),
    hideHelp: () => setIsHelpVisible(false),
    toggleHelp: () => setIsHelpVisible(prev => !prev),
  };
}

export default useKeyboardNavigation;
