/**
 * useVisionConfig Hook Tests
 *
 * Test suite for the useVisionConfig custom React hook
 * that manages computer vision analysis configuration and user preferences.
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useVisionConfig } from "@/hooks/useVisionConfig";
import { toast } from "sonner";

// Mock dependencies
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

const mockDefaultConfig = {
  analysisThresholds: {
    accuracyThreshold: 0.85,
    confidenceThreshold: 0.8,
    processingTimeLimit: 30000,
  },
  imageProcessing: {
    maxImageSize: 5242880, // 5MB
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
    autoResize: true,
    compressionQuality: 0.8,
  },
  notifications: {
    analysisComplete: true,
    lowAccuracyWarning: true,
    processingTimeWarning: true,
    emailNotifications: false,
  },
  export: {
    defaultFormat: "pdf" as const,
    includeImages: true,
    includeAnnotations: true,
    includeMetrics: true,
  },
  privacy: {
    shareByDefault: false,
    allowPublicSharing: false,
    dataRetentionDays: 365,
  },
  advanced: {
    enableDebugMode: false,
    customModelEndpoint: "",
    batchProcessing: false,
    parallelAnalysis: true,
  },
};

const mockUserConfig = {
  ...mockDefaultConfig,
  analysisThresholds: {
    ...mockDefaultConfig.analysisThresholds,
    accuracyThreshold: 0.9,
  },
  notifications: {
    ...mockDefaultConfig.notifications,
    emailNotifications: true,
  },
};

describe("useVisionConfig", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useVisionConfig());

    expect(result.current.config).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSaving).toBe(false);
    expect(result.current.hasUnsavedChanges).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe("loadConfig", () => {
    it("should load user configuration successfully", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          config: mockUserConfig,
          isDefault: false,
        }),
      });

      const { result } = renderHook(() => useVisionConfig());

      await act(async () => {
        await result.current.loadConfig();
      });

      expect(result.current.config).toEqual(mockUserConfig);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should load default configuration when user config not found", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          config: mockDefaultConfig,
          isDefault: true,
        }),
      });

      const { result } = renderHook(() => useVisionConfig());

      await act(async () => {
        await result.current.loadConfig();
      });

      expect(result.current.config).toEqual(mockDefaultConfig);
      expect(toast.info).toHaveBeenCalledWith("Using default configuration");
    });

    it("should handle loading errors", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useVisionConfig());

      await act(async () => {
        await result.current.loadConfig();
      });

      expect(result.current.error).toBe("Failed to load configuration");
      expect(result.current.isLoading).toBe(false);
      expect(toast.error).toHaveBeenCalledWith("Failed to load configuration");
    });
  });

  describe("updateConfig", () => {
    it("should update configuration and mark as unsaved", () => {
      const { result } = renderHook(() => useVisionConfig());

      // Set initial config
      act(() => {
        result.current.config = mockDefaultConfig;
      });

      const updates = {
        analysisThresholds: {
          ...mockDefaultConfig.analysisThresholds,
          accuracyThreshold: 0.9,
        },
      };

      act(() => {
        result.current.updateConfig(updates);
      });

      expect(result.current.config?.analysisThresholds.accuracyThreshold).toBe(0.9);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it("should handle nested configuration updates", () => {
      const { result } = renderHook(() => useVisionConfig());

      // Set initial config
      act(() => {
        result.current.config = mockDefaultConfig;
      });

      act(() => {
        result.current.updateConfig({
          notifications: {
            ...mockDefaultConfig.notifications,
            emailNotifications: true,
            analysisComplete: false,
          },
        });
      });

      expect(result.current.config?.notifications.emailNotifications).toBe(true);
      expect(result.current.config?.notifications.analysisComplete).toBe(false);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });

  describe("saveConfig", () => {
    it("should save configuration successfully", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          config: mockUserConfig,
        }),
      });

      const { result } = renderHook(() => useVisionConfig());

      // Set config with changes
      act(() => {
        result.current.config = mockUserConfig;
        result.current.hasUnsavedChanges = true;
      });

      await act(async () => {
        await result.current.saveConfig();
      });

      expect(result.current.isSaving).toBe(false);
      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(toast.success).toHaveBeenCalledWith("Configuration saved successfully!");
    });

    it("should handle save errors", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: "Validation failed",
        }),
      });

      const { result } = renderHook(() => useVisionConfig());

      // Set config with changes
      act(() => {
        result.current.config = mockUserConfig;
        result.current.hasUnsavedChanges = true;
      });

      await act(async () => {
        await result.current.saveConfig();
      });

      expect(result.current.error).toBe("Validation failed");
      expect(result.current.isSaving).toBe(false);
      expect(result.current.hasUnsavedChanges).toBe(true);
      expect(toast.error).toHaveBeenCalledWith("Validation failed");
    });

    it("should not save when no config is loaded", async () => {
      const { result } = renderHook(() => useVisionConfig());

      await act(async () => {
        await result.current.saveConfig();
      });

      expect(fetch).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("No configuration to save");
    });
  });

  describe("resetToDefaults", () => {
    it("should reset configuration to defaults successfully", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          config: mockDefaultConfig,
        }),
      });

      const { result } = renderHook(() => useVisionConfig());

      // Set custom config first
      act(() => {
        result.current.config = mockUserConfig;
      });

      await act(async () => {
        await result.current.resetToDefaults();
      });

      expect(result.current.config).toEqual(mockDefaultConfig);
      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(toast.success).toHaveBeenCalledWith("Configuration reset to defaults");
    });

    it("should handle reset errors", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: "Reset failed",
        }),
      });

      const { result } = renderHook(() => useVisionConfig());

      await act(async () => {
        await result.current.resetToDefaults();
      });

      expect(result.current.error).toBe("Reset failed");
      expect(toast.error).toHaveBeenCalledWith("Reset failed");
    });
  });

  describe("discardChanges", () => {
    it("should discard unsaved changes and reload config", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          config: mockDefaultConfig,
          isDefault: false,
        }),
      });

      const { result } = renderHook(() => useVisionConfig());

      // Set config with changes
      act(() => {
        result.current.config = {
          ...mockDefaultConfig,
          analysisThresholds: {
            ...mockDefaultConfig.analysisThresholds,
            accuracyThreshold: 0.95, // Modified value
          },
        };
        result.current.hasUnsavedChanges = true;
      });

      await act(async () => {
        await result.current.discardChanges();
      });

      expect(result.current.config).toEqual(mockDefaultConfig);
      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(toast.info).toHaveBeenCalledWith("Changes discarded");
    });
  });

  describe("validation", () => {
    it("should validate accuracy threshold range", () => {
      const { result } = renderHook(() => useVisionConfig());

      act(() => {
        result.current.config = mockDefaultConfig;
      });

      // Test invalid accuracy threshold
      act(() => {
        result.current.updateConfig({
          analysisThresholds: {
            ...mockDefaultConfig.analysisThresholds,
            accuracyThreshold: 1.5, // Invalid: > 1.0
          },
        });
      });

      // Should clamp to valid range
      expect(result.current.config?.analysisThresholds.accuracyThreshold).toBe(1.0);
    });

    it("should validate processing time limit", () => {
      const { result } = renderHook(() => useVisionConfig());

      act(() => {
        result.current.config = mockDefaultConfig;
      });

      // Test invalid processing time
      act(() => {
        result.current.updateConfig({
          analysisThresholds: {
            ...mockDefaultConfig.analysisThresholds,
            processingTimeLimit: -1000, // Invalid: negative
          },
        });
      });

      // Should clamp to minimum value
      expect(result.current.config?.analysisThresholds.processingTimeLimit).toBe(1000);
    });

    it("should validate image size limits", () => {
      const { result } = renderHook(() => useVisionConfig());

      act(() => {
        result.current.config = mockDefaultConfig;
      });

      // Test invalid image size
      act(() => {
        result.current.updateConfig({
          imageProcessing: {
            ...mockDefaultConfig.imageProcessing,
            maxImageSize: 50 * 1024 * 1024, // 50MB - too large
          },
        });
      });

      // Should clamp to maximum allowed
      expect(result.current.config?.imageProcessing.maxImageSize).toBe(20 * 1024 * 1024); // 20MB max
    });
  });

  describe("configuration presets", () => {
    it("should apply conservative preset", () => {
      const { result } = renderHook(() => useVisionConfig());

      act(() => {
        result.current.config = mockDefaultConfig;
      });

      act(() => {
        result.current.applyPreset("conservative");
      });

      expect(result.current.config?.analysisThresholds.accuracyThreshold).toBe(0.95);
      expect(result.current.config?.analysisThresholds.confidenceThreshold).toBe(0.9);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it("should apply performance preset", () => {
      const { result } = renderHook(() => useVisionConfig());

      act(() => {
        result.current.config = mockDefaultConfig;
      });

      act(() => {
        result.current.applyPreset("performance");
      });

      expect(result.current.config?.analysisThresholds.processingTimeLimit).toBe(15000);
      expect(result.current.config?.imageProcessing.compressionQuality).toBe(0.6);
      expect(result.current.config?.advanced.parallelAnalysis).toBe(true);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it("should apply balanced preset", () => {
      const { result } = renderHook(() => useVisionConfig());

      act(() => {
        result.current.config = mockDefaultConfig;
      });

      act(() => {
        result.current.applyPreset("balanced");
      });

      expect(result.current.config?.analysisThresholds.accuracyThreshold).toBe(0.85);
      expect(result.current.config?.analysisThresholds.confidenceThreshold).toBe(0.8);
      expect(result.current.config?.analysisThresholds.processingTimeLimit).toBe(30000);
      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should clear errors when updating config", () => {
      const { result } = renderHook(() => useVisionConfig());

      // Set an error
      act(() => {
        result.current.error = "Test error";
        result.current.config = mockDefaultConfig;
      });

      // Update config should clear error
      act(() => {
        result.current.updateConfig({
          notifications: {
            ...mockDefaultConfig.notifications,
            emailNotifications: true,
          },
        });
      });

      expect(result.current.error).toBeNull();
    });

    it("should handle network errors gracefully", async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useVisionConfig());

      await act(async () => {
        await result.current.loadConfig();
      });

      expect(result.current.error).toBe("Failed to load configuration");
      expect(result.current.config).toBeNull();
    });
  });
});
