"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "pdf" | "excel" | "chart" | "payment" | "animation" | "default";
}

export function LoadingSkeleton({ className, variant = "default" }: LoadingSkeletonProps) {
  const getSkeletonLayout = () => {
    switch (variant) {
      case "pdf":
        return (
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="flex gap-2 justify-center">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        );

      case "excel":
        return (
          <div className="space-y-4 p-4">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {Array(20).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          </div>
        );

      case "chart":
        return (
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="flex gap-4 justify-center">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-4 p-6">
            <Skeleton className="h-8 w-48 mx-auto" />
            <div className="space-y-3">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-12 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        );

      case "animation":
        return (
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full animate-pulse" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4 animate-pulse" />
                <Skeleton className="h-4 w-1/2 animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-24 w-full rounded animate-pulse" />
              <Skeleton className="h-24 w-full rounded animate-pulse" />
              <Skeleton className="h-24 w-full rounded animate-pulse" />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-3 p-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn("animate-pulse", className)}>
      {getSkeletonLayout()}
    </div>
  );
}

// Loading messages for different variants
export const LoadingMessages = {
  pdf: "Carregando gerador de PDF...",
  excel: "Carregando processador Excel...",
  chart: "Carregando visualização...",
  payment: "Carregando sistema de pagamento...",
  animation: "Carregando animações...",
  default: "Carregando componente...",
} as const;

// Loading component with message
interface LoadingWithMessageProps extends LoadingSkeletonProps {
  message?: string;
  showMessage?: boolean;
}

export function LoadingWithMessage({
  variant = "default",
  message,
  showMessage = true,
  className,
}: LoadingWithMessageProps) {
  const displayMessage = message || LoadingMessages[variant];

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-32", className)}>
      <LoadingSkeleton variant={variant} />
      {showMessage && (
        <p className="text-sm text-gray-500 mt-4 text-center">
          {displayMessage}
        </p>
      )}
    </div>
  );
}
