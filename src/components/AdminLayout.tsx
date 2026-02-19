import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Settings,
  Package2,
  Menu,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { UserProfile } from '@/components/UserProfile'

export default function AdminLayout() {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const navItems = [
    {
      path: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      path: '/admin/inventory',
      label: 'Inventário',
      icon: Package,
    },
    {
      path: '/admin/settings',
      label: 'Configurações',
      icon: Settings,
    },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Package2 className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">
            Adapta <span className="text-primary">Swag</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path)

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800',
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors border border-slate-700 rounded-md hover:bg-slate-800"
        >
          Voltar para Vitrine
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Header with User Profile (Both Mobile and Desktop) */}
        <header className="h-16 bg-white md:bg-transparent border-b border-slate-200 md:border-transparent flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-2 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 hover:bg-slate-100"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="p-0 w-64 border-r-slate-800 bg-slate-900 text-slate-100"
              >
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <Package2 className="w-5 h-5" />
              </div>
            </Link>
          </div>

          <div className="ml-auto">
            <UserProfile />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 pt-0 md:pt-0 max-w-7xl mx-auto w-full animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
