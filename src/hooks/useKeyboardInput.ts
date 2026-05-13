import { useEffect } from "react"

export function useKeyboardInput(
  onLetter: (letter: string) => void,
  enabled: boolean
): void {
  useEffect(() => {
    if (!enabled) return

    function handler(ev: KeyboardEvent) {
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return
      const k = ev.key
      if (!/^[a-zA-Z]$/.test(k)) return
      ev.preventDefault()
      onLetter(k.toUpperCase())
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [enabled, onLetter])
}
