import * as React from "react"

import { cn } from "@/lib/utils"
import { useToastStore } from "@/stores/toastStore"

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto max-w-[min(100%,560px)] translate-y-0 border-[3px] border-foreground bg-background px-4 py-3 font-mono text-sm font-bold shadow-[6px_6px_0_var(--foreground)] transition-transform duration-[80ms] ease-linear"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </>
  )
}
