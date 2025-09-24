/**
 * useAnimationPerformance Hook
 * Provides device and performance optimization for animations
 * Automatically adjusts animation settings based on device capabilities
 */

import { useCallback, useEffect, useState } from "react";

// Extended navigator interface for touch points
interface NavigatorWithTouch extends Navigator {
  maxTouchPoints: number;
}

// Process interface for environment variables
interface ProcessWithEnv {
  env?: {
    VITEST?: string;
    [key: string]: string | undefined;
  };
}

// Screen interface for refresh rate
interface ScreenWithRefreshRate extends Screen {
  refreshRate?: number;
}

// Navigator interface for device capabilities
interface NavigatorWithDeviceCapabilities extends NavigatorWithTouch {
  hardwareConcurrency: number;
  deviceMemory?: number;
}

interface DeviceCapabilities {
  /** CPU performance estimate (1-10 scale) */
  cpuPower: number;
  /** GPU acceleration support */
  hasGPU: boolean;
  /** Device has touch input */
  hasTouch: boolean;
  /** Device is mobile */
  isMobile: boolean;
  /** Device is low-end */
  isLowEnd: boolean;
  /** Prefers reduced motion */
  prefersReducedMotion: boolean;
  /** High refresh rate display */
  isHighRefreshRate: boolean;
  /** Memory constraints */
  hasMemoryConstraints: boolean;
}

interface PerformanceSettings {
  /** Enable/disable animations entirely */
  enableAnimations: boolean;
  /** Reduce animation complexity */
  reduceComplexity: boolean;
  /** Use simpler fallbacks */
  useSimpleFallbacks: boolean;
  /** Adjust frame rate target */
  targetFPS: number;
  /** Debounce mouse events */
  debounceMs: number;
  /** Use hardware acceleration */
  useHardwareAcceleration: boolean;
  /** Maximum simultaneous animations */
  maxConcurrentAnimations: number;
}

interface AnimationPerformanceReturn {
  /** Device capabilities assessment */
  capabilities: DeviceCapabilities;
  /** Recommended performance settings */
  settings: PerformanceSettings;
  /** FPS monitoring */
  currentFPS: number;
  /** Performance utilities */
  utils: {
    /** Check if animation should be enabled */
    shouldAnimate: (complexity: "low" | "medium" | "high") => boolean;
    /** Get optimized animation duration */
    getOptimizedDuration: (baseDuration: number) => number;
    /** Get optimized debounce value */
    getOptimizedDebounce: (baseDebounce: number) => number;
    /** Check if RAF is supported */
    supportsRAF: boolean;
    /** Performance monitor for animations */
    measurePerformance: (callback: () => void) => Promise<number>;
  };
}

// Device capability detection functions
const detectDeviceCapabilities = (): DeviceCapabilities => {
  // Guard for non-browser environments (SSR/tests)
  const hasWindow = typeof window !== "undefined";
  const hasNavigator = typeof navigator !== "undefined";
  const hasDocument = typeof document !== "undefined";
  const hasScreen = typeof screen !== "undefined";

  const hasTouch =
    hasWindow && hasNavigator
      ? "ontouchstart" in window ||
        ((navigator as NavigatorWithTouch).maxTouchPoints || 0) > 0
      : false;

  const userAgent = hasNavigator ? navigator.userAgent : "";
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    ) || hasTouch;

  const prefersReducedMotion =
    hasWindow && typeof window.matchMedia === "function"
      ? !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
      : false;

  // GPU detection
  let hasGPU = false;
  // Avoid calling canvas.getContext in test/jsdom where it throws a Not implemented error
  const isTestEnv =
    (typeof process !== "undefined" &&
      (process as ProcessWithEnv).env?.VITEST) ||
    (hasNavigator && /jsdom/i.test(navigator.userAgent || ""));
  if (hasDocument && !isTestEnv) {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
      hasGPU = !!gl;
    } catch {
      hasGPU = false;
    }
  } else {
    hasGPU = false;
  }

  // CPU power estimation (simplified)
  const cpuPower = (() => {
    const cores = hasNavigator
      ? (navigator as NavigatorWithDeviceCapabilities).hardwareConcurrency || 4
      : 4;
    const memory = hasNavigator
      ? (navigator as NavigatorWithDeviceCapabilities).deviceMemory || 4
      : 4;
    if (isMobile) {return Math.min(cores + memory - 2, 6);}
    return Math.min(cores + memory - 1, 10);
  })();

  // High refresh rate detection (fallback since refreshRate is not standard)
  const isHighRefreshRate =
    hasScreen && (screen as ScreenWithRefreshRate).refreshRate
      ? (screen as ScreenWithRefreshRate).refreshRate! > 60
      : false;

  // Memory constraints (rough estimation)
  const hasMemoryConstraints =
    hasNavigator && (navigator as NavigatorWithDeviceCapabilities).deviceMemory
      ? (navigator as NavigatorWithDeviceCapabilities).deviceMemory! <= 2
      : isMobile;

  const isLowEnd =
    cpuPower <= 4 || hasMemoryConstraints || (isMobile && !hasGPU);

  return {
    cpuPower,
    hasGPU,
    hasTouch,
    isMobile,
    isLowEnd,
    prefersReducedMotion,
    isHighRefreshRate,
    hasMemoryConstraints,
  };
};

// Generate performance settings based on capabilities
const generatePerformanceSettings = (
  capabilities: DeviceCapabilities,
): PerformanceSettings => {
  const { isLowEnd, prefersReducedMotion, isMobile, hasGPU, cpuPower } =
    capabilities;

  // Disable animations if user prefers reduced motion
  if (prefersReducedMotion) {
    return {
      enableAnimations: false,
      reduceComplexity: true,
      useSimpleFallbacks: true,
      targetFPS: 30,
      debounceMs: 100,
      useHardwareAcceleration: false,
      maxConcurrentAnimations: 1,
    };
  }

  // Low-end device settings
  if (isLowEnd) {
    return {
      enableAnimations: true,
      reduceComplexity: true,
      useSimpleFallbacks: true,
      targetFPS: 30,
      debounceMs: 32, // ~30fps
      useHardwareAcceleration: hasGPU,
      maxConcurrentAnimations: 2,
    };
  }

  // Mobile device settings
  if (isMobile) {
    return {
      enableAnimations: true,
      reduceComplexity: false,
      useSimpleFallbacks: false,
      targetFPS: 60,
      debounceMs: 16, // ~60fps
      useHardwareAcceleration: hasGPU,
      maxConcurrentAnimations: 3,
    };
  }

  // High-performance desktop settings
  return {
    enableAnimations: true,
    reduceComplexity: false,
    useSimpleFallbacks: false,
    targetFPS: cpuPower > 7 ? 120 : 60,
    debounceMs: cpuPower > 7 ? 8 : 16,
    useHardwareAcceleration: hasGPU,
    maxConcurrentAnimations: cpuPower > 7 ? 6 : 4,
  };
};

export function useAnimationPerformance(): AnimationPerformanceReturn {
  const [capabilities] = useState<DeviceCapabilities>(() =>
    detectDeviceCapabilities(),
  );
  const [settings] = useState<PerformanceSettings>(() =>
    generatePerformanceSettings(capabilities),
  );
  const [currentFPS, setCurrentFPS] = useState<number>(60);

  // FPS monitoring
  useEffect(() => {
    if (!settings.enableAnimations) {return;}

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        setCurrentFPS(
          Math.round((frameCount * 1000) / (currentTime - lastTime)),
        );
        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [settings.enableAnimations]);

  // Utility functions
  const shouldAnimate = useCallback(
    (complexity: "low" | "medium" | "high") => {
      if (!settings.enableAnimations) {return false;}
      if (capabilities.prefersReducedMotion) {return false;}

      switch (complexity) {
        case "low":
          return true;
        case "medium":
          return !capabilities.isLowEnd;
        case "high":
          return !capabilities.isLowEnd && !capabilities.isMobile;
        default:
          return settings.enableAnimations;
      }
    },
    [settings.enableAnimations, capabilities],
  );

  const getOptimizedDuration = useCallback(
    (baseDuration: number) => {
      if (capabilities.prefersReducedMotion) {return 0;}
      if (capabilities.isLowEnd) {return baseDuration * 1.5;}
      if (capabilities.isMobile) {return baseDuration * 1.2;}
      return baseDuration;
    },
    [capabilities],
  );

  const getOptimizedDebounce = useCallback(
    (baseDebounce: number) => {
      return Math.max(baseDebounce, settings.debounceMs);
    },
    [settings.debounceMs],
  );

  const measurePerformance = useCallback(
    async (callback: () => void): Promise<number> => {
      const startTime = performance.now();

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          callback();
          resolve();
        });
      });

      return performance.now() - startTime;
    },
    [],
  );

  const supportsRAF =
    typeof requestAnimationFrame !== "undefined" &&
    typeof window !== "undefined";

  return {
    capabilities,
    settings,
    currentFPS,
    utils: {
      shouldAnimate,
      getOptimizedDuration,
      getOptimizedDebounce,
      supportsRAF,
      measurePerformance,
    },
  };
}

// Export types for external use
export type {
  AnimationPerformanceReturn,
  DeviceCapabilities,
  PerformanceSettings,
};
