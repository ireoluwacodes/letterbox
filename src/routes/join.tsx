import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery } from "convex/react"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"
import { z } from "zod"

import { api } from "../../convex/_generated/api"
import { BrutalButton } from "@/components/BrutalButton"
import { BrutalCard } from "@/components/BrutalCard"
import { Input } from "@/components/ui/input"
import { getConvexErrorMessage } from "@/lib/convexErrors"
import { savePlayerSocketSession } from "@/lib/socketSession"
import { getSessionId } from "@/lib/session"
import { JoinPayloadSchema } from "@/shared/schemas"

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
  const [inviteCodeLive, setInviteCodeLive] = useState(
    (search.code ?? "").toUpperCase().slice(0, 6),
  )

  const joinMutation = useMutation(api.players.join)

  const invitePreview = useQuery(
    api.games.getByInviteCode,
    inviteCodeLive.length === 6 ? { inviteCode: inviteCodeLive } : "skip",
  )

  const form = useForm({
    defaultValues: {
      code: inviteCodeLive,
      name: "",
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      const parsed = JoinPayloadSchema.safeParse({
        inviteCode: value.code,
        name: value.name.trim(),
      })
      if (!parsed.success) {
        setSubmitError("check your inputs.")
        return
      }

      try {
        const result = await joinMutation({
          inviteCode: parsed.data.inviteCode,
          sessionId: getSessionId(),
          name: parsed.data.name,
        })
        savePlayerSocketSession({
          gameId: String(result.gameId),
          inviteCode: parsed.data.inviteCode,
          name: parsed.data.name,
        })
        void navigate({
          to: "/lobby/$gameId",
          params: { gameId: String(result.gameId) },
        })
      } catch (e) {
        setSubmitError(getConvexErrorMessage(e).toLowerCase())
      }
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
                <span className="text-[14px] font-bold">invite code</span>
                <Input
                  variant="code"
                  maxLength={6}
                  value={field.state.value}
                  onChange={(e) => {
                    const next = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "")
                    field.handleChange(next)
                    setInviteCodeLive(next)
                  }}
                />
              </label>
            )}
          </form.Field>

          {inviteCodeLive.length === 6 && invitePreview != null ? (
            <p className="font-mono text-xs font-bold">
              {!invitePreview.exists
                ? "no game at this code."
                : invitePreview.status !== "lobby"
                  ? "game already started."
                  : invitePreview.playerCount >= invitePreview.maxPlayers
                    ? "game is full."
                    : "game found — pick your name."}
            </p>
          ) : null}

          <form.Field name="name">
            {(field) => (
              <label className="flex flex-col gap-2">
                <span className="text-[14px] font-bold">your name</span>
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
                name.trim().length > 20 ||
                invitePreview === undefined ||
                !invitePreview.exists ||
                invitePreview.status !== "lobby" ||
                invitePreview.playerCount >= invitePreview.maxPlayers
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
