import { cn } from "@/lib/utils"
import * as React from "react"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    readonly clientId?: string
    readonly userRole?: 'admin' | 'aesthetician' | 'coordinator' | 'doctor' | 'nurse'
    readonly lgpdCompliant?: boolean
    readonly variant?: 'default' | 'neonpro' | 'glass' | 'medical' | 'emergency'
    readonly accessibilityLevel?: 'standard' | 'enhanced'
  }
>(({ className, variant = 'default', accessibilityLevel = 'standard', ...props }, ref) => {
  const variantClasses = {
    default: "rounded-lg border bg-card text-card-foreground shadow-sm",
    neonpro: "rounded-lg border bg-card text-card-foreground neonpro-neumorphic",
    glass: "rounded-lg border neonpro-glass",
    medical: "rounded-lg border border-blue-200 bg-blue-50/50 text-blue-900 shadow-sm",
    emergency: "rounded-lg border border-red-200 bg-red-50/50 text-red-900 shadow-lg",
  }

  const accessibilityClasses = {
    standard: "",
    enhanced: "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
  }

  return (
    <div
      ref={ref}
      className={cn(
        variantClasses[variant], 
        accessibilityClasses[accessibilityLevel],
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    readonly emergency?: boolean
    readonly accessibilityLevel?: 'standard' | 'enhanced'
  }
>(({ className, emergency = false, accessibilityLevel = 'standard', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      emergency && "border-b border-red-200 bg-red-50/30",
      accessibilityLevel === 'enhanced' && "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    readonly emergency?: boolean
    readonly accessibilityLevel?: 'standard' | 'enhanced'
  }
>(({ className, emergency = false, accessibilityLevel = 'standard', ...props }, ref) => {
  const emergencyClasses = emergency ? "text-red-700 font-bold" : ""
  const accessibilityClasses = accessibilityLevel === 'enhanced' ? "text-xl" : "text-2xl"
  
  return (
    <h3
      ref={ref}
      className={cn(
        `font-semibold leading-none tracking-tight ${accessibilityClasses}`,
        emergencyClasses,
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    readonly screenReaderOnly?: boolean
  }
>(({ className, screenReaderOnly = false, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground",
      screenReaderOnly && "sr-only",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    readonly enhancedFocus?: boolean
  }
>(({ className, enhancedFocus = false, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "p-6 pt-0", 
      enhancedFocus && "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    readonly emergencyActions?: boolean
  }
>(({ className, emergencyActions = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      emergencyActions && "border-t border-red-200 bg-red-50/20",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }