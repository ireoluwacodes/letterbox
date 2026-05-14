import { Toaster } from "sonner"

import type { IRootProvidersProps } from "./@types"
import { BeforeUnloadPlayerLeave } from "@/components/BeforeUnloadPlayerLeave"
import { ConvexConnectionPill } from "@/components/ConvexConnectionPill"
import { ToastProvider } from "@/components/ui/toast"

export function RootProviders({ children }: IRootProvidersProps) {
  return (
    <ToastProvider>
      <BeforeUnloadPlayerLeave />
      <ConvexConnectionPill />
      {children}
      <Toaster
        position="bottom-right"
        theme="light"
        toastOptions={{
          classNames: {
            toast:
              "rounded-none border-[3px] border-foreground bg-background font-medium text-foreground shadow-[6px_6px_0_var(--foreground)]",
            title: "font-bold text-foreground",
            success: "border-foreground",
            error: "border-foreground",
          },
        }}
        className="z-[100]"
      />
    </ToastProvider>
  )
}
