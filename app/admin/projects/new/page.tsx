"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { createProjectAction } from "./actions";
import { ArrowLeft, Plus, Building2, Mail, FileText, Sparkles, ShieldAlert } from "lucide-react";

export default function NewProjectPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createProjectAction(formData);
      if (result && result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="fluid-section-p mx-auto max-w-4xl space-y-8">
      {/* Back Navigation & Title */}
      <div>
        <Link
          href="/admin"
          className="mb-4 inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects</span>
        </Link>
        <h1 className="fluid-h2 font-normal tracking-tight text-white">Create New Project</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Set up a workspace and invite your client to collaborate.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-300">
          <ShieldAlert className="h-5 w-5 flex-shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Form Container */}
        <div className="fluid-card-p relative rounded-2xl border border-neutral-800/80 bg-neutral-950 shadow-xl md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
              >
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="e.g. Q3 Brand Redesign & Web App"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-white placeholder-neutral-600 transition-colors focus:border-neutral-500 focus:outline-none"
              />
            </div>

            <div className="fluid-grid-sm gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="client_email"
                  className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
                >
                  Client Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    id="client_email"
                    name="client_email"
                    type="email"
                    required
                    placeholder="client@company.com"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-3 pr-4 pl-10 text-sm text-white placeholder-neutral-600 transition-colors focus:border-neutral-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="company_name"
                  className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
                >
                  Company Name <span className="text-neutral-600">(Optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    id="company_name"
                    name="company_name"
                    type="text"
                    placeholder="e.g. Acme Corp"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-3 pr-4 pl-10 text-sm text-white placeholder-neutral-600 transition-colors focus:border-neutral-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="status"
                className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
              >
                Initial Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue="draft"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-white transition-colors focus:border-neutral-500 focus:outline-none"
              >
                <option value="draft" className="bg-neutral-900">
                  Draft (Private setup)
                </option>
                <option value="in_progress" className="bg-neutral-900">
                  In Progress
                </option>
                <option value="review" className="bg-neutral-900">
                  Under Review
                </option>
                <option value="on_hold" className="bg-neutral-900">
                  On Hold
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-xs font-semibold tracking-wider text-neutral-400 uppercase"
              >
                Project Description <span className="text-neutral-600">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-neutral-500" />
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Summarize the scope, key deliverables, and target timelines..."
                  className="w-full resize-y rounded-xl border border-neutral-800 bg-neutral-900/60 py-3 pr-4 pl-10 text-sm text-white placeholder-neutral-600 transition-colors focus:border-neutral-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t border-neutral-900 pt-4 sm:flex-row sm:items-center">
              <Link
                href="/admin"
                className="flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white sm:w-auto sm:hover:bg-transparent"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-white/5 transition-all duration-150 hover:bg-neutral-200 active:scale-[0.99] disabled:opacity-50 sm:w-auto"
              >
                {isPending ? (
                  <span>Creating...</span>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Create & Invite</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info Banner */}
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-neutral-800/80 bg-neutral-950 p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-300">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>How Invitations Work</span>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400">
              When you enter a client email address that is new to our portal, Supabase
              automatically generates a secure, single-use invitation link (`generateLink`).
            </p>
            <p className="text-xs leading-relaxed text-neutral-400">
              We immediately send this link directly to the client via <strong>Resend</strong> using
              your custom branded email template.
            </p>
            <p className="text-xs leading-relaxed text-neutral-400">
              When they click the link, they bypass traditional registration and land directly on
              our password setup page (`/set-password`).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
