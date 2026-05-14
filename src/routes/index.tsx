import {
  Add01Icon,
  ArrowRight01Icon,
  Key01Icon,
  KeyboardIcon,
  Mailbox01Icon,
  ManWomanIcon,
} from "@hugeicons/core-free-icons"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import { BrutalButton } from "@/components/BrutalButton"
import { BrutalCard } from "@/components/BrutalCard"
import { BrutalIcon } from "@/components/BrutalIcon"
import { Input } from "@/components/ui/input"

export const Route = createFileRoute("/")({
  component: LandingPage,
})

const heroAccentIcons = [
  KeyboardIcon,
  Mailbox01Icon,
  Key01Icon,
  KeyboardIcon,
  Mailbox01Icon,
] as const

function LandingPage() {
  const navigate = useNavigate()
  const [invite, setInvite] = useState("")

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const code = invite.trim().toUpperCase()
    if (code.length !== 6) return
    void navigate({ to: "/join", search: { code } })
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-[1100px] flex-col px-6 py-12">
      <div className="mb-10 flex flex-wrap justify-center gap-2 border-y-[3px] border-foreground bg-muted py-4">
        {heroAccentIcons.map((icon, i) => (
          <div
            key={`strip-${String(i)}`}
            className="flex size-12 items-center justify-center border-[3px] border-foreground bg-background shadow-[4px_4px_0_var(--foreground)] transition-[transform,box-shadow] duration-[80ms] ease-linear hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--foreground)]"
          >
            <BrutalIcon icon={icon} size={22} strokeWidth={1.65} />
          </div>
        ))}
      </div>

      <div className="relative border-[3px] border-foreground bg-background px-6 py-14 shadow-[12px_12px_0_var(--foreground)] md:px-14 md:py-16">
        <div className="absolute -top-4 left-8 border-[3px] border-foreground bg-background px-3 py-2 shadow-[6px_6px_0_var(--foreground)] md:left-14">
          <BrutalIcon icon={Mailbox01Icon} size={40} strokeWidth={1.5} />
        </div>
        <div className="absolute right-8 -bottom-4 border-[3px] border-foreground bg-background px-3 py-2 shadow-[6px_6px_0_var(--foreground)] md:right-12">
          <BrutalIcon icon={KeyboardIcon} size={40} strokeWidth={1.5} />
        </div>

        <p className="text-center font-mono text-xs font-bold tracking-[0.35em]">
          guess letters · score points · beat the clock
        </p>
        <h1 className="mt-4 text-center font-[family-name:var(--font-heading)] text-[clamp(3rem,11vw,7rem)] leading-[0.92] font-bold tracking-[-0.03em]">
          letterbox
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-center text-base leading-relaxed font-medium">
          The host writes secret words. Players take turns guessing one letter
          at a time, rotating in order until each word is revealed
        </p>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-2 md:gap-6">
        <BrutalCard className="relative flex flex-col gap-8 pt-6">
          <div className="absolute -top-5 left-6 flex items-center gap-2 border-[3px] border-foreground bg-background px-3 py-1.5 shadow-[4px_4px_0_var(--foreground)]">
            <BrutalIcon icon={Add01Icon} size={22} />
            <span className="font-mono text-[14px] font-bold tracking-wide">
              host
            </span>
          </div>
          <div className="mt-4">
            <h2 className="font-[family-name:var(--font-heading)] text-[28px] font-bold tracking-[-0.02em]">
              host a game
            </h2>
            <p className="mt-3 text-base leading-relaxed font-medium">
              pick categories, fill in secret words, share the invite code.
            </p>
          </div>
          <BrutalButton
            type="button"
            className="inline-flex items-center justify-center gap-3"
            onClick={() => void navigate({ to: "/host/setup" })}
          >
            <BrutalIcon icon={Add01Icon} size={22} />
            create game
            <BrutalIcon icon={ArrowRight01Icon} size={22} />
          </BrutalButton>
        </BrutalCard>

        <BrutalCard className="relative flex flex-col gap-8 pt-6">
          <div className="absolute -top-5 left-6 flex items-center gap-2 border-[3px] border-foreground bg-background px-3 py-1.5 shadow-[4px_4px_0_var(--foreground)]">
            <BrutalIcon icon={Key01Icon} size={22} />
            <span className="font-mono text-[14px] font-bold tracking-wide">
              join
            </span>
          </div>
          <div className="mt-4">
            <h2 className="font-[family-name:var(--font-heading)] text-[28px] font-bold tracking-[-0.02em]">
              join a game
            </h2>
            <form className="mt-4 flex flex-col gap-4" onSubmit={handleJoin}>
              <Input
                variant="code"
                placeholder="invite code"
                maxLength={6}
                value={invite}
                onChange={(e) =>
                  setInvite(
                    e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                  )
                }
              />
              <BrutalButton
                type="submit"
                disabled={invite.trim().length !== 6}
                className="inline-flex items-center justify-center gap-3"
              >
                <BrutalIcon icon={Key01Icon} size={22} />
                join
                <BrutalIcon icon={ArrowRight01Icon} size={22} />
              </BrutalButton>
            </form>
          </div>
        </BrutalCard>
      </div>

      <div className="mt-auto flex flex-col items-center gap-4 pt-20">
        <div className="flex items-center gap-3 border-[3px] border-foreground bg-muted px-5 py-3 shadow-[6px_6px_0_var(--foreground)]">
          <BrutalIcon
            icon={ManWomanIcon}
            size={26}
            className="text-foreground"
          />
          <p className="text-center text-[14px] font-bold tracking-wide">
            made for two · works for eight
          </p>
        </div>
        <p className="text-center font-mono text-xs font-medium text-muted-foreground">
          an ireoluwa.ssh production
        </p>
      </div>
    </div>
  )
}
