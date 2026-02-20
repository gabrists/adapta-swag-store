import { useState, useMemo } from 'react'
import {
  Package,
  AlertTriangle,
  Users,
  TrendingUp,
  DollarSign,
  ExternalLink,
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
  const { products, history, team } = useSwagStore()
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

  const criticalStockCount = useMemo(
    () =>
      products.filter((p) => {
        const stock = Number(p.stock)
        return !isNaN(stock) && stock < 5
      }).length,
    [products],
  )

  const topConsumingArea = useMemo(() => {
    const departmentCounts: Record<string, number> = {}

    filteredHistory.forEach((entry) => {
      const collaborator = team.find((c) => c.name === entry.user)
      const dept = collaborator?.department || 'Outros'
      const qty = Number(entry.totalQuantity)
      const safeQty = isNaN(qty) ? 0 : qty

      departmentCounts[dept] = (departmentCounts[dept] || 0) + safeQty
    })

    const sortedDepts = Object.entries(departmentCounts).sort(
      (a, b) => b[1] - a[1],
    )
    return sortedDepts.length > 0 ? sortedDepts[0][0] : 'N/A'
  }, [filteredHistory, team])

  const monthlyTotalCost = useMemo(() => {
    const now = new Date()
    const start = startOfMonth(now)
    const end = endOfMonth(now)

    const currentMonthHistory = history.filter((entry) => {
      if (!entry.date) return false
      const entryDate = new Date(entry.date)
      return isValid(entryDate) && isWithinInterval(entryDate, { start, end })
    })

    return currentMonthHistory.reduce((acc, entry) => acc + entry.totalValue, 0)
  }, [history])

  const departmentData = useMemo(() => {
    const deptCounts: Record<string, number> = {}
    filteredHistory.forEach((entry) => {
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
      const collaborator = team.find((c) => c.name === entry.user)
      const dept = collaborator?.department || 'Outros'
      deptCosts[dept] = (deptCosts[dept] || 0) + entry.totalValue
    })

    return Object.entries(deptCosts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredHistory, team])

  const lowStockProducts = useMemo(
    () =>
      products
        .filter((p) => {
          const stock = Number(p.stock)
          return !isNaN(stock) && stock < 5
        })
        .slice(0, 8),
    [products],
  )

  const recentTransactions = useMemo(() => {
    return filteredHistory.slice(0, 10).map((entry) => {
      const collaborator = team.find((c) => c.name === entry.user)
      const items = Array.isArray(entry.items) ? entry.items : []
      const mainItemName = items[0]?.productName || 'Item Removido'
      const moreItemsCount = Math.max(0, items.length - 1)
      const qty = Number(entry.totalQuantity)

      return {
        ...entry,
        totalQuantity: isNaN(qty) ? 0 : qty,
        collaborator,
        mainItemName,
        moreItemsCount,
      }
    })
  }, [filteredHistory, team])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getDepartmentBadgeStyles = (dept: string | undefined) => {
    switch (dept) {
      case 'Vendas B2B':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      case 'Engenharia':
        return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
      case 'Marketing':
        return 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
      case 'RH':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
      default:
        return 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
    }
  }

  const departmentColors: Record<string, string> = {
    'Vendas B2B': '#3b82f6',
    Engenharia: '#06b6d4',
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
    '#14F0D6',
    '#0E9C8B',
    '#0A7064',
    '#06b6d4',
    '#0ea5e9',
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
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Dashboard Analítico
          </h1>
          <p className="text-[#ADADAD] mt-1">
            Visão geral da Neura Swag Store.
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[200px] bg-black/20 border-white/10 h-12">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30days">Últimos 30 dias</SelectItem>
            <SelectItem value="quarter">Este Trimestre</SelectItem>
            <SelectItem value="year">Este Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#ADADAD]">
              Total de Saídas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalOutputs}</div>
            <p className="text-xs text-[#ADADAD] mt-2">
              Itens retirados no período
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#ADADAD]">
              Custo Total Mensal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(monthlyTotalCost)}
            </div>
            <p className="text-xs text-[#ADADAD] mt-2">Gasto no mês atual</p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'transition-colors',
            criticalStockCount > 0
              ? 'border-sky-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
              : 'hover:border-primary/30',
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#ADADAD]">
              Estoque Crítico
            </CardTitle>
            <AlertTriangle
              className={cn(
                'h-4 w-4',
                criticalStockCount > 0 ? 'text-sky-400' : 'text-[#ADADAD]',
              )}
            />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-3xl font-bold',
                criticalStockCount > 0 ? 'text-sky-400' : 'text-white',
              )}
            >
              {criticalStockCount}
            </div>
            <p className="text-xs text-[#ADADAD] mt-2">
              Itens com &lt; 5 unidades
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#ADADAD]">
              Área que mais Consome
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white truncate min-h-[36px] flex items-center">
              {topConsumingArea}
            </div>
            <p className="text-xs text-[#ADADAD] mt-2">
              Departamento com mais retiradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Custo por Departamento (R$)
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
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 10)}
                  stroke="rgba(255,255,255,0.4)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      notation: 'compact',
                      maximumFractionDigits: 1,
                    }).format(value)
                  }
                  stroke="rgba(255,255,255,0.4)"
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  content={
                    <ChartTooltipContent
                      indicator="dashed"
                      formatter={(value) =>
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(Number(value))
                      }
                      className="bg-[#081a17]/90 border-white/10 text-white backdrop-blur-md shadow-xl"
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Distribuição por Departamento (Qtd)
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
                      className="bg-[#081a17]/90 border-white/10 text-white backdrop-blur-md"
                    />
                  }
                />
                <Legend
                  verticalAlign="bottom"
                  height={40}
                  content={({ payload }) => (
                    <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-[#ADADAD]">
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Transações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto rounded-b-2xl">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-white/10 bg-black/20">
                    <TableHead className="pl-6 text-[#ADADAD]">Data</TableHead>
                    <TableHead className="text-[#ADADAD]">
                      Colaborador
                    </TableHead>
                    <TableHead className="text-[#ADADAD]">
                      Item Retirado
                    </TableHead>
                    <TableHead className="text-[#ADADAD]">Qtd</TableHead>
                    <TableHead className="text-[#ADADAD]">Depto</TableHead>
                    <TableHead className="text-right pr-6 text-[#ADADAD]">
                      Valor Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-32 text-center text-[#ADADAD]"
                      >
                        Nenhuma transação encontrada no período.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTransactions.map((tx) => (
                      <TableRow
                        key={tx.id}
                        className="hover:bg-white/5 border-white/5 transition-colors"
                      >
                        <TableCell className="pl-6 font-medium text-[#ADADAD] text-xs whitespace-nowrap">
                          {new Date(tx.date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-white/10">
                              <AvatarImage
                                src={tx.collaborator?.avatarUrl}
                                alt={tx.user}
                              />
                              <AvatarFallback className="text-xs bg-white/5 text-[#ADADAD]">
                                {tx.user.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-[#ADADAD] font-medium truncate max-w-[120px]">
                              {tx.user}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-[#ADADAD] truncate block max-w-[180px]">
                            {tx.mainItemName}
                            {tx.moreItemsCount > 0 && (
                              <span className="text-xs text-primary ml-2 bg-primary/10 px-1.5 py-0.5 rounded">
                                +{tx.moreItemsCount}
                              </span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-[#ADADAD]">
                          {tx.totalQuantity}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] font-medium',
                              getDepartmentBadgeStyles(
                                tx.collaborator?.department,
                              ),
                            )}
                          >
                            {tx.collaborator?.department || 'N/A'}
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
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-sky-400" />
              Atenção: Reposição
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[420px] pr-2">
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-[#ADADAD] h-full bg-black/20 rounded-xl border border-white/5">
                <Package className="h-12 w-12 text-primary/40 mb-3" />
                <p className="text-sm">Estoque saudável!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col gap-3 p-4 rounded-xl bg-sky-500/5 border border-sky-500/20 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <AlertTriangle className="h-5 w-5 text-sky-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-xs text-sky-300 mt-1">
                          Restam apenas{' '}
                          <span className="font-bold">
                            {Number(product.stock) || 0}
                          </span>{' '}
                          unidades
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-8 bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-300 gap-2 mt-1"
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
