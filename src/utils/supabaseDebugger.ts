
import { supabase } from '../lib/supabase';

// Tipos para debugging
interface DebugResult {
  success: boolean;
  error?: string;
  data?: unknown;
  details?: string;
}

interface HealthCheckResult {
  connection: DebugResult;
  auth: DebugResult;
  rls: DebugResult;
  tables: DebugResult;
}

export class SupabaseDebugger {
  
  /**
   * Verifica se a conexão com Supabase está funcionando
   */
  static async checkConnection(): Promise<DebugResult> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        return {
          success: false,
          error: error.message,
          details: `Código do erro: ${error.code || 'N/A'}`
        };
      }
      
      return {
        success: true,
        data: 'Conexão estabelecida com sucesso'
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        success: false,
        error: errorMessage,
        details: 'Erro de conectividade geral'
      };
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  static async checkAuth(): Promise<DebugResult> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return {
          success: false,
          error: error.message,
          details: 'Erro ao obter dados do usuário'
        };
      }
      
      if (!user) {
        return {
          success: false,
          error: 'Usuário não autenticado',
          details: 'Sessão expirada ou usuário não logado'
        };
      }
      
      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        }
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        success: false,
        error: errorMessage,
        details: 'Erro geral de autenticação'
      };
    }
  }

  /**
   * Testa as políticas RLS nas tabelas principais
   */
  static async checkRLS(): Promise<DebugResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'Usuário não autenticado para teste RLS'
        };
      }

      // Testa SELECT em profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        return {
          success: false,
          error: `Erro RLS em profiles: ${profileError.message}`,
          details: `Código: ${profileError.code}`
        };
      }

      // Testa SELECT em transactions (usando a tabela correta)
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('id')
        .limit(1);

      if (transactionsError && !transactionsError.message.includes('does not exist')) {
        return {
          success: false,
          error: `Erro RLS em transactions: ${transactionsError.message}`,
          details: `Código: ${transactionsError.code}`
        };
      }

      return {
        success: true,
        data: 'Políticas RLS funcionando corretamente'
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        success: false,
        error: errorMessage,
        details: 'Erro geral ao testar RLS'
      };
    }
  }

  /**
   * Verifica se as tabelas necessárias existem
   */
  static async checkTables(): Promise<DebugResult> {
    const requiredTables = ['profiles', 'transactions', 'clients'];
    const results: { [key: string]: boolean } = {};
    
    try {
      for (const table of requiredTables) {
        const { error } = await supabase
          .from(table as any)
          .select('*')
          .limit(1);
        
        results[table] = !error || error.code !== '42P01'; // 42P01 = relation does not exist
      }
      
      const missingTables = Object.entries(results)
        .filter(([_, exists]) => !exists)
        .map(([table, _]) => table);
      
      if (missingTables.length > 0) {
        return {
          success: false,
          error: `Tabelas não encontradas: ${missingTables.join(', ')}`,
          data: results
        };
      }
      
      return {
        success: true,
        data: results
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        success: false,
        error: errorMessage,
        details: 'Erro ao verificar tabelas'
      };
    }
  }

  /**
   * Executa um health check completo do Supabase
   */
  static async healthCheck(): Promise<HealthCheckResult> {
    console.log('🔍 Iniciando diagnóstico do Supabase...');
    
    const connection = await this.checkConnection();
    console.log('📡 Conexão:', connection.success ? '✅' : '❌', connection.error || 'OK');
    
    const auth = await this.checkAuth();
    console.log('🔐 Autenticação:', auth.success ? '✅' : '❌', auth.error || 'OK');
    
    const rls = await this.checkRLS();
    console.log('🛡️ RLS:', rls.success ? '✅' : '❌', rls.error || 'OK');
    
    const tables = await this.checkTables();
    console.log('📊 Tabelas:', tables.success ? '✅' : '❌', tables.error || 'OK');
    
    return {
      connection,
      auth,
      rls,
      tables
    };
  }

  /**
   * Testa operação específica de INSERT/UPDATE
   */
  static async testOperation(table: string, operation: 'insert' | 'update' | 'select', data?: Record<string, unknown>): Promise<DebugResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      switch (operation) {
        case 'select': {
          const { data: selectData, error: selectError } = await supabase
            .from(table as any)
            .select('*')
            .limit(1);
          
          if (selectError) {
            return {
              success: false,
              error: selectError.message,
              details: `SELECT em ${table} falhou`
            };
          }
          
          return {
            success: true,
            data: `SELECT em ${table} funcionando`
          };
        }

        case 'insert': {
          // Só testamos insert se dados forem fornecidos
          if (!data) {
            return {
              success: false,
              error: 'Dados não fornecidos para teste de INSERT'
            };
          }
          
          const { error: insertError } = await supabase
            .from(table as any)
            .insert({ ...data, user_id: user.id });
          
          if (insertError) {
            return {
              success: false,
              error: insertError.message,
              details: `INSERT em ${table} falhou`
            };
          }
          
          return {
            success: true,
            data: `INSERT em ${table} funcionando`
          };
        }

        default:
          return {
            success: false,
            error: 'Operação não suportada'
          };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        success: false,
        error: errorMessage,
        details: `Erro ao testar ${operation} em ${table}`
      };
    }
  }
}

// Hook para usar o debugger em componentes React
export const useSupabaseDebugger = () => {
  const runHealthCheck = async () => {
    return await SupabaseDebugger.healthCheck();
  };

  const testTableOperation = async (table: string, operation: 'insert' | 'update' | 'select', data?: Record<string, unknown>) => {
    return await SupabaseDebugger.testOperation(table, operation, data);
  };

  return {
    runHealthCheck,
    testTableOperation
  };
};
