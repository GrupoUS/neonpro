"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface Patient {
  id: string
  user_id: string
  name: string
  email: string
  phone: string
  cpf_hash: string
  birth_date: string
  gender: 'M' | 'F' | 'NB'
  avatar_url?: string
  consent_status: 'granted' | 'pending' | 'revoked'
  consent_date?: string
  emergency_contact: string
  emergency_contact_name: string
  created_at: string
  updated_at: string
}

interface PatientAuthContextType {
  user: User | null
  patient: Patient | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updatePatient: (data: Partial<Patient>) => Promise<void>
  refreshPatient: () => Promise<void>
}

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined)

export function PatientAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchPatientData(session.user.id)
      }
      
      setIsLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchPatientData(session.user.id)
        } else {
          setPatient(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchPatientData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching patient data:', error)
        return
      }

      setPatient(data)
    } catch (error) {
      console.error('Error fetching patient data:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw error
      }

      toast.success('Login realizado com sucesso!')
    } catch (error: any) {
      console.error('Sign in error:', error)
      
      // Handle specific error messages in Portuguese
      let errorMessage = 'Erro no login. Verifique suas credenciais.'
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos.'
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Confirme seu email antes de fazer login.'
      }
      
      toast.error(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      setUser(null)
      setPatient(null)
      toast.success('Logout realizado com sucesso!')
    } catch (error: any) {
      console.error('Sign out error:', error)
      toast.error('Erro ao fazer logout.')
      throw error
    }
  }

  const updatePatient = async (data: Partial<Patient>) => {
    if (!patient) return

    try {
      const { error } = await supabase
        .from('patients')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', patient.id)

      if (error) {
        throw error
      }

      // Update local state
      setPatient(prev => prev ? { ...prev, ...data } : null)
      
      toast.success('Dados atualizados com sucesso!')
    } catch (error: any) {
      console.error('Update patient error:', error)
      toast.error('Erro ao atualizar dados.')
      throw error
    }
  }

  const refreshPatient = async () => {
    if (user) {
      await fetchPatientData(user.id)
    }
  }

  const value: PatientAuthContextType = {
    user,
    patient,
    isLoading,
    signIn,
    signOut,
    updatePatient,
    refreshPatient
  }

  return (
    <PatientAuthContext.Provider value={value}>
      {children}
    </PatientAuthContext.Provider>
  )
}

export const usePatientAuth = () => {
  const context = useContext(PatientAuthContext)
  if (context === undefined) {
    throw new Error('usePatientAuth must be used within a PatientAuthProvider')
  }
  return context
}