"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalizationProvider = LocalizationProvider;
exports.useLocalization = useLocalization;
exports.useTranslation = useTranslation;
exports.useHealthcareTranslations = useHealthcareTranslations;
exports.useFormTranslations = useFormTranslations;
exports.useNavigationTranslations = useNavigationTranslations;
exports.useAccessibilityTranslations = useAccessibilityTranslations;
exports.useStatusTranslations = useStatusTranslations;
exports.useDateTimeTranslations = useDateTimeTranslations;
exports.useMessageTranslations = useMessageTranslations;
exports.useActionTranslations = useActionTranslations;
var react_1 = require("react");
var pt_br_1 = require("./pt-br");
var LocalizationContext = (0, react_1.createContext)(undefined);
function LocalizationProvider(_a) {
    var children = _a.children, _b = _a.locale, locale = _b === void 0 ? 'pt-BR' : _b;
    // For now we only support PT-BR, but this structure allows for easy expansion
    var strings = pt_br_1.ptBRStrings;
    // Simple key-based translation function
    var t = function (key, params) {
        // Navigate nested object using dot notation
        var keys = key.split('.');
        var value = strings;
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var k = keys_1[_i];
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            }
            else {
                console.warn("Translation key not found: ".concat(key));
                return key; // Return key if translation not found
            }
        }
        if (typeof value === 'function' && params) {
            // Handle parameterized functions
            if (params.count !== undefined) {
                return value(params.count);
            }
            else if (params.field !== undefined) {
                return value(params.field);
            }
            else if (params.page !== undefined) {
                return value(params.page);
            }
            else if (params.patientName !== undefined) {
                return value(params.patientName);
            }
            else if (params.context !== undefined) {
                return value(params.context);
            }
            else if (params.dialogName !== undefined) {
                return value(params.dialogName);
            }
            else if (params.section !== undefined) {
                return value(params.section);
            }
            else if (params.column !== undefined && params.direction !== undefined) {
                return value(params.column, params.direction);
            }
            else if (params.query !== undefined) {
                return value(params.count || 0, params.query);
            }
            else if (params.current !== undefined && params.total !== undefined) {
                return value(params.current, params.total);
            }
            else if (params.option !== undefined) {
                return value(params.option);
            }
            else if (params.tab !== undefined) {
                return value(params.tab);
            }
            else if (params.minLength !== undefined) {
                return value(params.minLength);
            }
            else if (params.date !== undefined) {
                return value(params.date);
            }
        }
        if (typeof value === 'string') {
            return value;
        }
        console.warn("Translation value is not a string or function: ".concat(key));
        return key;
    };
    var value = {
        strings: strings,
        locale: locale,
        formatHealthcareMessage: pt_br_1.formatHealthcareMessage,
        healthcareAriaLabels: pt_br_1.healthcareAriaLabels,
        t: t
    };
    return react_1.default.createElement(LocalizationContext.Provider, { value: value }, children);
}
function useLocalization() {
    var context = (0, react_1.useContext)(LocalizationContext);
    if (context === undefined) {
        throw new Error('useLocalization must be used within a LocalizationProvider');
    }
    return context;
}
// Convenience hooks for common use cases
function useTranslation() {
    var t = useLocalization().t;
    return t;
}
function useHealthcareTranslations() {
    var _a = useLocalization(), formatHealthcareMessage = _a.formatHealthcareMessage, healthcareAriaLabels = _a.healthcareAriaLabels, t = _a.t;
    return {
        formatMessage: formatHealthcareMessage,
        ariaLabels: healthcareAriaLabels,
        t: t,
        // Common healthcare translations
        patient: t('healthcare.patient'),
        patients: t('healthcare.patients'),
        appointment: t('healthcare.appointment'),
        appointments: t('healthcare.appointments'),
        consultation: t('healthcare.consultation'),
        treatment: t('healthcare.treatment'),
        medication: t('healthcare.medication'),
        allergy: t('healthcare.allergy'),
        diagnosis: t('healthcare.diagnosis'),
        medicalHistory: t('healthcare.medicalHistory'),
        vitalSigns: t('healthcare.vitalSigns')
    };
}
// Form-specific translations hook
function useFormTranslations() {
    var t = useLocalization().t;
    return {
        required: t('forms.required'),
        optional: t('forms.optional'),
        loading: t('forms.loading'),
        saving: t('forms.saving'),
        saved: t('forms.saved'),
        submit: t('forms.submit'),
        cancel: t('forms.cancel'),
        reset: t('forms.reset'),
        clear: t('forms.clear'),
        fieldRequired: function (field) { return t('forms.fieldRequired', { field: field }); },
        fieldOptional: function (field) { return t('forms.fieldOptional', { field: field }); },
        formHasErrors: function (count) { return t('forms.formHasErrors', { count: count }); },
        pleaseCorrectErrors: t('forms.pleaseCorrectErrors')
    };
}
// Navigation-specific translations hook
function useNavigationTranslations() {
    var t = useLocalization().t;
    return {
        skipToMain: t('navigation.skipToMain'),
        skipToNavigation: t('navigation.skipToNavigation'),
        mainNavigation: t('navigation.mainNavigation'),
        breadcrumbs: t('navigation.breadcrumbs'),
        previousPage: t('navigation.previousPage'),
        nextPage: t('navigation.nextPage'),
        goToPage: function (page) { return t('navigation.goToPage', { page: page }); }
    };
}
// Accessibility-specific translations hook
function useAccessibilityTranslations() {
    var t = useLocalization().t;
    return {
        openDialog: function (dialogName) { return t('accessibility.openDialog', { dialogName: dialogName }); },
        closeDialog: t('accessibility.closeDialog'),
        expandSection: function (section) { return t('accessibility.expandSection', { section: section }); },
        collapseSection: function (section) { return t('accessibility.collapseSection', { section: section }); },
        sortColumn: function (column, direction) {
            return t('accessibility.sortColumn', { column: column, direction: direction });
        },
        filterResults: function (count) { return t('accessibility.filterResults', { count: count }); },
        searchResults: function (count, query) {
            return t('accessibility.searchResults', { count: count, query: query });
        },
        pageOf: function (current, total) { return t('accessibility.pageOf', { current: current, total: total }); },
        selectedOption: function (option) { return t('accessibility.selectedOption', { option: option }); },
        menuExpanded: t('accessibility.menuExpanded'),
        menuCollapsed: t('accessibility.menuCollapsed'),
        tabSelected: function (tab) { return t('accessibility.tabSelected', { tab: tab }); }
    };
}
// Status announcements hook
function useStatusTranslations() {
    var t = useLocalization().t;
    return {
        loading: function (context) { return t('status.loading', { context: context }); },
        loadingComplete: function (context) { return t('status.loadingComplete', { context: context }); },
        saving: function (context) { return t('status.saving', { context: context }); },
        saveComplete: function (context) { return t('status.saveComplete', { context: context }); },
        deleting: function (context) { return t('status.deleting', { context: context }); },
        deleteComplete: function (context) { return t('status.deleteComplete', { context: context }); },
        appointmentScheduled: function (patientName) {
            return t('status.appointmentScheduled', { patientName: patientName });
        },
        appointmentCanceled: function (patientName) {
            return t('status.appointmentCanceled', { patientName: patientName });
        },
        appointmentCompleted: function (patientName) {
            return t('status.appointmentCompleted', { patientName: patientName });
        },
        formSubmitted: t('status.formSubmitted'),
        formSubmissionError: t('status.formSubmissionError'),
        dataUpdated: t('status.dataUpdated'),
        dataUpdateError: t('status.dataUpdateError')
    };
}
// Date and time formatting hook
function useDateTimeTranslations() {
    var _a = useLocalization(), t = _a.t, strings = _a.strings;
    return {
        today: t('dateTime.today'),
        tomorrow: t('dateTime.tomorrow'),
        yesterday: t('dateTime.yesterday'),
        thisWeek: t('dateTime.thisWeek'),
        nextWeek: t('dateTime.nextWeek'),
        lastWeek: t('dateTime.lastWeek'),
        thisMonth: t('dateTime.thisMonth'),
        nextMonth: t('dateTime.nextMonth'),
        lastMonth: t('dateTime.lastMonth'),
        formatDate: strings.dateTime.formatDate,
        formatTime: strings.dateTime.formatTime,
        formatDateTime: strings.dateTime.formatDateTime,
        relativeTime: strings.dateTime.relativeTime
    };
}
// Error and success messages hook
function useMessageTranslations() {
    var t = useLocalization().t;
    return {
        // Errors
        generalError: t('errors.general'),
        networkError: t('errors.network'),
        unauthorized: t('errors.unauthorized'),
        forbidden: t('errors.forbidden'),
        notFound: t('errors.notFound'),
        serverError: t('errors.serverError'),
        validationFailed: t('errors.validationFailed'),
        requiredField: function (field) { return t('errors.requiredField', { field: field }); },
        invalidEmail: t('errors.invalidEmail'),
        invalidPhone: t('errors.invalidPhone'),
        invalidDate: t('errors.invalidDate'),
        invalidTime: t('errors.invalidTime'),
        passwordTooShort: function (minLength) { return t('errors.passwordTooShort', { minLength: minLength }); },
        passwordMismatch: t('errors.passwordMismatch'),
        // Success messages
        saved: t('success.saved'),
        updated: t('success.updated'),
        deleted: t('success.deleted'),
        created: t('success.created'),
        sent: t('success.sent'),
        scheduled: t('success.scheduled'),
        canceled: t('success.canceled'),
        completed: t('success.completed')
    };
}
// Action labels hook
function useActionTranslations() {
    var t = useLocalization().t;
    return {
        edit: t('actions.edit'),
        delete: t('actions.delete'),
        save: t('actions.save'),
        cancel: t('actions.cancel'),
        confirm: t('actions.confirm'),
        close: t('actions.close'),
        open: t('actions.open'),
        add: t('actions.add'),
        remove: t('actions.remove'),
        search: t('actions.search'),
        filter: t('actions.filter'),
        sort: t('actions.sort'),
        refresh: t('actions.refresh'),
        export: t('actions.export'),
        import: t('actions.import'),
        print: t('actions.print'),
        download: t('actions.download'),
        upload: t('actions.upload'),
        schedule: t('actions.schedule'),
        reschedule: t('actions.reschedule'),
        viewDetails: t('actions.viewDetails'),
        viewAll: t('actions.viewAll')
    };
}
