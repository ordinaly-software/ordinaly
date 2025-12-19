"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useMotionTemplate, useMotionValue, motion } from "framer-motion";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  theme?: "dark" | "light";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, theme, ...props }, ref) => {
  const radius = 100;
  const [visible, setVisible] = React.useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const { currentTarget, clientX, clientY } = event;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      style={{
        background: useMotionTemplate`
          radial-gradient(
            ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
            ${theme === "dark" ? "rgba(31, 138, 13, 0.4)" : "rgba(31, 138, 13, 0.2)"},
            transparent 80%
          )
        `,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="p-[2px] rounded-lg transition duration-300 group/input"
    >
      <input
        type={type}
        className={cn(
          `flex h-10 w-full border-none bg-card text-card-foreground shadow-input rounded-md px-3 py-2 text-sm 
          file:border-0 file:bg-transparent file:text-sm file:font-medium 
          placeholder:text-muted-foreground 
          focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-green 
          disabled:cursor-not-allowed disabled:opacity-50 
          dark:shadow-[0px_0px_1px_1px_var(--neutral-700)] 
          group-hover/input:shadow-none transition duration-400 
          hover:border-[#46B1C9] dark:hover:border-[#46B1C9]`,
          className
        )}
        ref={ref}
        {...props}
      />
    </motion.div>
  );
});

Input.displayName = "Input";

export { Input };
