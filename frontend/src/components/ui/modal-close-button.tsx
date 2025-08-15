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
  
  const baseStyles = "transition-all duration-200 rounded-lg flex items-center justify-center";
  
  const variantStyles = {
    default: "text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 p-2 rounded-lg",
    overlay: "bg-black/20 hover:bg-black/40 text-white backdrop-blur-md rounded-full h-10 w-10",
    header: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full h-10 w-10",
    light: "text-muted-foreground hover:text-foreground hover:bg-accent p-2"
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
        variant === "overlay" || variant === "header" ? sizeStyles[size] : "",
        className
      )}
      aria-label="Close modal"
    >
      <X size={iconSizes[size]} />
    </button>
  );
};
