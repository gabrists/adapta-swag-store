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

type DateFilterType = 'today' | 'last7days' | 'thisMonth' | 'all'

export default function HistoryPage() {
  const { history, isLoading } = useSwagStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all')
  const { toast } = useToast()

  const filteredHistory = useMemo(() => {
    let filtered = history

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (entry) =>
          entry.user.toLowerCase().includes(lowerTerm) ||
          entry.id.toLowerCase().includes(lowerTerm),
      )
    }

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

      let csvContent =
        'data:text/csv;charset=utf-8,' +
        'ID da Transação,Data,Colaborador,Itens,Valor Total\n'

      filteredHistory.forEach((entry) => {
        const dateStr = format(parseISO(entry.date), 'dd/MM/yyyy HH:mm:ss')
        const itemsStr = entry.items
          .map(
            (i) =>
              `${i.quantity}x ${i.productName}${i.size ? ` (${i.size})` : ''}`,
          )
          .join('; ')
        const valueStr = entry.totalValue.toFixed(2).replace('.', ',')

        const safeItems = `"${itemsStr.replace(/"/g, '""')}"`
        const safeUser = `"${entry.user.replace(/"/g, '""')}"`

        csvContent += `${entry.id},${dateStr},${safeUser},${safeItems},${valueStr}\n`
      })

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute(
        'download',
        `historico_saidas_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`,
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Download iniciado!',
        description: 'O arquivo CSV foi gerado com sucesso.',
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
        <div className="h-10 w-64 bg-white/5 rounded-lg animate-pulse mb-8" />
        <div className="h-16 w-full bg-white/5 rounded-2xl animate-pulse mb-6" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl bg-white/5" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 w-full max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Histórico de Saídas
          </h1>
          <p className="text-base text-[#ADADAD]">
            Gerencie e audite todas as retiradas de brindes da empresa.
          </p>
        </div>
      </div>

      {/* Audit Toolbar */}
      <div className="glass-panel p-4 md:p-5 rounded-2xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#ADADAD]" />
          <Input
            placeholder="Buscar por colaborador ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 h-12"
          />
        </div>

        <div className="w-full md:w-56">
          <Select
            value={dateFilter}
            onValueChange={(val) => setDateFilter(val as DateFilterType)}
          >
            <SelectTrigger className="h-12">
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
          className="w-full md:w-auto h-12 px-6"
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((entry, idx) => (
            <div
              key={entry.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <HistoryCard entry={entry} />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-5 glass-panel rounded-2xl border-dashed">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center shadow-inner">
              <FolderOpen className="w-10 h-10 text-[#ADADAD]" />
            </div>
            <div className="max-w-md">
              <h3 className="text-xl font-semibold text-white">
                Nenhuma saída encontrada
              </h3>
              <p className="text-[#ADADAD] mt-2 text-sm">
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
