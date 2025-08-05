Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingSpinner = LoadingSpinner;
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};
function LoadingSpinner(_a) {
  var _b = _a.size,
    size = _b === void 0 ? "md" : _b,
    className = _a.className,
    text = _a.text;
  return (
    <div className="flex items-center gap-2">
      <lucide_react_1.Loader2
        className={(0, utils_1.cn)("animate-spin text-primary", sizeClasses[size], className)}
      />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}
