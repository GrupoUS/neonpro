'use client';

import { AlertTriangle, Calendar, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { SubscriptionWidgetProps } from './types';

export function SubscriptionStatusCard({
  subscription,
  className,
}: SubscriptionWidgetProps) {
  const currentPlan = subscription?.plan || 'free';
  const status = subscription?.status || 'inactive';
  const isActive = status === 'active';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'canceled':
        return 'destructive';
      case 'past_due':
        return 'destructive';
      case 'trialing':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CreditCard className="h-4 w-4" />;
      case 'canceled':
      case 'past_due':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="capitalize">{currentPlan}</CardTitle>
            <CardDescription>Status da sua assinatura</CardDescription>
          </div>
          <Badge
            variant={getStatusColor(status)}
            className="flex items-center gap-1"
          >
            {getStatusIcon(status)}
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription?.currentPeriodEnd && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Próxima cobrança:</span>
            <span>
              {subscription.currentPeriodEnd.toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}

        {subscription?.cancelAtPeriodEnd && (
          <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Assinatura será cancelada no final do período</span>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {!isActive && <Button className="flex-1">Reativar Assinatura</Button>}
          {isActive && (
            <>
              <Button variant="outline" className="flex-1">
                Gerenciar
              </Button>
              <Button className="flex-1">Upgrade</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
