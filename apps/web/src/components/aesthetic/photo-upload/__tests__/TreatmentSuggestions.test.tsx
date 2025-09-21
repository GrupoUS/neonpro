/**
 * @jest-environment jsdom
 */

import { formatCurrency } from '@/lib/utils/format';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';
import { TreatmentSuggestion } from '../TreatmentSuggestions';

// Mock dos utilitários
jest.mock('@/lib/utils/format', () => ({
  formatCurrency: (value: number) => `R$ ${value.toFixed(2)}`,
}));

// Mock do componente de confiança
jest.mock('../TrustBadge', () => ({
  TrustBadge: ({ confidence }: { confidence: number }) => (
    <div data-testid='trust-badge' data-confidence={confidence}>
      Confidence: {confidence}%
    </div>
  ),
}));

describe('TreatmentSuggestions Component', () => {
  const mockSuggestions: TreatmentSuggestion[] = [
    {
      id: 'tx-001',
      name: 'Toxina Botulínica',
      category: 'preenchimento',
      confidence: 0.92,
      description: 'Redução de rugas dinâmicas',
      estimatedSessions: 1,
      sessionDuration: 30,
      resultsDuration: 180,
      priceRange: { min: 800, max: 1200 },
      benefits: ['Rápida recuperação', 'Resultados naturais'],
      considerations: ['Evitar exercícios físicos por 24h'],
      suitabilityScore: 0.95,
      alternatives: ['Ácido Hialurônico', 'Laser'],
      healthcareConsiderations: [
        {
          condition: 'gravidez',
          recommendation: 'contraindicated',
          reason: 'Risco teórico para o feto',
        },
      ],
    },
    {
      id: 'tx-002',
      name: 'Ácido Hialurônico',
      category: 'preenchimento',
      confidence: 0.87,
      description: 'Preenchimento facial e volume',
      estimatedSessions: 1,
      sessionDuration: 45,
      resultsDuration: 365,
      priceRange: { min: 1500, max: 3000 },
      benefits: ['Resultados imediatos', 'Longa duração'],
      considerations: ['Edema temporário esperado'],
      suitabilityScore: 0.88,
      alternatives: ['Toxina Botulínica', 'Bioestimuladores'],
      healthcareConsiderations: [
        {
          condition: 'alergias',
          recommendation: 'caution',
          reason: 'Teste de sensibilidade necessário',
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('deve renderizar o componente sem sugestões', () => {
      render(<TreatmentSuggestions suggestions={[]} />);
      expect(
        screen.getByText('Nenhuma sugestão de tratamento disponível'),
      ).toBeInTheDocument();
    });

    it('deve renderizar o componente com sugestões', () => {
      render(<TreatmentSuggestions suggestions={mockSuggestions} />);
      expect(screen.getByText('Sugestões de Tratamento')).toBeInTheDocument();
      expect(screen.getByText('Toxina Botulínica')).toBeInTheDocument();
      expect(screen.getByText('Ácido Hialurônico')).toBeInTheDocument();
    });

    it('deve renderizar o componente com loading', () => {
      render(<TreatmentSuggestions suggestions={[]} isLoading={true} />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('deve renderizar mensagem de erro', () => {
      const errorMessage = 'Erro ao carregar sugestões';
      render(<TreatmentSuggestions suggestions={[]} error={errorMessage} />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('deve ordenar sugestões por nível de confiança', () => {
      const unorderedSuggestions = [...mockSuggestions].reverse();
      render(<TreatmentSuggestions suggestions={unorderedSuggestions} />);

      const suggestionElements = screen.getAllByTestId(/treatment-suggestion-/);
      const firstSuggestion = suggestionElements[0];

      expect(firstSuggestion).toHaveTextContent('Toxina Botulínica'); // Maior confiança (0.92)
    });
  });

  describe('Detalhes do Tratamento', () => {
    it('deve exibir informações básicas do tratamento', () => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(screen.getByText('Toxina Botulínica')).toBeInTheDocument();
      expect(
        screen.getByText('Redução de rugas dinâmicas'),
      ).toBeInTheDocument();
      expect(screen.getByText('R$ 800.00 - R$ 1,200.00')).toBeInTheDocument();
    });

    it('deve exibir informações de duração', () => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(screen.getByText('30 min')).toBeInTheDocument();
      expect(screen.getByText('6 meses')).toBeInTheDocument();
    });

    it('deve exibir score de adequação', () => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(screen.getByText('95% adequado')).toBeInTheDocument();
    });

    it('deve exibir badge de confiança', () => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      const trustBadge = screen.getByTestId('trust-badge');
      expect(trustBadge).toBeInTheDocument();
      expect(trustBadge).toHaveAttribute('data-confidence', '92');
    });

    it('deve exibir benefícios', () => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(screen.getByText('Rápida recuperação')).toBeInTheDocument();
      expect(screen.getByText('Resultados naturais')).toBeInTheDocument();
    });

    it('deve exibir considerações', () => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(
        screen.getByText('Evitar exercícios físicos por 24h'),
      ).toBeInTheDocument();
    });
  });

  describe('Interação com o Usuário', () => {
    it('deve permitir selecionar um tratamento', async () => {
      const onTreatmentSelect = jest.fn();
      render(
        <TreatmentSuggestions
          suggestions={mockSuggestions}
          onTreatmentSelect={onTreatmentSelect}
        />,
      );

      const treatmentCard = screen.getByTestId('treatment-suggestion-tx-001');
      await userEvent.click(treatmentCard);

      expect(onTreatmentSelect).toHaveBeenCalledWith(mockSuggestions[0]);
    });

    it('deve permitir expandir detalhes do tratamento', async () => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      const expandButton = screen.getByRole('button', { name: /detalhes/i });
      await userEvent.click(expandButton);

      expect(screen.getByText('Alternativas:')).toBeInTheDocument();
      expect(
        screen.getByText('Toxina Botulínica, Ácido Hialurônico'),
      ).toBeInTheDocument();
    });

    it('deve permitir comparar tratamentos', async () => {
      render(<TreatmentSuggestions suggestions={mockSuggestions} />);

      // Selecionar primeiro tratamento para comparação
      const compareButton1 = screen.getAllByRole('button', {
        name: /comparar/i,
      })[0];
      await userEvent.click(compareButton1);

      // Selecionar segundo tratamento para comparação
      const compareButton2 = screen.getAllByRole('button', {
        name: /comparar/i,
      })[1];
      await userEvent.click(compareButton2);

      // Verificar se modo de comparação foi ativado
      expect(
        screen.getByText('Modo Comparação (2 selecionados)'),
      ).toBeInTheDocument();
    });

    it('deve permitir agendar consulta', async () => {
      const onScheduleConsultation = jest.fn();
      render(
        <TreatmentSuggestions
          suggestions={[mockSuggestions[0]]}
          onScheduleConsultation={onScheduleConsultation}
        />,
      );

      const scheduleButton = screen.getByRole('button', {
        name: /agendar consulta/i,
      });
      await userEvent.click(scheduleButton);

      expect(onScheduleConsultation).toHaveBeenCalledWith(mockSuggestions[0]);
    });
  });

  describe('Filtros e Ordenação', () => {
    it('deve permitir filtrar por categoria', async () => {
      render(<TreatmentSuggestions suggestions={mockSuggestions} />);

      const categoryFilter = screen.getByLabelText(/filtrar por categoria/i);
      await userEvent.selectOptions(categoryFilter, 'preenchimento');

      const suggestionElements = screen.getAllByTestId(/treatment-suggestion-/);
      expect(suggestionElements).toHaveLength(2);
    });

    it('deve permitir filtrar por faixa de preço', async () => {
      render(<TreatmentSuggestions suggestions={mockSuggestions} />);

      const minPriceInput = screen.getByLabelText(/preço mínimo/i);
      const maxPriceInput = screen.getByLabelText(/preço máximo/i);

      await userEvent.type(minPriceInput, '1000');
      await userEvent.type(maxPriceInput, '2000');

      // Verificar se aplicou filtro
      expect(screen.getByText('Toxina Botulínica')).toBeInTheDocument();
    });

    it('deve permitir ordenar por diferentes critérios', async () => {
      render(<TreatmentSuggestions suggestions={mockSuggestions} />);

      const sortBySelect = screen.getByLabelText(/ordenar por/i);
      await userEvent.selectOptions(sortBySelect, 'price-low');

      // Verificar se reordenou por preço
      const suggestionElements = screen.getAllByTestId(/treatment-suggestion-/);
      const firstSuggestion = suggestionElements[0];
      expect(firstSuggestion).toHaveTextContent('Toxina Botulínica'); // Preço mais baixo
    });
  });

  describe('Acessibilidade', () => {
    it('deve não ter violações de acessibilidade', async () => {
      const { container } = render(
        <TreatmentSuggestions suggestions={mockSuggestions} />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('deve ter atributos ARIA corretos', () => {
      render(<TreatmentSuggestions suggestions={mockSuggestions} />);

      const suggestionsList = screen.getByRole('list');
      expect(suggestionsList).toHaveAttribute(
        'aria-label',
        'Sugestões de tratamento',
      );

      const suggestionItems = screen.getAllByRole('listitem');
      suggestionItems.forEach((item, index) => {
        expect(item).toHaveAttribute('aria-setsize', '2');
        expect(item).toHaveAttribute('aria-posinset', (index + 1).toString());
      });
    });

    it('deve suportar navegação por teclado', async () => {
      render(<TreatmentSuggestions suggestions={mockSuggestions} />);

      const firstTreatment = screen.getByTestId('treatment-suggestion-tx-001');

      // Tab para focar no elemento
      await userEvent.tab();
      expect(firstTreatment).toHaveFocus();

      // Enter para selecionar
      const onTreatmentSelect = jest.fn();
      render(
        <TreatmentSuggestions
          suggestions={mockSuggestions}
          onTreatmentSelect={onTreatmentSelect}
        />,
      );

      const focusedTreatment = screen.getByTestId(
        'treatment-suggestion-tx-001',
      );
      await userEvent.type(focusedTreatment, '{enter}');

      expect(onTreatmentSelect).toHaveBeenCalledWith(mockSuggestions[0]);
    });

    it('deve ter descrições adequadas para leitores de tela', () => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      const treatmentCard = screen.getByTestId('treatment-suggestion-tx-001');
      expect(treatmentCard).toHaveAttribute(
        'aria-describedby',
        expect.any(String),
      );

      const description = screen.getByTestId('treatment-description-tx-001');
      expect(description).toBeInTheDocument();
    });
  });

  describe('Considerações de Saúde', () => {
    it('deve exibir avisos de contraindicação', () => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(screen.getByText('⚠️ Contraindicado para:')).toBeInTheDocument();
      expect(
        screen.getByText('Gravidez - Risco teórico para o feto'),
      ).toBeInTheDocument();
    });

    it('deve exibir avisos de precaução', () => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[1]]} />);

      expect(screen.getByText('⚠️ Precaução para:')).toBeInTheDocument();
      expect(
        screen.getByText('Alergias - Teste de sensibilidade necessário'),
      ).toBeInTheDocument();
    });

    it('deve permitir ver detalhes de saúde', async () => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      const healthDetailsButton = screen.getByRole('button', {
        name: /detalhes de saúde/i,
      });
      await userEvent.click(healthDetailsButton);

      expect(screen.getByText('Considerações de Saúde')).toBeInTheDocument();
      expect(screen.getByText('Gravidez: Contraindicado')).toBeInTheDocument();
    });
  });

  describe('Responsividade', () => {
    it('deve renderizar corretamente em dispositivos móveis', () => {
      // Simular viewport móvel
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<TreatmentSuggestions suggestions={mockSuggestions} />);

      const mobileLayout = screen.getByTestId('mobile-layout');
      expect(mobileLayout).toBeInTheDocument();

      // Verificar se elementos estão adaptados para mobile
      const treatmentCards = screen.getAllByTestId(/treatment-suggestion-/);
      treatmentCards.forEach(_card => {
        expect(card).toHaveClass('mobile-card');
      });
    });

    it('deve renderizar corretamente em tablets', () => {
      // Simular viewport tablet
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<TreatmentSuggestions suggestions={mockSuggestions} />);

      const tabletLayout = screen.getByTestId('tablet-layout');
      expect(tabletLayout).toBeInTheDocument();
    });

    it('deve renderizar corretmente em desktop', () => {
      // Simular viewport desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<TreatmentSuggestions suggestions={mockSuggestions} />);

      const desktopLayout = screen.getByTestId('desktop-layout');
      expect(desktopLayout).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('deve renderizar rapidamente com muitas sugestões', () => {
      const manySuggestions = Array.from({ length: 50 }, (_, i) => ({
        ...mockSuggestions[0],
        id: `tx-${i}`,
        name: `Tratamento ${i}`,
      }));

      const startTime = performance.now();
      render(<TreatmentSuggestions suggestions={manySuggestions} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Menos de 1 segundo
    });

    it('deve lazy load imagens quando necessário', () => {
      render(<TreatmentSuggestions suggestions={mockSuggestions} />);

      const images = screen.getAllByRole('img');
      images.forEach(_img => {
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });
  });

  describe('Testes de Integração', () => {
    it('deve integrar com sistema de agendamento', async () => {
      const onScheduleConsultation = jest.fn();
      render(
        <TreatmentSuggestions
          suggestions={[mockSuggestions[0]]}
          onScheduleConsultation={onScheduleConsultation}
        />,
      );

      const scheduleButton = screen.getByRole('button', {
        name: /agendar consulta/i,
      });
      await userEvent.click(scheduleButton);

      expect(onScheduleConsultation).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'tx-001',
          name: 'Toxina Botulínica',
        }),
      );
    });

    it('deve integrar com sistema de preferências do usuário', async () => {
      const userPreferences = {
        preferredCategories: ['preenchimento'],
        budgetRange: { min: 500, max: 2000 },
      };

      render(
        <TreatmentSuggestions
          suggestions={mockSuggestions}
          userPreferences={userPreferences}
        />,
      );

      // Verificar se filtros foram aplicados com base nas preferências
      expect(screen.getByText('Toxina Botulínica')).toBeInTheDocument();
    });

    it('deve enviar eventos de analytics', () => {
      const mockAnalytics = {
        track: jest.fn(),
      };

      render(
        <TreatmentSuggestions
          suggestions={mockSuggestions}
          analytics={mockAnalytics}
        />,
      );

      // Simular interação do usuário
      const treatmentCard = screen.getByTestId('treatment-suggestion-tx-001');
      fireEvent.click(treatmentCard);

      expect(mockAnalytics.track).toHaveBeenCalledWith(
        'treatment_suggestion_selected',
        expect.objectContaining({
          treatmentId: 'tx-001',
          treatmentName: 'Toxina Botulínica',
        }),
      );
    });
  });

  describe('Edge Cases', () => {
    it('deve lidar com dados incompletos', () => {
      const incompleteSuggestion = {
        ...mockSuggestions[0],
        priceRange: undefined,
        estimatedSessions: undefined,
      };

      render(<TreatmentSuggestions suggestions={[incompleteSuggestion]} />);

      expect(screen.getByText('Toxina Botulínica')).toBeInTheDocument();
      expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
    });

    it('deve lidar com sugestões duplicadas', () => {
      const duplicateSuggestions = [mockSuggestions[0], mockSuggestions[0]];

      render(<TreatmentSuggestions suggestions={duplicateSuggestions} />);

      const suggestionElements = screen.getAllByTestId(
        /treatment-suggestion-tx-001/,
      );
      expect(suggestionElements).toHaveLength(1); // Deve deduplicar
    });

    it('deve lidar com strings muito longas', () => {
      const longDescription = 'A'.repeat(1000);
      const longSuggestion = {
        ...mockSuggestions[0],
        description: longDescription,
      };

      render(<TreatmentSuggestions suggestions={[longSuggestion]} />);

      const description = screen.getByTestId('treatment-description-tx-001');
      expect(description).toHaveClass('truncated');
    });

    it('deve lidar com valores numéricos extremos', () => {
      const extremePriceSuggestion = {
        ...mockSuggestions[0],
        priceRange: { min: 0, max: 999999 },
        confidence: 0.01,
      };

      render(<TreatmentSuggestions suggestions={[extremePriceSuggestion]} />);

      expect(screen.getByText('R$ 0.00 - R$ 999,999.00')).toBeInTheDocument();
      expect(screen.getByText('1% adequado')).toBeInTheDocument();
    });
  });

  describe('Localização', () => {
    it('deve usar formato de moeda brasileiro', () => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(screen.getByText('R$ 800.00 - R$ 1,200.00')).toBeInTheDocument();
    });

    it('deve usar português brasileiro nos textos', () => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(screen.getByText('Sugestões de Tratamento')).toBeInTheDocument();
      expect(screen.getByText('agendar consulta')).toBeInTheDocument();
      expect(screen.getByText('detalhes')).toBeInTheDocument();
    });

    it('deve formatar datas corretamente', () => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(screen.getByText('30 min')).toBeInTheDocument();
      expect(screen.getByText('6 meses')).toBeInTheDocument();
    });
  });
});
