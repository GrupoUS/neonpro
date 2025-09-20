import {
  Button,
  SmoothDrawer,
  SmoothDrawerContent,
  SmoothDrawerHeader,
  SmoothDrawerTitle,
} from "@neonpro/ui";
import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it } from "vitest";

function DrawerHarness() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)} aria-label="open">
        Open
      </Button>
      <SmoothDrawer open={open} onOpenChange={setOpen}>
        <SmoothDrawerContent>
          <SmoothDrawerHeader>
            <SmoothDrawerTitle>Drawer</SmoothDrawerTitle>
          </SmoothDrawerHeader>
          <div>Body</div>
        </SmoothDrawerContent>
      </SmoothDrawer>
    </div>
  );
}

describe("SmoothDrawer accessibility", () => {
  it("opens with focusable dialog and closes on ESC restoring focus", async () => {
    render(<DrawerHarness />);

    const trigger = screen.getByRole("button", { name: /open/i });
    expect(trigger).toBeInTheDocument();

    // Open
    trigger.click();

    // Dialog is present
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // Press ESC to close
    fireEvent.keyDown(document, { key: "Escape" });

    // Dialog should be gone
    expect(screen.queryByRole("dialog")).toBeNull();

    // Focus returns to trigger (best-effort check)
    expect(document.activeElement).toBe(trigger);
  });
});
