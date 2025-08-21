// Essential Patient Management E2E Test
// e2e/tests/patient-management/create-patient.spec.ts

import { expect, test } from '@playwright/test';

test.describe('Patient Management - Create Patient', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to patients page
    await page.goto('/patients');

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: /pacientes/i })
    ).toBeVisible();
  });

  test('should create new patient successfully', async ({ page }) => {
    // Click "New Patient" button
    await page.getByRole('button', { name: /novo paciente/i }).click();

    // Wait for form to load
    await expect(
      page.getByRole('heading', { name: /novo paciente/i })
    ).toBeVisible();

    // Fill patient form
    await page.getByLabel(/nome completo/i).fill('Maria Silva');
    await page.getByLabel(/cpf/i).fill('123.456.789-09');
    await page.getByLabel(/telefone/i).fill('(11) 99999-9999');
    await page.getByLabel(/email/i).fill('maria@email.com');

    // Fill address
    await page.getByLabel(/cep/i).fill('01234-567');
    await page.getByLabel(/rua/i).fill('Rua das Flores, 123');
    await page.getByLabel(/bairro/i).fill('Centro');
    await page.getByLabel(/cidade/i).fill('São Paulo');
    await page.getByLabel(/estado/i).selectOption('SP');

    // Fill medical information
    await page.getByLabel(/data de nascimento/i).fill('1990-05-15');
    await page.getByLabel(/gênero/i).selectOption('feminino');

    // Check LGPD consent
    await page.getByLabel(/concordo com o tratamento dos dados/i).check();

    // Submit form
    await page.getByRole('button', { name: /salvar paciente/i }).click();

    // Verify success
    await expect(page.getByText(/paciente criado com sucesso/i)).toBeVisible();

    // Verify redirect to patient detail
    await expect(page.url()).toMatch(/\/patients\/\d+/);

    // Verify patient data is displayed
    await expect(page.getByText('Maria Silva')).toBeVisible();
    await expect(page.getByText('123.456.789-09')).toBeVisible();
    await expect(page.getByText('maria@email.com')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Click "New Patient" button
    await page.getByRole('button', { name: /novo paciente/i }).click();

    // Try to submit empty form
    await page.getByRole('button', { name: /salvar paciente/i }).click();

    // Verify validation errors
    await expect(page.getByText(/nome é obrigatório/i)).toBeVisible();
    await expect(page.getByText(/cpf é obrigatório/i)).toBeVisible();
    await expect(page.getByText(/telefone é obrigatório/i)).toBeVisible();
    await expect(page.getByText(/email é obrigatório/i)).toBeVisible();
  });

  test('should validate CPF format', async ({ page }) => {
    // Click "New Patient" button
    await page.getByRole('button', { name: /novo paciente/i }).click();

    // Fill invalid CPF
    await page.getByLabel(/cpf/i).fill('123.456.789-00');
    await page.getByLabel(/nome completo/i).fill('Test User');

    // Try to submit
    await page.getByRole('button', { name: /salvar paciente/i }).click();

    // Verify CPF validation error
    await expect(page.getByText(/cpf inválido/i)).toBeVisible();
  });
});
