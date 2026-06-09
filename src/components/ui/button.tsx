"use client";

import { cn } from "@/lib/utils";import { cloneElement, forwardRef, isValidElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from "react";
import { useUiSound } from "@/hooks/use-ui-sound";

type Variant = "primary" | "secondary" | "ghost" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  asChild?: boolean;
  children?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: "cursor-pointer btn-theme-primary font-semibold tap-scale active:scale-[0.97]",
  secondary:
    "cursor-pointer glass text-zinc-200 border border-white/15 hover:bg-white/10 hover:border-[var(--theme-border)] tap-scale",
  ghost: "cursor-pointer text-zinc-300 hover:text-white hover:bg-white/5 tap-scale",
  outline:
    "cursor-pointer border border-white/20 text-zinc-200 hover:border-[var(--theme-border)] hover:bg-theme-soft tap-scale",
};

const sizes = {
  sm: "px-4 py-2 text-sm rounded-lg min-h-[36px]",
  md: "px-6 py-2.5 text-sm rounded-xl min-h-[42px]",
  lg: "px-8 py-3.5 text-base rounded-xl min-h-[48px]",
  xl: "px-10 py-4 sm:py-5 text-lg sm:text-xl rounded-2xl min-h-[56px] sm:min-h-[64px] font-bold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, asChild, children, disabled, onClick, ...props }, ref) => {
    const { playTone } = useUiSound();
    const baseClassName = cn(
      "inline-flex items-center justify-center gap-2 font-medium transition-[transform,filter,box-shadow] duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100",
      variants[variant],
      sizes[size],
      className
    );

    const wrappedOnClick: NonNullable<typeof onClick> = (e) => {
      playTone("click");
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
        onPointerEnter: (existing as { onPointerEnter?: unknown }).onPointerEnter,
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
