import { PrismaClient } from '@prisma/client';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Validate database schema compatibility
 */
export async function validateSchema(): Promise<boolean> {
  try {
    // For Prisma, we can check if the schema is up to date
    const prisma = new PrismaClient();
    
    // Run a simple query to check if the database is accessible
    await prisma.$queryRaw`SELECT 1`;
    
    // Check if all required tables exist
    const requiredTables = ['clinics', 'patients', 'appointments', 'professionals'];
    
    for (const table of requiredTables) {
      try {
        // For PostgreSQL/Supabase, we can check if tables exist
        const result = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${table}
          )
        ` as any[];
        
        if (!result[0]?.exists) {
          console.error(`Required table ${table} does not exist`);
          return false;
        }
      } catch (error) {
        console.error(`Error checking table ${table}:`, error);
        return false;
      }
    }
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('Schema validation error:', error);
    return false;
  }
}

/**
 * Check if all required tables exist
 */
export async function checkTablesExist(client: SupabaseClient): Promise<boolean> {
  const requiredTables = ['clinics', 'patients', 'appointments', 'professionals'];
  
  try {
    for (const table of requiredTables) {
      const { error } = await client.from(table).select('id').limit(1);
      if (error) {
        console.error(`Table ${table} validation failed:`, error);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Schema validation error:', error);
    return false;
  }
}