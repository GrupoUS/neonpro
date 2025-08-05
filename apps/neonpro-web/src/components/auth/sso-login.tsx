"use client";

// SSO Login Component
// Story 1.3: SSO Integration - Frontend Login Interface

import type { AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { useSSO } from "@/hooks/use-sso";
import type { cn } from "@/lib/utils";
import type { SSOProvider } from "@/types/sso";

interface SSOLoginProps {
  redirectTo?: string;
  className?: string;
  showTitle?: boolean;
  showDescription?: string;
  onSuccess?: (provider: string, user: any) => void;
  onError?: (error: string, provider?: string) => void;
}

interface ProviderButtonProps {
  provider: SSOProvider;
  isLoading: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function ProviderButton({ provider, isLoading, onClick, disabled }: ProviderButtonProps) {
  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case "google":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        );
      case "microsoft":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#f25022" d="M1 1h10v10H1z" />
            <path fill="#00a4ef" d="M13 1h10v10H13z" />
            <path fill="#7fba00" d="M1 13h10v10H1z" />
            <path fill="#ffb900" d="M13 13h10v10H13z" />
          </svg>
        );
      case "facebook":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
            />
          </svg>
        );
      case "apple":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
            />
          </svg>
        );
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  const buttonStyle = {
    backgroundColor: provider.metadata?.buttonColor || "#ffffff",
    color: provider.metadata?.textColor || "#000000",
    borderColor: provider.metadata?.buttonColor || "#e5e7eb",
  };

  return (
    <Button
      variant="outline"
      className={cn(
        "w-full justify-start gap-3 h-12 text-left font-medium transition-all duration-200",
        "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : getProviderIcon(provider.id)}
      <span className="flex-1">
        {isLoading ? "Connecting..." : `Continue with ${provider.displayName || provider.name}`}
      </span>
    </Button>
  );
}

export function SSOLogin({
  redirectTo,
  className,
  showTitle = true,
  showDescription,
  onSuccess,
  onError,
}: SSOLoginProps) {
  const { providers, isLoading: ssoLoading, error: ssoError, login, getProviders } = useSSO();

  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    getProviders();
  }, [getProviders]);

  useEffect(() => {
    if (ssoError) {
      setLocalError(ssoError);
      onError?.(ssoError);
    }
  }, [ssoError, onError]);

  const handleProviderLogin = async (provider: SSOProvider) => {
    try {
      setLocalError(null);
      setLoadingProvider(provider.id);

      await login(provider.id, {
        redirectTo,
        prompt: "select_account", // Always show account selection
      });

      onSuccess?.(provider.id, null); // User info will be available after redirect
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      setLocalError(errorMessage);
      onError?.(errorMessage, provider.id);
    } finally {
      setLoadingProvider(null);
    }
  };

  const enabledProviders = providers.filter((p) => p.enabled);
  const hasProviders = enabledProviders.length > 0;
  const isLoading = ssoLoading || loadingProvider !== null;
  const error = localError || ssoError;

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="space-y-1">
        {showTitle && (
          <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
        )}
        {showDescription && (
          <CardDescription className="text-center">{showDescription}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {ssoLoading && !hasProviders ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading authentication options...
            </span>
          </div>
        ) : !hasProviders ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No authentication providers are currently available. Please contact support.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {enabledProviders.map((provider) => (
              <ProviderButton
                key={provider.id}
                provider={provider}
                isLoading={loadingProvider === provider.id}
                onClick={() => handleProviderLogin(provider)}
                disabled={isLoading}
              />
            ))}
          </div>
        )}

        {hasProviders && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <a href="/terms" className="underline hover:text-primary">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline hover:text-primary">
                Privacy Policy
              </a>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SSOLogin;
