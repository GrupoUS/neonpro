import type { FullConfig } from "@playwright/test";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

/**
 * Setup global para testes E2E do Playwright
 * Executa uma vez antes de todos os testes
 */
async function globalSetup(config: FullConfig) {
  console.log("🚀 Iniciando setup global dos testes E2E...");

  try {
    // 1. Verificar variáveis de ambiente necessárias
    await validateEnvironmentVariables();

    // 2. Preparar banco de dados de teste
    await setupTestDatabase();

    // 3. Criar usuários de teste
    await createTestUsers();

    // 4. Preparar dados de teste
    await seedTestData();

    // 5. Verificar se aplicação está rodando
    await verifyApplicationHealth();

    // 6. Preparar diretórios de relatórios
    await setupReportDirectories();

    console.log("✅ Setup global concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro no setup global:", error);
    throw error;
  }
}

/**
 * Validar variáveis de ambiente necessárias
 */
async function validateEnvironmentVariables() {
  console.log("🔍 Validando variáveis de ambiente...");

  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias não encontradas: ${missingVars.join(", ")}`,
    );
  }

  console.log("✅ Variáveis de ambiente validadas");
}

/**
 * Configurar banco de dados de teste
 */
async function setupTestDatabase() {
  console.log("🗄️ Configurando banco de dados de teste...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Limpar dados de teste existentes
    await cleanupTestData(supabase);

    // Executar migrações se necessário
    // await runMigrations(supabase);

    console.log("✅ Banco de dados de teste configurado");
  } catch (error) {
    console.error("❌ Erro ao configurar banco de dados:", error);
    throw error;
  }
}

/**
 * Limpar dados de teste existentes
 */
async function cleanupTestData(supabase: any) {
  console.log("🧹 Limpando dados de teste existentes...");

  try {
    // Limpar tabelas em ordem (respeitando foreign keys)
    const tablesToClean = [
      "appointments",
      "medical_records",
      "prescriptions",
      "patients",
      "profiles",
    ];

    for (const table of tablesToClean) {
      const { error } = await supabase
        .from(table)
        .delete()
        .like("email", "%test%"); // Apenas dados de teste

      if (error && !error.message.includes("does not exist")) {
        console.warn(`Aviso ao limpar tabela ${table}:`, error.message);
      }
    }

    console.log("✅ Dados de teste limpos");
  } catch (error) {
    console.warn("⚠️ Aviso na limpeza de dados:", error);
    // Não falhar o setup por causa da limpeza
  }
}

/**
 * Criar usuários de teste
 */
async function createTestUsers() {
  console.log("👥 Criando usuários de teste...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const testUsers = [
    {
      email: "admin.test@neonpro.com",
      password: "TestPassword123!",
      role: "admin",
      name: "Admin Teste",
    },
    {
      email: "doctor.test@neonpro.com",
      password: "TestPassword123!",
      role: "doctor",
      name: "Dr. Teste Silva",
      crm: "123456-SP",
    },
    {
      email: "nurse.test@neonpro.com",
      password: "TestPassword123!",
      role: "nurse",
      name: "Enfermeira Teste",
      coren: "123456-SP",
    },
    {
      email: "receptionist.test@neonpro.com",
      password: "TestPassword123!",
      role: "receptionist",
      name: "Recepcionista Teste",
    },
  ];

  try {
    for (const user of testUsers) {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role,
        },
      });

      if (authError && !authError.message.includes("already registered")) {
        console.warn(
          `Aviso ao criar usuário ${user.email}:`,
          authError.message,
        );
        continue;
      }

      // Criar perfil do usuário
      if (authData.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: authData.user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          ...(user.crm && { crm: user.crm }),
          ...(user.coren && { coren: user.coren }),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.warn(
            `Aviso ao criar perfil para ${user.email}:`,
            profileError.message,
          );
        }
      }
    }

    console.log("✅ Usuários de teste criados");
  } catch (error) {
    console.warn("⚠️ Aviso na criação de usuários:", error);
    // Não falhar o setup por causa dos usuários
  }
}

/**
 * Preparar dados de teste
 */
async function seedTestData() {
  console.log("🌱 Preparando dados de teste...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Criar pacientes de teste
    const testPatients = [
      {
        name: "João Silva Teste",
        email: "joao.teste@email.com",
        cpf: "123.456.789-01",
        birth_date: "1990-01-15",
        phone: "(11) 99999-1111",
        address: "Rua Teste, 123 - São Paulo, SP",
      },
      {
        name: "Maria Santos Teste",
        email: "maria.teste@email.com",
        cpf: "987.654.321-01",
        birth_date: "1985-05-20",
        phone: "(11) 99999-2222",
        address: "Av. Teste, 456 - São Paulo, SP",
      },
    ];

    for (const patient of testPatients) {
      const { error } = await supabase.from("patients").upsert(patient);

      if (error) {
        console.warn(`Aviso ao criar paciente ${patient.name}:`, error.message);
      }
    }

    console.log("✅ Dados de teste preparados");
  } catch (error) {
    console.warn("⚠️ Aviso na preparação de dados:", error);
    // Não falhar o setup por causa dos dados
  }
}

/**
 * Verificar se aplicação está rodando
 */
async function verifyApplicationHealth() {
  console.log("🏥 Verificando saúde da aplicação...");

  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
  const maxRetries = 30;
  const retryDelay = 2000; // 2 segundos

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const browser = await chromium.launch();
      const page = await browser.newPage();

      const response = await page.goto(baseURL, {
        waitUntil: "domcontentloaded",
        timeout: 10_000,
      });

      await browser.close();

      if (response && response.status() < 400) {
        console.log("✅ Aplicação está rodando e acessível");
        return;
      }

      throw new Error(`Status HTTP: ${response?.status()}`);
    } catch (error) {
      console.log(
        `⏳ Tentativa ${attempt}/${maxRetries} - Aguardando aplicação...`,
      );

      if (attempt === maxRetries) {
        throw new Error(
          `Aplicação não está acessível em ${baseURL} após ${maxRetries} tentativas`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
}

/**
 * Preparar diretórios de relatórios
 */
async function setupReportDirectories() {
  console.log("📁 Preparando diretórios de relatórios...");

  const reportDirs = [
    "tools/reports/e2e",
    "tools/reports/e2e/html",
    "tools/reports/e2e/screenshots",
    "tools/reports/e2e/videos",
    "tools/reports/e2e/traces",
    "tools/reports/test-results/e2e",
  ];

  for (const dir of reportDirs) {
    const fullPath = path.resolve(process.cwd(), dir);

    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }

  console.log("✅ Diretórios de relatórios preparados");
}

export default globalSetup;
