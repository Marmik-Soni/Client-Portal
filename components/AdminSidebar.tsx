"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  PlusCircle,
  Users,
  FileText,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import clsx from "clsx";
import { signOut } from "@/app/login/actions";

interface AdminSidebarProps {
  email: string;
  fullName?: string | null;
}

const navItems = [
  { label: "Projects", href: "/admin", icon: FolderKanban, exact: true },
  { label: "New Project", href: "/admin/projects/new", icon: PlusCircle },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Invoices", href: "/admin/invoices", icon: FileText, badge: "Soon" },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ email, fullName }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close drawer when route changes without calling setState inside useEffect
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  const navContent = (
    <nav className="space-y-1.5 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={clsx(
              "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
              isActive
                ? "border border-neutral-800 bg-neutral-900 text-white shadow-sm"
                : "text-neutral-400 hover:bg-neutral-900/40 hover:text-white"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className={clsx("h-4 w-4", isActive ? "text-white" : "text-neutral-500")} />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const userFooter = (
    <div className="border-t border-neutral-800/80 bg-neutral-950/50 p-4">
      <div className="flex items-center justify-between gap-3 px-2 py-1">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-white">
            {fullName || email.split("@")[0]}
          </p>
          <p className="truncate text-[11px] text-neutral-500">{email}</p>
        </div>
        <button
          onClick={() => signOut()}
          title="Sign out"
          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header (< lg) */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-800 bg-neutral-950/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-white shadow-inner">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-white">Client Portal</span>
            <span className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-neutral-500 uppercase">
              Admin
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
          className="rounded-xl border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition-colors hover:text-white"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay (< lg) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="relative flex w-72 max-w-[85vw] flex-col justify-between border-r border-neutral-800 bg-neutral-950 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-neutral-800/80 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-white shadow-inner">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold tracking-tight text-white">
                      Client Portal
                    </h2>
                    <span className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-neutral-500 uppercase">
                      Admin
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-900 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {navContent}
            </div>
            {userFooter}
          </div>
        </div>
      )}

      {/* Desktop Fixed Sidebar (>= lg) */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col justify-between border-r border-neutral-800 bg-neutral-950 lg:flex">
        <div>
          <div className="flex items-center gap-3 border-b border-neutral-800/80 p-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-white shadow-inner">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-white">Client Portal</h2>
              <span className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-neutral-500 uppercase">
                Admin
              </span>
            </div>
          </div>
          {navContent}
        </div>
        {userFooter}
      </aside>
    </>
  );
};
