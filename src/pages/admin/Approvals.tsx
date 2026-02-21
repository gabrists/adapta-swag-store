import { useState, useMemo, useEffect } from 'react'
import useSwagStore from '@/stores/useSwagStore'
import { CheckCircle, Clock, Search, Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Order } from '@/types'

interface OrderGroup {
  id: string
  shortId: string
  employeeId: string
  employeeName: string
  employeeAvatar: string
  createdAt: string
  items: Order[]
}

export default function ApprovalsPage() {
  const { orders, approveOrder, rejectOrder, isLoading } = useSwagStore()
  const [searchQuery, setSearchQuery] = useState('')

  const [localResolved, setLocalResolved] = useState<
    Record<string, 'Aprovado' | 'Rejeitado'>
  >({})
  const [resolvingGroups, setResolvingGroups] = useState<Set<string>>(new Set())
  const [fadingGroups, setFadingGroups] = useState<Set<string>>(new Set())
  const [removedGroups, setRemovedGroups] = useState<Set<string>>(new Set())

  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean
    orders: Order[]
    reason: string
  }>({
    open: false,
    orders: [],
    reason: '',
  })

  const groupedOrders = useMemo(() => {
    const groupsMap = new Map<string, OrderGroup>()

    orders.forEach((order) => {
      const isPending = order.status === 'Pendente'
      const isLocallyResolved = localResolved[order.id] !== undefined

      if (!isPending && !isLocallyResolved) return

      const matchesSearch =
        order.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.productName?.toLowerCase().includes(searchQuery.toLowerCase())

      if (searchQuery && !matchesSearch) return

      const timeKey = order.createdAt.substring(0, 16)
      const groupId = `${order.employeeId}-${timeKey}`

      if (!groupsMap.has(groupId)) {
        groupsMap.set(groupId, {
          id: groupId,
          shortId: order.id.substring(0, 6).toUpperCase(),
          employeeId: order.employeeId,
          employeeName: order.employeeName || 'Desconhecido',
          employeeAvatar: order.employeeAvatar || '',
          createdAt: order.createdAt,
          items: [],
        })
      }
      groupsMap.get(groupId)!.items.push(order)
    })

    return Array.from(groupsMap.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [orders, searchQuery, localResolved])

  const isGroupFullyResolved = (group: OrderGroup) => {
    return group.items.every(
      (item) => item.status !== 'Pendente' || localResolved[item.id],
    )
  }

  useEffect(() => {
    groupedOrders.forEach((group) => {
      if (isGroupFullyResolved(group) && !resolvingGroups.has(group.id)) {
        setResolvingGroups((prev) => new Set(prev).add(group.id))

        setTimeout(() => {
          setFadingGroups((prev) => new Set(prev).add(group.id))
          setTimeout(() => {
            setRemovedGroups((prev) => new Set(prev).add(group.id))
          }, 500)
        }, 1500)
      }
    })
  }, [groupedOrders, localResolved, resolvingGroups])

  const visibleGroups = useMemo(() => {
    return groupedOrders.filter((g) => {
      if (!isGroupFullyResolved(g)) return true
      return !removedGroups.has(g.id)
    })
  }, [groupedOrders, removedGroups, localResolved])

  const getGroupStatus = (group: OrderGroup) => {
    let hasPending = false
    let hasApproved = false
    let hasRejected = false

    group.items.forEach((item) => {
      const isLocalApp = localResolved[item.id] === 'Aprovado'
      const isLocalRej = localResolved[item.id] === 'Rejeitado'
      const isStoreApp = item.status === 'Entregue'
      const isStoreRej = item.status === 'Rejeitado'

      if (isLocalApp || isStoreApp) hasApproved = true
      else if (isLocalRej || isStoreRej) hasRejected = true
      else hasPending = true
    })

    if (hasPending) {
      if (hasApproved || hasRejected) return 'Parcialmente Processado'
      return 'Pendente'
    }

    if (hasApproved && hasRejected) return 'Aprovado Parcialmente'
    if (hasApproved) return 'Aprovado'
    if (hasRejected) return 'Rejeitado'

    return 'Pendente'
  }

  const handleApproveClick = async (order: Order) => {
    setLocalResolved((prev) => ({ ...prev, [order.id]: 'Aprovado' }))
    await approveOrder(order)
  }

  const handleBulkApproveClick = async (group: OrderGroup) => {
    const pendingItems = group.items.filter(
      (item) => item.status === 'Pendente' && !localResolved[item.id],
    )
    if (pendingItems.length === 0) return

    setLocalResolved((prev) => {
      const next = { ...prev }
      pendingItems.forEach((o) => {
        next[o.id] = 'Aprovado'
      })
      return next
    })

    await Promise.all(pendingItems.map((o) => approveOrder(o)))
  }

  const handleRejectClick = (order: Order) => {
    setRejectDialog({
      open: true,
      orders: [order],
      reason: '',
    })
  }

  const handleBulkRejectClick = (group: OrderGroup) => {
    const pendingItems = group.items.filter(
      (item) => item.status === 'Pendente' && !localResolved[item.id],
    )
    if (pendingItems.length === 0) return
    setRejectDialog({
      open: true,
      orders: pendingItems,
      reason: '',
    })
  }

  const confirmReject = async () => {
    if (rejectDialog.orders.length > 0 && rejectDialog.reason.trim()) {
      const ordersToReject = rejectDialog.orders
      const reason = rejectDialog.reason

      setLocalResolved((prev) => {
        const next = { ...prev }
        ordersToReject.forEach((o) => {
          next[o.id] = 'Rejeitado'
        })
        return next
      })

      setRejectDialog({ open: false, orders: [], reason: '' })

      await Promise.all(ordersToReject.map((o) => rejectOrder(o.id, reason)))
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-gray-200 dark:bg-white/5 rounded-lg animate-pulse" />
        <div className="h-32 w-full bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Fila de Pedidos
          </h1>
          <p className="text-base text-gray-600 dark:text-[#ADADAD]">
            Gerencie as solicitações de brindes pendentes de aprovação.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 dark:text-[#ADADAD]" />
          <Input
            placeholder="Buscar por nome ou item..."
            className="pl-11 h-12 text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {visibleGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-2xl border-dashed">
          <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <CheckCircle className="w-10 h-10 text-[#0E9C8B]" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Fila vazia!
          </h3>
          <p className="text-gray-500 dark:text-[#ADADAD] text-sm mt-2">
            Não há solicitações pendentes no momento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {visibleGroups.map((group) => {
            const groupStatus = getGroupStatus(group)
            const fullyResolved = isGroupFullyResolved(group)
            const isFading = fullyResolved && fadingGroups.has(group.id)

            return (
              <Card
                key={group.id}
                className={cn(
                  'overflow-hidden transition-all duration-500 border-gray-200 dark:border-white/10 dark:bg-white/[0.02]',
                  isFading
                    ? 'opacity-0 scale-95 pointer-events-none'
                    : 'opacity-100 scale-100',
                )}
              >
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-black/20 border-b border-gray-100 dark:border-white/5 pb-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-11 w-11 border border-gray-200 dark:border-white/10 shrink-0">
                      <AvatarImage
                        src={group.employeeAvatar}
                        alt={group.employeeName}
                      />
                      <AvatarFallback className="bg-primary/20 text-primary font-bold">
                        {group.employeeName?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white text-base">
                          {group.employeeName}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 px-2 font-medium border-gray-300 dark:border-white/20 text-gray-500 dark:text-[#ADADAD] uppercase tracking-wider"
                        >
                          #PED-{group.shortId}
                        </Badge>
                        {groupStatus !== 'Pendente' &&
                          groupStatus !== 'Parcialmente Processado' && (
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] h-5 px-2 font-medium border',
                                groupStatus === 'Aprovado Parcialmente'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                  : groupStatus === 'Aprovado'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                              )}
                            >
                              {groupStatus}
                            </Badge>
                          )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-[#ADADAD] flex items-center gap-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {format(
                          parseISO(group.createdAt),
                          "d 'de' MMMM, HH:mm",
                          { locale: ptBR },
                        )}
                      </div>
                    </div>
                  </div>

                  {(groupStatus === 'Pendente' ||
                    groupStatus === 'Parcialmente Processado') && (
                    <div className="flex items-center gap-2 mt-2 sm:mt-0 self-start sm:self-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-4 text-xs font-semibold border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#ADADAD] hover:text-red-600 dark:hover:text-red-400 hover:border-red-600 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300"
                        onClick={() => handleBulkRejectClick(group)}
                      >
                        <X className="w-3.5 h-3.5 mr-1.5" />
                        Rejeitar Tudo
                      </Button>
                      <Button
                        size="sm"
                        className="h-9 px-4 text-xs font-semibold bg-[#0E9C8B] hover:bg-[#0E9C8B]/90 text-white border-transparent transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(14,156,139,0.3)]"
                        onClick={() => handleBulkApproveClick(group)}
                      >
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        Aprovar Tudo
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-col">
                    {group.items.map((item, index) => {
                      const isLocalApp = localResolved[item.id] === 'Aprovado'
                      const isLocalRej = localResolved[item.id] === 'Rejeitado'
                      const isStoreApp = item.status === 'Entregue'
                      const isStoreRej = item.status === 'Rejeitado'
                      const isResolved =
                        isLocalApp || isLocalRej || isStoreApp || isStoreRej
                      const finalStatus =
                        isLocalApp || isStoreApp
                          ? 'Aprovado'
                          : isLocalRej || isStoreRej
                            ? 'Rejeitado'
                            : 'Pendente'

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            'flex items-center justify-between p-4 transition-colors duration-300',
                            index !== group.items.length - 1
                              ? 'border-b border-gray-100 dark:border-white/5'
                              : '',
                            isResolved &&
                              'opacity-60 bg-gray-50/50 dark:bg-white/[0.01]',
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 overflow-hidden shrink-0">
                              <img
                                src={
                                  item.productImage?.startsWith('http') ||
                                  item.productImage?.startsWith('data:')
                                    ? item.productImage
                                    : `https://img.usecurling.com/p/100/100?q=${item.productImage}&dpr=2`
                                }
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white text-sm">
                                {item.productName}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] h-4 px-1.5 font-medium bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-[#ADADAD] border-transparent"
                                >
                                  Qtd: {item.quantity}
                                </Badge>
                                {item.size && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] h-4 px-1.5 font-medium border-gray-300 dark:border-white/20 text-gray-600 dark:text-[#ADADAD]"
                                  >
                                    Tam: {item.size}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {!isResolved ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#ADADAD] hover:text-red-600 dark:hover:text-red-400 hover:border-red-600 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                  onClick={() => handleRejectClick(item)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#ADADAD] hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-600 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                                  onClick={() => handleApproveClick(item)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px] h-6 px-2.5 font-medium border-transparent',
                                  finalStatus === 'Aprovado'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-red-500/10 text-red-600 dark:text-red-400',
                                )}
                              >
                                {finalStatus}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              Rejeitar Solicitação
            </DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-[#ADADAD]">
              {rejectDialog.orders.length > 1
                ? `Você está rejeitando ${rejectDialog.orders.length} itens deste pedido. Informe o motivo para o colaborador.`
                : 'Informe o motivo da rejeição para que o colaborador saiba o que aconteceu.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Ex: Item indisponível no estoque físico..."
              value={rejectDialog.reason}
              onChange={(e) =>
                setRejectDialog((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              className="min-h-[120px] text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRejectDialog({ open: false, orders: [], reason: '' })
              }
              className="btn-secondary-outline border-gray-200 dark:border-white/10 text-slate-900 dark:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmReject}
              disabled={!rejectDialog.reason.trim()}
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:text-white dark:hover:bg-red-700 border-transparent"
            >
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
