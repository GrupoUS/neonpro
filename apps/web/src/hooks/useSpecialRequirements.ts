import { useState, useCallback } from 'react'

export interface SpecialRequirement {
  id: string
  type: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

export interface UseSpecialRequirementsReturn {
  requirements: SpecialRequirement[]
  addRequirement: (requirement: Omit<SpecialRequirement, 'id'>) => void
  removeRequirement: (id: string) => void
  updateRequirement: (id: string, updates: Partial<SpecialRequirement>) => void
}

export function useSpecialRequirements(): UseSpecialRequirementsReturn {
  const [requirements, setRequirements] = useState<SpecialRequirement[]>([])

  const addRequirement = useCallback((requirement: Omit<SpecialRequirement, 'id'>) => {
    const newRequirement: SpecialRequirement = {
      ...requirement,
      id: Date.now().toString()
    }
    setRequirements(prev => [...prev, newRequirement])
  }, [])

  const removeRequirement = useCallback((id: string) => {
    setRequirements(prev => prev.filter(req => req.id !== id))
  }, [])

  const updateRequirement = useCallback((id: string, updates: Partial<SpecialRequirement>) => {
    setRequirements(prev => 
      prev.map(req => 
        req.id === id ? { ...req, ...updates } : req
      )
    )
  }, [])

  return {
    requirements,
    addRequirement,
    removeRequirement,
    updateRequirement
  }
}