/**
 * Accessibility Hooks Tests
 * T081 - WCAG 2.1 AA+ Accessibility Compliance
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useAccessibilityPreferences,
  useAccessibleField,
  useAccessibleTable,
  useFocusTrap,
  useKeyboardNavigation,
  useLiveRegion,
  useScreenReaderAnnouncement,
  useSkipLinks,
} from '../useAccessibility';

// Mock DOM methods
const mockFocus = vi.fn();
const mockScrollIntoView = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

beforeEach(() => {
  // Mock DOM elements
  Object.defineProperty(document, 'activeElement', {
    value: { focus: mockFocus },
    writable: true,
  });

  Object.defineProperty(HTMLElement.prototype, 'focus', {
    value: mockFocus,
    writable: true,
  });

  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: mockScrollIntoView,
    writable: true,
  });

  Object.defineProperty(HTMLElement.prototype, 'addEventListener', {
    value: mockAddEventListener,
    writable: true,
  });

  Object.defineProperty(HTMLElement.prototype, 'removeEventListener', {
    value: mockRemoveEventListener,
    writable: true,
  });

  // Mock querySelector
  document.querySelectorAll = vi
    .fn()
    .mockReturnValue([{ focus: mockFocus }, { focus: mockFocus }]);

  document.getElementById = vi.fn().mockReturnValue({
    focus: mockFocus,
    scrollIntoView: mockScrollIntoView,
  });

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock document.body methods
  document.body.appendChild = vi.fn();
  document.body.removeChild = vi.fn();

  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe(('useFocusTrap', () => {
  it(('should create focus trap when active', () => {
    const { result } = renderHook(() => useFocusTrap(true));

    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull(); // Initially null until ref is attached
  });

  it(('should not create focus trap when inactive', () => {
    const { result } = renderHook(() => useFocusTrap(false));

    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull();
  });
});

describe(('useKeyboardNavigation', () => {
  const mockItems = ['item1', 'item2', 'item3'];
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it(('should initialize with correct default values', () => {
    const { result } = renderHook(() => useKeyboardNavigation(mockItems, { onSelect: mockOnSelect })
    );

    expect(result.current.activeIndex).toBe(0);
  });

  it(('should handle keyboard navigation', () => {
    const { result } = renderHook(() => useKeyboardNavigation(mockItems, { onSelect: mockOnSelect })
    );

    const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(result.current.activeIndex).toBe(1);
  });

  it(('should handle selection with Enter key', () => {
    const { result } = renderHook(() => useKeyboardNavigation(mockItems, { onSelect: mockOnSelect })
    );

    const mockEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    Object.defineProperty(mockEvent, 'preventDefault', {
      value: vi.fn(),
      writable: true,
    });

    act(() => {
      result.current.handleKeyDown(mockEvent);
    });

    expect(mockOnSelect).toHaveBeenCalledWith('item1', 0);
  });

  it(('should provide correct item props', () => {
    const { result } = renderHook(() => useKeyboardNavigation(mockItems, { onSelect: mockOnSelect })
    );

    const itemProps = result.current.getItemProps(1);

    expect(itemProps.tabIndex).toBe(-1); // Not active item
    expect(itemProps['aria-selected']).toBe(false);
    expect(typeof itemProps.onKeyDown).toBe('function');
    expect(typeof itemProps.onFocus).toBe('function');
  });
});

describe(('useScreenReaderAnnouncement', () => {
  it(('should provide announcement functions', () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());

    expect(typeof result.current.announce).toBe('function');
    expect(typeof result.current.announceHealthcareData).toBe('function');
    expect(typeof result.current.announceFormError).toBe('function');
    expect(typeof result.current.announceFormSuccess).toBe('function');
  });

  it(('should announce healthcare data correctly', () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());

    act(() => {
      result.current.announceHealthcareData(
        'Pressão arterial',
        '120/80',
        'mmHg',
      );
    });

    expect(document.body.appendChild).toHaveBeenCalled();
  });

  it(('should announce form errors with assertive priority', () => {
    const { result } = renderHook(() => useScreenReaderAnnouncement());

    act(() => {
      result.current.announceFormError('email', 'Email inválido');
    });

    expect(document.body.appendChild).toHaveBeenCalled();
  });
});

describe(('useLiveRegion', () => {
  it(('should initialize with empty message', () => {
    const { result } = renderHook(() => useLiveRegion());

    expect(result.current.message).toBe('');
    expect(result.current.liveRegionProps['aria-live']).toBe('polite');
  });

  it(('should update message when announced', () => {
    const { result } = renderHook(() => useLiveRegion());

    act(() => {
      result.current.announce('Test message', 'assertive');
    });

    expect(result.current.message).toBe('Test message');
    expect(result.current.liveRegionProps['aria-live']).toBe('assertive');
  });

  it(_'should clear message after timeout',async () => {
    const { result } = renderHook(() => useLiveRegion());

    act(() => {
      result.current.announce('Test message');
    });

    expect(result.current.message).toBe('Test message');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.message).toBe('');
    });
  });
});

describe(('useAccessibleField', () => {
  it(('should initialize with default values', () => {
    const { result } = renderHook(() => useAccessibleField('testField'));

    expect(result.current.value).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.touched).toBe(false);
  });

  it(('should validate required fields', () => {
    const { result } = renderHook(() => useAccessibleField('testField', { required: true }));

    act(() => {
      const isValid = result.current.validateField();
      expect(isValid).toBe(false);
      expect(result.current.error).toBe('Este campo é obrigatório');
    });
  });

  it(('should use custom validation', () => {
    const customValidate = (value: string) => value.length < 3 ? 'Mínimo 3 caracteres' : null;

    const { result } = renderHook(() => useAccessibleField('testField', { validate: customValidate })
    );

    act(() => {
      result.current.setValue('ab');
      const isValid = result.current.validateField();
      expect(isValid).toBe(false);
      expect(result.current.error).toBe('Mínimo 3 caracteres');
    });
  });

  it(('should provide correct field props', () => {
    const { result } = renderHook(() => useAccessibleField('testField', { required: true }));

    const { fieldProps } = result.current;

    expect(fieldProps['aria-required']).toBe(true);
    expect(fieldProps['aria-invalid']).toBe(false);
    expect(fieldProps.id).toMatch(/^testField-[a-z0-9]+$/);
  });
});

describe(('useAccessibilityPreferences', () => {
  it(('should detect user preferences', () => {
    // Mock reduced motion preference
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useAccessibilityPreferences());

    expect(result.current.prefersReducedMotion).toBe(true);
    expect(result.current.prefersHighContrast).toBe(false);
  });

  it(('should listen for preference changes', () => {
    const mockAddEventListener = vi.fn();
    const mockRemoveEventListener = vi.fn();

    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: vi.fn(),
    }));

    const { unmount } = renderHook(() => useAccessibilityPreferences());

    expect(mockAddEventListener).toHaveBeenCalledTimes(2); // For both queries

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledTimes(2);
  });
});

describe(('useSkipLinks', () => {
  it(('should provide skip links and focus function', () => {
    const { result } = renderHook(() => useSkipLinks());

    expect(result.current.skipLinks).toHaveLength(3);
    expect(result.current.skipLinks[0].href).toBe('#main-content');
    expect(result.current.skipLinks[0].label).toBe(
      'Pular para o conteúdo principal',
    );
    expect(typeof result.current.focusMainContent).toBe('function');
  });

  it(('should focus main content when called', () => {
    const { result } = renderHook(() => useSkipLinks());

    act(() => {
      result.current.focusMainContent();
    });

    expect(mockFocus).toHaveBeenCalled();
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
});

describe(('useAccessibleTable', () => {
  const mockData = [
    { id: 1, name: 'João', age: 30 },
    { id: 2, name: 'Maria', age: 25 },
    { id: 3, name: 'Pedro', age: 35 },
  ];

  const mockColumns = [
    { key: 'name' as const, label: 'Nome', sortable: true },
    { key: 'age' as const, label: 'Idade', sortable: true },
  ];

  it(('should initialize with correct default values', () => {
    const { result } = renderHook(() => useAccessibleTable(mockData, mockColumns));

    expect(result.current.sortColumn).toBeNull();
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.sortedData).toEqual(mockData);
  });

  it(('should sort data when column is clicked', () => {
    const { result } = renderHook(() => useAccessibleTable(mockData, mockColumns));

    act(() => {
      result.current.handleSort('age');
    });

    expect(result.current.sortColumn).toBe('age');
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.sortedData[0].age).toBe(25); // Maria should be first
  });

  it(('should reverse sort direction when same column is clicked', () => {
    const { result } = renderHook(() => useAccessibleTable(mockData, mockColumns));

    act(() => {
      result.current.handleSort('age');
    });

    act(() => {
      result.current.handleSort('age');
    });

    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.sortedData[0].age).toBe(35); // Pedro should be first
  });

  it(('should provide correct column header props', () => {
    const { result } = renderHook(() => useAccessibleTable(mockData, mockColumns));

    const headerProps = result.current.getColumnHeaderProps(mockColumns[0]);

    expect(headerProps._role).toBe('columnheader');
    expect(headerProps.scope).toBe('col');
    expect(headerProps.tabIndex).toBe(0); // Sortable column
    expect(headerProps['aria-sort']).toBe('none');
    expect(typeof headerProps.onClick).toBe('function');
  });

  it(('should create accessible table caption', () => {
    const { result } = renderHook(() => useAccessibleTable(mockData, mockColumns));

    expect(result.current.caption).toBe(
      'Tabela de dados. Tabela com 3 linhas e 2 colunas.',
    );
  });
});
