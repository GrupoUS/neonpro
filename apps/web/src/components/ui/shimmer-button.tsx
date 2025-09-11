import * as React from 'react'
import { Button, type ButtonProps } from './button'
import { cn } from '@/lib/utils'

export interface ShimmerButtonProps extends Omit<ButtonProps, 'variant'> {
  /**
   * Tamanho do botão shimmer
   */
  size?: ButtonProps['size']
  /**
   * Classes CSS adicionais
   */
  className?: string
}

/**
 * Componente ShimmerButton
 * 
 * Botão com efeito shimmer integrado ao design system NeonPro.
 * Utiliza as cores e tipografia do sistema para manter consistência visual.
 * 
 * @example
 * ```tsx
 * <ShimmerButton size="lg">
 *   Agendar Consulta
 * </ShimmerButton>
 * ```
 */
const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ className, size = 'default', children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="shimmer"
        size={size}
        className={cn('h-12 font-medium', className)}
        {...props}
      >
        {children}
      </Button>
    )
  }
)

ShimmerButton.displayName = 'ShimmerButton'

export { ShimmerButton }