import userEvent from "@testing-library/user-event";
import React from "react";
import { renderWithI18n as render, screen } from "../test-utils";

import { ImageAttachment } from "@/components/chat/ImageAttachment";

describe("Image attachment policy (T021)", () => {
  test("allow/block with consent", async () => {
    const onAttach = vi.fn();

    const { rerender } = render(
      <ImageAttachment consent={false} onAttach={onAttach} />,
    );

    expect(screen.getByText(/consentimento necessário/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /anexar imagem/i }),
    ).toBeDisabled();

    rerender(<ImageAttachment consent={true} onAttach={onAttach} />);

    await userEvent.click(
      screen.getByRole("button", { name: /anexar imagem/i }),
    );
    expect(onAttach).toHaveBeenCalled();
  });
});
