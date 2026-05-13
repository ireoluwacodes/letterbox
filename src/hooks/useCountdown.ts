import { useEffect, useState } from "react"

import { getRemainingMs } from "@/lib/countdown"

export function useCountdown(deadline: number | null): number {
  const [ms, setMs] = useState(() => getRemainingMs(deadline, Date.now()))

  useEffect(() => {
    setMs(getRemainingMs(deadline, Date.now()))
    const id = setInterval(() => {
      setMs(getRemainingMs(deadline, Date.now()))
    }, 250)
    return () => clearInterval(id)
  }, [deadline])

  return ms
}
