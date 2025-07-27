import { act } from "react";
import { createRoot } from "react-dom/client";

// Import the component
import DuplicateManager from "@/components/patients/duplicate-manager";

describe("DuplicateManager (React Only)", () => {
  let container: HTMLDivElement;
  let root: any;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount();
      });
    }
    document.body.removeChild(container);
  });

  it("renders without crashing", async () => {
    const mockOnMergeComplete = jest.fn();

    await act(async () => {
      root.render(<DuplicateManager onMergeComplete={mockOnMergeComplete} />);
    });

    // Basic check - component should render without errors
    expect(container.querySelector("[data-testid]")).toBeTruthy();
  });

  it("shows loading state initially", async () => {
    const mockOnMergeComplete = jest.fn();

    await act(async () => {
      root.render(<DuplicateManager onMergeComplete={mockOnMergeComplete} />);
    });

    // Check for loading indicator or text
    const loadingElement =
      container.querySelector('[data-loading="true"]') ||
      container.textContent?.includes("Carregando") ||
      container.textContent?.includes("Loading");

    expect(loadingElement).toBeTruthy();
  });
});
