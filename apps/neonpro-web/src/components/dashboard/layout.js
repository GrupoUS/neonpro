'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardLayout;
var utils_1 = require("@/lib/utils");
function DashboardLayout(_a) {
    var children = _a.children, className = _a.className, title = _a.title, description = _a.description;
    return (<div className={(0, utils_1.cn)('flex flex-col space-y-6', className)}>
      {(title || description) && (<div className="space-y-2">
          {title && (<h1 className="text-3xl font-bold tracking-tight">{title}</h1>)}
          {description && (<p className="text-muted-foreground">{description}</p>)}
        </div>)}
      <div className="flex-1">{children}</div>
    </div>);
}
