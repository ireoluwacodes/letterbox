import { useMemo } from "react"
import { useWebHaptics } from "web-haptics/react"
import type { HapticInput } from "web-haptics"

import type { IWebHapticsProviderProps } from "./@types"
import type { IWebHapticsContextValue } from "@/lib/webHapticsContext"
import { WebHapticsContext } from "@/lib/webHapticsContext"

export function WebHapticsProvider({ children }: IWebHapticsProviderProps) {
  const { trigger, isSupported } = useWebHaptics()

  const value = useMemo((): IWebHapticsContextValue => {
    return {
      isSupported,
      tap: (input?: HapticInput) => {
        if (!isSupported) return
        const result = trigger(input ?? "light")
        if (result != null) {
          void result.catch(() => {
            /* ignore unsupported / interrupted vibration */
          })
        }
      },
    }
  }, [trigger, isSupported])

  return (
    <WebHapticsContext.Provider value={value}>
      {children}
    </WebHapticsContext.Provider>
  )
}
