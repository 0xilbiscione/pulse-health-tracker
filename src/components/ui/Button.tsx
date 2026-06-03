import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-700)] disabled:opacity-60",
  secondary:
    "bg-white text-[var(--color-ink)] border border-[var(--color-border)] hover:bg-[var(--color-bg)]",
  ghost: "text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]",
  danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
