import { createContext, useContext } from "react"

import type { HapticInput } from "web-haptics"

export interface IWebHapticsContextValue {
  readonly tap: (input?: HapticInput) => void
  readonly isSupported: boolean
}

export const WebHapticsContext = createContext<IWebHapticsContextValue | null>(
  null,
)

export function useHapticsTap(): IWebHapticsContextValue | null {
  return useContext(WebHapticsContext)
}
