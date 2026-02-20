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
  Marketing: 'bg-pink-100 text-pink-800',
  B2B: 'bg-blue-100 text-blue-800',
  B2C: 'bg-cyan-100 text-cyan-800',
  Produto: 'bg-purple-100 text-purple-800',
  Engenharia: 'bg-slate-100 text-slate-800',
  RH: 'bg-primary/10 text-primary',
  Financeiro: 'bg-emerald-100 text-emerald-800',
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

  // Get distinct departments for filter
  const departments = useMemo(() => {
    const depts = Array.from(new Set(team.map((c) => c.department)))
    return ['Todas', ...depts.sort()]
  }, [team])

  // Process team data: calculate counts, filter, and sort
  const processedTeam = useMemo(() => {
    // 1. Pre-calculate redeemed counts for performance
    const counts = orders.reduce(
      (acc, order) => {
        if (order.status === 'Entregue') {
          acc[order.employeeId] = (acc[order.employeeId] || 0) + order.quantity
        }
        return acc
      },
      {} as Record<string, number>,
    )

    // 2. Extend team data with counts
    let data = team.map((collab) => ({
      ...collab,
      redeemedCount: counts[collab.id] || 0,
    }))

    // 3. Filter
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

    // 4. Sort
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
        variant: 'destructive',
      })
    }
  }

  const handleSave = async (values: any) => {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (selectedCollab) {
      updateCollaborator({
        ...selectedCollab,
        ...values,
      })
      toast({
        title: 'Colaborador atualizado!',
        description: `Os dados de ${values.name} foram salvos.`,
        className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      })
    } else {
      addCollaborator(values)
      toast({
        title: 'Colaborador adicionado!',
        description: `Colaborador ${values.name} adicionado ao time!`,
        className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      })
    }
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-slate-400" />
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4 text-primary" />
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Time & Colaboradores
          </h1>
          <p className="text-sm text-slate-500">
            Gerencie quem tem acesso aos benefícios do Swag.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-primary hover:bg-primary/90 text-white shadow-sm rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Novo Colaborador
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm max-w-sm flex-1">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <Input
            placeholder="Buscar por nome, email ou área..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="w-[200px]">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="bg-white border-slate-200 shadow-sm">
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

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-[300px] min-w-[300px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="-ml-4 h-8 hover:bg-transparent hover:text-primary font-semibold text-slate-700 data-[state=open]:bg-transparent"
                >
                  Colaborador
                  <SortIcon column="name" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[150px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('department')}
                  className="-ml-4 h-8 hover:bg-transparent hover:text-primary font-semibold text-slate-700 data-[state=open]:bg-transparent"
                >
                  Área/Time
                  <SortIcon column="department" />
                </Button>
              </TableHead>
              <TableHead className="min-w-[180px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('role')}
                  className="-ml-4 h-8 hover:bg-transparent hover:text-primary font-semibold text-slate-700 data-[state=open]:bg-transparent"
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
                    className="h-8 hover:bg-transparent hover:text-primary font-semibold text-slate-700 data-[state=open]:bg-transparent"
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
                    className="h-8 hover:bg-transparent hover:text-primary font-semibold text-slate-700 data-[state=open]:bg-transparent"
                  >
                    Kit Onboarding
                    <SortIcon column="onboardingKitStatus" />
                  </Button>
                </div>
              </TableHead>
              <TableHead className="text-right w-[100px] min-w-[100px]">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedTeam.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="h-8 w-8 text-slate-300" />
                    <span>Nenhum colaborador encontrado.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              processedTeam.map((collab) => {
                return (
                  <TableRow key={collab.id} className="whitespace-nowrap">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-slate-100">
                          <AvatarImage
                            src={collab.avatarUrl}
                            alt={collab.name}
                          />
                          <AvatarFallback className="text-xs font-bold text-primary bg-primary/10">
                            {collab.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm truncate max-w-[200px]">
                            {collab.name}
                          </span>
                          <span className="text-xs text-slate-500 truncate max-w-[200px]">
                            {collab.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          'font-medium rounded-md hover:bg-opacity-80',
                          departmentColors[collab.department] || 'bg-slate-100',
                        )}
                      >
                        {collab.department}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 font-medium truncate block max-w-[180px]">
                        {collab.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          collab.redeemedCount > 0 ? 'default' : 'secondary'
                        }
                        className={cn(
                          'rounded-full px-2 min-w-[2rem] justify-center',
                          collab.redeemedCount === 0 &&
                            'bg-slate-100 text-slate-500 hover:bg-slate-100',
                          collab.redeemedCount > 0 &&
                            'bg-[#0E9C8B] hover:bg-[#0E9C8B]/90',
                        )}
                      >
                        {collab.redeemedCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-normal rounded-md border-0',
                          collab.onboardingKitStatus === 'Entregue'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
                        )}
                      >
                        {collab.onboardingKitStatus || 'Pendente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleManualDelivery(collab)}
                              className="h-8 w-8 p-0 text-slate-500 hover:text-[#0E9C8B] hover:bg-[#0E9C8B]/10 rounded-md"
                            >
                              <Gift className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enviar Brinde Manual</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewProfile(collab)}
                              className="h-8 w-8 p-0 text-slate-500 hover:text-[#0E9C8B] hover:bg-[#0E9C8B]/10 rounded-md"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Visualizar Perfil</p>
                          </TooltipContent>
                        </Tooltip>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-md"
                            >
                              <span className="sr-only">Menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-lg"
                          >
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleEdit(collab)}
                            >
                              <Pencil className="h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(collab)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
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
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja remover este acesso?
            </AlertDialogTitle>
            <AlertDialogDescription>
              O colaborador{' '}
              <span className="font-bold text-slate-900">
                {deleteCollab?.name}
              </span>{' '}
              perderá o acesso e não constará mais na lista do time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Sim, remover acesso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
