import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Use existing prompt from UI lib
import { AIPrompt } from "@/components/ui/ai-chat";

// Mock useAuth and subscription behavior to avoid network/query deps
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "u1" } }) }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    channel: () => ({ on: () => ({ on: () => ({ subscribe: () => ({}) }) }) }),
    removeChannel: () => {},
  },
}));
vi.mock("@/lib/subscription/subscription-service", () => ({
  getUserSubscription: async () => ({ status: "free", plan: "free" }),
  getAvailableModels: () => [],
  getModelsForChat: () => [{ value: "gpt-4o-mini", label: "GPT-4o Mini" }],
  hasModelAccess: () => true,
}));

function wrapper(children: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("Prompt Input (T014)", () => {
  test("Enter submits, Shift+Enter inserts newline, and empty is invalid", async () => {
    const onSubmit = vi.fn();
    render(wrapper(<AIPrompt onSubmit={onSubmit} placeholder="Pergunte..." />));

    const textarea = screen.getByPlaceholderText(
      "Pergunte...",
    ) as HTMLTextAreaElement;

    // Shift+Enter adds newline
    await userEvent.type(textarea, "hello{Shift>}{Enter}{/Shift}world");
    expect(textarea.value).toBe("hello\nworld");

    // Enter submits
    await userEvent.type(textarea, "{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("hello\nworld");

    // After submit, it should clear
    expect(textarea.value).toBe("");

    // Empty submit should be prevented
    await userEvent.type(textarea, "{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
