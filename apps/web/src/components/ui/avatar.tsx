import * as React from 'react'

// Minimal shadcn-compatible Avatar stub to unblock type-check
// Replace with registry component if needed
export function Avatar({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={['relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export function AvatarImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img alt={props.alt ?? ''} {...props} className={['h-full w-full object-cover'].concat(props.className ? [props.className] : []).join(' ')} />
}

export function AvatarFallback({ children }: React.PropsWithChildren) {
  return (
    <span className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
      {children}
    </span>
  )
}

export default Avatar
