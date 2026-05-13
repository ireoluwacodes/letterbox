import type { TMaskedSlot } from "@/shared/schemas"

export interface IMaskedWordProps {
  slots: Array<TMaskedSlot>
  flashingIndices: ReadonlySet<number>
}
