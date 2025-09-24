import { cn } from '@/lib/utils'
import * as React from 'react'

export interface PWATouchActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  haptic?: 'light' | 'medium' | 'heavy'
}

export const PWATouchAction: React.FC<PWATouchActionProps> = ({
  children,
  className,
  variant = 'default',
  size = 'default',
  haptic = 'light',
  onClick,
  ...props
}) => {
  const handleTouchStart = React.useCallback(() => {
    if ('vibrate' in navigator && haptic) {
      const intensity = haptic === 'light' ? 10 : haptic === 'medium' ? 20 : 30
      navigator.vibrate(intensity)
    }
  }, [haptic])

  const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    handleTouchStart()
    onClick?.(e)
  }, [onClick, handleTouchStart])

  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-95 transition-transform',
    {
      'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
      'bg-destructive text-destructive-foreground hover:bg-destructive/90':
        variant === 'destructive',
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground':
        variant === 'outline',
      'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
      'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
      'text-primary underline-offset-4 hover:underline': variant === 'link',
    },
    {
      'h-10 px-4 py-2': size === 'default',
      'h-9 rounded-md px-3': size === 'sm',
      'h-11 rounded-md px-8': size === 'lg',
      'h-10 w-10': size === 'icon',
    },
    className,
  )

  return (
    <button
      className={baseClasses}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      {...props}
    >
      {children}
    </button>
  )
}

// Swipeable component for mobile gestures
export interface PWASwipeableProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  className?: string
}

export const PWASwipeable: React.FC<PWASwipeableProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className,
}) => {
  const [startX, setStartX] = React.useState(0)
  const [startY, setStartY] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      setStartX(e.touches[0].clientX)
      setStartY(e.touches[0].clientY)
      setIsDragging(true)
    }
  }, [])

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!isDragging || !e.touches || !e.touches[0]) return

    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = startX - currentX
    const diffY = startY - currentY

    // Determine the direction of the swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          onSwipeLeft?.()
        } else {
          onSwipeRight?.()
        }
        setIsDragging(false)
      }
    } else {
      // Vertical swipe
      if (Math.abs(diffY) > threshold) {
        if (diffY > 0) {
          onSwipeUp?.()
        } else {
          onSwipeDown?.()
        }
        setIsDragging(false)
      }
    }
  }, [isDragging, startX, startY, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  const handleTouchEnd = React.useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div
      className={cn('touch-none', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  )
}

// Bottom sheet component for mobile UI
export interface PWABottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  className?: string
}

export const PWABottomSheet: React.FC<PWABottomSheetProps> = ({
  open,
  onClose,
  children,
  title,
  className,
}) => {
  const sheetRef = React.useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [startY, setStartY] = React.useState(0)
  const [currentY, setCurrentY] = React.useState(0)

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
    if (e.touches && e.touches[0]) {
      setStartY(e.touches[0].clientY)
    }
  }, [])

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!isDragging || !e.touches || !e.touches[0]) return

    const y = e.touches[0].clientY
    setCurrentY(y)

    // Close if dragged down enough
    if (y - startY > 100) {
      onClose()
    }
  }, [isDragging, startY, onClose])

  const handleTouchEnd = React.useCallback(() => {
    setIsDragging(false)
    setCurrentY(0)
  }, [])

  if (!open) return null

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50'
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'relative bg-white rounded-t-2xl shadow-lg max-h-[80vh] overflow-hidden',
          'transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full',
          className,
        )}
        style={{
          transform: `translateY(${currentY - startY}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className='flex justify-center pt-3 pb-2'>
          <div className='w-12 h-1 bg-gray-300 rounded-full' />
        </div>

        {/* Header */}
        {title && (
          <div className='px-6 py-4 border-b'>
            <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
          </div>
        )}

        {/* Content */}
        <div className='overflow-y-auto'>
          {children}
        </div>
      </div>
    </div>
  )
}

// Pull-to-refresh component
export interface PWAPullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  className?: string
}

export const PWAPullToRefresh: React.FC<PWAPullToRefreshProps> = ({
  onRefresh,
  children,
  className,
}) => {
  const [isPulling, setIsPulling] = React.useState(false)
  const [pullDistance, setPullDistance] = React.useState(0)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [startY, setStartY] = React.useState(0)

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0 && e.touches && e.touches[0]) {
      setStartY(e.touches[0].clientY)
      setIsPulling(true)
    }
  }, [])

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing || !e.touches || !e.touches[0]) return

    const currentY = e.touches[0].clientY
    const distance = Math.max(0, currentY - startY)
    setPullDistance(Math.min(distance, 100)) // Max 100px pull
  }, [isPulling, isRefreshing, startY])

  const handleTouchEnd = React.useCallback(async () => {
    if (!isPulling || isRefreshing) return

    if (pullDistance > 50) {
      setIsRefreshing(true)
      setPullDistance(0)
      setIsPulling(false)

      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    } else {
      setPullDistance(0)
      setIsPulling(false)
    }
  }, [isPulling, isRefreshing, pullDistance, onRefresh])

  return (
    <div
      className={cn('relative min-h-screen', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className='absolute top-0 left-0 right-0 flex justify-center items-center transition-transform duration-200'
        style={{
          transform: `translateY(${pullDistance - 60}px)`,
          opacity: isPulling ? 1 : 0,
        }}
      >
        <div className='flex items-center space-x-2 text-gray-600'>
          {isRefreshing
            ? (
              <>
                <div className='animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent' />
                <span className='text-sm'>Atualizando...</span>
              </>
            )
            : (
              <>
                <div className='h-5 w-5' />
                <span className='text-sm'>
                  {pullDistance > 50 ? 'Solte para atualizar' : 'Puxe para atualizar'}
                </span>
              </>
            )}
        </div>
      </div>

      {/* Content with offset when pulling */}
      <div
        style={{
          transform: isPulling ? `translateY(${pullDistance}px)` : 'none',
          transition: isPulling ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  )
}

// Safe area inset helpers for mobile devices
export const useSafeAreaInsets = () => {
  const [insets, setInsets] = React.useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  React.useEffect(() => {
    const updateInsets = () => {
      const style = getComputedStyle(document.documentElement)
      setInsets({
        top: parseInt(style.getPropertyValue('--sat') || '0'),
        right: parseInt(style.getPropertyValue('--sar') || '0'),
        bottom: parseInt(style.getPropertyValue('--sab') || '0'),
        left: parseInt(style.getPropertyValue('--sal') || '0'),
      })
    }

    updateInsets()
    window.addEventListener('resize', updateInsets)
    return () => window.removeEventListener('resize', updateInsets)
  }, [])

  return insets
}

export const SafeAreaView: React.FC<{
  children: React.ReactNode
  edges?: ('top' | 'bottom' | 'left' | 'right')[]
  className?: string
}> = ({ children, edges = ['top', 'bottom'], className }) => {
  const insets = useSafeAreaInsets()

  const style = React.useMemo(() => {
    const padding: Record<string, number> = {}
    if (edges.includes('top')) padding.paddingTop = insets.top
    if (edges.includes('bottom')) padding.paddingBottom = insets.bottom
    if (edges.includes('left')) padding.paddingLeft = insets.left
    if (edges.includes('right')) padding.paddingRight = insets.right
    return padding
  }, [insets, edges])

  return (
    <div className={className} style={style}>
      {children}
    </div>
  )
}
