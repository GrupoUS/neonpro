import { render } from "@testing-library/react";
import DuplicateManagerHookMinimal from "../../../components/patients/duplicate-manager-hook-minimal";

// Mock useState specifically for React 19 compatibility
const mockSetState = jest.fn();
const mockUseState = jest.fn((initialValue) => [initialValue, mockSetState]);

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: mockUseState,
}));

describe("DuplicateManagerHookMinimal - Mocked State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing with mocked useState", () => {
    const mockDuplicates = [
      {
        id: "dup1",
        confidence: 0.95,
        patient1: {
          id: "p1",
          name: "John Doe",
          email: "john@example.com",
        },
        patient2: {
          id: "p2",
          name: "Jon Doe",
          email: "jon@example.com",
        },
      },
    ];

    expect(() => {
      render(<DuplicateManagerHookMinimal duplicates={mockDuplicates} />);
    }).not.toThrow();

    // Verify useState was called
    expect(mockUseState).toHaveBeenCalledWith(null);
  });

  it("component structure is valid", () => {
    const mockDuplicates = [
      {
        id: "dup1",
        confidence: 0.95,
        patient1: {
          id: "p1",
          name: "John Doe",
          email: "john@example.com",
        },
        patient2: {
          id: "p2",
          name: "Jon Doe",
          email: "jon@example.com",
        },
      },
    ];

    const { container } = render(
      <DuplicateManagerHookMinimal duplicates={mockDuplicates} />
    );

    // Check if the component renders with expected structure
    expect(container.firstChild).toBeTruthy();
    expect(container.querySelector(".space-y-4")).toBeTruthy();
  });
});
