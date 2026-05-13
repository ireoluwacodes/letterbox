import type { TMaskedSlot } from "@/shared/schemas"

export interface IHostUnmaskedStripProps {
  maskedSlots: Array<TMaskedSlot>
  /** Same length as maskedSlots — phrase including spaces at space slots */
  hostPhrase: string
}
