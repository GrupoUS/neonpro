import { cn, } from '@/lib/utils'
import { Link, useLocation, } from '@tanstack/react-router'
import {
  BarChart3Icon,
  CalendarIcon,
  CreditCardIcon,
  FileTextIcon,
  HomeIcon,
  UsersIcon,
} from 'lucide-react'

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    title: 'Pacientes',
    href: '/patients',
    icon: UsersIcon,
  },
  {
    title: 'Agendamentos',
    href: '/appointments',
    icon: CalendarIcon,
  },
  {
    title: 'Relatórios',
    href: '/dashboard/reports',
    icon: BarChart3Icon,
  },
  {
    title: 'Financeiro',
    href: '/dashboard/financial',
    icon: CreditCardIcon,
  },
]

interface MainNavigationProps {
  className?: string
}

export function MainNavigation({ className, }: MainNavigationProps,) {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <nav className={cn('flex items-center space-x-4 lg:space-x-6', className,)}>
      {navigationItems.map((item,) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/',)

        return (
          <Link
            key={item.href}
            to={item.href as any}
            className={cn(
              'flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground',
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      },)}
    </nav>
  )
}
