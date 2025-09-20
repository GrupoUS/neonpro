import { AuthForm } from "@/components/auth/AuthForm";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it } from "vitest";

describe("AuthForm", () => {
  it("switches between modes", async () => {
    render(<AuthForm />);

    // default: sign-in visible
    expect(
      screen.getByRole("tab", { name: /Entrar/i, selected: true }),
    ).toBeInTheDocument();

    // go to sign-up
    await userEvent.click(screen.getByRole("tab", { name: /Criar conta/i }));
    expect(
      screen.getByRole("tab", { name: /Criar conta/i, selected: true }),
    ).toBeInTheDocument();

    // back to sign-in, then go to forgot via button
    await userEvent.click(screen.getByRole("tab", { name: /Entrar/i }));
    await userEvent.click(
      screen.getByRole("button", { name: /Esqueceu sua senha\?/i }),
    );
    expect(
      screen.getByRole("form", { name: /Recuperação de senha/i }),
    ).toBeInTheDocument();
  });
});
