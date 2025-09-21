/**
 * PhotoUpload Component Tests (T110)
 * Comprehensive test suite for the photo upload system with AI analysis
 *
 * Test Coverage:
 * - Component rendering and basic functionality
 * - Drag and drop functionality
 * - File validation and error handling
 * - Upload progress and states
 * - AI analysis integration
 * - LGPD compliance
 * - Accessibility testing
 * - Integration with treatment suggestions
 */

import { AestheticAIAnalysisService } from '@/services/aesthetic/ai-analysis';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PhotoUpload } from '../PhotoUpload';

// Mock the AI analysis service
jest.mock('@/services/aesthetic/ai-analysis');
const MockAestheticAIAnalysisService = AestheticAIAnalysisService as jest.MockedClass<
  typeof AestheticAIAnalysisService
>;

// Mock file upload utilities
const createMockFile = (name: string, size: number, type: string): File => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

const createMockImageFile = (name: string, size = 1024 * 1024): File => {
  return createMockFile(name, size, 'image/jpeg');
};

describe(_'PhotoUpload Component',_() => {
  const mockOnPhotosUploaded = jest.fn();
  const mockOnPhotoRemoved = jest.fn();
  const mockOnAnalysisComplete = jest.fn();

  beforeEach(_() => {
    jest.clearAllMocks();

    // Mock the AI analysis service
    MockAestheticAIAnalysisService.prototype.analyzePhoto = jest
      .fn()
      .mockResolvedValue({
        skinType: 'mista',
        concerns: ['acne', 'poros dilatados'],
        conditions: {
          acne: true,
          melasma: false,
          wrinkles: false,
          sunDamage: 'mild',
          texture: 'uneven',
        },
        severity: {
          overall: 6,
          acne: 7,
          pigmentation: 4,
          wrinkles: 3,
        },
        recommendations: ['Limpeza de pele', 'Tratamento para acne'],
        confidence: 0.87,
      });

    // Mock successful upload
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  afterEach(_() => {
    jest.restoreAllMocks();
  });

  describe(_'Rendering and Basic Functionality',_() => {
    it(_'should render the upload area correctly',_() => {
      render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      expect(
        screen.getByText('Envie Fotos para Análise Estética'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Arraste fotos aqui ou clique para selecionar'),
      ).toBeInTheDocument();
      expect(screen.getByText('Formatos: JPEG, PNG, WebP')).toBeInTheDocument();
    });

    it(_'should show loading state when disabled',_() => {
      render(
        <PhotoUpload
          patientId='test-patient'
          disabled={true}
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const uploadArea = screen
        .getByText('Envie Fotos para Análise Estética')
        .closest('div');
      expect(uploadArea).toHaveClass('opacity-50');
      expect(uploadArea).toHaveClass('cursor-not-allowed');
    });

    it(_'should display max photos limit correctly',_() => {
      render(
        <PhotoUpload
          patientId='test-patient'
          maxPhotos={3}
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      expect(screen.getByText('Máximo 3 fotos')).toBeInTheDocument();
    });

    it(_'should display custom max file size correctly',_() => {
      render(
        <PhotoUpload
          patientId='test-patient'
          maxFileSize={15}
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      expect(screen.getByText('Tamanho máximo: 15MB')).toBeInTheDocument();
    });
  });

  describe(_'File Validation',_() => {
    it(_'should reject unsupported file types',_async () => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const invalidFile = createMockFile('test.txt', 1024, 'text/plain');
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files: [invalidFile],
          },
        });
      });

      await waitFor(_() => {
        expect(
          screen.getByText('Formato não suportado. Use: JPEG, PNG ou WebP'),
        ).toBeInTheDocument();
      });
    });

    it(_'should reject files that are too large',_async () => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          maxFileSize={1}
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const largeFile = createMockImageFile('large.jpg', 2 * 1024 * 1024); // 2MB
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files: [largeFile],
          },
        });
      });

      await waitFor(_() => {
        expect(
          screen.getByText('Arquivo muito grande. Máximo: 1MB'),
        ).toBeInTheDocument();
      });
    });

    it(_'should enforce max photos limit',_async () => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          maxPhotos={1}
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      // Mock already uploaded photos
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      const files = [
        createMockImageFile('photo1.jpg'),
        createMockImageFile('photo2.jpg'),
      ];

      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files,
          },
        });
      });

      await waitFor(_() => {
        expect(
          screen.getByText('Limite de fotos atingido. Máximo: 1 fotos'),
        ).toBeInTheDocument();
      });
    });

    it(_'should validate image dimensions',_async () => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      // Mock image loading with invalid dimensions
      const mockImage = new Image();
      mockImage.onload = jest.fn();
      mockImage.onerror = jest.fn();
      global.Image = jest.fn().mockImplementation(_() => mockImage);

      const smallFile = createMockImageFile('small.jpg');
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files: [smallFile],
          },
        });
      });

      // Simulate image loading with small dimensions
      await act(_async () => {
        mockImage.onload({ target: { width: 256, height: 256 } });
      });

      await waitFor(_() => {
        expect(
          screen.getByText(
            'Resolução muito baixa. Mínimo: 512x512px para análise precisa',
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe(_'Drag and Drop Functionality',_() => {
    it(_'should handle drag over events',_() => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const uploadArea = container.querySelector(
        '[role="button"]',
      ) as HTMLElement;

      fireEvent.dragOver(uploadArea, {
        preventDefault: jest.fn(),
      });

      expect(uploadArea).toHaveClass('border-primary');
      expect(uploadArea).toHaveClass('bg-primary/10');
    });

    it(_'should handle drag leave events',_() => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const uploadArea = container.querySelector(
        '[role="button"]',
      ) as HTMLElement;

      // First trigger drag over to add the classes
      fireEvent.dragOver(uploadArea, {
        preventDefault: jest.fn(),
      });

      fireEvent.dragLeave(uploadArea, {
        preventDefault: jest.fn(),
      });

      expect(uploadArea).not.toHaveClass('border-primary');
      expect(uploadArea).not.toHaveClass('bg-primary/10');
    });

    it(_'should handle file drop events',_async () => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const uploadArea = container.querySelector(
        '[role="button"]',
      ) as HTMLElement;
      const validFile = createMockImageFile('drop-test.jpg');

      await act(_async () => {
        fireEvent.drop(uploadArea, {
          preventDefault: jest.fn(),
          dataTransfer: {
            files: [validFile],
          },
        });
      });

      // Should show upload progress
      await waitFor(_() => {
        expect(screen.getByText('Enviando arquivos...')).toBeInTheDocument();
      });
    });

    it(_'should not handle drop when disabled',_async () => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          disabled={true}
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const uploadArea = container.querySelector(
        '[role="button"]',
      ) as HTMLElement;
      const validFile = createMockImageFile('drop-test.jpg');

      await act(_async () => {
        fireEvent.drop(uploadArea, {
          preventDefault: jest.fn(),
          dataTransfer: {
            files: [validFile],
          },
        });
      });

      // Should not show upload progress
      expect(
        screen.queryByText('Enviando arquivos...'),
      ).not.toBeInTheDocument();
    });
  });

  describe(_'Upload Progress and States',_() => {
    it(_'should show upload progress',_async () => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const validFile = createMockImageFile('progress-test.jpg');
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files: [validFile],
          },
        });
      });

      await waitFor(_() => {
        expect(screen.getByText('Enviando arquivos...')).toBeInTheDocument();
        expect(screen.getByText('progress-test.jpg')).toBeInTheDocument();
      });
    });

    it(_'should show analysis progress',_async () => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const validFile = createMockImageFile('analysis-test.jpg');
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files: [validFile],
          },
        });
      });

      // Wait for upload to complete
      await waitFor(_() => {
        expect(screen.getByText('Analisando com IA...')).toBeInTheDocument();
      });
    });

    it(_'should handle upload errors gracefully',_async () => {
      // Mock upload failure
      global.fetch = jest.fn().mockRejectedValue(new Error('Upload failed'));

      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const validFile = createMockImageFile('error-test.jpg');
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files: [validFile],
          },
        });
      });

      await waitFor(_() => {
        expect(screen.getByText('Erro no upload/análise')).toBeInTheDocument();
      });
    });

    it(_'should show completed photos grid',_async () => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const validFile = createMockImageFile('completed-test.jpg');
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files: [validFile],
          },
        });
      });

      // Wait for upload and analysis to complete
      await waitFor(_() => {
        expect(screen.getByText('Fotos Analisadas')).toBeInTheDocument();
      }, 5000); // Increased timeout for async operations
    });
  });

  describe(_'AI Analysis Integration',_() => {
    it(_'should call AI analysis service with correct parameters',_async () => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
          onAnalysisComplete={mockOnAnalysisComplete}
        />,
      );

      const validFile = createMockImageFile('ai-test.jpg');
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files: [validFile],
          },
        });
      });

      await waitFor(_() => {
        expect(
          MockAestheticAIAnalysisService.prototype.analyzePhoto,
        ).toHaveBeenCalledWith(expect.any(String), 'general');
      });
    });

    it(_'should handle AI analysis failures',_async () => {
      MockAestheticAIAnalysisService.prototype.analyzePhoto = jest
        .fn()
        .mockRejectedValue(new Error('AI analysis failed'));

      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const validFile = createMockImageFile('ai-error-test.jpg');
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files: [validFile],
          },
        });
      });

      await waitFor(_() => {
        expect(screen.getByText('Fotos Analisadas')).toBeInTheDocument();
        // Should still show photos even if analysis failed
      });
    });

    it(_'should display analysis results correctly',_async () => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
          showTreatmentSuggestions={true}
        />,
      );

      const validFile = createMockImageFile('analysis-result.jpg');
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files: [validFile],
          },
        });
      });

      await waitFor(_() => {
        expect(screen.getByText('Confiência:')).toBeInTheDocument();
        expect(screen.getByText('Gravidade:')).toBeInTheDocument();
        expect(screen.getByText('Analisado')).toBeInTheDocument();
      });
    });
  });

  describe(_'Photo Management',_() => {
    it(_'should handle photo removal',_async () => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
          onPhotoRemoved={mockOnPhotoRemoved}
        />,
      );

      const validFile = createMockImageFile('remove-test.jpg');
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files: [validFile],
          },
        });
      });

      // Wait for upload to complete
      await waitFor(_() => {
        expect(screen.getByText('Fotos Analisadas')).toBeInTheDocument();
      }, 5000);

      // Click remove button
      const removeButton = screen.getByRole('button', { name: /Remover/i });
      fireEvent.click(removeButton);

      expect(mockOnPhotoRemoved).toHaveBeenCalled();
    });

    it(_'should show photo details on click',_async () => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const validFile = createMockImageFile('details-test.jpg');
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files: [validFile],
          },
        });
      });

      // Wait for upload to complete
      await waitFor(_() => {
        expect(screen.getByText('Fotos Analisadas')).toBeInTheDocument();
      }, 5000);

      // Click details button
      const detailsButton = screen.getByRole('button', { name: /Detalhes/i });
      fireEvent.click(detailsButton);

      // Should trigger photo selection (modal would be shown in real implementation)
    });
  });

  describe(_'Accessibility',_() => {
    it(_'should be keyboard accessible',_() => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const uploadArea = container.querySelector(
        '[role="button"]',
      ) as HTMLElement;

      // Test Enter key
      fireEvent.keyDown(uploadArea, { key: 'Enter' });
      expect(uploadArea).toHaveFocus();

      // Test Space key
      fireEvent.keyDown(uploadArea, { key: ' ' });
      expect(uploadArea).toHaveFocus();
    });

    it(_'should have proper ARIA labels',_() => {
      render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const uploadArea = screen.getByLabelText(
        'Área de upload de fotos estéticas',
      );
      const fileInput = screen.getByLabelText('Selecionar fotos');

      expect(uploadArea).toBeInTheDocument();
      expect(fileInput).toBeInTheDocument();
    });

    it(_'should maintain focus management',_() => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const uploadArea = container.querySelector(
        '[role="button"]',
      ) as HTMLElement;

      uploadArea.focus();
      expect(uploadArea).toHaveFocus();
    });
  });

  describe(_'Error Handling and Edge Cases',_() => {
    it(_'should handle network errors during upload',_async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const validFile = createMockImageFile('network-error.jpg');
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files: [validFile],
          },
        });
      });

      await waitFor(_() => {
        expect(screen.getByText(/Erro no upload\/análise/)).toBeInTheDocument();
      });
    });

    it(_'should handle corrupted image files',_async () => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      // Mock image loading error
      const mockImage = new Image();
      mockImage.onload = jest.fn();
      mockImage.onerror = jest.fn();
      global.Image = jest.fn().mockImplementation(_() => mockImage);

      const corruptedFile = createMockImageFile('corrupted.jpg');
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files: [corruptedFile],
          },
        });
      });

      // Simulate image loading error
      await act(_async () => {
        mockImage.onerror();
      });

      await waitFor(_() => {
        expect(
          screen.getByText('Arquivo de imagem inválido'),
        ).toBeInTheDocument();
      });
    });

    it(_'should handle empty file list gracefully',_async () => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files: [],
          },
        });
      });

      // Should not show any error or progress
      expect(
        screen.queryByText('Enviando arquivos...'),
      ).not.toBeInTheDocument();
    });
  });

  describe(_'Performance and Memory',_() => {
    it(_'should clean up upload states after completion',_async () => {
      jest.useFakeTimers();

      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const validFile = createMockImageFile('cleanup-test.jpg');
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files: [validFile],
          },
        });
      });

      // Wait for upload to complete
      await waitFor(_() => {
        expect(screen.getByText('Fotos Analisadas')).toBeInTheDocument();
      }, 5000);

      // Fast-forward timers to trigger cleanup
      act(_() => {
        jest.advanceTimersByTime(3000);
      });

      // Upload states should be cleaned up
      expect(
        screen.queryByText('Enviando arquivos...'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Analisando com IA...'),
      ).not.toBeInTheDocument();

      jest.useRealTimers();
    });

    it(_'should handle multiple rapid file selections',_async () => {
      const { container } = render(
        <PhotoUpload
          patientId='test-patient'
          onPhotosUploaded={mockOnPhotosUploaded}
        />,
      );

      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      // Rapid file selections
      await act(_async () => {
        fireEvent.change(input, {
          target: {
            files: [createMockImageFile('rapid1.jpg')],
          },
        });

        fireEvent.change(input, {
          target: {
            files: [createMockImageFile('rapid2.jpg')],
          },
        });
      });

      // Should handle gracefully without errors
      expect(
        screen.queryByText(/Formato não suportado/),
      ).not.toBeInTheDocument();
    });
  });
});
