/**
 * Subscription Hook for NeonPro
 * Manages user subscription state and AI model access
 */

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  type AIModel,
  getAvailableModels,
  getModelsForChat,
  getUserSubscription,
  hasModelAccess,
  type ModelAccess,
  updateUserSubscription,
  type UserSubscription,
} from "@/lib/subscription/subscription-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

/**
 * Hook for managing user subscription and AI model access
 */
export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query user subscription status
  const {
    data: subscription,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: () => getUserSubscription(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get available models based on subscription
  const availableModels: ModelAccess[] = subscription
    ? getAvailableModels(subscription)
    : [];

  // Get models formatted for chat component
  const chatModels = subscription ? getModelsForChat(subscription) : [];

  // Check if user has pro access
  const hasPro =
    subscription?.status === "pro" || subscription?.status === "trial";

  // Check if user is on trial
  const isOnTrial = subscription?.status === "trial";

  // Check if subscription is expired
  const isExpired = subscription?.status === "expired";

  // Check access to specific model
  const checkModelAccess = useCallback(
    (model: AIModel): boolean => {
      if (!subscription) return false;
      return hasModelAccess(subscription, model);
    },
    [subscription],
  );

  // Update subscription status
  const updateSubscription = useCallback(
    async (subscriptionData: Partial<UserSubscription>): Promise<boolean> => {
      if (!user?.id) return false;

      const success = await updateUserSubscription(user.id, subscriptionData);

      if (success) {
        // Invalidate and refetch subscription data
        queryClient.invalidateQueries({ queryKey: ["subscription", user.id] });
      }

      return success;
    },
    [user?.id, queryClient],
  );

  // Set up real-time subscription to profile changes
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel("subscription-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Profile subscription updated:", payload);
          // Refetch subscription data when profile changes
          refetch();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `customer_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Subscription record updated:", payload);
          // Refetch subscription data when subscription changes
          refetch();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  // Get trial days remaining
  const trialDaysRemaining = subscription?.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(subscription.trialEndsAt).getTime() -
            new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  // Get subscription display info
  const subscriptionInfo = {
    status: subscription?.status || "free",
    plan: subscription?.plan,
    isActive: hasPro,
    isOnTrial,
    isExpired,
    trialDaysRemaining,
    displayStatus:
      subscription?.status === "free"
        ? "Plano Gratuito"
        : subscription?.status === "pro"
          ? "NeonPro Pro"
          : subscription?.status === "trial"
            ? `Teste Grátis (${trialDaysRemaining} dias restantes)`
            : subscription?.status === "expired"
              ? "Assinatura Expirada"
              : "Status Desconhecido",
  };

  // Upgrade prompt logic
  const shouldShowUpgradePrompt = !hasPro || isExpired;
  const upgradeUrl = "https://buy.stripe.com/6oU3cw8Tz0IZ4mW2bFgYU02";

  return {
    // Subscription data
    subscription,
    subscriptionInfo,
    isLoading,
    error,

    // Access checks
    hasPro,
    isOnTrial,
    isExpired,
    checkModelAccess,

    // Models
    availableModels,
    chatModels,

    // Actions
    updateSubscription,
    refetch,

    // Trial info
    trialDaysRemaining,

    // Upgrade prompts
    shouldShowUpgradePrompt,
    upgradeUrl,
  };
}

/**
 * Hook for checking if user can access a specific model
 */
export function useModelAccess(model: AIModel) {
  const { subscription, checkModelAccess } = useSubscription();

  return {
    hasAccess: checkModelAccess(model),
    requiresPro: !["gpt-5-mini", "gemini-2.5-flash"].includes(model),
    subscription,
  };
}

/**
 * Hook for subscription upgrade prompts
 */
export function useSubscriptionPrompt() {
  const { hasPro, isExpired, subscriptionInfo } = useSubscription();

  const shouldShowUpgradePrompt = !hasPro || isExpired;

  const upgradeMessage = isExpired
    ? "Sua assinatura expirou. Renove para continuar usando modelos avançados."
    : "Upgrade para NeonPro Pro e acesse todos os modelos de IA avançados.";

  const upgradeUrl = "https://buy.stripe.com/6oU3cw8Tz0IZ4mW2bFgYU02";

  return {
    shouldShowUpgradePrompt,
    upgradeMessage,
    upgradeUrl,
    subscriptionInfo,
  };
}
