import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClientNavbar } from "@/components/ClientNavbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  // Fetch client row for company_name
  const { data: clientRow } = await supabase
    .from("clients")
    .select("company_name")
    .eq("profile_id", user.id)
    .maybeSingle();

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-neutral-800">
      <ClientNavbar
        email={profile?.email || user.email!}
        fullName={profile?.full_name}
        companyName={clientRow?.company_name}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
