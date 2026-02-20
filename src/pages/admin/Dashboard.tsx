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

  // --- Filtering Logic ---
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

  // --- KPI Calculations ---

  // 1. Total Outputs
  const totalOutputs = useMemo(
    () =>
      filteredHistory.reduce((acc, entry) => {
        const qty = Number(entry.totalQuantity)
        return acc + (isNaN(qty) ? 0 : qty)
      }, 0),
    [filteredHistory],
  )

  // 2. Critical Stock
  const criticalStockCount = useMemo(
    () =>
      products.filter((p) => {
        const stock = Number(p.stock)
        return !isNaN(stock) && stock < 5
      }).length,
    [products],
  )

  // 3. Top Consuming Area
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

  // 4. Monthly Total Cost (Current Calendar Month)
  const monthlyTotalCost = useMemo(() => {
    const now = new Date()
    const start = startOfMonth(now)
    const end = endOfMonth(now)

    // Filter history for current month only, regardless of dashboard filter
    const currentMonthHistory = history.filter((entry) => {
      if (!entry.date) return false
      const entryDate = new Date(entry.date)
      return isValid(entryDate) && isWithinInterval(entryDate, { start, end })
    })

    return currentMonthHistory.reduce((acc, entry) => acc + entry.totalValue, 0)
  }, [history])

  // --- Chart Data Preparation ---

  // Department Distribution (Quantity)
  const departmentData = useMemo(() => {
    const deptCounts: Record<string, number> = {}
    filteredHistory.forEach((entry) => {
      const collaborator = team.find((c) => c.name === entry.user)
      const dept = collaborator?.department || 'Outros'
      const qty = Number(entry.totalQuantity)
      const safeQty = isNaN(qty) ? 0 : qty
      deptCounts[dept] = (deptCounts[dept] || 0) + safeQty
    })

    // Sort by value to make the donut chart look better
    return Object.entries(deptCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredHistory, team])

  // Department Cost Data (Cost) - For Bar Chart
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

  // Replenishment List (Critical Stock)
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

  // Recent Transactions
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

  // --- Helper Functions ---
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getDepartmentBadgeStyles = (dept: string | undefined) => {
    switch (dept) {
      case 'Vendas B2B':
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100'
      case 'Engenharia':
        return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100'
      case 'Marketing':
        return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100'
      case 'RH':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100'
    }
  }

  // --- Chart Configs ---

  // Bar Chart Colors per Department
  const departmentColors: Record<string, string> = {
    'Vendas B2B': '#3b82f6', // blue-500
    Engenharia: '#a855f7', // purple-500
    Marketing: '#f97316', // orange-500
    RH: '#22c55e', // green-500
    Outros: '#94a3b8', // slate-400
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

  // Monochromatic Palette for Donut Chart (#0E9C8B shades)
  const monochromePalette = [
    '#0E9C8B', // Base (Teal)
    '#11B8A3', // Lighter
    '#14F0D6', // Even Lighter
    '#096B5F', // Darker
    '#053D36', // Even Darker
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
    <div className="space-y-6 md:space-y-8 bg-gray-50 min-h-screen p-4 md:p-8 rounded-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Visão geral da Adapta Swag Store.
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px] bg-white border-slate-200">
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
        <Card className="shadow-sm border-slate-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Total de Saídas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {totalOutputs}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Itens retirados no período
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Custo Total Mensal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(monthlyTotalCost)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gasto no mês atual
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'shadow-sm border-slate-100 bg-white',
            criticalStockCount > 0 && 'border-l-4 border-l-red-500',
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Estoque Crítico
            </CardTitle>
            <AlertTriangle
              className={cn(
                'h-4 w-4',
                criticalStockCount > 0 ? 'text-red-500' : 'text-slate-400',
              )}
            />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                criticalStockCount > 0 ? 'text-red-600' : 'text-slate-900',
              )}
            >
              {criticalStockCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Itens com &lt; 5 unidades
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Área que mais Consome
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 truncate">
              {topConsumingArea}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Departamento com mais retiradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-slate-100 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">
              Custo por Departamento (R$)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={costBarChartConfig}
              className="h-[300px] w-full min-w-0"
            >
              <BarChart
                accessibilityLayer
                data={departmentCostData}
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 10)}
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
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dashed"
                      formatter={(value) =>
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(Number(value))
                      }
                    />
                  }
                />
                <Bar dataKey="value" radius={4} barSize={40}>
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

        <Card className="shadow-sm border-slate-100 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">
              Distribuição por Departamento (Qtd)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={pieChartConfig}
              className="h-[300px] w-full min-w-0 mx-auto"
            >
              <PieChart>
                <Pie
                  data={departmentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
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
                  content={<ChartTooltipContent nameKey="name" hideLabel />}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  content={({ payload }) => (
                    <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs text-slate-500">
                      {payload?.map((entry: any, index: number) => (
                        <div
                          key={`legend-${index}`}
                          className="flex items-center gap-1"
                        >
                          <div
                            className="w-2 h-2 rounded-full"
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
        {/* Recent Transactions Table - Takes 2 cols */}
        <Card className="shadow-sm border-slate-100 bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">
              Transações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Data</TableHead>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Item Retirado</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Depto</TableHead>
                    <TableHead className="text-right pr-6">
                      Valor Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-slate-500"
                      >
                        Nenhuma transação encontrada no período.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTransactions.map((tx) => (
                      <TableRow key={tx.id} className="hover:bg-slate-50">
                        <TableCell className="pl-6 font-medium text-slate-600 text-xs whitespace-nowrap">
                          {new Date(tx.date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={tx.collaborator?.avatarUrl}
                                alt={tx.user}
                              />
                              <AvatarFallback className="text-[10px]">
                                {tx.user.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-slate-900 font-medium truncate max-w-[120px]">
                              {tx.user}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-700 truncate block max-w-[150px]">
                            {tx.mainItemName}
                            {tx.moreItemsCount > 0 && (
                              <span className="text-xs text-slate-400 ml-1">
                                +{tx.moreItemsCount}
                              </span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">
                          {tx.totalQuantity}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] font-medium border',
                              getDepartmentBadgeStyles(
                                tx.collaborator?.department,
                              ),
                            )}
                          >
                            {tx.collaborator?.department || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6 text-sm font-medium text-slate-900">
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

        {/* Replenishment Alerts Widget (Atenção List) */}
        <Card className="shadow-sm border-slate-100 bg-white h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Atenção: Reposição
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[400px]">
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500 h-full">
                <Package className="h-10 w-10 text-emerald-100 mb-2" />
                <p className="text-sm">Estoque saudável!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col gap-2 p-3 rounded-lg bg-red-50 border border-red-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-red-900 line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-xs text-red-700 font-medium mt-0.5">
                          Restam apenas {Number(product.stock) || 0} unidades
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-7 bg-white hover:bg-red-100 border-red-200 text-red-700 gap-1"
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
