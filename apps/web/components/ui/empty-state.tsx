"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?:
      | "default"
      | "outline"
      | "secondary"
      | "ghost"
      | "link"
      | "destructive";
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        {icon && (
          <div className="mb-4 rounded-full bg-muted p-3">
            <div className="h-8 w-8 text-muted-foreground">{icon}</div>
          </div>
        )}

        <h3 className="mb-2 font-semibold text-foreground text-lg">{title}</h3>

        <p className="mb-4 max-w-sm text-muted-foreground text-sm">
          {description}
        </p>

        {action && (
          <Button
            className="mt-2"
            onClick={action.onClick}
            variant={action.variant || "default"}
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
