"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessibilityProvider = AccessibilityProvider;
exports.useAccessibility = useAccessibility;
exports.useKeyboardNavigation = useKeyboardNavigation;
exports.useRovingTabIndex = useRovingTabIndex;
var react_1 = require("react");
var AccessibilityContext = (0, react_1.createContext)(undefined);
function AccessibilityProvider(_a) {
  var children = _a.children;
  var _b = (0, react_1.useState)(false),
    isHighContrast = _b[0],
    setIsHighContrast = _b[1];
  var _c = (0, react_1.useState)(false),
    reduceMotion = _c[0],
    setReduceMotion = _c[1];
  var _d = (0, react_1.useState)("normal"),
    fontSize = _d[0],
    setFontSize = _d[1];
  var announceRef = (0, react_1.useRef)(null);
  (0, react_1.useEffect)(function () {
    // Detect high contrast preference
    var highContrastQuery = window.matchMedia("(prefers-contrast: high)");
    setIsHighContrast(highContrastQuery.matches);
    var handleHighContrastChange = function (e) {
      setIsHighContrast(e.matches);
    };
    highContrastQuery.addEventListener("change", handleHighContrastChange);
    // Detect reduced motion preference
    var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(motionQuery.matches);
    var handleMotionChange = function (e) {
      setReduceMotion(e.matches);
    };
    motionQuery.addEventListener("change", handleMotionChange);
    // Load font size preference
    var savedFontSize = localStorage.getItem("neonpro-font-size") || "normal";
    setFontSize(savedFontSize);
    document.documentElement.setAttribute("data-font-size", savedFontSize);
    return function () {
      highContrastQuery.removeEventListener("change", handleHighContrastChange);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);
  var announceToScreenReader = function (message, priority) {
    if (priority === void 0) {
      priority = "polite";
    }
    if (announceRef.current) {
      // Clear previous message
      announceRef.current.textContent = "";
      // Add new message after a brief delay to ensure it's announced
      setTimeout(function () {
        if (announceRef.current) {
          announceRef.current.textContent = message;
          announceRef.current.setAttribute("aria-live", priority);
        }
      }, 100);
    }
  };
  var setFocusOn = function (element) {
    var targetElement =
      typeof element === "string"
        ? document.getElementById(element) || document.querySelector(element)
        : element;
    if (targetElement && targetElement instanceof HTMLElement) {
      // Ensure element is focusable
      if (
        !targetElement.hasAttribute("tabindex") &&
        !["INPUT", "BUTTON", "SELECT", "TEXTAREA", "A"].includes(targetElement.tagName)
      ) {
        targetElement.setAttribute("tabindex", "-1");
      }
      targetElement.focus();
      // Scroll into view if necessary
      targetElement.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "nearest",
      });
    }
  };
  var trapFocus = function (container) {
    var focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    var firstFocusable = focusableElements[0];
    var lastFocusable = focusableElements[focusableElements.length - 1];
    var handleKeyDown = function (e) {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable === null || lastFocusable === void 0 ? void 0 : lastFocusable.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable === null || firstFocusable === void 0 ? void 0 : firstFocusable.focus();
          }
        }
      }
      if (e.key === "Escape") {
        // Allow escape to break focus trap for dialogs
        var closeButton = container.querySelector("[data-close-modal]");
        if (closeButton) {
          closeButton.click();
        }
      }
    };
    container.addEventListener("keydown", handleKeyDown);
    // Focus the first element when trap is activated
    if (firstFocusable) {
      firstFocusable.focus();
    }
    // Return cleanup function
    return function () {
      container.removeEventListener("keydown", handleKeyDown);
    };
  };
  var handleFontSizeChange = function (newSize) {
    setFontSize(newSize);
    localStorage.setItem("neonpro-font-size", newSize);
    document.documentElement.setAttribute("data-font-size", newSize);
    announceToScreenReader(
      "Tamanho da fonte alterado para ".concat(
        newSize === "normal" ? "normal" : newSize === "large" ? "grande" : "extra grande",
      ),
    );
  };
  var value = {
    announceToScreenReader: announceToScreenReader,
    setFocusOn: setFocusOn,
    trapFocus: trapFocus,
    isHighContrast: isHighContrast,
    reduceMotion: reduceMotion,
    fontSize: fontSize,
    setFontSize: handleFontSizeChange,
  };
  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Screen reader announcement region */}
      <div
        ref={announceRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />
    </AccessibilityContext.Provider>
  );
}
function useAccessibility() {
  var context = (0, react_1.useContext)(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
// Hook for keyboard navigation
function useKeyboardNavigation() {
  var handleArrowNavigation = function (e, items, currentIndex, onIndexChange, options) {
    var _a, _b, _c, _d;
    if (options === void 0) {
      options = {};
    }
    var _e = options.horizontal,
      horizontal = _e === void 0 ? false : _e,
      _f = options.wrap,
      wrap = _f === void 0 ? true : _f,
      enterAction = options.enterAction;
    switch (e.key) {
      case horizontal ? "ArrowLeft" : "ArrowUp":
        e.preventDefault();
        var prevIndex =
          currentIndex > 0 ? currentIndex - 1 : wrap ? items.length - 1 : currentIndex;
        onIndexChange(prevIndex);
        (_a = items[prevIndex]) === null || _a === void 0 ? void 0 : _a.focus();
        break;
      case horizontal ? "ArrowRight" : "ArrowDown":
        e.preventDefault();
        var nextIndex =
          currentIndex < items.length - 1 ? currentIndex + 1 : wrap ? 0 : currentIndex;
        onIndexChange(nextIndex);
        (_b = items[nextIndex]) === null || _b === void 0 ? void 0 : _b.focus();
        break;
      case "Home":
        e.preventDefault();
        onIndexChange(0);
        (_c = items[0]) === null || _c === void 0 ? void 0 : _c.focus();
        break;
      case "End":
        e.preventDefault();
        var lastIndex = items.length - 1;
        onIndexChange(lastIndex);
        (_d = items[lastIndex]) === null || _d === void 0 ? void 0 : _d.focus();
        break;
      case "Enter":
      case " ":
        if (enterAction) {
          e.preventDefault();
          enterAction();
        }
        break;
    }
  };
  return { handleArrowNavigation: handleArrowNavigation };
}
// Hook for managing roving tabindex
function useRovingTabIndex(items, activeIndex) {
  if (activeIndex === void 0) {
    activeIndex = 0;
  }
  (0, react_1.useEffect)(
    function () {
      items.forEach(function (item, index) {
        if (index === activeIndex) {
          item.setAttribute("tabindex", "0");
        } else {
          item.setAttribute("tabindex", "-1");
        }
      });
    },
    [items, activeIndex],
  );
}
