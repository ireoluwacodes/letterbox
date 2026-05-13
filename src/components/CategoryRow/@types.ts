export interface ICategoryRowProps {
  index: number
  name: string
  word: string
  canRemove: boolean
  onNameChange: (name: string) => void
  onWordChange: (word: string) => void
  onRemove: () => void
}
