// Patient Portal Breadcrumbs Component
// Story 1.3, Task 2: Accessible breadcrumb navigation for patient portal
// Created: WCAG 2.1 AA compliant breadcrumb navigation
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientBreadcrumbs = PatientBreadcrumbs;
var React = require("react");
var link_1 = require("next/link");
var navigation_1 = require("next/navigation");
var lucide_react_1 = require("lucide-react");
var breadcrumb_1 = require("@/components/ui/breadcrumb");
var utils_1 = require("@/lib/utils");
// Default breadcrumb mapping for patient portal routes
var routeBreadcrumbs = {
    '/portal': [
        { title: 'Início' }
    ],
    '/portal/appointments': [
        { title: 'Início', href: '/portal' },
        { title: 'Agendamentos' }
    ],
    '/portal/appointments/new': [
        { title: 'Início', href: '/portal' },
        { title: 'Agendamentos', href: '/portal/appointments' },
        { title: 'Novo Agendamento' }
    ],
    '/portal/appointments/[id]': [
        { title: 'Início', href: '/portal' },
        { title: 'Agendamentos', href: '/portal/appointments' },
        { title: 'Detalhes' }
    ],
    '/portal/history': [
        { title: 'Início', href: '/portal' },
        { title: 'Histórico' }
    ],
    '/portal/payments': [
        { title: 'Início', href: '/portal' },
        { title: 'Pagamentos' }
    ],
    '/portal/payments/[id]': [
        { title: 'Início', href: '/portal' },
        { title: 'Pagamentos', href: '/portal/payments' },
        { title: 'Fatura' }
    ],
    '/portal/profile': [
        { title: 'Início', href: '/portal' },
        { title: 'Perfil' }
    ],
    '/portal/profile/edit': [
        { title: 'Início', href: '/portal' },
        { title: 'Perfil', href: '/portal/profile' },
        { title: 'Editar' }
    ],
    '/portal/contact': [
        { title: 'Início', href: '/portal' },
        { title: 'Contato' }
    ],
    '/portal/help': [
        { title: 'Início', href: '/portal' },
        { title: 'Ajuda' }
    ]
};
function PatientBreadcrumbs(_a) {
    var items = _a.items, className = _a.className;
    var pathname = (0, navigation_1.usePathname)();
    // Use provided items or generate from current route
    var breadcrumbItems = React.useMemo(function () {
        if (items)
            return items;
        // Try exact match first
        if (routeBreadcrumbs[pathname]) {
            return routeBreadcrumbs[pathname];
        }
        // Try pattern matching for dynamic routes
        for (var _i = 0, _a = Object.entries(routeBreadcrumbs); _i < _a.length; _i++) {
            var _b = _a[_i], pattern = _b[0], breadcrumbs = _b[1];
            if (pattern.includes('[') && pathname.match(pattern.replace(/\[.*?\]/g, '[^/]+'))) {
                return breadcrumbs;
            }
        }
        // Fallback: generate from path segments
        var segments = pathname.split('/').filter(Boolean);
        var generatedItems = [];
        // Always start with home for portal routes
        if (pathname.startsWith('/portal')) {
            generatedItems.push({ title: 'Início', href: '/portal' });
            // Add intermediate segments
            for (var i = 2; i < segments.length; i++) {
                var segment = segments[i];
                var href = '/' + segments.slice(0, i + 1).join('/');
                var title = segment.charAt(0).toUpperCase() + segment.slice(1);
                if (i === segments.length - 1) {
                    // Last item is current page (no href)
                    generatedItems.push({ title: title });
                }
                else {
                    generatedItems.push({ title: title, href: href });
                }
            }
        }
        return generatedItems;
    }, [pathname, items]);
    // Don't render if no breadcrumbs or only one item
    if (!breadcrumbItems || breadcrumbItems.length <= 1) {
        return null;
    }
    return (<nav aria-label="Navegação estrutural" className={(0, utils_1.cn)("mb-6", className)}>
      <breadcrumb_1.Breadcrumb>
        <breadcrumb_1.BreadcrumbList>
          {breadcrumbItems.map(function (item, index) {
            var isLast = index === breadcrumbItems.length - 1;
            return (<React.Fragment key={index}>
                <breadcrumb_1.BreadcrumbItem>
                  {isLast ? (<breadcrumb_1.BreadcrumbPage aria-current="page">
                      {item.title}
                    </breadcrumb_1.BreadcrumbPage>) : (<breadcrumb_1.BreadcrumbLink asChild>
                      <link_1.default href={item.href} className="hover:text-primary transition-colors focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1" aria-label={"Ir para ".concat(item.title)}>
                        {index === 0 && (<lucide_react_1.Home className="h-4 w-4 inline mr-1" aria-hidden="true"/>)}
                        {item.title}
                      </link_1.default>
                    </breadcrumb_1.BreadcrumbLink>)}
                </breadcrumb_1.BreadcrumbItem>
                {!isLast && (<breadcrumb_1.BreadcrumbSeparator aria-hidden="true">
                    <lucide_react_1.ChevronRight className="h-4 w-4"/>
                  </breadcrumb_1.BreadcrumbSeparator>)}
              </React.Fragment>);
        })}
        </breadcrumb_1.BreadcrumbList>
      </breadcrumb_1.Breadcrumb>
    </nav>);
}
