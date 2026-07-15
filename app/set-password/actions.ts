"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function setPasswordAction(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm_password") as string;
  const fullName = (formData.get("full_name") as string)?.trim() || null;

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email) {
    return { error: "Session expired or invalid. Please click your invitation link again." };
  }

  // 1. Update user password in Supabase Auth
  const { error: updateError } = await supabase.auth.updateUser({
    password,
  });

  if (updateError) {
    return { error: `Failed to update password: ${updateError.message}` };
  }

  // 2. Update profile name and ensure client role
  await supabaseAdmin
    .from("profiles")
    .update({
      full_name: fullName || user.user_metadata?.full_name || user.email.split("@")[0],
      role: "client",
    })
    .eq("id", user.id);

  // 3. Link client row with profile_id and mark as onboarded
  await supabaseAdmin
    .from("clients")
    .update({
      profile_id: user.id,
      onboarded: true,
    })
    .eq("email", user.email);

  redirect("/dashboard");
}
