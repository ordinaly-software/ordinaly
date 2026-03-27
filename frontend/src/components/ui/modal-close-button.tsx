"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalCloseButtonProps {
  onClick: () => void;
  className?: string;
  variant?: "default" | "overlay" | "header" | "light";
  size?: "sm" | "md" | "lg";
}

export const ModalCloseButton = ({
  onClick,
  className,
  variant = "default",
  size = "md"
}: ModalCloseButtonProps) => {

  const baseStyles = "transition-all duration-200 rounded-full flex items-center justify-center";

  const variantStyles = {
    default: "bg-black/8 hover:bg-black/15 dark:bg-white/8 dark:hover:bg-white/15 text-[var(--swatch--slate-dark)] dark:text-[var(--swatch--ivory-light)]",
    overlay: "bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm",
    header: "bg-black/8 hover:bg-black/15 dark:bg-white/8 dark:hover:bg-white/15 text-[var(--swatch--slate-dark)] dark:text-[var(--swatch--ivory-light)]",
    light: "bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-[var(--swatch--slate-light)] dark:text-[var(--swatch--cloud-medium)]",
  };

  const sizeStyles = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      aria-label="Close modal"
    >
      <X size={iconSizes[size]} />
    </button>
  );
};
