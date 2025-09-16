/**
 * Accessibility Hooks for WCAG 2.1 AA+ Compliance
 * T081 - WCAG 2.1 AA+ Accessibility Compliance
 *
 * Features:
 * - Focus management hooks
 * - Keyboard navigation hooks
 * - Screen reader announcement hooks
 * - ARIA state management
 * - Healthcare-specific accessibility patterns
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FocusManager,
  generateAccessibleId,
  KeyboardNavigation,
  prefersHighContrast,
  prefersReducedMotion,
  ScreenReaderUtils,
} from '../utils/accessibility';

/**
 * Hook for managing focus trap in modals and dialogs
 */
export function useFocusTrap(isActive: boolean = false) {
  const containerRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<() => void | undefined>(undefined);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Save current focus
    restoreFocusRef.current = FocusManager.saveFocus();

    // Trap focus
    const releaseTrap = FocusManager.trapFocus(containerRef.current);

    return () => {
      releaseTrap();
      restoreFocusRef.current?.();
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for keyboard navigation in lists and grids
 */
export function useKeyboardNavigation<T>(
  items: T[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'grid';
    wrap?: boolean;
    columns?: number;
    onSelect?: (item: T, index: number) => void;
  } = {},
) {
  const { orientation = 'vertical', wrap = false, columns = 1, onSelect } = options;
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (orientation === 'grid' && columns > 1) {
      KeyboardNavigation.handleGridNavigation(
        event,
        activeIndex,
        items.length,
        columns,
        newIndex => {
          setActiveIndex(newIndex);
          itemRefs.current[newIndex]?.focus();
        },
      );
    } else {
      KeyboardNavigation.handleListNavigation(
        event,
        activeIndex,
        items.length,
        newIndex => {
          setActiveIndex(newIndex);
          itemRefs.current[newIndex]?.focus();
        },
        wrap,
      );
    }

    // Handle selection
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.(items[activeIndex], activeIndex);
    }
  }, [activeIndex, items, columns, orientation, wrap, onSelect]);

  const setItemRef = useCallback((index: number) => (ref: HTMLElement | null) => {
    itemRefs.current[index] = ref;
  }, []);

  const getItemProps = useCallback((index: number) => ({
    ref: setItemRef(index),
    tabIndex: index === activeIndex ? 0 : -1,
    onKeyDown: handleKeyDown,
    onFocus: () => setActiveIndex(index),
    'aria-selected': index === activeIndex,
  }), [activeIndex, handleKeyDown, setItemRef]);

  return {
    activeIndex,
    setActiveIndex,
    getItemProps,
    handleKeyDown,
  };
}

/**
 * Hook for screen reader announcements
 */
export function useScreenReaderAnnouncement() {
  const announce = useCallback((
    message: string,
    priority: 'polite' | 'assertive' = 'polite',
  ) => {
    FocusManager.announceToScreenReader(message, priority);
  }, []);

  const announceHealthcareData = useCallback((
    label: string,
    value: string | number,
    unit?: string,
  ) => {
    const formattedMessage = ScreenReaderUtils.formatHealthcareData(label, value, unit);
    announce(formattedMessage);
  }, [announce]);

  const announceFormError = useCallback((fieldName: string, errorMessage: string) => {
    announce(`Erro no campo ${fieldName}: ${errorMessage}`, 'assertive');
  }, [announce]);

  const announceFormSuccess = useCallback((message: string) => {
    announce(`Sucesso: ${message}`, 'polite');
  }, [announce]);

  return {
    announce,
    announceHealthcareData,
    announceFormError,
    announceFormSuccess,
  };
}

/**
 * Hook for managing ARIA live regions
 */
export function useLiveRegion() {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = useCallback((
    newMessage: string,
    newPriority: 'polite' | 'assertive' = 'polite',
  ) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setMessage(newMessage);
    setPriority(newPriority);

    // Clear message after announcement
    timeoutRef.current = setTimeout(() => {
      setMessage('');
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const liveRegionProps = {
    'aria-live': priority,
    'aria-atomic': true,
    role: 'status',
    className: 'sr-only',
  };

  return {
    message,
    announce,
    liveRegionProps,
  };
}

/**
 * Hook for accessible form field management
 */
export function useAccessibleField(
  fieldName: string,
  options: {
    required?: boolean;
    validate?: (value: string) => string | null;
  } = {},
) {
  const { required = false, validate } = options;
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const fieldId = useRef(generateAccessibleId(fieldName));
  const errorId = useRef(generateAccessibleId(`${fieldName}-error`));
  const descriptionId = useRef(generateAccessibleId(`${fieldName}-description`));

  const validateField = useCallback((fieldValue: string) => {
    if (required && !fieldValue.trim()) {
      return 'Este campo é obrigatório';
    }

    if (validate) {
      return validate(fieldValue);
    }

    return null;
  }, [required, validate]);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);

    if (touched) {
      const validationError = validateField(newValue);
      setError(validationError);
    }
  }, [touched, validateField]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    const validationError = validateField(value);
    setError(validationError);
  }, [value, validateField]);

  const fieldProps = {
    id: fieldId.current,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      handleChange(e.target.value),
    onBlur: handleBlur,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': [
      error ? errorId.current : null,
      descriptionId.current,
    ].filter(Boolean).join(' ') || undefined,
  };

  const errorProps = error
    ? {
      id: errorId.current,
      role: 'alert',
      'aria-live': 'assertive' as const,
      'aria-atomic': true,
    }
    : null;

  const descriptionProps = {
    id: descriptionId.current,
  };

  return {
    value,
    error,
    touched,
    fieldProps,
    errorProps,
    descriptionProps,
    setValue,
    setError,
    validateField: () => {
      const validationError = validateField(value);
      setError(validationError);
      setTouched(true);
      return !validationError;
    },
  };
}

/**
 * Hook for detecting user preferences
 */
export function useAccessibilityPreferences() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // Initial values
    setReducedMotion(prefersReducedMotion());
    setHighContrast(prefersHighContrast());

    // Listen for changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches);

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  return {
    prefersReducedMotion: reducedMotion,
    prefersHighContrast: highContrast,
  };
}

/**
 * Hook for managing skip links
 */
export function useSkipLinks() {
  const skipLinksRef = useRef<HTMLDivElement>(null);
  const [skipLinks] = useState([
    { href: '#main-content', label: 'Pular para o conteúdo principal' },
    { href: '#main-navigation', label: 'Pular para a navegação principal' },
    { href: '#search', label: 'Pular para a busca' },
  ]);

  const focusMainContent = useCallback(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return {
    skipLinksRef,
    skipLinks,
    focusMainContent,
  };
}

/**
 * Hook for accessible data tables
 */
export function useAccessibleTable<T>(
  data: T[],
  columns: Array<{
    key: keyof T;
    label: string;
    sortable?: boolean;
  }>,
) {
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const tableId = useRef(generateAccessibleId('table'));
  const captionId = useRef(generateAccessibleId('table-caption'));

  const handleSort = useCallback((columnKey: keyof T) => {
    if (sortColumn === columnKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  const sortedData = useCallback(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const getColumnHeaderProps = useCallback((column: typeof columns[0]) => ({
    role: 'columnheader',
    scope: 'col' as const,
    tabIndex: column.sortable ? 0 : undefined,
    onClick: column.sortable ? () => handleSort(column.key) : undefined,
    onKeyDown: column.sortable
      ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSort(column.key);
        }
      }
      : undefined,
    'aria-sort': sortColumn === column.key
      ? (sortDirection === 'asc' ? 'ascending' : 'descending')
      : column.sortable
      ? 'none'
      : undefined,
  }), [sortColumn, sortDirection, handleSort]);

  const tableProps = {
    id: tableId.current,
    role: 'table',
    'aria-labelledby': captionId.current,
  };

  const captionProps = {
    id: captionId.current,
  };

  const caption = ScreenReaderUtils.createTableCaption(
    'Tabela de dados',
    data.length,
    columns.length,
  );

  return {
    sortedData: sortedData(),
    sortColumn,
    sortDirection,
    tableProps,
    captionProps,
    caption,
    getColumnHeaderProps,
    handleSort,
  };
}

// Hooks are already exported individually above
