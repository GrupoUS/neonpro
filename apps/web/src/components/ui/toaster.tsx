import { cn, } from '@/lib/utils'

interface ToastProps {
  className?: string
  children: React.ReactNode
}

export function Toaster({ className, children, }: ToastProps,) {
  return (
    <div
      className={cn(
        'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface ToastItemProps {
  className?: string
  children: React.ReactNode
  variant?: 'default' | 'destructive'
}

export function ToastItem({ className, children, variant = 'default', }: ToastItemProps,) {
  return (
    <div
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
        variant === 'default' && 'bg-background text-foreground',
        variant === 'destructive'
          && 'destructive group border-destructive bg-destructive text-destructive-foreground',
        className,
      )}
    >
      {children}
    </div>
  )
}
