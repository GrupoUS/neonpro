import { describe, expect, it } from 'vitest';
import { generatePDFFilename } from '../hooks/usePDFExport';

describe('PDF Export Utils', () => {
  describe('generatePDFFilename', () => {
    it('should generate correct filename for assessment', () => {
      const filename = generatePDFFilename(
        'assessment',
        'João Silva',
        new Date('2024-01-01'),
      );
      expect(filename).toBe('avaliacao_estetica_joao_silva_2024-01-01.pdf');
    });

    it('should generate correct filename for treatment plan', () => {
      const filename = generatePDFFilename(
        'treatment',
        'Maria Santos',
        new Date('2024-02-15'),
      );
      expect(filename).toBe('plano_tratamento_maria_santos_2024-02-15.pdf');
    });

    it('should clean special characters from name', () => {
      const filename = generatePDFFilename(
        'consent',
        'José Carlos-Silva (Jr.)',
        new Date('2024-03-20'),
      );
      expect(filename).toBe(
        'termo_consentimento_jose_carlos_silva_jr_2024-03-20.pdf',
      );
    });

    it('should use current date when not provided', () => {
      const filename = generatePDFFilename('assessment', 'Test User');
      expect(filename).toMatch(
        /^avaliacao_estetica_test_user_\d{4}-\d{2}-\d{2}\.pdf$/,
      );
    });
  });
});
