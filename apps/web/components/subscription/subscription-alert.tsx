'use client';

import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface SubscriptionAlertProps {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function SubscriptionAlert({
  type,
  title,
  description,
  action,
  className,
}: SubscriptionAlertProps) {
  const icons = {
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle,
  };

  const Icon = icons[type];

  return (
    <Alert className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {description}
        {action && (
          <div className="mt-3">
            <Button size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
