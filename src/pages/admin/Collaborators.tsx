import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Pencil,
  Users,
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
import { CollaboratorDialog } from '@/components/admin/CollaboratorDialog'

const departmentColors: Record<string, string> = {
  Marketing: 'bg-pink-100 text-pink-800',
  B2B: 'bg-blue-100 text-blue-800',
  B2C: 'bg-cyan-100 text-cyan-800',
  Produto: 'bg-purple-100 text-purple-800',
  Engenharia: 'bg-slate-100 text-slate-800',
  RH: 'bg-primary/10 text-primary',
  Financeiro: 'bg-emerald-100 text-emerald-800',
}

export default function Collaborators() {
  const { team, addCollaborator, updateCollaborator, deleteCollaborator } =
    useSwagStore()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCollab, setSelectedCollab] = useState<Collaborator | null>(
    null,
  )
  const [deleteCollab, setDeleteCollab] = useState<Collaborator | null>(null)

  const filteredTeam = useMemo(() => {
    return team.filter(
      (collab) =>
        collab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collab.department.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [team, searchQuery])

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

  return (
    <div className="space-y-6">
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
          <Plus className="w-4 h-4 mr-2" />
          Novo Colaborador
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm max-w-sm">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <Input
          placeholder="Buscar por nome ou área..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-none shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-[300px]">Colaborador</TableHead>
              <TableHead>Área/Time</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeam.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="h-8 w-8 text-slate-300" />
                    <span>Nenhum colaborador encontrado.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTeam.map((collab) => (
                <TableRow key={collab.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-100">
                        <AvatarImage src={collab.avatarUrl} alt={collab.name} />
                        <AvatarFallback className="text-xs font-bold text-primary bg-primary/10">
                          {collab.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">
                          {collab.name}
                        </span>
                        <span className="text-xs text-slate-500">
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
                    <span className="text-sm text-slate-600 font-medium">
                      {collab.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
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
                      <DropdownMenuContent align="end" className="rounded-lg">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(collab)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(collab)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
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
