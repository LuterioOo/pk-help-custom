import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant = "default" | "accent" | "muted" | "success" | "price";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: ReactNode;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-white/[0.04] text-zinc-400",
  accent: "bg-theme-soft text-theme",
  muted: "bg-zinc-800/60 text-zinc-500",
  success: "bg-emerald-500/10 text-emerald-400/90",
  price: "bg-black/70 text-theme backdrop-blur-sm",
};

/** Non-interactive label — no pointer, no button feel */
export function Badge({ children, variant = "default", className, icon }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium tracking-wide select-none cursor-default",
        variants[variant],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
