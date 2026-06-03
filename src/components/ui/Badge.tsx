import { cn } from "@/lib/cn";

export function Badge({
  children,
  color,
  className,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        className,
      )}
      style={
        color
          ? { backgroundColor: `${color}1a`, color }
          : { backgroundColor: "var(--color-bg)", color: "var(--color-muted)" }
      }
    >
      {children}
    </span>
  );
}
