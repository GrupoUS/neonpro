import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CommunicationDashboard } from "@/app/components/communication/CommunicationDashboard";
import { CommunicationInbox } from "@/app/components/communication/CommunicationInbox";
import { MessageComposer } from "@/app/components/communication/MessageComposer";
import { TemplateManager } from "@/app/components/communication/TemplateManager";
import type {
  MessageThread,
  Message,
  MessageTemplate,
  MessageStatistics,
} from "@/app/lib/types/communication";

// Mock the communication hooks
jest.mock("@/app/hooks/use-communication", () => ({
  useMessageThreads: jest.fn(),
  useMessages: jest.fn(),
  useCreateMessage: jest.fn(),
  useMarkMessageRead: jest.fn(),
  useCreateThread: jest.fn(),
  useUpdateThread: jest.fn(),
  useDeleteThread: jest.fn(),
  useTemplates: jest.fn(),
  useCreateTemplate: jest.fn(),
  useUpdateTemplate: jest.fn(),
  useDeleteTemplate: jest.fn(),
  useDuplicateTemplate: jest.fn(),
  useMessageStatistics: jest.fn(),
}));

// Mock date-fns
jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn(() => "2 horas atrás"),
  format: jest.fn(() => "30/01/2025 10:30"),
  isToday: jest.fn(() => true),
  isYesterday: jest.fn(() => false),
}));

jest.mock("date-fns/locale", () => ({
  ptBR: {},
}));

const mockHooks = require("@/app/hooks/use-communication");

// Test utilities
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// Mock data
const mockStatistics: MessageStatistics = {
  total_messages: 150,
  sent_messages: 90,
  received_messages: 60,
  unread_messages: 5,
  active_threads: 12,
  response_rate: 85,
  avg_response_time: 1800, // 30 minutes
};

const mockThreads: MessageThread[] = [
  {
    id: "thread-1",
    patient_id: "patient-1",
    subject: "Consulta de retorno",
    status: "active",
    priority: "normal",
    channel: "email",
    last_message_at: "2025-01-30T10:30:00Z",
    created_at: "2025-01-29T09:00:00Z",
    updated_at: "2025-01-30T10:30:00Z",
    created_by_id: "user-1",
    assigned_to_id: "user-1",
    patient: {
      id: "patient-1",
      name: "Maria Silva",
      email: "maria@email.com",
      phone: "+5511999999999",
    },
    messages: [],
    unread_count: 2,
  },
  {
    id: "thread-2",
    patient_id: "patient-2",
    subject: "Agendamento de consulta",
    status: "closed",
    priority: "low",
    channel: "sms",
    last_message_at: "2025-01-29T15:20:00Z",
    created_at: "2025-01-29T14:00:00Z",
    updated_at: "2025-01-29T15:20:00Z",
    created_by_id: "user-1",
    assigned_to_id: "user-1",
    patient: {
      id: "patient-2",
      name: "João Santos",
      email: "joao@email.com",
      phone: "+5511888888888",
    },
    messages: [],
    unread_count: 0,
  },
];

const mockMessages: Message[] = [
  {
    id: "msg-1",
    thread_id: "thread-1",
    content: "Gostaria de agendar uma consulta de retorno.",
    channel: "email",
    direction: "inbound",
    status: "delivered",
    sent_at: "2025-01-30T10:30:00Z",
    delivered_at: "2025-01-30T10:30:05Z",
    read_at: null,
    created_at: "2025-01-30T10:30:00Z",
    metadata: {
      subject: "Consulta de retorno",
    },
    sender: {
      id: "patient-1",
      name: "Maria Silva",
      type: "patient",
    },
  },
  {
    id: "msg-2",
    thread_id: "thread-1",
    content: "Claro! Vou verificar nossa agenda e retorno em breve.",
    channel: "email",
    direction: "outbound",
    status: "delivered",
    sent_at: "2025-01-30T10:35:00Z",
    delivered_at: "2025-01-30T10:35:02Z",
    read_at: "2025-01-30T10:36:00Z",
    created_at: "2025-01-30T10:35:00Z",
    metadata: {
      subject: "Re: Consulta de retorno",
    },
    sender: {
      id: "user-1",
      name: "Dr. João",
      type: "user",
    },
  },
];

const mockTemplates: MessageTemplate[] = [
  {
    id: "template-1",
    name: "Lembrete de Consulta",
    category: "Lembrete",
    subject: "Lembrete: Consulta agendada para {{data}}",
    body: "Olá {{nome_paciente}}, lembramos que você tem uma consulta agendada para {{data}} às {{hora}}. Confirme sua presença.",
    variables: ["nome_paciente", "data", "hora"],
    default_channel: "sms",
    is_active: true,
    created_at: "2025-01-25T10:00:00Z",
    updated_at: "2025-01-25T10:00:00Z",
    created_by_id: "user-1",
    created_by: {
      id: "user-1",
      name: "Dr. João",
    },
  },
  {
    id: "template-2",
    name: "Confirmação de Agendamento",
    category: "Confirmação",
    subject: "Consulta agendada com sucesso",
    body: "Sua consulta foi agendada para {{data}} às {{hora}}. Local: {{endereco_clinica}}.",
    variables: ["data", "hora", "endereco_clinica"],
    default_channel: "email",
    is_active: true,
    created_at: "2025-01-25T11:00:00Z",
    updated_at: "2025-01-25T11:00:00Z",
    created_by_id: "user-1",
    created_by: {
      id: "user-1",
      name: "Dr. João",
    },
  },
];

describe("Communication Center", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock returns
    mockHooks.useMessageStatistics.mockReturnValue({
      data: { data: mockStatistics },
      isLoading: false,
      error: null,
    });

    mockHooks.useMessageThreads.mockReturnValue({
      data: {
        data: {
          threads: mockThreads,
          pagination: {
            page: 1,
            pages: 1,
            per_page: 20,
            total: 2,
            has_next: false,
            has_prev: false,
          },
        },
      },
      isLoading: false,
      error: null,
    });

    mockHooks.useMessages.mockReturnValue({
      data: {
        data: {
          messages: mockMessages,
          pagination: {
            page: 1,
            pages: 1,
            per_page: 50,
            total: 2,
            has_next: false,
            has_prev: false,
          },
        },
      },
      isLoading: false,
      error: null,
    });

    mockHooks.useTemplates.mockReturnValue({
      data: {
        data: {
          templates: mockTemplates,
          pagination: {
            page: 1,
            pages: 1,
            per_page: 20,
            total: 2,
            has_next: false,
            has_prev: false,
          },
        },
      },
      isLoading: false,
      error: null,
    });

    mockHooks.useCreateMessage.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ success: true }),
      isPending: false,
    });

    mockHooks.useMarkMessageRead.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ success: true }),
      isPending: false,
    });

    mockHooks.useCreateTemplate.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ success: true }),
      isPending: false,
    });

    mockHooks.useUpdateTemplate.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ success: true }),
      isPending: false,
    });

    mockHooks.useDeleteTemplate.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ success: true }),
      isPending: false,
    });

    mockHooks.useDuplicateTemplate.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({ success: true }),
      isPending: false,
    });
  });

  describe("CommunicationDashboard", () => {
    it("renders dashboard with statistics correctly", () => {
      render(<CommunicationDashboard />, { wrapper: createWrapper() });

      // Check statistics cards
      expect(screen.getByText("150")).toBeInTheDocument(); // Total messages
      expect(screen.getByText("5")).toBeInTheDocument(); // Unread messages
      expect(screen.getByText("12")).toBeInTheDocument(); // Active threads
      expect(screen.getByText("85%")).toBeInTheDocument(); // Response rate

      // Check tabs
      expect(screen.getByRole("tab", { name: /caixa de entrada/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /compor/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /templates/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /configurações/i })).toBeInTheDocument();
    });

    it("shows unread message badge in inbox tab", () => {
      render(<CommunicationDashboard />, { wrapper: createWrapper() });

      const inboxTab = screen.getByRole("tab", { name: /caixa de entrada/i });
      expect(within(inboxTab).getByText("5")).toBeInTheDocument();
    });

    it("switches between tabs correctly", async () => {
      const user = userEvent.setup();
      render(<CommunicationDashboard />, { wrapper: createWrapper() });

      // Should start with inbox tab active
      expect(screen.getByRole("tabpanel")).toBeInTheDocument();

      // Switch to compose tab
      const composeTab = screen.getByRole("tab", { name: /compor/i });
      await user.click(composeTab);

      // Should show compose interface
      expect(screen.getByText("Nova Mensagem")).toBeInTheDocument();
    });

    it("handles template selection correctly", async () => {
      const user = userEvent.setup();
      render(<CommunicationDashboard />, { wrapper: createWrapper() });

      // Go to templates tab
      const templatesTab = screen.getByRole("tab", { name: /templates/i });
      await user.click(templatesTab);

      // Should show template manager
      expect(screen.getByText("Gerenciar Templates")).toBeInTheDocument();
    });
  });

  describe("CommunicationInbox", () => {
    it("renders thread list correctly", () => {
      render(<CommunicationInbox />, { wrapper: createWrapper() });

      // Check thread items
      expect(screen.getByText("Maria Silva")).toBeInTheDocument();
      expect(screen.getByText("João Santos")).toBeInTheDocument();
      expect(screen.getByText("Consulta de retorno")).toBeInTheDocument();
      expect(screen.getByText("Agendamento de consulta")).toBeInTheDocument();
    });

    it("shows unread count badges correctly", () => {
      render(<CommunicationInbox />, { wrapper: createWrapper() });

      // First thread should have unread count
      const firstThread = screen.getByText("Maria Silva").closest("div");
      expect(within(firstThread!).getByText("2")).toBeInTheDocument();
    });

    it("handles thread filtering", async () => {
      const user = userEvent.setup();
      render(<CommunicationInbox />, { wrapper: createWrapper() });

      // Test search
      const searchInput = screen.getByPlaceholderText("Buscar conversas...");
      await user.type(searchInput, "Maria");

      // Should filter threads
      expect(mockHooks.useMessageThreads).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "Maria",
        }),
      );
    });

    it("handles thread selection and message loading", async () => {
      const user = userEvent.setup();
      render(<CommunicationInbox />, { wrapper: createWrapper() });

      // Click on first thread
      const firstThread = screen.getByText("Maria Silva");
      await user.click(firstThread);

      // Should load messages for selected thread
      expect(mockHooks.useMessages).toHaveBeenCalledWith(
        expect.objectContaining({
          thread_id: "thread-1",
        }),
      );
    });
  });

  describe("MessageComposer", () => {
    it("renders compose form correctly", () => {
      render(<MessageComposer />, { wrapper: createWrapper() });

      expect(screen.getByText("Nova Mensagem")).toBeInTheDocument();
      expect(screen.getByLabelText(/destinatário/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/canal/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mensagem/i)).toBeInTheDocument();
    });

    it("handles template selection", async () => {
      const user = userEvent.setup();
      const mockTemplate = mockTemplates[0];

      render(<MessageComposer selectedTemplate={mockTemplate} />, { wrapper: createWrapper() });

      // Should show template content
      expect(screen.getByDisplayValue(mockTemplate.body)).toBeInTheDocument();

      // Should show template variables
      expect(screen.getByText("nome_paciente")).toBeInTheDocument();
      expect(screen.getByText("data")).toBeInTheDocument();
      expect(screen.getByText("hora")).toBeInTheDocument();
    });

    it("handles variable replacement", async () => {
      const user = userEvent.setup();
      const mockTemplate = mockTemplates[0];

      render(<MessageComposer selectedTemplate={mockTemplate} />, { wrapper: createWrapper() });

      // Fill variable values
      const nomeInput = screen.getByLabelText("nome_paciente");
      await user.type(nomeInput, "João Silva");

      const dataInput = screen.getByLabelText("data");
      await user.type(dataInput, "15/02/2025");

      // Should replace variables in preview
      expect(screen.getByText(/João Silva/)).toBeInTheDocument();
      expect(screen.getByText(/15\/02\/2025/)).toBeInTheDocument();
    });

    it("sends message correctly", async () => {
      const user = userEvent.setup();
      const mockCreateMessage = jest.fn().mockResolvedValue({ success: true });
      mockHooks.useCreateMessage.mockReturnValue({
        mutateAsync: mockCreateMessage,
        isPending: false,
      });

      render(<MessageComposer />, { wrapper: createWrapper() });

      // Fill form
      const recipientSelect = screen.getByLabelText(/destinatário/i);
      await user.click(recipientSelect);
      await user.click(screen.getByText("Maria Silva"));

      const channelSelect = screen.getByLabelText(/canal/i);
      await user.click(channelSelect);
      await user.click(screen.getByText("Email"));

      const messageInput = screen.getByLabelText(/mensagem/i);
      await user.type(messageInput, "Olá, como está?");

      // Submit form
      const sendButton = screen.getByRole("button", { name: /enviar/i });
      await user.click(sendButton);

      // Should call create message
      expect(mockCreateMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient_id: "patient-1",
          channel: "email",
          content: "Olá, como está?",
        }),
      );
    });
  });

  describe("TemplateManager", () => {
    it("renders template list correctly", () => {
      render(<TemplateManager />, { wrapper: createWrapper() });

      expect(screen.getByText("Gerenciar Templates")).toBeInTheDocument();
      expect(screen.getByText("Lembrete de Consulta")).toBeInTheDocument();
      expect(screen.getByText("Confirmação de Agendamento")).toBeInTheDocument();
    });

    it("handles template search and filtering", async () => {
      const user = userEvent.setup();
      render(<TemplateManager />, { wrapper: createWrapper() });

      // Test search
      const searchInput = screen.getByPlaceholderText("Buscar templates...");
      await user.type(searchInput, "Lembrete");

      expect(mockHooks.useTemplates).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "Lembrete",
        }),
      );
    });

    it("opens create template dialog", async () => {
      const user = userEvent.setup();
      render(<TemplateManager />, { wrapper: createWrapper() });

      const createButton = screen.getByRole("button", { name: /novo template/i });
      await user.click(createButton);

      expect(screen.getByText("Novo Template")).toBeInTheDocument();
      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
    });

    it("creates new template correctly", async () => {
      const user = userEvent.setup();
      const mockCreateTemplate = jest.fn().mockResolvedValue({ success: true });
      mockHooks.useCreateTemplate.mockReturnValue({
        mutateAsync: mockCreateTemplate,
        isPending: false,
      });

      render(<TemplateManager />, { wrapper: createWrapper() });

      // Open create dialog
      const createButton = screen.getByRole("button", { name: /novo template/i });
      await user.click(createButton);

      // Fill form
      await user.type(screen.getByLabelText(/nome/i), "Novo Template");
      await user.type(screen.getByLabelText(/categoria/i), "Teste");
      await user.type(screen.getByLabelText(/conteúdo/i), "Conteúdo do template");

      // Submit
      const submitButton = screen.getByRole("button", { name: /criar/i });
      await user.click(submitButton);

      expect(mockCreateTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Novo Template",
          category: "Teste",
          body: "Conteúdo do template",
        }),
      );
    });

    it("handles template selection in selection mode", async () => {
      const user = userEvent.setup();
      const mockOnSelect = jest.fn();

      render(<TemplateManager selectionMode={true} onTemplateSelect={mockOnSelect} />, {
        wrapper: createWrapper(),
      });

      // Click on template
      const template = screen.getByText("Lembrete de Consulta");
      await user.click(template);

      expect(mockOnSelect).toHaveBeenCalledWith(mockTemplates[0]);
    });

    it("handles template duplication", async () => {
      const user = userEvent.setup();
      const mockDuplicateTemplate = jest.fn().mockResolvedValue({ success: true });
      mockHooks.useDuplicateTemplate.mockReturnValue({
        mutateAsync: mockDuplicateTemplate,
        isPending: false,
      });

      render(<TemplateManager />, { wrapper: createWrapper() });

      // Open dropdown menu for first template
      const moreButtons = screen.getAllByRole("button");
      const firstMoreButton = moreButtons.find((btn) =>
        btn.querySelector("svg")?.classList.contains("lucide-more-vertical"),
      );

      if (firstMoreButton) {
        await user.click(firstMoreButton);

        const duplicateButton = screen.getByText("Duplicar");
        await user.click(duplicateButton);

        expect(mockDuplicateTemplate).toHaveBeenCalledWith({
          id: "template-1",
          name: "Lembrete de Consulta (Cópia)",
        });
      }
    });
  });

  describe("Error Handling", () => {
    it("handles loading states correctly", () => {
      mockHooks.useMessageThreads.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<CommunicationInbox />, { wrapper: createWrapper() });

      expect(screen.getByText("Carregando conversas...")).toBeInTheDocument();
    });

    it("handles error states correctly", () => {
      mockHooks.useMessageThreads.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error("Network error"),
      });

      render(<CommunicationInbox />, { wrapper: createWrapper() });

      expect(screen.getByText(/erro ao carregar/i)).toBeInTheDocument();
    });

    it("handles empty states correctly", () => {
      mockHooks.useMessageThreads.mockReturnValue({
        data: {
          data: {
            threads: [],
            pagination: {
              page: 1,
              pages: 0,
              per_page: 20,
              total: 0,
              has_next: false,
              has_prev: false,
            },
          },
        },
        isLoading: false,
        error: null,
      });

      render(<CommunicationInbox />, { wrapper: createWrapper() });

      expect(screen.getByText("Nenhuma conversa encontrada")).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    it("integrates all components correctly in dashboard", async () => {
      const user = userEvent.setup();
      render(<CommunicationDashboard />, { wrapper: createWrapper() });

      // Should show statistics
      expect(screen.getByText("150")).toBeInTheDocument();

      // Should show inbox by default
      expect(screen.getByText("Maria Silva")).toBeInTheDocument();

      // Switch to templates and back to compose
      await user.click(screen.getByRole("tab", { name: /templates/i }));
      expect(screen.getByText("Gerenciar Templates")).toBeInTheDocument();

      await user.click(screen.getByRole("tab", { name: /compor/i }));
      expect(screen.getByText("Nova Mensagem")).toBeInTheDocument();
    });

    it("handles patient-specific mode correctly", () => {
      render(<CommunicationDashboard patientId="patient-1" />, { wrapper: createWrapper() });

      expect(screen.getByText("Paciente Específico")).toBeInTheDocument();

      // Should filter data for specific patient
      expect(mockHooks.useMessageThreads).toHaveBeenCalledWith(
        expect.objectContaining({
          patient_id: "patient-1",
        }),
      );
    });
  });
});
