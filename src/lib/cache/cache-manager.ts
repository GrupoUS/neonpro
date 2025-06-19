/**
 * NEONPRO Cache Manager
 * Multi-layer caching strategy following Midday.ai patterns
 */

import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Cache tags for revalidation
export const CACHE_TAGS = {
  APPOINTMENTS: 'appointments',
  PATIENTS: 'patients',
  TREATMENTS: 'treatments',
  PAYMENTS: 'payments',
  CLINIC: 'clinic',
  PROFILE: 'profile',
} as const

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const

/**
 * Generic cache wrapper for Supabase queries
 */
export function createCachedQuery<T>(
  queryFn: () => Promise<T>,
  cacheKey: string[],
  tags: string[],
  revalidate: number = CACHE_DURATIONS.MEDIUM
) {
  return unstable_cache(queryFn, cacheKey, {
    tags,
    revalidate,
  })
}

/**
 * Cached clinic data fetcher
 */
export const getCachedClinicData = (clinicId: string) =>
  createCachedQuery(
    async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', clinicId)
        .single()

      if (error) throw error
      return data
    },
    ['clinic', clinicId],
    [CACHE_TAGS.CLINIC],
    CACHE_DURATIONS.LONG
  )

/**
 * Cached appointments fetcher
 */
export const getCachedAppointments = (clinicId: string, date?: string) =>
  createCachedQuery(
    async () => {
      const supabase = createClient()
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(full_name, email),
          doctor:neonpro_profiles!appointments_doctor_id_fkey(full_name)
        `)
        .eq('clinic_id', clinicId)
        .order('appointment_date', { ascending: true })

      if (date) {
        const startOfDay = new Date(date)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(date)
        endOfDay.setHours(23, 59, 59, 999)
        
        query = query
          .gte('appointment_date', startOfDay.toISOString())
          .lte('appointment_date', endOfDay.toISOString())
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    ['appointments', clinicId, date || 'all'],
    [CACHE_TAGS.APPOINTMENTS],
    CACHE_DURATIONS.SHORT
  )

/**
 * Cached patients fetcher
 */
export const getCachedPatients = (clinicId: string, search?: string) =>
  createCachedQuery(
    async () => {
      const supabase = createClient()
      let query = supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    ['patients', clinicId, search || 'all'],
    [CACHE_TAGS.PATIENTS],
    CACHE_DURATIONS.MEDIUM
  )

/**
 * Cached treatments fetcher
 */
export const getCachedTreatments = (clinicId: string, status?: string) =>
  createCachedQuery(
    async () => {
      const supabase = createClient()
      let query = supabase
        .from('treatments')
        .select(`
          *,
          patient:patients(full_name),
          doctor:neonpro_profiles!treatments_doctor_id_fkey(full_name)
        `)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    ['treatments', clinicId, status || 'all'],
    [CACHE_TAGS.TREATMENTS],
    CACHE_DURATIONS.MEDIUM
  )

/**
 * Cached payments fetcher
 */
export const getCachedPayments = (clinicId: string, status?: string) =>
  createCachedQuery(
    async () => {
      const supabase = createClient()
      let query = supabase
        .from('payments')
        .select(`
          *,
          patient:patients(full_name),
          treatment:treatments(treatment_name)
        `)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    ['payments', clinicId, status || 'all'],
    [CACHE_TAGS.PAYMENTS],
    CACHE_DURATIONS.MEDIUM
  )

/**
 * Cached dashboard metrics
 */
export const getCachedDashboardMetrics = (clinicId: string) =>
  createCachedQuery(
    async () => {
      const supabase = createClient()
      
      // Get today's date range
      const today = new Date()
      const startOfDay = new Date(today)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(today)
      endOfDay.setHours(23, 59, 59, 999)

      // Get this month's date range
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

      const [
        todayAppointments,
        totalPatients,
        activeTreatments,
        monthlyRevenue
      ] = await Promise.all([
        supabase
          .from('appointments')
          .select('id')
          .eq('clinic_id', clinicId)
          .gte('appointment_date', startOfDay.toISOString())
          .lte('appointment_date', endOfDay.toISOString()),
        
        supabase
          .from('patients')
          .select('id')
          .eq('clinic_id', clinicId),
        
        supabase
          .from('treatments')
          .select('id')
          .eq('clinic_id', clinicId)
          .eq('status', 'in_progress'),
        
        supabase
          .from('payments')
          .select('amount')
          .eq('clinic_id', clinicId)
          .eq('status', 'completed')
          .gte('created_at', startOfMonth.toISOString())
          .lte('created_at', endOfMonth.toISOString())
      ])

      const revenue = monthlyRevenue.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

      return {
        todayAppointments: todayAppointments.data?.length || 0,
        totalPatients: totalPatients.data?.length || 0,
        activeTreatments: activeTreatments.data?.length || 0,
        monthlyRevenue: revenue
      }
    },
    ['dashboard-metrics', clinicId],
    [CACHE_TAGS.APPOINTMENTS, CACHE_TAGS.PATIENTS, CACHE_TAGS.TREATMENTS, CACHE_TAGS.PAYMENTS],
    CACHE_DURATIONS.SHORT
  )

/**
 * Memory cache for frequently accessed data
 */
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>()

  set(key: string, data: any, ttl: number = CACHE_DURATIONS.SHORT) {
    const expires = Date.now() + (ttl * 1000)
    this.cache.set(key, { data, expires })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }
}

export const memoryCache = new MemoryCache()
