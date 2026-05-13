import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"
import { z } from "zod"

import { BrutalButton } from "@/components/BrutalButton"
import { BrutalCard } from "@/components/BrutalCard"
import { Input } from "@/components/ui/input"
import { gameExists } from "@/lib/api"
import { JoinPayloadSchema } from "@/shared/schemas"
import { SOCKET_EVENTS } from "@/shared/socketEvents"
import { useSocketStore } from "@/stores/socketStore"

const joinSearchSchema = z.object({
  code: z.string().optional(),
})

export const Route = createFileRoute("/join")({
  validateSearch: (search: Record<string, unknown>) => {
    const r = joinSearchSchema.safeParse(search)
    return r.success ? r.data : { code: undefined }
  },
  component: JoinPage,
})

function JoinPage() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      code: (search.code ?? "").toUpperCase().slice(0, 6),
      name: "",
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      const parsed = JoinPayloadSchema.safeParse({
        code: value.code,
        name: value.name.trim(),
      })
      if (!parsed.success) {
        setSubmitError("check your inputs.")
        return
      }

      const exists = await gameExists(parsed.data.code)
      if (!exists.ok) {
        setSubmitError(
          exists.reason === "full"
            ? "game is full."
            : exists.reason === "started"
              ? "game already started."
              : "game not found."
        )
        return
      }

      const socketStore = useSocketStore.getState()
      socketStore.connect()
      const sock = socketStore.socket
      if (!sock) {
        setSubmitError("could not connect.")
        return
      }

      try {
        await new Promise<void>((resolve, reject) => {
          if (sock.connected) {
            resolve()
            return
          }
          const onOk = () => {
            sock.off("connect_error", onErr)
            resolve()
          }
          const onErr = () => {
            sock.off("connect", onOk)
            reject(new Error("connect"))
          }
          sock.once("connect", onOk)
          sock.once("connect_error", onErr)
        })
      } catch {
        setSubmitError("could not connect.")
        return
      }

      const s2 = useSocketStore.getState().socket
      if (!s2?.connected) return

      s2.emit(SOCKET_EVENTS.PLAYER_JOIN, parsed.data, (err, res) => {
        if (err || !res?.gameId) {
          setSubmitError(
            err instanceof Error ? err.message.toLowerCase() : "join failed."
          )
          return
        }
        void navigate({
          to: "/lobby/$gameId",
          params: { gameId: res.gameId },
        })
      })
    },
  })

  return (
    <div className="mx-auto max-w-[480px] px-6 py-16">
      <h1 className="font-[family-name:var(--font-heading)] text-[48px] font-bold tracking-[-0.02em]">
        join game
      </h1>

      <form
        className="mt-10 flex flex-col gap-8"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <BrutalCard interactive={false} className="flex flex-col gap-6">
          <form.Field name="code">
            {(field) => (
              <label className="flex flex-col gap-2">
                <span className="text-[14px] font-bold">
                  invite code
                </span>
                <Input
                  variant="code"
                  maxLength={6}
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                    )
                  }
                />
              </label>
            )}
          </form.Field>

          <form.Field name="name">
            {(field) => (
              <label className="flex flex-col gap-2">
                <span className="text-[14px] font-bold">
                  your name
                </span>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  maxLength={20}
                />
              </label>
            )}
          </form.Field>
        </BrutalCard>

        {submitError ? (
          <div
            role="alert"
            className="border-[3px] border-foreground bg-background px-4 py-3 font-bold"
          >
            {submitError}
          </div>
        ) : null}

        <form.Subscribe
          selector={(state) => ({
            code: state.values.code,
            name: state.values.name,
          })}
        >
          {({ code, name }) => (
            <BrutalButton
              type="submit"
              disabled={
                code.length !== 6 ||
                name.trim().length < 1 ||
                name.trim().length > 20
              }
            >
              join →
            </BrutalButton>
          )}
        </form.Subscribe>
      </form>
    </div>
  )
}
