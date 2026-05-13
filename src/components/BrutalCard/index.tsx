import type { IBrutalCardProps } from "./@types"
import { Card } from "@/components/ui/card"

export function BrutalCard({ interactive = true, ...props }: IBrutalCardProps) {
  return <Card interactive={interactive} {...props} />
}
