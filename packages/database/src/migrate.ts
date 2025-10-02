/**
 * NeonPro Data Migration Scripts
 *
 * Production-ready migration from old structure to new Supabase-first architecture
 * Includes rollback procedures, error handling, and dry-run mode
 *
 * Migration Order:
 * 1. Clinics (root multi-tenant entity)
 * 2. Users (with LGPD compliance fields)
 * 3. User-Clinic relationships (junction table)
 * 4. Business tables (appointments, leads, messages)
 */

import {
  AppointmentData,
  ClinicData,
  MigrationData,
  MigrationOptions,
  MigrationResult,
  UserClinicData,
  UserData,
} from '@neonpro/types'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/supabase'

class DataMigration {
  private supabase: ReturnType<typeof createClient<Database>>
  private options: Required<MigrationOptions>

  constructor(
    supabaseUrl: string,
    serviceRoleKey: string,
    options: MigrationOptions = {},
  ) {
    this.supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    this.options = {
      dryRun: options.dryRun ?? false,
      batchSize: options.batchSize ?? 100,
      logLevel: options.logLevel ?? 'info',
    }
  }

  private log(level: string, message: string, data?: unknown) {
    const levels = ['debug', 'info', 'warn', 'error']
    if (levels.indexOf(level) >= levels.indexOf(this.options.logLevel)) {
      console.log(`[${level.toUpperCase()}] ${message}`, data || '')
    }
  }

  /**
   * Step 1: Migrate Clinics
   * Root multi-tenant entity - must be migrated first
   */
  async migrateClinics(clinics: ClinicData[]): Promise<MigrationResult> {
    this.log('info', `Starting clinic migration (${clinics.length} records)`)

    const result: MigrationResult = {
      success: true,
      migratedCount: 0,
      failedCount: 0,
      errors: [],
    }

    if (this.options.dryRun) {
      this.log('info', 'DRY RUN: Would migrate clinics', clinics)
      return result
    }

    for (const clinic of clinics) {
      try {
        const { error } = await this.supabase
          .from('clinics')
          .insert({
            id: clinic.id,
            name: clinic.name,
            slug: clinic.slug,
            timezone: clinic.timezone || 'America/Sao_Paulo',
            language: clinic.language || 'pt-BR',
            currency: clinic.currency || 'BRL',
            lgpd_consent_date: clinic.lgpd_consent_date,
            anvisa_registration: clinic.anvisa_registration,
            professional_council_number: clinic.professional_council_number,
          })

        if (error) throw error

        result.migratedCount++
        this.log('debug', `Migrated clinic: ${clinic.id}`)
      } catch (error) {
        result.failedCount++
        result.errors.push({
          id: clinic.id,
          error: error instanceof Error ? error.message : String(error),
        })
        this.log('error', `Failed to migrate clinic ${clinic.id}`, error)
      }
    }

    result.success = result.failedCount === 0
    this.log(
      'info',
      `Clinic migration complete: ${result.migratedCount} success, ${result.failedCount} failed`,
    )

    return result
  }

  /**
   * Step 2: Migrate Users
   * User accounts with LGPD compliance fields
   */
  async migrateUsers(users: UserData[]): Promise<MigrationResult> {
    this.log('info', `Starting user migration (${users.length} records)`)

    const result: MigrationResult = {
      success: true,
      migratedCount: 0,
      failedCount: 0,
      errors: [],
    }

    if (this.options.dryRun) {
      this.log('info', 'DRY RUN: Would migrate users', users)
      return result
    }

    for (const user of users) {
      try {
        const { error } = await this.supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            name: user.name,
            avatar_url: user.avatar_url,
            professional_license: user.professional_license,
            specialization: user.specialization,
            lgpd_consent_date: user.lgpd_consent_date,
            phone_number: user.phone_number,
          })

        if (error) throw error

        result.migratedCount++
        this.log('debug', `Migrated user: ${user.id}`)
      } catch (error) {
        result.failedCount++
        result.errors.push({
          id: user.id,
          error: error instanceof Error ? error.message : String(error),
        })
        this.log('error', `Failed to migrate user ${user.id}`, error)
      }
    }

    result.success = result.failedCount === 0
    this.log(
      'info',
      `User migration complete: ${result.migratedCount} success, ${result.failedCount} failed`,
    )

    return result
  }

  /**
   * Step 3: Migrate User-Clinic Relationships
   * Junction table for multi-tenant access
   */
  async migrateUserClinics(userClinics: UserClinicData[]): Promise<MigrationResult> {
    this.log('info', `Starting user-clinic relationship migration (${userClinics.length} records)`)

    const result: MigrationResult = {
      success: true,
      migratedCount: 0,
      failedCount: 0,
      errors: [],
    }

    if (this.options.dryRun) {
      this.log('info', 'DRY RUN: Would migrate user-clinic relationships', userClinics)
      return result
    }

    for (const uc of userClinics) {
      try {
        const { error } = await this.supabase
          .from('user_clinics')
          .insert({
            user_id: uc.user_id,
            clinic_id: uc.clinic_id,
            role: uc.role,
            permissions: uc.permissions || [],
          })

        if (error) throw error

        result.migratedCount++
        this.log('debug', `Migrated user-clinic: ${uc.user_id} -> ${uc.clinic_id}`)
      } catch (error) {
        result.failedCount++
        result.errors.push({
          id: `${uc.user_id}-${uc.clinic_id}`,
          error: error instanceof Error ? error.message : String(error),
        })
        this.log('error', `Failed to migrate user-clinic ${uc.user_id} -> ${uc.clinic_id}`, error)
      }
    }

    result.success = result.failedCount === 0
    this.log(
      'info',
      `User-clinic migration complete: ${result.migratedCount} success, ${result.failedCount} failed`,
    )

    return result
  }

  /**
   * Step 4: Migrate Appointments
   * Business table with real-time scheduling
   */
  async migrateAppointments(appointments: AppointmentData[]): Promise<MigrationResult> {
    this.log('info', `Starting appointment migration (${appointments.length} records)`)

    const result: MigrationResult = {
      success: true,
      migratedCount: 0,
      failedCount: 0,
      errors: [],
    }

    if (this.options.dryRun) {
      this.log('info', 'DRY RUN: Would migrate appointments', appointments)
      return result
    }

    for (const appointment of appointments) {
      try {
        const { error } = await this.supabase
          .from('appointments')
          .insert({
            id: appointment.id,
            clinic_id: appointment.clinic_id,
            patient_id: appointment.patient_id,
            professional_id: appointment.professional_id,
            status: appointment.status,
            start_time: appointment.start_time,
            end_time: appointment.end_time,
            service_type: appointment.service_type,
            notes: appointment.notes,
            lgpd_processing_consent: appointment.lgpd_processing_consent ?? false,
          })

        if (error) throw error

        result.migratedCount++
        this.log('debug', `Migrated appointment: ${appointment.id}`)
      } catch (error) {
        result.failedCount++
        result.errors.push({
          id: appointment.id,
          error: error instanceof Error ? error.message : String(error),
        })
        this.log('error', `Failed to migrate appointment ${appointment.id}`, error)
      }
    }

    result.success = result.failedCount === 0
    this.log(
      'info',
      `Appointment migration complete: ${result.migratedCount} success, ${result.failedCount} failed`,
    )

    return result
  }

  /**
   * Rollback: Delete migrated data
   * Use with caution - only for testing or failed migrations
   */
  async rollback(tables: Array<'clinics' | 'users' | 'user_clinics' | 'appointments'>) {
    this.log('warn', 'Starting rollback', tables)

    if (this.options.dryRun) {
      this.log('info', 'DRY RUN: Would rollback tables', tables)
      return
    }

    for (const table of tables.reverse()) {
      try {
        const { error } = await this.supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

        if (error) throw error

        this.log('info', `Rolled back table: ${table}`)
      } catch (error) {
        this.log('error', `Failed to rollback table ${table}`, error)
      }
    }
  }
}

/**
 * Execute full migration
 */
export async function executeFullMigration(
  supabaseUrl: string,
  serviceRoleKey: string,
  data: MigrationData,
  options: MigrationOptions = {},
) {
  const migration = new DataMigration(supabaseUrl, serviceRoleKey, options)

  console.log('Starting full migration...')

  // Step 1: Migrate clinics
  const clinicsResult = await migration.migrateClinics(data.clinics)
  if (!clinicsResult.success) {
    console.error('Clinic migration failed, aborting')
    return { success: false, results: { clinics: clinicsResult } }
  }

  // Step 2: Migrate users
  const usersResult = await migration.migrateUsers(data.users)
  if (!usersResult.success) {
    console.error('User migration failed, rolling back clinics')
    await migration.rollback(['clinics'])
    return { success: false, results: { clinics: clinicsResult, users: usersResult } }
  }

  // Step 3: Migrate user-clinic relationships
  const userClinicsResult = await migration.migrateUserClinics(data.userClinics)
  if (!userClinicsResult.success) {
    console.error('User-clinic migration failed, rolling back')
    await migration.rollback(['user_clinics', 'users', 'clinics'])
    return {
      success: false,
      results: { clinics: clinicsResult, users: usersResult, userClinics: userClinicsResult },
    }
  }

  // Step 4: Migrate appointments
  const appointmentsResult = await migration.migrateAppointments(data.appointments)
  if (!appointmentsResult.success) {
    console.error('Appointment migration failed, rolling back')
    await migration.rollback(['appointments', 'user_clinics', 'users', 'clinics'])
    return {
      success: false,
      results: {
        clinics: clinicsResult,
        users: usersResult,
        userClinics: userClinicsResult,
        appointments: appointmentsResult,
      },
    }
  }

  console.log('Full migration completed successfully')

  return {
    success: true,
    results: {
      clinics: clinicsResult,
      users: usersResult,
      userClinics: userClinicsResult,
      appointments: appointmentsResult,
    },
  }
}

export { DataMigration }
