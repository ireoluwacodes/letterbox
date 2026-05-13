import type { IBrutalButtonProps } from "./@types"
import { Button } from "@/components/ui/button"

export function BrutalButton({
  variant = "brutal",
  size = "brutal",
  ...props
}: IBrutalButtonProps) {
  return <Button variant={variant} size={size} {...props} />
}
