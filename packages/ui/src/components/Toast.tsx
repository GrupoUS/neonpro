import React from "react";

// Placeholder import for @neonpro/utils
const cn = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(" ");

// Toast context and provider
interface ToastContextType {
  toast: (props: ToastProps) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined,
);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    // Fallback implementation
    return {
      toast: (_props: ToastProps) => {},
    };
  }
  return context;
}

interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  action?: React.ReactElement;
}

export type { ToastProps };

export function Toast({
  title,
  description,
  variant = "default",
  ...props
}: ToastProps) {
  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        variant === "destructive"
          ? "border-destructive bg-destructive/10"
          : "border-border bg-card",
      )}
      {...props}
    >
      <div className="grid gap-1">
        {title && (
          <div
            className={cn(
              "font-semibold text-sm",
              variant === "destructive"
                ? "text-destructive"
                : "text-foreground",
            )}
          >
            {title}
          </div>
        )}
        {description && (
          <div
            className={cn(
              "text-sm opacity-90",
              variant === "destructive"
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = React.useCallback((_props: ToastProps) => {}, []);

  return (
    <ToastContext.Provider value={{ toast }}>{children}</ToastContext.Provider>
  );
}

// Additional exports to avoid conflicts
export interface ToastActionElement extends React.ReactElement {}

export const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => (
  <button
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 font-medium text-sm ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

export const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => (
  <button
    className={cn(
      "absolute top-2 right-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      className,
    )}
    ref={ref}
    {...props}
  />
));
ToastClose.displayName = "ToastClose";

export function ToastTitle({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("font-semibold text-sm", className)} {...props}>
      {children}
    </div>
  );
}

export function ToastDescription({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("text-sm opacity-90", className)} {...props}>
      {children}
    </div>
  );
}
