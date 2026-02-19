import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Store, History, Package2, PackagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default function Layout() {
  const location = useLocation()

  const navItems = [
    {
      path: '/',
      label: 'Vitrine',
      icon: Store,
    },
    {
      path: '/historico',
      label: 'Histórico',
      icon: History,
    },
    {
      path: '/gerenciar',
      label: 'Cadastrar Brinde',
      icon: PackagePlus,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Desktop Header */}
      <header className="hidden md:block bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Package2 className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-slate-900">
              Adapta <span className="text-primary">Swag</span>
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isPrimaryAction = item.path === '/gerenciar'

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      isPrimaryAction
                        ? buttonVariants({ variant: 'default', size: 'sm' })
                        : 'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2',
                      !isPrimaryAction &&
                        (isActive
                          ? 'bg-slate-100 text-primary'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'),
                      isPrimaryAction && 'ml-2 gap-2 shadow-sm',
                    )
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 pb-24 md:pb-6 animate-fade-in">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform',
                  isActive
                    ? 'text-primary'
                    : 'text-slate-400 hover:text-slate-600',
                )
              }
            >
              <item.icon
                className={cn(
                  'w-6 h-6',
                  location.pathname === item.path && 'fill-current/10',
                )}
              />
              <span className="text-[10px] font-medium leading-tight text-center px-1">
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
