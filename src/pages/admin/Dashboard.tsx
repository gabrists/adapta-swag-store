import { useState, useMemo } from 'react'
import {
  Package,
  AlertTriangle,
  Users,
  TrendingUp,
  DollarSign,
  ExternalLink,
  Calendar,
  Download,
  ShieldCheck,
  Clock,
  ArrowUpRight,
} from 'lucide-react'
import {
  startOfQuarter,
  startOfYear,
  isAfter,
  subDays,
  isValid,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

import useSwagStore from '@/stores/useSwagStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const { products, history, team, orders } = useSwagStore()
  const [dateRange, setDateRange] = useState('30days')

  const filteredHistory = useMemo(() => {
    const now = new Date()
    let startDate: Date

    switch (dateRange) {
      case 'quarter':
        startDate = startOfQuarter(now)
        break
      case 'year':
        startDate = startOfYear(now)
        break
      case '30days':
      default:
        startDate = subDays(now, 30)
        break
    }

    return history.filter((entry) => {
      if (!entry.date) return false
      const entryDate = new Date(entry.date)
      if (!isValid(entryDate)) return false
      return isAfter(entryDate, startDate)
    })
  }, [history, dateRange])

  const totalOutputs = useMemo(
    () =>
      filteredHistory.reduce((acc, entry) => {
        const qty = Number(entry.totalQuantity)
        return acc + (isNaN(qty) ? 0 : qty)
      }, 0),
    [filteredHistory],
  )

  const allLowStockProducts = useMemo(
    () =>
      products.filter((p) => {
        const stock = Number(p.stock)
        const criticalLevel = p.criticalLevel ?? 5 // Fallback to 5 if undefined
        return !isNaN(stock) && stock <= criticalLevel
      }),
    [products],
  )

  const criticalStockCount = allLowStockProducts.length

  const hasZeroStock = useMemo(
    () => allLowStockProducts.some((p) => Number(p.stock) === 0),
    [allLowStockProducts],
  )

  const lowStockProducts = useMemo(
    () => allLowStockProducts.slice(0, 8),
    [allLowStockProducts],
  )

  const { internalMonthlyCost, eventMonthlyCost } = useMemo(() => {
    const now = new Date()
    const start = startOfMonth(now)
    const end = endOfMonth(now)

    const currentMonthHistory = history.filter((entry) => {
      if (!entry.date) return false
      const entryDate = new Date(entry.date)
      return isValid(entryDate) && isWithinInterval(entryDate, { start, end })
    })

    const internalCost = currentMonthHistory
      .filter((e) => !e.destination?.startsWith('Evento:'))
      .reduce((acc, entry) => acc + entry.totalValue, 0)

    const eventCost = currentMonthHistory
      .filter((e) => e.destination?.startsWith('Evento:'))
      .reduce((acc, entry) => acc + entry.totalValue, 0)

    return { internalMonthlyCost: internalCost, eventMonthlyCost: eventCost }
  }, [history])

  // BI Data Calculations
  const rawBudgetData = useMemo(() => {
    const now = new Date()
    const start = startOfMonth(now)
    const end = endOfMonth(now)

    const currentMonthOrders = orders.filter((order) => {
      if (!order.createdAt || order.status === 'Rejeitado') return false
      const date = new Date(order.createdAt)
      return isValid(date) && isWithinInterval(date, { start, end })
    })

    const deptCosts: Record<string, number> = {}
    currentMonthOrders.forEach((order) => {
      const emp = team.find((t) => t.id === order.employeeId)
      const product = products.find((p) => p.id === order.itemId)
      const dept = emp?.department || 'Outros'
      const cost = (order.quantity || 1) * (product?.unitCost || 0)

      deptCosts[dept] = (deptCosts[dept] || 0) + cost
    })

    return Object.entries(deptCosts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [orders, team, products])

  // Mock data fallback as requested by AC
  const finalBudgetData =
    rawBudgetData.length > 0
      ? rawBudgetData
      : [
          { name: 'Vendas', value: 2450 },
          { name: 'Engenharia', value: 1800 },
          { name: 'Marketing', value: 900 },
          { name: 'RH', value: 350 },
        ]

  const curvaAData = useMemo(() => {
    const productCounts: Record<
      string,
      { quantity: number; name: string; category: string; id: string }
    > = {}
    orders.forEach((order) => {
      if (order.status === 'Rejeitado') return
      const product = products.find((p) => p.id === order.itemId)
      if (!product) return

      if (!productCounts[order.itemId]) {
        productCounts[order.itemId] = {
          id: order.itemId,
          quantity: 0,
          name: product.name,
          category: product.category,
        }
      }
      productCounts[order.itemId].quantity += order.quantity
    })
    return Object.values(productCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6) // Top 6
  }, [orders, products])

  const departmentData = useMemo(() => {
    const deptCounts: Record<string, number> = {}
    filteredHistory.forEach((entry) => {
      if (entry.destination?.startsWith('Evento:')) return // Skip events for dept chart
      const collaborator = team.find((c) => c.name === entry.user)
      const dept = collaborator?.department || 'Outros'
      const qty = Number(entry.totalQuantity)
      const safeQty = isNaN(qty) ? 0 : qty
      deptCounts[dept] = (deptCounts[dept] || 0) + safeQty
    })

    return Object.entries(deptCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredHistory, team])

  const departmentCostData = useMemo(() => {
    const deptCosts: Record<string, number> = {}

    filteredHistory.forEach((entry) => {
      if (entry.destination?.startsWith('Evento:')) return // Skip events for dept chart
      const collaborator = team.find((c) => c.name === entry.user)
      const dept = collaborator?.department || 'Outros'
      deptCosts[dept] = (deptCosts[dept] || 0) + entry.totalValue
    })

    return Object.entries(deptCosts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredHistory, team])

  const recentTransactions = useMemo(() => {
    return filteredHistory.slice(0, 10).map((entry) => {
      const collaborator = team.find((c) => c.name === entry.user)
      const items = Array.isArray(entry.items) ? entry.items : []
      const mainItemName = items[0]?.productName || 'Item Removido'
      const moreItemsCount = Math.max(0, items.length - 1)
      const qty = Number(entry.totalQuantity)
      const isEvent = entry.destination?.startsWith('Evento:')

      return {
        ...entry,
        totalQuantity: isNaN(qty) ? 0 : qty,
        collaborator,
        mainItemName,
        moreItemsCount,
        isEvent,
      }
    })
  }, [filteredHistory, team])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const handleExportCSV = () => {
    const headers = [
      'ID Pedido',
      'Data',
      'Colaborador',
      'Departamento',
      'Produto',
      'Categoria',
      'Quantidade',
      'Custo Unitario',
      'Custo Total',
      'Status',
    ]

    const rows = orders.map((o) => {
      const emp = team.find((t) => t.id === o.employeeId)
      const product = products.find((p) => p.id === o.itemId)
      const uCost = product?.unitCost || 0
      const tCost = uCost * o.quantity

      return [
        o.id,
        new Date(o.createdAt).toLocaleDateString('pt-BR'),
        emp?.name || o.employeeName || 'Desconhecido',
        emp?.department || 'Outros',
        product?.name || o.productName || 'Desconhecido',
        product?.category || 'Outros',
        o.quantity,
        uCost.toFixed(2),
        tCost.toFixed(2),
        o.status,
      ].join(';')
    })

    const csvContent = [headers.join(';'), ...rows].join('\n')
    // Added BOM for excel compatibility with accents
    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `relatorio_contabil_${new Date().toISOString().split('T')[0]}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getDepartmentBadgeStyles = (dept: string | undefined) => {
    switch (dept) {
      case 'Vendas B2B':
      case 'Vendas':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
      case 'Engenharia':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30'
      case 'Marketing':
        return 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-500/20 dark:text-sky-400 dark:border-sky-500/30'
      case 'RH':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
      case 'Eventos':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30'
    }
  }

  const departmentColors: Record<string, string> = {
    'Vendas B2B': '#3b82f6',
    Vendas: '#3b82f6',
    Engenharia: '#a855f7',
    Marketing: '#0ea5e9',
    RH: '#10b981',
    Outros: '#94a3b8',
  }

  const costBarChartConfig = {
    value: {
      label: 'Custo (R$)',
    },
    ...Object.fromEntries(
      Object.entries(departmentColors).map(([dept, color]) => [
        dept,
        { label: dept, color },
      ]),
    ),
  } satisfies ChartConfig

  const monochromePalette = [
    '#77d4cb', // Lightest Teal
    '#30c2b2', // Light Teal
    '#0E9C8B', // Base Teal
    '#09695d', // Dark Teal
    '#053d36', // Darkest Teal
  ]

  const pieChartConfig = {
    value: {
      label: 'Retiradas',
    },
    ...Object.fromEntries(
      departmentData.map((d, i) => [
        d.name,
        {
          label: d.name,
          color: monochromePalette[i % monochromePalette.length],
        },
      ]),
    ),
  } satisfies ChartConfig

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 pb-12 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard Analítico
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Visão geral da Adapta Swag Store.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="w-full sm:w-auto bg-white dark:bg-black/20 border-slate-200 dark:border-white/10"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório Contábil (CSV)
          </Button>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[200px] bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 h-10 text-slate-900 dark:text-white">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-primary/30 transition-colors bg-white dark:bg-[#081a17]/80 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">
              Total de Saídas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {totalOutputs}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Itens retirados no período
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/30 transition-colors bg-white dark:bg-[#081a17]/80 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">
              Custo Interno Mensal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(internalMonthlyCost)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Consumo da equipe
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/30 transition-colors bg-white dark:bg-[#081a17]/80 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">
              Tempo Médio de Entrega (SLA)
            </CardTitle>
            <Clock className="h-4 w-4 text-sky-500 dark:text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              1.2 dias
              <ArrowUpRight className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Eficiência na logística
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/30 transition-colors bg-white dark:bg-[#081a17]/80 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">
              Prevenção de Perdas
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              R$ 1.200
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Salvos em travas de cotas duplicadas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/30 transition-colors bg-white dark:bg-[#081a17]/80 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">
              Custo Eventos Mensal
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(eventMonthlyCost)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Saídas para eventos externos
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'transition-colors bg-white dark:bg-[#081a17]/80 shadow-sm dark:shadow-none',
            criticalStockCount > 0
              ? hasZeroStock
                ? 'border-red-500/50 dark:shadow-[0_0_15px_rgba(239,68,68,0.15)] shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                : 'border-amber-500/50 dark:shadow-[0_0_15px_rgba(245,158,11,0.15)] shadow-[0_0_15px_rgba(245,158,11,0.1)]'
              : 'border-slate-200 dark:border-white/10 hover:border-primary/30',
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">
              Estoque Crítico
            </CardTitle>
            <AlertTriangle
              className={cn(
                'h-4 w-4',
                criticalStockCount > 0
                  ? hasZeroStock
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-amber-500 dark:text-amber-400'
                  : 'text-slate-900 dark:text-white',
              )}
            />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-3xl font-bold',
                criticalStockCount > 0
                  ? hasZeroStock
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-900 dark:text-white',
              )}
            >
              {criticalStockCount}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Itens em nível crítico
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CFO / COO BI Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Budget Consumption Chart (Horizontal) */}
        <Card className="lg:col-span-2 bg-white dark:bg-[#081a17]/80 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Consumo de Budget por Área (Mês Atual)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={costBarChartConfig}
              className="h-[300px] w-full min-w-0"
            >
              <BarChart
                accessibilityLayer
                layout="vertical"
                data={finalBudgetData}
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  horizontal={false}
                  strokeDasharray="3 3"
                  className="stroke-slate-200 dark:stroke-white/5"
                />
                <XAxis
                  type="number"
                  tickFormatter={(value) => formatCurrency(value)}
                  className="fill-slate-600 dark:fill-slate-400 text-xs"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  className="fill-slate-600 dark:fill-slate-400 text-xs font-medium"
                  width={90}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(148,163,184,0.1)' }}
                  content={
                    <ChartTooltipContent
                      indicator="dashed"
                      formatter={(value) => formatCurrency(Number(value))}
                      className="bg-white/90 dark:bg-[#081a17]/90 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white backdrop-blur-md shadow-xl"
                    />
                  }
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                  {finalBudgetData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        departmentColors[entry.name] || departmentColors.Outros
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Curva A Products Table */}
        <Card className="lg:col-span-1 bg-white dark:bg-[#081a17]/80 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none flex flex-col h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Produtos Curva A (Mais resgatados)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                  <TableHead className="pl-6 text-xs text-slate-600 dark:text-slate-300">
                    Produto
                  </TableHead>
                  <TableHead className="text-xs text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                    Categoria
                  </TableHead>
                  <TableHead className="text-right pr-6 text-xs text-slate-600 dark:text-slate-300">
                    Qtd Resgatada
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {curvaAData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-32 text-center text-slate-500 dark:text-slate-400"
                    >
                      Sem dados suficientes.
                    </TableCell>
                  </TableRow>
                ) : (
                  curvaAData.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-slate-100 dark:border-white/5 transition-colors"
                    >
                      <TableCell className="pl-6 font-medium text-slate-900 dark:text-white text-xs truncate max-w-[150px]">
                        {item.name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-medium bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                        >
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6 text-sm font-bold text-primary">
                        {item.quantity}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Legacy Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white dark:bg-[#081a17]/80 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Custo Interno por Departamento (R$)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={costBarChartConfig}
              className="h-[320px] w-full min-w-0"
            >
              <BarChart
                accessibilityLayer
                data={departmentCostData}
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-slate-200 dark:stroke-white/5"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 10)}
                  className="fill-slate-600 dark:fill-slate-400 text-xs"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                  className="fill-slate-600 dark:fill-slate-400 text-xs"
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(148,163,184,0.1)' }}
                  content={
                    <ChartTooltipContent
                      indicator="dashed"
                      formatter={(value) => formatCurrency(Number(value))}
                      className="bg-white/90 dark:bg-[#081a17]/90 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white backdrop-blur-md shadow-xl"
                    />
                  }
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {departmentCostData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        departmentColors[entry.name] || departmentColors.Outros
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#081a17]/80 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Distribuição Interna por Departamento (Qtd)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={pieChartConfig}
              className="h-[320px] w-full min-w-0 mx-auto"
            >
              <PieChart>
                <Pie
                  data={departmentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  stroke="transparent"
                >
                  {departmentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        pieChartConfig[
                          entry.name as keyof typeof pieChartConfig
                        ]?.color || monochromePalette[0]
                      }
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      nameKey="name"
                      hideLabel
                      className="bg-white/90 dark:bg-[#081a17]/90 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white backdrop-blur-md shadow-xl"
                    />
                  }
                />
                <Legend
                  verticalAlign="bottom"
                  height={40}
                  content={({ payload }) => (
                    <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-slate-900 dark:text-white">
                      {payload?.map((entry: any, index: number) => (
                        <div
                          key={`legend-${index}`}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span>
                            {entry.value} ({entry.payload.value})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Transactions & Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Transactions Table */}
        <Card className="lg:col-span-2 bg-white dark:bg-[#081a17]/80 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Transações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto rounded-b-2xl">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                    <TableHead className="pl-6 text-slate-600 dark:text-slate-300">
                      Data
                    </TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-300">
                      Responsável / Origem
                    </TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-300">
                      Item Retirado
                    </TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-300">
                      Qtd
                    </TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-300">
                      Depto
                    </TableHead>
                    <TableHead className="text-right pr-6 text-slate-600 dark:text-slate-300">
                      Valor Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-slate-500 dark:text-slate-400"
                      >
                        Nenhuma transação encontrada no período.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTransactions.map((tx) => (
                      <TableRow
                        key={tx.id}
                        className="hover:bg-slate-50 dark:hover:bg-white/5 border-slate-100 dark:border-white/5 transition-colors"
                      >
                        <TableCell className="pl-6 font-medium text-slate-900 dark:text-white text-xs whitespace-nowrap">
                          {new Date(tx.date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-slate-200 dark:border-white/10">
                              {tx.isEvent ? (
                                <AvatarFallback className="text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                                  EV
                                </AvatarFallback>
                              ) : (
                                <>
                                  <AvatarImage
                                    src={tx.collaborator?.avatarUrl}
                                    alt={tx.user}
                                  />
                                  <AvatarFallback className="text-xs bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white">
                                    {tx.user.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </>
                              )}
                            </Avatar>
                            <span className="text-sm text-slate-900 dark:text-white font-medium truncate max-w-[120px]">
                              {tx.isEvent ? tx.destination : tx.user}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-900 dark:text-white truncate block max-w-[180px]">
                            {tx.mainItemName}
                            {tx.moreItemsCount > 0 && (
                              <span className="text-xs text-primary ml-2 bg-primary/10 px-1.5 py-0.5 rounded">
                                +{tx.moreItemsCount}
                              </span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-900 dark:text-white">
                          {tx.totalQuantity}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] font-medium',
                              getDepartmentBadgeStyles(
                                tx.isEvent
                                  ? 'Eventos'
                                  : tx.collaborator?.department,
                              ),
                            )}
                          >
                            {tx.isEvent
                              ? 'Eventos Externos'
                              : tx.collaborator?.department || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6 text-sm font-medium text-primary">
                          {formatCurrency(tx.totalValue)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Replenishment Alerts Widget */}
        <Card className="h-full flex flex-col bg-white dark:bg-[#081a17]/80 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-sky-500 dark:text-sky-400" />
              Atenção: Reposição
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[420px] pr-2">
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 dark:text-white h-full bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5">
                <Package className="h-12 w-12 text-primary/40 mb-3" />
                <p className="text-sm">Estoque saudável!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map((product) => {
                  const stock = Number(product.stock) || 0
                  const isZeroStock = stock === 0

                  return (
                    <div
                      key={product.id}
                      className={cn(
                        'flex flex-col gap-3 p-4 rounded-xl border shadow-sm transition-colors',
                        isZeroStock
                          ? 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'
                          : 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <AlertTriangle
                            className={cn(
                              'h-5 w-5',
                              isZeroStock
                                ? 'text-red-500 dark:text-red-400'
                                : 'text-amber-500 dark:text-amber-400',
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                            {product.name}
                          </h4>
                          <p
                            className={cn(
                              'text-xs mt-1',
                              isZeroStock
                                ? 'text-red-600 dark:text-red-300'
                                : 'text-amber-600 dark:text-amber-300',
                            )}
                          >
                            Restam apenas{' '}
                            <span className="font-bold">{stock}</span> unidades
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className={cn(
                          'w-full text-xs h-8 gap-2 mt-1',
                          isZeroStock
                            ? 'bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300'
                            : 'bg-amber-100 dark:bg-amber-500/10 hover:bg-amber-200 dark:hover:bg-amber-500/20 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300',
                        )}
                        disabled={!product.supplierUrl}
                        onClick={() => {
                          if (product.supplierUrl) {
                            window.open(product.supplierUrl, '_blank')
                          }
                        }}
                      >
                        {product.supplierUrl ? (
                          <>
                            Repor Estoque
                            <ExternalLink className="h-3 w-3" />
                          </>
                        ) : (
                          'Sem URL do Fornecedor'
                        )}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
