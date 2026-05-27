"use client";

import { cn } from "@/lib/utils";
import { cloneElement, forwardRef, isValidElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  asChild?: boolean;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold neon-border hover:from-yellow-300 hover:to-amber-400 active:scale-[0.98]",
  secondary: "glass text-zinc-100 hover:bg-white/10 active:scale-[0.98]",
  ghost: "text-zinc-300 hover:text-white hover:bg-white/5 active:scale-[0.98]",
  outline:
    "border border-white/15 text-zinc-200 hover:border-yellow-500/50 hover:bg-yellow-500/10 active:scale-[0.98]",
};

const sizes = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-2.5 text-sm rounded-xl",
  lg: "px-8 py-3.5 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, asChild, children, disabled, onClick, ...props }, ref) => {
    const baseClassName = cn(
      "inline-flex items-center justify-center gap-2 font-medium transition-[colors,transform] disabled:opacity-50 disabled:cursor-not-allowed",
      variants[variant],
      sizes[size],
      className
    );

    const wrappedOnClick: NonNullable<typeof onClick> = (e) => {
      // #region agent log
      fetch("http://127.0.0.1:7579/ingest/80e40a67-2b62-4a2b-8b6b-2495e3b7393b", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ec767e" },
        body: JSON.stringify({
          sessionId: "ec767e",
          runId: "pre-fix",
          hypothesisId: "A",
          location: "src/components/ui/button.tsx:Button:onClick",
          message: "Button click handler invoked",
          data: {
            variant,
            size,
            disabled: !!(disabled || isLoading),
            defaultPrevented: e.defaultPrevented,
            targetTag: (e.target as HTMLElement | null)?.tagName ?? null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log
      onClick?.(e);
    };

    if (asChild) {
      if (!isValidElement(children)) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const child = children as ReactElement<any>;
      const existing = (child.props as { className?: string; onClick?: unknown } | undefined) ?? {};
      const mergedOnClick =
        typeof existing.onClick === "function"
          ? (e: unknown) => {
              wrappedOnClick(e as never);
              (existing.onClick as (ev: unknown) => void)(e);
            }
          : wrappedOnClick;

      return cloneElement(child, {
        className: cn(baseClassName, existing.className),
        onClick: mergedOnClick,
        "aria-disabled": disabled || isLoading ? true : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    }

    return (
      <button
        ref={ref}
        className={baseClassName}
        disabled={disabled || isLoading}
        onClick={wrappedOnClick}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
