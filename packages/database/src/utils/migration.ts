import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Data migration utilities for Supabase
 */

// Migration version tracking
const SCHEMA_VERSION = '1.0.0';
const MIGRATION_TABLE = '_migrations';

/**
 * Migrate data between schema versions
 * Performs database migrations in a controlled, versioned manner
 */
export async function migrateData(): Promise<void> {
  try {
    // Initialize clients
    const prisma = new PrismaClient();

    // Ensure migrations table exists
    await ensureMigrationsTable(prisma);

    // Get current schema version
    const currentVersion = await getCurrentSchemaVersion(prisma);

    // Define migration steps
    const migrations = [
      {
        version: '1.0.0',
        description: 'Initial schema setup',
        up: async () => {
          // This would contain actual migration logic
          // For now, just log that migration would occur
          console.log('Running initial schema setup migration...');
        },
      },
      {
        version: '1.0.1',
        description: 'Add indexes for performance',
        up: async () => {
          console.log('Adding performance indexes...');
        },
      },
      {
        version: '1.1.0',
        description: 'Add new healthcare fields',
        up: async () => {
          console.log('Adding new healthcare-specific fields...');
        },
      },
    ];

    // Apply pending migrations
    for (const migration of migrations) {
      if (isMigrationPending(currentVersion, migration.version)) {
        console.log(`Applying migration ${migration.version}: ${migration.description}`);
        await migration.up();
        await recordMigration(prisma, migration.version, migration.description);
      }
    }

    console.log('Data migration completed successfully');

    await prisma.$disconnect();
  } catch (error) {
    console.error('Data migration error:', error);
    throw error;
  }
}

/**
 * Backup data before migration
 * Creates a JSON backup of critical healthcare data
 */
export async function backupData(): Promise<string> {
  try {
    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generate backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `backup-${timestamp}.json`;
    const backupPath = path.join(backupDir, backupFilename);

    // Initialize clients
    const prisma = new PrismaClient();

    // Backup critical healthcare tables
    const backupData = {
      timestamp: new Date().toISOString(),
      version: SCHEMA_VERSION,
      clinics: await prisma.clinic.findMany(),
      patients: await prisma.patient.findMany({
        select: {
          id: true,
          clinicId: true,
          fullName: true,
          cpf: true,
          email: true,
          phonePrimary: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      professionals: await prisma.professional.findMany({
        select: {
          id: true,
          clinicId: true,
          fullName: true,
          specialization: true,
          licenseNumber: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      appointments: await prisma.appointment.findMany({
        select: {
          id: true,
          patientId: true,
          professionalId: true,
          startTime: true,
          endTime: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    };

    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

    await prisma.$disconnect();
    return backupPath;
  } catch (error) {
    console.error('Backup error:', error);
    throw error;
  }
}

// Helper functions for migration management

async function ensureMigrationsTable(prisma: PrismaClient): Promise<void> {
  try {
    // Check if migrations table exists
    const result = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${MIGRATION_TABLE}
      )
    ` as any[];

    if (!result[0]?.exists) {
      // Create migrations table
      await prisma.$executeRaw`
        CREATE TABLE ${MIGRATION_TABLE} (
          id SERIAL PRIMARY KEY,
          version VARCHAR(50) NOT NULL UNIQUE,
          description TEXT,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      console.log('Created migrations table');
    }
  } catch (error) {
    console.error('Error ensuring migrations table:', error);
    throw error;
  }
}

async function getCurrentSchemaVersion(prisma: PrismaClient): Promise<string> {
  try {
    const result = await prisma.$queryRaw`
      SELECT version FROM ${MIGRATION_TABLE} 
      ORDER BY applied_at DESC 
      LIMIT 1
    ` as any[];

    return result[0]?.version || '0.0.0';
  } catch (error) {
    console.error('Error getting current schema version:', error);
    return '0.0.0';
  }
}

function isMigrationPending(currentVersion: string, migrationVersion: string): boolean {
  // Simple version comparison (in a real app, use semver library)
  return migrationVersion > currentVersion;
}

async function recordMigration(
  prisma: PrismaClient,
  version: string,
  description: string,
): Promise<void> {
  try {
    await prisma.$executeRaw`
      INSERT INTO ${MIGRATION_TABLE} (version, description)
      VALUES (${version}, ${description})
    `;
  } catch (error) {
    console.error('Error recording migration:', error);
    throw error;
  }
}
