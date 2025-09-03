"use client";

import { usePerformanceMonitor } from "@/providers/performance-monitor-provider";
import { useCallback, useEffect, useState } from "react";

interface AILoadingState {
  isLoading: boolean;
  isLoaded: boolean;
  canLoad: boolean;
  error: string | null;
  loadingProgress: number; // 0-100
}

interface AIFeatureConfig {
  preloadOnInteraction?: boolean; // Preload when user shows intent
  preloadOnIdle?: boolean; // Preload during browser idle time
  requiresConsent?: boolean; // LGPD compliance for AI processing
  priority?: "high" | "medium" | "low"; // Loading priority
}

/**
 * Healthcare-optimized AI lazy loading hook
 * Manages TensorFlow.js loading with performance monitoring and LGPD compliance
 */
export function useAILazyLoading(config: AIFeatureConfig = {}) {
  const [state, setState] = useState<AILoadingState>({
    isLoading: false,
    isLoaded: false,
    canLoad: typeof window !== "undefined",
    error: null,
    loadingProgress: 0,
  });

  const { setHealthcareContext } = usePerformanceMonitor();

  const {
    preloadOnInteraction = true,
    preloadOnIdle = false,
    requiresConsent = true,
    priority = "medium",
  } = config;

  // Check LGPD consent for AI processing
  const hasAIConsent = useCallback(() => {
    if (!requiresConsent) return true;
    if (typeof window === "undefined") return false;

    const consent = localStorage.getItem("lgpd-consent-ai");
    const generalConsent = localStorage.getItem("lgpd-consent");

    return consent === "accepted" || generalConsent === "all-accepted";
  }, [requiresConsent]);

  // Load AI models with progress tracking
  const loadAI = useCallback(async () => {
    if (state.isLoaded || state.isLoading || !state.canLoad) {
      return;
    }

    if (requiresConsent && !hasAIConsent()) {
      setState(prev => ({
        ...prev,
        error: "AI consent required - LGPD compliance",
        canLoad: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, loadingProgress: 10 }));

    try {
      // Set healthcare context for performance monitoring
      setHealthcareContext({
        workflowType: "real-time-update",
        userId: "ai-loading",
      });

      setState(prev => ({ ...prev, loadingProgress: 30 }));

      // Dynamic import of AI prediction services
      console.log("🧠 Loading AI prediction services...");
      const [aiModule, tfModule] = await Promise.all([
        import("@neonpro/ai/prediction"),
        import("@neonpro/ai/prediction/core/tensorflow-lazy-loader"),
      ]);

      setState(prev => ({ ...prev, loadingProgress: 60 }));

      // Initialize TensorFlow.js with healthcare optimizations
      await tfModule.tensorFlowLoader.getTensorFlow();

      setState(prev => ({ ...prev, loadingProgress: 90 }));

      // Initialize prediction engine
      await aiModule.AestheticPredictionEngine?.prototype?.initialize?.();

      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: true,
        loadingProgress: 100,
      }));

      console.log("✅ AI services loaded and ready for healthcare predictions");
    } catch (error) {
      console.error("❌ AI loading failed:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "AI loading failed",
        loadingProgress: 0,
      }));
    }
  }, [
    state.isLoaded,
    state.isLoading,
    state.canLoad,
    requiresConsent,
    hasAIConsent,
    setHealthcareContext,
  ]);

  // Preload AI during browser idle time
  useEffect(() => {
    if (!preloadOnIdle || state.isLoaded) return;

    const idleCallback = (deadline: IdleDeadline) => {
      if (deadline.timeRemaining() > 100 && hasAIConsent()) {
        loadAI();
      }
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(idleCallback, { timeout: 5000 });
      return () => window.cancelIdleCallback(idleId);
    }
  }, [preloadOnIdle, state.isLoaded, loadAI, hasAIConsent]);

  // Preload on user interaction patterns
  useEffect(() => {
    if (!preloadOnInteraction || state.isLoaded || !state.canLoad) return;

    const interactionEvents = ["mouseenter", "focus", "touchstart"];
    let preloadTriggered = false;

    const handleInteraction = () => {
      if (!preloadTriggered && hasAIConsent()) {
        preloadTriggered = true;

        // Delay slightly to avoid blocking user interaction
        setTimeout(() => {
          loadAI();
        }, 100);
      }
    };

    // Listen for interactions with AI-related elements
    const aiElements = document.querySelectorAll([
      "[data-ai-feature]",
      "[data-prediction]",
      ".ai-chat",
      ".prediction-panel",
      ".treatment-recommendation",
    ].join(","));

    aiElements.forEach(element => {
      interactionEvents.forEach(event => {
        element.addEventListener(event, handleInteraction, { passive: true, once: true });
      });
    });

    return () => {
      aiElements.forEach(element => {
        interactionEvents.forEach(event => {
          element.removeEventListener(event, handleInteraction);
        });
      });
    };
  }, [preloadOnInteraction, state.isLoaded, state.canLoad, loadAI, hasAIConsent]);

  // Request AI consent for LGPD compliance
  const requestAIConsent = useCallback(() => {
    if (typeof window === "undefined") return Promise.resolve(false);

    // Prefer UI-driven consent via CustomEvent to comply with no-alert/no-confirm policy
    return new Promise<boolean>((resolve) => {
      let resolved = false;

      const onResponse = (event: Event) => {
        const detail = (event as CustomEvent<{ consent: boolean; }>).detail;
        if (!detail || typeof detail.consent !== "boolean") return;
        resolved = true;
        window.removeEventListener("ai-consent-response", onResponse as EventListener);

        const consent = detail.consent;
        if (consent) {
          localStorage.setItem("lgpd-consent-ai", "accepted");
          setState(prev => ({ ...prev, canLoad: true, error: null }));
        } else {
          localStorage.setItem("lgpd-consent-ai", "denied");
          setState(prev => ({
            ...prev,
            canLoad: false,
            error: "AI consent denied - required for predictions",
          }));
        }
        resolve(consent);
      };

      // Listen for UI response
      window.addEventListener("ai-consent-response", onResponse as EventListener, { once: true });

      // Notify UI layer to show consent modal
      const requestEvent = new CustomEvent("ai-consent-request", {
        detail: {
          context: "predictive-ai",
          message:
            "Para utilizar recursos de IA preditiva, precisamos processar dados clínicos com algoritmos de aprendizado de máquina. Os dados são processados localmente no seu dispositivo. Autoriza o uso de IA para predições clínicas?",
        },
      });
      window.dispatchEvent(requestEvent);

      // Fallback timeout: if no UI handles the request, do not block; resolve to false safely
      window.setTimeout(() => {
        if (resolved) return;
        window.removeEventListener("ai-consent-response", onResponse as EventListener);
        // No blocking dialogs; require explicit UI consent
        setState(prev => ({
          ...prev,
          canLoad: false,
          error: "AI consent pending - awaiting user decision",
        }));
        resolve(false);
      }, 8000);
    });
  }, []);

  // Trigger AI loading manually
  const triggerAILoad = useCallback(async () => {
    if (!hasAIConsent()) {
      const consent = await requestAIConsent();
      if (!consent) return false;
    }

    await loadAI();
    return state.isLoaded;
  }, [hasAIConsent, requestAIConsent, loadAI, state.isLoaded]);

  return {
    ...state,
    loadAI: triggerAILoad,
    requestConsent: requestAIConsent,
    hasConsent: hasAIConsent(),
    preloadTrigger: loadAI, // For manual preloading
  };
}

// Hook for specific AI features with smart loading
export function useAIFeature(featureType: "prediction" | "chat" | "recommendation") {
  const aiLoading = useAILazyLoading({
    preloadOnInteraction: true,
    preloadOnIdle: featureType !== "prediction", // Predictions need immediate loading
    requiresConsent: true,
    priority: featureType === "prediction" ? "high" : "medium",
  });

  // Feature-specific loading states
  const isFeatureReady = aiLoading.isLoaded && !aiLoading.error;
  const needsLoading = !aiLoading.isLoaded && !aiLoading.isLoading;

  return {
    ...aiLoading,
    isFeatureReady,
    needsLoading,
    loadingMessage: aiLoading.isLoading
      ? `Carregando IA ${
        featureType === "prediction"
          ? "preditiva"
          : featureType === "chat"
          ? "conversacional"
          : "de recomendações"
      }...`
      : null,
  };
}
