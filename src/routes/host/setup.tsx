import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMutation } from "convex/react"
import { useForm } from "@tanstack/react-form"
import { useMemo, useState } from "react"

import { api } from "../../../convex/_generated/api"
import { BackLink } from "@/components/BackLink"
import { BrutalButton } from "@/components/BrutalButton"
import { CategoryRow } from "@/components/CategoryRow"
import { Input } from "@/components/ui/input"
import { DEFAULT_CATEGORY_ROW_NAMES } from "@/lib/defaultCategories"
import { getConvexErrorMessage } from "@/lib/convexErrors"
import { REPLAY_SESSION_KEY } from "@/lib/constants"
import { writeHostSecretWords } from "@/lib/publicGameAdapter"
import { saveHostSocketSession } from "@/lib/socketSession"
import { getSessionId } from "@/lib/session"
import { CreateGamePayloadSchema, WORD_REGEX } from "@/shared/schemas"

export const Route = createFileRoute("/host/setup")({
  component: HostSetupPage,
})

function loadReplay(): {
  hostName: string
  pointsPerLetter: number
  categories: Array<{ name: string; word: string }>
} | null {
  if (typeof sessionStorage === "undefined") return null
  try {
    const raw = sessionStorage.getItem(REPLAY_SESSION_KEY)
    if (!raw) return null
    sessionStorage.removeItem(REPLAY_SESSION_KEY)
    return JSON.parse(raw) as {
      hostName: string
      pointsPerLetter: number
      categories: Array<{ name: string; word: string }>
    }
  } catch {
    return null
  }
}

function HostSetupPage() {
  const navigate = useNavigate()
  const replay = useMemo(() => loadReplay(), [])
  const [submitError, setSubmitError] = useState<string | null>(null)

  const createGame = useMutation(api.games.create)

  const initialCategories =
    replay?.categories ??
    [...DEFAULT_CATEGORY_ROW_NAMES].map((name) => ({ name, word: "" }))

  const form = useForm({
    defaultValues: {
      hostName: replay?.hostName ?? "",
      pointsPerLetter: replay?.pointsPerLetter ?? 5,
      categories: initialCategories,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      const payload = {
        hostName: value.hostName.trim(),
        pointsPerLetter: value.pointsPerLetter,
        categories: value.categories.map((c) => ({
          name: c.name.trim(),
          word: c.word.trim().toUpperCase(),
        })),
      }
      const parsed = CreateGamePayloadSchema.safeParse(payload)
      if (!parsed.success) {
        setSubmitError("fix errors before creating.")
        return
      }

      try {
        const result = await createGame({
          sessionId: getSessionId(),
          hostName: parsed.data.hostName,
          pointsPerLetter: parsed.data.pointsPerLetter,
          categories: parsed.data.categories.map((c) => ({
            name: c.name,
            word: c.word,
          })),
        })
        const gid = result.gameId as string
        writeHostSecretWords(
          gid,
          parsed.data.categories.map((c) => c.word),
        )
        saveHostSocketSession({
          gameId: gid,
          inviteCode: result.inviteCode,
        })
        void navigate({
          to: "/lobby/$gameId",
          params: { gameId: gid },
        })
      } catch (e) {
        setSubmitError(getConvexErrorMessage(e).toLowerCase())
      }
    },
  })

  return (
    <div className="relative mx-auto max-w-[600px] px-6 pt-10 pb-36">
      <BackLink to="/" />

      <h1 className="mt-10 font-[family-name:var(--font-heading)] text-[48px] font-bold tracking-[-0.02em]">
        setup
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
      >
        <section className="mt-10 space-y-8">
          <div className="flex flex-col gap-6 border-[3px] border-foreground bg-background p-6 shadow-[6px_6px_0_var(--foreground)]">
            <form.Field name="hostName">
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

            <form.Field name="pointsPerLetter">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold">
                    points per letter
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={String(field.state.value)}
                    onChange={(e) =>
                      field.handleChange(Number(e.target.value) || 1)
                    }
                  />
                  <p className="text-[14px] font-medium">
                    awarded for each occurrence of a correct letter.
                  </p>
                </div>
              )}
            </form.Field>
          </div>

          <h2 className="font-[family-name:var(--font-heading)] text-[28px] font-bold tracking-[-0.02em]">
            categories
          </h2>

          <form.Field name="categories" mode="array">
            {(field) => (
              <>
                {field.state.value.map((_, i) => (
                  <form.Field key={i} name={`categories[${i}].name`}>
                    {(nameField) => (
                      <form.Field name={`categories[${i}].word`}>
                        {(wordField) => (
                          <CategoryRow
                            index={i}
                            name={nameField.state.value}
                            word={wordField.state.value}
                            canRemove={field.state.value.length > 1}
                            onNameChange={(v) => nameField.handleChange(v)}
                            onWordChange={(v) => wordField.handleChange(v)}
                            onRemove={() => field.removeValue(i)}
                          />
                        )}
                      </form.Field>
                    )}
                  </form.Field>
                ))}

                <BrutalButton
                  type="button"
                  disabled={field.state.value.length >= 10}
                  onClick={() =>
                    field.pushValue({
                      name: `category ${field.state.value.length + 1}`,
                      word: "",
                    })
                  }
                >
                  + add category
                </BrutalButton>
              </>
            )}
          </form.Field>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t-[3px] border-foreground bg-background px-6 py-4 shadow-[0_-4px_0_0_var(--foreground)]">
          <div className="mx-auto flex max-w-[600px] flex-col gap-3">
            {submitError ? (
              <div
                role="alert"
                className="border-[3px] border-foreground bg-background px-4 py-3 font-bold"
              >
                {submitError}
              </div>
            ) : null}
            <form.Subscribe selector={(s) => s.values}>
              {(values) => {
                const validHost =
                  values.hostName.trim().length >= 1 &&
                  values.hostName.trim().length <= 20
                const pts =
                  values.pointsPerLetter >= 1 && values.pointsPerLetter <= 50
                const allRowsOk = values.categories.every(
                  (c) =>
                    c.name.trim().length > 0 &&
                    c.word.trim().length >= 2 &&
                    c.word.trim().length <= 30 &&
                    WORD_REGEX.test(c.word.trim()),
                )
                const canSubmit = validHost && pts && allRowsOk

                return (
                  <BrutalButton
                    type="submit"
                    size="brutal-lg"
                    disabled={!canSubmit}
                  >
                    create game →
                  </BrutalButton>
                )
              }}
            </form.Subscribe>
          </div>
        </div>
      </form>
    </div>
  )
}
