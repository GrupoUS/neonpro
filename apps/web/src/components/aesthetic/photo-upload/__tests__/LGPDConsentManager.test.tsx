/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import React from 'react';
import { LGPDConsentData } from '../LGPDConsentManager';

// Mock do hook de consentimento
jest.mock(_'../hooks/useLGPDConsent',_() => ({
  useLGPDConsent: () => ({
    consentData: null,
    saveConsent: jest.fn(),
    updateConsent: jest.fn(),
    withdrawConsent: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));

// Mock do componente de criptografia
jest.mock(_'../EncryptionStatus',_() => ({
  EncryptionStatus: ({ isEncrypted }: { isEncrypted: boolean }) => (
    <div data-testid='encryption-status' data-encrypted={isEncrypted}>
      {isEncrypted ? 'Criptografado' : 'Não criptografado'}
    </div>
  ),
}));

describe(_'LGPDConsentManager Component',_() => {
  const mockSaveConsent = jest.fn();
  const mockUpdateConsent = jest.fn();
  const mockWithdrawConsent = jest.fn();

  const mockConsentData: LGPDConsentData = {
    id: 'consent-001',
    _userId: 'user-123',
    consentType: 'photo_analysis',
    purpose: 'Análise estética por IA',
    dataCategories: ['photos', 'biometric_data'],
    retentionPeriod: 365,
    sharedWith: ['ai_service_provider'],
    automatedDecision: true,
    legalBasis: 'consent',
    consentDate: new Date(),
    lastModified: new Date(),
    version: '1.0',
    status: 'active',
    withdrawalAllowed: true,
    granularConsents: {
      storage: true,
      analysis: true,
      sharing: false,
      retention: true,
    },
    dataSubjectRights: {
      access: true,
      rectification: true,
      erasure: true,
      restriction: true,
      portability: true,
      objection: true,
    },
  };

  beforeEach(_() => {
    jest.clearAllMocks();
  });

  describe(_'Renderização Inicial',_() => {
    it(_'deve renderizar o componente vazio',_() => {
      render(<LGPDConsentManager />);

      expect(
        screen.getByText('Gerenciamento de Consentimento LGPD'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Nenhum consentimento registrado/i),
      ).toBeInTheDocument();
    });

    it(_'deve renderizar com dados de consentimento',_() => {
      render(<LGPDConsentManager consentData={mockConsentData} />);

      expect(screen.getByText('Consentimento Ativo')).toBeInTheDocument();
      expect(screen.getByText('Análise estética por IA')).toBeInTheDocument();
      expect(screen.getByText('photos, biometric_data')).toBeInTheDocument();
    });

    it(_'deve mostrar estado de loading',_() => {
      render(<LGPDConsentManager isLoading={true} />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(
        screen.getByText('Carregando dados de consentimento...'),
      ).toBeInTheDocument();
    });

    it(_'deve mostrar mensagem de erro',_() => {
      const errorMessage = 'Erro ao carregar consentimento';
      render(<LGPDConsentManager error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /tentar novamente/i }),
      ).toBeInTheDocument();
    });

    it(_'deve mostrar consentimento expirado',_() => {
      const expiredConsent = {
        ...mockConsentData,
        status: 'expired' as const,
      };

      render(<LGPDConsentManager consentData={expiredConsent} />);

      expect(screen.getByText('Consentimento Expirado')).toBeInTheDocument();
      expect(
        screen.getByText(/Seu consentimento expirou e precisa ser renovado/i),
      ).toBeInTheDocument();
    });

    it(_'deve mostrar consentimento revogado',_() => {
      const revokedConsent = {
        ...mockConsentData,
        status: 'withdrawn' as const,
      };

      render(<LGPDConsentManager consentData={revokedConsent} />);

      expect(screen.getByText('Consentimento Revogado')).toBeInTheDocument();
      expect(
        screen.getByText(/Você revogou seu consentimento/i),
      ).toBeInTheDocument();
    });
  });

  describe(_'Formulário de Consentimento',_() => {
    it(_'deve mostrar formulário para novo consentimento',_async () => {
      render(<LGPDConsentManager />);

      const newConsentButton = screen.getByRole('button', {
        name: /novo consentimento/i,
      });
      await userEvent.click(newConsentButton);

      expect(screen.getByText('Novo Consentimento')).toBeInTheDocument();
      expect(screen.getByLabelText(/finalidade/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/categorias de dados/i)).toBeInTheDocument();
    });

    it(_'deve permitir selecionar finalidade',_async () => {
      render(<LGPDConsentManager />);

      await userEvent.click(
        screen.getByRole('button', { name: /novo consentimento/i }),
      );

      const purposeSelect = screen.getByLabelText(/finalidade/i);
      await userEvent.selectOptions(purposeSelect, 'photo_analysis');

      expect(purposeSelect).toHaveValue('photo_analysis');
    });

    it(_'deve permitir selecionar múltiplas categorias de dados',_async () => {
      render(<LGPDConsentManager />);

      await userEvent.click(
        screen.getByRole('button', { name: /novo consentimento/i }),
      );

      const photosCheckbox = screen.getByLabelText(/fotos/i);
      const biometricCheckbox = screen.getByLabelText(/dados biométricos/i);

      await userEvent.click(photosCheckbox);
      await userEvent.click(biometricCheckbox);

      expect(photosCheckbox).toBeChecked();
      expect(biometricCheckbox).toBeChecked();
    });

    it(_'deve permitir definir período de retenção',_async () => {
      render(<LGPDConsentManager />);

      await userEvent.click(
        screen.getByRole('button', { name: /novo consentimento/i }),
      );

      const retentionInput = screen.getByLabelText(
        /período de retenção \(dias\)/i,
      );
      await userEvent.type(retentionInput, '365');

      expect(retentionInput).toHaveValue(365);
    });

    it(_'deve permitir selecionar base legal',_async () => {
      render(<LGPDConsentManager />);

      await userEvent.click(
        screen.getByRole('button', { name: /novo consentimento/i }),
      );

      const legalBasisSelect = screen.getByLabelText(/base legal/i);
      await userEvent.selectOptions(legalBasisSelect, 'consent');

      expect(legalBasisSelect).toHaveValue('consent');
    });
  });

  describe(_'Consentimento Granular',_() => {
    it(_'deve mostrar opções de consentimento granular',_async () => {
      render(<LGPDConsentManager />);

      await userEvent.click(
        screen.getByRole('button', { name: /novo consentimento/i }),
      );

      expect(screen.getByLabelText(/armazenamento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/análise/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/compartilhamento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/retenção/i)).toBeInTheDocument();
    });

    it(_'deve permitir consentimento seletivo',_async () => {
      render(<LGPDConsentManager />);

      await userEvent.click(
        screen.getByRole('button', { name: /novo consentimento/i }),
      );

      const storageConsent = screen.getByLabelText(/armazenamento/i);
      const analysisConsent = screen.getByLabelText(/análise/i);
      const sharingConsent = screen.getByLabelText(/compartilhamento/i);

      await userEvent.click(storageConsent);
      await userEvent.click(analysisConsent);
      // Deixar compartilhamento desmarcado

      expect(storageConsent).toBeChecked();
      expect(analysisConsent).toBeChecked();
      expect(sharingConsent).not.toBeChecked();
    });

    it(_'deve mostrar explicações para cada tipo de consentimento',_async () => {
      render(<LGPDConsentManager />);

      await userEvent.click(
        screen.getByRole('button', { name: /novo consentimento/i }),
      );

      const infoButtons = screen.getAllByRole('button', {
        name: /informação/i,
      });

      await userEvent.click(infoButtons[0]); // Info de armazenamento

      expect(
        screen.getByText(/Seus dados serão armazenados de forma segura/i),
      ).toBeInTheDocument();
    });
  });

  describe(_'Submissão do Formulário',_() => {
    it(_'deve validar campos obrigatórios',_async () => {
      render(<LGPDConsentManager onSaveConsent={mockSaveConsent} />);

      await userEvent.click(
        screen.getByRole('button', { name: /novo consentimento/i }),
      );

      const submitButton = screen.getByRole('button', {
        name: /salvar consentimento/i,
      });
      await userEvent.click(submitButton);

      expect(screen.getByText(/finalidade é obrigatória/i)).toBeInTheDocument();
      expect(
        screen.getByText(/selecione pelo menos uma categoria de dados/i),
      ).toBeInTheDocument();
      expect(mockSaveConsent).not.toHaveBeenCalled();
    });

    it(_'deve chamar onSaveConsent com dados corretos',_async () => {
      render(<LGPDConsentManager onSaveConsent={mockSaveConsent} />);

      await userEvent.click(
        screen.getByRole('button', { name: /novo consentimento/i }),
      );

      // Preencher formulário
      await userEvent.selectOptions(
        screen.getByLabelText(/finalidade/i),
        'photo_analysis',
      );
      await userEvent.click(screen.getByLabelText(/fotos/i));
      await userEvent.click(screen.getByLabelText(/dados biométricos/i));
      await userEvent.type(
        screen.getByLabelText(/período de retenção \(dias\)/i),
        '365',
      );
      await userEvent.selectOptions(
        screen.getByLabelText(/base legal/i),
        'consent',
      );

      const submitButton = screen.getByRole('button', {
        name: /salvar consentimento/i,
      });
      await userEvent.click(submitButton);

      expect(mockSaveConsent).toHaveBeenCalledWith(
        expect.objectContaining({
          consentType: 'photo_analysis',
          purpose: 'photo_analysis',
          dataCategories: ['photos', 'biometric_data'],
          retentionPeriod: 365,
          legalBasis: 'consent',
        }),
      );
    });

    it(_'deve mostrar confirmação antes de salvar',_async () => {
      render(<LGPDConsentManager onSaveConsent={mockSaveConsent} />);

      await userEvent.click(
        screen.getByRole('button', { name: /novo consentimento/i }),
      );

      // Preencher formulário
      await userEvent.selectOptions(
        screen.getByLabelText(/finalidade/i),
        'photo_analysis',
      );
      await userEvent.click(screen.getByLabelText(/fotos/i));
      await userEvent.type(
        screen.getByLabelText(/período de retenção \(dias\)/i),
        '365',
      );

      const submitButton = screen.getByRole('button', {
        name: /salvar consentimento/i,
      });
      await userEvent.click(submitButton);

      expect(screen.getByText(/confirmar consentimento/i)).toBeInTheDocument();
      expect(
        screen.getByText(/tem certeza que deseja conceder consentimento/i),
      ).toBeInTheDocument();
    });

    it(_'deve mostrar sucesso após salvar',_async () => {
      mockSaveConsent.mockResolvedValueOnce(mockConsentData);

      render(<LGPDConsentManager onSaveConsent={mockSaveConsent} />);

      await userEvent.click(
        screen.getByRole('button', { name: /novo consentimento/i }),
      );

      // Preencher formulário mínimo
      await userEvent.selectOptions(
        screen.getByLabelText(/finalidade/i),
        'photo_analysis',
      );
      await userEvent.click(screen.getByLabelText(/fotos/i));

      const submitButton = screen.getByRole('button', {
        name: /salvar consentimento/i,
      });
      await userEvent.click(submitButton);

      // Confirmar
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      await userEvent.click(confirmButton);

      await waitFor(_() => {
        expect(
          screen.getByText('Consentimento salvo com sucesso!'),
        ).toBeInTheDocument();
      });
    });
  });

  describe(_'Gerenciamento de Consentimento Existente',_() => {
    it(_'deve permitir visualizar detalhes do consentimento',_async () => {
      render(<LGPDConsentManager consentData={mockConsentData} />);

      const viewDetailsButton = screen.getByRole('button', {
        name: /ver detalhes/i,
      });
      await userEvent.click(viewDetailsButton);

      expect(screen.getByText('Detalhes do Consentimento')).toBeInTheDocument();
      expect(screen.getByText(mockConsentData.purpose)).toBeInTheDocument();
      expect(
        screen.getByText(mockConsentData.dataCategories.join(', ')),
      ).toBeInTheDocument();
    });

    it(_'deve permitir editar consentimento',_async () => {
      render(
        <LGPDConsentManager
          consentData={mockConsentData}
          onUpdateConsent={mockUpdateConsent}
        />,
      );

      const editButton = screen.getByRole('button', { name: /editar/i });
      await userEvent.click(editButton);

      expect(screen.getByText('Editar Consentimento')).toBeInTheDocument();

      // Modificar período de retenção
      const retentionInput = screen.getByLabelText(
        /período de retenção \(dias\)/i,
      );
      await userEvent.clear(retentionInput);
      await userEvent.type(retentionInput, '180');

      const saveButton = screen.getByRole('button', {
        name: /salvar alterações/i,
      });
      await userEvent.click(saveButton);

      expect(mockUpdateConsent).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockConsentData,
          retentionPeriod: 180,
        }),
      );
    });

    it(_'deve permitir revogar consentimento',_async () => {
      render(
        <LGPDConsentManager
          consentData={mockConsentData}
          onWithdrawConsent={mockWithdrawConsent}
        />,
      );

      const withdrawButton = screen.getByRole('button', {
        name: /revogar consentimento/i,
      });
      await userEvent.click(withdrawButton);

      expect(screen.getByText(/revogar consentimento/i)).toBeInTheDocument();
      expect(
        screen.getByText(/tem certeza que deseja revogar/i),
      ).toBeInTheDocument();

      const confirmWithdrawButton = screen.getByRole('button', {
        name: /sim, revogar/i,
      });
      await userEvent.click(confirmWithdrawButton);

      expect(mockWithdrawConsent).toHaveBeenCalledWith(mockConsentData.id);
    });

    it(_'deve permitir solicitar acesso aos dados',_async () => {
      const onRequestDataAccess = jest.fn();
      render(
        <LGPDConsentManager
          consentData={mockConsentData}
          onRequestDataAccess={onRequestDataAccess}
        />,
      );

      const accessButton = screen.getByRole('button', {
        name: /acessar meus dados/i,
      });
      await userEvent.click(accessButton);

      expect(onRequestDataAccess).toHaveBeenCalledWith(mockConsentData.id);
    });

    it(_'deve permitir solicitar exclusão dos dados',_async () => {
      const onRequestDataDeletion = jest.fn();
      render(
        <LGPDConsentManager
          consentData={mockConsentData}
          onRequestDataDeletion={onRequestDataDeletion}
        />,
      );

      const deleteButton = screen.getByRole('button', {
        name: /excluir meus dados/i,
      });
      await userEvent.click(deleteButton);

      expect(screen.getByText(/excluir dados/i)).toBeInTheDocument();
      expect(screen.getByText(/esta ação é irreversível/i)).toBeInTheDocument();

      const confirmDeleteButton = screen.getByRole('button', {
        name: /sim, excluir/i,
      });
      await userEvent.click(confirmDeleteButton);

      expect(onRequestDataDeletion).toHaveBeenCalledWith(mockConsentData.id);
    });
  });

  describe(_'Direitos do Titular',_() => {
    it(_'deve listar todos os direitos disponíveis',_() => {
      render(<LGPDConsentManager consentData={mockConsentData} />);

      expect(screen.getByText(/Direitos do Titular/i)).toBeInTheDocument();
      expect(screen.getByText(/Acesso/i)).toBeInTheDocument();
      expect(screen.getByText('Retificação')).toBeInTheDocument();
      expect(screen.getByText('Eliminação')).toBeInTheDocument();
      expect(screen.getByText('Portabilidade')).toBeInTheDocument();
    });

    it(_'deve mostrar status de cada direito',_() => {
      render(<LGPDConsentManager consentData={mockConsentData} />);

      expect(screen.getByText('Acesso: Disponível')).toBeInTheDocument();
      expect(screen.getByText('Retificação: Disponível')).toBeInTheDocument();
      expect(screen.getByText('Eliminação: Disponível')).toBeInTheDocument();
    });

    it(_'deve permitir exercer direitos através de botões',_async () => {
      const onExerciseRight = jest.fn();
      render(
        <LGPDConsentManager
          consentData={mockConsentData}
          onExerciseRight={onExerciseRight}
        />,
      );

      const accessButton = screen.getByRole('button', {
        name: /solicitar acesso/i,
      });
      await userEvent.click(accessButton);

      expect(onExerciseRight).toHaveBeenCalledWith(
        'access',
        mockConsentData.id,
      );
    });
  });

  describe(_'Audit Trail',_() => {
    it(_'deve mostrar histórico de alterações',_async () => {
      const auditTrail = [
        {
          timestamp: new Date(),
          action: 'created',
          details: 'Consentimento criado',
          user: 'user-123',
        },
        {
          timestamp: new Date(),
          action: 'modified',
          details: 'Período de retenção alterado',
          user: 'user-123',
        },
      ];

      render(
        <LGPDConsentManager
          consentData={mockConsentData}
          auditTrail={auditTrail}
        />,
      );

      const auditButton = screen.getByRole('button', { name: /histórico/i });
      await userEvent.click(auditButton);

      expect(screen.getByText('Histórico de Alterações')).toBeInTheDocument();
      expect(screen.getByText('Consentimento criado')).toBeInTheDocument();
      expect(
        screen.getByText('Período de retenção alterado'),
      ).toBeInTheDocument();
    });

    it(_'deve mostrar detalhes de cada entrada do audit trail',_async () => {
      const auditTrail = [
        {
          timestamp: new Date('2024-01-01T10:00:00'),
          action: 'created',
          details: 'Consentimento criado',
          user: 'user-123',
          ipAddress: '192.168.1.1',
        },
      ];

      render(
        <LGPDConsentManager
          consentData={mockConsentData}
          auditTrail={auditTrail}
        />,
      );

      await userEvent.click(screen.getByRole('button', { name: /histórico/i }));

      expect(screen.getByText('01/01/2024 10:00:00')).toBeInTheDocument();
      expect(screen.getByText('Consentimento criado')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
    });
  });

  describe(_'Criptografia e Segurança',_() => {
    it(_'deve mostrar status de criptografia',_() => {
      render(
        <LGPDConsentManager consentData={mockConsentData} isEncrypted={true} />,
      );

      const encryptionStatus = screen.getByTestId('encryption-status');
      expect(encryptionStatus).toBeInTheDocument();
      expect(encryptionStatus).toHaveAttribute('data-encrypted', 'true');
    });

    it(_'deve mostrar detalhes de criptografia',_async () => {
      render(
        <LGPDConsentManager
          consentData={mockConsentData}
          encryptionDetails='AES-256'
        />,
      );

      await userEvent.click(
        screen.getByRole('button', { name: /detalhes de segurança/i }),
      );

      expect(screen.getByText('Detalhes de Criptografia')).toBeInTheDocument();
      expect(screen.getByText('AES-256')).toBeInTheDocument();
    });

    it(_'deve mostrar alerta se não criptografado',_() => {
      render(
        <LGPDConsentManager
          consentData={mockConsentData}
          isEncrypted={false}
        />,
      );

      expect(
        screen.getByText(/atenção: dados não criptografados/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/seus dados estão vulneráveis/i),
      ).toBeInTheDocument();
    });
  });

  describe(_'Acessibilidade',_() => {
    it(_'deve não ter violações de acessibilidade',_async () => {
      const { container } = render(<LGPDConsentManager />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it(_'deve ter landmarks ARIA corretos',_() => {
      render(<LGPDConsentManager />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(
        screen.getByRole('complementary', { name: /direitos do titular/i }),
      ).toBeInTheDocument();
    });

    it(_'deve ter labels associativas corretas',_() => {
      render(<LGPDConsentManager />);

      const purposeSelect = screen.getByLabelText(/finalidade/i);
      expect(purposeSelect).toBeInTheDocument();

      const retentionInput = screen.getByLabelText(
        /período de retenção \(dias\)/i,
      );
      expect(retentionInput).toBeInTheDocument();
    });

    it(_'deve suportar navegação por teclado',_async () => {
      render(<LGPDConsentManager />);

      const button = screen.getByRole('button', {
        name: /novo consentimento/i,
      });

      // Navegação por tab
      await userEvent.tab();
      expect(button).toHaveFocus();

      // Ativação por espaço
      await userEvent.type(button, ' ');

      expect(screen.getByText('Novo Consentimento')).toBeInTheDocument();
    });

    it(_'deve ter anúncios ARIA live region',_async () => {
      render(<LGPDConsentManager />);

      // Simular mensagem de status
      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toBeInTheDocument();

      // Mensagem deve ser anunciada para leitores de tela
      await userEvent.click(
        screen.getByRole('button', { name: /novo consentimento/i }),
      );

      expect(statusRegion).toHaveTextContent('');
    });
  });

  describe(_'Responsividade',_() => {
    it(_'deve renderizar corretamente em mobile',_() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<LGPDConsentManager consentData={mockConsentData} />);

      const mobileContainer = screen.getByTestId('mobile-container');
      expect(mobileContainer).toBeInTheDocument();

      // Botões devem estar empilhados verticalmente
      const buttons = screen.getAllByRole('button');
      buttons.forEach(_button => {
        expect(button).toHaveClass('mobile-button');
      });
    });

    it(_'deve renderizar corretamente em desktop',_() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<LGPDConsentManager consentData={mockConsentData} />);

      const desktopContainer = screen.getByTestId('desktop-container');
      expect(desktopContainer).toBeInTheDocument();
    });
  });

  describe(_'Performance',_() => {
    it(_'deve carregar rapidamente com audit trail grande',_() => {
      const largeAuditTrail = Array.from({ length: 100 },_(_,_i) => ({
        timestamp: new Date(),
        action: 'modified',
        details: `Alteração ${i}`,
        user: 'user-123',
      }));

      const startTime = performance.now();
      render(
        <LGPDConsentManager
          consentData={mockConsentData}
          auditTrail={largeAuditTrail}
        />,
      );
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });

    it(_'deve virtualizar lista de direitos quando houver muitos',_() => {
      render(<LGPDConsentManager consentData={mockConsentData} />);

      const rightsList = screen.getByTestId('rights-list');
      expect(rightsList).toBeInTheDocument();
    });
  });

  describe(_'Testes de Integração',_() => {
    it(_'deve integrar com sistema de autenticação',_() => {
      const user = {
        id: 'user-123',
        name: 'João Silva',
        email: 'joao@example.com',
      };

      render(<LGPDConsentManager consentData={mockConsentData} user={user} />);

      expect(screen.getByText(`Titular: ${user.name}`)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
    });

    it(_'deve enviar eventos de analytics',_() => {
      const mockAnalytics = {
        track: jest.fn(),
      };

      render(<LGPDConsentManager analytics={mockAnalytics} />);

      // Simular interação
      fireEvent.click(
        screen.getByRole('button', { name: /novo consentimento/i }),
      );

      expect(mockAnalytics.track).toHaveBeenCalledWith(
        'lgpd_consent_started',
        expect.any(Object),
      );
    });

    it(_'deve respeitar preferências de idioma',_() => {
      render(
        <LGPDConsentManager consentData={mockConsentData} language='pt-BR' />,
      );

      expect(
        screen.getByText('Gerenciamento de Consentimento LGPD'),
      ).toBeInTheDocument();
    });
  });

  describe(_'Edge Cases',_() => {
    it(_'deve lidar com dados de consentimento inválidos',_() => {
      const invalidConsent = {
        ...mockConsentData,
        consentDate: 'invalid-date' as any,
      };

      render(<LGPDConsentManager consentData={invalidConsent as any} />);

      expect(screen.getByText(/data inválida/i)).toBeInTheDocument();
    });

    it(_'deve lidar com falha na revogação',_async () => {
      mockWithdrawConsent.mockRejectedValueOnce(
        new Error('Falha na revogação'),
      );

      render(
        <LGPDConsentManager
          consentData={mockConsentData}
          onWithdrawConsent={mockWithdrawConsent}
        />,
      );

      await userEvent.click(
        screen.getByRole('button', { name: /revogar consentimento/i }),
      );
      await userEvent.click(
        screen.getByRole('button', { name: /sim, revogar/i }),
      );

      await waitFor(_() => {
        expect(screen.getByText('Falha na revogação')).toBeInTheDocument();
      });
    });

    it(_'deve lidar com desconexão de rede',_async () => {
      render(<LGPDConsentManager isOnline={false} />);

      expect(screen.getByText(/modo offline/i)).toBeInTheDocument();
      expect(
        screen.getByText(/algumas funcionalidades podem estar limitadas/i),
      ).toBeInTheDocument();
    });

    it(_'deve lidar com consentimento sem data de expiração',_() => {
      const consentWithoutExpiry = {
        ...mockConsentData,
        retentionPeriod: undefined,
      };

      render(<LGPDConsentManager consentData={consentWithoutExpiry} />);

      expect(
        screen.getByText(/período de retenção não definido/i),
      ).toBeInTheDocument();
    });
  });

  describe(_'Conformidade LGPD',_() => {
    it(_'deve mostrar todos os requisitos LGPD',_() => {
      render(<LGPDConsentManager consentData={mockConsentData} />);

      expect(
        screen.getByText(/Lei Geral de Proteção de Dados/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Base Legal/i)).toBeInTheDocument();
      expect(screen.getByText(/Direitos do Titular/i)).toBeInTheDocument();
    });

    it(_'deve garantir que consentimento seja informado',_async () => {
      render(<LGPDConsentManager />);

      await userEvent.click(
        screen.getByRole('button', { name: /novo consentimento/i }),
      );

      expect(screen.getByText(/informações importantes/i)).toBeInTheDocument();
      expect(
        screen.getByText(/seus dados serão utilizados para/i),
      ).toBeInTheDocument();
    });

    it(_'deve garantir que consentimento seja inequívoco',_async () => {
      render(<LGPDConsentManager />);

      await userEvent.click(
        screen.getByRole('button', { name: /novo consentimento/i }),
      );

      const consentCheckbox = screen.getByLabelText(
        /declaro que li e concordo/i,
      );
      expect(consentCheckbox).toBeInTheDocument();

      // Não deve permitir submeter sem marcar
      const submitButton = screen.getByRole('button', {
        name: /salvar consentimento/i,
      });
      await userEvent.click(submitButton);

      expect(
        screen.getByText(/você precisa concordar com os termos/i),
      ).toBeInTheDocument();
    });

    it(_'deve permitir retirada do consentimento a qualquer momento',_() => {
      render(<LGPDConsentManager consentData={mockConsentData} />);

      const withdrawButton = screen.getByRole('button', {
        name: /revogar consentimento/i,
      });
      expect(withdrawButton).toBeInTheDocument();
      expect(withdrawButton).toBeEnabled();
    });
  });
});
