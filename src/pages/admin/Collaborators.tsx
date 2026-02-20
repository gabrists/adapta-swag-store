import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Pencil,
  Users,
  Eye,
  Gift,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import useSwagStore from '@/stores/useSwagStore'
import { Collaborator } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CollaboratorDialog } from '@/components/admin/CollaboratorDialog'
import { CollaboratorProfile } from '@/components/admin/CollaboratorProfile'
import { ManualDeliveryDialog } from '@/components/admin/ManualDeliveryDialog'

const departmentColors: Record<string, string> = {
  Marketing: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  B2B: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  B2C: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
  Produto: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
  Engenharia: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
  RH: 'bg-primary/20 text-primary border border-primary/30',
  Financeiro: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
}

type SortKey =
  | 'name'
  | 'department'
  | 'role'
  | 'redeemedCount'
  | 'onboardingKitStatus'
type SortDirection = 'asc' | 'desc'

interface SortConfig {
  key: SortKey
  direction: SortDirection
}

export default function Collaborators() {
  const {
    team,
    orders,
    addCollaborator,
    updateCollaborator,
    deleteCollaborator,
  } = useSwagStore()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('Todas')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [manualDeliveryEmpId, setManualDeliveryEmpId] = useState<string | null>(
    null,
  )
  const [selectedCollab, setSelectedCollab] = useState<Collaborator | null>(
    null,
  )
  const [deleteCollab, setDeleteCollab] = useState<Collaborator | null>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'name',
    direction: 'asc',
  })

  const departments = useMemo(() => {
    const depts = Array.from(new Set(team.map((c) => c.department)))
    return ['Todas', ...depts.sort()]
  }, [team])

  const processedTeam = useMemo(() => {
    const counts = orders.reduce(
      (acc, order) => {
        if (order.status === 'Entregue') {
          acc[order.employeeId] = (acc[order.employeeId] || 0) + order.quantity
        }
        return acc
      },
      {} as Record<string, number>,
    )

    let data = team.map((collab) => ({
      ...collab,
      redeemedCount: counts[collab.id] || 0,
    }))

    if (searchQuery || departmentFilter !== 'Todas') {
      const lowerQuery = searchQuery.toLowerCase()
      data = data.filter((collab) => {
        const matchesSearch =
          collab.name.toLowerCase().includes(lowerQuery) ||
          collab.email.toLowerCase().includes(lowerQuery) ||
          collab.department.toLowerCase().includes(lowerQuery) ||
          collab.role.toLowerCase().includes(lowerQuery)

        const matchesDept =
          departmentFilter === 'Todas' || collab.department === departmentFilter

        return matchesSearch && matchesDept
      })
    }

    data.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })

    return data
  }, [team, orders, searchQuery, departmentFilter, sortConfig])

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const handleCreate = () => {
    setSelectedCollab(null)
    setDialogOpen(true)
  }

  const handleEdit = (collab: Collaborator) => {
    setSelectedCollab(collab)
    setDialogOpen(true)
  }

  const handleDelete = (collab: Collaborator) => {
    setDeleteCollab(collab)
  }

  const handleViewProfile = (collab: Collaborator) => {
    setSelectedCollab(collab)
    setProfileOpen(true)
  }

  const handleManualDelivery = (collab: Collaborator) => {
    setManualDeliveryEmpId(collab.id)
  }

  const confirmDelete = () => {
    if (deleteCollab) {
      deleteCollaborator(deleteCollab.id)
      setDeleteCollab(null)
      toast({
        title: 'Acesso removido',
        description: `${deleteCollab.name} foi removido do time.`,
      })
    }
  }

  const handleSave = async (values: any) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (selectedCollab) {
      updateCollaborator({
        ...selectedCollab,
        ...values,
      })
      toast({
        title: 'Colaborador atualizado!',
        description: `Os dados de ${values.name} foram salvos.`,
      })
    } else {
      addCollaborator(values)
      toast({
        title: 'Colaborador adicionado!',
        description: `Colaborador ${values.name} adicionado ao time!`,
      })
    }
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-slate-500" />
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4 text-primary" />
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Time & Colaboradores
          </h1>
          <p className="text-base text-slate-400">
            Gerencie quem tem acesso aos benefícios da loja.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="btn-primary-glow h-12 px-6 text-base rounded-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Colaborador
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 glass-panel p-4 md:p-5 rounded-2xl">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar por nome, email ou área..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 w-full"
          />
        </div>
        <div className="w-full sm:w-[220px]">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="h-12 bg-black/20 border-white/10">
              <SelectValue placeholder="Filtrar por Área" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow className="bg-black/20 hover:bg-black/20 border-white/10">
              <TableHead className="w-[300px] min-w-[300px] pl-6">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="-ml-4 h-8 hover:bg-white/5 hover:text-white font-semibold text-slate-300 data-[state=open]:bg-transparent"
                >
                  Colaborador
                  <SortIcon column="name" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[150px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('department')}
                  className="-ml-4 h-8 hover:bg-white/5 hover:text-white font-semibold text-slate-300 data-[state=open]:bg-transparent"
                >
                  Área/Time
                  <SortIcon column="department" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[180px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('role')}
                  className="-ml-4 h-8 hover:bg-white/5 hover:text-white font-semibold text-slate-300 data-[state=open]:bg-transparent"
                >
                  Cargo
                  <SortIcon column="role" />
                </Button>
              </TableHead>
              <TableHead className="text-center min-w-[160px]">
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('redeemedCount')}
                    className="h-8 hover:bg-white/5 hover:text-white font-semibold text-slate-300 data-[state=open]:bg-transparent"
                  >
                    Itens Resgatados
                    <SortIcon column="redeemedCount" />
                  </Button>
                </div>
              </TableHead>
              <TableHead className="text-center min-w-[160px]">
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('onboardingKitStatus')}
                    className="h-8 hover:bg-white/5 hover:text-white font-semibold text-slate-300 data-[state=open]:bg-transparent"
                  >
                    Kit Onboarding
                    <SortIcon column="onboardingKitStatus" />
                  </Button>
                </div>
              </TableHead>
              <TableHead className="text-right w-[100px] min-w-[100px] pr-6 text-slate-400">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedTeam.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-40 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="bg-white/5 p-4 rounded-full">
                      <Users className="h-8 w-8 text-slate-500" />
                    </div>
                    <span>Nenhum colaborador encontrado.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              processedTeam.map((collab) => {
                return (
                  <TableRow
                    key={collab.id}
                    className="whitespace-nowrap hover:bg-white/5 border-white/5 transition-colors"
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border border-white/10 shrink-0">
                          <AvatarImage
                            src={collab.avatarUrl}
                            alt={collab.name}
                          />
                          <AvatarFallback className="text-sm font-bold text-primary bg-primary/20">
                            {collab.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm truncate max-w-[200px]">
                            {collab.name}
                          </span>
                          <span className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">
                            {collab.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'font-medium rounded-md px-2',
                          departmentColors[collab.department] ||
                            'bg-white/5 text-white border border-white/10',
                        )}
                      >
                        {collab.department}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-300 font-medium truncate block max-w-[180px]">
                        {collab.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          collab.redeemedCount > 0 ? 'default' : 'secondary'
                        }
                        className={cn(
                          'rounded-full px-2 min-w-[2rem] justify-center text-xs',
                          collab.redeemedCount === 0 &&
                            'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10',
                          collab.redeemedCount > 0 &&
                            'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(20,240,214,0.2)] hover:bg-primary/30',
                        )}
                      >
                        {collab.redeemedCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-medium rounded-md border text-xs px-2',
                          collab.onboardingKitStatus === 'Entregue'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-sky-500/20 text-sky-400 border-sky-500/30',
                        )}
                      >
                        {collab.onboardingKitStatus || 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleManualDelivery(collab)}
                              className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg"
                            >
                              <Gift className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#081a17]/90 border-white/10 text-white">
                            <p>Enviar Brinde Manual</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewProfile(collab)}
                              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#081a17]/90 border-white/10 text-white">
                            <p>Visualizar Perfil</p>
                          </TooltipContent>
                        </Tooltip>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-lg hover:bg-white/10"
                            >
                              <span className="sr-only">Menu</span>
                              <MoreHorizontal className="h-4 w-4 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleEdit(collab)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(collab)}
                              className="text-slate-400 focus:text-slate-300 focus:bg-white/5"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CollaboratorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        collaborator={selectedCollab}
        onSave={handleSave}
      />

      <CollaboratorProfile
        open={profileOpen}
        onOpenChange={setProfileOpen}
        collaborator={selectedCollab}
      />

      {manualDeliveryEmpId && (
        <ManualDeliveryDialog
          open={!!manualDeliveryEmpId}
          onOpenChange={(open) => !open && setManualDeliveryEmpId(null)}
          employeeId={manualDeliveryEmpId}
          onSuccess={() => {
            setManualDeliveryEmpId(null)
          }}
        />
      )}

      <AlertDialog
        open={!!deleteCollab}
        onOpenChange={(open) => !open && setDeleteCollab(null)}
      >
        <AlertDialogContent className="rounded-2xl glass-panel">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Tem certeza que deseja remover este acesso?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              O colaborador{' '}
              <span className="font-bold text-white">{deleteCollab?.name}</span>{' '}
              perderá o acesso e não constará mais na lista do time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700"
            >
              Sim, remover acesso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
