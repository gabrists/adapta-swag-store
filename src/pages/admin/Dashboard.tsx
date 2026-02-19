import { useState, useMemo } from 'react'
import { Package, AlertTriangle, Users, TrendingUp } from 'lucide-react'
import {
  startOfQuarter,
  startOfYear,
  isAfter,
  subDays,
  isValid,
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
  LabelList,
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
      // Robust date validation to prevent invalid date comparisons
      if (!isValid(entryDate)) return false
      return isAfter(entryDate, startDate)
    })
  }, [history, dateRange])

  // --- KPI Calculations ---

  // 1. Total Outputs - Validated to ensure numeric result
  const totalOutputs = useMemo(
    () =>
      filteredHistory.reduce((acc, entry) => {
        const qty = Number(entry.totalQuantity)
        return acc + (isNaN(qty) ? 0 : qty)
      }, 0),
    [filteredHistory],
  )

  // 2. Critical Stock - Validated filter
  const criticalStockCount = useMemo(
    () =>
      products.filter((p) => {
        const stock = Number(p.stock)
        return !isNaN(stock) && stock < 5
      }).length,
    [products],
  )

  // 3. Top Consuming Area - Validated accumulation
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

  // --- Chart Data Preparation ---

  // Top 5 Popular Items - Validated quantities
  const popularItemsData = useMemo(() => {
    const itemCounts: Record<string, number> = {}
    filteredHistory.forEach((entry) => {
      if (Array.isArray(entry.items)) {
        entry.items.forEach((item) => {
          const qty = Number(item.quantity)
          const safeQty = isNaN(qty) ? 0 : qty
          const name = item.productName || 'Item Desconhecido'
          itemCounts[name] = (itemCounts[name] || 0) + safeQty
        })
      }
    })

    return Object.entries(itemCounts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }, [filteredHistory])

  // Department Distribution - Validated values
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

  // Replenishment List - Validated stock
  const lowStockProducts = useMemo(
    () =>
      products
        .filter((p) => {
          const stock = Number(p.stock)
          return !isNaN(stock) && stock < 5
        })
        .slice(0, 5),
    [products],
  )

  // Recent Transactions - Safe mapping
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

  // --- Chart Configs ---
  const barChartConfig = {
    quantity: {
      label: 'Quantidade',
      color: '#0E9C8B',
    },
  } satisfies ChartConfig

  const pieChartConfig = {
    value: {
      label: 'Retiradas',
    },
    ...Object.fromEntries(
      departmentData.map((d, i) => [
        d.name,
        {
          label: d.name,
          color: [
            '#0E9C8B',
            '#2DD4BF',
            '#5EEAD4',
            '#99F6E4',
            '#CCFBF1',
            '#F0FDFA',
            '#134E4A',
          ][i % 7],
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
      <div className="grid gap-4 md:grid-cols-3">
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
              Top 5 Itens Mais Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={barChartConfig}
              className="h-[300px] w-full min-w-0"
            >
              <BarChart
                accessibilityLayer
                data={popularItemsData}
                layout="vertical"
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  horizontal={false}
                  strokeDasharray="3 3"
                  stroke="#f0f0f0"
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={140}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <XAxis type="number" hide />
                <ChartTooltip
                  cursor={{ fill: 'transparent' }}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar
                  dataKey="quantity"
                  layout="vertical"
                  fill="var(--color-quantity)"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                >
                  <LabelList
                    dataKey="quantity"
                    position="right"
                    offset={8}
                    className="fill-slate-600 text-xs font-bold"
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">
              Distribuição por Departamento
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
                        ]?.color || '#e2e8f0'
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
                          <span>{entry.value}</span>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
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
                            className="text-[10px] font-normal text-slate-500 bg-slate-50"
                          >
                            {tx.collaborator?.department || 'N/A'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Replenishment Alerts Widget - Takes 1 col */}
        <Card className="shadow-sm border-slate-100 bg-white h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertas de Reposição
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
                <Package className="h-10 w-10 text-emerald-100 mb-2" />
                <p className="text-sm">Estoque saudável!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100"
                  >
                    <div className="mt-0.5">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-red-900 line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-xs text-red-700 font-medium mt-0.5">
                        Restam apenas {Number(product.stock) || 0} unidades
                      </p>
                    </div>
                  </div>
                ))}
                {products.filter((p) => (Number(p.stock) || 0) < 5).length >
                  5 && (
                  <p className="text-xs text-center text-slate-400 mt-2">
                    Exibindo 5 de{' '}
                    {products.filter((p) => (Number(p.stock) || 0) < 5).length}{' '}
                    itens críticos
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
