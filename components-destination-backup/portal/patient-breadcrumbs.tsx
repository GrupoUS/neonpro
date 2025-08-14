// Patient Portal Breadcrumbs Component
// Story 1.3, Task 2: Accessible breadcrumb navigation for patient portal
// Created: WCAG 2.1 AA compliant breadcrumb navigation

"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  title: string
  href?: string
}

interface PatientBreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

// Default breadcrumb mapping for patient portal routes
const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
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
}

export function PatientBreadcrumbs({ items, className }: PatientBreadcrumbsProps) {
  const pathname = usePathname()
  
  // Use provided items or generate from current route
  const breadcrumbItems = React.useMemo(() => {
    if (items) return items
    
    // Try exact match first
    if (routeBreadcrumbs[pathname]) {
      return routeBreadcrumbs[pathname]
    }
    
    // Try pattern matching for dynamic routes
    for (const [pattern, breadcrumbs] of Object.entries(routeBreadcrumbs)) {
      if (pattern.includes('[') && pathname.match(pattern.replace(/\[.*?\]/g, '[^/]+'))) {
        return breadcrumbs
      }
    }
    
    // Fallback: generate from path segments
    const segments = pathname.split('/').filter(Boolean)
    const generatedItems: BreadcrumbItem[] = []
    
    // Always start with home for portal routes
    if (pathname.startsWith('/portal')) {
      generatedItems.push({ title: 'Início', href: '/portal' })
      
      // Add intermediate segments
      for (let i = 2; i < segments.length; i++) {
        const segment = segments[i]
        const href = '/' + segments.slice(0, i + 1).join('/')
        const title = segment.charAt(0).toUpperCase() + segment.slice(1)
        
        if (i === segments.length - 1) {
          // Last item is current page (no href)
          generatedItems.push({ title })
        } else {
          generatedItems.push({ title, href })
        }
      }
    }
    
    return generatedItems
  }, [pathname, items])

  // Don't render if no breadcrumbs or only one item
  if (!breadcrumbItems || breadcrumbItems.length <= 1) {
    return null
  }

  return (
    <nav 
      aria-label="Navegação estrutural" 
      className={cn("mb-6", className)}
    >
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1
            
            return (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage aria-current="page">
                      {item.title}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link 
                        href={item.href!}
                        className="hover:text-primary transition-colors focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1"
                        aria-label={`Ir para ${item.title}`}
                      >
                        {index === 0 && (
                          <Home className="h-4 w-4 inline mr-1" aria-hidden="true" />
                        )}
                        {item.title}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator aria-hidden="true">
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  )
}