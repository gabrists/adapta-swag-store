import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import {
  Megaphone,
  Download,
  BellRing,
  ArrowLeft,
  Users,
  CheckCircle,
  Clock,
  Lock,
  Unlock,
  Link as LinkIcon,
  Copy,
  ExternalLink,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import useSwagStore from '@/stores/useSwagStore'
import { useToast } from '@/hooks/use-toast'

export default function CampaignDashboard() {
  const { id } = useParams()
  const {
    campaigns,
    campaignResponses,
    team,
    updateCampaignStatus,
    sendSlackNotification,
  } = useSwagStore()
  const { toast } = useToast()

  const campaign = campaigns.find((c) => c.id === id)
  const responses = campaignResponses.filter((r) => r.campaignId === id)

  const totalEmployees = team.length
  const responsesCount = responses.length
  const pendingCount = totalEmployees - responsesCount

  const chartData = useMemo(() => {
    if (!campaign) return []
    return campaign.options.map((opt) => ({
      name: opt,
      value: responses.filter((r) => r.choice === opt).length,
    }))
  }, [campaign, responses])

  const tableData = useMemo(() => {
    return team.map((emp) => {
      const resp = responses.find((r) => r.employeeId === emp.id)
      return {
        id: emp.id,
        name: emp.name,
        department: emp.department,
        choice: resp ? resp.choice : 'Pendente',
        date: resp
          ? format(parseISO(resp.updatedAt), 'dd/MM/yyyy HH:mm')
          : null,
      }
    })
  }, [team, responses])

  const handleExportCSV = () => {
    let csvContent =
      'data:text/csv;charset=utf-8,Colaborador,Departamento,Escolha,Data Resposta\n'
    tableData.forEach((row) => {
      const safeName = `"${row.name.replace(/"/g, '""')}"`
      const safeDept = `"${row.department.replace(/"/g, '""')}"`
      const safeChoice = `"${row.choice.replace(/"/g, '""')}"`
      const safeDate = row.date ? `"${row.date}"` : '""'
      csvContent += `${safeName},${safeDept},${safeChoice},${safeDate}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `respostas_${campaign?.name || 'campanha'}_${format(new Date(), 'yyyyMMdd')}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'Download iniciado',
      description: 'O arquivo CSV foi gerado com sucesso.',
    })
  }

  const handleNotifySlack = async () => {
    if (!campaign) return
    const link = `${window.location.origin}/coleta/${campaign.id}`
    const msg = `👕 *O RH precisa da sua ajuda!* Escolha seu tamanho para a campanha *${campaign.name}*. Clique aqui para responder: ${link}`

    await sendSlackNotification(msg)

    toast({
      title: 'Notificação enviada',
      description: `Mensagem enviada com sucesso ao Slack!`,
      className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    })
  }

  const handleToggleStatus = async () => {
    if (!campaign) return
    const newStatus = campaign.status === 'Aberta' ? 'Fechada' : 'Aberta'
    try {
      await updateCampaignStatus(campaign.id, newStatus)
      toast({
        title: 'Status atualizado',
        description: `A campanha agora está ${newStatus}.`,
      })
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar o status.',
        variant: 'destructive',
      })
    }
  }

  if (!campaign) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Campanha não encontrada</h2>
        <Link to="/admin/campanhas" className="text-primary mt-4 inline-block">
          Voltar para lista
        </Link>
      </div>
    )
  }

  const chartConfig = {
    value: {
      label: 'Respostas',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig

  const campaignUrl = `${window.location.origin}/coleta/${campaign.id}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(campaignUrl)
    toast({
      title: 'Link copiado com sucesso!',
      description: 'Você já pode compartilhar o link com o time.',
      className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    })
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in-up">
      <div className="flex items-center gap-4 text-slate-500 dark:text-[#ADADAD]">
        <Link
          to="/admin/campanhas"
          className="hover:text-primary transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-medium">Detalhes da Campanha</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 glass-panel p-6 rounded-2xl">
        <div className="flex items-start gap-4 flex-1">
          <Avatar className="w-16 h-16 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm shrink-0 mt-1">
            <AvatarImage src={campaign.imageUrl} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary rounded-xl">
              <Megaphone className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {campaign.name}
              </h1>
              <Badge
                variant="outline"
                className={
                  campaign.status === 'Aberta'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30'
                    : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10'
                }
              >
                {campaign.status}
              </Badge>
            </div>
            {campaign.description && (
              <p className="text-slate-600 dark:text-[#ADADAD] max-w-2xl">
                {campaign.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 p-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 w-fit max-w-full overflow-hidden">
              <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-sm text-slate-600 dark:text-[#ADADAD] truncate select-all">
                {campaignUrl}
              </span>
              <div className="flex gap-1 shrink-0 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyLink}
                  className="h-7 w-7 hover:bg-slate-200 dark:hover:bg-white/10"
                  title="Copiar Link"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-[#ADADAD]" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(campaignUrl, '_blank')}
                  className="h-7 w-7 hover:bg-slate-200 dark:hover:bg-white/10"
                  title="Acessar Página"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-[#ADADAD]" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap lg:justify-end shrink-0">
          <Button
            variant="outline"
            className="gap-2 bg-white dark:bg-black/20"
            onClick={handleToggleStatus}
          >
            {campaign.status === 'Aberta' ? (
              <>
                <Lock className="w-4 h-4" />
                Encerrar
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                Reabrir
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="gap-2 bg-white dark:bg-black/20"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>

          <Button
            className="btn-primary-glow gap-2"
            onClick={handleNotifySlack}
          >
            <BellRing className="w-4 h-4" />
            Notificar no Slack
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary/30 transition-colors bg-white dark:bg-[#081a17]/80 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">
              Total de Colaboradores
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {totalEmployees}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/30 transition-colors bg-white dark:bg-[#081a17]/80 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">
              Respostas Recebidas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {responsesCount}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {((responsesCount / totalEmployees) * 100).toFixed(0)}% de
              conclusão
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/30 transition-colors bg-white dark:bg-[#081a17]/80 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-900 dark:text-white">
              Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-sky-500 dark:text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {pendingCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 bg-white dark:bg-[#081a17]/80 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none h-[420px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Distribuição de Tamanhos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            {responsesCount > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-slate-200 dark:stroke-white/5"
                  />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    className="fill-slate-600 dark:fill-slate-400 text-xs"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    className="fill-slate-600 dark:fill-slate-400 text-xs"
                  />
                  <ChartTooltip
                    cursor={{ fill: 'rgba(148,163,184,0.1)' }}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--color-value)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                Aguardando respostas
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-white dark:bg-[#081a17]/80 border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none h-[420px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Lista de Respostas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0 overflow-auto rounded-b-2xl">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-50 dark:bg-[#061412] z-10 shadow-sm">
                <TableRow className="border-gray-200 dark:border-white/10">
                  <TableHead className="pl-6 text-slate-600 dark:text-slate-300">
                    Colaborador
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-300">
                    Departamento
                  </TableHead>
                  <TableHead className="text-slate-600 dark:text-slate-300">
                    Data
                  </TableHead>
                  <TableHead className="text-right pr-6 text-slate-600 dark:text-slate-300">
                    Escolha
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-slate-500"
                    >
                      Nenhum colaborador encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  tableData.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/5 border-slate-100 dark:border-white/5"
                    >
                      <TableCell className="pl-6 font-medium text-slate-900 dark:text-white">
                        {row.name}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-[#ADADAD]">
                        {row.department}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-[#ADADAD] text-xs">
                        {row.date || '-'}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        {row.choice !== 'Pendente' ? (
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:border-primary/30"
                          >
                            {row.choice}
                          </Badge>
                        ) : (
                          <span className="text-sm text-slate-400 dark:text-slate-500 italic">
                            Pendente
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
