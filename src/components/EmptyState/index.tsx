import type { IEmptyStateProps } from "./@types"

export function EmptyState({ message }: IEmptyStateProps) {
  return (
    <p className="text-center font-medium text-muted-foreground">
      {message}
    </p>
  )
}
