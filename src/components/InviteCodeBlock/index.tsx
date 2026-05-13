import { ClipboardCopyIcon, Link01Icon } from "@hugeicons/core-free-icons"

import type { IInviteCodeBlockProps } from "./@types"
import { BrutalButton } from "@/components/BrutalButton"
import { BrutalIcon } from "@/components/BrutalIcon"

export function InviteCodeBlock({ code }: IInviteCodeBlockProps) {
  async function copyCode() {
    await navigator.clipboard.writeText(code)
  }

  async function copyLink() {
    const url = `${window.location.origin}/join?code=${encodeURIComponent(code)}`
    await navigator.clipboard.writeText(url)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2 border-[3px] border-foreground bg-muted px-4 py-3 shadow-[6px_6px_0_var(--foreground)]">
        <BrutalIcon icon={Link01Icon} size={28} className="shrink-0" />
        <p className="min-w-0 truncate font-mono text-lg font-bold tracking-wide md:text-2xl">
          <span className="text-[14px] font-bold tracking-wider md:text-base">
            invite code
          </span>
          <span className="mx-2 inline-block text-muted-foreground">·</span>
          {code}
        </p>
      </div>
      <BrutalButton
        type="button"
        size="brutal-sm"
        className="inline-flex items-center gap-2"
        onClick={() => void copyCode()}
      >
        <BrutalIcon icon={ClipboardCopyIcon} size={20} />
        copy
      </BrutalButton>
      <BrutalButton
        type="button"
        size="brutal-sm"
        className="inline-flex items-center gap-2"
        onClick={() => void copyLink()}
      >
        <BrutalIcon icon={Link01Icon} size={20} />
        link
      </BrutalButton>
    </div>
  )
}
