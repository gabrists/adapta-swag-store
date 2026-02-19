import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SwagProvider } from '@/stores/useSwagStore'
import { AuthProvider } from '@/stores/useAuthStore'
import Layout from '@/components/Layout'
import AdminLayout from '@/components/AdminLayout'
import RequireAuth from '@/components/RequireAuth'
import Index from '@/pages/Index'
import HistoryPage from '@/pages/History'
import ManageProducts from '@/pages/ManageProducts'
import Login from '@/pages/Login'
import Profile from '@/pages/Profile'
import NotFound from '@/pages/NotFound'
import Dashboard from '@/pages/admin/Dashboard'
import Inventory from '@/pages/admin/Inventory'
import Settings from '@/pages/admin/Settings'

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <AuthProvider>
        <SwagProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<RequireAuth />}>
              {/* Public Storefront Routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/historico" element={<HistoryPage />} />
                <Route path="/gerenciar" element={<ManageProducts />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </SwagProvider>
      </AuthProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
