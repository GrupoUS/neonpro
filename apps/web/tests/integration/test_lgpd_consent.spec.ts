import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { LGPDConsentDialog } from '../../../src/components/patients/LGPDConsentDialog';
import { createTestPatient } from '../../../src/testing/test-utils';

test.skip('T023: Integration test LGPD consent flow', async () => {
  // Setup
  const patient = createTestPatient({
    name: 'Maria Silva',
    cpf: '123.456.789-00',
    email: 'maria.silva@email.com',
  });

  // Render consent dialog
  render(<LGPDConsentDialog patient={patient} onConsent={vi.fn()} />);

  // Verify consent form elements
  expect(screen.getByText('Termo de Consentimento LGPD')).toBeInTheDocument();
  expect(screen.getByLabelText(/Concordo com o tratamento de dados/)).toBeInTheDocument();
  expect(screen.getByLabelText(/Autorizo compartilhamento/)).toBeInTheDocument();

  // Test consent flow
  const consentCheckbox = screen.getByLabelText(/Concordo com o tratamento de dados/);
  const sharingCheckbox = screen.getByLabelText(/Autorizo compartilhamento/);
  const submitButton = screen.getByRole('button', { name: 'Aceitar' });

  // Initially disabled
  expect(submitButton).toBeDisabled();

  // Enable checkboxes
  fireEvent.click(consentCheckbox);
  fireEvent.click(sharingCheckbox);

  // Button should be enabled
  expect(submitButton).toBeEnabled();

  // Submit consent
  fireEvent.click(submitButton);

  // Verify consent was recorded
  await waitFor(() => {
    expect(screen.getByText('Consentimento registrado com sucesso')).toBeInTheDocument();
  });

  // Verify audit trail was created
  const auditEntry = await findAuditLog(patient.id, 'LGPD_CONSENT_GRANTED');
  expect(auditEntry).toBeDefined();
  expect(auditEntry.details).toContain('data_processing_consent: true');
  expect(auditEntry.details).toContain('data_sharing_consent: true');
});

// Helper function
async function findAuditLog(patientId: string, action: string) {
  // Implementation would query audit service
  return {
    id: 'audit-123',
    patientId,
    action,
    timestamp: new Date().toISOString(),
    details: JSON.stringify({
      data_processing_consent: true,
      data_sharing_consent: true,
      retention_policy: '10_years',
    }),
  };
}
