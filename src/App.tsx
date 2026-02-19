import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SwagProvider } from '@/stores/useSwagStore'
import { AuthProvider } from '@/stores/useAuthStore'
import Layout from '@/components/Layout'
import RequireAuth from '@/components/RequireAuth'
import RequireAdmin from '@/components/RequireAdmin'
import Index from '@/pages/Index'
import HistoryPage from '@/pages/History'
import ManageProducts from '@/pages/ManageProducts'
import Login from '@/pages/Login'
import Profile from '@/pages/Profile'
import NotFound from '@/pages/NotFound'
import OrdersPage from '@/pages/Orders'
import Dashboard from '@/pages/admin/Dashboard'
import Inventory from '@/pages/admin/Inventory'
import Settings from '@/pages/admin/Settings'
import Collaborators from '@/pages/admin/Collaborators'
import ApprovalsPage from '@/pages/admin/Approvals'

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
              <Route element={<Layout />}>
                {/* Storefront Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/profile" element={<Profile />} />

                {/* Admin Routes - Protected by RequireAdmin */}
                <Route element={<RequireAdmin />}>
                  <Route path="/historico" element={<HistoryPage />} />
                  <Route path="/gerenciar" element={<ManageProducts />} />
                  <Route path="/admin">
                    <Route index element={<Dashboard />} />
                    <Route path="approvals" element={<ApprovalsPage />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="collaborators" element={<Collaborators />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>
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
