import { render } from "@testing-library/react";
import { useState } from "react";

// Componente de teste simples
function SimpleComponent() {
  const [count, _setCount] = useState(0);
  return <div>Count: {count}</div>;
}

describe("React useState Test", () => {
  it("deve conseguir usar useState", () => {
    const { getByText } = render(<SimpleComponent />);
    expect(getByText("Count: 0")).toBeInTheDocument();
  });
});
