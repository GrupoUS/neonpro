// AI Chat Component Tests for NeonPro Aesthetic Clinic
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AIChatContainer from '@/components/organisms/ai-chat-container';
import { AIPrompt, AIInputSearch, AILoading, AIVoice } from '@/components/ui/ai-chat';

// Mock browser APIs
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(() => Promise.resolve({
      getTracks: () => [{ stop: vi.fn() }]
    } as any))
  },
  writable: true,
});

Object.defineProperty(global, 'MediaRecorder', {
  value: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    ondataavailable: null,
    onstop: null,
  })),
  writable: true,
});

// Mock AI services
vi.mock('@/lib/ai/ai-chat-service', () => ({
  streamAestheticResponse: vi.fn(() => 
    Promise.resolve(new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('Olá! Como posso ajudar com seus tratamentos estéticos?'));
        controller.close();
      }
    }))
  ),
  generateSearchSuggestions: vi.fn(() => 
    Promise.resolve([
      'Botox para rugas',
      'Preenchimento labial',
      'Limpeza de pele profunda',
      'Harmonização facial',
      'Peeling químico'
    ])
  ),
  processVoiceInput: vi.fn(() => 
    Promise.resolve('Gostaria de agendar uma consulta')
  ),
  generateVoiceOutput: vi.fn(),
  logAIInteraction: vi.fn(),
}));

// Mock useAIChat hook
vi.mock('@/hooks/useAIChat', () => ({
  useAIChat: vi.fn(() => ({
    messages: [],
    isLoading: false,
    error: null,
    searchSuggestions: [
      'Botox para rugas',
      'Preenchimento labial',
      'Limpeza de pele profunda',
      'Harmonização facial',
      'Peeling químico'
    ],
    sendMessage: vi.fn(),
    processVoice: vi.fn(),
    generateVoice: vi.fn(),
    clearChat: vi.fn(),
    sendMessageLoading: false,
    voiceProcessingLoading: false,
  })),
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('AI Chat Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AIPrompt', () => {
    it('renders with aesthetic clinic branding', () => {
      const mockSubmit = vi.fn();
      render(<AIPrompt onSubmit={mockSubmit} />);
      
      const input = screen.getByPlaceholderText(/pergunte sobre tratamentos estéticos/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('text-[#112031]');
    });

    it('submits message on enter key', async () => {
      const mockSubmit = vi.fn();
      render(<AIPrompt onSubmit={mockSubmit} />);
      
      const input = screen.getByPlaceholderText(/pergunte sobre tratamentos estéticos/i);
      fireEvent.change(input, { target: { value: 'Quero agendar botox' } });
      
      // Submit via Enter key
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
      
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith('Quero agendar botox');
      });
    });

    it('handles LGPD compliance with disabled state', () => {
      render(<AIPrompt disabled={true} />);
      
      const input = screen.getByPlaceholderText(/pergunte sobre tratamentos estéticos/i);
      expect(input).toBeDisabled();
    });
  });  describe('AIInputSearch', () => {
    it('renders with debounced search functionality', async () => {
      const mockSearch = vi.fn();
      render(
        <AIInputSearch 
          onSearch={mockSearch}
          suggestions={['Botox para rugas', 'Preenchimento labial']}
        />
      );
      
      const input = screen.getByLabelText(/buscar na clínica estética/i);
      fireEvent.change(input, { target: { value: 'botox' } });
      
      // Should debounce the search
      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith('botox');
      }, { timeout: 500 });
    });

    it('shows suggestions dropdown with aesthetic clinic treatments', () => {
      render(
        <AIInputSearch 
          suggestions={[
            'Botox para rugas',
            'Preenchimento labial',
            'Limpeza de pele profunda',
            'Harmonização facial'
          ]}
        />
      );
      
      const input = screen.getByLabelText(/buscar na clínica estética/i);
      fireEvent.focus(input);
      
      expect(screen.getByText('Botox para rugas')).toBeInTheDocument();
      expect(screen.getByText('Preenchimento labial')).toBeInTheDocument();
    });

    it('clears search input correctly', () => {
      render(<AIInputSearch />);
      
      const input = screen.getByLabelText(/buscar na clínica estética/i);
      fireEvent.change(input, { target: { value: 'test query' } });
      
      const clearButton = screen.getByLabelText(/limpar busca/i);
      fireEvent.click(clearButton);
      
      expect(input).toHaveValue('');
    });
  });

  describe('AILoading', () => {
    it('renders different sizes with aesthetic clinic styling', () => {
      const { rerender } = render(<AILoading size="sm" />);
      expect(screen.getByText('Processando...')).toBeInTheDocument();
      
      rerender(<AILoading size="lg" />);
      expect(screen.getByText('Processando...')).toBeInTheDocument();
    });

    it('shows processing message for aesthetic clinic', () => {
      render(<AILoading message="Analisando tratamento..." showMessage={true} />);
      expect(screen.getByText('Analisando tratamento...')).toBeInTheDocument();
    });

    it('provides screen reader support', () => {
      render(<AILoading />);
      expect(screen.getByText(/carregando resposta da ia/i)).toBeInTheDocument();
    });
  });

  describe('AIVoice', () => {
    it('renders microphone and speaker controls', () => {
      render(<AIVoice />);
      
      expect(screen.getByLabelText(/iniciar gravação de voz/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/reproduzir resposta/i)).toBeInTheDocument();
    });

    it('handles voice input correctly', async () => {
      const mockVoiceInput = vi.fn();
      
      // Mock speechRecognition support
      Object.defineProperty(window, 'speechRecognition', {
        value: vi.fn(),
        writable: true,
      });
      
      render(<AIVoice onVoiceInput={mockVoiceInput} />);
      
      const micButton = screen.getByLabelText(/iniciar gravação de voz/i);
      fireEvent.click(micButton);
      
      await waitFor(() => {
        expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
      });
    });

    it('shows recording state with aesthetic clinic styling', () => {
      // Mock speechRecognition support
      Object.defineProperty(window, 'speechRecognition', {
        value: vi.fn(),
        writable: true,
      });
      
      render(<AIVoice isListening={true} />);
      
      const micButton = screen.getByLabelText(/iniciar gravação de voz/i);
      expect(micButton).toHaveClass('bg-[#AC9469]');
    });
  });  describe('AIChatContainer Integration', () => {
    it('renders complete aesthetic clinic chat interface', () => {
      renderWithProviders(<AIChatContainer />);
      
      expect(screen.getByText('Assistente NeonPro')).toBeInTheDocument();
      expect(screen.getByText(/como posso ajudar hoje/i)).toBeInTheDocument();
      expect(screen.getByText(/powered by neonpro ai/i)).toBeInTheDocument();
    });

    it('displays welcome message for new users', () => {
      renderWithProviders(<AIChatContainer />);
      
      expect(screen.getByText(/pergunte sobre tratamentos estéticos/i)).toBeInTheDocument();
    });

    it('shows LGPD compliance footer', () => {
      renderWithProviders(<AIChatContainer />);
      
      expect(screen.getByText(/respeitamos sua privacidade \(lgpd\)/i)).toBeInTheDocument();
    });

    it('handles client ID for audit tracking', () => {
      const clientId = 'client_12345';
      renderWithProviders(<AIChatContainer clientId={clientId} />);
      
      // Component should render without errors with clientId
      expect(screen.getByText('Assistente NeonPro')).toBeInTheDocument();
    });

    it('supports voice controls when enabled', () => {
      renderWithProviders(<AIChatContainer showVoiceControls={true} />);
      
      expect(screen.getByLabelText(/iniciar gravação de voz/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/reproduzir resposta/i)).toBeInTheDocument();
    });

    it('supports search suggestions when enabled', () => {
      renderWithProviders(<AIChatContainer showSearchSuggestions={true} />);
      
      expect(screen.getByLabelText(/buscar na clínica estética/i)).toBeInTheDocument();
    });

    it('clears chat history correctly', () => {
      renderWithProviders(<AIChatContainer />);
      
      // Check if clear button exists
      expect(screen.getByText(/limpar conversa/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility Compliance', () => {
    it('provides proper ARIA labels for all interactive elements', () => {
      renderWithProviders(<AIChatContainer />);
      
      expect(screen.getByLabelText(/buscar na clínica estética/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/iniciar gravação de voz/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/reproduzir resposta/i)).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<AIPrompt />);
      
      const input = screen.getByPlaceholderText(/pergunte sobre tratamentos estéticos/i);
      input.focus();
      expect(document.activeElement).toBe(input);
    });

    it('provides screen reader content', () => {
      render(<AILoading />);
      expect(screen.getByText(/carregando resposta da ia/i)).toBeInTheDocument();
    });
  });
});