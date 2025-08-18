import * as React from "react";
import { cn } from "../utils/cn";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "destructive";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    { value, max = 100, variant = "default", size = "md", showText = false, className, ...props },
    ref,
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-muted",
          {
            "h-1": size === "sm",
            "h-2": size === "md",
            "h-3": size === "lg",
          },
          className,
        )}
        ref={ref}
        {...props}
      >
        <div
          className={cn("h-full w-full flex-1 transition-all", {
            "bg-primary": variant === "default",
            "bg-green-500": variant === "success",
            "bg-yellow-500": variant === "warning",
            "bg-red-500": variant === "destructive",
          })}
          style={{
            transform: `translateX(-${100 - percentage}%)`,
          }}
        />

        {showText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-medium text-white text-xs">{Math.round(percentage)}%</span>
          </div>
        )}
      </div>
    );
  },
);

ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
