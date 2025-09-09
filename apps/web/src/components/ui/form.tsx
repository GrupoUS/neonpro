import { cn, } from '@/lib/utils'
import * as React from 'react'

// Minimal, test-friendly Form primitives modeled after shadcn/ui patterns
// These are intentionally lightweight wrappers that forward all DOM props
// and data-testid attributes to enable testing without full RHF wiring.

export type FormProps = React.ComponentProps<'form'>
export function Form({ className, ...props }: FormProps,) {
  return <form data-slot="form" className={cn(className,)} {...props} />
}

export type FormFieldProps = React.ComponentProps<'div'> & {
  name?: string
}
export function FormField({ className, name, ...props }: FormFieldProps,) {
  return (
    <div
      data-slot="form-field"
      data-field-name={name}
      className={cn(className,)}
      {...props}
    />
  )
}

export type FormItemProps = React.ComponentProps<'div'>
export function FormItem({ className, ...props }: FormItemProps,) {
  return <div data-slot="form-item" className={cn(className,)} {...props} />
}

export type FormLabelProps = React.ComponentProps<'label'>
export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, ...props }, ref,) => (
    <label
      ref={ref}
      data-slot="form-label"
      className={cn('text-sm font-medium leading-none', className,)}
      {...props}
    />
  ),
)
FormLabel.displayName = 'FormLabel'

export type FormControlProps = React.ComponentProps<'div'>
export const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, ...props }, ref,) => (
    <div ref={ref} data-slot="form-control" className={cn(className,)} {...props} />
  ),
)
FormControl.displayName = 'FormControl'

export type FormDescriptionProps = React.ComponentProps<'p'>
export const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, ...props }, ref,) => (
    <p
      ref={ref}
      data-slot="form-description"
      className={cn('text-muted-foreground text-sm', className,)}
      {...props}
    />
  ),
)
FormDescription.displayName = 'FormDescription'

export type FormMessageProps = React.ComponentProps<'div'>
export const FormMessage = React.forwardRef<HTMLDivElement, FormMessageProps>(
  ({ className, ...props }, ref,) => (
    <div
      ref={ref}
      data-slot="form-message"
      className={cn('text-destructive text-sm', className,)}
      {...props}
    />
  ),
)
FormMessage.displayName = 'FormMessage'

export default Form
