"use client";

import React, { useState, useTransition } from "react";
import { setPasswordAction } from "./actions";
import { Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function SetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await setPasswordAction(formData);
      if (result && result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-white selection:bg-neutral-800">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950 p-8 shadow-2xl">
        {/* Top accent line */}
        <div className="absolute top-0 left-1/2 h-[1px] w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-neutral-300 to-transparent opacity-60" />

        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-emerald-400 shadow-inner">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="mb-2 text-3xl font-normal tracking-tight text-white">
            Welcome to Your Portal
          </h1>
          <p className="text-sm font-medium text-neutral-400">
            Please set a secure password to activate your private account workspace.
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
              htmlFor="full_name"
              className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              Your Name <span className="text-neutral-600">(Optional)</span>
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="e.g. Jane Doe"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-3 pr-4 pl-10 text-sm text-white placeholder-neutral-600 transition-all duration-200 focus:border-neutral-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              New Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-3 pr-4 pl-10 text-sm text-white placeholder-neutral-600 transition-all duration-200 focus:border-neutral-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirm_password"
              className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                minLength={8}
                placeholder="Repeat new password"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-3 pr-4 pl-10 text-sm text-white placeholder-neutral-600 transition-all duration-200 focus:border-neutral-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black shadow-lg shadow-white/5 transition-all duration-150 hover:bg-neutral-200 active:scale-[0.99] disabled:opacity-50"
          >
            {isPending ? (
              <span>Saving credentials...</span>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Set Password & Enter Portal</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
