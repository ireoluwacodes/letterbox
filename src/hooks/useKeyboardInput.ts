import { useEffect } from "react"

import { useHapticsTap } from "@/lib/webHapticsContext"

export function useKeyboardInput(
  onLetter: (letter: string) => void,
  enabled: boolean,
): void {
  const haptics = useHapticsTap()

  useEffect(() => {
    if (!enabled) return

    function handler(ev: KeyboardEvent) {
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return
      const k = ev.key
      if (!/^[a-zA-Z]$/.test(k)) return
      ev.preventDefault()
      haptics?.tap("selection")
      onLetter(k.toUpperCase())
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [enabled, onLetter, haptics])
}
