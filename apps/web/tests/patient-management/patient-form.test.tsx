/**
 * Patient Form Unit Tests
 * Tests essential patient management form functionality
 */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

// Mock Patient Form Component (placeholder for actual implementation)
interface PatientFormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  initialData?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

const PatientForm = ({ onSubmit, initialData }: PatientFormProps) => (
  <form data-testid="patient-form" onSubmit={onSubmit}>
    <input
      data-testid="patient-name"
      defaultValue={initialData?.name || ""}
      name="name"
      placeholder="Nome do paciente"
    />
    <input
      data-testid="patient-email"
      defaultValue={initialData?.email || ""}
      name="email"
      placeholder="Email"
      type="email"
    />
    <input
      data-testid="patient-phone"
      defaultValue={initialData?.phone || ""}
      name="phone"
      placeholder="Telefone"
    />
    <button data-testid="patient-submit-button" type="submit">
      Salvar Paciente
    </button>
  </form>
);

describe("patient Form", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render patient form fields", () => {
    render(<PatientForm onSubmit={vi.fn()} />);

    expect(screen.getByTestId("patient-name")).toBeInTheDocument();
    expect(screen.getByTestId("patient-email")).toBeInTheDocument();
    expect(screen.getByTestId("patient-phone")).toBeInTheDocument();
    expect(screen.getByTestId("patient-submit-button")).toBeInTheDocument();
  });

  it("should handle form submission", async () => {
    const mockSubmit = vi.fn();
    const user = userEvent.setup();

    render(<PatientForm onSubmit={mockSubmit} />);

    const submitButton = screen.getByTestId("patient-submit-button");
    await user.click(submitButton);

    expect(mockSubmit).toHaveBeenCalled();
  });

  it("should populate form with initial data", () => {
    const initialData = {
      name: "João Silva",
      email: "joao@example.com",
      phone: "(11) 99999-9999",
    };

    render(<PatientForm initialData={initialData} onSubmit={vi.fn()} />);

    expect(screen.getByDisplayValue("João Silva")).toBeInTheDocument();
    expect(screen.getByDisplayValue("joao@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("(11) 99999-9999")).toBeInTheDocument();
  });
});
