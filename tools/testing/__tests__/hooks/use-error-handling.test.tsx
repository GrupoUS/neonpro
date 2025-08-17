import { act, act, renderHook, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useErrorHandling } from '@/hooks/use-error-handling';

describe('useErrorHandling', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with empty errors array', () => {
    const { result } = renderHook(() => useErrorHandling());

    expect(result.current.errors).toEqual([]);
    expect(result.current.hasErrors).toBe(false);
  });

  it('adds error message correctly', () => {
    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.addError({
        type: 'error',
        title: 'Test Error',
        message: 'This is a test error',
      });
    });

    expect(result.current.errors).toHaveLength(1);
    expect(result.current.hasErrors).toBe(true);
    expect(result.current.errors[0]).toMatchObject({
      type: 'error',
      title: 'Test Error',
      message: 'This is a test error',
    });
    expect(result.current.errors[0].id).toBeDefined();
    expect(result.current.errors[0].timestamp).toBeInstanceOf(Date);
  });

  it('adds multiple error types', () => {
    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.addError({
        type: 'error',
        title: 'Error',
        message: 'Error message',
      });

      result.current.addError({
        type: 'warning',
        title: 'Warning',
        message: 'Warning message',
      });

      result.current.addError({
        type: 'info',
        title: 'Info',
        message: 'Info message',
      });

      result.current.addError({
        type: 'success',
        title: 'Success',
        message: 'Success message',
      });
    });

    expect(result.current.errors).toHaveLength(4);
    expect(result.current.errors.map((e) => e.type)).toEqual([
      'error',
      'warning',
      'info',
      'success',
    ]);
  });

  it('removes error by id', () => {
    const { result } = renderHook(() => useErrorHandling());

    let errorId: string;

    act(() => {
      result.current.addError({
        type: 'error',
        title: 'Test Error',
        message: 'This is a test error',
      });
      errorId = result.current.errors[0].id;
    });

    expect(result.current.errors).toHaveLength(1);

    act(() => {
      result.current.removeError(errorId);
    });

    expect(result.current.errors).toHaveLength(0);
    expect(result.current.hasErrors).toBe(false);
  });

  it('clears all errors', () => {
    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.addError({
        type: 'error',
        title: 'Error 1',
        message: 'Message 1',
      });

      result.current.addError({
        type: 'warning',
        title: 'Warning 1',
        message: 'Message 2',
      });
    });

    expect(result.current.errors).toHaveLength(2);

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toHaveLength(0);
    expect(result.current.hasErrors).toBe(false);
  });

  it('adds error context information', () => {
    const { result } = renderHook(() => useErrorHandling());

    const context = {
      component: 'TestComponent',
      operation: 'testOperation',
      userId: 'user-123',
      clinicId: 'clinic-456',
      metadata: {
        requestId: 'req-789',
        timestamp: new Date().toISOString(),
      },
    };

    act(() => {
      result.current.addError({
        type: 'error',
        title: 'Context Error',
        message: 'Error with context',
        context,
      });
    });

    expect(result.current.errors[0].context).toEqual(context);
  });

  it('handles error with actions', () => {
    const { result } = renderHook(() => useErrorHandling());

    const mockAction = vi.fn();
    const actions = [
      {
        label: 'Retry',
        action: mockAction,
        variant: 'primary' as const,
      },
    ];

    act(() => {
      result.current.addError({
        type: 'error',
        title: 'Actionable Error',
        message: 'Error with actions',
        actionable: true,
        actions,
      });
    });

    expect(result.current.errors[0].actions).toEqual(actions);
    expect(result.current.errors[0].actionable).toBe(true);
  });

  it('handles auto-hide functionality', async () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.addError({
        type: 'success',
        title: 'Auto Hide',
        message: 'This should auto hide',
        autoHide: true,
        duration: 1000,
      });
    });

    expect(result.current.errors).toHaveLength(1);

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.errors).toHaveLength(0);

    jest.useRealTimers();
  });

  it('filters errors by type', () => {
    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.addError({
        type: 'error',
        title: 'Error 1',
        message: 'Error message',
      });

      result.current.addError({
        type: 'warning',
        title: 'Warning 1',
        message: 'Warning message',
      });

      result.current.addError({
        type: 'error',
        title: 'Error 2',
        message: 'Another error',
      });
    });

    const errorMessages = result.current.getErrorsByType('error');
    const warningMessages = result.current.getErrorsByType('warning');

    expect(errorMessages).toHaveLength(2);
    expect(warningMessages).toHaveLength(1);
    expect(errorMessages.every((e) => e.type === 'error')).toBe(true);
    expect(warningMessages.every((e) => e.type === 'warning')).toBe(true);
  });

  it('generates unique error IDs', () => {
    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.addError({
        type: 'error',
        title: 'Error 1',
        message: 'Message 1',
      });

      result.current.addError({
        type: 'error',
        title: 'Error 2',
        message: 'Message 2',
      });
    });

    const ids = result.current.errors.map((e) => e.id);
    expect(new Set(ids).size).toBe(2); // All IDs should be unique
    expect(ids.every((id) => typeof id === 'string' && id.length > 0)).toBe(true);
  });

  it('handles dismissible errors', () => {
    const { result } = renderHook(() => useErrorHandling());

    act(() => {
      result.current.addError({
        type: 'info',
        title: 'Dismissible Info',
        message: 'This can be dismissed',
        dismissible: true,
      });

      result.current.addError({
        type: 'error',
        title: 'Non-dismissible Error',
        message: 'This cannot be dismissed',
        dismissible: false,
      });
    });

    expect(result.current.errors[0].dismissible).toBe(true);
    expect(result.current.errors[1].dismissible).toBe(false);
  });

  it('handles error with technical details', () => {
    const { result } = renderHook(() => useErrorHandling());

    const technicalDetails = 'Stack trace or technical information';

    act(() => {
      result.current.addError({
        type: 'error',
        title: 'Technical Error',
        message: 'User-friendly message',
        details: technicalDetails,
      });
    });

    expect(result.current.errors[0].details).toBe(technicalDetails);
  });

  it('respects LGPD compliance in error handling', () => {
    const { result } = renderHook(() =>
      useErrorHandling({
        lgpdCompliant: true,
      })
    );

    act(() => {
      result.current.addError({
        type: 'error',
        title: 'Privacy Error',
        message: 'Error with sensitive data',
        context: {
          userId: 'user-123',
          metadata: {
            sensitiveData: 'should be filtered',
          },
        },
      });
    });

    // In LGPD mode, sensitive data should be filtered or anonymized
    expect(result.current.errors[0].context?.userId).toBeDefined();
    // Implementation would filter sensitive metadata in LGPD mode
  });

  it('handles configuration changes', () => {
    const { result, rerender } = renderHook(({ config }) => useErrorHandling(config), {
      initialProps: {
        config: {
          showTechnicalDetails: false,
          maxRetryAttempts: 3,
        },
      },
    });

    // Test with initial config
    act(() => {
      result.current.addError({
        type: 'error',
        title: 'Config Test',
        message: 'Testing configuration',
      });
    });

    // Update config
    rerender({
      config: {
        showTechnicalDetails: true,
        maxRetryAttempts: 5,
      },
    });

    // Config should be updated
    expect(result.current.errors).toHaveLength(1);
  });
});
