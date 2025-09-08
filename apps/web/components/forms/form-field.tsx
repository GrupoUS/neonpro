'use client'

import { Checkbox, } from '@/components/ui/checkbox'
import { Input, } from '@/components/ui/input'
import { Label, } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea, } from '@/components/ui/textarea'
import { cn, } from '@/lib/utils'
import { AlertTriangle, CheckCircle, Info, } from 'lucide-react'
import type React from 'react'

export interface FormFieldProps {
  id: string
  name: string
  label: string
  type?:
    | 'text'
    | 'email'
    | 'tel'
    | 'date'
    | 'number'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'password'
  value?: unknown
  onChange?: (value: unknown,) => void
  onBlur?: () => void
  error?: string
  loading?: boolean
  disabled?: boolean
  required?: boolean
  placeholder?: string
  description?: string
  options?: { value: string; label: string; disabled?: boolean }[]
  className?: string
  inputClassName?: string
  rows?: number
  min?: number
  max?: number
  step?: number
  pattern?: string
  autoComplete?: string
  'data-testid'?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  loading = false,
  disabled = false,
  required = false,
  placeholder,
  description,
  options,
  className,
  inputClassName,
  rows = 4,
  min,
  max,
  step,
  pattern,
  autoComplete,
  'data-testid': testId,
},) => {
  const hasError = Boolean(error,)
  const isValid: boolean = !hasError && Boolean(value,) && !loading

  const baseInputProps = {
    id,
    name,
    value: (value as string) || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,) => {
      onChange?.(type === 'number' ? parseFloat(e.target.value,) : e.target.value,)
    },
    onBlur,
    disabled: disabled || loading,
    placeholder,
    className: cn(
      'transition-all duration-200',
      hasError && 'border-red-500 focus:border-red-500 focus:ring-red-200',
      isValid && 'border-green-500 focus:border-green-500 focus:ring-green-200',
      loading && 'opacity-50 cursor-wait',
      inputClassName,
    ),
    'aria-invalid': hasError,
    'aria-describedby': `${id}-description ${id}-error`,
    'data-testid': testId,
    autoComplete,
    pattern,
    min,
    max,
    step,
  }

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            {...baseInputProps}
            rows={rows}
            onChange={(e,) => onChange?.(e.target.value,)}
          />
        )

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={onChange}
            disabled={disabled || loading}
          >
            <SelectTrigger
              className={cn(
                'transition-all duration-200',
                hasError && 'border-red-500 focus:border-red-500 focus:ring-red-200',
                isValid && 'border-green-500 focus:border-green-500 focus:ring-green-200',
                loading && 'opacity-50 cursor-wait',
                inputClassName,
              )}
              aria-invalid={hasError}
              data-testid={testId}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option,) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'checkbox':
        return (
          <div className="flex items-start space-x-3">
            <Checkbox
              id={id}
              name={name}
              checked={Boolean(value,)}
              onCheckedChange={onChange}
              disabled={disabled || loading}
              className={cn(
                'mt-1',
                hasError && 'border-red-500',
                isValid && 'border-green-500',
              )}
              aria-invalid={hasError}
              aria-describedby={`${id}-description ${id}-error`}
              data-testid={testId}
            />
            <div className="flex-1">
              <Label
                htmlFor={id}
                className={cn(
                  'text-sm font-medium leading-5',
                  hasError && 'text-red-600',
                  disabled && 'text-gray-400',
                )}
              >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {description && (
                <p id={`${id}-description`} className="text-xs text-gray-500 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
        )

      default:
        return (
          <Input
            {...baseInputProps}
            type={type}
          />
        )
    }
  }

  if (type === 'checkbox') {
    return (
      <div className={cn('space-y-2', className,)}>
        {renderInput()}
        {error && (
          <div id={`${id}-error`} className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">{error}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className,)}>
      <Label
        htmlFor={id}
        className={cn(
          'text-sm font-medium',
          hasError && 'text-red-600',
          disabled && 'text-gray-400',
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {loading && (
          <span className="ml-2 text-xs text-gray-500">
            Carregando...
          </span>
        )}
        {isValid && <CheckCircle className="inline w-4 h-4 ml-2 text-green-500" />}
      </Label>

      {description && (
        <p id={`${id}-description`} className="text-xs text-gray-500">
          <Info className="inline w-3 h-3 mr-1" />
          {description}
        </p>
      )}

      {renderInput()}

      {error && (
        <div id={`${id}-error`} className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  )
}
