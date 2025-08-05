import DuplicateManager from "@/components/patients/duplicate-manager";
import { duplicateDetectionSystem } from "@/lib/patients/duplicate-detection";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock do sistema de detecção de duplicatas
jest.mock("@/lib/patients/duplicate-detection", () => ({
  duplicateDetectionSystem: {
    detectDuplicates: jest.fn(),
    comparePatients: jest.fn(),
    confirmDuplicate: jest.fn(),
    rejectDuplicate: jest.fn(),
    previewMerge: jest.fn(),
    mergePatients: jest.fn(),
  },
}));

// Mock dos componentes UI
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <h2 data-testid="card-title" {...props}>
      {children}
    </h2>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button data-testid="button" onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }: any) => (
    <span data-testid="badge" {...props}>
      {children}
    </span>
  ),
}));

jest.mock("@/components/ui/alert", () => ({
  Alert: ({ children, ...props }: any) => (
    <div data-testid="alert" {...props}>
      {children}
    </div>
  ),
  AlertDescription: ({ children, ...props }: any) => (
    <p data-testid="alert-description" {...props}>
      {children}
    </p>
  ),
}));

jest.mock("@/components/ui/progress", () => ({
  Progress: ({ value, ...props }: any) => (
    <div data-testid="progress" data-value={value} {...props} />
  ),
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open, onOpenChange, ...props }: any) =>
    open ? (
      <div data-testid="dialog" {...props}>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children, ...props }: any) => (
    <div data-testid="dialog-content" {...props}>
      {children}
    </div>
  ),
  DialogDescription: ({ children, ...props }: any) => (
    <p data-testid="dialog-description" {...props}>
      {children}
    </p>
  ),
  DialogFooter: ({ children, ...props }: any) => (
    <div data-testid="dialog-footer" {...props}>
      {children}
    </div>
  ),
  DialogHeader: ({ children, ...props }: any) => (
    <div data-testid="dialog-header" {...props}>
      {children}
    </div>
  ),
  DialogTitle: ({ children, ...props }: any) => (
    <h3 data-testid="dialog-title" {...props}>
      {children}
    </h3>
  ),
  DialogTrigger: ({ children, ...props }: any) => (
    <div data-testid="dialog-trigger" {...props}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children, ...props }: any) => (
    <div data-testid="tooltip-provider" {...props}>
      {children}
    </div>
  ),
  Tooltip: ({ children, ...props }: any) => (
    <div data-testid="tooltip" {...props}>
      {children}
    </div>
  ),
  TooltipContent: ({ children, ...props }: any) => (
    <div data-testid="tooltip-content" {...props}>
      {children}
    </div>
  ),
  TooltipTrigger: ({ children, ...props }: any) => (
    <div data-testid="tooltip-trigger" {...props}>
      {children}
    </div>
  ),
}));

const mockDuplicates = [
  {
    id: "dup-1",
    primaryPatientId: "patient-1",
    duplicatePatientId: "patient-2",
    confidenceScore: 0.95,
    status: "pending",
    matchingFields: ["name", "email", "phone"],
    potentialIssues: ["Different birthdates"],
    createdAt: new Date(),
    lastUpdated: new Date(),
  },
  {
    id: "dup-2",
    primaryPatientId: "patient-3",
    duplicatePatientId: "patient-4",
    confidenceScore: 0.75,
    status: "confirmed",
    matchingFields: ["email", "phone"],
    potentialIssues: [],
    createdAt: new Date(),
    lastUpdated: new Date(),
  },
];

const mockComparisons = [
  {
    field: "name",
    primaryValue: "João Silva",
    duplicateValue: "João da Silva",
    similarity: 0.9,
  },
  {
    field: "email",
    primaryValue: "joao@email.com",
    duplicateValue: "joao@email.com",
    similarity: 1.0,
  },
];

const mockMergePreview = {
  strategy: {
    patientData: "merge_intelligent",
    medicalHistory: "combine",
    appointments: "combine",
  },
  estimatedDataTransfer: {
    appointments: 5,
    documents: 10,
    medicalRecords: 8,
    financialRecords: 3,
  },
  potentialConflicts: ["Different birthdates"],
  recommendations: ["Review birthdate manually before merge"],
};

describe("DuplicateManager", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (duplicateDetectionSystem.detectDuplicates as jest.Mock).mockResolvedValue(mockDuplicates);
  });

  test("renderiza componente corretamente", async () => {
    render(<DuplicateManager />);

    await waitFor(() => {
      expect(screen.getByText("Duplicatas Pendentes de Revisão")).toBeInTheDocument();
    });

    // Verifica se os cards de summary são renderizados
    expect(screen.getByText("Pendentes")).toBeInTheDocument();
    expect(screen.getByText("Confirmadas")).toBeInTheDocument();
    expect(screen.getByText("Mescladas")).toBeInTheDocument();
    expect(screen.getByText("Confiança Média")).toBeInTheDocument();
  });

  test("carrega duplicatas no mount", async () => {
    render(<DuplicateManager />);

    await waitFor(() => {
      expect(duplicateDetectionSystem.detectDuplicates).toHaveBeenCalled();
    });

    expect(screen.getByText("Possível Duplicata #dup-1")).toBeInTheDocument();
  });

  test("exibe estado de loading", () => {
    (duplicateDetectionSystem.detectDuplicates as jest.Mock).mockReturnValue(
      new Promise(() => {}), // Promise que nunca resolve para simular loading
    );

    render(<DuplicateManager />);

    expect(screen.getByText("Carregando duplicatas...")).toBeInTheDocument();
    expect(screen.getByTestId("progress")).toBeInTheDocument();
  });

  test("exibe alerta quando não há duplicatas pendentes", async () => {
    (duplicateDetectionSystem.detectDuplicates as jest.Mock).mockResolvedValue([]);

    render(<DuplicateManager />);

    await waitFor(() => {
      expect(screen.getByText("Nenhuma duplicata pendente encontrada!")).toBeInTheDocument();
    });
  });

  test("abre dialog de comparação", async () => {
    (duplicateDetectionSystem.comparePatients as jest.Mock).mockResolvedValue(mockComparisons);

    render(<DuplicateManager />);

    await waitFor(() => {
      expect(screen.getByText("Possível Duplicata #dup-1")).toBeInTheDocument();
    });

    // Encontra e clica no botão de comparar (primeiro botão com ícone de olho)
    const compareButton = screen.getAllByTestId("button")[0];
    await user.click(compareButton);

    await waitFor(() => {
      expect(duplicateDetectionSystem.comparePatients).toHaveBeenCalledWith(
        "patient-1",
        "patient-2",
      );
      expect(screen.getByText("Comparação Detalhada")).toBeInTheDocument();
    });
  });

  test("confirma duplicata", async () => {
    (duplicateDetectionSystem.confirmDuplicate as jest.Mock).mockResolvedValue({});
    (duplicateDetectionSystem.detectDuplicates as jest.Mock)
      .mockResolvedValueOnce(mockDuplicates)
      .mockResolvedValueOnce([]); // Após confirmação, não há mais duplicatas

    render(<DuplicateManager />);

    await waitFor(() => {
      expect(screen.getByText("Possível Duplicata #dup-1")).toBeInTheDocument();
    });

    // Encontra e clica no botão "Confirmar"
    const confirmButton = screen.getByText("Confirmar");
    await user.click(confirmButton);

    await waitFor(() => {
      expect(duplicateDetectionSystem.confirmDuplicate).toHaveBeenCalledWith(
        "dup-1",
        "current_user",
      );
      expect(duplicateDetectionSystem.detectDuplicates).toHaveBeenCalledTimes(2); // Mount + reload
    });
  });

  test("rejeita duplicata", async () => {
    (duplicateDetectionSystem.rejectDuplicate as jest.Mock).mockResolvedValue({});
    (duplicateDetectionSystem.detectDuplicates as jest.Mock)
      .mockResolvedValueOnce(mockDuplicates)
      .mockResolvedValueOnce([]); // Após rejeição, não há mais duplicatas

    render(<DuplicateManager />);

    await waitFor(() => {
      expect(screen.getByText("Possível Duplicata #dup-1")).toBeInTheDocument();
    });

    // Encontra e clica no botão "Rejeitar"
    const rejectButton = screen.getByText("Rejeitar");
    await user.click(rejectButton);

    await waitFor(() => {
      expect(duplicateDetectionSystem.rejectDuplicate).toHaveBeenCalledWith(
        "dup-1",
        "current_user",
        "Não são o mesmo paciente",
      );
      expect(duplicateDetectionSystem.detectDuplicates).toHaveBeenCalledTimes(2); // Mount + reload
    });
  });

  test("abre preview de merge", async () => {
    (duplicateDetectionSystem.previewMerge as jest.Mock).mockResolvedValue(mockMergePreview);

    render(<DuplicateManager />);

    await waitFor(() => {
      expect(screen.getByText("Possível Duplicata #dup-1")).toBeInTheDocument();
    });

    // Encontra e clica no botão de preview merge (segundo botão)
    const mergePreviewButton = screen.getAllByTestId("button")[1];
    await user.click(mergePreviewButton);

    await waitFor(() => {
      expect(duplicateDetectionSystem.previewMerge).toHaveBeenCalledWith("patient-1", "patient-2", {
        patientData: "merge_intelligent",
        medicalHistory: "combine",
        appointments: "combine",
        documents: "combine",
        financialData: "keep_primary",
      });
      expect(screen.getByText("Preview do Merge")).toBeInTheDocument();
    });
  });

  test("executa merge", async () => {
    const mockOnMergeComplete = jest.fn();
    (duplicateDetectionSystem.previewMerge as jest.Mock).mockResolvedValue(mockMergePreview);
    (duplicateDetectionSystem.mergePatients as jest.Mock).mockResolvedValue({
      success: true,
    });
    (duplicateDetectionSystem.detectDuplicates as jest.Mock)
      .mockResolvedValueOnce(mockDuplicates)
      .mockResolvedValueOnce([]); // Após merge, não há mais duplicatas

    render(<DuplicateManager onMergeComplete={mockOnMergeComplete} />);

    await waitFor(() => {
      expect(screen.getByText("Possível Duplicata #dup-1")).toBeInTheDocument();
    });

    // Abrir preview de merge
    const mergePreviewButton = screen.getAllByTestId("button")[1];
    await user.click(mergePreviewButton);

    await waitFor(() => {
      expect(screen.getByText("Preview do Merge")).toBeInTheDocument();
    });

    // Executar merge
    const executeMergeButton = screen.getByText("Executar Merge");
    await user.click(executeMergeButton);

    await waitFor(() => {
      expect(duplicateDetectionSystem.mergePatients).toHaveBeenCalledWith(
        "patient-1",
        "patient-2",
        {
          patientData: "merge_intelligent",
          medicalHistory: "combine",
          appointments: "combine",
          documents: "combine",
          financialData: "keep_primary",
        },
        "current_user",
      );
      expect(mockOnMergeComplete).toHaveBeenCalledWith({ success: true });
    });
  });

  test("exibe badges de confiança corretas", async () => {
    render(<DuplicateManager />);

    await waitFor(() => {
      expect(screen.getByText("95%")).toBeInTheDocument(); // Alta confiança
      expect(screen.getByText("75%")).toBeInTheDocument(); // Média confiança
    });
  });

  test("calcula estatísticas corretamente", async () => {
    render(<DuplicateManager />);

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument(); // 1 pendente
      expect(screen.getByText("1")).toBeInTheDocument(); // 1 confirmada
      expect(screen.getByText("0")).toBeInTheDocument(); // 0 mescladas
      expect(screen.getByText("85%")).toBeInTheDocument(); // Confiança média: (95+75)/2 = 85%
    });
  });

  test("trata erros ao carregar duplicatas", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    (duplicateDetectionSystem.detectDuplicates as jest.Mock).mockRejectedValue(
      new Error("API Error"),
    );

    render(<DuplicateManager />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Erro ao carregar duplicatas:", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  test("trata erros na comparação de pacientes", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    (duplicateDetectionSystem.comparePatients as jest.Mock).mockRejectedValue(
      new Error("Compare Error"),
    );

    render(<DuplicateManager />);

    await waitFor(() => {
      expect(screen.getByText("Possível Duplicata #dup-1")).toBeInTheDocument();
    });

    const compareButton = screen.getAllByTestId("button")[0];
    await user.click(compareButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Erro ao comparar pacientes:", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
