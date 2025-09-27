import * as LabelPrimitive from '@radix-ui/react-label'
import * as React from 'react'

import { cn } from '../../utils'

const Label = LabelPrimitive.Root as any

function LabelComponent({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <Label
      data-slot='label'
      className={cn(
        'text-foreground text-sm leading-4 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { LabelComponent as Label }
