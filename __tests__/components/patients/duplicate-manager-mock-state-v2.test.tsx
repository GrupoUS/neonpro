// Define mocks BEFORE any imports
const mockSetState = jest.fn();
const mockUseState = jest.fn((initialValue) => [initialValue, mockSetState]);

// Mock React with our custom useState
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: mockUseState,
}));

// Now import after mocking
import { render } from "@testing-library/react";
import DuplicateManagerHookMinimal from "../../../components/patients/duplicate-manager-hook-minimal";

describe("DuplicateManagerHookMinimal - Mocked State V2", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing with mocked useState", () => {
    const mockDuplicates = [
      {
        id: "1",
        confidence: 0.9,
        patient1: {
          id: "pat1",
          name: "John Doe",
          email: "john@example.com",
        },
        patient2: {
          id: "pat2",
          name: "Jonathan Doe",
          email: "jonathan@example.com",
        },
      },
    ];

    // This should work with our mocked useState
    render(<DuplicateManagerHookMinimal duplicates={mockDuplicates} />);

    expect(mockUseState).toHaveBeenCalled();
  });
});
