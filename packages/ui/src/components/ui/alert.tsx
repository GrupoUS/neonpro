import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)1fr] grid-cols-[01fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive:
          'text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90',
        // Healthcare-specific variants
        emergency: 'border-red-500 bg-red-50 text-red-900 [&>svg]:text-red-600 *:data-[slot=alert-description]:text-red-800',
        medical: 'border-blue-500 bg-blue-50 text-blue-900 [&>svg]:text-blue-600 *:data-[slot=alert-description]:text-blue-800',
        success: 'border-green-500 bg-green-50 text-green-900 [&>svg]:text-green-600 *:data-[slot=alert-description]:text-green-800',
        warning: 'border-yellow-500 bg-yellow-50 text-yellow-900 [&>svg]:text-yellow-600 *:data-[slot=alert-description]:text-yellow-800',
        lgpd: 'border-purple-500 bg-purple-50 text-purple-900 [&>svg]:text-purple-600 *:data-[slot=alert-description]:text-purple-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface AlertProps extends React.ComponentProps<'div'>, VariantProps<typeof alertVariants> {
  // Healthcare-specific props
  emergency?: boolean
  audible?: boolean
  vibration?: boolean
  ariaLive?: 'polite' | 'assertive' | 'off'
}

function Alert({
  className,
  variant,
  emergency = false,
  audible = false,
  vibration = false,
  ariaLive = 'polite',
  ...props
}: AlertProps) {
  // Auto-set variant for emergency alerts
  const finalVariant = emergency ? 'emergency' : variant
  
  // Trigger emergency notifications
  React.useEffect(() => {
    if (emergency && audible) {
      // Play emergency sound (implementation would use Web Audio API)
      console.log('🚨 Emergency alert sound activated')
    }
    if (emergency && vibration && 'vibrate' in navigator) {
      // Vibrate for emergency alerts
      navigator.vibrate([200, 100, 200])
    }
  }, [emergency, audible, vibration])
  
  return (
    <div
      data-slot='alert'
      role='alert'
      aria-live={ariaLive}
      className={cn(alertVariants({ variant: finalVariant }), className)}
      data-emergency={emergency}
      {...props}
    />
  )
}

function AlertTitle({ className, emergency = false, ...props }: React.ComponentProps<'div'> & { emergency?: boolean }) {
  return (
    <div
      data-slot='alert-title'
      className={cn(
        'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight',
        emergency && 'text-red-700 font-bold',
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  screenReaderOnly = false,
  ...props
}: React.ComponentProps<'div'> & { screenReaderOnly?: boolean }) {
  return (
    <div
      data-slot='alert-description'
      className={cn(
        'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&p]:leading-relaxed',
        screenReaderOnly && 'sr-only',
        className,
      )}
      {...props}
    />
  )
}

// Healthcare-specific alert components with icons
function EmergencyAlert({ className, ...props }: React.ComponentProps<typeof Alert>) {
  return (
    <Alert variant="emergency" emergency audible className={cn('border-2 border-red-600', className)} {...props}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle emergency>Emergency Alert</AlertTitle>
      <AlertDescription>
        {props.children || 'Immediate attention required'}
      </AlertDescription>
    </Alert>
  )
}

function MedicalAlert({ className, ...props }: React.ComponentProps<typeof Alert>) {
  return (
    <Alert variant="medical" className={cn('border-2 border-blue-600', className)} {...props}>
      <Info className="h-4 w-4" />
      <AlertTitle>Medical Alert</AlertTitle>
      <AlertDescription>
        {props.children || 'Medical information'}
      </AlertDescription>
    </Alert>
  )
}

function LgpdAlert({ className, ...props }: React.ComponentProps<typeof Alert>) {
  return (
    <Alert variant="lgpd" className={cn('border-2 border-purple-600', className)} {...props}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>LGPD Compliance</AlertTitle>
      <AlertDescription>
        {props.children || 'Data protection notice'}
      </AlertDescription>
    </Alert>
  )
}

export { 
  Alert, 
  AlertDescription, 
  AlertTitle,
  EmergencyAlert,
  MedicalAlert,
  LgpdAlert,
  alertVariants 
}