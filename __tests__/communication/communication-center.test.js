"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_2 = require("@testing-library/react");
var user_event_1 = require("@testing-library/user-event");
var react_query_1 = require("@tanstack/react-query");
var CommunicationDashboard_1 = require("@/app/components/communication/CommunicationDashboard");
var CommunicationInbox_1 = require("@/app/components/communication/CommunicationInbox");
var MessageComposer_1 = require("@/app/components/communication/MessageComposer");
var TemplateManager_1 = require("@/app/components/communication/TemplateManager");
// Mock the communication hooks
jest.mock("@/app/hooks/use-communication", function () {
  return {
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
  };
});
// Mock date-fns
jest.mock("date-fns", function () {
  return {
    formatDistanceToNow: jest.fn(function () {
      return "2 horas atrás";
    }),
    format: jest.fn(function () {
      return "30/01/2025 10:30";
    }),
    isToday: jest.fn(function () {
      return true;
    }),
    isYesterday: jest.fn(function () {
      return false;
    }),
  };
});
jest.mock("date-fns/locale", function () {
  return {
    ptBR: {},
  };
});
var mockHooks = require("@/app/hooks/use-communication");
// Test utilities
function createWrapper() {
  var queryClient = new react_query_1.QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function (_a) {
    var children = _a.children;
    return (
      <react_query_1.QueryClientProvider client={queryClient}>
        {children}
      </react_query_1.QueryClientProvider>
    );
  };
}
// Mock data
var mockStatistics = {
  total_messages: 150,
  sent_messages: 90,
  received_messages: 60,
  unread_messages: 5,
  active_threads: 12,
  response_rate: 85,
  avg_response_time: 1800, // 30 minutes
};
var mockThreads = [
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
var mockMessages = [
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
var mockTemplates = [
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
describe("Communication Center", function () {
  beforeEach(function () {
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
  describe("CommunicationDashboard", function () {
    it("renders dashboard with statistics correctly", function () {
      (0, react_2.render)(<CommunicationDashboard_1.CommunicationDashboard />, {
        wrapper: createWrapper(),
      });
      // Check statistics cards
      expect(react_2.screen.getByText("150")).toBeInTheDocument(); // Total messages
      expect(react_2.screen.getByText("5")).toBeInTheDocument(); // Unread messages
      expect(react_2.screen.getByText("12")).toBeInTheDocument(); // Active threads
      expect(react_2.screen.getByText("85%")).toBeInTheDocument(); // Response rate
      // Check tabs
      expect(react_2.screen.getByRole("tab", { name: /caixa de entrada/i })).toBeInTheDocument();
      expect(react_2.screen.getByRole("tab", { name: /compor/i })).toBeInTheDocument();
      expect(react_2.screen.getByRole("tab", { name: /templates/i })).toBeInTheDocument();
      expect(react_2.screen.getByRole("tab", { name: /configurações/i })).toBeInTheDocument();
    });
    it("shows unread message badge in inbox tab", function () {
      (0, react_2.render)(<CommunicationDashboard_1.CommunicationDashboard />, {
        wrapper: createWrapper(),
      });
      var inboxTab = react_2.screen.getByRole("tab", { name: /caixa de entrada/i });
      expect((0, react_2.within)(inboxTab).getByText("5")).toBeInTheDocument();
    });
    it("switches between tabs correctly", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, composeTab;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_2.render)(<CommunicationDashboard_1.CommunicationDashboard />, {
                wrapper: createWrapper(),
              });
              // Should start with inbox tab active
              expect(react_2.screen.getByRole("tabpanel")).toBeInTheDocument();
              composeTab = react_2.screen.getByRole("tab", { name: /compor/i });
              return [
                4 /*yield*/,
                user.click(composeTab),
                // Should show compose interface
              ];
            case 1:
              _a.sent();
              // Should show compose interface
              expect(react_2.screen.getByText("Nova Mensagem")).toBeInTheDocument();
              return [2 /*return*/];
          }
        });
      });
    });
    it("handles template selection correctly", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, templatesTab;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_2.render)(<CommunicationDashboard_1.CommunicationDashboard />, {
                wrapper: createWrapper(),
              });
              templatesTab = react_2.screen.getByRole("tab", { name: /templates/i });
              return [
                4 /*yield*/,
                user.click(templatesTab),
                // Should show template manager
              ];
            case 1:
              _a.sent();
              // Should show template manager
              expect(react_2.screen.getByText("Gerenciar Templates")).toBeInTheDocument();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("CommunicationInbox", function () {
    it("renders thread list correctly", function () {
      (0, react_2.render)(<CommunicationInbox_1.CommunicationInbox />, {
        wrapper: createWrapper(),
      });
      // Check thread items
      expect(react_2.screen.getByText("Maria Silva")).toBeInTheDocument();
      expect(react_2.screen.getByText("João Santos")).toBeInTheDocument();
      expect(react_2.screen.getByText("Consulta de retorno")).toBeInTheDocument();
      expect(react_2.screen.getByText("Agendamento de consulta")).toBeInTheDocument();
    });
    it("shows unread count badges correctly", function () {
      (0, react_2.render)(<CommunicationInbox_1.CommunicationInbox />, {
        wrapper: createWrapper(),
      });
      // First thread should have unread count
      var firstThread = react_2.screen.getByText("Maria Silva").closest("div");
      expect((0, react_2.within)(firstThread).getByText("2")).toBeInTheDocument();
    });
    it("handles thread filtering", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, searchInput;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_2.render)(<CommunicationInbox_1.CommunicationInbox />, {
                wrapper: createWrapper(),
              });
              searchInput = react_2.screen.getByPlaceholderText("Buscar conversas...");
              return [
                4 /*yield*/,
                user.type(searchInput, "Maria"),
                // Should filter threads
              ];
            case 1:
              _a.sent();
              // Should filter threads
              expect(mockHooks.useMessageThreads).toHaveBeenCalledWith(
                expect.objectContaining({
                  search: "Maria",
                }),
              );
              return [2 /*return*/];
          }
        });
      });
    });
    it("handles thread selection and message loading", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, firstThread;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_2.render)(<CommunicationInbox_1.CommunicationInbox />, {
                wrapper: createWrapper(),
              });
              firstThread = react_2.screen.getByText("Maria Silva");
              return [
                4 /*yield*/,
                user.click(firstThread),
                // Should load messages for selected thread
              ];
            case 1:
              _a.sent();
              // Should load messages for selected thread
              expect(mockHooks.useMessages).toHaveBeenCalledWith(
                expect.objectContaining({
                  thread_id: "thread-1",
                }),
              );
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("MessageComposer", function () {
    it("renders compose form correctly", function () {
      (0, react_2.render)(<MessageComposer_1.MessageComposer />, { wrapper: createWrapper() });
      expect(react_2.screen.getByText("Nova Mensagem")).toBeInTheDocument();
      expect(react_2.screen.getByLabelText(/destinatário/i)).toBeInTheDocument();
      expect(react_2.screen.getByLabelText(/canal/i)).toBeInTheDocument();
      expect(react_2.screen.getByLabelText(/mensagem/i)).toBeInTheDocument();
    });
    it("handles template selection", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, mockTemplate;
        return __generator(this, function (_a) {
          user = user_event_1.default.setup();
          mockTemplate = mockTemplates[0];
          (0, react_2.render)(
            <MessageComposer_1.MessageComposer selectedTemplate={mockTemplate} />,
            { wrapper: createWrapper() },
          );
          // Should show template content
          expect(react_2.screen.getByDisplayValue(mockTemplate.body)).toBeInTheDocument();
          // Should show template variables
          expect(react_2.screen.getByText("nome_paciente")).toBeInTheDocument();
          expect(react_2.screen.getByText("data")).toBeInTheDocument();
          expect(react_2.screen.getByText("hora")).toBeInTheDocument();
          return [2 /*return*/];
        });
      });
    });
    it("handles variable replacement", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, mockTemplate, nomeInput, dataInput;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              mockTemplate = mockTemplates[0];
              (0, react_2.render)(
                <MessageComposer_1.MessageComposer selectedTemplate={mockTemplate} />,
                { wrapper: createWrapper() },
              );
              nomeInput = react_2.screen.getByLabelText("nome_paciente");
              return [4 /*yield*/, user.type(nomeInput, "João Silva")];
            case 1:
              _a.sent();
              dataInput = react_2.screen.getByLabelText("data");
              return [
                4 /*yield*/,
                user.type(dataInput, "15/02/2025"),
                // Should replace variables in preview
              ];
            case 2:
              _a.sent();
              // Should replace variables in preview
              expect(react_2.screen.getByText(/João Silva/)).toBeInTheDocument();
              expect(react_2.screen.getByText(/15\/02\/2025/)).toBeInTheDocument();
              return [2 /*return*/];
          }
        });
      });
    });
    it("sends message correctly", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, mockCreateMessage, recipientSelect, channelSelect, messageInput, sendButton;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              mockCreateMessage = jest.fn().mockResolvedValue({ success: true });
              mockHooks.useCreateMessage.mockReturnValue({
                mutateAsync: mockCreateMessage,
                isPending: false,
              });
              (0, react_2.render)(<MessageComposer_1.MessageComposer />, {
                wrapper: createWrapper(),
              });
              recipientSelect = react_2.screen.getByLabelText(/destinatário/i);
              return [4 /*yield*/, user.click(recipientSelect)];
            case 1:
              _a.sent();
              return [4 /*yield*/, user.click(react_2.screen.getByText("Maria Silva"))];
            case 2:
              _a.sent();
              channelSelect = react_2.screen.getByLabelText(/canal/i);
              return [4 /*yield*/, user.click(channelSelect)];
            case 3:
              _a.sent();
              return [4 /*yield*/, user.click(react_2.screen.getByText("Email"))];
            case 4:
              _a.sent();
              messageInput = react_2.screen.getByLabelText(/mensagem/i);
              return [
                4 /*yield*/,
                user.type(messageInput, "Olá, como está?"),
                // Submit form
              ];
            case 5:
              _a.sent();
              sendButton = react_2.screen.getByRole("button", { name: /enviar/i });
              return [
                4 /*yield*/,
                user.click(sendButton),
                // Should call create message
              ];
            case 6:
              _a.sent();
              // Should call create message
              expect(mockCreateMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                  recipient_id: "patient-1",
                  channel: "email",
                  content: "Olá, como está?",
                }),
              );
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("TemplateManager", function () {
    it("renders template list correctly", function () {
      (0, react_2.render)(<TemplateManager_1.TemplateManager />, { wrapper: createWrapper() });
      expect(react_2.screen.getByText("Gerenciar Templates")).toBeInTheDocument();
      expect(react_2.screen.getByText("Lembrete de Consulta")).toBeInTheDocument();
      expect(react_2.screen.getByText("Confirmação de Agendamento")).toBeInTheDocument();
    });
    it("handles template search and filtering", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, searchInput;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_2.render)(<TemplateManager_1.TemplateManager />, {
                wrapper: createWrapper(),
              });
              searchInput = react_2.screen.getByPlaceholderText("Buscar templates...");
              return [4 /*yield*/, user.type(searchInput, "Lembrete")];
            case 1:
              _a.sent();
              expect(mockHooks.useTemplates).toHaveBeenCalledWith(
                expect.objectContaining({
                  search: "Lembrete",
                }),
              );
              return [2 /*return*/];
          }
        });
      });
    });
    it("opens create template dialog", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, createButton;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_2.render)(<TemplateManager_1.TemplateManager />, {
                wrapper: createWrapper(),
              });
              createButton = react_2.screen.getByRole("button", { name: /novo template/i });
              return [4 /*yield*/, user.click(createButton)];
            case 1:
              _a.sent();
              expect(react_2.screen.getByText("Novo Template")).toBeInTheDocument();
              expect(react_2.screen.getByLabelText(/nome/i)).toBeInTheDocument();
              expect(react_2.screen.getByLabelText(/categoria/i)).toBeInTheDocument();
              return [2 /*return*/];
          }
        });
      });
    });
    it("creates new template correctly", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, mockCreateTemplate, createButton, submitButton;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              mockCreateTemplate = jest.fn().mockResolvedValue({ success: true });
              mockHooks.useCreateTemplate.mockReturnValue({
                mutateAsync: mockCreateTemplate,
                isPending: false,
              });
              (0, react_2.render)(<TemplateManager_1.TemplateManager />, {
                wrapper: createWrapper(),
              });
              createButton = react_2.screen.getByRole("button", { name: /novo template/i });
              return [
                4 /*yield*/,
                user.click(createButton),
                // Fill form
              ];
            case 1:
              _a.sent();
              // Fill form
              return [
                4 /*yield*/,
                user.type(react_2.screen.getByLabelText(/nome/i), "Novo Template"),
              ];
            case 2:
              // Fill form
              _a.sent();
              return [4 /*yield*/, user.type(react_2.screen.getByLabelText(/categoria/i), "Teste")];
            case 3:
              _a.sent();
              return [
                4 /*yield*/,
                user.type(react_2.screen.getByLabelText(/conteúdo/i), "Conteúdo do template"),
                // Submit
              ];
            case 4:
              _a.sent();
              submitButton = react_2.screen.getByRole("button", { name: /criar/i });
              return [4 /*yield*/, user.click(submitButton)];
            case 5:
              _a.sent();
              expect(mockCreateTemplate).toHaveBeenCalledWith(
                expect.objectContaining({
                  name: "Novo Template",
                  category: "Teste",
                  body: "Conteúdo do template",
                }),
              );
              return [2 /*return*/];
          }
        });
      });
    });
    it("handles template selection in selection mode", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, mockOnSelect, template;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              mockOnSelect = jest.fn();
              (0, react_2.render)(
                <TemplateManager_1.TemplateManager
                  selectionMode={true}
                  onTemplateSelect={mockOnSelect}
                />,
                { wrapper: createWrapper() },
              );
              template = react_2.screen.getByText("Lembrete de Consulta");
              return [4 /*yield*/, user.click(template)];
            case 1:
              _a.sent();
              expect(mockOnSelect).toHaveBeenCalledWith(mockTemplates[0]);
              return [2 /*return*/];
          }
        });
      });
    });
    it("handles template duplication", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, mockDuplicateTemplate, moreButtons, firstMoreButton, duplicateButton;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              mockDuplicateTemplate = jest.fn().mockResolvedValue({ success: true });
              mockHooks.useDuplicateTemplate.mockReturnValue({
                mutateAsync: mockDuplicateTemplate,
                isPending: false,
              });
              (0, react_2.render)(<TemplateManager_1.TemplateManager />, {
                wrapper: createWrapper(),
              });
              moreButtons = react_2.screen.getAllByRole("button");
              firstMoreButton = moreButtons.find(function (btn) {
                var _a;
                return (_a = btn.querySelector("svg")) === null || _a === void 0
                  ? void 0
                  : _a.classList.contains("lucide-more-vertical");
              });
              if (!firstMoreButton) return [3 /*break*/, 3];
              return [4 /*yield*/, user.click(firstMoreButton)];
            case 1:
              _a.sent();
              duplicateButton = react_2.screen.getByText("Duplicar");
              return [4 /*yield*/, user.click(duplicateButton)];
            case 2:
              _a.sent();
              expect(mockDuplicateTemplate).toHaveBeenCalledWith({
                id: "template-1",
                name: "Lembrete de Consulta (Cópia)",
              });
              _a.label = 3;
            case 3:
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Error Handling", function () {
    it("handles loading states correctly", function () {
      mockHooks.useMessageThreads.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });
      (0, react_2.render)(<CommunicationInbox_1.CommunicationInbox />, {
        wrapper: createWrapper(),
      });
      expect(react_2.screen.getByText("Carregando conversas...")).toBeInTheDocument();
    });
    it("handles error states correctly", function () {
      mockHooks.useMessageThreads.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error("Network error"),
      });
      (0, react_2.render)(<CommunicationInbox_1.CommunicationInbox />, {
        wrapper: createWrapper(),
      });
      expect(react_2.screen.getByText(/erro ao carregar/i)).toBeInTheDocument();
    });
    it("handles empty states correctly", function () {
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
      (0, react_2.render)(<CommunicationInbox_1.CommunicationInbox />, {
        wrapper: createWrapper(),
      });
      expect(react_2.screen.getByText("Nenhuma conversa encontrada")).toBeInTheDocument();
    });
  });
  describe("Integration", function () {
    it("integrates all components correctly in dashboard", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = user_event_1.default.setup();
              (0, react_2.render)(<CommunicationDashboard_1.CommunicationDashboard />, {
                wrapper: createWrapper(),
              });
              // Should show statistics
              expect(react_2.screen.getByText("150")).toBeInTheDocument();
              // Should show inbox by default
              expect(react_2.screen.getByText("Maria Silva")).toBeInTheDocument();
              // Switch to templates and back to compose
              return [
                4 /*yield*/,
                user.click(react_2.screen.getByRole("tab", { name: /templates/i })),
              ];
            case 1:
              // Switch to templates and back to compose
              _a.sent();
              expect(react_2.screen.getByText("Gerenciar Templates")).toBeInTheDocument();
              return [
                4 /*yield*/,
                user.click(react_2.screen.getByRole("tab", { name: /compor/i })),
              ];
            case 2:
              _a.sent();
              expect(react_2.screen.getByText("Nova Mensagem")).toBeInTheDocument();
              return [2 /*return*/];
          }
        });
      });
    });
    it("handles patient-specific mode correctly", function () {
      (0, react_2.render)(
        <CommunicationDashboard_1.CommunicationDashboard patientId="patient-1" />,
        { wrapper: createWrapper() },
      );
      expect(react_2.screen.getByText("Paciente Específico")).toBeInTheDocument();
      // Should filter data for specific patient
      expect(mockHooks.useMessageThreads).toHaveBeenCalledWith(
        expect.objectContaining({
          patient_id: "patient-1",
        }),
      );
    });
  });
});
