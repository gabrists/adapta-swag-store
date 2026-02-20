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
          description: 'Imagem armazenada no Cloudflare R2.',
          className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
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
        className: 'bg-emerald-50 border-emerald-200 text-emerald-900',
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
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Gerenciar Brindes
        </h1>
        <p className="text-sm text-slate-500">
          Cadastre novos itens no catálogo da loja.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Novo Brinde</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para disponibilizar um novo item na
            vitrine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Brinde</FormLabel>
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
                      <FormLabel>Categoria</FormLabel>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque Inicial</FormLabel>
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
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Valor de venda</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custo Unitário (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Custo para a empresa</FormDescription>
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
                    <FormLabel>URL do Fornecedor</FormLabel>
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
                <FormLabel>Imagem do Produto</FormLabel>

                <div className="flex flex-col gap-4">
                  {imagePreview ? (
                    <div className="relative w-full h-64 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group">
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
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors"
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
                        'w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all duration-200',
                        isUploading
                          ? 'cursor-wait bg-slate-50'
                          : 'cursor-pointer',
                        isDragging && !isUploading
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400',
                      )}
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <span className="text-sm font-medium text-slate-600">
                            Enviando para R2...
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="bg-slate-100 p-3 rounded-full mb-3">
                            <CloudUpload
                              className={cn(
                                'w-6 h-6',
                                isDragging ? 'text-primary' : 'text-slate-400',
                              )}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            Clique para Upload
                          </span>
                          <span className="text-xs text-slate-500 mt-1">
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

                  <div className="flex items-center gap-2">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-xs text-slate-400 uppercase font-medium">
                      Ou use URL / Termo
                    </span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>

                  <FormField
                    control={form.control}
                    name="imageQuery"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              placeholder="Ex: 'black backpack' ou cole uma URL"
                              className="pl-9"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                if (e.target.value.startsWith('http')) {
                                  setImagePreview(e.target.value)
                                } else if (
                                  imagePreview &&
                                  imagePreview.startsWith('data:')
                                ) {
                                  // Keep preview if it's a data URL unless cleared
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
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva os detalhes do item..."
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  className="min-w-[150px] gap-2"
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting || isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
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
