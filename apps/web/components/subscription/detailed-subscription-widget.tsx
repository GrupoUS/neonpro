'use client';

import { Calendar, Crown, Users, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { SubscriptionWidgetProps } from './types';

export function DetailedSubscriptionWidget({
  subscription,
  onUpgrade,
  onManage,
  className,
}: SubscriptionWidgetProps) {
  const currentPlan = subscription?.plan || 'free';
  const status = subscription?.status || 'inactive';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {currentPlan === 'enterprise' && <Crown className="h-5 w-5" />}
          {currentPlan === 'pro' && <Zap className="h-5 w-5" />}
          Plano {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        </div>

        {subscription?.usage && subscription.usage.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Uso Atual</h4>
            {subscription.usage.map((usage) => (
              <div key={usage.feature} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{usage.feature}</span>
                  <span>
                    {usage.current}/{usage.limit} {usage.unit}
                  </span>
                </div>
                <Progress
                  value={(usage.current / usage.limit) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {currentPlan !== 'enterprise' && onUpgrade && (
            <Button onClick={onUpgrade} className="flex-1">
              Fazer Upgrade
            </Button>
          )}
          {onManage && (
            <Button variant="outline" onClick={onManage} className="flex-1">
              Gerenciar Plano
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
