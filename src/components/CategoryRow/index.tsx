import type { ICategoryRowProps } from "./@types"
import { BrutalCard } from "@/components/BrutalCard"
import { BrutalButton } from "@/components/BrutalButton"
import { Input } from "@/components/ui/input"

export function CategoryRow({
  index,
  name,
  word,
  canRemove,
  onNameChange,
  onWordChange,
  onRemove,
}: ICategoryRowProps) {
  return (
    <BrutalCard interactive={false} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-(family-name:--font-heading) text-base font-bold tracking-[-0.02em]">
          category [{index + 1}]
        </span>
        <BrutalButton
          type="button"
          size="brutal-sm"
          disabled={!canRemove}
          onClick={onRemove}
          className="text-[14px]"
        >
          × remove
        </BrutalButton>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-[14px] font-bold">name</span>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="animal"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-[14px] font-bold">word</span>
        <Input
          variant="code"
          value={word}
          onChange={(e) => {
            const v = e.target.value.replace(/[^a-zA-Z ]/g, "")
            onWordChange(v)
          }}
          placeholder="lion"
        />
      </label>
    </BrutalCard>
  )
}
