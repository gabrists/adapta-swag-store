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
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-dashed border-slate-200 rounded-xl animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">
          {statusLabel === 'Todos'
            ? 'Nenhuma solicitação encontrada'
            : 'Nenhuma solicitação com este status'}
        </h3>
        <p className="text-slate-500 text-sm mt-1 max-w-xs mb-6">
          {statusLabel === 'Todos'
            ? 'Visite a vitrine para solicitar novos brindes e eles aparecerão aqui.'
            : `Você ainda não tem solicitações com status "${statusLabel}".`}
        </p>
        <Link to="/">
          <Button className="bg-[#0E9C8B] hover:bg-[#0E9C8B]/90">
            Ir para a Vitrine
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
      {orders.map((order) => (
        <Card
          key={order.id}
          className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group"
        >
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* Status Indicator Bar */}
              <div
                className={cn(
                  'w-full sm:w-1.5 h-1.5 sm:h-auto sm:self-stretch flex-shrink-0',
                  order.status === 'Pendente' && 'bg-yellow-400',
                  order.status === 'Entregue' && 'bg-[#0E9C8B]',
                  order.status === 'Rejeitado' && 'bg-red-500',
                )}
              />

              <div className="flex-1 p-5 flex flex-col gap-4">
                {/* Header: Product Info & ID/Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 rounded-lg border border-slate-100 bg-white shrink-0">
                      <AvatarImage
                        src={
                          order.productImage?.startsWith('http') ||
                          order.productImage?.startsWith('data:')
                            ? order.productImage
                            : `https://img.usecurling.com/p/100/100?q=${order.productImage}&dpr=2`
                        }
                        alt={order.productName}
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-lg">
                        {order.productName?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 line-clamp-1 text-base">
                        {order.productName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <span className="font-medium text-slate-700">
                          Qtd: {order.quantity}
                        </span>
                        {order.size && (
                          <>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5 px-1.5 font-normal bg-slate-50 text-slate-600 border-slate-200"
                            >
                              {order.size}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row-reverse sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 whitespace-nowrap">
                      #{order.id.substring(0, 7)}
                    </span>

                    <div className="flex items-center">
                      {order.status === 'Pendente' && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 gap-1.5 py-1 px-2.5 whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5" />
                          Pendente
                        </Badge>
                      )}
                      {order.status === 'Entregue' && (
                        <Badge className="bg-[#0E9C8B]/10 text-[#0E9C8B] border-[#0E9C8B]/20 hover:bg-[#0E9C8B]/20 gap-1.5 py-1 px-2.5 whitespace-nowrap">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Entregue
                        </Badge>
                      )}
                      {order.status === 'Rejeitado' && (
                        <Badge
                          variant="destructive"
                          className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100 gap-1.5 py-1 px-2.5 whitespace-nowrap"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Rejeitado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Info / Instructions */}
                <div className="flex flex-col gap-3 pt-1">
                  {/* Status Specific Messages */}
                  {order.status === 'Pendente' && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-sm text-blue-900">
                      <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div>Retire seu item no RH (Andar 2) das 14h às 17h.</div>
                    </div>
                  )}

                  {order.status === 'Rejeitado' && order.rejectionReason && (
                    <div className="flex items-start gap-2 text-sm text-slate-500 bg-slate-50 p-2.5 rounded-md border border-slate-100">
                      <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium text-slate-700">
                          Motivo:
                        </span>{' '}
                        {order.rejectionReason}
                      </div>
                    </div>
                  )}

                  {/* Date Footer */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                    <Calendar className="w-3.5 h-3.5" />
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
          <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="h-10 w-full max-w-md bg-slate-100 rounded-lg animate-pulse" />
        <div className="space-y-4">
          <div className="h-40 w-full bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-40 w-full bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Meus Pedidos
        </h1>
        <p className="text-sm text-slate-500">
          Acompanhe o status das suas solicitações de brindes.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 mb-6 w-full sm:w-auto overflow-x-auto flex sm:inline-flex justify-start">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-[#0E9C8B] data-[state=active]:text-white data-[state=active]:shadow-md transition-all px-4 sm:px-6"
          >
            Todos
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-[#0E9C8B] data-[state=active]:text-white data-[state=active]:shadow-md transition-all px-4 sm:px-6"
          >
            Pendentes
            {pendingOrders.length > 0 && (
              <span className="ml-2 bg-white/20 text-current text-[10px] px-1.5 py-0.5 rounded-full">
                {pendingOrders.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="delivered"
            className="data-[state=active]:bg-[#0E9C8B] data-[state=active]:text-white data-[state=active]:shadow-md transition-all px-4 sm:px-6"
          >
            Entregues
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="data-[state=active]:bg-[#0E9C8B] data-[state=active]:text-white data-[state=active]:shadow-md transition-all px-4 sm:px-6"
          >
            Rejeitados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <OrderList orders={myOrders} statusLabel="Todos" />
        </TabsContent>
        <TabsContent value="pending" className="mt-0">
          <OrderList orders={pendingOrders} statusLabel="Pendente" />
        </TabsContent>
        <TabsContent value="delivered" className="mt-0">
          <OrderList orders={deliveredOrders} statusLabel="Entregue" />
        </TabsContent>
        <TabsContent value="rejected" className="mt-0">
          <OrderList orders={rejectedOrders} statusLabel="Rejeitado" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
