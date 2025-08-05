import React, { createContext, useContext } from "react";
import type {
  formatHealthcareMessage,
  healthcareAriaLabels,
  LocalizationStrings,
  ptBRStrings,
} from "./pt-br";

interface LocalizationContextValue {
  strings: LocalizationStrings;
  locale: string;
  formatHealthcareMessage: typeof formatHealthcareMessage;
  healthcareAriaLabels: typeof healthcareAriaLabels;
  t: (key: string, params?: Record<string, any>) => string;
}

const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

interface LocalizationProviderProps {
  children: React.ReactNode;
  locale?: string;
}

export function LocalizationProvider({ children, locale = "pt-BR" }: LocalizationProviderProps) {
  // For now we only support PT-BR, but this structure allows for easy expansion
  const strings = ptBRStrings;

  // Simple key-based translation function
  const t = (key: string, params?: Record<string, any>): string => {
    // Navigate nested object using dot notation
    const keys = key.split(".");
    let value: any = strings;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key; // Return key if translation not found
      }
    }

    if (typeof value === "function" && params) {
      // Handle parameterized functions
      if (params.count !== undefined) {
        return value(params.count);
      } else if (params.field !== undefined) {
        return value(params.field);
      } else if (params.page !== undefined) {
        return value(params.page);
      } else if (params.patientName !== undefined) {
        return value(params.patientName);
      } else if (params.context !== undefined) {
        return value(params.context);
      } else if (params.dialogName !== undefined) {
        return value(params.dialogName);
      } else if (params.section !== undefined) {
        return value(params.section);
      } else if (params.column !== undefined && params.direction !== undefined) {
        return value(params.column, params.direction);
      } else if (params.query !== undefined) {
        return value(params.count || 0, params.query);
      } else if (params.current !== undefined && params.total !== undefined) {
        return value(params.current, params.total);
      } else if (params.option !== undefined) {
        return value(params.option);
      } else if (params.tab !== undefined) {
        return value(params.tab);
      } else if (params.minLength !== undefined) {
        return value(params.minLength);
      } else if (params.date !== undefined) {
        return value(params.date);
      }
    }

    if (typeof value === "string") {
      return value;
    }

    console.warn(`Translation value is not a string or function: ${key}`);
    return key;
  };

  const value: LocalizationContextValue = {
    strings,
    locale,
    formatHealthcareMessage,
    healthcareAriaLabels,
    t,
  };

  return React.createElement(LocalizationContext.Provider, { value }, children);
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error("useLocalization must be used within a LocalizationProvider");
  }
  return context;
}

// Convenience hooks for common use cases
export function useTranslation() {
  const { t } = useLocalization();
  return t;
}

export function useHealthcareTranslations() {
  const { formatHealthcareMessage, healthcareAriaLabels, t } = useLocalization();

  return {
    formatMessage: formatHealthcareMessage,
    ariaLabels: healthcareAriaLabels,
    t,
    // Common healthcare translations
    patient: t("healthcare.patient"),
    patients: t("healthcare.patients"),
    appointment: t("healthcare.appointment"),
    appointments: t("healthcare.appointments"),
    consultation: t("healthcare.consultation"),
    treatment: t("healthcare.treatment"),
    medication: t("healthcare.medication"),
    allergy: t("healthcare.allergy"),
    diagnosis: t("healthcare.diagnosis"),
    medicalHistory: t("healthcare.medicalHistory"),
    vitalSigns: t("healthcare.vitalSigns"),
  };
}

// Form-specific translations hook
export function useFormTranslations() {
  const { t } = useLocalization();

  return {
    required: t("forms.required"),
    optional: t("forms.optional"),
    loading: t("forms.loading"),
    saving: t("forms.saving"),
    saved: t("forms.saved"),
    submit: t("forms.submit"),
    cancel: t("forms.cancel"),
    reset: t("forms.reset"),
    clear: t("forms.clear"),
    fieldRequired: (field: string) => t("forms.fieldRequired", { field }),
    fieldOptional: (field: string) => t("forms.fieldOptional", { field }),
    formHasErrors: (count: number) => t("forms.formHasErrors", { count }),
    pleaseCorrectErrors: t("forms.pleaseCorrectErrors"),
  };
}

// Navigation-specific translations hook
export function useNavigationTranslations() {
  const { t } = useLocalization();

  return {
    skipToMain: t("navigation.skipToMain"),
    skipToNavigation: t("navigation.skipToNavigation"),
    mainNavigation: t("navigation.mainNavigation"),
    breadcrumbs: t("navigation.breadcrumbs"),
    previousPage: t("navigation.previousPage"),
    nextPage: t("navigation.nextPage"),
    goToPage: (page: number) => t("navigation.goToPage", { page }),
  };
}

// Accessibility-specific translations hook
export function useAccessibilityTranslations() {
  const { t } = useLocalization();

  return {
    openDialog: (dialogName: string) => t("accessibility.openDialog", { dialogName }),
    closeDialog: t("accessibility.closeDialog"),
    expandSection: (section: string) => t("accessibility.expandSection", { section }),
    collapseSection: (section: string) => t("accessibility.collapseSection", { section }),
    sortColumn: (column: string, direction: "ascending" | "descending") =>
      t("accessibility.sortColumn", { column, direction }),
    filterResults: (count: number) => t("accessibility.filterResults", { count }),
    searchResults: (count: number, query: string) =>
      t("accessibility.searchResults", { count, query }),
    pageOf: (current: number, total: number) => t("accessibility.pageOf", { current, total }),
    selectedOption: (option: string) => t("accessibility.selectedOption", { option }),
    menuExpanded: t("accessibility.menuExpanded"),
    menuCollapsed: t("accessibility.menuCollapsed"),
    tabSelected: (tab: string) => t("accessibility.tabSelected", { tab }),
  };
}

// Status announcements hook
export function useStatusTranslations() {
  const { t } = useLocalization();

  return {
    loading: (context?: string) => t("status.loading", { context }),
    loadingComplete: (context?: string) => t("status.loadingComplete", { context }),
    saving: (context?: string) => t("status.saving", { context }),
    saveComplete: (context?: string) => t("status.saveComplete", { context }),
    deleting: (context?: string) => t("status.deleting", { context }),
    deleteComplete: (context?: string) => t("status.deleteComplete", { context }),
    appointmentScheduled: (patientName?: string) =>
      t("status.appointmentScheduled", { patientName }),
    appointmentCanceled: (patientName?: string) => t("status.appointmentCanceled", { patientName }),
    appointmentCompleted: (patientName?: string) =>
      t("status.appointmentCompleted", { patientName }),
    formSubmitted: t("status.formSubmitted"),
    formSubmissionError: t("status.formSubmissionError"),
    dataUpdated: t("status.dataUpdated"),
    dataUpdateError: t("status.dataUpdateError"),
  };
}

// Date and time formatting hook
export function useDateTimeTranslations() {
  const { t, strings } = useLocalization();

  return {
    today: t("dateTime.today"),
    tomorrow: t("dateTime.tomorrow"),
    yesterday: t("dateTime.yesterday"),
    thisWeek: t("dateTime.thisWeek"),
    nextWeek: t("dateTime.nextWeek"),
    lastWeek: t("dateTime.lastWeek"),
    thisMonth: t("dateTime.thisMonth"),
    nextMonth: t("dateTime.nextMonth"),
    lastMonth: t("dateTime.lastMonth"),
    formatDate: strings.dateTime.formatDate,
    formatTime: strings.dateTime.formatTime,
    formatDateTime: strings.dateTime.formatDateTime,
    relativeTime: strings.dateTime.relativeTime,
  };
}

// Error and success messages hook
export function useMessageTranslations() {
  const { t } = useLocalization();

  return {
    // Errors
    generalError: t("errors.general"),
    networkError: t("errors.network"),
    unauthorized: t("errors.unauthorized"),
    forbidden: t("errors.forbidden"),
    notFound: t("errors.notFound"),
    serverError: t("errors.serverError"),
    validationFailed: t("errors.validationFailed"),
    requiredField: (field: string) => t("errors.requiredField", { field }),
    invalidEmail: t("errors.invalidEmail"),
    invalidPhone: t("errors.invalidPhone"),
    invalidDate: t("errors.invalidDate"),
    invalidTime: t("errors.invalidTime"),
    passwordTooShort: (minLength: number) => t("errors.passwordTooShort", { minLength }),
    passwordMismatch: t("errors.passwordMismatch"),

    // Success messages
    saved: t("success.saved"),
    updated: t("success.updated"),
    deleted: t("success.deleted"),
    created: t("success.created"),
    sent: t("success.sent"),
    scheduled: t("success.scheduled"),
    canceled: t("success.canceled"),
    completed: t("success.completed"),
  };
}

// Action labels hook
export function useActionTranslations() {
  const { t } = useLocalization();

  return {
    edit: t("actions.edit"),
    delete: t("actions.delete"),
    save: t("actions.save"),
    cancel: t("actions.cancel"),
    confirm: t("actions.confirm"),
    close: t("actions.close"),
    open: t("actions.open"),
    add: t("actions.add"),
    remove: t("actions.remove"),
    search: t("actions.search"),
    filter: t("actions.filter"),
    sort: t("actions.sort"),
    refresh: t("actions.refresh"),
    export: t("actions.export"),
    import: t("actions.import"),
    print: t("actions.print"),
    download: t("actions.download"),
    upload: t("actions.upload"),
    schedule: t("actions.schedule"),
    reschedule: t("actions.reschedule"),
    viewDetails: t("actions.viewDetails"),
    viewAll: t("actions.viewAll"),
  };
}
