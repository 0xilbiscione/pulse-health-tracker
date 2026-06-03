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
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-brand-600)] text-white shadow-lg shadow-blue-200">
            <HeartPulse size={24} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Pulse</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Your personal health dashboard
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
