import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge, type ProjectStatus } from "@/components/StatusBadge";
import { Plus, FolderKanban, ArrowUpRight, Building2, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

interface ProjectWithClient {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  clients: {
    company_name: string | null;
    email: string;
  } | null;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      `
      id,
      name,
      description,
      status,
      created_at,
      updated_at,
      clients (
        company_name,
        email
      )
    `
    )
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
  }

  const typedProjects = (projects as unknown as ProjectWithClient[]) || [];

  return (
    <div className="fluid-section-p mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-neutral-800 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="fluid-h2 font-normal tracking-tight text-white">Projects Overview</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Manage all active client projects, invitations, and assets.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-white/5 transition-colors hover:bg-neutral-200 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Projects Grid */}
      {typedProjects.length === 0 ? (
        <div className="fluid-card-p mx-auto mt-12 flex max-w-lg flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/40 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 shadow-inner">
            <FolderKanban className="h-6 w-6" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-white">No projects yet</h3>
          <p className="mb-6 text-sm text-neutral-400">
            Get started by creating your first client project and sending an email invitation.
          </p>
          <Link
            href="/admin/projects/new"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Project</span>
          </Link>
        </div>
      ) : (
        <div className="fluid-grid gap-6">
          {typedProjects.map((project) => {
            const clientName =
              project.clients?.company_name || project.clients?.email || "Unknown Client";

            return (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="group fluid-card-p @container relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950 transition-all duration-200 hover:border-neutral-700 hover:shadow-xl hover:shadow-black/60"
              >
                {/* Subtle top hover glow */}
                <div className="absolute top-0 right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-0 transition-opacity group-hover:opacity-40" />

                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <StatusBadge status={project.status} size="sm" />
                    <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-neutral-500 transition-colors group-hover:text-white" />
                  </div>

                  <h3 className="mb-2 text-lg font-medium tracking-tight text-white transition-colors group-hover:text-neutral-200">
                    {project.name}
                  </h3>

                  <p className="mb-6 line-clamp-2 text-sm text-neutral-400">
                    {project.description || "No project description provided."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-900 pt-4 text-xs text-neutral-500 sm:flex-nowrap">
                  <div className="flex max-w-[180px] items-center gap-2 truncate">
                    <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-neutral-600" />
                    <span className="truncate">{clientName}</span>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-neutral-600" />
                    <span>
                      {new Date(project.updated_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
