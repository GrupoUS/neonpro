/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

// Mock dos componentes
jest.mock('../../src/components/aesthetic/photo-upload/PhotoUpload', () => ({
  PhotoUpload: ({ onAnalysisComplete }: any) => (
    <div data-testid="photo-upload">
      <input 
        type="file" 
        data-testid="file-input"
        onChange={(e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            onAnalysisComplete({
              id: 'test-analysis',
              skinType: 'normal',
              concerns: ['fine_lines'],
              confidence: 0.85,
              treatmentSuggestions: [
                {
                  id: 'tx-001',
                  name: 'Botox',
                  confidence: 0.9,
                  estimatedSessions: 1,
                  priceRange: { min: 800, max: 1200 },
                },
              ],
            });
          }
        }}
      />
    </div>
  ),
}));

jest.mock('../../src/components/aesthetic/photo-upload/TreatmentSuggestions', () => ({
  TreatmentSuggestions: ({ suggestions, onTreatmentSelect }: any) => (
    <div data-testid="treatment-suggestions">
      {suggestions.map((s: any) => (
        <div key={s.id} data-testid={`suggestion-${s.id}`}>
          <h3>{s.name}</h3>
          <button onClick={() => onTreatmentSelect(s)}>
            Select Treatment
          </button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('../../src/components/aesthetic/photo-upload/LGPDConsentManager', () => ({
  LGPDConsentManager: ({ onSaveConsent }: any) => (
    <div data-testid="lgpd-consent-manager">
      <button 
        data-testid="consent-button"
        onClick={() => onSaveConsent({ id: 'consent-123', purpose: 'photo_analysis' })}
      >
        Give Consent
      </button>
    </div>
  ),
}));

// Mock do serviço de AI
jest.mock('../../src/services/aesthetic/ai-analysis', () => ({
  AestheticAIAnalysisService: jest.fn().mockImplementation(() => ({
    analyzePhoto: jest.fn().mockResolvedValue({
      skinType: 'normal',
      concerns: ['fine_lines'],
      confidence: 0.85,
    }),
    generateTreatmentSuggestions: jest.fn().mockReturnValue([
      {
        id: 'tx-001',
        name: 'Botox',
        confidence: 0.9,
        estimatedSessions: 1,
        priceRange: { min: 800, max: 1200 },
      },
    ]),
  })),
}));

import { PhotoUploadSystem } from '../../src/components/aesthetic/photo-upload/PhotoUploadSystem';

describe('Photo Upload System Integration Tests', () => {
  const mockUser = {
    id: 'user-123',
    name: 'João Silva',
    email: 'joao@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Fluxo Completo do Sistema', () => {
    it('deve permitir upload de foto, análise e seleção de tratamento', async () => {
      const onTreatmentSelected = jest.fn();
      
      render(<PhotoUploadSystem user={mockUser} onTreatmentSelected={onTreatmentSelected} />);
      
      // 1. Fase de Consentimento LGPD
      const consentButton = screen.getByTestId('consent-button');
      await userEvent.click(consentButton);
      
      // 2. Fase de Upload de Foto
      const fileInput = screen.getByTestId('file-input');
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      await userEvent.upload(fileInput, testFile);
      
      // 3. Aguardar análise
      await waitFor(() => {
        expect(screen.getByTestId('treatment-suggestions')).toBeInTheDocument();
      });
      
      // 4. Selecionar tratamento
      const selectButton = screen.getByRole('button', { name: /select treatment/i });
      await userEvent.click(selectButton);
      
      // 5. Verificar resultado final
      await waitFor(() => {
        expect(onTreatmentSelected).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'tx-001',
            name: 'Botox',
          })
        );
      });
    });

    it('deve validar consentimento antes do upload', async () => {
      render(<PhotoUploadSystem user={mockUser} />);
      
      // Tentar fazer upload sem consentimento
      const uploadArea = screen.queryByTestId('photo-upload');
      expect(uploadArea).not.toBeInTheDocument();
      
      // Consentimento deve estar visível
      expect(screen.getByTestId('lgpd-consent-manager')).toBeInTheDocument();
    });

    it('deve mostrar progresso durante análise', async () => {
      render(<PhotoUploadSystem user={mockUser} />);
      
      // Dar consentimento
      await userEvent.click(screen.getByTestId('consent-button'));
      
      // Iniciar upload
      const fileInput = screen.getByTestId('file-input');
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await userEvent.upload(fileInput, testFile);
      
      // Verificar indicador de progresso
      expect(screen.getByTestId('analysis-progress')).toBeInTheDocument();
      expect(screen.getByText(/analisando imagem/i)).toBeInTheDocument();
    });

    it('deve lidar com erros no processo', async () => {
      const mockAIAnalysis = jest.fn().mockRejectedValue(new Error('Analysis failed'));
      
      // Mock do serviço com erro
      jest.doMock('../../src/services/aesthetic/ai-analysis', () => ({
        AestheticAIAnalysisService: jest.fn().mockImplementation(() => ({
          analyzePhoto: mockAIAnalysis,
        })),
      }));
      
      render(<PhotoUploadSystem user={mockUser} />);
      
      // Dar consentimento
      await userEvent.click(screen.getByTestId('consent-button'));
      
      // Tentar upload
      const fileInput = screen.getByTestId('file-input');
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await userEvent.upload(fileInput, testFile);
      
      // Verificar mensagem de erro
      await waitFor(() => {
        expect(screen.getByText(/falha na análise/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
      });
    });
  });

  describe('Validações de Negócio', () => {
    it('deve validar tipos de arquivo permitidos', async () => {
      render(<PhotoUploadSystem user={mockUser} />);
      
      await userEvent.click(screen.getByTestId('consent-button'));
      
      const fileInput = screen.getByTestId('file-input');
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      await userEvent.upload(fileInput, invalidFile);
      
      expect(screen.getByText(/tipo de arquivo inválido/i)).toBeInTheDocument();
    });

    it('deve validar tamanho máximo do arquivo', async () => {
      render(<PhotoUploadSystem user={mockUser} />);
      
      await userEvent.click(screen.getByTestId('consent-button'));
      
      const fileInput = screen.getByTestId('file-input');
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      
      await userEvent.upload(fileInput, largeFile);
      
      expect(screen.getByText(/arquivo muito grande/i)).toBeInTheDocument();
    });

    it('deve validar confiança mínima da análise', async () => {
      // Mock com baixa confiança
      jest.doMock('../../src/services/aesthetic/ai-analysis', () => ({
        AestheticAIAnalysisService: jest.fn().mockImplementation(() => ({
          analyzePhoto: jest.fn().mockResolvedValue({
            skinType: 'normal',
            concerns: ['fine_lines'],
            confidence: 0.3, // Baixa confiança
          }),
        })),
      }));
      
      render(<PhotoUploadSystem user={mockUser} />);
      
      await userEvent.click(screen.getByTestId('consent-button'));
      
      const fileInput = screen.getByTestId('file-input');
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await userEvent.upload(fileInput, testFile);
      
      await waitFor(() => {
        expect(screen.getByText(/confiança da análise muito baixa/i)).toBeInTheDocument();
        expect(screen.getByText(/por favor, tire outra foto/i)).toBeInTheDocument();
      });
    });

    it('deve validar disponibilidade de tratamentos', async () => {
      // Mock sem sugestões de tratamento
      jest.doMock('../../src/services/aesthetic/ai-analysis', () => ({
        AestheticAIAnalysisService: jest.fn().mockImplementation(() => ({
          analyzePhoto: jest.fn().mockResolvedValue({
            skinType: 'normal',
            concerns: [],
            confidence: 0.9,
          }),
          generateTreatmentSuggestions: jest.fn().mockReturnValue([]),
        })),
      }));
      
      render(<PhotoUploadSystem user={mockUser} />);
      
      await userEvent.click(screen.getByTestId('consent-button'));
      
      const fileInput = screen.getByTestId('file-input');
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await userEvent.upload(fileInput, testFile);
      
      await waitFor(() => {
        expect(screen.getByText(/nenhum tratamento recomendado/i)).toBeInTheDocument();
        expect(screen.getByText(/consulte um especialista/i)).toBeInTheDocument();
      });
    });
  });

  describe('Persistência de Estado', () => {
    it('deve manter estado durante navegação', async () => {
      const { unmount } = render(<PhotoUploadSystem user={mockUser} />);
      
      // Completar primeira fase
      await userEvent.click(screen.getByTestId('consent-button'));
      
      // Desmontar componente
      unmount();
      
      // Remontar
      const { rerender } = render(<PhotoUploadSystem user={mockUser} />);
      
      // Deve manter consentimento
      expect(screen.queryByTestId('lgpd-consent-manager')).not.toBeInTheDocument();
      expect(screen.getByTestId('photo-upload')).toBeInTheDocument();
    });

    it('deve permitir reiniciar o processo', async () => {
      render(<PhotoUploadSystem user={mockUser} />);
      
      // Completar até análise
      await userEvent.click(screen.getByTestId('consent-button'));
      
      const fileInput = screen.getByTestId('file-input');
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await userEvent.upload(fileInput, testFile);
      
      // Reiniciar
      const restartButton = screen.getByRole('button', { name: /reiniciar/i });
      await userEvent.click(restartButton);
      
      // Deve voltar para o início
      expect(screen.getByTestId('lgpd-consent-manager')).toBeInTheDocument();
      expect(screen.queryByTestId('photo-upload')).not.toBeInTheDocument();
    });

    it('deve salvar progresso no localStorage', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      
      render(<PhotoUploadSystem user={mockUser} />);
      
      await userEvent.click(screen.getByTestId('consent-button'));
      
      expect(setItemSpy).toHaveBeenCalledWith(
        'photo-upload-consent',
        expect.any(String)
      );
      
      setItemSpy.mockRestore();
    });
  });

  describe('Integração com Sistemas Externos', () => {
    it('deve integrar com sistema de agendamento', async () => {
      const onScheduleAppointment = jest.fn();
      
      render(
        <PhotoUploadSystem 
          user={mockUser} 
          onScheduleAppointment={onScheduleAppointment} 
        />
      );
      
      // Completar fluxo até seleção de tratamento
      await userEvent.click(screen.getByTestId('consent-button'));
      
      const fileInput = screen.getByTestId('file-input');
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await userEvent.upload(fileInput, testFile);
      
      await waitFor(() => {
        expect(screen.getByTestId('treatment-suggestions')).toBeInTheDocument();
      });
      
      // Clicar para agendar
      const scheduleButton = screen.getByRole('button', { name: /agendar consulta/i });
      await userEvent.click(scheduleButton);
      
      expect(onScheduleAppointment).toHaveBeenCalledWith(
        expect.objectContaining({
          treatment: expect.objectContaining({
            id: 'tx-001',
            name: 'Botox',
          }),
          user: mockUser,
          analysisData: expect.any(Object),
        })
      );
    });

    it('deve enviar eventos de analytics', async () => {
      const mockAnalytics = {
        track: jest.fn(),
      };
      
      render(<PhotoUploadSystem user={mockUser} analytics={mockAnalytics} />);
      
      await userEvent.click(screen.getByTestId('consent-button'));
      
      expect(mockAnalytics.track).toHaveBeenCalledWith(
        'lgpd_consent_given',
        expect.objectContaining({
          userId: mockUser.id,
        })
      );
      
      const fileInput = screen.getByTestId('file-input');
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await userEvent.upload(fileInput, testFile);
      
      expect(mockAnalytics.track).toHaveBeenCalledWith(
        'photo_upload_started',
        expect.any(Object)
      );
    });

    it('deve integrar com prontuário eletrônico', async () => {
      const onSaveToMedicalRecord = jest.fn();
      
      render(
        <PhotoUploadSystem 
          user={mockUser} 
          onSaveToMedicalRecord={onSaveToMedicalRecord} 
        />
      );
      
      // Completar fluxo
      await userEvent.click(screen.getByTestId('consent-button'));
      
      const fileInput = screen.getByTestId('file-input');
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await userEvent.upload(fileInput, testFile);
      
      await waitFor(() => {
        expect(screen.getByTestId('treatment-suggestions')).toBeInTheDocument();
      });
      
      // Salvar no prontuário
      const saveButton = screen.getByRole('button', { name: /salvar no prontuário/i });
      await userEvent.click(saveButton);
      
      expect(onSaveToMedicalRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId: mockUser.id,
          analysis: expect.any(Object),
          consent: expect.any(Object),
          timestamp: expect.any(Date),
        })
      );
    });
  });

  describe('Acessibilidade', () => {
    it('deve não ter violações de acessibilidade', async () => {
      const { container } = render(<PhotoUploadSystem user={mockUser} />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('deve ter navegação por teclado completa', async () => {
      render(<PhotoUploadSystem user={mockUser} />);
      
      // Navegar por todos os elementos interativos
      let currentElement = document.body;
      
      while (currentElement) {
        currentElement = currentElement.nextElementSibling;
        if (currentElement && (currentElement as HTMLElement).tabIndex >= 0) {
          await userEvent.tab();
          expect(currentElement).toHaveFocus();
        }
      }
    });

    it('deve anunciar mudanças de estado para leitores de tela', async () => {
      render(<PhotoUploadSystem user={mockUser} />);
      
      const statusRegion = screen.getByRole('status');
      
      await userEvent.click(screen.getByTestId('consent-button'));
      
      expect(statusRegion).toHaveTextContent(/consentimento concedido/i);
    });

    it('deve ter textos alternativos para imagens', async () => {
      render(<PhotoUploadSystem user={mockUser} />);
      
      await userEvent.click(screen.getByTestId('consent-button'));
      
      const fileInput = screen.getByTestId('file-input');
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await userEvent.upload(fileInput, testFile);
      
      await waitFor(() => {
        const image = screen.getByAltText(/foto enviada para análise/i);
        expect(image).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('deve carregar componentes lazy-loaded', async () => {
      const startTime = performance.now();
      
      render(<PhotoUploadSystem user={mockUser} />);
      
      const endTime = performance.now();
      
      // Deve carregar rapidamente
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('deve otimizar imagens para upload', async () => {
      render(<PhotoUploadSystem user={mockUser} />);
      
      await userEvent.click(screen.getByTestId('consent-button'));
      
      const fileInput = screen.getByTestId('file-input');
      const largeFile = new File(['x'.repeat(5 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      
      await userEvent.upload(fileInput, largeFile);
      
      // Deve otimizar antes de enviar
      expect(screen.getByText(/otimizando imagem/i)).toBeInTheDocument();
    });

    it('deve implementar retry automático para falhas', async () => {
      // Mock que falha 2 vezes e depois succeeds
      let attemptCount = 0;
      const mockAIAnalysis = jest.fn()
        .mockImplementationOnce(() => Promise.reject(new Error('Network error')))
        .mockImplementationOnce(() => Promise.reject(new Error('Timeout')))
        .mockImplementationOnce(() => Promise.resolve({
          skinType: 'normal',
          concerns: ['fine_lines'],
          confidence: 0.85,
        }));
      
      jest.doMock('../../src/services/aesthetic/ai-analysis', () => ({
        AestheticAIAnalysisService: jest.fn().mockImplementation(() => ({
          analyzePhoto: mockAIAnalysis,
        })),
      }));
      
      render(<PhotoUploadSystem user={mockUser} />);
      
      await userEvent.click(screen.getByTestId('consent-button'));
      
      const fileInput = screen.getByTestId('file-input');
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await userEvent.upload(fileInput, testFile);
      
      // Deve mostrar tentativas de retry
      expect(screen.getByText(/tentativa 1 de 3/i)).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('treatment-suggestions')).toBeInTheDocument();
      });
      
      expect(mockAIAnalysis).toHaveBeenCalledTimes(3);
    });
  });

  describe('Segurança e Privacidade', () => {
    it('deve criptografar dados sensíveis', async () => {
      const mockEncrypt = jest.fn().mockReturnValue('encrypted-data');
      
      render(
        <PhotoUploadSystem 
          user={mockUser} 
          encryptionService={{ encrypt: mockEncrypt } as any} 
        />
      );
      
      await userEvent.click(screen.getByTestId('consent-button'));
      
      const fileInput = screen.getByTestId('file-input');
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await userEvent.upload(fileInput, testFile);
      
      expect(mockEncrypt).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          dataType: 'photo_analysis',
        })
      );
    });

    it('deve não armazenar fotos após análise', async () => {
      const URL.createObjectURL = jest.fn().mockReturnValue('blob:test');
      const URL.revokeObjectURL = jest.fn();
      
      global.URL.createObjectURL = URL.createObjectURL;
      global.URL.revokeObjectURL = URL.revokeObjectURL;
      
      render(<PhotoUploadSystem user={mockUser} />);
      
      await userEvent.click(screen.getByTestId('consent-button'));
      
      const fileInput = screen.getByTestId('file-input');
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await userEvent.upload(fileInput, testFile);
      
      await waitFor(() => {
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
      });
    });

    it('deve validar permissões do usuário', async () => {
      const userWithoutPermission = {
        ...mockUser,
        permissions: [],
      };
      
      render(<PhotoUploadSystem user={userWithoutPermission} />);
      
      expect(screen.getByText(/você não tem permissão/i)).toBeInTheDocument();
      expect(screen.getByText(/contate o administrador/i)).toBeInTheDocument();
    });
  });

  describe('Testes de Carga', () => {
    it('deve lidar com múltiplos uploads simultâneos', async () => {
      render(<PhotoUploadSystem user={mockUser} />);
      
      await userEvent.click(screen.getByTestId('consent-button'));
      
      // Simular múltiplos uploads
      const fileInput = screen.getByTestId('file-input');
      const files = Array.from({ length: 5 }, (_, i) => 
        new File([`test${i}`], `test${i}.jpg`, { type: 'image/jpeg' })
      );
      
      await userEvent.upload(fileInput, ...files);
      
      // Deve gerenciar fila de uploads
      expect(screen.getByText(/processando 5 imagens/i)).toBeInTheDocument();
    });

    it('deve limitar número de uploads simultâneos', async () => {
      render(<PhotoUploadSystem user={mockUser} maxConcurrentUploads={2} />);
      
      await userEvent.click(screen.getByTestId('consent-button'));
      
      const fileInput = screen.getByTestId('file-input');
      const files = Array.from({ length: 5 }, (_, i) => 
        new File([`test${i}`], `test${i}.jpg`, { type: 'image/jpeg' })
      );
      
      await userEvent.upload(fileInput, ...files);
      
      // Deve mostrar limite atingido
      expect(screen.getByText(/limite de uploads simultâneos atingido/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com perda de conexão', async () => {
      // Simular offline
      Object.defineProperty(navigator, 'onLine', {
        get: () => false,
        configurable: true,
      });
      
      render(<PhotoUploadSystem user={mockUser} />);
      
      expect(screen.getByText(/modo offline/i)).toBeInTheDocument();
      expect(screen.getByText(/verifique sua conexão/i)).toBeInTheDocument();
    });

    it('deve lidar com timeout do servidor', async () => {
      // Mock que nunca responde
      const mockAIAnalysis = jest.fn().mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      
      jest.doMock('../../src/services/aesthetic/ai-analysis', () => ({
        AestheticAIAnalysisService: jest.fn().mockImplementation(() => ({
          analyzePhoto: mockAIAnalysis,
        })),
      }));
      
      render(<PhotoUploadSystem user={mockUser} />);
      
      await userEvent.click(screen.getByTestId('consent-button'));
      
      const fileInput = screen.getByTestId('file-input');
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await userEvent.upload(fileInput, testFile);
      
      // Deve mostrar timeout após algum tempo
      await waitFor(() => {
        expect(screen.getByText(/o servidor demorou muito para responder/i)).toBeInTheDocument();
      }, { timeout: 6000 });
    });

    it('deve recuperar estado após刷新 da página', async () => {
      const mockStorage = {
        consent: { id: 'consent-123', timestamp: Date.now() },
        uploadState: { step: 'upload', data: {} },
      };
      
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
        if (key === 'photo-upload-state') {
          return JSON.stringify(mockStorage);
        }
        return null;
      });
      
      render(<PhotoUploadSystem user={mockUser} />);
      
      // Deve recuperar estado anterior
      expect(screen.queryByTestId('lgpd-consent-manager')).not.toBeInTheDocument();
      expect(screen.getByTestId('photo-upload')).toBeInTheDocument();
    });
  });
});