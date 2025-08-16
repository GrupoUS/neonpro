'use client';

import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { FeatureGateProps } from './types';

export function FeatureGate({
  feature,
  plan,
  fallback,
  children,
  showUpgradePrompt = true,
}: FeatureGateProps) {
  // Mock feature access check - in real app this would check user's subscription
  const hasAccess = true; // Replace with actual logic

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Lock className="h-6 w-6" />
        </div>
        <CardTitle className="text-lg">Recurso Bloqueado</CardTitle>
        <CardDescription>
          O recurso "{feature}" requer um plano {plan || 'premium'}.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button>Fazer Upgrade</Button>
      </CardContent>
    </Card>
  );
}

export function ProFeatureGate({
  children,
  ...props
}: Omit<FeatureGateProps, 'plan'>) {
  return (
    <FeatureGate {...props} plan="pro">
      {children}
    </FeatureGate>
  );
}

export function EnterpriseFeatureGate({
  children,
  ...props
}: Omit<FeatureGateProps, 'plan'>) {
  return (
    <FeatureGate {...props} plan="enterprise">
      {children}
    </FeatureGate>
  );
}
