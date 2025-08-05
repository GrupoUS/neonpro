// hooks/appointments/use-keyboard-shortcuts.ts
// Global keyboard shortcuts hook for appointments
// Story 1.1 Task 8 - Accessibility and Keyboard Navigation
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useKeyboardShortcuts = useKeyboardShortcuts;
var navigation_1 = require("next/navigation");
var react_1 = require("react");
function useKeyboardShortcuts(_a) {
  var _b = _a === void 0 ? {} : _a,
    onRefresh = _b.onRefresh,
    onToggleFilters = _b.onToggleFilters,
    onNewAppointment = _b.onNewAppointment,
    onCloseDialog = _b.onCloseDialog,
    onShowHelp = _b.onShowHelp;
  var _c = (0, react_1.useState)(true),
    isEnabled = _c[0],
    setIsEnabled = _c[1];
  var _d = (0, react_1.useState)(false),
    showHelp = _d[0],
    setShowHelp = _d[1];
  var router = (0, navigation_1.useRouter)();
  // Define keyboard shortcuts
  var shortcuts = [
    {
      key: "n",
      ctrlKey: true,
      description: "Criar novo agendamento",
      action: (0, react_1.useCallback)(() => {
        if (onNewAppointment) {
          onNewAppointment();
        } else {
          router.push("/dashboard/appointments/new");
        }
      }, [onNewAppointment, router]),
    },
    {
      key: "f",
      description: "Alternar filtros",
      action: (0, react_1.useCallback)(() => {
        onToggleFilters === null || onToggleFilters === void 0 ? void 0 : onToggleFilters();
      }, [onToggleFilters]),
    },
    {
      key: "r",
      description: "Atualizar agendamentos",
      action: (0, react_1.useCallback)(() => {
        onRefresh === null || onRefresh === void 0 ? void 0 : onRefresh();
      }, [onRefresh]),
    },
    {
      key: "Escape",
      description: "Fechar diálogos e modais",
      action: (0, react_1.useCallback)(() => {
        onCloseDialog === null || onCloseDialog === void 0 ? void 0 : onCloseDialog();
      }, [onCloseDialog]),
    },
    {
      key: "?",
      shiftKey: true,
      description: "Mostrar atalhos de teclado",
      action: (0, react_1.useCallback)(() => {
        if (onShowHelp) {
          onShowHelp();
        } else {
          setShowHelp((prev) => !prev);
        }
      }, [onShowHelp]),
    },
  ];
  // Handle keydown events
  var handleKeyDown = (0, react_1.useCallback)(
    (event) => {
      // Don't handle shortcuts when typing in input fields
      var target = event.target;
      if (
        !isEnabled ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        return;
      }
      var matchingShortcut = shortcuts.find(
        (shortcut) =>
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.altKey === event.altKey &&
          !!shortcut.shiftKey === event.shiftKey,
      );
      if (matchingShortcut) {
        event.preventDefault();
        event.stopPropagation();
        matchingShortcut.action();
      }
    },
    [isEnabled, shortcuts],
  );
  // Set up event listeners
  (0, react_1.useEffect)(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [handleKeyDown]);
  // Format shortcut key for display
  var formatShortcut = (shortcut) => {
    var parts = [];
    if (shortcut.ctrlKey) parts.push("Ctrl");
    if (shortcut.altKey) parts.push("Alt");
    if (shortcut.shiftKey) parts.push("Shift");
    var key = shortcut.key === "?" ? "?" : shortcut.key.toUpperCase();
    parts.push(key);
    return parts.join(" + ");
  };
  return {
    shortcuts: shortcuts,
    isEnabled: isEnabled,
    setIsEnabled: setIsEnabled,
    showHelp: showHelp,
    setShowHelp: setShowHelp,
    formatShortcut: formatShortcut,
  };
}
