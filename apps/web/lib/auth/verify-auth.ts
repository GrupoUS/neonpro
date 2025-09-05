// NeonPro MVP - Auth Verification
import { createClient } from './server'
import type { User, UserRole } from './permissions'

export async function verifyAuth(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Get user profile with role information
    const { data: profile } = await supabase
      .from('professionals')
      .select('id, clinic_id, professional_type')
      .eq('user_id', user.id)
      .single()

    if (profile) {
      return {
        id: user.id,
        email: user.email!,
        role: 'professional' as UserRole,
        professionalId: profile.id,
        clinicId: profile.clinic_id,
      }
    }

    // Check if user is admin (can be determined by email or metadata)
    if (user.email?.includes('admin') || user.user_metadata?.role === 'admin') {
      return {
        id: user.id,
        email: user.email!,
        role: 'admin' as UserRole,
      }
    }

    // Default to patient role
    return {
      id: user.id,
      email: user.email!,
      role: 'patient' as UserRole,
      patientId: user.id, // Use user ID as patient ID for now
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await verifyAuth()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export async function requireRole(requiredRole: UserRole): Promise<User> {
  const user = await requireAuth()
  if (user.role !== requiredRole) {
    throw new Error(`Role ${requiredRole} required`)
  }
  return user
}