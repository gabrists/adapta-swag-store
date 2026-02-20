import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import useSwagStore from '@/stores/useSwagStore'
import useAuthStore from '@/stores/useAuthStore'
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Calendar,
  AlertCircle,
  MapPin,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Order } from '@/types'

const OrderList = ({
  orders,
  statusLabel,
}: {
  orders: Order[]
  statusLabel: string
}) => {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Package className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">
          {statusLabel === 'Todos'
            ? 'Nenhuma solicitação encontrada'
            : 'Nenhuma solicitação com este status'}
        </h3>
        <p className="text-slate-400 text-sm mt-2 max-w-sm mb-8">
          {statusLabel === 'Todos'
            ? 'Visite a vitrine para solicitar novos brindes e eles aparecerão aqui.'
            : `Você ainda não tem solicitações com status "${statusLabel}".`}
        </p>
        <Link to="/">
          <Button className="btn-primary-glow">Ir para a Vitrine</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-500">
      {orders.map((order) => (
        <Card
          key={order.id}
          className="overflow-hidden glass-panel glass-panel-hover group"
        >
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* Status Indicator Bar */}
              <div
                className={cn(
                  'w-full sm:w-2 h-2 sm:h-auto sm:self-stretch flex-shrink-0',
                  order.status === 'Pendente' && 'bg-cyan-500',
                  order.status === 'Entregue' && 'bg-primary',
                  order.status === 'Rejeitado' && 'bg-red-500',
                )}
              />

              <div className="flex-1 p-5 md:p-6 flex flex-col gap-5">
                {/* Header: Product Info & ID/Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <Avatar className="h-16 w-16 rounded-xl border border-white/10 bg-black/40 shrink-0">
                      <AvatarImage
                        src={
                          order.productImage?.startsWith('http') ||
                          order.productImage?.startsWith('data:')
                            ? order.productImage
                            : `https://img.usecurling.com/p/100/100?q=${order.productImage}&dpr=2`
                        }
                        alt={order.productName}
                        className="object-cover rounded-xl"
                      />
                      <AvatarFallback className="rounded-xl bg-white/5 text-slate-400 font-bold">
                        {order.productName?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white text-lg line-clamp-1">
                        {order.productName}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-400 mt-1.5">
                        <span className="font-medium bg-white/5 px-2 py-0.5 rounded-md">
                          Qtd: {order.quantity}
                        </span>
                        {order.size && (
                          <>
                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                            <Badge
                              variant="outline"
                              className="text-xs h-6 px-2 font-medium bg-transparent text-slate-300 border-white/10"
                            >
                              {order.size}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row-reverse sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2">
                    <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-1 rounded-md border border-white/5 whitespace-nowrap">
                      #{order.id.substring(0, 7)}
                    </span>

                    <div className="flex items-center">
                      {order.status === 'Pendente' && (
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30 gap-1.5 py-1 px-3 whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5" />
                          Pendente
                        </Badge>
                      )}
                      {order.status === 'Entregue' && (
                        <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 gap-1.5 py-1 px-3 whitespace-nowrap">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Entregue
                        </Badge>
                      )}
                      {order.status === 'Rejeitado' && (
                        <Badge
                          variant="destructive"
                          className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 gap-1.5 py-1 px-3 whitespace-nowrap"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Rejeitado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Info / Instructions */}
                <div className="flex flex-col gap-4 pt-2 border-t border-white/5">
                  {/* Status Specific Messages */}
                  {order.status === 'Pendente' && (
                    <div className="flex items-start gap-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-sm text-cyan-200">
                      <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      <div>Retire seu item no RH (Andar 2) das 14h às 17h.</div>
                    </div>
                  )}

                  {order.status === 'Rejeitado' && order.rejectionReason && (
                    <div className="flex items-start gap-3 text-sm text-slate-300 bg-white/5 p-3 rounded-xl border border-white/10">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium text-white">Motivo:</span>{' '}
                        {order.rejectionReason}
                      </div>
                    </div>
                  )}

                  {/* Date Footer */}
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Calendar className="w-4 h-4" />
                    Solicitado em{' '}
                    {format(parseISO(order.createdAt), "d 'de' MMMM, HH:mm", {
                      locale: ptBR,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function OrdersPage() {
  const { orders, isLoading } = useSwagStore()
  const { user } = useAuthStore()

  // Filter orders for current user
  const myOrders = useMemo(() => {
    if (!user) return []
    return orders.filter((order) => order.employeeEmail === user.email)
  }, [orders, user])

  const pendingOrders = myOrders.filter((o) => o.status === 'Pendente')
  const deliveredOrders = myOrders.filter((o) => o.status === 'Entregue')
  const rejectedOrders = myOrders.filter((o) => o.status === 'Rejeitado')

  if (isLoading) {
    return (
      <div className="space-y-6 w-full max-w-7xl mx-auto p-4 sm:p-0">
        <div className="space-y-2">
          <div className="h-10 w-48 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="h-12 w-full max-w-md bg-white/5 rounded-xl animate-pulse" />
        <div className="space-y-4">
          <div className="h-48 w-full bg-white/5 rounded-2xl animate-pulse" />
          <div className="h-48 w-full bg-white/5 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 w-full max-w-7xl mx-auto pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Meus Pedidos
        </h1>
        <p className="text-base text-slate-400">
          Acompanhe o status das suas solicitações de brindes.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-black/20 p-1.5 mb-8 w-full sm:w-auto overflow-x-auto flex sm:inline-flex justify-start border border-white/5 rounded-xl">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/50 border border-transparent transition-all px-5 py-2 rounded-lg text-slate-400 font-medium"
          >
            Todos
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/50 border border-transparent transition-all px-5 py-2 rounded-lg text-slate-400 font-medium"
          >
            Pendentes
            {pendingOrders.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(20,240,214,0.3)]">
                {pendingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="delivered"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/50 border border-transparent transition-all px-5 py-2 rounded-lg text-slate-400 font-medium"
          >
            Entregues
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/50 border border-transparent transition-all px-5 py-2 rounded-lg text-slate-400 font-medium"
          >
            Rejeitados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0 outline-none">
          <OrderList orders={myOrders} statusLabel="Todos" />
        </TabsContent>
        <TabsContent value="pending" className="mt-0 outline-none">
          <OrderList orders={pendingOrders} statusLabel="Pendente" />
        </TabsContent>
        <TabsContent value="delivered" className="mt-0 outline-none">
          <OrderList orders={deliveredOrders} statusLabel="Entregue" />
        </TabsContent>
        <TabsContent value="rejected" className="mt-0 outline-none">
          <OrderList orders={rejectedOrders} statusLabel="Rejeitado" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
