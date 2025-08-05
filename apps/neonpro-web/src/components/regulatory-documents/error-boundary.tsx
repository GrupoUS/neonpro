import React from "react";
import type { AlertTriangle, RefreshCw } from "lucide-react";
import type { Button } from "@/components/ui/button";
import type { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorBoundaryProps {
  error: string | null;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export function ErrorBoundary({
  error,
  onRetry,
  title = "Error loading documents",
  description = "An error occurred while loading the regulatory documents.",
}: ErrorBoundaryProps) {
  if (!error) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {description}
          {error && <div className="mt-2 p-2 bg-muted rounded text-sm font-mono">{error}</div>}
        </AlertDescription>
      </Alert>

      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
