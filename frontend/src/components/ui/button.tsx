import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Button as GlisseButton } from "glisse"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-a-m text-base font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary: slate-dark bg, ivory text — inverted in dark mode
        default:
          "bg-[var(--swatch--slate-dark)] text-[var(--swatch--ivory-light)] hover:bg-[var(--swatch--slate-medium)] dark:bg-[var(--swatch--ivory-light)] dark:text-[var(--swatch--slate-dark)] dark:hover:bg-oat",
        // Brand accent: clay — same on light and dark
        accent:
          "bg-clay-fill text-[var(--swatch--ivory-light)] hover:bg-[#9A3C1A]",
        // Flame: saturated orange
        flame:
          "bg-clay-fill text-[var(--swatch--ivory-light)] hover:bg-[#9A3C1A]",
        // Cobalt: deep blue
        cobalt:
          "bg-cobalt text-[var(--swatch--ivory-light)] hover:bg-cobalt-dark",
        whatsapp:
          "bg-clay-fill text-[var(--swatch--ivory-light)] hover:bg-[#9A3C1A] dark:bg-clay-fill dark:text-[var(--swatch--ivory-light)] dark:hover:bg-[#9A3C1A]",
        // Outline: transparent with border
        outline:
          "glass text-[var(--swatch--slate-dark)] hover:bg-white/80 dark:text-[var(--swatch--ivory-light)] dark:hover:bg-white/15",
        // Ghost: no border
        ghost:
          "text-[var(--swatch--slate-dark)] hover:bg-oat dark:text-[var(--swatch--ivory-light)] dark:hover:bg-white/10",
        // Secondary: oat bg
        secondary:
          "glass text-[var(--swatch--slate-dark)] hover:bg-white/80 dark:text-[var(--swatch--ivory-light)] dark:hover:bg-white/15",
        // Destructive: unchanged
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // Link: inline text
        link:
          "text-[var(--swatch--slate-dark)] underline-offset-4 hover:underline hover:text-[var(--swatch--clay)] dark:text-[var(--swatch--ivory-light)] dark:hover:text-[var(--swatch--clay)]",
        // Special: for cards and modal actions
        special:
          "glass text-[var(--swatch--slate-dark)] hover:bg-white/80 dark:text-[var(--swatch--ivory-light)] dark:hover:bg-white/15",
      },
      size: {
        default: "h-12 px-8 py-3",
        sm:      "h-9 rounded-a-m px-5 text-sm",
        lg:      "h-14 rounded-a-m px-10 text-lg",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

// Variants drawn by glisse. ghost/link stay native (no surface), and asChild keeps the legacy
// styling because glisse's Button can't render as a link.
const glisseVariants: Partial<Record<NonNullable<VariantProps<typeof buttonVariants>["variant"]>, { variant: "glass" | "filled"; tint?: string; destructive?: boolean }>> = {
  default: { variant: "filled", tint: "var(--btn-default-fill)" },
  accent: { variant: "filled" },
  flame: { variant: "filled" },
  whatsapp: { variant: "filled" },
  cobalt: { variant: "filled", tint: "var(--swatch--cobalt)" },
  destructive: { variant: "filled", destructive: true },
  outline: { variant: "glass" },
  secondary: { variant: "glass" },
  special: { variant: "glass" },
}

const glisseSizes = {
  default: "!h-12 !px-8 !text-base",
  sm: "!h-9 !px-5 !text-sm",
  lg: "!h-14 !px-10 !text-lg",
  icon: "!h-10 !w-10 !p-0",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const glisse = !asChild ? glisseVariants[variant ?? "default"] : undefined
    if (glisse) {
      return (
        <GlisseButton
          ref={ref}
          {...glisse}
          className={cn("whitespace-nowrap !rounded-full font-semibold", glisseSizes[size ?? "default"], className)}
          {...props}
        />
      )
    }
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
