/**
 * Minimal test for React 19 compatibility verification
 * Testing without React hooks to isolate the compatibility issue
 */
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("@testing-library/react");
// Simple component without hooks
var SimpleComponent = () => <div data-testid="simple">Hello World</div>;
describe("React 19 Compatibility Test", () => {
  it("renders a simple component without hooks", () => {
    var getByTestId = (0, react_1.render)(<SimpleComponent />).getByTestId;
    expect(getByTestId("simple")).toBeInTheDocument();
    expect(getByTestId("simple")).toHaveTextContent("Hello World");
  });
  it("renders static JSX correctly", () => {
    var container = (0, react_1.render)(
      <div>
        <h1>Test Header</h1>
        <p>Test paragraph</p>
      </div>,
    ).container;
    expect(container.querySelector("h1")).toHaveTextContent("Test Header");
    expect(container.querySelector("p")).toHaveTextContent("Test paragraph");
  });
});
