import { expect, test as base } from "@playwright/test";
import type { Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { AppointmentsPage } from "../pages/AppointmentsPage";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { PatientsPage } from "../pages/PatientsPage";

/**
 * Tipos para fixtures customizadas
 */
export interface TestFixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  patientsPage: PatientsPage;
  appointmentsPage: AppointmentsPage;
  authenticatedPage: Page;
  supabaseClient: ReturnType<typeof createClient>;
  testUser: TestUser;
}

export interface TestUser {
  email: string;
  password: string;
  name: string;
  role: "admin" | "doctor" | "nurse" | "receptionist";
  id?: string;
}

/**
 * Usuários de teste predefinidos
 */
export const TEST_USERS: Record<string, TestUser> = {
  admin: {
    email: "admin.test@neonpro.com",
    password: "TestPassword123!",
    name: "Admin Teste",
    role: "admin",
  },
  doctor: {
    email: "doctor.test@neonpro.com",
    password: "TestPassword123!",
    name: "Dr. Teste Silva",
    role: "doctor",
  },
  nurse: {
    email: "nurse.test@neonpro.com",
    password: "TestPassword123!",
    name: "Enfermeira Teste",
    role: "nurse",
  },
  receptionist: {
    email: "receptionist.test@neonpro.com",
    password: "TestPassword123!",
    name: "Recepcionista Teste",
    role: "receptionist",
  },
};

/**
 * Dados de teste para pacientes
 */
export const TEST_PATIENTS = {
  patient1: {
    name: "João Silva Teste",
    email: "joao.teste@email.com",
    cpf: "123.456.789-01",
    birth_date: "1990-01-15",
    phone: "(11) 99999-1111",
    address: "Rua Teste, 123 - São Paulo, SP",
  },
  patient2: {
    name: "Maria Santos Teste",
    email: "maria.teste@email.com",
    cpf: "987.654.321-01",
    birth_date: "1985-05-20",
    phone: "(11) 99999-2222",
    address: "Av. Teste, 456 - São Paulo, SP",
  },
};

/**
 * Dados de teste para consultas
 */
export const TEST_APPOINTMENTS = {
  appointment1: {
    patient_name: "João Silva Teste",
    doctor_name: "Dr. Teste Silva",
    date: "2024-12-31",
    time: "10:00",
    type: "Consulta",
    status: "Agendada",
  },
  appointment2: {
    patient_name: "Maria Santos Teste",
    doctor_name: "Dr. Teste Silva",
    date: "2024-12-31",
    time: "14:00",
    type: "Retorno",
    status: "Agendada",
  },
};

/**
 * Fixture para página de login
 */
const loginPageFixture = async (
  { page }: { page: Page; },
  use: (fixture: LoginPage) => Promise<void>,
) => {
  const loginPage = new LoginPage(page);
  await use(loginPage);
};

/**
 * Fixture para página do dashboard
 */
const dashboardPageFixture = async (
  { page }: { page: Page; },
  use: (fixture: DashboardPage) => Promise<void>,
) => {
  const dashboardPage = new DashboardPage(page);
  await use(dashboardPage);
};

/**
 * Fixture para página de pacientes
 */
const patientsPageFixture = async (
  { page }: { page: Page; },
  use: (fixture: PatientsPage) => Promise<void>,
) => {
  const patientsPage = new PatientsPage(page);
  await use(patientsPage);
};

/**
 * Fixture para página de consultas
 */
const appointmentsPageFixture = async (
  { page }: { page: Page; },
  use: (fixture: AppointmentsPage) => Promise<void>,
) => {
  const appointmentsPage = new AppointmentsPage(page);
  await use(appointmentsPage);
};

/**
 * Fixture para página autenticada
 * Automaticamente faz login com usuário admin
 */
const authenticatedPageFixture = async (
  { page }: { page: Page; },
  use: (fixture: Page) => Promise<void>,
) => {
  const loginPage = new LoginPage(page);

  // Fazer login com usuário admin
  await loginPage.navigate();
  await loginPage.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
  await loginPage.waitForSuccessfulLogin();

  await use(page);
};

/**
 * Fixture para cliente Supabase
 */
const supabaseClientFixture = async (
  {},
  use: (fixture: ReturnType<typeof createClient>) => Promise<void>,
) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Variáveis de ambiente do Supabase não configuradas");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  await use(supabase);
};

/**
 * Fixture para usuário de teste
 * Por padrão retorna o usuário admin, mas pode ser customizado
 */
const testUserFixture = async (
  {},
  use: (fixture: TestUser) => Promise<void>,
) => {
  await use(TEST_USERS.admin);
};

/**
 * Teste base com todas as fixtures
 */
export const test = base.extend<TestFixtures>({
  loginPage: loginPageFixture,
  dashboardPage: dashboardPageFixture,
  patientsPage: patientsPageFixture,
  appointmentsPage: appointmentsPageFixture,
  authenticatedPage: authenticatedPageFixture,
  supabaseClient: supabaseClientFixture,
  testUser: testUserFixture,
});

/**
 * Fixture para teste com usuário específico
 */
export const testWithUser = (userType: keyof typeof TEST_USERS) => {
  return test.extend<TestFixtures>({
    testUser: async ({}, use) => {
      await use(TEST_USERS[userType]);
    },
    authenticatedPage: async ({ page }, use) => {
      const loginPage = new LoginPage(page);
      const user = TEST_USERS[userType];

      await loginPage.navigate();
      await loginPage.login(user.email, user.password);
      await loginPage.waitForSuccessfulLogin();

      await use(page);
    },
  });
};

/**
 * Helpers para testes
 */
export class TestHelpers {
  /**
   * Gerar dados aleatórios para testes
   */
  static generateRandomData() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);

    return {
      email: `test.${timestamp}.${random}@neonpro.com`,
      name: `Teste ${timestamp}`,
      cpf: this.generateRandomCPF(),
      phone: `(11) 9${random.toString().padStart(4, "0")}-${random.toString().padStart(4, "0")}`,
      timestamp,
    };
  }

  /**
   * Gerar CPF válido para testes
   */
  static generateRandomCPF(): string {
    const randomDigits = () => Math.floor(Math.random() * 10);

    // Gerar 9 primeiros dígitos
    const digits = Array.from({ length: 9 }, randomDigits);

    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }
    const firstDigit = ((sum * 10) % 11) % 10;
    digits.push(firstDigit);

    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * (11 - i);
    }
    const secondDigit = ((sum * 10) % 11) % 10;
    digits.push(secondDigit);

    // Formatar CPF
    const cpf = digits.join("");
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
  }

  /**
   * Aguardar elemento com retry
   */
  static async waitForElement(
    page: Page,
    selector: string,
    options: { timeout?: number; retries?: number; } = {},
  ) {
    const { timeout = 5000, retries = 3 } = options;

    for (let i = 0; i < retries; i++) {
      try {
        await page.waitForSelector(selector, { timeout });
        return;
      } catch (error) {
        if (i === retries - 1) {
          throw error;
        }
        await page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Fazer screenshot com nome único
   */
  static async takeScreenshot(
    page: Page,
    name: string,
    options: { fullPage?: boolean; } = {},
  ) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${name}-${timestamp}.png`;

    await page.screenshot({
      path: `tools/reports/e2e/screenshots/${filename}`,
      fullPage: options.fullPage || false,
    });

    return filename;
  }

  /**
   * Limpar dados de teste específicos
   */
  static async cleanupTestData(supabase: Record<string, unknown>, testId: string) {
    try {
      // Limpar dados relacionados ao teste específico
      const tables = [
        "appointments",
        "medical_records",
        "prescriptions",
        "patients",
      ];

      for (const table of tables) {
        await supabase
          .from(table)
          .delete()
          .or(`name.like.%${testId}%,email.like.%${testId}%`);
      }
    } catch (error) {
      console.warn("Aviso na limpeza de dados específicos:", error);
    }
  }
}

// Re-exportar expect para conveniência
export { expect };
