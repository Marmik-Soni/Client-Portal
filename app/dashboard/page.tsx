import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge, type ProjectStatus } from "@/components/StatusBadge";
import { FolderKanban, ArrowUpRight, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  updated_at: string;
}

export default async function ClientDashboardPage() {
  const supabase = await createClient();

  // RLS automatically scopes this query to only projects belonging to this client
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, description, status, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching client projects:", error);
  }

  const typedProjects = (projects as unknown as ProjectRow[]) || [];

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-6">
        <h1 className="fluid-h2 font-normal tracking-tight text-white">My Projects</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Select a project to view files, check real-time progress, or send a message to our team.
        </p>
      </div>

      {/* Projects Grid */}
      {typedProjects.length === 0 ? (
        <div className="fluid-card-p mx-auto mt-12 max-w-lg rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/40 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 shadow-inner">
            <FolderKanban className="h-6 w-6" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-white">No active projects</h3>
          <p className="text-sm text-neutral-400">
            You don&apos;t have any assigned projects right now. If you believe this is a mistake,
            please reach out to your project manager.
          </p>
        </div>
      ) : (
        <div className="fluid-grid gap-6">
          {typedProjects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="group fluid-card-p @container relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-950 transition-all duration-200 hover:border-neutral-700 hover:shadow-xl hover:shadow-black/60"
            >
              <div className="absolute top-0 right-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-neutral-500 to-transparent opacity-0 transition-opacity group-hover:opacity-40" />

              <div>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <StatusBadge status={project.status} size="sm" />
                  <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-neutral-500 transition-colors group-hover:text-white" />
                </div>

                <h3 className="mb-2 text-lg font-medium tracking-tight text-white transition-colors group-hover:text-neutral-200">
                  {project.name}
                </h3>

                <p className="mb-6 line-clamp-3 text-sm text-neutral-400">
                  {project.description || "No description provided."}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-900 pt-4 text-xs text-neutral-500 sm:flex-nowrap">
                <span className="font-medium text-neutral-400">View Workspace &rarr;</span>
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-neutral-600" />
                  <span>
                    {new Date(project.updated_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
