import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { PatientsPage } from '../../pages/PatientsPage';
import { TestUtils, TEST_CONSTANTS } from '../../utils/test-utils';

/**
 * Testes E2E para gerenciamento de pacientes
 * Demonstra operações CRUD e funcionalidades avançadas
 */
test.describe('Patients Management', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let patientsPage: PatientsPage;
  
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    patientsPage = new PatientsPage(page);
    
    // Login como médico
    const credentials = TestUtils.getCredentialsByUserType('doctor');
    await loginPage.navigateToLogin();
    await loginPage.login(credentials.email, credentials.password);
    await dashboardPage.waitForPageLoad();
    
    // Navegar para página de pacientes
    await patientsPage.navigateToPatients();
    await patientsPage.waitForPageLoad();
  });
  
  test.afterEach(async ({ page }) => {
    // Limpar dados de teste
    await TestUtils.cleanupTestData(page);
  });
  
  test('should create new patient successfully', async ({ page }) => {
    // Arrange
    const patientData = TestUtils.generatePatientData();
    
    // Act
    await patientsPage.clickAddPatient();
    await patientsPage.fillPatientForm(patientData);
    await patientsPage.savePatient();
    
    // Assert
    await expect(patientsPage.hasSuccessMessage()).resolves.toBe(true);
    const successMessage = await patientsPage.getSuccessMessage();
    expect(successMessage).toContain('Paciente criado com sucesso');
    
    // Verificar se paciente aparece na lista
    await patientsPage.searchPatient(patientData.name);
    const searchResults = await patientsPage.getSearchResults();
    expect(searchResults).toContain(patientData.name);
  });
  
  test('should validate required fields when creating patient', async ({ page }) => {
    // Act
    await patientsPage.clickAddPatient();
    await patientsPage.savePatient(); // Tentar salvar sem preencher
    
    // Assert
    await expect(patientsPage.hasValidationErrors()).resolves.toBe(true);
    
    const nameError = await patientsPage.getFieldValidationError('name');
    const cpfError = await patientsPage.getFieldValidationError('cpf');
    const birthDateError = await patientsPage.getFieldValidationError('birthDate');
    
    expect(nameError).toContain('obrigatório');
    expect(cpfError).toContain('obrigatório');
    expect(birthDateError).toContain('obrigatório');
  });
  
  test('should search patients by name', async ({ page }) => {
    // Arrange - Criar paciente de teste
    const patientData = TestUtils.generatePatientData();
    await patientsPage.createPatientViaAPI(patientData);
    
    // Act
    await patientsPage.searchPatient(patientData.name);
    
    // Assert
    const searchResults = await patientsPage.getSearchResults();
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0]).toContain(patientData.name);
  });
  
  test('should filter patients by age range', async ({ page }) => {
    // Arrange - Criar pacientes com idades diferentes
    const youngPatient = TestUtils.generatePatientData({ age: 25 });
    const oldPatient = TestUtils.generatePatientData({ age: 65 });
    
    await patientsPage.createPatientViaAPI(youngPatient);
    await patientsPage.createPatientViaAPI(oldPatient);
    
    // Act - Filtrar por faixa etária
    await patientsPage.openFilters();
    await patientsPage.setAgeFilter(60, 70);
    await patientsPage.applyFilters();
    
    // Assert
    const filteredResults = await patientsPage.getSearchResults();
    expect(filteredResults).toContain(oldPatient.name);
    expect(filteredResults).not.toContain(youngPatient.name);
  });
  
  test('should edit patient information', async ({ page }) => {
    // Arrange - Criar paciente
    const originalData = TestUtils.generatePatientData();
    await patientsPage.createPatientViaAPI(originalData);
    
    const updatedData = {
      ...originalData,
      phone: '(11) 99999-9999',
      email: 'updated@example.com'
    };
    
    // Act
    await patientsPage.searchPatient(originalData.name);
    await patientsPage.editFirstPatient();
    await patientsPage.updatePatientForm(updatedData);
    await patientsPage.savePatient();
    
    // Assert
    await expect(patientsPage.hasSuccessMessage()).resolves.toBe(true);
    
    // Verificar se dados foram atualizados
    await patientsPage.viewFirstPatient();
    const patientDetails = await patientsPage.getPatientDetails();
    expect(patientDetails.phone).toBe(updatedData.phone);
    expect(patientDetails.email).toBe(updatedData.email);
  });
  
  test('should delete patient with confirmation', async ({ page }) => {
    // Arrange - Criar paciente
    const patientData = TestUtils.generatePatientData();
    await patientsPage.createPatientViaAPI(patientData);
    
    // Act
    await patientsPage.searchPatient(patientData.name);
    await patientsPage.deleteFirstPatient();
    await patientsPage.confirmDeletion();
    
    // Assert
    await expect(patientsPage.hasSuccessMessage()).resolves.toBe(true);
    
    // Verificar se paciente foi removido
    await patientsPage.searchPatient(patientData.name);
    const searchResults = await patientsPage.getSearchResults();
    expect(searchResults).not.toContain(patientData.name);
  });
  
  test('should cancel patient deletion', async ({ page }) => {
    // Arrange - Criar paciente
    const patientData = TestUtils.generatePatientData();
    await patientsPage.createPatientViaAPI(patientData);
    
    // Act
    await patientsPage.searchPatient(patientData.name);
    await patientsPage.deleteFirstPatient();
    await patientsPage.cancelDeletion();
    
    // Assert - Paciente deve ainda existir
    await patientsPage.searchPatient(patientData.name);
    const searchResults = await patientsPage.getSearchResults();
    expect(searchResults).toContain(patientData.name);
  });
  
  test('should handle bulk operations', async ({ page }) => {
    // Arrange - Criar múltiplos pacientes
    const patients = [
      TestUtils.generatePatientData(),
      TestUtils.generatePatientData(),
      TestUtils.generatePatientData()
    ];
    
    for (const patient of patients) {
      await patientsPage.createPatientViaAPI(patient);
    }
    
    // Act - Selecionar todos e exportar
    await patientsPage.selectAllPatients();
    await patientsPage.bulkExport();
    
    // Assert
    await expect(patientsPage.hasSuccessMessage()).resolves.toBe(true);
    const successMessage = await patientsPage.getSuccessMessage();
    expect(successMessage).toContain('exportados com sucesso');
  });
  
  test('should import patients from CSV', async ({ page }) => {
    // Arrange - Preparar arquivo CSV de teste
    const csvData = TestUtils.generatePatientCSV([
      TestUtils.generatePatientData(),
      TestUtils.generatePatientData()
    ]);
    
    // Act
    await patientsPage.clickImportPatients();
    await patientsPage.uploadCSVFile(csvData);
    await patientsPage.confirmImport();
    
    // Assert
    await expect(patientsPage.hasSuccessMessage()).resolves.toBe(true);
    const successMessage = await patientsPage.getSuccessMessage();
    expect(successMessage).toContain('importados com sucesso');
  });
  
  test('should paginate through patient list', async ({ page }) => {
    // Arrange - Criar muitos pacientes para testar paginação
    const patients = Array.from({ length: 25 }, () => TestUtils.generatePatientData());
    
    for (const patient of patients) {
      await patientsPage.createPatientViaAPI(patient);
    }
    
    // Act & Assert - Navegar pelas páginas
    await patientsPage.waitForPageLoad();
    
    const firstPageResults = await patientsPage.getSearchResults();
    expect(firstPageResults.length).toBe(20); // Assumindo 20 por página
    
    await patientsPage.goToNextPage();
    const secondPageResults = await patientsPage.getSearchResults();
    expect(secondPageResults.length).toBe(5); // Restantes
    
    // Verificar que os resultados são diferentes
    expect(firstPageResults[0]).not.toBe(secondPageResults[0]);
  });
  
  test('should sort patients by different criteria', async ({ page }) => {
    // Arrange - Criar pacientes com nomes ordenáveis
    const patients = [
      TestUtils.generatePatientData({ name: 'Ana Silva' }),
      TestUtils.generatePatientData({ name: 'Bruno Santos' }),
      TestUtils.generatePatientData({ name: 'Carlos Oliveira' })
    ];
    
    for (const patient of patients) {
      await patientsPage.createPatientViaAPI(patient);
    }
    
    // Act - Ordenar por nome (A-Z)
    await patientsPage.sortBy('name', 'asc');
    
    // Assert
    const sortedResults = await patientsPage.getSearchResults();
    expect(sortedResults[0]).toContain('Ana Silva');
    expect(sortedResults[1]).toContain('Bruno Santos');
    expect(sortedResults[2]).toContain('Carlos Oliveira');
    
    // Act - Ordenar por nome (Z-A)
    await patientsPage.sortBy('name', 'desc');
    
    // Assert
    const reverseSortedResults = await patientsPage.getSearchResults();
    expect(reverseSortedResults[0]).toContain('Carlos Oliveira');
    expect(reverseSortedResults[1]).toContain('Bruno Santos');
    expect(reverseSortedResults[2]).toContain('Ana Silva');
  });
  
  test('should handle patient medical history', async ({ page }) => {
    // Arrange - Criar paciente
    const patientData = TestUtils.generatePatientData();
    await patientsPage.createPatientViaAPI(patientData);
    
    // Act
    await patientsPage.searchPatient(patientData.name);
    await patientsPage.viewFirstPatient();
    await patientsPage.openMedicalHistory();
    
    // Assert
    await expect(patientsPage.hasMedicalHistorySection()).resolves.toBe(true);
    
    // Adicionar entrada no histórico
    const historyEntry = {
      date: new Date().toISOString().split('T')[0],
      description: 'Consulta de rotina',
      diagnosis: 'Paciente saudável'
    };
    
    await patientsPage.addMedicalHistoryEntry(historyEntry);
    await patientsPage.saveMedicalHistory();
    
    // Verificar se entrada foi salva
    const historyEntries = await patientsPage.getMedicalHistoryEntries();
    expect(historyEntries).toContain(historyEntry.description);
  });
  
  test('should validate CPF format', async ({ page }) => {
    // Arrange
    const patientData = TestUtils.generatePatientData({
      cpf: '123.456.789-00' // CPF inválido
    });
    
    // Act
    await patientsPage.clickAddPatient();
    await patientsPage.fillPatientForm(patientData);
    await patientsPage.savePatient();
    
    // Assert
    await expect(patientsPage.hasValidationErrors()).resolves.toBe(true);
    const cpfError = await patientsPage.getFieldValidationError('cpf');
    expect(cpfError).toContain('CPF inválido');
  });
  
  test('should be responsive on mobile devices', async ({ page }) => {
    // Arrange - Simular dispositivo móvel
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Act
    await patientsPage.navigateToPatients();
    
    // Assert - Verificar layout responsivo
    await expect(patientsPage.hasMobileLayout()).resolves.toBe(true);
    await expect(patientsPage.hasMobileMenu()).resolves.toBe(true);
    
    // Testar funcionalidades em mobile
    await patientsPage.openMobileMenu();
    await patientsPage.clickAddPatient();
    
    const patientData = TestUtils.generatePatientData();
    await patientsPage.fillPatientForm(patientData);
    await patientsPage.savePatient();
    
    await expect(patientsPage.hasSuccessMessage()).resolves.toBe(true);
  });
  
  test('should handle concurrent user actions', async ({ page, context }) => {
    // Arrange - Criar segundo contexto/usuário
    const secondPage = await context.newPage();
    const secondPatientsPage = new PatientsPage(secondPage);
    
    // Login com segundo usuário
    const secondLoginPage = new LoginPage(secondPage);
    const credentials = TestUtils.getCredentialsByUserType('doctor');
    await secondLoginPage.navigateToLogin();
    await secondLoginPage.login(credentials.email, credentials.password);
    
    await secondPatientsPage.navigateToPatients();
    
    // Act - Ambos usuários criam pacientes simultaneamente
    const patient1 = TestUtils.generatePatientData();
    const patient2 = TestUtils.generatePatientData();
    
    await Promise.all([
      patientsPage.createPatientViaUI(patient1),
      secondPatientsPage.createPatientViaUI(patient2)
    ]);
    
    // Assert - Ambos pacientes devem ser criados
    await patientsPage.searchPatient(patient1.name);
    const results1 = await patientsPage.getSearchResults();
    expect(results1).toContain(patient1.name);
    
    await patientsPage.searchPatient(patient2.name);
    const results2 = await patientsPage.getSearchResults();
    expect(results2).toContain(patient2.name);
    
    await secondPage.close();
  });
});

/**
 * Testes de performance para gerenciamento de pacientes
 */
test.describe('Patients Performance', () => {
  test('should load patient list quickly', async ({ page }) => {
    // Arrange - Login
    const { patientsPage } = await TestUtils.loginAndNavigateToPatients(page);
    
    // Act & Assert - Medir tempo de carregamento
    const startTime = Date.now();
    await patientsPage.navigateToPatients();
    await patientsPage.waitForPageLoad();
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // 3 segundos
  });
  
  test('should handle large patient datasets', async ({ page }) => {
    // Arrange - Criar muitos pacientes
    const { patientsPage } = await TestUtils.loginAndNavigateToPatients(page);
    
    // Simular dataset grande via mock
    await TestUtils.mockApiResponse(
      page,
      TEST_CONSTANTS.API_ENDPOINTS.PATIENTS,
      { patients: Array.from({ length: 1000 }, () => TestUtils.generatePatientData()) }
    );
    
    // Act
    const startTime = Date.now();
    await patientsPage.refreshPatientList();
    const loadTime = Date.now() - startTime;
    
    // Assert
    expect(loadTime).toBeLessThan(5000); // 5 segundos para 1000 pacientes
    
    // Verificar se paginação funciona
    await expect(patientsPage.hasPagination()).resolves.toBe(true);
  });
});