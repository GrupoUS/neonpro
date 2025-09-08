import type * as React from 'react'

// Minimal, dependency-free form primitives for tests
// These are simple passthrough components that mirror the shadcn/ui API surface
// used by our tests. They don't implement RHF context – just structure.

type DivProps = React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }

export function Form(props: React.FormHTMLAttributes<HTMLFormElement>,) {
  return <form {...props} />
}

export function FormField({ children, ...props }: DivProps & { name?: string },) {
  return (
    <div data-slot="form-field" {...props}>
      {children}
    </div>
  )
}

export function FormItem({ children, ...props }: DivProps,) {
  return (
    <div data-slot="form-item" {...props}>
      {children}
    </div>
  )
}

export function FormLabel({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>,) {
  return (
    <label data-slot="form-label" {...props}>
      {children}
    </label>
  )
}

export function FormControl({ children, ...props }: DivProps,) {
  return (
    <div data-slot="form-control" {...props}>
      {children}
    </div>
  )
}

export function FormDescription(
  { children, ...props }: React.HTMLAttributes<HTMLParagraphElement> & {
    children?: React.ReactNode
  },
) {
  return (
    <p data-slot="form-description" {...props}>
      {children}
    </p>
  )
}

export function FormMessage({ children, ...props }: DivProps,) {
  return (
    <div role={props.role ?? 'status'} data-slot="form-message" {...props}>
      {children}
    </div>
  )
}
