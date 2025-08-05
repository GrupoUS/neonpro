/**
 * NeonPro - Keyboard Navigation Provider
 * Enhanced keyboard navigation system for healthcare application
 *
 * Features:
 * - Skip links for main sections
 * - Roving tabindex for complex widgets
 * - Arrow key navigation
 * - Focus trap management
 * - Screen reader announcements
 * - Healthcare-specific shortcuts
 */
'use client';
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkipLinks = SkipLinks;
exports.KeyboardNavigationProvider = KeyboardNavigationProvider;
exports.useKeyboardNavigation = useKeyboardNavigation;
exports.useRovingTabindex = useRovingTabindex;
exports.useArrowNavigation = useArrowNavigation;
exports.useFocusTrap = useFocusTrap;
exports.AccessibleMenu = AccessibleMenu;
exports.AccessibleBreadcrumb = AccessibleBreadcrumb;
exports.AccessibleTabs = AccessibleTabs;
var use_translation_1 = require("@/hooks/use-translation");
var accessibility_utils_1 = require("@/lib/accessibility/accessibility-utils");
var utils_1 = require("@/lib/utils");
var react_1 = require("react");
var KeyboardNavigationContext = (0, react_1.createContext)(undefined);
/**
 * Skip Links Component
 * Essential for keyboard users to quickly navigate to main content
 */
function SkipLinks() {
    var t = (0, use_translation_1.useTranslation)().t;
    return (<div className="sr-only focus-within:not-sr-only fixed top-0 left-0 z-50 bg-primary text-primary-foreground p-2 space-x-2" role="navigation" aria-label="Links de navegação rápida">
      <a href="#main-content" className="inline-block px-4 py-2 bg-primary-foreground text-primary rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" onClick={function (e) {
            e.preventDefault();
            var element = document.getElementById('main-content');
            element === null || element === void 0 ? void 0 : element.focus();
            element === null || element === void 0 ? void 0 : element.scrollIntoView({ behavior: 'smooth' });
            (0, accessibility_utils_1.announceToScreenReader)(t('accessibility.skipToContent'), 'assertive');
        }}>
        {t('accessibility.skipToContent')}
      </a>
      <a href="#main-navigation" className="inline-block px-4 py-2 bg-primary-foreground text-primary rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" onClick={function (e) {
            e.preventDefault();
            var element = document.getElementById('main-navigation');
            element === null || element === void 0 ? void 0 : element.focus();
            element === null || element === void 0 ? void 0 : element.scrollIntoView({ behavior: 'smooth' });
            (0, accessibility_utils_1.announceToScreenReader)(t('accessibility.skipToNavigation'), 'assertive');
        }}>
        {t('accessibility.skipToNavigation')}
      </a>
      <a href="#search" className="inline-block px-4 py-2 bg-primary-foreground text-primary rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" onClick={function (e) {
            e.preventDefault();
            var element = document.getElementById('search');
            element === null || element === void 0 ? void 0 : element.focus();
            element === null || element === void 0 ? void 0 : element.scrollIntoView({ behavior: 'smooth' });
            (0, accessibility_utils_1.announceToScreenReader)(t('accessibility.skipToSearch'), 'assertive');
        }}>
        {t('accessibility.skipToSearch')}
      </a>
    </div>);
}
function KeyboardNavigationProvider(_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)([]), focusTrapStack = _b[0], setFocusTrapStack = _b[1];
    var t = (0, use_translation_1.useTranslation)().t;
    var pushFocusTrap = (0, react_1.useCallback)(function (element) {
        setFocusTrapStack(function (prev) { return __spreadArray(__spreadArray([], prev, true), [element], false); });
    }, []);
    var popFocusTrap = (0, react_1.useCallback)(function () {
        setFocusTrapStack(function (prev) { return prev.slice(0, -1); });
    }, []);
    var skipToContent = (0, react_1.useCallback)(function () {
        var element = document.getElementById('main-content');
        if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth' });
            (0, accessibility_utils_1.announceToScreenReader)(t('accessibility.skipToContent'), 'assertive');
        }
    }, [t]);
    var skipToNavigation = (0, react_1.useCallback)(function () {
        var element = document.getElementById('main-navigation');
        if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth' });
            (0, accessibility_utils_1.announceToScreenReader)(t('accessibility.skipToNavigation'), 'assertive');
        }
    }, [t]);
    var skipToSearch = (0, react_1.useCallback)(function () {
        var element = document.getElementById('search');
        if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth' });
            (0, accessibility_utils_1.announceToScreenReader)(t('accessibility.skipToSearch'), 'assertive');
        }
    }, [t]);
    var announceNavigation = (0, react_1.useCallback)(function (message) {
        (0, accessibility_utils_1.announceToScreenReader)(message, 'assertive');
    }, []);
    // Global keyboard shortcuts
    (0, react_1.useEffect)(function () {
        var handleKeyDown = function (event) {
            // Alt + 1: Skip to main content
            if (event.altKey && event.key === '1') {
                event.preventDefault();
                skipToContent();
                return;
            }
            // Alt + 2: Skip to navigation
            if (event.altKey && event.key === '2') {
                event.preventDefault();
                skipToNavigation();
                return;
            }
            // Alt + 3: Skip to search
            if (event.altKey && event.key === '3') {
                event.preventDefault();
                skipToSearch();
                return;
            }
            // Escape: Close modal/dropdown (handled by focus trap)
            if (event.key === accessibility_utils_1.KEYBOARD_KEYS.ESCAPE && focusTrapStack.length > 0) {
                event.preventDefault();
                var currentTrap = focusTrapStack[focusTrapStack.length - 1];
                var closeButton = currentTrap.querySelector('[data-close-button]');
                closeButton === null || closeButton === void 0 ? void 0 : closeButton.click();
                return;
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return function () { return document.removeEventListener('keydown', handleKeyDown); };
    }, [focusTrapStack, skipToContent, skipToNavigation, skipToSearch]);
    var value = {
        focusTrapStack: focusTrapStack,
        pushFocusTrap: pushFocusTrap,
        popFocusTrap: popFocusTrap,
        skipToContent: skipToContent,
        skipToNavigation: skipToNavigation,
        skipToSearch: skipToSearch,
        announceNavigation: announceNavigation,
    };
    return (<KeyboardNavigationContext.Provider value={value}>
      <SkipLinks />
      {children}
    </KeyboardNavigationContext.Provider>);
}
/**
 * Hook to use keyboard navigation context
 */
function useKeyboardNavigation() {
    var context = (0, react_1.useContext)(KeyboardNavigationContext);
    if (context === undefined) {
        throw new Error('useKeyboardNavigation must be used within a KeyboardNavigationProvider');
    }
    return context;
}
/**
 * Roving Tabindex Hook
 * For lists and menus with arrow key navigation
 */
function useRovingTabindex(items, activeIndex) {
    (0, react_1.useEffect)(function () {
        items.forEach(function (item, index) {
            item.tabIndex = index === activeIndex ? 0 : -1;
        });
    }, [items, activeIndex]);
}
/**
 * Arrow Navigation Hook
 * Provides arrow key navigation for lists and menus
 */
function useArrowNavigation() {
    var handleArrowNavigation = (0, react_1.useCallback)(function (event, items, currentIndex, onIndexChange, options) {
        if (options === void 0) { options = {}; }
        var _a = options.circular, circular = _a === void 0 ? true : _a, _b = options.orientation, orientation = _b === void 0 ? 'vertical' : _b;
        accessibility_utils_1.KeyboardNavigation.handleArrowNavigation(event.nativeEvent, items, currentIndex, onIndexChange, circular);
    }, []);
    return handleArrowNavigation;
}
/**
 * Focus Trap Hook
 * Trap focus within a container for modals and dropdowns
 */
function useFocusTrap(isActive) {
    if (isActive === void 0) { isActive = false; }
    var containerRef = (0, react_1.useRef)(null);
    var _a = useKeyboardNavigation(), pushFocusTrap = _a.pushFocusTrap, popFocusTrap = _a.popFocusTrap;
    (0, react_1.useEffect)(function () {
        if (isActive && containerRef.current) {
            var container = containerRef.current;
            pushFocusTrap(container);
            var cleanup_1 = accessibility_utils_1.FocusManager.trapFocus({ current: container });
            return function () {
                cleanup_1 === null || cleanup_1 === void 0 ? void 0 : cleanup_1();
                popFocusTrap();
            };
        }
    }, [isActive, pushFocusTrap, popFocusTrap]);
    return containerRef;
}
function AccessibleMenu(_a) {
    var items = _a.items, _b = _a.orientation, orientation = _b === void 0 ? 'vertical' : _b, className = _a.className, onClose = _a.onClose;
    var _c = (0, react_1.useState)(0), activeIndex = _c[0], setActiveIndex = _c[1];
    var menuRef = (0, react_1.useRef)(null);
    var itemRefs = (0, react_1.useRef)([]);
    var handleArrowNavigation = useArrowNavigation();
    // Set up roving tabindex
    useRovingTabindex(itemRefs.current.filter(Boolean), activeIndex);
    var handleKeyDown = function (event) {
        var _a, _b, _c, _d;
        var validItems = itemRefs.current.filter(Boolean);
        // Arrow navigation
        if ([accessibility_utils_1.KEYBOARD_KEYS.ARROW_UP, accessibility_utils_1.KEYBOARD_KEYS.ARROW_DOWN, accessibility_utils_1.KEYBOARD_KEYS.ARROW_LEFT, accessibility_utils_1.KEYBOARD_KEYS.ARROW_RIGHT].includes(event.key)) {
            handleArrowNavigation(event, validItems, activeIndex, setActiveIndex, {
                orientation: 'both',
                circular: true,
            });
            return;
        }
        // Home/End keys
        if (event.key === accessibility_utils_1.KEYBOARD_KEYS.HOME) {
            event.preventDefault();
            setActiveIndex(0);
            (_a = validItems[0]) === null || _a === void 0 ? void 0 : _a.focus();
            return;
        }
        if (event.key === accessibility_utils_1.KEYBOARD_KEYS.END) {
            event.preventDefault();
            var lastIndex = validItems.length - 1;
            setActiveIndex(lastIndex);
            (_b = validItems[lastIndex]) === null || _b === void 0 ? void 0 : _b.focus();
            return;
        }
        // Enter/Space activation
        if (event.key === accessibility_utils_1.KEYBOARD_KEYS.ENTER || event.key === accessibility_utils_1.KEYBOARD_KEYS.SPACE) {
            event.preventDefault();
            var activeItem = items[activeIndex];
            if (activeItem && !activeItem.disabled) {
                (_c = activeItem.onClick) === null || _c === void 0 ? void 0 : _c.call(activeItem);
                onClose === null || onClose === void 0 ? void 0 : onClose();
            }
            return;
        }
        // Escape to close
        if (event.key === accessibility_utils_1.KEYBOARD_KEYS.ESCAPE) {
            event.preventDefault();
            onClose === null || onClose === void 0 ? void 0 : onClose();
            return;
        }
        // Letter navigation
        if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
            var letter = event.key.toLowerCase();
            var startIndex = (activeIndex + 1) % items.length;
            for (var i = 0; i < items.length; i++) {
                var index = (startIndex + i) % items.length;
                var item = items[index];
                if (item.label.toLowerCase().startsWith(letter) && !item.disabled) {
                    setActiveIndex(index);
                    (_d = validItems[index]) === null || _d === void 0 ? void 0 : _d.focus();
                    break;
                }
            }
        }
    };
    return (<div ref={menuRef} role="menu" className={(0, utils_1.cn)('space-y-1 p-1', orientation === 'horizontal' && 'flex space-y-0 space-x-1', className)} onKeyDown={handleKeyDown}>
      {items.map(function (item, index) {
            var Icon = item.icon;
            return (<div key={item.id} ref={function (el) { itemRefs.current[index] = el; }} role="menuitem" tabIndex={index === activeIndex ? 0 : -1} className={(0, utils_1.cn)('flex items-center px-3 py-2 text-sm rounded-md cursor-pointer transition-colors', 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2', 'hover:bg-accent hover:text-accent-foreground', item.disabled && 'opacity-50 cursor-not-allowed', index === activeIndex && 'bg-accent text-accent-foreground')} aria-disabled={item.disabled} onClick={function () {
                    var _a;
                    if (!item.disabled) {
                        (_a = item.onClick) === null || _a === void 0 ? void 0 : _a.call(item);
                        onClose === null || onClose === void 0 ? void 0 : onClose();
                    }
                }} onFocus={function () { return setActiveIndex(index); }}>
            {Icon && <Icon className="mr-2 h-4 w-4"/>}
            {item.label}
          </div>);
        })}
    </div>);
}
function AccessibleBreadcrumb(_a) {
    var items = _a.items, className = _a.className;
    var t = (0, use_translation_1.useTranslation)().t;
    return (<nav aria-label="Navegação estrutural" className={(0, utils_1.cn)('flex', className)}>
      <ol className="flex items-center space-x-2">
        {items.map(function (item, index) {
            var isLast = index === items.length - 1;
            return (<li key={index} className="flex items-center">
              {index > 0 && (<span className="mx-2 text-muted-foreground" aria-hidden="true">
                  /
                </span>)}
              
              {item.href && !isLast ? (<a href={item.href} className="text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1" aria-current={item.current ? 'page' : undefined}>
                  {item.label}
                </a>) : (<span className={(0, utils_1.cn)('px-1', isLast ? 'text-foreground font-medium' : 'text-muted-foreground')} aria-current={item.current || isLast ? 'page' : undefined}>
                  {item.label}
                </span>)}
            </li>);
        })}
      </ol>
    </nav>);
}
function AccessibleTabs(_a) {
    var tabs = _a.tabs, activeTab = _a.activeTab, onTabChange = _a.onTabChange, children = _a.children, className = _a.className;
    var _b = (0, react_1.useState)(activeTab), focusedTab = _b[0], setFocusedTab = _b[1];
    var tabRefs = (0, react_1.useRef)([]);
    var handleArrowNavigation = useArrowNavigation();
    var activeIndex = tabs.findIndex(function (tab) { return tab.id === focusedTab; });
    // Set up roving tabindex
    useRovingTabindex(tabRefs.current.filter(Boolean), activeIndex);
    var handleKeyDown = function (event) {
        var validTabs = tabRefs.current.filter(Boolean);
        // Arrow key navigation
        if ([accessibility_utils_1.KEYBOARD_KEYS.ARROW_LEFT, accessibility_utils_1.KEYBOARD_KEYS.ARROW_RIGHT].includes(event.key)) {
            handleArrowNavigation(event, validTabs, activeIndex, function (newIndex) {
                var _a;
                var newTab = tabs[newIndex];
                if (newTab && !newTab.disabled) {
                    setFocusedTab(newTab.id);
                    (_a = validTabs[newIndex]) === null || _a === void 0 ? void 0 : _a.focus();
                }
            }, { orientation: 'horizontal' });
            return;
        }
        // Enter/Space to activate tab
        if (event.key === accessibility_utils_1.KEYBOARD_KEYS.ENTER || event.key === accessibility_utils_1.KEYBOARD_KEYS.SPACE) {
            event.preventDefault();
            var focusedTabData = tabs.find(function (tab) { return tab.id === focusedTab; });
            if (focusedTabData && !focusedTabData.disabled) {
                onTabChange(focusedTab);
            }
        }
    };
    return (<div className={(0, utils_1.cn)('space-y-4', className)}>
      <div role="tablist" className="flex border-b border-border" onKeyDown={handleKeyDown}>
        {tabs.map(function (tab, index) { return (<button key={tab.id} ref={function (el) { tabRefs.current[index] = el; }} role="tab" tabIndex={tab.id === focusedTab ? 0 : -1} aria-selected={tab.id === activeTab} aria-controls={"tabpanel-".concat(tab.id)} disabled={tab.disabled} className={(0, utils_1.cn)('px-4 py-2 text-sm font-medium border-b-2 transition-colors', 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2', 'hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed', tab.id === activeTab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-border')} onClick={function () {
                if (!tab.disabled) {
                    onTabChange(tab.id);
                    setFocusedTab(tab.id);
                }
            }} onFocus={function () { return setFocusedTab(tab.id); }}>
            {tab.label}
          </button>); })}
      </div>

      <div role="tabpanel" id={"tabpanel-".concat(activeTab)} aria-labelledby={activeTab} tabIndex={0} className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded">
        {children}
      </div>
    </div>);
}
