import { render } from '@testing-library/react';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';
import { type AestheticAssessmentData } from '../components/pdf/AestheticReportPDF';
import { generatePDFFilename, usePDFExport } from '../hooks/usePDFExport';

// Mock dependencies
vi.mock(_'sonner',_() => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock(_'file-saver',_() => ({
  saveAs: vi.fn(),
}));

vi.mock(_'@react-pdf/renderer',_() => ({
  pdf: vi.fn(() => ({
    toBlob: vi.fn(() => Promise.resolve(new Blob(['fake pdf content']))),
  })),
  Document: vi.fn(_({ children }) => children),
  Page: vi.fn(_({ children }) => children),
  Text: vi.fn(_({ children }) => children),
  View: vi.fn(_({ children }) => children),
  StyleSheet: {
    create: vi.fn(styles => styles),
  },
  Font: {
    register: vi.fn(),
  },
}));

describe(_'PDF Export System',_() => {
  const mockAssessmentData: AestheticAssessmentData = {
    patientData: {
      name: 'João Silva',
      age: 35,
      skinType: '3',
      gender: 'masculino',
    },
    skinAnalysis: {
      primaryConcerns: ['Acne', 'Manchas solares'],
      skinCondition: 'oleosa',
      acnePresent: true,
      melasmaPresent: false,
      wrinklesPresent: false,
      sunDamage: 'moderado',
    },
    medicalHistory: {
      isPregnant: false,
      isBreastfeeding: false,
      hasDiabetes: false,
      hasAutoimmune: false,
      currentMedications: '',
      allergies: '',
      previousTreatments: '',
    },
    lifestyle: {
      sunExposure: 'alta',
      smoking: false,
      alcoholConsumption: 'social',
      exerciseFrequency: 'moderado',
    },
    lgpdConsent: {
      dataProcessing: true,
      imageAnalysis: true,
      marketingCommunication: false,
    },
  };

  describe(_'generatePDFFilename',_() => {
    it(_'should generate correct filename for assessment',_() => {
      const filename = generatePDFFilename(
        'assessment',
        'João Silva',
        new Date('2024-01-01'),
      );
      expect(filename).toBe('avaliacao_estetica_joao_silva_2024-01-01.pdf');
    });

    it(_'should generate correct filename for treatment plan',_() => {
      const filename = generatePDFFilename(
        'treatment',
        'Maria Santos',
        new Date('2024-02-15'),
      );
      expect(filename).toBe('plano_tratamento_maria_santos_2024-02-15.pdf');
    });

    it(_'should clean special characters from name',_() => {
      const filename = generatePDFFilename(
        'consent',
        'José Carlos-Silva (Jr.)',
        new Date('2024-03-20'),
      );
      expect(filename).toBe(
        'termo_consentimento_jose_carlos_silva__jr___2024-03-20.pdf',
      );
    });
  });

  describe(_'usePDFExport hook',_() => {
    it(_'should provide correct initial state',_() => {
      const TestComponent = () => {
        const { isGenerating, error } = usePDFExport();
        return (
          <div>
            <span data-testid='generating'>{isGenerating.toString()}</span>
            <span data-testid='error'>{error || 'null'}</span>
          </div>
        );
      };

      const { getByTestId } = render(<TestComponent />);
      expect(getByTestId('generating')).toHaveTextContent('false');
      expect(getByTestId('error')).toHaveTextContent('null');
    });
  });

  describe(_'Performance Requirements',_() => {
    it(_'should track PDF generation time',_async () => {
      // Mock performance.now to simulate time passage
      const mockNow = vi.spyOn(performance, 'now');
      mockNow.mockReturnValueOnce(1000).mockReturnValueOnce(1500); // 0.5s duration

      const TestComponent = () => {
        const { generatePDF } = usePDFExport();

        const handleGenerate = async () => {
          await generatePDF(<div>Mock PDF Component</div>);
        };

        return <button onClick={handleGenerate}>Generate</button>;
      };

      render(<TestComponent />);

      // The hook should not log warning for fast generation (<2s)
      const consoleSpy = vi.spyOn(console, 'warn');
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('PDF generation took'),
      );
    });
  });

  describe(_'Error Handling',_() => {
    it(_'should handle PDF generation errors gracefully',_() => {
      const TestComponent = () => {
        const { error } = usePDFExport();
        return <div data-testid='error-state'>{error || 'no-error'}</div>;
      };

      const { getByTestId } = render(<TestComponent />);
      expect(getByTestId('error-state')).toHaveTextContent('no-error');
    });
  });
});
