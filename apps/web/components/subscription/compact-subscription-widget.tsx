'use client';

import { Crown, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SubscriptionWidgetProps } from './types';

export function CompactSubscriptionWidget({
  subscription,
  onUpgrade,
  onManage,
  className,
}: SubscriptionWidgetProps) {
  const planColors = {
    free: 'bg-gray-100 text-gray-800',
    pro: 'bg-blue-100 text-blue-800',
    enterprise: 'bg-purple-100 text-purple-800',
  };

  const planIcons = {
    free: null,
    pro: <Zap className="h-4 w-4" />,
    enterprise: <Crown className="h-4 w-4" />,
  };

  const currentPlan = subscription?.plan || 'free';
  const status = subscription?.status || 'inactive';

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
          <Badge variant="secondary" className={planColors[currentPlan]}>
            <div className="flex items-center gap-1">
              {planIcons[currentPlan]}
              {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground">
            Status: <span className="capitalize">{status}</span>
          </div>

          {subscription?.currentPeriodEnd && (
            <div className="text-xs text-muted-foreground">
              Renovação:{' '}
              {subscription.currentPeriodEnd.toLocaleDateString('pt-BR')}
            </div>
          )}

          <div className="flex gap-2">
            {currentPlan !== 'enterprise' && onUpgrade && (
              <Button size="sm" onClick={onUpgrade} className="flex-1">
                Upgrade
              </Button>
            )}
            {onManage && (
              <Button
                size="sm"
                variant="outline"
                onClick={onManage}
                className="flex-1"
              >
                Gerenciar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
