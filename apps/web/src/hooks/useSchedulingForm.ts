import { useState, useCallback } from 'react'
import { useSchedulingData } from './useSchedulingData'

export interface FormField {
  name: string
  value: any
  error?: string
  touched: boolean
}

export interface UseSchedulingFormReturn {
  fields: Record<string, FormField>
  updateField: (name: string, value: any) => void
  touchField: (name: string) => void
  setFieldError: (name: string, error: string) => void
  resetForm: () => void
  isFormValid: boolean
  submitForm: () => void
}

export function useSchedulingForm(): UseSchedulingFormReturn {
  const { updateSchedulingData, resetSchedulingData } = useSchedulingData()
  const [fields, setFields] = useState<Record<string, FormField>>({})

  const updateField = useCallback((name: string, value: any) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error: undefined
      }
    }))
    
    // Update scheduling data
    updateSchedulingData({ [name]: value })
  }, [updateSchedulingData])

  const touchField = useCallback((name: string) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched: true
      }
    }))
  }, [])

  const setFieldError = useCallback((name: string, error: string) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        error
      }
    }))
  }, [])

  const resetForm = useCallback(() => {
    setFields({})
    resetSchedulingData()
  }, [resetSchedulingData])

  const isFormValid = Object.values(fields).every(field => 
    !field.error && (!field.touched || field.value !== undefined)
  )

  const submitForm = useCallback(() => {
    // Mark all fields as touched
    setFields(prev => 
      Object.keys(prev).reduce((acc, key) => ({
        ...acc,
        [key]: {
          ...prev[key],
          touched: true
        }
      }), {})
    )
  }, [])

  return {
    fields,
    updateField,
    touchField,
    setFieldError,
    resetForm,
    isFormValid,
    submitForm
  }
}