"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreadcrumbSeparator = exports.BreadcrumbPage = exports.BreadcrumbLink = exports.BreadcrumbItem = exports.BreadcrumbList = exports.Breadcrumb = void 0;
exports.BreadcrumbLegacy = BreadcrumbLegacy;
var react_1 = require("react");
var link_1 = require("next/link");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var BreadcrumbRoot = react_1.default.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<nav ref={ref} aria-label="breadcrumb" className={(0, utils_1.cn)("flex items-center space-x-1 text-sm text-muted-foreground", className)} {...props}/>);
});
exports.Breadcrumb = BreadcrumbRoot;
BreadcrumbRoot.displayName = "Breadcrumb";
var BreadcrumbList = react_1.default.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<ol ref={ref} className={(0, utils_1.cn)("flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5", className)} {...props}/>);
});
exports.BreadcrumbList = BreadcrumbList;
BreadcrumbList.displayName = "BreadcrumbList";
var BreadcrumbItem = react_1.default.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<li ref={ref} className={(0, utils_1.cn)("inline-flex items-center gap-1.5", className)} {...props}/>);
});
exports.BreadcrumbItem = BreadcrumbItem;
BreadcrumbItem.displayName = "BreadcrumbItem";
var BreadcrumbLink = react_1.default.forwardRef(function (_a, ref) {
    var className = _a.className, href = _a.href, children = _a.children, props = __rest(_a, ["className", "href", "children"]);
    if (href) {
        return (<link_1.default ref={ref} href={href} className={(0, utils_1.cn)("transition-colors hover:text-foreground", className)} {...props}>
        {children}
      </link_1.default>);
    }
    return (<a ref={ref} className={(0, utils_1.cn)("transition-colors hover:text-foreground", className)} {...props}>
      {children}
    </a>);
});
exports.BreadcrumbLink = BreadcrumbLink;
BreadcrumbLink.displayName = "BreadcrumbLink";
var BreadcrumbPage = react_1.default.forwardRef(function (_a, ref) {
    var className = _a.className, props = __rest(_a, ["className"]);
    return (<span ref={ref} role="link" aria-disabled="true" aria-current="page" className={(0, utils_1.cn)("font-normal text-foreground", className)} {...props}/>);
});
exports.BreadcrumbPage = BreadcrumbPage;
BreadcrumbPage.displayName = "BreadcrumbPage";
var BreadcrumbSeparator = function (_a) {
    var children = _a.children, className = _a.className, props = __rest(_a, ["children", "className"]);
    return (<li role="presentation" aria-hidden="true" className={(0, utils_1.cn)("[&>svg]:size-3.5", className)} {...props}>
    {children !== null && children !== void 0 ? children : <lucide_react_1.ChevronRight />}
  </li>);
};
exports.BreadcrumbSeparator = BreadcrumbSeparator;
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";
// Legacy component for backward compatibility
function BreadcrumbLegacy(_a) {
    var items = _a.items, className = _a.className;
    return (<nav className={(0, utils_1.cn)("flex items-center space-x-1 text-sm text-muted-foreground mb-6", className)} data-testid="breadcrumb">
      <link_1.default href="/dashboard" className="flex items-center hover:text-foreground transition-colors">
        <lucide_react_1.Home className="h-4 w-4"/>
      </link_1.default>
      
      {items.map(function (item, index) { return (<react_1.default.Fragment key={index}>
          <lucide_react_1.ChevronRight className="h-4 w-4"/>
          {item.href && index < items.length - 1 ? (<link_1.default href={item.href} className="hover:text-foreground transition-colors">
              {item.title}
            </link_1.default>) : (<span className="text-foreground font-medium">
              {item.title}
            </span>)}
        </react_1.default.Fragment>); })}
    </nav>);
}
