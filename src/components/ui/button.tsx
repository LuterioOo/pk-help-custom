"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold neon-border hover:from-yellow-300 hover:to-amber-400",
  secondary: "glass text-zinc-100 hover:bg-white/10",
  ghost: "text-zinc-300 hover:text-white hover:bg-white/5",
  outline: "border border-white/15 text-zinc-200 hover:border-yellow-500/50 hover:bg-yellow-500/10",
};

const sizes = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-2.5 text-sm rounded-xl",
  lg: "px-8 py-3.5 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : null}
      {children}
    </motion.button>
  )
);
Button.displayName = "Button";
