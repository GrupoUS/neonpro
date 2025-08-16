'use client';

import { AlertTriangle, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { SubscriptionData } from './types';

interface UsageLimitGateProps {
  feature: string;
  subscription?: SubscriptionData;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  className?: string;
}

export function UsageLimitGate({
  feature,
  subscription,
  children,
  fallback,
  showUpgradePrompt = true,
  className,
}: UsageLimitGateProps) {
  // Find usage for this specific feature
  const usage = subscription?.usage?.find((u) => u.feature === feature);

  if (!usage) {
    // If no usage data, allow access
    return <>{children}</>;
  }

  const usagePercentage = (usage.current / usage.limit) * 100;
  const isAtLimit = usage.current >= usage.limit;
  const isNearLimit = usagePercentage >= 80;

  // If at limit, show gate
  if (isAtLimit) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showUpgradePrompt) {
      return null;
    }

    return (
      <Alert className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Limite Atingido</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>
            Você atingiu o limite de {usage.limit} para {feature}.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Uso atual:</span>
              <span>
                {usage.current}/{usage.limit}
              </span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
          <Button size="sm" className="w-full">
            <TrendingUp className="mr-2 h-4 w-4" />
            Fazer Upgrade
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // If near limit, show warning but allow access
  if (isNearLimit) {
    return (
      <div className="space-y-3">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Próximo do Limite</AlertTitle>
          <AlertDescription className="text-yellow-700">
            <div className="space-y-2">
              <p>
                Você está usando {usage.current} de {usage.limit} para {feature}
                .
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Uso atual:</span>
                  <span>
                    {usage.current}/{usage.limit}
                  </span>
                </div>
                <Progress value={usagePercentage} className="h-1" />
              </div>
            </div>
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  // Normal usage, just show children
  return <>{children}</>;
}
