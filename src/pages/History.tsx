import { useState, useMemo } from 'react'
import useSwagStore from '@/stores/useSwagStore'
import { HistoryCard } from '@/components/HistoryCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Download, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  startOfToday,
  subDays,
  startOfMonth,
  isAfter,
  parseISO,
  format,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

type DateFilterType = 'today' | 'last7days' | 'thisMonth' | 'all'

export default function HistoryPage() {
  const { history, isLoading } = useSwagStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all')
  const { toast } = useToast()

  const filteredHistory = useMemo(() => {
    let filtered = history

    // 1. Filter by Search Term (User Name or Group ID)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (entry) =>
          entry.user.toLowerCase().includes(lowerTerm) ||
          entry.id.toLowerCase().includes(lowerTerm),
      )
    }

    // 2. Filter by Date
    const now = new Date()
    if (dateFilter === 'today') {
      const today = startOfToday()
      filtered = filtered.filter((entry) =>
        isAfter(parseISO(entry.date), today),
      )
    } else if (dateFilter === 'last7days') {
      const sevenDaysAgo = subDays(now, 7)
      filtered = filtered.filter((entry) =>
        isAfter(parseISO(entry.date), sevenDaysAgo),
      )
    } else if (dateFilter === 'thisMonth') {
      const startMonth = startOfMonth(now)
      filtered = filtered.filter((entry) =>
        isAfter(parseISO(entry.date), startMonth),
      )
    }

    return filtered
  }, [history, searchTerm, dateFilter])

  const handleExportCSV = () => {
    try {
      if (filteredHistory.length === 0) {
        toast({
          title: 'Nada para exportar',
          description: 'Não há registros correspondentes ao filtro atual.',
          variant: 'destructive',
        })
        return
      }

      // Headers
      let csvContent =
        'data:text/csv;charset=utf-8,' +
        'ID da Transação,Data,Colaborador,Itens,Valor Total\n'

      // Rows
      filteredHistory.forEach((entry) => {
        const dateStr = format(parseISO(entry.date), 'dd/MM/yyyy HH:mm:ss')
        const itemsStr = entry.items
          .map(
            (i) =>
              `${i.quantity}x ${i.productName}${i.size ? ` (${i.size})` : ''}`,
          )
          .join('; ') // Use semicolon within CSV field to avoid splitting
        const valueStr = entry.totalValue.toFixed(2).replace('.', ',')

        // Escape quotes if needed
        const safeItems = `"${itemsStr.replace(/"/g, '""')}"`
        const safeUser = `"${entry.user.replace(/"/g, '""')}"`

        csvContent += `${entry.id},${dateStr},${safeUser},${safeItems},${valueStr}\n`
      })

      // Download
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute(
        'download',
        `historico_saidas_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`,
      )
      document.body.appendChild(link) // Required for FF
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Download iniciado!',
        description: 'O arquivo CSV foi gerado com sucesso.',
        className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível gerar o arquivo CSV.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 w-full max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse mb-6" />
        <div className="h-12 w-full bg-slate-100 rounded animate-pulse mb-4" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Histórico de Saídas
          </h1>
          <p className="text-sm text-slate-500">
            Gerencie e audite todas as retiradas de brindes da empresa.
          </p>
        </div>
      </div>

      {/* Audit Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por colaborador ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-offset-0 focus-visible:ring-[#0E9C8B]"
          />
        </div>

        <div className="w-full md:w-48">
          <Select
            value={dateFilter}
            onValueChange={(val) => setDateFilter(val as DateFilterType)}
          >
            <SelectTrigger className="bg-slate-50 border-slate-200">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="last7days">Últimos 7 dias</SelectItem>
              <SelectItem value="thisMonth">Este Mês</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="w-full md:w-auto border-slate-200 hover:bg-slate-50 text-slate-700"
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Content List */}
      <div className="space-y-3">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((entry) => (
            <div key={entry.id} className="animate-fade-in-up">
              <HistoryCard entry={entry} />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-white rounded-xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <FolderOpen className="w-8 h-8 text-slate-300" />
            </div>
            <div className="max-w-xs">
              <h3 className="text-lg font-semibold text-slate-900">
                Nenhuma saída encontrada
              </h3>
              <p className="text-slate-500 mt-1 text-sm">
                Tente ajustar os filtros ou buscar por outro termo.
              </p>
            </div>
            {(searchTerm || dateFilter !== 'all') && (
              <Button
                variant="link"
                onClick={() => {
                  setSearchTerm('')
                  setDateFilter('all')
                }}
                className="text-[#0E9C8B]"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
