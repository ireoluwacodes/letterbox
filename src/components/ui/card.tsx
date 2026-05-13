import * as React from "react"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "relative overflow-visible rounded-none border-[3px] border-foreground bg-background text-foreground transition-[transform,box-shadow] duration-[80ms] ease-linear",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        inverted: "bg-foreground text-background",
      },
      padding: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
      },
      interactive: {
        true: "brutal-frame brutal-frame-hover cursor-default",
        false: "brutal-frame",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      interactive: false,
    },
  }
)

function Card({
  className,
  variant,
  padding,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, padding, interactive }))}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1 border-b-[3px] border-foreground pb-3",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-[family-name:var(--font-heading)] text-[28px] font-bold tracking-[-0.02em]",
        className
      )}
      {...props}
    />
  )
}

function CardBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-body" className={cn("pt-4", className)} {...props} />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "mt-4 flex flex-wrap gap-2 border-t-[3px] border-foreground pt-4",
        className
      )}
      {...props}
    />
  )
}

export { Card, CardBody, CardFooter, CardHeader, cardVariants, CardTitle }
