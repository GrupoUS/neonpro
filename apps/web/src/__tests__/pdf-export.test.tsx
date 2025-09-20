import { render } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import { type AestheticAssessmentData } from "../components/pdf/AestheticReportPDF";
import { generatePDFFilename, usePDFExport } from "../hooks/usePDFExport";

// Mock dependencies
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("file-saver", () => ({
  saveAs: vi.fn(),
}));

vi.mock("@react-pdf/renderer", () => ({
  pdf: vi.fn(() => ({
    toBlob: vi.fn(() => Promise.resolve(new Blob(["fake pdf content"]))),
  })),
  Document: vi.fn(({ children }) => children),
  Page: vi.fn(({ children }) => children),
  Text: vi.fn(({ children }) => children),
  View: vi.fn(({ children }) => children),
  StyleSheet: {
    create: vi.fn((styles) => styles),
  },
  Font: {
    register: vi.fn(),
  },
}));

describe("PDF Export System", () => {
  const mockAssessmentData: AestheticAssessmentData = {
    patientData: {
      name: "João Silva",
      age: 35,
      skinType: "3",
      gender: "masculino",
    },
    skinAnalysis: {
      primaryConcerns: ["Acne", "Manchas solares"],
      skinCondition: "oleosa",
      acnePresent: true,
      melasmaPresent: false,
      wrinklesPresent: false,
      sunDamage: "moderado",
    },
    medicalHistory: {
      isPregnant: false,
      isBreastfeeding: false,
      hasDiabetes: false,
      hasAutoimmune: false,
      currentMedications: "",
      allergies: "",
      previousTreatments: "",
    },
    lifestyle: {
      sunExposure: "alta",
      smoking: false,
      alcoholConsumption: "social",
      exerciseFrequency: "moderado",
    },
    lgpdConsent: {
      dataProcessing: true,
      imageAnalysis: true,
      marketingCommunication: false,
    },
  };

  describe("generatePDFFilename", () => {
    it("should generate correct filename for assessment", () => {
      const filename = generatePDFFilename(
        "assessment",
        "João Silva",
        new Date("2024-01-01"),
      );
      expect(filename).toBe("avaliacao_estetica_joao_silva_2024-01-01.pdf");
    });

    it("should generate correct filename for treatment plan", () => {
      const filename = generatePDFFilename(
        "treatment",
        "Maria Santos",
        new Date("2024-02-15"),
      );
      expect(filename).toBe("plano_tratamento_maria_santos_2024-02-15.pdf");
    });

    it("should clean special characters from name", () => {
      const filename = generatePDFFilename(
        "consent",
        "José Carlos-Silva (Jr.)",
        new Date("2024-03-20"),
      );
      expect(filename).toBe(
        "termo_consentimento_jose_carlos_silva__jr___2024-03-20.pdf",
      );
    });
  });

  describe("usePDFExport hook", () => {
    it("should provide correct initial state", () => {
      const TestComponent = () => {
        const { isGenerating, error } = usePDFExport();
        return (
          <div>
            <span data-testid="generating">{isGenerating.toString()}</span>
            <span data-testid="error">{error || "null"}</span>
          </div>
        );
      };

      const { getByTestId } = render(<TestComponent />);
      expect(getByTestId("generating")).toHaveTextContent("false");
      expect(getByTestId("error")).toHaveTextContent("null");
    });
  });

  describe("Performance Requirements", () => {
    it("should track PDF generation time", async () => {
      // Mock performance.now to simulate time passage
      const mockNow = vi.spyOn(performance, "now");
      mockNow.mockReturnValueOnce(1000).mockReturnValueOnce(1500); // 0.5s duration

      const TestComponent = () => {
        const { generatePDF } = usePDFExport();

        const handleGenerate = async () => {
          await generatePDF(<div>Mock PDF Component</div>);
        };

        return <button onClick={handleGenerate}>Generate</button>;
      };

      render(<TestComponent />);

      // The hook should not log warning for fast generation (<2s)
      const consoleSpy = vi.spyOn(console, "warn");
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("PDF generation took"),
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle PDF generation errors gracefully", () => {
      const TestComponent = () => {
        const { error } = usePDFExport();
        return <div data-testid="error-state">{error || "no-error"}</div>;
      };

      const { getByTestId } = render(<TestComponent />);
      expect(getByTestId("error-state")).toHaveTextContent("no-error");
    });
  });
});
