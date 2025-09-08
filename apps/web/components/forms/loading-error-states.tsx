'use client'

import { Button, } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
import { Skeleton, } from '@/components/ui/skeleton'
import { cn, } from '@/lib/utils'
import { AlertTriangle, CheckCircle, Loader2, RefreshCw, WifiOff, XCircle, } from 'lucide-react'
import React from 'react'

// Loading States
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
},) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <Loader2
      className={cn(
        'animate-spin text-blue-600',
        sizeClasses[size],
        className,
      )}
    />
  )
}

export interface LoadingSkeletonProps {
  lines?: number
  className?: string
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  lines = 3,
  className,
},) => {
  return (
    <div className={cn('space-y-3', className,)}>
      {Array.from({ length: lines, }, (_, i,) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4 w-full',
            i === lines - 1 && 'w-3/4', // Last line shorter
          )}
        />
      ),)}
    </div>
  )
}

export interface LoadingCardProps {
  title?: string
  description?: string
  className?: string
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title = 'Carregando...',
  description = 'Aguarde enquanto processamos sua solicitação',
  className,
},) => {
  return (
    <Card className={cn('w-full', className,)}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <LoadingSpinner size="lg" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

// Error States
export interface ErrorBoundaryProps {
  error?: Error | string
  onRetry?: () => void
  showRetry?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  error,
  onRetry,
  showRetry = true,
  className,
  size = 'md',
},) => {
  const errorMessage = error instanceof Error ? error.message : error

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div
      className={cn(
        'border border-red-200 bg-red-50 rounded-lg',
        sizeClasses[size],
        className,
      )}
    >
      <div className="flex items-start space-x-3">
        <XCircle className={cn('text-red-600 mt-0.5', iconSize[size],)} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-800">
            Erro encontrado
          </h3>
          <p className="mt-1 text-sm text-red-700">
            {errorMessage || 'Ocorreu um erro inesperado'}
          </p>
          {showRetry && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Network States
export interface NetworkStatusProps {
  isOnline?: boolean
  className?: string
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  isOnline = true,
  className,
},) => {
  if (isOnline) return null

  return (
    <div
      className={cn(
        'flex items-center space-x-2 p-2 bg-orange-50 border border-orange-200 rounded-lg text-orange-800',
        className,
      )}
    >
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">
        Sem conexão com a internet
      </span>
    </div>
  )
}

// Success States
export interface SuccessMessageProps {
  message: string
  onDismiss?: () => void
  autoHide?: boolean
  duration?: number
  className?: string
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  onDismiss,
  autoHide = false,
  duration = 3000,
  className,
},) => {
  React.useEffect(() => {
    if (autoHide && onDismiss) {
      const timer = setTimeout(onDismiss, duration,)
      return () => clearTimeout(timer,)
    }
  }, [autoHide, onDismiss, duration,],)

  return (
    <div
      className={cn(
        'flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg',
        className,
      )}
    >
      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-green-800">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-green-600 hover:text-green-800 transition-colors"
          aria-label="Fechar mensagem"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// Empty States
export interface EmptyStateProps {
  icon?: React.ComponentType<unknown>
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = AlertTriangle,
  title,
  description,
  action,
  className,
},) => {
  return (
    <div className={cn('text-center p-8', className,)}>
      <div className="flex justify-center mb-4">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Combined State Manager
export interface StateManagerProps {
  loading?: boolean
  error?: Error | string | null
  isEmpty?: boolean
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  onRetry?: () => void
  emptyProps?: Omit<EmptyStateProps, 'title'> & { title?: string }
  className?: string
}

export const StateManager: React.FC<StateManagerProps> = ({
  loading = false,
  error = null,
  isEmpty = false,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  onRetry,
  emptyProps,
  className,
},) => {
  // Loading state
  if (loading) {
    return (
      <div className={className}>
        {loadingComponent || <LoadingCard />}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={className}>
        {errorComponent || (
          <ErrorBoundary
            error={error}
            onRetry={onRetry}
            showRetry={Boolean(onRetry,)}
          />
        )}
      </div>
    )
  }

  // Empty state
  if (isEmpty) {
    return (
      <div className={className}>
        {emptyComponent || (
          <EmptyState
            title="Nenhum resultado encontrado"
            description="Não há dados para exibir no momento."
            {...emptyProps}
          />
        )}
      </div>
    )
  }

  // Success state - render children
  return <div className={className}>{children}</div>
}
