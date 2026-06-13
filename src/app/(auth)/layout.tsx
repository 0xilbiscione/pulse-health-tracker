import { HeartPulse } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[var(--color-brand-50)] to-[var(--color-bg)] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[15px] bg-[var(--color-brand-600)] text-white shadow-lg shadow-emerald-200/70">
            <HeartPulse size={24} />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-[-0.03em] text-[var(--color-ink)]">
            FitBase
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            A few numbers a day, turned into momentum
          </p>
          <p className="mt-2 text-[11px] font-medium text-[var(--color-gold-600)]">
            by MetricBase
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
