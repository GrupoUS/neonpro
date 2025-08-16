'use client';

import { Calendar, Users, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { SubscriptionWidgetProps } from './types';

export function SubscriptionDashboardWidget({
  subscription,
  className,
}: SubscriptionWidgetProps) {
  const currentPlan = subscription?.plan || 'free';
  const status = subscription?.status || 'inactive';

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Assinatura</CardTitle>
        <Zap className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold capitalize">{currentPlan}</span>
            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
              {status}
            </Badge>
          </div>

          {subscription?.currentPeriodEnd && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              Renovação em{' '}
              {subscription.currentPeriodEnd.toLocaleDateString('pt-BR')}
            </div>
          )}

          {subscription?.usage && subscription.usage.length > 0 && (
            <div className="space-y-2">
              {subscription.usage.slice(0, 2).map((usage) => (
                <div key={usage.feature} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{usage.feature}</span>
                    <span>
                      {usage.current}/{usage.limit}
                    </span>
                  </div>
                  <Progress
                    value={(usage.current / usage.limit) * 100}
                    className="h-1"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
