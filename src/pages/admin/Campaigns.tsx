import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  Megaphone,
  CheckCircle,
  X,
  Loader2,
  Upload,
  ImageIcon,
  Pencil,
  Link as LinkIcon,
  ExternalLink,
  Copy,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Campaign } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import useSwagStore from '@/stores/useSwagStore'
import { useToast } from '@/hooks/use-toast'
import { uploadToR2 } from '@/lib/storage'

const formSchema = z.object({
  name: z.string().min(2, 'O nome é obrigatório'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
})

export default function CampaignsPage() {
  const { campaigns, campaignResponses, team, createCampaign, updateCampaign } =
    useSwagStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [optionInput, setOptionInput] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
    },
  })

  const formImageUrl = form.watch('imageUrl')

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const value = optionInput.trim()
      if (value && !options.includes(value)) {
        setOptions([...options, value])
        setOptionInput('')
      }
    }
  }

  const removeOption = (indexToRemove: number) => {
    setOptions(options.filter((_, idx) => idx !== indexToRemove))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingImage(true)
      const url = await uploadToR2(file)
      form.setValue('imageUrl', url)
    } catch (error: any) {
      toast({
        title: 'Erro no upload',
        description: error.message || 'Falha ao processar a imagem.',
        variant: 'destructive',
      })
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    form.reset({
      name: campaign.name,
      description: campaign.description || '',
      imageUrl: campaign.imageUrl || '',
    })
    setOptions(campaign.options)
    setIsDialogOpen(true)
  }

  const handleCopyLink = (campaignId: string) => {
    const url = `${window.location.origin}/coleta/${campaignId}`
    navigator.clipboard.writeText(url)
    toast({
      title: 'Link copiado com sucesso!',
      description: 'Você já pode compartilhar o link com o time.',
      className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    })
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (options.length === 0) {
      toast({
        title: 'Faltam opções',
        description: 'Você precisa adicionar ao menos uma opção de escolha.',
        variant: 'destructive',
      })
      return
    }

    try {
      if (editingCampaign) {
        await updateCampaign(editingCampaign.id, {
          name: values.name,
          description: values.description,
          imageUrl: values.imageUrl,
          options,
        })
        toast({
          title: 'Campanha Atualizada',
          description: 'As alterações foram salvas com sucesso.',
          className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        })
      } else {
        await createCampaign({
          name: values.name,
          description: values.description,
          imageUrl: values.imageUrl,
          options,
        })
        toast({
          title: 'Campanha Criada',
          description: 'A campanha de coleta foi iniciada com sucesso.',
          className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        })
      }
      setIsDialogOpen(false)
      form.reset()
      setOptions([])
      setEditingCampaign(null)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a campanha.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Campanhas de Coleta
          </h1>
          <p className="text-base text-gray-500 dark:text-[#ADADAD]">
            Crie e edite campanhas para coletar tamanhos e opções de brindes do
            time.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCampaign(null)
            form.reset({ name: '', description: '', imageUrl: '' })
            setOptions([])
            setIsDialogOpen(true)
          }}
          className="btn-primary-glow h-12 px-6 text-base rounded-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Campanha
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 glass-panel p-4 md:p-5 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-[#ADADAD]" />
          <Input
            placeholder="Buscar campanha..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12"
          />
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20">
              <TableHead className="pl-6 text-slate-700 dark:text-[#ADADAD]">
                Nome
              </TableHead>
              <TableHead className="text-slate-700 dark:text-[#ADADAD]">
                Status
              </TableHead>
              <TableHead className="text-slate-700 dark:text-[#ADADAD]">
                Opções
              </TableHead>
              <TableHead className="text-center text-slate-700 dark:text-[#ADADAD]">
                Progresso
              </TableHead>
              <TableHead className="text-right pr-6 text-slate-700 dark:text-[#ADADAD]">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4 text-slate-500 dark:text-[#ADADAD]">
                    <div className="bg-gray-100 dark:bg-white/5 p-5 rounded-full shadow-inner">
                      <Megaphone className="w-10 h-10 text-slate-400 dark:text-[#ADADAD]" />
                    </div>
                    <p className="font-medium text-base">
                      Nenhuma campanha encontrada
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCampaigns.map((campaign) => {
                const totalTarget = team.length
                const responsesCount = campaignResponses.filter(
                  (r) => r.campaignId === campaign.id,
                ).length
                const progress =
                  totalTarget > 0 ? (responsesCount / totalTarget) * 100 : 0

                return (
                  <TableRow
                    key={campaign.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/5 border-gray-200 dark:border-white/10 transition-colors"
                  >
                    <TableCell className="pl-6 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-md border border-slate-200 dark:border-white/10 shadow-sm shrink-0">
                          <AvatarImage
                            src={campaign.imageUrl}
                            className="object-cover"
                          />
                          <AvatarFallback className="rounded-md bg-primary/10 text-primary">
                            <Megaphone className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[200px]">
                          {campaign.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          campaign.status === 'Aberta'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 font-medium px-2'
                            : 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10 font-medium px-2'
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {campaign.options.slice(0, 3).map((opt) => (
                          <Badge
                            key={opt}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-[#ADADAD] border border-slate-200 dark:border-transparent"
                          >
                            {opt}
                          </Badge>
                        ))}
                        {campaign.options.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-[#ADADAD] border border-slate-200 dark:border-transparent"
                          >
                            +{campaign.options.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {responsesCount} / {totalTarget}
                        </span>
                        <div className="w-full max-w-[80px] h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyLink(campaign.id)}
                          className="hover:bg-slate-200 dark:hover:bg-white/10"
                          title="Copiar Link"
                        >
                          <LinkIcon className="h-4 w-4 text-slate-500 dark:text-[#ADADAD] hover:text-primary dark:hover:text-primary transition-colors" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            window.open(`/coleta/${campaign.id}`, '_blank')
                          }
                          className="hover:bg-slate-200 dark:hover:bg-white/10"
                          title="Acessar Página"
                        >
                          <ExternalLink className="h-4 w-4 text-slate-500 dark:text-[#ADADAD] hover:text-primary dark:hover:text-primary transition-colors" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(campaign)}
                          className="hover:bg-slate-200 dark:hover:bg-white/10"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4 text-slate-500 dark:text-[#ADADAD] hover:text-primary dark:hover:text-primary transition-colors" />
                        </Button>
                        <Link to={`/admin/campanhas/${campaign.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? 'Editar Campanha' : 'Nova Campanha de Coleta'}
            </DialogTitle>
            <DialogDescription>
              {editingCampaign
                ? 'Atualize os detalhes e as opções disponíveis desta campanha.'
                : 'Crie um link para os colaboradores enviarem as escolhas de tamanho para o próximo kit.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {editingCampaign && (
                <div className="space-y-2">
                  <FormLabel>Link de Compartilhamento</FormLabel>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 w-full overflow-hidden">
                    <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-[#ADADAD] truncate select-all">
                      {`${window.location.origin}/coleta/${editingCampaign.id}`}
                    </span>
                    <div className="flex gap-1 shrink-0 ml-auto">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyLink(editingCampaign.id)}
                        className="h-7 w-7 hover:bg-slate-200 dark:hover:bg-white/10"
                        title="Copiar Link"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-[#ADADAD]" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          window.open(`/coleta/${editingCampaign.id}`, '_blank')
                        }
                        className="h-7 w-7 hover:bg-slate-200 dark:hover:bg-white/10"
                        title="Acessar Página"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-[#ADADAD]" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Campanha</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Camiseta Final de Ano"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Imagem do Produto</FormLabel>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                    {formImageUrl ? (
                      <AvatarImage
                        src={formImageUrl}
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400">
                        <ImageIcon className="h-6 w-6" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isUploadingImage ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        Upload
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                      />
                    </div>
                    <Input
                      placeholder="Ou cole a URL da imagem"
                      value={formImageUrl || ''}
                      onChange={(e) =>
                        form.setValue('imageUrl', e.target.value)
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Escolha o tamanho da sua camiseta..."
                        className="resize-none h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>Opções de Escolha</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {options.map((opt, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="px-3 py-1 text-sm flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:border-primary/30"
                    >
                      {opt}
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="hover:text-red-500 ml-1 transition-colors focus:outline-none"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite uma opção (ex: G) e aperte Enter"
                />
                <FormDescription>
                  Pressione <strong>Enter</strong> para adicionar cada opção à
                  lista.
                </FormDescription>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || isUploadingImage}
                  className="bg-[#0E9C8B] hover:bg-[#0E9C8B]/90 text-white"
                >
                  {form.formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {editingCampaign ? 'Salvar Alterações' : 'Salvar Campanha'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
