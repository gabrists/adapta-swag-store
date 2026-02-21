import {
  Outlet,
  NavLink,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  Store,
  History,
  Package2,
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  User as UserIcon,
  ChevronsUpDown,
  Plus,
  Users,
  Clock,
  ClipboardCheck,
  Megaphone,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import useAuthStore from '@/stores/useAuthStore'
import { CartSheet } from '@/components/CartSheet'
import { ThemeToggle } from '@/components/ThemeToggle'
import useSwagStore from '@/stores/useSwagStore'
import { cn } from '@/lib/utils'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const { orders } = useSwagStore()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Count pending orders for admin badge
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'Pendente',
  ).length

  const isAdmin = user?.role === 'admin'

  const storefrontItems = [
    {
      title: 'Vitrine',
      url: '/',
      icon: Store,
    },
    {
      title: 'Meus Pedidos',
      url: '/orders',
      icon: Clock,
    },
  ]

  const adminItems = [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: 'Aprovações',
      url: '/admin/approvals',
      icon: ClipboardCheck,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      title: 'Campanhas',
      url: '/admin/campanhas',
      icon: Megaphone,
    },
    {
      title: 'Inventário',
      url: '/admin/inventory',
      icon: Package,
    },
    {
      title: 'Time',
      url: '/admin/collaborators',
      icon: Users,
    },
    {
      title: 'Histórico',
      url: '/historico',
      icon: History,
    },
    {
      title: 'Configurações',
      url: '/admin/settings',
      icon: Settings,
    },
  ]

  return (
    <SidebarProvider>
      <Sidebar
        collapsible="icon"
        className="border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#061412]"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_10px_rgba(20,240,214,0.3)]">
                    <Package2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight text-slate-900 dark:text-white">
                    <span className="truncate font-bold text-[15px]">
                      Adapta Swag
                    </span>
                    <span className="truncate text-xs text-primary font-medium">
                      Store
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-500 dark:text-white/50">
              Loja
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {storefrontItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      tooltip={item.title}
                      className={cn(
                        'text-gray-500 dark:text-[#ADADAD] hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5',
                        location.pathname === item.url &&
                          'bg-gray-200 dark:bg-white/10 text-slate-900 dark:text-white font-medium',
                      )}
                    >
                      <NavLink to={item.url}>
                        <item.icon
                          className={cn(
                            'w-4 h-4',
                            location.pathname === item.url
                              ? 'text-primary'
                              : 'text-gray-500 dark:text-[#ADADAD]',
                          )}
                        />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {isAdmin && (
            <>
              <SidebarSeparator className="bg-gray-200 dark:bg-white/5" />
              <SidebarGroup>
                <SidebarGroupLabel className="text-gray-500 dark:text-white/50">
                  Administração
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {adminItems.map((item) => {
                      const isActive = item.exact
                        ? location.pathname === item.url
                        : location.pathname.startsWith(item.url)

                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.title}
                            className={cn(
                              'text-gray-500 dark:text-[#ADADAD] hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5',
                              isActive &&
                                'bg-gray-200 dark:bg-white/10 text-slate-900 dark:text-white font-medium',
                            )}
                          >
                            <NavLink to={item.url}>
                              <item.icon
                                className={cn(
                                  'w-4 h-4',
                                  isActive
                                    ? 'text-primary'
                                    : 'text-gray-500 dark:text-[#ADADAD]',
                                )}
                              />
                              <span>{item.title}</span>
                              {item.badge && (
                                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-[0_0_10px_rgba(20,240,214,0.3)]">
                                  {item.badge}
                                </span>
                              )}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          )}
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-gray-200 dark:data-[state=open]:bg-white/10 data-[state=open]:text-slate-900 dark:data-[state=open]:text-white text-gray-500 dark:text-[#ADADAD] hover:bg-gray-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Avatar className="h-8 w-8 rounded-lg border border-gray-200 dark:border-white/10">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="rounded-lg bg-primary/20 text-primary">
                        {user?.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold text-slate-900 dark:text-white">
                        {user?.name}
                      </span>
                      <span className="truncate text-xs text-gray-500 dark:text-[#ADADAD]">
                        {user?.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg border border-gray-200 dark:border-white/10">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="rounded-lg bg-primary/20 text-primary">
                          {user?.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold text-slate-900 dark:text-white">
                          {user?.name}
                        </span>
                        <span className="truncate text-xs text-gray-500 dark:text-[#ADADAD]">
                          {user?.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Gerenciar Conta
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Deslogar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-transparent flex flex-col min-h-screen relative">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center w-full bg-white/80 dark:bg-[#081a17]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 transition-[width,height] ease-linear">
          <div className="flex items-center justify-between w-full px-4 md:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1 text-gray-500 dark:text-[#ADADAD] hover:text-slate-900 dark:hover:text-white" />
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#ADADAD]">
                <div className="w-px h-4 bg-gray-300 dark:bg-white/10 mx-2" />
                <span className="font-medium text-slate-900 dark:text-white">
                  {location.pathname.startsWith('/admin')
                    ? 'Administração'
                    : 'Adapta Swag Store'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              {!location.pathname.startsWith('/admin') && <CartSheet />}

              {isAdmin && (
                <>
                  <Button
                    asChild
                    size="sm"
                    className="hidden sm:flex btn-primary-glow shadow-sm"
                  >
                    <Link to="/gerenciar">
                      <Plus className="mr-2 h-4 w-4" />
                      Cadastrar Brinde
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="icon"
                    className="flex sm:hidden btn-primary-glow shadow-sm h-8 w-8"
                  >
                    <Link to="/gerenciar">
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Cadastrar Brinde</span>
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 w-full">
          <main className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 pt-6 animate-fade-in">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
