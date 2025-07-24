import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  title: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6" data-testid="breadcrumb">
      <Link 
        href="/dashboard" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4" />
          {item.href && index < items.length - 1 ? (
            <Link 
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.title}
            </Link>
          ) : (
            <span className="text-foreground font-medium">
              {item.title}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}