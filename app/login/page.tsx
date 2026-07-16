"use client";

import { useState, useTransition } from "react";
import { signIn } from "./actions";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await signIn(formData);
      if (result && result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-8 text-white selection:bg-neutral-800">
      <div className="fluid-card-p relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950 shadow-2xl shadow-black/80">
        {/* Subtle top glow highlight */}
        <div className="absolute top-0 left-1/2 h-[1px] w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-neutral-400 to-transparent opacity-50" />

        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-200 shadow-inner">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="fluid-h2 mb-2 font-normal tracking-tight text-white">Client Portal</h1>
          <p className="text-sm font-medium text-neutral-400">
            Sign in to access your projects, files, and updates.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-300">
            <div className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-3 pr-4 pl-10 text-sm text-white placeholder-neutral-600 transition-all duration-200 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-3 pr-4 pl-10 text-sm text-white placeholder-neutral-600 transition-all duration-200 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black shadow-lg shadow-white/5 transition-all duration-150 hover:bg-neutral-200 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-neutral-900 pt-6 text-center">
          <p className="text-xs text-neutral-500">
            First time here? Please use the invitation link sent to your email to set your password.
          </p>
        </div>
      </div>
    </div>
  );
}
