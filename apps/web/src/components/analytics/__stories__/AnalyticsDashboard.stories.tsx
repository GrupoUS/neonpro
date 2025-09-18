import type { Meta, StoryObj } from '@storybook/react';
import { AnalyticsDashboard } from '../AnalyticsDashboard';

const meta: Meta<typeof AnalyticsDashboard> = {
  title: 'Analytics/AnalyticsDashboard',
  component: AnalyticsDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Dashboard de analytics com métricas, insights de IA e visualizações de dados da clínica de estética.',
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'CSS classes adicionais para customização',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Estado padrão do dashboard analytics com placeholders e skeleton loading.',
      },
    },
  },
};

export const WithCustomClass: Story = {
  args: {
    className: 'bg-slate-50 p-6 rounded-lg',
  },
  parameters: {
    docs: {
      description: {
        story: 'Dashboard analytics com classe CSS customizada para demonstrar flexibilidade de styling.',
      },
    },
  },
};

export const Compact: Story = {
  args: {
    className: 'max-w-4xl',
  },
  parameters: {
    docs: {
      description: {
        story: 'Versão compacta do dashboard analytics com largura limitada.',
      },
    },
  },
};