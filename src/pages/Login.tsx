import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Package2, Loader2, ArrowRight, AlertCircle, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  email: z.string().email('Digite um e-mail válido'),
  password: z.string().min(1, 'A senha é obrigatória'),
})

export default function Login() {
  const { login, loginWithSlack, isAuthenticated, user, isLoading } =
    useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const from = location.state?.from?.pathname || '/'

  // Handle successful login redirection based on auth state
  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate(from === '/login' ? '/' : from, { replace: true })
      }
    }
  }, [isAuthenticated, isLoading, user, navigate, from])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleSlackLogin = async () => {
    try {
      const { error } = await loginWithSlack()
      if (error) {
        console.error('Slack OAuth Init Error:', error)
        toast({
          title: 'Erro de Autenticação',
          description:
            'Não foi possível iniciar o login com o Slack. Verifique sua conexão e tente novamente.',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      console.error('Unexpected Slack login error:', error)
      toast({
        title: 'Erro no Slack',
        description:
          'Ocorreu um erro inesperado ao conectar com o Slack. Tente novamente mais tarde.',
        variant: 'destructive',
      })
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const { error } = await login(values.email, values.password)
      if (error) {
        setIsSubmitting(false)
        if (error.message === 'Invalid login credentials') {
          throw new Error(
            'Credenciais inválidas. Verifique seu e-mail e senha.',
          )
        }
        throw error
      }

      toast({
        title: 'Bem-vindo de volta!',
        description: 'Login realizado com sucesso.',
      })
      // Do not call setIsSubmitting(false) here.
      // The button will remain in a loading state until the useEffect redirects the user and unmounts the component.
    } catch (error: any) {
      console.error('Login error', error)
      const message = error.message || 'Falha na autenticação'
      setErrorMessage(message)
      toast({
        title: 'Erro ao entrar',
        description: message,
        variant: 'destructive',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center relative z-10">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-[0_0_20px_rgba(20,240,214,0.4)]">
                <Package2 className="w-7 h-7" />
              </div>
              <span className="font-display font-bold text-3xl tracking-tight text-white">
                Adapta <span className="text-primary">Swag</span>
              </span>
            </div>
          </div>

          <Card className="glass-panel border-white/10 shadow-2xl backdrop-blur-2xl">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-white">
                Acesse sua conta
              </CardTitle>
              <CardDescription className="text-center text-[#ADADAD] text-base">
                Faça login para acessar os benefícios da Adapta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/10 p-4 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Acesso Exclusivo
                  </p>
                </div>
                <p className="text-sm text-white/90 font-medium leading-relaxed">
                  Utilize sua conta do <strong>Slack da Adapta</strong> para
                  acessar a loja e solicitar seus brindes.
                </p>
              </div>

              {errorMessage && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <Button
                type="button"
                onClick={handleSlackLogin}
                className="w-full h-12 text-base font-bold bg-[#4A154B] hover:bg-[#4A154B]/90 text-white mb-6 border-none shadow-lg hover:shadow-[#4A154B]/50 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 40 40"
                  fill="none"
                  className="mr-2"
                >
                  <rect width="40" height="40" rx="20" fill="white" />
                  <path
                    d="M29.692 19.0768C30.9663 19.0768 31.9994 18.0437 31.9994 16.7693C31.9994 15.495 30.9662 14.4619 29.6919 14.4619C28.4174 14.4619 27.3842 15.4951 27.3842 16.7695V19.0768H29.692ZM23.2305 19.0768C24.5049 19.0768 25.5381 18.0436 25.5381 16.7691V10.3082C25.5381 9.03376 24.5049 8.00061 23.2305 8.00061C21.956 8.00061 20.9229 9.03376 20.9229 10.3082V16.7691C20.9229 18.0436 21.956 19.0768 23.2305 19.0768Z"
                    fill="#2EB67D"
                  />
                  <path
                    d="M10.308 20.9232C9.03367 20.9232 8.00061 21.9563 8.00061 23.2307C8.00061 24.505 9.03377 25.5381 10.3081 25.5381C11.5826 25.5381 12.6158 24.5049 12.6158 23.2305V20.9232H10.308ZM16.7695 20.9232C15.4951 20.9232 14.4619 21.9564 14.4619 23.2309V29.6918C14.4619 30.9662 15.4951 31.9994 16.7695 31.9994C18.044 31.9994 19.0771 30.9662 19.0771 29.6918V23.2309C19.0771 21.9564 18.044 20.9232 16.7695 20.9232Z"
                    fill="#E01E5A"
                  />
                  <path
                    d="M19.0768 10.3081C19.0768 9.03367 18.0437 8.00061 16.7693 8.00061C15.495 8.00061 14.4619 9.03377 14.4619 10.3081C14.4619 11.5826 15.4951 12.6158 16.7695 12.6158H19.0768V10.3081ZM19.0768 16.7695C19.0768 15.4951 18.0436 14.4619 16.7691 14.4619H10.3082C9.03376 14.4619 8.00061 15.4951 8.00061 16.7695C8.00061 18.044 9.03376 19.0771 10.3082 19.0771H16.7691C18.0436 19.0771 19.0768 18.044 19.0768 16.7695Z"
                    fill="#36C5F0"
                  />
                  <path
                    d="M20.9232 29.6919C20.9232 30.9663 21.9563 31.9994 23.2307 31.9994C24.505 31.9994 25.5381 30.9662 25.5381 29.6919C25.5381 28.4174 24.5049 27.3842 23.2305 27.3842H20.9232V29.6919ZM20.9232 23.2305C20.9232 24.5049 21.9564 25.5381 23.2309 25.5381H29.6918C30.9662 25.5381 31.9994 24.5049 31.9994 23.2305C31.9994 21.956 30.9662 20.9229 29.6918 20.9229H23.2309C21.9564 20.9229 20.9232 21.956 20.9232 23.2305Z"
                    fill="#ECB22E"
                  />
                </svg>
                Entrar com Slack
              </Button>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-xs text-[#ADADAD] uppercase font-bold tracking-wider">
                  Ou entre com e-mail
                </span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#ADADAD]">E-mail</FormLabel>
                        <FormControl>
                          <Input
                            className="h-12"
                            placeholder="seu.nome@adapta.org"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#ADADAD]">Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            className="h-12"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-bold btn-primary-glow"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        <>
                          Entrar <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-center text-sm text-[#ADADAD] gap-2 pt-6 border-t border-white/5">
              <p>
                Esqueceu sua senha?{' '}
                <span className="text-primary font-medium cursor-pointer hover:underline transition-colors">
                  Recuperar acesso
                </span>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
