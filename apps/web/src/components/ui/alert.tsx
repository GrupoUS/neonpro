import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from '@/lib/utils'

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-red-600 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-950 dark:text-red-100 [&>svg]:text-red-600",
        // Enhanced emergency system with WCAG 2.1 AA+ compliance
        emergency: "border-red-800 bg-red-100 text-red-900 [&>svg]:text-red-800 shadow-lg font-semibold",
        "emergency-critical": "border-red-900 bg-red-200 text-red-950 [&>svg]:text-red-900 shadow-xl font-bold animate-pulse",
        // NeonPro specific variants with enhanced contrast
        neonpro: "border-neonpro-primary bg-neonpro-primary/10 text-neonpro-900 [&>svg]:text-neonpro-primary",
        "neonpro-medical": "border-neonpro-deep-blue bg-neonpro-deep-blue/10 text-neonpro-100 [&>svg]:text-neonpro-deep-blue",
        success: "border-green-700 bg-green-100 text-green-900 [&>svg]:text-green-700",
        warning: "border-orange-600 bg-orange-100 text-orange-900 [&>svg]:text-orange-600",
        info: "border-blue-700 bg-blue-100 text-blue-900 [&>svg]:text-blue-700",
        // Healthcare-specific variants with enhanced accessibility
        medical: "border-purple-700 bg-purple-50 text-purple-900 [&>svg]:text-purple-700",
        evacuation: "border-orange-800 bg-orange-200 text-orange-950 [&>svg]:text-orange-800 shadow-lg",
        security: "border-gray-800 bg-gray-100 text-gray-900 [&>svg]:text-gray-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants> & {
    readonly clientId?: string
    readonly userRole?: 'admin' | 'aesthetician' | 'coordinator'
    readonly lgpdCompliant?: boolean
  }
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }