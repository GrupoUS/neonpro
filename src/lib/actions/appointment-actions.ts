'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createAppointmentAction(formData: FormData) {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get user's clinic_id
  const { data: profile } = await supabase
    .from('neonpro_profiles')
    .select('clinic_id')
    .eq('id', user.id)
    .single()

  if (!profile?.clinic_id) {
    return { error: 'Clinic not found' }
  }

  const patientId = formData.get('patientId') as string
  const doctorId = formData.get('doctorId') as string
  const appointmentDate = formData.get('appointmentDate') as string
  const treatmentType = formData.get('treatmentType') as string
  const notes = formData.get('notes') as string
  const durationMinutes = parseInt(formData.get('durationMinutes') as string) || 60

  if (!patientId || !doctorId || !appointmentDate) {
    return { error: 'Patient, doctor, and appointment date are required' }
  }

  const { error } = await supabase
    .from('appointments')
    .insert({
      clinic_id: profile.clinic_id,
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_date: appointmentDate,
      treatment_type: treatmentType,
      notes: notes,
      duration_minutes: durationMinutes,
      status: 'scheduled'
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/appointments')
  return { success: 'Appointment created successfully' }
}

export async function updateAppointmentStatusAction(appointmentId: string, status: string) {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get user's clinic_id
  const { data: profile } = await supabase
    .from('neonpro_profiles')
    .select('clinic_id')
    .eq('id', user.id)
    .single()

  if (!profile?.clinic_id) {
    return { error: 'Clinic not found' }
  }

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .eq('clinic_id', profile.clinic_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/appointments')
  return { success: 'Appointment status updated successfully' }
}

export async function deleteAppointmentAction(appointmentId: string) {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get user's clinic_id
  const { data: profile } = await supabase
    .from('neonpro_profiles')
    .select('clinic_id')
    .eq('id', user.id)
    .single()

  if (!profile?.clinic_id) {
    return { error: 'Clinic not found' }
  }

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId)
    .eq('clinic_id', profile.clinic_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/appointments')
  return { success: 'Appointment deleted successfully' }
}
