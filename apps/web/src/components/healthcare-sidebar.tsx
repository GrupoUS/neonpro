import { Sidebar, } from '@/components/ui/sidebar'
import { cn, } from '@/lib/utils'
import { Link, useLocation, } from '@tanstack/react-router'
import { Calendar, Home, Shield, User, Users, } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, },
  { name: 'Pacientes', href: '/patients', icon: Users, },
  { name: 'Agendamentos', href: '/appointments', icon: Calendar, },
  { name: 'Compliance', href: '/compliance', icon: Shield, },
  { name: 'Perfil', href: '/profile', icon: User, },
]

export function HealthcareSidebar() {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <Sidebar>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center px-6">
          <h1 className="text-xl font-bold text-white">NeonPro</h1>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col px-6 pb-4">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item,) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        pathname === item.href
                          ? 'bg-indigo-700 text-white'
                          : 'text-indigo-200 hover:text-white hover:bg-indigo-700',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                      )}
                    >
                      <item.icon
                        className={cn(
                          pathname === item.href
                            ? 'text-white'
                            : 'text-indigo-200 group-hover:text-white',
                          'h-6 w-6 shrink-0',
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </Sidebar>
  )
}
