export type TToastKind = "info" | "success" | "neutral"

export interface IToastItem {
  id: string
  message: string
  durationMs: number
  kind: TToastKind
}

export interface IToastStoreState {
  toasts: Array<IToastItem>
}

export interface IToastStoreActions {
  push: (message: string, durationMs?: number, kind?: TToastKind) => void
  dismiss: (id: string) => void
  clear: () => void
}

export type TToastStore = IToastStoreState & IToastStoreActions
