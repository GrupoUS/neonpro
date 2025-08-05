import { render, screen } from "@testing-library/react";
import DuplicateManagerHookMinimal from "@/components/patients/duplicate-manager-hook-minimal";

const mockDuplicates = [
  {
    id: "dup-1",
    confidence: 0.85,
    patient1: { id: "1", name: "John Doe", email: "john@example.com" },
    patient2: { id: "2", name: "Jon Doe", email: "jon@example.com" },
  },
];

describe("DuplicateManagerHookMinimal", () => {
  it("renders with hook state", () => {
    render(<DuplicateManagerHookMinimal duplicates={mockDuplicates} />);
    expect(screen.getByText("Hook Minimal Duplicate Manager")).toBeInTheDocument();
  });

  it("handles hook state changes", () => {
    render(<DuplicateManagerHookMinimal duplicates={mockDuplicates} />);
    const selectButton = screen.getByText("Select");
    expect(selectButton).toBeInTheDocument();
  });
});
