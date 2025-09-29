import { PrismaClient } from '@prisma/client'
// @ts-ignore - temporary fix for @supabase/supabase-js import issue
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Validate database schema compatibility
 * Checks if all required tables exist and have the correct structure
 */
export async function validateSchema(): Promise<boolean> {
  try {
    // For Prisma, we can check if the schema is up to date
    const prisma = new PrismaClient()

    // Run a simple query to check if the database is accessible
    await prisma.$queryRaw`SELECT 1`

    // Check if all required tables exist with proper structure
    const requiredTables = [
      { name: 'clinics', requiredColumns: ['id', 'name', 'created_at'] },
      {
        name: 'patients',
        requiredColumns: ['id', 'clinic_id', 'name', 'cpf', 'created_at'],
      },
      {
        name: 'appointments',
        requiredColumns: [
          'id',
          'patient_id',
          'professional_id',
          'start_time',
          'end_time',
        ],
      },
      {
        name: 'professionals',
        requiredColumns: ['id', 'clinic_id', 'name', 'crm', 'specialty'],
      },
    ]

    for (const tableSpec of requiredTables) {
      try {
        // Check if table exists
        const existsResult = (await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public_ 
            AND table_name = ${tableSpec.name}
          )
        `) as any[]

        if (!existsResult[0]?.exists) {
          const { createLogger } = await import('@neonpro/utils')
          const logger = createLogger('database-validation')
          logger.error(`Required table ${tableSpec.name} does not exist`, {
            component: 'database-validation',
            table: tableSpec.name,
            action: 'check_table_exists',
          })
          return false
        }

        // Check if required columns exist
        const columnsResult = (await prisma.$queryRaw`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = 'public_ 
          AND table_name = ${tableSpec.name}
        `) as { column_name: string }[]

        const existingColumns = columnsResult.map(col => col.column_name)
        const missingColumns = tableSpec.requiredColumns.filter(
          col => !existingColumns.includes(col),
        )

        if (missingColumns.length > 0) {
          const { createLogger } = await import('@neonpro/utils')
          const logger = createLogger('database-validation')
          logger.error(`Required columns missing from table ${tableSpec.name}: ${missingColumns.join(', ')}`, {
              component: 'database-validation',
              table: tableSpec.name,
              missingColumns,
              action: 'check_columns',
            })
          return false
        }
      } catch (error) {
        const { createLogger } = await import('@neonpro/utils')
        const logger = createLogger('database-validation')
        logger.error(`Error checking table ${tableSpec.name}: ${error instanceof Error ? error.message : String(error)}`, {
          component: 'database-validation',
          table: tableSpec.name,
          action: 'check_table_error',
        })
        return false
      }
    }

    await prisma.$disconnect()
    return true
  } catch (error) {
    const { createLogger } = await import('@neonpro/utils')
    const logger = createLogger('database-validation')
    logger.error(`Schema validation error: ${error instanceof Error ? error.message : String(error)}`, {
      component: 'database-validation',
      action: 'validate_schema_error',
    })
    return false
  }
}

/**
 * Check if all required tables exist
 */
export async function checkTablesExist(
  client: SupabaseClient,
): Promise<boolean> {
  const requiredTables = [
    { name: 'clinics', requiredColumns: ['id', 'name', 'created_at'] },
    {
      name: 'patients',
      requiredColumns: ['id', 'clinic_id', 'name', 'cpf', 'created_at'],
    },
    {
      name: 'appointments',
      requiredColumns: [
        'id',
        'patient_id',
        'professional_id',
        'start_time',
        'end_time',
      ],
    },
    {
      name: 'professionals',
      requiredColumns: ['id', 'clinic_id', 'name', 'crm', 'specialty'],
    },
  ]

  try {
    for (const tableSpec of requiredTables) {
      const { data, error } = await client
        .from(tableSpec.name)
        .select(tableSpec.requiredColumns.join(','))
        .limit(1)
      if (error) {
        const { createLogger } = await import('@neonpro/utils')
        const logger = createLogger('database-validation')
        logger.error(`Table ${tableSpec.name} validation failed: ${error instanceof Error ? error.message : String(error)}`, {
          component: 'database-validation',
          table: tableSpec.name,
          action: 'table_validation_failed',
        })
        return false
      }

      // Verify that all required columns are present in the response
      if (data && data.length > 0) {
        const row = data[0]
        if (!row) {
          const { createLogger } = await import('@neonpro/utils')
          const logger = createLogger('database-validation')
          logger.error(`No data returned from table ${tableSpec.name}`, {
              component: 'database-validation',
              table: tableSpec.name,
              action: 'no_data_returned',
            })
          return false
        }
        const missingColumns = tableSpec.requiredColumns.filter(
          col => !(col in row),
        )
        if (missingColumns.length > 0) {
          const { createLogger } = await import('@neonpro/utils')
          const logger = createLogger('database-validation')
          logger.error(
            `Required columns missing from table ${tableSpec.name}: ${missingColumns.join(', ')}`,
            {
              component: 'database-validation',
              table: tableSpec.name,
              missingColumns,
              action: 'check_response_columns',
            }
          )
          return false
        }
      }
    }
    return true
  } catch (error) {
    const { createLogger } = await import('@neonpro/utils')
    const logger = createLogger('database-validation')
    logger.error('Schema validation error', {
      component: 'database-validation',
      action: 'check_tables_error',
      error: error instanceof Error ? error.message : String(error)
    })
    return false
  }
}

/**
 * Sanitize data for AI processing by removing sensitive information
 * and ensuring data privacy compliance
 */
export function sanitizeForAI<T extends Record<string, any>>(data: T): T {
  const sensitiveFields = [
    'cpf',
    'rg',
    'email',
    'phone',
    'address',
    'medicalRecordNumber',
    'insuranceNumber',
    'creditCard',
    'password',
    'secret',
  ]

  const sanitized = { ...data }

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      delete sanitized[field]
    }
  }

  return sanitized
}
