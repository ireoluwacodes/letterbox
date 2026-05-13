import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Link } from "@tanstack/react-router"

import type { IBackLinkProps } from "./@types"
import { BrutalIcon } from "@/components/BrutalIcon"

export function BackLink({ to = "/", label = "back" }: IBackLinkProps) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 font-bold underline decoration-[3px] underline-offset-4"
    >
      <BrutalIcon icon={ArrowLeft01Icon} size={22} />
      {label}
    </Link>
  )
}
