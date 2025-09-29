import React from 'react'
import { Button } from './button'
import { Phone, Heart } from 'lucide-react'

interface MobileHealthcareButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
  icon?: React.ReactNode
  children: React.ReactNode
}

export const MobileHealthcareButton: React.FC<MobileHealthcareButtonProps> = ({
  variant = 'primary',
  size = 'default',
  icon,
  children,
  className,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      className={`flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow duration-200 ${className || ''}`}
      {...props}
    >
      {icon || <Heart className="h-4 w-4" />}
      <span className="text-sm font-medium">{children}</span>
    </Button>
  )
}
