"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    });
  }

  return (
    <Card>
      <CardBody className="p-6">
        <h2 className="mb-1 text-base font-semibold">Welcome back</h2>
        <p className="mb-5 text-sm text-[var(--color-muted)]">
          Sign in to continue tracking.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-4 rounded-xl bg-[var(--color-bg)] px-3 py-2.5 text-center text-xs text-[var(--color-muted)]">
          Try the demo: <span className="font-medium">demo@health.app</span> /{" "}
          <span className="font-medium">demo1234</span>
        </div>

        <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
          No account?{" "}
          <Link
            href="/signup"
            className="font-medium text-[var(--color-brand-600)] hover:underline"
          >
            Create one
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-[var(--color-muted)]">
          New here?{" "}
          <a
            href="/userguidelines"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--color-brand-600)] hover:underline"
          >
            Read the user guide
          </a>
        </p>
      </CardBody>
    </Card>
  );
}
