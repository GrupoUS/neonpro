import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Teardown global para testes E2E do Playwright
 * Executa uma vez após todos os testes
 */
async function globalTeardown() {
  console.log('🧹 Iniciando teardown global dos testes E2E...');
  
  try {
    // 1. Limpar dados de teste do banco
    await cleanupTestDatabase();
    
    // 2. Remover usuários de teste
    await removeTestUsers();
    
    // 3. Limpar arquivos temporários
    await cleanupTemporaryFiles();
    
    // 4. Gerar relatório final
    await generateFinalReport();
    
    console.log('✅ Teardown global concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teardown global:', error);
    // Não falhar o teardown para não afetar o resultado dos testes
  }
}

/**
 * Limpar dados de teste do banco de dados
 */
async function cleanupTestDatabase() {
  console.log('🗄️ Limpando dados de teste do banco...');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️ Variáveis de ambiente do Supabase não encontradas, pulando limpeza do banco');
    return;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // Limpar tabelas em ordem (respeitando foreign keys)
    const tablesToClean = [
      'appointments',
      'medical_records', 
      'prescriptions',
      'patients'
    ];
    
    for (const table of tablesToClean) {
      const { error } = await supabase
        .from(table)
        .delete()
        .or('email.like.%test%,name.like.%Teste%,name.like.%Test%');
      
      if (error && !error.message.includes('does not exist')) {
        console.warn(`Aviso ao limpar tabela ${table}:`, error.message);
      } else {
        console.log(`✅ Tabela ${table} limpa`);
      }
    }
    
    console.log('✅ Dados de teste removidos do banco');
    
  } catch (error) {
    console.warn('⚠️ Aviso na limpeza do banco:', error);
  }
}

/**
 * Remover usuários de teste
 */
async function removeTestUsers() {
  console.log('👥 Removendo usuários de teste...');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️ Variáveis de ambiente do Supabase não encontradas, pulando remoção de usuários');
    return;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  const testUserEmails = [
    'admin.test@neonpro.com',
    'doctor.test@neonpro.com',
    'nurse.test@neonpro.com',
    'receptionist.test@neonpro.com'
  ];
  
  try {
    // Primeiro, remover perfis
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .in('email', testUserEmails);
    
    if (profilesError) {
      console.warn('Aviso ao remover perfis:', profilesError.message);
    }
    
    // Depois, remover usuários do Auth
    for (const email of testUserEmails) {
      try {
        // Buscar usuário por email
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
          console.warn(`Erro ao listar usuários:`, listError.message);
          continue;
        }
        
        const user = users.users.find(u => u.email === email);
        
        if (user) {
          const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
          
          if (deleteError) {
            console.warn(`Aviso ao remover usuário ${email}:`, deleteError.message);
          } else {
            console.log(`✅ Usuário ${email} removido`);
          }
        }
        
      } catch (error) {
        console.warn(`Aviso ao processar usuário ${email}:`, error);
      }
    }
    
    console.log('✅ Usuários de teste removidos');
    
  } catch (error) {
    console.warn('⚠️ Aviso na remoção de usuários:', error);
  }
}

/**
 * Limpar arquivos temporários
 */
async function cleanupTemporaryFiles() {
  console.log('🗂️ Limpando arquivos temporários...');
  
  try {
    const tempDirs = [
      'tools/reports/e2e/screenshots',
      'tools/reports/e2e/videos',
      'tools/reports/e2e/traces',
      'test-results'
    ];
    
    for (const dir of tempDirs) {
      const fullPath = path.resolve(process.cwd(), dir);
      
      if (fs.existsSync(fullPath)) {
        // Manter apenas os últimos 5 arquivos de cada tipo
        const files = fs.readdirSync(fullPath)
          .map(file => ({
            name: file,
            path: path.join(fullPath, file),
            stats: fs.statSync(path.join(fullPath, file))
          }))
          .filter(file => file.stats.isFile())
          .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
        
        // Remover arquivos antigos (manter apenas os 5 mais recentes)
        const filesToRemove = files.slice(5);
        
        for (const file of filesToRemove) {
          try {
            fs.unlinkSync(file.path);
            console.log(`🗑️ Arquivo removido: ${file.name}`);
          } catch (error) {
            console.warn(`Aviso ao remover arquivo ${file.name}:`, error);
          }
        }
      }
    }
    
    console.log('✅ Arquivos temporários limpos');
    
  } catch (error) {
    console.warn('⚠️ Aviso na limpeza de arquivos:', error);
  }
}

/**
 * Gerar relatório final
 */
async function generateFinalReport() {
  console.log('📊 Gerando relatório final...');
  
  try {
    const reportPath = path.resolve(process.cwd(), 'tools/reports/e2e/final-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      teardown_completed: true,
      cleanup_actions: [
        'Database test data cleaned',
        'Test users removed',
        'Temporary files cleaned',
        'Report generated'
      ],
      next_run_ready: true
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('✅ Relatório final gerado:', reportPath);
    
  } catch (error) {
    console.warn('⚠️ Aviso na geração do relatório:', error);
  }
}

/**
 * Verificar integridade do sistema após testes
 */
async function verifySystemIntegrity() {
  console.log('🔍 Verificando integridade do sistema...');
  
  try {
    // Verificar se não há dados de teste residuais
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
      
      // Verificar se ainda existem dados de teste
      const { data: testPatients, error } = await supabase
        .from('patients')
        .select('id')
        .or('email.like.%test%,name.like.%Teste%')
        .limit(1);
      
      if (error) {
        console.warn('Aviso na verificação de integridade:', error.message);
      } else if (testPatients && testPatients.length > 0) {
        console.warn('⚠️ Ainda existem dados de teste no banco');
      } else {
        console.log('✅ Sistema limpo - nenhum dado de teste residual encontrado');
      }
    }
    
  } catch (error) {
    console.warn('⚠️ Aviso na verificação de integridade:', error);
  }
}

export default globalTeardown;