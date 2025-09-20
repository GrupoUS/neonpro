import userEvent from "@testing-library/user-event";
import React from "react";
import { renderWithI18n as render, screen } from "../test-utils";

import { ReasoningSummary } from "@/components/chat/ReasoningSummary";

describe("Reasoning summary (T017)", () => {
  test("is OFF by default, can toggle ON to show summarized text and emits audit event", async () => {
    const onAudit = vi.fn();
    render(
      <ReasoningSummary
        summarized="Paciente com histórico estável."
        onAudit={onAudit}
      />,
    );

    // OFF by default
    expect(screen.queryByText(/histórico estável/i)).not.toBeInTheDocument();

    // Toggle ON
    await userEvent.click(
      screen.getByRole("button", { name: /mostrar raciocínio/i }),
    );
    expect(screen.getByText(/histórico estável/i)).toBeInTheDocument();
    expect(onAudit).toHaveBeenCalledWith({
      event: "reasoning_view_toggled",
      enabled: true,
    });

    // Toggle OFF again
    await userEvent.click(
      screen.getByRole("button", { name: /ocultar raciocínio/i }),
    );
    expect(screen.queryByText(/histórico estável/i)).not.toBeInTheDocument();
    expect(onAudit).toHaveBeenCalledWith({
      event: "reasoning_view_toggled",
      enabled: false,
    });
  });
});
