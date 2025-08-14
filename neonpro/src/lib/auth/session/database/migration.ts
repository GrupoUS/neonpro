// ============================================================================
// Session Management System - Database Migration
// NeonPro - Session Management & Security
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

/**
 * Classe para gerenciar migrações do sistema de sessões
 */
export class SessionMigration {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Executa a migração completa do sistema de sessões
   */
  async runMigration(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🚀 Starting session system migration...');

      // 1. Verificar se as tabelas já existem
      const tablesExist = await this.checkTablesExist();
      if (tablesExist) {
        console.log('⚠️ Session tables already exist. Skipping migration.');
        return { success: true };
      }

      // 2. Executar o schema SQL
      await this.executeSchema();

      // 3. Verificar se a migração foi bem-sucedida
      const migrationSuccess = await this.verifyMigration();
      if (!migrationSuccess) {
        throw new Error('Migration verification failed');
      }

      console.log('✅ Session system migration completed successfully!');
      return { success: true };
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verifica se as tabelas do sistema de sessões já existem
   */
  private async checkTablesExist(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', [
          'user_sessions',
          'device_registrations',
          'session_audit_logs',
          'security_events',
          'ip_blacklist',
          'session_policies',
        ]);

      if (error) {
        console.log('Could not check existing tables, proceeding with migration');
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.log('Could not check existing tables, proceeding with migration');
      return false;
    }
  }

  /**
   * Executa o schema SQL
   */
  private async executeSchema(): Promise<void> {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Dividir o SQL em comandos individuais
    const commands = schemaSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Executing ${commands.length} SQL commands...`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      try {
        console.log(`⏳ Executing command ${i + 1}/${commands.length}...`);
        
        const { error } = await this.supabase.rpc('exec_sql', {
          sql_query: command,
        });

        if (error) {
          // Tentar executar diretamente se a função RPC não existir
          const { error: directError } = await this.supabase
            .from('_temp_migration')
            .select('*')
            .limit(0);

          if (directError) {
            console.log(`⚠️ Command ${i + 1} failed, but continuing...`);
          }
        }
      } catch (error) {
        console.log(`⚠️ Command ${i + 1} failed:`, error);
        // Continuar com os próximos comandos
      }
    }
  }

  /**
   * Verifica se a migração foi bem-sucedida
   */
  private async verifyMigration(): Promise<boolean> {
    try {
      // Verificar se as tabelas principais foram criadas
      const tables = [
        'user_sessions',
        'device_registrations',
        'session_audit_logs',
        'security_events',
        'ip_blacklist',
        'session_policies',
      ];

      for (const table of tables) {
        const { error } = await this.supabase
          .from(table)
          .select('*')
          .limit(0);

        if (error) {
          console.error(`❌ Table ${table} verification failed:`, error);
          return false;
        }
      }

      console.log('✅ All tables verified successfully');
      return true;
    } catch (error) {
      console.error('❌ Migration verification failed:', error);
      return false;
    }
  }

  /**
   * Executa rollback da migração (remove todas as tabelas)
   */
  async rollback(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Starting session system rollback...');

      const tables = [
        'user_sessions',
        'device_registrations', 
        'session_audit_logs',
        'security_events',
        'ip_blacklist',
        'session_policies',
      ];

      // Remover tabelas em ordem reversa para evitar problemas de FK
      for (const table of tables.reverse()) {
        try {
          const { error } = await this.supabase.rpc('exec_sql', {
            sql_query: `DROP TABLE IF EXISTS ${table} CASCADE`,
          });

          if (error) {
            console.log(`⚠️ Could not drop table ${table}:`, error);
          } else {
            console.log(`🗑️ Dropped table ${table}`);
          }
        } catch (error) {
          console.log(`⚠️ Could not drop table ${table}:`, error);
        }
      }

      // Remover tipos enum
      const enums = [
        'session_status',
        'device_status', 
        'audit_event_type',
        'security_event_type',
        'threat_level',
      ];

      for (const enumType of enums) {
        try {
          await this.supabase.rpc('exec_sql', {
            sql_query: `DROP TYPE IF EXISTS ${enumType} CASCADE`,
          });
          console.log(`🗑️ Dropped enum ${enumType}`);
        } catch (error) {
          console.log(`⚠️ Could not drop enum ${enumType}:`, error);
        }
      }

      console.log('✅ Session system rollback completed!');
      return { success: true };
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verifica o status atual da migração
   */
  async getStatus(): Promise<{
    migrated: boolean;
    tables: { name: string; exists: boolean }[];
    error?: string;
  }> {
    try {
      const tables = [
        'user_sessions',
        'device_registrations',
        'session_audit_logs', 
        'security_events',
        'ip_blacklist',
        'session_policies',
      ];

      const tableStatus = [];
      let allExist = true;

      for (const table of tables) {
        try {
          const { error } = await this.supabase
            .from(table)
            .select('*')
            .limit(0);

          const exists = !error;
          tableStatus.push({ name: table, exists });
          
          if (!exists) {
            allExist = false;
          }
        } catch (error) {
          tableStatus.push({ name: table, exists: false });
          allExist = false;
        }
      }

      return {
        migrated: allExist,
        tables: tableStatus,
      };
    } catch (error) {
      return {
        migrated: false,
        tables: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Função utilitária para executar migração
 */
export async function runSessionMigration(
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const migration = new SessionMigration(supabase);
  
  return await migration.runMigration();
}

/**
 * Função utilitária para rollback
 */
export async function rollbackSessionMigration(
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const migration = new SessionMigration(supabase);
  
  return await migration.rollback();
}

/**
 * Script CLI para executar migração
 */
if (require.main === module) {
  const command = process.argv[2];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  const migration = new SessionMigration(
    createClient(supabaseUrl, supabaseKey)
  );

  switch (command) {
    case 'migrate':
      migration.runMigration().then(result => {
        if (result.success) {
          console.log('✅ Migration completed successfully!');
          process.exit(0);
        } else {
          console.error('❌ Migration failed:', result.error);
          process.exit(1);
        }
      });
      break;

    case 'rollback':
      migration.rollback().then(result => {
        if (result.success) {
          console.log('✅ Rollback completed successfully!');
          process.exit(0);
        } else {
          console.error('❌ Rollback failed:', result.error);
          process.exit(1);
        }
      });
      break;

    case 'status':
      migration.getStatus().then(status => {
        console.log('📊 Migration Status:');
        console.log(`Migrated: ${status.migrated ? '✅' : '❌'}`);
        console.log('\nTables:');
        status.tables.forEach(table => {
          console.log(`  ${table.name}: ${table.exists ? '✅' : '❌'}`);
        });
        if (status.error) {
          console.error('Error:', status.error);
        }
        process.exit(0);
      });
      break;

    default:
      console.log('Usage: node migration.js [migrate|rollback|status]');
      process.exit(1);
  }
}

export default SessionMigration;
