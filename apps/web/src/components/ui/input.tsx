import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // NeonPro Healthcare Props from @apex-ui-ux-designer.md
  readonly clientId?: string
  readonly userRole?: 'admin' | 'aesthetician' | 'coordinator'
  readonly lgpdCompliant?: boolean
  readonly onAuditLog?: (action: string, details?: Record<string, any>) => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, clientId, userRole, lgpdCompliant = true, onAuditLog, ...props }, ref) => {
    const handleFocus = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      // Healthcare audit logging
      if (onAuditLog && lgpdCompliant) {
        onAuditLog('input_focus', {
          userRole,
          clientId,
          fieldName: props.name,
          timestamp: new Date().toISOString(),
          component: 'Input'
        })
      }
      
      props.onFocus?.(e)
    }, [onAuditLog, lgpdCompliant, userRole, clientId, props])

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 healthcare-focus-ring touch-target",
          className
        )}
        ref={ref}
        {...props}
        onFocus={handleFocus}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }