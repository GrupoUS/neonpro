'use client'

import { debounce } from '@/lib/utils'
import {
    calculatePasswordStrength,
    checkPasswordBreach,
    getPasswordStrengthColor,
    getPasswordStrengthLabel,
    passwordSchema
} from '@/lib/validation/password'
import { useCallback, useEffect, useState } from 'react'

interface PasswordValidationState {
  isValid: boolean
  errors: string[]
  strength: number
  strengthLabel: string
  strengthColor: string
  isBreached: boolean
  breachCount?: number
  isChecking: boolean
}

export function usePasswordValidation(password: string) {
  const [state, setState] = useState<PasswordValidationState>({
    isValid: false,
    errors: [],
    strength: 0,
    strengthLabel: 'Very Weak',
    strengthColor: 'bg-red-500',
    isBreached: false,
    isChecking: false,
  })

  // Validate password format and strength
  const validatePassword = useCallback((pwd: string) => {
    if (!pwd) {
      setState(prev => ({
        ...prev,
        isValid: false,
        errors: [],
        strength: 0,
        strengthLabel: 'Very Weak',
        strengthColor: 'bg-red-500',
      }))
      return
    }

    // Check against schema
    const result = passwordSchema.safeParse(pwd)
    const strength = calculatePasswordStrength(pwd)

    setState(prev => ({
      ...prev,
      isValid: result.success,
      errors: result.success ? [] : result.error.errors.map(e => e.message),
      strength,
      strengthLabel: getPasswordStrengthLabel(strength),
      strengthColor: getPasswordStrengthColor(strength),
    }))
  }, [])

  // Check password breach (debounced)
  const checkBreach = useCallback(
    debounce(async (pwd: string) => {
      if (!pwd || pwd.length < 8) return

      setState(prev => ({ ...prev, isChecking: true }))

      try {
        const breachResult = await checkPasswordBreach(pwd)
        setState(prev => ({
          ...prev,
          isBreached: breachResult.breached,
          breachCount: breachResult.occurrences,
          isChecking: false,
        }))
      } catch (error) {
        console.error('Breach check failed:', error)
        setState(prev => ({ ...prev, isChecking: false }))
      }
    }, 500),
    []
  )

  // Run validation when password changes
  useEffect(() => {
    validatePassword(password)
    checkBreach(password)
  }, [password, validatePassword, checkBreach])

  return state
}
