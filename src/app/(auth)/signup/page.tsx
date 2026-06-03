"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { signup } from "@/app/actions/auth";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await signup(form);
      if (!res.ok) {
        setError(res.error);
        setFieldErrors(res.fieldErrors ?? {});
        return;
      }
      // Auto sign-in after successful signup.
      await signIn("credentials", {
        email: String(form.get("email")),
        password: String(form.get("password")),
        redirect: false,
      });
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <Card>
      <CardBody className="p-6">
        <h2 className="mb-1 text-base font-semibold">Create your account</h2>
        <p className="mb-5 text-sm text-[var(--color-muted)]">
          Start tracking in under a minute.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label="Name" htmlFor="name" error={fieldErrors.name}>
            <Input id="name" name="name" placeholder="Alex Doe" required />
          </Field>
          <Field label="Email" htmlFor="email" error={fieldErrors.email}>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </Field>
          <Field
            label="Password"
            htmlFor="password"
            error={fieldErrors.password}
            hint="At least 6 characters"
          >
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--color-brand-600)] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}
