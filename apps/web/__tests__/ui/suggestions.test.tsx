import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Placeholder import path; will create component to satisfy
import { Suggestions } from "@/components/chat/Suggestions";

describe("Suggestions (T015)", () => {
  test("renders safe suggestions and applies role/clinic filter", async () => {
    const items = [
      {
        id: "1",
        label: "Tratamentos faciais",
        safe: true,
        roles: ["admin", "clinician"],
        clinics: ["A"],
      },
      {
        id: "2",
        label: "Dados sensíveis do paciente",
        safe: false,
        roles: ["admin"],
        clinics: ["A", "B"],
      },
      {
        id: "3",
        label: "Agendar avaliação",
        safe: true,
        roles: ["assistant"],
        clinics: ["B"],
      },
    ];

    const filter = ({ item, role, clinic }: any) =>
      item.safe && item.roles.includes(role) && item.clinics.includes(clinic);

    const onPick = vi.fn();
    render(
      <Suggestions
        items={items as any}
        role="assistant"
        clinic="B"
        filter={filter}
        onPick={onPick}
      />,
    );

    // Only safe + role/clinic match should render (id:3)
    expect(screen.getByText("Agendar avaliação")).toBeInTheDocument();
    expect(screen.queryByText("Tratamentos faciais")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Dados sensíveis do paciente"),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("Agendar avaliação"));
    expect(onPick).toHaveBeenCalledWith(items[2]);
  });
});
