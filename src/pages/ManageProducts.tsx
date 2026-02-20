import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Save, Image as ImageIcon, CloudUpload, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import useSwagStore from '@/stores/useSwagStore'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { uploadToR2 } from '@/lib/storage'

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  stock: z.coerce.number().min(0, 'Quantidade não pode ser negativa'),
  price: z.coerce.number().min(0, 'O valor não pode ser negativo'),
  unitCost: z.coerce.number().min(0, 'O custo não pode ser negativo'),
  supplierUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  description: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  category: z.string().min(1, 'Selecione uma categoria'),
  imageQuery: z
    .string()
    .min(3, 'Informe uma URL, termo ou faça upload de imagem'),
})

export default function ManageProducts() {
  const { addProduct } = useSwagStore()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      stock: 0,
      price: 0,
      unitCost: 0,
      supplierUrl: '',
      description: '',
      category: '',
      imageQuery: '',
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isUploading) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (isUploading) return

    const file = e.dataTransfer.files?.[0]
    processFile(file)
  }

  const processFile = async (file?: File) => {
    if (file) {
      try {
        setIsUploading(true)

        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        const url = await uploadToR2(file)
        form.setValue('imageQuery', url, { shouldValidate: true })
        setImagePreview(url)

        toast({
          title: 'Upload concluído',
          description: 'Imagem armazenada com sucesso.',
        })
      } catch (error) {
        toast({
          title: 'Erro no upload',
          description:
            error instanceof Error
              ? error.message
              : 'Não foi possível enviar a imagem.',
          variant: 'destructive',
        })
        if (!form.getValues('imageQuery')) {
          setImagePreview(null)
        }
      } finally {
        setIsUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    form.setValue('imageQuery', '')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    try {
      await addProduct({
        name: values.name,
        stock: values.stock,
        price: values.price,
        unitCost: values.unitCost,
        supplierUrl: values.supplierUrl,
        description: values.description,
        category: values.category,
        imageQuery: values.imageQuery,
      })

      toast({
        title: 'Brinde cadastrado!',
        description: `${values.name} foi adicionado ao catálogo com sucesso.`,
      })

      form.reset()
      setImagePreview(null)
      navigate('/')
    } catch (error) {
      toast({
        title: 'Erro ao cadastrar',
        description: 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in-up">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Gerenciar Brindes
        </h1>
        <p className="text-base text-slate-400">
          Cadastre novos itens no catálogo da loja.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Brinde</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para disponibilizar um novo item na
            vitrine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">
                        Nome do Brinde
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Mochila Executiva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">
                        Categoria
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="RH">RH</SelectItem>
                          <SelectItem value="Vendas">Vendas</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Tech">Tech</SelectItem>
                          <SelectItem value="Institucional">
                            Institucional
                          </SelectItem>
                          <SelectItem value="Vestuário">Vestuário</SelectItem>
                          <SelectItem value="Utensílios">Utensílios</SelectItem>
                          <SelectItem value="Kits">Kits</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">
                        Estoque Inicial
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">
                        Valor (R$)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-500">
                        Valor referencial
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">
                        Custo Unitário (R$)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-500">
                        Custo para a empresa
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="supplierUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">
                      URL do Fornecedor
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://fornecedor.com.br/produto"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel className="text-slate-200">
                  Imagem do Produto
                </FormLabel>

                <div className="flex flex-col gap-4">
                  {imagePreview ? (
                    <div className="relative w-full h-64 bg-black/40 rounded-xl overflow-hidden border border-white/10 group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className={cn(
                          'w-full h-full object-contain transition-opacity',
                          isUploading ? 'opacity-50' : 'opacity-100',
                        )}
                      />
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        </div>
                      )}
                      {!isUploading && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full shadow-lg hover:bg-red-500/20 hover:text-red-400 border border-white/10 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() =>
                        !isUploading && fileInputRef.current?.click()
                      }
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        'w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300',
                        isUploading
                          ? 'cursor-wait bg-black/20 border-white/5'
                          : 'cursor-pointer',
                        isDragging && !isUploading
                          ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(20,240,214,0.1)]'
                          : 'border-white/20 bg-black/20 hover:bg-white/5 hover:border-white/30',
                      )}
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <span className="text-sm font-medium text-slate-300">
                            Processando imagem...
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="bg-white/5 p-4 rounded-full mb-3 shadow-inner">
                            <CloudUpload
                              className={cn(
                                'w-8 h-8',
                                isDragging ? 'text-primary' : 'text-slate-400',
                              )}
                            />
                          </div>
                          <span className="text-base font-medium text-slate-200">
                            Clique para Upload
                          </span>
                          <span className="text-sm text-slate-500 mt-1">
                            ou arraste e solte (PNG, JPG, WEBP)
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                  />

                  <div className="flex items-center gap-4 py-2">
                    <div className="h-px bg-white/10 flex-1"></div>
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                      Ou use URL / Termo
                    </span>
                    <div className="h-px bg-white/10 flex-1"></div>
                  </div>

                  <FormField
                    control={form.control}
                    name="imageQuery"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                              placeholder="Ex: 'black backpack' ou cole uma URL"
                              className="pl-11 h-12"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                if (e.target.value.startsWith('http')) {
                                  setImagePreview(e.target.value)
                                }
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva os detalhes do item..."
                        className="resize-none min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="min-w-[180px] h-12 text-base gap-2"
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting || isUploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Salvar Brinde
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
