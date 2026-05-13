import type { IconSvgElement } from "@hugeicons/react"

export interface IBrutalIconProps {
  icon: IconSvgElement
  /** Pixel size; default 24 */
  size?: number
  /** Extra classes (e.g. text-muted-foreground) */
  className?: string
  strokeWidth?: number
}
