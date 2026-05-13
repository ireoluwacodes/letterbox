import * as React from "react"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "brutal-frame disabled:brutal-disabled flex w-full min-w-0 rounded-none border-foreground bg-background px-3 py-2 text-base font-medium text-foreground transition-[transform,box-shadow] duration-[80ms] ease-linear outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-100",
  {
    variants: {
      variant: {
        default: "font-[family-name:var(--font-sans)]",
        code: "font-mono tracking-[0.15em]",
      },
      size: {
        md: "h-12 text-base",
        lg: "h-14 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

function Input({
  className,
  variant,
  size,
  type = "text",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants> & {
    size?: "md" | "lg"
  }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Input, inputVariants }
