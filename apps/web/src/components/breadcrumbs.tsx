import { cn, } from '@/lib/utils'
import { Link, useLocation, } from '@tanstack/react-router'
import { ChevronRightIcon, HomeIcon, } from 'lucide-react'

interface BreadcrumbItem {
  title: string
  href?: string
  isLast?: boolean
}

interface BreadcrumbsProps {
  className?: string
  items?: BreadcrumbItem[]
}

export function Breadcrumbs({ className, items, }: BreadcrumbsProps,) {
  const location = useLocation()
  const pathname = location.pathname

  // Auto-generate breadcrumbs from path if items not provided
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname,)

  return (
    <nav className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className,)}>
      <Link
        to="/"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <HomeIcon className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>

      {breadcrumbItems.map((item, index,) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRightIcon className="h-4 w-4" />
          {item.href && !item.isLast
            ? (
              <Link
                to={item.href as any}
                className="hover:text-foreground transition-colors"
              >
                {item.title}
              </Link>
            )
            : (
              <span className={cn(item.isLast && 'text-foreground font-medium',)}>
                {item.title}
              </span>
            )}
        </div>
      ))}
    </nav>
  )
}
function generateBreadcrumbsFromPath(pathname: string,): BreadcrumbItem[] {
  const segments = pathname.split('/',).filter(Boolean,)
  const breadcrumbs: BreadcrumbItem[] = []

  const pathMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'patients': 'Pacientes',
    'appointments': 'Agendamentos',
    'treatments': 'Tratamentos',
    'reports': 'Relatórios',
    'financial': 'Financeiro',
    'login': 'Login',
  }

  segments.forEach((segment, index,) => {
    const isLast = index === segments.length - 1
    const href = `/${segments.slice(0, index + 1,).join('/',)}`

    breadcrumbs.push({
      title: pathMap[segment] || segment.charAt(0,).toUpperCase() + segment.slice(1,),
      href: isLast ? undefined : href,
      isLast,
    },)
  },)

  return breadcrumbs
}
