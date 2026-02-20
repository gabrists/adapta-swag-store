import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import useSwagStore from '@/stores/useSwagStore'
import useAuthStore from '@/stores/useAuthStore'
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
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
        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Package className="w-10 h-10 text-slate-700 dark:text-white" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
          {statusLabel === 'Todos'
            ? 'Nenhuma solicitação encontrada'
            : 'Nenhuma solicitação com este status'}
        </h3>
        <p className="text-slate-500 dark:text-gray-300 text-sm mt-2 max-w-sm mb-8">
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
    <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-500">
      {orders.map((order) => (
        <Card
          key={order.id}
          className="overflow-hidden glass-panel glass-panel-hover group relative rounded-xl"
        >
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* Status Indicator Bar */}
              <div
                className={cn(
                  'w-full sm:w-1.5 h-1.5 sm:h-auto sm:self-stretch flex-shrink-0',
                  order.status === 'Pendente' && 'bg-cyan-500',
                  order.status === 'Entregue' && 'bg-primary',
                  order.status === 'Rejeitado' && 'bg-red-500',
                )}
              />

              <div className="flex-1 p-3 sm:px-4 sm:py-3.5 flex flex-col gap-2.5">
                {/* Header: Product Info & ID/Status */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 shrink-0">
                      <AvatarImage
                        src={
                          order.productImage?.startsWith('http') ||
                          order.productImage?.startsWith('data:')
                            ? order.productImage
                            : `https://img.usecurling.com/p/100/100?q=${order.productImage}&dpr=2`
                        }
                        alt={order.productName}
                        className="object-cover rounded-lg"
                      />
                      <AvatarFallback className="rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white font-bold text-xs">
                        {order.productName?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-[15px] sm:text-base leading-tight truncate">
                        {order.productName}
                      </h3>
                      <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
                        Qtd: {order.quantity}
                        {order.size && ` • Tam: ${order.size}`}
                        {' • '}
                        {format(parseISO(order.createdAt), 'd MMM, HH:mm', {
                          locale: ptBR,
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      #{order.id.substring(0, 7)}
                    </span>

                    {order.status === 'Pendente' && (
                      <Badge className="bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20 gap-1 py-0 px-2 text-[10px] sm:text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Pendente
                      </Badge>
                    )}
                    {order.status === 'Entregue' && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 py-0 px-2 text-[10px] sm:text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Entregue
                      </Badge>
                    )}
                    {order.status === 'Rejeitado' && (
                      <Badge
                        variant="destructive"
                        className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 gap-1 py-0 px-2 text-[10px] sm:text-xs font-medium"
                      >
                        <XCircle className="w-3 h-3" />
                        Rejeitado
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Additional Info / Instructions */}
                {(order.status === 'Entregue' ||
                  (order.status === 'Rejeitado' && order.rejectionReason)) && (
                  <div className="ml-[54px] sm:ml-[62px]">
                    {order.status === 'Entregue' && (
                      <div className="flex items-start gap-2 p-2.5 bg-cyan-50 dark:bg-cyan-500/5 border border-cyan-100 dark:border-cyan-500/10 rounded-lg text-xs text-cyan-800 dark:text-cyan-200">
                        <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
                        <div className="leading-relaxed">
                          Retire seu item no RH (Andar 2) das 14h às 17h.
                        </div>
                      </div>
                    )}

                    {order.status === 'Rejeitado' && order.rejectionReason && (
                      <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-2.5 rounded-lg border border-slate-100 dark:border-white/5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                        <div className="leading-relaxed">
                          <span className="font-medium text-slate-900 dark:text-white">
                            Motivo:
                          </span>{' '}
                          {order.rejectionReason}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
          <div className="h-10 w-48 bg-slate-200 dark:bg-white/5 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-white/5 rounded animate-pulse" />
        </div>
        <div className="h-12 w-full max-w-md bg-slate-200 dark:bg-white/5 rounded-xl animate-pulse" />
        <div className="space-y-3">
          <div className="h-24 w-full bg-slate-200 dark:bg-white/5 rounded-xl animate-pulse" />
          <div className="h-24 w-full bg-slate-200 dark:bg-white/5 rounded-xl animate-pulse" />
          <div className="h-24 w-full bg-slate-200 dark:bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  const tabsTriggerBaseClass =
    'data-[state=active]:bg-primary/10 dark:data-[state=active]:bg-primary/20 data-[state=active]:text-primary dark:data-[state=active]:text-primary data-[state=active]:border-primary/30 dark:data-[state=active]:border-primary/50 border border-transparent transition-all px-5 py-2 rounded-lg text-slate-600 dark:text-white font-medium'

  return (
    <div className="space-y-6 md:space-y-8 w-full max-w-7xl mx-auto pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Meus Pedidos
        </h1>
        <p className="text-base text-slate-600 dark:text-gray-300">
          Acompanhe o status das suas solicitações de brindes na Adapta Swag
          Store.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-black/20 p-1.5 mb-8 w-full sm:w-auto overflow-x-auto flex sm:inline-flex justify-start border border-slate-200 dark:border-white/5 rounded-xl">
          <TabsTrigger value="all" className={tabsTriggerBaseClass}>
            Todos
          </TabsTrigger>
          <TabsTrigger value="pending" className={tabsTriggerBaseClass}>
            Pendentes
            {pendingOrders.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(20,240,214,0.3)]">
                {pendingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="delivered" className={tabsTriggerBaseClass}>
            Entregues
          </TabsTrigger>
          <TabsTrigger value="rejected" className={tabsTriggerBaseClass}>
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
