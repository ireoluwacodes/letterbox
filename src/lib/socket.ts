import { io } from "socket.io-client"
import type { Socket } from "socket.io-client"

import type {
  IClientToServerEvents,
  IServerToClientEvents,
} from "@/shared/socketEvents"

export type TAppSocket = Socket<IServerToClientEvents, IClientToServerEvents>

export function createSocket(): TAppSocket | null {
  if (typeof window === "undefined") return null

  const url = import.meta.env.VITE_SOCKET_URL ?? ""
  return io(url, {
    autoConnect: false,
    transports: ["websocket", "polling"],
  })
}
