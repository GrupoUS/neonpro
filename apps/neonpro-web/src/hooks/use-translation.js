/**
 * NeonPro - useTranslation Hook
 * Client-side translation hook with Next.js 15 App Router support
 *
 * Features:
 * - Type-safe translation keys
 * - Parameter interpolation
 * - Locale switching
 * - Loading states
 * - Error boundaries
 */
'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationProvider = TranslationProvider;
exports.useTranslation = useTranslation;
exports.useLocale = useLocale;
exports.Translation = Translation;
exports.withTranslation = withTranslation;
exports.useTranslationNamespace = useTranslationNamespace;
exports.usePatientTranslations = usePatientTranslations;
exports.useAppointmentTranslations = useAppointmentTranslations;
exports.useServiceTranslations = useServiceTranslations;
exports.useProfessionalTranslations = useProfessionalTranslations;
exports.useSchedulingTranslations = useSchedulingTranslations;
exports.useFinancialTranslations = useFinancialTranslations;
exports.useNotificationTranslations = useNotificationTranslations;
exports.useErrorTranslations = useErrorTranslations;
exports.useSuccessTranslations = useSuccessTranslations;
exports.useLGPDTranslations = useLGPDTranslations;
exports.useAccessibilityTranslations = useAccessibilityTranslations;
exports.useFormTranslations = useFormTranslations;
exports.useA11yTranslations = useA11yTranslations;
exports.useDateTimeTranslations = useDateTimeTranslations;
exports.useNumberTranslations = useNumberTranslations;
var react_1 = require("react");
var i18n_1 = require("../lib/i18n/i18n");
var TranslationContext = (0, react_1.createContext)(undefined);
/**
 * Translation Provider Component
 * Provides translation context to child components
 */
function TranslationProvider(_a) {
    var children = _a.children, _b = _a.initialLocale, initialLocale = _b === void 0 ? i18n_1.defaultLocale : _b, initialDictionary = _a.initialDictionary;
    var _c = (0, react_1.useState)(initialLocale), locale = _c[0], setLocale = _c[1];
    var _d = (0, react_1.useState)(initialDictionary || null), dictionary = _d[0], setDictionary = _d[1];
    var _e = (0, react_1.useState)(!initialDictionary), isLoading = _e[0], setIsLoading = _e[1];
    var _f = (0, react_1.useState)(null), error = _f[0], setError = _f[1];
    // Create translator function
    var translator = dictionary ? (0, i18n_1.createTranslator)(dictionary) : function (key) { return key; };
    // Load dictionary when locale changes
    (0, react_1.useEffect)(function () {
        if (initialDictionary && locale === initialLocale) {
            return; // Use initial dictionary
        }
        setIsLoading(true);
        setError(null);
        (0, i18n_1.getDictionary)(locale)
            .then(function (dict) {
            setDictionary(dict);
            setIsLoading(false);
        })
            .catch(function (err) {
            setError(err.message);
            setIsLoading(false);
        });
    }, [locale, initialDictionary, initialLocale]);
    // Save locale preference to localStorage
    var handleSetLocale = function (newLocale) {
        setLocale(newLocale);
        try {
            localStorage.setItem('neonpro-locale', newLocale);
        }
        catch (e) {
            // Handle localStorage errors silently
            console.warn('Failed to save locale preference:', e);
        }
    };
    // Load saved locale preference on mount
    (0, react_1.useEffect)(function () {
        try {
            var savedLocale = localStorage.getItem('neonpro-locale');
            if (savedLocale && savedLocale !== initialLocale) {
                setLocale(savedLocale);
            }
        }
        catch (e) {
            // Handle localStorage errors silently
            console.warn('Failed to load locale preference:', e);
        }
    }, [initialLocale]);
    var value = {
        locale: locale,
        dictionary: dictionary,
        t: translator,
        setLocale: handleSetLocale,
        isLoading: isLoading,
        error: error,
    };
    return (<TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>);
}
/**
 * useTranslation Hook
 * Main hook for accessing translation functionality
 */
function useTranslation() {
    var context = (0, react_1.useContext)(TranslationContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a TranslationProvider');
    }
    return context;
}
/**
 * useLocale Hook
 * Simplified hook for locale management only
 */
function useLocale() {
    var _a = useTranslation(), locale = _a.locale, setLocale = _a.setLocale, isLoading = _a.isLoading;
    return {
        locale: locale,
        setLocale: setLocale,
        isLoading: isLoading,
    };
}
function Translation(_a) {
    var k = _a.k, params = _a.params, fallback = _a.fallback, children = _a.children;
    var _b = useTranslation(), t = _b.t, isLoading = _b.isLoading;
    if (isLoading) {
        return <span className="animate-pulse bg-muted w-16 h-4 rounded"/>;
    }
    var translation = t(k, params) || fallback || k;
    if (children) {
        return <>{children(translation)}</>;
    }
    return <>{translation}</>;
}
/**
 * Higher-order component for translation
 * Injects translation props into components
 */
function withTranslation(Component) {
    return function TranslatedComponent(props) {
        var t = useTranslation().t;
        return <Component {...props} t={t}/>;
    };
}
/**
 * Translation namespace hook
 * Scoped translations for specific feature areas
 */
function useTranslationNamespace(namespace) {
    var _a = useTranslation(), t = _a.t, rest = __rest(_a, ["t"]);
    var namespacedT = function (key, params) {
        return t("".concat(namespace, ".").concat(key), params);
    };
    return __assign(__assign({}, rest), { t: namespacedT, nt: namespacedT });
}
/**
 * Healthcare-specific translation hooks
 */
function usePatientTranslations() {
    return useTranslationNamespace('patients');
}
function useAppointmentTranslations() {
    return useTranslationNamespace('appointments');
}
function useServiceTranslations() {
    return useTranslationNamespace('services');
}
function useProfessionalTranslations() {
    return useTranslationNamespace('professionals');
}
function useSchedulingTranslations() {
    return useTranslationNamespace('scheduling');
}
function useFinancialTranslations() {
    return useTranslationNamespace('financial');
}
function useNotificationTranslations() {
    return useTranslationNamespace('notifications');
}
function useErrorTranslations() {
    return useTranslationNamespace('errors');
}
function useSuccessTranslations() {
    return useTranslationNamespace('success');
}
function useLGPDTranslations() {
    return useTranslationNamespace('lgpd');
}
function useAccessibilityTranslations() {
    return useTranslationNamespace('accessibility');
}
/**
 * Form validation translations
 * Helper for form error messages
 */
function useFormTranslations() {
    var t = useTranslation().t;
    return {
        required: function (field) { return t('errors.requiredField', { field: field }); },
        invalid: function (field) { return t('errors.invalidFormat', { field: field }); },
        email: function () { return t('errors.invalidEmail'); },
        phone: function () { return t('errors.invalidPhone'); },
        cpf: function () { return t('errors.invalidCpf'); },
        date: function () { return t('errors.invalidDate'); },
        dateInPast: function () { return t('errors.dateInPast'); },
        dateInFuture: function () { return t('errors.dateInFuture'); },
        minLength: function (field, min) {
            return t('errors.minLength', { field: field, min: min });
        },
        maxLength: function (field, max) {
            return t('errors.maxLength', { field: field, max: max });
        },
        confirmation: function (field) {
            return t('errors.confirmation', { field: field });
        },
    };
}
/**
 * Accessibility translations helper
 * Screen reader and keyboard navigation texts
 */
function useA11yTranslations() {
    var t = useTranslation().t;
    return {
        skipToContent: function () { return t('accessibility.skipToContent'); },
        skipToNavigation: function () { return t('accessibility.skipToNavigation'); },
        loading: function (item) {
            return item ? t('common.loading') + ' ' + item : t('common.loading');
        },
        saving: function (item) {
            return item ? t('common.saving') + ' ' + item : t('common.saving');
        },
        buttonPressed: function (button, pressed) {
            return pressed ? "".concat(button, " pressionado") : "".concat(button, " n\u00E3o pressionado");
        },
        expandedState: function (item, expanded) {
            return expanded ? "".concat(item, " expandido") : "".concat(item, " recolhido");
        },
        menuItemOf: function (current, total) {
            return "Item ".concat(current, " de ").concat(total);
        },
        pageOf: function (current, total) {
            return "P\u00E1gina ".concat(current, " de ").concat(total);
        },
        required: function () { return t('common.required'); },
        optional: function () { return t('common.optional'); },
        error: function (field) { return "Erro em ".concat(field); },
        success: function (action) { return "".concat(action, " realizado com sucesso"); },
    };
}
/**
 * Date and time formatting with translations
 */
function useDateTimeTranslations() {
    var _a = useTranslation(), t = _a.t, locale = _a.locale;
    return {
        formatDate: function (date) {
            return new Intl.DateTimeFormat(locale, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }).format(date);
        },
        formatTime: function (date) {
            return new Intl.DateTimeFormat(locale, {
                hour: '2-digit',
                minute: '2-digit',
            }).format(date);
        },
        formatDateTime: function (date) {
            return new Intl.DateTimeFormat(locale, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(date);
        },
        formatRelativeTime: function (date) {
            var rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
            var now = new Date();
            var diffInMs = date.getTime() - now.getTime();
            var diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
            if (Math.abs(diffInDays) < 1) {
                var diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
                if (Math.abs(diffInHours) < 1) {
                    var diffInMinutes = Math.round(diffInMs / (1000 * 60));
                    return rtf.format(diffInMinutes, 'minute');
                }
                return rtf.format(diffInHours, 'hour');
            }
            return rtf.format(diffInDays, 'day');
        },
        dayNames: {
            monday: t('scheduling.monday'),
            tuesday: t('scheduling.tuesday'),
            wednesday: t('scheduling.wednesday'),
            thursday: t('scheduling.thursday'),
            friday: t('scheduling.friday'),
            saturday: t('scheduling.saturday'),
            sunday: t('scheduling.sunday'),
        },
        periods: {
            morning: t('scheduling.morning'),
            afternoon: t('scheduling.afternoon'),
            evening: t('scheduling.evening'),
            night: t('scheduling.night'),
        },
    };
}
/**
 * Currency and number formatting with translations
 */
function useNumberTranslations() {
    var locale = useTranslation().locale;
    return {
        formatCurrency: function (amount, currency) {
            if (currency === void 0) { currency = 'BRL'; }
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency,
            }).format(amount);
        },
        formatNumber: function (num, options) {
            return new Intl.NumberFormat(locale, options).format(num);
        },
        formatPercent: function (num, decimals) {
            if (decimals === void 0) { decimals = 0; }
            return new Intl.NumberFormat(locale, {
                style: 'percent',
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            }).format(num / 100);
        },
    };
}
