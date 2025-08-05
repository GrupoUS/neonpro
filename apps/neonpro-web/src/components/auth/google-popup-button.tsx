"use client";

import type { Button } from "@/components/ui/button";
import type { useAuth } from "@/contexts/auth-context";
import type { AlertCircle, CheckCircle, Chrome } from "lucide-react";
import type { useCallback, useEffect, useState } from "react";
import type { toast } from "sonner";

interface SignInWithGooglePopupButtonProps {
  text?: string;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Performance tracking for ≤3 second requirement
interface OAuthMetrics {
  startTime: number;
  popupOpenTime: number;
  authCompleteTime: number;
  totalTime: number;
}

export function SignInWithGooglePopupButton({
  text = "Entrar com Google",
  loadingText = "Autenticando...",
  className,
  disabled,
  onSuccess,
  onError,
}: SignInWithGooglePopupButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [authState, setAuthState] = useState<
    "idle" | "connecting" | "authenticating" | "success" | "error"
  >("idle");
  const { signInWithGoogle } = useAuth();

  // Performance monitoring
  const [metrics, setMetrics] = useState<OAuthMetrics>({
    startTime: 0,
    popupOpenTime: 0,
    authCompleteTime: 0,
    totalTime: 0,
  });

  // Enhanced error handling with specific error types
  const handleOAuthError = useCallback(
    (error: any, context: string) => {
      console.error(`🔥 OAuth Error [${context}]:`, error);

      let userMessage = "Falha na autenticação com Google.";

      // Specific error handling
      if (error?.message?.includes("popup")) {
        userMessage = "Por favor, permita popups para fazer login com Google.";
      } else if (error?.message?.includes("cancelled")) {
        userMessage = "Login cancelado. Tente novamente.";
      } else if (error?.message?.includes("network")) {
        userMessage = "Erro de conexão. Verifique sua internet.";
      } else if (error?.message?.includes("timeout")) {
        userMessage = "Login demorou muito. Tente novamente.";
      }

      toast.error(userMessage);
      onError?.(userMessage);
      setAuthState("error");
    },
    [onError],
  );

  // Optimized sign in with timeout and retry logic
  const handleSignIn = useCallback(async () => {
    const startTime = Date.now();
    setMetrics((prev) => ({ ...prev, startTime }));

    setIsLoading(true);
    setAuthState("connecting");

    try {
      // Timeout protection (4 seconds max to stay under 5s total)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("OAuth timeout after 4 seconds")), 4000);
      });

      setAuthState("authenticating");
      const popupTime = Date.now();
      setMetrics((prev) => ({ ...prev, popupOpenTime: popupTime }));

      const { error } = (await Promise.race([signInWithGoogle(), timeoutPromise])) as {
        error: any;
      };

      const authCompleteTime = Date.now();
      const totalTime = authCompleteTime - startTime;

      setMetrics((prev) => ({
        ...prev,
        authCompleteTime,
        totalTime,
      }));

      if (error) {
        handleOAuthError(error, "signInWithGoogle");
        return;
      }

      // Success
      setAuthState("success");

      // Performance feedback
      if (totalTime <= 3000) {
        console.log(`✅ OAuth completed in ${totalTime}ms (≤3s requirement met)`);
      } else {
        console.warn(`⚠️ OAuth took ${totalTime}ms (exceeds 3s requirement)`);
      }

      toast.success("Login realizado com sucesso!");
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro inesperado no OAuth";
      handleOAuthError(err, "handleSignIn");
    } finally {
      setIsLoading(false);
      // Reset state after a delay
      setTimeout(() => setAuthState("idle"), 2000);
    }
  }, [signInWithGoogle, handleOAuthError, onSuccess]);

  // Keyboard accessibility
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleSignIn();
      }
    },
    [handleSignIn],
  );

  // Preload popup optimization
  useEffect(() => {
    // Preload Google's OAuth endpoints for faster connection
    const preloadLink = document.createElement("link");
    preloadLink.rel = "dns-prefetch";
    preloadLink.href = "https://accounts.google.com";
    document.head.appendChild(preloadLink);

    return () => {
      document.head.removeChild(preloadLink);
    };
  }, []);

  // Dynamic button content based on state
  const getButtonContent = () => {
    switch (authState) {
      case "connecting":
        return (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            Conectando...
          </>
        );
      case "authenticating":
        return (
          <>
            <div className="animate-pulse h-4 w-4 bg-blue-500 rounded-full mr-2"></div>
            Autenticando...
          </>
        );
      case "success":
        return (
          <>
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            Sucesso!
          </>
        );
      case "error":
        return (
          <>
            <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
            Tentar novamente
          </>
        );
      default:
        return (
          <>
            <Chrome className="mr-2 h-4 w-4" />
            {text}
          </>
        );
    }
  };

  return (
    <Button
      variant="outline"
      className={`
        ${className} 
        transition-all duration-200 
        hover:shadow-md 
        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${authState === "error" ? "border-red-300 hover:border-red-400" : ""}
        ${authState === "success" ? "border-green-300 hover:border-green-400" : ""}
      `}
      onClick={handleSignIn}
      onKeyDown={handleKeyDown}
      disabled={isLoading || disabled}
      aria-label={`${text} - Login com Google OAuth`}
      role="button"
      tabIndex={0}
    >
      {getButtonContent()}
    </Button>
  );
}
