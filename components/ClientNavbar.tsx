"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, LogOut, FolderKanban } from "lucide-react";
import { signOut } from "@/app/login/actions";

interface ClientNavbarProps {
  email: string;
  fullName?: string | null;
  companyName?: string | null;
}

export const ClientNavbar: React.FC<ClientNavbarProps> = ({ email, fullName, companyName }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-white shadow-inner">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="block max-w-[150px] truncate text-sm font-semibold tracking-tight text-white sm:max-w-none">
                {companyName || "Client Portal"}
              </span>
              <span className="block text-[10px] font-medium tracking-wider text-neutral-500 uppercase">
                Workspace
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/dashboard"
              title="My Projects"
              className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-2.5 py-2 text-sm font-medium text-white transition-colors hover:border-neutral-700 sm:px-3"
            >
              <FolderKanban className="h-4 w-4 text-neutral-400" />
              <span className="hidden sm:inline">My Projects</span>
            </Link>
          </nav>
        </div>

        <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4">
          <div className="hidden text-right md:block">
            <p className="max-w-[180px] truncate text-xs font-medium text-white">
              {fullName || email.split("@")[0]}
            </p>
            <p className="max-w-[180px] truncate text-[11px] text-neutral-500">{email}</p>
          </div>

          <button
            onClick={() => signOut()}
            title="Sign out"
            className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 p-2 text-xs font-medium text-neutral-400 transition-colors hover:border-neutral-700 hover:text-white sm:p-2.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
