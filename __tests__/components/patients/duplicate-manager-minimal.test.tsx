/**
 * Minimal test for React 19 compatibility verification
 * Testing without React hooks to isolate the compatibility issue
 */

import { render } from "@testing-library/react";

// Simple component without hooks
const SimpleComponent = () => {
  return <div data-testid="simple">Hello World</div>;
};

describe("React 19 Compatibility Test", () => {
  it("renders a simple component without hooks", () => {
    const { getByTestId } = render(<SimpleComponent />);
    expect(getByTestId("simple")).toBeInTheDocument();
    expect(getByTestId("simple")).toHaveTextContent("Hello World");
  });

  it("renders static JSX correctly", () => {
    const { container } = render(
      <div>
        <h1>Test Header</h1>
        <p>Test paragraph</p>
      </div>
    );

    expect(container.querySelector("h1")).toHaveTextContent("Test Header");
    expect(container.querySelector("p")).toHaveTextContent("Test paragraph");
  });
});
