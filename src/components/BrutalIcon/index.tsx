import { HugeiconsIcon } from "@hugeicons/react"

import type { IBrutalIconProps } from "./@types"
import { cn } from "@/lib/utils"

export function BrutalIcon({
  icon,
  size = 24,
  className,
  strokeWidth = 1.75,
}: IBrutalIconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color="currentColor"
      strokeWidth={strokeWidth}
      className={cn("inline-block shrink-0 text-foreground", className)}
    />
  )
}
