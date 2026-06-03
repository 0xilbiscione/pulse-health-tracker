import { signOut } from "@/lib/auth";
import { LogOut } from "lucide-react";

export function Topbar({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  const initial = (name ?? email ?? "?").charAt(0).toUpperCase();
  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-white/80 px-5 py-3 backdrop-blur">
      <div>
        <p className="text-xs text-[var(--color-muted)]">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-100)] text-sm font-semibold text-[var(--color-brand-700)]">
            {initial}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight">{name ?? "You"}</p>
            <p className="text-xs leading-tight text-[var(--color-muted)]">{email}</p>
          </div>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            title="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-muted)] transition-colors hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]"
          >
            <LogOut size={17} />
          </button>
        </form>
      </div>
    </header>
  );
}
