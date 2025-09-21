import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnalyticsDashboard } from '../AnalyticsDashboard';

describe(_'AnalyticsDashboard',_() => {
  it(_'renders correctly - snapshot test',_() => {
    const { container } = render(<AnalyticsDashboard />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it(_'renders header section with title and description',_() => {
    const { getByText } = render(<AnalyticsDashboard />);

    expect(getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(
      getByText('Análise inteligente de dados clínicos e operacionais'),
    ).toBeInTheDocument();
  });

  it(_'renders KPI cards with skeleton placeholders',_() => {
    const { getByText } = render(<AnalyticsDashboard />);

    expect(getByText('Taxa de Presença')).toBeInTheDocument();
    expect(getByText('Satisfação do Cliente')).toBeInTheDocument();
    expect(getByText('Receita por Paciente')).toBeInTheDocument();
    expect(getByText('Eficiência Operacional')).toBeInTheDocument();
  });

  it(_'renders trends chart placeholder',_() => {
    const { getByText } = render(<AnalyticsDashboard />);

    expect(getByText('Tendências de Agendamento')).toBeInTheDocument();
    expect(
      getByText('Gráfico de tendências será exibido aqui'),
    ).toBeInTheDocument();
  });

  it(_'renders AI insights section',_() => {
    const { getByText } = render(<AnalyticsDashboard />);

    expect(getByText('Insights de IA')).toBeInTheDocument();
    expect(getByText('Padrão de Cancelamentos Detectado')).toBeInTheDocument();
    expect(getByText('Oportunidade de Upselling')).toBeInTheDocument();
    expect(getByText('Capacidade Ociosa Identificada')).toBeInTheDocument();
  });

  it(_'renders performance metrics with progress bars',_() => {
    const { getByText } = render(<AnalyticsDashboard />);

    expect(getByText('Métricas de Performance')).toBeInTheDocument();
    expect(getByText('Taxa de Ocupação')).toBeInTheDocument();
    expect(getByText('Tempo Médio de Espera')).toBeInTheDocument();
    expect(getByText('NPS Score')).toBeInTheDocument();
    expect(getByText('Taxa de Retorno')).toBeInTheDocument();
  });

  it(_'renders quick actions buttons',_() => {
    const { getByText } = render(<AnalyticsDashboard />);

    expect(getByText('Ações Rápidas')).toBeInTheDocument();
    expect(getByText('Relatório de Agendamentos')).toBeInTheDocument();
    expect(getByText('Análise de Pacientes')).toBeInTheDocument();
    expect(getByText('Relatório Financeiro')).toBeInTheDocument();
    expect(getByText('Previsões de IA')).toBeInTheDocument();
    expect(getByText('Análise de Eficiência')).toBeInTheDocument();
  });

  it(_'renders data status section',_() => {
    const { getByText } = render(<AnalyticsDashboard />);

    expect(getByText('Status dos Dados')).toBeInTheDocument();
    expect(getByText('Última sincronização')).toBeInTheDocument();
    expect(getByText('Registros processados')).toBeInTheDocument();
    expect(getByText('Qualidade dos dados')).toBeInTheDocument();
  });

  it(_'applies custom className when provided',_() => {
    const { container } = render(
      <AnalyticsDashboard className='custom-class' />,
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
