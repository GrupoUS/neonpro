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
jest.mock(_'@/lib/utils/format',_() => ({
  formatCurrency: (value: number) => `R$ ${value.toFixed(2)}`,
}));

// Mock do componente de confiança
jest.mock(_'../TrustBadge',_() => ({
  TrustBadge: ({ confidence }: { confidence: number }) => (
    <div data-testid='trust-badge' data-confidence={confidence}>
      Confidence: {confidence}%
    </div>
  ),
}));

describe(_'TreatmentSuggestions Component',_() => {
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

  beforeEach(_() => {
    jest.clearAllMocks();
  });

  describe(_'Renderização',_() => {
    it(_'deve renderizar o componente sem sugestões',_() => {
      render(<TreatmentSuggestions suggestions={[]} />);
      expect(
        screen.getByText('Nenhuma sugestão de tratamento disponível'),
      ).toBeInTheDocument();
    });

    it(_'deve renderizar o componente com sugestões',_() => {
      render(<TreatmentSuggestions suggestions={mockSuggestions} />);
      expect(screen.getByText('Sugestões de Tratamento')).toBeInTheDocument();
      expect(screen.getByText('Toxina Botulínica')).toBeInTheDocument();
      expect(screen.getByText('Ácido Hialurônico')).toBeInTheDocument();
    });

    it(_'deve renderizar o componente com loading',_() => {
      render(<TreatmentSuggestions suggestions={[]} isLoading={true} />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it(_'deve renderizar mensagem de erro',_() => {
      const errorMessage = 'Erro ao carregar sugestões';
      render(<TreatmentSuggestions suggestions={[]} error={errorMessage} />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it(_'deve ordenar sugestões por nível de confiança',_() => {
      const unorderedSuggestions = [...mockSuggestions].reverse();
      render(<TreatmentSuggestions suggestions={unorderedSuggestions} />);

      const suggestionElements = screen.getAllByTestId(/treatment-suggestion-/);
      const firstSuggestion = suggestionElements[0];

      expect(firstSuggestion).toHaveTextContent('Toxina Botulínica'); // Maior confiança (0.92)
    });
  });

  describe(_'Detalhes do Tratamento',_() => {
    it(_'deve exibir informações básicas do tratamento',_() => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(screen.getByText('Toxina Botulínica')).toBeInTheDocument();
      expect(
        screen.getByText('Redução de rugas dinâmicas'),
      ).toBeInTheDocument();
      expect(screen.getByText('R$ 800.00 - R$ 1,200.00')).toBeInTheDocument();
    });

    it(_'deve exibir informações de duração',_() => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(screen.getByText('30 min')).toBeInTheDocument();
      expect(screen.getByText('6 meses')).toBeInTheDocument();
    });

    it(_'deve exibir score de adequação',_() => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(screen.getByText('95% adequado')).toBeInTheDocument();
    });

    it(_'deve exibir badge de confiança',_() => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      const trustBadge = screen.getByTestId('trust-badge');
      expect(trustBadge).toBeInTheDocument();
      expect(trustBadge).toHaveAttribute('data-confidence', '92');
    });

    it(_'deve exibir benefícios',_() => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(screen.getByText('Rápida recuperação')).toBeInTheDocument();
      expect(screen.getByText('Resultados naturais')).toBeInTheDocument();
    });

    it(_'deve exibir considerações',_() => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(
        screen.getByText('Evitar exercícios físicos por 24h'),
      ).toBeInTheDocument();
    });
  });

  describe(_'Interação com o Usuário',_() => {
    it(_'deve permitir selecionar um tratamento',_async () => {
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

    it(_'deve permitir expandir detalhes do tratamento',_async () => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      const expandButton = screen.getByRole('button', { name: /detalhes/i });
      await userEvent.click(expandButton);

      expect(screen.getByText('Alternativas:')).toBeInTheDocument();
      expect(
        screen.getByText('Toxina Botulínica, Ácido Hialurônico'),
      ).toBeInTheDocument();
    });

    it(_'deve permitir comparar tratamentos',_async () => {
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

    it(_'deve permitir agendar consulta',_async () => {
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

  describe(_'Filtros e Ordenação',_() => {
    it(_'deve permitir filtrar por categoria',_async () => {
      render(<TreatmentSuggestions suggestions={mockSuggestions} />);

      const categoryFilter = screen.getByLabelText(/filtrar por categoria/i);
      await userEvent.selectOptions(categoryFilter, 'preenchimento');

      const suggestionElements = screen.getAllByTestId(/treatment-suggestion-/);
      expect(suggestionElements).toHaveLength(2);
    });

    it(_'deve permitir filtrar por faixa de preço',_async () => {
      render(<TreatmentSuggestions suggestions={mockSuggestions} />);

      const minPriceInput = screen.getByLabelText(/preço mínimo/i);
      const maxPriceInput = screen.getByLabelText(/preço máximo/i);

      await userEvent.type(minPriceInput, '1000');
      await userEvent.type(maxPriceInput, '2000');

      // Verificar se aplicou filtro
      expect(screen.getByText('Toxina Botulínica')).toBeInTheDocument();
    });

    it(_'deve permitir ordenar por diferentes critérios',_async () => {
      render(<TreatmentSuggestions suggestions={mockSuggestions} />);

      const sortBySelect = screen.getByLabelText(/ordenar por/i);
      await userEvent.selectOptions(sortBySelect, 'price-low');

      // Verificar se reordenou por preço
      const suggestionElements = screen.getAllByTestId(/treatment-suggestion-/);
      const firstSuggestion = suggestionElements[0];
      expect(firstSuggestion).toHaveTextContent('Toxina Botulínica'); // Preço mais baixo
    });
  });

  describe(_'Acessibilidade',_() => {
    it(_'deve não ter violações de acessibilidade',_async () => {
      const { container } = render(
        <TreatmentSuggestions suggestions={mockSuggestions} />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it(_'deve ter atributos ARIA corretos',_() => {
      render(<TreatmentSuggestions suggestions={mockSuggestions} />);

      const suggestionsList = screen.getByRole('list');
      expect(suggestionsList).toHaveAttribute(
        'aria-label',
        'Sugestões de tratamento',
      );

      const suggestionItems = screen.getAllByRole('listitem');
      suggestionItems.forEach(_(item, _index) => {
        expect(item).toHaveAttribute('aria-setsize', '2');
        expect(item).toHaveAttribute('aria-posinset', (index + 1).toString());
      });
    });

    it(_'deve suportar navegação por teclado',_async () => {
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

    it(_'deve ter descrições adequadas para leitores de tela',_() => {
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

  describe(_'Considerações de Saúde',_() => {
    it(_'deve exibir avisos de contraindicação',_() => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(screen.getByText('⚠️ Contraindicado para:')).toBeInTheDocument();
      expect(
        screen.getByText('Gravidez - Risco teórico para o feto'),
      ).toBeInTheDocument();
    });

    it(_'deve exibir avisos de precaução',_() => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[1]]} />);

      expect(screen.getByText('⚠️ Precaução para:')).toBeInTheDocument();
      expect(
        screen.getByText('Alergias - Teste de sensibilidade necessário'),
      ).toBeInTheDocument();
    });

    it(_'deve permitir ver detalhes de saúde',_async () => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      const healthDetailsButton = screen.getByRole('button', {
        name: /detalhes de saúde/i,
      });
      await userEvent.click(healthDetailsButton);

      expect(screen.getByText('Considerações de Saúde')).toBeInTheDocument();
      expect(screen.getByText('Gravidez: Contraindicado')).toBeInTheDocument();
    });
  });

  describe(_'Responsividade',_() => {
    it(_'deve renderizar corretamente em dispositivos móveis',_() => {
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

    it(_'deve renderizar corretamente em tablets',_() => {
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

    it(_'deve renderizar corretmente em desktop',_() => {
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

  describe(_'Performance',_() => {
    it(_'deve renderizar rapidamente com muitas sugestões',_() => {
      const manySuggestions = Array.from({ length: 50 },_(_,_i) => ({
        ...mockSuggestions[0],
        id: `tx-${i}`,
        name: `Tratamento ${i}`,
      }));

      const startTime = performance.now();
      render(<TreatmentSuggestions suggestions={manySuggestions} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Menos de 1 segundo
    });

    it(_'deve lazy load imagens quando necessário',_() => {
      render(<TreatmentSuggestions suggestions={mockSuggestions} />);

      const images = screen.getAllByRole('img');
      images.forEach(_img => {
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });
  });

  describe(_'Testes de Integração',_() => {
    it(_'deve integrar com sistema de agendamento',_async () => {
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

    it(_'deve integrar com sistema de preferências do usuário',_async () => {
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

    it(_'deve enviar eventos de analytics',_() => {
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

  describe(_'Edge Cases',_() => {
    it(_'deve lidar com dados incompletos',_() => {
      const incompleteSuggestion = {
        ...mockSuggestions[0],
        priceRange: undefined,
        estimatedSessions: undefined,
      };

      render(<TreatmentSuggestions suggestions={[incompleteSuggestion]} />);

      expect(screen.getByText('Toxina Botulínica')).toBeInTheDocument();
      expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
    });

    it(_'deve lidar com sugestões duplicadas',_() => {
      const duplicateSuggestions = [mockSuggestions[0], mockSuggestions[0]];

      render(<TreatmentSuggestions suggestions={duplicateSuggestions} />);

      const suggestionElements = screen.getAllByTestId(
        /treatment-suggestion-tx-001/,
      );
      expect(suggestionElements).toHaveLength(1); // Deve deduplicar
    });

    it(_'deve lidar com strings muito longas',_() => {
      const longDescription = 'A'.repeat(1000);
      const longSuggestion = {
        ...mockSuggestions[0],
        description: longDescription,
      };

      render(<TreatmentSuggestions suggestions={[longSuggestion]} />);

      const description = screen.getByTestId('treatment-description-tx-001');
      expect(description).toHaveClass('truncated');
    });

    it(_'deve lidar com valores numéricos extremos',_() => {
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

  describe(_'Localização',_() => {
    it(_'deve usar formato de moeda brasileiro',_() => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(screen.getByText('R$ 800.00 - R$ 1,200.00')).toBeInTheDocument();
    });

    it(_'deve usar português brasileiro nos textos',_() => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(screen.getByText('Sugestões de Tratamento')).toBeInTheDocument();
      expect(screen.getByText('agendar consulta')).toBeInTheDocument();
      expect(screen.getByText('detalhes')).toBeInTheDocument();
    });

    it(_'deve formatar datas corretamente',_() => {
      render(<TreatmentSuggestions suggestions={[mockSuggestions[0]]} />);

      expect(screen.getByText('30 min')).toBeInTheDocument();
      expect(screen.getByText('6 meses')).toBeInTheDocument();
    });
  });
});
