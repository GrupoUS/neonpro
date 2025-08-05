Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = ErrorBoundary;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var alert_1 = require("@/components/ui/alert");
function ErrorBoundary(_a) {
  var error = _a.error,
    onRetry = _a.onRetry,
    _b = _a.title,
    title = _b === void 0 ? "Error loading documents" : _b,
    _c = _a.description,
    description = _c === void 0 ? "An error occurred while loading the regulatory documents." : _c;
  if (!error) return null;
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <alert_1.Alert variant="destructive" className="max-w-md">
        <lucide_react_1.AlertTriangle className="h-4 w-4" />
        <alert_1.AlertTitle>{title}</alert_1.AlertTitle>
        <alert_1.AlertDescription className="mt-2">
          {description}
          {error && <div className="mt-2 p-2 bg-muted rounded text-sm font-mono">{error}</div>}
        </alert_1.AlertDescription>
      </alert_1.Alert>

      {onRetry && (
        <button_1.Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
          <lucide_react_1.RefreshCw className="h-4 w-4" />
          Try Again
        </button_1.Button>
      )}
    </div>
  );
}
