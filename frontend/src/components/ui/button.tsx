import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-a-s text-base font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary: slate-dark bg, ivory text — inverted in dark mode
        default:
          "bg-[var(--swatch--slate-dark)] text-[var(--swatch--ivory-light)] hover:bg-[var(--swatch--slate-medium)] dark:bg-[var(--swatch--ivory-light)] dark:text-[var(--swatch--slate-dark)] dark:hover:bg-oat",
        // Brand accent: clay — same on light and dark
        accent:
          "bg-[var(--swatch--clay)] text-[var(--swatch--ivory-light)] hover:bg-[#C6613F]",
        // Flame: saturated orange
        flame:
          "bg-[var(--swatch--flame)] text-[var(--swatch--ivory-light)] hover:bg-[var(--swatch--flame-dark)]",
        // Cobalt: deep blue
        cobalt:
          "bg-[var(--swatch--cobalt)] text-[var(--swatch--ivory-light)] hover:bg-[var(--swatch--cobalt-dark)]",
        whatsapp:
          "bg-[var(--swatch--clay)] text-[var(--swatch--ivory-light)] hover:bg-[var(--swatch--flame)] dark:bg-[var(--swatch--clay)] dark:text-[var(--swatch--ivory-light)] dark:hover:bg-[var(--swatch--flame)]",
        // Outline: transparent with border
        outline:
          "border border-[var(--swatch--slate-dark)]/25 bg-transparent text-[var(--swatch--slate-dark)] hover:bg-oat dark:border-[var(--swatch--ivory-light)]/25 dark:text-[var(--swatch--ivory-light)] dark:hover:bg-[var(--swatch--slate-medium)]",
        // Ghost: no border
        ghost:
          "text-[var(--swatch--slate-dark)] hover:bg-oat dark:text-[var(--swatch--ivory-light)] dark:hover:bg-[var(--swatch--slate-medium)]",
        // Secondary: oat bg
        secondary:
          "bg-oat text-[var(--swatch--slate-dark)] hover:bg-[var(--swatch--cloud-light)] dark:bg-[var(--swatch--slate-medium)] dark:text-[var(--swatch--ivory-light)] dark:hover:bg-[var(--swatch--slate-light)]",
        // Destructive: unchanged
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // Link: inline text
        link:
          "text-[var(--swatch--slate-dark)] underline-offset-4 hover:underline hover:text-[var(--swatch--clay)] dark:text-[var(--swatch--ivory-light)] dark:hover:text-[var(--swatch--clay)]",
        // Special: for cards and modal actions
        special:
          "bg-[var(--swatch--ivory-medium)] text-[var(--swatch--slate-dark)] hover:bg-oat shadow-sm dark:bg-[var(--swatch--slate-medium)] dark:text-[var(--swatch--ivory-light)] dark:hover:bg-[var(--swatch--slate-light)]",
      },
      size: {
        default: "h-12 px-8 py-3",
        sm:      "h-9 rounded-a-s px-5 text-sm",
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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
