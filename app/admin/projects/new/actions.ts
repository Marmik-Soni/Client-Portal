"use server";

import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend } from "@/lib/email/resend";
import { InviteEmailTemplate } from "@/lib/email/templates/invite";
import { redirect } from "next/navigation";

export async function createProjectAction(formData: FormData) {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const clientEmail = (formData.get("client_email") as string)?.trim().toLowerCase();
  const companyName = (formData.get("company_name") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "draft";

  if (!name || !clientEmail) {
    return { error: "Project name and client email are required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized: You must be signed in." };
  }

  // Enforce admin check
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized: Only admins can create projects." };
  }

  // 1. Check if client already exists in clients table
  const { data: existingClient } = await supabaseAdmin
    .from("clients")
    .select("id, email, onboarded")
    .eq("email", clientEmail)
    .maybeSingle();

  let clientId: string;
  let _isNewClient = false;
  let actionLink: string | null = null;

  if (existingClient) {
    clientId = existingClient.id;
  } else {
    _isNewClient = true;

    // Generate invite magic link via Supabase Admin API
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "invite",
      email: clientEmail,
      options: {
        redirectTo: `${appUrl}/auth/confirm?next=/set-password`,
      },
    });

    if (linkError) {
      // If error says user already exists in auth.users, try to generate recovery link or magiclink
      return { error: `Failed to generate invite link: ${linkError.message}` };
    }

    actionLink = linkData.properties?.action_link;

    if (!actionLink) {
      return { error: "Invite link was not returned by Supabase." };
    }

    // Insert into clients table
    const { data: newClient, error: clientInsertError } = await supabaseAdmin
      .from("clients")
      .insert({
        email: clientEmail,
        company_name: companyName || clientEmail.split("@")[0],
        onboarded: false,
      })
      .select("id")
      .single();

    if (clientInsertError || !newClient) {
      return { error: `Failed to create client record: ${clientInsertError?.message}` };
    }

    clientId = newClient.id;

    // Send invite email via Resend
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      await resend.emails.send({
        from: fromEmail,
        to: [clientEmail],
        subject: `You have been invited to collaborate on ${name}`,
        react: InviteEmailTemplate({
          clientEmail,
          companyName: companyName || undefined,
          projectName: name,
          actionLink,
        }) as React.ReactElement,
      });
    } catch (emailError) {
      console.error("Error sending invite email via Resend:", emailError);
      // We don't fail the project creation, but we note the error
    }
  }

  // 2. Insert into projects table
  const { data: newProject, error: projectInsertError } = await supabaseAdmin
    .from("projects")
    .insert({
      client_id: clientId,
      name,
      description,
      status,
    })
    .select("id")
    .single();

  if (projectInsertError || !newProject) {
    return { error: `Failed to create project: ${projectInsertError?.message}` };
  }

  redirect(`/admin/projects/${newProject.id}`);
}
