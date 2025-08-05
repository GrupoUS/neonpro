import { render, screen } from "@testing-library/react";
import DuplicateManager from "../../../components/patients/duplicate-manager-simple";

describe("DuplicateManager Simple", () => {
  it("renders loading state initially", () => {
    render(<DuplicateManager />);
    expect(screen.getByText("Carregando duplicatas...")).toBeInTheDocument();
  });

  it("renders no duplicates message after loading", async () => {
    render(<DuplicateManager />);

    // Wait for loading to complete
    await screen.findByText("Nenhuma duplicata pendente encontrada.");

    expect(screen.getByText("Nenhuma duplicata pendente encontrada.")).toBeInTheDocument();
  });
});
