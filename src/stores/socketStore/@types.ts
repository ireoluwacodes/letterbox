import type { TAppSocket } from "@/lib/socket"

export interface ISocketStoreState {
  socket: TAppSocket | null
  connected: boolean
  /** True after socket had connected at least once */
  hadConnected: boolean
  reconnecting: boolean
  /** True after 30s disconnected */
  longDisconnect: boolean
  /** Last transport / handshake error from `connect_error` */
  connectionError: string | null
}

export interface ISocketStoreActions {
  connect: () => void
  /** Resolves when the store marks the socket connected (after `connect` fires). */
  waitForSocketConnected: (timeoutMs?: number) => Promise<void>
  disconnect: () => void
  emit: (event: string, ...args: Array<unknown>) => void
}

export type TSocketStore = ISocketStoreState & ISocketStoreActions
