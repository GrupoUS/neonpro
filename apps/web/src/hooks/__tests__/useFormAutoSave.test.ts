/**
 * Tests for useFormAutoSave hook - Auto-save form progress functionality
 * Following TDD methodology - these tests should FAIL initially
 */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFormAutoSave } from "../useFormAutoSave";

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Setup global localStorage mock
Object.defineProperty(globalThis, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

// Mock form data
const mockFormData = {
  fullName: "João Silva",
  email: "joao@example.com",
  phone: "(11) 99999-9999",
  cpf: "123.456.789-01",
};

describe("useFormAutoSave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should save form data to localStorage after debounce delay", async () => {
    const formKey = "patient-registration-form";
    const { result } = renderHook(() => useFormAutoSave(formKey));

    act(() => {
      result.current.saveFormData(mockFormData);
    });

    // Should not save immediately
    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();

    // Wait for debounce delay
    await new Promise((resolve) => setTimeout(resolve, 1100));

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      `form-autosave-${formKey}`,
      JSON.stringify({
        data: mockFormData,
        timestamp: expect.any(Number),
        version: "1.0",
      }),
    );
  });

  it("should load saved form data from localStorage", () => {
    const formKey = "patient-registration-form";
    const savedData = {
      data: mockFormData,
      timestamp: Date.now(),
      version: "1.0",
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedData));

    const { result } = renderHook(() => useFormAutoSave(formKey));

    expect(result.current.savedData).toEqual(mockFormData);
    expect(result.current.hasSavedData).toBe(true);
    expect(result.current.lastSaved).toEqual(new Date(savedData.timestamp));
  });

  it("should clear saved form data", () => {
    const formKey = "patient-registration-form";
    const { result } = renderHook(() => useFormAutoSave(formKey));

    act(() => {
      result.current.clearSavedData();
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      `form-autosave-${formKey}`,
    );
  });

  it("should handle corrupted localStorage data gracefully", () => {
    const formKey = "patient-registration-form";
    mockLocalStorage.getItem.mockReturnValue("invalid-json");

    const { result } = renderHook(() => useFormAutoSave(formKey));

    expect(result.current.savedData).toBeNull();
    expect(result.current.hasSavedData).toBe(false);
  });

  it("should not save data if form data is empty", () => {
    const formKey = "patient-registration-form";
    const { result } = renderHook(() => useFormAutoSave(formKey));

    act(() => {
      result.current.saveFormData({});
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
  });

  it("should provide form recovery status", () => {
    const formKey = "patient-registration-form";
    const savedData = {
      data: mockFormData,
      timestamp: Date.now() - 30000, // 30 seconds ago
      version: "1.0",
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedData));

    const { result } = renderHook(() => useFormAutoSave(formKey));

    expect(result.current.canRecover).toBe(true);
    expect(result.current.recoveryAge).toBeLessThan(60000); // Less than 1 minute
  });

  it("should expire old saved data", () => {
    const formKey = "patient-registration-form";
    const oldData = {
      data: mockFormData,
      timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
      version: "1.0",
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldData));

    const { result } = renderHook(() => useFormAutoSave(formKey));

    expect(result.current.savedData).toBeNull();
    expect(result.current.hasSavedData).toBe(false);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      `form-autosave-${formKey}`,
    );
  });
});
