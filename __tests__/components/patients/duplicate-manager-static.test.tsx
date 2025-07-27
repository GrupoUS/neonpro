import { render, screen } from "@testing-library/react";
import DuplicateManagerStatic from "../../../components/patients/duplicate-manager-static";

describe("DuplicateManagerStatic", () => {
  it("renders duplicate detection UI", () => {
    render(<DuplicateManagerStatic />);

    expect(
      screen.getByText("Possíveis Duplicatas Detectadas")
    ).toBeInTheDocument();
    expect(screen.getByText("Possível Duplicata")).toBeInTheDocument();
    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("João da Silva")).toBeInTheDocument();
    expect(screen.getByText("Unificar pacientes")).toBeInTheDocument();
    expect(screen.getByText("Não é duplicata")).toBeInTheDocument();
  });

  it("shows confidence percentage", () => {
    render(<DuplicateManagerStatic />);

    expect(screen.getByText("95% confiança")).toBeInTheDocument();
  });

  it("displays patient information", () => {
    render(<DuplicateManagerStatic />);

    expect(screen.getByText("joao@email.com")).toBeInTheDocument();
    expect(screen.getByText("(11) 99999-9999")).toBeInTheDocument();
    expect(screen.getByText("Rua A, 123")).toBeInTheDocument();
  });
});
