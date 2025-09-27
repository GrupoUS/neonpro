import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import * as React from 'react'
import { cn } from '../../utils'
import { Label } from './label'

interface RadioGroupItemProps
  extends React.ComponentProps<typeof RadioGroupPrimitive.Item> {
  label?: string
}

/**
 * Renders a styled radio group item with an optional accessible label.
 *
 * @param id - The id applied to the radio input and used to associate the label.
 * @param label - Optional text label displayed next to the radio item.
 * @param className - Additional CSS classes applied to the radio item container.
 * @returns A React element representing the radio group item.
 */
function RadioGroupItem({ id, label, className, ...props }: RadioGroupItemProps) {
  return (
    <div className="flex items-center space-x-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </Label>
      )}
      <RadioGroupPrimitive.Item
        id={id}
        data-slot='radio-group-item'
        className={cn(
          'border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className='flex items-center justify-center text-current'>
          <svg
            width='6'
            height='6'
            viewBox='0 0 6 6'
            fill='currentcolor'
            xmlns='http://www.w3.org/2000/svg'
          >
            <circle cx='3' cy='3' r='3' />
          </svg>
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    </div>
  )
}

/**
 * Renders a RadioGroup root with base grid spacing and optional custom classes.
 *
 * @param className - Additional CSS classes to append to the root container
 * @returns The RadioGroup root element configured with the provided props
 */
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot='radio-group'
      className={cn('grid gap-3', className)}
      {...props}
    />
  )
}

RadioGroupItem.displayName = 'RadioGroupItem'

export { RadioGroup, RadioGroupItem }
