Object.defineProperty(exports, "__esModule", { value: true });
exports.useIsMobile = useIsMobile;
var React = require("react");
var MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  var _a = React.useState(undefined),
    isMobile = _a[0],
    setIsMobile = _a[1];
  React.useEffect(() => {
    var mql = window.matchMedia("(max-width: ".concat(MOBILE_BREAKPOINT - 1, "px)"));
    var onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
