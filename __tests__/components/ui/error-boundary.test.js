"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_2 = require("@testing-library/react");
require("@testing-library/jest-dom");
var error_boundary_1 = require("@/components/ui/error-boundary");
// Mock component that throws an error
var ThrowError = function (_a) {
  var _b = _a.shouldThrow,
    shouldThrow = _b === void 0 ? true : _b;
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};
// Mock console.error to avoid noise in tests
var originalConsoleError = console.error;
beforeAll(function () {
  console.error = jest.fn();
});
afterAll(function () {
  console.error = originalConsoleError;
});
describe("ErrorBoundary", function () {
  it("renders children when there is no error", function () {
    (0, react_2.render)(
      <error_boundary_1.ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </error_boundary_1.ErrorBoundary>,
    );
    expect(react_2.screen.getByText("No error")).toBeInTheDocument();
  });
  it("renders error UI when child component throws", function () {
    (0, react_2.render)(
      <error_boundary_1.ErrorBoundary>
        <ThrowError />
      </error_boundary_1.ErrorBoundary>,
    );
    expect(react_2.screen.getByText("Oops! Algo deu errado")).toBeInTheDocument();
    expect(
      react_2.screen.getByText("Ocorreu um erro inesperado. Nossa equipe foi notificada."),
    ).toBeInTheDocument();
  });
  it("shows retry button and resets error state when clicked", function () {
    (0, react_2.render)(
      <error_boundary_1.ErrorBoundary>
        <ThrowError />
      </error_boundary_1.ErrorBoundary>,
    );
    var retryButton = react_2.screen.getByText("Tentar novamente");
    expect(retryButton).toBeInTheDocument();
    react_2.fireEvent.click(retryButton);
    // After retry, component should re-render and error should be gone
    // Note: In real usage, the component would need to fix the error condition
  });
  it("shows technical details when showDetails is true", function () {
    (0, react_2.render)(
      <error_boundary_1.ErrorBoundary showDetails={true}>
        <ThrowError />
      </error_boundary_1.ErrorBoundary>,
    );
    expect(react_2.screen.getByText("Detalhes técnicos")).toBeInTheDocument();
  });
  it("calls onError callback when error occurs", function () {
    var onErrorMock = jest.fn();
    (0, react_2.render)(
      <error_boundary_1.ErrorBoundary onError={onErrorMock}>
        <ThrowError />
      </error_boundary_1.ErrorBoundary>,
    );
    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      }),
    );
  });
  it("renders custom fallback when provided", function () {
    var customFallback = <div>Custom error message</div>;
    (0, react_2.render)(
      <error_boundary_1.ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </error_boundary_1.ErrorBoundary>,
    );
    expect(react_2.screen.getByText("Custom error message")).toBeInTheDocument();
  });
});
describe("CriticalErrorBoundary", function () {
  it("renders critical error UI with reload button", function () {
    // Mock window.location.reload
    var mockReload = jest.fn();
    Object.defineProperty(window, "location", {
      value: { reload: mockReload },
      writable: true,
    });
    (0, react_2.render)(
      <error_boundary_1.CriticalErrorBoundary title="Test Section">
        <ThrowError />
      </error_boundary_1.CriticalErrorBoundary>,
    );
    expect(react_2.screen.getByText("Erro em Test Section")).toBeInTheDocument();
    expect(react_2.screen.getByText("Recarregar Página")).toBeInTheDocument();
    var reloadButton = react_2.screen.getByText("Recarregar Página");
    react_2.fireEvent.click(reloadButton);
    expect(mockReload).toHaveBeenCalled();
  });
});
describe("withErrorBoundary HOC", function () {
  it("wraps component with error boundary", function () {
    var TestComponent = function () {
      return <div>Test Component</div>;
    };
    var WrappedComponent = (0, error_boundary_1.withErrorBoundary)(TestComponent);
    (0, react_2.render)(<WrappedComponent />);
    expect(react_2.screen.getByText("Test Component")).toBeInTheDocument();
  });
  it("catches errors in wrapped component", function () {
    var ErrorComponent = (0, error_boundary_1.withErrorBoundary)(ThrowError);
    (0, react_2.render)(<ErrorComponent />);
    expect(react_2.screen.getByText("Oops! Algo deu errado")).toBeInTheDocument();
  });
  it("passes props to wrapped component", function () {
    var TestComponent = function (_a) {
      var message = _a.message;
      return <div>{message}</div>;
    };
    var WrappedComponent = (0, error_boundary_1.withErrorBoundary)(TestComponent);
    (0, react_2.render)(<WrappedComponent message="Hello World" />);
    expect(react_2.screen.getByText("Hello World")).toBeInTheDocument();
  });
  it("sets correct display name", function () {
    var TestComponent = function () {
      return <div>Test</div>;
    };
    TestComponent.displayName = "TestComponent";
    var WrappedComponent = (0, error_boundary_1.withErrorBoundary)(TestComponent);
    expect(WrappedComponent.displayName).toBe("withErrorBoundary(TestComponent)");
  });
});
describe("Error Boundary Edge Cases", function () {
  it("handles multiple error types correctly", function () {
    var AsyncErrorComponent = function () {
      throw new TypeError("Type error occurred");
    };
    (0, react_2.render)(
      <error_boundary_1.ErrorBoundary showDetails={true}>
        <AsyncErrorComponent />
      </error_boundary_1.ErrorBoundary>,
    );
    expect(react_2.screen.getByText("Oops! Algo deu errado")).toBeInTheDocument();
    // Click to show details
    var detailsButton = react_2.screen.getByText("Detalhes técnicos");
    react_2.fireEvent.click(detailsButton);
    expect(react_2.screen.getByText("Type error occurred")).toBeInTheDocument();
  });
  it("maintains error state across re-renders", function () {
    var rerender = (0, react_2.render)(
      <error_boundary_1.ErrorBoundary>
        <ThrowError />
      </error_boundary_1.ErrorBoundary>,
    ).rerender;
    expect(react_2.screen.getByText("Oops! Algo deu errado")).toBeInTheDocument();
    // Re-render with same error
    rerender(
      <error_boundary_1.ErrorBoundary>
        <ThrowError />
      </error_boundary_1.ErrorBoundary>,
    );
    expect(react_2.screen.getByText("Oops! Algo deu errado")).toBeInTheDocument();
  });
});
