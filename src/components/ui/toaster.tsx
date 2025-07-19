import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle, AlertCircle, XCircle, Info, Sparkles } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const getToastIcon = (variant: "default" | "destructive" | "success" | null | undefined) => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-emerald-400 animate-pulse" />
      case "destructive":
        return <XCircle className="h-5 w-5 text-red-400 animate-pulse" />
      case "default":
        return <Sparkles className="h-5 w-5 text-[#62cbc1] animate-pulse" />
      default:
        return <Info className="h-5 w-5 text-blue-400 animate-pulse" />
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start space-x-3 w-full">
              <div className="flex-shrink-0 mt-1">
                {getToastIcon(variant as "default" | "destructive" | "success")}
              </div>
              <div className="flex-grow grid gap-1">
                {title && (
                  <ToastTitle className="text-base font-bold text-white flex items-center gap-2">
                    {title}
                    <div className="h-1 w-1 bg-[#62cbc1] rounded-full animate-ping"></div>
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className="text-gray-300 text-sm leading-relaxed">
                    {description}
                  </ToastDescription>
                )}
              </div>
              {action}
            </div>
            <ToastClose className="text-gray-400 hover:text-white transition-colors duration-200" />
            
            {/* Animated border effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-[#62cbc1]/20 to-transparent animate-pulse pointer-events-none"></div>
            
            {/* Floating particles effect */}
            <div className="absolute top-2 right-16 w-1 h-1 bg-[#62cbc1] rounded-full animate-ping opacity-75"></div>
            <div className="absolute top-4 right-20 w-0.5 h-0.5 bg-[#62cbc1] rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-3 right-14 w-0.5 h-0.5 bg-[#62cbc1] rounded-full animate-ping delay-700"></div>
            
            {/* Progress bar for auto-dismiss */}
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#62cbc1] via-[#4db8a8] to-[#62cbc1] rounded-b-xl animate-shrink-width shadow-md"></div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#62cbc1]/5 via-transparent to-[#62cbc1]/5 animate-toast-glow pointer-events-none"></div>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
