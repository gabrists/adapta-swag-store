import './sonner.css'
import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'dark' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-right"
      duration={2000}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-[#081a17]/90 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-slate-900 dark:group-[.toaster]:text-white group-[.toaster]:border-gray-200 dark:group-[.toaster]:border-white/10 group-[.toaster]:shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:group-[.toaster]:shadow-[0_4px_20px_rgba(20,240,214,0.15)] rounded-xl',
          description:
            'group-[.toast]:text-gray-500 dark:group-[.toast]:text-slate-400',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-gray-100 dark:group-[.toast]:bg-white/10 group-[.toast]:text-gray-600 dark:group-[.toast]:text-slate-300',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
