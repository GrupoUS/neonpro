import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  text,
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]} text-blue-600`} />
      {text && <span className='ml-2 text-gray-600'>{text}</span>}
    </div>
  )
}

interface LoadingPageProps {
  text?: string
}

export function LoadingPage({ text = 'Carregando...' }: LoadingPageProps) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <LoadingSpinner size='lg' text={text} />
      </div>
    </div>
  )
}

interface LoadingCardProps {
  text?: string
  className?: string
}

export function LoadingCard({
  text = 'Carregando...',
  className = '',
}: LoadingCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <LoadingSpinner text={text} />
    </div>
  )
}
