'use client'

import React, { memo, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Optimized Card component with memo
interface OptimizedCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
  loading?: boolean
}

export const OptimizedCard = memo<OptimizedCardProps>(({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue, 
  className,
  loading 
}) => {
  const trendColor = useMemo(() => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }, [trend])

  const formattedValue = useMemo(() => {
    if (loading) return '...'
    if (typeof value === 'number') {
      return value.toLocaleString('pt-BR')
    }
    return value
  }, [value, loading])

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && trendValue && (
          <div className={cn("text-xs mt-1", trendColor)}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

OptimizedCard.displayName = 'OptimizedCard'

// Optimized data table row with memo
interface OptimizedTableRowProps {
  id: string
  data: Record<string, any>
  columns: Array<{
    key: string
    label: string
    render?: (value: any, row: Record<string, any>) => React.ReactNode
  }>
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  selected?: boolean
  onSelect?: (id: string) => void
}

export const OptimizedTableRow = memo<OptimizedTableRowProps>(({ 
  id, 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  selected, 
  onSelect 
}) => {
  const handleEdit = useCallback(() => {
    onEdit?.(id)
  }, [id, onEdit])

  const handleDelete = useCallback(() => {
    onDelete?.(id)
  }, [id, onDelete])

  const handleSelect = useCallback(() => {
    onSelect?.(id)
  }, [id, onSelect])

  const renderedCells = useMemo(() => {
    return columns.map((column) => (
      <td key={`${id}-${column.key}`} className="px-4 py-2">
        {column.render ? column.render(data[column.key], data) : data[column.key]}
      </td>
    ))
  }, [columns, data, id])

  return (
    <tr 
      className={cn(
        "hover:bg-muted/50 transition-colors",
        selected && "bg-muted"
      )}
    >
      {onSelect && (
        <td className="px-4 py-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={handleSelect}
            className="rounded border-gray-300"
          />
        </td>
      )}
      {renderedCells}
      {(onEdit || onDelete) && (
        <td className="px-4 py-2">
          <div className="flex space-x-2">
            {onEdit && (
              <Button size="sm" variant="outline" onClick={handleEdit}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
          </div>
        </td>
      )}
    </tr>
  )
})

OptimizedTableRow.displayName = 'OptimizedTableRow'

// Optimized Badge component for status indicators
interface OptimizedBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  children: React.ReactNode
  className?: string
}

export const OptimizedBadge = memo<OptimizedBadgeProps>(({ status, children, className }) => {
  const badgeVariant = useMemo(() => {
    switch (status) {
      case 'success': return 'default'
      case 'warning': return 'secondary'
      case 'error': return 'destructive'
      case 'info': return 'outline'
      default: return 'secondary'
    }
  }, [status])

  const badgeColor = useMemo(() => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'error': return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'info': return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      default: return ''
    }
  }, [status])

  return (
    <Badge 
      variant={badgeVariant} 
      className={cn(badgeColor, className)}
    >
      {children}
    </Badge>
  )
})

OptimizedBadge.displayName = 'OptimizedBadge'

// Optimized list item for large lists
interface OptimizedListItemProps {
  id: string
  title: string
  subtitle?: string
  avatar?: string
  status?: 'active' | 'inactive' | 'pending'
  actions?: Array<{
    label: string
    onClick: (id: string) => void
    variant?: 'default' | 'destructive' | 'outline'
  }>
  onClick?: (id: string) => void
  className?: string
}

export const OptimizedListItem = memo<OptimizedListItemProps>(({ 
  id, 
  title, 
  subtitle, 
  avatar, 
  status, 
  actions, 
  onClick, 
  className 
}) => {
  const handleClick = useCallback(() => {
    onClick?.(id)
  }, [id, onClick])

  const actionButtons = useMemo(() => {
    if (!actions) return null
    
    return actions.map((action, index) => (
      <Button
        key={index}
        size="sm"
        variant={action.variant || 'outline'}
        onClick={(e) => {
          e.stopPropagation()
          action.onClick(id)
        }}
      >
        {action.label}
      </Button>
    ))
  }, [actions, id])

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        {avatar && (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <img src={avatar} alt={title} className="w-full h-full rounded-full object-cover" />
          </div>
        )}
        <div>
          <div className="font-medium">{title}</div>
          {subtitle && (
            <div className="text-sm text-muted-foreground">{subtitle}</div>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {status && (
          <OptimizedBadge status={status === 'active' ? 'success' : status === 'inactive' ? 'error' : 'warning'}>
            {status}
          </OptimizedBadge>
        )}
        {actionButtons && (
          <div className="flex space-x-2">{actionButtons}</div>
        )}
      </div>
    </div>
  )
})

OptimizedListItem.displayName = 'OptimizedListItem'

// Optimized form field component
interface OptimizedFormFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: 'text' | 'email' | 'password' | 'number'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export const OptimizedFormField = memo<OptimizedFormFieldProps>(({ 
  label, 
  value, 
  onChange, 
  error, 
  type = 'text', 
  placeholder, 
  required, 
  disabled, 
  className 
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }, [onChange])

  const inputId = useMemo(() => `field-${label.toLowerCase().replace(/\s+/g, '-')}`, [label])

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={inputId} className="text-sm font-medium leading-none">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500"
        )}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
})

OptimizedFormField.displayName = 'OptimizedFormField'

// Higher-order component for optimizing any component with memo
export function withMemoization<P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
) {
  const MemoizedComponent = memo(Component, areEqual)
  MemoizedComponent.displayName = `Memoized(${Component.displayName || Component.name})`
  return MemoizedComponent
}

// Custom areEqual functions for common patterns
export const shallowEqual = <P extends object>(prevProps: P, nextProps: P): boolean => {
  const keys1 = Object.keys(prevProps) as Array<keyof P>
  const keys2 = Object.keys(nextProps) as Array<keyof P>
  
  if (keys1.length !== keys2.length) {
    return false
  }
  
  for (let key of keys1) {
    if (prevProps[key] !== nextProps[key]) {
      return false
    }
  }
  
  return true
}

export const deepEqual = <P extends object>(prevProps: P, nextProps: P): boolean => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps)
}

// Performance monitoring HOC
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return memo((props: P) => {
    const startTime = performance.now()
    
    React.useEffect(() => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      if (renderTime > 16) { // More than one frame at 60fps
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`)
      }
    })
    
    return <Component {...props} />
  })
}