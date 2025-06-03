import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-semibold ring-offset-background transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground group-hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground group-hover:bg-destructive/90",
        outline: "border border-input bg-background group-hover:bg-accent group-hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground group-hover:bg-secondary/80",
        ghost: "group-hover:bg-accent group-hover:text-accent-foreground",
        link: "text-primary underline-offset-4 group-hover:underline",
        special: "relative inline-flex items-center justify-center gap-4 group bg-white text-[#1A1924] group-hover:bg-gray-200 dark:bg-gray-900 dark:text-white dark:group-hover:bg-gray-800 rounded-xl px-8 py-3 font-semibold transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-0.5 group-hover:shadow-gray-600/30",
      },
      size: {
        default: "h-12 px-8 py-3",
        sm: "h-10 rounded-xl px-6",
        lg: "h-14 rounded-xl px-10",
        icon: "h-12 w-12",
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
