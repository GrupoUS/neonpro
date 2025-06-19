'use client'

import { usePasswordValidation } from '@/hooks/use-password-validation'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

interface PasswordStrengthMeterProps {
  password: string
  showRequirements?: boolean
}

export function PasswordStrengthMeter({
  password,
  showRequirements = true
}: PasswordStrengthMeterProps) {
  const {
    isValid,
    errors,
    strength,
    strengthLabel,
    strengthColor,
    isBreached,
    breachCount,
    isChecking,
  } = usePasswordValidation(password)

  return (
    <div className="space-y-3">
      {/* Strength Meter */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-muted-foreground">Password Strength</span>
          <span className={cn(
            "text-sm font-medium",
            strength === 0 && "text-red-500",
            strength === 1 && "text-orange-500",
            strength === 2 && "text-yellow-500",
            strength === 3 && "text-blue-500",
            strength === 4 && "text-green-500",
            strength === 5 && "text-emerald-500",
            strength === 6 && "text-emerald-600"
          )}>
            {strengthLabel}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              strengthColor
            )}
            style={{ width: `${(strength / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Breach Warning */}
      {isBreached && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Password has been compromised!</p>
            <p className="text-muted-foreground mt-1">
              This password has appeared {breachCount?.toLocaleString() || 'many'} times in data breaches.
              Please choose a different password.
            </p>
          </div>
        </div>
      )}

      {/* Requirements List */}
      {showRequirements && password && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Requirements:</p>
          <ul className="space-y-1">
            <RequirementItem
              met={password.length >= 12}
              text="At least 12 characters"
            />
            <RequirementItem
              met={/[A-Z]/.test(password)}
              text="One uppercase letter"
            />
            <RequirementItem
              met={/[a-z]/.test(password)}
              text="One lowercase letter"
            />
            <RequirementItem
              met={/[0-9]/.test(password)}
              text="One number"
            />
            <RequirementItem
              met={/[^A-Za-z0-9]/.test(password)}
              text="One special character"
            />
            <RequirementItem
              met={!isBreached}
              text="Not found in data breaches"
              loading={isChecking}
            />
          </ul>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-destructive flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

interface RequirementItemProps {
  met: boolean
  text: string
  loading?: boolean
}

function RequirementItem({ met, text, loading }: RequirementItemProps) {
  return (
    <li className="flex items-center gap-2 text-sm">
      {loading ? (
        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground animate-spin" />
      ) : met ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={cn(
        met ? "text-foreground" : "text-muted-foreground"
      )}>
        {text}
      </span>
    </li>
  )
}
