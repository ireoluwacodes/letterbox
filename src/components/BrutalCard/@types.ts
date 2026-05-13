import type { ComponentProps } from "react"

import type { Card } from "@/components/ui/card"

export interface IBrutalCardProps extends ComponentProps<typeof Card> {
  /** When true, card lifts on hover per design system */
  interactive?: boolean
}
