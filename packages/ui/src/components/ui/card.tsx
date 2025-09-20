import * as React from "react";

import { cn } from "../../utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Back-compat props */
    magic?: boolean;
    disableShine?: boolean;
    /** New explicit flag (optional) */
    enableShineBorder?: boolean;
    /** Effect tuning */
    shineDuration?: number;
    shineColor?: string | string[];
    borderWidth?: number;
  }
>(
  (
    {
      className,
      magic = false,
      disableShine = false,
      enableShineBorder,
      shineDuration = 8,
      shineColor = "#AC9469",
      borderWidth = 1,
      children,
      ...props
    },
    ref,
  ) => {
    const __show = enableShineBorder ?? (magic || !disableShine);
    if (__show) {
      const duration = Math.max(0.1, shineDuration ?? 8);
      const colorValue = Array.isArray(shineColor)
        ? (shineColor[0] ?? "#AC9469")
        : (shineColor ?? "#AC9469");

      return (
        <div
          ref={ref}
          className={cn(
            "relative rounded-xl bg-card text-card-foreground shadow overflow-hidden",
            className,
          )}
          style={
            {
              "--shine-duration": `${duration}s`,
              "--shine-color": colorValue,
              "--border-width": `${borderWidth}px`,
            } as React.CSSProperties
          }
          {...props}
        >
          {/* Shine border animation */}
          <div
            className="absolute inset-0 rounded-xl shine-border-animation"
            aria-hidden="true"
          />

          {/* Content wrapper with border */}
          <div
            className={cn(
              "relative z-10 rounded-xl border bg-card text-card-foreground",
              "h-full w-full",
            )}
          >
            {children}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border bg-card text-card-foreground shadow",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
